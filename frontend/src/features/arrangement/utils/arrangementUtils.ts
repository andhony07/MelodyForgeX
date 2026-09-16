import { ArrangementSection, ArrangementSectionType } from '../types/arrangementSection';

export function calculateSectionPositions(sections: ArrangementSection[]): ArrangementSection[] {
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  let currentBar = 1;

  return sorted.map((sec, idx) => {
    const validLength = Math.max(1, Math.min(128, Math.round(sec.lengthBars || 1)));
    const updatedSec: ArrangementSection = {
      ...sec,
      startBar: currentBar,
      lengthBars: validLength,
      order: idx,
    };
    currentBar += validLength;
    return updatedSec;
  });
}

export function calculateTotalBars(sections: ArrangementSection[]): number {
  if (sections.length === 0) return 32;
  const total = sections.reduce((sum, sec) => sum + (Math.max(1, sec.lengthBars) || 1), 0);
  return Math.max(1, total);
}

export function getActiveSectionAtBar(
  sections: ArrangementSection[],
  bar: number
): ArrangementSection | null {
  const normalizedBar = Math.max(1, Math.floor(bar));
  return (
    sections.find(
      (sec) => normalizedBar >= sec.startBar && normalizedBar < sec.startBar + sec.lengthBars
    ) || null
  );
}

export function getActiveSectionAtBeat(
  sections: ArrangementSection[],
  beat: number,
  beatsPerBar = 4
): ArrangementSection | null {
  const bar = Math.floor(Math.max(0, beat - 1) / beatsPerBar) + 1;
  return getActiveSectionAtBar(sections, bar);
}

export function sectionToBeats(
  section: ArrangementSection,
  beatsPerBar = 4
): { startBeat: number; endBeat: number; durationBeats: number } {
  const startBeat = (section.startBar - 1) * beatsPerBar + 1.0;
  const durationBeats = section.lengthBars * beatsPerBar;
  const endBeat = startBeat + durationBeats;
  return { startBeat, endBeat, durationBeats };
}

export function getSectionColor(type: ArrangementSectionType): {
  bg: string;
  border: string;
  text: string;
  badge: string;
} {
  switch (type) {
    case 'Intro':
      return {
        bg: 'bg-indigo-900/40 hover:bg-indigo-900/60',
        border: 'border-indigo-500/50',
        text: 'text-indigo-200',
        badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      };
    case 'Verse':
      return {
        bg: 'bg-sky-900/40 hover:bg-sky-900/60',
        border: 'border-sky-500/50',
        text: 'text-sky-200',
        badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      };
    case 'Pre-Chorus':
      return {
        bg: 'bg-amber-900/40 hover:bg-amber-900/60',
        border: 'border-amber-500/50',
        text: 'text-amber-200',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      };
    case 'Chorus':
      return {
        bg: 'bg-emerald-900/40 hover:bg-emerald-900/60',
        border: 'border-emerald-500/50',
        text: 'text-emerald-200',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      };
    case 'Bridge':
      return {
        bg: 'bg-purple-900/40 hover:bg-purple-900/60',
        border: 'border-purple-500/50',
        text: 'text-purple-200',
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      };
    case 'Outro':
      return {
        bg: 'bg-slate-800/60 hover:bg-slate-800/80',
        border: 'border-slate-500/50',
        text: 'text-slate-200',
        badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      };
    case 'Custom':
    default:
      return {
        bg: 'bg-violet-900/40 hover:bg-violet-900/60',
        border: 'border-violet-500/50',
        text: 'text-violet-200',
        badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
      };
  }
}
