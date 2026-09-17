import * as Tone from 'tone';
import { TrackMixerChannel, MasterMixerChannel } from '../types/mixer';

// Provide Web Audio API stub for headless Node test environments where AudioParam is missing
const globalScope = globalThis as unknown as Record<string, unknown>;
if (typeof globalScope !== 'undefined' && typeof globalScope.AudioParam === 'undefined') {
  class DummyAudioParam {
    value = 0;
    setValueAtTime() {}
    linearRampToValueAtTime() {}
    exponentialRampToValueAtTime() {}
    setTargetAtTime() {}
    setValueCurveAtTime() {}
    cancelScheduledValues() {}
    cancelAndHoldAtTime() {}
  }
  globalScope.AudioParam = DummyAudioParam;
}

import { ReturnBusConfig } from '../types/bus';
import { EffectChain } from './EffectChain';
import { SharedSendReturnBus } from './SendReturnBus';
import { MasterBus } from './MasterBus';
import { MeterData } from '../types/meter';
import {
  createSafeGain,
  createSafeVolume,
  createSafePanner,
  createSafeMeter,
  GenericAudioNode,
} from '../utils/mockNode';

interface InternalChannelNode {
  trackId: string;
  input: GenericAudioNode;
  insertChain: EffectChain;
  volumeNode: GenericAudioNode;
  pannerNode: GenericAudioNode;
  reverbSendGain: GenericAudioNode;
  delaySendGain: GenericAudioNode;
  peakMeter: GenericAudioNode;
  volumeDb: number;
  pan: number;
  muted: boolean;
  solo: boolean;
}

export class MixerEngine {
  private static instance: MixerEngine | null = null;

  private channels: Map<string, InternalChannelNode> = new Map();
  private masterBus: MasterBus;
  private reverbReturnBus: SharedSendReturnBus;
  private delayReturnBus: SharedSendReturnBus;

  private constructor() {
    this.masterBus = new MasterBus();

    const defaultReverbConfig: ReturnBusConfig = {
      busType: 'reverb',
      name: 'Reverb Return',
      returnLevelDb: 0,
      muted: false,
      decaySeconds: 2.0,
    };

    const defaultDelayConfig: ReturnBusConfig = {
      busType: 'delay',
      name: 'Delay Return',
      returnLevelDb: 0,
      muted: false,
      delayTimeSeconds: 0.25,
      feedback: 0.3,
    };

    this.reverbReturnBus = new SharedSendReturnBus(defaultReverbConfig);
    this.delayReturnBus = new SharedSendReturnBus(defaultDelayConfig);

    // Route return buses output to Master Bus input
    if (this.reverbReturnBus.output.connect) {
      this.reverbReturnBus.output.connect(this.masterBus.input);
    }
    if (this.delayReturnBus.output.connect) {
      this.delayReturnBus.output.connect(this.masterBus.input);
    }
  }

  public static getInstance(): MixerEngine {
    if (!MixerEngine.instance) {
      MixerEngine.instance = new MixerEngine();
    }
    return MixerEngine.instance;
  }

  public getChannelInputNode(trackId: string): GenericAudioNode {
    const channel = this.getOrCreateChannelNode(trackId);
    return channel.input;
  }

  public getOrCreateChannelNode(trackId: string): InternalChannelNode {
    let channel = this.channels.get(trackId);
    if (!channel) {
      const input = createSafeGain(1);
      const insertChain = new EffectChain();
      const volumeNode = createSafeVolume(0);
      const pannerNode = createSafePanner(0);
      const reverbSendGain = createSafeGain(0);
      const delaySendGain = createSafeGain(0);
      const peakMeter = createSafeMeter();

      try {
        if (input.connect) input.connect(insertChain.input);
        if (insertChain.output.connect) insertChain.output.connect(volumeNode);
        if (volumeNode.connect) volumeNode.connect(pannerNode);
        if (pannerNode.connect) {
          pannerNode.connect(this.masterBus.input);
          pannerNode.connect(peakMeter);
        }

        if (volumeNode.connect) {
          volumeNode.connect(reverbSendGain);
          volumeNode.connect(delaySendGain);
        }
        if (reverbSendGain.connect) reverbSendGain.connect(this.reverbReturnBus.input);
        if (delaySendGain.connect) delaySendGain.connect(this.delayReturnBus.input);
      } catch {
        /* ignore graph connection errors in headless environment */
      }

      channel = {
        trackId,
        input,
        insertChain,
        volumeNode,
        pannerNode,
        reverbSendGain,
        delaySendGain,
        peakMeter,
        volumeDb: 0,
        pan: 0,
        muted: false,
        solo: false,
      };

      this.channels.set(trackId, channel);
    }
    return channel;
  }

  public syncChannelConfig(config: TrackMixerChannel): void {
    const channel = this.getOrCreateChannelNode(config.trackId);
    channel.volumeDb = config.volumeDb;
    channel.pan = config.pan;
    channel.muted = config.muted;
    channel.solo = config.solo;

    if (channel.pannerNode.pan) {
      channel.pannerNode.pan.value = Math.max(-1, Math.min(1, config.pan / 100));
    }
    channel.insertChain.updateChain(config.inserts);

    // Update Send Gains
    const revSend = config.sends.find((s) => s.busType === 'reverb');
    if (channel.reverbSendGain.gain) {
      if (revSend && revSend.enabled) {
        channel.reverbSendGain.gain.value = Tone.dbToGain(revSend.levelDb);
      } else {
        channel.reverbSendGain.gain.value = 0;
      }
    }

    const delSend = config.sends.find((s) => s.busType === 'delay');
    if (channel.delaySendGain.gain) {
      if (delSend && delSend.enabled) {
        channel.delaySendGain.gain.value = Tone.dbToGain(delSend.levelDb);
      } else {
        channel.delaySendGain.gain.value = 0;
      }
    }

    this.recalculateEffectiveMuteSolo();
  }

  public recalculateEffectiveMuteSolo(): void {
    let isAnySolo = false;
    this.channels.forEach((ch) => {
      if (ch.solo) isAnySolo = true;
    });

    this.channels.forEach((ch) => {
      let shouldBeMuted = ch.muted;
      if (isAnySolo) {
        shouldBeMuted = !ch.solo || ch.muted;
      }

      if (ch.volumeNode.volume) {
        ch.volumeNode.volume.value = shouldBeMuted ? -Infinity : ch.volumeDb;
      }
    });
  }

  public syncMasterConfig(config: MasterMixerChannel): void {
    this.masterBus.updateConfig(config);
  }

  public syncReturnBusConfigs(returnBuses: ReturnBusConfig[]): void {
    returnBuses.forEach((b) => {
      if (b.busType === 'reverb') {
        this.reverbReturnBus.updateConfig(b);
      } else if (b.busType === 'delay') {
        this.delayReturnBus.updateConfig(b);
      }
    });
  }

  public getChannelMeterData(trackId: string): MeterData {
    const channel = this.channels.get(trackId);
    if (!channel) return { peakDb: -60, isClipping: false };

    let val: number | number[] | undefined = undefined;
    if (channel.peakMeter.getValue) {
      val = channel.peakMeter.getValue();
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

  public getMasterMeterData(): MeterData {
    return this.masterBus.getMeterData();
  }

  public removeChannel(trackId: string): void {
    const channel = this.channels.get(trackId);
    if (channel) {
      try {
        if (channel.input.disconnect) channel.input.disconnect();
        channel.insertChain.dispose();
        if (channel.volumeNode.dispose) channel.volumeNode.dispose();
        if (channel.pannerNode.dispose) channel.pannerNode.dispose();
        if (channel.reverbSendGain.dispose) channel.reverbSendGain.dispose();
        if (channel.delaySendGain.dispose) channel.delaySendGain.dispose();
        if (channel.peakMeter.dispose) channel.peakMeter.dispose();
        if (channel.input.dispose) channel.input.dispose();
      } catch {
        // Ignore disposal errors
      }
      this.channels.delete(trackId);
      this.recalculateEffectiveMuteSolo();
    }
  }

  public dispose(): void {
    this.channels.forEach((_ch, trackId) => this.removeChannel(trackId));
    this.channels.clear();
    this.masterBus.dispose();
    this.reverbReturnBus.dispose();
    this.delayReturnBus.dispose();
  }
}
