import { ProgressionTemplate } from '../types/progression';

export const PROGRESSION_TEMPLATES: ProgressionTemplate[] = [
  {
    id: 'pop-1',
    name: 'Pop / Epic (I - V - vi - IV)',
    key: 'C',
    mode: 'Major',
    chords: [
      { symbol: 'I', root: 'C', quality: 'Major', startBeat: 1.0, durationBeats: 4.0, romanNumeral: 'I' },
      { symbol: 'V', root: 'G', quality: 'Major', startBeat: 5.0, durationBeats: 4.0, romanNumeral: 'V' },
      { symbol: 'vi', root: 'A', quality: 'Minor', startBeat: 9.0, durationBeats: 4.0, romanNumeral: 'vi' },
      { symbol: 'IV', root: 'F', quality: 'Major', startBeat: 13.0, durationBeats: 4.0, romanNumeral: 'IV' },
    ],
  },
  {
    id: 'pop-2',
    name: 'Classic Doo-Wop (I - vi - IV - V)',
    key: 'C',
    mode: 'Major',
    chords: [
      { symbol: 'I', root: 'C', quality: 'Major', startBeat: 1.0, durationBeats: 4.0, romanNumeral: 'I' },
      { symbol: 'vi', root: 'A', quality: 'Minor', startBeat: 5.0, durationBeats: 4.0, romanNumeral: 'vi' },
      { symbol: 'IV', root: 'F', quality: 'Major', startBeat: 9.0, durationBeats: 4.0, romanNumeral: 'IV' },
      { symbol: 'V', root: 'G', quality: 'Major', startBeat: 13.0, durationBeats: 4.0, romanNumeral: 'V' },
    ],
  },
  {
    id: 'jazz-1',
    name: 'Jazz Standard (ii - V - I)',
    key: 'C',
    mode: 'Major',
    chords: [
      { symbol: 'ii7', root: 'D', quality: 'Minor 7', startBeat: 1.0, durationBeats: 4.0, romanNumeral: 'ii7' },
      { symbol: 'V7', root: 'G', quality: 'Dominant 7', startBeat: 5.0, durationBeats: 4.0, romanNumeral: 'V7' },
      { symbol: 'Imaj7', root: 'C', quality: 'Major 7', startBeat: 9.0, durationBeats: 8.0, romanNumeral: 'Imaj7' },
    ],
  },
  {
    id: 'rock-1',
    name: 'Rock Cadence (I - IV - V)',
    key: 'C',
    mode: 'Major',
    chords: [
      { symbol: 'I', root: 'C', quality: 'Major', startBeat: 1.0, durationBeats: 4.0, romanNumeral: 'I' },
      { symbol: 'IV', root: 'F', quality: 'Major', startBeat: 5.0, durationBeats: 4.0, romanNumeral: 'IV' },
      { symbol: 'V', root: 'G', quality: 'Major', startBeat: 9.0, durationBeats: 8.0, romanNumeral: 'V' },
    ],
  },
  {
    id: 'emotional-1',
    name: 'Emotional Minor (vi - IV - I - V)',
    key: 'C',
    mode: 'Major',
    chords: [
      { symbol: 'vi', root: 'A', quality: 'Minor', startBeat: 1.0, durationBeats: 4.0, romanNumeral: 'vi' },
      { symbol: 'IV', root: 'F', quality: 'Major', startBeat: 5.0, durationBeats: 4.0, romanNumeral: 'IV' },
      { symbol: 'I', root: 'C', quality: 'Major', startBeat: 9.0, durationBeats: 4.0, romanNumeral: 'I' },
      { symbol: 'V', root: 'G', quality: 'Major', startBeat: 13.0, durationBeats: 4.0, romanNumeral: 'V' },
    ],
  },
];
