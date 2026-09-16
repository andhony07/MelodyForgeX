import React, { useState } from 'react';
import { useStudioStore } from '../../editor/stores/useStudioStore';
import { usePianoRollStore } from '../../editor/stores/usePianoRollStore';
import { parseMIDIFile, convertMIDIToMelodyForge } from '../services/midiImportService';
import { ParsedMIDISummary } from '../types/midi';
import { Upload, X, Music, AlertCircle, FileMusic, Check } from 'lucide-react';
import { Midi } from '@tonejs/midi';

interface MIDIImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MIDIImportModal: React.FC<MIDIImportModalProps> = ({ isOpen, onClose }) => {
  const [parsedMidi, setParsedMidi] = useState<Midi | null>(null);
  const [summary, setSummary] = useState<ParsedMIDISummary | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const { midi, summary: parsedSummary } = await parseMIDIFile(file);
      if (parsedSummary.totalNotes === 0) {
        throw new Error('The selected MIDI file contains no playable notes.');
      }
      setParsedMidi(midi);
      setSummary(parsedSummary);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse MIDI file.';
      setError(msg);
      setParsedMidi(null);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyImport = () => {
    if (!parsedMidi) return;

    const payload = convertMIDIToMelodyForge(parsedMidi);

    if (payload.tempo) {
      useStudioStore.getState().setTempo(payload.tempo);
    }

    if (importMode === 'replace') {
      useStudioStore.setState({
        tracks: payload.tracks,
        selectedTrackId: payload.tracks[0]?.id || null,
      });
      usePianoRollStore.setState({
        notesByTrackId: payload.notesByTrackId,
      });
    } else {
      // Append mode
      const currentTracks = useStudioStore.getState().tracks;
      const currentNotesMap = { ...usePianoRollStore.getState().notesByTrackId };

      const mergedTracks = [...currentTracks, ...payload.tracks];
      const mergedNotesMap = { ...currentNotesMap, ...payload.notesByTrackId };

      useStudioStore.setState({
        tracks: mergedTracks,
        selectedTrackId: payload.tracks[0]?.id || currentTracks[0]?.id || null,
      });
      usePianoRollStore.setState({
        notesByTrackId: mergedNotesMap,
      });
    }

    onClose();
  };

  const handleReset = () => {
    setParsedMidi(null);
    setSummary(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-[#181b24] border border-[#2e3444] rounded-xl w-full max-w-md p-5 shadow-2xl text-xs text-gray-200 font-sans space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2e3444] pb-3">
          <div className="flex items-center gap-2 font-bold text-sm text-gray-100">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Import Standard MIDI (.mid)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-100 rounded hover:bg-[#2e3444]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Upload Drop Zone if no file loaded */}
        {!summary ? (
          <div className="space-y-3">
            <label className="border-2 border-dashed border-[#2e3444] hover:border-emerald-500/50 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-[#0f1117] hover:bg-[#12151e] transition-all group">
              <FileMusic className="w-10 h-10 text-gray-500 group-hover:text-emerald-400 transition-colors" />
              <div className="text-center">
                <span className="font-semibold text-gray-200 block">
                  Click or Drag & Drop MIDI File
                </span>
                <span className="text-[10px] text-gray-500">Supports .mid and .midi files</span>
              </div>
              <input
                type="file"
                accept=".mid,.midi,audio/midi"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="hidden"
              />
            </label>

            {error && (
              <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 p-2.5 rounded-lg">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        ) : (
          /* Parsed Summary Preview */
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-[#0f1117] p-2.5 rounded-lg border border-[#2e3444]">
              <div>
                <span className="font-bold text-gray-100 text-sm block">{summary.title}</span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {summary.trackSummaries.length} Tracks | {summary.totalNotes} Notes
                </span>
              </div>
              <div className="text-right font-mono">
                <span className="text-amber-400 font-bold block">{summary.bpm} BPM</span>
                <span className="text-gray-500 text-[10px]">{summary.timeSignature}</span>
              </div>
            </div>

            {/* Track Summaries List */}
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Detected MIDI Tracks
              </label>
              <div className="max-h-36 overflow-y-auto space-y-1 bg-[#0f1117] p-2 rounded-lg border border-[#2e3444]">
                {summary.trackSummaries.map((tr, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-1.5 bg-[#181b24] rounded text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <Music className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-semibold text-gray-200">{tr.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {tr.instrument} ({tr.noteCount} notes)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Import Mode Radio Group */}
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Import Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setImportMode('replace')}
                  className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                    importMode === 'replace'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      : 'border-[#2e3444] bg-[#0f1117] text-gray-400'
                  }`}
                >
                  <div>
                    <span className="font-semibold block text-xs">Replace</span>
                    <span className="text-[10px] opacity-70">Replace studio tracks</span>
                  </div>
                  {importMode === 'replace' && <Check className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setImportMode('append')}
                  className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                    importMode === 'append'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      : 'border-[#2e3444] bg-[#0f1117] text-gray-400'
                  }`}
                >
                  <div>
                    <span className="font-semibold block text-xs">Append</span>
                    <span className="text-[10px] opacity-70">Add alongside tracks</span>
                  </div>
                  {importMode === 'append' && <Check className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-[#2e3444]">
              <button
                onClick={handleReset}
                className="text-gray-400 hover:text-gray-200 text-xs font-medium"
              >
                Choose another file
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>

                <button
                  onClick={handleApplyImport}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold shadow-md shadow-emerald-600/20"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Import MIDI</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
