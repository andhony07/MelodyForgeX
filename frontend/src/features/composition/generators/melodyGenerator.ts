import { Note } from '../../editor/types/note';
import { MusicalKey } from '../../editor/types/studio';
import { ScaleType } from '../types/scale';
import { createSeededRandom } from '../theory/randomUtils';
import { getScaleNotes } from '../theory/scaleUtils';
import { keyNameToMidiRoot } from '../theory/midiUtils';
import { filterValidNotes } from '../theory/musicValidation';

export interface MelodyGeneratorOptions {
  trackId: string;
  key: MusicalKey;
  scale: ScaleType;
  seed?: number | string;
  totalBars?: number; // default 4 bars
  octave?: number; // default 4
  noteDensity?: 'low' | 'medium' | 'high'; // low = half/quarters, medium = quarters/8ths, high = 8ths/16ths
  velocity?: number;
}

export const generateMelody = (options: MelodyGeneratorOptions): Note[] => {
  const {
    trackId,
    key,
    scale,
    seed = 12345,
    totalBars = 4,
    octave = 4,
    noteDensity = 'medium',
    velocity = 100,
  } = options;

  const prng = createSeededRandom(seed);
  const rootMidi = keyNameToMidiRoot(key, octave);
  const scalePitches = getScaleNotes(rootMidi, scale, 2); // 2 octave range

  const totalBeats = totalBars * 4;
  const generatedNotes: Note[] = [];

  let currentBeat = 1.0;
  let lastPitchIndex = Math.floor(scalePitches.length / 2);

  // Determine duration options based on density
  const durations: number[] =
    noteDensity === 'low'
      ? [2.0, 1.0]
      : noteDensity === 'high'
      ? [0.5, 0.25, 1.0]
      : [1.0, 0.5];

  while (currentBeat < totalBeats + 1.0) {
    const dur = prng.choice(durations);

    // Don't exceed total beats limit
    if (currentBeat + dur > totalBeats + 1.0) {
      break;
    }

    // Melodic interval step (-2, -1, 0, +1, +2 scale degrees for stepwise motion)
    const step = prng.choice([-2, -1, -1, 0, 1, 1, 2]);
    let nextPitchIndex = lastPitchIndex + step;
    nextPitchIndex = Math.max(0, Math.min(scalePitches.length - 1, nextPitchIndex));

    const pitch = scalePitches[nextPitchIndex];

    generatedNotes.push({
      id: `gen-mel-${currentBeat.toFixed(2)}-${pitch}-${prng.nextInt(100, 999)}`,
      trackId,
      pitch,
      startBeat: currentBeat,
      durationBeats: dur,
      velocity: Math.min(127, Math.max(60, velocity + prng.nextInt(-10, 10))),
    });

    lastPitchIndex = nextPitchIndex;
    currentBeat += dur;
  }

  return filterValidNotes(generatedNotes);
};
