import * as Tone from 'tone';
import { Instrument } from '../types/audio';
import { Track } from '../../editor/types/studio';
import { Note } from '../../editor/types/note';
import {
  PianoInstrument,
  GuitarInstrument,
  BassInstrument,
  SynthInstrument,
  DrumInstrument,
} from '../instruments/SynthInstruments';

export class ToneAudioEngine {
  private static instance: ToneAudioEngine | null = null;

  private isStarted = false;
  private instruments: Map<string, Instrument> = new Map();
  private scheduledEvents: number[] = [];

  private constructor() {
    Tone.Transport.bpm.value = 120;
  }

  public static getInstance(): ToneAudioEngine {
    if (!ToneAudioEngine.instance) {
      ToneAudioEngine.instance = new ToneAudioEngine();
    }
    return ToneAudioEngine.instance;
  }

  // Must be called on user interaction (Play button, note click, space key)
  public async ensureStarted(): Promise<void> {
    if (!this.isStarted) {
      await Tone.start();
      this.isStarted = true;
    }
  }

  public getInstrumentForTrack(track: Track): Instrument {
    let inst = this.instruments.get(track.id);
    if (!inst) {
      const lower = (track.instrument || track.name).toLowerCase();
      if (lower.includes('piano')) {
        inst = new PianoInstrument(track.volume);
      } else if (lower.includes('guitar')) {
        inst = new GuitarInstrument(track.volume);
      } else if (lower.includes('bass')) {
        inst = new BassInstrument(track.volume);
      } else if (lower.includes('drum')) {
        inst = new DrumInstrument(track.volume);
      } else {
        inst = new SynthInstrument(track.volume);
      }

      inst.setMute(track.muted);
      inst.setSolo(track.solo);
      this.instruments.set(track.id, inst);
    }
    return inst;
  }

  public updateTrackControls(tracks: Track[]): void {
    tracks.forEach((track) => {
      const inst = this.instruments.get(track.id);
      if (inst) {
        inst.setVolume(track.volume);
        inst.setMute(track.muted);
        inst.setSolo(track.solo);
      }
    });
  }

  public syncTracksAndNotes(tracks: Track[], notesByTrackId: Record<string, Note[]>): void {
    // 1. Clear existing transport schedule events
    this.scheduledEvents.forEach((eventId) => {
      Tone.Transport.clear(eventId);
    });
    this.scheduledEvents = [];

    // 2. Ensure instruments exist for all active tracks & update controls
    this.updateTrackControls(tracks);

    // 3. Schedule all notes on Tone.Transport
    tracks.forEach((track) => {
      const inst = this.getInstrumentForTrack(track);
      const notes = notesByTrackId[track.id] || [];

      notes.forEach((note) => {
        // Convert beat position to transport seconds
        // startBeat = 1.0 means 0 seconds into song
        const beatOffset = note.startBeat - 1.0;
        const seconds = beatOffset * (60 / Tone.Transport.bpm.value);

        const eventId = Tone.Transport.schedule((time) => {
          inst.playNote(note.pitch, note.durationBeats, note.velocity, time);
        }, seconds);

        this.scheduledEvents.push(eventId);
      });
    });

    // 4. Calculate total composition length for loop bounds
    let maxBeat = 16.0;
    for (const trackId in notesByTrackId) {
      for (const note of notesByTrackId[trackId]) {
        const noteEnd = note.startBeat + note.durationBeats;
        if (noteEnd > maxBeat) {
          maxBeat = noteEnd;
        }
      }
    }

    const endSeconds = (maxBeat - 1.0) * (60 / Tone.Transport.bpm.value);
    Tone.Transport.loopEnd = endSeconds;
  }

  public async play(): Promise<void> {
    await this.ensureStarted();
    if (Tone.Transport.state !== 'started') {
      Tone.Transport.start();
    }
  }

  public pause(): void {
    if (Tone.Transport.state === 'started') {
      Tone.Transport.pause();
    }
  }

  public stop(): void {
    Tone.Transport.stop();
    Tone.Transport.seconds = 0;
  }

  public seekToBeat(beat: number): void {
    const clampedBeat = Math.max(1.0, beat);
    const seconds = (clampedBeat - 1.0) * (60 / Tone.Transport.bpm.value);
    Tone.Transport.seconds = seconds;
  }

  public getCurrentBeat(): number {
    const bpm = Tone.Transport.bpm.value;
    const currentSeconds = Tone.Transport.seconds;
    const beatsFromZero = currentSeconds * (bpm / 60);
    return 1.0 + beatsFromZero;
  }

  public setTempo(bpm: number): void {
    const clampedBpm = Math.max(20, Math.min(300, bpm));
    Tone.Transport.bpm.value = clampedBpm;
  }

  public setLoop(enabled: boolean, startBeat = 1.0, endBeat?: number): void {
    Tone.Transport.loop = enabled;
    const bpm = Tone.Transport.bpm.value;
    const startSec = Math.max(0, (startBeat - 1.0) * (60 / bpm));
    Tone.Transport.loopStart = startSec;

    if (endBeat !== undefined) {
      const endSec = Math.max(startSec + 0.1, (endBeat - 1.0) * (60 / bpm));
      Tone.Transport.loopEnd = endSec;
    }
  }

  public async previewNote(track: Track | null, pitch: number, durationBeats = 0.5, velocity = 100): Promise<void> {
    await this.ensureStarted();
    if (track) {
      const inst = this.getInstrumentForTrack(track);
      inst.previewNote(pitch, durationBeats, velocity);
    } else {
      // Fallback preview
      const fallbackSynth = new PianoInstrument(80);
      fallbackSynth.previewNote(pitch, durationBeats, velocity);
    }
  }

  public dispose(): void {
    this.stop();
    this.scheduledEvents.forEach((eventId) => Tone.Transport.clear(eventId));
    this.scheduledEvents = [];
    this.instruments.forEach((inst) => inst.dispose());
    this.instruments.clear();
  }
}
