export type InstrumentCategory =
  | 'Piano'
  | 'Keys'
  | 'Guitar'
  | 'Bass'
  | 'Strings'
  | 'Synth'
  | 'Pad'
  | 'Lead'
  | 'Drums';

export type InstrumentType = 'synth' | 'sample' | 'hybrid';

export interface InstrumentParameters {
  attack?: number; // 0.001s to 5.0s
  decay?: number; // 0.01s to 5.0s
  sustain?: number; // 0.0 to 1.0
  release?: number; // 0.01s to 5.0s
  cutoff?: number; // 20Hz to 20000Hz
  resonance?: number; // 0.0 to 20.0
  brightness?: number; // 0.0 to 1.0
  volume?: number; // 0 to 100
  pan?: number; // -1.0 to 1.0
  [key: string]: number | string | boolean | undefined;
}

export interface InstrumentPreset {
  id: string;
  name: string;
  instrumentId: string;
  category: InstrumentCategory;
  isBuiltIn?: boolean;
  version: number;
  parameters: InstrumentParameters;
}

export interface InstrumentMetadata {
  id: string;
  name: string;
  category: InstrumentCategory;
  type: InstrumentType;
  description?: string;
  defaultPresetId?: string;
}

export interface Instrument {
  readonly id: string;
  readonly name: string;
  readonly category: InstrumentCategory;
  readonly type: InstrumentType;

  initialize(): Promise<void>;
  playNote(pitch: number, durationBeats: number, velocity: number, time?: number): void;
  previewNote(pitch: number, durationBeats?: number, velocity?: number): void;
  releaseNote?(pitch: number, time?: number): void;

  setVolume(volumePercent: number): void;
  setMute(muted: boolean): void;
  setSolo(solo: boolean): void;
  setPan(pan: number): void;

  setParameter?(name: keyof InstrumentParameters | string, value: number): void;
  getParameters?(): InstrumentParameters;
  applyPreset?(preset: InstrumentPreset): void;

  dispose(): void;
}
