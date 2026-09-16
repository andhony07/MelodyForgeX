import axios from 'axios';
import { ArrangementAnalysisResult } from '../../arrangement/analysis/types/analysisTypes';
import { ArrangementSection } from '../../arrangement/types/arrangementSection';
import { Track } from '../../editor/types/studio';
import { ArrangementSuggestion } from '../../arrangement/suggestions/types/suggestionTypes';
import { validateAIArrangementResponse } from '../schemas/aiArrangementSchema';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000/api';

export class AIArrangementService {
  public async getAIArrangementSuggestions(params: {
    analysis: ArrangementAnalysisResult;
    sections: ArrangementSection[];
    tracks: Track[];
    key: string;
    mode: string;
    tempo: number;
  }): Promise<ArrangementSuggestion[]> {
    const { analysis, sections, tracks, key, mode, tempo } = params;

    // Build compact structured metadata payload
    const payload = {
      key,
      mode,
      tempo,
      sectionsCount: analysis.sectionsCount,
      tracksCount: analysis.tracksCount,
      sections: sections.map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        lengthBars: s.lengthBars,
      })),
      tracks: tracks.map((t) => ({
        id: t.id,
        name: t.name,
        instrument: t.instrument,
      })),
      sectionAnalyses: analysis.sectionAnalyses.map((sa) => ({
        sectionId: sa.sectionId,
        sectionName: sa.sectionName,
        activeTrackIds: sa.activeTrackIds,
        noteDensity: Math.round(sa.noteDensity * 100) / 100,
      })),
      findingsCount: analysis.findings.length,
    };

    const apiKey = import.meta.env?.VITE_GEMINI_API_KEY || '';

    if (apiKey) {
      // Direct client-side Gemini request with prompt
      const modelName = import.meta.env?.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      const promptText = `You are a professional music arranger and DAW assistant.
Analyze the following song arrangement payload and suggest up to 4 high-value arrangement improvements.
Payload: ${JSON.stringify(payload)}

Return JSON adhering strictly to:
{
  "suggestions": [
    {
      "type": "TRACK_ACTIVATION" | "AUTOMATION_ADD" | "TRANSITION_CHANGE" | "TEMPO_ADJUST",
      "sectionId": "section id string",
      "trackId": "track id string",
      "title": "Short title",
      "description": "Clear explanation",
      "reason": "Musical rationale"
    }
  ]
}`;

      try {
        const resp = await axios.post(
          url,
          {
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: 'application/json',
            },
          },
          { timeout: 20000 }
        );

        const rawText = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) throw new Error('Empty response from Gemini.');
        const parsed = JSON.parse(rawText);
        return validateAIArrangementResponse(parsed, sections, tracks);
      } catch {
        // Fallback to deterministic suggestions if network/API fails
        return [];
      }
    } else {
      // Delegate to backend route
      try {
        const resp = await axios.post(`${API_BASE_URL}/ai/arrange`, payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 20000,
        });
        if (resp.data && resp.data.suggestions) {
          return validateAIArrangementResponse(resp.data, sections, tracks);
        }
        return [];
      } catch {
        return [];
      }
    }
  }
}

export const aiArrangementService = new AIArrangementService();
