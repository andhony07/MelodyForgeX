import React, { useState } from 'react';
import { exportNativeProject, loadNativeProjectFromFile } from '../services/projectSerializer';
import { Download, Upload, X, FolderCheck, FileCode, AlertCircle, Check } from 'lucide-react';

interface ProjectInterchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'save' | 'load';
}

export const ProjectInterchangeModal: React.FC<ProjectInterchangeModalProps> = ({
  isOpen,
  onClose,
  mode,
}) => {
  const [filename, setFilename] = useState('melodyforge_project');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    if (!filename.trim()) return;
    exportNativeProject(filename.trim());
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const project = await loadNativeProjectFromFile(file);
      setSuccessMessage(`Successfully loaded project "${project.metadata.title}"`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load project file.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-[#181b24] border border-[#2e3444] rounded-xl w-full max-w-md p-5 shadow-2xl text-xs text-gray-200 font-sans space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2e3444] pb-3">
          <div className="flex items-center gap-2 font-bold text-sm text-gray-100">
            {mode === 'save' ? (
              <>
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Save Native Project (.melodyforge)</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Load Native Project (.melodyforge)</span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-100 rounded hover:bg-[#2e3444]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {mode === 'save' ? (
          /* Save / Export Mode */
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Project Name
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="melodyforge_project"
                  className="flex-1 bg-[#0f1117] border border-[#2e3444] rounded-lg px-3 py-2 text-xs text-gray-100 outline-hidden focus:border-indigo-500"
                />
                <span className="text-gray-500 font-mono text-xs font-semibold">.melodyforge</span>
              </div>
            </div>

            <div className="bg-[#0f1117] p-3 rounded-lg border border-[#2e3444] text-[11px] text-gray-400 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-gray-200">
                <FolderCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Includes Complete Project Data:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-gray-400 pl-1">
                <li>Studio tracks, instruments, volumes, mute/solo states</li>
                <li>Piano Roll MIDI note data across all tracks</li>
                <li>Song Arrangement structure & section boundaries</li>
                <li>Tempo, key, mode, and time signature</li>
                <li>AI Composition history</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2e3444]">
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleExport}
                disabled={!filename.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg font-semibold shadow-md shadow-indigo-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Project</span>
              </button>
            </div>
          </div>
        ) : (
          /* Load / Import Mode */
          <div className="space-y-4">
            <label className="border-2 border-dashed border-[#2e3444] hover:border-indigo-500/50 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-[#0f1117] hover:bg-[#12151e] transition-all group">
              <FileCode className="w-10 h-10 text-gray-500 group-hover:text-indigo-400 transition-colors" />
              <div className="text-center">
                <span className="font-semibold text-gray-200 block">
                  Click or Drag & Drop .melodyforge File
                </span>
                <span className="text-[10px] text-gray-500">Native MelodyForgeX interchange files</span>
              </div>
              <input
                type="file"
                accept=".melodyforge,application/json"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="hidden"
              />
            </label>

            {error && (
              <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 p-2.5 rounded-lg">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-2.5 rounded-lg">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-end border-t border-[#2e3444] pt-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
