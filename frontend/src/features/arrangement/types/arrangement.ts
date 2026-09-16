import { ArrangementSection } from './arrangementSection';
import { AutomationLane } from './automation';

export interface Arrangement {
  sections: ArrangementSection[];
  totalBars: number;
  selectedSectionId: string | null;
  automationLanes?: AutomationLane[];
  automationEnabled?: boolean;
  version: number;
}

