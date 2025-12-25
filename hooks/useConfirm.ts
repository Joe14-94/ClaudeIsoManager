import { useState, useCallback } from 'react';

type ConfirmVariant = 'warning' | 'danger' | 'info' | 'success';

interface ConfirmOptions {
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolve: ((value: boolean) => void) | null;
}

interface UseConfirmReturn {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  confirmState: ConfirmState;
  handleConfirm: () => void;
  handleCancel: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

/**
 * Hook pour afficher des modales de confirmation de manière programmatique.
 * Remplace window.confirm() avec une interface moderne.
 *
 * @example
 * ```tsx
 * const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Supprimer l\'élément',
 *     message: 'Cette action est irréversible.',
 *     variant: 'danger',
 *     confirmText: 'Supprimer',
 *   });
 *
 *   if (confirmed) {
 *     // Effectuer la suppression
 *   }
 * };
 *
 * return (
 *   <>
 *     <button onClick={handleDelete}>Supprimer</button>
 *     <ConfirmModal
 *       isOpen={confirmState.isOpen}
 *       onConfirm={handleConfirm}
 *       onCancel={handleCancel}
 *       {...confirmState}
 *     />
 *   </>
 * );
 * ```
 */
export function useConfirm(): UseConfirmReturn {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    variant: 'warning',
    resolve: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText ?? 'Confirmer',
        cancelText: options.cancelText ?? 'Annuler',
        variant: options.variant ?? 'warning',
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(true);
    }
    setConfirmState((prev) => ({ ...prev, isOpen: false, resolve: null }));
    setIsLoading(false);
  }, [confirmState.resolve]);

  const handleCancel = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(false);
    }
    setConfirmState((prev) => ({ ...prev, isOpen: false, resolve: null }));
    setIsLoading(false);
  }, [confirmState.resolve]);

  return {
    confirm,
    confirmState,
    handleConfirm,
    handleCancel,
    isLoading,
    setIsLoading,
  };
}

export default useConfirm;
