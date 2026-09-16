import { Note, SnapValue } from '../types/note';

export const MIN_MIDI_PITCH = 36; // C2
export const MAX_MIDI_PITCH = 96; // C7

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const midiToNoteName = (pitch: number): string => {
  const noteIndex = pitch % 12;
  const octave = Math.floor(pitch / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
};

export const isBlackKey = (pitch: number): boolean => {
  const noteIndex = pitch % 12;
  return [1, 3, 6, 8, 10].includes(noteIndex);
};

export const snapBeat = (beat: number, snap: SnapValue): number => {
  let division = 1;
  switch (snap) {
    case '1/1':
      division = 4;
      break;
    case '1/2':
      division = 2;
      break;
    case '1/4':
      division = 1;
      break;
    case '1/8':
      division = 0.5;
      break;
    case '1/16':
      division = 0.25;
      break;
    case '1/32':
      division = 0.125;
      break;
  }
  // Snap beat position starting from beat 1.0
  const beatOffset = beat - 1.0;
  const snappedOffset = Math.round(beatOffset / division) * division;
  return Math.max(1.0, 1.0 + snappedOffset);
};

// Generate list of pitches from MAX_MIDI_PITCH down to MIN_MIDI_PITCH
export const PITCH_LIST: number[] = Array.from(
  { length: MAX_MIDI_PITCH - MIN_MIDI_PITCH + 1 },
  (_, i) => MAX_MIDI_PITCH - i
);

export const INITIAL_DEMO_NOTES: Record<string, Note[]> = {
  'track-1': [
    { id: 'n1', trackId: 'track-1', pitch: 60, startBeat: 1.0, durationBeats: 1.0, velocity: 100 }, // C4
    { id: 'n2', trackId: 'track-1', pitch: 64, startBeat: 2.0, durationBeats: 1.0, velocity: 95 },  // E4
    { id: 'n3', trackId: 'track-1', pitch: 67, startBeat: 3.0, durationBeats: 1.0, velocity: 105 }, // G4
    { id: 'n4', trackId: 'track-1', pitch: 72, startBeat: 4.0, durationBeats: 2.0, velocity: 110 }, // C5
  ],
  'track-2': [
    { id: 'n5', trackId: 'track-2', pitch: 48, startBeat: 1.0, durationBeats: 2.0, velocity: 85 },  // C3
    { id: 'n6', trackId: 'track-2', pitch: 52, startBeat: 3.0, durationBeats: 2.0, velocity: 90 },  // E3
  ],
  'track-3': [
    { id: 'n7', trackId: 'track-3', pitch: 36, startBeat: 1.0, durationBeats: 1.0, velocity: 110 }, // C2
    { id: 'n8', trackId: 'track-3', pitch: 36, startBeat: 2.0, durationBeats: 1.0, velocity: 90 },  // C2
    { id: 'n9', trackId: 'track-3', pitch: 43, startBeat: 3.0, durationBeats: 2.0, velocity: 105 }, // G2
  ],
};
