
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../../contexts/DataContext';
import { CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { ProjectStatus } from '../../../types';
import { TrendingUp, AlertCircle } from 'lucide-react';
import Tooltip from '../../ui/Tooltip';

const TopPriorityProjectsWidget: React.FC = () => {
  const { projects } = useData();
  const navigate = useNavigate();

  const topProjects = useMemo(() => {
    return projects
        .filter(p => p.projectId !== 'TOTAL_GENERAL' && p.status !== ProjectStatus.NF && p.status !== ProjectStatus.NT && p.priorityScore !== undefined)
        .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0))
        .slice(0, 5);
  }, [projects]);

  return (
    <div className="h-full w-full flex flex-col">
        <CardHeader className="non-draggable">
            <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={18} className="text-red-600" />
                    Top 5 Priorités
                </CardTitle>
                <Tooltip text="Projets en cours ou identifiés avec le score de priorité le plus élevé.">
                    <AlertCircle size={16} className="text-slate-400 cursor-help" />
                </Tooltip>
            </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto p-0">
            {topProjects.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500 text-sm p-4">
                    Aucun projet actif avec un score.
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {topProjects.map(project => (
                        <div 
                            key={project.id} 
                            className="p-3 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between gap-3"
                            onClick={() => navigate('/projets', { state: { openProject: project.id } })}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="font-medium text-sm text-slate-800 truncate">{project.title}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span className="font-mono bg-slate-100 px-1 rounded">{project.projectId}</span>
                                    <span>•</span>
                                    <span className="truncate">{project.status}</span>
                                </div>
                            </div>
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs border-2 
                                ${project.priorityScore! >= 15 ? 'bg-red-50 text-red-700 border-red-200' : 
                                  project.priorityScore! >= 8 ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                                  'bg-blue-50 text-blue-700 border-blue-200'}`}
                            >
                                {project.priorityScore?.toFixed(1)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </CardContent>
    </div>
  );
};

export default TopPriorityProjectsWidget;
