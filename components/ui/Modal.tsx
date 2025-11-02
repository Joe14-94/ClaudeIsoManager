import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  position?: 'center' | 'right';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, position = 'center' }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

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
        className={modalClasses}
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white z-10">
          <h2 id="modal-title" className="text-xl font-bold text-slate-800">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-slate-500 hover:text-slate-800 transition-colors"
            aria-label="Fermer"
          >
            <X size={24} />
          </button>
        </header>
        <main className="p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Modal;