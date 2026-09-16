import { create } from 'zustand';
import { ToneAudioEngine } from '../engine/ToneAudioEngine';
import { Track } from '../../editor/types/studio';
import { Note } from '../../editor/types/note';

interface AudioState {
  isInitialized: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  audioError: string | null;

  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  seek: (beat: number) => void;
  syncAudio: (tracks: Track[], notesByTrackId: Record<string, Note[]>, tempo: number, isLooping: boolean) => void;
  previewNote: (track: Track | null, pitch: number, durationBeats?: number, velocity?: number) => Promise<void>;
}

export const useAudioStore = create<AudioState>((set) => {
  const audioEngine = ToneAudioEngine.getInstance();

  return {
    isInitialized: false,
    isPlaying: false,
    isPaused: false,
    audioError: null,

    play: async () => {
      try {
        await audioEngine.play();
        set({ isPlaying: true, isPaused: false, isInitialized: true, audioError: null });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to initialize audio engine';
        set({ audioError: msg, isPlaying: false });
      }
    },

    pause: () => {
      audioEngine.pause();
      set({ isPlaying: false, isPaused: true });
    },

    stop: () => {
      audioEngine.stop();
      set({ isPlaying: false, isPaused: false });
    },

    seek: (beat: number) => {
      audioEngine.seekToBeat(beat);
    },

    syncAudio: (tracks: Track[], notesByTrackId: Record<string, Note[]>, tempo: number, isLooping: boolean) => {
      try {
        audioEngine.setTempo(tempo);
        audioEngine.setLoop(isLooping);
        audioEngine.syncTracksAndNotes(tracks, notesByTrackId);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Audio synchronization error';
        set({ audioError: msg });
      }
    },

    previewNote: async (track: Track | null, pitch: number, durationBeats = 0.5, velocity = 100) => {
      try {
        await audioEngine.previewNote(track, pitch, durationBeats, velocity);
        set({ isInitialized: true });
      } catch {
        // Suppress preview error
      }
    },
  };
});
