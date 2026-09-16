import React from 'react';
import { useArrangementStore } from '../stores/useArrangementStore';
import { useCompositionStore } from '../../composition/stores/useCompositionStore';
import { useStudioStore } from '../../editor/stores/useStudioStore';
import { usePianoRollStore } from '../../editor/stores/usePianoRollStore';
import { ArrangementSectionType } from '../types/arrangementSection';
import { sectionToBeats, getSectionColor } from '../utils/arrangementUtils';
import { generateChordNotes } from '../../composition/generators/chordGenerator';
import { generateMelody } from '../../composition/generators/melodyGenerator';
import { generateArpeggio } from '../../composition/generators/arpeggioGenerator';
import { Music, Sparkles, Sliders, Layers, Info } from 'lucide-react';

export const SectionInspector: React.FC = () => {
  const { getSelectedSection, updateSection } = useArrangementStore();
  const { selectedKey, selectedScale, activeProgression, seed } = useCompositionStore();
  const { tracks, addTrack } = useStudioStore();
  const { notesByTrackId } = usePianoRollStore();

  const section = getSelectedSection();

  if (!section) {
    return (
      <div className="bg-[#181b24] border border-[#2e3444] rounded-lg p-3 text-xs text-gray-500 text-center">
        No section selected. Click a section on the arrangement timeline to inspect.
      </div>
    );
  }

  const colorScheme = getSectionColor(section.type);
  const { startBeat, endBeat } = sectionToBeats(section);

  const getOrCreateTrack = (trackName: string, defaultInstName: string, iconName: string, color: string) => {
    let target = tracks.find((t) => t.name === trackName);
    if (!target) {
      addTrack({
        name: trackName,
        instrument: defaultInstName,
        iconName,
        color,
      });
      target = useStudioStore.getState().tracks.find((t) => t.name === trackName);
    }
    return target;
  };

  // Section Isolation helper: Keeps notes outside current section, replaces notes inside section
  const replaceNotesInSection = (trackId: string, newSectionNotes: ReturnType<typeof generateChordNotes>) => {
    const currentNotes = notesByTrackId[trackId] || [];
    // Filter out existing notes in this section
    const nonSectionNotes = currentNotes.filter(
      (n) => n.startBeat < startBeat || n.startBeat >= endBeat
    );
    // Align generated note start beats with section startBeat
    const shiftedNotes = newSectionNotes.map((n) => ({
      ...n,
      startBeat: startBeat + (n.startBeat - 1.0),
    })).filter((n) => n.startBeat < endBeat);

    const mergedNotes = [...nonSectionNotes, ...shiftedNotes];

    usePianoRollStore.setState({
      notesByTrackId: {
        ...notesByTrackId,
        [trackId]: mergedNotes,
      },
    });
  };

  const handleGenerateSectionChords = () => {
    const track = getOrCreateTrack('Generated Chords', 'Piano', 'Piano', '#6366f1');
    if (!track) return;

    const generated = generateChordNotes({
      trackId: track.id,
      progression: activeProgression,
      octaveOffset: -1,
      velocity: 85,
    });

    replaceNotesInSection(track.id, generated);
  };

  const handleGenerateSectionMelody = () => {
    const track = getOrCreateTrack('Generated Melody', 'Synth', 'Zap', '#06b6d4');
    if (!track) return;

    const generated = generateMelody({
      trackId: track.id,
      key: selectedKey,
      scale: selectedScale,
      seed: seed + section.order * 100,
      totalBars: section.lengthBars,
      octave: 4,
      noteDensity: 'medium',
      velocity: 100,
    });

    replaceNotesInSection(track.id, generated);
  };

  const handleGenerateSectionArpeggio = () => {
    const track = getOrCreateTrack('Generated Arpeggio', 'Guitar', 'Radio', '#10b981');
    if (!track) return;

    const generated = generateArpeggio({
      trackId: track.id,
      progression: activeProgression,
      pattern: 'Up',
      subdivisionBeats: 0.5,
      octaveSpan: 2,
      seed: seed + section.order * 200,
      velocity: 90,
    });

    replaceNotesInSection(track.id, generated);
  };

  return (
    <div className="bg-[#0f1117] border border-[#2e3444] rounded-lg p-3 space-y-3 select-none text-xs font-sans">
      {/* Inspector Header */}
      <div className="flex items-center justify-between border-b border-[#2e3444] pb-2">
        <div className="flex items-center gap-1.5 font-bold text-gray-200">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Section Inspector</span>
        </div>
        <span className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold ${colorScheme.badge}`}>
          {section.type}
        </span>
      </div>

      {/* Editable Fields */}
      <div className="space-y-2">
        <div>
          <span className="text-[10px] text-gray-500 block mb-0.5">Section Name</span>
          <input
            type="text"
            value={section.name}
            onChange={(e) => updateSection(section.id, { name: e.target.value })}
            className="w-full bg-[#181b24] border border-[#2e3444] rounded px-2 py-1 text-xs text-gray-100 outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-gray-500 block mb-0.5">Type</span>
            <select
              value={section.type}
              onChange={(e) =>
                updateSection(section.id, { type: e.target.value as ArrangementSectionType })
              }
              className="w-full bg-[#181b24] border border-[#2e3444] rounded px-2 py-1 text-xs text-gray-200 outline-hidden"
            >
              <option value="Intro">Intro</option>
              <option value="Verse">Verse</option>
              <option value="Pre-Chorus">Pre-Chorus</option>
              <option value="Chorus">Chorus</option>
              <option value="Bridge">Bridge</option>
              <option value="Outro">Outro</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          <div>
            <span className="text-[10px] text-gray-500 block mb-0.5">Length (Bars)</span>
            <input
              type="number"
              min={1}
              max={128}
              value={section.lengthBars}
              onChange={(e) =>
                updateSection(section.id, { lengthBars: parseInt(e.target.value) || 1 })
              }
              className="w-full bg-[#181b24] border border-[#2e3444] rounded px-2 py-1 text-xs text-amber-400 font-mono outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Section Boundaries Info */}
      <div className="bg-[#181b24] p-2 rounded border border-[#2e3444] grid grid-cols-2 gap-2 text-[11px] font-mono">
        <div>
          <span className="text-[10px] text-gray-500 block">Bars</span>
          <span className="text-gray-200 font-bold">
            {section.startBar} – {section.startBar + section.lengthBars - 1}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-gray-500 block">Beats Range</span>
          <span className="text-cyan-400 font-bold">
            {startBeat.toFixed(0)} – {(endBeat - 1).toFixed(0)}
          </span>
        </div>
      </div>

      {/* Section-Targeted Generation Controls */}
      <div className="space-y-1.5 pt-1 border-t border-[#2e3444]">
        <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          <Info className="w-3 h-3 text-indigo-400" />
          <span>Section-Isolated Generation</span>
        </div>

        <button
          onClick={handleGenerateSectionChords}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded text-xs font-semibold shadow-xs transition-all"
        >
          <Music className="w-3.5 h-3.5" />
          <span>Generate Chords for {section.name}</span>
        </button>

        <button
          onClick={handleGenerateSectionMelody}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-cyan-600/80 hover:bg-cyan-600 text-white rounded text-xs font-semibold shadow-xs transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate Melody for {section.name}</span>
        </button>

        <button
          onClick={handleGenerateSectionArpeggio}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded text-xs font-semibold shadow-xs transition-all"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Generate Arpeggio for {section.name}</span>
        </button>
      </div>
    </div>
  );
};
