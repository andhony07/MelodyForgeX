export type SuggestionType =
  | 'TRACK_ACTIVATION'
  | 'AUTOMATION_ADD'
  | 'TRANSITION_CHANGE'
  | 'TEMPO_ADJUST';

export interface ArrangementSuggestion {
  id: string;
  type: SuggestionType;
  title: string;
  description: string;
  sectionId?: string;
  trackId?: string;
  targetType?: 'track' | 'master' | 'arrangement';
  parameter?: 'volume' | 'pan' | 'tempo';
  proposedValue?: unknown;
  reason: string;
}
