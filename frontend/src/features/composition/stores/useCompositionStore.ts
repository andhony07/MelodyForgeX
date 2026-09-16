import { create } from 'zustand';
import { ScaleType } from '../types/scale';
import { MusicalKey } from '../../editor/types/studio';
import { ProgressionTemplate } from '../types/progression';
import { MusicalSection } from '../types/section';
import { PROGRESSION_TEMPLATES } from '../constants/progressions';

interface CompositionState {
  selectedScale: ScaleType;
  selectedKey: MusicalKey;
  activeProgression: ProgressionTemplate;
  sections: MusicalSection[];
  seed: number;

  setScale: (scale: ScaleType) => void;
  setCompositionKey: (key: MusicalKey) => void;
  setProgression: (progression: ProgressionTemplate) => void;
  setSeed: (seed: number) => void;
  addSection: (section: Omit<MusicalSection, 'id'>) => void;
  updateSection: (id: string, updates: Partial<MusicalSection>) => void;
  removeSection: (id: string) => void;
  clearComposition: () => void;
}

const DEFAULT_SECTIONS: MusicalSection[] = [
  { id: 'sec-1', name: 'Intro', type: 'Intro', startBar: 1, endBar: 4 },
  { id: 'sec-2', name: 'Verse', type: 'Verse', startBar: 5, endBar: 12 },
  { id: 'sec-3', name: 'Chorus', type: 'Chorus', startBar: 13, endBar: 20 },
  { id: 'sec-4', name: 'Outro', type: 'Outro', startBar: 21, endBar: 24 },
];

export const useCompositionStore = create<CompositionState>((set) => ({
  selectedScale: 'Major',
  selectedKey: 'C',
  activeProgression: PROGRESSION_TEMPLATES[0],
  sections: DEFAULT_SECTIONS,
  seed: 12345,

  setScale: (selectedScale) => set({ selectedScale }),
  setCompositionKey: (selectedKey) => set({ selectedKey }),
  setProgression: (activeProgression) => set({ activeProgression }),
  setSeed: (seed) => set({ seed }),

  addSection: (sec) => {
    const id = `sec-${Date.now()}`;
    set((state) => ({
      sections: [...state.sections, { ...sec, id }],
    }));
  },

  updateSection: (id, updates) => {
    set((state) => ({
      sections: state.sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  },

  removeSection: (id) => {
    set((state) => ({
      sections: state.sections.filter((s) => s.id !== id),
    }));
  },

  clearComposition: () => {
    set({
      selectedScale: 'Major',
      selectedKey: 'C',
      activeProgression: PROGRESSION_TEMPLATES[0],
      sections: DEFAULT_SECTIONS,
      seed: 12345,
    });
  },
}));
