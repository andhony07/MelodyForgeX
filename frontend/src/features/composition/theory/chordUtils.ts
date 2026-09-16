import { ChordQuality } from '../types/chord';
import { CHORDS } from '../constants/chords';
import { ScaleType } from '../types/scale';
import { SCALES } from '../constants/scales';

export const buildChord = (
  rootMidi: number,
  quality: ChordQuality,
  inversion = 0,
  octaveOffset = 0
): number[] => {
  const chordDef = CHORDS[quality] || CHORDS.Major;
  const notes = chordDef.intervals.map((interval) => rootMidi + (octaveOffset * 12) + interval);

  // Apply inversions
  if (inversion > 0 && notes.length > 1) {
    const invCount = inversion % notes.length;
    for (let i = 0; i < invCount; i++) {
      const firstNote = notes.shift()!;
      notes.push(firstNote + 12);
    }
  }

  return notes.sort((a, b) => a - b);
};

export const invertChord = (notes: number[], inversion: number): number[] => {
  if (notes.length <= 1) return [...notes];
  const invCount = (inversion % notes.length + notes.length) % notes.length;
  const sorted = [...notes].sort((a, b) => a - b);

  for (let i = 0; i < invCount; i++) {
    const firstNote = sorted.shift()!;
    sorted.push(firstNote + 12);
  }

  return sorted.sort((a, b) => a - b);
};

export const getDiatonicTriads = (rootMidi: number, scaleType: ScaleType): { degree: string; rootMidi: number; quality: ChordQuality }[] => {
  const scale = SCALES[scaleType] || SCALES.Major;
  const degrees = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

  return scale.intervals.map((interval, index) => {
    const chordRoot = rootMidi + interval;
    // Determine third and fifth intervals within scale
    const thirdInterval = (scale.intervals[(index + 2) % scale.intervals.length] - interval + 12) % 12;
    const fifthInterval = (scale.intervals[(index + 4) % scale.intervals.length] - interval + 12) % 12;

    let quality: ChordQuality = 'Major';
    if (thirdInterval === 3 && fifthInterval === 7) quality = 'Minor';
    else if (thirdInterval === 3 && fifthInterval === 6) quality = 'Diminished';
    else if (thirdInterval === 4 && fifthInterval === 8) quality = 'Augmented';

    return {
      degree: degrees[index % degrees.length] || `Degree ${index + 1}`,
      rootMidi: chordRoot,
      quality,
    };
  });
};

export const getDiatonicSeventhChords = (rootMidi: number, scaleType: ScaleType): { degree: string; rootMidi: number; quality: ChordQuality }[] => {
  const scale = SCALES[scaleType] || SCALES.Major;
  const degrees = ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viiø7'];

  return scale.intervals.map((interval, index) => {
    const chordRoot = rootMidi + interval;
    const thirdInterval = (scale.intervals[(index + 2) % scale.intervals.length] - interval + 12) % 12;
    const fifthInterval = (scale.intervals[(index + 4) % scale.intervals.length] - interval + 12) % 12;
    const seventhInterval = (scale.intervals[(index + 6) % scale.intervals.length] - interval + 12) % 12;

    let quality: ChordQuality = 'Major 7';
    if (thirdInterval === 4 && fifthInterval === 7 && seventhInterval === 11) quality = 'Major 7';
    else if (thirdInterval === 3 && fifthInterval === 7 && seventhInterval === 10) quality = 'Minor 7';
    else if (thirdInterval === 4 && fifthInterval === 7 && seventhInterval === 10) quality = 'Dominant 7';
    else if (thirdInterval === 3 && fifthInterval === 6 && seventhInterval === 10) quality = 'Half-diminished 7';
    else if (thirdInterval === 3 && fifthInterval === 6 && seventhInterval === 9) quality = 'Diminished 7';

    return {
      degree: degrees[index % degrees.length] || `Degree ${index + 1}7`,
      rootMidi: chordRoot,
      quality,
    };
  });
};

export const romanNumeralForChord = (degreeIndex: number, quality: ChordQuality): string => {
  const upperNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  const lowerNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];

  const baseUpper = upperNumerals[degreeIndex % 7];
  const baseLower = lowerNumerals[degreeIndex % 7];

  switch (quality) {
    case 'Major':
      return baseUpper;
    case 'Minor':
      return baseLower;
    case 'Diminished':
      return `${baseLower}°`;
    case 'Augmented':
      return `${baseUpper}+`;
    case 'Major 7':
      return `${baseUpper}maj7`;
    case 'Minor 7':
      return `${baseLower}7`;
    case 'Dominant 7':
      return `${baseUpper}7`;
    case 'Half-diminished 7':
      return `${baseLower}ø7`;
    case 'Diminished 7':
      return `${baseLower}°7`;
    default:
      return baseUpper;
  }
};
