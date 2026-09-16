import React, { useState } from 'react';
import { useArrangementStore } from '../stores/useArrangementStore';
import { useStudioStore } from '../../editor/stores/useStudioStore';
import { AutomationLane, AutomationParameter, AutomationTargetType } from '../types/automation';
import { Plus, Trash2, Sliders, ToggleLeft, ToggleRight, XCircle } from 'lucide-react';

interface AutomationLaneViewProps {
  measureWidth: number;
  totalMeasures: number;
}

export const AutomationLaneView: React.FC<AutomationLaneViewProps> = ({
  measureWidth,
  totalMeasures,
}) => {
  const {
    automationLanes,
    addAutomationLane,
    removeAutomationLane,
    addAutomationPoint,
    updateAutomationPoint,
    deleteAutomationPoint,
    clearAutomationLane,
    toggleAutomationLane,
    automationEnabled,
    setAutomationEnabled,
  } = useArrangementStore();

  const { tracks } = useStudioStore();

  const [selectedTargetType, setSelectedTargetType] = useState<AutomationTargetType>('track');
  const [selectedTargetId, setSelectedTargetId] = useState<string>(tracks[0]?.id || '');
  const [selectedParam, setSelectedParam] = useState<AutomationParameter>('volume');
  const [editingPoint, setEditingPoint] = useState<{ laneId: string; pointId: string; beat: number; value: number } | null>(null);

  const totalBeats = totalMeasures * 4;

  const handleCreateLane = () => {
    const targetId = selectedTargetType === 'track' ? (selectedTargetId || tracks[0]?.id || 'track-1') : selectedTargetType;
    addAutomationLane(selectedTargetType, targetId, selectedParam);
  };

  const formatValueDisplay = (param: AutomationParameter, val: number): string => {
    if (param === 'volume') return `${Math.round(val * 100)}%`;
    if (param === 'pan') return val < 0 ? `L ${Math.abs(Math.round(val * 100))}%` : val > 0 ? `R ${Math.round(val * 100)}%` : 'Center';
    if (param === 'tempo') return `${Math.round(val)} BPM`;
    return `${val}`;
  };

  const getMinMaxForParam = (param: AutomationParameter): { min: number; max: number; defaultVal: number } => {
    if (param === 'volume') return { min: 0, max: 1, defaultVal: 0.8 };
    if (param === 'pan') return { min: -1, max: 1, defaultVal: 0 };
    if (param === 'tempo') return { min: 20, max: 300, defaultVal: 120 };
    return { min: 0, max: 1, defaultVal: 0.5 };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>, lane: AutomationLane) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert pixel X to beat coordinate (beat 1.0 at 0px)
    const beatWidth = measureWidth / 4;
    const clickedBeat = Math.max(1.0, Math.round((1.0 + clickX / beatWidth) * 10) / 10);

    // Convert pixel Y to value
    const { min, max } = getMinMaxForParam(lane.parameter);
    const normalizedY = 1.0 - Math.max(0, Math.min(1, clickY / rect.height));
    const rawVal = min + normalizedY * (max - min);
    const value = lane.parameter === 'tempo' ? Math.round(rawVal) : Math.round(rawVal * 100) / 100;

    addAutomationPoint(lane.id, clickedBeat, value);
  };

  return (
    <div className="bg-[#12141c] border-t border-[#2e3444] text-xs font-sans select-none">
      {/* Global Automation Bar */}
      <div className="h-8 bg-[#181b24] border-b border-[#2e3444] px-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutomationEnabled(!automationEnabled)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
              automationEnabled ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            {automationEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            <span>Automation {automationEnabled ? 'ENABLED' : 'DISABLED'}</span>
          </button>
          <span className="text-gray-500 text-[10px]">
            ({automationLanes.length} Active Lane{automationLanes.length !== 1 ? 's' : ''})
          </span>
        </div>

        {/* Quick Add Lane controls */}
        <div className="flex items-center gap-1.5">
          <select
            value={selectedTargetType}
            onChange={(e) => {
              const tt = e.target.value as AutomationTargetType;
              setSelectedTargetType(tt);
              if (tt === 'track' && tracks.length > 0) {
                setSelectedTargetId(tracks[0].id);
              } else {
                setSelectedTargetId(tt);
              }
            }}
            className="bg-[#0f1117] border border-[#2e3444] text-gray-300 rounded px-1.5 py-0.5 text-[11px]"
          >
            <option value="track">Track</option>
            <option value="master">Master</option>
            <option value="arrangement">Arrangement (Tempo)</option>
          </select>

          {selectedTargetType === 'track' && (
            <select
              value={selectedTargetId}
              onChange={(e) => setSelectedTargetId(e.target.value)}
              className="bg-[#0f1117] border border-[#2e3444] text-gray-300 rounded px-1.5 py-0.5 text-[11px] max-w-[110px] truncate"
            >
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={selectedParam}
            onChange={(e) => setSelectedParam(e.target.value as AutomationParameter)}
            className="bg-[#0f1117] border border-[#2e3444] text-gray-300 rounded px-1.5 py-0.5 text-[11px]"
          >
            {selectedTargetType === 'arrangement' ? (
              <option value="tempo">Tempo</option>
            ) : (
              <>
                <option value="volume">Volume</option>
                <option value="pan">Pan</option>
              </>
            )}
          </select>

          <button
            onClick={handleCreateLane}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-0.5 rounded text-[11px] font-medium"
          >
            <Plus className="w-3 h-3" />
            <span>Add Lane</span>
          </button>
        </div>
      </div>

      {/* Lanes List */}
      {automationLanes.length === 0 ? (
        <div className="p-3 text-center text-gray-500 text-[11px]">
          No automation lanes added. Select target and parameter above and click "+ Add Lane" to draw control points.
        </div>
      ) : (
        <div className="divide-y divide-[#2e3444]">
          {automationLanes.map((lane) => {
            const trackObj = lane.targetType === 'track' ? tracks.find((t) => t.id === lane.targetId) : null;
            const targetLabel = trackObj ? trackObj.name : lane.targetType.toUpperCase();
            const { min, max } = getMinMaxForParam(lane.parameter);
            const isEnabled = lane.enabled ?? true;

            // Generate SVG path for automation line
            const beatWidth = measureWidth / 4;
            const laneHeight = 48;

            const sortedPoints = [...lane.points].sort((a, b) => a.beat - b.beat);
            let pathString = '';

            if (sortedPoints.length > 0) {
              const pointToXY = (p: { beat: number; value: number }) => {
                const x = (p.beat - 1.0) * beatWidth;
                const normY = (p.value - min) / (max - min);
                const y = laneHeight - normY * (laneHeight - 8) - 4;
                return { x, y };
              };

              const firstXY = pointToXY(sortedPoints[0]);
              // Extend to beat 1 if needed
              pathString = `M 0 ${firstXY.y} L ${firstXY.x} ${firstXY.y}`;

              sortedPoints.forEach((p) => {
                const xy = pointToXY(p);
                pathString += ` L ${xy.x} ${xy.y}`;
              });

              const lastXY = pointToXY(sortedPoints[sortedPoints.length - 1]);
              pathString += ` L ${totalMeasures * measureWidth} ${lastXY.y}`;
            }

            return (
              <div key={lane.id} className="flex h-14 bg-[#0f1117]">
                {/* Left Controls Header */}
                <div className="w-64 bg-[#181b24] border-r border-[#2e3444] px-2 py-1.5 flex flex-col justify-between flex-shrink-0 z-10">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-200 truncate max-w-[130px] text-[11px]">
                      {targetLabel}
                    </span>
                    <span className="text-[10px] px-1 py-0.2 rounded bg-indigo-900/60 text-indigo-300 font-mono uppercase">
                      {lane.parameter}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleAutomationLane(lane.id)}
                        className={`text-[10px] ${isEnabled ? 'text-indigo-400 font-bold' : 'text-gray-500'}`}
                      >
                        {isEnabled ? 'ON' : 'OFF'}
                      </button>
                      <button
                        onClick={() => clearAutomationLane(lane.id)}
                        className="text-gray-500 hover:text-amber-400"
                        title="Clear points"
                      >
                        Clear
                      </button>
                    </div>
                    <button
                      onClick={() => removeAutomationLane(lane.id)}
                      className="text-gray-500 hover:text-red-400"
                      title="Remove lane"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Right Interactive Automation Canvas */}
                <div
                  className="flex-1 relative cursor-crosshair overflow-hidden"
                  style={{ width: `${totalMeasures * measureWidth}px` }}
                  onClick={(e) => handleCanvasClick(e, lane)}
                >
                  <svg
                    className="w-full h-full absolute inset-0 pointer-events-none"
                    style={{ width: `${totalMeasures * measureWidth}px`, height: '100%' }}
                  >
                    {/* Grid beat guidelines */}
                    {Array.from({ length: totalBeats }).map((_, i) => (
                      <line
                        key={i}
                        x1={i * beatWidth}
                        y1={0}
                        x2={i * beatWidth}
                        y2={laneHeight}
                        stroke="#2e3444"
                        strokeWidth={i % 4 === 0 ? '1' : '0.5'}
                        strokeDasharray={i % 4 === 0 ? '' : '2 2'}
                      />
                    ))}

                    {/* Automation Interpolation Line */}
                    {pathString && (
                      <path
                        d={pathString}
                        fill="none"
                        stroke={isEnabled ? '#6366f1' : '#4b5563'}
                        strokeWidth="2"
                      />
                    )}
                  </svg>

                  {/* Automation Points Dots */}
                  {sortedPoints.map((p) => {
                    const normY = (p.value - min) / (max - min);
                    const leftPx = (p.beat - 1.0) * beatWidth;
                    const topPx = laneHeight - normY * (laneHeight - 8) - 8;

                    return (
                      <div
                        key={p.id}
                        className="absolute w-3.5 h-3.5 -ml-1.75 -mt-1.75 rounded-full bg-indigo-400 border-2 border-white shadow-md flex items-center justify-center cursor-pointer group hover:scale-125 transition-transform z-20"
                        style={{ left: `${leftPx}px`, top: `${topPx}px` }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPoint({ laneId: lane.id, pointId: p.id, beat: p.beat, value: p.value });
                        }}
                      >
                        {/* Hover Tooltip Value */}
                        <div className="hidden group-hover:block absolute bottom-4 bg-gray-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap z-30">
                          Beat {p.beat.toFixed(1)}: {formatValueDisplay(lane.parameter, p.value)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Point Edit Modal Dialog */}
      {editingPoint && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#181b24] border border-[#2e3444] rounded-lg p-3 w-64 space-y-3 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-[#2e3444] pb-2 font-bold text-gray-200">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Edit Control Point</span>
              </div>
              <button onClick={() => setEditingPoint(null)} className="text-gray-400 hover:text-white">
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-[10px] text-gray-400 block mb-0.5">Beat Coordinate</span>
                <input
                  type="number"
                  min={1}
                  step={0.1}
                  value={editingPoint.beat}
                  onChange={(e) =>
                    setEditingPoint({ ...editingPoint, beat: Math.max(1, parseFloat(e.target.value) || 1) })
                  }
                  className="w-full bg-[#0f1117] border border-[#2e3444] rounded px-2 py-1 text-xs text-amber-400 font-mono outline-hidden"
                />
              </div>

              <div>
                <span className="text-[10px] text-gray-400 block mb-0.5">Value</span>
                <input
                  type="number"
                  step={0.01}
                  value={editingPoint.value}
                  onChange={(e) =>
                    setEditingPoint({ ...editingPoint, value: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-[#0f1117] border border-[#2e3444] rounded px-2 py-1 text-xs text-cyan-400 font-mono outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#2e3444]">
              <button
                onClick={() => {
                  deleteAutomationPoint(editingPoint.laneId, editingPoint.pointId);
                  setEditingPoint(null);
                }}
                className="text-red-400 hover:text-red-300 flex items-center gap-1 text-[11px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <button
                onClick={() => {
                  updateAutomationPoint(editingPoint.laneId, editingPoint.pointId, {
                    beat: editingPoint.beat,
                    value: editingPoint.value,
                  });
                  setEditingPoint(null);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded text-[11px] font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
