import { Instrument, InstrumentPreset } from '../types/instrument';
import { InstrumentRegistry } from './InstrumentRegistry';
import { PresetManager } from '../presets/PresetManager';
import { sanitizeParameters } from '../utils/instrumentValidation';

export class InstrumentFactory {
  public static createInstrument(instrumentId: string, initialVolume = 80): Instrument {
    const registry = InstrumentRegistry.getInstance();
    return registry.getInstrument(instrumentId, initialVolume);
  }

  public static createInstrumentWithPreset(
    instrumentId: string,
    presetId?: string,
    initialVolume = 80
  ): Instrument {
    const inst = InstrumentFactory.createInstrument(instrumentId, initialVolume);

    if (presetId && inst.applyPreset) {
      const presetManager = PresetManager.getInstance();
      const preset = presetManager.getPreset(presetId);
      if (preset) {
        inst.applyPreset(preset);
      }
    }

    return inst;
  }

  public static applyParametersToInstrument(inst: Instrument, params: unknown): void {
    if (!inst || !inst.setParameter) return;
    const sanitized = sanitizeParameters(params);
    Object.entries(sanitized).forEach(([key, val]) => {
      if (typeof val === 'number' && inst.setParameter) {
        inst.setParameter(key, val);
      }
    });
  }

  public static applyPresetToInstrument(inst: Instrument, preset: InstrumentPreset): void {
    if (!inst || !preset) return;
    if (inst.applyPreset) {
      inst.applyPreset(preset);
    } else {
      InstrumentFactory.applyParametersToInstrument(inst, preset.parameters);
    }
  }
}
