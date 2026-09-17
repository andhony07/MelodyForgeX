import React from 'react';
import { ProjectStats } from '../types/productionTypes';
import { Activity, Clock, Music, Sliders, Layers } from 'lucide-react';

interface Props {
  stats: ProjectStats;
  usedAI: boolean;
}

export const ProductionSummary: React.FC<Props> = ({ stats, usedAI }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          Project Overview
        </h3>
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
            usedAI ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          {usedAI ? 'AI Production Model Active' : 'Deterministic Analysis Mode'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <div>
            <div className="text-slate-400">Tempo / Key</div>
            <div className="font-mono font-medium text-slate-200">
              {stats.tempo} BPM ({stats.key} {stats.mode})
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400" />
          <div>
            <div className="text-slate-400">Tracks / Sections</div>
            <div className="font-mono font-medium text-slate-200">
              {stats.trackCount} Tracks, {stats.sectionCount} Sec
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 flex items-center gap-2">
          <Music className="w-4 h-4 text-slate-400" />
          <div>
            <div className="text-slate-400">Duration / Bars</div>
            <div className="font-mono font-medium text-slate-200">
              {stats.durationSeconds}s ({stats.totalBars} Bars)
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-slate-400" />
          <div>
            <div className="text-slate-400">Total Notes</div>
            <div className="font-mono font-medium text-slate-200">{stats.noteCount} Notes</div>
          </div>
        </div>
      </div>
    </div>
  );
};
