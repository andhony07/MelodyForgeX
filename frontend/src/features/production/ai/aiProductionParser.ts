import { ProductionSuggestion, ActionType, TargetType } from '../types/productionSuggestion';
import { ProductionReport, FindingCategory } from '../types/productionTypes';
import { validateAIProductionPayload } from './aiProductionSchema';

export function parseAIProductionResponse(
  rawResponse: unknown,
  baseReport: ProductionReport,
  baseSuggestions: ProductionSuggestion[]
): {
  report: ProductionReport;
  suggestions: ProductionSuggestion[];
} {
  if (!validateAIProductionPayload(rawResponse)) {
    return { report: baseReport, suggestions: baseSuggestions };
  }

  const payload = rawResponse as Record<string, unknown>;
  const summary = typeof payload.summary === 'string' ? payload.summary : baseReport.summary;

  const mergedSuggestionsMap = new Map<string, ProductionSuggestion>();
  baseSuggestions.forEach((s) => mergedSuggestionsMap.set(s.id, s));

  if (Array.isArray(payload.suggestions)) {
    payload.suggestions.forEach((item, idx) => {
      const s = item as Record<string, unknown>;
      const id = typeof s.id === 'string' ? s.id : `ai-sug-${idx}`;
      const category = (s.category as FindingCategory) || 'mix';
      const targetType = (s.targetType as TargetType) || 'mixer';
      const action = (s.action as ActionType) || 'set_track_volume';
      const confidence = typeof s.confidence === 'number' ? Math.max(0, Math.min(1, s.confidence)) : 0.85;

      const aiSuggestion: ProductionSuggestion = {
        id,
        category,
        title: String(s.title || 'AI Production Recommendation'),
        description: String(s.description || 'AI suggested refinement.'),
        reason: String(s.reason || 'Optimizes overall production balance.'),
        targetType,
        targetId: String(s.targetId || 'project'),
        action,
        parameters: (s.parameters as Record<string, unknown>) || {},
        evidence: Array.isArray(s.evidence) ? s.evidence.map(String) : ['AI Model Analysis'],
        confidence,
        applied: false,
        rejected: false,
        currentValue: s.currentValue,
        proposedValue: s.proposedValue,
      };

      mergedSuggestionsMap.set(id, aiSuggestion);
    });
  }

  const updatedReport: ProductionReport = {
    ...baseReport,
    summary,
  };

  return {
    report: updatedReport,
    suggestions: Array.from(mergedSuggestionsMap.values()),
  };
}
