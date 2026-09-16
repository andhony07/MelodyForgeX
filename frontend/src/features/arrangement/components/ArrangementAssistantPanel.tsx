import React, { useState } from 'react';
import { useArrangementStore } from '../stores/useArrangementStore';
import { useStudioStore } from '../../editor/stores/useStudioStore';
import { usePianoRollStore } from '../../editor/stores/usePianoRollStore';
import { analyzeArrangement } from '../analysis/arrangementAnalyzer';
import { compareSections } from '../analysis/sectionComparer';
import { generateArrangementSuggestions } from '../suggestions/arrangementSuggestionEngine';
import { applyArrangementSuggestions } from '../suggestions/arrangementSuggestionApplier';
import { aiArrangementService } from '../../ai/services/aiArrangementService';
import { ArrangementAnalysisResult, SectionAnalysis } from '../analysis/types/analysisTypes';
import { ArrangementSuggestion } from '../suggestions/types/suggestionTypes';
import { SuggestionPreviewModal } from './SuggestionPreviewModal';
import {
  Sparkles,
  AlertTriangle,
  Info,
  CheckSquare,
  BarChart3,
  ArrowRightLeft,
} from 'lucide-react';


export const ArrangementAssistantPanel: React.FC = () => {
  const { sections, automationLanes } = useArrangementStore();
  const { tracks, tempo, key, mode } = useStudioStore();
  const { notesByTrackId } = usePianoRollStore();

  const [analysis, setAnalysis] = useState<ArrangementAnalysisResult | null>(null);
  const [suggestions, setSuggestions] = useState<ArrangementSuggestion[]>([]);
  const [selectedSugIds, setSelectedSugIds] = useState<Set<string>>(new Set());
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'findings' | 'comparison' | 'suggestions'>('summary');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Section comparison state
  const [sec1Id, setSec1Id] = useState<string>('');
  const [sec2Id, setSec2Id] = useState<string>('');

  const handleRunAnalysis = () => {
    const result = analyzeArrangement({
      sections,
      tracks,
      notesByTrackId,
      automationLanes,
      baseTempo: tempo,
    });

    setAnalysis(result);

    const detSuggestions = generateArrangementSuggestions({
      analysis: result,
      sections,
      tracks,
      notesByTrackId,
    });

    setSuggestions(detSuggestions);
    setSelectedSugIds(new Set(detSuggestions.map((s) => s.id)));

    if (result.sectionAnalyses.length >= 2) {
      setSec1Id(result.sectionAnalyses[0].sectionId);
      setSec2Id(result.sectionAnalyses[1].sectionId);
    }

    setStatusMsg('Arrangement analysis complete.');
  };

  const handleFetchAiSuggestions = async () => {
    let currentAnalysis = analysis;
    if (!currentAnalysis) {
      currentAnalysis = analyzeArrangement({
        sections,
        tracks,
        notesByTrackId,
        automationLanes,
        baseTempo: tempo,
      });
      setAnalysis(currentAnalysis);
    }

    setIsAiLoading(true);
    setStatusMsg('Consulting AI Arrangement Intelligence...');

    try {
      const aiSug = await aiArrangementService.getAIArrangementSuggestions({
        analysis: currentAnalysis,
        sections,
        tracks,
        key,
        mode,
        tempo,
      });

      if (aiSug.length > 0) {
        setSuggestions((prev) => {
          const merged = [...prev];
          aiSug.forEach((s) => {
            if (!merged.some((m) => m.id === s.id)) merged.push(s);
          });
          return merged;
        });

        setSelectedSugIds((prev) => {
          const updated = new Set(prev);
          aiSug.forEach((s) => updated.add(s.id));
          return updated;
        });

        setStatusMsg(`Received ${aiSug.length} AI arrangement suggestion(s).`);
      } else {
        setStatusMsg('AI analysis complete. No additional suggestions generated.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'AI request failed.';
      setStatusMsg(`AI Error: ${msg}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const toggleSelectSuggestion = (id: string) => {
    const updated = new Set(selectedSugIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedSugIds(updated);
  };

  const selectedSuggestionsList = suggestions.filter((s) => selectedSugIds.has(s.id));

  const handleApplySelected = () => {
    const result = applyArrangementSuggestions(selectedSuggestionsList);
    setIsPreviewOpen(false);

    if (result.success) {
      setStatusMsg(`Successfully applied ${result.appliedCount} arrangement change(s).`);
      // Re-run analysis to update metrics
      handleRunAnalysis();
    } else {
      setStatusMsg(`Application Error: ${result.error}`);
    }
  };

  // Compute section comparison if active
  const sec1Analysis = analysis?.sectionAnalyses.find((sa) => sa.sectionId === sec1Id);
  const sec2Analysis = analysis?.sectionAnalyses.find((sa) => sa.sectionId === sec2Id);
  const comparison = sec1Analysis && sec2Analysis ? compareSections(sec1Analysis, sec2Analysis) : null;

  return (
    <div className="bg-[#0f1117] border border-[#2e3444] rounded-lg p-3 space-y-3 text-xs font-sans select-none overflow-y-auto max-h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2e3444] pb-2">
        <div className="flex items-center gap-1.5 font-bold text-gray-200">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Arrangement Assistant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRunAnalysis}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded text-[11px] font-semibold transition-all shadow-xs"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analyze</span>
          </button>

          <button
            onClick={handleFetchAiSuggestions}
            disabled={isAiLoading}
            className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-2 py-1 rounded text-[11px] font-semibold transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAiLoading ? 'Analyzing...' : 'Ask AI'}</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="text-[11px] text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-2 py-1 rounded">
          {statusMsg}
        </div>
      )}

      {!analysis ? (
        <div className="p-6 text-center text-gray-500 text-xs">
          Click <strong>Analyze</strong> or <strong>Ask AI</strong> to evaluate structural health, track participation, density, and suggestions.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-[#2e3444] text-[11px] font-semibold">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-2.5 py-1 border-b-2 transition-colors ${
                activeTab === 'summary' ? 'border-indigo-500 text-indigo-300' : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab('findings')}
              className={`px-2.5 py-1 border-b-2 flex items-center gap-1 transition-colors ${
                activeTab === 'findings' ? 'border-indigo-500 text-indigo-300' : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>Findings</span>
              {analysis.findings.length > 0 && (
                <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1 rounded-full font-mono">
                  {analysis.findings.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-2.5 py-1 border-b-2 transition-colors ${
                activeTab === 'comparison' ? 'border-indigo-500 text-indigo-300' : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Comparison
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`px-2.5 py-1 border-b-2 flex items-center gap-1 transition-colors ${
                activeTab === 'suggestions' ? 'border-indigo-500 text-indigo-300' : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>Suggestions</span>
              {suggestions.length > 0 && (
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-1 rounded-full font-mono">
                  {suggestions.length}
                </span>
              )}
            </button>
          </div>

          {/* TAB 1: Summary */}
          {activeTab === 'summary' && (
            <div className="space-y-3">
              {/* Stat Badges */}
              <div className="grid grid-cols-4 gap-1.5 font-mono text-[11px] text-center">
                <div className="bg-[#181b24] p-1.5 rounded border border-[#2e3444]">
                  <span className="text-[10px] text-gray-500 block">SECTIONS</span>
                  <span className="text-gray-200 font-bold">{analysis.sectionsCount}</span>
                </div>
                <div className="bg-[#181b24] p-1.5 rounded border border-[#2e3444]">
                  <span className="text-[10px] text-gray-500 block">TRACKS</span>
                  <span className="text-gray-200 font-bold">{analysis.tracksCount}</span>
                </div>
                <div className="bg-[#181b24] p-1.5 rounded border border-[#2e3444]">
                  <span className="text-[10px] text-gray-500 block">TOTAL BARS</span>
                  <span className="text-amber-400 font-bold">{analysis.totalBars}</span>
                </div>
                <div className="bg-[#181b24] p-1.5 rounded border border-[#2e3444]">
                  <span className="text-[10px] text-gray-500 block">TIME (S)</span>
                  <span className="text-cyan-400 font-bold">{Math.round(analysis.totalDurationSeconds)}s</span>
                </div>
              </div>

              {/* Section Breakdown Grid */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Section Structure & Density
                </span>
                <div className="bg-[#181b24] rounded border border-[#2e3444] divide-y divide-[#2e3444]/30 max-h-40 overflow-y-auto">
                  {analysis.sectionAnalyses.map((sa: SectionAnalysis) => (
                    <div key={sa.sectionId} className="p-1.5 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-200">{sa.sectionName}</span>
                        <span className="text-[10px] text-gray-500 font-mono">({sa.lengthBars}b)</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="text-gray-400">{sa.activeTrackIds.length} Active Tracks</span>
                        <span
                          className={`px-1 rounded text-[9px] uppercase font-bold ${
                            sa.densityTier === 'high'
                              ? 'bg-rose-900/50 text-rose-300'
                              : sa.densityTier === 'medium'
                              ? 'bg-emerald-900/50 text-emerald-300'
                              : 'bg-amber-900/50 text-amber-300'
                          }`}
                        >
                          {sa.densityTier}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Findings */}
          {activeTab === 'findings' && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {analysis.findings.length === 0 ? (
                <div className="text-center text-gray-500 text-[11px] py-4">
                  No structural health warnings found. Arrangement looks solid!
                </div>
              ) : (
                analysis.findings.map((f) => (
                  <div
                    key={f.id}
                    className={`p-2 rounded border text-[11px] space-y-1 ${
                      f.severity === 'WARNING'
                        ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                        : 'bg-indigo-950/30 border-indigo-500/40 text-indigo-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <div className="flex items-center gap-1.5">
                        {f.severity === 'WARNING' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Info className="w-3.5 h-3.5 text-indigo-400" />
                        )}
                        <span>{f.title}</span>
                      </div>
                      <span className="text-[9px] px-1 py-0.2 rounded font-mono uppercase bg-black/40">
                        {f.severity}
                      </span>
                    </div>
                    <p className="text-gray-300 text-[10px]">{f.description}</p>
                    {f.suggestedAction && (
                      <div className="text-[10px] text-cyan-300 font-medium pt-0.5">
                        💡 {f.suggestedAction}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Comparison */}
          {activeTab === 'comparison' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-gray-500 block mb-0.5">Section 1</span>
                  <select
                    value={sec1Id}
                    onChange={(e) => setSec1Id(e.target.value)}
                    className="w-full bg-[#181b24] border border-[#2e3444] rounded px-1.5 py-1 text-xs text-gray-200 outline-hidden"
                  >
                    {analysis.sectionAnalyses.map((sa) => (
                      <option key={sa.sectionId} value={sa.sectionId}>
                        {sa.sectionName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-gray-500 block mb-0.5">Section 2</span>
                  <select
                    value={sec2Id}
                    onChange={(e) => setSec2Id(e.target.value)}
                    className="w-full bg-[#181b24] border border-[#2e3444] rounded px-1.5 py-1 text-xs text-gray-200 outline-hidden"
                  >
                    {analysis.sectionAnalyses.map((sa) => (
                      <option key={sa.sectionId} value={sa.sectionId}>
                        {sa.sectionName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {comparison ? (
                <div className="bg-[#181b24] p-2 rounded border border-[#2e3444] space-y-2 text-[11px] font-mono">
                  <div className="flex items-center justify-between border-b border-[#2e3444] pb-1 text-gray-400 font-sans">
                    <span className="font-semibold text-gray-200">{comparison.section1Name}</span>
                    <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-semibold text-gray-200">{comparison.section2Name}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-gray-500 block">Active Tracks</span>
                      <span className="text-gray-200">
                        {comparison.trackParticipationDelta.sec1Tracks} → {comparison.trackParticipationDelta.sec2Tracks} ({comparison.trackParticipationDelta.diff >= 0 ? '+' : ''}{comparison.trackParticipationDelta.diff})
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 block">Note Count</span>
                      <span className="text-amber-400">
                        {comparison.noteCountDelta.sec1Notes} → {comparison.noteCountDelta.sec2Notes} ({comparison.noteCountDelta.diff >= 0 ? '+' : ''}{comparison.noteCountDelta.diff})
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 block">Note Density</span>
                      <span className="text-cyan-400">
                        {comparison.densityDelta.sec1Density} → {comparison.densityDelta.sec2Density} ({comparison.densityDelta.diff >= 0 ? '+' : ''}{comparison.densityDelta.diff})
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 block">Avg Velocity</span>
                      <span className="text-emerald-400">
                        {comparison.velocityDelta.sec1Velocity} → {comparison.velocityDelta.sec2Velocity} ({comparison.velocityDelta.diff >= 0 ? '+' : ''}{comparison.velocityDelta.diff})
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 text-[11px] py-3">Select two sections to compare.</div>
              )}
            </div>
          )}

          {/* TAB 4: Suggestions */}
          {activeTab === 'suggestions' && (
            <div className="space-y-3">
              {suggestions.length === 0 ? (
                <div className="text-center text-gray-500 text-[11px] py-4">No suggestions generated yet.</div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {suggestions.map((sug) => {
                    const isChecked = selectedSugIds.has(sug.id);
                    return (
                      <label
                        key={sug.id}
                        className={`block p-2 rounded border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-indigo-950/40 border-indigo-500/50 text-gray-100'
                            : 'bg-[#181b24] border-[#2e3444] text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectSuggestion(sug.id)}
                              className="accent-indigo-500 rounded cursor-pointer mt-0.5"
                            />
                            <div>
                              <span className="font-bold text-xs text-gray-200 block">{sug.title}</span>
                              <span className="text-[11px] text-gray-300 block">{sug.description}</span>
                              <span className="text-[10px] text-cyan-300 block mt-0.5">💡 {sug.reason}</span>
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {suggestions.length > 0 && (
                <button
                  onClick={() => setIsPreviewOpen(true)}
                  disabled={selectedSuggestionsList.length === 0}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded text-xs font-semibold shadow-md transition-all"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Preview & Apply ({selectedSuggestionsList.length})</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Preview Confirmation Modal */}
      <SuggestionPreviewModal
        isOpen={isPreviewOpen}
        suggestions={selectedSuggestionsList}
        onClose={() => setIsPreviewOpen(false)}
        onConfirmApply={handleApplySelected}
      />
    </div>
  );
};
