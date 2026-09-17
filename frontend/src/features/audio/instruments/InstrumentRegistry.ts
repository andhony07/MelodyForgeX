import { Instrument, InstrumentMetadata } from '../types/instrument';
import {
  AcousticPianoSynth,
  ElectricPianoSynth,
  GuitarSynth,
  BassSynth,
  SynthLead,
  SynthPad,
  StringsSynth,
  PluckSynth,
  DrumKitSynth,
} from './SynthInstruments';
import { validateInstrumentId } from '../utils/instrumentValidation';

export type InstrumentFactoryFn = (initialVolume?: number) => Instrument;

export class InstrumentRegistry {
  private static instance: InstrumentRegistry | null = null;
  private registry: Map<string, { factory: InstrumentFactoryFn; metadata: InstrumentMetadata }> = new Map();

  private constructor() {
    this.registerDefaults();
  }

  public static getInstance(): InstrumentRegistry {
    if (!InstrumentRegistry.instance) {
      InstrumentRegistry.instance = new InstrumentRegistry();
    }
    return InstrumentRegistry.instance;
  }

  private registerDefaults(): void {
    this.register(
      'acoustic-piano',
      (vol) => new AcousticPianoSynth(vol),
      {
        id: 'acoustic-piano',
        name: 'Acoustic Piano',
        category: 'Piano',
        type: 'synth',
        description: 'Rich acoustic grand piano sound with dynamic natural decay.',
        defaultPresetId: 'concert-piano',
      }
    );

    this.register(
      'electric-piano',
      (vol) => new ElectricPianoSynth(vol),
      {
        id: 'electric-piano',
        name: 'Electric Piano',
        category: 'Keys',
        type: 'synth',
        description: 'Warm FM electric piano with soft bell tones.',
        defaultPresetId: 'stage-epiano',
      }
    );

    this.register(
      'guitar',
      (vol) => new GuitarSynth(vol),
      {
        id: 'guitar',
        name: 'Acoustic Guitar',
        category: 'Guitar',
        type: 'synth',
        description: 'Plucked string simulation for acoustic & electric rhythm/lead.',
        defaultPresetId: 'acoustic-guitar-preset',
      }
    );

    this.register(
      'bass',
      (vol) => new BassSynth(vol),
      {
        id: 'bass',
        name: 'Synth Bass',
        category: 'Bass',
        type: 'synth',
        description: 'Punchy lowpass sawtooth synth bass.',
        defaultPresetId: 'electric-bass',
      }
    );

    this.register(
      'synth-lead',
      (vol) => new SynthLead(vol),
      {
        id: 'synth-lead',
        name: 'Synth Lead',
        category: 'Lead',
        type: 'synth',
        description: 'Bright square-wave lead synth for solos and hook lines.',
        defaultPresetId: 'classic-lead',
      }
    );

    this.register(
      'synth-pad',
      (vol) => new SynthPad(vol),
      {
        id: 'synth-pad',
        name: 'Warm Pad',
        category: 'Pad',
        type: 'synth',
        description: 'Lush atmospheric pad synth with slow attack and release.',
        defaultPresetId: 'warm-pad',
      }
    );

    this.register(
      'strings',
      (vol) => new StringsSynth(vol),
      {
        id: 'strings',
        name: 'Strings Ensemble',
        category: 'Strings',
        type: 'synth',
        description: 'Polyphonic string ensemble for cinematic beds.',
        defaultPresetId: 'soft-strings',
      }
    );

    this.register(
      'pluck',
      (vol) => new PluckSynth(vol),
      {
        id: 'pluck',
        name: 'Digital Pluck',
        category: 'Synth',
        type: 'synth',
        description: 'Short percussive pluck for rhythmic arpeggios.',
        defaultPresetId: 'digital-pluck',
      }
    );

    this.register(
      'drum-kit',
      (vol) => new DrumKitSynth(vol),
      {
        id: 'drum-kit',
        name: 'Drum Kit',
        category: 'Drums',
        type: 'synth',
        description: 'Synthesized percussion kit (Kick, Snare, Hi-Hat).',
        defaultPresetId: 'standard-kit',
      }
    );
  }

  public register(id: string, factory: InstrumentFactoryFn, metadata: InstrumentMetadata): void {
    this.registry.set(id.toLowerCase(), { factory, metadata });
  }

  public hasInstrument(id: string): boolean {
    if (!id) return false;
    const validated = validateInstrumentId(id);
    return this.registry.has(validated);
  }

  public getInstrument(id: string, initialVolume = 80): Instrument {
    const validatedId = validateInstrumentId(id);
    const entry = this.registry.get(validatedId);
    if (entry) {
      return entry.factory(initialVolume);
    }
    return this.getFallbackInstrument(initialVolume);
  }

  public getFallbackInstrument(initialVolume = 80): Instrument {
    return new AcousticPianoSynth(initialVolume);
  }

  public getMetadata(id: string): InstrumentMetadata | undefined {
    const validatedId = validateInstrumentId(id);
    return this.registry.get(validatedId)?.metadata;
  }

  public listInstruments(): InstrumentMetadata[] {
    return Array.from(this.registry.values()).map((entry) => entry.metadata);
  }
}
