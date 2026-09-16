import * as MidiModule from '@tonejs/midi';
import type { Midi } from '@tonejs/midi';
import { Track } from '../../editor/types/studio';
import { Note } from '../../editor/types/note';
import { MIDIExportOptions } from '../types/midi';
import { beatToSeconds, pitchToMidi, instrumentNameToMidiProgram } from '../utils/midiConversionUtils';

// Interop for CJS/ESM across Node/tsx and Vite build
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MidiConstructor = (MidiModule.Midi || (MidiModule as any).default?.Midi || (MidiModule as any).default || MidiModule) as unknown as new (data?: ArrayBuffer | ArrayLike<number>) => Midi;

export function createMIDIFileFromProject(
  tracks: Track[],
  notesByTrackId: Record<string, Note[]>,
  tempo = 120,
  options: MIDIExportOptions = {}
): Midi {
  const midi = new MidiConstructor();
  const title = options.filename ? options.filename.replace(/\.mid$/, '') : 'MelodyForge Composition';
  
  midi.header.name = title;
  midi.header.setTempo(tempo);

  const selectedTrackIds = options.selectedTrackIds && options.selectedTrackIds.length > 0
    ? new Set(options.selectedTrackIds)
    : null;

  const targetTracks = selectedTrackIds
    ? tracks.filter((t) => selectedTrackIds.has(t.id))
    : tracks;

  targetTracks.forEach((trackData, idx) => {
    const midiTrack = midi.addTrack();
    midiTrack.name = trackData.name;
    midiTrack.channel = Math.min(15, idx);
    midiTrack.instrument.number = instrumentNameToMidiProgram(trackData.instrument || trackData.name);

    const notes = notesByTrackId[trackData.id] || [];

    notes.forEach((note) => {
      const time = beatToSeconds(note.startBeat, tempo);
      const noteEndSeconds = beatToSeconds(note.startBeat + note.durationBeats, tempo);
      const duration = Math.max(0.01, noteEndSeconds - time);
      const velocity = Math.max(0, Math.min(1, (note.velocity || 90) / 127.0));

      midiTrack.addNote({
        midi: pitchToMidi(note.pitch),
        time,
        duration,
        velocity,
      });
    });
  });

  return midi;
}

export function downloadMIDIFile(
  tracks: Track[],
  notesByTrackId: Record<string, Note[]>,
  tempo = 120,
  options: MIDIExportOptions = {}
): void {
  const midi = createMIDIFileFromProject(tracks, notesByTrackId, tempo, options);
  const arrayBuffer = new Uint8Array(midi.toArray()).buffer;
  const blob = new Blob([arrayBuffer], { type: 'audio/midi' });

  const fileName = options.filename
    ? (options.filename.endsWith('.mid') ? options.filename : `${options.filename}.mid`)
    : 'melodyforge_composition.mid';

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
