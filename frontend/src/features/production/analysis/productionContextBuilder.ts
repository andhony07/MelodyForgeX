import { useStudioStore } from '../../editor/stores/useStudioStore';
import { usePianoRollStore } from '../../editor/stores/usePianoRollStore';
import { useArrangementStore } from '../../arrangement/stores/useArrangementStore';
import { useMixerStore } from '../../mixer/stores/useMixerStore';
import { ProductionContext } from '../types/productionRequest';
import { AssistantMode } from '../types/productionTypes';
import { Note } from '../../editor/types/note';

export function buildProductionContext(mode: AssistantMode = 'analyze', userPrompt?: string): ProductionContext {
  const studioState = useStudioStore.getState();
  const pianoRollState = usePianoRollStore.getState();
  const arrangementState = useArrangementStore.getState();
  const mixerState = useMixerStore.getState();

  const tracks = studioState.tracks || [];
  const notesByTrackId = pianoRollState.notesByTrackId || {};
  const sections = arrangementState.sections || [];
  const automationLanes = arrangementState.automationLanes || [];
  const channels = mixerState.channels || {};

  let totalNotes = 0;
  let minPitch = 127;
  let maxPitch = 0;
  let totalVelocity = 0;
  const trackNoteDensities: Record<string, number> = {};

  tracks.forEach((t) => {
    const notes = notesByTrackId[t.id] || [];
    const count = notes.length;
    totalNotes += count;
    trackNoteDensities[t.id] = count;

    notes.forEach((n: Note) => {
      if (n.pitch < minPitch) minPitch = n.pitch;
      if (n.pitch > maxPitch) maxPitch = n.pitch;
      totalVelocity += n.velocity || 100;
    });
  });

  const averageVelocity = totalNotes > 0 ? Math.round(totalVelocity / totalNotes) : 100;
  if (minPitch === 127) minPitch = 60;
  if (maxPitch === 0) maxPitch = 72;

  let totalBars = 0;
  sections.forEach((s) => {
    const endBar = s.startBar + s.lengthBars - 1;
    if (endBar > totalBars) totalBars = endBar;
  });
  if (totalBars === 0) totalBars = arrangementState.totalBars || 32;

  let totalInsertsCount = 0;
  let activeSendsCount = 0;
  Object.values(channels).forEach((ch) => {
    totalInsertsCount += ch.inserts ? ch.inserts.length : 0;
    if (ch.sends) {
      ch.sends.forEach((snd) => {
        if (snd.enabled && snd.levelDb > -60) activeSendsCount++;
      });
    }
  });

  let totalPointsCount = 0;
  const activeParamsSet = new Set<string>();
  automationLanes.forEach((lane) => {
    totalPointsCount += lane.points ? lane.points.length : 0;
    activeParamsSet.add(lane.parameter);
  });

  return {
    projectSettings: {
      title: 'MelodyForge Project',
      bpm: studioState.tempo || 120,
      key: studioState.key || 'C',
      scale: studioState.mode || 'Major',
      timeSignature: studioState.timeSignature || '4/4',
      totalBars,
    },
    tracks: tracks.map((t) => ({
      id: t.id,
      name: t.name,
      instrument: t.instrument,
      volume: t.volume,
      muted: t.muted,
      solo: t.solo,
      noteCount: (notesByTrackId[t.id] || []).length,
    })),
    arrangement: sections.map((s) => {
      const endBar = s.startBar + s.lengthBars - 1;
      return {
        id: s.id,
        name: s.name,
        type: s.type,
        startBar: s.startBar,
        endBar,
        activeTrackIds: s.trackStates
          ? s.trackStates.filter((ts) => ts.enabled).map((ts) => ts.trackId)
          : tracks.map((t) => t.id),
      };
    }),
    musicalAnalysis: {
      totalNotes,
      pitchRange: { min: minPitch, max: maxPitch },
      averageVelocity,
      trackNoteDensities,
    },
    mixerAnalysis: {
      masterVolumeDb: mixerState.master ? mixerState.master.volumeDb : 0,
      masterPan: mixerState.master ? mixerState.master.pan : 0,
      trackChannelCount: Object.keys(channels).length,
      totalInsertsCount,
      limiterEnabled: mixerState.master ? mixerState.master.limiterEnabled : true,
      activeSendsCount,
    },
    automationAnalysis: {
      laneCount: automationLanes.length,
      pointCount: totalPointsCount,
      activeParameters: Array.from(activeParamsSet),
    },
    mode,
    userPrompt,
  };
}

