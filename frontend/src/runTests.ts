import { runCompositionEngineTests } from './features/composition/__tests__/composition.test';

console.log('Running Composition Engine Tests...');
try {
  const result = runCompositionEngineTests();
  console.log(`Composition Engine Tests: ${result.passed}/${result.total} PASSED.`);
  result.logs.forEach((log) => console.log(log));
  process.exit(0);
} catch (err: any) {
  console.error('Test Suite Failed:', err.message);
  process.exit(1);
}
