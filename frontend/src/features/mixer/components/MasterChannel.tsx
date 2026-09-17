import React from 'react';
import { MasterMixerChannel } from '../types/mixer';
import { MeterDisplay } from './MeterDisplay';
import { MixerEngine } from '../engine/MixerEngine';

interface MasterChannelProps {
  master: MasterMixerChannel;
  onVolumeChange: (volumeDb: number) => void;
  onPanChange: (pan: number) => void;
  onMuteToggle: (muted: boolean) => void;
  onOpenInserts: () => void;
}

export const MasterChannel: React.FC<MasterChannelProps> = ({
  master,
  onVolumeChange,
  onPanChange,
  onMuteToggle,
  onOpenInserts,
}) => {
  const getMeter = () => MixerEngine.getInstance().getMasterMeterData();

  return (
    <div className="flex flex-col w-36 bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-950 border-2 border-indigo-500/40 rounded-xl p-3 flex-shrink-0 shadow-2xl text-slate-100 select-none">
      {/* Title */}
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-indigo-500/30">
        <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
        <span className="font-bold text-xs uppercase tracking-wider text-indigo-300">MASTER BUS</span>
      </div>

      {/* Master Inserts Button */}
      <button
        onClick={onOpenInserts}
        className="mb-3 w-full py-1.5 px-2 text-[10px] font-bold bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded border border-indigo-500/50 flex items-center justify-between transition-colors shadow-sm"
      >
        <span>MASTER FX</span>
        <span className="bg-indigo-950 px-1.5 py-0.2 rounded font-mono text-indigo-300">
          {master.inserts.length}
        </span>
      </button>

      {/* Pan Control */}
      <div className="mb-3 px-1">
        <div className="flex justify-between items-center text-[10px] text-indigo-300/80 mb-0.5 font-medium">
          <span>MASTER PAN</span>
          <span className="font-mono text-[9px]">
            {master.pan === 0 ? 'C' : master.pan < 0 ? `L${Math.abs(master.pan)}` : `R${master.pan}`}
          </span>
        </div>
        <input
          type="range"
          min={-100}
          max={100}
          step={2}
          value={master.pan}
          onChange={(e) => onPanChange(parseFloat(e.target.value))}
          className="w-full accent-indigo-400 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
        />
      </div>

      {/* Mute Button */}
      <div className="mb-3">
        <button
          onClick={() => onMuteToggle(!master.muted)}
          className={`w-full py-1.5 text-xs font-bold rounded border transition-colors ${
            master.muted
              ? 'bg-rose-500/30 text-rose-400 border-rose-500/50'
              : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700/60'
          }`}
        >
          {master.muted ? 'MUTED' : 'MUTE'}
        </button>
      </div>

      {/* Level Meter & Volume Fader */}
      <div className="flex-1 flex gap-2 items-center justify-center min-h-[140px] bg-slate-950/60 p-2.5 rounded-lg border border-indigo-500/20">
        <MeterDisplay getMeterData={getMeter} height={140} width={12} />
        <div className="flex flex-col items-center h-[140px] justify-between">
          <input
            type="range"
            min={-60}
            max={6}
            step={0.5}
            value={master.volumeDb}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="h-[120px] accent-indigo-400 bg-slate-800 rounded appearance-none cursor-pointer [writing-mode:vertical-lr] [direction:rtl]"
          />
        </div>
      </div>

      {/* Numeric Volume readout */}
      <div className="mt-2 text-center font-mono text-[11px] font-semibold text-indigo-300">
        {master.volumeDb <= -58 ? '-∞ dB' : `${master.volumeDb.toFixed(1)} dB`}
      </div>
    </div>
  );
};
