export interface Note {
  id: string;
  trackId: string;
  pitch: number; // MIDI note number (0 - 120, e.g. 60 = C4)
  startBeat: number; // 1-indexed, e.g. 1.0 = beat 1 of bar 1
  durationBeats: number; // e.g. 1.0 = 1 quarter note
  velocity: number; // 1 - 127
}

export type SnapValue = '1/1' | '1/2' | '1/4' | '1/8' | '1/16' | '1/32';

export type PianoRollTool = 'select' | 'draw' | 'erase';
