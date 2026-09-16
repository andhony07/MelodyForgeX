import React from 'react';
import {
  MousePointer,
  Pencil,
  Eraser,
  Undo2,
  Redo2,
  Copy,
  ClipboardPaste,
  Trash2,
  ZoomIn,
  ZoomOut,
  Grid,
} from 'lucide-react';
import { usePianoRollStore } from '../stores/usePianoRollStore';
import { PianoRollTool, SnapValue } from '../types/note';

export const PianoRollToolbar: React.FC = () => {
  const {
    activeTool,
    snapValue,
    pixelsPerBeat,
    selectedNoteIds,
    historyIndex,
    history,
    clipboard,
    setActiveTool,
    setSnapValue,
    setPixelsPerBeat,
    undo,
    redo,
    copySelectedNotes,
    pasteNotes,
    deleteSelectedNotes,
  } = usePianoRollStore();

  const toolBtnClass = (tool: PianoRollTool) =>
    `p-1.5 rounded-md transition-colors flex items-center gap-1 font-medium text-xs ${
      activeTool === tool
        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
        : 'text-gray-400 hover:text-gray-200 hover:bg-[#202430]'
    }`;

  const actionBtnClass = () =>
    `p-1.5 rounded-md text-xs text-gray-400 hover:text-gray-200 hover:bg-[#202430] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors`;

  return (
    <div className="h-10 bg-[#12141c] border-b border-[#2e3444] px-3 flex items-center justify-between select-none text-xs">
      {/* Left Tools & Snap */}
      <div className="flex items-center gap-3">
        {/* Tool Selectors */}
        <div className="flex items-center gap-1 bg-[#0f1117] p-1 rounded-lg border border-[#2e3444]">
          <button
            onClick={() => setActiveTool('select')}
            className={toolBtnClass('select')}
            title="Select Tool (V)"
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Select</span>
          </button>
          <button
            onClick={() => setActiveTool('draw')}
            className={toolBtnClass('draw')}
            title="Draw Note Tool (P)"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Draw</span>
          </button>
          <button
            onClick={() => setActiveTool('erase')}
            className={toolBtnClass('erase')}
            title="Erase Note Tool (E)"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Erase</span>
          </button>
        </div>

        {/* Snap Selector */}
        <div className="flex items-center gap-1.5 bg-[#0f1117] px-2.5 py-1 rounded-lg border border-[#2e3444]">
          <Grid className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] text-gray-400 font-semibold uppercase">Snap</span>
          <select
            value={snapValue}
            onChange={(e) => setSnapValue(e.target.value as SnapValue)}
            className="bg-transparent text-xs font-mono font-bold text-gray-200 outline-hidden cursor-pointer"
          >
            {['1/1', '1/2', '1/4', '1/8', '1/16', '1/32'].map((s) => (
              <option key={s} value={s} className="bg-[#181b24]">
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center/Right Actions: Undo/Redo/Copy/Paste/Delete & Zoom */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-[#0f1117] p-1 rounded-lg border border-[#2e3444]">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className={actionBtnClass()}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className={actionBtnClass()}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
          <div className="h-3 w-[1px] bg-[#2e3444] mx-0.5" />
          <button
            onClick={copySelectedNotes}
            disabled={selectedNoteIds.length === 0}
            className={actionBtnClass()}
            title="Copy Selected Notes (Ctrl+C)"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => pasteNotes('track-1')}
            disabled={clipboard.length === 0}
            className={actionBtnClass()}
            title="Paste Notes (Ctrl+V)"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={deleteSelectedNotes}
            disabled={selectedNoteIds.length === 0}
            className={actionBtnClass()}
            title="Delete Selected Notes (Delete)"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          </button>
        </div>

        {/* Note Zoom Slider */}
        <div className="flex items-center gap-1.5 bg-[#0f1117] px-2.5 py-1 rounded-lg border border-[#2e3444]">
          <button
            onClick={() => setPixelsPerBeat(pixelsPerBeat - 10)}
            className="p-0.5 text-gray-400 hover:text-gray-200"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] text-gray-300 w-10 text-center">
            {pixelsPerBeat}px
          </span>
          <button
            onClick={() => setPixelsPerBeat(pixelsPerBeat + 10)}
            className="p-0.5 text-gray-400 hover:text-gray-200"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
