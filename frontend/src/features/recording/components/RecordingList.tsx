import React, { useState } from 'react';
import { Mic, Radio, Download, Trash2, Edit2, Check, Music2 } from 'lucide-react';
import { useRecordingStore } from '../stores/useRecordingStore';
import { RecordingPlayer } from './RecordingPlayer';

export const RecordingList: React.FC = () => {
  const {
    recordings,
    deleteRecording,
    renameRecording,
    exportRecordingAsWav,
  } = useRecordingStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleStartEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      renameRecording(id, editName.trim());
    }
    setEditingId(null);
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (recordings.length === 0) {
    return (
      <div className="bg-[#0f1117] border border-[#2e3444] rounded-xl p-4 text-center text-gray-400 text-xs select-none">
        <Music2 className="w-6 h-6 mx-auto mb-2 text-gray-500 opacity-60" />
        No active recordings yet. Use Record or Export WAV to create audio files.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
          Recording & Render Library ({recordings.length})
        </span>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {recordings.map((rec) => (
          <div
            key={rec.id}
            className="bg-[#0f1117] border border-[#2e3444] rounded-lg p-2.5 space-y-2 hover:border-[#373e52] transition-colors"
          >
            {/* Header Row: Source, Title, Rename, Delete, Download */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-white ${
                    rec.source === 'microphone' ? 'bg-rose-600' : 'bg-indigo-600'
                  }`}
                >
                  {rec.source === 'microphone' ? (
                    <Mic className="w-3.5 h-3.5" />
                  ) : (
                    <Radio className="w-3.5 h-3.5" />
                  )}
                </div>

                {editingId === rec.id ? (
                  <div className="flex items-center gap-1 min-w-0 flex-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-[#181b24] border border-[#2e3444] rounded px-2 py-0.5 text-xs text-gray-100 outline-none w-full"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(rec.id)}
                      className="p-1 text-emerald-400 hover:text-emerald-300"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="min-w-0 flex-1 flex items-center gap-1.5">
                    <span className="text-xs font-medium text-gray-100 truncate">
                      {rec.name}
                    </span>
                    <button
                      onClick={() => handleStartEdit(rec.id, rec.name)}
                      className="text-gray-500 hover:text-gray-300 transition-colors"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Meta & Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] font-mono text-gray-500">
                  {formatSize(rec.sizeBytes)} • {formatDate(rec.createdAt)}
                </span>

                <button
                  onClick={() => exportRecordingAsWav(rec.id)}
                  className="p-1 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded transition-colors"
                  title="Download WAV"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => deleteRecording(rec.id)}
                  className="p-1 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                  title="Delete Recording"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Embedded Player */}
            <RecordingPlayer recording={rec} />
          </div>
        ))}
      </div>
    </div>
  );
};
