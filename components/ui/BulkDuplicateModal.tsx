import React, { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import Modal from './Modal';

interface BulkDuplicateModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  items: T[];
  getItemId: (item: T) => string;
  getItemLabel: (item: T) => string;
  onDuplicate: (selectedIds: string[], options: DuplicateOptions) => void;
  title?: string;
}

export interface DuplicateOptions {
  prefix?: string;
  suffix?: string;
  copiesCount: number;
  adjustDates?: boolean;
  daysOffset?: number;
}

/**
 * Modal de duplication en masse
 * Permet de sélectionner plusieurs éléments et de les dupliquer
 */
export function BulkDuplicateModal<T>({
  isOpen,
  onClose,
  items,
  getItemId,
  getItemLabel,
  onDuplicate,
  title = 'Duplication en masse',
}: BulkDuplicateModalProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [options, setOptions] = useState<DuplicateOptions>({
    prefix: '',
    suffix: ' (copie)',
    copiesCount: 1,
    adjustDates: true,
    daysOffset: 0,
  });

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(getItemId)));
    }
  };

  const handleDuplicate = () => {
    if (selectedIds.size === 0) {
      alert('Veuillez sélectionner au moins un élément à dupliquer');
      return;
    }

    onDuplicate(Array.from(selectedIds), options);
    onClose();
    setSelectedIds(new Set());
  };

  const totalCopies = selectedIds.size * options.copiesCount;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        {/* Sélection des éléments */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">
              Éléments à dupliquer ({selectedIds.size}/{items.length})
            </h3>
            <button
              onClick={toggleSelectAll}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              {selectedIds.size === items.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg">
            {items.map(item => {
              const id = getItemId(item);
              const isSelected = selectedIds.has(id);

              return (
                <div
                  key={id}
                  onClick={() => toggleSelection(id)}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50 transition-colors ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                >
                  <div
                    className={`w-5 h-5 border rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check size={14} className="text-white" />}
                  </div>
                  <span className={`text-sm ${isSelected ? 'text-blue-900 font-medium' : 'text-slate-700'}`}>
                    {getItemLabel(item)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Options de duplication */}
        <div className="space-y-4 border-t border-slate-200 pt-4">
          <h3 className="text-sm font-semibold text-slate-700">Options de duplication</h3>

          {/* Nombre de copies */}
          <div>
            <label className="block text-sm text-slate-600 mb-2">
              Nombre de copies par élément
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={options.copiesCount}
              onChange={e => setOptions(prev => ({ ...prev, copiesCount: parseInt(e.target.value) || 1 }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Préfixe */}
          <div>
            <label className="block text-sm text-slate-600 mb-2">
              Préfixe (optionnel)
            </label>
            <input
              type="text"
              value={options.prefix}
              onChange={e => setOptions(prev => ({ ...prev, prefix: e.target.value }))}
              placeholder="Ex: Copie de"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Suffixe */}
          <div>
            <label className="block text-sm text-slate-600 mb-2">
              Suffixe
            </label>
            <input
              type="text"
              value={options.suffix}
              onChange={e => setOptions(prev => ({ ...prev, suffix: e.target.value }))}
              placeholder="Ex: (copie)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Ajuster les dates */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="adjustDates"
              checked={options.adjustDates}
              onChange={e => setOptions(prev => ({ ...prev, adjustDates: e.target.checked }))}
              className="mt-1"
            />
            <div className="flex-1">
              <label htmlFor="adjustDates" className="block text-sm text-slate-700 font-medium cursor-pointer">
                Ajuster les dates
              </label>
              <p className="text-xs text-slate-500 mt-1">
                Les dates des éléments dupliqués seront décalées
              </p>
            </div>
          </div>

          {/* Décalage des dates */}
          {options.adjustDates && (
            <div className="ml-6">
              <label className="block text-sm text-slate-600 mb-2">
                Décalage (jours)
              </label>
              <input
                type="number"
                value={options.daysOffset}
                onChange={e => setOptions(prev => ({ ...prev, daysOffset: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
              <p className="text-xs text-slate-500 mt-1">
                Nombre de jours à ajouter aux dates (peut être négatif)
              </p>
            </div>
          )}
        </div>

        {/* Résumé */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-900">
            <Copy size={18} />
            <span className="font-medium">
              {totalCopies} élément{totalCopies > 1 ? 's' : ''} ser{totalCopies > 1 ? 'ont' : 'a'} créé{totalCopies > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleDuplicate}
            disabled={selectedIds.size === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Copy size={18} />
            Dupliquer
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default BulkDuplicateModal;
