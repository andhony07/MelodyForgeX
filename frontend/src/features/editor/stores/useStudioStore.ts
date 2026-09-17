import { create } from 'zustand';
import { Track, MusicalKey, KeyMode, TimeSignature, InstrumentOption } from '../types/studio';
import { INITIAL_DEMO_TRACKS, DEFAULT_INSTRUMENTS } from '../constants/studio';
import { InstrumentParameters } from '../../audio/types/instrument';
import { PresetManager } from '../../audio/presets/PresetManager';

interface StudioState {
  tracks: Track[];
  selectedTrackId: string | null;
  isPlaying: boolean;
  playheadPosition: number; // in measures (e.g. 1.0 = measure 1)
  tempo: number;
  key: MusicalKey;
  mode: KeyMode;
  timeSignature: TimeSignature;
  zoom: number; // percentage (50% - 200%)
  isLooping: boolean;

  addTrack: (instrument?: InstrumentOption) => void;
  deleteTrack: (id: string) => void;
  selectTrack: (id: string | null) => void;
  toggleMute: (id: string) => void;
  toggleSolo: (id: string) => void;
  setVolume: (id: string, volume: number) => void;
  setTrackInstrument: (id: string, instrumentId: string) => void;
  setTrackPreset: (id: string, presetId: string) => void;
  setTrackParameter: (id: string, paramName: string, value: number) => void;
  setTempo: (tempo: number) => void;
  setKey: (key: MusicalKey) => void;
  setMode: (mode: KeyMode) => void;
  setTimeSignature: (sig: TimeSignature) => void;
  setZoom: (zoom: number) => void;
  togglePlay: () => void;
  stop: () => void;
  toggleLoop: () => void;
  setPlayheadPosition: (pos: number) => void;
  stepPlayhead: (deltaMeasures: number) => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  tracks: INITIAL_DEMO_TRACKS,
  selectedTrackId: 'track-1',
  isPlaying: false,
  playheadPosition: 1.0,
  tempo: 120,
  key: 'C',
  mode: 'Major',
  timeSignature: '4/4',
  zoom: 100,
  isLooping: false,

  addTrack: (option?: InstrumentOption) => {
    const selectedInstrument = option || DEFAULT_INSTRUMENTS[Math.floor(Math.random() * DEFAULT_INSTRUMENTS.length)];
    set((state) => {
      const newTrackId = `track-${Date.now()}`;
      const newTrack: Track = {
        id: newTrackId,
        name: `${selectedInstrument.name} ${state.tracks.length + 1}`,
        instrument: selectedInstrument.instrument,
        iconName: selectedInstrument.iconName,
        muted: false,
        solo: false,
        volume: 80,
        color: selectedInstrument.color,
        channel: state.tracks.length + 1,
      };
      return {
        tracks: [...state.tracks, newTrack],
        selectedTrackId: newTrackId,
      };
    });
  },

  deleteTrack: (id: string) => {
    set((state) => {
      const updatedTracks = state.tracks.filter((t) => t.id !== id);
      const newSelectedId =
        state.selectedTrackId === id
          ? updatedTracks.length > 0
            ? updatedTracks[0].id
            : null
          : state.selectedTrackId;
      return {
        tracks: updatedTracks,
        selectedTrackId: newSelectedId,
      };
    });
  },

  selectTrack: (id: string | null) => {
    set({ selectedTrackId: id });
  },

  toggleMute: (id: string) => {
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === id ? { ...t, muted: !t.muted } : t)),
    }));
  },

  toggleSolo: (id: string) => {
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === id ? { ...t, solo: !t.solo } : t)),
    }));
  },

  setVolume: (id: string, volume: number) => {
    const clampedVol = Math.max(0, Math.min(100, volume));
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === id ? { ...t, volume: clampedVol } : t)),
    }));
  },

  setTrackInstrument: (id: string, instrumentId: string) => {
    set((state) => {
      const presetManager = PresetManager.getInstance();
      const defaultPreset = presetManager.getFallbackPreset(instrumentId);
      return {
        tracks: state.tracks.map((t) =>
          t.id === id
            ? {
                ...t,
                instrument: instrumentId,
                presetId: defaultPreset ? defaultPreset.id : undefined,
                customParameters: defaultPreset ? { ...defaultPreset.parameters } : undefined,
              }
            : t
        ),
      };
    });
  },

  setTrackPreset: (id: string, presetId: string) => {
    set((state) => {
      const presetManager = PresetManager.getInstance();
      const preset = presetManager.getPreset(presetId);
      return {
        tracks: state.tracks.map((t) =>
          t.id === id
            ? {
                ...t,
                presetId,
                instrument: preset ? preset.instrumentId : t.instrument,
                customParameters: preset ? { ...preset.parameters } : t.customParameters,
              }
            : t
        ),
      };
    });
  },

  setTrackParameter: (id: string, paramName: string, value: number) => {
    set((state) => ({
      tracks: state.tracks.map((t) => {
        if (t.id !== id) return t;
        const currentParams: InstrumentParameters = t.customParameters ? { ...t.customParameters } : {};
        currentParams[paramName] = value;
        return {
          ...t,
          customParameters: currentParams,
        };
      }),
    }));
  },

  setTempo: (tempo: number) => {
    const clampedBpm = Math.max(20, Math.min(300, tempo));
    set({ tempo: clampedBpm });
  },

  setKey: (key: MusicalKey) => set({ key }),
  setMode: (mode: KeyMode) => set({ mode }),
  setTimeSignature: (timeSignature: TimeSignature) => set({ timeSignature }),
  setZoom: (zoom: number) => {
    const clampedZoom = Math.max(50, Math.min(200, zoom));
    set({ zoom: clampedZoom });
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  stop: () => set({ isPlaying: false, playheadPosition: 1.0 }),

  toggleLoop: () => set((state) => ({ isLooping: !state.isLooping })),

  setPlayheadPosition: (pos: number) => {
    const clampedPos = Math.max(1.0, pos);
    set({ playheadPosition: clampedPos });
  },

  stepPlayhead: (deltaMeasures: number) => {
    set((state) => {
      let nextPos = state.playheadPosition + deltaMeasures;
      const maxMeasures = 32;
      if (nextPos > maxMeasures) {
        nextPos = state.isLooping ? 1.0 : maxMeasures;
      }
      return { playheadPosition: nextPos };
    });
  },
}));
