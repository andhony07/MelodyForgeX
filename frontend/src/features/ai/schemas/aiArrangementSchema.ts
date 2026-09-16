import { ArrangementSuggestion, SuggestionType } from '../../arrangement/suggestions/types/suggestionTypes';
import { ArrangementSection } from '../../arrangement/types/arrangementSection';
import { Track } from '../../editor/types/studio';

const VALID_SUGGESTION_TYPES: SuggestionType[] = [
  'TRACK_ACTIVATION',
  'AUTOMATION_ADD',
  'TRANSITION_CHANGE',
  'TEMPO_ADJUST',
];

export function validateAIArrangementResponse(
  rawJson: unknown,
  validSections: ArrangementSection[],
  validTracks: Track[]
): ArrangementSuggestion[] {
  if (!rawJson || typeof rawJson !== 'object') {
    throw new Error('Invalid AI response: Expected JSON object.');
  }

  const obj = rawJson as Record<string, unknown>;
  if (!Array.isArray(obj.suggestions)) {
    throw new Error('Invalid AI response: Missing suggestions array.');
  }

  const validSectionIds = new Set(validSections.map((s) => s.id));
  const validTrackIds = new Set(validTracks.map((t) => t.id));
  const validatedSuggestions: ArrangementSuggestion[] = [];

  obj.suggestions.forEach((item, idx) => {
    if (!item || typeof item !== 'object') return;
    const s = item as Record<string, unknown>;

    if (!s.type || !VALID_SUGGESTION_TYPES.includes(s.type as SuggestionType)) {
      return; // Skip invalid suggestion type
    }

    if (s.sectionId && typeof s.sectionId === 'string' && !validSectionIds.has(s.sectionId)) {
      return; // Reject unknown section ID
    }

    if (s.trackId && typeof s.trackId === 'string' && !validTrackIds.has(s.trackId)) {
      return; // Reject unknown track ID
    }

    const type = s.type as SuggestionType;
    const sectionId = typeof s.sectionId === 'string' ? s.sectionId : undefined;
    const trackId = typeof s.trackId === 'string' ? s.trackId : undefined;
    const title = typeof s.title === 'string' && s.title.trim() ? s.title : `AI ${type} Suggestion`;
    const description = typeof s.description === 'string' ? s.description : 'AI arrangement suggestion.';
    const reason = typeof s.reason === 'string' ? s.reason : 'Suggested by AI Arrangement Intelligence.';

    validatedSuggestions.push({
      id: `ai-sug-${idx}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      title,
      description,
      sectionId,
      trackId,
      proposedValue: s.proposedValue,
      reason,
    });
  });

  return validatedSuggestions;
}
