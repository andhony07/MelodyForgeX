import React, { useEffect } from 'react';
import { StudioShell } from '../features/editor/components/StudioShell';
import { useProjectStore } from '../stores/useProjectStore';
import { useStudioStore } from '../features/editor/stores/useStudioStore';
import { MusicalKey } from '../features/editor/types/studio';

export const StudioPage: React.FC = () => {
  const activeProject = useProjectStore((state) => state.activeProject);
  const { setTempo, setKey } = useStudioStore();

  useEffect(() => {
    if (activeProject) {
      if (activeProject.tempo) {
        setTempo(activeProject.tempo);
      }
      if (activeProject.key) {
        // Strip mode if present e.g. "Am" -> "A"
        const cleanKey = activeProject.key.replace(/m$/, '') as MusicalKey;
        const validKeys: MusicalKey[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        if (validKeys.includes(cleanKey)) {
          setKey(cleanKey);
        }
      }
    }
  }, [activeProject, setTempo, setKey]);

  return <StudioShell />;
};
