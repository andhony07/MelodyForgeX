import React, { useState, useEffect } from 'react';
import { useProductionAssistantStore } from '../stores/useProductionAssistantStore';
import { AssistantMode } from '../types/productionTypes';
import { ProductionSummary } from './ProductionSummary';
import { ProductionSuggestions } from './ProductionSuggestions';
import { ProductionSuggestionPreview } from './ProductionSuggestionPreview';
import { ProductionAssistantHistory } from './ProductionAssistantHistory';
import { Sparkles, Bot, AlertTriangle, Send, RefreshCw } from 'lucide-react';

export const ProductionAssistantPanel: React.FC = () => {
  const {
    activeMode,
    report,
    suggestions,
    previewSuggestion,
    history,
    isAnalyzing,
    usedAI,
    error,
    setMode,
    runAnalysis,
    openPreview,
    closePreview,
    applySuggestion,
    rejectSuggestion,
    clearHistory,
  } = useProductionAssistantStore();

  const [promptInput, setPromptInput] = useState('');

  useEffect(() => {
    if (!report) {
      runAnalysis('analyze');
    }
  }, [report, runAnalysis]);

  const handleModeChange = (mode: AssistantMode) => {
    setMode(mode);
    runAnalysis(mode, promptInput);
  };

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    runAnalysis(activeMode, promptInput.trim());
  };

  return (
    <div className="h-full flex flex-col bg-[#0f1117] text-slate-100 p-4 space-y-4 overflow-y-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              AI Production Assistant
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                Phase 14
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Intelligent DAW assistant offering structured, previewable production guidance.
            </p>
          </div>
        </div>

        <button
          onClick={() => runAnalysis(activeMode, promptInput)}
          disabled={isAnalyzing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing...' : 'Re-Analyze Project'}
        </button>
      </div>

      {/* Mode Selector Bar */}
      <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 text-xs overflow-x-auto">
        {(['analyze', 'arrangement', 'mix', 'musical', 'export'] as AssistantMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => handleModeChange(mode)}
            className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors shrink-0 ${
              activeMode === mode
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {mode === 'analyze' ? 'Full Health Audit' : mode}
          </button>
        ))}
      </div>

      {/* Assistant Prompt Input */}
      <form onSubmit={handleSendPrompt} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Ask assistant: 'Make chorus bigger', 'Improve drum mix', or 'Prepare for export'..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={isAnalyzing || !promptInput.trim()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs text-slate-200 font-medium transition-colors"
        >
          <Send className="w-3.5 h-3.5 text-indigo-400" />
          Ask Assistant
        </button>
      </form>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Report Summary */}
      {report && <ProductionSummary stats={report.projectStats} usedAI={usedAI} />}

      {/* Findings & Observations List */}
      {report && report.findings.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Detected Production Findings ({report.findings.length})
          </h3>
          <div className="space-y-2">
            {report.findings.map((f) => (
              <div
                key={f.id}
                className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs flex items-start justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold ${
                        f.severity === 'issue'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : f.severity === 'warning'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {f.severity}
                    </span>
                    <h4 className="font-semibold text-slate-200">{f.title}</h4>
                  </div>
                  <p className="text-slate-400">{f.description}</p>
                </div>
                {f.suggestedAction && (
                  <span className="text-[11px] text-indigo-300 bg-indigo-950/50 px-2 py-1 rounded border border-indigo-500/20 shrink-0">
                    {f.suggestedAction}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestion Cards Grid */}
      <ProductionSuggestions
        suggestions={suggestions}
        onPreview={openPreview}
        onApply={applySuggestion}
        onReject={rejectSuggestion}
      />

      {/* History Section */}
      <ProductionAssistantHistory history={history} onClear={clearHistory} />

      {/* Suggestion Preview Modal */}
      <ProductionSuggestionPreview
        suggestion={previewSuggestion}
        onClose={closePreview}
        onApply={applySuggestion}
        onReject={rejectSuggestion}
      />
    </div>
  );
};
