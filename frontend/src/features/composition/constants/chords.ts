import { ChordDefinition, ChordQuality } from '../types/chord';

export const CHORDS: Record<ChordQuality, ChordDefinition> = {
  Major: { quality: 'Major', intervals: [0, 4, 7], symbolSuffix: '' },
  Minor: { quality: 'Minor', intervals: [0, 3, 7], symbolSuffix: 'm' },
  Diminished: { quality: 'Diminished', intervals: [0, 3, 6], symbolSuffix: 'dim' },
  Augmented: { quality: 'Augmented', intervals: [0, 4, 8], symbolSuffix: 'aug' },
  'Major 7': { quality: 'Major 7', intervals: [0, 4, 7, 11], symbolSuffix: 'maj7' },
  'Minor 7': { quality: 'Minor 7', intervals: [0, 3, 7, 10], symbolSuffix: 'm7' },
  'Dominant 7': { quality: 'Dominant 7', intervals: [0, 4, 7, 10], symbolSuffix: '7' },
  'Diminished 7': { quality: 'Diminished 7', intervals: [0, 3, 6, 9], symbolSuffix: 'dim7' },
  'Half-diminished 7': { quality: 'Half-diminished 7', intervals: [0, 3, 6, 10], symbolSuffix: 'm7b5' },
  'Major 6': { quality: 'Major 6', intervals: [0, 4, 7, 9], symbolSuffix: '6' },
  'Minor 6': { quality: 'Minor 6', intervals: [0, 3, 7, 9], symbolSuffix: 'm6' },
  Sus2: { quality: 'Sus2', intervals: [0, 2, 7], symbolSuffix: 'sus2' },
  Sus4: { quality: 'Sus4', intervals: [0, 5, 7], symbolSuffix: 'sus4' },
  'Power Chord': { quality: 'Power Chord', intervals: [0, 7], symbolSuffix: '5' },
};
