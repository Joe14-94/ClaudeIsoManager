import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Activity, ActivityStatus, Priority, SecurityDomain, ActivityType, SecurityProcess } from '../types';
import { DOMAIN_COLORS, STATUS_COLORS, PRIORITY_COLORS, ISO_MEASURES_DATA } from '../constants';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { Search, PlusCircle, Edit, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import GuidedActivityWizard from '../components/wizards/GuidedActivityWizard';
import CustomMultiSelect from '../components/ui/CustomMultiSelect';

const ActivityFilter: React.FC<{
  searchTerm: string;
  domainFilter: string;
  statusFilter: string;
  priorityFilter: string;
  processFilter: string;
  setDomainFilter: (domain: string) => void;
  setStatusFilter: (status: string) => void;
  setPriorityFilter: (priority: string) => void;
  setProcessFilter: (process: string) => void;
  setSearchTerm: (term: string) => void;
  securityProcesses: SecurityProcess[];
}> = ({ searchTerm, domainFilter, statusFilter, priorityFilter, processFilter, setDomainFilter, setStatusFilter, setPriorityFilter, setProcessFilter, setSearchTerm, securityProcesses }) => {
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

const Activities: React.FC = () => {
  const { activities, setActivities, objectives, orientations, resources, securityProcesses } = useData();
  const { userRole } = useAuth();
  const isReadOnly = userRole === 'readonly';
  const location = useLocation();
  
  const [domainFilter, setDomainFilter] = useState(location.state?.domainFilter || '');
  const [statusFilter, setStatusFilter] = useState(location.state?.statusFilter || '');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [processFilter, setProcessFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Partial<Activity> | null>(null);

  const processMap = useMemo(() => new Map(securityProcesses.map(p => [p.id, p.name])), [securityProcesses]);
  
  const filteredObjectives = useMemo(() => {
    if (!currentActivity?.strategicOrientations || currentActivity.strategicOrientations.length === 0) {
      return objectives;
    }
    const selectedOrientationIds = new Set(currentActivity.strategicOrientations);
    
    const prefixes = Array.from(selectedOrientationIds).map(id => {
      const orientation = orientations.find(o => o.id === id);
      if (!orientation) return null;
      const parts = orientation.code.split('.');
      if (parts.length < 2) return null;
      const prefix = `${parts[0]}.${String(parts[1]).padStart(2, '0')}`;
      return prefix;
    }).filter(p => p !== null) as string[];

    if(prefixes.length === 0) {
      return objectives;
    }
    
    return objectives.filter(obj => 
      prefixes.some(prefix => obj.code.startsWith(prefix))
    );
  }, [currentActivity?.strategicOrientations, objectives, orientations]);


  useEffect(() => {
    if (currentActivity?.objectives?.length) {
      const availableObjectiveIds = new Set(filteredObjectives.map(o => o.id));
      const validSelectedObjectives = currentActivity.objectives.filter(id => availableObjectiveIds.has(id));

      if (validSelectedObjectives.length !== currentActivity.objectives.length) {
        setCurrentActivity(prev => ({
          ...prev!,
          objectives: validSelectedObjectives,
        }));
      }
    }
  }, [filteredObjectives, currentActivity?.objectives]);


  useEffect(() => {
    const activityIdToOpen = location.state?.openActivity;
    if (activityIdToOpen) {
      const activityToOpen = activities.find(a => a.id === activityIdToOpen);
      if (activityToOpen) {
        handleOpenFormModal(activityToOpen);
      }
    }
  }, [location.state, activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      return (
        (domainFilter === '' || activity.securityDomain === domainFilter) &&
        (statusFilter === '' || activity.status === statusFilter) &&
        (priorityFilter === '' || activity.priority === priorityFilter) &&
        (processFilter === '' || activity.functionalProcessId === processFilter) &&
        (searchTerm === '' || activity.title.toLowerCase().includes(searchTerm.toLowerCase()) || activity.activityId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [activities, domainFilter, statusFilter, priorityFilter, processFilter, searchTerm]);

  const handleOpenFormModal = (activityToEdit?: Activity) => {
    if (activityToEdit) {
      setCurrentActivity(activityToEdit);
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
        objectives: [],
        owner: resources[0]?.id || '',
        functionalProcessId: securityProcesses[0]?.id || ''
      });
      setIsEditMode(false);
    }
    setIsFormModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsFormModalOpen(false);
    setIsWizardOpen(false);
    setCurrentActivity(null);
    setIsEditMode(false);
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
    
    if (isEditMode && currentActivity.id) {
        const updatedActivity: Activity = {
            ...currentActivity,
            updatedAt: new Date().toISOString(),
        } as Activity;
        setActivities(prev => prev.map(act => act.id === updatedActivity.id ? updatedActivity : act));
    } else {
        const newActivity: Activity = {
            id: `act-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...currentActivity,
        } as Activity;
        
        setActivities(prev => [newActivity, ...prev]);
    }
    handleCloseModals();
  };
  
  const handleSaveFromWizard = (newActivity: Activity) => {
    setActivities(prev => [newActivity, ...prev]);
    handleCloseModals();
  }


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
            setSearchTerm={setSearchTerm}
            setDomainFilter={setDomainFilter}
            setStatusFilter={setStatusFilter}
            setPriorityFilter={setPriorityFilter}
            setProcessFilter={setProcessFilter}
            securityProcesses={securityProcesses}
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                <tr>
                  <th scope="col" className="px-6 py-3">ID</th>
                  <th scope="col" className="px-6 py-3">Titre</th>
                  <th scope="col" className="px-6 py-3">Domaine</th>
                  <th scope="col" className="px-6 py-3">Statut</th>
                  <th scope="col" className="px-6 py-3">Priorité</th>
                  <th scope="col" className="px-6 py-3">Processus</th>
                  <th scope="col" className="px-6 py-3">Mesures ISO</th>
                  <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map(activity => (
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
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleOpenFormModal(activity)} className="p-1 text-slate-500 rounded-md hover:bg-slate-100 hover:text-blue-600">
                        <Edit size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredActivities.length === 0 && (
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
                    <input type="date" name="startDate" id="startDate" value={currentActivity.startDate ? currentActivity.startDate.split('T')[0] : ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" readOnly={isReadOnly} />
                </div>
                <div>
                    <label htmlFor="endDatePlanned" className="block text-sm font-medium text-slate-700">Date de fin (prévue)</label>
                    <input type="date" name="endDatePlanned" id="endDatePlanned" value={currentActivity.endDatePlanned ? currentActivity.endDatePlanned.split('T')[0] : ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" readOnly={isReadOnly} />
                </div>
            </div>

            <div>
              <label htmlFor="functionalProcessId" className="block text-sm font-medium text-slate-700">Processus fonctionnel</label>
              <select name="functionalProcessId" id="functionalProcessId" value={currentActivity.functionalProcessId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" disabled={isReadOnly}>
                {securityProcesses.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <CustomMultiSelect
                label="Mesures ISO (maintenez Ctrl/Cmd pour sélectionner plusieurs)"
                name="isoMeasures"
                options={ISO_MEASURES_DATA.map(m => ({ value: m.code, label: `${m.code} - ${m.title}` }))}
                selectedValues={currentActivity.isoMeasures || []}
                onChange={handleCustomMultiSelectChange}
                disabled={isReadOnly}
            />

            <CustomMultiSelect
                label="Orientations stratégiques (maintenez Ctrl/Cmd pour sélectionner plusieurs)"
                name="strategicOrientations"
                options={orientations.map(o => ({ value: o.id, label: `${o.code} - ${o.label}`}))}
                selectedValues={currentActivity.strategicOrientations || []}
                onChange={handleCustomMultiSelectChange}
                disabled={isReadOnly}
            />
            
            <CustomMultiSelect
                label="Objectifs (maintenez Ctrl/Cmd pour sélectionner plusieurs)"
                name="objectives"
                options={filteredObjectives.map(o => ({ value: o.id, label: `${o.code} - ${o.label}`}))}
                selectedValues={currentActivity.objectives || []}
                onChange={handleCustomMultiSelectChange}
                disabled={isReadOnly}
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
    </div>
  );
};

export default Activities;