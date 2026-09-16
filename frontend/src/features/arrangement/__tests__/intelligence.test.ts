import { analyzeArrangement } from '../analysis/arrangementAnalyzer';
import { compareSections } from '../analysis/sectionComparer';
import { generateArrangementSuggestions } from '../suggestions/arrangementSuggestionEngine';
import { applyArrangementSuggestions } from '../suggestions/arrangementSuggestionApplier';
import { validateAIArrangementResponse } from '../../ai/schemas/aiArrangementSchema';
import { useArrangementStore } from '../stores/useArrangementStore';
import { ArrangementSection } from '../types/arrangementSection';
import { Track } from '../../editor/types/studio';
import { Note } from '../../editor/types/note';
import { AutomationLane } from '../types/automation';

export function runArrangementIntelligenceTests(): { passed: number; total: number; logs: string[] } {
  const logs: string[] = [];
  let passed = 0;
  let total = 0;

  const assert = (condition: boolean, testName: string) => {
    total++;
    if (condition) {
      passed++;
      logs.push(`  ✓ ${testName}`);
    } else {
      logs.push(`  ✗ FAIL: ${testName}`);
      throw new Error(`Test failed: ${testName}`);
    }
  };

  // Mock test dataset
  const testSections: ArrangementSection[] = [
    { id: 'sec-intro', name: 'Intro', type: 'Intro', startBar: 1, lengthBars: 4, order: 0 },
    { id: 'sec-verse', name: 'Verse 1', type: 'Verse', startBar: 5, lengthBars: 8, order: 1 },
    { id: 'sec-chorus', name: 'Chorus 1', type: 'Chorus', startBar: 13, lengthBars: 8, order: 2 },
  ];

  const testTracks: Track[] = [
    { id: 'tr-piano', name: 'Piano', instrument: 'Piano', iconName: 'Piano', color: '#6366f1', channel: 0, volume: 80, muted: false, solo: false },
    { id: 'tr-bass', name: 'Bass', instrument: 'Bass', iconName: 'Radio', color: '#10b981', channel: 1, volume: 85, muted: false, solo: false },
    { id: 'tr-synth', name: 'Synth', instrument: 'Synth', iconName: 'Zap', color: '#06b6d4', channel: 2, volume: 75, muted: false, solo: false },
  ];


  // Note positioning:
  // Intro: bars 1..4 -> beats 1.0 .. 17.0
  // Verse 1: bars 5..12 -> beats 17.0 .. 49.0
  // Chorus 1: bars 13..20 -> beats 49.0 .. 81.0
  const testNotes: Record<string, Note[]> = {
    'tr-piano': [
      { id: 'n1', trackId: 'tr-piano', pitch: 60, startBeat: 1.0, durationBeats: 1.0, velocity: 90 },
      { id: 'n2', trackId: 'tr-piano', pitch: 64, startBeat: 17.0, durationBeats: 1.0, velocity: 85 },
      { id: 'n3', trackId: 'tr-piano', pitch: 67, startBeat: 49.0, durationBeats: 1.0, velocity: 95 },
    ],
    'tr-bass': [
      { id: 'n4', trackId: 'tr-bass', pitch: 36, startBeat: 17.0, durationBeats: 2.0, velocity: 100 },
    ],
    'tr-synth': [], // empty track
  };

  const testLanes: AutomationLane[] = [
    {
      id: 'lane-tempo',
      targetType: 'arrangement',
      targetId: 'arrangement',
      parameter: 'tempo',
      points: [
        { id: 'p1', beat: 1.0, value: 120 },
        { id: 'p2', beat: 48.9, value: 120 },
        { id: 'p3', beat: 49.0, value: 150 }, // Abrupt tempo jump between Verse & Chorus boundary
      ],
      enabled: true,
    },
  ];

  // Test A: Arrangement Analysis Calculations
  (() => {
    const analysis = analyzeArrangement({
      sections: testSections,
      tracks: testTracks,
      notesByTrackId: testNotes,
      automationLanes: testLanes,
      baseTempo: 120,
    });

    assert(analysis.totalBars === 20, 'Analysis: total bars calculated correctly (4+8+8 = 20)');
    assert(analysis.sectionsCount === 3, 'Analysis: section count is 3');
    assert(analysis.tracksCount === 3, 'Analysis: track count is 3');
    assert(analysis.emptyTrackIds.includes('tr-synth'), 'Analysis: detects empty track (tr-synth)');
    assert(analysis.sectionAnalyses.length === 3, 'Analysis: section analyses array contains 3 entries');

    const intro = analysis.sectionAnalyses[0];
    assert(intro.activeTrackIds.includes('tr-piano'), 'Analysis: intro active tracks contains piano');
    assert(intro.noteCount === 1, 'Analysis: intro note count is 1');
    assert(intro.noteDensity > 0, 'Analysis: intro note density is > 0');

    const bassSummary = analysis.trackSummaries.find((t) => t.trackId === 'tr-bass');
    assert(bassSummary?.totalNotes === 1, 'Analysis: bass track summary total notes is 1');
    assert(bassSummary?.pitchRange?.min === 36, 'Analysis: bass pitch range min is 36');
  })();

  // Test B: Findings & Structural Health Checks
  (() => {
    const analysis = analyzeArrangement({
      sections: testSections,
      tracks: testTracks,
      notesByTrackId: testNotes,
      automationLanes: testLanes,
      baseTempo: 120,
    });

    assert(analysis.findings.length > 0, 'Findings: findings array generated');
    const unusedTrackFinding = analysis.findings.find((f) => f.trackId === 'tr-synth');
    assert(!!unusedTrackFinding, 'Findings: detects unused track finding for tr-synth');
    assert(unusedTrackFinding?.severity === 'INFO', 'Findings: unused track severity is INFO');

    const tempoJumpFinding = analysis.findings.find((f) => f.category === 'TEMPO');
    assert(!!tempoJumpFinding, 'Findings: detects sudden tempo jump between sections');
    assert(tempoJumpFinding?.severity === 'WARNING', 'Findings: tempo jump severity is WARNING');
  })();

  // Test C: Section Comparison Tool
  (() => {
    const analysis = analyzeArrangement({
      sections: testSections,
      tracks: testTracks,
      notesByTrackId: testNotes,
      automationLanes: testLanes,
      baseTempo: 120,
    });

    const verse = analysis.sectionAnalyses[1];
    const chorus = analysis.sectionAnalyses[2];

    const comparison = compareSections(verse, chorus);
    assert(comparison.section1Name === 'Verse 1', 'Comparison: section 1 name match');
    assert(comparison.section2Name === 'Chorus 1', 'Comparison: section 2 name match');
    assert(typeof comparison.trackParticipationDelta.diff === 'number', 'Comparison: track participation delta calculated');
    assert(typeof comparison.densityDelta.diff === 'number', 'Comparison: density delta calculated');
  })();

  // Test D: Suggestion Engine
  (() => {
    const analysis = analyzeArrangement({
      sections: testSections,
      tracks: testTracks,
      notesByTrackId: testNotes,
      automationLanes: testLanes,
      baseTempo: 120,
    });

    const suggestions = generateArrangementSuggestions({
      analysis,
      sections: testSections,
      tracks: testTracks,
      notesByTrackId: testNotes,
    });

    assert(suggestions.length > 0, 'Suggestion Engine: produces suggestions');
    assert(suggestions.every((s) => s.id && s.title && s.reason), 'Suggestion Engine: all suggestions have valid id, title, and reason');

    const validSecIds = new Set(testSections.map((s) => s.id));
    const validTrackIds = new Set(testTracks.map((t) => t.id));

    const validTargets = suggestions.every(
      (s) => (!s.sectionId || validSecIds.has(s.sectionId)) && (!s.trackId || validTrackIds.has(s.trackId))
    );
    assert(validTargets, 'Suggestion Engine: suggestions target valid section and track IDs');
  })();

  // Test E: AI Suggestion Schema & Validation
  (() => {
    const validRawResponse = {
      suggestions: [
        {
          type: 'TRACK_ACTIVATION',
          sectionId: 'sec-verse',
          trackId: 'tr-piano',
          title: 'Enable Piano in Verse',
          description: 'Enable piano track',
          reason: 'Improves harmonic backing',
        },
        {
          type: 'UNKNOWN_TYPE', // invalid type
          sectionId: 'sec-verse',
        },
        {
          type: 'TRACK_ACTIVATION',
          sectionId: 'invalid-sec-id', // unknown section ID
          trackId: 'tr-piano',
        },
      ],
    };

    const validated = validateAIArrangementResponse(validRawResponse, testSections, testTracks);
    assert(validated.length === 1, 'AI Validation: accepts valid suggestion and filters 2 invalid suggestions');
    assert(validated[0].sectionId === 'sec-verse', 'AI Validation: preserves valid section ID');
  })();

  // Test F: Apply Engine & Atomic Rollback
  (() => {
    useArrangementStore.getState().resetArrangement();
    const initialSecCount = useArrangementStore.getState().sections.length;

    const testSug = {
      id: 'sug-test-1',
      type: 'TRANSITION_CHANGE' as const,
      title: 'Test Transition',
      description: 'Test transition',
      sectionId: useArrangementStore.getState().sections[0].id,
      proposedValue: { transitionType: 'crossfade' as const, fadeDuration: 1.0 },
      reason: 'Testing apply',
    };

    const result = applyArrangementSuggestions([testSug]);
    assert(result.success === true && result.appliedCount === 1, 'Apply Engine: successfully applies valid suggestion');

    const updatedSec = useArrangementStore.getState().sections[0];
    assert(updatedSec.transitionType === 'crossfade', 'Apply Engine: section transition updated to crossfade');

    // Test Atomic Rollback on Failure
    const invalidSug = {
      id: 'sug-err-1',
      type: 'TRANSITION_CHANGE' as const,
      title: 'Err Transition',
      description: 'Err transition',
      sectionId: 'non-existent-sec-id',
      proposedValue: null,
      reason: 'Testing error rollback',
    };

    const failResult = applyArrangementSuggestions([invalidSug]);
    assert(failResult.success === false, 'Apply Engine: handles invalid suggestion cleanly');
    assert(useArrangementStore.getState().sections.length === initialSecCount, 'Apply Engine: atomic rollback preserves store state');
  })();

  return { passed, total, logs };
}
