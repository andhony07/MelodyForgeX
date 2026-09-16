import React from 'react';
import { useProjectStore } from '../stores/useProjectStore';
import { Play, Square, Mic, Volume2, Plus, Sliders, Layers } from 'lucide-react';

export const StudioPage: React.FC = () => {
  const activeProject = useProjectStore((state) => state.activeProject);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Transport Header Placeholder */}
      <div className="bg-[#181b24] border border-[#2e3444] rounded-xl p-3 flex flex-wrap items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#0f1117] p-1.5 rounded-lg border border-[#2e3444]">
            <button
              disabled
              className="p-1.5 rounded hover:bg-[#202430] text-gray-500 cursor-not-allowed"
              title="Play (Phase 2+)"
            >
              <Play className="w-4 h-4" />
            </button>
            <button
              disabled
              className="p-1.5 rounded hover:bg-[#202430] text-gray-500 cursor-not-allowed"
              title="Stop (Phase 2+)"
            >
              <Square className="w-4 h-4" />
            </button>
            <button
              disabled
              className="p-1.5 rounded hover:bg-[#202430] text-rose-500/50 cursor-not-allowed"
              title="Record (Phase 2+)"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          <div className="h-6 w-[1px] bg-[#2e3444]" />

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase">Project</span>
              <span className="font-semibold text-indigo-400">
                {activeProject ? activeProject.name : 'Untitled Project'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase">Tempo</span>
              <span className="text-gray-200">
                {activeProject ? activeProject.tempo : 120} BPM
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase">Key</span>
              <span className="text-gray-200">
                {activeProject ? activeProject.key : 'C'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase">Time Sig</span>
              <span className="text-gray-200">
                {activeProject ? activeProject.time_signature : '4/4'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-1.5 bg-[#0f1117] px-3 py-1.5 rounded-lg border border-[#2e3444]">
            <Volume2 className="w-4 h-4 text-gray-400" />
            <span>0.0 dB</span>
          </div>
          <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-md text-[11px] font-mono">
            Phase 1 Studio Shell
          </span>
        </div>
      </div>

      {/* Main Composition Workspace Shell */}
      <div className="flex-1 bg-[#181b24] border border-[#2e3444] rounded-xl flex flex-col overflow-hidden">
        {/* Workspace Banner */}
        <div className="p-4 border-b border-[#2e3444] bg-[#202430]/40 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              Music Studio
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Your composition workspace will appear here.
            </p>
          </div>
          <button
            disabled
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f1117] text-gray-400 border border-[#2e3444] rounded-lg text-xs font-medium cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Track (Phase 2)
          </button>
        </div>

        {/* Tracks & Timeline Layout Shell */}
        <div className="flex-1 flex overflow-hidden">
          {/* Tracks Headers Panel Placeholder */}
          <div className="w-64 border-r border-[#2e3444] bg-[#12141c] p-3 space-y-2 select-none">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Tracks (Placeholder)
            </div>

            <div className="p-3 bg-[#181b24] border border-[#2e3444] rounded-lg space-y-2 opacity-60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-400">Track 1: Piano Synth</span>
                <span className="text-[10px] text-gray-400 font-mono">Ch 1</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <span className="px-1.5 py-0.5 bg-[#0f1117] rounded border border-[#2e3444]">M</span>
                <span className="px-1.5 py-0.5 bg-[#0f1117] rounded border border-[#2e3444]">S</span>
                <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-400 rounded">R</span>
              </div>
            </div>

            <div className="p-3 bg-[#181b24] border border-[#2e3444] rounded-lg space-y-2 opacity-60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-400">Track 2: Bassline</span>
                <span className="text-[10px] text-gray-400 font-mono">Ch 2</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <span className="px-1.5 py-0.5 bg-[#0f1117] rounded border border-[#2e3444]">M</span>
                <span className="px-1.5 py-0.5 bg-[#0f1117] rounded border border-[#2e3444]">S</span>
                <span className="px-1.5 py-0.5 bg-[#0f1117] rounded border border-[#2e3444]">R</span>
              </div>
            </div>
          </div>

          {/* Timeline Grid Placeholder */}
          <div className="flex-1 bg-[#0f1117] relative flex flex-col justify-between p-6">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#181b24_1px,transparent_1px),linear-gradient(to_bottom,#181b24_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 pointer-events-none" />

            <div className="relative z-10 text-center max-w-md mx-auto my-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-200">Timeline & Arranger Workspace</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                The interactive piano roll, note editor, instrument routing, audio playback engine, and AI composition tools will be implemented in upcoming phases.
              </p>
              <div className="inline-block px-3 py-1.5 bg-[#181b24] border border-[#2e3444] rounded-lg text-xs text-indigo-400 font-mono">
                Phase 1 Shell Active
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
