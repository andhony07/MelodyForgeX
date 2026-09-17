import React from 'react';
import { ProductionSuggestion } from '../types/productionSuggestion';
import { Check, X, Eye, Sparkles, Sliders, Layers, Music, Zap } from 'lucide-react';

interface Props {
  suggestion: ProductionSuggestion;
  onPreview: (id: string) => void;
  onApply: (id: string) => void;
  onReject: (id: string) => void;
}

export const ProductionSuggestionCard: React.FC<Props> = ({
  suggestion,
  onPreview,
  onApply,
  onReject,
}) => {
  const getCategoryIcon = () => {
    switch (suggestion.category) {
      case 'mix':
        return <Sliders className="w-4 h-4 text-emerald-400" />;
      case 'arrangement':
        return <Layers className="w-4 h-4 text-indigo-400" />;
      case 'musical':
        return <Music className="w-4 h-4 text-amber-400" />;
      default:
        return <Zap className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        suggestion.applied
          ? 'bg-emerald-950/20 border-emerald-500/30'
          : suggestion.rejected
          ? 'bg-slate-900/40 border-slate-800 opacity-60'
          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-800/80">{getCategoryIcon()}</div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-200">{suggestion.title}</h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-800 text-slate-300">
                {Math.round(suggestion.confidence * 100)}% Confidence
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{suggestion.description}</p>
          </div>
        </div>

        {suggestion.applied ? (
          <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-medium">
            <Check className="w-3.5 h-3.5" /> Applied
          </span>
        ) : suggestion.rejected ? (
          <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-800/60 px-2.5 py-1 rounded-lg">
            Dismissed
          </span>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPreview(suggestion.id)}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Preview Changes"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              Preview
            </button>
            <button
              onClick={() => onApply(suggestion.id)}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors shadow-sm"
              title="Apply Suggestion"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Apply
            </button>
            <button
              onClick={() => onReject(suggestion.id)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="truncate">Reason: {suggestion.reason}</span>
        <span className="font-mono text-slate-500 capitalize shrink-0 ml-2">Target: {suggestion.targetType}</span>
      </div>
    </div>
  );
};
