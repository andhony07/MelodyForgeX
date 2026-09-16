import { Note } from '../../editor/types/note';
import { ProgressionTemplate, ProgressionChord } from '../types/progression';
import { buildChord } from '../theory/chordUtils';
import { keyNameToMidiRoot } from '../theory/midiUtils';
import { createSeededRandom } from '../theory/randomUtils';
import { filterValidNotes } from '../theory/musicValidation';
import { MusicalKey } from '../../editor/types/studio';

export type ArpeggioPattern = 'Up' | 'Down' | 'UpDown' | 'Random';

export interface ArpeggioGeneratorOptions {
  trackId: string;
  progression: ProgressionTemplate | ProgressionChord[];
  pattern?: ArpeggioPattern;
  subdivisionBeats?: number; // 0.25 (16th), 0.5 (8th), 1.0 (quarter)
  octaveSpan?: number; // 1 or 2 octaves
  seed?: number | string;
  velocity?: number;
}

export const generateArpeggio = (options: ArpeggioGeneratorOptions): Note[] => {
  const {
    trackId,
    progression,
    pattern = 'Up',
    subdivisionBeats = 0.5,
    octaveSpan = 1,
    seed = 54321,
    velocity = 95,
  } = options;

  const prng = createSeededRandom(seed);
  const chordsList: ProgressionChord[] = Array.isArray(progression)
    ? progression
    : progression.chords;

  const generatedNotes: Note[] = [];

  chordsList.forEach((chordItem) => {
    const rootMidi = keyNameToMidiRoot(chordItem.root as MusicalKey, 4);
    let chordPitches = buildChord(rootMidi, chordItem.quality, 0, 0);

    if (octaveSpan > 1) {
      const upperOctave = chordPitches.map((p) => p + 12);
      chordPitches = [...chordPitches, ...upperOctave];
    }

    const stepsInChord = Math.floor(chordItem.durationBeats / subdivisionBeats);

    for (let step = 0; step < stepsInChord; step++) {
      let pitch: number;

      if (pattern === 'Up') {
        pitch = chordPitches[step % chordPitches.length];
      } else if (pattern === 'Down') {
        pitch = chordPitches[(chordPitches.length - 1 - (step % chordPitches.length))];
      } else if (pattern === 'UpDown') {
        const cycle = chordPitches.length * 2 - 2;
        const modStep = step % Math.max(1, cycle);
        if (modStep < chordPitches.length) {
          pitch = chordPitches[modStep];
        } else {
          pitch = chordPitches[cycle - modStep];
        }
      } else {
        // Random (seeded)
        pitch = prng.choice(chordPitches);
      }

      const noteStart = chordItem.startBeat + step * subdivisionBeats;

      generatedNotes.push({
        id: `gen-arp-${noteStart.toFixed(2)}-${pitch}-${prng.nextInt(10, 99)}`,
        trackId,
        pitch,
        startBeat: noteStart,
        durationBeats: subdivisionBeats,
        velocity,
      });
    }
  });

  return filterValidNotes(generatedNotes);
};
