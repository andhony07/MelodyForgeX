import axios from 'axios';
import { ProductionReport, AssistantMode } from '../types/productionTypes';
import { ProductionSuggestion } from '../types/productionSuggestion';
import { buildProductionContext } from '../analysis/productionContextBuilder';
import { analyzeProductionProject } from '../analysis/productionAnalyzer';
import { parseAIProductionResponse } from './aiProductionParser';

export class AIProductionService {
  public async analyzeProject(
    mode: AssistantMode = 'analyze',
    userPrompt?: string
  ): Promise<{
    report: ProductionReport;
    suggestions: ProductionSuggestion[];
    usedAI: boolean;
  }> {
    // 1. Always build baseline deterministic analysis first
    const context = buildProductionContext(mode, userPrompt);
    const { report: baseReport, suggestions: baseSuggestions } = analyzeProductionProject(context, mode);

    try {
      // 2. Call backend secure AI endpoint
      const response = await axios.post(
        '/api/ai/production/analyze',
        {
          context,
          mode,
          userPrompt,
        },
        { timeout: 8000 }
      );

      if (response.data && response.data.success && response.data.analysis) {
        const parsed = parseAIProductionResponse(response.data.analysis, baseReport, baseSuggestions);
        return {
          report: parsed.report,
          suggestions: parsed.suggestions,
          usedAI: true,
        };
      }
    } catch {
      // Graceful fallback to deterministic findings on network error or missing backend API key
    }

    return {
      report: baseReport,
      suggestions: baseSuggestions,
      usedAI: false,
    };
  }
}

export const aiProductionService = new AIProductionService();
