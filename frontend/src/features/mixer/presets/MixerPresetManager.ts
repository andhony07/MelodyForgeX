import { MixPreset } from '../types/mixer';
import { BUILT_IN_MIX_PRESETS } from './mixerPresets';

export class MixerPresetManager {
  private static instance: MixerPresetManager | null = null;
  private customPresets: Map<string, MixPreset> = new Map();

  private constructor() {}

  public static getInstance(): MixerPresetManager {
    if (!MixerPresetManager.instance) {
      MixerPresetManager.instance = new MixerPresetManager();
    }
    return MixerPresetManager.instance;
  }

  public getAllPresets(): MixPreset[] {
    const customList = Array.from(this.customPresets.values());
    return [...BUILT_IN_MIX_PRESETS, ...customList];
  }

  public getPreset(id: string): MixPreset | null {
    if (this.customPresets.has(id)) {
      return this.customPresets.get(id)!;
    }
    const builtIn = BUILT_IN_MIX_PRESETS.find((p) => p.id === id);
    if (builtIn) return builtIn;
    return BUILT_IN_MIX_PRESETS[0]; // Safe fallback to Clean Mix
  }

  public saveCustomPreset(preset: MixPreset): boolean {
    if (!preset || !preset.id || !preset.name) {
      return false;
    }
    const cleanPreset: MixPreset = {
      ...preset,
      isBuiltIn: false,
    };
    this.customPresets.set(cleanPreset.id, cleanPreset);
    return true;
  }

  public deleteCustomPreset(id: string): boolean {
    if (this.customPresets.has(id)) {
      this.customPresets.delete(id);
      return true;
    }
    return false;
  }

  public validatePreset(preset: unknown): preset is MixPreset {
    if (!preset || typeof preset !== 'object') return false;
    const p = preset as Record<string, unknown>;
    return (
      typeof p.id === 'string' &&
      typeof p.name === 'string' &&
      !!p.channelDefaults &&
      Array.isArray(p.returnBuses) &&
      !!p.master
    );
  }

  public clearCustomPresets(): void {
    this.customPresets.clear();
  }
}
