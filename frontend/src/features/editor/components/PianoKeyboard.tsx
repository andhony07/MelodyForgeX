import React from 'react';
import { PITCH_LIST, midiToNoteName, isBlackKey } from '../constants/note';

interface PianoKeyboardProps {
  rowHeight: number;
}

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({ rowHeight }) => {
  return (
    <div className="w-20 border-r border-[#2e3444] bg-[#12141c] flex flex-col select-none flex-shrink-0 z-20">
      {PITCH_LIST.map((pitch) => {
        const black = isBlackKey(pitch);
        const name = midiToNoteName(pitch);
        const isC = name.startsWith('C') && !name.startsWith('C#');

        return (
          <div
            key={pitch}
            className={`border-b border-[#2e3444]/40 flex items-center justify-between px-2 text-[10px] font-mono transition-colors ${
              black
                ? 'bg-[#0a0c12] text-gray-400 font-semibold shadow-inner'
                : 'bg-[#1e222d] text-gray-200'
            } ${isC ? 'border-b-indigo-500/60 font-bold text-indigo-300' : ''}`}
            style={{ height: `${rowHeight}px` }}
          >
            <span className={black ? 'text-gray-400' : isC ? 'text-indigo-300 font-extrabold' : 'text-gray-200'}>
              {name}
            </span>
            {isC && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
          </div>
        );
      })}
    </div>
  );
};
