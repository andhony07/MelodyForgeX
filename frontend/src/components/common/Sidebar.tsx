import React from 'react';
import { LayoutDashboard, FolderKanban, Sliders, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Studio Shell', path: '/studio', icon: Sliders },
  ];

  return (
    <aside className="w-56 bg-[#181b24] border-r border-[#2e3444] flex flex-col justify-between select-none">
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#202430]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-[#2e3444]">
        <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 rounded-md hover:bg-[#202430] cursor-not-allowed">
          <Settings className="w-4 h-4 text-gray-400" />
          Settings (Phase 1)
        </div>
      </div>
    </aside>
  );
};
