import * as Tone from 'tone';
import { ReverbParameters, validateEffectParameters } from '../types/effect';
import { createSafeGain, createSafeReverb, GenericAudioNode } from '../utils/mockNode';

export class ReverbEffect {
  public readonly input: GenericAudioNode;
  public readonly output: GenericAudioNode;
  private node: GenericAudioNode;
  private isBypassed = false;
  private currentParams: ReverbParameters;

  constructor(params: ReverbParameters) {
    this.currentParams = validateEffectParameters('reverb', params) as ReverbParameters;

    this.input = createSafeGain(1);
    this.output = createSafeGain(1);

    try {
      const freeverb = new Tone.Freeverb({
        dampening: 3000,
        roomSize: Math.min(0.9, Math.max(0.1, this.currentParams.decaySeconds / 10)),
        wet: this.currentParams.wet,
      });

      this.node = freeverb as unknown as GenericAudioNode;
      if (this.input.connect) this.input.connect(this.node);
      if (this.node.connect) this.node.connect(this.output);
    } catch {
      this.node = createSafeReverb(
        Math.min(0.9, Math.max(0.1, this.currentParams.decaySeconds / 10)),
        3000,
        this.currentParams.wet
      );
    }
  }

  public updateParameters(params: unknown): void {
    this.currentParams = validateEffectParameters('reverb', params as ReverbParameters) as ReverbParameters;
    if (!this.isBypassed && this.node) {
      if (this.node.roomSize) this.node.roomSize.value = Math.min(0.9, Math.max(0.1, this.currentParams.decaySeconds / 10));
      if (this.node.wet) this.node.wet.value = this.currentParams.wet;
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
        if (this.node.roomSize) this.node.roomSize.value = Math.min(0.9, Math.max(0.1, this.currentParams.decaySeconds / 10));
        if (this.node.wet) this.node.wet.value = this.currentParams.wet;
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
