import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Objective, StrategicOrientation } from '../types';
import Card, { CardContent } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { PlusCircle } from 'lucide-react';

const ObjectiveDetails: React.FC<{
  objective: Objective;
  onEdit: () => void;
  onDelete: () => void;
  orientations: StrategicOrientation[];
}> = ({ objective, onEdit, onDelete, orientations }) => {
  const orientationsMap = new Map<string, StrategicOrientation>(orientations.map(o => [o.id, o]));
  
  return (
    <div className="space-y-4 text-slate-700">
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Description</h3>
        <p>{objective.description || 'Aucune description fournie.'}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
              <h4 className="font-semibold text-sm text-slate-600">Date cible</h4>
              <p>{objective.targetDate ? new Date(objective.targetDate).toLocaleDateString('fr-FR') : 'Non définie'}</p>
          </div>
          <div>
              <h4 className="font-semibold text-sm text-slate-600">Statut</h4>
              <p>{objective.statut || 'Non défini'}</p>
          </div>
           <div>
              <h4 className="font-semibold text-sm text-slate-600">Priorité</h4>
              <p>{objective.priorite || 'Non définie'}</p>
          </div>
          <div>
              <h4 className="font-semibold text-sm text-slate-600">Complexité</h4>
              <p>{objective.complexite || 'Non définie'}</p>
          </div>
      </div>

      <div>
          <h4 className="font-semibold text-sm text-slate-600 mt-4 mb-2">Orientations stratégiques liées</h4>
          <div className="flex flex-wrap gap-2">
              {objective.strategicOrientations.map(soId => {
                  const orientation = orientationsMap.get(soId);
                  if (!orientation) return null;
                  return (
                      <span
                        key={soId}
                        className="px-2 py-1 text-xs font-normal rounded-full border"
                        style={{ 
                          backgroundColor: `${orientation.color || '#D1D5DB'}40`,
                          borderColor: orientation.color || '#D1D5DB',
                          color: '#1e293b'
                        }}
                      >
                        {orientation.code}
                      </span>
                  );
              })}
          </div>
      </div>

      {objective.mesures_iso && objective.mesures_iso.length > 0 && (
          <div>
              <h4 className="font-semibold text-sm text-slate-600 mt-4 mb-2">Mesures ISO 27002 liées</h4>
              <div className="flex flex-wrap gap-2">
                  {objective.mesures_iso.map((mesure, index) => (
                      <span key={`${mesure.numero_mesure}-${index}`} className="px-2 py-1 text-xs font-mono bg-slate-100 text-slate-700 rounded-md">
                          {mesure.numero_mesure}
                      </span>
                  ))}
              </div>
          </div>
      )}

      <div className="flex justify-end gap-2 pt-4 mt-6 border-t border-slate-200">
        <button onClick={onDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700">Supprimer</button>
        <button onClick={onEdit} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">Modifier</button>
      </div>
    </div>
  );
};

const Objectives: React.FC = () => {
  const { objectives, setObjectives, orientations } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<Objective> | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('view');

  const handleOpenModal = (objective: Objective | null, mode: 'add' | 'edit' | 'view') => {
    if (mode === 'add') {
      setCurrentItem({ code: '', label: '', description: '', strategicOrientations: [] });
    } else {
      setCurrentItem(objective);
    }
    setModalMode(mode);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const switchToEditMode = () => {
    if (currentItem) {
        setModalMode('edit');
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentItem) return;

    const objectiveToSave = {
        ...currentItem,
        targetDate: currentItem.targetDate ? new Date(currentItem.targetDate).toISOString() : undefined,
    };

    if (objectiveToSave.id) {
      setObjectives(prevObjectives => prevObjectives.map(o => o.id === objectiveToSave.id ? objectiveToSave as Objective : o));
    } else {
      const newObjective: Objective = {
        ...objectiveToSave,
        id: `obj-${Date.now()}`,
        createdAt: new Date().toISOString(),
      } as Objective;
      setObjectives(prevObjectives => [...prevObjectives, newObjective]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
      setObjectives(prevObjectives => prevObjectives.filter(o => o.id !== id));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (currentItem) {
      setCurrentItem({ ...currentItem, [e.target.name]: e.target.value });
    }
  };

  const handleOrientationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (currentItem) {
      const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
      setCurrentItem({ ...currentItem, strategicOrientations: selectedIds });
    }
  };

  const getModalTitle = () => {
    switch (modalMode) {
      case 'add':
        return "Ajouter un objectif";
      case 'edit':
        return "Modifier l'objectif";
      case 'view':
        return `${currentItem?.code} - ${currentItem?.label}`;
      default:
        return "Objectif";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Objectifs</h1>
        <button onClick={() => handleOpenModal(null, 'add')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <PlusCircle size={20} />
          <span>Nouvel objectif</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {objectives.map((objective) => (
          <Card 
            key={objective.id} 
            className="cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={() => handleOpenModal(objective, 'view')}
          >
            <CardContent>
              <div className="font-semibold text-slate-800">
                <span className="font-mono text-blue-600">{objective.code}</span> - {objective.label}
              </div>
              <p className="text-sm text-slate-500 mt-2 line-clamp-3">{objective.description || 'Aucune description fournie.'}</p>
            </CardContent>
          </Card>
        ))}
      </div>

       {isModalOpen && currentItem && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
          title={getModalTitle()}
        >
          {modalMode === 'view' ? (
             <ObjectiveDetails
                objective={currentItem as Objective}
                onEdit={switchToEditMode}
                onDelete={() => {
                    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet objectif ?")) {
                        handleDelete(currentItem.id!);
                        handleCloseModal();
                    }
                }}
                orientations={orientations}
            />
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-slate-700">Code</label>
                <input type="text" name="code" id="code" value={currentItem.code || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" required />
              </div>
              <div>
                <label htmlFor="label" className="block text-sm font-medium text-slate-700">Libellé</label>
                <input type="text" name="label" id="label" value={currentItem.label || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" required />
              </div>
              <div>
                <label htmlFor="targetDate" className="block text-sm font-medium text-slate-700">Date cible</label>
                <input type="date" name="targetDate" id="targetDate" value={currentItem.targetDate?.split('T')[0] || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" />
              </div>
               <div>
                <label htmlFor="strategicOrientations" className="block text-sm font-medium text-slate-700">Orientations stratégiques</label>
                <select name="strategicOrientations" id="strategicOrientations" multiple value={currentItem.strategicOrientations || []} onChange={handleOrientationChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm h-32" required>
                  {orientations.map(o => <option key={o.id} value={o.id}>{o.code} - {o.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
                <textarea name="description" id="description" value={currentItem.description || ''} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" />
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

export default Objectives;
