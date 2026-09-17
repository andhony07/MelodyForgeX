import * as Tone from 'tone';
import { EqualizerParameters, validateEffectParameters } from '../types/effect';
import { createSafeGain, createSafeEQ, GenericAudioNode } from '../utils/mockNode';

export class EqualizerEffect {
  public readonly input: GenericAudioNode;
  public readonly output: GenericAudioNode;
  private node: GenericAudioNode;
  private isBypassed = false;
  private currentParams: EqualizerParameters;

  constructor(params: EqualizerParameters) {
    this.currentParams = validateEffectParameters('eq', params) as EqualizerParameters;

    this.input = createSafeGain(1);
    this.output = createSafeGain(1);

    try {
      const eq = new Tone.EQ3({
        low: this.currentParams.lowGainDb,
        mid: this.currentParams.midGainDb,
        high: this.currentParams.highGainDb,
      });
      this.node = eq as unknown as GenericAudioNode;
      if (this.input.connect) this.input.connect(this.node);
      if (this.node.connect) this.node.connect(this.output);
    } catch {
      this.node = createSafeEQ(this.currentParams.lowGainDb, this.currentParams.midGainDb, this.currentParams.highGainDb);
    }
  }

  public updateParameters(params: unknown): void {
    this.currentParams = validateEffectParameters('eq', params as EqualizerParameters) as EqualizerParameters;
    if (!this.isBypassed && this.node) {
      if (this.node.low) this.node.low.value = this.currentParams.lowGainDb;
      if (this.node.mid) this.node.mid.value = this.currentParams.midGainDb;
      if (this.node.high) this.node.high.value = this.currentParams.highGainDb;
    }
  }

  public setBypassed(bypassed: boolean): void {
    this.isBypassed = bypassed;
    try {
      if (bypassed) {
        if (this.input.disconnect) this.input.disconnect();
        if (this.input.connect) this.input.connect(this.output);
      } else {
        if (this.input.disconnect) this.input.disconnect();
        if (this.input.connect) this.input.connect(this.node);
        if (this.node.connect) this.node.connect(this.output);
        if (this.node.low) this.node.low.value = this.currentParams.lowGainDb;
        if (this.node.mid) this.node.mid.value = this.currentParams.midGainDb;
        if (this.node.high) this.node.high.value = this.currentParams.highGainDb;
      }
    } catch {
      /* ignore audio routing errors in test env */
    }
  }

  public dispose(): void {
    try {
      if (this.input.disconnect) this.input.disconnect();
      if (this.output.disconnect) this.output.disconnect();
      if (this.node.dispose) this.node.dispose();
      if (this.input.dispose) this.input.dispose();
      if (this.output.dispose) this.output.dispose();
    } catch {
      // Ignore disposal errors
    }
  }
}
