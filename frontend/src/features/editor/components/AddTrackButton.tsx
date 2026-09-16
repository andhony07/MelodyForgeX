import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { useStudioStore } from '../stores/useStudioStore';
import { DEFAULT_INSTRUMENTS } from '../constants/studio';
import { InstrumentOption } from '../types/studio';
import { InstrumentIcon } from './InstrumentIcon';

export const AddTrackButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const addTrack = useStudioStore((state) => state.addTrack);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (instrument: InstrumentOption) => {
    addTrack(instrument);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-indigo-600/20"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Track</span>
        <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-80" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-48 bg-[#181b24] border border-[#2e3444] rounded-xl shadow-2xl py-1.5 z-40 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Select Instrument
          </div>
          {DEFAULT_INSTRUMENTS.map((inst) => (
            <button
              key={inst.name}
              onClick={() => handleSelect(inst)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-200 hover:bg-[#202430] hover:text-indigo-400 transition-colors text-left"
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center border"
                style={{
                  backgroundColor: `${inst.color}15`,
                  borderColor: `${inst.color}40`,
                  color: inst.color,
                }}
              >
                <InstrumentIcon iconName={inst.iconName} className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium">{inst.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
