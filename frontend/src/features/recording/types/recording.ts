export type RecordingSource = 'microphone' | 'master_output';

export type RecordingState =
  | 'idle'
  | 'requesting'
  | 'recording'
  | 'paused'
  | 'processing'
  | 'ready'
  | 'error';

export type RenderingState = 'idle' | 'rendering' | 'completed' | 'error';

export type RenderScope = 'full_project' | 'selected_section' | 'loop_range';

export interface RecordingMetadata {
  id: string;
  name: string;
  source: RecordingSource;
  duration: number; // in seconds
  createdAt: string; // ISO date string
  mimeType: string;
  sizeBytes: number;
  url?: string; // Blob Object URL (URL.createObjectURL)
}

export interface RenderOptions {
  scope: RenderScope;
  sectionId?: string;
  startBeat?: number;
  endBeat?: number;
  sampleRate?: number;
  channels?: number;
  filename?: string;
}

export interface RenderResult {
  audioBuffer: AudioBuffer;
  wavBlob: Blob;
  durationSeconds: number;
  filename: string;
}
