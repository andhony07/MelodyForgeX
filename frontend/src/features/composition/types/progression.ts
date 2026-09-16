import { MusicalKey, KeyMode } from '../../editor/types/studio';
import { ChordQuality } from './chord';

export interface ProgressionChord {
  symbol: string; // e.g. "I", "V", "vi", "IV"
  root: string; // e.g. "C", "G", "A", "F"
  quality: ChordQuality;
  startBeat: number; // 1-indexed (e.g. 1.0)
  durationBeats: number; // e.g. 4.0 = 1 bar in 4/4
  romanNumeral: string;
}

export interface ProgressionTemplate {
  id: string;
  name: string;
  key: MusicalKey;
  mode: KeyMode;
  chords: ProgressionChord[];
}
