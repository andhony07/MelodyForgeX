import React from 'react';
import { ArrangementSuggestion } from '../suggestions/types/suggestionTypes';
import { useArrangementStore } from '../stores/useArrangementStore';
import { useStudioStore } from '../../editor/stores/useStudioStore';
import { isTrackEnabledInSection } from '../utils/arrangementUtils';
import { Sparkles, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface SuggestionPreviewModalProps {
  isOpen: boolean;
  suggestions: ArrangementSuggestion[];
  onClose: () => void;
  onConfirmApply: () => void;
}

export const SuggestionPreviewModal: React.FC<SuggestionPreviewModalProps> = ({
  isOpen,
  suggestions,
  onClose,
  onConfirmApply,
}) => {
  const { sections } = useArrangementStore();
  const { tracks } = useStudioStore();

  if (!isOpen || suggestions.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-[#181b24] border border-[#2e3444] rounded-xl max-w-lg w-full p-4 space-y-4 shadow-2xl text-xs font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2e3444] pb-3">
          <div className="flex items-center gap-2 font-bold text-sm text-gray-100">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Preview Proposed Arrangement Changes</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Change summary banner */}
        <div className="bg-indigo-950/40 border border-indigo-500/30 p-2.5 rounded-lg flex items-center gap-2 text-indigo-200 text-xs">
          <AlertCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span>
            <strong>{suggestions.length}</strong> change{suggestions.length !== 1 ? 's' : ''} selected.
            Review current vs proposed states below before confirming.
          </span>
        </div>

        {/* Items Diff List */}
        <div className="max-h-64 overflow-y-auto space-y-2 divide-y divide-[#2e3444]/40 pr-1">
          {suggestions.map((sug) => {
            const sec = sections.find((s) => s.id === sug.sectionId);
            const track = tracks.find((t) => t.id === sug.trackId);

            let currentDesc = 'Unchanged';
            let proposedDesc = 'Updated';

            if (sug.type === 'TRACK_ACTIVATION' && sec && track) {
              const currentlyEnabled = isTrackEnabledInSection(sec, track.id);
              currentDesc = currentlyEnabled ? 'Enabled' : 'Disabled';
              proposedDesc = 'Enabled';
            } else if (sug.type === 'TRANSITION_CHANGE' && sec) {
              currentDesc = sec.transitionType || 'Immediate';
              proposedDesc = 'Crossfade (0.5s)';
            } else if (sug.type === 'AUTOMATION_ADD') {
              currentDesc = 'No Automation';
              proposedDesc = 'Volume Crescendo';
            } else if (sug.type === 'TEMPO_ADJUST') {
              currentDesc = 'Fixed Tempo';
              proposedDesc = 'Tempo Point Added';
            }

            return (
              <div key={sug.id} className="pt-2 first:pt-0 space-y-1">
                <div className="font-semibold text-gray-200 flex items-center justify-between">
                  <span>{sug.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-indigo-300 uppercase font-mono">
                    {sug.type}
                  </span>
                </div>
                <p className="text-gray-400 text-[11px]">{sug.description}</p>

                <div className="grid grid-cols-2 gap-2 bg-[#0f1117] p-2 rounded border border-[#2e3444]/60 text-[11px] font-mono">
                  <div>
                    <span className="text-gray-500 block text-[10px]">CURRENT</span>
                    <span className="text-amber-400">{currentDesc}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">PROPOSED</span>
                    <span className="text-emerald-400 font-bold">{proposedDesc}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-[#2e3444]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-[#0f1117] hover:bg-gray-800 text-gray-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={onConfirmApply}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
