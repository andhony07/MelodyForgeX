import React from 'react';
import { Track } from '../types/studio';
import { useStudioStore } from '../stores/useStudioStore';

interface TrackLaneProps {
  track: Track;
  measureWidth: number;
  totalMeasures?: number;
}

export const TrackLane: React.FC<TrackLaneProps> = ({
  track,
  measureWidth,
  totalMeasures = 32,
}) => {
  const selectedTrackId = useStudioStore((state) => state.selectedTrackId);
  const isSelected = selectedTrackId === track.id;

  // Generate demo placeholder regions for visual DAW structure
  const startMeasure = ((parseInt(track.id.replace(/\D/g, '')) * 2) % 6) + 1;
  const durationMeasures = 4 + (parseInt(track.id.replace(/\D/g, '')) % 4);

  const clipLeft = (startMeasure - 1) * measureWidth;
  const clipWidth = durationMeasures * measureWidth;

  return (
    <div
      className={`h-20 border-b border-[#2e3444] relative flex items-center select-none overflow-hidden transition-colors ${
        isSelected ? 'bg-[#1e222d]' : 'bg-[#0f1117]'
      }`}
      style={{ width: `${totalMeasures * measureWidth}px` }}
    >
      {/* Background Measure Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#181b24_1px,transparent_1px)] bg-[size:100px_100%] opacity-60 pointer-events-none" />

      {/* Placeholder Clip Region */}
      <div
        className="absolute h-14 rounded-lg border flex flex-col justify-between p-2 shadow-sm transition-all group overflow-hidden"
        style={{
          left: `${clipLeft}px`,
          width: `${clipWidth}px`,
          backgroundColor: `${track.color}18`,
          borderColor: `${track.color}60`,
        }}
      >
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="font-semibold text-gray-200 truncate">{track.name} [Region 1]</span>
          <span className="text-gray-400 text-[9px] bg-[#0f1117]/80 px-1 rounded">Placeholder</span>
        </div>

        {/* Visual Waveform/MIDI Pattern Simulation Lines */}
        <div className="flex items-center gap-1 opacity-70 h-3">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-xs"
              style={{
                height: `${20 + ((i * 17) % 80)}%`,
                backgroundColor: track.color,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
