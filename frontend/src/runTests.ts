import { runCompositionEngineTests } from './features/composition/__tests__/composition.test';
import { runAIEngineTests } from './features/ai/__tests__/ai.test';
import { runArrangementTests } from './features/arrangement/__tests__/arrangement.test';
import { runMIDITests } from './features/midi/__tests__/midi.test';
import { runAutomationTests } from './features/arrangement/__tests__/automation.test';
import { runArrangementIntelligenceTests } from './features/arrangement/__tests__/intelligence.test';

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

  const autoResult = runAutomationTests();
  console.log(`Phase 9 Advanced Arrangement & Automation Engine Tests: ${autoResult.passed}/${autoResult.total} PASSED.`);
  autoResult.logs.forEach((log) => console.log(log));

  const intelResult = runArrangementIntelligenceTests();
  console.log(`Phase 10 Smart Arrangement & Musical Intelligence Tests: ${intelResult.passed}/${intelResult.total} PASSED.`);
  intelResult.logs.forEach((log) => console.log(log));

  const totalPassed =
    compResult.passed +
    aiResult.passed +
    arrResult.passed +
    midiResult.passed +
    autoResult.passed +
    intelResult.passed;

  const totalTests =
    compResult.total +
    aiResult.total +
    arrResult.total +
    midiResult.total +
    autoResult.total +
    intelResult.total;

  console.log(`\nALL SUITES PASSED: ${totalPassed}/${totalTests} tests succeeded.`);

  process.exit(0);
} catch (err: unknown) {
  const errorMsg = err instanceof Error ? err.message : String(err);
  console.error('Test Suite Failed:', errorMsg);
  process.exit(1);
}
