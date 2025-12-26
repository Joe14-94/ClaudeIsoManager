import React from 'react';
import { Undo, Redo } from 'lucide-react';
import { useUndoRedo } from '../../contexts/UndoRedoContext';
import Tooltip from './Tooltip';

/**
 * Composant indicateur Undo/Redo
 * Affiche les boutons d'annulation et de rétablissement
 */
export function UndoRedoIndicator() {
  const { canUndo, canRedo, undo, redo, historySize, currentIndex } = useUndoRedo();

  // Ne rien afficher s'il n'y a pas d'historique
  if (historySize === 0) {
    return null;
  }

  const isMac = navigator.platform.includes('Mac');
  const undoShortcut = isMac ? '⌘Z' : 'Ctrl+Z';
  const redoShortcut = isMac ? '⌘⇧Z' : 'Ctrl+Y';

  return (
    <div className="fixed bottom-20 right-4 bg-white border border-slate-200 rounded-lg shadow-lg p-2 flex items-center gap-1 z-40">
      <Tooltip text={`Annuler (${undoShortcut})`}>
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`p-2 rounded hover:bg-slate-100 transition-colors ${
            !canUndo ? 'opacity-40 cursor-not-allowed' : ''
          }`}
          title={`Annuler (${undoShortcut})`}
        >
          <Undo size={18} className={canUndo ? 'text-slate-700' : 'text-slate-400'} />
        </button>
      </Tooltip>

      <div className="h-6 w-px bg-slate-300 mx-1"></div>

      <Tooltip text={`Rétablir (${redoShortcut})`}>
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`p-2 rounded hover:bg-slate-100 transition-colors ${
            !canRedo ? 'opacity-40 cursor-not-allowed' : ''
          }`}
          title={`Rétablir (${redoShortcut})`}
        >
          <Redo size={18} className={canRedo ? 'text-slate-700' : 'text-slate-400'} />
        </button>
      </Tooltip>

      <div className="h-6 w-px bg-slate-300 mx-1"></div>

      <div className="px-2 text-xs text-slate-500">
        {currentIndex + 1}/{historySize}
      </div>
    </div>
  );
}

export default UndoRedoIndicator;
