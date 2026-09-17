import { InstrumentPreset } from '../types/instrument';
import { BUILT_IN_PRESETS } from './presetDefinitions';

const LOCAL_STORAGE_KEY = 'melodyforge_custom_presets';

export class PresetManager {
  private static instance: PresetManager | null = null;
  private customPresets: Map<string, InstrumentPreset> = new Map();

  private constructor() {
    this.loadCustomPresetsFromStorage();
  }

  public static getInstance(): PresetManager {
    if (!PresetManager.instance) {
      PresetManager.instance = new PresetManager();
    }
    return PresetManager.instance;
  }

  private loadCustomPresetsFromStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((preset) => {
            if (this.validatePreset(preset)) {
              this.customPresets.set(preset.id, preset);
            }
          });
        }
      }
    } catch {
      // Ignore storage load errors
    }
  }

  private saveCustomPresetsToStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const list = Array.from(this.customPresets.values());
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Ignore storage save errors
    }
  }

  public validatePreset(data: unknown): data is InstrumentPreset {
    if (!data || typeof data !== 'object') return false;
    const p = data as Record<string, unknown>;
    if (typeof p.id !== 'string' || !p.id) return false;
    if (typeof p.name !== 'string' || !p.name) return false;
    if (typeof p.instrumentId !== 'string' || !p.instrumentId) return false;
    if (typeof p.category !== 'string') return false;
    if (!p.parameters || typeof p.parameters !== 'object') return false;
    return true;
  }

  public getPreset(id: string): InstrumentPreset | undefined {
    // Check built-in first, then custom
    const builtIn = BUILT_IN_PRESETS.find((p) => p.id === id);
    if (builtIn) return builtIn;

    return this.customPresets.get(id);
  }

  public getPresetsForInstrument(instrumentId: string): InstrumentPreset[] {
    const builtIns = BUILT_IN_PRESETS.filter((p) => p.instrumentId === instrumentId);
    const customs = Array.from(this.customPresets.values()).filter((p) => p.instrumentId === instrumentId);
    return [...builtIns, ...customs];
  }

  public getPresetsByCategory(category: string): InstrumentPreset[] {
    const builtIns = BUILT_IN_PRESETS.filter((p) => p.category === category);
    const customs = Array.from(this.customPresets.values()).filter((p) => p.category === category);
    return [...builtIns, ...customs];
  }

  public getAllPresets(): InstrumentPreset[] {
    return [...BUILT_IN_PRESETS, ...Array.from(this.customPresets.values())];
  }

  public saveCustomPreset(preset: InstrumentPreset): boolean {
    if (!this.validatePreset(preset)) {
      return false;
    }
    const sanitized: InstrumentPreset = {
      ...preset,
      isBuiltIn: false,
      version: preset.version || 1,
    };
    this.customPresets.set(sanitized.id, sanitized);
    this.saveCustomPresetsToStorage();
    return true;
  }

  public deleteCustomPreset(id: string): boolean {
    if (BUILT_IN_PRESETS.some((p) => p.id === id)) {
      // Built-in presets cannot be deleted
      return false;
    }
    const removed = this.customPresets.delete(id);
    if (removed) {
      this.saveCustomPresetsToStorage();
    }
    return removed;
  }

  public getFallbackPreset(instrumentId?: string): InstrumentPreset {
    if (instrumentId) {
      const match = BUILT_IN_PRESETS.find((p) => p.instrumentId === instrumentId);
      if (match) return match;
    }
    return BUILT_IN_PRESETS[0]; // Concert Piano
  }
}
