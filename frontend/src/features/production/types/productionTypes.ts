export type FindingSeverity = 'info' | 'warning' | 'issue' | 'tip';

export type FindingCategory =
  | 'arrangement'
  | 'mix'
  | 'musical'
  | 'automation'
  | 'instrumentation';

export type AssistantMode =
  | 'analyze'
  | 'arrangement'
  | 'mix'
  | 'musical'
  | 'export';

export interface ProductionFinding {
  id: string;
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  description: string;
  evidence: string[];
  affectedTargetIds?: string[];
  suggestedAction?: string;
  confidence: number;
}

export interface ProjectStats {
  tempo: number;
  key: string;
  mode: string;
  timeSignature: string;
  totalBars: number;
  durationSeconds: number;
  trackCount: number;
  sectionCount: number;
  noteCount: number;
}

export interface ProductionReport {
  timestamp: number;
  mode: AssistantMode;
  summary: string;
  projectStats: ProjectStats;
  findings: ProductionFinding[];
  strengths: string[];
  observations: string[];
}

export interface AssistantHistoryEntry {
  id: string;
  timestamp: number;
  mode: AssistantMode;
  prompt?: string;
  summary: string;
  suggestionsCount: number;
  appliedCount: number;
}
