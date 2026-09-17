import { FindingCategory } from './productionTypes';

export type TargetType = 'track' | 'section' | 'mixer' | 'automation' | 'project';

export type ActionType =
  // Arrangement
  | 'enable_track_in_section'
  | 'disable_track_in_section'
  | 'update_section_transition'
  | 'change_section_length'
  // Mixer
  | 'set_track_volume'
  | 'set_track_pan'
  | 'toggle_track_mute'
  | 'toggle_track_solo'
  | 'add_track_insert'
  | 'remove_track_insert'
  | 'toggle_track_insert_bypass'
  | 'update_insert_param'
  | 'set_track_send_level'
  | 'set_master_volume'
  | 'set_master_pan'
  | 'set_master_limiter'
  // Musical
  | 'generate_melody'
  | 'generate_chords'
  | 'generate_arpeggio'
  | 'generate_bass'
  // Automation
  | 'add_automation_point'
  // Project
  | 'change_tempo'
  | 'change_key';

export interface ProductionSuggestion {
  id: string;
  category: FindingCategory;
  title: string;
  description: string;
  reason: string;
  targetType: TargetType;
  targetId: string;
  action: ActionType;
  parameters: Record<string, unknown>;
  evidence: string[];
  confidence: number;
  applied: boolean;
  rejected: boolean;
  currentValue?: unknown;
  proposedValue?: unknown;
}
