import React, { useState } from 'react';
import { ProductionSuggestion } from '../types/productionSuggestion';
import { FindingCategory } from '../types/productionTypes';
import { ProductionSuggestionCard } from './ProductionSuggestionCard';
import { Filter } from 'lucide-react';

interface Props {
  suggestions: ProductionSuggestion[];
  onPreview: (id: string) => void;
  onApply: (id: string) => void;
  onReject: (id: string) => void;
}

export const ProductionSuggestions: React.FC<Props> = ({
  suggestions,
  onPreview,
  onApply,
  onReject,
}) => {
  const [filterCategory, setFilterCategory] = useState<FindingCategory | 'all'>('all');

  const filtered = suggestions.filter((s) => {
    if (filterCategory === 'all') return true;
    return s.category === filterCategory;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">
          Actionable Production Suggestions ({filtered.length})
        </h3>

        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as FindingCategory | 'all')}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            <option value="mix">Mix & Levels</option>
            <option value="arrangement">Arrangement</option>
            <option value="musical">Musical Content</option>
            <option value="automation">Automation</option>
            <option value="instrumentation">Instrumentation</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-8 text-center text-xs text-slate-400">
          No suggestions found for the selected category.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((sug) => (
            <ProductionSuggestionCard
              key={sug.id}
              suggestion={sug}
              onPreview={onPreview}
              onApply={onApply}
              onReject={onReject}
            />
          ))}
        </div>
      )}
    </div>
  );
};
