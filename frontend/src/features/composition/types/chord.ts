export type ChordQuality =
  | 'Major'
  | 'Minor'
  | 'Diminished'
  | 'Augmented'
  | 'Major 7'
  | 'Minor 7'
  | 'Dominant 7'
  | 'Diminished 7'
  | 'Half-diminished 7'
  | 'Major 6'
  | 'Minor 6'
  | 'Sus2'
  | 'Sus4'
  | 'Power Chord';

export interface ChordDefinition {
  quality: ChordQuality;
  intervals: number[]; // e.g. Major = [0, 4, 7]
  symbolSuffix: string;
}

export interface ChordVoicing {
  rootMidi: number;
  quality: ChordQuality;
  inversion?: number; // 0 = root position, 1 = 1st inversion, 2 = 2nd inversion
  octaveOffset?: number;
}
