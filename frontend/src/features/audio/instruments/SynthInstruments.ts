import * as Tone from 'tone';
import { BaseInstrument } from './Instrument';
import { InstrumentCategory } from '../types/instrument';
import { midiToNoteName } from '../../editor/constants/note';

const createMockSynth = <T>() =>
  ({
    connect: () => {},
    triggerAttackRelease: () => {},
    set: () => {},
    dispose: () => {},
  } as unknown as T);

// 1. Acoustic Piano Synth
export class AcousticPianoSynth extends BaseInstrument {
  public readonly id = 'acoustic-piano';
  public readonly name = 'Acoustic Piano';
  public readonly category: InstrumentCategory = 'Piano';

  protected synth: Tone.PolySynth<Tone.Synth>;

  constructor(initialVolume = 85) {
    super(initialVolume);
    try {
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.005, decay: 1.2, sustain: 0.3, release: 1.0 },
      });
      this.synth.connect(this.channel);
    } catch {
      this.synth = createMockSynth<Tone.PolySynth<Tone.Synth>>();
    }
  }

  playNote(pitch: number, durationBeats: number, velocity: number, time?: number): void {
    const noteName = midiToNoteName(pitch);
    const normVel = Math.max(0.01, Math.min(1.0, velocity / 127));
    const durationSeconds = durationBeats * (60 / Tone.Transport.bpm.value);
    const triggerTime = time !== undefined ? time : Tone.now();
    try {
      this.synth.triggerAttackRelease(noteName, durationSeconds, triggerTime, normVel);
    } catch {
      /* ignore scheduling edge cases */
    }
  }

  previewNote(pitch: number, durationBeats = 0.5, velocity = 100): void {
    this.playNote(pitch, durationBeats, velocity, Tone.now());
  }

  setParameter(name: string, value: number): void {
    super.setParameter(name, value);
    if (name === 'attack' || name === 'decay' || name === 'sustain' || name === 'release') {
      try {
        this.synth.set({ envelope: { [name]: value } });
      } catch {
        /* ignore parameter update error */
      }
    }
  }

  dispose(): void {
    try {
      this.synth.dispose();
    } catch {
      /* ignore disposal error */
    }
    super.dispose();
  }
}

// 2. Electric Piano Synth (FM synthesis tone)
export class ElectricPianoSynth extends BaseInstrument {
  public readonly id = 'electric-piano';
  public readonly name = 'Electric Piano';
  public readonly category: InstrumentCategory = 'Keys';

  protected synth: Tone.PolySynth<Tone.FMSynth>;

  constructor(initialVolume = 80) {
    super(initialVolume);
    try {
      this.synth = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 3,
        modulationIndex: 2,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 1.2, sustain: 0.5, release: 0.8 },
        modulation: { type: 'triangle' },
        modulationEnvelope: { attack: 0.002, decay: 0.2, sustain: 0.1, release: 0.2 },
      });
      this.synth.connect(this.channel);
    } catch {
      this.synth = createMockSynth<Tone.PolySynth<Tone.FMSynth>>();
    }
  }

  playNote(pitch: number, durationBeats: number, velocity: number, time?: number): void {
    const noteName = midiToNoteName(pitch);
    const normVel = Math.max(0.01, Math.min(1.0, velocity / 127));
    const durationSeconds = durationBeats * (60 / Tone.Transport.bpm.value);
    const triggerTime = time !== undefined ? time : Tone.now();
    try {
      this.synth.triggerAttackRelease(noteName, durationSeconds, triggerTime, normVel);
    } catch {
      /* ignore scheduling edge cases */
    }
  }

  previewNote(pitch: number, durationBeats = 0.5, velocity = 100): void {
    this.playNote(pitch, durationBeats, velocity, Tone.now());
  }

  setParameter(name: string, value: number): void {
    super.setParameter(name, value);
    if (name === 'attack' || name === 'decay' || name === 'sustain' || name === 'release') {
      try {
        this.synth.set({ envelope: { [name]: value } });
      } catch {
        /* ignore parameter update error */
      }
    }
  }

  dispose(): void {
    try {
      this.synth.dispose();
    } catch {
      /* ignore disposal error */
    }
    super.dispose();
  }
}

// 3. Guitar Synth (FM plucked string texture)
export class GuitarSynth extends BaseInstrument {
  public readonly id = 'guitar';
  public readonly name = 'Guitar';
  public readonly category: InstrumentCategory = 'Guitar';

  protected synth: Tone.PolySynth<Tone.FMSynth>;

  constructor(initialVolume = 75) {
    super(initialVolume);
    try {
      this.synth = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 2,
        modulationIndex: 3.5,
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.01, decay: 0.8, sustain: 0.2, release: 0.8 },
      });
      this.synth.connect(this.channel);
    } catch {
      this.synth = createMockSynth<Tone.PolySynth<Tone.FMSynth>>();
    }
  }

  playNote(pitch: number, durationBeats: number, velocity: number, time?: number): void {
    const noteName = midiToNoteName(pitch);
    const normVel = Math.max(0.01, Math.min(1.0, velocity / 127));
    const durationSeconds = durationBeats * (60 / Tone.Transport.bpm.value);
    const triggerTime = time !== undefined ? time : Tone.now();
    try {
      this.synth.triggerAttackRelease(noteName, durationSeconds, triggerTime, normVel);
    } catch {
      /* ignore scheduling edge cases */
    }
  }

  previewNote(pitch: number, durationBeats = 0.5, velocity = 100): void {
    this.playNote(pitch, durationBeats, velocity, Tone.now());
  }

  setParameter(name: string, value: number): void {
    super.setParameter(name, value);
    if (name === 'attack' || name === 'decay' || name === 'sustain' || name === 'release') {
      try {
        this.synth.set({ envelope: { [name]: value } });
      } catch {
        /* ignore parameter update error */
      }
    }
  }

  dispose(): void {
    try {
      this.synth.dispose();
    } catch {
      /* ignore disposal error */
    }
    super.dispose();
  }
}

// 4. Bass Synth (Punchy lowpass sawtooth synth)
export class BassSynth extends BaseInstrument {
  public readonly id = 'bass';
  public readonly name = 'Bass';
  public readonly category: InstrumentCategory = 'Bass';

  protected synth: Tone.PolySynth<Tone.Synth>;

  constructor(initialVolume = 80) {
    super(initialVolume);
    try {
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.01, decay: 0.4, sustain: 0.6, release: 0.4 },
      });
      this.synth.connect(this.channel);
    } catch {
      this.synth = createMockSynth<Tone.PolySynth<Tone.Synth>>();
    }
  }

  playNote(pitch: number, durationBeats: number, velocity: number, time?: number): void {
    const noteName = midiToNoteName(pitch);
    const normVel = Math.max(0.01, Math.min(1.0, velocity / 127));
    const durationSeconds = durationBeats * (60 / Tone.Transport.bpm.value);
    const triggerTime = time !== undefined ? time : Tone.now();
    try {
      this.synth.triggerAttackRelease(noteName, durationSeconds, triggerTime, normVel);
    } catch {
      /* ignore scheduling edge cases */
    }
  }

  previewNote(pitch: number, durationBeats = 0.5, velocity = 100): void {
    this.playNote(pitch, durationBeats, velocity, Tone.now());
  }

  setParameter(name: string, value: number): void {
    super.setParameter(name, value);
    if (name === 'attack' || name === 'decay' || name === 'sustain' || name === 'release') {
      try {
        this.synth.set({ envelope: { [name]: value } });
      } catch {
        /* ignore parameter update error */
      }
    }
  }

  dispose(): void {
    try {
      this.synth.dispose();
    } catch {
      /* ignore disposal error */
    }
    super.dispose();
  }
}

// 5. Synth Lead (Bright solo synth lead)
export class SynthLead extends BaseInstrument {
  public readonly id = 'synth-lead';
  public readonly name = 'Synth Lead';
  public readonly category: InstrumentCategory = 'Lead';

  protected synth: Tone.PolySynth<Tone.Synth>;

  constructor(initialVolume = 80) {
    super(initialVolume);
    try {
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'square' },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.8, release: 0.4 },
      });
      this.synth.connect(this.channel);
    } catch {
      this.synth = createMockSynth<Tone.PolySynth<Tone.Synth>>();
    }
  }

  playNote(pitch: number, durationBeats: number, velocity: number, time?: number): void {
    const noteName = midiToNoteName(pitch);
    const normVel = Math.max(0.01, Math.min(1.0, velocity / 127));
    const durationSeconds = durationBeats * (60 / Tone.Transport.bpm.value);
    const triggerTime = time !== undefined ? time : Tone.now();
    try {
      this.synth.triggerAttackRelease(noteName, durationSeconds, triggerTime, normVel);
    } catch {
      /* ignore scheduling edge cases */
    }
  }

  previewNote(pitch: number, durationBeats = 0.5, velocity = 100): void {
    this.playNote(pitch, durationBeats, velocity, Tone.now());
  }

  setParameter(name: string, value: number): void {
    super.setParameter(name, value);
    if (name === 'attack' || name === 'decay' || name === 'sustain' || name === 'release') {
      try {
        this.synth.set({ envelope: { [name]: value } });
      } catch {
        /* ignore parameter update error */
      }
    }
  }

  dispose(): void {
    try {
      this.synth.dispose();
    } catch {
      /* ignore disposal error */
    }
    super.dispose();
  }
}

// 6. Synth Pad (Warm atmospheric poly synth pad)
export class SynthPad extends BaseInstrument {
  public readonly id = 'synth-pad';
  public readonly name = 'Synth Pad';
  public readonly category: InstrumentCategory = 'Pad';

  protected synth: Tone.PolySynth<Tone.AMSynth>;

  constructor(initialVolume = 80) {
    super(initialVolume);
    try {
      this.synth = new Tone.PolySynth(Tone.AMSynth, {
        harmonicity: 1.5,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.4, decay: 1.5, sustain: 0.9, release: 1.8 },
        modulation: { type: 'triangle' },
        modulationEnvelope: { attack: 0.3, decay: 1.0, sustain: 0.8, release: 1.5 },
      });
      this.synth.connect(this.channel);
    } catch {
      this.synth = createMockSynth<Tone.PolySynth<Tone.AMSynth>>();
    }
  }

  playNote(pitch: number, durationBeats: number, velocity: number, time?: number): void {
    const noteName = midiToNoteName(pitch);
    const normVel = Math.max(0.01, Math.min(1.0, velocity / 127));
    const durationSeconds = durationBeats * (60 / Tone.Transport.bpm.value);
    const triggerTime = time !== undefined ? time : Tone.now();
    try {
      this.synth.triggerAttackRelease(noteName, durationSeconds, triggerTime, normVel);
    } catch {
      /* ignore scheduling edge cases */
    }
  }

  previewNote(pitch: number, durationBeats = 0.5, velocity = 100): void {
    this.playNote(pitch, durationBeats, velocity, Tone.now());
  }

  setParameter(name: string, value: number): void {
    super.setParameter(name, value);
    if (name === 'attack' || name === 'decay' || name === 'sustain' || name === 'release') {
      try {
        this.synth.set({ envelope: { [name]: value } });
      } catch {
        /* ignore parameter update error */
      }
    }
  }

  dispose(): void {
    try {
      this.synth.dispose();
    } catch {
      /* ignore disposal error */
    }
    super.dispose();
  }
}

// 7. Strings Synth (Polyphonic string ensemble)
export class StringsSynth extends BaseInstrument {
  public readonly id = 'strings';
  public readonly name = 'Strings Ensemble';
  public readonly category: InstrumentCategory = 'Strings';

  protected synth: Tone.PolySynth<Tone.Synth>;

  constructor(initialVolume = 82) {
    super(initialVolume);
    try {
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.25, decay: 1.5, sustain: 0.85, release: 1.5 },
      });
      this.synth.connect(this.channel);
    } catch {
      this.synth = createMockSynth<Tone.PolySynth<Tone.Synth>>();
    }
  }

  playNote(pitch: number, durationBeats: number, velocity: number, time?: number): void {
    const noteName = midiToNoteName(pitch);
    const normVel = Math.max(0.01, Math.min(1.0, velocity / 127));
    const durationSeconds = durationBeats * (60 / Tone.Transport.bpm.value);
    const triggerTime = time !== undefined ? time : Tone.now();
    try {
      this.synth.triggerAttackRelease(noteName, durationSeconds, triggerTime, normVel);
    } catch {
      /* ignore scheduling edge cases */
    }
  }

  previewNote(pitch: number, durationBeats = 0.5, velocity = 100): void {
    this.playNote(pitch, durationBeats, velocity, Tone.now());
  }

  setParameter(name: string, value: number): void {
    super.setParameter(name, value);
    if (name === 'attack' || name === 'decay' || name === 'sustain' || name === 'release') {
      try {
        this.synth.set({ envelope: { [name]: value } });
      } catch {
        /* ignore parameter update error */
      }
    }
  }

  dispose(): void {
    try {
      this.synth.dispose();
    } catch {
      /* ignore disposal error */
    }
    super.dispose();
  }
}

// 8. Pluck Synth (Percussive short-decay pluck)
export class PluckSynth extends BaseInstrument {
  public readonly id = 'pluck';
  public readonly name = 'Digital Pluck';
  public readonly category: InstrumentCategory = 'Synth';

  protected synth: Tone.PolySynth<Tone.Synth>;

  constructor(initialVolume = 80) {
    super(initialVolume);
    try {
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.001, decay: 0.25, sustain: 0.0, release: 0.2 },
      });
      this.synth.connect(this.channel);
    } catch {
      this.synth = createMockSynth<Tone.PolySynth<Tone.Synth>>();
    }
  }

  playNote(pitch: number, durationBeats: number, velocity: number, time?: number): void {
    const noteName = midiToNoteName(pitch);
    const normVel = Math.max(0.01, Math.min(1.0, velocity / 127));
    const durationSeconds = durationBeats * (60 / Tone.Transport.bpm.value);
    const triggerTime = time !== undefined ? time : Tone.now();
    try {
      this.synth.triggerAttackRelease(noteName, durationSeconds, triggerTime, normVel);
    } catch {
      /* ignore scheduling edge cases */
    }
  }

  previewNote(pitch: number, durationBeats = 0.5, velocity = 100): void {
    this.playNote(pitch, durationBeats, velocity, Tone.now());
  }

  setParameter(name: string, value: number): void {
    super.setParameter(name, value);
    if (name === 'attack' || name === 'decay' || name === 'sustain' || name === 'release') {
      try {
        this.synth.set({ envelope: { [name]: value } });
      } catch {
        /* ignore parameter update error */
      }
    }
  }

  dispose(): void {
    try {
      this.synth.dispose();
    } catch {
      /* ignore disposal error */
    }
    super.dispose();
  }
}

// 9. Drum Kit Synth (Multi-element percussive kit)
export class DrumKitSynth extends BaseInstrument {
  public readonly id = 'drum-kit';
  public readonly name = 'Drum Kit';
  public readonly category: InstrumentCategory = 'Drums';

  private kick: Tone.MembraneSynth;
  private snare: Tone.PolySynth<Tone.Synth>;
  private hihat: Tone.NoiseSynth;

  constructor(initialVolume = 90) {
    super(initialVolume);

    try {
      this.kick = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 4 });
      this.snare = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 0.2 },
      });
      this.hihat = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
      });

      this.kick.connect(this.channel);
      this.snare.connect(this.channel);
      this.hihat.connect(this.channel);
    } catch {
      this.kick = createMockSynth<Tone.MembraneSynth>();
      this.snare = createMockSynth<Tone.PolySynth<Tone.Synth>>();
      this.hihat = createMockSynth<Tone.NoiseSynth>();
    }
  }

  playNote(pitch: number, _durationBeats: number, velocity: number, time?: number): void {
    const normVel = Math.max(0.01, Math.min(1.0, velocity / 127));
    const triggerTime = time !== undefined ? time : Tone.now();

    try {
      if (pitch < 40) {
        this.kick.triggerAttackRelease('C1', '8n', triggerTime, normVel);
      } else if (pitch < 55) {
        const noteName = midiToNoteName(pitch);
        this.snare.triggerAttackRelease(noteName, '16n', triggerTime, normVel);
      } else {
        this.hihat.triggerAttackRelease('16n', triggerTime, normVel);
      }
    } catch {
      /* ignore scheduling edge cases */
    }
  }

  previewNote(pitch: number, _durationBeats = 0.5, velocity = 100): void {
    this.playNote(pitch, _durationBeats, velocity, Tone.now());
  }

  dispose(): void {
    try {
      this.kick.dispose();
      this.snare.dispose();
      this.hihat.dispose();
    } catch {
      /* ignore disposal error */
    }
    super.dispose();
  }
}

// Legacy Phase 4 Instrument Class Aliases for complete backward compatibility:
export class PianoInstrument extends AcousticPianoSynth {}
export class GuitarInstrument extends GuitarSynth {}
export class BassInstrument extends BassSynth {}
export class SynthInstrument extends SynthLead {}
export class DrumInstrument extends DrumKitSynth {}
