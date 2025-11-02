import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Activity, ActivityStatus, Priority, SecurityDomain, ActivityType } from '../types';
import { DOMAIN_COLORS, STATUS_COLORS, PRIORITY_COLORS, ISO_MEASURES_DATA } from '../constants';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { Search, PlusCircle } from 'lucide-react';

const ActivityFilter: React.FC<{
  setDomainFilter: (domain: string) => void;
  setStatusFilter: (status: string) => void;
  setPriorityFilter: (priority: string) => void;
  setSearchTerm: (term: string) => void;
}> = ({ setDomainFilter, setStatusFilter, setPriorityFilter, setSearchTerm }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher une activité..."
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <select 
        onChange={(e) => setDomainFilter(e.target.value)}
        className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">Tous les domaines</option>
        {Object.values(SecurityDomain).map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <select 
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">Tous les statuts</option>
        {Object.values(ActivityStatus).map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <select 
        onChange={(e) => setPriorityFilter(e.target.value)}
        className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">Toutes les priorités</option>
        {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
      </select>
    </div>
  );
};

const Activities: React.FC = () => {
  const { activities, setActivities, objectives, orientations, resources } = useData();
  const [domainFilter, setDomainFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Partial<Activity> | null>(null);

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      return (
        (domainFilter === '' || activity.securityDomain === domainFilter) &&
        (statusFilter === '' || activity.status === statusFilter) &&
        (priorityFilter === '' || activity.priority === priorityFilter) &&
        (searchTerm === '' || activity.title.toLowerCase().includes(searchTerm.toLowerCase()) || activity.activityId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [activities, domainFilter, statusFilter, priorityFilter, searchTerm]);

  const handleOpenModal = () => {
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
      owner: resources[0]?.id || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentActivity(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (currentActivity) {
      const { name, value } = e.target;
      setCurrentActivity({ ...currentActivity, [name]: value });
    }
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (currentActivity) {
      const { name, options } = e.target;
      const value: string[] = [];
      for (let i = 0, l = options.length; i < l; i++) {
        if (options[i].selected) {
          value.push(options[i].value);
        }
      }
      setCurrentActivity({ ...currentActivity, [name]: value });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentActivity) return;

    if (!currentActivity.title || !currentActivity.activityId) {
      alert("L'ID d'activité et le titre sont obligatoires.");
      return;
    }

    const newActivity: Activity = {
        id: `act-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...currentActivity,
    } as Activity;
    
    setActivities(prev => [newActivity, ...prev]);
    handleCloseModal();
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Activités</h1>
        <button onClick={handleOpenModal} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <PlusCircle size={20} />
          <span>Nouvelle activité</span>
        </button>
      </div>
      
      <Card>
        <CardHeader>
          <ActivityFilter 
            setDomainFilter={setDomainFilter}
            setStatusFilter={setStatusFilter}
            setPriorityFilter={setPriorityFilter}
            setSearchTerm={setSearchTerm}
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
                  <th scope="col" className="px-6 py-3">Mesures ISO</th>
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
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {activity.isoMeasures.map(code => (
                          <span key={code} className="px-2 py-0.5 text-xs font-mono bg-slate-200 text-slate-700 rounded">
                            {code}
                          </span>
                        ))}
                      </div>
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
      
      {isModalOpen && currentActivity && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
          title="Nouvelle activité"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="activityId" className="block text-sm font-medium text-slate-700">ID Activité</label>
              <input type="text" name="activityId" id="activityId" value={currentActivity.activityId || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" required />
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700">Titre</label>
              <input type="text" name="title" id="title" value={currentActivity.title || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" required />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
              <textarea name="description" id="description" value={currentActivity.description || ''} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700">Statut</label>
                <select name="status" id="status" value={currentActivity.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm">
                  {Object.values(ActivityStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-slate-700">Priorité</label>
                <select name="priority" id="priority" value={currentActivity.priority} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm">
                  {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="activityType" className="block text-sm font-medium text-slate-700">Type d'activité</label>
                <select name="activityType" id="activityType" value={currentActivity.activityType} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm">
                  {Object.values(ActivityType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="securityDomain" className="block text-sm font-medium text-slate-700">Domaine de sécurité</label>
                <select name="securityDomain" id="securityDomain" value={currentActivity.securityDomain} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm">
                  {Object.values(SecurityDomain).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="isoMeasures" className="block text-sm font-medium text-slate-700">Mesures ISO (maintenez Ctrl/Cmd pour sélectionner plusieurs)</label>
              <select name="isoMeasures" id="isoMeasures" multiple value={currentActivity.isoMeasures || []} onChange={handleMultiSelectChange} className="mt-1 block w-full h-32 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm">
                {ISO_MEASURES_DATA.map(m => <option key={m.code} value={m.code}>{m.code} - {m.title}</option>)}
              </select>
            </div>
            
            <div>
              <label htmlFor="objectives" className="block text-sm font-medium text-slate-700">Objectifs (maintenez Ctrl/Cmd pour sélectionner plusieurs)</label>
              <select name="objectives" id="objectives" multiple value={currentActivity.objectives || []} onChange={handleMultiSelectChange} className="mt-1 block w-full h-32 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm">
                {objectives.map(o => <option key={o.id} value={o.id}>{o.code} - {o.label}</option>)}
              </select>
            </div>
            
            <div>
              <label htmlFor="strategicOrientations" className="block text-sm font-medium text-slate-700">Orientations stratégiques (maintenez Ctrl/Cmd pour sélectionner plusieurs)</label>
              <select name="strategicOrientations" id="strategicOrientations" multiple value={currentActivity.strategicOrientations || []} onChange={handleMultiSelectChange} className="mt-1 block w-full h-32 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm">
                {orientations.map(o => <option key={o.id} value={o.id}>{o.code} - {o.label}</option>)}
              </select>
            </div>
             <div>
                <label htmlFor="owner" className="block text-sm font-medium text-slate-700">Responsable</label>
                <select name="owner" id="owner" value={currentActivity.owner} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm">
                  <option value="">Non assigné</option>
                  {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

            <div className="flex justify-end gap-2 pt-4 border-t mt-6">
              <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-transparent rounded-md hover:bg-slate-200">Annuler</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">Enregistrer</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Activities;
