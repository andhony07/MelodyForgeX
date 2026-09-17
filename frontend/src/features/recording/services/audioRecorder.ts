import * as Tone from 'tone';
import { RecordingSource, RecordingMetadata } from '../types/recording';
import { ToneAudioEngine } from '../../audio/engine/ToneAudioEngine';

export class AudioRecorderService {
  private static instance: AudioRecorderService | null = null;

  private micStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private toneRecorder: Tone.Recorder | null = null;
  private recordedChunks: Blob[] = [];
  private activeSource: RecordingSource | null = null;
  private startTime = 0;
  private pausedDuration = 0;
  private pauseStartTime = 0;
  private isPaused = false;

  private constructor() {}

  public static getInstance(): AudioRecorderService {
    if (!AudioRecorderService.instance) {
      AudioRecorderService.instance = new AudioRecorderService();
    }
    return AudioRecorderService.instance;
  }

  /**
   * Start Microphone Recording
   */
  public async startMicrophoneRecording(): Promise<void> {
    if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Microphone recording is not supported in this environment.');
    }

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          throw new Error('Microphone access denied. Please grant microphone permission to record.');
        }
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          throw new Error('No microphone input device found on your system.');
        }
      }
      throw new Error('Failed to access microphone input device.');
    }

    const mimeType = this.getSupportedMimeType();
    try {
      this.mediaRecorder = new MediaRecorder(this.micStream, { mimeType });
    } catch {
      this.mediaRecorder = new MediaRecorder(this.micStream);
    }

    this.recordedChunks = [];
    this.activeSource = 'microphone';
    this.startTime = Date.now();
    this.pausedDuration = 0;
    this.isPaused = false;

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(100); // 100ms timeslice
  }

  /**
   * Start Master Output Recording
   */
  public async startMasterOutputRecording(): Promise<void> {
    const audioEngine = ToneAudioEngine.getInstance();
    await audioEngine.ensureStarted();

    try {
      this.toneRecorder = new Tone.Recorder();
      Tone.getDestination().connect(this.toneRecorder);
      await this.toneRecorder.start();

      this.activeSource = 'master_output';
      this.startTime = Date.now();
      this.pausedDuration = 0;
      this.isPaused = false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Master output recording initialization failed.';
      throw new Error(`Master recording error: ${msg}`);
    }
  }

  /**
   * Pause Active Recording
   */
  public pauseRecording(): void {
    if (this.isPaused) return;

    if (this.activeSource === 'microphone' && this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      try {
        this.mediaRecorder.pause();
      } catch {
        // Ignore pause error if media recorder in invalid state
      }
    } else if (this.activeSource === 'master_output' && this.toneRecorder) {
      try {
        this.toneRecorder.pause();
      } catch {
        // Ignore Tone.Recorder pause error
      }
    }

    this.pauseStartTime = Date.now();
    this.isPaused = true;
  }

  /**
   * Resume Active Recording
   */
  public resumeRecording(): void {
    if (!this.isPaused) return;

    if (this.activeSource === 'microphone' && this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      try {
        this.mediaRecorder.resume();
      } catch {
        // Ignore resume error
      }
    } else if (this.activeSource === 'master_output' && this.toneRecorder) {
      try {
        // Tone.Recorder handles pause/resume automatically during recording
      } catch {
        // Ignore Tone.Recorder resume error
      }
    }

    this.pausedDuration += Date.now() - this.pauseStartTime;
    this.isPaused = false;
  }

  /**
   * Stop Recording and Return Metadata + Blob
   */
  public async stopRecording(name = 'New Recording'): Promise<{ blob: Blob; metadata: RecordingMetadata }> {
    const totalElapsedMs = Date.now() - this.startTime - this.pausedDuration;
    const durationSeconds = Math.max(0.1, totalElapsedMs / 1000);
    const createdAt = new Date().toISOString();
    const id = `rec-${Date.now()}`;

    let blob: Blob;
    let mimeType = 'audio/webm';

    if (this.activeSource === 'microphone') {
      mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
      blob = await new Promise<Blob>((resolve) => {
        if (!this.mediaRecorder) {
          resolve(new Blob([], { type: mimeType }));
          return;
        }

        this.mediaRecorder.onstop = () => {
          const finalBlob = new Blob(this.recordedChunks, { type: mimeType });
          resolve(finalBlob);
        };

        try {
          if (this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
          } else {
            resolve(new Blob(this.recordedChunks, { type: mimeType }));
          }
        } catch {
          resolve(new Blob(this.recordedChunks, { type: mimeType }));
        }
      });

      this.cleanupMicrophone();
    } else if (this.activeSource === 'master_output') {
      if (this.toneRecorder) {
        try {
          blob = await this.toneRecorder.stop();
          mimeType = blob.type || 'audio/webm';
          Tone.getDestination().disconnect(this.toneRecorder);
          this.toneRecorder.dispose();
          this.toneRecorder = null;
        } catch {
          blob = new Blob([], { type: 'audio/webm' });
        }
      } else {
        blob = new Blob([], { type: 'audio/webm' });
      }
    } else {
      throw new Error('No active recording session to stop.');
    }

    const metadata: RecordingMetadata = {
      id,
      name,
      source: this.activeSource || 'microphone',
      duration: durationSeconds,
      createdAt,
      mimeType,
      sizeBytes: blob.size,
    };

    this.resetState();
    return { blob, metadata };
  }

  /**
   * Cancel Active Recording
   */
  public cancelRecording(): void {
    if (this.activeSource === 'microphone') {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        try {
          this.mediaRecorder.stop();
        } catch {
          // Ignore stop error on cancel
        }
      }
      this.cleanupMicrophone();
    } else if (this.activeSource === 'master_output' && this.toneRecorder) {
      try {
        Tone.getDestination().disconnect(this.toneRecorder);
        this.toneRecorder.dispose();
        this.toneRecorder = null;
      } catch {
        // Ignore dispose error on cancel
      }
    }

    this.resetState();
  }

  public getElapsedSeconds(): number {
    if (this.startTime === 0) return 0;
    if (this.isPaused) {
      return Math.max(0, (this.pauseStartTime - this.startTime - this.pausedDuration) / 1000);
    }
    return Math.max(0, (Date.now() - this.startTime - this.pausedDuration) / 1000);
  }

  private cleanupMicrophone(): void {
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignore track stop error
        }
      });
      this.micStream = null;
    }
    this.mediaRecorder = null;
    this.recordedChunks = [];
  }

  private resetState(): void {
    this.activeSource = null;
    this.startTime = 0;
    this.pausedDuration = 0;
    this.pauseStartTime = 0;
    this.isPaused = false;
  }

  private getSupportedMimeType(): string {
    if (typeof MediaRecorder === 'undefined') return 'audio/webm';
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
    for (const t of types) {
      if (MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return 'audio/webm';
  }
}
