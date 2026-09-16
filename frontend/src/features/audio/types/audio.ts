export interface AudioEngineState {
  isInitialized: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  currentBeat: number;
  tempo: number;
  audioError: string | null;
}

export interface Instrument {
  initialize(): Promise<void>;
  playNote(pitch: number, durationBeats: number, velocity: number, time?: number): void;
  previewNote(pitch: number, durationBeats: number, velocity: number): void;
  setVolume(volumePercent: number): void;
  setMute(muted: boolean): void;
  setSolo(solo: boolean): void;
  dispose(): void;
}
