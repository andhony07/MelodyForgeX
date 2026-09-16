import { ScaleType } from '../types/scale';
import { SCALES } from '../constants/scales';

export const getScaleNotes = (rootMidi: number, scaleType: ScaleType, octaveSpan = 1): number[] => {
  const scale = SCALES[scaleType] || SCALES.Major;
  const notes: number[] = [];

  for (let oct = 0; oct < octaveSpan; oct++) {
    for (const interval of scale.intervals) {
      notes.push(rootMidi + oct * 12 + interval);
    }
  }

  return notes.sort((a, b) => a - b);
};

export const isNoteInScale = (midiPitch: number, rootMidi: number, scaleType: ScaleType): boolean => {
  const scale = SCALES[scaleType] || SCALES.Major;
  const pitchClass = (midiPitch % 12 + 12) % 12;
  const rootClass = (rootMidi % 12 + 12) % 12;

  const allowedClasses = scale.intervals.map((interval) => (rootClass + interval) % 12);
  return allowedClasses.includes(pitchClass);
};

export const getScaleDegree = (midiPitch: number, rootMidi: number, scaleType: ScaleType): number | null => {
  const scale = SCALES[scaleType] || SCALES.Major;
  const pitchClass = (midiPitch % 12 + 12) % 12;
  const rootClass = (rootMidi % 12 + 12) % 12;

  for (let i = 0; i < scale.intervals.length; i++) {
    if ((rootClass + scale.intervals[i]) % 12 === pitchClass) {
      return i + 1; // 1-indexed degree (1 = Root, 2 = 2nd, etc.)
    }
  }
  return null;
};

export const snapPitchToScale = (midiPitch: number, rootMidi: number, scaleType: ScaleType): number => {
  if (isNoteInScale(midiPitch, rootMidi, scaleType)) return midiPitch;

  const scalePitches = getScaleNotes(rootMidi - 24, scaleType, 5);
  let closestPitch = scalePitches[0];
  let minDiff = Math.abs(midiPitch - closestPitch);

  for (const p of scalePitches) {
    const diff = Math.abs(midiPitch - p);
    if (diff < minDiff) {
      minDiff = diff;
      closestPitch = p;
    }
  }

  return closestPitch;
};
