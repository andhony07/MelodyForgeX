import React from 'react';
import { SendConfig, SendBusType } from '../types/bus';

interface SendControlsProps {
  sends: SendConfig[];
  onSendLevelChange: (busType: SendBusType, levelDb: number) => void;
}

export const SendControls: React.FC<SendControlsProps> = ({ sends, onSendLevelChange }) => {
  const revSend = sends.find((s) => s.busType === 'reverb') || { busType: 'reverb' as const, levelDb: -60, enabled: false };
  const delSend = sends.find((s) => s.busType === 'delay') || { busType: 'delay' as const, levelDb: -60, enabled: false };

  return (
    <div className="flex flex-col gap-2 p-1.5 bg-slate-900/60 rounded border border-slate-700/40 text-xs">
      {/* Reverb Send Slider */}
      <div className="flex flex-col gap-0.5">
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
          <span>REV</span>
          <span className="font-mono text-[9px]">{revSend.levelDb <= -58 ? 'OFF' : `${revSend.levelDb.toFixed(0)}dB`}</span>
        </div>
        <input
          type="range"
          min={-60}
          max={6}
          step={1}
          value={revSend.levelDb}
          onChange={(e) => onSendLevelChange('reverb', parseFloat(e.target.value))}
          className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
        />
      </div>

      {/* Delay Send Slider */}
      <div className="flex flex-col gap-0.5">
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
          <span>DEL</span>
          <span className="font-mono text-[9px]">{delSend.levelDb <= -58 ? 'OFF' : `${delSend.levelDb.toFixed(0)}dB`}</span>
        </div>
        <input
          type="range"
          min={-60}
          max={6}
          step={1}
          value={delSend.levelDb}
          onChange={(e) => onSendLevelChange('delay', parseFloat(e.target.value))}
          className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};
