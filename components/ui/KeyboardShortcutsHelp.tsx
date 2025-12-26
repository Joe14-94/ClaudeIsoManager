import React, { useState, useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';
import Modal from './Modal';
import { KeyboardShortcut, formatShortcut } from '../../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
}

/**
 * Composant d'aide pour afficher les raccourcis clavier disponibles
 */
export function KeyboardShortcutsHelp({ shortcuts }: KeyboardShortcutsHelpProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ouvrir avec "?"
      if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
        const target = event.target as HTMLElement;
        // Ignorer si on est dans un champ de saisie
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return;
        }
        event.preventDefault();
        setIsOpen(true);
      }

      // Fermer avec Échap
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

  // Grouper les raccourcis par catégorie
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  const categoryLabels: Record<string, string> = {
    navigation: 'Navigation',
    actions: 'Actions',
    global: 'Global',
  };

  return (
    <>
      {/* Bouton pour ouvrir l'aide */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 transition-colors z-40"
        title="Raccourcis clavier (appuyez sur ?)"
      >
        <Keyboard size={20} />
      </button>

      {/* Modal d'aide */}
      {isOpen && (
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Raccourcis clavier">
          <div className="space-y-6">
            <p className="text-sm text-slate-600">
              Utilisez ces raccourcis pour naviguer plus rapidement dans l'application.
            </p>

            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                  {categoryLabels[category] || category}
                </h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <span className="text-sm text-slate-700">{shortcut.description}</span>
                      <kbd className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded shadow-sm">
                        {formatShortcut(shortcut)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between py-2 px-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-700 font-medium">Afficher cette aide</span>
                <kbd className="px-3 py-1.5 text-xs font-semibold text-blue-800 bg-white border border-blue-300 rounded shadow-sm">
                  ?
                </kbd>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-blue-50 rounded-lg mt-2">
                <span className="text-sm text-blue-700 font-medium">Fermer les fenêtres</span>
                <kbd className="px-3 py-1.5 text-xs font-semibold text-blue-800 bg-white border border-blue-300 rounded shadow-sm">
                  Échap
                </kbd>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

export default KeyboardShortcutsHelp;
