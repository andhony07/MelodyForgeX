import { Track } from '../../editor/types/studio';
import { Note } from '../../editor/types/note';

export interface MIDIExportOptions {
  filename?: string;
  selectedTrackIds?: string[]; // if empty, export all tracks
  includeTempoTrack?: boolean;
}

export interface MIDIImportOptions {
  targetMode: 'replace' | 'append';
}

export interface ParsedMIDITrackSummary {
  name: string;
  instrument: string;
  noteCount: number;
  channel: number;
}

export interface ParsedMIDISummary {
  title: string;
  bpm: number;
  timeSignature: string;
  trackSummaries: ParsedMIDITrackSummary[];
  totalNotes: number;
}

export interface ConvertedMIDIPayload {
  tracks: Track[];
  notesByTrackId: Record<string, Note[]>;
  tempo?: number;
}
