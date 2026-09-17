import { useMixerStore } from '../stores/useMixerStore';
import { MixerEngine } from '../engine/MixerEngine';
import { MixerPresetManager } from '../presets/MixerPresetManager';
import { validateEffectParameters, EffectParameters } from '../types/effect';
import { Track } from '../../editor/types/studio';

export interface TestResult {
  passed: number;
  total: number;
  logs: string[];
}

export function runMixerTests(): TestResult {
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

  logs.push('Running Phase 13 Mixer & Mastering Tests...');

  // 1. MIXER CHANNEL CREATION & SYNC TESTS
  const store = useMixerStore.getState();
  store.resetMixer();

  const mockTracks: Track[] = [
    { id: 't1', name: 'Piano Track', instrument: 'acoustic-piano', volume: 80, muted: false, solo: false, iconName: 'piano', color: '#6366f1', channel: 1 },
    { id: 't2', name: 'Guitar Track', instrument: 'guitar', volume: 90, muted: false, solo: false, iconName: 'guitar', color: '#10b981', channel: 2 },
    { id: 't3', name: 'Bass Track', instrument: 'bass', volume: 75, muted: false, solo: false, iconName: 'bass', color: '#f59e0b', channel: 3 },
  ];

  useMixerStore.getState().syncWithStudioTracks(mockTracks);

  assert(Object.keys(useMixerStore.getState().channels).length === 3, 'Mixer store creates channels for all 3 studio tracks');
  assert(useMixerStore.getState().channels['t1'] !== undefined, 'Channel for t1 exists');
  assert(useMixerStore.getState().channels['t2'].volumeDb === -4, 'Channel t2 volume dB calculated accurately');

  const engine = MixerEngine.getInstance();
  assert(engine.getChannelInputNode('t1') !== undefined, 'MixerEngine provides audio input node for track t1');

  // 2. VOLUME, PAN, MUTE & SOLO TESTS
  useMixerStore.getState().setChannelVolume('t1', -3.5);
  assert(useMixerStore.getState().channels['t1'].volumeDb === -3.5, 'Sets volume dB on channel t1');

  useMixerStore.getState().setChannelVolume('t1', 12); // Exceeds +6 dB
  assert(useMixerStore.getState().channels['t1'].volumeDb === 6, 'Clamps volume dB to maximum +6 dB');

  useMixerStore.getState().setChannelPan('t1', -50);
  assert(useMixerStore.getState().channels['t1'].pan === -50, 'Sets pan on channel t1');

  useMixerStore.getState().setChannelPan('t1', 150);
  assert(useMixerStore.getState().channels['t1'].pan === 100, 'Clamps pan to maximum +100');

  useMixerStore.getState().setChannelMute('t1', true);
  assert(useMixerStore.getState().channels['t1'].muted === true, 'Mutes channel t1');

  useMixerStore.getState().setChannelSolo('t2', true);
  assert(useMixerStore.getState().channels['t2'].solo === true, 'Solos channel t2');

  // 3. INSERT EFFECTS & PARAMETERS TESTS
  useMixerStore.getState().addChannelInsert('t1', 'filter');
  assert(useMixerStore.getState().channels['t1'].inserts.length === 1, 'Adds filter insert to track t1');
  assert(useMixerStore.getState().channels['t1'].inserts[0].type === 'filter', 'Insert type is filter');

  const insId = useMixerStore.getState().channels['t1'].inserts[0].id;
  useMixerStore.getState().updateChannelInsertParams('t1', insId, { frequency: 4500, Q: 2.5, filterType: 'highpass' });
  const updatedInsParams = useMixerStore.getState().channels['t1'].inserts[0].parameters as unknown as Record<string, unknown>;
  assert(updatedInsParams.frequency === 4500, 'Updates filter cutoff frequency to 4500 Hz');

  useMixerStore.getState().addChannelInsert('t1', 'compressor');
  assert(useMixerStore.getState().channels['t1'].inserts.length === 2, 'Adds second insert effect (compressor) to track t1');

  useMixerStore.getState().reorderChannelInserts('t1', 0, 1);
  assert(useMixerStore.getState().channels['t1'].inserts[0].type === 'compressor', 'Reorders insert chain (compressor first)');

  useMixerStore.getState().toggleChannelInsertBypass('t1', insId);
  assert(useMixerStore.getState().channels['t1'].inserts[1].bypassed === true, 'Toggles insert bypass state');

  useMixerStore.getState().removeChannelInsert('t1', insId);
  assert(useMixerStore.getState().channels['t1'].inserts.length === 1, 'Removes insert effect from chain');

  // Validate parameter sanitization
  const validGain = validateEffectParameters('gain', { gainDb: 100 } as unknown as EffectParameters) as unknown as Record<string, unknown>;
  assert(validGain.gainDb === 12, 'Sanitizes out-of-range gain parameter to 12 dB');

  const validComp = validateEffectParameters('compressor', { ratio: 50, attackMs: -10 } as unknown as EffectParameters) as unknown as Record<string, unknown>;
  assert(validComp.ratio === 20 && validComp.attackMs === 1, 'Sanitizes compressor ratio and attack ranges');

  // 4. SEND & RETURN BUS TESTS
  useMixerStore.getState().setChannelSendLevel('t1', 'reverb', -6);
  assert(useMixerStore.getState().channels['t1'].sends[0].levelDb === -6, 'Updates reverb send level to -6 dB');

  useMixerStore.getState().setReturnBusLevel('reverb', -3);
  assert(useMixerStore.getState().returnBuses[0].returnLevelDb === -3, 'Updates shared reverb return level to -3 dB');

  useMixerStore.getState().setReturnBusMute('delay', true);
  assert(useMixerStore.getState().returnBuses[1].muted === true, 'Mutes shared delay return bus');

  // 5. MASTER CHANNEL TESTS
  useMixerStore.getState().setMasterVolume(-2.0);
  assert(useMixerStore.getState().master.volumeDb === -2.0, 'Sets master volume to -2.0 dB');

  useMixerStore.getState().setMasterPan(10);
  assert(useMixerStore.getState().master.pan === 10, 'Sets master pan to 10');

  useMixerStore.getState().addMasterInsert('compressor');
  assert(useMixerStore.getState().master.inserts.length === 1, 'Adds master bus compressor insert');

  const masterMeter = engine.getMasterMeterData();
  assert(typeof masterMeter.peakDb === 'number', 'Master bus provides peak meter readings');

  // 6. MIX PRESETS TESTS
  const presetManager = MixerPresetManager.getInstance();
  const presets = presetManager.getAllPresets();
  assert(presets.length >= 5, 'Provides at least 5 built-in mix presets');

  const vocalPreset = presetManager.getPreset('vocal-space');
  assert(vocalPreset !== null && vocalPreset.name === 'Vocal Space', 'Retrieves Vocal Space mix preset');

  useMixerStore.getState().applyPreset('vocal-space');
  assert(useMixerStore.getState().activePresetId === 'vocal-space', 'Applies Vocal Space preset to mixer');
  assert(useMixerStore.getState().channels['t1'].volumeDb === 2, 'Channel t1 volume updated from applied preset');

  const customId = useMixerStore.getState().saveCurrentAsPreset('My Custom Mix', 'Test mix preset');
  assert(presetManager.getPreset(customId) !== null, 'Saves custom mix preset');
  assert(presetManager.deleteCustomPreset(customId) === true, 'Deletes custom mix preset');

  // 7. SERIALIZATION & BACKWARD COMPATIBILITY TESTS
  const serialized = useMixerStore.getState().serializeState();
  assert(serialized.version === 4, 'Serialized mixer state has schema version 4');
  assert(serialized.channels['t1'] !== undefined, 'Serialized state includes channel t1 configuration');

  useMixerStore.getState().resetMixer();
  assert(Object.keys(useMixerStore.getState().channels).length === 0, 'Reset mixer clears all channels');

  useMixerStore.getState().loadSerializedState(serialized);
  assert(Object.keys(useMixerStore.getState().channels).length === 3, 'Loads serialized V4 mixer state');

  // Test V1/V2/V3 project compatibility fallback (missing mixer state)
  useMixerStore.getState().resetMixer();
  useMixerStore.getState().syncWithStudioTracks(mockTracks);
  assert(Object.keys(useMixerStore.getState().channels).length === 3, 'Auto-generates clean mixer channels for legacy V1/V2/V3 project import');

  return {
    passed,
    total,
    logs,
  };
}
