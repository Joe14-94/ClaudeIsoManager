import React, { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useData } from '../contexts/DataContext';
import { ActivityStatus } from '../types';
import { ClipboardList, Star, TrendingUp, DollarSign } from 'lucide-react';
import ProjectStatusDonutChart from '../components/charts/ProjectStatusDonutChart';
import ProjectTimeline from '../components/charts/ProjectTimeline';

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

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(value);
};

const ProjectsDashboardPage: React.FC = () => {
  const { projects } = useData();
  const navigate = useNavigate();
  const timelineContainerRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    const total = projects.length;
    const top30 = projects.filter(p => p.isTop30).length;
    
    const totalConsumed = projects.reduce((sum, p) => sum + (p.internalWorkloadConsumed || 0) + (p.externalWorkloadConsumed || 0), 0);
    const totalEngaged = projects.reduce((sum, p) => sum + (p.internalWorkloadEngaged || 0) + (p.externalWorkloadEngaged || 0), 0);
    const overallProgress = totalEngaged > 0 ? Math.round((totalConsumed / totalEngaged) * 100) : 0;
    
    const totalBudgetApproved = projects.reduce((sum, p) => sum + (p.budgetApproved || 0), 0);

    return {
      total,
      top30,
      overallProgress,
      totalBudgetApproved
    };
  }, [projects]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Tableau de bord des projets</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Projets totaux" 
          value={stats.total} 
          icon={<ClipboardList size={24} />} 
          onClick={() => navigate('/projets')} 
        />
        <StatCard 
          title="Projets Top 30" 
          value={stats.top30} 
          icon={<Star size={24} />}
          onClick={() => navigate('/projets', { state: { top30Filter: 'true' }})}
        />
        <StatCard 
          title="Avancement global" 
          value={`${stats.overallProgress}%`} 
          icon={<TrendingUp size={24} />}
          onClick={() => navigate('/projects-workload')}
        />
        <StatCard 
          title="Budget total accordé" 
          value={formatCurrency(stats.totalBudgetApproved)} 
          icon={<DollarSign size={24} />}
          onClick={() => navigate('/projects-budget')}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader><CardTitle>Répartition par statut</CardTitle></CardHeader>
          <CardContent>
            <ProjectStatusDonutChart data={projects} onSliceClick={(status) => navigate('/projets', { state: { statusFilter: status }})} />
          </CardContent>
        </Card>
      </div>

       <Card>
          <CardHeader><CardTitle>Chronologie des projets</CardTitle></CardHeader>
          <CardContent ref={timelineContainerRef} className="h-96 overflow-auto">
            <ProjectTimeline 
                projects={projects} 
                onProjectClick={(id) => navigate('/projets', { state: { openProject: id } })} 
                scrollContainerRef={timelineContainerRef}
            />
          </CardContent>
        </Card>

    </div>
  );
};

export default ProjectsDashboardPage;
