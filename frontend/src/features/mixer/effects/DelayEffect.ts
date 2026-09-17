import * as Tone from 'tone';
import { DelayParameters, validateEffectParameters } from '../types/effect';
import { createSafeGain, GenericAudioNode } from '../utils/mockNode';

export class DelayEffect {
  public readonly input: GenericAudioNode;
  public readonly output: GenericAudioNode;
  private node: GenericAudioNode;
  private isBypassed = false;
  private currentParams: DelayParameters;

  constructor(params: DelayParameters) {
    this.currentParams = validateEffectParameters('delay', params) as DelayParameters;

    this.input = createSafeGain(1);
    this.output = createSafeGain(1);

    try {
      const delay = new Tone.FeedbackDelay({
        delayTime: this.currentParams.delayTimeSeconds,
        feedback: this.currentParams.feedback,
        wet: this.currentParams.wet,
      });

      this.node = delay as unknown as GenericAudioNode;
      if (this.input.connect) this.input.connect(this.node);
      if (this.node.connect) this.node.connect(this.output);
    } catch {
      this.node = createSafeGain(1);
    }
  }

  public updateParameters(params: unknown): void {
    this.currentParams = validateEffectParameters('delay', params as DelayParameters) as DelayParameters;
    if (!this.isBypassed) {
      if (this.node.delayTime) this.node.delayTime.value = this.currentParams.delayTimeSeconds;
      if (this.node.feedback) this.node.feedback.value = this.currentParams.feedback;
      if (this.node.wet) this.node.wet.value = this.currentParams.wet;
    }
  }

  public setBypassed(bypassed: boolean): void {
    this.isBypassed = bypassed;
    if (bypassed) {
      if (this.input.disconnect) this.input.disconnect();
      if (this.input.connect) this.input.connect(this.output);
    } else {
      if (this.input.disconnect) this.input.disconnect();
      if (this.input.connect) this.input.connect(this.node);
      if (this.node.connect) this.node.connect(this.output);
      if (this.node.delayTime) this.node.delayTime.value = this.currentParams.delayTimeSeconds;
      if (this.node.feedback) this.node.feedback.value = this.currentParams.feedback;
      if (this.node.wet) this.node.wet.value = this.currentParams.wet;
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
