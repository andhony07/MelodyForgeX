import React, { useState } from 'react';
import { useStudioStore } from '../../editor/stores/useStudioStore';
import { usePianoRollStore } from '../../editor/stores/usePianoRollStore';
import { downloadMIDIFile } from '../services/midiExportService';
import { Download, X, Music, CheckSquare, Square } from 'lucide-react';

interface MIDIExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MIDIExportModal: React.FC<MIDIExportModalProps> = ({ isOpen, onClose }) => {
  const { tracks, tempo } = useStudioStore();
  const { notesByTrackId } = usePianoRollStore();

  const [filename, setFilename] = useState('melodyforge_composition');
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>(tracks.map((t) => t.id));

  if (!isOpen) return null;

  const toggleTrack = (id: string) => {
    setSelectedTrackIds((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTrackIds.length === tracks.length) {
      setSelectedTrackIds([]);
    } else {
      setSelectedTrackIds(tracks.map((t) => t.id));
    }
  };

  const handleExport = () => {
    if (selectedTrackIds.length === 0) return;
    downloadMIDIFile(tracks, notesByTrackId, tempo, {
      filename,
      selectedTrackIds,
    });
    onClose();
  };

  const totalExportNotes = selectedTrackIds.reduce((sum, tid) => {
    return sum + (notesByTrackId[tid]?.length || 0);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-[#181b24] border border-[#2e3444] rounded-xl w-full max-w-md p-5 shadow-2xl text-xs text-gray-200 font-sans space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#2e3444] pb-3">
          <div className="flex items-center gap-2 font-bold text-sm text-gray-100">
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export Standard MIDI (.mid)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-100 rounded hover:bg-[#2e3444]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filename Input */}
        <div className="space-y-1">
          <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            File Name
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="composition_name"
              className="flex-1 bg-[#0f1117] border border-[#2e3444] rounded-lg px-3 py-2 text-xs text-gray-100 outline-hidden focus:border-indigo-500"
            />
            <span className="text-gray-500 font-mono text-xs font-semibold">.mid</span>
          </div>
        </div>

        {/* Track Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Select Tracks to Include ({selectedTrackIds.length}/{tracks.length})
            </label>
            <button
              onClick={handleSelectAll}
              className="text-[10px] text-indigo-400 hover:underline"
            >
              {selectedTrackIds.length === tracks.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="max-h-40 overflow-y-auto space-y-1 bg-[#0f1117] p-2 rounded-lg border border-[#2e3444]">
            {tracks.map((track) => {
              const noteCount = notesByTrackId[track.id]?.length || 0;
              const isChecked = selectedTrackIds.includes(track.id);

              return (
                <div
                  key={track.id}
                  onClick={() => toggleTrack(track.id)}
                  className="flex items-center justify-between p-2 rounded hover:bg-[#181b24] cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-indigo-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-600 shrink-0" />
                    )}
                    <span className="font-semibold text-gray-200">{track.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {noteCount} notes
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Info Banner */}
        <div className="bg-[#0f1117] p-2.5 rounded-lg border border-[#2e3444] flex items-center justify-between text-[11px] font-mono">
          <span className="text-gray-400">Tempo: <strong className="text-amber-400">{tempo} BPM</strong></span>
          <span className="text-gray-400">Total Notes: <strong className="text-indigo-400">{totalExportNotes}</strong></span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2e3444]">
          <button
            onClick={onClose}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleExport}
            disabled={selectedTrackIds.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg font-semibold shadow-md shadow-indigo-600/20 transition-all"
          >
            <Music className="w-3.5 h-3.5" />
            <span>Download MIDI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
