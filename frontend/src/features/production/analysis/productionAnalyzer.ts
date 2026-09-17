import { ProductionReport, ProductionFinding, ProjectStats, AssistantMode } from '../types/productionTypes';
import { ProductionSuggestion } from '../types/productionSuggestion';
import { ProductionContext } from '../types/productionRequest';
import { analyzeMixerState } from './mixAnalyzer';
import { analyzeArrangementState } from './arrangementAnalyzer';

export function analyzeProductionProject(
  context: ProductionContext,
  mode: AssistantMode = 'analyze'
): {
  report: ProductionReport;
  suggestions: ProductionSuggestion[];
} {
  const allFindings: ProductionFinding[] = [];
  const allSuggestions: ProductionSuggestion[] = [];
  const strengths: string[] = [];
  const observations: string[] = [];

  const { projectSettings, tracks, musicalAnalysis, automationAnalysis } = context;

  // Calculate project stats
  const secondsPerBeat = 60 / projectSettings.bpm;
  const beatsPerBar = 4; // Assuming 4/4 default if unparsed
  const durationSeconds = Math.round(projectSettings.totalBars * beatsPerBar * secondsPerBeat);

  const projectStats: ProjectStats = {
    tempo: projectSettings.bpm,
    key: projectSettings.key,
    mode: projectSettings.scale,
    timeSignature: projectSettings.timeSignature,
    totalBars: projectSettings.totalBars,
    durationSeconds,
    trackCount: tracks.length,
    sectionCount: context.arrangement.length,
    noteCount: musicalAnalysis.totalNotes,
  };

  // Strengths & Observations
  if (tracks.length >= 3) {
    strengths.push(`Rich multi-track arrangement with ${tracks.length} active tracks.`);
  }
  if (musicalAnalysis.totalNotes > 50) {
    strengths.push(`Substantial musical content (${musicalAnalysis.totalNotes} total notes).`);
  }
  if (context.mixerAnalysis.limiterEnabled) {
    strengths.push('Master peak limiter enabled to safeguard output.');
  }

  observations.push(`Tempo set to ${projectSettings.bpm} BPM in key of ${projectSettings.key} ${projectSettings.scale}.`);
  observations.push(`Total estimated playback duration: ${durationSeconds} seconds (${projectSettings.totalBars} bars).`);
  if (automationAnalysis.laneCount > 0) {
    observations.push(`Automation active across ${automationAnalysis.laneCount} lanes with ${automationAnalysis.pointCount} automation points.`);
  }

  // 1. Mixer Analysis
  const mixResult = analyzeMixerState(context);
  allFindings.push(...mixResult.findings);
  allSuggestions.push(...mixResult.suggestions);

  // 2. Arrangement Analysis
  const arrResult = analyzeArrangementState(context);
  allFindings.push(...arrResult.findings);
  allSuggestions.push(...arrResult.suggestions);

  // 3. Instrumentation & Role Analysis
  const rolesUsed = new Set(tracks.map((t) => t.instrument.toLowerCase()));
  if (!rolesUsed.has('bass') && !rolesUsed.has('electric-bass') && tracks.length > 1) {
    allFindings.push({
      id: 'inst-missing-bass',
      category: 'instrumentation',
      severity: 'tip',
      title: 'Missing Low-End Anchor (Bass)',
      description: 'The composition lacks a dedicated bass instrument, which provides low-frequency stability.',
      evidence: [`Active Tracks: ${tracks.map((t) => t.name).join(', ')}`],
      suggestedAction: 'Add a bass track or generate a bassline',
      confidence: 0.85,
    });
  }

  // 4. Mode-specific summary customization
  let summary = `Production Health Report generated for "${projectSettings.title}". Analyzed ${tracks.length} tracks across ${projectSettings.totalBars} bars.`;
  if (mode === 'export') {
    summary = `Export Readiness Evaluation for "${projectSettings.title}". Inspected master bus, limiter, volume levels, and mute status.`;
  } else if (mode === 'mix') {
    summary = `Mix & Frequency Analysis for "${projectSettings.title}". Inspected gain staging, panning, insert effects, and master chain.`;
  } else if (mode === 'arrangement') {
    summary = `Arrangement & Energy Flow Audit for "${projectSettings.title}". Inspected section transitions, track participation, and density.`;
  } else if (mode === 'musical') {
    summary = `Musical Content & Pattern Inspection for "${projectSettings.title}". Evaluated note density, pitch range, and velocity.`;
  }

  const report: ProductionReport = {
    timestamp: Date.now(),
    mode,
    summary,
    projectStats,
    findings: allFindings,
    strengths,
    observations,
  };

  return { report, suggestions: allSuggestions };
}
