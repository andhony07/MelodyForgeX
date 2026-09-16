import React from 'react';
import { usePianoRollStore } from '../stores/usePianoRollStore';
import { useStudioStore } from '../stores/useStudioStore';
import { midiToNoteName } from '../constants/note';
import { Sliders, Music, Clock } from 'lucide-react';

export const NoteInspector: React.FC = () => {
  const { selectedTrackId, tracks } = useStudioStore();
  const { notesByTrackId, selectedNoteIds, updateNote, clearSelection } = usePianoRollStore();

  const activeTrack = tracks.find((t) => t.id === selectedTrackId);
  const currentNotes = selectedTrackId ? notesByTrackId[selectedTrackId] || [] : [];
  const selectedNotes = currentNotes.filter((n) => selectedNoteIds.includes(n.id));

  const firstSelectedNote = selectedNotes.length > 0 ? selectedNotes[0] : null;

  const handleVelocityChange = (newVel: number) => {
    selectedNotes.forEach((n) => {
      updateNote(n.id, { velocity: newVel });
    });
  };

  return (
    <div className="h-10 bg-[#12141c] border-t border-[#2e3444] px-4 flex items-center justify-between text-xs select-none font-mono">
      {/* Selected Note Metadata Details */}
      <div className="flex items-center gap-4">
        {selectedNotes.length === 0 ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Sliders className="w-3.5 h-3.5" />
            <span>No note selected. Click or draw a note on the grid.</span>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-gray-300">
            <div className="flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-gray-400">PITCH:</span>
              <strong className="text-indigo-300 font-bold">
                {firstSelectedNote ? midiToNoteName(firstSelectedNote.pitch) : ''}
              </strong>
              <span className="text-gray-500 text-[10px]">
                (MIDI {firstSelectedNote?.pitch})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-gray-400">START:</span>
              <span className="text-gray-100 font-bold">
                {firstSelectedNote?.startBeat.toFixed(2)} beats
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">DUR:</span>
              <span className="text-emerald-400 font-bold">
                {firstSelectedNote?.durationBeats.toFixed(2)} beats
              </span>
            </div>

            {selectedNotes.length > 1 && (
              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[10px]">
                {selectedNotes.length} notes selected
              </span>
            )}
          </div>
        )}
      </div>

      {/* Velocity Slider */}
      {selectedNotes.length > 0 && (
        <div className="flex items-center gap-3">
          <button
            onClick={clearSelection}
            className="text-[10px] text-gray-400 hover:text-gray-200 underline mr-2"
          >
            Deselect
          </button>
          <span className="text-[10px] text-gray-400 font-semibold uppercase">VELOCITY</span>
          <input
            type="range"
            min={1}
            max={127}
            value={firstSelectedNote?.velocity || 100}
            onChange={(e) => handleVelocityChange(parseInt(e.target.value))}
            className="w-24 h-1.5 bg-[#0f1117] rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <span className="w-8 text-right text-indigo-400 font-bold">
            {firstSelectedNote?.velocity}
          </span>
        </div>
      )}

      {selectedNotes.length === 0 && (
        <div className="text-[11px] text-gray-500">
          Track: <span className="text-indigo-400 font-bold">{activeTrack?.name || 'None'}</span>
        </div>
      )}
    </div>
  );
};
