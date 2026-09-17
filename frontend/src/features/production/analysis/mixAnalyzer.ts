import { ProductionFinding } from '../types/productionTypes';
import { ProductionSuggestion } from '../types/productionSuggestion';
import { ProductionContext } from '../types/productionRequest';

export function analyzeMixerState(context: ProductionContext): {
  findings: ProductionFinding[];
  suggestions: ProductionSuggestion[];
} {
  const findings: ProductionFinding[] = [];
  const suggestions: ProductionSuggestion[] = [];

  const { mixerAnalysis, tracks } = context;

  // 1. Master Volume Level Check
  if (mixerAnalysis.masterVolumeDb > 3.0) {
    findings.push({
      id: 'mix-master-high',
      category: 'mix',
      severity: 'warning',
      title: 'Master Volume Elevated',
      description: `Master bus volume is set to +${mixerAnalysis.masterVolumeDb.toFixed(1)} dB. Elevated master gain risks digital clipping or over-reliance on the peak limiter.`,
      evidence: [`Master Volume: +${mixerAnalysis.masterVolumeDb.toFixed(1)} dB`],
      suggestedAction: 'Reduce Master volume to 0.0 dB or lower',
      confidence: 0.9,
    });

    suggestions.push({
      id: 'sug-mix-master-norm',
      category: 'mix',
      title: 'Normalize Master Volume',
      description: 'Set master bus volume to 0.0 dB for clean headroom.',
      reason: 'Prevents clipping before the final limiting stage.',
      targetType: 'mixer',
      targetId: 'master',
      action: 'set_master_volume',
      parameters: { volumeDb: 0.0 },
      evidence: [`Current Master Volume: +${mixerAnalysis.masterVolumeDb.toFixed(1)} dB`],
      confidence: 0.95,
      applied: false,
      rejected: false,
      currentValue: mixerAnalysis.masterVolumeDb,
      proposedValue: 0.0,
    });
  }

  // 2. Master Limiter Check
  if (!mixerAnalysis.limiterEnabled) {
    findings.push({
      id: 'mix-master-limiter-disabled',
      category: 'mix',
      severity: 'issue',
      title: 'Master Limiter Disabled',
      description: 'The master bus peak limiter is currently disabled. High signal peaks may cause inter-sample clipping.',
      evidence: ['Master Limiter State: Disabled'],
      suggestedAction: 'Enable Master Limiter at -0.1 dB threshold',
      confidence: 0.95,
    });

    suggestions.push({
      id: 'sug-mix-master-limiter-enable',
      category: 'mix',
      title: 'Enable Master Peak Limiter',
      description: 'Enable master peak limiter at -0.1 dB threshold.',
      reason: 'Protects output from digital clipping.',
      targetType: 'mixer',
      targetId: 'master',
      action: 'set_master_limiter',
      parameters: { enabled: true, thresholdDb: -0.1 },
      evidence: ['Master Limiter: Disabled'],
      confidence: 0.95,
      applied: false,
      rejected: false,
      currentValue: false,
      proposedValue: true,
    });
  }

  // 3. Track Volume & Mute Audits
  tracks.forEach((t) => {
    if (t.muted && t.noteCount > 0) {
      findings.push({
        id: `mix-muted-track-${t.id}`,
        category: 'mix',
        severity: 'info',
        title: `Track Muted: ${t.name}`,
        description: `Track "${t.name}" contains ${t.noteCount} notes but is currently muted.`,
        evidence: [`Track: ${t.name}`, `Notes: ${t.noteCount}`, `Status: Muted`],
        affectedTargetIds: [t.id],
        suggestedAction: 'Unmute track if intended for export or arrangement',
        confidence: 0.85,
      });
    }

    if (t.volume > 95) {
      suggestions.push({
        id: `sug-mix-track-vol-tame-${t.id}`,
        category: 'mix',
        title: `Headroom Adjustment: ${t.name}`,
        description: `Reduce "${t.name}" track volume from ${t.volume}% to 85% for balanced mix headroom.`,
        reason: 'Prevents single tracks from overwhelming the mix bus.',
        targetType: 'track',
        targetId: t.id,
        action: 'set_track_volume',
        parameters: { volumeDb: -2.0 },
        evidence: [`Current Volume: ${t.volume}%`],
        confidence: 0.85,
        applied: false,
        rejected: false,
        currentValue: t.volume,
        proposedValue: 85,
      });
    }
  });

  return { findings, suggestions };
}
