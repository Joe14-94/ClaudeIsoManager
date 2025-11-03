import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Objective, StrategicOrientation } from '../types';
import Card, { CardContent } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { PlusCircle, Trash2 } from 'lucide-react';

const ObjectiveDetails: React.FC<{
  objective: Objective;
  orientations: StrategicOrientation[];
}> = ({ objective, orientations }) => {
  const orientationsMap = new Map<string, StrategicOrientation>(orientations.map(o => [o.id, o]));
  
  return (
    <div className="space-y-4 text-slate-700">
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

      {objective.mesures_iso && objective.mesures_iso.length > 0 && (
          <div>
              <h4 className="font-semibold text-sm text-slate-600 mt-4 mb-2">Mesures ISO 27002 liées (lecture seule)</h4>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                  {objective.mesures_iso.map((mesure, index) => (
                      <div key={`${mesure.numero_mesure}-${index}`} className="p-2 bg-slate-50 border rounded-md">
                        <span className="px-2 py-1 text-xs font-mono bg-slate-200 text-slate-700 rounded-md">
                            {mesure.numero_mesure}
                        </span>
                        <p className="text-xs text-slate-600 mt-1">{mesure.description}</p>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

const Objectives: React.FC = () => {
  const { objectives, setObjectives, orientations } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<Objective> | null>(null);
  
  const handleOpenModal = (item?: Objective) => {
    setCurrentItem(item || { code: '', label: '', description: '', strategicOrientations: [] });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (currentItem) {
      setCurrentItem({ ...currentItem, [e.target.name]: e.target.value });
    }
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (currentItem) {
      const { name, options } = e.target;
      const value: string[] = [];
      for (let i = 0, l = options.length; i < l; i++) {
        if (options[i].selected) {
          value.push(options[i].value);
        }
      }
      setCurrentItem({ ...currentItem, [name]: value });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem || !currentItem.code || !currentItem.label) {
      alert("Le code et le libellé sont obligatoires.");
      return;
    }

    if (currentItem.id) { // Edit
      setObjectives(prev => prev.map(o => o.id === currentItem.id ? { ...o, ...currentItem } as Objective : o));
    } else { // Add
      const newObjective: Objective = {
        id: `obj-${Date.now()}`,
        createdAt: new Date().toISOString(),
        mesures_iso: [],
        ...currentItem
      } as Objective;
      setObjectives(prev => [newObjective, ...prev]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet objectif ?")) {
      setObjectives(prev => prev.filter(o => o.id !== id));
      handleCloseModal();
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Objectifs</h1>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <PlusCircle size={20} />
          <span>Nouvel objectif</span>
        </button>
      </div>
       <p className="text-slate-600">
        Les objectifs de la stratégie cybersécurité. Cliquez sur une carte pour la modifier.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {objectives.map((objective) => (
          <Card 
            key={objective.id} 
            className="cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={() => handleOpenModal(objective)}
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
          title={currentItem.id ? "Modifier l'objectif" : "Nouvel objectif"}
        >
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
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
              <textarea name="description" id="description" value={currentItem.description || ''} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="targetDate" className="block text-sm font-medium text-slate-700">Date Cible</label>
              <input type="date" name="targetDate" id="targetDate" value={currentItem.targetDate ? currentItem.targetDate.split('T')[0] : ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="strategicOrientations" className="block text-sm font-medium text-slate-700">Orientations stratégiques (maintenez Ctrl/Cmd pour sélectionner)</label>
              <select name="strategicOrientations" id="strategicOrientations" multiple value={currentItem.strategicOrientations || []} onChange={handleMultiSelectChange} className="mt-1 block w-full h-24 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm">
                {orientations.map(o => <option key={o.id} value={o.id}>{o.code} - {o.label}</option>)}
              </select>
            </div>
            
            {currentItem.id && (
                <ObjectiveDetails objective={currentItem as Objective} orientations={orientations} />
            )}

            <div className="flex justify-between items-center gap-2 pt-4 border-t mt-6">
                <div>
                    {currentItem.id && (
                        <button type="button" onClick={() => handleDelete(currentItem.id!)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                            <Trash2 size={16} /> Supprimer
                        </button>
                    )}
                </div>
                <div className="flex gap-2">
                    <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">Annuler</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Enregistrer</button>
                </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Objectives;