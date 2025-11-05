
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Chantier, StrategicOrientation, Objective } from '../types';
import Card, { CardContent } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { PlusCircle, Trash2, Workflow, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Tooltip from '../components/ui/Tooltip';

const Chantiers: React.FC = () => {
  const { chantiers, setChantiers, orientations, objectives } = useData();
  const { userRole } = useAuth();
  const isReadOnly = userRole === 'readonly';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<Chantier> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const orientationsMap = useMemo(() => new Map<string, StrategicOrientation>(orientations.map(o => [o.id, o])), [orientations]);

  const handleOpenModal = (item?: Chantier) => {
    if (item) { // View/edit existing
      setCurrentItem(item);
      setIsEditing(false);
    } else { // New item
      if (isReadOnly) return;
      setCurrentItem({ code: '', label: '', description: '', strategicOrientationId: orientations[0]?.id || '' });
      setIsEditing(true);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (currentItem && !currentItem.id) {
        handleCloseModal();
    } else {
        const originalItem = chantiers.find(c => c.id === currentItem?.id);
        setCurrentItem(originalItem || null);
        setIsEditing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (currentItem) {
      setCurrentItem({ ...currentItem, [e.target.name]: e.target.value });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !currentItem || !currentItem.code || !currentItem.label || !currentItem.strategicOrientationId) {
      if (!isReadOnly) alert("Le code, le libellé et l'orientation sont obligatoires.");
      return;
    }

    if (currentItem.id) { // Edit
      setChantiers(prev => prev.map(c => c.id === currentItem.id ? currentItem as Chantier : c));
    } else { // Add
      const newChantier: Chantier = {
        id: `ch-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...currentItem
      } as Chantier;
      setChantiers(prev => [newChantier, ...prev]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (isReadOnly) return;
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce chantier ?")) {
      setChantiers(prev => prev.filter(c => c.id !== id));
      handleCloseModal();
    }
  };

  const getLinkedObjectivesCount = (chantierCode: string): number => {
    return objectives.filter(o => {
        const objCodeParts = o.code.split('.');
        if (objCodeParts.length < 3) return false;
        const chantierCodeGuess = `${objCodeParts[0]}.${parseInt(objCodeParts[1])}.${parseInt(objCodeParts[2])}`;
        return chantierCodeGuess === chantierCode;
    }).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Chantiers</h1>
        {!isReadOnly && (
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <PlusCircle size={20} />
            <span>Nouveau chantier</span>
          </button>
        )}
      </div>
      <p className="text-slate-600">
        Les chantiers de la stratégie cybersécurité. Cliquez sur un chantier pour le modifier.
      </p>
      
      <div className="space-y-4">
        {chantiers
          .slice()
          .sort((a,b) => a.code.localeCompare(b.code, undefined, { numeric: true }))
          .map((chantier) => {
          const orientation = orientationsMap.get(chantier.strategicOrientationId);
          const linkedObjectivesCount = getLinkedObjectivesCount(chantier.code);

          return (
            <Card key={chantier.id} className="cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={() => handleOpenModal(chantier)}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center">
                      <Workflow size={20} className="text-cyan-600 mr-3 flex-shrink-0" />
                      <h3 className="font-semibold text-slate-900 text-base">
                        <span className="font-mono text-blue-600">{chantier.code}</span> - {chantier.label}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 mt-2 md:pl-8 line-clamp-2">{chantier.description || 'Aucune description fournie.'}</p>
                  </div>
                  
                  <div className="flex-shrink-0 md:ml-6 flex flex-col md:items-end gap-4">
                    {orientation && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Orientation</h4>
                        <div className="flex flex-wrap gap-1 justify-start md:justify-end">
                           <Tooltip text={orientation.label}>
                              <span className="px-2 py-0.5 text-xs font-medium rounded-full border bg-purple-100 text-purple-800 border-purple-200">
                                  {orientation.code}
                              </span>
                            </Tooltip>
                        </div>
                      </div>
                    )}
                     {linkedObjectivesCount > 0 && (
                      <div>
                          <h4 className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Objectifs liés</h4>
                           <div className="flex flex-wrap gap-1 justify-start md:justify-end">
                                <Tooltip text={`${linkedObjectivesCount} objectif(s) directement lié(s) à ce chantier.`}>
                                  <span className="px-2 py-0.5 text-xs font-mono bg-green-100 text-green-800 border border-green-200 rounded-full">
                                      {linkedObjectivesCount}
                                  </span>
                                </Tooltip>
                          </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isModalOpen && currentItem && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
          title={currentItem.id ? "Détails du chantier" : "Nouveau chantier"}
          headerActions={
            !isReadOnly && currentItem.id && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded-md hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                aria-label="Modifier"
              >
                <Edit size={20} />
              </button>
            )
          }
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-slate-700">Code</label>
              <input type="text" name="code" id="code" value={currentItem.code || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" required readOnly={isReadOnly || !isEditing}/>
            </div>
            <div>
              <label htmlFor="label" className="block text-sm font-medium text-slate-700">Libellé</label>
              <input type="text" name="label" id="label" value={currentItem.label || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" required readOnly={isReadOnly || !isEditing}/>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
              <textarea name="description" id="description" value={currentItem.description || ''} onChange={handleChange} rows={4} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" readOnly={isReadOnly || !isEditing}/>
            </div>
            <div>
              <label htmlFor="strategicOrientationId" className="block text-sm font-medium text-slate-700">Orientation stratégique</label>
              <select name="strategicOrientationId" id="strategicOrientationId" value={currentItem.strategicOrientationId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" required disabled={isReadOnly || !isEditing}>
                <option value="">Sélectionner une orientation</option>
                {orientations.map(o => <option key={o.id} value={o.id}>{o.code} - {o.label}</option>)}
              </select>
            </div>
            <div className="flex justify-between items-center gap-2 pt-4 border-t mt-6">
                <div>
                    {!isReadOnly && currentItem.id && isEditing && (
                        <button type="button" onClick={() => handleDelete(currentItem.id!)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                            <Trash2 size={16} /> Supprimer
                        </button>
                    )}
                </div>
                <div className="flex gap-2">
                    {isReadOnly || !isEditing ? (
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">Fermer</button>
                    ) : (
                      <>
                        <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">Annuler</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Enregistrer</button>
                      </>
                    )}
                </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Chantiers;
