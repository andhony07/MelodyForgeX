import React, { useEffect, useRef } from 'react';
import { useStudioStore } from '../stores/useStudioStore';

interface PlayheadProps {
  measureWidth: number;
}

export const Playhead: React.FC<PlayheadProps> = ({ measureWidth }) => {
  const { isPlaying, playheadPosition, tempo, stepPlayhead } = useStudioStore();
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();

      const animate = (time: number) => {
        if (lastTimeRef.current !== null) {
          const deltaSec = (time - lastTimeRef.current) / 1000;
          // Beats per second = tempo / 60
          // Measures per second = (tempo / 60) / 4 in 4/4 time
          const measuresPerSec = tempo / 240;
          const deltaMeasures = deltaSec * measuresPerSec;
          stepPlayhead(deltaMeasures);
        }
        lastTimeRef.current = time;
        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastTimeRef.current = null;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, tempo, stepPlayhead]);

  // Position calculation: measure 1 is at 0px offset
  const leftPx = (playheadPosition - 1.0) * measureWidth;

  return (
    <div
      className="absolute top-0 bottom-0 pointer-events-none z-30 transition-transform duration-75 ease-linear"
      style={{
        transform: `translateX(${leftPx}px)`,
      }}
    >
      {/* Playhead marker head */}
      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-indigo-400 -ml-[5px]" />
      {/* Playhead line */}
      <div className="w-[2px] h-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
    </div>
  );
};
