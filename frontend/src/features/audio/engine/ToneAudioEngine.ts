import * as Tone from 'tone';
import { Instrument } from '../types/instrument';
import { Track } from '../../editor/types/studio';
import { Note } from '../../editor/types/note';
import { InstrumentRegistry } from '../instruments/InstrumentRegistry';
import { InstrumentFactory } from '../instruments/InstrumentFactory';
import { PresetManager } from '../presets/PresetManager';
import { useArrangementStore } from '../../arrangement/stores/useArrangementStore';
import { isTrackEnabledInSection } from '../../arrangement/utils/arrangementUtils';

export class ToneAudioEngine {
  private static instance: ToneAudioEngine | null = null;

  private isStarted = false;
  private instruments: Map<string, Instrument> = new Map();
  private instrumentIdsByTrack: Map<string, string> = new Map();
  private presetIdsByTrack: Map<string, string> = new Map();
  private scheduledEvents: number[] = [];
  private baseTempo = 120;
  private automationLoopId: number | null = null;

  private constructor() {
    Tone.Transport.bpm.value = 120;
  }

  public static getInstance(): ToneAudioEngine {
    if (!ToneAudioEngine.instance) {
      ToneAudioEngine.instance = new ToneAudioEngine();
    }
    return ToneAudioEngine.instance;
  }

  public async ensureStarted(): Promise<void> {
    if (!this.isStarted) {
      await Tone.start();
      this.isStarted = true;
    }
  }

  public getInstrumentForTrack(track: Track): Instrument {
    const existingInst = this.instruments.get(track.id);
    const prevInstrumentId = this.instrumentIdsByTrack.get(track.id);
    const prevPresetId = this.presetIdsByTrack.get(track.id);

    const targetInstrumentId = track.instrument;
    const targetPresetId = track.presetId;

    // Determine if instrument instance needs to be created or replaced
    if (!existingInst || prevInstrumentId !== targetInstrumentId) {
      // 1. Dispose old instrument safely if exists
      if (existingInst) {
        try {
          existingInst.dispose();
        } catch {
          // ignore disposal error
        }
      }

      // 2. Instantiate new instrument from registry
      const registry = InstrumentRegistry.getInstance();
      const inst = registry.getInstrument(targetInstrumentId, track.volume);

      // 3. Apply preset or custom parameters if present
      if (targetPresetId) {
        const preset = PresetManager.getInstance().getPreset(targetPresetId);
        if (preset) {
          InstrumentFactory.applyPresetToInstrument(inst, preset);
        }
      }
      if (track.customParameters) {
        InstrumentFactory.applyParametersToInstrument(inst, track.customParameters);
      }

      inst.setMute(track.muted);
      inst.setSolo(track.solo);

      this.instruments.set(track.id, inst);
      this.instrumentIdsByTrack.set(track.id, targetInstrumentId);
      if (targetPresetId) {
        this.presetIdsByTrack.set(track.id, targetPresetId);
      }
      return inst;
    }

    // Instrument already exists: check if preset or parameters updated
    if (targetPresetId && targetPresetId !== prevPresetId) {
      const preset = PresetManager.getInstance().getPreset(targetPresetId);
      if (preset) {
        InstrumentFactory.applyPresetToInstrument(existingInst, preset);
      }
      this.presetIdsByTrack.set(track.id, targetPresetId);
    }

    if (track.customParameters) {
      InstrumentFactory.applyParametersToInstrument(existingInst, track.customParameters);
    }

    existingInst.setVolume(track.volume);
    existingInst.setMute(track.muted);
    existingInst.setSolo(track.solo);

    return existingInst;
  }

  public updateTrackControls(tracks: Track[]): void {
    tracks.forEach((track) => {
      this.getInstrumentForTrack(track);
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

    // 3. Schedule all notes on Tone.Transport with section track activation & transition awareness
    tracks.forEach((track) => {
      const inst = this.getInstrumentForTrack(track);
      const notes = notesByTrackId[track.id] || [];

      notes.forEach((note) => {
        const beatOffset = note.startBeat - 1.0;
        const seconds = beatOffset * (60 / Tone.Transport.bpm.value);

        const eventId = Tone.Transport.schedule((time) => {
          const currentArrangement = useArrangementStore.getState();
          const activeSec = currentArrangement.getActiveSectionAtBeat(note.startBeat);

          // Check section-level track activation
          if (!isTrackEnabledInSection(activeSec, track.id)) {
            return; // Skip playback if disabled in active section
          }

          // Evaluate track volume & pan automation at note start beat
          let vol = track.volume;
          const volAuto = currentArrangement.evaluateAutomation('track', track.id, 'volume', note.startBeat, -1);
          if (volAuto >= 0) {
            vol = volAuto * 100;
          }

          const panAuto = currentArrangement.evaluateAutomation('track', track.id, 'pan', note.startBeat, 0);
          if (inst.setPan) {
            inst.setPan(panAuto);
          }

          // Transition volume fading if crossfade/fade enabled
          if (activeSec && activeSec.transitionType && activeSec.transitionType !== 'immediate') {
            const secStartBeat = (activeSec.startBar - 1) * 4 + 1;
            const secEndBeat = secStartBeat + activeSec.lengthBars * 4;
            const fadeDurBeats = (activeSec.fadeDuration ?? 0.5) * (Tone.Transport.bpm.value / 60);

            if (note.startBeat < secStartBeat + fadeDurBeats) {
              const fadeInFactor = (note.startBeat - secStartBeat) / Math.max(0.1, fadeDurBeats);
              vol = vol * Math.min(1.0, Math.max(0.1, fadeInFactor));
            } else if (note.startBeat > secEndBeat - fadeDurBeats) {
              const fadeOutFactor = (secEndBeat - note.startBeat) / Math.max(0.1, fadeDurBeats);
              vol = vol * Math.min(1.0, Math.max(0.1, fadeOutFactor));
            }
          }

          inst.setVolume(vol);
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

  private startAutomationLoop(): void {
    if (this.automationLoopId !== null) return;

    // Run periodic tick to update dynamic tempo, volume, and pan automation during playback
    this.automationLoopId = window.setInterval(() => {
      if (Tone.Transport.state !== 'started') return;

      const currentBeat = this.getCurrentBeat();
      const arrangementStore = useArrangementStore.getState();

      // Dynamic Tempo Automation
      const tempoAuto = arrangementStore.evaluateAutomation(
        'arrangement',
        'arrangement',
        'tempo',
        currentBeat,
        -1
      );
      if (tempoAuto >= 20 && tempoAuto <= 300) {
        Tone.Transport.bpm.value = tempoAuto;
      }
    }, 50);
  }

  private stopAutomationLoop(): void {
    if (this.automationLoopId !== null) {
      window.clearInterval(this.automationLoopId);
      this.automationLoopId = null;
    }
  }

  public async play(): Promise<void> {
    await this.ensureStarted();
    if (Tone.Transport.state !== 'started') {
      Tone.Transport.start();
      this.startAutomationLoop();
    }
  }

  public pause(): void {
    if (Tone.Transport.state === 'started') {
      Tone.Transport.pause();
      this.stopAutomationLoop();
    }
  }

  public stop(): void {
    Tone.Transport.stop();
    Tone.Transport.seconds = 0;
    Tone.Transport.bpm.value = this.baseTempo;
    this.stopAutomationLoop();
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
    this.baseTempo = clampedBpm;
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
      const fallbackSynth = InstrumentRegistry.getInstance().getFallbackInstrument(80);
      fallbackSynth.previewNote(pitch, durationBeats, velocity);
    }
  }

  public dispose(): void {
    this.stop();
    this.scheduledEvents.forEach((eventId) => Tone.Transport.clear(eventId));
    this.scheduledEvents = [];
    this.instruments.forEach((inst) => inst.dispose());
    this.instruments.clear();
    this.instrumentIdsByTrack.clear();
    this.presetIdsByTrack.clear();
  }
}
