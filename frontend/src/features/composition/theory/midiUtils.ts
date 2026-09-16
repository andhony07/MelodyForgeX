import { MusicalKey } from '../../editor/types/studio';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const keyNameToMidiRoot = (key: MusicalKey, octave = 4): number => {
  // Strip 'm' if minor e.g. "Am" -> "A"
  const cleanKey = key.replace(/m$/, '');
  const noteIndex = NOTE_NAMES.indexOf(cleanKey);
  if (noteIndex === -1) return 60; // Default C4
  return (octave + 1) * 12 + noteIndex;
};

export const noteNameToMidi = (noteName: string): number => {
  const match = noteName.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return 60;
  const name = match[1];
  const octave = parseInt(match[2], 10);
  const noteIndex = NOTE_NAMES.indexOf(name);
  if (noteIndex === -1) return 60;
  return (octave + 1) * 12 + noteIndex;
};
