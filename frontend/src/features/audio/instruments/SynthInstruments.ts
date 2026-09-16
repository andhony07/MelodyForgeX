import * as Tone from 'tone';
import { Instrument } from '../types/audio';
import { midiToNoteName } from '../../editor/constants/note';

// Helper to convert volume percentage (0 - 100) to decibels (-40dB to +6dB)
const volumeToDb = (volumePercent: number): number => {
  if (volumePercent <= 0) return -Infinity;
  if (volumePercent >= 100) return 6;
  // Logarithmic volume curve mapping
  return -40 + (volumePercent / 100) * 46;
};

export class BaseSynthInstrument implements Instrument {
  protected channel: Tone.Channel;
  protected synth: Tone.PolySynth | Tone.MonoSynth;

  constructor(synth: Tone.PolySynth | Tone.MonoSynth, initialVolume = 80) {
    this.channel = new Tone.Channel({
      volume: volumeToDb(initialVolume),
      mute: false,
      solo: false,
    }).toDestination();

    this.synth = synth;
    this.synth.connect(this.channel);
  }

  async initialize(): Promise<void> {
    // Synth initialization ready
  }

  playNote(pitch: number, durationBeats: number, velocity: number, time?: number): void {
    const noteName = midiToNoteName(pitch);
    const normVel = Math.max(0.01, Math.min(1.0, velocity / 127));

    // Convert durationBeats to Tone.js Musical Time notation (e.g. 1 beat = "4n", 2 beats = "2n")
    const durationSeconds = (durationBeats * (60 / Tone.Transport.bpm.value));

    const triggerTime = time !== undefined ? time : Tone.now();
    try {
      this.synth.triggerAttackRelease(noteName, durationSeconds, triggerTime, normVel);
    } catch {
      // Ignore synth scheduling edge cases
    }
  }

  previewNote(pitch: number, durationBeats = 0.5, velocity = 100): void {
    const noteName = midiToNoteName(pitch);
    const normVel = Math.max(0.01, Math.min(1.0, velocity / 127));
    const durationSeconds = (durationBeats * (60 / Tone.Transport.bpm.value));
    try {
      this.synth.triggerAttackRelease(noteName, durationSeconds, Tone.now(), normVel);
    } catch {
      // Ignore preview edge cases
    }
  }

  setVolume(volumePercent: number): void {
    this.channel.volume.value = volumeToDb(volumePercent);
  }

  setMute(muted: boolean): void {
    this.channel.mute = muted;
  }

  setSolo(solo: boolean): void {
    this.channel.solo = solo;
  }

  setPan(pan: number): void {
    const clampedPan = Math.max(-1, Math.min(1, pan));
    this.channel.pan.value = clampedPan;
  }

  dispose(): void {
    try {
      this.synth.dispose();
      this.channel.dispose();
    } catch {
      // Ignore disposal errors
    }
  }
}

export class PianoInstrument extends BaseSynthInstrument {
  constructor(initialVolume = 85) {
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.005, decay: 1.2, sustain: 0.3, release: 1.0 },
    });
    super(synth, initialVolume);
  }
}

export class GuitarInstrument extends BaseSynthInstrument {
  constructor(initialVolume = 75) {
    const synth = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 2,
      modulationIndex: 3,
      envelope: { attack: 0.01, decay: 0.8, sustain: 0.2, release: 0.8 },
    });
    super(synth, initialVolume);
  }
}

export class BassInstrument extends BaseSynthInstrument {
  constructor(initialVolume = 80) {
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.4, sustain: 0.5, release: 0.4 },
    });
    super(synth, initialVolume);
  }
}

export class SynthInstrument extends BaseSynthInstrument {
  constructor(initialVolume = 80) {
    const synth = new Tone.PolySynth(Tone.AMSynth, {
      harmonicity: 1.5,
      envelope: { attack: 0.02, decay: 0.5, sustain: 0.6, release: 0.6 },
    });
    super(synth, initialVolume);
  }
}

export class DrumInstrument implements Instrument {
  private channel: Tone.Channel;
  private kick: Tone.MembraneSynth;
  private snare: Tone.PolySynth;
  private hihat: Tone.NoiseSynth;

  constructor(initialVolume = 90) {
    this.channel = new Tone.Channel({
      volume: volumeToDb(initialVolume),
      mute: false,
      solo: false,
    }).toDestination();

    this.kick = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 4 }).connect(this.channel);
    this.snare = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 0.2 },
    }).connect(this.channel);
    this.hihat = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
    }).connect(this.channel);
  }

  async initialize(): Promise<void> {}

  playNote(pitch: number, _durationBeats: number, velocity: number, time?: number): void {
    const normVel = Math.max(0.01, Math.min(1.0, velocity / 127));
    const triggerTime = time !== undefined ? time : Tone.now();

    // Map MIDI pitches to drum sounds:
    // pitch < 40 -> Kick (e.g. C2)
    // 40 <= pitch < 55 -> Snare / Tom (e.g. E2)
    // pitch >= 55 -> Hi-Hat (e.g. G2+)
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
      // Ignore percussion scheduling edge cases
    }
  }

  previewNote(pitch: number, _durationBeats = 0.5, velocity = 100): void {
    this.playNote(pitch, _durationBeats, velocity, Tone.now());
  }

  setVolume(volumePercent: number): void {
    this.channel.volume.value = volumeToDb(volumePercent);
  }

  setMute(muted: boolean): void {
    this.channel.mute = muted;
  }

  setSolo(solo: boolean): void {
    this.channel.solo = solo;
  }

  setPan(pan: number): void {
    const clampedPan = Math.max(-1, Math.min(1, pan));
    this.channel.pan.value = clampedPan;
  }

  dispose(): void {
    try {
      this.kick.dispose();
      this.snare.dispose();
      this.hihat.dispose();
      this.channel.dispose();
    } catch {
      // Ignore disposal errors
    }
  }
}
