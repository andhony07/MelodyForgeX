export type ArrangementSectionType =
  | 'Intro'
  | 'Verse'
  | 'Pre-Chorus'
  | 'Chorus'
  | 'Bridge'
  | 'Outro'
  | 'Custom';

export interface ArrangementSection {
  id: string;
  name: string;
  type: ArrangementSectionType;
  startBar: number; // 1-indexed (e.g. 1)
  lengthBars: number; // e.g. 4, 8
  order: number; // 0-indexed position in arrangement sequence
  color?: string;
  sourceTemplate?: string;
  metadata?: Record<string, unknown>;
}
