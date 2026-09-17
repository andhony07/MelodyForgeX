import React, { useState } from 'react';
import { Mic, Radio, Square, Pause, Play, X, DownloadCloud, AlertCircle } from 'lucide-react';
import { useRecordingStore } from '../stores/useRecordingStore';
import { RecordingSource } from '../types/recording';

export const RecordingControls: React.FC = () => {
  const {
    recordingState,
    activeSource,
    elapsedSeconds,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
    setRenderingDialogOpen,
  } = useRecordingStore();

  const [selectedSource, setSelectedSource] = useState<RecordingSource>('microphone');

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isRecording = recordingState === 'recording';
  const isPaused = recordingState === 'paused';
  const isBusy = recordingState === 'requesting' || recordingState === 'processing';

  return (
    <div className="flex items-center gap-2">
      {/* Source Selector */}
      {!isRecording && !isPaused && (
        <div className="flex items-center bg-[#0f1117] border border-[#2e3444] rounded-lg p-0.5">
          <button
            onClick={() => setSelectedSource('microphone')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
              selectedSource === 'microphone'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            title="Record Microphone Input"
          >
            <Mic className="w-3 h-3" />
            <span>Mic</span>
          </button>
          <button
            onClick={() => setSelectedSource('master_output')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
              selectedSource === 'master_output'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            title="Record Master Studio Output"
          >
            <Radio className="w-3 h-3" />
            <span>Master</span>
          </button>
        </div>
      )}

      {/* Record / Pause / Resume / Stop Controls */}
      {!isRecording && !isPaused ? (
        <button
          onClick={() => startRecording(selectedSource)}
          disabled={isBusy}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md shadow-rose-600/20 transition-all"
        >
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>Record</span>
        </button>
      ) : (
        <div className="flex items-center gap-1.5 bg-rose-950/40 border border-rose-800/60 px-2 py-1 rounded-lg">
          <div className="flex items-center gap-1.5 mr-1">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isPaused ? 'bg-amber-400' : 'bg-rose-500 animate-ping'
              }`}
            />
            <span className="text-[11px] font-mono font-bold text-rose-300">
              {formatTimer(elapsedSeconds)}
            </span>
            <span className="text-[10px] uppercase font-semibold text-rose-400/80">
              ({activeSource === 'microphone' ? 'Mic' : 'Master'})
            </span>
          </div>

          {isRecording ? (
            <button
              onClick={pauseRecording}
              className="p-1 text-gray-300 hover:text-white hover:bg-rose-900/50 rounded"
              title="Pause Recording"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={resumeRecording}
              className="p-1 text-gray-300 hover:text-white hover:bg-rose-900/50 rounded"
              title="Resume Recording"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => stopRecording()}
            className="p-1 text-rose-400 hover:text-rose-200 hover:bg-rose-900/50 rounded font-bold"
            title="Stop & Save Recording"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>

          <button
            onClick={cancelRecording}
            className="p-1 text-gray-400 hover:text-gray-200 hover:bg-rose-900/50 rounded"
            title="Cancel Recording"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Render Project Trigger */}
      <button
        onClick={() => setRenderingDialogOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2330] hover:bg-[#282f40] border border-[#373e52] text-gray-200 rounded-lg text-xs font-semibold transition-all"
        title="Offline Render Project to WAV"
      >
        <DownloadCloud className="w-3.5 h-3.5 text-cyan-400" />
        <span>Export WAV</span>
      </button>

      {/* Error Indicator */}
      {error && (
        <div
          className="flex items-center gap-1 text-[11px] text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-1 rounded-lg"
          title={error}
        >
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate max-w-[150px]">{error}</span>
        </div>
      )}
    </div>
  );
};
