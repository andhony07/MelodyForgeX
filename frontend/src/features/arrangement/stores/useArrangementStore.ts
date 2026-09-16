import { create } from 'zustand';
import { ArrangementSection, ArrangementSectionType } from '../types/arrangementSection';
import {
  AutomationLane,
  AutomationPoint,
  AutomationTargetType,
  AutomationParameter,
} from '../types/automation';
import { SectionTrackState } from '../types/sectionTrackState';
import {
  calculateSectionPositions,
  calculateTotalBars,
  getActiveSectionAtBar as findSectionAtBar,
  getActiveSectionAtBeat as findSectionAtBeat,
  interpolateAutomationPoints,
} from '../utils/arrangementUtils';
import {
  validateSection,
  validateArrangement,
  validateAutomationPoint,
  validateAutomationLane,
} from '../utils/arrangementValidation';

interface ArrangementState {
  sections: ArrangementSection[];
  totalBars: number;
  selectedSectionId: string | null;
  loopSectionId: string | null;

  // Automation state
  automationLanes: AutomationLane[];
  selectedLaneId: string | null;
  selectedPointId: string | null;
  automationEnabled: boolean;

  // Section actions
  addSection: (type?: ArrangementSectionType, lengthBars?: number, afterId?: string) => void;
  deleteSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  moveSection: (id: string, direction: 'left' | 'right') => void;
  updateSection: (id: string, updates: Partial<ArrangementSection>) => void;
  selectSection: (id: string | null) => void;
  setLoopSectionId: (id: string | null) => void;
  setSectionTrackState: (sectionId: string, trackId: string, enabled: boolean) => void;
  resetArrangement: () => void;

  // Automation actions
  addAutomationLane: (
    targetType: AutomationTargetType,
    targetId: string,
    parameter: AutomationParameter
  ) => string;
  removeAutomationLane: (id: string) => void;
  addAutomationPoint: (laneId: string, beat: number, value: number) => AutomationPoint;
  updateAutomationPoint: (laneId: string, pointId: string, updates: Partial<AutomationPoint>) => void;
  deleteAutomationPoint: (laneId: string, pointId: string) => void;
  clearAutomationLane: (laneId: string) => void;
  selectAutomationLane: (id: string | null) => void;
  selectAutomationPoint: (id: string | null) => void;
  setAutomationEnabled: (enabled: boolean) => void;
  toggleAutomationLane: (laneId: string, enabled?: boolean) => void;

  // Getters & evaluators
  getSelectedSection: () => ArrangementSection | null;
  getActiveSectionAtBar: (bar: number) => ArrangementSection | null;
  getActiveSectionAtBeat: (beat: number, beatsPerBar?: number) => ArrangementSection | null;
  evaluateAutomation: (
    targetType: AutomationTargetType,
    targetId: string,
    parameter: AutomationParameter,
    beat: number,
    defaultValue: number
  ) => number;
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

    const validSelectedId = calculatedSections.some((s) => s.id === currentSelectedId)
      ? currentSelectedId
      : calculatedSections[0]?.id || null;

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

    automationLanes: [],
    selectedLaneId: null,
    selectedPointId: null,
    automationEnabled: true,

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
      if (sections.length <= 1) return;

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

    setSectionTrackState: (sectionId: string, trackId: string, enabled: boolean) => {
      const { sections } = get();
      const updated = sections.map((sec) => {
        if (sec.id !== sectionId) return sec;

        const existingStates = sec.trackStates || [];
        const stateIdx = existingStates.findIndex((st) => st.trackId === trackId);
        let updatedStates: SectionTrackState[];

        if (stateIdx !== -1) {
          updatedStates = [...existingStates];
          updatedStates[stateIdx] = { ...updatedStates[stateIdx], enabled };
        } else {
          updatedStates = [
            ...existingStates,
            { sectionId, trackId, enabled },
          ];
        }

        return { ...sec, trackStates: updatedStates };
      });

      applyArrangementUpdates(updated);
    },

    resetArrangement: () => {
      applyArrangementUpdates(INITIAL_SECTIONS, INITIAL_SECTIONS[0]?.id || null);
      set({
        automationLanes: [],
        selectedLaneId: null,
        selectedPointId: null,
        automationEnabled: true,
      });
    },

    // Automation actions
    addAutomationLane: (targetType, targetId, parameter) => {
      const { automationLanes } = get();
      // Check if lane already exists for target & parameter
      const existing = automationLanes.find(
        (l) => l.targetType === targetType && l.targetId === targetId && l.parameter === parameter
      );
      if (existing) {
        set({ selectedLaneId: existing.id });
        return existing.id;
      }

      const id = `lane-${targetType}-${parameter}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newLane: AutomationLane = {
        id,
        targetType,
        targetId,
        parameter,
        points: [],
        enabled: true,
      };

      validateAutomationLane(newLane);

      set({
        automationLanes: [...automationLanes, newLane],
        selectedLaneId: id,
      });

      return id;
    },

    removeAutomationLane: (id) => {
      const { automationLanes, selectedLaneId } = get();
      const updated = automationLanes.filter((l) => l.id !== id);
      set({
        automationLanes: updated,
        selectedLaneId: selectedLaneId === id ? updated[0]?.id || null : selectedLaneId,
      });
    },

    addAutomationPoint: (laneId, beat, value) => {
      const { automationLanes } = get();
      const lane = automationLanes.find((l) => l.id === laneId);
      if (!lane) {
        throw new Error(`Automation lane not found: ${laneId}`);
      }

      const pointId = `point-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newPoint: AutomationPoint = { id: pointId, beat, value };

      validateAutomationPoint(newPoint, lane.parameter);

      const updatedPoints = [...lane.points, newPoint].sort((a, b) => a.beat - b.beat);
      const updatedLane: AutomationLane = { ...lane, points: updatedPoints };

      validateAutomationLane(updatedLane);

      set({
        automationLanes: automationLanes.map((l) => (l.id === laneId ? updatedLane : l)),
        selectedPointId: pointId,
      });

      return newPoint;
    },

    updateAutomationPoint: (laneId, pointId, updates) => {
      const { automationLanes } = get();
      const lane = automationLanes.find((l) => l.id === laneId);
      if (!lane) return;

      const targetPoint = lane.points.find((p) => p.id === pointId);
      if (!targetPoint) return;

      const updatedPoint: AutomationPoint = { ...targetPoint, ...updates };
      validateAutomationPoint(updatedPoint, lane.parameter);

      const updatedPoints = lane.points
        .map((p) => (p.id === pointId ? updatedPoint : p))
        .sort((a, b) => a.beat - b.beat);

      const updatedLane: AutomationLane = { ...lane, points: updatedPoints };
      validateAutomationLane(updatedLane);

      set({
        automationLanes: automationLanes.map((l) => (l.id === laneId ? updatedLane : l)),
      });
    },

    deleteAutomationPoint: (laneId, pointId) => {
      const { automationLanes, selectedPointId } = get();
      const lane = automationLanes.find((l) => l.id === laneId);
      if (!lane) return;

      const updatedPoints = lane.points.filter((p) => p.id !== pointId);
      const updatedLane: AutomationLane = { ...lane, points: updatedPoints };

      set({
        automationLanes: automationLanes.map((l) => (l.id === laneId ? updatedLane : l)),
        selectedPointId: selectedPointId === pointId ? null : selectedPointId,
      });
    },

    clearAutomationLane: (laneId) => {
      const { automationLanes } = get();
      set({
        automationLanes: automationLanes.map((l) => (l.id === laneId ? { ...l, points: [] } : l)),
        selectedPointId: null,
      });
    },

    selectAutomationLane: (id) => set({ selectedLaneId: id }),

    selectAutomationPoint: (id) => set({ selectedPointId: id }),

    setAutomationEnabled: (enabled) => set({ automationEnabled: enabled }),

    toggleAutomationLane: (laneId, enabled) => {
      const { automationLanes } = get();
      set({
        automationLanes: automationLanes.map((l) => {
          if (l.id !== laneId) return l;
          return { ...l, enabled: enabled !== undefined ? enabled : !(l.enabled ?? true) };
        }),
      });
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

    evaluateAutomation: (targetType, targetId, parameter, beat, defaultValue) => {
      const { automationLanes, automationEnabled } = get();
      if (!automationEnabled) return defaultValue;

      const lane = automationLanes.find(
        (l) => l.targetType === targetType && l.targetId === targetId && l.parameter === parameter && (l.enabled ?? true)
      );

      if (!lane || lane.points.length === 0) return defaultValue;

      return interpolateAutomationPoints(lane.points, beat, defaultValue);
    },
  };
});
