import { useStudioStore } from '../../editor/stores/useStudioStore';
import { usePianoRollStore } from '../../editor/stores/usePianoRollStore';
import { useArrangementStore } from '../../arrangement/stores/useArrangementStore';
import { useMixerStore } from '../../mixer/stores/useMixerStore';
import { useProductionAssistantStore } from '../../production/stores/useProductionAssistantStore';
import { useRecordingStore } from '../../recording/stores/useRecordingStore';
import { ToneAudioEngine } from '../../audio/engine/ToneAudioEngine';
import { MixerEngine } from '../../mixer/engine/MixerEngine';
import { PresetManager } from '../../audio/presets/PresetManager';
import { buildProductionContext } from '../../production/analysis/productionContextBuilder';
import { analyzeProductionProject } from '../../production/analysis/productionAnalyzer';
import { validateMelodyForgeProjectFile } from '../../projects/services/projectSerializer';
import { calculateRenderScope } from '../../recording/services/offlineRenderer';
import { Track } from '../../editor/types/studio';
import { Note } from '../../editor/types/note';
import { ArrangementSection } from '../../arrangement/types/arrangementSection';

export interface TestResult {
  passed: number;
  total: number;
  logs: string[];
}

export function runIntegrationTests(): TestResult {
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

  logs.push('Running Phase 15 Final DAW Integration & Release Hardening Tests...');

  // Reset Stores
  const mockTracks: Track[] = [
    { id: 'track-1', name: 'Lead Piano', instrument: 'acoustic-piano', color: '#6366f1', iconName: 'piano', volume: 80, muted: false, solo: false, channel: 1 },
    { id: 'track-2', name: 'Synth Bass', instrument: 'bass', color: '#f59e0b', iconName: 'bass', volume: 85, muted: false, solo: false, channel: 2 },
  ];

  const mockNotes: Note[] = [
    { id: 'n1', trackId: 'track-1', pitch: 60, startBeat: 1, durationBeats: 1, velocity: 100 },
    { id: 'n2', trackId: 'track-1', pitch: 64, startBeat: 2, durationBeats: 1, velocity: 90 },
  ];

  const mockSection: ArrangementSection = {
    id: 'sec-1',
    name: 'Verse',
    type: 'Verse',
    startBar: 1,
    lengthBars: 8,
    order: 0,
    color: '#444',
  };

  useStudioStore.setState({
    tempo: 120,
    key: 'C',
    mode: 'Major',
    timeSignature: '4/4',
    zoom: 100,
    isLooping: false,
    tracks: mockTracks,
    selectedTrackId: 'track-1',
  });

  usePianoRollStore.setState({
    notesByTrackId: {
      'track-1': mockNotes,
      'track-2': [],
    },
  });

  useArrangementStore.setState({
    sections: [mockSection],
    totalBars: 32,
    selectedSectionId: 'sec-1',
    automationLanes: [],
    automationEnabled: true,
  });

  useMixerStore.getState().syncWithStudioTracks(mockTracks);
  useProductionAssistantStore.getState().reset();
  useRecordingStore.getState().clearAllRecordings();

  // 1. WORKFLOW A & HARDENING — Audio Engine & Mixer Routing
  const audioEngine = ToneAudioEngine.getInstance();
  audioEngine.updateTrackControls(mockTracks);
  const inst1 = audioEngine.getInstrumentForTrack(mockTracks[0]);
  assert(inst1 !== undefined, 'Workflow A: Instantiates instrument for Lead Piano');

  const mixerEngine = MixerEngine.getInstance();
  const chan1Input = mixerEngine.getChannelInputNode('track-1');
  assert(chan1Input !== undefined, 'Workflow A: Provides mixer channel audio input node');

  // Track Removal Cleanup Hardening
  const singleTrack = [mockTracks[0]];
  audioEngine.updateTrackControls(singleTrack);
  useMixerStore.getState().syncWithStudioTracks(singleTrack);
  assert(useMixerStore.getState().channels['track-2'] === undefined, 'Audio Hardening: Disposes channel node on track removal');

  // Restore tracks
  audioEngine.updateTrackControls(mockTracks);
  useMixerStore.getState().syncWithStudioTracks(mockTracks);

  // 2. WORKFLOW D & E — Arrangement & Automation Integration
  const laneId = useArrangementStore.getState().addAutomationLane('track', 'track-1', 'volume');
  useArrangementStore.getState().addAutomationPoint(laneId, 1, 0.8);
  const evaluatedVol = useArrangementStore.getState().evaluateAutomation('track', 'track-1', 'volume', 1, -1);
  assert(evaluatedVol === 0.8, 'Workflow E: Evaluates track volume automation accurately at beat 1');

  // 3. WORKFLOW H — Offline Rendering Scope
  const renderScope = calculateRenderScope('full_project', { bpm: 120, notesByTrackId: { 'track-1': mockNotes } });
  assert(renderScope.durationSeconds >= 1, 'Workflow H: Offline renderer scope calculates positive render duration');

  // 4. WORKFLOW I — AI Production Assistant Integration
  const prodContext = buildProductionContext('analyze');
  const { report, suggestions } = analyzeProductionProject(prodContext, 'analyze');
  assert(report.projectStats.trackCount === 2, 'Workflow I: Context builder extracts 2 active tracks');
  assert(Array.isArray(suggestions), 'Workflow I: Analyzer outputs recommendations list');

  // 5. WORKFLOW J — Project Serialization V1-V5 Roundtrip Hardening
  const legacyV1Payload = {
    format: 'melodyforge-project',
    tracks: mockTracks,
    notesByTrackId: { 'track-1': mockNotes },
  };

  const validatedV1 = validateMelodyForgeProjectFile(legacyV1Payload);
  assert(validatedV1.version === 1, 'Workflow J: Automatically assigns version 1 to legacy unversioned project files');
  assert(validatedV1.metadata.title === 'Untitled Project', 'Workflow J: Provides default metadata title fallback for legacy files');

  const v5Payload = {
    version: 5,
    format: 'melodyforge-project',
    metadata: { title: 'Hardened DAW Project', createdAt: '2026-09-17T20:00:00Z', updatedAt: '2026-09-17T20:00:00Z' },
    studio: { tempo: 128, key: 'G', mode: 'Minor', timeSignature: '4/4', zoom: 100, isLooping: true },
    tracks: mockTracks,
    notesByTrackId: { 'track-1': mockNotes },
    arrangement: { sections: [mockSection], totalBars: 32 },
    customPresets: [],
  };

  const validatedV5 = validateMelodyForgeProjectFile(v5Payload);
  assert(validatedV5.version === 5, 'Workflow J: Validates Schema V5 project payload cleanly');
  assert(validatedV5.studio.key === 'G', 'Workflow J: Preserves key G Minor across project serialization');

  // Preset Manager built-in verification
  const presetMgr = PresetManager.getInstance();
  const presets = presetMgr.getAllPresets();
  assert(presets.length >= 5, 'Instrument System: Provides at least 5 built-in instrument presets');

  return { passed, total, logs };
}
