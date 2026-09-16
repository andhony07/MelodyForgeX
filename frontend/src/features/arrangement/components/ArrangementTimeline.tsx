import React from 'react';
import { useArrangementStore } from '../stores/useArrangementStore';
import { useStudioStore } from '../../editor/stores/useStudioStore';
import { ArrangementSectionBlock } from './ArrangementSectionBlock';

interface ArrangementTimelineProps {
  measureWidth: number;
}

export const ArrangementTimeline: React.FC<ArrangementTimelineProps> = ({ measureWidth }) => {
  const { sections, selectedSectionId, loopSectionId, selectSection, totalBars } = useArrangementStore();
  const playheadPosition = useStudioStore((state) => state.playheadPosition);

  // Derive current playhead bar (1-indexed)
  const currentBar = Math.max(1, Math.floor(playheadPosition));

  return (
    <div
      className="h-8 bg-[#0f1117] border-b border-[#2e3444] flex items-center relative overflow-hidden select-none"
      style={{ width: `${totalBars * measureWidth}px` }}
    >
      {sections.map((section) => {
        const isSelected = section.id === selectedSectionId;
        const isActivePlayback =
          currentBar >= section.startBar && currentBar < section.startBar + section.lengthBars;
        const isLooping = section.id === loopSectionId;

        return (
          <ArrangementSectionBlock
            key={section.id}
            section={section}
            measureWidth={measureWidth}
            isSelected={isSelected}
            isActivePlayback={isActivePlayback}
            isLooping={isLooping}
            onClick={() => selectSection(section.id)}
          />
        );
      })}
    </div>
  );
};
