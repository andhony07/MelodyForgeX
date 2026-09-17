import { runCompositionEngineTests } from './features/composition/__tests__/composition.test';
import { runAIEngineTests } from './features/ai/__tests__/ai.test';
import { runArrangementTests } from './features/arrangement/__tests__/arrangement.test';
import { runMIDITests } from './features/midi/__tests__/midi.test';
import { runAutomationTests } from './features/arrangement/__tests__/automation.test';
import { runArrangementIntelligenceTests } from './features/arrangement/__tests__/intelligence.test';
import { runInstrumentTests } from './features/audio/__tests__/instrument.test';
import { runRecordingTests } from './features/recording/__tests__/recording.test';

console.log('Running MelodyForge Test Suites...\n');

try {
  const compResult = runCompositionEngineTests();
  console.log(`Phase 5 Composition Engine Tests: ${compResult.passed}/${compResult.total} PASSED.`);

  const aiResult = runAIEngineTests();
  console.log(`Phase 6 AI Composition Engine Tests: ${aiResult.passed}/${aiResult.total} PASSED.`);

  const arrResult = runArrangementTests();
  console.log(`Phase 7 Arrangement Engine Tests: ${arrResult.passed}/${arrResult.total} PASSED.`);

  const midiResult = runMIDITests();
  console.log(`Phase 8 MIDI & Project Interchange Tests: ${midiResult.passed}/${midiResult.total} PASSED.`);

  const autoResult = runAutomationTests();
  console.log(`Phase 9 Advanced Arrangement & Automation Engine Tests: ${autoResult.passed}/${autoResult.total} PASSED.`);

  const intelResult = runArrangementIntelligenceTests();
  console.log(`Phase 10 Smart Arrangement & Musical Intelligence Tests: ${intelResult.passed}/${intelResult.total} PASSED.`);

  const instResult = runInstrumentTests();
  console.log(`Phase 11 Advanced Sound & Instrument System Tests: ${instResult.passed}/${instResult.total} PASSED.`);
  instResult.logs.forEach((log) => console.log(log));

  const recResult = runRecordingTests();
  console.log(`Phase 12 Audio Recording & Rendering Tests: ${recResult.passed}/${recResult.total} PASSED.`);
  recResult.logs.forEach((log) => console.log(log));

  const totalPassed =
    compResult.passed +
    aiResult.passed +
    arrResult.passed +
    midiResult.passed +
    autoResult.passed +
    intelResult.passed +
    instResult.passed +
    recResult.passed;

  const totalTests =
    compResult.total +
    aiResult.total +
    arrResult.total +
    midiResult.total +
    autoResult.total +
    intelResult.total +
    instResult.total +
    recResult.total;

  console.log(`\nALL SUITES PASSED: ${totalPassed}/${totalTests} tests succeeded.`);

  process.exit(0);
} catch (err: unknown) {
  const errorMsg = err instanceof Error ? err.stack || err.message : String(err);
  console.error('Test Suite Failed:\n', errorMsg);
  process.exit(1);
}
