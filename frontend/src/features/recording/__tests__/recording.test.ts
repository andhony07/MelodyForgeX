import { encodePcmWav, sanitizeFilename } from '../services/audioExporter';
import { useRecordingStore } from '../stores/useRecordingStore';
import { recordingManager } from '../services/recordingManager';
import { calculateRenderScope } from '../services/offlineRenderer';
import { RecordingMetadata } from '../types/recording';

export interface TestResult {
  passed: number;
  total: number;
  logs: string[];
}

export function runRecordingTests(): TestResult {
  const logs: string[] = [];
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, message: string) {
    total++;
    if (condition) {
      passed++;
      logs.push(`  ✓ ${message}`);
    } else {
      logs.push(`  ✗ FAIL: ${message}`);
      throw new Error(`Test assertion failed: ${message}`);
    }
  }

  // 1. WAV ENCODER & SANITIZATION TESTS
  logs.push('Running Audio Exporter & WAV Encoder Tests...');

  assert(sanitizeFilename('My Track <1>?') === 'My Track _1__.wav', 'Sanitizes special characters in filename');
  assert(sanitizeFilename('   ') === 'melodyforge_audio.wav', 'Provides fallback for empty or whitespace filename');
  assert(sanitizeFilename('Awesome-Song_v2') === 'Awesome-Song_v2.wav', 'Preserves clean alphanumeric filenames');

  // Test 16-bit PCM WAV Header Generation
  const numChannels = 2;
  const sampleRate = 44100;
  const totalSamplesPerChannel = 1000;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataByteLength = totalSamplesPerChannel * blockAlign;

  const leftChannel = new Float32Array(totalSamplesPerChannel);
  const rightChannel = new Float32Array(totalSamplesPerChannel);
  // Fill with dummy sine wave data
  for (let i = 0; i < totalSamplesPerChannel; i++) {
    leftChannel[i] = Math.sin((i / 44100) * 440 * 2 * Math.PI);
    rightChannel[i] = Math.cos((i / 44100) * 440 * 2 * Math.PI);
  }

  const wavArrayBuffer = encodePcmWav([leftChannel, rightChannel], sampleRate);
  const view = new DataView(wavArrayBuffer);

  // Helper to read ASCII string from DataView
  const readString = (offset: number, length: number) => {
    let str = '';
    for (let i = 0; i < length; i++) {
      str += String.fromCharCode(view.getUint8(offset + i));
    }
    return str;
  };

  assert(readString(0, 4) === 'RIFF', 'WAV file starts with RIFF header');
  assert(readString(8, 4) === 'WAVE', 'WAV format header is WAVE');
  assert(readString(12, 4) === 'fmt ', 'WAV chunk identifier is fmt ');
  assert(view.getUint32(16, true) === 16, 'fmt chunk length is 16 for PCM');
  assert(view.getUint16(20, true) === 1, 'Audio format is 1 (PCM)');
  assert(view.getUint16(22, true) === 2, 'Channel count is 2 (Stereo)');
  assert(view.getUint32(24, true) === 44100, 'Sample rate matches 44100 Hz');
  assert(view.getUint32(28, true) === 44100 * blockAlign, 'Byte rate is sampleRate * blockAlign');
  assert(view.getUint16(32, true) === blockAlign, 'Block align is channels * bytesPerSample');
  assert(view.getUint16(34, true) === 16, 'Bits per sample is 16');
  assert(readString(36, 4) === 'data', 'Data chunk identifier is data');
  assert(view.getUint32(40, true) === dataByteLength, 'Data length matches sample payload');
  assert(wavArrayBuffer.byteLength === 44 + dataByteLength, 'Total WAV byte size is header + data');

  // 2. OFFLINE RENDER SCOPE TESTS
  logs.push('Running Offline Renderer Scope Tests...');

  const fullSongScope = calculateRenderScope('full_project', {
    bpm: 120,
    notesByTrackId: { track1: [{ startBeat: 1, durationBeats: 32 }] },
  });
  assert(fullSongScope.durationSeconds === 16, 'Full project scope calculates exact duration (32 beats @ 120 BPM = 16s)');

  const loopScope = calculateRenderScope('loop_range', { startBeat: 8, endBeat: 24, bpm: 120 });
  assert(loopScope.durationSeconds === 8, 'Loop scope calculates exact loop duration (16 beats @ 120 BPM = 8s)');

  // 3. RECORDING MANAGER & OBJECT URL CLEANUP TESTS
  logs.push('Running Recording Manager & Memory Cleanup Tests...');

  recordingManager.clearAll();

  const dummyBlob = new Blob(['test-audio-data'], { type: 'audio/wav' });
  const meta1: RecordingMetadata = {
    id: 'rec-test-1',
    name: 'Test Mic Take 1',
    source: 'microphone',
    duration: 5.2,
    createdAt: new Date().toISOString(),
    sizeBytes: dummyBlob.size,
    mimeType: 'audio/wav',
  };

  recordingManager.registerRecording(meta1, dummyBlob);
  assert(recordingManager.getRecordingBlob('rec-test-1') !== undefined, 'Recording blob stored correctly by ID');

  const meta2: RecordingMetadata = {
    id: 'rec-test-2',
    name: 'Master Output Render',
    source: 'master_output',
    duration: 12.0,
    createdAt: new Date().toISOString(),
    sizeBytes: dummyBlob.size,
    mimeType: 'audio/wav',
  };
  recordingManager.registerRecording(meta2, dummyBlob);
  assert(recordingManager.getRecordingBlob('rec-test-2') !== undefined, 'Recording manager handles multiple recordings');

  recordingManager.deleteRecording('rec-test-1');
  assert(recordingManager.getRecordingBlob('rec-test-1') === undefined, 'Deleted recording blob is no longer retrievable');

  recordingManager.clearAll();
  assert(recordingManager.getRecordingBlob('rec-test-2') === undefined, 'Clear all removes all recordings and revokes URLs');

  // 4. RECORDING STORE STATE MACHINE TESTS
  logs.push('Running Recording Store Tests...');

  const store = useRecordingStore.getState();
  store.clearAllRecordings();

  assert(useRecordingStore.getState().recordingState === 'idle', 'Initial recording state is idle');
  assert(useRecordingStore.getState().activeSource === null, 'Default activeSource is null');
  assert(useRecordingStore.getState().elapsedSeconds === 0, 'Initial elapsedSeconds is 0');

  // Add dummy recording to store via addRecordingDirectly
  const dummyMeta: RecordingMetadata = {
    id: 'store-rec-1',
    name: 'Vocal Take 1',
    source: 'microphone',
    duration: 4.5,
    createdAt: new Date().toISOString(),
    sizeBytes: dummyBlob.size,
    mimeType: 'audio/wav',
  };

  useRecordingStore.getState().addRecordingDirectly(dummyMeta, dummyBlob);
  assert(useRecordingStore.getState().recordings.length === 1, 'Store reflects added recording');
  assert(useRecordingStore.getState().recordings[0].id === 'store-rec-1', 'Added recording has correct ID');

  useRecordingStore.getState().renameRecording('store-rec-1', 'Vocal Take 1 (Clean)');
  assert(useRecordingStore.getState().recordings[0].name === 'Vocal Take 1 (Clean)', 'Rename updates recording name in store');

  useRecordingStore.getState().deleteRecording('store-rec-1');
  assert(useRecordingStore.getState().recordings.length === 0, 'Delete removes recording from store');

  return {
    passed,
    total,
    logs,
  };
}
