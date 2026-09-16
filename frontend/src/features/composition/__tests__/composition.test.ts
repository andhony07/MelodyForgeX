import { SCALES } from '../constants/scales';
import { CHORDS } from '../constants/chords';
import { getScaleNotes, isNoteInScale, snapPitchToScale } from '../theory/scaleUtils';
import { buildChord, invertChord, getDiatonicTriads, romanNumeralForChord } from '../theory/chordUtils';
import { createSeededRandom } from '../theory/randomUtils';
import { generateChordNotes } from '../generators/chordGenerator';
import { generateMelody } from '../generators/melodyGenerator';
import { generateArpeggio } from '../generators/arpeggioGenerator';
import { PROGRESSION_TEMPLATES } from '../constants/progressions';
import { validateNote, validateMidiPitch, validateVelocity, validateDuration } from '../theory/musicValidation';

export const runCompositionEngineTests = (): { passed: number; total: number; logs: string[] } => {
  const logs: string[] = [];
  let passed = 0;
  let total = 0;

  const assert = (condition: boolean, description: string) => {
    total++;
    if (condition) {
      passed++;
      logs.push(`✓ PASS: ${description}`);
    } else {
      logs.push(`✗ FAIL: ${description}`);
      throw new Error(`Assertion failed: ${description}`);
    }
  };

  // 1. Scale System Tests
  assert(SCALES.Major.intervals.length === 7, 'Major scale has 7 intervals');
  assert(SCALES.Minor.intervals.length === 7, 'Minor scale has 7 intervals');
  assert(SCALES.Blues.intervals.length === 6, 'Blues scale has 6 intervals');

  const cMajorNotes = getScaleNotes(60, 'Major', 1);
  assert(JSON.stringify(cMajorNotes) === JSON.stringify([60, 62, 64, 65, 67, 69, 71]), 'C Major scale MIDI notes match');

  assert(isNoteInScale(60, 60, 'Major') === true, 'C is in C Major');
  assert(isNoteInScale(64, 60, 'Major') === true, 'E is in C Major');
  assert(isNoteInScale(61, 60, 'Major') === false, 'C# is not in C Major');
  assert(snapPitchToScale(61, 60, 'Major') === 60, 'C# snaps to C in C Major');

  // 2. Chord System Tests
  const cMajorChord = buildChord(60, 'Major');
  assert(JSON.stringify(cMajorChord) === JSON.stringify([60, 64, 67]), 'C Major triad [60, 64, 67]');

  const cMinorChord = buildChord(60, 'Minor');
  assert(JSON.stringify(cMinorChord) === JSON.stringify([60, 63, 67]), 'C Minor triad [60, 63, 67]');

  const cDom7 = buildChord(60, 'Dominant 7');
  assert(JSON.stringify(cDom7) === JSON.stringify([60, 64, 67, 70]), 'C Dominant 7 chord [60, 64, 67, 70]');
  assert(CHORDS['Dominant 7'].intervals.length === 4, 'Dominant 7 definition interval count');

  const cFirstInv = invertChord([60, 64, 67], 1);
  assert(JSON.stringify(cFirstInv) === JSON.stringify([64, 67, 72]), 'C Major 1st inversion [64, 67, 72]');

  // 3. Diatonic Theory & Roman Numerals
  const triads = getDiatonicTriads(60, 'Major');
  assert(triads[0].quality === 'Major', 'Diatonic triad I is Major');
  assert(triads[1].quality === 'Minor', 'Diatonic triad ii is Minor');
  assert(triads[6].quality === 'Diminished', 'Diatonic triad vii° is Diminished');

  assert(romanNumeralForChord(0, 'Major') === 'I', 'Degree 0 Major -> I');
  assert(romanNumeralForChord(1, 'Minor') === 'ii', 'Degree 1 Minor -> ii');
  assert(romanNumeralForChord(6, 'Diminished') === 'vii°', 'Degree 6 Diminished -> vii°');

  // 4. Seeded PRNG Determinism
  const prng1 = createSeededRandom('test-seed-123');
  const prng2 = createSeededRandom('test-seed-123');

  const val1 = [prng1.nextFloat(), prng1.nextInt(1, 50), prng1.choice(['A', 'B', 'C'])];
  const val2 = [prng2.nextFloat(), prng2.nextInt(1, 50), prng2.choice(['A', 'B', 'C'])];
  assert(JSON.stringify(val1) === JSON.stringify(val2), 'Seeded PRNG reproducibility');

  // 5. Chord Generator Tests
  const generatedChordNotes = generateChordNotes({
    trackId: 'track-chords',
    progression: PROGRESSION_TEMPLATES[0],
    velocity: 85,
  });
  assert(generatedChordNotes.length > 0, 'Generated chord notes count > 0');
  assert(generatedChordNotes.every(validateNote), 'All generated chord notes pass validation');

  // 6. Melody Generator Reproducibility
  const melody1 = generateMelody({
    trackId: 'track-mel',
    key: 'C',
    scale: 'Major',
    seed: 99999,
    totalBars: 4,
  });
  const melody2 = generateMelody({
    trackId: 'track-mel',
    key: 'C',
    scale: 'Major',
    seed: 99999,
    totalBars: 4,
  });
  assert(JSON.stringify(melody1) === JSON.stringify(melody2), 'Generated melody is 100% deterministic');
  assert(melody1.every((n) => isNoteInScale(n.pitch, 60, 'Major')), 'All melody notes are within scale');

  // 7. Arpeggio Generator Tests
  const arpNotes = generateArpeggio({
    trackId: 'track-arp',
    progression: PROGRESSION_TEMPLATES[0],
    pattern: 'Up',
    seed: 88888,
  });
  assert(arpNotes.length > 0, 'Generated arpeggio notes count > 0');
  assert(arpNotes.every(validateNote), 'All generated arpeggio notes pass validation');

  // 8. Validation Rules
  assert(validateMidiPitch(60) === true, 'MIDI 60 valid');
  assert(validateMidiPitch(130) === false, 'MIDI 130 invalid');
  assert(validateVelocity(100) === true, 'Velocity 100 valid');
  assert(validateVelocity(0) === false, 'Velocity 0 invalid');
  assert(validateDuration(1.0) === true, 'Duration 1.0 valid');
  assert(validateDuration(-1) === false, 'Duration -1 invalid');

  return { passed, total, logs };
};
