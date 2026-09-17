import { create } from 'zustand';
import {
  RecordingSource,
  RecordingState,
  RenderingState,
  RecordingMetadata,
  RenderOptions,
} from '../types/recording';
import { AudioRecorderService } from '../services/audioRecorder';
import { RecordingManagerService } from '../services/recordingManager';
import { OfflineRendererService } from '../services/offlineRenderer';
import { triggerWavDownload, audioBufferToWavBlob } from '../services/audioExporter';

interface RecordingStoreState {
  recordings: RecordingMetadata[];
  recordingState: RecordingState;
  renderingState: RenderingState;
  activeSource: RecordingSource | null;
  elapsedSeconds: number;
  error: string | null;
  activePreviewId: string | null;
  isRenderingDialogOpen: boolean;

  startRecording: (source: RecordingSource) => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: (name?: string) => Promise<RecordingMetadata | null>;
  cancelRecording: () => void;

  deleteRecording: (id: string) => void;
  renameRecording: (id: string, newName: string) => void;
  setActivePreview: (id: string | null) => void;

  renderProject: (options: RenderOptions) => Promise<void>;
  exportRecordingAsWav: (id: string) => Promise<void>;
  setRenderingDialogOpen: (open: boolean) => void;
  updateTimer: () => void;
  clearAllRecordings: () => void;
  addRecordingDirectly: (metadata: RecordingMetadata, blob: Blob) => void;
}

let timerInterval: number | null = null;

export const useRecordingStore = create<RecordingStoreState>((set, get) => {
  const recorder = AudioRecorderService.getInstance();
  const manager = RecordingManagerService.getInstance();

  const startTimer = () => {
    if (timerInterval !== null) clearInterval(timerInterval);
    timerInterval = window.setInterval(() => {
      set({ elapsedSeconds: recorder.getElapsedSeconds() });
    }, 100);
  };

  const stopTimer = () => {
    if (timerInterval !== null) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  };

  return {
    recordings: [],
    recordingState: 'idle',
    renderingState: 'idle',
    activeSource: null,
    elapsedSeconds: 0,
    error: null,
    activePreviewId: null,
    isRenderingDialogOpen: false,

    startRecording: async (source: RecordingSource) => {
      set({ recordingState: 'requesting', error: null, activeSource: source });
      try {
        if (source === 'microphone') {
          await recorder.startMicrophoneRecording();
        } else {
          await recorder.startMasterOutputRecording();
        }
        set({ recordingState: 'recording', elapsedSeconds: 0 });
        startTimer();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to start recording session.';
        set({ recordingState: 'error', error: msg, activeSource: null });
        stopTimer();
      }
    },

    pauseRecording: () => {
      recorder.pauseRecording();
      set({ recordingState: 'paused' });
    },

    resumeRecording: () => {
      recorder.resumeRecording();
      set({ recordingState: 'recording' });
    },

    stopRecording: async (name?: string) => {
      stopTimer();
      set({ recordingState: 'processing' });
      try {
        const defaultName =
          name ||
          (get().activeSource === 'microphone' ? 'Microphone Recording' : 'Master Output Capture');

        const { blob, metadata } = await recorder.stopRecording(defaultName);
        const objectUrl = manager.registerRecording(metadata, blob);
        const updatedMetadata = { ...metadata, url: objectUrl };

        set((state) => ({
          recordings: [updatedMetadata, ...state.recordings],
          recordingState: 'ready',
          activeSource: null,
          activePreviewId: updatedMetadata.id,
          elapsedSeconds: 0,
        }));

        return updatedMetadata;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to process recording.';
        set({ recordingState: 'error', error: msg, activeSource: null });
        return null;
      }
    },

    cancelRecording: () => {
      stopTimer();
      recorder.cancelRecording();
      set({ recordingState: 'idle', activeSource: null, elapsedSeconds: 0, error: null });
    },

    deleteRecording: (id: string) => {
      manager.deleteRecording(id);
      set((state) => ({
        recordings: state.recordings.filter((r) => r.id !== id),
        activePreviewId: state.activePreviewId === id ? null : state.activePreviewId,
      }));
    },

    renameRecording: (id: string, newName: string) => {
      set((state) => ({
        recordings: state.recordings.map((r) => (r.id === id ? { ...r, name: newName } : r)),
      }));
    },

    setActivePreview: (id: string | null) => {
      set({ activePreviewId: id });
    },

    renderProject: async (options: RenderOptions) => {
      set({ renderingState: 'rendering', error: null });
      try {
        const result = await OfflineRendererService.renderProject(options);
        const metadata: RecordingMetadata = {
          id: `render-${Date.now()}`,
          name: result.filename.replace('.wav', ''),
          source: 'master_output',
          duration: result.durationSeconds,
          createdAt: new Date().toISOString(),
          mimeType: 'audio/wav',
          sizeBytes: result.wavBlob.size,
        };

        const objectUrl = manager.registerRecording(metadata, result.wavBlob);
        const updatedMetadata = { ...metadata, url: objectUrl };

        set((state) => ({
          recordings: [updatedMetadata, ...state.recordings],
          renderingState: 'completed',
          activePreviewId: updatedMetadata.id,
          isRenderingDialogOpen: false,
        }));

        // Auto download rendered WAV
        triggerWavDownload(result.wavBlob, result.filename);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Offline rendering failed.';
        set({ renderingState: 'error', error: msg });
      }
    },

    exportRecordingAsWav: async (id: string) => {
      const metadata = get().recordings.find((r) => r.id === id);
      const blob = manager.getRecordingBlob(id);
      if (!metadata || !blob) return;

      if (blob.type.includes('wav')) {
        triggerWavDownload(blob, metadata.name);
      } else {
        // Convert Blob audio data to WAV using Web Audio Context decode
        try {
          const arrayBuffer = await blob.arrayBuffer();
          const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          const wavBlob = audioBufferToWavBlob(audioBuffer);
          triggerWavDownload(wavBlob, metadata.name);
        } catch {
          // Direct fallback download
          triggerWavDownload(blob, metadata.name);
        }
      }
    },

    setRenderingDialogOpen: (open: boolean) => set({ isRenderingDialogOpen: open }),

    updateTimer: () => {
      set({ elapsedSeconds: recorder.getElapsedSeconds() });
    },

    clearAllRecordings: () => {
      manager.clearAll();
      set({ recordings: [], activePreviewId: null, recordingState: 'idle', renderingState: 'idle' });
    },

    addRecordingDirectly: (metadata: RecordingMetadata, blob: Blob) => {
      const url = manager.registerRecording(metadata, blob);
      const updated = { ...metadata, url };
      set((state) => ({ recordings: [updated, ...state.recordings] }));
    },
  };
});
