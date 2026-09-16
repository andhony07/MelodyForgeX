import * as MidiModule from '@tonejs/midi';
import type { Midi } from '@tonejs/midi';
import { Track } from '../../editor/types/studio';
import { Note } from '../../editor/types/note';
import { ParsedMIDISummary, ConvertedMIDIPayload } from '../types/midi';
import { secondsToBeat, midiProgramToInstrumentName } from '../utils/midiConversionUtils';

// Interop for CJS/ESM across Node/tsx and Vite build
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MidiConstructor = (MidiModule.Midi || (MidiModule as any).default?.Midi || (MidiModule as any).default || MidiModule) as unknown as new (data?: ArrayBuffer | ArrayLike<number>) => Midi;

export async function parseMIDIFile(file: File): Promise<{ midi: Midi; summary: ParsedMIDISummary }> {
  const arrayBuffer = await file.arrayBuffer();
  const midi = new MidiConstructor(arrayBuffer);

  const bpm = Math.round(midi.header.tempos[0]?.bpm || 120);
  const timeSig = midi.header.timeSignatures[0]
    ? `${midi.header.timeSignatures[0].timeSignature[0]}/${midi.header.timeSignatures[0].timeSignature[1]}`
    : '4/4';

  let totalNotes = 0;
  const trackSummaries = midi.tracks
    .filter((tr) => tr.notes.length > 0)
    .map((tr, idx) => {
      totalNotes += tr.notes.length;
      const instInfo = midiProgramToInstrumentName(tr.instrument.number);
      return {
        name: tr.name || `Track ${idx + 1}`,
        instrument: instInfo.instrument,
        noteCount: tr.notes.length,
        channel: tr.channel,
      };
    });

  const summary: ParsedMIDISummary = {
    title: midi.header.name || file.name.replace(/\.mid$/i, ''),
    bpm,
    timeSignature: timeSig,
    trackSummaries,
    totalNotes,
  };

  return { midi, summary };
}

export function convertMIDIToMelodyForge(midi: Midi): ConvertedMIDIPayload {
  const bpm = Math.max(20, Math.min(300, Math.round(midi.header.tempos[0]?.bpm || 120)));
  const tracks: Track[] = [];
  const notesByTrackId: Record<string, Note[]> = {};

  const activeTracks = midi.tracks.filter((tr) => tr.notes.length > 0);

  activeTracks.forEach((midiTrack, idx) => {
    const instInfo = midiProgramToInstrumentName(midiTrack.instrument.number);
    const trackId = `imported-midi-${idx}-${Date.now()}`;
    
    const track: Track = {
      id: trackId,
      name: midiTrack.name || `MIDI ${instInfo.instrument} ${idx + 1}`,
      instrument: instInfo.instrument,
      iconName: instInfo.iconName,
      muted: false,
      solo: false,
      volume: 80,
      color: instInfo.color,
      channel: idx + 1,
    };

    tracks.push(track);

    const notes: Note[] = midiTrack.notes.map((n, noteIdx) => {
      const startBeat = Math.max(1.0, secondsToBeat(n.time, bpm));
      const durationBeats = Math.max(0.25, Math.round(n.duration * (bpm / 60.0) * 4) / 4);
      const velocity = Math.max(1, Math.min(127, Math.round((n.velocity || 0.7) * 127)));

      return {
        id: `note-midi-${idx}-${noteIdx}-${Date.now()}`,
        trackId,
        pitch: n.midi,
        startBeat: Math.round(startBeat * 100) / 100,
        durationBeats,
        velocity,
      };
    });

    notesByTrackId[trackId] = notes;
  });

  return {
    tracks,
    notesByTrackId,
    tempo: bpm,
  };
}
