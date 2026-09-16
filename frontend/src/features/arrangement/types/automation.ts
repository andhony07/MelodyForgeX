export type AutomationTargetType = 'track' | 'master' | 'arrangement';
export type AutomationParameter = 'volume' | 'pan' | 'tempo';

export interface AutomationPoint {
  id: string;
  beat: number;
  value: number;
}

export interface AutomationLane {
  id: string;
  targetType: AutomationTargetType;
  targetId: string;
  parameter: AutomationParameter;
  points: AutomationPoint[];
  enabled?: boolean;
}
