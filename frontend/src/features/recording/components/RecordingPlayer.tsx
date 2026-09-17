import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Square, Volume2 } from 'lucide-react';
import { RecordingMetadata } from '../types/recording';

interface RecordingPlayerProps {
  recording: RecordingMetadata;
}

export const RecordingPlayer: React.FC<RecordingPlayerProps> = ({ recording }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(recording.duration || 0);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [recording.url]);

  const togglePlay = () => {
    if (!audioRef.current || !recording.url) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!recording.url) {
    return (
      <div className="text-[11px] text-gray-400 italic">No audio preview URL available</div>
    );
  }

  return (
    <div className="bg-[#0f1117] border border-[#2e3444] rounded-lg p-2 flex items-center gap-2 select-none text-xs">
      <audio
        ref={audioRef}
        src={recording.url}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current && audioRef.current.duration) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Play / Pause Toggle */}
      <button
        onClick={togglePlay}
        className="w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center flex-shrink-0 transition-all"
        title={isPlaying ? 'Pause Preview' : 'Play Preview'}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
      </button>

      {/* Stop Button */}
      <button
        onClick={stopPlayback}
        className="p-1 text-gray-400 hover:text-gray-200 rounded"
        title="Stop Preview"
      >
        <Square className="w-3.5 h-3.5" />
      </button>

      {/* Seek Progress Slider */}
      <div className="flex-1 flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-[#1e2330] rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <span className="text-[10px] font-mono text-gray-400 flex-shrink-0">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      <Volume2 className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
    </div>
  );
};
