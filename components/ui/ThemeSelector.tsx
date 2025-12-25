import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme, ThemeName } from '../../contexts/ThemeContext';

/**
 * Composant de sélection de thème
 */
export function ThemeSelector() {
  const { currentTheme, themeName, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le menu quand on clique dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeChange = (newTheme: ThemeName) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  // Couleurs pour chaque thème (pour l'aperçu)
  const themeColors: Record<ThemeName, string[]> = {
    default: ['#2563eb', '#0f172a', '#10b981'],
    ocean: ['#0891b2', '#0d9488', '#0284c7'],
    forest: ['#16a34a', '#059669', '#84cc16'],
    sunset: ['#ea580c', '#f59e0b', '#f43f5e'],
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
        title="Changer le thème de couleur"
      >
        <Palette size={18} className="text-slate-600" />
        <span className="hidden sm:inline text-sm text-slate-700">Thème</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 right-0 mt-2 w-64 bg-white shadow-lg rounded-lg border border-slate-200 py-2">
          <div className="px-4 py-2 text-xs font-medium text-slate-500 uppercase border-b border-slate-200">
            Choisir un thème
          </div>

          {availableThemes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => handleThemeChange(theme.name)}
              className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                {/* Aperçu des couleurs */}
                <div className="flex gap-1">
                  {themeColors[theme.name].map((color, idx) => (
                    <div
                      key={idx}
                      className="w-4 h-4 rounded-full border border-slate-300"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700">{theme.label}</p>
                  {themeName === theme.name && (
                    <p className="text-xs text-slate-500">Thème actuel</p>
                  )}
                </div>
              </div>

              {themeName === theme.name && (
                <Check size={18} className="text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ThemeSelector;
