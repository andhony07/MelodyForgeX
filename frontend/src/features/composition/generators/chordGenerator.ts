import { Note } from '../../editor/types/note';
import { ProgressionTemplate, ProgressionChord } from '../types/progression';
import { buildChord } from '../theory/chordUtils';
import { keyNameToMidiRoot } from '../theory/midiUtils';
import { filterValidNotes } from '../theory/musicValidation';

import { MusicalKey } from '../../editor/types/studio';

export interface ChordGeneratorOptions {
  trackId: string;
  progression: ProgressionTemplate | ProgressionChord[];
  octaveOffset?: number; // default -1 for middle keyboard/chords
  velocity?: number; // default 90
  inversion?: number; // default 0
}

export const generateChordNotes = (options: ChordGeneratorOptions): Note[] => {
  const { trackId, progression, octaveOffset = -1, velocity = 90, inversion = 0 } = options;

  const chordsList: ProgressionChord[] = Array.isArray(progression)
    ? progression
    : progression.chords;

  const generatedNotes: Note[] = [];

  chordsList.forEach((chordItem, index) => {
    const rootMidi = keyNameToMidiRoot(chordItem.root as MusicalKey, 4);
    const chordPitches = buildChord(rootMidi, chordItem.quality, inversion, octaveOffset);

    chordPitches.forEach((pitch, pitchIdx) => {
      generatedNotes.push({
        id: `gen-chord-${index}-${pitchIdx}-${Date.now()}`,
        trackId,
        pitch,
        startBeat: chordItem.startBeat,
        durationBeats: chordItem.durationBeats,
        velocity,
      });
    });
  });

  return filterValidNotes(generatedNotes);
};
