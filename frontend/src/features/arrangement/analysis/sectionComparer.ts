import { SectionAnalysis, SectionComparisonResult } from './types/analysisTypes';

export function compareSections(
  sec1: SectionAnalysis,
  sec2: SectionAnalysis
): SectionComparisonResult {
  const trackParticipationDelta = {
    sec1Tracks: sec1.activeTrackIds.length,
    sec2Tracks: sec2.activeTrackIds.length,
    diff: sec2.activeTrackIds.length - sec1.activeTrackIds.length,
  };

  const noteCountDelta = {
    sec1Notes: sec1.noteCount,
    sec2Notes: sec2.noteCount,
    diff: sec2.noteCount - sec1.noteCount,
  };

  const densityDelta = {
    sec1Density: Math.round(sec1.noteDensity * 100) / 100,
    sec2Density: Math.round(sec2.noteDensity * 100) / 100,
    diff: Math.round((sec2.noteDensity - sec1.noteDensity) * 100) / 100,
  };

  const velocityDelta = {
    sec1Velocity: sec1.averageVelocity,
    sec2Velocity: sec2.averageVelocity,
    diff: sec2.averageVelocity - sec1.averageVelocity,
  };

  const sec1Spread = sec1.pitchRange ? sec1.pitchRange.spread : 0;
  const sec2Spread = sec2.pitchRange ? sec2.pitchRange.spread : 0;

  const pitchRangeDelta = {
    sec1Spread,
    sec2Spread,
    diff: sec2Spread - sec1Spread,
  };

  const automationDelta = {
    sec1Lanes: sec1.automationLaneIds.length,
    sec2Lanes: sec2.automationLaneIds.length,
    diff: sec2.automationLaneIds.length - sec1.automationLaneIds.length,
  };

  return {
    section1Id: sec1.sectionId,
    section1Name: sec1.sectionName,
    section2Id: sec2.sectionId,
    section2Name: sec2.sectionName,
    trackParticipationDelta,
    noteCountDelta,
    densityDelta,
    velocityDelta,
    pitchRangeDelta,
    automationDelta,
  };
}
