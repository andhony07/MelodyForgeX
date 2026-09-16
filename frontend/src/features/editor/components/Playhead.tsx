import React, { useEffect, useRef } from 'react';
import { useStudioStore } from '../stores/useStudioStore';
import { ToneAudioEngine } from '../../audio/engine/ToneAudioEngine';

interface PlayheadProps {
  measureWidth: number;
}

export const Playhead: React.FC<PlayheadProps> = ({ measureWidth }) => {
  const { isPlaying, playheadPosition, setPlayheadPosition } = useStudioStore();
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      const audioEngine = ToneAudioEngine.getInstance();

      const animate = () => {
        const currentBeat = audioEngine.getCurrentBeat();
        setPlayheadPosition(currentBeat);
        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, setPlayheadPosition]);

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
