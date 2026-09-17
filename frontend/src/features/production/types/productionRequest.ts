import { AssistantMode } from './productionTypes';

export interface CompactTrackContext {
  id: string;
  name: string;
  instrument: string;
  volume: number;
  muted: boolean;
  solo: boolean;
  noteCount: number;
}

export interface CompactSectionContext {
  id: string;
  name: string;
  type: string;
  startBar: number;
  endBar: number;
  activeTrackIds: string[];
}

export interface ProductionContext {
  projectSettings: {
    title: string;
    bpm: number;
    key: string;
    scale: string;
    timeSignature: string;
    totalBars: number;
  };
  tracks: CompactTrackContext[];
  arrangement: CompactSectionContext[];
  musicalAnalysis: {
    totalNotes: number;
    pitchRange: { min: number; max: number };
    averageVelocity: number;
    trackNoteDensities: Record<string, number>;
  };
  mixerAnalysis: {
    masterVolumeDb: number;
    masterPan: number;
    trackChannelCount: number;
    totalInsertsCount: number;
    limiterEnabled: boolean;
    activeSendsCount: number;
  };
  automationAnalysis: {
    laneCount: number;
    pointCount: number;
    activeParameters: string[];
  };
  mode: AssistantMode;
  userPrompt?: string;
}

export interface ProductionAnalysisRequest {
  context: ProductionContext;
  mode: AssistantMode;
  userPrompt?: string;
}
