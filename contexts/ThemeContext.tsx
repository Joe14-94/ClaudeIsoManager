import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/storage';

export type ThemeName = 'default' | 'ocean' | 'forest' | 'sunset';

export interface Theme {
  name: ThemeName;
  label: string;
  colors: {
    primary: string;
    primaryHover: string;
    secondary: string;
    secondaryHover: string;
    accent: string;
    accentHover: string;
    background: string;
    surface: string;
    surfaceHover: string;
  };
}

export const themes: Record<ThemeName, Theme> = {
  default: {
    name: 'default',
    label: 'Défaut (Bleu)',
    colors: {
      primary: 'bg-blue-600',
      primaryHover: 'hover:bg-blue-700',
      secondary: 'bg-slate-600',
      secondaryHover: 'hover:bg-slate-700',
      accent: 'bg-emerald-600',
      accentHover: 'hover:bg-emerald-700',
      background: 'bg-slate-100',
      surface: 'bg-white',
      surfaceHover: 'hover:bg-slate-50',
    },
  },
  ocean: {
    name: 'ocean',
    label: 'Océan (Cyan)',
    colors: {
      primary: 'bg-cyan-600',
      primaryHover: 'hover:bg-cyan-700',
      secondary: 'bg-teal-600',
      secondaryHover: 'hover:bg-teal-700',
      accent: 'bg-sky-600',
      accentHover: 'hover:bg-sky-700',
      background: 'bg-cyan-50',
      surface: 'bg-white',
      surfaceHover: 'hover:bg-cyan-50',
    },
  },
  forest: {
    name: 'forest',
    label: 'Forêt (Vert)',
    colors: {
      primary: 'bg-green-600',
      primaryHover: 'hover:bg-green-700',
      secondary: 'bg-emerald-600',
      secondaryHover: 'hover:bg-emerald-700',
      accent: 'bg-lime-600',
      accentHover: 'hover:bg-lime-700',
      background: 'bg-green-50',
      surface: 'bg-white',
      surfaceHover: 'hover:bg-green-50',
    },
  },
  sunset: {
    name: 'sunset',
    label: 'Coucher de soleil (Orange)',
    colors: {
      primary: 'bg-orange-600',
      primaryHover: 'hover:bg-orange-700',
      secondary: 'bg-amber-600',
      secondaryHover: 'hover:bg-amber-700',
      accent: 'bg-rose-600',
      accentHover: 'hover:bg-rose-700',
      background: 'bg-orange-50',
      surface: 'bg-white',
      surfaceHover: 'hover:bg-orange-50',
    },
  },
};

interface ThemeContextType {
  currentTheme: Theme;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>(() =>
    loadFromLocalStorage<ThemeName>('app-theme', 'default')
  );

  useEffect(() => {
    saveToLocalStorage('app-theme', themeName);

    // Appliquer la classe de thème au body pour les styles globaux
    document.body.classList.remove('theme-default', 'theme-ocean', 'theme-forest', 'theme-sunset');
    document.body.classList.add(`theme-${themeName}`);

    // Mise à jour de la couleur de fond du body
    const bgClass = themes[themeName].colors.background;
    const bgColor = bgClass.replace('bg-', '');
    document.body.className = document.body.className.replace(/bg-\S+/g, '');
    document.body.classList.add(bgClass);
  }, [themeName]);

  const setTheme = (newThemeName: ThemeName) => {
    setThemeName(newThemeName);
  };

  const value: ThemeContextType = {
    currentTheme: themes[themeName],
    themeName,
    setTheme,
    availableThemes: Object.values(themes),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
