import { RecordingMetadata } from '../types/recording';

export class RecordingManagerService {
  private static instance: RecordingManagerService | null = null;
  private blobMap: Map<string, { blob: Blob; url: string }> = new Map();

  private constructor() {}

  public static getInstance(): RecordingManagerService {
    if (!RecordingManagerService.instance) {
      RecordingManagerService.instance = new RecordingManagerService();
    }
    return RecordingManagerService.instance;
  }

  public registerRecording(metadata: RecordingMetadata, blob: Blob): string {
    let url = '';
    if (typeof window !== 'undefined' && window.URL && window.URL.createObjectURL) {
      url = window.URL.createObjectURL(blob);
    }
    this.blobMap.set(metadata.id, { blob, url });
    return url;
  }

  public getRecordingBlob(id: string): Blob | undefined {
    return this.blobMap.get(id)?.blob;
  }

  public getRecordingUrl(id: string): string | undefined {
    return this.blobMap.get(id)?.url;
  }

  public deleteRecording(id: string): boolean {
    const entry = this.blobMap.get(id);
    if (entry) {
      if (entry.url && typeof window !== 'undefined' && window.URL && window.URL.revokeObjectURL) {
        try {
          window.URL.revokeObjectURL(entry.url);
        } catch {
          // Ignore URL revocation error
        }
      }
      this.blobMap.delete(id);
      return true;
    }
    return false;
  }

  public clearAll(): void {
    this.blobMap.forEach((entry) => {
      if (entry.url && typeof window !== 'undefined' && window.URL && window.URL.revokeObjectURL) {
        try {
          window.URL.revokeObjectURL(entry.url);
        } catch {
          // Ignore URL revocation error
        }
      }
    });
    this.blobMap.clear();
  }
}

export const recordingManager = RecordingManagerService.getInstance();
