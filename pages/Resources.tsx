import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Resource } from '../types';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { User, Users, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Resources: React.FC = () => {
  const { resources, setResources } = useData();
  const { userRole } = useAuth();
  const isReadOnly = userRole === 'readonly';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<Resource> | null>(null);

  const handleOpenModal = (resource?: Resource) => {
    setCurrentItem(resource || { name: '', entity: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isReadOnly || !currentItem || !currentItem.name || !currentItem.entity) {
        if(!isReadOnly) alert("Le nom et l'entité sont obligatoires.");
        return;
    }

    if (currentItem.id) {
      // Edit
      setResources(prevResources => prevResources.map(r => r.id === currentItem.id ? currentItem as Resource : r));
    } else {
      // Add
      const newResource: Resource = {
        id: `res-${Date.now()}`,
        name: currentItem.name,
        entity: currentItem.entity
      };
      setResources(prevResources => [newResource, ...prevResources]);
    }
    handleCloseModal();
  };
  
  const handleDelete = (id: string) => {
    if (isReadOnly) return;
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette ressource ?")) {
      setResources(prevResources => prevResources.filter(r => r.id !== id));
      handleCloseModal();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentItem) {
      setCurrentItem({ ...currentItem, [e.target.name]: e.target.value });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Gestion des ressources</h1>
        {!isReadOnly && (
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <PlusCircle size={20} />
            <span>Nouvelle ressource</span>
          </button>
        )}
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center">
                <Users className="mr-2" />
                Liste des ressources
            </CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="divide-y divide-slate-200">
                {resources.map(resource => (
                    <li key={resource.id} onClick={() => handleOpenModal(resource)} className="py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 -mx-4 px-4 rounded-md transition-colors">
                        <div className="flex items-center">
                            <div className="p-2 bg-slate-100 rounded-full mr-4">
                                <User className="text-slate-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800">{resource.name}</p>
                                <p className="text-sm text-slate-500">{resource.entity}</p>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </CardContent>
      </Card>

      {isModalOpen && currentItem && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
          title={currentItem.id ? "Détails de la ressource" : "Nouvelle ressource"}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nom</label>
              <input type="text" name="name" id="name" value={currentItem.name || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" required readOnly={isReadOnly}/>
            </div>
            <div>
              <label htmlFor="entity" className="block text-sm font-medium text-slate-700">Entité / Équipe</label>
              <input type="text" name="entity" id="entity" value={currentItem.entity || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" required readOnly={isReadOnly}/>
            </div>
            <div className="flex justify-between items-center gap-2 pt-4 border-t mt-6">
                 <div>
                    {!isReadOnly && currentItem.id && (
                        <button type="button" onClick={() => handleDelete(currentItem.id!)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                            <Trash2 size={16} /> Supprimer
                        </button>
                    )}
                </div>
                <div className="flex gap-2">
                    <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-transparent rounded-md hover:bg-slate-200">{isReadOnly ? 'Fermer' : 'Annuler'}</button>
                    {!isReadOnly && (
                      <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">Enregistrer</button>
                    )}
                </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Resources;