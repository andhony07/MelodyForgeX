import React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { useStudioStore } from '../stores/useStudioStore';

export const ZoomControls: React.FC = () => {
  const { zoom, setZoom } = useStudioStore();

  const zoomIn = () => setZoom(zoom + 15);
  const zoomOut = () => setZoom(zoom - 15);

  return (
    <div className="flex items-center gap-1.5 bg-[#0f1117] border border-[#2e3444] rounded-lg p-1 select-none text-xs">
      <button
        onClick={zoomOut}
        disabled={zoom <= 50}
        className="p-1 text-gray-400 hover:text-gray-200 disabled:opacity-40 rounded hover:bg-[#202430] transition-colors"
        title="Zoom Out (−)"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>

      <span className="font-mono text-[11px] font-semibold text-gray-300 px-1 w-10 text-center">
        {zoom}%
      </span>

      <button
        onClick={zoomIn}
        disabled={zoom >= 200}
        className="p-1 text-gray-400 hover:text-gray-200 disabled:opacity-40 rounded hover:bg-[#202430] transition-colors"
        title="Zoom In (+)"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
