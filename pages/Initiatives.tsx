import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Initiative, IsoMeasure } from '../types';
import Card, { CardContent } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { PlusCircle, Trash2, Edit, Flag, ShieldCheck, Search } from 'lucide-react';
import Tooltip from '../components/ui/Tooltip';
import CustomMultiSelect from '../components/ui/CustomMultiSelect';
import { ISO_MEASURES_DATA } from '../constants';

const Initiatives: React.FC = () => {
  const { initiatives, setInitiatives } = useData();
  const isReadOnly = false;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<Initiative> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isoSearchTerm, setIsoSearchTerm] = useState('');
  
  const allIsoMeasures = useMemo(() => ISO_MEASURES_DATA.map(m => ({ value: m.code, label: `${m.code} - ${m.title}` })), []);

  const filteredInitiatives = useMemo(() => {
    return initiatives
      .filter(initiative => {
        if (!searchTerm) return true;
        const lowercasedTerm = searchTerm.toLowerCase();
        return (
          initiative.code.toLowerCase().includes(lowercasedTerm) ||
          initiative.label.toLowerCase().includes(lowercasedTerm) ||
          (initiative.description && initiative.description.toLowerCase().includes(lowercasedTerm))
        );
      })
      .slice()
      .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  }, [initiatives, searchTerm]);
  
  const filteredIsoOptions = useMemo(() => {
      if (!isoSearchTerm) return allIsoMeasures;
      return allIsoMeasures.filter(opt => opt.label.toLowerCase().includes(isoSearchTerm.toLowerCase()));
  }, [isoSearchTerm, allIsoMeasures]);


  const handleOpenModal = (item?: Initiative) => {
    if (item) {
      setCurrentItem(item);
      setIsEditing(false);
    } else {
      if (isReadOnly) return;
      setCurrentItem({ code: `INIT-${String(initiatives.length + 1).padStart(3, '0')}`, label: '', description: '', isoMeasureIds: [] });
      setIsEditing(true);
    }
    setIsoSearchTerm('');
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
        const originalItem = initiatives.find(o => o.id === currentItem?.id);
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
      setInitiatives(prev => prev.map(o => o.id === currentItem.id ? currentItem as Initiative : o));
    } else { // Add
      const newInitiative: Initiative = {
        id: `init-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...currentItem
      } as Initiative;
      setInitiatives(prev => [newInitiative, ...prev]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (isReadOnly) return;
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette initiative ?")) {
      setInitiatives(prev => prev.filter(o => o.id !== id));
      handleCloseModal();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (currentItem) {
      setCurrentItem({ ...currentItem, [e.target.name]: e.target.value });
    }
  };
  
  const handleCustomMultiSelectChange = (name: string, value: string[]) => {
    if (currentItem) {
      setCurrentItem(prev => ({ ...prev!, [name]: value }));
    }
  };

  const navigateTo = (e: React.MouseEvent, path: string, state: object) => {
    e.stopPropagation();
    navigate(path, { state });
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Initiatives</h1>
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
              <span>Nouvelle initiative</span>
            </button>
          )}
        </div>
      </div>
      <p className="text-slate-600">
        Les initiatives cybersécurité transverses ou spécifiques. Cliquez sur une carte pour la modifier.
      </p>

      <div className="space-y-4">
        {filteredInitiatives.length > 0 ? (
            filteredInitiatives.map((initiative) => {
                const linkedIsoMeasuresCount = initiative.isoMeasureIds.length;
                
                return (
                    <Card 
                        key={initiative.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                        onClick={() => handleOpenModal(initiative)}
                    >
                        <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:justify-between gap-4">
                                <div className="flex-grow">
                                    <div className="flex items-center">
                                        <Flag size={20} className="text-blue-600 mr-3 flex-shrink-0" />
                                        <h3 className="font-semibold text-slate-900 text-base">
                                            <span className="font-mono text-blue-600">{initiative.code}</span> - {initiative.label}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-2 md:pl-8 line-clamp-2">{initiative.description || 'Aucune description fournie.'}</p>
                                </div>
                                
                                <div className="flex-shrink-0 md:ml-6 flex flex-col md:items-end gap-4">
                                    {linkedIsoMeasuresCount > 0 && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Mesures ISO liées</h4>
                                            <div className="flex flex-wrap gap-1 justify-start md:justify-end">
                                                <Tooltip text={`${linkedIsoMeasuresCount} mesure(s) ISO liée(s) à cette initiative.`}>
                                                    <button onClick={(e) => navigateTo(e, '/iso27002', { filter: 'covered', coveredMeasuresCodes: initiative.isoMeasureIds })} className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border bg-red-100 text-red-800 border-red-200 hover:bg-red-200 hover:border-red-300 transition-colors">
                                                        <ShieldCheck size={12} />
                                                        {linkedIsoMeasuresCount}
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
                    <p className="font-semibold">Aucune initiative ne correspond à votre recherche.</p>
                </CardContent>
            </Card>
        )}
      </div>

       {isModalOpen && currentItem && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
          title={currentItem.id ? "Détails de l'initiative" : "Nouvelle initiative"}
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
            <div>
                <label className="block text-sm font-medium text-slate-700">Mesures ISO</label>
                 <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Rechercher par code ou titre..."
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md bg-white mb-2"
                      value={isoSearchTerm}
                      onChange={(e) => setIsoSearchTerm(e.target.value)}
                      disabled={isReadOnly || !isEditing}
                    />
                </div>
                <CustomMultiSelect
                    label=""
                    name="isoMeasureIds"
                    options={filteredIsoOptions}
                    selectedValues={currentItem.isoMeasureIds || []}
                    onChange={handleCustomMultiSelectChange}
                    disabled={isReadOnly || !isEditing}
                />
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

export default Initiatives;