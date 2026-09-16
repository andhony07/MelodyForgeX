export function beatToSeconds(beat: number, bpm: number): number {
  const clampedBpm = Math.max(20, Math.min(300, bpm));
  const beatOffset = Math.max(0, beat - 1.0);
  return beatOffset * (60.0 / clampedBpm);
}

export function secondsToBeat(seconds: number, bpm: number): number {
  const clampedBpm = Math.max(20, Math.min(300, bpm));
  const beatsFromZero = Math.max(0, seconds) * (clampedBpm / 60.0);
  return 1.0 + beatsFromZero;
}

export function ticksToBeat(ticks: number, ppq = 480): number {
  const validPpq = Math.max(1, ppq);
  return 1.0 + Math.max(0, ticks) / validPpq;
}

export function beatToTicks(beat: number, ppq = 480): number {
  const validPpq = Math.max(1, ppq);
  return Math.round(Math.max(0, beat - 1.0) * validPpq);
}

export function pitchToMidi(pitch: number): number {
  return Math.max(0, Math.min(127, Math.round(pitch)));
}

export function instrumentNameToMidiProgram(name: string): number {
  const lower = name.toLowerCase();
  if (lower.includes('piano')) return 0; // Acoustic Grand Piano
  if (lower.includes('guitar')) return 24; // Nylon Guitar
  if (lower.includes('bass')) return 32; // Acoustic Bass
  if (lower.includes('drum')) return 0; // Drums handled on Channel 10
  if (lower.includes('violin') || lower.includes('string')) return 40; // Violin / Strings
  if (lower.includes('brass') || lower.includes('trumpet')) return 56; // Trumpet / Brass
  if (lower.includes('synth') || lower.includes('lead')) return 80; // Lead 1 (square)
  if (lower.includes('pad')) return 88; // Pad 1 (new age)
  return 0; // Default Piano
}

export function midiProgramToInstrumentName(program: number): { instrument: string; iconName: string; color: string } {
  if (program >= 32 && program <= 39) {
    return { instrument: 'Bass', iconName: 'Volume2', color: '#10b981' };
  }
  if (program >= 24 && program <= 31) {
    return { instrument: 'Guitar', iconName: 'Radio', color: '#f59e0b' };
  }
  if (program >= 80 && program <= 103) {
    return { instrument: 'Synth', iconName: 'Zap', color: '#06b6d4' };
  }
  if (program === 118 || program === 119) {
    return { instrument: 'Drums', iconName: 'Disc', color: '#ef4444' };
  }
  return { instrument: 'Piano', iconName: 'Piano', color: '#6366f1' };
}
