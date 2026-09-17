import React from 'react';
import { Play, Pause, Square, Repeat } from 'lucide-react';
import { useStudioStore } from '../stores/useStudioStore';
import { useAudioStore } from '../../audio/stores/useAudioStore';
import { MusicalKey, KeyMode, TimeSignature } from '../types/studio';
import { RecordingControls } from '../../recording/components/RecordingControls';

export const TransportBar: React.FC = () => {
  const {
    isPlaying,
    playheadPosition,
    tempo,
    key,
    mode,
    timeSignature,
    isLooping,
    togglePlay,
    stop,
    toggleLoop,
    setTempo,
    setKey,
    setMode,
    setTimeSignature,
  } = useStudioStore();

  const { play: audioPlay, pause: audioPause, stop: audioStop, audioError } = useAudioStore();

  const handlePlayToggle = async () => {
    if (isPlaying) {
      audioPause();
      togglePlay();
    } else {
      await audioPlay();
      togglePlay();
    }
  };

  const handleStop = () => {
    audioStop();
    stop();
  };

  // Format playhead position (measures and beats) e.g. Measure 01 : Beat 1
  const measure = Math.floor(playheadPosition);
  const beatFraction = playheadPosition - measure;
  const beat = Math.floor(beatFraction * 4) + 1;

  const padNumber = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="h-14 bg-[#181b24] border-b border-[#2e3444] px-4 flex items-center justify-between select-none font-sans text-xs gap-3 overflow-x-auto">
      {/* Left: Playback controls & Timer */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-1 bg-[#0f1117] p-1.5 rounded-lg border border-[#2e3444]">
          <button
            onClick={handlePlayToggle}
            className={`p-2 rounded-md transition-colors ${
              isPlaying
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                : 'hover:bg-[#202430] text-emerald-400'
            }`}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            onClick={handleStop}
            className="p-2 rounded-md hover:bg-[#202430] text-gray-400 hover:text-gray-100 transition-colors"
            title="Stop (S)"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={toggleLoop}
            className={`p-2 rounded-md transition-colors ${
              isLooping
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                : 'hover:bg-[#202430] text-gray-400'
            }`}
            title="Toggle Loop"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Counter Display */}
        <div className="bg-[#0f1117] border border-[#2e3444] px-3 py-1.5 rounded-lg flex items-center gap-3 font-mono">
          <div className="text-center">
            <span className="text-[9px] block text-gray-500 font-semibold tracking-wider uppercase">BAR</span>
            <span className="text-base font-bold text-gray-100">{padNumber(measure)}</span>
          </div>
          <span className="text-gray-600 text-sm font-bold">:</span>
          <div className="text-center">
            <span className="text-[9px] block text-gray-500 font-semibold tracking-wider uppercase">BEAT</span>
            <span className="text-base font-bold text-gray-100">{beat}</span>
          </div>
        </div>

        {audioError && (
          <div className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/30 rounded text-rose-400 text-[11px]">
            {audioError}
          </div>
        )}
      </div>

      {/* Center: Audio Recording Controls */}
      <div className="flex-shrink-0">
        <RecordingControls />
      </div>

      {/* Right: Song Parameters (Tempo, Key, Time Sig) */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Tempo BPM Input */}
        <div className="flex items-center gap-2 bg-[#0f1117] px-3 py-1.5 rounded-lg border border-[#2e3444]">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">BPM</span>
          <input
            type="number"
            min={20}
            max={300}
            value={tempo}
            onChange={(e) => setTempo(parseInt(e.target.value) || 120)}
            className="w-14 bg-transparent text-sm font-mono font-bold text-indigo-400 outline-hidden text-center"
          />
        </div>

        {/* Key & Mode Selector */}
        <div className="flex items-center gap-1.5 bg-[#0f1117] px-2.5 py-1.5 rounded-lg border border-[#2e3444]">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mr-1">KEY</span>
          <select
            value={key}
            onChange={(e) => setKey(e.target.value as MusicalKey)}
            className="bg-transparent text-xs font-mono font-bold text-cyan-400 outline-hidden cursor-pointer"
          >
            {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((k) => (
              <option key={k} value={k} className="bg-[#181b24] text-gray-200">
                {k}
              </option>
            ))}
          </select>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as KeyMode)}
            className="bg-transparent text-xs font-mono font-bold text-gray-300 outline-hidden cursor-pointer"
          >
            <option value="Major" className="bg-[#181b24] text-gray-200">Major</option>
            <option value="Minor" className="bg-[#181b24] text-gray-200">Minor</option>
          </select>
        </div>

        {/* Time Signature Selector */}
        <div className="flex items-center gap-2 bg-[#0f1117] px-3 py-1.5 rounded-lg border border-[#2e3444]">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">SIG</span>
          <select
            value={timeSignature}
            onChange={(e) => setTimeSignature(e.target.value as TimeSignature)}
            className="bg-transparent text-xs font-mono font-bold text-emerald-400 outline-hidden cursor-pointer"
          >
            {['4/4', '3/4', '2/4', '6/8', '7/8', '12/8'].map((ts) => (
              <option key={ts} value={ts} className="bg-[#181b24] text-gray-200">
                {ts}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
