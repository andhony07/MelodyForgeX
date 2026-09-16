export interface SeededRandom {
  nextFloat(): number; // returns 0.0 <= x < 1.0
  nextInt(min: number, max: number): number; // returns integer in [min, max]
  choice<T>(array: T[]): T;
}

// Linear Congruential Generator (LCG) PRNG for 100% deterministic reproducibility
export const createSeededRandom = (seedInput: number | string = 12345): SeededRandom => {
  let seed = 0;
  if (typeof seedInput === 'string') {
    for (let i = 0; i < seedInput.length; i++) {
      seed = (seed << 5) - seed + seedInput.charCodeAt(i);
      seed |= 0;
    }
  } else {
    seed = seedInput;
  }

  // Ensure positive initial seed
  if (seed <= 0) seed += 2147483646;

  const nextFloat = (): number => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const nextInt = (min: number, max: number): number => {
    const floatVal = nextFloat();
    return Math.floor(floatVal * (max - min + 1)) + min;
  };

  const choice = <T>(array: T[]): T => {
    if (array.length === 0) throw new Error('Cannot pick choice from empty array');
    const index = nextInt(0, array.length - 1);
    return array[index];
  };

  return { nextFloat, nextInt, choice };
};
