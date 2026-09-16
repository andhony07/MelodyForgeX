import { useArrangementStore } from '../stores/useArrangementStore';
import {
  interpolateAutomationPoints,
  isTrackEnabledInSection,
  getActiveSectionAtBeat,
} from '../utils/arrangementUtils';
import {
  validateAutomationPoint,
  validateAutomationLane,
  validateSectionTrackState,
} from '../utils/arrangementValidation';
import { AutomationLane, AutomationPoint } from '../types/automation';
import { validateMelodyForgeProjectFile } from '../../projects/services/projectSerializer';

export function runAutomationTests(): { passed: number; total: number; logs: string[] } {
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

  // Reset store before starting
  useArrangementStore.getState().resetArrangement();

  // Test A: Section track state
  (() => {
    const secId = useArrangementStore.getState().sections[0].id;
    useArrangementStore.getState().setSectionTrackState(secId, 'track-piano', true);
    useArrangementStore.getState().setSectionTrackState(secId, 'track-bass', false);

    const updatedSec = useArrangementStore.getState().sections.find((s) => s.id === secId);
    assert(!!updatedSec, 'Section track state: section exists');
    assert(isTrackEnabledInSection(updatedSec!, 'track-piano') === true, 'Section track state: piano enabled');
    assert(isTrackEnabledInSection(updatedSec!, 'track-bass') === false, 'Section track state: bass disabled');
    assert(isTrackEnabledInSection(updatedSec!, 'track-drums') === true, 'Section track state: unlisted track defaults to enabled');

    let errorThrown = false;
    try {
      validateSectionTrackState({ sectionId: '', trackId: 't1', enabled: true });
    } catch {
      errorThrown = true;
    }
    assert(errorThrown, 'Section track state: rejects invalid sectionId');
  })();

  // Test B: Automation CRUD & ordering
  (() => {
    const laneId = useArrangementStore.getState().addAutomationLane('track', 'track-1', 'volume');
    assert(!!laneId, 'Automation: create lane');

    const pt1 = useArrangementStore.getState().addAutomationPoint(laneId, 9.0, 0.8);
    useArrangementStore.getState().addAutomationPoint(laneId, 1.0, 0.2);
    const pt3 = useArrangementStore.getState().addAutomationPoint(laneId, 5.0, 0.5);

    let lane = useArrangementStore.getState().automationLanes.find((l) => l.id === laneId)!;
    validateAutomationLane(lane);
    assert(lane.points.length === 3, 'Automation: add points');

    assert(
      lane.points[0].beat === 1.0 && lane.points[1].beat === 5.0 && lane.points[2].beat === 9.0,
      'Automation: points automatically sorted by beat'
    );

    useArrangementStore.getState().updateAutomationPoint(laneId, pt3.id, { value: 0.6 });
    lane = useArrangementStore.getState().automationLanes.find((l) => l.id === laneId)!;
    assert(lane.points.find((p) => p.id === pt3.id)?.value === 0.6, 'Automation: update point');

    useArrangementStore.getState().deleteAutomationPoint(laneId, pt1.id);
    lane = useArrangementStore.getState().automationLanes.find((l) => l.id === laneId)!;
    assert(lane.points.length === 2, 'Automation: delete point');

    useArrangementStore.getState().clearAutomationLane(laneId);
    lane = useArrangementStore.getState().automationLanes.find((l) => l.id === laneId)!;
    assert(lane.points.length === 0, 'Automation: clear lane');

    let invalidError = false;
    try {
      useArrangementStore.getState().addAutomationPoint(laneId, -5, 0.5);
    } catch {
      invalidError = true;
    }
    assert(invalidError, 'Automation: rejects negative beat');
  })();

  // Test C: Interpolation
  (() => {
    const points: AutomationPoint[] = [
      { id: 'p1', beat: 1.0, value: 0.2 },
      { id: 'p2', beat: 5.0, value: 0.8 },
      { id: 'p3', beat: 9.0, value: 0.4 },
    ];

    assert(interpolateAutomationPoints(points, 0.5, 0.5) === 0.2, 'Interpolation: before first point returns first point value');
    assert(interpolateAutomationPoints(points, 1.0, 0.5) === 0.2, 'Interpolation: exact first point value');
    assert(interpolateAutomationPoints(points, 3.0, 0.5) === 0.5, 'Interpolation: exact mid-point value between beats 1.0 and 5.0');
    assert(interpolateAutomationPoints(points, 5.0, 0.5) === 0.8, 'Interpolation: exact second point value');
    assert(interpolateAutomationPoints(points, 12.0, 0.5) === 0.4, 'Interpolation: after last point returns last point value');
    assert(interpolateAutomationPoints([], 3.0, 0.7) === 0.7, 'Interpolation: empty points returns default value');
  })();

  // Test D: Volume Automation Ranges
  (() => {
    let error1 = false;
    try {
      validateAutomationPoint({ id: 'v1', beat: 1, value: 1.5 }, 'volume');
    } catch {
      error1 = true;
    }
    assert(error1, 'Volume: rejects value > 1.0');

    let error2 = false;
    try {
      validateAutomationPoint({ id: 'v2', beat: 1, value: -0.1 }, 'volume');
    } catch {
      error2 = true;
    }
    assert(error2, 'Volume: rejects value < 0.0');

    validateAutomationPoint({ id: 'v3', beat: 1, value: 0.75 }, 'volume');
    assert(true, 'Volume: accepts valid volume 0.75');
  })();

  // Test E: Pan Automation Ranges
  (() => {
    validateAutomationPoint({ id: 'pan-left', beat: 1, value: -1.0 }, 'pan');
    validateAutomationPoint({ id: 'pan-center', beat: 1, value: 0.0 }, 'pan');
    validateAutomationPoint({ id: 'pan-right', beat: 1, value: 1.0 }, 'pan');
    assert(true, 'Pan: accepts valid pan range -1.0 to 1.0');

    let errorPan = false;
    try {
      validateAutomationPoint({ id: 'pan-err', beat: 1, value: 2.0 }, 'pan');
    } catch {
      errorPan = true;
    }
    assert(errorPan, 'Pan: rejects pan out of range');
  })();

  // Test F: Tempo Automation Ranges
  (() => {
    validateAutomationPoint({ id: 'tempo-min', beat: 1, value: 20 }, 'tempo');
    validateAutomationPoint({ id: 'tempo-max', beat: 1, value: 300 }, 'tempo');
    assert(true, 'Tempo: accepts valid tempo 20 BPM and 300 BPM');

    let errorTempo = false;
    try {
      validateAutomationPoint({ id: 'tempo-err', beat: 1, value: 350 }, 'tempo');
    } catch {
      errorTempo = true;
    }
    assert(errorTempo, 'Tempo: rejects tempo > 300 BPM');
  })();

  // Test G: Arrangement section lookup and track resolution
  (() => {
    const sections = useArrangementStore.getState().sections;
    const sec1 = sections[0]; // Intro (4 bars: 1..4, beats 1..16)
    const activeAtBeat2 = getActiveSectionAtBeat(sections, 2.0);
    assert(activeAtBeat2?.id === sec1.id, 'Arrangement: active section lookup at beat 2');

    const sec2 = sections[1]; // Verse 1 (8 bars)
    const activeAtBeat20 = getActiveSectionAtBeat(sections, 20.0);
    assert(activeAtBeat20?.id === sec2.id, 'Arrangement: active section lookup at beat 20');
  })();

  // Test H: Serialization & Project Interchange (V1 & V2)
  (() => {
    const mockV1File = {
      version: 1,
      format: 'melodyforge-project',
      metadata: { title: 'Legacy Project', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
      studio: { tempo: 120, key: 'C', mode: 'Major', timeSignature: '4/4', zoom: 100, isLooping: false },
      tracks: [{ id: 'tr-1', name: 'Piano', volume: 80, muted: false, solo: false }],
      notesByTrackId: { 'tr-1': [] },
      arrangement: { sections: [{ id: 'sec-1', name: 'Intro', type: 'Intro', startBar: 1, lengthBars: 4, order: 0 }], totalBars: 32 },
    };

    const validatedV1 = validateMelodyForgeProjectFile(mockV1File);
    assert(validatedV1.format === 'melodyforge-project', 'Serialization: load legacy V1 project file');

    const mockV2File = {
      ...mockV1File,
      version: 2,
      arrangement: {
        ...mockV1File.arrangement,
        automationLanes: [
          {
            id: 'lane-1',
            targetType: 'track',
            targetId: 'tr-1',
            parameter: 'volume',
            points: [{ id: 'p1', beat: 1.0, value: 0.8 }],
            enabled: true,
          } as AutomationLane,
        ],
        automationEnabled: true,
      },
    };

    const validatedV2 = validateMelodyForgeProjectFile(mockV2File);
    assert(validatedV2.version === 2, 'Serialization: validate Phase 9 V2 project file');
    assert(validatedV2.arrangement.automationLanes?.length === 1, 'Serialization: preserve automation lanes in V2 schema');
  })();

  return { passed, total, logs };
}
