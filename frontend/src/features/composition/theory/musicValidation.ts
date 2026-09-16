import { Note } from '../../editor/types/note';

export const validateMidiPitch = (pitch: number): boolean => {
  return Number.isInteger(pitch) && pitch >= 0 && pitch <= 120;
};

export const validateVelocity = (velocity: number): boolean => {
  return Number.isInteger(velocity) && velocity >= 1 && velocity <= 127;
};

export const validateDuration = (durationBeats: number): boolean => {
  return typeof durationBeats === 'number' && durationBeats > 0;
};

export const validateStartBeat = (startBeat: number): boolean => {
  return typeof startBeat === 'number' && startBeat >= 1.0;
};

export const validateNote = (note: Note): boolean => {
  return (
    typeof note.id === 'string' &&
    typeof note.trackId === 'string' &&
    validateMidiPitch(note.pitch) &&
    validateStartBeat(note.startBeat) &&
    validateDuration(note.durationBeats) &&
    validateVelocity(note.velocity)
  );
};

export const filterValidNotes = (notes: Note[]): Note[] => {
  return notes.filter(validateNote);
};
