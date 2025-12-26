import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  action: () => void;
  category: 'navigation' | 'actions' | 'global';
}

/**
 * Hook pour gérer les raccourcis clavier globaux
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignorer si on est dans un champ de saisie
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Chercher le raccourci correspondant
      const matchingShortcut = shortcuts.find((shortcut) => {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;

        return keyMatches && ctrlMatches && altMatches && shiftMatches;
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
}

/**
 * Hook pour les raccourcis de navigation principaux
 */
export function useNavigationShortcuts() {
  const navigate = useNavigate();

  const shortcuts: KeyboardShortcut[] = [
    // Navigation avec 'g' prefix (Gmail style)
    {
      key: 'd',
      description: 'Aller au Dashboard',
      action: () => navigate('/dashboard'),
      category: 'navigation',
    },
    {
      key: 'p',
      description: 'Aller aux Projets',
      action: () => navigate('/projets'),
      category: 'navigation',
    },
    {
      key: 'a',
      description: 'Aller aux Activités',
      action: () => navigate('/activities'),
      category: 'navigation',
    },
    {
      key: 'i',
      description: 'Aller aux Initiatives',
      action: () => navigate('/initiatives'),
      category: 'navigation',
    },
    {
      key: 'o',
      description: 'Aller aux Orientations',
      action: () => navigate('/orientations'),
      category: 'navigation',
    },
  ];

  return shortcuts;
}

/**
 * Formatte un raccourci pour l'affichage
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrl) {
    parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
  }
  if (shortcut.alt) {
    parts.push(navigator.platform.includes('Mac') ? '⌥' : 'Alt');
  }
  if (shortcut.shift) {
    parts.push('⇧');
  }

  parts.push(shortcut.key.toUpperCase());

  return parts.join(' + ');
}
