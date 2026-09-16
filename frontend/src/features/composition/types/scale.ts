export type ScaleType =
  | 'Major'
  | 'Minor'
  | 'Dorian'
  | 'Phrygian'
  | 'Lydian'
  | 'Mixolydian'
  | 'Locrian'
  | 'Harmonic Minor'
  | 'Melodic Minor'
  | 'Pentatonic Major'
  | 'Pentatonic Minor'
  | 'Blues';

export interface ScaleDefinition {
  name: ScaleType;
  intervals: number[]; // e.g. Major = [0, 2, 4, 5, 7, 9, 11]
  description: string;
}
