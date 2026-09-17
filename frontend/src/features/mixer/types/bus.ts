export type SendBusType = 'reverb' | 'delay';

export interface SendConfig {
  busType: SendBusType;
  levelDb: number; // -60 to +6 dB (-60 dB = muted send)
  enabled: boolean;
}

export interface ReturnBusConfig {
  busType: SendBusType;
  name: string;
  returnLevelDb: number; // -60 to +6 dB
  muted: boolean;
  decaySeconds?: number; // Reverb parameter
  delayTimeSeconds?: number; // Delay parameter
  feedback?: number; // Delay parameter
}
