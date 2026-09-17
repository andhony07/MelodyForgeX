import { InstrumentRegistry } from '../instruments/InstrumentRegistry';
import { InstrumentFactory } from '../instruments/InstrumentFactory';
import { PresetManager } from '../presets/PresetManager';
import { SampleInstrument } from '../instruments/SampleInstrument';
import { validateInstrumentId, sanitizeParameters } from '../utils/instrumentValidation';
import { AcousticPianoSynth } from '../instruments/SynthInstruments';
import { InstrumentPreset } from '../types/instrument';
import { useStudioStore } from '../../editor/stores/useStudioStore';
import { validateMelodyForgeProjectFile } from '../../projects/services/projectSerializer';

export interface TestResult {
  passed: number;
  total: number;
  logs: string[];
}

export function runInstrumentTests(): TestResult {
  const logs: string[] = [];
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, message: string) {
    total++;
    if (condition) {
      passed++;
      logs.push(`  ✓ ${message}`);
    } else {
      logs.push(`  ✗ FAIL: ${message}`);
      throw new Error(`Test assertion failed: ${message}`);
    }
  }

  // 1. INSTRUMENT REGISTRY & FALLBACK TESTS
  const registry = InstrumentRegistry.getInstance();

  assert(registry.hasInstrument('acoustic-piano'), 'Registry has acoustic-piano');
  assert(registry.hasInstrument('guitar'), 'Registry has guitar');
  assert(registry.hasInstrument('bass'), 'Registry has bass');
  assert(registry.hasInstrument('synth-lead'), 'Registry has synth-lead');
  assert(registry.hasInstrument('drum-kit'), 'Registry has drum-kit');
  assert(registry.listInstruments().length >= 9, 'Registry lists at least 9 distinct instruments');

  const pianoInst = registry.getInstrument('acoustic-piano');
  assert(pianoInst !== null && pianoInst.id === 'acoustic-piano', 'Registry instantiates acoustic piano');
  pianoInst.dispose();

  const factoryInst = InstrumentFactory.createInstrument('electric-piano');
  assert(factoryInst !== null && factoryInst.id === 'electric-piano', 'InstrumentFactory creates electric piano');
  factoryInst.dispose();

  const fallbackInst = registry.getInstrument('non-existent-instrument-xyz');
  assert(fallbackInst !== null && fallbackInst.id === 'acoustic-piano', 'Missing instrument safely falls back to acoustic piano');
  fallbackInst.dispose();

  assert(validateInstrumentId('PIANO') === 'acoustic-piano', 'Legacy uppercase name maps to acoustic-piano');
  assert(validateInstrumentId('guitar') === 'guitar', 'Lowercase guitar maps to guitar');
  assert(validateInstrumentId('unknown') === 'acoustic-piano', 'Unknown string maps to safe fallback');

  // 2. PRESETS & PRESET MANAGER TESTS
  const presetManager = PresetManager.getInstance();
  const allPresets = presetManager.getAllPresets();
  assert(allPresets.length >= 10, 'PresetManager provides built-in presets');

  const concertPiano = presetManager.getPreset('concert-piano');
  assert(concertPiano !== undefined && concertPiano.category === 'Piano', 'Retrieves concert-piano preset');

  const guitarPresets = presetManager.getPresetsForInstrument('guitar');
  assert(guitarPresets.length > 0, 'Retrieves presets for guitar');

  // Test custom preset save & load
  const customPreset: InstrumentPreset = {
    id: 'custom-test-pad',
    name: 'Custom Cosmic Pad',
    instrumentId: 'synth-pad',
    category: 'Pad',
    isBuiltIn: false,
    version: 1,
    parameters: {
      attack: 0.8,
      release: 2.5,
      cutoff: 4200,
    },
  };

  const saveSuccess = presetManager.saveCustomPreset(customPreset);
  assert(saveSuccess, 'Successfully saves custom preset');

  const fetchedCustom = presetManager.getPreset('custom-test-pad');
  assert(fetchedCustom !== undefined && fetchedCustom.name === 'Custom Cosmic Pad', 'Fetches saved custom preset');

  const deleteSuccess = presetManager.deleteCustomPreset('custom-test-pad');
  assert(deleteSuccess, 'Successfully deletes custom preset');
  assert(presetManager.getPreset('custom-test-pad') === undefined, 'Deleted custom preset is no longer present');

  // Preset validation
  assert(presetManager.validatePreset(concertPiano), 'Validates valid preset');
  assert(!presetManager.validatePreset(null), 'Rejects null preset');
  assert(!presetManager.validatePreset({ name: 'incomplete' }), 'Rejects incomplete preset payload');

  // 3. SYNTH & SAMPLE INSTRUMENT ABSTRACTIONS
  const synthPiano = new AcousticPianoSynth(80);
  assert(synthPiano.getParameters().volume === 80, 'Synth piano has volume initialized to 80');
  synthPiano.setParameter('cutoff', 4000);
  assert(synthPiano.getParameters().cutoff === 4000, 'Sets parameter cutoff correctly');
  synthPiano.dispose();

  const sampleInst = new SampleInstrument('sample-piano', 'Sample Grand Piano', 'Piano', null, new AcousticPianoSynth(75));
  assert(sampleInst.type === 'sample', 'SampleInstrument has type sample');
  assert(sampleInst.getStatus() === 'idle', 'SampleInstrument starts in idle status');
  sampleInst.dispose();

  // Parameter Sanitization
  const rawParams = { attack: 10.0, release: -1.0, cutoff: 50000, volume: 150, pan: -2.0 };
  const sanitized = sanitizeParameters(rawParams);
  assert(sanitized.attack === 5.0, 'Clamps attack to max 5.0s');
  assert(sanitized.release === 0.01, 'Clamps release to min 0.01s');
  assert(sanitized.cutoff === 20000, 'Clamps cutoff to max 20000Hz');
  assert(sanitized.volume === 100, 'Clamps volume to max 100');
  assert(sanitized.pan === -1.0, 'Clamps pan to min -1.0');

  // 4. TRACK INTEGRATION & INDEPENDENT INSTRUMENTS
  const store = useStudioStore.getState();
  const track1 = store.tracks[0];
  assert(track1 !== undefined, 'Store has initial track');

  store.setTrackInstrument(track1.id, 'guitar');
  const updatedTrack1 = useStudioStore.getState().tracks.find((t) => t.id === track1.id);
  assert(updatedTrack1?.instrument === 'guitar', 'Updates track instrument to guitar');

  store.setTrackPreset(track1.id, 'acoustic-guitar-preset');
  const presetTrack1 = useStudioStore.getState().tracks.find((t) => t.id === track1.id);
  assert(presetTrack1?.presetId === 'acoustic-guitar-preset', 'Updates track preset to acoustic-guitar-preset');

  // Verify independent tracks
  if (store.tracks.length > 1) {
    const track2 = store.tracks[1];
    store.setTrackInstrument(track2.id, 'bass');
    const finalTrack1 = useStudioStore.getState().tracks.find((t) => t.id === track1.id);
    const finalTrack2 = useStudioStore.getState().tracks.find((t) => t.id === track2.id);
    assert(finalTrack1?.instrument === 'guitar', 'Track 1 instrument remains guitar');
    assert(finalTrack2?.instrument === 'bass', 'Track 2 instrument independent as bass');
  }

  // 5. PROJECT SERIALIZATION COMPATIBILITY
  const validV2Payload = {
    version: 2,
    format: 'melodyforge-project',
    metadata: { title: 'Test Project', createdAt: '', updatedAt: '' },
    studio: { tempo: 120, key: 'C', mode: 'Major', timeSignature: '4/4', zoom: 100, isLooping: false },
    tracks: [{ id: 'tr-1', name: 'Piano', instrument: 'piano', muted: false, solo: false, volume: 80, color: '#fff', channel: 1 }],
    notesByTrackId: { 'tr-1': [] },
    arrangement: { sections: [], totalBars: 32 },
  };

  const validatedV2 = validateMelodyForgeProjectFile(validV2Payload);
  assert(validatedV2.version === 2, 'Validates legacy V2 project payload cleanly');

  const validV3Payload = {
    ...validV2Payload,
    version: 3,
    customPresets: [customPreset],
  };

  const validatedV3 = validateMelodyForgeProjectFile(validV3Payload);
  assert(validatedV3.version === 3, 'Validates V3 project payload cleanly');

  return { passed, total, logs };
}
