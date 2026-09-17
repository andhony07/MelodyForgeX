/* Safe Tone.js node instantiators for headless Node test environments */
import * as Tone from 'tone';

export interface AudioParamMock {
  value: number;
}

export interface GenericAudioNode {
  gain?: AudioParamMock;
  volume?: AudioParamMock;
  pan?: AudioParamMock;
  frequency?: AudioParamMock;
  Q?: AudioParamMock;
  low?: AudioParamMock;
  mid?: AudioParamMock;
  high?: AudioParamMock;
  threshold?: AudioParamMock;
  ratio?: AudioParamMock;
  attack?: AudioParamMock;
  release?: AudioParamMock;
  knee?: AudioParamMock;
  roomSize?: AudioParamMock;
  dampening?: AudioParamMock;
  wet?: AudioParamMock;
  delayTime?: AudioParamMock;
  feedback?: AudioParamMock;
  type?: string;
  getValue?: () => number | number[];
  connect?: (target?: unknown) => void;
  disconnect?: () => void;
  dispose?: () => void;
  toDestination?: () => void;
  [key: string]: unknown;
}

export function createSafeGain(initialGain = 1): GenericAudioNode {
  try {
    const node = new Tone.Gain(initialGain);
    if (node && node.gain) return node as unknown as GenericAudioNode;
  } catch {
    /* fallback mock */
  }
  return {
    gain: { value: initialGain },
    connect: () => {},
    disconnect: () => {},
    dispose: () => {},
  };
}

export function createSafeVolume(initialDb = 0): GenericAudioNode {
  try {
    const node = new Tone.Volume(initialDb);
    if (node && node.volume) return node as unknown as GenericAudioNode;
  } catch {
    /* fallback mock */
  }
  return {
    volume: { value: initialDb },
    connect: () => {},
    disconnect: () => {},
    dispose: () => {},
  };
}

export function createSafePanner(initialPan = 0): GenericAudioNode {
  try {
    const node = new Tone.Panner(initialPan);
    if (node && node.pan) return node as unknown as GenericAudioNode;
  } catch {
    /* fallback mock */
  }
  return {
    pan: { value: initialPan },
    connect: () => {},
    disconnect: () => {},
    dispose: () => {},
  };
}

export function createSafeFilter(freq = 1000, Q = 1, type = 'lowpass'): GenericAudioNode {
  try {
    const node = new Tone.Filter({ frequency: freq, Q, type: type as BiquadFilterType });
    if (node && node.frequency) return node as unknown as GenericAudioNode;
  } catch {
    /* fallback mock */
  }
  return {
    frequency: { value: freq },
    Q: { value: Q },
    type,
    connect: () => {},
    disconnect: () => {},
    dispose: () => {},
  };
}

export function createSafeEQ(low = 0, mid = 0, high = 0): GenericAudioNode {
  try {
    const node = new Tone.EQ3({ low, mid, high });
    if (node && node.low) return node as unknown as GenericAudioNode;
  } catch {
    /* fallback mock */
  }
  return {
    low: { value: low },
    mid: { value: mid },
    high: { value: high },
    connect: () => {},
    disconnect: () => {},
    dispose: () => {},
  };
}

export function createSafeCompressor(
  threshold = -20,
  ratio = 4,
  attack = 0.01,
  release = 0.25,
  knee = 5
): GenericAudioNode {
  try {
    const node = new Tone.Compressor({ threshold, ratio, attack, release, knee });
    if (node && node.threshold) return node as unknown as GenericAudioNode;
  } catch {
    /* fallback mock */
  }
  return {
    threshold: { value: threshold },
    ratio: { value: ratio },
    attack: { value: attack },
    release: { value: release },
    knee: { value: knee },
    connect: () => {},
    disconnect: () => {},
    dispose: () => {},
  };
}

export function createSafeReverb(roomSize = 0.5, dampening = 3000, wet = 0.3): GenericAudioNode {
  try {
    const node = new Tone.Freeverb({ roomSize, dampening, wet });
    if (node && node.roomSize) return node as unknown as GenericAudioNode;
  } catch {
    /* fallback mock */
  }
  return {
    roomSize: { value: roomSize },
    dampening: { value: dampening },
    wet: { value: wet },
    connect: () => {},
    disconnect: () => {},
    dispose: () => {},
  };
}

export function createSafeDelay(delayTime = 0.25, feedback = 0.3, wet = 0.25): GenericAudioNode {
  try {
    const node = new Tone.FeedbackDelay({ delayTime, feedback, wet });
    if (node && node.delayTime) return node as unknown as GenericAudioNode;
  } catch {
    /* fallback mock */
  }
  return {
    delayTime: { value: delayTime },
    feedback: { value: feedback },
    wet: { value: wet },
    connect: () => {},
    disconnect: () => {},
    dispose: () => {},
  };
}

export function createSafeMeter(): GenericAudioNode {
  try {
    const node = new Tone.Meter({ smoothing: 0.8 });
    if (node && typeof node.getValue === 'function') return node as unknown as GenericAudioNode;
  } catch {
    /* fallback mock */
  }
  return {
    getValue: () => -60,
    connect: () => {},
    disconnect: () => {},
    dispose: () => {},
  };
}

export function createSafeLimiter(thresholdDb = -0.1): GenericAudioNode {
  try {
    const node = new Tone.Limiter(thresholdDb);
    if (node && node.threshold) return node as unknown as GenericAudioNode;
  } catch {
    /* fallback mock */
  }
  return {
    threshold: { value: thresholdDb },
    connect: () => {},
    disconnect: () => {},
    dispose: () => {},
    toDestination: () => {},
  };
}
