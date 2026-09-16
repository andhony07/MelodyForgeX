import { AIProvider } from '../types/aiProvider';
import { CompositionRequest } from '../types/compositionRequest';
import { AICompositionResponse } from '../types/compositionResponse';
import { GeminiProvider } from '../providers/GeminiProvider';

export class AICompositionService {
  private provider: AIProvider;

  constructor(provider?: AIProvider) {
    this.provider = provider || new GeminiProvider();
  }

  public setProvider(provider: AIProvider): void {
    this.provider = provider;
  }

  public async generate(request: CompositionRequest): Promise<AICompositionResponse> {
    if (!request.prompt || !request.prompt.trim()) {
      throw new Error('Please enter a description for your musical idea.');
    }
    return await this.provider.generateComposition(request);
  }
}

export const aiCompositionService = new AICompositionService();
