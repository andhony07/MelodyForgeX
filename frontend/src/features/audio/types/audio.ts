export * from './instrument';

export interface AudioEngineState {
  isInitialized: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  currentBeat: number;
  tempo: number;
  audioError: string | null;
}
