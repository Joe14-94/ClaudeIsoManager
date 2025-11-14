import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { StrategicOrientation, Chantier, Objective } from '../types';
import Card, { CardContent } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { PlusCircle, Trash2, Edit, TrendingUp, Workflow, Target, Search } from 'lucide-react';
import Tooltip from '../components/ui/Tooltip';
import { useLocation, useNavigate } from 'react-router-dom';

const Orientations: React.FC = () => {
  const { orientations, setOrientations, chantiers, objectives } = useData();
  const isReadOnly = false;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<StrategicOrientation> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as any;
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const orientationIdToOpen = locationState?.openOrientation;
    if (orientationIdToOpen) {
      const orientationToOpen = orientations.find(o => o.id === orientationIdToOpen);
      if (orientationToOpen) {
        handleOpenModal(orientationToOpen);
        // Clear state to prevent modal from re-opening on navigation
        window.history.replaceState({}, document.title)
      }
    }
  }, [locationState, orientations]);

  const filteredOrientations = useMemo(() => {
    return orientations
      .filter(orientation => {
        if (!searchTerm) return true;
        const lowercasedTerm = searchTerm.toLowerCase();
        return (
          orientation.code.toLowerCase().includes(lowercasedTerm) ||
          orientation.label.toLowerCase().includes(lowercasedTerm) ||
          (orientation.description && orientation.description.toLowerCase().includes(lowercasedTerm))
        );
      })
      .slice()
      .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  }, [orientations, searchTerm]);


  const handleOpenModal = (item?: StrategicOrientation) => {
    if (item) { // View/edit existing
      setCurrentItem(item);
      setIsEditing(false);
    } else { // New item
      if (isReadOnly) return;
      setCurrentItem({ code: '', label: '', description: '' });
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
        const originalItem = orientations.find(o => o.id === currentItem?.id);
        setCurrentItem(originalItem || null);
        setIsEditing(false);
    }
  };


  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem || !currentItem.code || !currentItem.label || isReadOnly) {
        if (!isReadOnly) alert("Le code et le libellé sont obligatoires.");
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
    if (isReadOnly) return;
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette orientation ? Les chantiers, objectifs et activités liés pourraient être affectés.")) {
      setOrientations(prev => prev.filter(o => o.id !== id));
      handleCloseModal();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (currentItem) {
      setCurrentItem({ ...currentItem, [e.target.name]: e.target.value });
    }
  };

  const navigateTo = (e: React.MouseEvent, path: string, state: object) => {
    e.stopPropagation();
    navigate(path, { state });
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Orientations stratégiques</h1>
        <div className="flex items-center gap-2">
           <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
          {!isReadOnly && (
            <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <PlusCircle size={20} />
              <span>Nouvelle orientation</span>
            </button>
          )}
        </div>
      </div>
      <p className="text-slate-600">
        Les orientations stratégiques qui cadrent la cybersécurité. Cliquez sur une carte pour la modifier.
      </p>

      <div className="space-y-4">
        {filteredOrientations.length > 0 ? (
            filteredOrientations.map((orientation) => {
                const linkedChantiersCount = chantiers.filter(c => c.strategicOrientationId === orientation.id).length;
                const linkedObjectivesCount = objectives.filter(o => o.strategicOrientations.includes(orientation.id)).length;
                
                return (
                    <Card 
                        key={orientation.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                        onClick={() => handleOpenModal(orientation)}
                    >
                        <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:justify-between gap-4">
                                <div className="flex-grow">
                                    <div className="flex items-center">
                                        <TrendingUp size={20} className="text-purple-600 mr-3 flex-shrink-0" />
                                        <h3 className="font-semibold text-slate-900 text-base">
                                            <span className="font-mono text-blue-600">{orientation.code}</span> - {orientation.label}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-2 md:pl-8 line-clamp-2">{orientation.description || 'Aucune description fournie.'}</p>
                                </div>
                                
                                <div className="flex-shrink-0 md:ml-6 flex flex-col md:items-end gap-4">
                                    {linkedChantiersCount > 0 && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Chantiers liés</h4>
                                            <div className="flex flex-wrap gap-1 justify-start md:justify-end">
                                                <Tooltip text={`${linkedChantiersCount} chantier(s) directement lié(s) à cette orientation.`}>
                                                    <button onClick={(e) => navigateTo(e, '/chantiers', { orientationFilter: orientation.id })} className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200 hover:border-cyan-300 transition-colors">
                                                        <Workflow size={12} />
                                                        {linkedChantiersCount}
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    )}
                                    {linkedObjectivesCount > 0 && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Objectifs liés</h4>
                                            <div className="flex flex-wrap gap-1 justify-start md:justify-end">
                                                <Tooltip text={`${linkedObjectivesCount} objectif(s) directement lié(s) à cette orientation.`}>
                                                     <button onClick={(e) => navigateTo(e, '/objectives', { orientationFilter: orientation.id })} className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border bg-green-100 text-green-800 border-green-200 hover:bg-green-200 hover:border-green-300 transition-colors">
                                                        <Target size={12} />
                                                        {linkedObjectivesCount}
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
        })) : (
            <Card>
                <CardContent className="text-center text-slate-500 py-16">
                    <p className="font-semibold">Aucune orientation ne correspond à votre recherche.</p>
                </CardContent>
            </Card>
        )}
      </div>

       {isModalOpen && currentItem && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
          title={currentItem.id ? "Détails de l'orientation" : "Nouvelle orientation"}
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
              <input type="text" name="code" id="code" value={currentItem.code || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" required readOnly={isReadOnly || !isEditing} />
            </div>
             <div>
              <label htmlFor="label" className="block text-sm font-medium text-slate-700">Libellé</label>
              <input type="text" name="label" id="label" value={currentItem.label || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" required readOnly={isReadOnly || !isEditing} />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
              <textarea name="description" id="description" value={currentItem.description || ''} onChange={handleChange} rows={4} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" readOnly={isReadOnly || !isEditing} />
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

export default Orientations;