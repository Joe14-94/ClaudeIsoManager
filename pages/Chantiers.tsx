import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Chantier, StrategicOrientation } from '../types';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { Workflow, PlusCircle, Edit, Trash2 } from 'lucide-react';

const Chantiers: React.FC = () => {
  const { chantiers, setChantiers, orientations } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<Chantier> | null>(null);

  const orientationsMap = new Map<string, StrategicOrientation>(orientations.map(o => [o.id, o]));

  const handleOpenModal = (chantier?: Chantier) => {
    setCurrentItem(chantier || { code: '', label: '', description: '', strategicOrientationId: orientations[0]?.id || '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentItem) return;

    if (currentItem.id) {
      // Edit
      setChantiers(prevChantiers => prevChantiers.map(c => c.id === currentItem.id ? currentItem as Chantier : c));
    } else {
      // Add
      const newChantier: Chantier = {
        ...currentItem,
        id: `ch-${Date.now()}`,
        createdAt: new Date().toISOString(),
      } as Chantier;
      setChantiers(prevChantiers => [...prevChantiers, newChantier]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce chantier ?")) {
      setChantiers(prevChantiers => prevChantiers.filter(c => c.id !== id));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (currentItem) {
      setCurrentItem({ ...currentItem, [e.target.name]: e.target.value });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Chantiers</h1>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <PlusCircle size={20} />
          <span>Nouveau chantier</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chantiers.map((chantier) => {
          const orientation = orientationsMap.get(chantier.strategicOrientationId);
          return (
            <Card key={chantier.id} className="flex flex-col">
              <CardHeader className="flex justify-between items-start">
                <CardTitle>
                  <div className="flex items-start">
                    <Workflow size={24} className="text-blue-600 mr-3 mt-1" />
                    <div>
                      <p className="text-base">{chantier.code} - {chantier.label}</p>
                    </div>
                  </div>
                </CardTitle>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleOpenModal(chantier)} className="text-slate-500 hover:text-blue-600">
                        <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(chantier.id)} className="text-slate-500 hover:text-red-600">
                        <Trash2 size={18} />
                    </button>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-slate-600">{chantier.description}</p>
              </CardContent>
              {orientation && (
                 <div className="p-4 border-t border-slate-200">
                    <h4 className="text-xs font-semibold text-slate-500 mb-2">Orientation liée :</h4>
                    <div className="flex flex-wrap gap-2">
                        <span
                        className="px-2 py-1 text-xs font-normal rounded-full border"
                        style={{ 
                            backgroundColor: `${orientation.color || '#D1D5DB'}40`, // Add opacity
                            borderColor: orientation.color || '#D1D5DB',
                            color: '#1e293b' // slate-800
                        }}
                        >
                        {orientation.code} - {orientation.label}
                        </span>
                    </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {isModalOpen && currentItem && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
          title={currentItem.id ? "Modifier le chantier" : "Ajouter un chantier"}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-slate-700">Code</label>
              <input type="text" name="code" id="code" value={currentItem.code} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" required />
            </div>
            <div>
              <label htmlFor="label" className="block text-sm font-medium text-slate-700">Libellé</label>
              <input type="text" name="label" id="label" value={currentItem.label} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" required />
            </div>
            <div>
              <label htmlFor="strategicOrientationId" className="block text-sm font-medium text-slate-700">Orientation stratégique</label>
              <select name="strategicOrientationId" id="strategicOrientationId" value={currentItem.strategicOrientationId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" required>
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
        </Modal>
      )}
    </div>
  );
};

export default Chantiers;
