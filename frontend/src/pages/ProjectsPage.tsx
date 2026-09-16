import React, { useEffect, useState } from 'react';
import { useProjectStore } from '../stores/useProjectStore';
import { ProjectCard } from '../features/projects/ProjectCard';
import { CreateProjectModal } from '../features/projects/CreateProjectModal';
import { DeleteProjectModal } from '../features/projects/DeleteProjectModal';
import { Project } from '../types/project';
import { Plus, FolderKanban, AlertCircle, RefreshCw } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { projects, fetchProjects, loading, error } = useProjectStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2e3444] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-100 tracking-tight flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-indigo-400" />
            Projects
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your music composition workspace files
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchProjects()}
            disabled={loading}
            className="p-2.5 bg-[#181b24] hover:bg-[#202430] border border-[#2e3444] text-gray-400 hover:text-gray-200 rounded-xl transition-colors"
            title="Refresh projects"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-semibold">Error: </span>
            {error}
          </div>
          <button
            onClick={() => fetchProjects()}
            className="text-xs font-semibold underline hover:text-rose-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && projects.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 bg-[#181b24] border border-[#2e3444] rounded-xl animate-pulse p-5"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && projects.length === 0 && (
        <div className="bg-[#181b24] border border-[#2e3444] rounded-xl p-12 text-center max-w-md mx-auto my-12 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            <FolderKanban className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-100">No projects yet</h3>
            <p className="text-sm text-gray-400 mt-1">
              Create your first MelodyForge music project to start composing.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDeleteRequest={(p) => setProjectToDelete(p)}
            />
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <DeleteProjectModal
        isOpen={!!projectToDelete}
        project={projectToDelete}
        onClose={() => setProjectToDelete(null)}
      />
    </div>
  );
};
