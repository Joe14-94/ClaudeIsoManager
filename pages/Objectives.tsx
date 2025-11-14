import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Objective, StrategicOrientation, Chantier, IsoMeasure, IsoLink } from '../types';
import Card, { CardContent } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { PlusCircle, Trash2, Edit, Target, Workflow, FilterX, ShieldCheck, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ISO_MEASURES_DATA } from '../constants';
import CustomMultiSelect from '../components/ui/CustomMultiSelect';
import Tooltip from '../components/ui/Tooltip';

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
              <h4 className="font-semibold text-sm text-slate-600 mt-4 mb-2">Mesures ISO 27002 liées</h4>
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
  const { objectives, setObjectives, orientations, chantiers } = useData();
    const { userRole } = useAuth();
  const isReadOnly = false;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<Objective> | null>(null);
  const [selectedIsoMeasure, setSelectedIsoMeasure] = useState<Omit<IsoMeasure, 'id'> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isoSearchTerm, setIsoSearchTerm] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const orientationFilter = location.state?.orientationFilter;
  const chantierFilter = location.state?.chantierFilter;

  const orientationsMap = useMemo(() => new Map<string, StrategicOrientation>(orientations.map(o => [o.id, o])), [orientations]);
  const chantiersMap = useMemo(() => new Map<string, Chantier>(chantiers.map(c => [c.id, c])), [chantiers]);

  const filteredObjectives = useMemo(() => {
    let objectivesToFilter = objectives;
    if (chantierFilter) {
      objectivesToFilter = objectivesToFilter.filter(o => o.chantierId === chantierFilter);
    } else if (orientationFilter) {
      objectivesToFilter = objectivesToFilter.filter(o => o.strategicOrientations.includes(orientationFilter));
    }

    if (!searchTerm) {
      return objectivesToFilter;
    }

    const lowercasedTerm = searchTerm.toLowerCase();
    return objectivesToFilter.filter(objective =>
      (objective.code && objective.code.toLowerCase().includes(lowercasedTerm)) ||
      (objective.label && objective.label.toLowerCase().includes(lowercasedTerm)) ||
      (objective.description && objective.description.toLowerCase().includes(lowercasedTerm))
    );
  }, [objectives, orientationFilter, chantierFilter, searchTerm]);

  const allMeasuresMap = useMemo(() => new Map(ISO_MEASURES_DATA.map(m => [m.code, m])), []);

  const allIsoMeasuresOptions = useMemo(() => 
      ISO_MEASURES_DATA.map(m => ({
          value: m.code,
          label: `${m.code} - ${m.title}`,
          tooltip: m.details?.measure
      })), []);

  const filteredIsoOptions = useMemo(() => {
      if (!isoSearchTerm) return allIsoMeasuresOptions;
      return allIsoMeasuresOptions.filter(opt => opt.label.toLowerCase().includes(isoSearchTerm.toLowerCase()));
  }, [isoSearchTerm, allIsoMeasuresOptions]);


  const handleOpenModal = (item?: Objective) => {
    if (item) { // View/edit existing
      setCurrentItem(item);
      setIsEditing(false);
    } else { // New item
      if (isReadOnly) return;
      setCurrentItem({ code: '', label: '', description: '', strategicOrientations: [], chantierId: chantiers[0]?.id || '', mesures_iso: [] });
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
        const originalItem = objectives.find(o => o.id === currentItem?.id);
        setCurrentItem(originalItem || null);
        setIsEditing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (currentItem) {
      const { name, value } = e.target;
      const updatedItem = { ...currentItem, [name]: value };

      if (name === 'code' && !currentItem.id) { // Only for new items
        const objectiveCode = value;

        // Try new logic first for format "A.BB.CC.DD" -> chantier "A.B.C"
        const newLogicParts = objectiveCode.match(/^(\d+)\.(\d+)\.(\d+)/);
        if (newLogicParts) {
            const chantierCodeToFind = `${parseInt(newLogicParts[1], 10)}.${parseInt(newLogicParts[2], 10)}.${parseInt(newLogicParts[3], 10)}`;
            const foundChantier = chantiers.find(c => c.code === chantierCodeToFind);
            if (foundChantier) {
                updatedItem.chantierId = foundChantier.id;
                updatedItem.strategicOrientations = [foundChantier.strategicOrientationId];
            }
        } else {
            // Fallback to old logic for format "OBJ-X.Y.Z" -> chantier "C-DEMO-X.Y"
            const upperCaseCode = objectiveCode.toUpperCase();
            if (upperCaseCode.startsWith('OBJ-')) {
                const numericPart = upperCaseCode.substring(4); // Remove "OBJ-"
                if (numericPart) {
                    const chantierCodePart = numericPart.split('.').slice(0, 2).join('.');
                    if (chantierCodePart) {
                        const targetChantierCode = `C-DEMO-${chantierCodePart}`;
                        const foundChantier = chantiers.find(c => c.code === targetChantierCode);
                        if (foundChantier) {
                            updatedItem.chantierId = foundChantier.id;
                            updatedItem.strategicOrientations = [foundChantier.strategicOrientationId];
                        }
                    }
                }
            }
        }
      }


      if (name === 'chantierId') {
        const selectedChantier = chantiers.find(c => c.id === value);
        if (selectedChantier) {
          updatedItem.strategicOrientations = [selectedChantier.strategicOrientationId];
        } else {
          updatedItem.strategicOrientations = [];
        }
      }

      setCurrentItem(updatedItem);
    }
  };

  const handleCustomMultiSelectChange = (name: string, selectedValues: string[]) => {
    if (currentItem) {
      if (name === 'mesures_iso') {
        const selectedMeasures: IsoLink[] = selectedValues.map(code => {
          const measureData = allMeasuresMap.get(code);
          const existingLink = currentItem.mesures_iso?.find(link => link.numero_mesure === code);
          return {
            domaine: measureData?.chapter || 'N/A',
            numero_mesure: code,
            titre: measureData?.title || 'Titre non trouvé',
            description: measureData?.description || 'Description non trouvée',
            niveau_application: existingLink?.niveau_application || '',
          };
        });
        setCurrentItem(prev => ({ ...prev!, mesures_iso: selectedMeasures }));
      } else {
        setCurrentItem(prev => ({ ...prev!, [name]: selectedValues }));
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !currentItem || !currentItem.code || !currentItem.label || !currentItem.chantierId) {
      if(!isReadOnly) alert("Le code, le libellé et le chantier sont obligatoires.");
      return;
    }

    if (currentItem.id) { // Edit
      setObjectives(prev => prev.map(o => o.id === currentItem.id ? { ...o, ...currentItem } as Objective : o));
    } else { // Add
      const newObjective: Objective = {
        id: `obj-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...currentItem
      } as Objective;
      setObjectives(prev => [newObjective, ...prev]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if(isReadOnly) return;
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet objectif ?")) {
      setObjectives(prev => prev.filter(o => o.id !== id));
      handleCloseModal();
    }
  };
  
    const handleMeasureClick = (e: React.MouseEvent, measureCode: string) => {
        e.stopPropagation();
        if (userRole === 'admin') {
            navigate('/iso27002', { state: { openMeasure: measureCode } });
        } else {
            const measure = allMeasuresMap.get(measureCode);
            if (measure) {
                setSelectedIsoMeasure(measure as Omit<IsoMeasure, 'id'>);
            }
        }
    };
  const navigateTo = (e: React.MouseEvent, path: string, state: object) => {
    e.stopPropagation();
    navigate(path, { state });
  };

  const resetFilter = () => {
    navigate(location.pathname, { replace: true });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Objectifs</h1>
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
                <span>Nouvel objectif</span>
              </button>
            )}
        </div>
      </div>
       <p className="text-slate-600">
        Les objectifs de la stratégie cybersécurité. Cliquez sur un objectif pour le modifier.
      </p>

      {chantierFilter && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-r-lg flex items-center justify-between">
          <p className="font-medium text-sm">
            Filtré par le chantier : <span className="font-bold">{chantiersMap.get(chantierFilter)?.code}</span>
          </p>
          <button onClick={resetFilter} className="flex items-center gap-2 text-sm font-semibold hover:bg-blue-200 p-2 rounded-md">
            <FilterX size={16}/>
            Réinitialiser
          </button>
        </div>
      )}

      {orientationFilter && !chantierFilter && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-r-lg flex items-center justify-between">
          <p className="font-medium text-sm">
            Filtré par l'orientation stratégique : <span className="font-bold">{orientationsMap.get(orientationFilter)?.code}</span>
          </p>
          <button onClick={resetFilter} className="flex items-center gap-2 text-sm font-semibold hover:bg-blue-200 p-2 rounded-md">
            <FilterX size={16}/>
            Réinitialiser
          </button>
        </div>
      )}
      
      <div className="space-y-4">
        {filteredObjectives.length > 0 ? (
          filteredObjectives
            .slice()
            .sort((a,b) => a.code.localeCompare(b.code, undefined, { numeric: true }))
            .map((objective) => {
              const chantier = chantiersMap.get(objective.chantierId);
              return (
                <Card 
                  key={objective.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                  onClick={() => handleOpenModal(objective)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:justify-between gap-4">
                        <div className="flex-grow">
                          <div className="flex items-center">
                            <Target size={20} className="text-green-600 mr-3 flex-shrink-0" />
                            <h3 className="font-semibold text-slate-900 text-base">
                              <span className="font-mono text-blue-600">{objective.code}</span> - {objective.label}
                            </h3>
                          </div>
                          <p className="text-sm text-slate-600 mt-2 md:pl-8 line-clamp-2">{objective.description || 'Aucune description fournie.'}</p>
                        </div>
                        
                        <div className="flex-shrink-0 md:ml-6 flex flex-col md:items-end gap-4">
                          {chantier && (
                            <div>
                              <h4 className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Chantier</h4>
                              <div className="flex flex-wrap gap-1 justify-start md:justify-end">
                                <Tooltip text={chantier.label}>
                                  <button onClick={(e) => navigateTo(e, '/chantiers', { openChantier: chantier.id })} className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200 hover:border-cyan-300 transition-colors">
                                    <Workflow size={12} />
                                    {chantier.code}
                                  </button>
                                </Tooltip>
                              </div>
                            </div>
                          )}
                          {objective.mesures_iso && objective.mesures_iso.length > 0 && (
                            <div>
                                <h4 className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Mesures ISO</h4>
                                <div className="flex flex-wrap gap-1 justify-start md:justify-end">
                                  {objective.mesures_iso.map((mesure, index) => (
                                      <Tooltip key={index} text={mesure.titre}>
                                        <button onClick={(e) => handleMeasureClick(e, mesure.numero_mesure)} className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono rounded-full border bg-red-100 text-red-800 border-red-200 hover:bg-red-200 hover:border-red-300 transition-colors">
                                            <ShieldCheck size={12} />
                                            {mesure.numero_mesure}
                                        </button>
                                      </Tooltip>
                                  ))}
                                </div>
                            </div>
                          )}
                        </div>
                    </div>
                  </CardContent>
                </Card>
            )})
        ) : (
          <Card>
              <CardContent className="text-center text-slate-500 py-16">
                  <p className="font-semibold">Aucun objectif ne correspond à vos critères de recherche.</p>
              </CardContent>
          </Card>
        )}
      </div>

       {isModalOpen && currentItem && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
          title={currentItem.id ? "Détails de l'objectif" : "Nouvel objectif"}
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
              <textarea name="description" id="description" value={currentItem.description || ''} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" readOnly={isReadOnly || !isEditing}/>
            </div>
             <div>
              <label htmlFor="chantierId" className="block text-sm font-medium text-slate-700">Chantier</label>
              <select name="chantierId" id="chantierId" value={currentItem.chantierId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" required disabled={isReadOnly || !isEditing}>
                <option value="">Sélectionner un chantier</option>
                {chantiers.map(c => <option key={c.id} value={c.id}>{c.code} - {c.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="targetDate" className="block text-sm font-medium text-slate-700">Date cible</label>
              <input type="date" name="targetDate" id="targetDate" value={currentItem.targetDate ? currentItem.targetDate.split('T')[0] : ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" readOnly={isReadOnly || !isEditing}/>
            </div>
            
            <CustomMultiSelect
                label="Orientations stratégiques (défini par le chantier)"
                name="strategicOrientations"
                options={orientations.map(o => ({ value: o.id, label: `${o.code} - ${o.label}`}))}
                selectedValues={currentItem.strategicOrientations || []}
                onChange={handleCustomMultiSelectChange}
                disabled={true}
                heightClass="h-24"
            />
            
             {isEditing && (
                <div>
                    <label className="block text-sm font-medium text-slate-700">Mesures ISO 27002 liées</label>
                    <div className="mt-1">
                        <input
                        type="text"
                        placeholder="Rechercher une mesure par code ou titre..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white mb-2"
                        value={isoSearchTerm}
                        onChange={(e) => setIsoSearchTerm(e.target.value)}
                        disabled={isReadOnly || !isEditing}
                        />
                    </div>
                    <CustomMultiSelect
                        label=""
                        name="mesures_iso"
                        options={filteredIsoOptions}
                        selectedValues={currentItem.mesures_iso?.map(m => m.numero_mesure) || []}
                        onChange={handleCustomMultiSelectChange}
                        disabled={isReadOnly || !isEditing}
                        heightClass="h-48"
                    />
                </div>
            )}
            
            {currentItem.id && !isEditing && (
                <ObjectiveDetails objective={currentItem as Objective} orientations={orientations} />
            )}

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

      {selectedIsoMeasure && (
        <Modal
            isOpen={!!selectedIsoMeasure}
            onClose={() => setSelectedIsoMeasure(null)}
            title={`${selectedIsoMeasure.code} - ${selectedIsoMeasure.title}`}
        >
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">ID et Titre</h3>
                    <p className="text-sm text-slate-600">{`${selectedIsoMeasure.code} - ${selectedIsoMeasure.title}`}</p>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Mesure de sécurité</h3>
                    <p className="text-sm text-slate-600">{selectedIsoMeasure.details?.measure}</p>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Objectif</h3>
                    <p className="text-sm text-slate-600">{selectedIsoMeasure.details?.objective}</p>
                </div>
            </div>
        </Modal>
    )}
    </div>
  );
};

export default Objectives;