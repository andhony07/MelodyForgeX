import React from 'react';
import { useStudioStore } from '../stores/useStudioStore';

interface TimelineRulerProps {
  measureWidth: number;
  totalMeasures?: number;
}

export const TimelineRuler: React.FC<TimelineRulerProps> = ({
  measureWidth,
  totalMeasures = 32,
}) => {
  const setPlayheadPosition = useStudioStore((state) => state.setPlayheadPosition);

  const measures = Array.from({ length: totalMeasures }, (_, i) => i + 1);

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    // Calculate measure position (1-indexed)
    const newMeasure = Math.max(1.0, clickX / measureWidth + 1.0);
    setPlayheadPosition(newMeasure);
  };

  return (
    <div
      onClick={handleRulerClick}
      className="h-8 bg-[#12141c] border-b border-[#2e3444] flex items-center relative select-none cursor-pointer font-mono text-[10px] text-gray-400 overflow-hidden"
      style={{ width: `${totalMeasures * measureWidth}px` }}
    >
      {measures.map((m) => (
        <div
          key={m}
          className="h-full border-r border-[#2e3444]/60 flex flex-col justify-between pt-1 px-1.5 relative group"
          style={{ width: `${measureWidth}px` }}
        >
          <span className="font-semibold text-gray-300">{m}</span>

          {/* Quarter beat ticks */}
          <div className="flex justify-between w-full pb-0.5 opacity-40">
            <span className="h-1.5 w-[1px] bg-gray-500" />
            <span className="h-2 w-[1px] bg-gray-400" />
            <span className="h-1.5 w-[1px] bg-gray-500" />
          </div>
        </div>
      ))}
    </div>
  );
};
