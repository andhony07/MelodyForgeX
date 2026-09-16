import { useArrangementStore } from '../stores/useArrangementStore';
import {
  calculateSectionPositions,
  calculateTotalBars,
  getActiveSectionAtBar,
  getActiveSectionAtBeat,
  sectionToBeats,
} from '../utils/arrangementUtils';
import { validateSection, validateArrangement } from '../utils/arrangementValidation';
import { ArrangementSection, ArrangementSectionType } from '../types/arrangementSection';
import { generateMelody } from '../../composition/generators/melodyGenerator';

export function runArrangementTests() {
  const logs: string[] = [];
  let passed = 0;
  let total = 0;

  const assert = (condition: boolean, description: string) => {
    total++;
    if (condition) {
      passed++;
      logs.push(`  ✓ ${description}`);
    } else {
      logs.push(`  ✗ FAILED: ${description}`);
      throw new Error(`Assertion failed: ${description}`);
    }
  };

  logs.push('\n=== Arrangement & Song Structure Engine Unit Tests ===');

  // Test 1: Calculation of section positions
  try {
    const rawSections: ArrangementSection[] = [
      { id: '1', name: 'Intro', type: 'Intro', startBar: 1, lengthBars: 4, order: 0 },
      { id: '2', name: 'Verse', type: 'Verse', startBar: 1, lengthBars: 8, order: 1 },
      { id: '3', name: 'Chorus', type: 'Chorus', startBar: 1, lengthBars: 8, order: 2 },
    ];
    const positioned = calculateSectionPositions(rawSections);
    assert(positioned[0].startBar === 1, 'Intro startBar is 1');
    assert(positioned[1].startBar === 5, 'Verse startBar is 5 (1 + 4)');
    assert(positioned[2].startBar === 13, 'Chorus startBar is 13 (5 + 8)');
    assert(calculateTotalBars(positioned) === 20, 'Total bars calculation is 20 (4+8+8)');
  } catch (err: unknown) {
    logs.push(`  ✗ Test 1 Error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Test 2: Active Section Lookup by Bar & Beat
  try {
    const rawSections: ArrangementSection[] = [
      { id: '1', name: 'Intro', type: 'Intro', startBar: 1, lengthBars: 4, order: 0 },
      { id: '2', name: 'Verse', type: 'Verse', startBar: 5, lengthBars: 8, order: 1 },
    ];
    const secAtBar3 = getActiveSectionAtBar(rawSections, 3);
    assert(secAtBar3?.name === 'Intro', 'Bar 3 active section is Intro');

    const secAtBar7 = getActiveSectionAtBar(rawSections, 7);
    assert(secAtBar7?.name === 'Verse', 'Bar 7 active section is Verse');

    const secAtBeat18 = getActiveSectionAtBeat(rawSections, 18); // Beat 18 = Bar 5 Beat 2 (in 4/4)
    assert(secAtBeat18?.name === 'Verse', 'Beat 18 active section is Verse');
  } catch (err: unknown) {
    logs.push(`  ✗ Test 2 Error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Test 3: Validation Rules
  try {
    let invalidLengthError = false;
    try {
      validateSection({ lengthBars: 0 });
    } catch {
      invalidLengthError = true;
    }
    assert(invalidLengthError, 'Rejects zero section length');

    let invalidTypeError = false;
    try {
      validateSection({ type: 'InvalidType' as unknown as ArrangementSectionType });
    } catch {
      invalidTypeError = true;
    }
    assert(invalidTypeError, 'Rejects invalid section type');

    let duplicateIdError = false;
    try {
      validateArrangement([
        { id: 'dup', name: 'A', type: 'Intro', startBar: 1, lengthBars: 4, order: 0 },
        { id: 'dup', name: 'B', type: 'Verse', startBar: 5, lengthBars: 4, order: 1 },
      ]);
    } catch {
      duplicateIdError = true;
    }
    assert(duplicateIdError, 'Rejects duplicate section IDs');
  } catch (err: unknown) {
    logs.push(`  ✗ Test 3 Error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Test 4: Zustand Store Operations
  try {
    const store = useArrangementStore.getState();
    store.resetArrangement();
    const initialCount = store.sections.length;
    assert(initialCount === 9, 'Default song structure has 9 sections');

    // Add Section
    store.addSection('Bridge', 8);
    assert(useArrangementStore.getState().sections.length === 10, 'Adds new section to arrangement');

    // Move Section Left
    const newSecId = useArrangementStore.getState().selectedSectionId!;
    store.moveSection(newSecId, 'left');
    const updatedSections = useArrangementStore.getState().sections;
    assert(updatedSections[updatedSections.length - 2].id === newSecId, 'Moves section left correctly');

    // Duplicate Section
    store.duplicateSection(newSecId);
    assert(useArrangementStore.getState().sections.length === 11, 'Duplicates section successfully');

    // Delete Section
    store.deleteSection(newSecId);
    assert(useArrangementStore.getState().sections.length === 10, 'Deletes section successfully');
  } catch (err: unknown) {
    logs.push(`  ✗ Test 4 Error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Test 5: Section Content Isolation & Section Beats Conversion
  try {
    const sec: ArrangementSection = {
      id: 'sec-chorus',
      name: 'Chorus',
      type: 'Chorus',
      startBar: 17,
      lengthBars: 8,
      order: 3,
    };

    const bounds = sectionToBeats(sec);
    assert(bounds.startBeat === 65.0, 'Start beat of bar 17 is 65.0');
    assert(bounds.endBeat === 97.0, 'End beat of bar 24 is 97.0');

    // Generate section notes
    const notes = generateMelody({
      trackId: 'test-track',
      key: 'C',
      scale: 'Major',
      seed: 999,
      totalBars: sec.lengthBars,
    });

    const shiftedNotes = notes.map((n) => ({
      ...n,
      startBeat: bounds.startBeat + (n.startBeat - 1.0),
    }));

    const allInBounds = shiftedNotes.every(
      (n) => n.startBeat >= bounds.startBeat && n.startBeat < bounds.endBeat
    );
    assert(allInBounds, 'Section-targeted notes strictly stay within section beat boundaries');
  } catch (err: unknown) {
    logs.push(`  ✗ Test 5 Error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Test 6: Deterministic Section Generation
  try {
    const sec: ArrangementSection = {
      id: 'sec-verse',
      name: 'Verse',
      type: 'Verse',
      startBar: 5,
      lengthBars: 8,
      order: 1,
    };

    const notes1 = generateMelody({
      trackId: 'tr1',
      key: 'A',
      scale: 'Minor',
      seed: 777,
      totalBars: sec.lengthBars,
    });

    const notes2 = generateMelody({
      trackId: 'tr1',
      key: 'A',
      scale: 'Minor',
      seed: 777,
      totalBars: sec.lengthBars,
    });

    assert(
      JSON.stringify(notes1.map((n) => n.pitch)) === JSON.stringify(notes2.map((n) => n.pitch)),
      'Section generation is 100% deterministic with matching seed'
    );
  } catch (err: unknown) {
    logs.push(`  ✗ Test 6 Error: ${err instanceof Error ? err.message : String(err)}`);
  }

  return { passed, total, logs };
}
