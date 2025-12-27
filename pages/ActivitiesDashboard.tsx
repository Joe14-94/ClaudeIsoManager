import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useData } from '../contexts/DataContext';
import { Activity, ActivityStatus, SecurityDomain } from '../types';
import { ListChecks, CheckCircle, Clock, Pause, ShieldCheck, Edit, Trash2 } from 'lucide-react';
import { ISO_MEASURES_DATA, DOMAIN_COLORS, STATUS_COLORS, PRIORITY_COLORS } from '../constants';
import DomainDonutChart from '../components/charts/DomainDonutChart';
import StatusDonutChart from '../components/charts/StatusDonutChart';
import ActivityTimeline from '../components/charts/ActivityTimeline';
import ActiveFiltersDisplay from '../components/ui/ActiveFiltersDisplay';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; onClick?: () => void }> = ({ title, value, icon, onClick }) => (
  <Card className={`transition-shadow hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
    <CardContent className="flex items-center justify-between p-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
      <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
        {icon}
      </div>
    </CardContent>
  </Card>
);

const ActivitiesDashboard: React.FC = () => {
  // FIX: Removed unused 'processMap' which is not provided by the DataContext.
  const { activities, projects } = useData();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<Partial<{ status: ActivityStatus, domain: SecurityDomain }>>({});

  const filteredActivities = useMemo(() => {
    if (Object.keys(filters).length === 0) {
      return activities;
    }
    return activities.filter(activity => {
      const statusMatch = !filters.status || activity.status === filters.status;
      const domainMatch = !filters.domain || activity.securityDomain === filters.domain;
      return statusMatch && domainMatch;
    });
  }, [activities, filters]);


  const stats = useMemo(() => {
    const total = activities.length;
    const completed = activities.filter(a => a.status === ActivityStatus.COMPLETED).length;
    const inProgress = activities.filter(a => a.status === ActivityStatus.IN_PROGRESS).length;
    const coveredMeasures = new Set([...activities.flatMap(a => a.isoMeasures), ...projects.flatMap(p => p.isoMeasures || [])]).size;

    return {
      total,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      inProgress,
      coveredMeasures,
      totalMeasures: ISO_MEASURES_DATA.length,
    };
  }, [activities, projects]);
  
  const handleIsoClick = () => {
     const covered = new Set([...activities.flatMap(a => a.isoMeasures), ...projects.flatMap(p => p.isoMeasures || [])]);
     navigate('/iso27002', { state: { filter: 'covered', coveredMeasuresCodes: Array.from(covered) } })
  };

  const handleSliceClick = (filter: Partial<{ status: ActivityStatus, domain: SecurityDomain }>) => {
    setFilters(prev => ({...prev, ...filter}));
  };

  const handleRemoveFilter = (key: string) => {
    if (key === 'Statut') setFilters(prev => ({...prev, status: undefined}));
    if (key === 'Domaine') setFilters(prev => ({...prev, domain: undefined}));
  };

  const handleClearAll = () => setFilters({});

  const activeFiltersForDisplay = useMemo(() => {
    const displayFilters: { [key: string]: string } = {};
    if (filters.status) displayFilters['Statut'] = filters.status;
    if (filters.domain) displayFilters['Domaine'] = filters.domain;
    return displayFilters;
  }, [filters]);


  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-slate-800">Tableau de bord des activités</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Activités totales" 
          value={stats.total} 
          icon={<ListChecks size={24} />} 
          onClick={() => navigate('/activities')} 
        />
        <StatCard 
          title="Taux d'achèvement" 
          value={`${stats.completionRate}%`} 
          icon={<CheckCircle size={24} />}
          onClick={() => navigate('/activities', { state: { statusFilter: ActivityStatus.COMPLETED }})}
        />
        <StatCard 
          title="Activités en cours" 
          value={stats.inProgress} 
          icon={<Clock size={24} />}
          onClick={() => navigate('/activities', { state: { statusFilter: ActivityStatus.IN_PROGRESS }})}
        />
        <StatCard 
          title="Couverture ISO 27002" 
          value={`${stats.coveredMeasures} / ${stats.totalMeasures}`} 
          icon={<ShieldCheck size={24} />}
          onClick={handleIsoClick}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Répartition par domaine</CardTitle></CardHeader>
          <CardContent>
            <DomainDonutChart data={activities} onSliceClick={(domain) => handleSliceClick({ domain })} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Répartition par statut</CardTitle></CardHeader>
          <CardContent>
            <StatusDonutChart data={activities} onSliceClick={(status) => handleSliceClick({ status })} />
          </CardContent>
        </Card>
      </div>
      
       <Card>
        <CardHeader>
          <CardTitle>Liste des activités filtrées ({filteredActivities.length})</CardTitle>
          <div className="mt-2">
            <ActiveFiltersDisplay filters={activeFiltersForDisplay} onRemoveFilter={handleRemoveFilter} onClearAll={handleClearAll} />
          </div>
        </CardHeader>
        <CardContent className="max-h-96 overflow-y-auto">
          {filteredActivities.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0">
                        <tr>
                            <th scope="col" className="px-3 py-2">ID</th>
                            <th scope="col" className="px-3 py-2">Titre</th>
                            <th scope="col" className="px-3 py-2">Statut</th>
                            <th scope="col" className="px-3 py-2">Priorité</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredActivities.map(activity => (
                            <tr key={activity.id} className="bg-white border-b hover:bg-slate-50 cursor-pointer" onClick={() => navigate('/activities', { state: { openActivity: activity.id } })}>
                                <th scope="row" className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{activity.activityId}</th>
                                <td className="px-3 py-2">{activity.title}</td>
                                <td className="px-3 py-2"><span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[activity.status]}`}>{activity.status}</span></td>
                                <td className="px-3 py-2"><span className={`px-2 py-1 text-xs font-medium rounded-full ${PRIORITY_COLORS[activity.priority]}`}>{activity.priority}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>Aucune activité ne correspond à vos filtres.</p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default ActivitiesDashboard;