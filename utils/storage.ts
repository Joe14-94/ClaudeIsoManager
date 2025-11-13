
export function loadFromLocalStorage<T>(key: string, initialData: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    // If not found, set initial data into localStorage for next time
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage`, error);
    // Fallback to initial data if localStorage is corrupt or unavailable
    return initialData;
  }
}

export function saveToLocalStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage`, error);
  }
}