export interface MeterData {
  peakDb: number; // -60 to +6 dB (or -Infinity)
  rmsDb?: number; // -60 to +6 dB
  isClipping: boolean;
}
