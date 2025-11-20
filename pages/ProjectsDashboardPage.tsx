
import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useData } from '../contexts/DataContext';
import { ProjectStatus, Project } from '../types';
import { ClipboardList, Star, TrendingUp, Euro, Info, CheckCircle, Clock } from 'lucide-react';
import ProjectStatusDonutChart from '../components/charts/ProjectStatusDonutChart';
import ProjectTimeline from '../components/charts/ProjectTimeline';
import ActiveFiltersDisplay from '../components/ui/ActiveFiltersDisplay';
import { PROJECT_STATUS_COLORS } from '../constants';
import Tooltip from '../components/ui/Tooltip';


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
  const { projects, lastCsvImportDate, lastImportWeek, lastImportYear } = useData();
  const navigate = useNavigate();
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  
  const [filters, setFilters] = useState<Partial<{ status: ProjectStatus }>>({});

  const validProjects = useMemo(() => {
    const uoPattern = /^([a-zA-Z]+|\d+)\.\d+\.\d+\.\d+$/;
    // Exclure TOTAL_GENERAL des listes et calculs statistiques basés sur la liste des projets
    return projects.filter(p => !uoPattern.test(p.projectId) && p.projectId !== 'TOTAL_GENERAL');
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (Object.keys(filters).length === 0) {
      return validProjects;
    }
    return validProjects.filter(project => {
      const statusMatch = !filters.status || project.status === filters.status;
      return statusMatch;
    });
  }, [validProjects, filters]);


  const stats = useMemo(() => {
    const total = validProjects.length;
    const top30 = validProjects.filter(p => p.isTop30).length;
    
    const completed = validProjects.filter(p => p.status === ProjectStatus.NF).length;
    const inProgress = validProjects.filter(p => p.status === ProjectStatus.NO).length;
    
    const totalConsumed = validProjects.reduce((sum, p) => sum + (p.internalWorkloadConsumed || 0) + (p.externalWorkloadConsumed || 0), 0);
    const totalEngaged = validProjects.reduce((sum, p) => sum + (p.internalWorkloadEngaged || 0) + (p.externalWorkloadEngaged || 0), 0);
    const overallProgress = totalEngaged > 0 ? Math.round((totalConsumed / totalEngaged) * 100) : 0;
    
    const totalBudgetApproved = validProjects.reduce((sum, p) => sum + (p.budgetApproved || 0), 0);

    return {
      total,
      top30,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      inProgress,
      overallProgress,
      totalBudgetApproved
    };
  }, [validProjects]);
  
  const handleSliceClick = (status: ProjectStatus) => {
    setFilters({ status });
  };
  
  const handleRemoveFilter = (key: string) => {
    if (key === 'Statut') setFilters(prev => ({...prev, status: undefined}));
  };

  const handleClearAll = () => setFilters({});
  
  const activeFiltersForDisplay = useMemo(() => {
    const displayFilters: { [key: string]: string } = {};
    if (filters.status) displayFilters['Statut'] = filters.status;
    return displayFilters;
  }, [filters]);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-3xl font-bold text-slate-800">Tableau de bord des projets</h1>
        {lastCsvImportDate && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                <Info size={14} />
                {lastImportWeek && lastImportYear ? (
                    <span>Données FDR S{lastImportWeek}-{lastImportYear} (importé le {new Date(lastCsvImportDate).toLocaleString('fr-FR')})</span>
                ) : (
                    <span>Données FDR mises à jour le {new Date(lastCsvImportDate).toLocaleString('fr-FR')}</span>
                )}
            </div>
        )}
      </div>
      
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
          icon={<Euro size={24} />}
          onClick={() => navigate('/projects-budget')}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader><CardTitle>Répartition par statut</CardTitle></CardHeader>
          <CardContent>
            <ProjectStatusDonutChart data={validProjects} onSliceClick={handleSliceClick} />
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Liste des projets filtrés ({filteredProjects.length})</CardTitle>
           <div className="mt-2">
            <ActiveFiltersDisplay filters={activeFiltersForDisplay} onRemoveFilter={handleRemoveFilter} onClearAll={handleClearAll} />
          </div>
        </CardHeader>
        <CardContent className="max-h-96 overflow-y-auto">
           {filteredProjects.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0">
                        <tr>
                            <th scope="col" className="px-4 py-3">ID</th>
                            <th scope="col" className="px-4 py-3">Titre</th>
                            <th scope="col" className="px-4 py-3">Statut</th>
                            <th scope="col" className="px-4 py-3">Top 30</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.map(project => (
                            <tr key={project.id} className="bg-white border-b hover:bg-slate-50 cursor-pointer" onClick={() => navigate('/projets', { state: { openProject: project.id } })}>
                                <th scope="row" className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{project.projectId}</th>
                                <td className="px-4 py-3">{project.title}</td>
                                <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-medium rounded-full ${PROJECT_STATUS_COLORS[project.status]}`}>{project.status}</span></td>
                                <td className="px-4 py-3">{project.isTop30 ? 'Oui' : 'Non'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>Aucun projet ne correspond à vos filtres.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsDashboardPage;
