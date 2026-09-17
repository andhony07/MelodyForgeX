import { create } from 'zustand';
import {
  AssistantMode,
  ProductionReport,
  AssistantHistoryEntry,
} from '../types/productionTypes';
import { ProductionSuggestion } from '../types/productionSuggestion';
import { aiProductionService } from '../ai/aiProductionService';
import { useStudioStore } from '../../editor/stores/useStudioStore';
import { useArrangementStore } from '../../arrangement/stores/useArrangementStore';
import { useMixerStore } from '../../mixer/stores/useMixerStore';
import { Track, MusicalKey } from '../../editor/types/studio';
import { ArrangementSection } from '../../arrangement/types/arrangementSection';
import { AutomationLane } from '../../arrangement/types/automation';

interface StateSnapshot {
  tempo?: number;
  key?: MusicalKey;
  tracks?: Track[];
  sections?: ArrangementSection[];
  automationLanes?: AutomationLane[];
  mixerChannels?: Record<string, unknown>;
  masterMixer?: unknown;
}

interface ProductionAssistantState {
  activeMode: AssistantMode;
  report: ProductionReport | null;
  suggestions: ProductionSuggestion[];
  previewSuggestion: ProductionSuggestion | null;
  history: AssistantHistoryEntry[];
  appliedSuggestions: Set<string>;
  appliedSnapshots: Record<string, StateSnapshot>;
  isAnalyzing: boolean;
  usedAI: boolean;
  error: string | null;

  setMode: (mode: AssistantMode) => void;
  runAnalysis: (mode?: AssistantMode, userPrompt?: string) => Promise<void>;
  analyzeCurrentProject: (mode?: AssistantMode, userPrompt?: string) => Promise<void>;
  openPreview: (suggestionId: string) => void;
  closePreview: () => void;
  setPreviewSuggestion: (suggestion: ProductionSuggestion | null) => void;
  applySuggestion: (suggestionOrId: string | ProductionSuggestion) => { success: boolean; error?: string } | boolean;
  rollbackSuggestion: (suggestionId: string) => boolean;
  rejectSuggestion: (suggestionId: string) => void;
  clearHistory: () => void;
  loadHistory: (history: AssistantHistoryEntry[]) => void;
  reset: () => void;
}

export const useProductionAssistantStore = create<ProductionAssistantState>((set, get) => ({
  activeMode: 'analyze',
  report: null,
  suggestions: [],
  previewSuggestion: null,
  history: [],
  appliedSuggestions: new Set<string>(),
  appliedSnapshots: {},
  isAnalyzing: false,
  usedAI: false,
  error: null,

  setMode: (mode) => set({ activeMode: mode }),

  reset: () =>
    set({
      activeMode: 'analyze',
      report: null,
      suggestions: [],
      previewSuggestion: null,
      history: [],
      appliedSuggestions: new Set<string>(),
      appliedSnapshots: {},
      isAnalyzing: false,
      usedAI: false,
      error: null,
    }),

  setPreviewSuggestion: (suggestion) => set({ previewSuggestion: suggestion }),

  runAnalysis: async (modeOverride, userPrompt) => {
    const mode = modeOverride || get().activeMode;
    set({ isAnalyzing: true, error: null });

    try {
      const result = await aiProductionService.analyzeProject(mode, userPrompt);

      const historyItem: AssistantHistoryEntry = {
        id: `hist-${Date.now()}`,
        timestamp: Date.now(),
        mode,
        prompt: userPrompt,
        summary: result.report.summary,
        suggestionsCount: result.suggestions.length,
        appliedCount: 0,
      };

      set((state) => ({
        report: result.report,
        suggestions: result.suggestions,
        usedAI: result.usedAI,
        isAnalyzing: false,
        activeMode: mode,
        history: [historyItem, ...state.history].slice(0, 20),
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ isAnalyzing: false, error: `Production analysis failed: ${msg}` });
    }
  },

  analyzeCurrentProject: async (modeOverride, userPrompt) => {
    return get().runAnalysis(modeOverride, userPrompt);
  },

  openPreview: (suggestionId) => {
    const sug = get().suggestions.find((s) => s.id === suggestionId);
    if (sug) {
      set({ previewSuggestion: sug });
    }
  },

  closePreview: () => set({ previewSuggestion: null }),

  applySuggestion: (suggestionOrId) => {
    let sug: ProductionSuggestion | undefined;
    if (typeof suggestionOrId === 'string') {
      sug = get().suggestions.find((s) => s.id === suggestionOrId);
    } else {
      sug = suggestionOrId;
    }

    if (!sug) {
      return { success: false, error: 'Suggestion not found.' };
    }

    const suggestionId = sug.id;

    if (get().appliedSuggestions.has(suggestionId)) {
      return true;
    }

    // 1. Snapshot state for atomic rollback
    const studioState = useStudioStore.getState();
    const arrangementState = useArrangementStore.getState();
    const mixerState = useMixerStore.getState();

    const snapshot: StateSnapshot = {
      tempo: studioState.tempo,
      key: studioState.key,
      tracks: JSON.parse(JSON.stringify(studioState.tracks)),
      sections: JSON.parse(JSON.stringify(arrangementState.sections)),
      automationLanes: JSON.parse(JSON.stringify(arrangementState.automationLanes)),
      mixerChannels: JSON.parse(JSON.stringify(mixerState.channels)),
      masterMixer: JSON.parse(JSON.stringify(mixerState.master)),
    };

    try {
      const { action, targetId, parameters } = sug;

      // 2. Execute Action Types
      if (action === 'set_track_volume' && targetId) {
        const volDb = (parameters.volumeDb as number) ?? (parameters.volume as number) ?? 0;
        mixerState.setChannelVolume(targetId, volDb);
      } else if (action === 'set_track_pan' && targetId) {
        const panVal = (parameters.pan as number) ?? 0;
        mixerState.setChannelPan(targetId, panVal);
      } else if (action === 'toggle_track_mute' && targetId) {
        const muted = (parameters.muted as boolean) ?? true;
        mixerState.setChannelMute(targetId, muted);
      } else if (action === 'toggle_track_solo' && targetId) {
        const solo = (parameters.solo as boolean) ?? true;
        mixerState.setChannelSolo(targetId, solo);
      } else if (action === 'set_master_volume') {
        const volDb = (parameters.volumeDb as number) ?? 0;
        mixerState.setMasterVolume(volDb);
      } else if (action === 'set_master_limiter') {
        const enabled = (parameters.enabled as boolean) ?? true;
        const thresh = (parameters.thresholdDb as number) ?? -0.1;
        useMixerStore.setState((state) => ({
          master: {
            ...state.master,
            limiterEnabled: enabled,
            limiterThresholdDb: thresh,
          },
        }));
      } else if (action === 'enable_track_in_section' && parameters.sectionId && parameters.trackId) {
        arrangementState.setSectionTrackState(
          parameters.sectionId as string,
          parameters.trackId as string,
          (parameters.enabled as boolean) ?? true
        );
      } else if (action === 'disable_track_in_section' && parameters.sectionId && parameters.trackId) {
        arrangementState.setSectionTrackState(parameters.sectionId as string, parameters.trackId as string, false);
      } else if (action === 'update_section_transition' && parameters.sectionId) {
        arrangementState.updateSection(parameters.sectionId as string, {
          transitionType: (parameters.transitionType as 'immediate' | 'fade' | 'crossfade') || 'crossfade',
          fadeDuration: (parameters.fadeDuration as number) ?? 0.5,
        });
      } else if (action === 'change_tempo' && parameters.bpm) {
        const newTempo = parameters.bpm as number;
        if (typeof studioState.setTempo === 'function') {
          studioState.setTempo(newTempo);
        } else {
          useStudioStore.setState({ tempo: newTempo });
        }
      } else if (action === 'change_key' && parameters.key) {
        const newKey = parameters.key as MusicalKey;
        if (typeof studioState.setKey === 'function') {
          studioState.setKey(newKey);
        } else {
          useStudioStore.setState({ key: newKey });
        }
      }

      // 3. Mark applied and update history
      const newApplied = new Set(get().appliedSuggestions);
      newApplied.add(suggestionId);

      const newSnapshots = {
        ...get().appliedSnapshots,
        [suggestionId]: snapshot,
      };

      set((state) => ({
        suggestions: state.suggestions.map((s) => (s.id === suggestionId ? { ...s, applied: true } : s)),
        previewSuggestion: null,
        appliedSuggestions: newApplied,
        appliedSnapshots: newSnapshots,
      }));

      return true;
    } catch (err: unknown) {
      // 4. Atomic Rollback on Failure
      if (snapshot.tempo !== undefined) {
        useStudioStore.setState({ tempo: snapshot.tempo });
      }
      if (snapshot.key !== undefined) {
        useStudioStore.setState({ key: snapshot.key });
      }
      if (snapshot.tracks) {
        useStudioStore.setState({ tracks: snapshot.tracks });
      }
      if (snapshot.sections) {
        useArrangementStore.setState({ sections: snapshot.sections });
      }
      if (snapshot.automationLanes) {
        useArrangementStore.setState({ automationLanes: snapshot.automationLanes });
      }
      if (snapshot.mixerChannels) {
        useMixerStore.setState({ channels: snapshot.mixerChannels as any });
      }
      if (snapshot.masterMixer) {
        useMixerStore.setState({ master: snapshot.masterMixer as any });
      }

      return false;
    }
  },

  rollbackSuggestion: (suggestionId) => {
    const snapshot = get().appliedSnapshots[suggestionId];
    if (!snapshot) return false;

    if (snapshot.tempo !== undefined) {
      useStudioStore.setState({ tempo: snapshot.tempo });
    }
    if (snapshot.key !== undefined) {
      useStudioStore.setState({ key: snapshot.key });
    }
    if (snapshot.tracks) {
      useStudioStore.setState({ tracks: snapshot.tracks });
    }
    if (snapshot.sections) {
      useArrangementStore.setState({ sections: snapshot.sections });
    }
    if (snapshot.automationLanes) {
      useArrangementStore.setState({ automationLanes: snapshot.automationLanes });
    }
    if (snapshot.mixerChannels) {
      useMixerStore.setState({ channels: snapshot.mixerChannels as any });
    }
    if (snapshot.masterMixer) {
      useMixerStore.setState({ master: snapshot.masterMixer as any });
    }

    const newApplied = new Set(get().appliedSuggestions);
    newApplied.delete(suggestionId);

    const newSnapshots = { ...get().appliedSnapshots };
    delete newSnapshots[suggestionId];

    set((state) => ({
      suggestions: state.suggestions.map((s) => (s.id === suggestionId ? { ...s, applied: false } : s)),
      appliedSuggestions: newApplied,
      appliedSnapshots: newSnapshots,
    }));

    return true;
  },

  rejectSuggestion: (suggestionId) => {
    set((state) => ({
      suggestions: state.suggestions.map((s) => (s.id === suggestionId ? { ...s, rejected: true } : s)),
      previewSuggestion: state.previewSuggestion?.id === suggestionId ? null : state.previewSuggestion,
    }));
  },

  clearHistory: () => set({ history: [] }),
  loadHistory: (history) => set({ history }),
}));


