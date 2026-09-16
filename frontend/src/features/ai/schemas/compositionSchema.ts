import { MusicalKey } from '../../editor/types/studio';
import { ScaleType } from '../../composition/types/scale';
import { AICompositionResponse, ChordSpec, TrackSpec } from '../types/compositionResponse';

const VALID_KEYS: MusicalKey[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const VALID_SCALES: ScaleType[] = [
  'Major',
  'Minor',
  'Dorian',
  'Phrygian',
  'Lydian',
  'Mixolydian',
  'Harmonic Minor',
  'Melodic Minor',
];

export function validateCompositionSchema(data: unknown): AICompositionResponse {
  if (!data || typeof data !== 'object') {
    throw new Error('Composition response must be a JSON object.');
  }

  const obj = data as Record<string, unknown>;

  // Title
  const title = typeof obj.title === 'string' && obj.title.trim() ? obj.title.trim() : 'AI Composition';

  // Key
  let key: MusicalKey = 'C';
  if (typeof obj.key === 'string') {
    const cleanedKey = obj.key.replace(/m$/, '').toUpperCase() as MusicalKey;
    if (VALID_KEYS.includes(cleanedKey)) {
      key = cleanedKey;
    }
  }

  // Mode/Scale
  let mode: ScaleType = 'Major';
  if (typeof obj.mode === 'string') {
    const formattedMode = obj.mode.charAt(0).toUpperCase() + obj.mode.slice(1).toLowerCase();
    const match = VALID_SCALES.find((s) => s.toLowerCase() === formattedMode.toLowerCase());
    if (match) {
      mode = match;
    }
  }

  // Tempo
  let tempo = 120;
  if (typeof obj.tempo === 'number' && !isNaN(obj.tempo)) {
    tempo = Math.max(20, Math.min(300, Math.round(obj.tempo)));
  }

  // Time Signature
  const tsObj = (obj.timeSignature as Record<string, number>) || {};
  const timeSignature = {
    numerator: typeof tsObj.numerator === 'number' && tsObj.numerator > 0 ? tsObj.numerator : 4,
    denominator: typeof tsObj.denominator === 'number' && tsObj.denominator > 0 ? tsObj.denominator : 4,
  };

  // Sections
  const sections = Array.isArray(obj.sections)
    ? obj.sections.map((sec, idx) => {
        const sObj = sec as Record<string, unknown>;
        return {
          name: typeof sObj.name === 'string' ? sObj.name : `Section ${idx + 1}`,
          type: typeof sObj.type === 'string' ? sObj.type : 'verse',
          startBar: typeof sObj.startBar === 'number' ? Math.max(0, sObj.startBar) : idx * 4 + 1,
          endBar: typeof sObj.endBar === 'number' ? Math.max(1, sObj.endBar) : (idx + 1) * 4,
        };
      })
    : [{ name: 'Main Section', type: 'verse', startBar: 1, endBar: 8 }];

  // Progression & Chords
  const progObj = (obj.progression as Record<string, unknown>) || {};
  const rawChords = Array.isArray(progObj.chords) ? progObj.chords : [];
  
  const chords: ChordSpec[] = rawChords.map((ch) => {
    const cObj = ch as Record<string, unknown>;
    let root = typeof cObj.root === 'string' ? cObj.root.toUpperCase() : key;
    if (!VALID_KEYS.includes(root as MusicalKey)) {
      root = key;
    }
    const quality = typeof cObj.quality === 'string' ? cObj.quality.toLowerCase() : 'major';
    const durationBars = typeof cObj.durationBars === 'number' && cObj.durationBars > 0 ? cObj.durationBars : 1;
    const romanNumeral = typeof cObj.romanNumeral === 'string' ? cObj.romanNumeral : undefined;

    return { root, quality, durationBars, romanNumeral };
  });

  if (chords.length === 0) {
    chords.push({ root: key, quality: mode === 'Minor' ? 'minor' : 'major', durationBars: 2, romanNumeral: undefined });
  }

  const progression = {
    template: typeof progObj.template === 'string' ? progObj.template : undefined,
    chords,
  };

  // Tracks
  const rawTracks = Array.isArray(obj.tracks) ? obj.tracks : [];
  const tracks: TrackSpec[] = rawTracks.map((tr, idx) => {
    const tObj = tr as Record<string, unknown>;
    const name = typeof tObj.name === 'string' ? tObj.name : `AI Track ${idx + 1}`;
    
    let role: 'chords' | 'melody' | 'arpeggio' | 'bass' = 'melody';
    if (tObj.role === 'chords' || tObj.role === 'melody' || tObj.role === 'arpeggio' || tObj.role === 'bass') {
      role = tObj.role;
    }

    let generator: 'chord' | 'melody' | 'arpeggio' = 'melody';
    if (tObj.generator === 'chord' || tObj.generator === 'melody' || tObj.generator === 'arpeggio') {
      generator = tObj.generator;
    } else if (role === 'chords') {
      generator = 'chord';
    } else if (role === 'arpeggio') {
      generator = 'arpeggio';
    }

    const instrument = typeof tObj.instrument === 'string' ? tObj.instrument : 'Piano';
    const octaveOffset = typeof tObj.octaveOffset === 'number' ? tObj.octaveOffset : 0;
    
    let noteDensity: 'low' | 'medium' | 'high' = 'medium';
    if (tObj.noteDensity === 'low' || tObj.noteDensity === 'medium' || tObj.noteDensity === 'high') {
      noteDensity = tObj.noteDensity;
    }

    let pattern: 'Up' | 'Down' | 'UpDown' | 'Random' = 'Up';
    if (tObj.pattern === 'Up' || tObj.pattern === 'Down' || tObj.pattern === 'UpDown' || tObj.pattern === 'Random') {
      pattern = tObj.pattern;
    }

    return {
      name,
      role,
      generator,
      instrument,
      octaveOffset,
      noteDensity,
      pattern,
    };
  });

  if (tracks.length === 0) {
    tracks.push(
      { name: 'AI Chords', role: 'chords', generator: 'chord', instrument: 'Piano', octaveOffset: -1, noteDensity: 'medium', pattern: 'Up' },
      { name: 'AI Melody', role: 'melody', generator: 'melody', instrument: 'Synth', octaveOffset: 0, noteDensity: 'medium', pattern: 'Up' }
    );
  }

  // Generation spec
  const genObj = (obj.generation as Record<string, unknown>) || {};
  const seed = typeof genObj.seed === 'number' ? Math.round(genObj.seed) : Math.floor(Math.random() * 90000) + 10000;
  
  let melodyDensity: 'low' | 'medium' | 'high' = 'medium';
  if (genObj.melodyDensity === 'low' || genObj.melodyDensity === 'medium' || genObj.melodyDensity === 'high') {
    melodyDensity = genObj.melodyDensity;
  }

  const pitchRangeObj = (genObj.pitchRange || genObj.register) as Record<string, number> | undefined;
  const pitchRange = pitchRangeObj
    ? {
        min: typeof pitchRangeObj.min === 'number' ? Math.max(0, pitchRangeObj.min) : 48,
        max: typeof pitchRangeObj.max === 'number' ? Math.min(127, pitchRangeObj.max) : 84,
      }
    : { min: 48, max: 84 };

  return {
    title,
    key,
    mode,
    tempo,
    timeSignature,
    sections,
    progression,
    tracks,
    generation: {
      melodyDensity,
      pitchRange,
      seed,
    },
  };
}
