import { InstrumentParameters } from '../types/instrument';

export const VALID_INSTRUMENT_IDS = [
  'acoustic-piano',
  'electric-piano',
  'guitar',
  'bass',
  'synth-lead',
  'synth-pad',
  'strings',
  'pluck',
  'drum-kit',
] as const;

export const DEFAULT_FALLBACK_INSTRUMENT_ID = 'acoustic-piano';

export function validateInstrumentId(id: string | null | undefined): string {
  if (!id || typeof id !== 'string') return DEFAULT_FALLBACK_INSTRUMENT_ID;

  const lower = id.toLowerCase().trim();

  // Exact match
  if (VALID_INSTRUMENT_IDS.includes(lower as (typeof VALID_INSTRUMENT_IDS)[number])) {
    return lower;
  }

  // Legacy mappings
  if (lower.includes('piano')) return 'acoustic-piano';
  if (lower.includes('keys') || lower.includes('epiano')) return 'electric-piano';
  if (lower.includes('guitar')) return 'guitar';
  if (lower.includes('bass')) return 'bass';
  if (lower.includes('drum') || lower.includes('percussion')) return 'drum-kit';
  if (lower.includes('pad')) return 'synth-pad';
  if (lower.includes('lead')) return 'synth-lead';
  if (lower.includes('string')) return 'strings';
  if (lower.includes('pluck')) return 'pluck';
  if (lower.includes('synth')) return 'synth-lead';

  return DEFAULT_FALLBACK_INSTRUMENT_ID;
}

export function sanitizeParameters(params: unknown): InstrumentParameters {
  const sanitized: InstrumentParameters = {};

  if (!params || typeof params !== 'object') {
    return sanitized;
  }

  const p = params as Record<string, unknown>;

  if (typeof p.attack === 'number' && !isNaN(p.attack)) {
    sanitized.attack = Math.max(0.001, Math.min(5.0, p.attack));
  }
  if (typeof p.decay === 'number' && !isNaN(p.decay)) {
    sanitized.decay = Math.max(0.01, Math.min(5.0, p.decay));
  }
  if (typeof p.sustain === 'number' && !isNaN(p.sustain)) {
    sanitized.sustain = Math.max(0.0, Math.min(1.0, p.sustain));
  }
  if (typeof p.release === 'number' && !isNaN(p.release)) {
    sanitized.release = Math.max(0.01, Math.min(5.0, p.release));
  }
  if (typeof p.cutoff === 'number' && !isNaN(p.cutoff)) {
    sanitized.cutoff = Math.max(20, Math.min(20000, p.cutoff));
  }
  if (typeof p.resonance === 'number' && !isNaN(p.resonance)) {
    sanitized.resonance = Math.max(0.0, Math.min(20.0, p.resonance));
  }
  if (typeof p.brightness === 'number' && !isNaN(p.brightness)) {
    sanitized.brightness = Math.max(0.0, Math.min(1.0, p.brightness));
  }
  if (typeof p.volume === 'number' && !isNaN(p.volume)) {
    sanitized.volume = Math.max(0, Math.min(100, p.volume));
  }
  if (typeof p.pan === 'number' && !isNaN(p.pan)) {
    sanitized.pan = Math.max(-1.0, Math.min(1.0, p.pan));
  }

  return sanitized;
}
