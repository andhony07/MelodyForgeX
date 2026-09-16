import React from 'react';
import { useAICompositionStore } from '../stores/useAICompositionStore';
import { AICompositionPreview } from './AICompositionPreview';
import { Sparkles, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { MusicalKey } from '../../editor/types/studio';
import { ScaleType } from '../../composition/types/scale';
import { SCALES } from '../../composition/constants/scales';

export const AICompositionPanel: React.FC = () => {
  const {
    request,
    pendingSpec,
    isLoading,
    error,
    setRequest,
    generateComposition,
    applyComposition,
    clearPendingSpec,
  } = useAICompositionStore();

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRequest({ prompt: e.target.value });
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setRequest({ key: val === 'Auto' ? undefined : (val as MusicalKey) });
  };

  const handleScaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setRequest({ scale: val === 'Auto' ? undefined : (val as ScaleType) });
  };

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setRequest({ tempo: isNaN(val) ? undefined : val });
  };

  const handleBarsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value, 10);
    setRequest({ bars: val });
  };

  const handleMoodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequest({ mood: e.target.value });
  };

  const handleRandomizeSeed = () => {
    setRequest({ seed: Math.floor(Math.random() * 90000) + 10000 });
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* Description Textarea */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Describe your music idea
        </label>
        <textarea
          value={request.prompt}
          onChange={handlePromptChange}
          placeholder='e.g., "Create a dark cinematic piano piece in D minor with a simple melody."'
          disabled={isLoading}
          rows={3}
          className="w-full bg-[#0f1117] border border-[#2e3444] rounded-lg p-2.5 text-xs text-gray-100 placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden resize-none transition-all"
        />
      </div>

      {/* Optional Musical Constraints */}
      <div className="space-y-2 bg-[#0f1117] p-2.5 rounded-lg border border-[#2e3444]">
        <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Optional Constraints
        </span>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-gray-500 block mb-0.5">Key</span>
            <select
              value={request.key || 'Auto'}
              onChange={handleKeyChange}
              disabled={isLoading}
              className="w-full bg-[#181b24] border border-[#2e3444] rounded px-2 py-1 text-xs text-cyan-400 font-mono font-bold outline-hidden"
            >
              <option value="Auto">Auto</option>
              {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-[10px] text-gray-500 block mb-0.5">Scale</span>
            <select
              value={request.scale || 'Auto'}
              onChange={handleScaleChange}
              disabled={isLoading}
              className="w-full bg-[#181b24] border border-[#2e3444] rounded px-2 py-1 text-xs text-emerald-400 font-mono font-bold outline-hidden"
            >
              <option value="Auto">Auto</option>
              {Object.keys(SCALES).map((sc) => (
                <option key={sc} value={sc}>
                  {sc}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-gray-500 block mb-0.5">BPM</span>
            <input
              type="number"
              value={request.tempo || ''}
              onChange={handleBpmChange}
              placeholder="Auto"
              disabled={isLoading}
              className="w-full bg-[#181b24] border border-[#2e3444] rounded px-2 py-1 text-xs text-amber-400 font-mono outline-hidden"
            />
          </div>

          <div>
            <span className="text-[10px] text-gray-500 block mb-0.5">Bars</span>
            <select
              value={request.bars || 8}
              onChange={handleBarsChange}
              disabled={isLoading}
              className="w-full bg-[#181b24] border border-[#2e3444] rounded px-2 py-1 text-xs text-gray-200 font-mono outline-hidden"
            >
              <option value={4}>4 Bars</option>
              <option value={8}>8 Bars</option>
              <option value={16}>16 Bars</option>
              <option value={32}>32 Bars</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <input
            type="text"
            value={request.mood || ''}
            onChange={handleMoodChange}
            placeholder="Mood/Style (e.g. Dark, Calm)"
            disabled={isLoading}
            className="w-2/3 bg-[#181b24] border border-[#2e3444] rounded px-2 py-1 text-[11px] text-gray-200 outline-hidden"
          />

          <button
            onClick={handleRandomizeSeed}
            disabled={isLoading}
            className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-indigo-400 bg-[#181b24] px-2 py-1 rounded border border-[#2e3444]"
            title="Randomize Seed"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Seed</span>
          </button>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={() => generateComposition()}
        disabled={isLoading || !request.prompt.trim()}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-xs transition-all shadow-md ${
          isLoading || !request.prompt.trim()
            ? 'bg-indigo-600/40 text-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25 active:scale-[0.99]'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-indigo-200" />
            <span>Generating Composition...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-indigo-300" />
            <span>Generate Composition</span>
          </>
        )}
      </button>

      {/* User-friendly Error Display */}
      {error && (
        <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 p-2.5 rounded-lg text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">Composition Error</span>
            <span className="text-[11px] text-rose-200/90">{error}</span>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {pendingSpec && (
        <AICompositionPreview
          spec={pendingSpec}
          onApply={applyComposition}
          onDiscard={clearPendingSpec}
        />
      )}
    </div>
  );
};
