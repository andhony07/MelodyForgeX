import { create } from 'zustand';
import { InstrumentPreset, InstrumentMetadata } from '../types/instrument';
import { InstrumentRegistry } from '../instruments/InstrumentRegistry';
import { PresetManager } from '../presets/PresetManager';

interface InstrumentState {
  instruments: InstrumentMetadata[];
  presets: InstrumentPreset[];
  selectedCategory: string | null;

  refreshPresets: () => void;
  getPresetsForInstrument: (instrumentId: string) => InstrumentPreset[];
  saveCustomPreset: (preset: InstrumentPreset) => boolean;
  deleteCustomPreset: (presetId: string) => boolean;
  getPresetById: (presetId: string) => InstrumentPreset | undefined;
}

export const useInstrumentStore = create<InstrumentState>((set, get) => {
  const registry = InstrumentRegistry.getInstance();
  const presetManager = PresetManager.getInstance();

  return {
    instruments: registry.listInstruments(),
    presets: presetManager.getAllPresets(),
    selectedCategory: null,

    refreshPresets: () => {
      set({ presets: presetManager.getAllPresets() });
    },

    getPresetsForInstrument: (instrumentId: string) => {
      return presetManager.getPresetsForInstrument(instrumentId);
    },

    saveCustomPreset: (preset: InstrumentPreset) => {
      const success = presetManager.saveCustomPreset(preset);
      if (success) {
        get().refreshPresets();
      }
      return success;
    },

    deleteCustomPreset: (presetId: string) => {
      const success = presetManager.deleteCustomPreset(presetId);
      if (success) {
        get().refreshPresets();
      }
      return success;
    },

    getPresetById: (presetId: string) => {
      return presetManager.getPreset(presetId);
    },
  };
});
