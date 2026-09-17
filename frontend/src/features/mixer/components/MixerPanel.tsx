import React, { useEffect } from 'react';
import { useMixerStore } from '../stores/useMixerStore';
import { useStudioStore } from '../../editor/stores/useStudioStore';
import { MixerChannel } from './MixerChannel';
import { MasterChannel } from './MasterChannel';
import { EffectRack } from './EffectRack';
import { MixerPresetPanel } from './MixerPresetPanel';

export const MixerPanel: React.FC = () => {
  const tracks = useStudioStore((s) => s.tracks);
  const {
    channels,
    master,
    returnBuses,
    syncWithStudioTracks,
    setChannelVolume,
    setChannelPan,
    setChannelMute,
    setChannelSolo,
    setChannelSendLevel,
    setMasterVolume,
    setMasterPan,
    setMasterMute,
    setReturnBusLevel,
    setReturnBusMute,
    setSelectedChannelId,
    setEffectRackOpen,
    setPresetDialogOpen,
    isEffectRackOpen,
    isPresetDialogOpen,
  } = useMixerStore();

  useEffect(() => {
    syncWithStudioTracks(tracks);
  }, [tracks, syncWithStudioTracks]);

  const handleOpenInserts = (trackId: string | null) => {
    setSelectedChannelId(trackId);
    setEffectRackOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border-t border-slate-800 text-slate-100 select-none overflow-hidden">
      {/* Mixer Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-medium">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span className="font-semibold text-slate-200">Studio Console</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 font-mono text-[11px]">{tracks.length} Channels</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPresetDialogOpen(true)}
            className="px-3 py-1 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded border border-slate-700/60 transition-colors text-xs flex items-center gap-1.5"
          >
            <span>Mix Presets</span>
          </button>
        </div>
      </div>

      {/* Main Console Horizontal Scroll Area */}
      <div className="flex-1 overflow-x-auto p-4 flex gap-4 items-stretch bg-slate-950/60">
        {/* Track Channel Strips */}
        {tracks.map((track) => {
          const channel = channels[track.id] || {
            trackId: track.id,
            volumeDb: 0,
            pan: 0,
            muted: track.muted,
            solo: track.solo,
            inserts: [],
            sends: [
              { busType: 'reverb', levelDb: -12, enabled: true },
              { busType: 'delay', levelDb: -60, enabled: false },
            ],
          };

          return (
            <MixerChannel
              key={track.id}
              track={track}
              channel={channel}
              onVolumeChange={(vol) => setChannelVolume(track.id, vol)}
              onPanChange={(pan) => setChannelPan(track.id, pan)}
              onMuteToggle={(muted) => setChannelMute(track.id, muted)}
              onSoloToggle={(solo) => setChannelSolo(track.id, solo)}
              onSendLevelChange={(busType, level) => setChannelSendLevel(track.id, busType, level)}
              onOpenInserts={() => handleOpenInserts(track.id)}
            />
          );
        })}

        {/* Separator */}
        <div className="w-[1px] bg-slate-800 my-2 flex-shrink-0" />

        {/* Shared Return Bus Strips */}
        {returnBuses.map((bus) => (
          <div
            key={bus.busType}
            className="flex flex-col w-28 bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex-shrink-0 shadow-md text-slate-100"
          >
            <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-slate-800">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="font-semibold text-[11px] truncate text-cyan-300 uppercase">
                {bus.name}
              </span>
            </div>

            <button
              onClick={() => onReturnBusMuteToggle(bus.busType, !bus.muted)}
              className={`mb-3 py-1 text-xs font-bold rounded border transition-colors ${
                bus.muted
                  ? 'bg-rose-500/30 text-rose-400 border-rose-500/50'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700/60'
              }`}
            >
              M
            </button>

            <div className="flex-1 flex flex-col justify-end gap-2 items-center bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
              <input
                type="range"
                min={-60}
                max={6}
                step={0.5}
                value={bus.returnLevelDb}
                onChange={(e) => setReturnBusLevel(bus.busType, parseFloat(e.target.value))}
                className="h-[120px] accent-cyan-400 bg-slate-800 rounded appearance-none cursor-pointer [writing-mode:vertical-lr] [direction:rtl]"
              />
            </div>
            <div className="mt-2 text-center font-mono text-[10px] text-slate-400">
              {bus.returnLevelDb <= -58 ? '-∞ dB' : `${bus.returnLevelDb.toFixed(1)} dB`}
            </div>
          </div>
        ))}

        {/* Separator */}
        <div className="w-[1px] bg-indigo-500/20 my-2 flex-shrink-0" />

        {/* Master Channel Strip */}
        <MasterChannel
          master={master}
          onVolumeChange={setMasterVolume}
          onPanChange={setMasterPan}
          onMuteToggle={setMasterMute}
          onOpenInserts={() => handleOpenInserts(null)}
        />
      </div>

      {/* Modals */}
      {isEffectRackOpen && <EffectRack />}
      {isPresetDialogOpen && <MixerPresetPanel />}
    </div>
  );

  function onReturnBusMuteToggle(busType: 'reverb' | 'delay', muted: boolean) {
    setReturnBusMute(busType, muted);
  }
};
