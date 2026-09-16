import React from 'react';
import { useProjectStore } from '../../stores/useProjectStore';

export const Footer: React.FC = () => {
  const apiConnected = useProjectStore((state) => state.apiConnected);

  return (
    <footer className="h-8 bg-[#181b24] border-t border-[#2e3444] px-4 flex items-center justify-between text-xs text-gray-400 select-none">
      <div className="flex items-center gap-2">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            apiConnected ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-rose-500 shadow-sm shadow-rose-500/50'
          }`}
        />
        <span className="font-medium">
          API Status: {apiConnected ? 'API Connected' : 'API Offline'}
        </span>
      </div>
      <div className="flex items-center gap-4 text-[11px] text-gray-400 font-mono">
        <span>MelodyForge Studio v1.0</span>
        <span>|</span>
        <span>FastAPI + React</span>
      </div>
    </footer>
  );
};
