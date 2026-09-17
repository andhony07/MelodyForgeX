import * as Tone from 'tone';
import { FilterParameters, validateEffectParameters } from '../types/effect';
import { createSafeGain, createSafeFilter, GenericAudioNode } from '../utils/mockNode';

export class FilterEffect {
  public readonly input: GenericAudioNode;
  public readonly output: GenericAudioNode;
  private node: GenericAudioNode;
  private isBypassed = false;
  private currentParams: FilterParameters;

  constructor(params: FilterParameters) {
    this.currentParams = validateEffectParameters('filter', params) as FilterParameters;

    this.input = createSafeGain(1);
    this.output = createSafeGain(1);

    try {
      const filterNode = new Tone.Filter({
        frequency: this.currentParams.frequency,
        Q: this.currentParams.Q,
        type: this.currentParams.filterType as BiquadFilterType,
      });
      this.node = filterNode as unknown as GenericAudioNode;
      if (this.input.connect) this.input.connect(this.node);
      if (this.node.connect) this.node.connect(this.output);
    } catch {
      this.node = createSafeFilter(this.currentParams.frequency, this.currentParams.Q, this.currentParams.filterType);
    }
  }

  public updateParameters(params: unknown): void {
    this.currentParams = validateEffectParameters('filter', params as FilterParameters) as FilterParameters;
    if (!this.isBypassed && this.node) {
      if (this.node.frequency) this.node.frequency.value = this.currentParams.frequency;
      if (this.node.Q) this.node.Q.value = this.currentParams.Q;
      this.node.type = this.currentParams.filterType;
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
        if (this.node.frequency) this.node.frequency.value = this.currentParams.frequency;
        if (this.node.Q) this.node.Q.value = this.currentParams.Q;
        this.node.type = this.currentParams.filterType;
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
