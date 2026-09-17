import React, { useState } from 'react';
import { Sliders, RotateCcw, Save, Trash2, Music } from 'lucide-react';
import { useStudioStore } from '../stores/useStudioStore';
import { useInstrumentStore } from '../../audio/stores/useInstrumentStore';
import { InstrumentPreset } from '../../audio/types/instrument';

export const InstrumentControlPanel: React.FC = () => {
  const { tracks, selectedTrackId, setTrackInstrument, setTrackPreset, setTrackParameter } = useStudioStore();
  const { instruments, getPresetsForInstrument, saveCustomPreset, deleteCustomPreset } = useInstrumentStore();

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId);

  if (!selectedTrack) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-4 text-center text-slate-400 text-sm">
        <Music className="w-6 h-6 mx-auto mb-2 opacity-50" />
        Select a track to customize instrument & sound presets
      </div>
    );
  }

  const currentInstrumentId = selectedTrack.instrument || 'acoustic-piano';
  const availablePresets = getPresetsForInstrument(currentInstrumentId);
  const currentPresetId = selectedTrack.presetId || (availablePresets[0]?.id ?? '');

  const params = selectedTrack.customParameters || {};

  const handleInstrumentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newInstId = e.target.value;
    setTrackInstrument(selectedTrack.id, newInstId);
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPresetId = e.target.value;
    setTrackPreset(selectedTrack.id, newPresetId);
  };

  const handleParamChange = (paramName: string, val: number) => {
    setTrackParameter(selectedTrack.id, paramName, val);
  };

  const handleReset = () => {
    if (currentPresetId) {
      setTrackPreset(selectedTrack.id, currentPresetId);
    }
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) return;

    const selectedInstMeta = instruments.find((i) => i.id === currentInstrumentId);

    const customPreset: InstrumentPreset = {
      id: `custom-${Date.now()}`,
      name: newPresetName.trim(),
      instrumentId: currentInstrumentId,
      category: selectedInstMeta ? selectedInstMeta.category : 'Synth',
      isBuiltIn: false,
      version: 1,
      parameters: { ...params },
    };

    const success = saveCustomPreset(customPreset);
    if (success) {
      setTrackPreset(selectedTrack.id, customPreset.id);
      setNewPresetName('');
      setSaveModalOpen(false);
    }
  };

  const handleDeletePreset = () => {
    if (!currentPresetId || currentPresetId.indexOf('custom-') === -1) return;
    deleteCustomPreset(currentPresetId);
    // Fall back to built-in default
    if (availablePresets.length > 0) {
      setTrackPreset(selectedTrack.id, availablePresets[0].id);
    }
  };

  const isCustomPreset = currentPresetId.startsWith('custom-');

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-4 shadow-xl text-slate-200 text-xs">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-100 text-sm">Instrument Control Panel</span>
          <span className="text-slate-400 text-xs font-mono">({selectedTrack.name})</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
            title="Reset to Preset Defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={() => setSaveModalOpen(true)}
            className="flex items-center space-x-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium transition"
            title="Save Custom Preset"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preset</span>
          </button>
          {isCustomPreset && (
            <button
              onClick={handleDeletePreset}
              className="p-1 bg-rose-900/50 hover:bg-rose-800/80 text-rose-300 rounded border border-rose-700/50 transition"
              title="Delete Custom Preset"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Selectors Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-slate-400 mb-1 font-medium">Instrument</label>
          <select
            value={currentInstrumentId}
            onChange={handleInstrumentChange}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            {instruments.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name} ({inst.category})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-400 mb-1 font-medium">Preset</label>
          <select
            value={currentPresetId}
            onChange={handlePresetChange}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            {availablePresets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name} {preset.isBuiltIn ? '' : '(Custom)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Parameter Sliders */}
      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800/60">
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Attack</span>
            <span className="font-mono text-indigo-400">{(params.attack ?? 0.01).toFixed(3)}s</span>
          </div>
          <input
            type="range"
            min="0.001"
            max="2.0"
            step="0.005"
            value={params.attack ?? 0.01}
            onChange={(e) => handleParamChange('attack', parseFloat(e.target.value))}
            className="w-full accent-indigo-500 h-1 bg-slate-800 rounded"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Release</span>
            <span className="font-mono text-indigo-400">{(params.release ?? 0.5).toFixed(2)}s</span>
          </div>
          <input
            type="range"
            min="0.01"
            max="3.0"
            step="0.01"
            value={params.release ?? 0.5}
            onChange={(e) => handleParamChange('release', parseFloat(e.target.value))}
            className="w-full accent-indigo-500 h-1 bg-slate-800 rounded"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Filter Cutoff</span>
            <span className="font-mono text-indigo-400">{Math.round(params.cutoff ?? 5000)}Hz</span>
          </div>
          <input
            type="range"
            min="100"
            max="15000"
            step="50"
            value={params.cutoff ?? 5000}
            onChange={(e) => handleParamChange('cutoff', parseFloat(e.target.value))}
            className="w-full accent-indigo-500 h-1 bg-slate-800 rounded"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Resonance</span>
            <span className="font-mono text-indigo-400">{(params.resonance ?? 1.0).toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="10.0"
            step="0.1"
            value={params.resonance ?? 1.0}
            onChange={(e) => handleParamChange('resonance', parseFloat(e.target.value))}
            className="w-full accent-indigo-500 h-1 bg-slate-800 rounded"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Brightness</span>
            <span className="font-mono text-indigo-400">{(params.brightness ?? 0.5).toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={params.brightness ?? 0.5}
            onChange={(e) => handleParamChange('brightness', parseFloat(e.target.value))}
            className="w-full accent-indigo-500 h-1 bg-slate-800 rounded"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Sustain</span>
            <span className="font-mono text-indigo-400">{(params.sustain ?? 0.5).toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={params.sustain ?? 0.5}
            onChange={(e) => handleParamChange('sustain', parseFloat(e.target.value))}
            className="w-full accent-indigo-500 h-1 bg-slate-800 rounded"
          />
        </div>
      </div>

      {/* Save Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 max-w-sm w-full shadow-2xl">
            <h3 className="font-semibold text-slate-100 text-sm mb-3">Save Custom Preset</h3>
            <input
              type="text"
              placeholder="Preset Name (e.g. My Warm Piano)"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 text-xs mb-4 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSaveModalOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreset}
                disabled={!newPresetName.trim()}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded text-xs font-medium transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
