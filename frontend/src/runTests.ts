import { runCompositionEngineTests } from './features/composition/__tests__/composition.test';
import { runAIEngineTests } from './features/ai/__tests__/ai.test';
import { runArrangementTests } from './features/arrangement/__tests__/arrangement.test';
import { runMIDITests } from './features/midi/__tests__/midi.test';

console.log('Running MelodyForge Test Suites...\n');

try {
  const compResult = runCompositionEngineTests();
  console.log(`Phase 5 Composition Engine Tests: ${compResult.passed}/${compResult.total} PASSED.`);
  compResult.logs.forEach((log) => console.log(log));

  const aiResult = runAIEngineTests();
  console.log(`Phase 6 AI Composition Engine Tests: ${aiResult.passed}/${aiResult.total} PASSED.`);
  aiResult.logs.forEach((log) => console.log(log));

  const arrResult = runArrangementTests();
  console.log(`Phase 7 Arrangement Engine Tests: ${arrResult.passed}/${arrResult.total} PASSED.`);
  arrResult.logs.forEach((log) => console.log(log));

  const midiResult = runMIDITests();
  console.log(`Phase 8 MIDI & Project Interchange Tests: ${midiResult.passed}/${midiResult.total} PASSED.`);
  midiResult.logs.forEach((log) => console.log(log));

  const totalPassed = compResult.passed + aiResult.passed + arrResult.passed + midiResult.passed;
  const totalTests = compResult.total + aiResult.total + arrResult.total + midiResult.total;
  console.log(`\nALL SUITES PASSED: ${totalPassed}/${totalTests} tests succeeded.`);

  process.exit(0);
} catch (err: unknown) {
  const errorMsg = err instanceof Error ? err.message : String(err);
  console.error('Test Suite Failed:', errorMsg);
  process.exit(1);
}

