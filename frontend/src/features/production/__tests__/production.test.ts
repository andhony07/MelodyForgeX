import { useStudioStore } from '../../editor/stores/useStudioStore';
import { useMixerStore } from '../../mixer/stores/useMixerStore';
import { useArrangementStore } from '../../arrangement/stores/useArrangementStore';
import { useProductionAssistantStore } from '../stores/useProductionAssistantStore';
import { buildProductionContext } from '../analysis/productionContextBuilder';
import { analyzeProductionProject } from '../analysis/productionAnalyzer';
import { parseAIProductionResponse } from '../ai/aiProductionParser';
import { ProductionSuggestion } from '../types/productionSuggestion';
import { Track } from '../../editor/types/studio';
import { ArrangementSection } from '../../arrangement/types/arrangementSection';

export interface TestResult {
  passed: number;
  total: number;
  logs: string[];
}

export function runProductionTests(): TestResult {
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

  logs.push('Running Phase 14 AI Production Assistant Tests...');

  const mockTracks: Track[] = [
    { id: 'track-1', name: 'Synth Lead', instrument: 'Synth', color: '#00ffff', iconName: 'synth', volume: 80, muted: false, solo: false, channel: 1 },
    { id: 'track-2', name: 'Piano Chords', instrument: 'Piano', color: '#ff00ff', iconName: 'piano', volume: 80, muted: false, solo: false, channel: 2 },
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

  // Reset stores
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

  useMixerStore.getState().syncWithStudioTracks(mockTracks);

  useArrangementStore.setState({
    sections: [mockSection],
    totalBars: 32,
    selectedSectionId: 'sec-1',
    automationLanes: [],
    automationEnabled: true,
  });

  useProductionAssistantStore.getState().reset();

  // 1. Context Builder & Analyzer
  const context = buildProductionContext('analyze');
  assert(context.projectSettings.bpm === 120, 'Context builder captures studio tempo');
  assert(context.tracks.length === 2, 'Context builder captures all active tracks');

  const { report, suggestions } = analyzeProductionProject(context, 'analyze');
  assert(report.mode === 'analyze', 'Analyzer produces report matching requested mode');
  assert(report.projectStats.trackCount === 2, 'Report stats include accurate track count');
  assert(Array.isArray(report.findings), 'Report contains findings array');
  assert(Array.isArray(suggestions), 'Analyzer generates suggestions array');

  const { report: mixReport } = analyzeProductionProject(context, 'mix');
  assert(mixReport.summary.includes('Mix & Frequency Analysis'), 'Mix mode customizes report summary');

  const bassFinding = report.findings.find((f) => f.id === 'inst-missing-bass');
  assert(bassFinding !== undefined, 'Analyzer flags missing low-end bass anchor');

  // 2. AI Schema Parser & Validation
  const rawAIResponse = {
    summary: 'AI Audit Complete: Clean frequency distribution.',
    observations: ['Balanced stereo image'],
    findings: [
      {
        id: 'ai-find-101',
        category: 'mix',
        severity: 'tip',
        title: 'Master Headroom',
        description: 'Peak headroom is clean.',
        evidence: ['No clipping detected'],
        confidence: 0.95,
      },
    ],
    suggestions: [
      {
        id: 'ai-sug-101',
        category: 'mix',
        title: 'Tame Track 1 Volume',
        description: 'Lower synth lead slightly.',
        reason: 'Improve balance',
        targetType: 'track',
        targetId: 'track-1',
        action: 'set_track_volume',
        parameters: { trackId: 'track-1', volumeDb: -3.0 },
        confidence: 0.88,
      },
    ],
  };

  const parsed = parseAIProductionResponse(rawAIResponse, report, suggestions);
  assert(parsed.report.summary === 'AI Audit Complete: Clean frequency distribution.', 'AI parser overrides base summary');
  assert(parsed.suggestions.length === 1, 'AI parser extracts suggestions accurately');

  const fallbackParsed = parseAIProductionResponse({ invalid: true }, report, suggestions);
  assert(fallbackParsed.report === report, 'AI parser falls back cleanly on invalid payload');

  // 3. Store, Preview, Apply, Rollback
  const testSuggestion: ProductionSuggestion = {
    id: 'sug-tempo',
    category: 'mix',
    title: 'Increase Tempo',
    description: 'Change BPM to 128',
    reason: 'Boost energy',
    targetType: 'project',
    targetId: 'studio',
    action: 'change_tempo',
    parameters: { bpm: 128 },
    confidence: 0.9,
    currentValue: 120,
    proposedValue: 128,
    evidence: [],
    applied: false,
    rejected: false,
  };

  useProductionAssistantStore.getState().setPreviewSuggestion(testSuggestion);
  assert(useProductionAssistantStore.getState().previewSuggestion?.id === 'sug-tempo', 'Sets preview suggestion');
  assert(useStudioStore.getState().tempo === 120, 'Preview does not mutate state before apply');

  const applied = useProductionAssistantStore.getState().applySuggestion(testSuggestion);
  assert(applied === true, 'Successfully applies suggestion');
  assert(useStudioStore.getState().tempo === 128, 'Mutates store state on apply');
  assert(useProductionAssistantStore.getState().appliedSuggestions.has('sug-tempo'), 'Tracks applied suggestion ID');

  const rolledBack = useProductionAssistantStore.getState().rollbackSuggestion('sug-tempo');
  assert(rolledBack === true, 'Successfully rolls back suggestion');
  assert(useStudioStore.getState().tempo === 120, 'Restores previous store state on rollback');
  assert(!useProductionAssistantStore.getState().appliedSuggestions.has('sug-tempo'), 'Removes suggestion ID from applied set');

  // Track volume suggestion test
  const track1VolBefore = useMixerStore.getState().channels['track-1']?.volumeDb;

  const volSuggestion: ProductionSuggestion = {
    id: 'sug-vol',
    category: 'mix',
    title: 'Reduce Lead Volume',
    description: 'Lower volume to -6 dB',
    reason: 'Gain staging',
    targetType: 'track',
    targetId: 'track-1',
    action: 'set_track_volume',
    parameters: { trackId: 'track-1', volumeDb: -6 },
    confidence: 0.9,
    currentValue: track1VolBefore,
    proposedValue: -6,
    evidence: [],
    applied: false,
    rejected: false,
  };

  useProductionAssistantStore.getState().applySuggestion(volSuggestion);
  assert(useMixerStore.getState().channels['track-1']?.volumeDb === -6, 'Applies track volume change to mixer store');

  useProductionAssistantStore.getState().rollbackSuggestion('sug-vol');
  assert(useMixerStore.getState().channels['track-1']?.volumeDb === track1VolBefore, 'Rolls back track volume change cleanly');

  return { passed, total, logs };
}
