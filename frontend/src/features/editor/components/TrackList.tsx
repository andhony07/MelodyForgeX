import React, { useRef } from 'react';
import { useStudioStore } from '../stores/useStudioStore';
import { useArrangementStore } from '../../arrangement/stores/useArrangementStore';
import { TrackHeader } from './TrackHeader';
import { TrackLane } from './TrackLane';
import { TimelineRuler } from './TimelineRuler';
import { ArrangementTimeline } from '../../arrangement/components/ArrangementTimeline';
import { Playhead } from './Playhead';
import { AddTrackButton } from './AddTrackButton';
import { ZoomControls } from './ZoomControls';
import { Layers } from 'lucide-react';

export const TrackList: React.FC = () => {
  const { tracks, zoom } = useStudioStore();
  const { totalBars } = useArrangementStore();
  const timelineScrollRef = useRef<HTMLDivElement>(null);

  // Base measure width is 100px at 100% zoom
  const measureWidth = 100 * (zoom / 100);
  const totalMeasures = Math.max(32, totalBars);

  return (
    <div className="flex-1 flex overflow-hidden bg-[#0f1117] relative select-none">
      {/* Left Fixed Panel: Track Headers */}
      <div className="w-64 border-r border-[#2e3444] bg-[#181b24] flex flex-col flex-shrink-0 z-20 shadow-lg">
        {/* Track Headers Toolbar */}
        <div className="h-8 border-b border-[#2e3444] bg-[#12141c] px-3 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1.5 font-semibold text-[11px] uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tracks ({tracks.length})</span>
          </div>
          <AddTrackButton />
        </div>

        {/* Scrollable Track Headers */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#2e3444]/40">
          {tracks.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500">
              No tracks added. Click + Add Track to begin.
            </div>
          ) : (
            tracks.map((track) => <TrackHeader key={track.id} track={track} />)
          )}
        </div>
      </div>

      {/* Right Scrollable Panel: Timeline & Lanes */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Timeline Header Toolbar (Arrangement Timeline + Ruler + Zoom Controls) */}
        <div className="flex items-center justify-between bg-[#12141c] border-b border-[#2e3444] z-20">
          <div
            ref={timelineScrollRef}
            className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin"
          >
            <div className="relative min-w-full flex flex-col">
              <ArrangementTimeline measureWidth={measureWidth} />
              <TimelineRuler measureWidth={measureWidth} totalMeasures={totalMeasures} />
            </div>
          </div>
          <div className="px-3 border-l border-[#2e3444] bg-[#181b24] h-16 flex items-center">
            <ZoomControls />
          </div>
        </div>

        {/* Scrollable Timeline Grid Lanes with Playhead */}
        <div className="flex-1 overflow-auto relative">
          <div
            className="relative"
            style={{ width: `${totalMeasures * measureWidth}px` }}
          >
            {/* Playhead Overlay */}
            <Playhead measureWidth={measureWidth} />

            {/* Track Lanes */}
            <div className="divide-y divide-[#2e3444]/30">
              {tracks.map((track) => (
                <TrackLane
                  key={track.id}
                  track={track}
                  measureWidth={measureWidth}
                  totalMeasures={totalMeasures}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
