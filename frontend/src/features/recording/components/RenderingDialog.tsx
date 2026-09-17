import React, { useState } from 'react';
import { DownloadCloud, X, Layers, Music, RefreshCw, AlertCircle } from 'lucide-react';
import { useRecordingStore } from '../stores/useRecordingStore';
import { useArrangementStore } from '../../arrangement/stores/useArrangementStore';
import { useStudioStore } from '../../editor/stores/useStudioStore';
import { RenderScope } from '../types/recording';

export const RenderingDialog: React.FC = () => {
  const {
    isRenderingDialogOpen,
    renderingState,
    error,
    renderProject,
    setRenderingDialogOpen,
  } = useRecordingStore();

  const { sections } = useArrangementStore();
  const { tempo } = useStudioStore();

  const [scope, setScope] = useState<RenderScope>('full_project');
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    sections[0]?.id || ''
  );
  const [startBeat, setStartBeat] = useState(1.0);
  const [endBeat, setEndBeat] = useState(17.0);
  const [filename, setFilename] = useState('MelodyForgeX_Render');

  if (!isRenderingDialogOpen) return null;

  const isRendering = renderingState === 'rendering';

  const handleExecuteRender = async () => {
    await renderProject({
      scope,
      sectionId: scope === 'selected_section' ? selectedSectionId : undefined,
      startBeat: scope === 'loop_range' ? startBeat : undefined,
      endBeat: scope === 'loop_range' ? endBeat : undefined,
      filename,
    });
  };

  // Estimate rendering duration
  let estBeats = 16;
  if (scope === 'selected_section') {
    const sec = sections.find((s) => s.id === selectedSectionId);
    if (sec) estBeats = sec.lengthBars * 4;
  } else if (scope === 'loop_range') {
    estBeats = Math.max(1, endBeat - startBeat);
  }
  const estSeconds = Math.max(1, Math.round(estBeats * (60 / tempo)));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-[#181b24] border border-[#2e3444] rounded-xl max-w-md w-full p-4 shadow-2xl space-y-4 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2e3444]">
          <div className="flex items-center gap-2">
            <DownloadCloud className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-slate-100 text-sm">Offline Audio Project Render</h3>
          </div>
          <button
            onClick={() => setRenderingDialogOpen(false)}
            disabled={isRendering}
            className="p-1 text-gray-400 hover:text-gray-200 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scope Selection */}
        <div className="space-y-2">
          <label className="block text-gray-400 font-medium">Render Target Scope</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setScope('full_project')}
              className={`p-2 rounded-lg border text-center font-medium flex flex-col items-center gap-1 transition-all ${
                scope === 'full_project'
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                  : 'bg-[#0f1117] border-[#2e3444] text-gray-400 hover:text-gray-200'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>Full Song</span>
            </button>

            <button
              type="button"
              onClick={() => setScope('selected_section')}
              className={`p-2 rounded-lg border text-center font-medium flex flex-col items-center gap-1 transition-all ${
                scope === 'selected_section'
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                  : 'bg-[#0f1117] border-[#2e3444] text-gray-400 hover:text-gray-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Section</span>
            </button>

            <button
              type="button"
              onClick={() => setScope('loop_range')}
              className={`p-2 rounded-lg border text-center font-medium flex flex-col items-center gap-1 transition-all ${
                scope === 'loop_range'
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                  : 'bg-[#0f1117] border-[#2e3444] text-gray-400 hover:text-gray-200'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Custom Loop</span>
            </button>
          </div>
        </div>

        {/* Scope Specific Details */}
        {scope === 'selected_section' && (
          <div className="space-y-1">
            <label className="block text-gray-400 font-medium">Select Section</label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full bg-[#0f1117] border border-[#2e3444] rounded px-3 py-1.5 text-gray-100 outline-none"
            >
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name} ({sec.type}, {sec.lengthBars} bars)
                </option>
              ))}
            </select>
          </div>
        )}

        {scope === 'loop_range' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-400 mb-1">Start Beat</label>
              <input
                type="number"
                min={1}
                value={startBeat}
                onChange={(e) => setStartBeat(parseFloat(e.target.value) || 1)}
                className="w-full bg-[#0f1117] border border-[#2e3444] rounded px-2 py-1 text-gray-100 font-mono outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">End Beat</label>
              <input
                type="number"
                min={startBeat + 1}
                value={endBeat}
                onChange={(e) => setEndBeat(parseFloat(e.target.value) || startBeat + 1)}
                className="w-full bg-[#0f1117] border border-[#2e3444] rounded px-2 py-1 text-gray-100 font-mono outline-none"
              />
            </div>
          </div>
        )}

        {/* Filename */}
        <div>
          <label className="block text-gray-400 font-medium mb-1">Output File Name</label>
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="w-full bg-[#0f1117] border border-[#2e3444] rounded px-3 py-1.5 text-gray-100 outline-none"
            placeholder="MelodyForgeX_Render"
          />
        </div>

        {/* Render Info Footer */}
        <div className="flex items-center justify-between text-gray-400 bg-[#0f1117] p-2.5 rounded-lg border border-[#2e3444]">
          <span>Format: <strong className="text-cyan-400">16-bit PCM WAV</strong></span>
          <span>Duration: <strong className="text-gray-200">~{estSeconds}s</strong></span>
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-rose-400 text-[11px] bg-rose-950/50 p-2 rounded border border-rose-800/50">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2e3444]">
          <button
            onClick={() => setRenderingDialogOpen(false)}
            disabled={isRendering}
            className="px-3 py-1.5 bg-[#0f1117] hover:bg-[#181b24] text-gray-300 rounded-lg font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleExecuteRender}
            disabled={isRendering}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-semibold transition"
          >
            {isRendering ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Rendering WAV...</span>
              </>
            ) : (
              <>
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>Start Offline Render</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
