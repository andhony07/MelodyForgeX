import React, { useState } from 'react';
import { useArrangementStore } from '../stores/useArrangementStore';
import { useStudioStore } from '../../editor/stores/useStudioStore';
import { useAudioStore } from '../../audio/stores/useAudioStore';
import { ArrangementSectionType } from '../types/arrangementSection';
import { sectionToBeats } from '../utils/arrangementUtils';
import {
  Plus,
  Copy,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Repeat,
  LayoutGrid,
} from 'lucide-react';

export const ArrangementToolbar: React.FC = () => {
  const {
    sections,
    selectedSectionId,
    loopSectionId,
    addSection,
    deleteSection,
    duplicateSection,
    moveSection,
    setLoopSectionId,
    getSelectedSection,
  } = useArrangementStore();

  const { isLooping, toggleLoop } = useStudioStore();
  const { seek } = useAudioStore();

  const [addType, setAddType] = useState<ArrangementSectionType>('Verse');

  const selectedSec = getSelectedSection();
  const selectedIdx = sections.findIndex((s) => s.id === selectedSectionId);

  const handleAdd = () => {
    addSection(addType, addType === 'Intro' || addType === 'Pre-Chorus' || addType === 'Outro' ? 4 : 8, selectedSectionId || undefined);
  };

  const handleLoopSection = () => {
    if (!selectedSec) return;

    if (loopSectionId === selectedSec.id && isLooping) {
      // Disable section loop
      setLoopSectionId(null);
      if (isLooping) toggleLoop();
    } else {
      // Enable section loop
      setLoopSectionId(selectedSec.id);
      if (!isLooping) toggleLoop();
      
      // Seek transport to start of section
      const { startBeat } = sectionToBeats(selectedSec);
      seek(startBeat);
      useStudioStore.getState().setPlayheadPosition(selectedSec.startBar);
    }
  };

  return (
    <div className="h-8 border-b border-[#2e3444] bg-[#12141c] px-3 flex items-center justify-between text-xs text-gray-300 select-none">
      {/* Left: Section Header & Add Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider text-indigo-300">
          <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
          <span>Song Arrangement</span>
        </div>

        <div className="h-4 w-[1px] bg-[#2e3444] mx-1" />

        <div className="flex items-center gap-1">
          <select
            value={addType}
            onChange={(e) => setAddType(e.target.value as ArrangementSectionType)}
            className="bg-[#181b24] border border-[#2e3444] rounded px-1.5 py-0.5 text-xs text-gray-200 outline-hidden font-medium"
          >
            <option value="Intro">Intro (4b)</option>
            <option value="Verse">Verse (8b)</option>
            <option value="Pre-Chorus">Pre-Chorus (4b)</option>
            <option value="Chorus">Chorus (8b)</option>
            <option value="Bridge">Bridge (8b)</option>
            <option value="Outro">Outro (4b)</option>
            <option value="Custom">Custom</option>
          </select>

          <button
            onClick={handleAdd}
            className="flex items-center gap-1 px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold shadow-xs transition-colors"
            title="Add new arrangement section"
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Right: Section Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => selectedSectionId && duplicateSection(selectedSectionId)}
          disabled={!selectedSectionId}
          className="p-1 text-gray-400 hover:text-indigo-300 disabled:opacity-30 rounded hover:bg-[#181b24]"
          title="Duplicate selected section"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => selectedSectionId && moveSection(selectedSectionId, 'left')}
          disabled={!selectedSectionId || selectedIdx <= 0}
          className="p-1 text-gray-400 hover:text-indigo-300 disabled:opacity-30 rounded hover:bg-[#181b24]"
          title="Move section left"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => selectedSectionId && moveSection(selectedSectionId, 'right')}
          disabled={!selectedSectionId || selectedIdx >= sections.length - 1}
          className="p-1 text-gray-400 hover:text-indigo-300 disabled:opacity-30 rounded hover:bg-[#181b24]"
          title="Move section right"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleLoopSection}
          disabled={!selectedSec}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
            selectedSec && loopSectionId === selectedSec.id && isLooping
              ? 'bg-cyan-600 text-white'
              : 'text-gray-300 bg-[#181b24] hover:bg-gray-800'
          }`}
          title="Loop selected section boundaries"
        >
          <Repeat className="w-3 h-3" />
          <span>Loop</span>
        </button>

        <button
          onClick={() => selectedSectionId && deleteSection(selectedSectionId)}
          disabled={!selectedSectionId || sections.length <= 1}
          className="p-1 text-gray-400 hover:text-rose-400 disabled:opacity-30 rounded hover:bg-rose-500/10"
          title="Delete selected section"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
