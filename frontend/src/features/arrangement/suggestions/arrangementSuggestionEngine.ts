import { ArrangementAnalysisResult } from '../analysis/types/analysisTypes';
import { ArrangementSuggestion } from './types/suggestionTypes';
import { ArrangementSection } from '../types/arrangementSection';
import { Track } from '../../editor/types/studio';
import { Note } from '../../editor/types/note';
import { sectionToBeats } from '../utils/arrangementUtils';

export function generateArrangementSuggestions(params: {
  analysis: ArrangementAnalysisResult;
  sections: ArrangementSection[];
  tracks: Track[];
  notesByTrackId: Record<string, Note[]>;
}): ArrangementSuggestion[] {
  const { analysis, sections, tracks, notesByTrackId } = params;
  const suggestions: ArrangementSuggestion[] = [];

  // Suggestion 1: Track Activation for disabled tracks containing notes in section
  analysis.sectionAnalyses.forEach((sa) => {
    const sec = sections.find((s) => s.id === sa.sectionId);
    if (!sec) return;

    const { startBeat, endBeat } = sectionToBeats(sec);

    tracks.forEach((track) => {
      const isEnabled = sa.enabledTrackIds.includes(track.id);
      const trackNotes = notesByTrackId[track.id] || [];
      const hasNotesInSection = trackNotes.some(
        (n) => n.startBeat >= startBeat && n.startBeat < endBeat
      );

      if (!isEnabled && hasNotesInSection) {
        suggestions.push({
          id: `sug-track-enable-${sec.id}-${track.id}`,
          type: 'TRACK_ACTIVATION',
          title: `Enable ${track.name} in ${sec.name}`,
          description: `Track "${track.name}" has notes inside ${sec.name} but is currently disabled for this section.`,
          sectionId: sec.id,
          trackId: track.id,
          proposedValue: { enabled: true },
          reason: `Track "${track.name}" contains musical content during ${sec.name}.`,
        });
      }
    });
  });

  // Suggestion 2: Chorus Track Activation
  const verseAnalyses = analysis.sectionAnalyses.filter((sa) => sa.sectionType === 'Verse');
  const chorusAnalyses = analysis.sectionAnalyses.filter((sa) => sa.sectionType === 'Chorus');

  if (verseAnalyses.length > 0 && chorusAnalyses.length > 0) {
    chorusAnalyses.forEach((ca) => {
      const sec = sections.find((s) => s.id === ca.sectionId);
      if (!sec) return;

      // Find tracks active in verse but disabled in chorus
      const verseActiveTracks = new Set<string>();
      verseAnalyses.forEach((va) => va.activeTrackIds.forEach((tId) => verseActiveTracks.add(tId)));

      verseActiveTracks.forEach((trackId) => {
        if (!ca.activeTrackIds.includes(trackId)) {
          const track = tracks.find((t) => t.id === trackId);
          if (track) {
            suggestions.push({
              id: `sug-chorus-enable-${ca.sectionId}-${trackId}`,
              type: 'TRACK_ACTIVATION',
              title: `Enable ${track.name} in Chorus (${ca.sectionName})`,
              description: `Enable active track "${track.name}" in ${ca.sectionName} for fuller instrumentation contrast.`,
              sectionId: ca.sectionId,
              trackId: trackId,
              proposedValue: { enabled: true },
              reason: 'Choruses traditionally benefit from maximum active instrumentation.',
            });
          }
        }
      });

    });
  }

  // Suggestion 3: Automation Add for long sections
  analysis.sectionAnalyses.forEach((sa) => {
    if (sa.lengthBars >= 16 && sa.automationLaneIds.length === 0) {
      const track = tracks[0];
      if (track) {
        suggestions.push({
          id: `sug-auto-volume-${sa.sectionId}`,
          type: 'AUTOMATION_ADD',
          title: `Add Volume Automation to ${sa.sectionName}`,
          description: `Add gradual volume crescendo automation over ${sa.lengthBars} bars in ${sa.sectionName}.`,
          sectionId: sa.sectionId,
          trackId: track.id,
          targetType: 'track',
          parameter: 'volume',
          proposedValue: {
            startBeat: sa.startBeat,
            startVal: 0.6,
            endBeat: sa.endBeat,
            endVal: 0.9,
          },
          reason: `Section ${sa.sectionName} spans ${sa.lengthBars} bars and would benefit from dynamic movement.`,
        });
      }
    }
  });

  // Suggestion 4: Pre-Chorus to Chorus Transition
  for (let i = 0; i < sections.length - 1; i++) {
    const currentSec = sections[i];
    const nextSec = sections[i + 1];

    if (
      currentSec.type === 'Pre-Chorus' &&
      nextSec.type === 'Chorus' &&
      (!currentSec.transitionType || currentSec.transitionType === 'immediate')
    ) {
      suggestions.push({
        id: `sug-transition-crossfade-${currentSec.id}`,
        type: 'TRANSITION_CHANGE',
        title: `Add Crossfade Transition to ${currentSec.name}`,
        description: `Set section transition for ${currentSec.name} to crossfade (0.5s) into ${nextSec.name}.`,
        sectionId: currentSec.id,
        proposedValue: { transitionType: 'crossfade', fadeDuration: 0.5 },
        reason: 'Crossfading from Pre-Chorus into Chorus creates a smoother musical build.',
      });
    }
  }

  return suggestions;
}
