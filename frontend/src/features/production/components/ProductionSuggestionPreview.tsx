import React from 'react';
import { ProductionSuggestion } from '../types/productionSuggestion';
import { X, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface Props {
  suggestion: ProductionSuggestion | null;
  onClose: () => void;
  onApply: (id: string) => void;
  onReject: (id: string) => void;
}

export const ProductionSuggestionPreview: React.FC<Props> = ({
  suggestion,
  onClose,
  onApply,
  onReject,
}) => {
  if (!suggestion) return null;

  const currentValStr =
    suggestion.currentValue !== undefined ? JSON.stringify(suggestion.currentValue) : 'Default / Current';
  const proposedValStr =
    suggestion.proposedValue !== undefined ? JSON.stringify(suggestion.proposedValue) : JSON.stringify(suggestion.parameters);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-slate-100">Production Suggestion Preview</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-indigo-300">{suggestion.title}</h4>
            <p className="text-xs text-slate-300 mt-1">{suggestion.description}</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
            <div className="text-slate-400 font-medium">Rationale</div>
            <div className="text-slate-200">{suggestion.reason}</div>
          </div>

          {/* BEFORE -> AFTER State Comparison */}
          <div className="grid grid-cols-2 gap-3 text-xs pt-2">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400 font-medium mb-1">BEFORE (Current State)</div>
              <div className="font-mono text-amber-300 break-all">{currentValStr}</div>
            </div>

            <div className="bg-indigo-950/30 p-3 rounded-xl border border-indigo-500/30">
              <div className="text-indigo-300 font-medium mb-1">PROPOSED CHANGE</div>
              <div className="font-mono text-indigo-200 break-all flex items-center gap-1">
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                {proposedValStr}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Atomic State Safety: All changes can be previewed, rejected, or safely applied with instant rollback.</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              onReject(suggestion.id);
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Dismiss Suggestion
          </button>
          <button
            onClick={() => {
              onApply(suggestion.id);
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            Accept & Apply Change
          </button>
        </div>
      </div>
    </div>
  );
};
