import React from 'react';
import { Track } from '../../editor/types/studio';
import { TrackMixerChannel } from '../types/mixer';
import { SendControls } from './SendControls';
import { MeterDisplay } from './MeterDisplay';
import { MixerEngine } from '../engine/MixerEngine';

interface MixerChannelProps {
  track: Track;
  channel: TrackMixerChannel;
  onVolumeChange: (volumeDb: number) => void;
  onPanChange: (pan: number) => void;
  onMuteToggle: (muted: boolean) => void;
  onSoloToggle: (solo: boolean) => void;
  onSendLevelChange: (busType: 'reverb' | 'delay', levelDb: number) => void;
  onOpenInserts: () => void;
}

export const MixerChannel: React.FC<MixerChannelProps> = ({
  track,
  channel,
  onVolumeChange,
  onPanChange,
  onMuteToggle,
  onSoloToggle,
  onSendLevelChange,
  onOpenInserts,
}) => {
  const getMeter = () => MixerEngine.getInstance().getChannelMeterData(track.id);

  return (
    <div className="flex flex-col w-32 bg-slate-900 border border-slate-800 rounded-xl p-3 flex-shrink-0 shadow-lg text-slate-100 select-none hover:border-slate-700/80 transition-colors">
      {/* Track Title & Color Accent */}
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: track.color || '#6366f1' }}
        />
        <span className="font-semibold text-xs truncate w-full text-slate-200" title={track.name}>
          {track.name}
        </span>
      </div>

      {/* Inserts Trigger */}
      <button
        onClick={onOpenInserts}
        className="mb-2 w-full py-1 px-2 text-[10px] font-semibold bg-slate-800/80 hover:bg-indigo-600 text-slate-300 hover:text-white rounded border border-slate-700/60 flex items-center justify-between transition-colors"
      >
        <span>INSERTS</span>
        <span className="bg-slate-900 px-1.5 py-0.2 rounded font-mono text-indigo-400">
          {channel.inserts.length}
        </span>
      </button>

      {/* Send Controls */}
      <div className="mb-2">
        <SendControls sends={channel.sends} onSendLevelChange={onSendLevelChange} />
      </div>

      {/* Pan Control */}
      <div className="mb-3 px-1">
        <div className="flex justify-between items-center text-[10px] text-slate-400 mb-0.5">
          <span>PAN</span>
          <span className="font-mono text-[9px]">
            {channel.pan === 0 ? 'C' : channel.pan < 0 ? `L${Math.abs(channel.pan)}` : `R${channel.pan}`}
          </span>
        </div>
        <input
          type="range"
          min={-100}
          max={100}
          step={2}
          value={channel.pan}
          onChange={(e) => onPanChange(parseFloat(e.target.value))}
          className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
        />
      </div>

      {/* Mute / Solo Buttons */}
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        <button
          onClick={() => onMuteToggle(!channel.muted)}
          className={`py-1 text-xs font-bold rounded border transition-colors ${
            channel.muted
              ? 'bg-rose-500/30 text-rose-400 border-rose-500/50'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700/60'
          }`}
        >
          M
        </button>
        <button
          onClick={() => onSoloToggle(!channel.solo)}
          className={`py-1 text-xs font-bold rounded border transition-colors ${
            channel.solo
              ? 'bg-amber-500/30 text-amber-400 border-amber-500/50'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700/60'
          }`}
        >
          S
        </button>
      </div>

      {/* Level Meter & Volume Fader */}
      <div className="flex-1 flex gap-2 items-center justify-center min-h-[140px] bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
        <MeterDisplay getMeterData={getMeter} height={140} width={10} />
        <div className="flex flex-col items-center h-[140px] justify-between">
          <input
            type="range"
            min={-60}
            max={6}
            step={0.5}
            value={channel.volumeDb}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="h-[120px] accent-indigo-500 bg-slate-800 rounded appearance-none cursor-pointer [writing-mode:vertical-lr] [direction:rtl]"
          />
        </div>
      </div>

      {/* Numeric Volume readout */}
      <div className="mt-2 text-center font-mono text-[10px] text-slate-400">
        {channel.volumeDb <= -58 ? '-∞ dB' : `${channel.volumeDb.toFixed(1)} dB`}
      </div>
    </div>
  );
};
