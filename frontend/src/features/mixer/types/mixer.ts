import { EffectConfig } from './effect';
import { SendConfig, ReturnBusConfig } from './bus';

export interface TrackMixerChannel {
  trackId: string;
  volumeDb: number; // -60 to +6 dB (0 dB unity)
  pan: number; // -100 to +100 (0 center)
  muted: boolean;
  solo: boolean;
  inserts: EffectConfig[];
  sends: SendConfig[];
}

export interface MasterMixerChannel {
  volumeDb: number; // -60 to +6 dB
  pan: number; // -100 to +100
  muted: boolean;
  inserts: EffectConfig[];
  limiterEnabled: boolean;
  limiterThresholdDb: number; // default -0.1 dB
}

export interface MixPreset {
  id: string;
  name: string;
  description: string;
  isBuiltIn: boolean;
  channelDefaults: {
    volumeDb: number;
    pan: number;
    inserts: EffectConfig[];
    sends: SendConfig[];
  };
  returnBuses: ReturnBusConfig[];
  master: MasterMixerChannel;
}

export interface SerializedMixerState {
  channels: Record<string, TrackMixerChannel>;
  master: MasterMixerChannel;
  returnBuses: ReturnBusConfig[];
  activePresetId?: string;
  version: number;
}
