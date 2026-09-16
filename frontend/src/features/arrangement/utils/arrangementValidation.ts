import { ArrangementSection, ArrangementSectionType } from '../types/arrangementSection';

const VALID_SECTION_TYPES: ArrangementSectionType[] = [
  'Intro',
  'Verse',
  'Pre-Chorus',
  'Chorus',
  'Bridge',
  'Outro',
  'Custom',
];

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
    if (typeof section.lengthBars !== 'number' || isNaN(section.lengthBars)) {
      throw new Error('Section length must be a valid number.');
    }
    if (section.lengthBars < 1) {
      throw new Error('Section length must be at least 1 bar.');
    }
    if (section.lengthBars > 128) {
      throw new Error('Section length cannot exceed 128 bars.');
    }
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
