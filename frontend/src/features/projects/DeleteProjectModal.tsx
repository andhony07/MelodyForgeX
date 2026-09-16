import React from 'react';
import { Modal } from '../../components/common/Modal';
import { Project } from '../../types/project';
import { useProjectStore } from '../../stores/useProjectStore';

interface DeleteProjectModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
}

export const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  isOpen,
  project,
  onClose,
}) => {
  const deleteProject = useProjectStore((state) => state.deleteProject);
  const loading = useProjectStore((state) => state.loading);

  if (!project) return null;

  const handleDelete = async () => {
    try {
      await deleteProject(project.id);
      onClose();
    } catch {
      // Error handled in store
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Project">
      <div className="space-y-4">
        <p className="text-sm text-gray-300">
          Are you sure you want to delete <span className="font-semibold text-gray-100">"{project.name}"</span>?
        </p>
        <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
          This action cannot be undone. All arrangement data for this project will be permanently removed.
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2e3444]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-rose-600/20 disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete Project'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
