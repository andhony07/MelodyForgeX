import React from 'react';
import { AssistantHistoryEntry } from '../types/productionTypes';
import { History, Trash2, Clock } from 'lucide-react';

interface Props {
  history: AssistantHistoryEntry[];
  onClear: () => void;
}

export const ProductionAssistantHistory: React.FC<Props> = ({ history, onClear }) => {
  if (!history || history.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center text-xs text-slate-400">
        No assistant analysis history recorded yet.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          Analysis History
        </h3>
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear History
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {history.map((h) => (
          <div key={h.id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200 capitalize">{h.mode} Mode</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-slate-400 truncate max-w-sm">{h.prompt || h.summary}</p>
            </div>
            <div className="text-right font-mono text-[11px] text-slate-400">
              {h.suggestionsCount} Suggestions
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
