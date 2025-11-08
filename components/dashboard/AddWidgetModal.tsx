import React from 'react';
import Modal from '../ui/Modal';
import Card from '../ui/Card';
import { WIDGET_REGISTRY, WidgetConfig } from './widgets/WidgetRegistry';
import { PlusCircle } from 'lucide-react';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (widgetConfig: WidgetConfig) => void;
  existingWidgetIds: string[];
}

const AddWidgetModal: React.FC<AddWidgetModalProps> = ({ isOpen, onClose, onAddWidget, existingWidgetIds }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajouter un widget">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {WIDGET_REGISTRY.map(widget => {
          const isAdded = existingWidgetIds.includes(widget.id);
          return (
            <Card 
              key={widget.id} 
              className={`p-4 transition-all ${isAdded ? 'bg-slate-100 opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-md hover:border-blue-500'}`}
              onClick={isAdded ? undefined : () => onAddWidget(widget)}
            >
              <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-semibold ${isAdded ? 'text-slate-500' : 'text-slate-800'}`}>{widget.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{widget.description}</p>
                  </div>
                  <button disabled={isAdded} className="p-1 rounded-full text-slate-500 disabled:text-slate-300 enabled:hover:bg-slate-100">
                    <PlusCircle size={22} />
                  </button>
              </div>
            </Card>
          );
        })}
      </div>
    </Modal>
  );
};

export default AddWidgetModal;
