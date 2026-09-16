import React, { useRef } from 'react';
import { Note } from '../types/note';
import { usePianoRollStore } from '../stores/usePianoRollStore';
import { MAX_MIDI_PITCH, MIN_MIDI_PITCH, midiToNoteName, snapBeat } from '../constants/note';

interface NoteBlockProps {
  note: Note;
  rowHeight: number;
  trackColor?: string;
}

export const NoteBlock: React.FC<NoteBlockProps> = ({
  note,
  rowHeight,
  trackColor = '#6366f1',
}) => {
  const {
    selectedNoteIds,
    pixelsPerBeat,
    snapValue,
    activeTool,
    selectNote,
    updateNote,
    deleteNote,
  } = usePianoRollStore();

  const noteRef = useRef<HTMLDivElement>(null);
  const isSelected = selectedNoteIds.includes(note.id);

  // Derive pixel position from pure musical data model
  const leftPx = (note.startBeat - 1.0) * pixelsPerBeat;
  const widthPx = Math.max(12, note.durationBeats * pixelsPerBeat);
  const topPx = (MAX_MIDI_PITCH - note.pitch) * rowHeight;

  // Handle note selection or erase tool click
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTool === 'erase') {
      deleteNote(note.id);
      return;
    }
    selectNote(note.id, e.shiftKey);
  };

  // Handle Note Dragging (Move pitch/beat)
  const handleDragStart = (e: React.MouseEvent) => {
    if (activeTool === 'erase') return;
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialStartBeat = note.startBeat;
    const initialPitch = note.pitch;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      // Convert delta pixels to beats
      const deltaBeats = deltaX / pixelsPerBeat;
      const rawNewBeat = Math.max(1.0, initialStartBeat + deltaBeats);
      const newBeat = snapBeat(rawNewBeat, snapValue);

      // Convert delta pixels to pitch rows
      const deltaRows = Math.round(deltaY / rowHeight);
      const newPitch = Math.max(MIN_MIDI_PITCH, Math.min(MAX_MIDI_PITCH, initialPitch - deltaRows));

      updateNote(note.id, {
        startBeat: newBeat,
        pitch: newPitch,
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Handle Note Resizing (Right edge handle)
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const startX = e.clientX;
    const initialDuration = note.durationBeats;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaBeats = deltaX / pixelsPerBeat;
      const rawNewDuration = Math.max(0.125, initialDuration + deltaBeats);

      // Snap duration
      const snappedDuration = Math.max(0.125, snapBeat(1.0 + rawNewDuration, snapValue) - 1.0);

      updateNote(note.id, {
        durationBeats: snappedDuration,
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Visual opacity based on velocity (1 - 127)
  const velocityOpacity = 0.5 + (note.velocity / 127) * 0.5;

  return (
    <div
      ref={noteRef}
      onClick={handleClick}
      onMouseDown={handleDragStart}
      className={`absolute rounded-md cursor-grab active:cursor-grabbing border shadow-md flex items-center justify-between px-1.5 overflow-hidden transition-shadow select-none group z-10 ${
        isSelected
          ? 'ring-2 ring-white border-white shadow-indigo-500/50'
          : 'border-white/30 hover:border-white/70'
      }`}
      style={{
        left: `${leftPx}px`,
        width: `${widthPx}px`,
        top: `${topPx}px`,
        height: `${rowHeight - 1}px`,
        backgroundColor: trackColor,
        opacity: velocityOpacity,
      }}
      title={`${midiToNoteName(note.pitch)} | Beat: ${note.startBeat.toFixed(2)} | Dur: ${note.durationBeats.toFixed(2)} | Vel: ${note.velocity}`}
    >
      <span className="text-[9px] font-mono font-bold text-white drop-shadow-sm truncate pointer-events-none">
        {midiToNoteName(note.pitch)}
      </span>

      {/* Right Edge Resize Handle */}
      <div
        onMouseDown={handleResizeStart}
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/40 transition-colors z-20"
        title="Drag to resize note"
      />
    </div>
  );
};
