import React, { useState, useRef, useEffect } from 'react';
import { Save, Bookmark, Trash2, ChevronDown } from 'lucide-react';
import { SavedFilter } from '../../hooks/useSavedFilters';

interface SavedFiltersMenuProps {
  savedFilters: SavedFilter[];
  onSave: (name: string) => void;
  onLoad: (filterId: string) => void;
  onDelete: (filterId: string) => void;
  hasActiveFilters: boolean;
}

/**
 * Menu dropdown pour gérer les filtres sauvegardés
 */
export function SavedFiltersMenu({
  savedFilters,
  onSave,
  onLoad,
  onDelete,
  hasActiveFilters,
}: SavedFiltersMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le menu quand on clique dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsSaveDialogOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = () => {
    if (filterName.trim()) {
      onSave(filterName.trim());
      setFilterName('');
      setIsSaveDialogOpen(false);
      setIsOpen(false);
    }
  };

  const handleLoad = (filterId: string) => {
    onLoad(filterId);
    setIsOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, filterId: string) => {
    e.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer ce filtre sauvegardé ?')) {
      onDelete(filterId);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition-colors"
        title="Filtres sauvegardés"
      >
        <Bookmark size={16} className="text-slate-600" />
        <span className="text-sm text-slate-700">Filtres</span>
        {savedFilters.length > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
            {savedFilters.length}
          </span>
        )}
        <ChevronDown size={14} className="text-slate-500" />
      </button>

      {isOpen && (
        <div className="absolute z-30 right-0 mt-2 w-72 bg-white shadow-lg rounded-lg border border-slate-200 py-2">
          {/* Bouton pour sauvegarder les filtres actuels */}
          {!isSaveDialogOpen && (
            <button
              onClick={() => setIsSaveDialogOpen(true)}
              disabled={!hasActiveFilters}
              className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} className="text-blue-600" />
              <span>Sauvegarder les filtres actuels</span>
            </button>
          )}

          {/* Dialog de sauvegarde */}
          {isSaveDialogOpen && (
            <div className="px-4 py-3 border-b border-slate-200">
              <p className="text-xs text-slate-600 mb-2">Nom du filtre :</p>
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="Ex: Projets en cours"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSave}
                  disabled={!filterName.trim()}
                  className="flex-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sauvegarder
                </button>
                <button
                  onClick={() => {
                    setIsSaveDialogOpen(false);
                    setFilterName('');
                  }}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Liste des filtres sauvegardés */}
          {!isSaveDialogOpen && savedFilters.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs font-medium text-slate-500 uppercase border-t border-slate-200 mt-2">
                Filtres sauvegardés
              </div>
              <div className="max-h-60 overflow-y-auto">
                {savedFilters.map((filter) => (
                  <div
                    key={filter.id}
                    className="group flex items-center justify-between px-4 py-2 hover:bg-slate-50 cursor-pointer"
                    onClick={() => handleLoad(filter.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {filter.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(filter.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, filter.id)}
                      className="ml-2 p-1 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Supprimer ce filtre"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {!isSaveDialogOpen && savedFilters.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              Aucun filtre sauvegardé
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SavedFiltersMenu;
