import { Note } from '../../editor/types/note';
import { ProgressionChord } from '../../composition/types/progression';
import { ChordQuality } from '../../composition/types/chord';
import { generateChordNotes } from '../../composition/generators/chordGenerator';
import { generateMelody } from '../../composition/generators/melodyGenerator';
import { generateArpeggio } from '../../composition/generators/arpeggioGenerator';
import { AICompositionResponse, TrackSpec } from '../types/compositionResponse';

export interface TranslatedAITrack {
  trackSpec: TrackSpec;
  notes: Note[];
}

export interface AITranslationResult {
  title: string;
  key: AICompositionResponse['key'];
  mode: AICompositionResponse['mode'];
  tempo: number;
  totalBars: number;
  tracks: TranslatedAITrack[];
}

export function translateAIToNotes(spec: AICompositionResponse): AITranslationResult {
  const { key, mode, tempo, progression, tracks, generation, sections, title } = spec;

  // Compute total bars
  let totalBars = 8;
  if (sections && sections.length > 0) {
    totalBars = Math.max(...sections.map((s) => s.endBar));
  } else if (progression.chords && progression.chords.length > 0) {
    totalBars = progression.chords.reduce((acc, c) => acc + c.durationBars, 0);
  }
  totalBars = Math.max(1, Math.min(128, totalBars));

  // Build Phase 5 ProgressionChord list
  let currentBeat = 1.0;
  const chordList: ProgressionChord[] = progression.chords.map((c) => {
    const durationBeats = c.durationBars * 4.0;
    const roman = c.romanNumeral || 'I';
    const item: ProgressionChord = {
      symbol: roman,
      root: c.root || key,
      quality: (c.quality as ChordQuality) || (mode === 'Minor' ? 'minor' : 'major'),
      startBeat: currentBeat,
      durationBeats,
      romanNumeral: roman,
    };
    currentBeat += durationBeats;
    return item;
  });

  const baseSeed = generation.seed || 12345;

  const translatedTracks: TranslatedAITrack[] = tracks.map((trackSpec, idx) => {
    // Unique track identifier tag
    const trackIdTag = `ai-track-${idx}-${Date.now()}`;
    const trackSeed = baseSeed + idx * 777;
    let notes: Note[] = [];

    if (trackSpec.generator === 'chord' || trackSpec.role === 'chords' || trackSpec.role === 'bass') {
      const octaveOffset = trackSpec.role === 'bass' ? -2 : (trackSpec.octaveOffset !== undefined ? trackSpec.octaveOffset : -1);
      notes = generateChordNotes({
        trackId: trackIdTag,
        progression: chordList,
        octaveOffset,
        velocity: trackSpec.role === 'bass' ? 95 : 85,
      });
    } else if (trackSpec.generator === 'arpeggio' || trackSpec.role === 'arpeggio') {
      notes = generateArpeggio({
        trackId: trackIdTag,
        progression: chordList,
        pattern: trackSpec.pattern || 'Up',
        subdivisionBeats: 0.5,
        octaveSpan: 2,
        seed: trackSeed,
        velocity: 90,
      });
    } else {
      // Default to melody
      notes = generateMelody({
        trackId: trackIdTag,
        key,
        scale: mode,
        seed: trackSeed,
        totalBars,
        octave: 4 + (trackSpec.octaveOffset || 0),
        noteDensity: trackSpec.noteDensity || generation.melodyDensity || 'medium',
        velocity: 100,
      });
    }

    return {
      trackSpec,
      notes,
    };
  });

  return {
    title,
    key,
    mode,
    tempo,
    totalBars,
    tracks: translatedTracks,
  };
}
