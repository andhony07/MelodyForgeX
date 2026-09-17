import {
  EffectConfig,
  GainParameters,
  FilterParameters,
  EqualizerParameters,
  CompressorParameters,
  ReverbParameters,
  DelayParameters,
} from '../types/effect';
import { GainEffect } from '../effects/GainEffect';
import { FilterEffect } from '../effects/FilterEffect';
import { EqualizerEffect } from '../effects/EqualizerEffect';
import { CompressorEffect } from '../effects/CompressorEffect';
import { ReverbEffect } from '../effects/ReverbEffect';
import { DelayEffect } from '../effects/DelayEffect';
import { createSafeGain, GenericAudioNode } from '../utils/mockNode';

type UnifiedEffectInstance =
  | GainEffect
  | FilterEffect
  | EqualizerEffect
  | CompressorEffect
  | ReverbEffect
  | DelayEffect;

export class EffectChain {
  public readonly input: GenericAudioNode;
  public readonly output: GenericAudioNode;
  private instances: Map<string, UnifiedEffectInstance> = new Map();
  private configs: EffectConfig[] = [];

  constructor() {
    this.input = createSafeGain(1);
    this.output = createSafeGain(1);
    try {
      if (this.input.connect) this.input.connect(this.output);
    } catch {
      /* ignore connection error in headless */
    }
  }

  public updateChain(configs: EffectConfig[]): void {
    const newIds = new Set(configs.map((c) => c.id));

    // 1. Dispose removed effects
    this.instances.forEach((inst, id) => {
      if (!newIds.has(id)) {
        inst.dispose();
        this.instances.delete(id);
      }
    });

    // 2. Instantiate or update existing effects
    configs.forEach((config) => {
      let inst = this.instances.get(config.id);
      if (!inst) {
        inst = this.createEffectInstance(config);
        this.instances.set(config.id, inst);
      } else {
        inst.updateParameters(config.parameters);
        inst.setBypassed(config.bypassed);
      }
    });

    this.configs = configs;
    this.rebuildRouting();
  }

  private createEffectInstance(config: EffectConfig): UnifiedEffectInstance {
    switch (config.type) {
      case 'gain':
        return new GainEffect(config.parameters as GainParameters);
      case 'filter':
        return new FilterEffect(config.parameters as FilterParameters);
      case 'eq':
        return new EqualizerEffect(config.parameters as EqualizerParameters);
      case 'compressor':
        return new CompressorEffect(config.parameters as CompressorParameters);
      case 'reverb':
        return new ReverbEffect(config.parameters as ReverbParameters);
      case 'delay':
        return new DelayEffect(config.parameters as DelayParameters);
      default:
        return new GainEffect({ gainDb: 0 });
    }
  }

  private rebuildRouting(): void {
    // Disconnect all
    try {
      if (this.input.disconnect) this.input.disconnect();
      this.instances.forEach((inst) => {
        if (inst.output.disconnect) inst.output.disconnect();
      });
    } catch {
      // Ignore disconnect errors
    }

    if (this.configs.length === 0) {
      if (this.input.connect) this.input.connect(this.output);
      return;
    }

    let prevNode: GenericAudioNode = this.input;

    this.configs.forEach((config) => {
      const inst = this.instances.get(config.id);
      if (inst) {
        if (prevNode.connect) prevNode.connect(inst.input);
        prevNode = inst.output;
      }
    });

    if (prevNode.connect) prevNode.connect(this.output);
  }

  public dispose(): void {
    try {
      if (this.input.disconnect) this.input.disconnect();
      if (this.output.disconnect) this.output.disconnect();
      this.instances.forEach((inst) => inst.dispose());
      this.instances.clear();
      if (this.input.dispose) this.input.dispose();
      if (this.output.dispose) this.output.dispose();
    } catch {
      // Ignore disposal errors
    }
  }
}
