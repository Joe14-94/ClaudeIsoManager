import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { StrategicOrientation } from '../types';
import Card, { CardContent } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { PlusCircle } from 'lucide-react';

const OrientationDetails: React.FC<{
  orientation: StrategicOrientation;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ orientation, onEdit, onDelete }) => (
  <div className="space-y-4 text-slate-700">
    <div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">Description</h3>
      <p>{orientation.description || 'Aucune description fournie.'}</p>
    </div>

    <div className="flex justify-end gap-2 pt-4 mt-6 border-t border-slate-200">
      <button onClick={onDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700">Supprimer</button>
      <button onClick={onEdit} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">Modifier</button>
    </div>
  </div>
);


const Orientations: React.FC = () => {
  const { orientations, setOrientations } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrientation, setCurrentOrientation] = useState<Partial<StrategicOrientation> | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('view');

  const handleOpenModal = (orientation: StrategicOrientation | null, mode: 'add' | 'edit' | 'view') => {
    if (mode === 'add') {
      setCurrentOrientation({ code: '', label: '', description: '', color: '#d8b4fe' });
    } else {
      setCurrentOrientation(orientation);
    }
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentOrientation(null);
  };

  const switchToEditMode = () => {
    if (currentOrientation) {
        setModalMode('edit');
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentOrientation) return;

    if (currentOrientation.id) {
      // Edit
      setOrientations(prevOrientations => prevOrientations.map(o => o.id === currentOrientation.id ? currentOrientation as StrategicOrientation : o));
    } else {
      // Add
      const newOrientation: StrategicOrientation = {
        ...currentOrientation,
        id: `so-${Date.now()}`,
        createdAt: new Date().toISOString(),
      } as StrategicOrientation;
      setOrientations(prevOrientations => [...prevOrientations, newOrientation]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    setOrientations(prevOrientations => prevOrientations.filter(o => o.id !== id));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (currentOrientation) {
      setCurrentOrientation({ ...currentOrientation, [e.target.name]: e.target.value });
    }
  };

  const getModalTitle = () => {
    switch (modalMode) {
      case 'add':
        return "Ajouter une orientation";
      case 'edit':
        return "Modifier l'orientation";
      case 'view':
        return `${currentOrientation?.code} - ${currentOrientation?.label}`;
      default:
        return "Orientation stratégique";
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Orientations stratégiques</h1>
        <button onClick={() => handleOpenModal(null, 'add')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <PlusCircle size={20} />
          <span>Nouvelle orientation</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orientations.map((orientation) => (
          <Card 
            key={orientation.id} 
            className="cursor-pointer hover:shadow-md transition-shadow duration-200" 
            onClick={() => handleOpenModal(orientation, 'view')}
          >
            <CardContent>
              <div className="font-semibold text-slate-800">
                  <span className="font-mono text-blue-600">{orientation.code}</span> - {orientation.label}
              </div>
              <p className="text-sm text-slate-500 mt-2 line-clamp-3">{orientation.description || 'Aucune description fournie.'}</p>
            </CardContent>
          </Card>
        ))}
      </div>

       {isModalOpen && currentOrientation && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
          title={getModalTitle()}
        >
          {modalMode === 'view' ? (
            <OrientationDetails
                orientation={currentOrientation as StrategicOrientation}
                onEdit={switchToEditMode}
                onDelete={() => {
                    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette orientation ?")) {
                        handleDelete(currentOrientation.id!);
                        handleCloseModal();
                    }
                }}
            />
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-slate-700">Code</label>
                <input 
                  type="text"
                  name="code"
                  id="code"
                  value={currentOrientation.code || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
               <div>
                <label htmlFor="label" className="block text-sm font-medium text-slate-700">Libellé</label>
                <input 
                  type="text"
                  name="label"
                  id="label"
                  value={currentOrientation.label || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  name="description"
                  id="description"
                  value={currentOrientation.description || ''}
                  onChange={handleChange}
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-transparent rounded-md hover:bg-slate-200">Annuler</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">Enregistrer</button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

export default Orientations;
