import { ActionType, TargetType } from '../types/productionSuggestion';
import { FindingCategory } from '../types/productionTypes';

const ALLOWED_CATEGORIES: FindingCategory[] = [
  'arrangement',
  'mix',
  'musical',
  'automation',
  'instrumentation',
];

const ALLOWED_TARGET_TYPES: TargetType[] = ['track', 'section', 'mixer', 'automation', 'project'];

const ALLOWED_ACTIONS: ActionType[] = [
  'enable_track_in_section',
  'disable_track_in_section',
  'update_section_transition',
  'change_section_length',
  'set_track_volume',
  'set_track_pan',
  'toggle_track_mute',
  'toggle_track_solo',
  'add_track_insert',
  'remove_track_insert',
  'toggle_track_insert_bypass',
  'update_insert_param',
  'set_track_send_level',
  'set_master_volume',
  'set_master_pan',
  'set_master_limiter',
  'generate_melody',
  'generate_chords',
  'generate_arpeggio',
  'generate_bass',
  'add_automation_point',
  'change_tempo',
  'change_key',
];

export function validateAIProductionPayload(rawPayload: unknown): boolean {
  if (!rawPayload || typeof rawPayload !== 'object') return false;
  const payload = rawPayload as Record<string, unknown>;

  if (typeof payload.summary !== 'string') return false;

  if (payload.observations && !Array.isArray(payload.observations)) return false;
  if (payload.suggestions && !Array.isArray(payload.suggestions)) return false;

  if (Array.isArray(payload.suggestions)) {
    for (const item of payload.suggestions) {
      if (typeof item !== 'object' || item === null) return false;
      const sug = item as Record<string, unknown>;

      if (!sug.id || typeof sug.id !== 'string') return false;
      if (!sug.title || typeof sug.title !== 'string') return false;
      if (!sug.description || typeof sug.description !== 'string') return false;
      if (!ALLOWED_CATEGORIES.includes(sug.category as FindingCategory)) return false;
      if (!ALLOWED_TARGET_TYPES.includes(sug.targetType as TargetType)) return false;
      if (!ALLOWED_ACTIONS.includes(sug.action as ActionType)) return false;
      if (typeof sug.confidence === 'number' && (sug.confidence < 0 || sug.confidence > 1)) return false;
    }
  }

  return true;
}
