import * as Tone from 'tone';
import { GainParameters, validateEffectParameters } from '../types/effect';
import { createSafeGain, GenericAudioNode } from '../utils/mockNode';

export class GainEffect {
  public readonly input: GenericAudioNode;
  public readonly output: GenericAudioNode;
  private node: GenericAudioNode;
  private isBypassed = false;
  private currentGainDb = 0;

  constructor(params: GainParameters) {
    const valid = validateEffectParameters('gain', params) as GainParameters;
    this.currentGainDb = valid.gainDb;

    this.input = createSafeGain(1);
    this.output = createSafeGain(1);

    try {
      const gainVal = Tone.dbToGain(this.currentGainDb);
      const toneGain = new Tone.Gain(gainVal);
      this.node = toneGain as unknown as GenericAudioNode;
      if (this.input.connect) this.input.connect(this.node);
      if (this.node.connect) this.node.connect(this.output);
    } catch {
      this.node = createSafeGain(1);
    }
  }

  public updateParameters(params: unknown): void {
    const valid = validateEffectParameters('gain', params as GainParameters) as GainParameters;
    this.currentGainDb = valid.gainDb;
    if (!this.isBypassed && this.node.gain) {
      this.node.gain.value = Tone.dbToGain(this.currentGainDb);
    }
  }

  public setBypassed(bypassed: boolean): void {
    this.isBypassed = bypassed;
    if (this.node.gain) {
      if (bypassed) {
        this.node.gain.value = 1.0;
      } else {
        this.node.gain.value = Tone.dbToGain(this.currentGainDb);
      }
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
