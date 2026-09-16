import axios from 'axios';
import { AIProvider } from '../types/aiProvider';
import { CompositionRequest } from '../types/compositionRequest';
import { AICompositionResponse } from '../types/compositionResponse';
import { parseAndValidateCompositionResponse } from '../parsers/compositionParser';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000/api';

export class BackendAIProvider implements AIProvider {
  async generateComposition(request: CompositionRequest): Promise<AICompositionResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/compose`, request, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 25000,
      });

      if (response.data && response.data.success && response.data.composition) {
        return parseAndValidateCompositionResponse(response.data.composition);
      } else {
        throw new Error('Backend returned invalid response payload.');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorMsg = err.response?.data?.detail || err.message || 'AI request failed.';
        throw new Error(`AI composition failed: ${errorMsg}`);
      } else if (err instanceof Error) {
        throw err;
      }
      throw new Error('AI composition failed: Unknown error occurred.');
    }
  }
}
