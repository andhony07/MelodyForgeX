import { ArrangementSection, ArrangementSectionType, SectionTransitionType } from '../types/arrangementSection';
import { AutomationLane, AutomationParameter, AutomationPoint, AutomationTargetType } from '../types/automation';
import { SectionTrackState } from '../types/sectionTrackState';

const VALID_SECTION_TYPES: ArrangementSectionType[] = [
  'Intro',
  'Verse',
  'Pre-Chorus',
  'Chorus',
  'Bridge',
  'Outro',
  'Custom',
];

const VALID_TRANSITION_TYPES: SectionTransitionType[] = ['immediate', 'fade', 'crossfade'];
const VALID_TARGET_TYPES: AutomationTargetType[] = ['track', 'master', 'arrangement'];
const VALID_PARAMETERS: AutomationParameter[] = ['volume', 'pan', 'tempo'];

export function validateSection(section: Partial<ArrangementSection>): void {
  if (!section || typeof section !== 'object') {
    throw new Error('Arrangement section must be a valid object.');
  }

  if (section.name !== undefined && (typeof section.name !== 'string' || !section.name.trim())) {
    throw new Error('Section name must be a non-empty string.');
  }

  if (section.type !== undefined && !VALID_SECTION_TYPES.includes(section.type as ArrangementSectionType)) {
    throw new Error(`Invalid section type: ${section.type}`);
  }

  if (section.lengthBars !== undefined) {
    if (typeof section.lengthBars !== 'number' || !Number.isFinite(section.lengthBars)) {
      throw new Error('Section length must be a valid number.');
    }
    if (section.lengthBars < 1) {
      throw new Error('Section length must be at least 1 bar.');
    }
    if (section.lengthBars > 128) {
      throw new Error('Section length cannot exceed 128 bars.');
    }
  }

  if (section.transitionType !== undefined && !VALID_TRANSITION_TYPES.includes(section.transitionType)) {
    throw new Error(`Invalid transition type: ${section.transitionType}`);
  }

  if (section.fadeDuration !== undefined) {
    if (typeof section.fadeDuration !== 'number' || !Number.isFinite(section.fadeDuration) || section.fadeDuration < 0) {
      throw new Error('Fade duration must be a non-negative finite number.');
    }
  }

  if (section.trackStates !== undefined) {
    if (!Array.isArray(section.trackStates)) {
      throw new Error('Track states must be an array.');
    }
    section.trackStates.forEach(validateSectionTrackState);
  }
}

export function validateSectionTrackState(state: SectionTrackState): void {
  if (!state || typeof state !== 'object') {
    throw new Error('Section track state must be an object.');
  }
  if (!state.sectionId || typeof state.sectionId !== 'string') {
    throw new Error('Section track state must have a valid sectionId.');
  }
  if (!state.trackId || typeof state.trackId !== 'string') {
    throw new Error('Section track state must have a valid trackId.');
  }
  if (typeof state.enabled !== 'boolean') {
    throw new Error('Section track state enabled must be a boolean.');
  }
}

export function validateAutomationPoint(point: AutomationPoint, parameter?: AutomationParameter): void {
  if (!point || typeof point !== 'object') {
    throw new Error('Automation point must be an object.');
  }
  if (!point.id || typeof point.id !== 'string') {
    throw new Error('Automation point must have a valid id.');
  }
  if (typeof point.beat !== 'number' || !Number.isFinite(point.beat) || point.beat < 0) {
    throw new Error(`Automation point beat must be a non-negative finite number, got ${point.beat}.`);
  }
  if (typeof point.value !== 'number' || !Number.isFinite(point.value)) {
    throw new Error(`Automation point value must be a finite number, got ${point.value}.`);
  }

  if (parameter === 'volume') {
    if (point.value < 0.0 || point.value > 1.0) {
      throw new Error(`Volume value must be between 0.0 and 1.0, got ${point.value}.`);
    }
  } else if (parameter === 'pan') {
    if (point.value < -1.0 || point.value > 1.0) {
      throw new Error(`Pan value must be between -1.0 and 1.0, got ${point.value}.`);
    }
  } else if (parameter === 'tempo') {
    if (point.value < 20 || point.value > 300) {
      throw new Error(`Tempo value must be between 20 and 300 BPM, got ${point.value}.`);
    }
  }
}

export function validateAutomationLane(lane: AutomationLane): void {
  if (!lane || typeof lane !== 'object') {
    throw new Error('Automation lane must be an object.');
  }
  if (!lane.id || typeof lane.id !== 'string') {
    throw new Error('Automation lane must have a valid id.');
  }
  if (!VALID_TARGET_TYPES.includes(lane.targetType)) {
    throw new Error(`Invalid automation target type: ${lane.targetType}`);
  }
  if (!lane.targetId || typeof lane.targetId !== 'string') {
    throw new Error('Automation lane must have a valid targetId.');
  }
  if (!VALID_PARAMETERS.includes(lane.parameter)) {
    throw new Error(`Invalid automation parameter: ${lane.parameter}`);
  }
  if (!Array.isArray(lane.points)) {
    throw new Error('Automation lane points must be an array.');
  }

  const pointIds = new Set<string>();
  let lastBeat = -1;

  for (const point of lane.points) {
    validateAutomationPoint(point, lane.parameter);

    if (pointIds.has(point.id)) {
      throw new Error(`Duplicate automation point ID: ${point.id}`);
    }
    pointIds.add(point.id);

    if (point.beat < lastBeat) {
      throw new Error(`Automation points must be sorted by beat (beat ${point.beat} comes after ${lastBeat}).`);
    }
    lastBeat = point.beat;
  }
}

export function validateArrangement(sections: ArrangementSection[]): void {
  if (!Array.isArray(sections)) {
    throw new Error('Arrangement sections must be an array.');
  }

  const idSet = new Set<string>();

  sections.forEach((sec, idx) => {
    if (!sec.id || typeof sec.id !== 'string') {
      throw new Error(`Section at position ${idx} missing valid ID.`);
    }

    if (idSet.has(sec.id)) {
      throw new Error(`Duplicate section ID found: ${sec.id}`);
    }
    idSet.add(sec.id);

    validateSection(sec);
  });
}
