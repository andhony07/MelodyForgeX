import { AICompositionResponse } from '../types/compositionResponse';
import { validateCompositionSchema } from '../schemas/compositionSchema';

export function extractJsonString(rawInput: string): string {
  let text = rawInput.trim();

  // Strip markdown code fences if present
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = codeBlockRegex.exec(text);
  if (match && match[1]) {
    text = match[1].trim();
  }

  // Extract from first '{' to last '}'
  const startIdx = text.indexOf('{');
  const endIdx = text.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    text = text.substring(startIdx, endIdx + 1);
  }

  return text;
}

export function parseAndValidateCompositionResponse(input: unknown): AICompositionResponse {
  let jsonObject: unknown = input;

  if (typeof input === 'string') {
    const jsonString = extractJsonString(input);
    try {
      jsonObject = JSON.parse(jsonString);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid JSON structure';
      throw new Error(`Failed to parse AI composition JSON: ${msg}`);
    }
  }

  return validateCompositionSchema(jsonObject);
}
