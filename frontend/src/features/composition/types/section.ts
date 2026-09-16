export type SectionType =
  | 'Intro'
  | 'Verse'
  | 'Pre-Chorus'
  | 'Chorus'
  | 'Bridge'
  | 'Outro';

export interface MusicalSection {
  id: string;
  name: string;
  type: SectionType;
  startBar: number;
  endBar: number;
}
