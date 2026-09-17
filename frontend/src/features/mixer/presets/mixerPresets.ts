import { MixPreset } from '../types/mixer';

export const BUILT_IN_MIX_PRESETS: MixPreset[] = [
  {
    id: 'clean-mix',
    name: 'Clean Mix',
    description: 'Balanced, transparent mix with gentle EQ and subtle room reverb.',
    isBuiltIn: true,
    channelDefaults: {
      volumeDb: 0,
      pan: 0,
      inserts: [
        {
          id: 'ins-clean-eq',
          type: 'eq',
          name: '3-Band EQ',
          bypassed: false,
          parameters: { lowGainDb: 0, midGainDb: 0, highGainDb: 1 },
        },
      ],
      sends: [
        { busType: 'reverb', levelDb: -12, enabled: true },
        { busType: 'delay', levelDb: -60, enabled: false },
      ],
    },
    returnBuses: [
      { busType: 'reverb', name: 'Studio Reverb', returnLevelDb: -3, muted: false, decaySeconds: 1.8 },
      { busType: 'delay', name: 'Stereo Delay', returnLevelDb: -6, muted: false, delayTimeSeconds: 0.25, feedback: 0.3 },
    ],
    master: {
      volumeDb: 0,
      pan: 0,
      muted: false,
      limiterEnabled: true,
      limiterThresholdDb: -0.1,
      inserts: [
        {
          id: 'master-comp',
          type: 'compressor',
          name: 'Bus Compressor',
          bypassed: false,
          parameters: { thresholdDb: -12, ratio: 2, attackMs: 30, releaseMs: 150, kneeDb: 5 },
        },
      ],
    },
  },
  {
    id: 'vocal-space',
    name: 'Vocal Space',
    description: 'Spacious reverb and dynamic delay tailored for lead melody and vocals.',
    isBuiltIn: true,
    channelDefaults: {
      volumeDb: 2,
      pan: 0,
      inserts: [
        {
          id: 'ins-vocal-comp',
          type: 'compressor',
          name: 'Vocal Compressor',
          bypassed: false,
          parameters: { thresholdDb: -18, ratio: 3.5, attackMs: 15, releaseMs: 200, kneeDb: 6 },
        },
        {
          id: 'ins-vocal-eq',
          type: 'eq',
          name: 'Air EQ',
          bypassed: false,
          parameters: { lowGainDb: -2, midGainDb: 1, highGainDb: 3 },
        },
      ],
      sends: [
        { busType: 'reverb', levelDb: -6, enabled: true },
        { busType: 'delay', levelDb: -10, enabled: true },
      ],
    },
    returnBuses: [
      { busType: 'reverb', name: 'Hall Reverb', returnLevelDb: 0, muted: false, decaySeconds: 3.2 },
      { busType: 'delay', name: 'Echo Delay', returnLevelDb: -3, muted: false, delayTimeSeconds: 0.375, feedback: 0.35 },
    ],
    master: {
      volumeDb: 0,
      pan: 0,
      muted: false,
      limiterEnabled: true,
      limiterThresholdDb: -0.1,
      inserts: [],
    },
  },
  {
    id: 'wide-synth',
    name: 'Wide Synth',
    description: 'Stereo enhancement with active filter sculpting and rich delay feedback.',
    isBuiltIn: true,
    channelDefaults: {
      volumeDb: -1,
      pan: 0,
      inserts: [
        {
          id: 'ins-synth-filter',
          type: 'filter',
          name: 'Lowpass Filter',
          bypassed: false,
          parameters: { frequency: 8500, Q: 1.2, filterType: 'lowpass' },
        },
      ],
      sends: [
        { busType: 'reverb', levelDb: -8, enabled: true },
        { busType: 'delay', levelDb: -6, enabled: true },
      ],
    },
    returnBuses: [
      { busType: 'reverb', name: 'Ambient Reverb', returnLevelDb: -2, muted: false, decaySeconds: 2.5 },
      { busType: 'delay', name: 'Wide Delay', returnLevelDb: -2, muted: false, delayTimeSeconds: 0.25, feedback: 0.45 },
    ],
    master: {
      volumeDb: 0,
      pan: 0,
      muted: false,
      limiterEnabled: true,
      limiterThresholdDb: -0.1,
      inserts: [],
    },
  },
  {
    id: 'punchy-drums',
    name: 'Punchy Drums',
    description: 'Tight compression with low-end boost for maximum transient impact.',
    isBuiltIn: true,
    channelDefaults: {
      volumeDb: 1,
      pan: 0,
      inserts: [
        {
          id: 'ins-drum-comp',
          type: 'compressor',
          name: 'Punch Compressor',
          bypassed: false,
          parameters: { thresholdDb: -14, ratio: 4, attackMs: 25, releaseMs: 100, kneeDb: 4 },
        },
        {
          id: 'ins-drum-eq',
          type: 'eq',
          name: 'Punch EQ',
          bypassed: false,
          parameters: { lowGainDb: 3, midGainDb: -1, highGainDb: 2 },
        },
      ],
      sends: [
        { busType: 'reverb', levelDb: -18, enabled: true },
        { busType: 'delay', levelDb: -60, enabled: false },
      ],
    },
    returnBuses: [
      { busType: 'reverb', name: 'Gated Reverb', returnLevelDb: -8, muted: false, decaySeconds: 1.2 },
      { busType: 'delay', name: 'Slapback Delay', returnLevelDb: -12, muted: false, delayTimeSeconds: 0.1, feedback: 0.1 },
    ],
    master: {
      volumeDb: 0,
      pan: 0,
      muted: false,
      limiterEnabled: true,
      limiterThresholdDb: -0.1,
      inserts: [],
    },
  },
  {
    id: 'warm-mix',
    name: 'Warm Mix',
    description: 'Analog warmth with smooth high-frequency roll-off and cohesive glue compression.',
    isBuiltIn: true,
    channelDefaults: {
      volumeDb: 0,
      pan: 0,
      inserts: [
        {
          id: 'ins-warm-eq',
          type: 'eq',
          name: 'Warmth EQ',
          bypassed: false,
          parameters: { lowGainDb: 2, midGainDb: 1, highGainDb: -1 },
        },
      ],
      sends: [
        { busType: 'reverb', levelDb: -10, enabled: true },
        { busType: 'delay', levelDb: -14, enabled: true },
      ],
    },
    returnBuses: [
      { busType: 'reverb', name: 'Warm Plate', returnLevelDb: -4, muted: false, decaySeconds: 2.2 },
      { busType: 'delay', name: 'Tape Delay', returnLevelDb: -6, muted: false, delayTimeSeconds: 0.3, feedback: 0.25 },
    ],
    master: {
      volumeDb: 0,
      pan: 0,
      muted: false,
      limiterEnabled: true,
      limiterThresholdDb: -0.1,
      inserts: [
        {
          id: 'master-warm-comp',
          type: 'compressor',
          name: 'Glue Compressor',
          bypassed: false,
          parameters: { thresholdDb: -10, ratio: 2.5, attackMs: 40, releaseMs: 180, kneeDb: 8 },
        },
      ],
    },
  },
];
