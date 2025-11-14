import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { SecurityProcess } from '../types';
import { Scale, Archive, Users, Shield, HardHat, Handshake, Network, AppWindow, Siren, Gavel, ListChecks, Workflow, PlusCircle, Trash2, Edit, Search, ShieldCheck } from 'lucide-react';
import CustomMultiSelect from '../components/ui/CustomMultiSelect';
import { ISO_MEASURES_DATA } from '../constants';
import Tooltip from '../components/ui/Tooltip';
import { useNavigate } from 'react-router-dom';

const processIcons: { [key: string]: React.ReactNode } = {
    'gouvernance-politiques': <Scale size={24} className="text-purple-600" />,
    'risques-conformite': <Gavel size={24} className="text-gray-600" />,
    'actifs-classification': <Archive size={24} className="text-orange-600" />,
    'ressources-humaines': <Users size={24} className="text-cyan-600" />,
    'identites-acces': <Shield size={24} className="text-blue-600" />,
    'securite-physique': <HardHat size={24} className="text-green-600" />,
    'fournisseurs-tiers': <Handshake size={24} className="text-teal-600" />,
    'operations-communications': <Network size={24} className="text-indigo-600" />,
    'incidents-continuite': <Siren size={24} className="text-amber-600" />,
    'developpement-maintenance': <AppWindow size={24} className="text-pink-600" />,
    'surveillance-journalisation': <ListChecks size={24} className="text-yellow-600" />,
    'configuration-changements': <Workflow size={24} className="text-rose-600" />,
};

const Processes: React.FC = () => {
  const { securityProcesses, setSecurityProcesses } = useData();
  const isReadOnly = false;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<SecurityProcess> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isoSearchTerm, setIsoSearchTerm] = useState('');
  const navigate = useNavigate();

  const allIsoMeasures = useMemo(() => ISO_MEASURES_DATA.map(m => ({ value: m.code, label: `${m.code} - ${m.title}` })), []);

  const filteredIsoOptions = useMemo(() => {
    if (!isoSearchTerm) return allIsoMeasures;
    return allIsoMeasures.filter(opt => opt.label.toLowerCase().includes(isoSearchTerm.toLowerCase()));
  }, [isoSearchTerm, allIsoMeasures]);

  const handleOpenModal = (process?: SecurityProcess) => {
    if (process) {
      setCurrentItem(process);
      setIsEditing(false);
    } else {
      if (isReadOnly) return;
      setCurrentItem({ name: '', description: '', isoMeasureIds: [] });
      setIsEditing(true);
    }
    setIsoSearchTerm('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setIsEditing(false);
    setIsoSearchTerm('');
  };
  
  const handleCancel = () => {
      if (currentItem && !currentItem.id) {
          handleCloseModal();
      } else {
          const originalItem = securityProcesses.find(p => p.id === currentItem?.id);
          setCurrentItem(originalItem || null);
          setIsEditing(false);
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

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isReadOnly || !currentItem || !currentItem.name) {
      if (!isReadOnly) alert("Le nom est obligatoire.");
      return;
    }

    if (currentItem.id) {
      setSecurityProcesses(prev => 
        prev.map(p => p.id === currentItem.id ? (currentItem as SecurityProcess) : p)
      );
    } else {
      const newProcess: SecurityProcess = {
        id: `proc-${Date.now()}`,
        name: currentItem.name!,
        description: currentItem.description || '',
        isoMeasureIds: currentItem.isoMeasureIds || []
      };
      setSecurityProcesses(prev => [newProcess, ...prev]);
    }
    handleCloseModal();
  };
  
  const handleDelete = (id: string) => {
    if(isReadOnly) return;
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce processus ? Cela pourrait affecter les activités qui y sont liées.")) {
      setSecurityProcesses(prev => prev.filter(p => p.id !== id));
      handleCloseModal();
    }
  };
  
  const navigateTo = (e: React.MouseEvent, path: string, state: object) => {
    e.stopPropagation();
    navigate(path, { state });
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Processus fonctionnels de sécurité</h1>
        {!isReadOnly && (
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <PlusCircle size={20} />
            <span>Nouveau processus</span>
          </button>
        )}
      </div>
      <p className="text-slate-600">
        Chaque processus regroupe des mesures de sécurité de la norme ISO 27002 concourant à un même objectif métier.
        {securityProcesses.length > 0 && " Cliquez sur une carte pour la modifier."}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {securityProcesses.map((process) => {
            const linkedIsoMeasuresCount = process.isoMeasureIds?.length || 0;
            return (
              <Card key={process.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleOpenModal(process)}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-slate-100 rounded-lg">
                      {processIcons[process.id] || <Workflow size={24} className="text-slate-500" />}
                    </div>
                    <span className="text-base">{process.name}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">{process.description}</p>
                  {linkedIsoMeasuresCount > 0 && (
                    <div>
                        <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Mesures ISO Associées</h4>
                        <div className="flex flex-wrap gap-1">
                          <Tooltip text={`${linkedIsoMeasuresCount} mesure(s) ISO liée(s). Cliquez pour voir la liste.`}>
                            <button onClick={(e) => navigateTo(e, '/iso27002', { filter: 'covered', coveredMeasuresCodes: process.isoMeasureIds })} className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border bg-red-100 text-red-800 border-red-200 hover:bg-red-200 hover:border-red-300 transition-colors">
                                <ShieldCheck size={12} />
                                {linkedIsoMeasuresCount}
                            </button>
                          </Tooltip>
                        </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
        })}
      </div>

       {isModalOpen && currentItem && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
          title={currentItem.id ? "Détails du processus" : "Nouveau processus"}
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
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Objet du processus</label>
              <input type="text" name="name" id="name" value={currentItem.name || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" required readOnly={isReadOnly || !isEditing}/>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">Explication du processus</label>
              <textarea name="description" id="description" value={currentItem.description || ''} onChange={handleChange} rows={5} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" readOnly={isReadOnly || !isEditing}/>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-700">Mesures ISO Associées</label>
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
                    <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-transparent rounded-md hover:bg-slate-200">Fermer</button>
                ) : (
                  <>
                    <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-transparent rounded-md hover:bg-slate-200">Annuler</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">Enregistrer</button>
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

export default Processes;