import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  position?: 'center' | 'right';
  /** Désactiver le focus trap (par défaut: false) */
  disableFocusTrap?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  headerActions,
  position = 'center',
  disableFocusTrap = false
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Sélecteurs pour les éléments focusables
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return [];
    return Array.from(
      modalRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Sauvegarder l'élément actif avant l'ouverture
    previousActiveElement.current = document.activeElement as HTMLElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap
      if (event.key === 'Tab' && !disableFocusTrap) {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    // Focus sur le premier élément focusable
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Bloquer le scroll du body
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
      // Restaurer le focus sur l'élément précédent
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose, disableFocusTrap, getFocusableElements]);

  if (!isOpen) return null;

  const overlayClasses = position === 'center'
    ? "fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
    : "fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end";
    
  const modalClasses = position === 'center'
    ? "bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] flex flex-col"
    : "bg-white shadow-xl h-full w-full max-w-lg flex flex-col";

  return (
    <div
      className={overlayClasses}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={modalClasses}
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white z-10">
          <h2 id="modal-title" className="text-xl font-bold text-slate-800">{title}</h2>
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            {headerActions}
            <button 
              onClick={onClose} 
              className="p-1 rounded-md hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
              aria-label="Fermer"
            >
              <X size={24} />
            </button>
          </div>
        </header>
        <main className="p-4 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Modal;