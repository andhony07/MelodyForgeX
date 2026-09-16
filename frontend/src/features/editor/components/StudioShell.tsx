import React, { useEffect } from 'react';
import { StudioHeader } from './StudioHeader';
import { TransportBar } from './TransportBar';
import { TrackList } from './TrackList';
import { StudioStatusBar } from './StudioStatusBar';
import { useStudioStore } from '../stores/useStudioStore';

export const StudioShell: React.FC = () => {
  const {
    togglePlay,
    stop,
    toggleMute,
    selectedTrackId,
  } = useStudioStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if focus is inside form input, textarea, or select
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'SELECT')
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyS') {
        e.preventDefault();
        stop();
      } else if (e.code === 'KeyM') {
        if (selectedTrackId) {
          e.preventDefault();
          toggleMute(selectedTrackId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, stop, toggleMute, selectedTrackId]);

  return (
    <div className="h-full flex flex-col bg-[#0f1117] text-gray-100 overflow-hidden select-none">
      <StudioHeader />
      <TransportBar />
      <TrackList />
      <StudioStatusBar />
    </div>
  );
};
