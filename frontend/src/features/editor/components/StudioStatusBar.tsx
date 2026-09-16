import React from 'react';
import { useStudioStore } from '../stores/useStudioStore';
import { Keyboard, Layers } from 'lucide-react';

export const StudioStatusBar: React.FC = () => {
  const { tracks, selectedTrackId, playheadPosition, zoom } = useStudioStore();

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId);

  return (
    <div className="h-7 bg-[#12141c] border-t border-[#2e3444] px-4 flex items-center justify-between text-[11px] text-gray-400 font-mono select-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            Selected Track:{' '}
            <strong className="text-gray-200">{selectedTrack ? selectedTrack.name : 'None'}</strong>
          </span>
        </div>
        <span>|</span>
        <div>
          <span>Measures: </span>
          <strong className="text-gray-200">32 Bars</strong>
        </div>
        <span>|</span>
          <div>
          <span>Pos: </span>
          <strong className="text-indigo-400 font-bold">{playheadPosition.toFixed(2)}</strong>
        </div>
      </div>

      <div className="flex items-center gap-4 text-gray-400">
        <div className="flex items-center gap-1.5 text-gray-400">
          <Keyboard className="w-3.5 h-3.5 text-indigo-400" />
          <span>Space: Play/Pause | S: Stop | M: Mute</span>
        </div>
        <span>|</span>
        <div>
          <span>Scale: </span>
          <span className="text-gray-200">{zoom}%</span>
        </div>
      </div>
    </div>
  );
};
