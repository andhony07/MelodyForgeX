import React from 'react';
import { useMixerStore } from '../stores/useMixerStore';
import { useStudioStore } from '../../editor/stores/useStudioStore';
import {
  EffectConfig,
  EffectType,
  GainParameters,
  FilterParameters,
  EqualizerParameters,
  CompressorParameters,
  ReverbParameters,
  DelayParameters,
} from '../types/effect';

export const EffectRack: React.FC = () => {
  const {
    selectedChannelId,
    channels,
    master,
    addChannelInsert,
    updateChannelInsertParams,
    toggleChannelInsertBypass,
    removeChannelInsert,
    reorderChannelInserts,
    addMasterInsert,
    updateMasterInsertParams,
    toggleMasterInsertBypass,
    removeMasterInsert,
    setEffectRackOpen,
  } = useMixerStore();

  const studioTracks = useStudioStore((s) => s.tracks);

  const isMaster = selectedChannelId === null;
  const currentTrack = isMaster ? null : studioTracks.find((t) => t.id === selectedChannelId);
  const currentChannel = isMaster ? null : channels[selectedChannelId || ''];
  const inserts: EffectConfig[] = isMaster ? master.inserts : currentChannel?.inserts || [];
  const channelTitle = isMaster ? 'Master Bus Inserts' : `${currentTrack?.name || 'Track'} Inserts`;

  const handleAddEffect = (type: EffectType) => {
    if (isMaster) {
      addMasterInsert(type);
    } else if (selectedChannelId) {
      addChannelInsert(selectedChannelId, type);
    }
  };

  const handleParamChange = (insertId: string, paramKey: string, value: number | string) => {
    const targetConfig = inserts.find((i) => i.id === insertId);
    if (!targetConfig) return;

    const newParams = { ...targetConfig.parameters, [paramKey]: value };

    if (isMaster) {
      updateMasterInsertParams(insertId, newParams);
    } else if (selectedChannelId) {
      updateChannelInsertParams(selectedChannelId, insertId, newParams);
    }
  };

  const handleToggleBypass = (insertId: string) => {
    if (isMaster) {
      toggleMasterInsertBypass(insertId);
    } else if (selectedChannelId) {
      toggleChannelInsertBypass(selectedChannelId, insertId);
    }
  };

  const handleRemove = (insertId: string) => {
    if (isMaster) {
      removeMasterInsert(insertId);
    } else if (selectedChannelId) {
      removeChannelInsert(selectedChannelId, insertId);
    }
  };

  const handleMoveUp = (index: number) => {
    if (!isMaster && selectedChannelId && index > 0) {
      reorderChannelInserts(selectedChannelId, index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (!isMaster && selectedChannelId && index < inserts.length - 1) {
      reorderChannelInserts(selectedChannelId, index, index + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{channelTitle}</h3>
              <p className="text-xs text-slate-400">Configure processing inserts and parameters</p>
            </div>
          </div>
          <button
            onClick={() => setEffectRackOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Add Effect Bar */}
        <div className="px-5 py-3 bg-slate-950/30 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-slate-400 font-medium mr-1">Add Effect:</span>
          {(['gain', 'filter', 'eq', 'compressor', 'reverb', 'delay'] as EffectType[]).map((type) => (
            <button
              key={type}
              onClick={() => handleAddEffect(type)}
              className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded border border-slate-700/60 transition-colors uppercase"
            >
              + {type}
            </button>
          ))}
        </div>

        {/* Inserts List */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {inserts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
              No insert effects in chain. Click an effect above to add one.
            </div>
          ) : (
            inserts.map((ins, idx) => (
              <div
                key={ins.id}
                className={`p-4 rounded-xl border transition-all ${
                  ins.bypassed
                    ? 'bg-slate-950/40 border-slate-800/80 opacity-60'
                    : 'bg-slate-800/60 border-indigo-500/30 shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/40 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-indigo-400 font-semibold">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-sm capitalize">{ins.type} Processor</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!isMaster && (
                      <>
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveUp(idx)}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                          title="Move Up"
                        >
                          ▲
                        </button>
                        <button
                          disabled={idx === inserts.length - 1}
                          onClick={() => handleMoveDown(idx)}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                          title="Move Down"
                        >
                          ▼
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleToggleBypass(ins.id)}
                      className={`px-2 py-0.5 text-xs rounded font-semibold transition-colors ${
                        ins.bypassed
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {ins.bypassed ? 'BYPASSED' : 'ACTIVE'}
                    </button>
                    <button
                      onClick={() => handleRemove(ins.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-700/50"
                      title="Remove Effect"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Parameter Editors per Effect Type */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  {ins.type === 'gain' && (
                    <div className="col-span-2 space-y-1">
                      <div className="flex justify-between text-slate-300">
                        <span>Gain (dB)</span>
                        <span className="font-mono">{((ins.parameters as GainParameters).gainDb ?? 0).toFixed(1)} dB</span>
                      </div>
                      <input
                        type="range"
                        min={-60}
                        max={12}
                        step={0.5}
                        value={(ins.parameters as GainParameters).gainDb ?? 0}
                        onChange={(e) => handleParamChange(ins.id, 'gainDb', parseFloat(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                  )}

                  {ins.type === 'filter' && (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-300">
                          <span>Cutoff (Hz)</span>
                          <span className="font-mono">{(ins.parameters as FilterParameters).frequency ?? 1000} Hz</span>
                        </div>
                        <input
                          type="range"
                          min={20}
                          max={20000}
                          step={50}
                          value={(ins.parameters as FilterParameters).frequency ?? 1000}
                          onChange={(e) => handleParamChange(ins.id, 'frequency', parseFloat(e.target.value))}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-300">
                          <span>Resonance (Q)</span>
                          <span className="font-mono">{((ins.parameters as FilterParameters).Q ?? 1).toFixed(1)}</span>
                        </div>
                        <input
                          type="range"
                          min={0.1}
                          max={20}
                          step={0.1}
                          value={(ins.parameters as FilterParameters).Q ?? 1}
                          onChange={(e) => handleParamChange(ins.id, 'Q', parseFloat(e.target.value))}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                    </>
                  )}

                  {ins.type === 'eq' && (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-300">
                          <span>Low Gain (dB)</span>
                          <span className="font-mono">{((ins.parameters as EqualizerParameters).lowGainDb ?? 0).toFixed(1)}</span>
                        </div>
                        <input
                          type="range"
                          min={-24}
                          max={24}
                          step={0.5}
                          value={(ins.parameters as EqualizerParameters).lowGainDb ?? 0}
                          onChange={(e) => handleParamChange(ins.id, 'lowGainDb', parseFloat(e.target.value))}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-300">
                          <span>Mid Gain (dB)</span>
                          <span className="font-mono">{((ins.parameters as EqualizerParameters).midGainDb ?? 0).toFixed(1)}</span>
                        </div>
                        <input
                          type="range"
                          min={-24}
                          max={24}
                          step={0.5}
                          value={(ins.parameters as EqualizerParameters).midGainDb ?? 0}
                          onChange={(e) => handleParamChange(ins.id, 'midGainDb', parseFloat(e.target.value))}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <div className="flex justify-between text-slate-300">
                          <span>High Gain (dB)</span>
                          <span className="font-mono">{((ins.parameters as EqualizerParameters).highGainDb ?? 0).toFixed(1)}</span>
                        </div>
                        <input
                          type="range"
                          min={-24}
                          max={24}
                          step={0.5}
                          value={(ins.parameters as EqualizerParameters).highGainDb ?? 0}
                          onChange={(e) => handleParamChange(ins.id, 'highGainDb', parseFloat(e.target.value))}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                    </>
                  )}

                  {ins.type === 'compressor' && (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-300">
                          <span>Threshold (dB)</span>
                          <span className="font-mono">{((ins.parameters as CompressorParameters).thresholdDb ?? -20).toFixed(1)}</span>
                        </div>
                        <input
                          type="range"
                          min={-60}
                          max={0}
                          step={1}
                          value={(ins.parameters as CompressorParameters).thresholdDb ?? -20}
                          onChange={(e) => handleParamChange(ins.id, 'thresholdDb', parseFloat(e.target.value))}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-300">
                          <span>Ratio</span>
                          <span className="font-mono">{((ins.parameters as CompressorParameters).ratio ?? 4).toFixed(1)}:1</span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={20}
                          step={0.5}
                          value={(ins.parameters as CompressorParameters).ratio ?? 4}
                          onChange={(e) => handleParamChange(ins.id, 'ratio', parseFloat(e.target.value))}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                    </>
                  )}

                  {ins.type === 'reverb' && (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-300">
                          <span>Decay (s)</span>
                          <span className="font-mono">{((ins.parameters as ReverbParameters).decaySeconds ?? 2).toFixed(1)}s</span>
                        </div>
                        <input
                          type="range"
                          min={0.1}
                          max={20}
                          step={0.1}
                          value={(ins.parameters as ReverbParameters).decaySeconds ?? 2}
                          onChange={(e) => handleParamChange(ins.id, 'decaySeconds', parseFloat(e.target.value))}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-300">
                          <span>Wet</span>
                          <span className="font-mono">{Math.round(((ins.parameters as ReverbParameters).wet ?? 0.3) * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={(ins.parameters as ReverbParameters).wet ?? 0.3}
                          onChange={(e) => handleParamChange(ins.id, 'wet', parseFloat(e.target.value))}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                    </>
                  )}

                  {ins.type === 'delay' && (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-300">
                          <span>Delay Time (s)</span>
                          <span className="font-mono">{((ins.parameters as DelayParameters).delayTimeSeconds ?? 0.25).toFixed(2)}s</span>
                        </div>
                        <input
                          type="range"
                          min={0.01}
                          max={2}
                          step={0.01}
                          value={(ins.parameters as DelayParameters).delayTimeSeconds ?? 0.25}
                          onChange={(e) => handleParamChange(ins.id, 'delayTimeSeconds', parseFloat(e.target.value))}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-300">
                          <span>Feedback</span>
                          <span className="font-mono">{Math.round(((ins.parameters as DelayParameters).feedback ?? 0.3) * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={0.95}
                          step={0.05}
                          value={(ins.parameters as DelayParameters).feedback ?? 0.3}
                          onChange={(e) => handleParamChange(ins.id, 'feedback', parseFloat(e.target.value))}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
