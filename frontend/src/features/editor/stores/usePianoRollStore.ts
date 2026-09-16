import { create } from 'zustand';
import { Note, SnapValue, PianoRollTool } from '../types/note';
import { INITIAL_DEMO_NOTES, snapBeat } from '../constants/note';

interface PianoRollState {
  notesByTrackId: Record<string, Note[]>;
  selectedNoteIds: string[];
  activeTool: PianoRollTool;
  snapValue: SnapValue;
  pixelsPerBeat: number; // Zoom level scale
  history: Record<string, Note[]>[];
  historyIndex: number;
  clipboard: Note[];

  getNotesForTrack: (trackId: string) => Note[];
  addNote: (note: Omit<Note, 'id'>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  deleteSelectedNotes: () => void;
  selectNote: (id: string, isMulti?: boolean) => void;
  clearSelection: () => void;
  setActiveTool: (tool: PianoRollTool) => void;
  setSnapValue: (snap: SnapValue) => void;
  setPixelsPerBeat: (px: number) => void;
  copySelectedNotes: () => void;
  pasteNotes: (trackId: string, atBeat?: number) => void;
  undo: () => void;
  redo: () => void;
}

export const usePianoRollStore = create<PianoRollState>((set, get) => {
  const pushHistory = (newNotesMap: Record<string, Note[]>) => {
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newNotesMap)));
    set({
      notesByTrackId: newNotesMap,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  };

  return {
    notesByTrackId: INITIAL_DEMO_NOTES,
    selectedNoteIds: [],
    activeTool: 'draw',
    snapValue: '1/4',
    pixelsPerBeat: 60,
    history: [INITIAL_DEMO_NOTES],
    historyIndex: 0,
    clipboard: [],

    getNotesForTrack: (trackId: string) => {
      return get().notesByTrackId[trackId] || [];
    },

    addNote: (noteData) => {
      const id = `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const newNote: Note = { ...noteData, id };
      const { notesByTrackId } = get();
      const trackNotes = notesByTrackId[noteData.trackId] || [];
      const updatedNotesMap = {
        ...notesByTrackId,
        [noteData.trackId]: [...trackNotes, newNote],
      };
      pushHistory(updatedNotesMap);
      set({ selectedNoteIds: [id] });
      return newNote;
    },

    updateNote: (id, updates) => {
      const { notesByTrackId } = get();
      let modified = false;

      const updatedNotesMap = { ...notesByTrackId };
      for (const trackId in updatedNotesMap) {
        const notes = updatedNotesMap[trackId];
        const idx = notes.findIndex((n) => n.id === id);
        if (idx !== -1) {
          const updatedNote = { ...notes[idx], ...updates };
          updatedNotesMap[trackId] = [
            ...notes.slice(0, idx),
            updatedNote,
            ...notes.slice(idx + 1),
          ];
          modified = true;
          break;
        }
      }

      if (modified) {
        pushHistory(updatedNotesMap);
      }
    },

    deleteNote: (id) => {
      const { notesByTrackId, selectedNoteIds } = get();
      const updatedNotesMap = { ...notesByTrackId };

      for (const trackId in updatedNotesMap) {
        updatedNotesMap[trackId] = updatedNotesMap[trackId].filter((n) => n.id !== id);
      }

      pushHistory(updatedNotesMap);
      set({ selectedNoteIds: selectedNoteIds.filter((nid) => nid !== id) });
    },

    deleteSelectedNotes: () => {
      const { notesByTrackId, selectedNoteIds } = get();
      if (selectedNoteIds.length === 0) return;

      const updatedNotesMap = { ...notesByTrackId };
      const toDeleteSet = new Set(selectedNoteIds);

      for (const trackId in updatedNotesMap) {
        updatedNotesMap[trackId] = updatedNotesMap[trackId].filter((n) => !toDeleteSet.has(n.id));
      }

      pushHistory(updatedNotesMap);
      set({ selectedNoteIds: [] });
    },

    selectNote: (id, isMulti = false) => {
      const { selectedNoteIds } = get();
      if (isMulti) {
        if (selectedNoteIds.includes(id)) {
          set({ selectedNoteIds: selectedNoteIds.filter((nid) => nid !== id) });
        } else {
          set({ selectedNoteIds: [...selectedNoteIds, id] });
        }
      } else {
        set({ selectedNoteIds: [id] });
      }
    },

    clearSelection: () => set({ selectedNoteIds: [] }),

    setActiveTool: (activeTool) => set({ activeTool }),
    setSnapValue: (snapValue) => set({ snapValue }),
    setPixelsPerBeat: (px) => set({ pixelsPerBeat: Math.max(30, Math.min(180, px)) }),

    copySelectedNotes: () => {
      const { notesByTrackId, selectedNoteIds } = get();
      const selectedSet = new Set(selectedNoteIds);
      const copied: Note[] = [];

      for (const trackId in notesByTrackId) {
        for (const note of notesByTrackId[trackId]) {
          if (selectedSet.has(note.id)) {
            copied.push({ ...note });
          }
        }
      }
      set({ clipboard: copied });
    },

    pasteNotes: (trackId, atBeat) => {
      const { clipboard, notesByTrackId, snapValue } = get();
      if (clipboard.length === 0) return;

      const minStartBeat = Math.min(...clipboard.map((n) => n.startBeat));
      const targetBeat = atBeat !== undefined ? snapBeat(atBeat, snapValue) : minStartBeat + 4.0;
      const beatOffset = targetBeat - minStartBeat;

      const newNotes: Note[] = clipboard.map((n) => ({
        ...n,
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        trackId,
        startBeat: Math.max(1.0, n.startBeat + beatOffset),
      }));

      const trackNotes = notesByTrackId[trackId] || [];
      const updatedNotesMap = {
        ...notesByTrackId,
        [trackId]: [...trackNotes, ...newNotes],
      };

      pushHistory(updatedNotesMap);
      set({ selectedNoteIds: newNotes.map((n) => n.id) });
    },

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        set({
          historyIndex: newIndex,
          notesByTrackId: JSON.parse(JSON.stringify(history[newIndex])),
        });
      }
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        set({
          historyIndex: newIndex,
          notesByTrackId: JSON.parse(JSON.stringify(history[newIndex])),
        });
      }
    },
  };
});
