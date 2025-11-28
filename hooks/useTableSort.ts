
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
  
  return {
    sortConfig,
    requestSort,
    setSortConfig
  };
}
