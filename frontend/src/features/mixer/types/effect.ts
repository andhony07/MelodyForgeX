export type EffectType = 'gain' | 'filter' | 'eq' | 'compressor' | 'reverb' | 'delay';

export interface GainParameters {
  gainDb: number; // -60 to +12 dB
}

export interface FilterParameters {
  frequency: number; // 20 to 20000 Hz
  Q: number; // 0.1 to 20
  filterType: 'lowpass' | 'highpass' | 'bandpass' | 'notch';
}

export interface EqualizerParameters {
  lowGainDb: number; // -24 to +24 dB
  midGainDb: number; // -24 to +24 dB
  highGainDb: number; // -24 to +24 dB
}

export interface CompressorParameters {
  thresholdDb: number; // -60 to 0 dB
  ratio: number; // 1 to 20
  attackMs: number; // 1 to 500 ms
  releaseMs: number; // 10 to 1000 ms
  kneeDb: number; // 0 to 40 dB
}

export interface ReverbParameters {
  decaySeconds: number; // 0.1 to 20 s
  wet: number; // 0 to 1
}

export interface DelayParameters {
  delayTimeSeconds: number; // 0.01 to 2.0 s
  feedback: number; // 0 to 0.95
  wet: number; // 0 to 1
}

export type EffectParameters =
  | GainParameters
  | FilterParameters
  | EqualizerParameters
  | CompressorParameters
  | ReverbParameters
  | DelayParameters;

export interface EffectConfig {
  id: string;
  type: EffectType;
  name: string;
  bypassed: boolean;
  parameters: EffectParameters;
}

export function validateEffectParameters(type: EffectType, params: EffectParameters): EffectParameters {
  switch (type) {
    case 'gain': {
      const p = params as GainParameters;
      return {
        gainDb: Math.max(-60, Math.min(12, p.gainDb ?? 0)),
      };
    }
    case 'filter': {
      const p = params as FilterParameters;
      return {
        frequency: Math.max(20, Math.min(20000, p.frequency ?? 1000)),
        Q: Math.max(0.1, Math.min(20, p.Q ?? 1)),
        filterType: p.filterType || 'lowpass',
      };
    }
    case 'eq': {
      const p = params as EqualizerParameters;
      return {
        lowGainDb: Math.max(-24, Math.min(24, p.lowGainDb ?? 0)),
        midGainDb: Math.max(-24, Math.min(24, p.midGainDb ?? 0)),
        highGainDb: Math.max(-24, Math.min(24, p.highGainDb ?? 0)),
      };
    }
    case 'compressor': {
      const p = params as CompressorParameters;
      return {
        thresholdDb: Math.max(-60, Math.min(0, p.thresholdDb ?? -24)),
        ratio: Math.max(1, Math.min(20, p.ratio ?? 4)),
        attackMs: Math.max(1, Math.min(500, p.attackMs ?? 10)),
        releaseMs: Math.max(10, Math.min(1000, p.releaseMs ?? 250)),
        kneeDb: Math.max(0, Math.min(40, p.kneeDb ?? 5)),
      };
    }
    case 'reverb': {
      const p = params as ReverbParameters;
      return {
        decaySeconds: Math.max(0.1, Math.min(20, p.decaySeconds ?? 1.5)),
        wet: Math.max(0, Math.min(1, p.wet ?? 0.3)),
      };
    }
    case 'delay': {
      const p = params as DelayParameters;
      return {
        delayTimeSeconds: Math.max(0.01, Math.min(2.0, p.delayTimeSeconds ?? 0.25)),
        feedback: Math.max(0, Math.min(0.95, p.feedback ?? 0.3)),
        wet: Math.max(0, Math.min(1, p.wet ?? 0.25)),
      };
    }
    default:
      return params;
  }
}
