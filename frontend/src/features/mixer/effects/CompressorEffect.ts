import * as Tone from 'tone';
import { CompressorParameters, validateEffectParameters } from '../types/effect';
import { createSafeGain, createSafeCompressor, GenericAudioNode } from '../utils/mockNode';

export class CompressorEffect {
  public readonly input: GenericAudioNode;
  public readonly output: GenericAudioNode;
  private node: GenericAudioNode;
  private isBypassed = false;
  private currentParams: CompressorParameters;

  constructor(params: CompressorParameters) {
    this.currentParams = validateEffectParameters('compressor', params) as CompressorParameters;

    this.input = createSafeGain(1);
    this.output = createSafeGain(1);

    try {
      const comp = new Tone.Compressor({
        threshold: this.currentParams.thresholdDb,
        ratio: this.currentParams.ratio,
        attack: this.currentParams.attackMs / 1000,
        release: this.currentParams.releaseMs / 1000,
        knee: this.currentParams.kneeDb,
      });

      this.node = comp as unknown as GenericAudioNode;
      if (this.input.connect) this.input.connect(this.node);
      if (this.node.connect) this.node.connect(this.output);
    } catch {
      this.node = createSafeCompressor(
        this.currentParams.thresholdDb,
        this.currentParams.ratio,
        this.currentParams.attackMs / 1000,
        this.currentParams.releaseMs / 1000,
        this.currentParams.kneeDb
      );
    }
  }

  public updateParameters(params: unknown): void {
    this.currentParams = validateEffectParameters('compressor', params as CompressorParameters) as CompressorParameters;
    if (!this.isBypassed && this.node) {
      if (this.node.threshold) this.node.threshold.value = this.currentParams.thresholdDb;
      if (this.node.ratio) this.node.ratio.value = this.currentParams.ratio;
      if (this.node.attack) this.node.attack.value = this.currentParams.attackMs / 1000;
      if (this.node.release) this.node.release.value = this.currentParams.releaseMs / 1000;
      if (this.node.knee) this.node.knee.value = this.currentParams.kneeDb;
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
        if (this.node.threshold) this.node.threshold.value = this.currentParams.thresholdDb;
        if (this.node.ratio) this.node.ratio.value = this.currentParams.ratio;
        if (this.node.attack) this.node.attack.value = this.currentParams.attackMs / 1000;
        if (this.node.release) this.node.release.value = this.currentParams.releaseMs / 1000;
        if (this.node.knee) this.node.knee.value = this.currentParams.kneeDb;
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
