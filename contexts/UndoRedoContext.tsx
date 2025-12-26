import React, { createContext, useContext, useState, useCallback, useEffect, PropsWithChildren } from 'react';

export interface UndoableAction<T = any> {
  type: string;
  undo: () => void;
  redo: () => void;
  data?: T;
  timestamp: number;
  description: string;
}

interface UndoRedoContextType {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  addAction: (action: UndoableAction) => void;
  clearHistory: () => void;
  historySize: number;
  currentIndex: number;
}

const UndoRedoContext = createContext<UndoRedoContextType | undefined>(undefined);

const MAX_HISTORY_SIZE = 50; // Limite de l'historique pour éviter les fuites mémoire

export const UndoRedoProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [history, setHistory] = useState<UndoableAction[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;

  /**
   * Ajoute une nouvelle action à l'historique
   */
  const addAction = useCallback((action: UndoableAction) => {
    setHistory(prev => {
      // Supprimer toutes les actions après l'index actuel (si on a fait undo)
      const newHistory = prev.slice(0, currentIndex + 1);

      // Ajouter la nouvelle action
      newHistory.push(action);

      // Limiter la taille de l'historique
      if (newHistory.length > MAX_HISTORY_SIZE) {
        return newHistory.slice(newHistory.length - MAX_HISTORY_SIZE);
      }

      return newHistory;
    });

    setCurrentIndex(prev => {
      const newIndex = prev + 1;
      return newIndex >= MAX_HISTORY_SIZE ? MAX_HISTORY_SIZE - 1 : newIndex;
    });
  }, [currentIndex]);

  /**
   * Annule la dernière action
   */
  const undo = useCallback(() => {
    if (!canUndo) return;

    const action = history[currentIndex];
    if (action) {
      action.undo();
      setCurrentIndex(prev => prev - 1);
    }
  }, [canUndo, currentIndex, history]);

  /**
   * Refait une action annulée
   */
  const redo = useCallback(() => {
    if (!canRedo) return;

    const action = history[currentIndex + 1];
    if (action) {
      action.redo();
      setCurrentIndex(prev => prev + 1);
    }
  }, [canRedo, currentIndex, history]);

  /**
   * Efface tout l'historique
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  // Gérer les raccourcis clavier Ctrl+Z et Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.includes('Mac');
      const modifier = isMac ? event.metaKey : event.ctrlKey;

      // Ignorer si on est dans un champ de saisie
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Undo: Ctrl+Z ou Cmd+Z
      if (modifier && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      }

      // Redo: Ctrl+Y ou Cmd+Shift+Z
      if (
        (modifier && event.key === 'y') ||
        (modifier && event.shiftKey && event.key === 'z')
      ) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const value: UndoRedoContextType = {
    canUndo,
    canRedo,
    undo,
    redo,
    addAction,
    clearHistory,
    historySize: history.length,
    currentIndex,
  };

  return <UndoRedoContext.Provider value={value}>{children}</UndoRedoContext.Provider>;
};

export const useUndoRedo = (): UndoRedoContextType => {
  const context = useContext(UndoRedoContext);
  if (!context) {
    throw new Error('useUndoRedo must be used within an UndoRedoProvider');
  }
  return context;
};
