export interface CompositionRequest {
  prompt: string;
  key?: string;
  scale?: string;
  bars?: number;
  tempo?: number;
  style?: string;
  mood?: string;
  complexity?: 'simple' | 'moderate' | 'complex';
  instruments?: string[];
  seed?: number;
}
