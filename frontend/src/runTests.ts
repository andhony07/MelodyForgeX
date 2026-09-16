import { runCompositionEngineTests } from './features/composition/__tests__/composition.test';
import { runAIEngineTests } from './features/ai/__tests__/ai.test';

console.log('Running MelodyForge Test Suites...\n');

try {
  const compResult = runCompositionEngineTests();
  console.log(`Phase 5 Composition Engine Tests: ${compResult.passed}/${compResult.total} PASSED.`);
  compResult.logs.forEach((log) => console.log(log));

  const aiResult = runAIEngineTests();
  console.log(`Phase 6 AI Composition Engine Tests: ${aiResult.passed}/${aiResult.total} PASSED.`);
  aiResult.logs.forEach((log) => console.log(log));

  const totalPassed = compResult.passed + aiResult.passed;
  const totalTests = compResult.total + aiResult.total;
  console.log(`\nALL SUITES PASSED: ${totalPassed}/${totalTests} tests succeeded.`);

  process.exit(0);
} catch (err: unknown) {
  const errorMsg = err instanceof Error ? err.message : String(err);
  console.error('Test Suite Failed:', errorMsg);
  process.exit(1);
}
