import { CompositionRequest } from './compositionRequest';
import { AICompositionResponse } from './compositionResponse';

export interface AIProvider {
  generateComposition(request: CompositionRequest): Promise<AICompositionResponse>;
}
