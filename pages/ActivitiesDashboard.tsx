import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useData } from '../contexts/DataContext';
import { ActivityStatus, SecurityDomain } from '../types';
import { ListChecks, CheckCircle, Clock, Pause, ShieldCheck } from 'lucide-react';
import { ISO_MEASURES_DATA } from '../constants';
import DomainDonutChart from '../components/charts/DomainDonutChart';
import StatusDonutChart from '../components/charts/StatusDonutChart';
import ActivityTimeline from '../components/charts/ActivityTimeline';

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
  const { activities, projects } = useData();
  const navigate = useNavigate();

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

  const handleStatClick = (filter: Partial<{statusFilter: ActivityStatus, domainFilter: SecurityDomain}>) => {
    navigate('/activities', { state: filter });
  };
  
  const handleIsoClick = () => {
     const covered = new Set([...activities.flatMap(a => a.isoMeasures), ...projects.flatMap(p => p.isoMeasures || [])]);
     navigate('/iso27002', { state: { filter: 'covered', coveredMeasuresCodes: Array.from(covered) } })
  }


  return (
    <div className="space-y-6">
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
          onClick={() => handleStatClick({ statusFilter: ActivityStatus.COMPLETED })}
        />
        <StatCard 
          title="Activités en cours" 
          value={stats.inProgress} 
          icon={<Clock size={24} />}
          onClick={() => handleStatClick({ statusFilter: ActivityStatus.IN_PROGRESS })}
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
            <DomainDonutChart data={activities} onSliceClick={(domain) => handleStatClick({ domainFilter: domain })} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Répartition par statut</CardTitle></CardHeader>
          <CardContent>
            <StatusDonutChart data={activities} onSliceClick={(status) => handleStatClick({ statusFilter: status })} />
          </CardContent>
        </Card>
      </div>

       <Card>
          <CardHeader><CardTitle>Chronologie des activités</CardTitle></CardHeader>
          <CardContent className="h-96 overflow-auto">
            <ActivityTimeline activities={activities} onActivityClick={(id) => navigate('/activities', { state: { openActivity: id } })} />
          </CardContent>
        </Card>

    </div>
  );
};

export default ActivitiesDashboard;
