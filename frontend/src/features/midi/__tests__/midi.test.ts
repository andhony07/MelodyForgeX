import {
  beatToSeconds,
  secondsToBeat,
  pitchToMidi,
  instrumentNameToMidiProgram,
  midiProgramToInstrumentName,
} from '../utils/midiConversionUtils';
import { createMIDIFileFromProject } from '../services/midiExportService';
import { convertMIDIToMelodyForge } from '../services/midiImportService';
import { validateMelodyForgeProjectFile } from '../../projects/services/projectSerializer';
import { Track } from '../../editor/types/studio';
import { Note } from '../../editor/types/note';

export function runMIDITests() {
  const logs: string[] = [];
  let passed = 0;
  let total = 0;

  const assert = (condition: boolean, description: string) => {
    total++;
    if (condition) {
      passed++;
      logs.push(`  ✓ ${description}`);
    } else {
      logs.push(`  ✗ FAILED: ${description}`);
      throw new Error(`Assertion failed: ${description}`);
    }
  };

  logs.push('\n=== MIDI & Project Interchange Unit Tests ===');

  // Test 1: Beat <-> Seconds Conversion
  try {
    const secAt120Bpm = beatToSeconds(5.0, 120); // 4 beats offset @ 120BPM = 2.0s
    assert(Math.abs(secAt120Bpm - 2.0) < 0.001, 'Beat 5.0 at 120BPM converts to 2.0 seconds');

    const beatFromSec = secondsToBeat(2.0, 120);
    assert(Math.abs(beatFromSec - 5.0) < 0.001, '2.0 seconds at 120BPM converts to Beat 5.0');

    const secAt90Bpm = beatToSeconds(4.0, 90); // 3 beats @ 90BPM = 2.0s
    assert(Math.abs(secAt90Bpm - 2.0) < 0.001, 'Beat 4.0 at 90BPM converts to 2.0 seconds');
  } catch (err: unknown) {
    logs.push(`  ✗ Test 1 Error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Test 2: Pitch & General MIDI Instrument Mappings
  try {
    assert(pitchToMidi(60) === 60, 'Pitch 60 maps to MIDI 60');
    assert(pitchToMidi(-5) === 0, 'Pitch -5 clamps to MIDI 0');
    assert(pitchToMidi(150) === 127, 'Pitch 150 clamps to MIDI 127');

    assert(instrumentNameToMidiProgram('Piano') === 0, 'Piano maps to GM Program 0');
    assert(instrumentNameToMidiProgram('Acoustic Guitar') === 24, 'Guitar maps to GM Program 24');
    assert(instrumentNameToMidiProgram('Synth Lead') === 80, 'Synth maps to GM Program 80');

    const mappedInst = midiProgramToInstrumentName(25);
    assert(mappedInst.instrument === 'Guitar', 'GM Program 25 maps to Guitar instrument');
  } catch (err: unknown) {
    logs.push(`  ✗ Test 2 Error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Test 3: MIDI Project Export
  try {
    const sampleTracks: Track[] = [
      { id: 'tr-1', name: 'Piano Chords', instrument: 'Piano', iconName: 'music', color: '#3b82f6', volume: 80, channel: 1, muted: false, solo: false },
    ];
    const sampleNotes: Record<string, Note[]> = {
      'tr-1': [
        { id: 'n-1', trackId: 'tr-1', pitch: 60, startBeat: 1.0, durationBeats: 2.0, velocity: 90 },
        { id: 'n-2', trackId: 'tr-1', pitch: 64, startBeat: 1.0, durationBeats: 2.0, velocity: 90 },
      ],
    };

    const midi = createMIDIFileFromProject(sampleTracks, sampleNotes, 100, { filename: 'test_export' });

    assert(midi.header.name === 'test_export', 'Export MIDI header name is preserved');
    assert(Math.round(midi.header.tempos[0].bpm) === 100, 'Export MIDI tempo is 100 BPM');
    assert(midi.tracks.length === 1, 'Export contains 1 track');
    assert(midi.tracks[0].notes.length === 2, 'Export track contains 2 notes');
    assert(midi.tracks[0].notes[0].midi === 60, 'Export note pitch is 60');
  } catch (err: unknown) {
    logs.push(`  ✗ Test 3 Error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Test 4: MIDI Import Conversion
  try {
    const sampleTracks: Track[] = [
      { id: 'tr-1', name: 'Synth Lead', instrument: 'Synth', iconName: 'zap', color: '#ec4899', volume: 80, channel: 1, muted: false, solo: false },
    ];
    const sampleNotes: Record<string, Note[]> = {
      'tr-1': [
        { id: 'n-1', trackId: 'tr-1', pitch: 72, startBeat: 1.0, durationBeats: 1.0, velocity: 100 },
      ],
    };

    const exportedMidi = createMIDIFileFromProject(sampleTracks, sampleNotes, 120);
    const importedPayload = convertMIDIToMelodyForge(exportedMidi);

    assert(importedPayload.tempo === 120, 'Imported payload preserves tempo 120 BPM');
    assert(importedPayload.tracks.length === 1, 'Imported payload creates 1 track');
    const importedNotes = importedPayload.notesByTrackId[importedPayload.tracks[0].id];
    assert(importedNotes.length === 1, 'Imported payload track contains 1 note');
    assert(importedNotes[0].pitch === 72, 'Imported note pitch matches 72');
  } catch (err: unknown) {
    logs.push(`  ✗ Test 4 Error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Test 5: Native Project Interchange Validation
  try {
    const validProjectObj = {
      version: 1,
      format: 'melodyforge-project',
      metadata: { title: 'Test Project', createdAt: '', updatedAt: '' },
      studio: { tempo: 120, key: 'C', mode: 'Major', timeSignature: '4/4', zoom: 100, isLooping: false },
      tracks: [],
      notesByTrackId: {},
      arrangement: { sections: [], totalBars: 32 },
    };

    const validated = validateMelodyForgeProjectFile(validProjectObj);
    assert(validated.format === 'melodyforge-project', 'Validates .melodyforge project payload');

    let errorCaught = false;
    try {
      validateMelodyForgeProjectFile({ format: 'unknown-format' });
    } catch {
      errorCaught = true;
    }
    assert(errorCaught, 'Rejects invalid project formats cleanly');
  } catch (err: unknown) {
    logs.push(`  ✗ Test 5 Error: ${err instanceof Error ? err.message : String(err)}`);
  }

  return { passed, total, logs };
}
