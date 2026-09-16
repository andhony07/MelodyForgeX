import React, { useEffect, useState } from 'react';
import { useProjectStore } from '../stores/useProjectStore';
import { Plus, Sliders, FolderKanban, Clock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CreateProjectModal } from '../features/projects/CreateProjectModal';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, fetchProjects, loading } = useProjectStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-[#181b24] border border-[#2e3444] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>AI Composition & Arrangement Studio</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-100 tracking-tight mb-2">
          Welcome to MelodyForge
        </h1>
        <p className="text-gray-400 text-sm max-w-2xl">
          Manage your music projects, configure instrument tracks, and arrange multi-track compositions with AI assistance.
        </p>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
          <button
            onClick={() => navigate('/studio')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#202430] hover:bg-[#282e3d] text-gray-200 border border-[#2e3444] rounded-xl text-sm font-semibold transition-all"
          >
            <Sliders className="w-4 h-4 text-indigo-400" />
            Open Studio
          </button>
        </div>
      </div>

      {/* Real Statistics Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#181b24] border border-[#2e3444] rounded-xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Projects
            </span>
            <div className="text-3xl font-extrabold text-gray-100 mt-1">
              {loading ? '...' : projects.length}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#181b24] border border-[#2e3444] rounded-xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Active Studio Session
            </span>
            <div className="text-sm font-medium text-gray-300 mt-1">
              Phase 1 Architecture Ready
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sliders className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recently Updated */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            Recently Updated
          </h2>
          <button
            onClick={() => navigate('/projects')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            View All Projects ({projects.length}) →
          </button>
        </div>

        {recentProjects.length === 0 ? (
          <div className="bg-[#181b24] border border-[#2e3444] rounded-xl p-8 text-center space-y-3">
            <FolderKanban className="w-10 h-10 text-gray-500 mx-auto" />
            <p className="text-sm text-gray-400">No projects found. Create your first project to get started!</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate('/projects')}
                className="bg-[#181b24] border border-[#2e3444] hover:border-indigo-500/50 rounded-xl p-4 transition-all cursor-pointer group"
              >
                <h3 className="font-semibold text-gray-200 group-hover:text-indigo-400 transition-colors">
                  {project.name}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-1 mt-1">
                  {project.description || 'No description'}
                </p>
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-400 font-mono">
                  <span>{project.tempo} BPM</span>
                  <span>•</span>
                  <span>{project.key}</span>
                  <span>•</span>
                  <span>{project.time_signature}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
