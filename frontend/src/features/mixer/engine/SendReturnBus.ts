import * as Tone from 'tone';
import { SendBusType, ReturnBusConfig } from '../types/bus';
import { createSafeGain, createSafeVolume, GenericAudioNode } from '../utils/mockNode';

export class SharedSendReturnBus {
  public readonly input: GenericAudioNode;
  public readonly output: GenericAudioNode;
  private returnVolume: GenericAudioNode;
  private effectNode: GenericAudioNode;
  private busType: SendBusType;
  private isMuted = false;
  private currentLevelDb = 0;

  constructor(config: ReturnBusConfig) {
    this.busType = config.busType;
    this.input = createSafeGain(1);
    this.output = createSafeGain(1);
    this.returnVolume = createSafeVolume(config.returnLevelDb);
    this.isMuted = config.muted;
    this.currentLevelDb = config.returnLevelDb;

    try {
      if (this.busType === 'reverb') {
        const freeverb = new Tone.Freeverb({
          roomSize: Math.min(0.9, Math.max(0.1, (config.decaySeconds || 2.0) / 10)),
          dampening: 3000,
          wet: 1.0,
        });
        this.effectNode = freeverb as unknown as GenericAudioNode;
      } else {
        const delay = new Tone.FeedbackDelay({
          delayTime: config.delayTimeSeconds || 0.25,
          feedback: config.feedback || 0.3,
          wet: 1.0,
        });
        this.effectNode = delay as unknown as GenericAudioNode;
      }

      if (this.input.connect) this.input.connect(this.effectNode);
      if (this.effectNode.connect) this.effectNode.connect(this.returnVolume);
      if (this.returnVolume.connect) this.returnVolume.connect(this.output);
    } catch {
      this.effectNode = createSafeGain(1);
    }

    this.setMuted(this.isMuted);
  }

  public updateConfig(config: ReturnBusConfig): void {
    this.currentLevelDb = config.returnLevelDb;
    this.isMuted = config.muted;
    if (this.returnVolume.volume) {
      this.returnVolume.volume.value = this.isMuted ? -Infinity : this.currentLevelDb;
    }

    if (this.busType === 'reverb' && this.effectNode.roomSize) {
      this.effectNode.roomSize.value = Math.min(0.9, Math.max(0.1, (config.decaySeconds || 2.0) / 10));
    } else if (this.busType === 'delay') {
      if (this.effectNode.delayTime) {
        this.effectNode.delayTime.value = config.delayTimeSeconds || 0.25;
      }
      if (this.effectNode.feedback) {
        this.effectNode.feedback.value = config.feedback || 0.3;
      }
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.returnVolume.volume) {
      this.returnVolume.volume.value = muted ? -Infinity : this.currentLevelDb;
    }
  }

  public setLevelDb(levelDb: number): void {
    this.currentLevelDb = levelDb;
    if (!this.isMuted && this.returnVolume.volume) {
      this.returnVolume.volume.value = levelDb;
    }
  }

  public dispose(): void {
    try {
      if (this.input.disconnect) this.input.disconnect();
      if (this.output.disconnect) this.output.disconnect();
      if (this.effectNode.dispose) this.effectNode.dispose();
      if (this.returnVolume.dispose) this.returnVolume.dispose();
      if (this.input.dispose) this.input.dispose();
      if (this.output.dispose) this.output.dispose();
    } catch {
      // Ignore disposal errors
    }
  }
}
