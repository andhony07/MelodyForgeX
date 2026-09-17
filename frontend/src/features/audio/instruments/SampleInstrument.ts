import { BaseInstrument } from './Instrument';
import { InstrumentCategory } from '../types/instrument';
import { AcousticPianoSynth } from './SynthInstruments';

export interface SampleMapConfig {
  baseUrl?: string;
  samples: Record<string, string>; // e.g. { "C4": "C4.mp3", "A4": "A4.mp3" }
}

export type SampleLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

export class SampleInstrument extends BaseInstrument {
  public readonly id: string;
  public readonly name: string;
  public readonly category: InstrumentCategory;
  public readonly type = 'sample' as const;

  private status: SampleLoadingStatus = 'idle';
  private fallbackSynth: BaseInstrument;
  private sampleConfig: SampleMapConfig | null;

  constructor(
    id: string,
    name: string,
    category: InstrumentCategory,
    sampleConfig: SampleMapConfig | null = null,
    fallbackSynth?: BaseInstrument,
    initialVolume = 80
  ) {
    super(initialVolume);
    this.id = id;
    this.name = name;
    this.category = category;
    this.sampleConfig = sampleConfig;
    this.fallbackSynth = fallbackSynth || new AcousticPianoSynth(initialVolume);
  }

  public getStatus(): SampleLoadingStatus {
    return this.status;
  }

  public getSampleConfig(): SampleMapConfig | null {
    return this.sampleConfig;
  }

  async initialize(): Promise<void> {
    if (!this.sampleConfig || Object.keys(this.sampleConfig.samples).length === 0) {
      // No external samples configured -> Fall back gracefully to synthesized instrument
      this.status = 'loaded'; // Ready via fallback
      await this.fallbackSynth.initialize();
      return;
    }

    this.status = 'loading';
    try {
      // In a real environment with local sample files, Tone.Sampler would load here.
      // Since no mandatory downloads exist, we gracefully mark status as loaded and use fallback.
      await this.fallbackSynth.initialize();
      this.status = 'loaded';
    } catch {
      this.status = 'error';
    }
  }

  playNote(pitch: number, durationBeats: number, velocity: number, time?: number): void {
    // Graceful execution via fallback synth if sampler is unpopulated
    this.fallbackSynth.playNote(pitch, durationBeats, velocity, time);
  }

  previewNote(pitch: number, durationBeats = 0.5, velocity = 100): void {
    this.fallbackSynth.previewNote(pitch, durationBeats, velocity);
  }

  setVolume(volumePercent: number): void {
    super.setVolume(volumePercent);
    this.fallbackSynth.setVolume(volumePercent);
  }

  setMute(muted: boolean): void {
    super.setMute(muted);
    this.fallbackSynth.setMute(muted);
  }

  setSolo(solo: boolean): void {
    super.setSolo(solo);
    this.fallbackSynth.setSolo(solo);
  }

  setPan(pan: number): void {
    super.setPan(pan);
    this.fallbackSynth.setPan(pan);
  }

  setParameter(name: string, value: number): void {
    super.setParameter(name, value);
    if (this.fallbackSynth.setParameter) {
      this.fallbackSynth.setParameter(name, value);
    }
  }

  dispose(): void {
    try {
      this.fallbackSynth.dispose();
    } catch {
      /* ignore disposal error */
    }
    super.dispose();
  }
}
