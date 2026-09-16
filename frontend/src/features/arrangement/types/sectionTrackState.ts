export interface SectionTrackState {
  sectionId: string;
  trackId: string;
  enabled: boolean;
  muted?: boolean;
  volumeOffset?: number;
  panOffset?: number;
}
