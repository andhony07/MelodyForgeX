import React, { useState } from 'react';
import { useCompositionStore } from '../stores/useCompositionStore';
import { useStudioStore } from '../../editor/stores/useStudioStore';
import { usePianoRollStore } from '../../editor/stores/usePianoRollStore';
import { ScaleType } from '../types/scale';
import { SCALES } from '../constants/scales';
import { PROGRESSION_TEMPLATES } from '../constants/progressions';
import { generateChordNotes } from '../generators/chordGenerator';
import { generateMelody } from '../generators/melodyGenerator';
import { generateArpeggio, ArpeggioPattern } from '../generators/arpeggioGenerator';
import { MusicalKey } from '../../editor/types/studio';
import { AICompositionPanel } from '../../ai/components/AICompositionPanel';
import { ArrangementAssistantPanel } from '../../arrangement/components/ArrangementAssistantPanel';
import { Sparkles, Music, Sliders, RefreshCw, Trash2, Bot, Wrench, BarChart3 } from 'lucide-react';

export const CompositionPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual' | 'assistant'>('ai');

  const {
    selectedScale,
    selectedKey,
    activeProgression,
    seed,
    setScale,
    setCompositionKey,
    setProgression,
    setSeed,
  } = useCompositionStore();

  const { tracks, addTrack, setKey } = useStudioStore();
  const { notesByTrackId } = usePianoRollStore();

  const [density, setDensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [arpeggioPattern, setArpeggioPattern] = useState<ArpeggioPattern>('Up');

  // Helper to ensure dedicated target track exists
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

  const handleGenerateChords = () => {
    const track = getOrCreateTrack('Generated Chords', 'Piano', 'Piano', '#6366f1');
    if (!track) return;

    setCompositionKey(selectedKey);
    setKey(selectedKey);

    const generated = generateChordNotes({
      trackId: track.id,
      progression: activeProgression,
      octaveOffset: -1,
      velocity: 85,
    });

    usePianoRollStore.setState({
      notesByTrackId: {
        ...notesByTrackId,
        [track.id]: generated,
      },
    });
  };

  const handleGenerateMelody = () => {
    const track = getOrCreateTrack('Generated Melody', 'Synth', 'Zap', '#06b6d4');
    if (!track) return;

    setCompositionKey(selectedKey);
    setKey(selectedKey);

    const generated = generateMelody({
      trackId: track.id,
      key: selectedKey,
      scale: selectedScale,
      seed,
      totalBars: 4,
      octave: 4,
      noteDensity: density,
      velocity: 100,
    });

    usePianoRollStore.setState({
      notesByTrackId: {
        ...notesByTrackId,
        [track.id]: generated,
      },
    });
  };

  const handleGenerateArpeggio = () => {
    const track = getOrCreateTrack('Generated Arpeggio', 'Guitar', 'Radio', '#10b981');
    if (!track) return;

    setCompositionKey(selectedKey);
    setKey(selectedKey);

    const generated = generateArpeggio({
      trackId: track.id,
      progression: activeProgression,
      pattern: arpeggioPattern,
      subdivisionBeats: 0.5,
      octaveSpan: 2,
      seed,
      velocity: 90,
    });

    usePianoRollStore.setState({
      notesByTrackId: {
        ...notesByTrackId,
        [track.id]: generated,
      },
    });
  };

  const handleClearGenerated = () => {
    const updatedNotesMap = { ...notesByTrackId };
    ['Generated Chords', 'Generated Melody', 'Generated Arpeggio', 'AI Chords', 'AI Melody', 'AI Arpeggio'].forEach((name) => {
      const t = tracks.find((tr) => tr.name === name);
      if (t) {
        delete updatedNotesMap[t.id];
      }
    });

    usePianoRollStore.setState({ notesByTrackId: updatedNotesMap });
  };

  return (
    <div className="bg-[#181b24] border-l border-[#2e3444] w-80 flex flex-col justify-between p-3 select-none text-xs font-sans">
      <div className="space-y-3 overflow-y-auto pr-1">
        {/* Header Tabs */}
        <div className="flex items-center gap-1 bg-[#0f1117] p-1 rounded-lg border border-[#2e3444]">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
              activeTab === 'ai'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
              activeTab === 'manual'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Phase 5</span>
          </button>
          <button
            onClick={() => setActiveTab('assistant')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
              activeTab === 'assistant'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Arranger</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'ai' ? (
          <AICompositionPanel />
        ) : activeTab === 'assistant' ? (
          <ArrangementAssistantPanel />
        ) : (

          <div className="space-y-4">
            {/* Key & Scale Selection */}
            <div className="space-y-2">
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Key & Scale System
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-gray-500 block mb-0.5">Key</span>
                  <select
                    value={selectedKey}
                    onChange={(e) => {
                      const k = e.target.value as MusicalKey;
                      setCompositionKey(k);
                      setKey(k);
                    }}
                    className="w-full bg-[#0f1117] border border-[#2e3444] rounded px-2 py-1 text-xs text-cyan-400 font-mono font-bold outline-hidden"
                  >
                    {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-gray-500 block mb-0.5">Scale</span>
                  <select
                    value={selectedScale}
                    onChange={(e) => setScale(e.target.value as ScaleType)}
                    className="w-full bg-[#0f1117] border border-[#2e3444] rounded px-2 py-1 text-xs text-emerald-400 font-mono font-bold outline-hidden"
                  >
                    {Object.keys(SCALES).map((sc) => (
                      <option key={sc} value={sc}>
                        {sc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 line-clamp-2">
                {SCALES[selectedScale]?.description}
              </p>
            </div>

            {/* Chord Progression Selector */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Chord Progression
              </label>
              <select
                value={activeProgression.id}
                onChange={(e) => {
                  const p = PROGRESSION_TEMPLATES.find((pt) => pt.id === e.target.value);
                  if (p) setProgression(p);
                }}
                className="w-full bg-[#0f1117] border border-[#2e3444] rounded px-2 py-1.5 text-xs text-indigo-300 font-semibold outline-hidden"
              >
                {PROGRESSION_TEMPLATES.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Seed & Parameters */}
            <div className="space-y-2 bg-[#0f1117] p-2.5 rounded-lg border border-[#2e3444]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400 uppercase">Deterministic Seed</span>
                <button
                  onClick={() => setSeed(Math.floor(Math.random() * 90000) + 10000)}
                  className="p-1 text-gray-400 hover:text-indigo-400 rounded hover:bg-[#181b24]"
                  title="Randomize Seed"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(parseInt(e.target.value) || 12345)}
                className="w-full bg-[#181b24] border border-[#2e3444] rounded px-2 py-1 text-xs text-gray-200 font-mono outline-hidden"
              />

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-gray-500 block mb-0.5">Melody Density</span>
                  <select
                    value={density}
                    onChange={(e) => setDensity(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-full bg-[#181b24] border border-[#2e3444] rounded px-1.5 py-1 text-[11px] text-gray-300 outline-hidden"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-gray-500 block mb-0.5">Arp Pattern</span>
                  <select
                    value={arpeggioPattern}
                    onChange={(e) => setArpeggioPattern(e.target.value as ArpeggioPattern)}
                    className="w-full bg-[#181b24] border border-[#2e3444] rounded px-1.5 py-1 text-[11px] text-gray-300 outline-hidden"
                  >
                    <option value="Up">Up</option>
                    <option value="Down">Down</option>
                    <option value="UpDown">Up/Down</option>
                    <option value="Random">Random</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Generator Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleGenerateChords}
                className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
              >
                <Music className="w-3.5 h-3.5" />
                Generate Chords
              </button>

              <button
                onClick={handleGenerateMelody}
                className="w-full flex items-center justify-center gap-2 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate Melody
              </button>

              <button
                onClick={handleGenerateArpeggio}
                className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
              >
                <Sliders className="w-3.5 h-3.5" />
                Generate Arpeggio
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clear Generated Content Button */}
      <div className="pt-3 border-t border-[#2e3444]">
        <button
          onClick={handleClearGenerated}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg text-xs font-medium transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Generated Tracks
        </button>
      </div>
    </div>
  );
};
