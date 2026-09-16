import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { useProjectStore } from '../../stores/useProjectStore';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
  const createProject = useProjectStore((state) => state.createProject);
  const loading = useProjectStore((state) => state.loading);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tempo, setTempo] = useState(120);
  const [key, setKey] = useState('C');
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Project name is required');
      return;
    }
    if (tempo < 20 || tempo > 300) {
      setFormError('Tempo must be between 20 and 300 BPM');
      return;
    }

    try {
      await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        tempo,
        key,
        time_signature: timeSignature,
      });
      // Reset form
      setName('');
      setDescription('');
      setTempo(120);
      setKey('C');
      setTimeSignature('4/4');
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create project';
      setFormError(message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
            {formError}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
            Project Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Cyberpunk Synth Odyssey"
            className="w-full bg-[#0f1117] border border-[#2e3444] focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-hidden transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Brief project details or notes..."
            className="w-full bg-[#0f1117] border border-[#2e3444] focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-hidden transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Tempo (BPM)
            </label>
            <input
              type="number"
              min={20}
              max={300}
              value={tempo}
              onChange={(e) => setTempo(parseInt(e.target.value) || 120)}
              className="w-full bg-[#0f1117] border border-[#2e3444] focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-gray-100 outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Key
            </label>
            <select
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full bg-[#0f1117] border border-[#2e3444] focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-gray-100 outline-hidden font-mono"
            >
              {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'Cm', 'Dm', 'Em', 'Fm', 'Gm', 'Am', 'Bm'].map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Time Signature
            </label>
            <select
              value={timeSignature}
              onChange={(e) => setTimeSignature(e.target.value)}
              className="w-full bg-[#0f1117] border border-[#2e3444] focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-gray-100 outline-hidden font-mono"
            >
              {['4/4', '3/4', '2/4', '6/8', '7/8', '12/8'].map((ts) => (
                <option key={ts} value={ts}>
                  {ts}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2e3444]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
