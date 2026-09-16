import { ScaleDefinition, ScaleType } from '../types/scale';

export const SCALES: Record<ScaleType, ScaleDefinition> = {
  Major: {
    name: 'Major',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    description: 'Bright, happy, uplifting Ionian mode',
  },
  Minor: {
    name: 'Minor',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    description: 'Dark, emotional, natural Aeolian minor',
  },
  Dorian: {
    name: 'Dorian',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    description: 'Jazzy, minor with a raised 6th degree',
  },
  Phrygian: {
    name: 'Phrygian',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    description: 'Exotic, dark Spanish/Flamenco flavor with a flat 2nd',
  },
  Lydian: {
    name: 'Lydian',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    description: 'Dreamy, ethereal major scale with a raised 4th',
  },
  Mixolydian: {
    name: 'Mixolydian',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    description: 'Bluesy/Rock major scale with a flat 7th',
  },
  Locrian: {
    name: 'Locrian',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    description: 'Tense, unstable diminished sound',
  },
  'Harmonic Minor': {
    name: 'Harmonic Minor',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    description: 'Neoclassical, Middle Eastern minor with raised 7th',
  },
  'Melodic Minor': {
    name: 'Melodic Minor',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    description: 'Jazz minor scale with raised 6th and 7th',
  },
  'Pentatonic Major': {
    name: 'Pentatonic Major',
    intervals: [0, 2, 4, 7, 9],
    description: '5-note melodic, consonant major sound',
  },
  'Pentatonic Minor': {
    name: 'Pentatonic Minor',
    intervals: [0, 3, 5, 7, 10],
    description: '5-note blues/rock staple scale',
  },
  Blues: {
    name: 'Blues',
    intervals: [0, 3, 5, 6, 7, 10],
    description: 'Minor pentatonic plus blue note (flat 5th)',
  },
};
