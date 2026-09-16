import { ArrangementSectionType } from '../../types/arrangementSection';

export type DensityTier = 'low' | 'medium' | 'high';
export type FindingSeverity = 'INFO' | 'WARNING';
export type FindingCategory = 'STRUCTURE' | 'DENSITY' | 'TEMPO' | 'AUTOMATION' | 'INSTRUMENTATION';

export interface ArrangementFinding {
  id: string;
  severity: FindingSeverity;
  category: FindingCategory;
  title: string;
  description: string;
  sectionId?: string;
  trackId?: string;
  suggestedAction?: string;
}

export interface SectionAnalysis {
  sectionId: string;
  sectionName: string;
  sectionType: ArrangementSectionType;
  startBar: number;
  endBar: number;
  lengthBars: number;
  startBeat: number;
  endBeat: number;
  durationBeats: number;
  enabledTrackIds: string[];
  activeTrackIds: string[];
  noteCount: number;
  noteDensity: number;
  densityTier: DensityTier;
  averageVelocity: number;
  pitchRange: { min: number; max: number; spread: number } | null;
  automationLaneIds: string[];
  tempoStart: number;
  tempoEnd: number;
  transitionType: string;
  fadeDuration: number;
}

export interface TrackSummary {
  trackId: string;
  trackName: string;
  instrument: string;
  totalNotes: number;
  participatingSectionIds: string[];
  averageVelocity: number;
  pitchRange: { min: number; max: number; spread: number } | null;
}

export interface ArrangementAnalysisResult {
  totalBars: number;
  totalBeats: number;
  totalDurationSeconds: number;
  sectionsCount: number;
  tracksCount: number;
  emptySectionIds: string[];
  emptyTrackIds: string[];
  sectionAnalyses: SectionAnalysis[];
  trackSummaries: TrackSummary[];
  instrumentDistribution: Record<string, number>;
  automationSummary: {
    totalLanes: number;
    enabledLanes: number;
    parameters: string[];
  };
  tempoSummary: {
    baseTempo: number;
    minTempo: number;
    maxTempo: number;
    hasTempoAutomation: boolean;
  };
  repeatedSectionsMap: Record<string, string[]>;
  findings: ArrangementFinding[];
}

export interface SectionComparisonResult {
  section1Id: string;
  section1Name: string;
  section2Id: string;
  section2Name: string;
  trackParticipationDelta: { sec1Tracks: number; sec2Tracks: number; diff: number };
  noteCountDelta: { sec1Notes: number; sec2Notes: number; diff: number };
  densityDelta: { sec1Density: number; sec2Density: number; diff: number };
  velocityDelta: { sec1Velocity: number; sec2Velocity: number; diff: number };
  pitchRangeDelta: { sec1Spread: number; sec2Spread: number; diff: number };
  automationDelta: { sec1Lanes: number; sec2Lanes: number; diff: number };
}
