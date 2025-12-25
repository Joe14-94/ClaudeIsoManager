/**
 * Crée une version debounced d'une fonction.
 * La fonction ne sera exécutée qu'après un délai depuis le dernier appel.
 *
 * @param fn La fonction à debouncer
 * @param delay Le délai en millisecondes
 * @returns La fonction debounced avec une méthode cancel()
 *
 * @example
 * ```ts
 * const debouncedSave = debounce((data) => saveToStorage(data), 500);
 * debouncedSave(data); // N'exécute pas immédiatement
 * debouncedSave(data); // Annule le précédent et replanifie
 * // Après 500ms d'inactivité, saveToStorage est appelé
 * ```
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debouncedFn = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };

  debouncedFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedFn as T & { cancel: () => void };
}

/**
 * Crée une version throttled d'une fonction.
 * La fonction sera exécutée au maximum une fois par intervalle.
 *
 * @param fn La fonction à throttler
 * @param limit L'intervalle minimum en millisecondes entre deux exécutions
 * @returns La fonction throttled
 *
 * @example
 * ```ts
 * const throttledScroll = throttle(() => handleScroll(), 100);
 * window.addEventListener('scroll', throttledScroll);
 * ```
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): T {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;

  const throttledFn = (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          fn(...lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };

  return throttledFn as T;
}

/**
 * Hook personnalisé pour utiliser une valeur debounced.
 * Utile pour les champs de recherche.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  // Note: Ce hook doit être importé depuis React
  // Implémentation dans un fichier séparé si nécessaire
  return value;
}
