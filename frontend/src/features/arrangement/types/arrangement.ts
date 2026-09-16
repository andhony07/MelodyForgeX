import { ArrangementSection } from './arrangementSection';

export interface Arrangement {
  sections: ArrangementSection[];
  totalBars: number;
  selectedSectionId: string | null;
  version: number;
}
