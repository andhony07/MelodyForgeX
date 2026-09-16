import { ArrangementSection } from '../types/arrangementSection';
import { AutomationLane } from '../types/automation';
import { Track } from '../../editor/types/studio';
import { Note } from '../../editor/types/note';
import {
  ArrangementAnalysisResult,
  ArrangementFinding,
  SectionAnalysis,
  TrackSummary,
} from './types/analysisTypes';
import { DENSITY_THRESHOLDS, TEMPO_JUMP_THRESHOLD_BPM, LONG_SECTION_BARS_THRESHOLD } from './constants/analysisConstants';
import { calculateTotalBars, interpolateAutomationPoints, isTrackEnabledInSection, sectionToBeats } from '../utils/arrangementUtils';

export function analyzeArrangement(params: {
  sections: ArrangementSection[];
  tracks: Track[];
  notesByTrackId: Record<string, Note[]>;
  automationLanes?: AutomationLane[];
  baseTempo?: number;
}): ArrangementAnalysisResult {
  const { sections, tracks, notesByTrackId, automationLanes = [], baseTempo = 120 } = params;

  const totalBars = calculateTotalBars(sections);
  const totalBeats = totalBars * 4;
  const totalDurationSeconds = totalBeats * (60 / baseTempo);

  // Group sections by type/name to find repeats
  const repeatedSectionsMap: Record<string, string[]> = {};
  sections.forEach((sec) => {
    const key = sec.type;
    if (!repeatedSectionsMap[key]) {
      repeatedSectionsMap[key] = [];
    }
    repeatedSectionsMap[key].push(sec.id);
  });

  // Calculate Section Analyses
  const sectionAnalyses: SectionAnalysis[] = sections.map((sec) => {
    const { startBeat, endBeat, durationBeats } = sectionToBeats(sec);
    const enabledTrackIds = tracks
      .filter((t) => isTrackEnabledInSection(sec, t.id))
      .map((t) => t.id);

    let sectionNoteCount = 0;
    let velocitySum = 0;
    let minPitch = Infinity;
    let maxPitch = -Infinity;
    const activeTrackIdsSet = new Set<string>();

    enabledTrackIds.forEach((trackId) => {
      const trackNotes = notesByTrackId[trackId] || [];
      const secNotes = trackNotes.filter((n) => n.startBeat >= startBeat && n.startBeat < endBeat);

      if (secNotes.length > 0) {
        activeTrackIdsSet.add(trackId);
        sectionNoteCount += secNotes.length;

        secNotes.forEach((n) => {
          velocitySum += n.velocity;
          if (n.pitch < minPitch) minPitch = n.pitch;
          if (n.pitch > maxPitch) maxPitch = n.pitch;
        });
      }
    });

    const activeTrackIds = Array.from(activeTrackIdsSet);
    const noteDensity = durationBeats > 0 ? sectionNoteCount / durationBeats : 0;
    const densityTier =
      noteDensity < DENSITY_THRESHOLDS.LOW
        ? 'low'
        : noteDensity > DENSITY_THRESHOLDS.HIGH
        ? 'high'
        : 'medium';

    const averageVelocity = sectionNoteCount > 0 ? Math.round(velocitySum / sectionNoteCount) : 0;
    const pitchRange =
      sectionNoteCount > 0 && minPitch !== Infinity
        ? { min: minPitch, max: maxPitch, spread: maxPitch - minPitch + 1 }
        : null;

    // Filter automation lanes affecting this section
    const activeLanes = automationLanes.filter((lane) => {
      const hasPoints = lane.points.some((p) => p.beat >= startBeat && p.beat <= endBeat);
      return hasPoints && (lane.enabled ?? true);
    });
    const automationLaneIds = activeLanes.map((l) => l.id);

    // Calculate tempo at start & end of section
    const tempoLane = automationLanes.find(
      (l) => l.targetType === 'arrangement' && l.parameter === 'tempo' && (l.enabled ?? true)
    );
    const tempoStart = tempoLane
      ? interpolateAutomationPoints(tempoLane.points, startBeat, baseTempo)
      : baseTempo;
    const tempoEnd = tempoLane
      ? interpolateAutomationPoints(tempoLane.points, Math.max(startBeat, endBeat - 0.1), baseTempo)
      : baseTempo;


    return {
      sectionId: sec.id,
      sectionName: sec.name,
      sectionType: sec.type,
      startBar: sec.startBar,
      endBar: sec.startBar + sec.lengthBars - 1,
      lengthBars: sec.lengthBars,
      startBeat,
      endBeat,
      durationBeats,
      enabledTrackIds,
      activeTrackIds,
      noteCount: sectionNoteCount,
      noteDensity,
      densityTier,
      averageVelocity,
      pitchRange,
      automationLaneIds,
      tempoStart,
      tempoEnd,
      transitionType: sec.transitionType || 'immediate',
      fadeDuration: sec.fadeDuration ?? 0.5,
    };
  });

  // Calculate Track Summaries
  const trackSummaries: TrackSummary[] = tracks.map((track) => {
    const notes = notesByTrackId[track.id] || [];
    let velocitySum = 0;
    let minPitch = Infinity;
    let maxPitch = -Infinity;

    notes.forEach((n) => {
      velocitySum += n.velocity;
      if (n.pitch < minPitch) minPitch = n.pitch;
      if (n.pitch > maxPitch) maxPitch = n.pitch;
    });

    const participatingSectionIds = sectionAnalyses
      .filter((sa) => sa.activeTrackIds.includes(track.id))
      .map((sa) => sa.sectionId);

    return {
      trackId: track.id,
      trackName: track.name,
      instrument: track.instrument || track.name,
      totalNotes: notes.length,
      participatingSectionIds,
      averageVelocity: notes.length > 0 ? Math.round(velocitySum / notes.length) : 0,
      pitchRange:
        notes.length > 0 && minPitch !== Infinity
          ? { min: minPitch, max: maxPitch, spread: maxPitch - minPitch + 1 }
          : null,
    };
  });

  // Calculate Instrument Distribution
  const instrumentDistribution: Record<string, number> = {};
  tracks.forEach((t) => {
    const inst = (t.instrument || t.name).toLowerCase();
    let cat = 'synth';
    if (inst.includes('piano')) cat = 'piano';
    else if (inst.includes('guitar')) cat = 'guitar';
    else if (inst.includes('bass')) cat = 'bass';
    else if (inst.includes('drum')) cat = 'drum';
    instrumentDistribution[cat] = (instrumentDistribution[cat] || 0) + 1;
  });

  const emptySectionIds = sectionAnalyses
    .filter((sa) => sa.activeTrackIds.length === 0 || sa.noteCount === 0)
    .map((sa) => sa.sectionId);

  const emptyTrackIds = trackSummaries
    .filter((ts) => ts.totalNotes === 0)
    .map((ts) => ts.trackId);

  // Automation Summary
  const enabledLanes = automationLanes.filter((l) => l.enabled ?? true);
  const parameters = Array.from(new Set(enabledLanes.map((l) => l.parameter)));
  const tempoLane = automationLanes.find(
    (l) => l.targetType === 'arrangement' && l.parameter === 'tempo' && (l.enabled ?? true)
  );

  let minTempo = baseTempo;
  let maxTempo = baseTempo;

  if (tempoLane && tempoLane.points.length > 0) {
    const tempoVals = tempoLane.points.map((p) => p.value);
    minTempo = Math.min(...tempoVals);
    maxTempo = Math.max(...tempoVals);
  }

  // Generate Deterministic Health Check Findings
  const findings: ArrangementFinding[] = [];

  // Finding 1: Empty Sections
  emptySectionIds.forEach((secId) => {
    const sec = sections.find((s) => s.id === secId);
    findings.push({
      id: `finding-empty-sec-${secId}`,
      severity: 'WARNING',
      category: 'STRUCTURE',
      title: `Empty Section: ${sec?.name || secId}`,
      description: `Section "${sec?.name}" has no active notes or active tracks.`,
      sectionId: secId,
      suggestedAction: `Consider enabling tracks or adding notes to ${sec?.name}.`,
    });
  });

  // Finding 2: Unused Tracks
  emptyTrackIds.forEach((trackId) => {
    const track = tracks.find((t) => t.id === trackId);
    findings.push({
      id: `finding-empty-track-${trackId}`,
      severity: 'INFO',
      category: 'INSTRUMENTATION',
      title: `Unused Track: ${track?.name || trackId}`,
      description: `Track "${track?.name}" contains no notes across the arrangement.`,
      trackId,
      suggestedAction: `Consider generating notes or adding content for ${track?.name}.`,
    });
  });

  // Finding 3: Chorus vs Verse Track Participation
  const verseAnalyses = sectionAnalyses.filter((sa) => sa.sectionType === 'Verse');
  const chorusAnalyses = sectionAnalyses.filter((sa) => sa.sectionType === 'Chorus');

  if (verseAnalyses.length > 0 && chorusAnalyses.length > 0) {
    const avgVerseTracks =
      verseAnalyses.reduce((sum, v) => sum + v.activeTrackIds.length, 0) / verseAnalyses.length;
    const avgChorusTracks =
      chorusAnalyses.reduce((sum, c) => sum + c.activeTrackIds.length, 0) / chorusAnalyses.length;

    if (avgChorusTracks < avgVerseTracks) {
      findings.push({
        id: 'finding-chorus-thin',
        severity: 'INFO',
        category: 'INSTRUMENTATION',
        title: 'Chorus Active Instrumentation',
        description: 'Chorus sections currently use fewer active tracks than Verse sections.',
        suggestedAction: 'Consider enabling additional tracks in Chorus sections for fuller instrumentation.',
      });
    }
  }

  // Finding 4: Abrupt Tempo Jumps
  for (let i = 0; i < sectionAnalyses.length - 1; i++) {
    const currentSec = sectionAnalyses[i];
    const nextSec = sectionAnalyses[i + 1];
    const tempoDiff = Math.abs(nextSec.tempoStart - currentSec.tempoEnd);

    if (tempoDiff >= TEMPO_JUMP_THRESHOLD_BPM) {
      findings.push({
        id: `finding-tempo-jump-${currentSec.sectionId}-${nextSec.sectionId}`,
        severity: 'WARNING',
        category: 'TEMPO',
        title: `Sudden Tempo Change (${Math.round(tempoDiff)} BPM)`,
        description: `Tempo shifts abruptly between ${currentSec.sectionName} (${Math.round(currentSec.tempoEnd)} BPM) and ${nextSec.sectionName} (${Math.round(nextSec.tempoStart)} BPM).`,
        sectionId: nextSec.sectionId,
        suggestedAction: 'Consider adding gradual tempo automation across the section transition.',
      });
    }
  }

  // Finding 5: Long Section without Automation
  sectionAnalyses.forEach((sa) => {
    if (sa.lengthBars >= LONG_SECTION_BARS_THRESHOLD && sa.automationLaneIds.length === 0) {
      findings.push({
        id: `finding-long-no-auto-${sa.sectionId}`,
        severity: 'INFO',
        category: 'AUTOMATION',
        title: `Long Section Without Automation: ${sa.sectionName}`,
        description: `Section "${sa.sectionName}" spans ${sa.lengthBars} bars without dynamic automation.`,
        sectionId: sa.sectionId,
        suggestedAction: 'Consider adding volume or pan automation for expressive movement.',
      });
    }
  });

  return {
    totalBars,
    totalBeats,
    totalDurationSeconds,
    sectionsCount: sections.length,
    tracksCount: tracks.length,
    emptySectionIds,
    emptyTrackIds,
    sectionAnalyses,
    trackSummaries,
    instrumentDistribution,
    automationSummary: {
      totalLanes: automationLanes.length,
      enabledLanes: enabledLanes.length,
      parameters,
    },

    tempoSummary: {
      baseTempo,
      minTempo,
      maxTempo,
      hasTempoAutomation: !!tempoLane && tempoLane.points.length > 0,
    },
    repeatedSectionsMap,
    findings,
  };
}
