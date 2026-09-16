import React from 'react';
import { Sliders, FolderKanban, Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProjectStore } from '../../../stores/useProjectStore';
import { useStudioStore } from '../stores/useStudioStore';

export const StudioHeader: React.FC = () => {
  const activeProject = useProjectStore((state) => state.activeProject);
  const { tempo, key, mode, timeSignature } = useStudioStore();

  return (
    <header className="h-12 bg-[#181b24] border-b border-[#2e3444] px-4 flex items-center justify-between select-none text-xs">
      <div className="flex items-center gap-4">
        <Link to="/projects" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-200 transition-colors">
          <FolderKanban className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold">Projects</span>
        </Link>
        <span className="text-gray-600">/</span>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Music className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-gray-100 text-sm tracking-tight">
            {activeProject ? activeProject.name : 'Untitled Song'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-5 text-gray-300 font-mono">
        <div className="flex items-center gap-3 bg-[#0f1117] px-3 py-1 rounded-lg border border-[#2e3444]">
          <span className="text-gray-500">TEMPO:</span>
          <span className="text-indigo-400 font-bold">{tempo} BPM</span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-500">KEY:</span>
          <span className="text-cyan-400 font-bold">{key} {mode}</span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-500">SIG:</span>
          <span className="text-emerald-400 font-bold">{timeSignature}</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-md font-mono text-[11px]">
          <Sliders className="w-3.5 h-3.5" />
          <span>Phase 2 DAW Studio</span>
        </div>
      </div>
    </header>
  );
};
