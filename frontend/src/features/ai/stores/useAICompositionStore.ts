import { create } from 'zustand';
import { CompositionRequest } from '../types/compositionRequest';
import { AICompositionResponse } from '../types/compositionResponse';
import { aiCompositionService } from '../services/AICompositionService';
import { translateAIToNotes } from '../services/aiTranslationService';
import { useStudioStore } from '../../editor/stores/useStudioStore';
import { usePianoRollStore } from '../../editor/stores/usePianoRollStore';
import { DEFAULT_INSTRUMENTS } from '../../editor/constants/studio';
import { Track } from '../../editor/types/studio';

export interface AIHistoryItem {
  id: string;
  prompt: string;
  timestamp: number;
  seed: number;
  spec: AICompositionResponse;
}

interface AICompositionState {
  request: CompositionRequest;
  pendingSpec: AICompositionResponse | null;
  isLoading: boolean;
  error: string | null;
  history: AIHistoryItem[];

  setRequest: (updates: Partial<CompositionRequest>) => void;
  generateComposition: () => Promise<void>;
  applyComposition: () => void;
  clearPendingSpec: () => void;
  clearHistory: () => void;
}

const DEFAULT_REQUEST: CompositionRequest = {
  prompt: '',
  key: undefined,
  scale: undefined,
  bars: 8,
  tempo: undefined,
  mood: undefined,
  seed: undefined,
};

export const useAICompositionStore = create<AICompositionState>((set, get) => ({
  request: DEFAULT_REQUEST,
  pendingSpec: null,
  isLoading: false,
  error: null,
  history: [],

  setRequest: (updates) => {
    set((state) => ({
      request: { ...state.request, ...updates },
    }));
  },

  generateComposition: async () => {
    const { request, isLoading } = get();
    if (isLoading) return; // Prevent duplicate concurrent requests

    if (!request.prompt || !request.prompt.trim()) {
      set({ error: 'Please enter a musical request before generating.' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await aiCompositionService.generate(request);
      
      const historyItem: AIHistoryItem = {
        id: `gen-${Date.now()}`,
        prompt: request.prompt,
        timestamp: Date.now(),
        seed: response.generation.seed,
        spec: response,
      };

      set((state) => ({
        pendingSpec: response,
        isLoading: false,
        error: null,
        history: [historyItem, ...state.history].slice(0, 20), // store up to 20 history items
      }));
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'AI composition failed.';
      set({ isLoading: false, error: errorMsg });
    }
  },

  applyComposition: () => {
    const { pendingSpec } = get();
    if (!pendingSpec) return;

    // 1. Translate specification to Phase 5 notes
    const translation = translateAIToNotes(pendingSpec);

    // 2. Update Studio Key, Mode, Tempo
    const { setTempo, setKey, setMode } = useStudioStore.getState();
    setTempo(translation.tempo);
    setKey(translation.key);
    setMode(translation.mode === 'Minor' ? 'Minor' : 'Major');

    // 3. Create or update AI tracks in Studio Store
    const existingTracks = useStudioStore.getState().tracks;
    const updatedTracksMap = { ...usePianoRollStore.getState().notesByTrackId };
    const newTrackList: Track[] = [...existingTracks];

    translation.tracks.forEach(({ trackSpec, notes }) => {
      let targetTrack = newTrackList.find((t) => t.name === trackSpec.name);

      if (!targetTrack) {
        // Match instrument or pick default
        const matchedInst = DEFAULT_INSTRUMENTS.find(
          (inst) => inst.name.toLowerCase() === (trackSpec.instrument || '').toLowerCase()
        ) || DEFAULT_INSTRUMENTS[0];

        const newTrackId = `ai-track-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        targetTrack = {
          id: newTrackId,
          name: trackSpec.name,
          instrument: matchedInst.instrument,
          iconName: matchedInst.iconName,
          muted: false,
          solo: false,
          volume: 80,
          color: trackSpec.role === 'chords' ? '#6366f1' : trackSpec.role === 'melody' ? '#06b6d4' : '#10b981',
          channel: newTrackList.length + 1,
        };
        newTrackList.push(targetTrack);
      }

      // Re-assign trackId on notes
      const trackNotes = notes.map((n) => ({ ...n, trackId: targetTrack!.id }));
      updatedTracksMap[targetTrack.id] = trackNotes;
    });

    // 4. Set tracks in Studio and notes in Piano Roll
    useStudioStore.setState({
      tracks: newTrackList,
      selectedTrackId: newTrackList[newTrackList.length - 1]?.id || null,
    });

    usePianoRollStore.setState({
      notesByTrackId: updatedTracksMap,
    });

    // 5. Clear pending preview
    set({ pendingSpec: null });
  },

  clearPendingSpec: () => set({ pendingSpec: null }),
  clearHistory: () => set({ history: [] }),
}));
