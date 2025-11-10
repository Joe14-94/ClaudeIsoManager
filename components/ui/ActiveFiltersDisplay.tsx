import React from 'react';
import { X, FilterX } from 'lucide-react';

interface ActiveFiltersDisplayProps {
  filters: { [key: string]: string };
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
}

const ActiveFiltersDisplay: React.FC<ActiveFiltersDisplayProps> = ({ filters, onRemoveFilter, onClearAll }) => {
  const activeFilterKeys = Object.keys(filters).filter(key => filters[key]);

  if (activeFilterKeys.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <span className="text-sm font-medium text-slate-600">Filtres actifs:</span>
      {activeFilterKeys.map(key => (
        <div key={key} className="flex items-center gap-1.5 bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
          <span>{key}: <strong>{filters[key]}</strong></span>
          <button onClick={() => onRemoveFilter(key)} className="rounded-full hover:bg-blue-200">
            <X size={14} />
          </button>
        </div>
      ))}
      {activeFilterKeys.length > 1 && (
        <button onClick={onClearAll} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 font-medium px-2 py-1 rounded-full hover:bg-slate-200">
          <FilterX size={14} />
          <span>Tout effacer</span>
        </button>
      )}
    </div>
  );
};

export default ActiveFiltersDisplay;
