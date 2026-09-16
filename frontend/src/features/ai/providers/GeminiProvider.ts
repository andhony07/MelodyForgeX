import axios from 'axios';
import { AIProvider } from '../types/aiProvider';
import { CompositionRequest } from '../types/compositionRequest';
import { AICompositionResponse } from '../types/compositionResponse';
import { COMPOSITION_SYSTEM_PROMPT, buildCompositionPrompt } from '../prompts/compositionPrompt';
import { parseAndValidateCompositionResponse } from '../parsers/compositionParser';
import { BackendAIProvider } from './BackendAIProvider';

export class GeminiProvider implements AIProvider {
  private apiKey: string;
  private backendFallback: BackendAIProvider;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    this.backendFallback = new BackendAIProvider();
  }

  async generateComposition(request: CompositionRequest): Promise<AICompositionResponse> {
    if (!this.apiKey) {
      // Securely delegate to backend AI route
      return this.backendFallback.generateComposition(request);
    }

    const modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`;
    const userPromptText = buildCompositionPrompt(request);

    try {
      const resp = await axios.post(
        url,
        {
          contents: [
            {
              parts: [
                { text: COMPOSITION_SYSTEM_PROMPT },
                { text: userPromptText },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            responseMimeType: 'application/json',
          },
        },
        { timeout: 20000 }
      );

      const rawText = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Empty response from Gemini API.');
      }

      return parseAndValidateCompositionResponse(rawText);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorDetail = err.response?.data?.error?.message || err.message;
        throw new Error(`Gemini Provider request failed: ${errorDetail}`);
      } else if (err instanceof Error) {
        throw err;
      }
      throw new Error('Gemini Provider failed: Unknown error.');
    }
  }
}
