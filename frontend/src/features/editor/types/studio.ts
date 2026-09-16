export interface Track {
  id: string;
  name: string;
  instrument: string;
  iconName: string;
  muted: boolean;
  solo: boolean;
  volume: number; // 0 - 100
  color: string; // Tailwind color or hex accent
  channel: number;
}

export interface InstrumentOption {
  name: string;
  instrument: string;
  iconName: string;
  color: string;
}

export type MusicalKey = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
export type KeyMode = 'Major' | 'Minor';
export type TimeSignature = '4/4' | '3/4' | '2/4' | '6/8' | '7/8' | '12/8';
