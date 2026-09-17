import { ProductionFinding } from '../types/productionTypes';
import { ProductionSuggestion } from '../types/productionSuggestion';
import { ProductionContext } from '../types/productionRequest';

export function analyzeArrangementState(context: ProductionContext): {
  findings: ProductionFinding[];
  suggestions: ProductionSuggestion[];
} {
  const findings: ProductionFinding[] = [];
  const suggestions: ProductionSuggestion[] = [];

  const { arrangement, tracks } = context;

  if (arrangement.length === 0) {
    findings.push({
      id: 'arr-no-sections',
      category: 'arrangement',
      severity: 'warning',
      title: 'No Song Sections Defined',
      description: 'The project arrangement has no defined sections (e.g. Intro, Verse, Chorus, Outro).',
      evidence: ['Section Count: 0'],
      suggestedAction: 'Define song sections to structure the composition',
      confidence: 0.95,
    });
    return { findings, suggestions };
  }

  // 1. Density Contrast & Sparse Section Audit
  arrangement.forEach((sec) => {
    const activeCount = sec.activeTrackIds.length;
    if (activeCount === 0 && tracks.length > 0) {
      findings.push({
        id: `arr-empty-sec-${sec.id}`,
        category: 'arrangement',
        severity: 'issue',
        title: `Empty Section: ${sec.name}`,
        description: `Section "${sec.name}" (Bars ${sec.startBar}–${sec.endBar}) has zero active instruments enabled.`,
        evidence: [`Section: ${sec.name}`, `Active Tracks: 0`],
        affectedTargetIds: [sec.id],
        suggestedAction: 'Enable key instruments or add background elements',
        confidence: 0.9,
      });

      if (tracks.length > 0) {
        suggestions.push({
          id: `sug-arr-enable-track-${sec.id}-${tracks[0].id}`,
          category: 'arrangement',
          title: `Activate ${tracks[0].name} in ${sec.name}`,
          description: `Enable "${tracks[0].name}" in section "${sec.name}".`,
          reason: 'Fills silent section gap with primary instrument.',
          targetType: 'section',
          targetId: sec.id,
          action: 'enable_track_in_section',
          parameters: { sectionId: sec.id, trackId: tracks[0].id, enabled: true },
          evidence: [`Section ${sec.name} is currently silent`],
          confidence: 0.88,
          applied: false,
          rejected: false,
          currentValue: false,
          proposedValue: true,
        });
      }
    }
  });

  // 2. Transition Polish Audit
  if (arrangement.length > 1) {
    const lastSec = arrangement[arrangement.length - 1];
    if (lastSec.name.toLowerCase().includes('chorus') || lastSec.name.toLowerCase().includes('outro')) {
      suggestions.push({
        id: `sug-arr-trans-${lastSec.id}`,
        category: 'arrangement',
        title: `Apply Smooth Crossfade Transition to ${lastSec.name}`,
        description: `Set transition curve for "${lastSec.name}" to crossfade (0.5s).`,
        reason: 'Improves section entry flow into the final section.',
        targetType: 'section',
        targetId: lastSec.id,
        action: 'update_section_transition',
        parameters: { sectionId: lastSec.id, transitionType: 'crossfade', fadeDuration: 0.5 },
        evidence: [`Target Section: ${lastSec.name}`],
        confidence: 0.85,
        applied: false,
        rejected: false,
        currentValue: 'immediate',
        proposedValue: 'crossfade',
      });
    }
  }

  return { findings, suggestions };
}
