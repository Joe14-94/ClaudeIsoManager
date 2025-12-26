import { useState, useCallback } from 'react';
import { useUndoRedo, UndoableAction } from '../contexts/UndoRedoContext';

/**
 * Hook pour gérer un état avec support undo/redo
 *
 * @example
 * const [count, setCount] = useUndoableState(0, 'compteur');
 *
 * // Cette modification sera ajoutée à l'historique undo/redo
 * setCount(count + 1);
 */
export function useUndoableState<T>(
  initialValue: T,
  actionName: string
): [T, (newValue: T | ((prev: T) => T), description?: string) => void] {
  const [value, setValueInternal] = useState<T>(initialValue);
  const { addAction } = useUndoRedo();

  const setValue = useCallback(
    (newValue: T | ((prev: T) => T), description?: string) => {
      setValueInternal(prevValue => {
        const nextValue = typeof newValue === 'function'
          ? (newValue as (prev: T) => T)(prevValue)
          : newValue;

        // Ne rien faire si la valeur n'a pas changé
        if (prevValue === nextValue) {
          return prevValue;
        }

        // Créer une action undoable
        const action: UndoableAction = {
          type: `SET_${actionName.toUpperCase()}`,
          description: description || `Modifier ${actionName}`,
          timestamp: Date.now(),
          undo: () => setValueInternal(prevValue),
          redo: () => setValueInternal(nextValue),
          data: { from: prevValue, to: nextValue },
        };

        addAction(action);

        return nextValue;
      });
    },
    [actionName, addAction]
  );

  return [value, setValue];
}

/**
 * Helper pour créer des actions undoable personnalisées
 */
export function useUndoableAction() {
  const { addAction } = useUndoRedo();

  const createAction = useCallback(
    (
      description: string,
      undo: () => void,
      redo: () => void,
      type?: string
    ) => {
      const action: UndoableAction = {
        type: type || 'CUSTOM_ACTION',
        description,
        timestamp: Date.now(),
        undo,
        redo,
      };

      addAction(action);
    },
    [addAction]
  );

  return createAction;
}

/**
 * Helper pour créer des actions undoable pour des modifications de listes
 */
export function useUndoableList<T>(
  initialList: T[],
  listName: string,
  getItemId: (item: T) => string | number = (item: any) => item.id
): {
  list: T[];
  addItem: (item: T) => void;
  removeItem: (id: string | number) => void;
  updateItem: (id: string | number, updatedItem: T) => void;
  replaceList: (newList: T[]) => void;
} {
  const [list, setList] = useState<T[]>(initialList);
  const { addAction } = useUndoRedo();

  const addItem = useCallback(
    (item: T) => {
      const action: UndoableAction = {
        type: `ADD_${listName.toUpperCase()}`,
        description: `Ajouter un élément à ${listName}`,
        timestamp: Date.now(),
        undo: () => setList(prev => prev.filter(i => getItemId(i) !== getItemId(item))),
        redo: () => setList(prev => [...prev, item]),
      };

      addAction(action);
      setList(prev => [...prev, item]);
    },
    [listName, addAction, getItemId]
  );

  const removeItem = useCallback(
    (id: string | number) => {
      const itemToRemove = list.find(item => getItemId(item) === id);
      if (!itemToRemove) return;

      const indexToRemove = list.findIndex(item => getItemId(item) === id);

      const action: UndoableAction = {
        type: `REMOVE_${listName.toUpperCase()}`,
        description: `Supprimer un élément de ${listName}`,
        timestamp: Date.now(),
        undo: () => setList(prev => {
          const newList = [...prev];
          newList.splice(indexToRemove, 0, itemToRemove);
          return newList;
        }),
        redo: () => setList(prev => prev.filter(i => getItemId(i) !== id)),
      };

      addAction(action);
      setList(prev => prev.filter(i => getItemId(i) !== id));
    },
    [list, listName, addAction, getItemId]
  );

  const updateItem = useCallback(
    (id: string | number, updatedItem: T) => {
      const oldItem = list.find(item => getItemId(item) === id);
      if (!oldItem) return;

      const action: UndoableAction = {
        type: `UPDATE_${listName.toUpperCase()}`,
        description: `Modifier un élément de ${listName}`,
        timestamp: Date.now(),
        undo: () => setList(prev => prev.map(i => getItemId(i) === id ? oldItem : i)),
        redo: () => setList(prev => prev.map(i => getItemId(i) === id ? updatedItem : i)),
      };

      addAction(action);
      setList(prev => prev.map(i => getItemId(i) === id ? updatedItem : i));
    },
    [list, listName, addAction, getItemId]
  );

  const replaceList = useCallback(
    (newList: T[]) => {
      const oldList = list;

      const action: UndoableAction = {
        type: `REPLACE_${listName.toUpperCase()}`,
        description: `Remplacer ${listName}`,
        timestamp: Date.now(),
        undo: () => setList(oldList),
        redo: () => setList(newList),
      };

      addAction(action);
      setList(newList);
    },
    [list, listName, addAction]
  );

  return {
    list,
    addItem,
    removeItem,
    updateItem,
    replaceList,
  };
}
