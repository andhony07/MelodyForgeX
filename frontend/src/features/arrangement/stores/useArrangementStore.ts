import { create } from 'zustand';
import { ArrangementSection, ArrangementSectionType } from '../types/arrangementSection';
import {
  calculateSectionPositions,
  calculateTotalBars,
  getActiveSectionAtBar as findSectionAtBar,
  getActiveSectionAtBeat as findSectionAtBeat,
} from '../utils/arrangementUtils';
import { validateSection, validateArrangement } from '../utils/arrangementValidation';

interface ArrangementState {
  sections: ArrangementSection[];
  totalBars: number;
  selectedSectionId: string | null;
  loopSectionId: string | null;

  addSection: (type?: ArrangementSectionType, lengthBars?: number, afterId?: string) => void;
  deleteSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  moveSection: (id: string, direction: 'left' | 'right') => void;
  updateSection: (id: string, updates: Partial<ArrangementSection>) => void;
  selectSection: (id: string | null) => void;
  setLoopSectionId: (id: string | null) => void;
  resetArrangement: () => void;

  getSelectedSection: () => ArrangementSection | null;
  getActiveSectionAtBar: (bar: number) => ArrangementSection | null;
  getActiveSectionAtBeat: (beat: number, beatsPerBar?: number) => ArrangementSection | null;
}

const DEFAULT_SECTIONS: Omit<ArrangementSection, 'startBar'>[] = [
  { id: 'sec-intro-1', name: 'Intro', type: 'Intro', lengthBars: 4, order: 0 },
  { id: 'sec-verse-1', name: 'Verse 1', type: 'Verse', lengthBars: 8, order: 1 },
  { id: 'sec-prechorus-1', name: 'Pre-Chorus 1', type: 'Pre-Chorus', lengthBars: 4, order: 2 },
  { id: 'sec-chorus-1', name: 'Chorus 1', type: 'Chorus', lengthBars: 8, order: 3 },
  { id: 'sec-verse-2', name: 'Verse 2', type: 'Verse', lengthBars: 8, order: 4 },
  { id: 'sec-chorus-2', name: 'Chorus 2', type: 'Chorus', lengthBars: 8, order: 5 },
  { id: 'sec-bridge-1', name: 'Bridge', type: 'Bridge', lengthBars: 8, order: 6 },
  { id: 'sec-chorus-3', name: 'Chorus 3', type: 'Chorus', lengthBars: 8, order: 7 },
  { id: 'sec-outro-1', name: 'Outro', type: 'Outro', lengthBars: 4, order: 8 },
];

const INITIAL_SECTIONS = calculateSectionPositions(
  DEFAULT_SECTIONS.map((sec) => ({ ...sec, startBar: 1 }))
);

export const useArrangementStore = create<ArrangementState>((set, get) => {
  const applyArrangementUpdates = (newSectionsRaw: ArrangementSection[], newSelectedId?: string | null) => {
    validateArrangement(newSectionsRaw);
    const calculatedSections = calculateSectionPositions(newSectionsRaw);
    const totalBars = calculateTotalBars(calculatedSections);

    const { selectedSectionId, loopSectionId } = get();
    const currentSelectedId = newSelectedId !== undefined ? newSelectedId : selectedSectionId;
    
    // Ensure selected section ID exists
    const validSelectedId = calculatedSections.some((s) => s.id === currentSelectedId)
      ? currentSelectedId
      : calculatedSections[0]?.id || null;

    // Ensure loop section ID exists
    const validLoopId = calculatedSections.some((s) => s.id === loopSectionId)
      ? loopSectionId
      : null;

    set({
      sections: calculatedSections,
      totalBars,
      selectedSectionId: validSelectedId,
      loopSectionId: validLoopId,
    });
  };

  return {
    sections: INITIAL_SECTIONS,
    totalBars: calculateTotalBars(INITIAL_SECTIONS),
    selectedSectionId: INITIAL_SECTIONS[0]?.id || null,
    loopSectionId: null,

    addSection: (type = 'Verse', lengthBars = 8, afterId) => {
      const { sections } = get();
      const randStr = Math.random().toString(36).substring(2, 6);
      const id = `sec-${type.toLowerCase().replace(/\s+/g, '')}-${Date.now()}-${randStr}`;
      const name = `${type} ${sections.filter((s) => s.type === type).length + 1}`;

      const newSec: ArrangementSection = {
        id,
        name,
        type,
        startBar: 1,
        lengthBars: Math.max(1, Math.min(128, lengthBars)),
        order: sections.length,
      };

      let newSections: ArrangementSection[];
      if (afterId) {
        const idx = sections.findIndex((s) => s.id === afterId);
        if (idx !== -1) {
          newSections = [
            ...sections.slice(0, idx + 1),
            newSec,
            ...sections.slice(idx + 1),
          ];
        } else {
          newSections = [...sections, newSec];
        }
      } else {
        newSections = [...sections, newSec];
      }

      newSections.forEach((sec, i) => {
        sec.order = i;
      });

      applyArrangementUpdates(newSections, id);
    },

    deleteSection: (id) => {
      const { sections, selectedSectionId } = get();
      if (sections.length <= 1) return; // Maintain at least 1 section

      const filtered = sections.filter((s) => s.id !== id);
      filtered.forEach((sec, i) => {
        sec.order = i;
      });

      const nextSelectedId = selectedSectionId === id ? filtered[0]?.id || null : selectedSectionId;

      applyArrangementUpdates(filtered, nextSelectedId);
    },

    duplicateSection: (id) => {
      const { sections } = get();
      const targetIdx = sections.findIndex((s) => s.id === id);
      if (targetIdx === -1) return;

      const target = sections[targetIdx];
      const randStr = Math.random().toString(36).substring(2, 6);
      const newId = `sec-${target.type.toLowerCase().replace(/\s+/g, '')}-${Date.now()}-${randStr}`;
      
      const duplicate: ArrangementSection = {
        ...JSON.parse(JSON.stringify(target)),
        id: newId,
        name: `${target.name} (Copy)`,
        order: targetIdx + 1,
      };

      const updated = [
        ...sections.slice(0, targetIdx + 1),
        duplicate,
        ...sections.slice(targetIdx + 1),
      ];

      updated.forEach((sec, i) => {
        sec.order = i;
      });

      applyArrangementUpdates(updated, newId);
    },

    moveSection: (id, direction) => {
      const { sections } = get();
      const idx = sections.findIndex((s) => s.id === id);
      if (idx === -1) return;

      const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= sections.length) return;

      const updated = [...sections];
      const temp = updated[idx];
      updated[idx] = updated[targetIdx];
      updated[targetIdx] = temp;

      updated.forEach((sec, i) => {
        sec.order = i;
      });

      applyArrangementUpdates(updated);
    },

    updateSection: (id, updates) => {
      validateSection(updates);
      const { sections } = get();
      const updated = sections.map((sec) => (sec.id === id ? { ...sec, ...updates } : sec));
      applyArrangementUpdates(updated);
    },

    selectSection: (id) => set({ selectedSectionId: id }),

    setLoopSectionId: (id) => set({ loopSectionId: id }),

    resetArrangement: () => {
      applyArrangementUpdates(INITIAL_SECTIONS, INITIAL_SECTIONS[0]?.id || null);
    },

    getSelectedSection: () => {
      const { sections, selectedSectionId } = get();
      return sections.find((s) => s.id === selectedSectionId) || null;
    },

    getActiveSectionAtBar: (bar) => {
      return findSectionAtBar(get().sections, bar);
    },

    getActiveSectionAtBeat: (beat, beatsPerBar = 4) => {
      return findSectionAtBeat(get().sections, beat, beatsPerBar);
    },
  };
});
