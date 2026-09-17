import { create } from 'zustand';
import { TrackMixerChannel, MasterMixerChannel, SerializedMixerState } from '../types/mixer';
import { ReturnBusConfig, SendBusType } from '../types/bus';
import { EffectType, EffectConfig, EffectParameters, validateEffectParameters } from '../types/effect';
import { MixerEngine } from '../engine/MixerEngine';
import { MixerPresetManager } from '../presets/MixerPresetManager';
import { Track } from '../../editor/types/studio';

interface MixerStoreState {
  channels: Record<string, TrackMixerChannel>;
  master: MasterMixerChannel;
  returnBuses: ReturnBusConfig[];
  activePresetId: string | null;
  selectedChannelId: string | null; // null = Master Channel
  isPresetDialogOpen: boolean;
  isEffectRackOpen: boolean;

  syncWithStudioTracks: (tracks: Track[]) => void;
  ensureTrackChannel: (track: Track) => TrackMixerChannel;
  setChannelVolume: (trackId: string, volumeDb: number) => void;
  setChannelPan: (trackId: string, pan: number) => void;
  setChannelMute: (trackId: string, muted: boolean) => void;
  setChannelSolo: (trackId: string, solo: number | boolean) => void;
  setChannelSendLevel: (trackId: string, busType: SendBusType, levelDb: number) => void;

  addChannelInsert: (trackId: string, type: EffectType) => void;
  updateChannelInsertParams: (trackId: string, insertId: string, params: EffectParameters) => void;
  toggleChannelInsertBypass: (trackId: string, insertId: string) => void;
  removeChannelInsert: (trackId: string, insertId: string) => void;
  reorderChannelInserts: (trackId: string, fromIndex: number, toIndex: number) => void;

  setMasterVolume: (volumeDb: number) => void;
  setMasterPan: (pan: number) => void;
  setMasterMute: (muted: boolean) => void;
  addMasterInsert: (type: EffectType) => void;
  updateMasterInsertParams: (insertId: string, params: EffectParameters) => void;
  toggleMasterInsertBypass: (insertId: string) => void;
  removeMasterInsert: (insertId: string) => void;

  setReturnBusLevel: (busType: SendBusType, levelDb: number) => void;
  setReturnBusMute: (busType: SendBusType, muted: boolean) => void;

  setSelectedChannelId: (trackId: string | null) => void;
  setPresetDialogOpen: (open: boolean) => void;
  setEffectRackOpen: (open: boolean) => void;

  applyPreset: (presetId: string) => void;
  saveCurrentAsPreset: (name: string, description?: string) => string;
  serializeState: () => SerializedMixerState;
  loadSerializedState: (state: Partial<SerializedMixerState>) => void;
  resetMixer: () => void;
}

const DEFAULT_MASTER: MasterMixerChannel = {
  volumeDb: 0,
  pan: 0,
  muted: false,
  limiterEnabled: true,
  limiterThresholdDb: -0.1,
  inserts: [],
};

const DEFAULT_RETURNS: ReturnBusConfig[] = [
  { busType: 'reverb', name: 'Reverb Return', returnLevelDb: 0, muted: false, decaySeconds: 2.0 },
  { busType: 'delay', name: 'Delay Return', returnLevelDb: 0, muted: false, delayTimeSeconds: 0.25, feedback: 0.3 },
];

function createDefaultChannel(trackId: string, initialVol = 0, initialPan = 0): TrackMixerChannel {
  return {
    trackId,
    volumeDb: initialVol,
    pan: initialPan,
    muted: false,
    solo: false,
    inserts: [],
    sends: [
      { busType: 'reverb', levelDb: -12, enabled: true },
      { busType: 'delay', levelDb: -60, enabled: false },
    ],
  };
}

function getDefaultParamsForType(type: EffectType): EffectParameters {
  switch (type) {
    case 'gain':
      return { gainDb: 0 };
    case 'filter':
      return { frequency: 1000, Q: 1.0, filterType: 'lowpass' };
    case 'eq':
      return { lowGainDb: 0, midGainDb: 0, highGainDb: 0 };
    case 'compressor':
      return { thresholdDb: -20, ratio: 4, attackMs: 15, releaseMs: 150, kneeDb: 5 };
    case 'reverb':
      return { decaySeconds: 2.0, wet: 0.3 };
    case 'delay':
      return { delayTimeSeconds: 0.25, feedback: 0.3, wet: 0.25 };
  }
}

export const useMixerStore = create<MixerStoreState>((set, get) => {
  const engine = MixerEngine.getInstance();

  const syncChannelToEngine = (channel: TrackMixerChannel) => {
    engine.syncChannelConfig(channel);
  };

  const syncMasterToEngine = (master: MasterMixerChannel) => {
    engine.syncMasterConfig(master);
  };

  const syncReturnsToEngine = (returns: ReturnBusConfig[]) => {
    engine.syncReturnBusConfigs(returns);
  };

  return {
    channels: {},
    master: DEFAULT_MASTER,
    returnBuses: DEFAULT_RETURNS,
    activePresetId: null,
    selectedChannelId: null,
    isPresetDialogOpen: false,
    isEffectRackOpen: false,

    syncWithStudioTracks: (tracks: Track[]) => {
      const currentChannels = { ...get().channels };
      const validTrackIds = new Set(tracks.map((t) => t.id));

      // Remove channel nodes no longer in tracks
      Object.keys(currentChannels).forEach((tId) => {
        if (!validTrackIds.has(tId)) {
          engine.removeChannel(tId);
          delete currentChannels[tId];
        }
      });

      // Ensure channel for each active track
      tracks.forEach((track) => {
        if (!currentChannels[track.id]) {
          const newCh = createDefaultChannel(track.id, track.volume ? (track.volume - 100) * 0.4 : 0);
          newCh.muted = track.muted;
          newCh.solo = track.solo;
          currentChannels[track.id] = newCh;
          syncChannelToEngine(newCh);
        } else {
          // Keep mute/solo in sync with track
          currentChannels[track.id].muted = track.muted;
          currentChannels[track.id].solo = track.solo;
          syncChannelToEngine(currentChannels[track.id]);
        }
      });

      set({ channels: currentChannels });
    },

    ensureTrackChannel: (track: Track) => {
      const existing = get().channels[track.id];
      if (existing) return existing;
      const newCh = createDefaultChannel(track.id);
      newCh.muted = track.muted;
      newCh.solo = track.solo;
      const updated = { ...get().channels, [track.id]: newCh };
      set({ channels: updated });
      syncChannelToEngine(newCh);
      return newCh;
    },

    setChannelVolume: (trackId: string, volumeDb: number) => {
      const clamped = Math.max(-60, Math.min(6, volumeDb));
      const ch = get().channels[trackId];
      if (!ch) return;
      const updated = { ...ch, volumeDb: clamped };
      set({ channels: { ...get().channels, [trackId]: updated } });
      syncChannelToEngine(updated);
    },

    setChannelPan: (trackId: string, pan: number) => {
      const clamped = Math.max(-100, Math.min(100, pan));
      const ch = get().channels[trackId];
      if (!ch) return;
      const updated = { ...ch, pan: clamped };
      set({ channels: { ...get().channels, [trackId]: updated } });
      syncChannelToEngine(updated);
    },

    setChannelMute: (trackId: string, muted: boolean) => {
      const ch = get().channels[trackId];
      if (!ch) return;
      const updated = { ...ch, muted };
      set({ channels: { ...get().channels, [trackId]: updated } });
      syncChannelToEngine(updated);
    },

    setChannelSolo: (trackId: string, soloVal: number | boolean) => {
      const solo = typeof soloVal === 'boolean' ? soloVal : soloVal > 0;
      const ch = get().channels[trackId];
      if (!ch) return;
      const updated = { ...ch, solo };
      set({ channels: { ...get().channels, [trackId]: updated } });
      syncChannelToEngine(updated);
    },

    setChannelSendLevel: (trackId: string, busType: SendBusType, levelDb: number) => {
      const ch = get().channels[trackId];
      if (!ch) return;
      const sends = ch.sends.map((s) =>
        s.busType === busType ? { ...s, levelDb: Math.max(-60, Math.min(6, levelDb)), enabled: levelDb > -58 } : s
      );
      const updated = { ...ch, sends };
      set({ channels: { ...get().channels, [trackId]: updated } });
      syncChannelToEngine(updated);
    },

    addChannelInsert: (trackId: string, type: EffectType) => {
      const ch = get().channels[trackId];
      if (!ch) return;
      const newInsert: EffectConfig = {
        id: `ins-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type,
        name: `${type.toUpperCase()} Effect`,
        bypassed: false,
        parameters: getDefaultParamsForType(type),
      };
      const updated = { ...ch, inserts: [...ch.inserts, newInsert] };
      set({ channels: { ...get().channels, [trackId]: updated } });
      syncChannelToEngine(updated);
    },

    updateChannelInsertParams: (trackId: string, insertId: string, params: EffectParameters) => {
      const ch = get().channels[trackId];
      if (!ch) return;
      const inserts = ch.inserts.map((ins) => {
        if (ins.id === insertId) {
          const valid = validateEffectParameters(ins.type, params);
          return { ...ins, parameters: valid };
        }
        return ins;
      });
      const updated = { ...ch, inserts };
      set({ channels: { ...get().channels, [trackId]: updated } });
      syncChannelToEngine(updated);
    },

    toggleChannelInsertBypass: (trackId: string, insertId: string) => {
      const ch = get().channels[trackId];
      if (!ch) return;
      const inserts = ch.inserts.map((ins) => (ins.id === insertId ? { ...ins, bypassed: !ins.bypassed } : ins));
      const updated = { ...ch, inserts };
      set({ channels: { ...get().channels, [trackId]: updated } });
      syncChannelToEngine(updated);
    },

    removeChannelInsert: (trackId: string, insertId: string) => {
      const ch = get().channels[trackId];
      if (!ch) return;
      const inserts = ch.inserts.filter((ins) => ins.id !== insertId);
      const updated = { ...ch, inserts };
      set({ channels: { ...get().channels, [trackId]: updated } });
      syncChannelToEngine(updated);
    },

    reorderChannelInserts: (trackId: string, fromIndex: number, toIndex: number) => {
      const ch = get().channels[trackId];
      if (!ch) return;
      const inserts = [...ch.inserts];
      if (fromIndex < 0 || fromIndex >= inserts.length || toIndex < 0 || toIndex >= inserts.length) return;
      const [moved] = inserts.splice(fromIndex, 1);
      inserts.splice(toIndex, 0, moved);
      const updated = { ...ch, inserts };
      set({ channels: { ...get().channels, [trackId]: updated } });
      syncChannelToEngine(updated);
    },

    setMasterVolume: (volumeDb: number) => {
      const master = { ...get().master, volumeDb: Math.max(-60, Math.min(6, volumeDb)) };
      set({ master });
      syncMasterToEngine(master);
    },

    setMasterPan: (pan: number) => {
      const master = { ...get().master, pan: Math.max(-100, Math.min(100, pan)) };
      set({ master });
      syncMasterToEngine(master);
    },

    setMasterMute: (muted: boolean) => {
      const master = { ...get().master, muted };
      set({ master });
      syncMasterToEngine(master);
    },

    addMasterInsert: (type: EffectType) => {
      const master = get().master;
      const newInsert: EffectConfig = {
        id: `master-ins-${Date.now()}`,
        type,
        name: `Master ${type.toUpperCase()}`,
        bypassed: false,
        parameters: getDefaultParamsForType(type),
      };
      const updated = { ...master, inserts: [...master.inserts, newInsert] };
      set({ master: updated });
      syncMasterToEngine(updated);
    },

    updateMasterInsertParams: (insertId: string, params: EffectParameters) => {
      const master = get().master;
      const inserts = master.inserts.map((ins) => {
        if (ins.id === insertId) {
          const valid = validateEffectParameters(ins.type, params);
          return { ...ins, parameters: valid };
        }
        return ins;
      });
      const updated = { ...master, inserts };
      set({ master: updated });
      syncMasterToEngine(updated);
    },

    toggleMasterInsertBypass: (insertId: string) => {
      const master = get().master;
      const inserts = master.inserts.map((ins) => (ins.id === insertId ? { ...ins, bypassed: !ins.bypassed } : ins));
      const updated = { ...master, inserts };
      set({ master: updated });
      syncMasterToEngine(updated);
    },

    removeMasterInsert: (insertId: string) => {
      const master = get().master;
      const inserts = master.inserts.filter((ins) => ins.id !== insertId);
      const updated = { ...master, inserts };
      set({ master: updated });
      syncMasterToEngine(updated);
    },

    setReturnBusLevel: (busType: SendBusType, levelDb: number) => {
      const returnBuses = get().returnBuses.map((b) =>
        b.busType === busType ? { ...b, returnLevelDb: Math.max(-60, Math.min(6, levelDb)) } : b
      );
      set({ returnBuses });
      syncReturnsToEngine(returnBuses);
    },

    setReturnBusMute: (busType: SendBusType, muted: boolean) => {
      const returnBuses = get().returnBuses.map((b) => (b.busType === busType ? { ...b, muted } : b));
      set({ returnBuses });
      syncReturnsToEngine(returnBuses);
    },

    setSelectedChannelId: (trackId: string | null) => set({ selectedChannelId: trackId }),
    setPresetDialogOpen: (open: boolean) => set({ isPresetDialogOpen: open }),
    setEffectRackOpen: (open: boolean) => set({ isEffectRackOpen: open }),

    applyPreset: (presetId: string) => {
      const preset = MixerPresetManager.getInstance().getPreset(presetId);
      if (!preset) return;

      const master = { ...preset.master };
      const returnBuses = [...preset.returnBuses];
      const channels = { ...get().channels };

      // Apply channel defaults to existing channels
      Object.keys(channels).forEach((tId) => {
        channels[tId] = {
          ...channels[tId],
          volumeDb: preset.channelDefaults.volumeDb,
          pan: preset.channelDefaults.pan,
          inserts: [...preset.channelDefaults.inserts],
          sends: [...preset.channelDefaults.sends],
        };
        syncChannelToEngine(channels[tId]);
      });

      set({
        master,
        returnBuses,
        channels,
        activePresetId: preset.id,
      });

      syncMasterToEngine(master);
      syncReturnsToEngine(returnBuses);
    },

    saveCurrentAsPreset: (name: string, description = '') => {
      const id = `custom-mix-${Date.now()}`;
      const firstChannel = Object.values(get().channels)[0];
      const channelDefaults = firstChannel
        ? {
            volumeDb: firstChannel.volumeDb,
            pan: firstChannel.pan,
            inserts: [...firstChannel.inserts],
            sends: [...firstChannel.sends],
          }
        : {
            volumeDb: 0,
            pan: 0,
            inserts: [],
            sends: [
              { busType: 'reverb' as const, levelDb: -12, enabled: true },
              { busType: 'delay' as const, levelDb: -60, enabled: false },
            ],
          };

      const preset = {
        id,
        name,
        description,
        isBuiltIn: false,
        channelDefaults,
        returnBuses: get().returnBuses,
        master: get().master,
      };

      MixerPresetManager.getInstance().saveCustomPreset(preset);
      set({ activePresetId: id });
      return id;
    },

    serializeState: (): SerializedMixerState => ({
      version: 4,
      channels: get().channels,
      master: get().master,
      returnBuses: get().returnBuses,
      activePresetId: get().activePresetId || undefined,
    }),

    loadSerializedState: (state: Partial<SerializedMixerState>) => {
      if (!state) return;
      const channels = state.channels || {};
      const master = state.master || DEFAULT_MASTER;
      const returnBuses = state.returnBuses || DEFAULT_RETURNS;

      set({
        channels,
        master,
        returnBuses,
        activePresetId: state.activePresetId || null,
      });

      Object.values(channels).forEach(syncChannelToEngine);
      syncMasterToEngine(master);
      syncReturnsToEngine(returnBuses);
    },

    resetMixer: () => {
      Object.keys(get().channels).forEach((tId) => engine.removeChannel(tId));
      set({
        channels: {},
        master: DEFAULT_MASTER,
        returnBuses: DEFAULT_RETURNS,
        activePresetId: null,
        selectedChannelId: null,
      });
      syncMasterToEngine(DEFAULT_MASTER);
      syncReturnsToEngine(DEFAULT_RETURNS);
    },
  };
});
