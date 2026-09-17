import * as Tone from 'tone';
import {
  Instrument,
  InstrumentCategory,
  InstrumentType,
  InstrumentParameters,
  InstrumentPreset,
} from '../types/instrument';

// Provide Web Audio API stub for headless Node test environments where AudioParam is missing
const globalScope = globalThis as unknown as Record<string, unknown>;
if (typeof globalScope !== 'undefined' && typeof globalScope.AudioParam === 'undefined') {
  class DummyAudioParam {
    value = 0;
    setValueAtTime() {}
    linearRampToValueAtTime() {}
    exponentialRampToValueAtTime() {}
    setTargetAtTime() {}
    setValueCurveAtTime() {}
    cancelScheduledValues() {}
    cancelAndHoldAtTime() {}
  }
  globalScope.AudioParam = DummyAudioParam;
}

// Helper to convert volume percentage (0 - 100) to decibels (-40dB to +6dB)
export const volumeToDb = (volumePercent: number): number => {
  if (volumePercent <= 0) return -Infinity;
  if (volumePercent >= 100) return 6;
  return -40 + (volumePercent / 100) * 46;
};

export abstract class BaseInstrument implements Instrument {
  public abstract readonly id: string;
  public abstract readonly name: string;
  public abstract readonly category: InstrumentCategory;
  public readonly type: InstrumentType = 'synth';

  protected channel: Tone.Channel;
  protected parameters: InstrumentParameters;

  constructor(initialVolume = 80) {
    try {
      this.channel = new Tone.Channel({
        volume: volumeToDb(initialVolume),
        mute: false,
        solo: false,
      });
      try {
        this.channel.toDestination();
      } catch {
        /* ignore destination routing in headless environment */
      }
    } catch {
      // Mock Tone.Channel for headless test environments
      this.channel = {
        volume: { value: volumeToDb(initialVolume) },
        mute: false,
        solo: false,
        pan: { value: 0 },
        toDestination: () => this.channel,
        dispose: () => {},
      } as unknown as Tone.Channel;
    }

    this.parameters = {
      volume: initialVolume,
      pan: 0,
      attack: 0.01,
      decay: 0.5,
      sustain: 0.5,
      release: 0.5,
      cutoff: 5000,
      resonance: 1.0,
      brightness: 0.5,
    };
  }

  async initialize(): Promise<void> {}

  abstract playNote(pitch: number, durationBeats: number, velocity: number, time?: number): void;
  abstract previewNote(pitch: number, durationBeats?: number, velocity?: number): void;

  setVolume(volumePercent: number): void {
    const clampedVol = Math.max(0, Math.min(100, volumePercent));
    this.parameters.volume = clampedVol;
    try {
      if (this.channel && this.channel.volume) {
        this.channel.volume.value = volumeToDb(clampedVol);
      }
    } catch {
      /* ignore volume param error */
    }
  }

  setMute(muted: boolean): void {
    try {
      if (this.channel) {
        this.channel.mute = muted;
      }
    } catch {
      /* ignore mute param error */
    }
  }

  setSolo(solo: boolean): void {
    try {
      if (this.channel) {
        this.channel.solo = solo;
      }
    } catch {
      /* ignore solo param error */
    }
  }

  setPan(pan: number): void {
    const clampedPan = Math.max(-1, Math.min(1, pan));
    this.parameters.pan = clampedPan;
    try {
      if (this.channel && this.channel.pan) {
        this.channel.pan.value = clampedPan;
      }
    } catch {
      /* ignore pan param error */
    }
  }

  setParameter(name: string, value: number): void {
    this.parameters[name] = value;
    if (name === 'volume') {
      this.setVolume(value);
    } else if (name === 'pan') {
      this.setPan(value);
    }
  }

  getParameters(): InstrumentParameters {
    return { ...this.parameters };
  }

  applyPreset(preset: InstrumentPreset): void {
    if (!preset || !preset.parameters) return;
    Object.entries(preset.parameters).forEach(([key, val]) => {
      if (typeof val === 'number') {
        this.setParameter(key, val);
      }
    });
  }

  dispose(): void {
    try {
      if (this.channel && typeof this.channel.dispose === 'function') {
        this.channel.dispose();
      }
    } catch {
      /* ignore disposal edge cases */
    }
  }
}
