import { useState, useEffect, useCallback } from 'react';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/storage';

export interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, any>;
  createdAt: string;
}

export interface UseSavedFiltersReturn {
  savedFilters: SavedFilter[];
  saveCurrentFilter: (name: string, currentFilters: Record<string, any>) => void;
  loadFilter: (filterId: string) => Record<string, any> | null;
  deleteFilter: (filterId: string) => void;
  updateFilter: (filterId: string, newFilters: Record<string, any>) => void;
}

/**
 * Hook pour gérer les filtres sauvegardés
 * @param storageKey Clé unique de stockage pour ce type de filtres (ex: 'activities-filters')
 */
export function useSavedFilters(storageKey: string): UseSavedFiltersReturn {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() =>
    loadFromLocalStorage<SavedFilter[]>(`saved-filters-${storageKey}`, [])
  );

  // Sauvegarder automatiquement dans localStorage à chaque changement
  useEffect(() => {
    saveToLocalStorage(`saved-filters-${storageKey}`, savedFilters);
  }, [savedFilters, storageKey]);

  /**
   * Sauvegarde les filtres actuels
   */
  const saveCurrentFilter = useCallback((name: string, currentFilters: Record<string, any>) => {
    // Vérifier si un filtre avec ce nom existe déjà
    const existingFilterIndex = savedFilters.findIndex(f => f.name === name);

    if (existingFilterIndex >= 0) {
      // Mettre à jour le filtre existant
      setSavedFilters(prev => {
        const updated = [...prev];
        updated[existingFilterIndex] = {
          ...updated[existingFilterIndex],
          filters: currentFilters,
        };
        return updated;
      });
    } else {
      // Créer un nouveau filtre
      const newFilter: SavedFilter = {
        id: `filter-${Date.now()}`,
        name,
        filters: currentFilters,
        createdAt: new Date().toISOString(),
      };
      setSavedFilters(prev => [newFilter, ...prev]);
    }
  }, [savedFilters]);

  /**
   * Charge un filtre sauvegardé
   */
  const loadFilter = useCallback((filterId: string): Record<string, any> | null => {
    const filter = savedFilters.find(f => f.id === filterId);
    return filter ? filter.filters : null;
  }, [savedFilters]);

  /**
   * Supprime un filtre sauvegardé
   */
  const deleteFilter = useCallback((filterId: string) => {
    setSavedFilters(prev => prev.filter(f => f.id !== filterId));
  }, []);

  /**
   * Met à jour un filtre existant
   */
  const updateFilter = useCallback((filterId: string, newFilters: Record<string, any>) => {
    setSavedFilters(prev => prev.map(f =>
      f.id === filterId
        ? { ...f, filters: newFilters }
        : f
    ));
  }, []);

  return {
    savedFilters,
    saveCurrentFilter,
    loadFilter,
    deleteFilter,
    updateFilter,
  };
}
