import React from 'react';
import { AICompositionResponse } from '../types/compositionResponse';
import { Sparkles, Check, X, Music, Layers, Activity } from 'lucide-react';

interface AICompositionPreviewProps {
  spec: AICompositionResponse;
  onApply: () => void;
  onDiscard: () => void;
}

export const AICompositionPreview: React.FC<AICompositionPreviewProps> = ({
  spec,
  onApply,
  onDiscard,
}) => {
  return (
    <div className="bg-[#0f1117] border border-indigo-500/40 rounded-lg p-3 space-y-3 shadow-lg select-none text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2e3444] pb-2">
        <div className="flex items-center gap-1.5 font-bold text-indigo-300">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>{spec.title}</span>
        </div>
        <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono rounded">
          Ready to Apply
        </span>
      </div>

      {/* Primary Musical Specs */}
      <div className="grid grid-cols-3 gap-2 bg-[#181b24] p-2 rounded border border-[#2e3444] text-center">
        <div>
          <span className="text-[10px] text-gray-500 block">Key & Mode</span>
          <span className="font-mono font-bold text-cyan-400 text-xs">
            {spec.key} {spec.mode}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-gray-500 block">Tempo</span>
          <span className="font-mono font-bold text-amber-400 text-xs">
            {spec.tempo} BPM
          </span>
        </div>
        <div>
          <span className="text-[10px] text-gray-500 block">Seed</span>
          <span className="font-mono text-gray-400 text-[11px]">
            {spec.generation.seed}
          </span>
        </div>
      </div>

      {/* Progression & Sections */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          <Music className="w-3 h-3 text-indigo-400" />
          <span>Chord Progression</span>
        </div>
        <div className="flex flex-wrap gap-1 bg-[#181b24] p-2 rounded border border-[#2e3444]">
          {spec.progression.chords.map((chord, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 rounded font-mono text-[11px]"
            >
              {chord.root} {chord.quality} {chord.romanNumeral ? `(${chord.romanNumeral})` : ''}
            </span>
          ))}
        </div>
      </div>

      {/* Generated Tracks */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          <Layers className="w-3 h-3 text-cyan-400" />
          <span>Generated Tracks ({spec.tracks.length})</span>
        </div>
        <div className="space-y-1">
          {spec.tracks.map((tr, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-[#181b24] px-2 py-1 rounded text-[11px] border border-[#2e3444]"
            >
              <div className="flex items-center gap-1.5 font-medium text-gray-200">
                <Activity className="w-3 h-3 text-emerald-400" />
                <span>{tr.name}</span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">
                {tr.role} ({tr.generator})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#2e3444]">
        <button
          onClick={onDiscard}
          className="flex items-center justify-center gap-1.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-semibold transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Discard
        </button>

        <button
          onClick={onApply}
          className="flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
        >
          <Check className="w-3.5 h-3.5" />
          Apply to Studio
        </button>
      </div>
    </div>
  );
};
