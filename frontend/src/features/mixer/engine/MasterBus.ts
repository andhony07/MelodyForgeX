import * as Tone from 'tone';
import { MasterMixerChannel } from '../types/mixer';
import { EffectChain } from './EffectChain';
import { MeterData } from '../types/meter';
import {
  createSafeGain,
  createSafeVolume,
  createSafePanner,
  createSafeLimiter,
  createSafeMeter,
  GenericAudioNode,
} from '../utils/mockNode';

export class MasterBus {
  public readonly input: GenericAudioNode;
  private insertChain: EffectChain;
  private masterVolume: GenericAudioNode;
  private masterPanner: GenericAudioNode;
  private limiter: GenericAudioNode;
  private peakMeter: GenericAudioNode;
  private isMuted = false;
  private currentVolumeDb = 0;

  constructor() {
    this.input = createSafeGain(1);
    this.insertChain = new EffectChain();
    this.masterVolume = createSafeVolume(0);
    this.masterPanner = createSafePanner(0);
    this.limiter = createSafeLimiter(-0.1);
    this.peakMeter = createSafeMeter();

    // Audio Graph Routing:
    try {
      if (this.input.connect) this.input.connect(this.insertChain.input);
      if (this.insertChain.output.connect) this.insertChain.output.connect(this.masterVolume);
      if (this.masterVolume.connect) this.masterVolume.connect(this.masterPanner);
      if (this.masterPanner.connect) this.masterPanner.connect(this.limiter);
      if (this.limiter.connect) this.limiter.connect(this.peakMeter);
      try {
        if (this.limiter.connect) this.limiter.connect(Tone.getDestination());
      } catch {
        /* ignore destination in headless */
      }
    } catch {
      /* ignore audio graph routing errors in test env */
    }
  }

  public updateConfig(config: MasterMixerChannel): void {
    this.isMuted = config.muted;
    this.currentVolumeDb = config.volumeDb;
    if (this.masterVolume.volume) {
      this.masterVolume.volume.value = this.isMuted ? -Infinity : this.currentVolumeDb;
    }
    if (this.masterPanner.pan) {
      this.masterPanner.pan.value = Math.max(-1, Math.min(1, config.pan / 100));
    }

    this.insertChain.updateChain(config.inserts);

    if (this.limiter.threshold) {
      if (config.limiterEnabled) {
        this.limiter.threshold.value = config.limiterThresholdDb ?? -0.1;
      } else {
        this.limiter.threshold.value = 0; // Bypass threshold
      }
    }
  }

  public setVolumeDb(db: number): void {
    this.currentVolumeDb = db;
    if (!this.isMuted && this.masterVolume.volume) {
      this.masterVolume.volume.value = db;
    }
  }

  public setPan(panVal: number): void {
    const norm = Math.max(-1, Math.min(1, panVal / 100));
    if (this.masterPanner.pan) {
      this.masterPanner.pan.value = norm;
    }
  }

  public setMute(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterVolume.volume) {
      this.masterVolume.volume.value = muted ? -Infinity : this.currentVolumeDb;
    }
  }

  public getMeterData(): MeterData {
    let val: number | number[] | undefined = undefined;
    if (this.peakMeter.getValue) {
      val = this.peakMeter.getValue();
    }
    let peak = -60;
    if (typeof val === 'number') {
      peak = isFinite(val) ? val : -60;
    } else if (Array.isArray(val) && val.length > 0) {
      peak = isFinite(val[0]) ? val[0] : -60;
    }
    const clampedPeak = Math.max(-60, Math.min(12, peak));
    return {
      peakDb: clampedPeak,
      isClipping: clampedPeak >= 0.0,
    };
  }

  public dispose(): void {
    try {
      if (this.input.disconnect) this.input.disconnect();
      this.insertChain.dispose();
      if (this.masterVolume.dispose) this.masterVolume.dispose();
      if (this.masterPanner.dispose) this.masterPanner.dispose();
      if (this.limiter.dispose) this.limiter.dispose();
      if (this.peakMeter.dispose) this.peakMeter.dispose();
      if (this.input.dispose) this.input.dispose();
    } catch {
      // Ignore disposal errors
    }
  }
}
