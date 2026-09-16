import { useArrangementStore } from '../stores/useArrangementStore';
import { ArrangementSuggestion } from './types/suggestionTypes';

export function applyArrangementSuggestions(suggestions: ArrangementSuggestion[]): {
  success: boolean;
  appliedCount: number;
  error?: string;
} {
  if (!suggestions || suggestions.length === 0) {
    return { success: true, appliedCount: 0 };
  }

  const store = useArrangementStore.getState();

  // Snapshot pre-apply state for atomic rollback capability
  const snapshot = {
    sections: JSON.parse(JSON.stringify(store.sections)),
    automationLanes: JSON.parse(JSON.stringify(store.automationLanes)),
    automationEnabled: store.automationEnabled,
  };

  let appliedCount = 0;

  try {
    const currentSections = useArrangementStore.getState().sections;

    for (const sug of suggestions) {
      if (sug.sectionId) {
        const secExists = currentSections.some((s) => s.id === sug.sectionId);
        if (!secExists) {
          throw new Error(`Section not found: ${sug.sectionId}`);
        }
      }

      if (sug.type === 'TRACK_ACTIVATION' && sug.sectionId && sug.trackId) {
        const valObj = sug.proposedValue as { enabled?: boolean };
        const enabled = valObj?.enabled ?? true;
        useArrangementStore.getState().setSectionTrackState(sug.sectionId, sug.trackId, enabled);
        appliedCount++;
      } else if (sug.type === 'TRANSITION_CHANGE' && sug.sectionId) {
        const valObj = sug.proposedValue as { transitionType?: 'immediate' | 'fade' | 'crossfade'; fadeDuration?: number };
        useArrangementStore.getState().updateSection(sug.sectionId, {
          transitionType: valObj?.transitionType || 'crossfade',
          fadeDuration: valObj?.fadeDuration ?? 0.5,
        });
        appliedCount++;
      } else if (sug.type === 'AUTOMATION_ADD' && sug.targetType && sug.parameter) {
        const targetId = sug.trackId || sug.targetType;
        const laneId = useArrangementStore.getState().addAutomationLane(sug.targetType, targetId, sug.parameter);

        const valObj = sug.proposedValue as {
          startBeat?: number;
          startVal?: number;
          endBeat?: number;
          endVal?: number;
        };

        if (valObj && valObj.startBeat !== undefined && valObj.startVal !== undefined) {
          useArrangementStore.getState().addAutomationPoint(laneId, valObj.startBeat, valObj.startVal);
        }
        if (valObj && valObj.endBeat !== undefined && valObj.endVal !== undefined) {
          useArrangementStore.getState().addAutomationPoint(laneId, valObj.endBeat, valObj.endVal);
        }
        appliedCount++;
      } else if (sug.type === 'TEMPO_ADJUST') {
        const valObj = sug.proposedValue as { bpm?: number };
        if (valObj && valObj.bpm !== undefined) {
          const laneId = useArrangementStore.getState().addAutomationLane('arrangement', 'arrangement', 'tempo');
          useArrangementStore.getState().addAutomationPoint(laneId, 1.0, valObj.bpm);
          appliedCount++;
        }
      }
    }

    return { success: true, appliedCount };
  } catch (err: unknown) {
    // Atomic rollback to pre-apply state snapshot
    useArrangementStore.setState({
      sections: snapshot.sections,
      automationLanes: snapshot.automationLanes,
      automationEnabled: snapshot.automationEnabled,
    });

    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, appliedCount: 0, error: `Atomic application failed: ${msg}` };
  }
}
