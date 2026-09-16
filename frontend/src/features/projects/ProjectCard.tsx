import React from 'react';
import { Project } from '../../types/project';
import { Music, Clock, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../../stores/useProjectStore';

interface ProjectCardProps {
  project: Project;
  onDeleteRequest: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDeleteRequest }) => {
  const navigate = useNavigate();
  const setActiveProject = useProjectStore((state) => state.setActiveProject);

  const formattedDate = new Date(project.updated_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleOpenStudio = () => {
    setActiveProject(project);
    navigate('/studio');
  };

  return (
    <div className="bg-[#181b24] border border-[#2e3444] hover:border-indigo-500/50 rounded-xl p-5 flex flex-col justify-between transition-all group shadow-sm hover:shadow-indigo-500/5">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-100 group-hover:text-indigo-300 transition-colors">
                {project.name}
              </h3>
              <p className="text-xs text-gray-400 line-clamp-1">
                {project.description || 'No description provided'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onDeleteRequest(project)}
            className="text-gray-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
            title="Delete project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 my-4 p-2.5 rounded-lg bg-[#0f1117] border border-[#2e3444] text-center text-xs">
          <div>
            <span className="block text-[10px] uppercase text-gray-400 font-semibold">Tempo</span>
            <span className="font-mono font-medium text-gray-200">{project.tempo} BPM</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-gray-400 font-semibold">Key</span>
            <span className="font-mono font-medium text-gray-200">{project.key}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-gray-400 font-semibold">Signature</span>
            <span className="font-mono font-medium text-gray-200">{project.time_signature}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#2e3444] text-xs">
        <div className="flex items-center gap-1.5 text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{formattedDate}</span>
        </div>
        <button
          onClick={handleOpenStudio}
          className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          <span>Open Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
