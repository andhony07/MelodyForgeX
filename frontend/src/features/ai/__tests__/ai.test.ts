import { buildCompositionPrompt } from '../prompts/compositionPrompt';
import { parseAndValidateCompositionResponse, extractJsonString } from '../parsers/compositionParser';
import { validateCompositionSchema } from '../schemas/compositionSchema';
import { translateAIToNotes } from '../services/aiTranslationService';
import { AICompositionResponse } from '../types/compositionResponse';
import { CompositionRequest } from '../types/compositionRequest';

export function runAIEngineTests() {
  const logs: string[] = [];
  let passed = 0;
  let total = 0;

  const assert = (condition: boolean, description: string) => {
    total++;
    if (condition) {
      passed++;
      logs.push(`  ✓ ${description}`);
    } else {
      logs.push(`  ✗ FAILED: ${description}`);
      throw new Error(`Assertion failed: ${description}`);
    }
  };

  logs.push('\n=== AI Composition Engine Unit Tests ===');

  // Test 1: Prompt Builder
  try {
    const req: CompositionRequest = {
      prompt: 'Cinematic orchestral idea',
      key: 'D',
      scale: 'Minor',
      tempo: 80,
      bars: 8,
      seed: 5555,
    };
    const builtPrompt = buildCompositionPrompt(req);
    assert(builtPrompt.includes('Cinematic orchestral idea'), 'Prompt builder includes prompt');
    assert(builtPrompt.includes('Key: D'), 'Prompt builder includes key');
    assert(builtPrompt.includes('Tempo: 80 BPM'), 'Prompt builder includes tempo');
  } catch (err: unknown) {
    logs.push(`  ✗ Test 1 Error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Test 2: JSON Extraction & Parsing
  try {
    const markdownInput = '```json\n{"title": "Test Piece", "key": "Am", "tempo": 95}\n```';
    const extracted = extractJsonString(markdownInput);
    assert(extracted === '{"title": "Test Piece", "key": "Am", "tempo": 95}', 'Extracts JSON from markdown fences');

    const validated = parseAndValidateCompositionResponse(markdownInput);
    assert(validated.title === 'Test Piece', 'Parses title correctly');
    assert(validated.key === 'A', 'Cleans key "Am" to "A"');
    assert(validated.tempo === 95, 'Parses tempo correctly');
  } catch (err: unknown) {
    logs.push(`  ✗ Test 2 Error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Test 3: Malformed JSON error handling
  try {
    let errorCaught = false;
    try {
      parseAndValidateCompositionResponse('Not a json string');
    } catch {
      errorCaught = true;
    }
    assert(errorCaught, 'Rejects non-JSON raw strings cleanly');
  } catch (err: unknown) {
    logs.push(`  ✗ Test 3 Error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Test 4: Schema Validation Fallbacks
  try {
    const rawInvalidData = {
      title: 'Boundary Test',
      key: 'InvalidKeyName',
      mode: 'InvalidMode',
      tempo: 9999, // exceeds max 300
    };
    const validated = validateCompositionSchema(rawInvalidData);
    assert(validated.key === 'C', 'Falls back to valid key C on invalid key input');
    assert(validated.mode === 'Major', 'Falls back to valid scale Major on invalid scale input');
    assert(validated.tempo === 300, 'Clamps tempo to maximum 300 BPM');
  } catch (err: unknown) {
    logs.push(`  ✗ Test 4 Error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Test 5: AI to Phase 5 Translation
  try {
    const validSpec: AICompositionResponse = {
      title: 'Translation Test',
      key: 'A',
      mode: 'Minor',
      tempo: 90,
      timeSignature: { numerator: 4, denominator: 4 },
      sections: [{ name: 'Intro', type: 'intro', startBar: 1, endBar: 4 }],
      progression: {
        template: 'i-VI-III-VII',
        chords: [
          { root: 'A', quality: 'minor', durationBars: 1, romanNumeral: 'i' },
          { root: 'F', quality: 'major', durationBars: 1, romanNumeral: 'VI' },
        ],
      },
      tracks: [
        { name: 'AI Chords', role: 'chords', generator: 'chord', instrument: 'Piano', octaveOffset: -1 },
        { name: 'AI Melody', role: 'melody', generator: 'melody', instrument: 'Synth', octaveOffset: 0 },
        { name: 'AI Arpeggio', role: 'arpeggio', generator: 'arpeggio', instrument: 'Guitar', pattern: 'Up' },
      ],
      generation: {
        melodyDensity: 'medium',
        pitchRange: { min: 48, max: 84 },
        seed: 7777,
      },
    };

    const translation = translateAIToNotes(validSpec);
    assert(translation.key === 'A', 'Translation preserves key');
    assert(translation.mode === 'Minor', 'Translation preserves mode');
    assert(translation.tracks.length === 3, 'Translates all 3 requested tracks');
    assert(translation.tracks[0].notes.length > 0, 'Generates chord notes for chord track');
    assert(translation.tracks[1].notes.length > 0, 'Generates melody notes for melody track');
    assert(translation.tracks[2].notes.length > 0, 'Generates arpeggio notes for arpeggio track');
  } catch (err: unknown) {
    logs.push(`  ✗ Test 5 Error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Test 6: Determinism Test
  try {
    const spec: AICompositionResponse = {
      title: 'Deterministic Test',
      key: 'G',
      mode: 'Major',
      tempo: 120,
      timeSignature: { numerator: 4, denominator: 4 },
      sections: [{ name: 'Main', type: 'verse', startBar: 1, endBar: 4 }],
      progression: {
        chords: [{ root: 'G', quality: 'major', durationBars: 2 }],
      },
      tracks: [
        { name: 'AI Melody', role: 'melody', generator: 'melody' },
      ],
      generation: {
        seed: 43210,
      },
    };

    const res1 = translateAIToNotes(spec);
    const res2 = translateAIToNotes(spec);

    const notes1Pitches = res1.tracks[0].notes.map((n) => n.pitch);
    const notes2Pitches = res2.tracks[0].notes.map((n) => n.pitch);

    assert(
      JSON.stringify(notes1Pitches) === JSON.stringify(notes2Pitches),
      'Same specification + same seed produces identical notes'
    );
  } catch (err: unknown) {
    logs.push(`  ✗ Test 6 Error: ${err instanceof Error ? err.message : String(err)}`);
  }

  return { passed, total, logs };
}
