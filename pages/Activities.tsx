import React, { useState, useMemo, useEffect } from 'react';
// FIX: The project appears to use react-router-dom v5. The `useLocation` hook is available in v5.1+, and the error likely stems from a project-wide version mismatch with v6. Updated to v6.
import { useLocation } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Activity, ActivityStatus, Priority, SecurityDomain, ActivityType, SecurityProcess, Resource } from '../types';
import { DOMAIN_COLORS, STATUS_COLORS, PRIORITY_COLORS, ISO_MEASURES_DATA } from '../constants';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { Search, PlusCircle, Edit, Sparkles, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import GuidedActivityWizard from '../components/wizards/GuidedActivityWizard';
import CustomMultiSelect from '../components/ui/CustomMultiSelect';
import CalendarDatePicker from '../components/ui/CalendarDatePicker';
import ActiveFiltersDisplay from '../components/ui/ActiveFiltersDisplay';

const ActivityFilter: React.FC<{
  searchTerm: string;
  domainFilter: string;
  statusFilter: string;
  priorityFilter: string;
  processFilter: string;
  resourceFilter: string;
  setDomainFilter: (domain: string) => void;
  setStatusFilter: (status: string) => void;
  setPriorityFilter: (priority: string) => void;
  setProcessFilter: (process: string) => void;
  setResourceFilter: (resourceId: string) => void;
  setSearchTerm: (term: string) => void;
  securityProcesses: SecurityProcess[];
  resources: Resource[];
}> = ({ searchTerm, domainFilter, statusFilter, priorityFilter, processFilter, resourceFilter, setDomainFilter, setStatusFilter, setPriorityFilter, setProcessFilter, setResourceFilter, setSearchTerm, securityProcesses, resources }) => {
  return (
    <div className="flex flex-col md:flex-row flex-wrap gap-4 mb-4">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher une activité..."
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <select 
        value={domainFilter}
        onChange={(e) => setDomainFilter(e.target.value)}
        className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">Tous les domaines</option>
        {Object.values(SecurityDomain).map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <select 
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">Tous les statuts</option>
        {Object.values(ActivityStatus).map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <select 
        value={priorityFilter}
        onChange={(e) => setPriorityFilter(e.target.value)}
        className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">Toutes les priorités</option>
        {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
      </select>
       <select 
        value={resourceFilter}
        onChange={(e) => setResourceFilter(e.target.value)}
        className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">Toutes les ressources</option>
        {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
      </select>
      <select 
        value={processFilter}
        onChange={(e) => setProcessFilter(e.target.value)}
        className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">Tous les processus</option>
        {securityProcesses.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
    </div>
  );
};

// Add chantierIds to the type for local form state management
type FormActivity = Partial<Activity> & { chantierIds?: string[] };
type SortKey = 'activityId' | 'title' | 'securityDomain' | 'status' | 'priority' | 'processName';
type SortDirection = 'ascending' | 'descending';

const Activities: React.FC = () => {
  const { activities, setActivities, objectives, orientations, chantiers, resources, securityProcesses } = useData();
  const { userRole } = useAuth();
  const isReadOnly = userRole === 'readonly';
  // FIX: The useLocation hook in react-router-dom v6 does not accept a generic type argument.
  const location = useLocation();
  const locationState = location.state as any;
  
  const [domainFilter, setDomainFilter] = useState(locationState?.domainFilter || '');
  const [statusFilter, setStatusFilter] = useState(locationState?.statusFilter || '');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [processFilter, setProcessFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isoSearchTerm, setIsoSearchTerm] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({ key: 'activityId', direction: 'ascending' });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<FormActivity | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);

  const processMap = useMemo(() => new Map(securityProcesses.map(p => [p.id, p.name])), [securityProcesses]);
  const resourceMap = useMemo(() => new Map(resources.map(r => [r.id, r.name])), [resources]);
  
  const handleOpenDeleteModal = (activity: Activity) => {
    if (isReadOnly) return;
    setActivityToDelete(activity);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setActivityToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDelete = () => {
    if (isReadOnly || !activityToDelete) return;
    setActivities(prev => prev.filter(activity => activity.id !== activityToDelete.id));
    handleCloseDeleteModal();
  };

  const filteredChantiers = useMemo(() => {
    if (!currentActivity?.strategicOrientations || currentActivity.strategicOrientations.length === 0) {
      return [];
    }
    const selectedOrientationIds = new Set(currentActivity.strategicOrientations);
    return chantiers.filter(c => selectedOrientationIds.has(c.strategicOrientationId));
  }, [currentActivity?.strategicOrientations, chantiers]);
  
  const filteredObjectives = useMemo(() => {
    if (!currentActivity?.chantierIds || currentActivity.chantierIds.length === 0) {
      return [];
    }
    const selectedChantierIds = new Set(currentActivity.chantierIds);
    return objectives.filter(o => selectedChantierIds.has(o.chantierId));
  }, [currentActivity?.chantierIds, objectives]);

  const filteredIsoOptions = useMemo(() => {
      const options = ISO_MEASURES_DATA.map(m => ({
        value: m.code,
        label: `${m.code} - ${m.title}`,
        tooltip: m.details?.measure
      }));
      if (!isoSearchTerm) return options;
      return options.filter(opt => opt.label.toLowerCase().includes(isoSearchTerm.toLowerCase()));
  }, [isoSearchTerm]);


  useEffect(() => {
    if (currentActivity?.chantierIds?.length) {
      const availableChantierIds = new Set(filteredChantiers.map(c => c.id));
      const validSelectedChantiers = currentActivity.chantierIds.filter(id => availableChantierIds.has(id));
      if (validSelectedChantiers.length !== currentActivity.chantierIds.length) {
        setCurrentActivity(prev => ({ ...prev!, chantierIds: validSelectedChantiers }));
      }
    }
  }, [filteredChantiers, currentActivity?.chantierIds]);

  useEffect(() => {
    if (currentActivity?.objectives?.length) {
      const availableObjectiveIds = new Set(filteredObjectives.map(o => o.id));
      const validSelectedObjectives = currentActivity.objectives.filter(id => availableObjectiveIds.has(id));

      if (validSelectedObjectives.length !== currentActivity.objectives.length) {
        setCurrentActivity(prev => ({ ...prev!, objectives: validSelectedObjectives }));
      }
    }
  }, [filteredObjectives, currentActivity?.objectives]);


  useEffect(() => {
    const activityIdToOpen = locationState?.openActivity;
    if (activityIdToOpen) {
      const activityToOpen = activities.find(a => a.id === activityIdToOpen);
      if (activityToOpen) {
        handleOpenFormModal(activityToOpen);
        // Clear state to prevent modal from re-opening on navigation
        window.history.replaceState({}, document.title)
      }
    }
  }, [locationState, activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      return (
        (domainFilter === '' || activity.securityDomain === domainFilter) &&
        (statusFilter === '' || activity.status === statusFilter) &&
        (priorityFilter === '' || activity.priority === priorityFilter) &&
        (processFilter === '' || activity.functionalProcessId === processFilter) &&
        (resourceFilter === '' || activity.owner === resourceFilter) &&
        (searchTerm === '' || activity.title.toLowerCase().includes(searchTerm.toLowerCase()) || activity.activityId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [activities, domainFilter, statusFilter, priorityFilter, processFilter, resourceFilter, searchTerm]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedActivities = useMemo(() => {
    let sortableItems = [...filteredActivities];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: string | undefined;
        let bValue: string | undefined;

        if (sortConfig.key === 'processName') {
          aValue = processMap.get(a.functionalProcessId);
          bValue = processMap.get(b.functionalProcessId);
        } else {
          aValue = a[sortConfig.key as keyof Activity] as string;
          bValue = b[sortConfig.key as keyof Activity] as string;
        }
        
        aValue = aValue || '';
        bValue = bValue || '';

        const comparison = aValue.localeCompare(bValue, 'fr', { numeric: true, sensitivity: 'base' });
        
        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    }
    return sortableItems;
  }, [filteredActivities, sortConfig, processMap]);

  const handleOpenFormModal = (activityToEdit?: Activity) => {
    if (activityToEdit) {
      // When editing, deduce selected chantiers from the selected objectives
      const chantierIds = Array.from(new Set(
        objectives
          .filter(o => activityToEdit.objectives.includes(o.id))
          .map(o => o.chantierId)
      ));
      setCurrentActivity({...activityToEdit, chantierIds});
      setIsEditMode(true);
    } else {
      if(isReadOnly) return;
      setCurrentActivity({
        activityId: `ACT-${String(activities.length + 1).padStart(3, '0')}`,
        title: '',
        description: '',
        status: ActivityStatus.NOT_STARTED,
        priority: Priority.MEDIUM,
        activityType: ActivityType.PONCTUAL,
        securityDomain: SecurityDomain.GOUVERNANCE,
        isoMeasures: [],
        strategicOrientations: [],
        chantierIds: [],
        objectives: [],
        owner: resources[0]?.id || '',
        functionalProcessId: securityProcesses[0]?.id || ''
      });
      setIsEditMode(false);
    }
    setIsoSearchTerm('');
    setIsFormModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsFormModalOpen(false);
    setIsWizardOpen(false);
    setCurrentActivity(null);
    setIsEditMode(false);
    setIsoSearchTerm('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (currentActivity) {
      const { name, value } = e.target;
      if (name === 'workloadInPersonDays') {
          setCurrentActivity({ ...currentActivity, workloadInPersonDays: value ? parseFloat(value) : undefined });
      } else {
          setCurrentActivity({ ...currentActivity, [name]: value });
      }
    }
  };

  const handleCustomMultiSelectChange = (name: string, value: string[]) => {
    if (currentActivity) {
      setCurrentActivity(prev => ({ ...prev!, [name]: value }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentActivity || isReadOnly) return;

    if (!currentActivity.title || !currentActivity.activityId) {
      alert("L'ID d'activité et le titre sont obligatoires.");
      return;
    }
    
    // Create a clean activity object without the temporary `chantierIds` field
    const { chantierIds, ...activityToSave } = currentActivity;

    if (isEditMode && activityToSave.id) {
        const updatedActivity: Activity = {
            ...activityToSave,
            updatedAt: new Date().toISOString(),
        } as Activity;
        setActivities(prev => prev.map(act => act.id === updatedActivity.id ? updatedActivity : act));
    } else {
        const newActivity: Activity = {
            id: `act-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...activityToSave,
        } as Activity;
        
        setActivities(prev => [newActivity, ...prev]);
    }
    handleCloseModals();
  };
  
  const handleSaveFromWizard = (newActivity: Activity) => {
    setActivities(prev => [newActivity, ...prev]);
    handleCloseModals();
  }
  
  const activeFiltersForDisplay = useMemo(() => {
    const filters: { [key: string]: string } = {};
    if (domainFilter) filters['Domaine'] = domainFilter;
    if (statusFilter) filters['Statut'] = statusFilter;
    if (priorityFilter) filters['Priorité'] = priorityFilter;
    if (resourceFilter) filters['Ressource'] = resourceMap.get(resourceFilter) || resourceFilter;
    if (processFilter) filters['Processus'] = processMap.get(processFilter) || processFilter;
    return filters;
  }, [domainFilter, statusFilter, priorityFilter, resourceFilter, processFilter, resourceMap, processMap]);

  const handleRemoveFilter = (key: string) => {
    if (key === 'Domaine') setDomainFilter('');
    if (key === 'Statut') setStatusFilter('');
    if (key === 'Priorité') setPriorityFilter('');
    if (key === 'Ressource') setResourceFilter('');
    if (key === 'Processus') setProcessFilter('');
  };

  const handleClearAll = () => {
    setDomainFilter('');
    setStatusFilter('');
    setPriorityFilter('');
    setResourceFilter('');
    setProcessFilter('');
    setSearchTerm('');
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Activités</h1>
        {!isReadOnly && (
          <div className="flex items-center gap-2">
            <button onClick={() => setIsWizardOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Sparkles size={20} />
              <span>Création guidée</span>
            </button>
          </div>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <ActivityFilter 
            searchTerm={searchTerm}
            domainFilter={domainFilter}
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            processFilter={processFilter}
            resourceFilter={resourceFilter}
            setSearchTerm={setSearchTerm}
            setDomainFilter={setDomainFilter}
            setStatusFilter={setStatusFilter}
            setPriorityFilter={setPriorityFilter}
            setProcessFilter={setProcessFilter}
            setResourceFilter={setResourceFilter}
            securityProcesses={securityProcesses}
            resources={resources}
          />
          <ActiveFiltersDisplay filters={activeFiltersForDisplay} onRemoveFilter={handleRemoveFilter} onClearAll={handleClearAll} />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                <tr>
                  <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => requestSort('activityId')}>
                    <div className="flex items-center gap-1.5">
                      ID
                      {sortConfig?.key === 'activityId' && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => requestSort('title')}>
                    <div className="flex items-center gap-1.5">
                      Titre
                      {sortConfig?.key === 'title' && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => requestSort('securityDomain')}>
                    <div className="flex items-center gap-1.5">
                      Domaine
                      {sortConfig?.key === 'securityDomain' && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => requestSort('status')}>
                    <div className="flex items-center gap-1.5">
                      Statut
                      {sortConfig?.key === 'status' && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => requestSort('priority')}>
                    <div className="flex items-center gap-1.5">
                      Priorité
                      {sortConfig?.key === 'priority' && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => requestSort('processName')}>
                    <div className="flex items-center gap-1.5">
                      Processus
                      {sortConfig?.key === 'processName' && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3">Mesures ISO</th>
                  <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {sortedActivities.map(activity => (
                  <tr key={activity.id} className="bg-white border-b hover:bg-slate-50">
                    <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                      {activity.activityId}
                    </th>
                    <td className="px-6 py-4">{activity.title}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${DOMAIN_COLORS[activity.securityDomain]}`}>
                        {activity.securityDomain}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[activity.status]}`}>
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${PRIORITY_COLORS[activity.priority]}`}>
                        {activity.priority}
                      </span>
                    </td>
                     <td className="px-6 py-4 max-w-xs">
                        <span className="text-xs truncate">{processMap.get(activity.functionalProcessId) || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {activity.isoMeasures.map(code => (
                          <span key={code} className="px-2 py-0.5 text-xs font-mono bg-slate-200 text-slate-700 rounded">
                            {code}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button onClick={() => handleOpenFormModal(activity)} className="p-1 text-slate-500 rounded-md hover:bg-slate-100 hover:text-blue-600" title="Modifier l'activité">
                        <Edit size={18} />
                      </button>
                      {!isReadOnly && (
                        <button onClick={() => handleOpenDeleteModal(activity)} className="p-1 text-slate-500 rounded-md hover:bg-slate-100 hover:text-red-600" title="Supprimer l'activité">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sortedActivities.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                    <p>Aucune activité ne correspond à vos critères de recherche.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {isFormModalOpen && currentActivity && (
        <Modal 
          isOpen={isFormModalOpen} 
          onClose={handleCloseModals}
          title={isEditMode ? "Détails de l'activité" : "Nouvelle activité"}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="activityId" className="block text-sm font-medium text-slate-700">ID activité</label>
              <input type="text" name="activityId" id="activityId" value={currentActivity.activityId || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" required readOnly={isReadOnly} />
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700">Titre</label>
              <input type="text" name="title" id="title" value={currentActivity.title || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" required readOnly={isReadOnly} />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
              <textarea name="description" id="description" value={currentActivity.description || ''} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" readOnly={isReadOnly} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700">Statut</label>
                <select name="status" id="status" value={currentActivity.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" disabled={isReadOnly}>
                  {Object.values(ActivityStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-slate-700">Priorité</label>
                <select name="priority" id="priority" value={currentActivity.priority} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" disabled={isReadOnly}>
                  {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="activityType" className="block text-sm font-medium text-slate-700">Type d'activité</label>
                <select name="activityType" id="activityType" value={currentActivity.activityType} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" disabled={isReadOnly}>
                  {Object.values(ActivityType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="securityDomain" className="block text-sm font-medium text-slate-700">Domaine de sécurité</label>
                <select name="securityDomain" id="securityDomain" value={currentActivity.securityDomain} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" disabled={isReadOnly}>
                  {Object.values(SecurityDomain).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">Date de début (prévue)</label>
                    <CalendarDatePicker
                      id="startDate"
                      name="startDate"
                      value={currentActivity.startDate ? currentActivity.startDate.split('T')[0] : ''}
                      onChange={handleChange}
                      readOnly={isReadOnly}
                    />
                </div>
                <div>
                    <label htmlFor="endDatePlanned" className="block text-sm font-medium text-slate-700">Date de fin (prévue)</label>
                    <CalendarDatePicker
                      id="endDatePlanned"
                      name="endDatePlanned"
                      value={currentActivity.endDatePlanned ? currentActivity.endDatePlanned.split('T')[0] : ''}
                      onChange={handleChange}
                      readOnly={isReadOnly}
                    />
                </div>
            </div>

            <div>
              <label htmlFor="functionalProcessId" className="block text-sm font-medium text-slate-700">Processus fonctionnel</label>
              <select name="functionalProcessId" id="functionalProcessId" value={currentActivity.functionalProcessId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" disabled={isReadOnly}>
                {securityProcesses.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
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
                      disabled={isReadOnly}
                    />
                </div>
                <CustomMultiSelect
                    label=""
                    name="isoMeasures"
                    options={filteredIsoOptions}
                    selectedValues={currentActivity.isoMeasures || []}
                    onChange={handleCustomMultiSelectChange}
                    disabled={isReadOnly}
                />
            </div>

            <CustomMultiSelect
                label="Orientations stratégiques"
                name="strategicOrientations"
                options={orientations.map(o => ({ value: o.id, label: `${o.code} - ${o.label}`}))}
                selectedValues={currentActivity.strategicOrientations || []}
                onChange={handleCustomMultiSelectChange}
                disabled={isReadOnly}
            />

            <CustomMultiSelect
                label="Chantiers"
                name="chantierIds"
                options={filteredChantiers.map(c => ({ value: c.id, label: `${c.code} - ${c.label}`}))}
                selectedValues={currentActivity.chantierIds || []}
                onChange={handleCustomMultiSelectChange}
                disabled={isReadOnly || !currentActivity.strategicOrientations || currentActivity.strategicOrientations.length === 0}
            />
            
            <CustomMultiSelect
                label="Objectifs"
                name="objectives"
                options={filteredObjectives.map(o => ({ value: o.id, label: `${o.code} - ${o.label}`}))}
                selectedValues={currentActivity.objectives || []}
                onChange={handleCustomMultiSelectChange}
                disabled={isReadOnly || !currentActivity.chantierIds || currentActivity.chantierIds.length === 0}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="owner" className="block text-sm font-medium text-slate-700">Responsable</label>
                <select name="owner" id="owner" value={currentActivity.owner} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" disabled={isReadOnly}>
                  <option value="">Non assigné</option>
                  {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                  <label htmlFor="workloadInPersonDays" className="block text-sm font-medium text-slate-700">Charge (J/H)</label>
                  <input type="number" name="workloadInPersonDays" id="workloadInPersonDays" value={currentActivity.workloadInPersonDays || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" readOnly={isReadOnly} min="0" step="0.5"/>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t mt-6">
              <button type="button" onClick={handleCloseModals} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-transparent rounded-md hover:bg-slate-200">
                {isReadOnly ? 'Fermer' : 'Annuler'}
              </button>
              {!isReadOnly && (
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">Enregistrer</button>
              )}
            </div>
          </form>
        </Modal>
      )}

      {isWizardOpen && (
        <GuidedActivityWizard 
          isOpen={isWizardOpen}
          onClose={handleCloseModals}
          onSave={handleSaveFromWizard}
          onSwitchToManual={() => {
            handleCloseModals();
            handleOpenFormModal();
          }}
        />
      )}
      
      {isDeleteModalOpen && activityToDelete && (
        <Modal
            isOpen={isDeleteModalOpen}
            onClose={handleCloseDeleteModal}
            title="Confirmer la suppression"
        >
            <p>Êtes-vous sûr de vouloir supprimer l'activité "{activityToDelete.title}" ? Cette action est irréversible.</p>
            <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
            <button type="button" onClick={handleCloseDeleteModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">
                Annuler
            </button>
            <button type="button" onClick={confirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                Supprimer
            </button>
            </div>
        </Modal>
      )}
    </div>
  );
};

export default Activities;