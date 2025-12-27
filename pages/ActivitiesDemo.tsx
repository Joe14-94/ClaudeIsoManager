
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Activity, ActivityStatus, Priority, SecurityDomain, ActivityType, SecurityProcess, Resource } from '../types';
import { DOMAIN_COLORS, STATUS_COLORS, PRIORITY_COLORS } from '../constants';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { Search, Edit, Sparkles, ArrowUp, ArrowDown, Trash2, Copy, ArrowLeft, Zap } from 'lucide-react';
import GuidedActivityWizard from '../components/wizards/GuidedActivityWizard';
import ActiveFiltersDisplay from '../components/ui/ActiveFiltersDisplay';
import ActivityForm from '../components/activities/ActivityForm';
import { useTableSort } from '../hooks/useTableSort';
import ExportButton from '../components/ui/ExportButton';
import { CsvColumn, dateFormatters, arrayFormatter, numberFormatters } from '../utils/csvExport';
import { useSavedFilters } from '../hooks/useSavedFilters';
import SavedFiltersMenu from '../components/ui/SavedFiltersMenu';
import BulkDuplicateModal from '../components/ui/BulkDuplicateModal';
import { duplicateActivities } from '../utils/duplication';

type FormActivity = Partial<Activity> & { chantierIds?: string[] };

const ActivityFilter: React.FC<{ searchTerm: string; domainFilter: string; statusFilter: string; priorityFilter: string; processFilter: string; resourceFilter: string; setDomainFilter: (domain: string) => void; setStatusFilter: (status: string) => void; setPriorityFilter: (priority: string) => void; setProcessFilter: (process: string) => void; setResourceFilter: (resourceId: string) => void; setSearchTerm: (term: string) => void; securityProcesses: SecurityProcess[]; resources: Resource[]; }> = ({ searchTerm, domainFilter, statusFilter, priorityFilter, processFilter, resourceFilter, setDomainFilter, setStatusFilter, setPriorityFilter, setProcessFilter, setResourceFilter, setSearchTerm, securityProcesses, resources }) => {
  return (
    <div className="flex flex-col md:flex-row flex-wrap gap-3 mb-3">
      <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} /><input type="text" placeholder="Rechercher une activité..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
      <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"><option value="">Tous les domaines</option>{Object.values(SecurityDomain).map(d => <option key={d} value={d}>{d}</option>)}</select>
      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"><option value="">Tous les statuts</option>{Object.values(ActivityStatus).map(s => <option key={s} value={s}>{s}</option>)}</select>
      <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"><option value="">Toutes les priorités</option>{Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}</select>
       <select value={resourceFilter} onChange={(e) => setResourceFilter(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"><option value="">Toutes les ressources</option>{resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
      <select value={processFilter} onChange={(e) => setProcessFilter(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"><option value="">Tous les processus</option>{securityProcesses.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
    </div>
  );
};

const ActivitiesDemo: React.FC = () => {
  const { activities, setActivities, objectives, resources, securityProcesses } = useData();
  const isReadOnly = false;
  const location = useLocation();
  const locationState = location.state as any;

  const [domainFilter, setDomainFilter] = useState(locationState?.domainFilter || '');
  const [statusFilter, setStatusFilter] = useState(locationState?.statusFilter || '');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [processFilter, setProcessFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  const { sortConfig, requestSort } = useTableSort<Activity>(activities, 'activityId');

  // Système de filtres sauvegardés
  const { savedFilters, saveCurrentFilter, loadFilter, deleteFilter } = useSavedFilters('activities');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<FormActivity | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  const [isBulkDuplicateModalOpen, setIsBulkDuplicateModalOpen] = useState(false);

  const processMap = useMemo(() => new Map(securityProcesses.map(p => [p.id, p.name])), [securityProcesses]);
  const resourceMap = useMemo(() => new Map(resources.map(r => [r.id, r.name])), [resources]);

  const handleOpenDeleteModal = (activity: Activity) => { if (isReadOnly) return; setActivityToDelete(activity); setIsDeleteModalOpen(true); };
  const handleCloseDeleteModal = () => { setActivityToDelete(null); setIsDeleteModalOpen(false); };
  const confirmDelete = () => { if (isReadOnly || !activityToDelete) return; setActivities(prev => prev.filter(activity => activity.id !== activityToDelete.id)); handleCloseDeleteModal(); };

  useEffect(() => {
    const activityIdToOpen = locationState?.openActivity;
    if (activityIdToOpen) {
      const activityToOpen = activities.find(a => a.id === activityIdToOpen);
      if (activityToOpen) {
        handleOpenFormModal(activityToOpen);
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
      const chantierIds = Array.from(new Set(objectives.filter(o => activityToEdit.objectives.includes(o.id)).map(o => o.chantierId)));
      setCurrentActivity({...activityToEdit, chantierIds});
      setIsEditMode(true);
    } else {
      if(isReadOnly) return;
      setCurrentActivity({ activityId: `ACT-${String(activities.length + 1).padStart(3, '0')}`, title: '', description: '', status: ActivityStatus.NOT_STARTED, priority: Priority.MEDIUM, activityType: ActivityType.PONCTUAL, securityDomain: SecurityDomain.GOUVERNANCE, isoMeasures: [], strategicOrientations: [], chantierIds: [], objectives: [], owner: resources[0]?.id || '', functionalProcessId: securityProcesses[0]?.id || '', isExternalService: false, budgetRequested: undefined, budgetApproved: undefined, budgetCommitted: undefined, validatedPurchaseOrders: undefined, completedPV: undefined, forecastedPurchaseOrders: undefined, });
      setIsEditMode(false);
    }
    setIsFormModalOpen(true);
  };

  const handleCloseModals = () => { setIsFormModalOpen(false); setIsWizardOpen(false); setCurrentActivity(null); setIsEditMode(false); };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentActivity || isReadOnly) return;
    if (!currentActivity.title || !currentActivity.activityId) { alert("L'ID d'activité et le titre sont obligatoires."); return; }
    const { chantierIds, ...activityToSave } = currentActivity;
    if (isEditMode && activityToSave.id) {
        const updatedActivity: Activity = { ...activityToSave, updatedAt: new Date().toISOString(), } as Activity;
        setActivities(prev => prev.map(act => act.id === updatedActivity.id ? updatedActivity : act));
    } else {
        const newActivity: Activity = { id: `act-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...activityToSave, } as Activity;
        setActivities(prev => [newActivity, ...prev]);
    }
    handleCloseModals();
  };

  const handleSaveFromWizard = (newActivity: Activity) => { setActivities(prev => [newActivity, ...prev]); handleCloseModals(); }

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
    if (key === 'Domaine') setDomainFilter(''); if (key === 'Statut') setStatusFilter(''); if (key === 'Priorité') setPriorityFilter(''); if (key === 'Ressource') setResourceFilter(''); if (key === 'Processus') setProcessFilter('');
  };

  const handleClearAll = () => { setDomainFilter(''); setStatusFilter(''); setPriorityFilter(''); setResourceFilter(''); setProcessFilter(''); setSearchTerm(''); };

  const handleBulkDuplicate = (selectedIds: string[], options: any) => {
    const duplicated = duplicateActivities(activities, selectedIds, options);
    setActivities(prev => [...duplicated, ...prev]);
    setIsBulkDuplicateModalOpen(false);
  };

  // Gestion des filtres sauvegardés
  const handleSaveFilters = (name: string) => {
    const currentFilters = {
      domainFilter,
      statusFilter,
      priorityFilter,
      resourceFilter,
      processFilter,
      searchTerm,
    };
    saveCurrentFilter(name, currentFilters);
  };

  const handleLoadFilters = (filterId: string) => {
    const filters = loadFilter(filterId);
    if (filters) {
      setDomainFilter(filters.domainFilter || '');
      setStatusFilter(filters.statusFilter || '');
      setPriorityFilter(filters.priorityFilter || '');
      setResourceFilter(filters.resourceFilter || '');
      setProcessFilter(filters.processFilter || '');
      setSearchTerm(filters.searchTerm || '');
    }
  };

  const hasActiveFilters = Boolean(
    domainFilter || statusFilter || priorityFilter || resourceFilter || processFilter || searchTerm
  );
  const renderSortArrow = (key: string) => { if (sortConfig?.key === key) return sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />; return null; }

  // Configuration des colonnes pour l'export CSV
  const csvColumns: CsvColumn<Activity>[] = useMemo(() => [
    { header: 'ID', accessor: 'activityId' },
    { header: 'Titre', accessor: 'title' },
    { header: 'Description', accessor: 'description' },
    { header: 'Domaine de sécurité', accessor: 'securityDomain' },
    { header: 'Statut', accessor: 'status' },
    { header: 'Priorité', accessor: 'priority' },
    { header: 'Type', accessor: 'activityType' },
    { header: 'Processus fonctionnel', accessor: (a) => processMap.get(a.functionalProcessId) || 'N/A' },
    { header: 'Responsable', accessor: (a) => resourceMap.get(a.owner || '') || 'N/A' },
    { header: 'Mesures ISO', accessor: (a) => a.isoMeasures, formatter: arrayFormatter },
    { header: 'Orientations stratégiques', accessor: (a) => a.strategicOrientations, formatter: arrayFormatter },
    { header: 'Date de début', accessor: 'startDate', formatter: dateFormatters.french },
    { header: 'Date de fin prévue', accessor: 'endDatePlanned', formatter: dateFormatters.french },
    { header: 'Charge prévue (j/h)', accessor: 'workloadInPersonDays', formatter: (v) => v ? String(v) : '' },
    { header: 'Charge consommée (j/h)', accessor: 'consumedWorkload', formatter: (v) => v ? String(v) : '' },
    { header: 'Service externe', accessor: (a) => a.isExternalService ? 'Oui' : 'Non' },
    { header: 'Budget demandé', accessor: 'budgetRequested', formatter: (v) => v ? numberFormatters.currency(v) : '' },
    { header: 'Budget approuvé', accessor: 'budgetApproved', formatter: (v) => v ? numberFormatters.currency(v) : '' },
    { header: 'Budget engagé', accessor: 'budgetCommitted', formatter: (v) => v ? numberFormatters.currency(v) : '' },
    { header: 'Créé le', accessor: 'createdAt', formatter: dateFormatters.frenchWithTime },
    { header: 'Modifié le', accessor: 'updatedAt', formatter: dateFormatters.frenchWithTime },
  ], [processMap, resourceMap]);

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Badge de démonstration */}
      <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200 rounded-lg p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap className="text-emerald-600" size={20} />
            <div>
              <p className="text-sm font-semibold text-emerald-900">Design optimisé - Version démo</p>
              <p className="text-xs text-emerald-700">Espaces réduits : space-y-4 (16px), tables px-3 py-2, gaps optimisés</p>
            </div>
          </div>
          <Link
            to="/activities"
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            <span>Version originale</span>
          </Link>
        </div>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-slate-800">Activités</h1>
        <div className="flex items-center gap-2">
          <SavedFiltersMenu
            savedFilters={savedFilters}
            onSave={handleSaveFilters}
            onLoad={handleLoadFilters}
            onDelete={deleteFilter}
            hasActiveFilters={hasActiveFilters}
          />
          <ExportButton
            data={sortedActivities}
            columns={csvColumns}
            filename={`activites-${new Date().toISOString().split('T')[0]}.csv`}
            label="Exporter"
          />
          {!isReadOnly && (
            <>
              <button
                onClick={() => setIsBulkDuplicateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Copy size={20} />
                <span>Duplication en masse</span>
              </button>
              <button
                onClick={() => setIsWizardOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Sparkles size={20} />
                <span>Création guidée</span>
              </button>
            </>
          )}
        </div>
      </div>
      <Card className="flex-grow flex flex-col min-h-0">
        <CardHeader>
          <ActivityFilter searchTerm={searchTerm} domainFilter={domainFilter} statusFilter={statusFilter} priorityFilter={priorityFilter} processFilter={processFilter} resourceFilter={resourceFilter} setSearchTerm={setSearchTerm} setDomainFilter={setDomainFilter} setStatusFilter={setStatusFilter} setPriorityFilter={setPriorityFilter} setProcessFilter={setProcessFilter} setResourceFilter={setResourceFilter} securityProcesses={securityProcesses} resources={resources} />
          <ActiveFiltersDisplay filters={activeFiltersForDisplay} onRemoveFilter={handleRemoveFilter} onClearAll={handleClearAll} />
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-3 py-2 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => requestSort('activityId')}><div className="flex items-center gap-1.5">ID {renderSortArrow('activityId')}</div></th>
                  <th scope="col" className="px-3 py-2 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => requestSort('title')}><div className="flex items-center gap-1.5">Titre {renderSortArrow('title')}</div></th>
                  <th scope="col" className="px-3 py-2 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => requestSort('securityDomain')}><div className="flex items-center gap-1.5">Domaine {renderSortArrow('securityDomain')}</div></th>
                  <th scope="col" className="px-3 py-2 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => requestSort('status')}><div className="flex items-center gap-1.5">Statut {renderSortArrow('status')}</div></th>
                  <th scope="col" className="px-3 py-2 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => requestSort('priority')}><div className="flex items-center gap-1.5">Priorité {renderSortArrow('priority')}</div></th>
                  <th scope="col" className="px-3 py-2 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => requestSort('processName')}><div className="flex items-center gap-1.5">Processus {renderSortArrow('processName')}</div></th>
                  <th scope="col" className="px-3 py-2">Mesures ISO</th>
                  <th scope="col" className="px-2 py-2"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {sortedActivities.map(activity => (
                  <tr key={activity.id} className="bg-white border-b hover:bg-slate-50 transition-colors">
                    <th scope="row" className="px-3 py-2 font-medium text-slate-900 whitespace-nowrap">{activity.activityId}</th>
                    <td className="px-3 py-2">{activity.title}</td>
                    <td className="px-3 py-2"><span className={`px-2 py-1 text-xs font-medium rounded-full border ${DOMAIN_COLORS[activity.securityDomain]}`}>{activity.securityDomain}</span></td>
                    <td className="px-3 py-2"><span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[activity.status]}`}>{activity.status}</span></td>
                    <td className="px-3 py-2"><span className={`px-2 py-1 text-xs font-medium rounded-full ${PRIORITY_COLORS[activity.priority]}`}>{activity.priority}</span></td>
                     <td className="px-3 py-2 max-w-xs"><span className="text-xs truncate">{processMap.get(activity.functionalProcessId) || 'N/A'}</span></td>
                    <td className="px-3 py-2"><div className="flex flex-wrap gap-1">{activity.isoMeasures.map(code => (<span key={code} className="px-2 py-0.5 text-xs font-mono bg-slate-200 text-slate-700 rounded">{code}</span>))}</div></td>
                    <td className="px-2 py-2 text-right space-x-1">
                      <button onClick={() => handleOpenFormModal(activity)} className="p-1 text-slate-500 rounded-md hover:bg-slate-100 hover:text-blue-600" title="Modifier l'activité"><Edit size={18} /></button>
                      {!isReadOnly && ( <button onClick={() => handleOpenDeleteModal(activity)} className="p-1 text-slate-500 rounded-md hover:bg-slate-100 hover:text-red-600" title="Supprimer l'activité"><Trash2 size={18} /></button> )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sortedActivities.length === 0 && <div className="text-center py-8 text-slate-500"><p>Aucune activité ne correspond à vos critères de recherche.</p></div>}
          </div>
        </CardContent>
      </Card>
      {isFormModalOpen && currentActivity && ( <Modal isOpen={isFormModalOpen} onClose={handleCloseModals} title={isEditMode ? "Détails de l'activité" : "Nouvelle activité"}><ActivityForm currentActivity={currentActivity} setCurrentActivity={setCurrentActivity} isReadOnly={isReadOnly} handleSave={handleSave} handleCloseModals={handleCloseModals}/></Modal> )}
      {isWizardOpen && ( <GuidedActivityWizard isOpen={isWizardOpen} onClose={handleCloseModals} onSave={handleSaveFromWizard} onSwitchToManual={() => { handleCloseModals(); handleOpenFormModal(); }}/> )}
      {isDeleteModalOpen && activityToDelete && ( <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} title="Confirmer la suppression"><p>Êtes-vous sûr de vouloir supprimer l'activité "{activityToDelete.title}" ? Cette action est irréversible.</p><div className="flex justify-end gap-2 pt-4 mt-4 border-t"><button type="button" onClick={handleCloseDeleteModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">Annuler</button><button type="button" onClick={confirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Supprimer</button></div></Modal> )}
      {isBulkDuplicateModalOpen && (
        <BulkDuplicateModal
          isOpen={isBulkDuplicateModalOpen}
          onClose={() => setIsBulkDuplicateModalOpen(false)}
          items={sortedActivities}
          getItemId={(a) => a.id}
          getItemLabel={(a) => `${a.activityId} - ${a.title}`}
          onDuplicate={handleBulkDuplicate}
          entityName="activités"
        />
      )}
    </div>
  );
};
export default ActivitiesDemo;
