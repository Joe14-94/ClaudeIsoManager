import { useState, useEffect } from 'react';

/**
 * Hook pour obtenir une version debounced d'une valeur.
 * La valeur retournée n'est mise à jour qu'après un délai d'inactivité.
 *
 * @param value La valeur à debouncer
 * @param delay Le délai en millisecondes
 * @returns La valeur debounced
 *
 * @example
 * ```tsx
 * const [searchQuery, setSearchQuery] = useState('');
 * const debouncedQuery = useDebouncedValue(searchQuery, 300);
 *
 * useEffect(() => {
 *   // Cette recherche ne s'effectue que 300ms après la dernière frappe
 *   performSearch(debouncedQuery);
 * }, [debouncedQuery]);
 * ```
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebouncedValue;
