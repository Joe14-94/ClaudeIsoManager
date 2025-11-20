
import { useState, useMemo } from 'react';

export type SortDirection = 'ascending' | 'descending';

interface SortConfig<T> {
  key: keyof T | string;
  direction: SortDirection;
}

export function useTableSort<T>(
  data: T[],
  initialKey: keyof T | string = 'id'
) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    key: initialKey,
    direction: 'ascending',
  });

  const requestSort = (key: keyof T | string) => {
    let direction: SortDirection = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Note: Le tri réel des données est souvent dépendant de logiques métier spécifiques (champs calculés).
  // Ce hook fournit l'état et la fonction de gestion, mais le tri lui-même est souvent fait via un useMemo dans le composant parent
  // ou via une fonction de comparaison passée en argument si on voulait aller plus loin dans l'abstraction.
  
  return {
    sortConfig,
    requestSort,
    setSortConfig
  };
}
