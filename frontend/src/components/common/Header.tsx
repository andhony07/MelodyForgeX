import React from 'react';
import { Music, Sliders, FolderKanban } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const location = useLocation();

  const navItemClass = (path: string) =>
    `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
      location.pathname === path
        ? 'bg-[#202430] text-[#6366f1] border border-[#2e3444]'
        : 'text-gray-400 hover:text-gray-200 hover:bg-[#181b24]'
    }`;

  return (
    <header className="h-14 bg-[#181b24] border-b border-[#2e3444] px-4 flex items-center justify-between select-none">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 text.indigo-400 font-bold text-lg tracking-wide hover:opacity-90">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Music className="w-5 h-5" />
          </div>
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent font-extrabold">
            MelodyForge
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link to="/" className={navItemClass('/')}>
            Dashboard
          </Link>
          <Link to="/projects" className={navItemClass('/projects')}>
            <FolderKanban className="w-4 h-4" />
            Projects
          </Link>
          <Link to="/studio" className={navItemClass('/studio')}>
            <Sliders className="w-4 h-4" />
            Studio
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="px-2.5 py-1 rounded bg-[#0f1117] border border-[#2e3444] font-mono">
          Phase 1 Foundation
        </span>
      </div>
    </header>
  );
};
