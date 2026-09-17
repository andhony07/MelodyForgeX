import React, { useState } from 'react';
import { useMixerStore } from '../stores/useMixerStore';
import { MixerPresetManager } from '../presets/MixerPresetManager';

export const MixerPresetPanel: React.FC = () => {
  const { applyPreset, saveCurrentAsPreset, activePresetId, setPresetDialogOpen } = useMixerStore();
  const presets = MixerPresetManager.getInstance().getAllPresets();

  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    saveCurrentAsPreset(newPresetName.trim(), newPresetDesc.trim());
    setNewPresetName('');
    setNewPresetDesc('');
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden text-slate-100 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Mix Presets</h3>
              <p className="text-xs text-slate-400">Choose a built-in mix configuration or save your custom mix</p>
            </div>
          </div>
          <button
            onClick={() => setPresetDialogOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {isSaving ? (
            <form onSubmit={handleSave} className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
              <h4 className="font-semibold text-sm text-indigo-400">Save Current Mix Preset</h4>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Preset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Epic Rock Mix"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Heavy bass compression with hall reverb send"
                  value={newPresetDesc}
                  onChange={(e) => setNewPresetDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaving(false)}
                  className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium"
                >
                  Save Preset
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsSaving(true)}
              className="w-full py-2.5 px-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <span>+ Save Current Mix as Custom Preset</span>
            </button>
          )}

          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Presets</h4>
            {presets.map((p) => (
              <div
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  activePresetId === p.id
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                    : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{p.name}</span>
                    {p.isBuiltIn ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
                        Built-In
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{p.description}</p>
                </div>
                {activePresetId === p.id && (
                  <span className="text-indigo-400 text-sm font-bold">ACTIVE</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
