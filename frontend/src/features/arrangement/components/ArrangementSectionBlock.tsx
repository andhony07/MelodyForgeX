import React from 'react';
import { ArrangementSection } from '../types/arrangementSection';
import { getSectionColor } from '../utils/arrangementUtils';
import { Repeat } from 'lucide-react';

interface ArrangementSectionBlockProps {
  section: ArrangementSection;
  measureWidth: number;
  isSelected: boolean;
  isActivePlayback: boolean;
  isLooping: boolean;
  onClick: () => void;
}

export const ArrangementSectionBlock: React.FC<ArrangementSectionBlockProps> = ({
  section,
  measureWidth,
  isSelected,
  isActivePlayback,
  isLooping,
  onClick,
}) => {
  const colorScheme = getSectionColor(section.type);
  const blockWidth = section.lengthBars * measureWidth;
  const endBar = section.startBar + section.lengthBars - 1;

  return (
    <div
      onClick={onClick}
      style={{ width: `${blockWidth}px` }}
      className={`h-8 flex-shrink-0 relative border-r ${colorScheme.border} ${colorScheme.bg} px-2 py-1 flex items-center justify-between cursor-pointer select-none transition-all group ${
        isSelected ? 'ring-2 ring-indigo-400 z-10' : ''
      } ${isActivePlayback ? 'brightness-125 shadow-inner' : ''}`}
    >
      {/* Active Playback Glowing Bar */}
      {isActivePlayback && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-cyan-400 animate-pulse" />
      )}

      {/* Section Name & Badge */}
      <div className="flex items-center gap-1.5 overflow-hidden">
        <span className={`font-bold text-xs truncate ${colorScheme.text}`}>
          {section.name}
        </span>
        <span
          className={`px-1 py-0.2 text-[9px] font-semibold uppercase tracking-wider rounded border ${colorScheme.badge} hidden sm:inline-block`}
        >
          {section.type}
        </span>
      </div>

      {/* Section Bars Range & Loop Indicator */}
      <div className="flex items-center gap-1 font-mono text-[10px] text-gray-400 shrink-0">
        {isLooping && <Repeat className="w-3 h-3 text-cyan-400 animate-spin" />}
        <span>
          {section.startBar}–{endBar}
        </span>
      </div>
    </div>
  );
};
