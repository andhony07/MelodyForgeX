import React, { useRef } from 'react';
import { usePianoRollStore } from '../stores/usePianoRollStore';
import { useStudioStore } from '../stores/useStudioStore';
import { PITCH_LIST, isBlackKey, snapBeat } from '../constants/note';
import { NoteBlock } from './NoteBlock';

interface PianoRollGridProps {
  rowHeight: number;
  totalMeasures?: number;
}

export const PianoRollGrid: React.FC<PianoRollGridProps> = ({
  rowHeight,
  totalMeasures = 32,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const { selectedTrackId, tracks, playheadPosition } = useStudioStore();
  const {
    notesByTrackId,
    pixelsPerBeat,
    activeTool,
    snapValue,
    addNote,
    clearSelection,
  } = usePianoRollStore();

  const activeTrack = tracks.find((t) => t.id === selectedTrackId);
  const currentNotes = selectedTrackId ? notesByTrackId[selectedTrackId] || [] : [];

  const totalBeats = totalMeasures * 4;
  const gridWidthPx = totalBeats * pixelsPerBeat;

  // Handle clicking on empty grid area to add a note (Draw tool) or clear selection (Select tool)
  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedTrackId || !gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (activeTool === 'draw') {
      // Convert click position to beat and pitch
      const rawBeat = Math.max(1.0, (clickX / pixelsPerBeat) + 1.0);
      const snappedStartBeat = snapBeat(rawBeat, snapValue);

      const pitchIndex = Math.floor(clickY / rowHeight);
      const pitch = PITCH_LIST[Math.max(0, Math.min(PITCH_LIST.length - 1, pitchIndex))];

      addNote({
        trackId: selectedTrackId,
        pitch,
        startBeat: snappedStartBeat,
        durationBeats: 1.0, // Default 1 quarter note duration
        velocity: 100,
      });
    } else if (activeTool === 'select') {
      clearSelection();
    }
  };

  // Playhead position overlay calculation
  const playheadPx = (playheadPosition - 1.0) * pixelsPerBeat;

  return (
    <div
      ref={gridRef}
      onClick={handleGridClick}
      className="relative bg-[#0f1117] select-none cursor-crosshair overflow-hidden"
      style={{
        width: `${gridWidthPx}px`,
        height: `${PITCH_LIST.length * rowHeight}px`,
      }}
    >
      {/* Background Horizontal Pitch Rows */}
      {PITCH_LIST.map((pitch, idx) => {
        const black = isBlackKey(pitch);
        return (
          <div
            key={pitch}
            className={`border-b border-[#2e3444]/30 ${
              black ? 'bg-[#0a0c12]/80' : 'bg-[#0f1117]'
            }`}
            style={{
              height: `${rowHeight}px`,
              top: `${idx * rowHeight}px`,
            }}
          />
        );
      })}

      {/* Background Vertical Measure Grid Lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #2e3444 1px, transparent 1px)`,
          backgroundSize: `${pixelsPerBeat * 4}px 100%`,
        }}
      />
      {/* Background Quarter Beat Grid Lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `linear-gradient(to right, #2e3444 1px, transparent 1px)`,
          backgroundSize: `${pixelsPerBeat}px 100%`,
        }}
      />

      {/* Render Note Blocks */}
      {currentNotes.map((note) => (
        <NoteBlock
          key={note.id}
          note={note}
          rowHeight={rowHeight}
          trackColor={activeTrack?.color || '#6366f1'}
        />
      ))}

      {/* Playhead Overlay Line */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none z-20 w-[2px] bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
        style={{ left: `${playheadPx}px` }}
      />
    </div>
  );
};
