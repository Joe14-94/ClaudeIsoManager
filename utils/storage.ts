
export function loadFromLocalStorage<T>(key: string, initialData: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    // If not found, set initial data into localStorage for next time
    // We use a safe save here to handle potential quotas even on init
    safeSaveToLocalStorage(key, initialData);
    return initialData;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage`, error);
    // Fallback to initial data if localStorage is corrupt or unavailable
    return initialData;
  }
}

// Interne : Fonction de sauvegarde sécurisée
function safeSaveToLocalStorage<T>(key: string, data: T): void {
     try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error: any) {
        if (error.name === 'QuotaExceededError' || error.code === 22) {
            console.error("LocalStorage Quota Exceeded! Data cannot be saved.", error);
            // On pourrait ajouter un système de notification global ici si besoin
            // alert("Attention : L'espace de stockage local est plein. Vos dernières modifications ne peuvent pas être sauvegardées automatiquement. Veuillez faire une sauvegarde manuelle (Export JSON) et nettoyer vos données.");
        } else {
             console.error(`Error saving ${key} to localStorage`, error);
        }
    }
}

export function saveToLocalStorage<T>(key: string, data: T): void {
  safeSaveToLocalStorage(key, data);
}
