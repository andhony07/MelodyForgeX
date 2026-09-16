import React, { useState, useRef, useEffect } from 'react';
import { Sliders, FolderKanban, Music, Download, Upload, ChevronDown, FileCode, FileMusic } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProjectStore } from '../../../stores/useProjectStore';
import { useStudioStore } from '../stores/useStudioStore';
import { MIDIExportModal } from '../../midi/components/MIDIExportModal';
import { MIDIImportModal } from '../../midi/components/MIDIImportModal';
import { ProjectInterchangeModal } from '../../projects/components/ProjectInterchangeModal';

export const StudioHeader: React.FC = () => {
  const activeProject = useProjectStore((state) => state.activeProject);
  const { tempo, key, mode, timeSignature } = useStudioStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExportMidiOpen, setIsExportMidiOpen] = useState(false);
  const [isImportMidiOpen, setIsImportMidiOpen] = useState(false);
  const [projectModalMode, setProjectModalMode] = useState<'save' | 'load' | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
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

          {/* File & Interchange Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#0f1117] hover:bg-gray-800 text-gray-200 rounded border border-[#2e3444] font-semibold text-xs transition-colors"
            >
              <span>File / Interchange</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {isMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-[#181b24] border border-[#2e3444] rounded-lg shadow-2xl py-1 z-50 text-xs divide-y divide-[#2e3444]/60">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsExportMidiOpen(true);
                    }}
                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-indigo-600/20 hover:text-indigo-200 text-gray-300 transition-colors"
                  >
                    <FileMusic className="w-4 h-4 text-indigo-400" />
                    <div>
                      <span className="font-semibold block">Export MIDI (.mid)</span>
                      <span className="text-[10px] text-gray-500 block">Standard MIDI file</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsImportMidiOpen(true);
                    }}
                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-emerald-600/20 hover:text-emerald-200 text-gray-300 transition-colors"
                  >
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-semibold block">Import MIDI (.mid)</span>
                      <span className="text-[10px] text-gray-500 block">Load .mid or .midi</span>
                    </div>
                  </button>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setProjectModalMode('save');
                    }}
                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-cyan-600/20 hover:text-cyan-200 text-gray-300 transition-colors"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    <div>
                      <span className="font-semibold block">Save Native Project</span>
                      <span className="text-[10px] text-gray-500 block">.melodyforge format</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setProjectModalMode('load');
                    }}
                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-purple-600/20 hover:text-purple-200 text-gray-300 transition-colors"
                  >
                    <FileCode className="w-4 h-4 text-purple-400" />
                    <div>
                      <span className="font-semibold block">Load Native Project</span>
                      <span className="text-[10px] text-gray-500 block">Restore .melodyforge</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
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
            <span>Phase 8 MIDI DAW</span>
          </div>
        </div>
      </header>

      {/* Modals */}
      <MIDIExportModal isOpen={isExportMidiOpen} onClose={() => setIsExportMidiOpen(false)} />
      <MIDIImportModal isOpen={isImportMidiOpen} onClose={() => setIsImportMidiOpen(false)} />
      <ProjectInterchangeModal
        isOpen={projectModalMode !== null}
        onClose={() => setProjectModalMode(null)}
        mode={projectModalMode || 'save'}
      />
    </>
  );
};
