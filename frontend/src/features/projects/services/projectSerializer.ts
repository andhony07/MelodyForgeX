import { useStudioStore } from '../../editor/stores/useStudioStore';
import { usePianoRollStore } from '../../editor/stores/usePianoRollStore';
import { useArrangementStore } from '../../arrangement/stores/useArrangementStore';
import { useAICompositionStore, AIHistoryItem } from '../../ai/stores/useAICompositionStore';
import { Track, MusicalKey, KeyMode, TimeSignature } from '../../editor/types/studio';
import { Note } from '../../editor/types/note';
import { ArrangementSection } from '../../arrangement/types/arrangementSection';
import { AutomationLane } from '../../arrangement/types/automation';

export interface MelodyForgeProjectPayload {
  version: number;
  format: 'melodyforge-project';
  metadata: {
    title: string;
    createdAt: string;
    updatedAt: string;
  };
  studio: {
    tempo: number;
    key: MusicalKey;
    mode: KeyMode;
    timeSignature: TimeSignature;
    zoom: number;
    isLooping: boolean;
  };
  tracks: Track[];
  notesByTrackId: Record<string, Note[]>;
  arrangement: {
    sections: ArrangementSection[];
    totalBars: number;
    automationLanes?: AutomationLane[];
    automationEnabled?: boolean;
  };
  aiHistory?: AIHistoryItem[];
}

export function validateMelodyForgeProjectFile(data: unknown): MelodyForgeProjectPayload {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid project file: Content is not a JSON object.');
  }

  const obj = data as Record<string, unknown>;

  if (obj.format !== 'melodyforge-project') {
    throw new Error('Invalid project file: Unsupported file format.');
  }

  if (!Array.isArray(obj.tracks)) {
    throw new Error('Invalid project file: Missing tracks array.');
  }

  if (!obj.notesByTrackId || typeof obj.notesByTrackId !== 'object') {
    throw new Error('Invalid project file: Missing notes dataset.');
  }

  return obj as unknown as MelodyForgeProjectPayload;
}

export function exportNativeProject(filename = 'melodyforge_project'): void {
  const studioState = useStudioStore.getState();
  const pianoRollState = usePianoRollStore.getState();
  const arrangementState = useArrangementStore.getState();
  const aiState = useAICompositionStore.getState();

  const payload: MelodyForgeProjectPayload = {
    version: 2,
    format: 'melodyforge-project',
    metadata: {
      title: filename,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    studio: {
      tempo: studioState.tempo,
      key: studioState.key,
      mode: studioState.mode,
      timeSignature: studioState.timeSignature,
      zoom: studioState.zoom,
      isLooping: studioState.isLooping,
    },
    tracks: studioState.tracks,
    notesByTrackId: pianoRollState.notesByTrackId,
    arrangement: {
      sections: arrangementState.sections,
      totalBars: arrangementState.totalBars,
      automationLanes: arrangementState.automationLanes,
      automationEnabled: arrangementState.automationEnabled,
    },
    aiHistory: aiState.history,
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const finalFilename = filename.endsWith('.melodyforge') ? filename : `${filename}.melodyforge`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = finalFilename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export async function loadNativeProjectFromFile(file: File): Promise<MelodyForgeProjectPayload> {
  const text = await file.text();
  let jsonObject: unknown;

  try {
    jsonObject = JSON.parse(text);
  } catch {
    throw new Error('Failed to parse project file: Invalid JSON syntax.');
  }

  const validated = validateMelodyForgeProjectFile(jsonObject);

  // Load into stores
  const { studio, tracks, notesByTrackId, arrangement, aiHistory } = validated;

  if (studio) {
    useStudioStore.setState({
      tempo: studio.tempo || 120,
      key: studio.key || 'C',
      mode: studio.mode || 'Major',
      timeSignature: studio.timeSignature || '4/4',
      zoom: studio.zoom || 100,
      isLooping: studio.isLooping || false,
      tracks,
      selectedTrackId: tracks[0]?.id || null,
    });
  }

  if (notesByTrackId) {
    usePianoRollStore.setState({
      notesByTrackId,
    });
  }

  if (arrangement && Array.isArray(arrangement.sections)) {
    useArrangementStore.setState({
      sections: arrangement.sections,
      totalBars: arrangement.totalBars || 32,
      selectedSectionId: arrangement.sections[0]?.id || null,
      automationLanes: arrangement.automationLanes || [],
      automationEnabled: arrangement.automationEnabled ?? true,
    });
  }

  if (Array.isArray(aiHistory)) {
    useAICompositionStore.setState({
      history: aiHistory,
    });
  }

  return validated;
}
