import React from 'react';
import { Track } from '../types/studio';
import { useStudioStore } from '../stores/useStudioStore';
import { InstrumentIcon } from './InstrumentIcon';
import { Trash2 } from 'lucide-react';

interface TrackHeaderProps {
  track: Track;
}

export const TrackHeader: React.FC<TrackHeaderProps> = ({ track }) => {
  const {
    selectedTrackId,
    selectTrack,
    toggleMute,
    toggleSolo,
    setVolume,
    deleteTrack,
  } = useStudioStore();

  const isSelected = selectedTrackId === track.id;

  return (
    <div
      onClick={() => selectTrack(track.id)}
      className={`h-20 border-b border-[#2e3444] px-3 py-2 flex flex-col justify-between select-none cursor-pointer transition-colors relative ${
        isSelected
          ? 'bg-[#202430] border-l-4 border-l-indigo-500'
          : 'bg-[#181b24] hover:bg-[#1c202b] border-l-4 border-l-transparent'
      }`}
    >
      {/* Top Row: Icon, Track Name, Channel, Delete */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 border"
            style={{
              backgroundColor: `${track.color}20`,
              borderColor: `${track.color}50`,
              color: track.color,
            }}
          >
            <InstrumentIcon iconName={track.iconName} className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-gray-100 truncate">
            {track.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] text-gray-400 font-mono">Ch {track.channel}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteTrack(track.id);
            }}
            className="p-1 text-gray-400 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
            title="Delete Track"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Bottom Row: Mute, Solo, Volume Slider */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute(track.id);
            }}
            className={`w-5 h-5 rounded text-[10px] font-bold font-mono transition-colors flex items-center justify-center ${
              track.muted
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/40'
                : 'bg-[#0f1117] text-gray-400 border border-[#2e3444] hover:text-gray-200'
            }`}
            title="Mute Track (M)"
          >
            M
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSolo(track.id);
            }}
            className={`w-5 h-5 rounded text-[10px] font-bold font-mono transition-colors flex items-center justify-center ${
              track.solo
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/40'
                : 'bg-[#0f1117] text-gray-400 border border-[#2e3444] hover:text-gray-200'
            }`}
            title="Solo Track"
          >
            S
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-1.5 flex-1 max-w-[110px]" onClick={(e) => e.stopPropagation()}>
          <input
            type="range"
            min={0}
            max={100}
            value={track.volume}
            onChange={(e) => setVolume(track.id, parseInt(e.target.value))}
            className="w-full h-1 bg-[#0f1117] rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <span className="text-[10px] font-mono text-gray-400 w-6 text-right">
            {track.volume}
          </span>
        </div>
      </div>
    </div>
  );
};
