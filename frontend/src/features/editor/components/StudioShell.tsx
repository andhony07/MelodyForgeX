import React, { useEffect } from 'react';
import { StudioHeader } from './StudioHeader';
import { TransportBar } from './TransportBar';
import { TrackList } from './TrackList';
import { PianoRollContainer } from './PianoRollContainer';
import { CompositionPanel } from '../../composition/components/CompositionPanel';
import { StudioStatusBar } from './StudioStatusBar';
import { ArrangementToolbar } from '../../arrangement/components/ArrangementToolbar';
import { RenderingDialog } from '../../recording/components/RenderingDialog';
import { useStudioStore } from '../stores/useStudioStore';
import { usePianoRollStore } from '../stores/usePianoRollStore';
import { useAudioStore } from '../../audio/stores/useAudioStore';
import { useArrangementStore } from '../../arrangement/stores/useArrangementStore';
import { sectionToBeats } from '../../arrangement/utils/arrangementUtils';

export const StudioShell: React.FC = () => {
  const {
    tracks,
    tempo,
    isLooping,
    togglePlay,
    stop,
    toggleMute,
    selectedTrackId,
  } = useStudioStore();

  const { notesByTrackId } = usePianoRollStore();
  const { syncAudio, play: audioPlay, stop: audioStop } = useAudioStore();
  const { sections, loopSectionId } = useArrangementStore();

  // Derive section loop bounds if active
  let loopStartBeat = 1.0;
  let loopEndBeat: number | undefined = undefined;

  if (loopSectionId) {
    const loopSec = sections.find((s) => s.id === loopSectionId);
    if (loopSec) {
      const bounds = sectionToBeats(loopSec);
      loopStartBeat = bounds.startBeat;
      loopEndBeat = bounds.endBeat;
    }
  }

  // Keep Audio Engine synchronized with active tracks, notes, tempo, and loop bounds
  useEffect(() => {
    syncAudio(tracks, notesByTrackId, tempo, isLooping, loopStartBeat, loopEndBeat);
  }, [tracks, notesByTrackId, tempo, isLooping, loopStartBeat, loopEndBeat, syncAudio]);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
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
        const isPlaying = useStudioStore.getState().isPlaying;
        if (isPlaying) {
          useAudioStore.getState().pause();
        } else {
          await audioPlay();
        }
        togglePlay();
      } else if (e.code === 'KeyS') {
        e.preventDefault();
        audioStop();
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
  }, [togglePlay, stop, toggleMute, selectedTrackId, audioPlay, audioStop]);

  return (
    <div className="h-full flex flex-col bg-[#0f1117] text-gray-100 overflow-hidden select-none">
      <StudioHeader />
      <TransportBar />
      <ArrangementToolbar />
      <div className="flex-1 flex overflow-hidden">
        {/* Main Workspace (TrackList + PianoRoll) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top: Track Headers & Track Lanes */}
          <div className="h-[45%] flex flex-col overflow-hidden">
            <TrackList />
          </div>

          {/* Bottom: Piano Roll Editor */}
          <div className="h-[55%] flex flex-col overflow-hidden">
            <PianoRollContainer />
          </div>
        </div>

        {/* Right: Composition & Audio Library Panel */}
        <CompositionPanel />
      </div>
      <StudioStatusBar />

      {/* Render Dialog Modal */}
      <RenderingDialog />
    </div>
  );
};
