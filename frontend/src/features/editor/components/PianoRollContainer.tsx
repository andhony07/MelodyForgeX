import React, { useEffect, useRef } from 'react';
import { PianoRollToolbar } from './PianoRollToolbar';
import { PianoKeyboard } from './PianoKeyboard';
import { PianoRollGrid } from './PianoRollGrid';
import { NoteInspector } from './NoteInspector';
import { usePianoRollStore } from '../stores/usePianoRollStore';
import { useStudioStore } from '../stores/useStudioStore';

export const PianoRollContainer: React.FC = () => {
  const rowHeight = 22; // 22px per pitch row
  const gridScrollRef = useRef<HTMLDivElement>(null);
  const selectedTrackId = useStudioStore((state) => state.selectedTrackId);

  const {
    deleteSelectedNotes,
    copySelectedNotes,
    pasteNotes,
    undo,
    redo,
  } = usePianoRollStore();

  // Scroll to middle pitch range (around C4 / MIDI 60) on mount
  useEffect(() => {
    if (gridScrollRef.current) {
      // C4 is index 36 from top (96 - 60 = 36)
      const targetScrollTop = 36 * rowHeight - 150;
      gridScrollRef.current.scrollTop = Math.max(0, targetScrollTop);
    }
  }, [rowHeight]);

  // Global Keyboard Shortcuts for Note Editing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT')
      ) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedNotes();
      } else if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          redo();
        } else if (e.key === 'c' || e.key === 'C') {
          e.preventDefault();
          copySelectedNotes();
        } else if (e.key === 'v' || e.key === 'V') {
          e.preventDefault();
          if (selectedTrackId) {
            pasteNotes(selectedTrackId);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelectedNotes, copySelectedNotes, pasteNotes, undo, redo, selectedTrackId]);

  return (
    <div className="flex-1 flex flex-col bg-[#0f1117] overflow-hidden border-t border-[#2e3444] select-none">
      {/* Top Piano Roll Toolbar */}
      <PianoRollToolbar />

      {/* Main Keyboard + Grid Scroll Viewport */}
      <div className="flex-1 flex overflow-hidden relative">
        <div ref={gridScrollRef} className="flex-1 flex overflow-auto relative">
          <PianoKeyboard rowHeight={rowHeight} />
          <div className="flex-1 overflow-visible relative">
            <PianoRollGrid rowHeight={rowHeight} />
          </div>
        </div>
      </div>

      {/* Bottom Note Inspector */}
      <NoteInspector />
    </div>
  );
};
