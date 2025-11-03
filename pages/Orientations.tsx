import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { StrategicOrientation } from '../types';
import Card, { CardContent } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { PlusCircle, Trash2 } from 'lucide-react';

const Orientations: React.FC = () => {
  const { orientations, setOrientations } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<StrategicOrientation> | null>(null);

  const handleOpenModal = (item?: StrategicOrientation) => {
    setCurrentItem(item || { code: '', label: '', description: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (currentItem) {
      setCurrentItem({ ...currentItem, [e.target.name]: e.target.value });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem || !currentItem.code || !currentItem.label) {
        alert("Le code et le libellé sont obligatoires.");
        return;
    }

    if (currentItem.id) { // Edit
      setOrientations(prev => prev.map(o => o.id === currentItem.id ? currentItem as StrategicOrientation : o));
    } else { // Add
      const newOrientation: StrategicOrientation = {
        id: `so-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...currentItem
      } as StrategicOrientation;
      setOrientations(prev => [newOrientation, ...prev]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette orientation ? Les chantiers, objectifs et activités liés pourraient être affectés.")) {
      setOrientations(prev => prev.filter(o => o.id !== id));
      handleCloseModal();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Orientations stratégiques</h1>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <PlusCircle size={20} />
          <span>Nouvelle orientation</span>
        </button>
      </div>
      <p className="text-slate-600">
        Les orientations stratégiques qui cadrent la cybersécurité. Cliquez sur une carte pour la modifier.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orientations.slice().sort((a,b) => a.code.localeCompare(b.code, undefined, {numeric: true})).map((orientation) => (
          <Card 
            key={orientation.id} 
            className="flex flex-col cursor-pointer hover:shadow-md transition-shadow duration-200" 
            onClick={() => handleOpenModal(orientation)}
          >
            <CardContent className="flex-grow p-6">
              <h3 className="font-semibold text-slate-900">
                <span className="font-mono text-blue-600">{orientation.code}</span> - {orientation.label}
              </h3>
              <p className="text-sm text-slate-600 mt-2">{orientation.description || 'Aucune description fournie.'}</p>
            </CardContent>
          </Card>
        ))}
      </div>

       {isModalOpen && currentItem && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
          title={currentItem.id ? "Modifier l'orientation" : "Nouvelle orientation"}
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
              <textarea name="description" id="description" value={currentItem.description || ''} onChange={handleChange} rows={4} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" />
            </div>
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

export default Orientations;