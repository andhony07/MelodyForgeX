import { MusicalKey } from '../../editor/types/studio';
import { ScaleType } from '../../composition/types/scale';

export interface TimeSignatureSpec {
  numerator: number;
  denominator: number;
}

export interface SectionSpec {
  name: string;
  type: string;
  startBar: number;
  endBar: number;
}

export interface ChordSpec {
  root: string;
  quality: string;
  durationBars: number;
  romanNumeral?: string;
}

export interface ProgressionSpec {
  template?: string;
  chords: ChordSpec[];
}

export interface TrackSpec {
  name: string;
  role: 'chords' | 'melody' | 'arpeggio' | 'bass';
  generator: 'chord' | 'melody' | 'arpeggio';
  instrument?: string;
  octaveOffset?: number;
  noteDensity?: 'low' | 'medium' | 'high';
  pattern?: 'Up' | 'Down' | 'UpDown' | 'Random';
}

export interface GenerationSpec {
  melodyDensity?: 'low' | 'medium' | 'high';
  pitchRange?: {
    min: number;
    max: number;
  };
  seed: number;
}

export interface AICompositionResponse {
  title: string;
  key: MusicalKey;
  mode: ScaleType;
  tempo: number;
  timeSignature: TimeSignatureSpec;
  sections: SectionSpec[];
  progression: ProgressionSpec;
  tracks: TrackSpec[];
  generation: GenerationSpec;
}
