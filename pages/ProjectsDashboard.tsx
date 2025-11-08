import React, { useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ClipboardList, ZoomIn, ZoomOut, RotateCw, ShieldCheck } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import ProjectTimeline from '../components/charts/ProjectTimeline';
import { ISO_MEASURES_DATA } from '../constants';
import { ActivityStatus, IsoMeasure } from '../types';
import Tooltip from '../components/ui/Tooltip';


const formatCurrency = (value?: number) => {
    if (value === undefined || value === null || isNaN(value)) return 'N/A';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; onClick?: () => void; }> = ({ title, value, icon, onClick }) => (
  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
    <CardContent className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
      <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
        {icon}
      </div>
    </CardContent>
  </Card>
);

const WorkloadCard: React.FC<{
    title: string;
    requested: number;
    engaged: number;
    consumed: number;
}> = ({ title, requested, engaged, consumed }) => {
    const progress = engaged > 0 ? Math.round((consumed / engaged) * 100) : 0;
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between"><span>Demandée:</span> <span className="font-semibold">{requested} J/H</span></div>
                <div className="flex justify-between"><span>Engagée:</span> <span className="font-semibold">{engaged} J/H</span></div>
                <div className="flex justify-between"><span>Consommée:</span> <span className="font-semibold">{consumed} J/H</span></div>
                <div className="pt-2">
                    <div className="flex justify-between mb-1">
                        <span className="font-medium text-slate-700">Avancement</span>
                        <span className="font-semibold text-slate-800">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div className={`${progress > 100 ? 'bg-red-600' : 'bg-blue-600'} h-2.5 rounded-full`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const BudgetCard: React.FC<{
    validatedPO: number;
    completedPV: number;
    available: number;
    forecastedPO: number;
    forecastedAvailable: number;
}> = ({ validatedPO, completedPV, available, forecastedPO, forecastedAvailable }) => {
    const completionRate = validatedPO > 0 ? Math.round((completedPV / validatedPO) * 100) : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Synthèse Budgétaire (€)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                 <div className="flex justify-between"><span>Demandes d'achat validées:</span> <span className="font-semibold">{formatCurrency(validatedPO)}</span></div>
                 <div className="flex justify-between"><span>Réalisé (PV):</span> <span className="font-semibold">{formatCurrency(completedPV)}</span></div>
                 <div className="flex justify-between text-blue-600"><strong>Disponible:</strong> <strong className="font-semibold">{formatCurrency(available)}</strong></div>
                 <hr/>
                 <div className="flex justify-between"><span>Demandes d'achats prévues:</span> <span className="font-semibold">{formatCurrency(forecastedPO)}</span></div>
                 <div className="flex justify-between text-purple-600"><strong>Disponible prévu:</strong> <strong className="font-semibold">{formatCurrency(forecastedAvailable)}</strong></div>
                 <div className="pt-2">
                    <div className="flex justify-between mb-1">
                        <span className="font-medium text-slate-700">Taux de réalisation</span>
                        <span className="font-semibold text-slate-800">{completionRate}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${completionRate}%` }}></div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const ProjectsDashboard: React.FC = () => {
    const { projects } = useData();
    const navigate = useNavigate();
    const [timelineZoomLevel, setTimelineZoomLevel] = useState(1);
    const timelineContainerRef = useRef<HTMLDivElement>(null);

    const handleTimelineZoomIn = () => setTimelineZoomLevel(prev => Math.min(prev * 1.5, 8));
    const handleTimelineZoomOut = () => setTimelineZoomLevel(prev => Math.max(prev / 1.5, 0.25));
    const handleTimelineZoomReset = () => setTimelineZoomLevel(1);
    
    const projectStats = useMemo(() => {
        return projects.reduce((acc, project) => {
            acc.totalProjects += 1;
            acc.internalWorkload.requested += project.internalWorkloadRequested || 0;
            acc.internalWorkload.engaged += project.internalWorkloadEngaged || 0;
            acc.internalWorkload.consumed += project.internalWorkloadConsumed || 0;
            acc.externalWorkload.requested += project.externalWorkloadRequested || 0;
            acc.externalWorkload.engaged += project.externalWorkloadEngaged || 0;
            acc.externalWorkload.consumed += project.externalWorkloadConsumed || 0;

            const budgetApproved = project.budgetApproved || 0;
            const budgetCommitted = project.budgetCommitted || 0;

            acc.budget.validatedPO += project.validatedPurchaseOrders || 0;
            acc.budget.completedPV += project.completedPV || 0;
            acc.budget.available += (budgetApproved - budgetCommitted);
            acc.budget.forecastedPO += project.forecastedPurchaseOrders || 0;
            acc.budget.forecastedAvailable += (budgetApproved - (budgetCommitted + (project.forecastedPurchaseOrders || 0)));

            return acc;
        }, {
            totalProjects: 0,
            internalWorkload: { requested: 0, engaged: 0, consumed: 0 },
            externalWorkload: { requested: 0, engaged: 0, consumed: 0 },
            budget: { validatedPO: 0, completedPV: 0, available: 0, forecastedPO: 0, forecastedAvailable: 0 },
        });
    }, [projects]);
    
     const { coveredMeasures, totalMeasures } = useMemo(() => ({
        coveredMeasures: new Set(projects.flatMap(p => p.isoMeasures || [])).size,
        totalMeasures: ISO_MEASURES_DATA.length,
    }), [projects]);

    const coverageMatrix = useMemo(() => {
        const matrix: { [key: string]: { count: number; completed: number } } = {};
        ISO_MEASURES_DATA.forEach(measure => {
            const relatedProjects = projects.filter(p => (p.isoMeasures || []).includes(measure.code));
            matrix[measure.code] = {
                count: relatedProjects.length,
                completed: relatedProjects.filter(p => p.status === ActivityStatus.COMPLETED).length,
            };
        });
        return matrix;
    }, [projects]);

    const measuresByChapter = useMemo(() => {
        return ISO_MEASURES_DATA.reduce<Record<string, Omit<IsoMeasure, 'id'>[]>>((acc, measure) => {
            if (!acc[measure.chapter]) acc[measure.chapter] = [];
            acc[measure.chapter].push(measure);
            return acc;
        }, {} as Record<string, Omit<IsoMeasure, 'id'>[]>);
    }, []);

    const getCoverageColor = (measureCode: string): string => {
      const data = coverageMatrix[measureCode];
      if (!data || data.count === 0) return 'bg-slate-200 hover:bg-slate-300';
      const ratio = data.completed / data.count;
      if (ratio === 1) return 'bg-emerald-400 hover:bg-emerald-500';
      if (ratio >= 0.5) return 'bg-yellow-400 hover:bg-yellow-500';
      return 'bg-red-400 hover:bg-red-500';
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Tableau de bord Projets</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard title="Nombre de projets" value={projectStats.totalProjects} icon={<ClipboardList size={24} />} onClick={() => navigate('/projets')} />
                 <StatCard title="Mesures ISO couvertes" value={`${coveredMeasures} / ${totalMeasures}`} icon={<ShieldCheck size={24} />} onClick={() => navigate('/iso27002', { state: { filter: 'covered', coveredMeasuresCodes: Array.from(new Set(projects.flatMap(p => p.isoMeasures || []))) } })} />
                 <WorkloadCard 
                    title="Charges internes (J/H)"
                    requested={projectStats.internalWorkload.requested}
                    engaged={projectStats.internalWorkload.engaged}
                    consumed={projectStats.internalWorkload.consumed}
                 />
                 <WorkloadCard 
                    title="Charges externes (J/H)"
                    requested={projectStats.externalWorkload.requested}
                    engaged={projectStats.externalWorkload.engaged}
                    consumed={projectStats.externalWorkload.consumed}
                 />
                 <div className="md:col-span-2 lg:col-span-4">
                    <BudgetCard 
                        validatedPO={projectStats.budget.validatedPO}
                        completedPV={projectStats.budget.completedPV}
                        available={projectStats.budget.available}
                        forecastedPO={projectStats.budget.forecastedPO}
                        forecastedAvailable={projectStats.budget.forecastedAvailable}
                    />
                 </div>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Matrice de couverture ISO 27002 (Projets)</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">Survolez une case pour voir le détail des projets liés.</p>
                </CardHeader>
                <CardContent>
                    {Object.entries(measuresByChapter).map(([chapter, measures]) => (
                        <div key={chapter} className="mb-6">
                            <h4 className="text-md font-semibold text-slate-700 mb-2">{chapter}</h4>
                            <div className="flex flex-wrap gap-1">
                                {measures.slice().sort((a,b) => a.code.localeCompare(b.code, undefined, { numeric: true })).map((measure) => (
                                    <Tooltip key={measure.code} text={`${measure.code}: ${measure.title} (${coverageMatrix[measure.code]?.completed || 0}/${coverageMatrix[measure.code]?.count || 0} terminés)`}>
                                        <div 
                                            className={`h-10 w-10 flex items-center justify-center rounded text-xs font-mono cursor-pointer transition-colors ${getCoverageColor(measure.code)}`}
                                            onClick={() => navigate('/iso27002', { state: { openMeasure: measure.code } })}
                                        >
                                            {measure.code}
                                        </div>
                                    </Tooltip>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center"><span className="w-4 h-4 rounded bg-slate-200 mr-2"></span>Non couvert</div>
                        <div className="flex items-center"><span className="w-4 h-4 rounded bg-red-400 mr-2"></span> &lt;50% terminé</div>
                        <div className="flex items-center"><span className="w-4 h-4 rounded bg-yellow-400 mr-2"></span> &gt;50% terminé</div>
                        <div className="flex items-center"><span className="w-4 h-4 rounded bg-emerald-400 mr-2"></span> 100% terminé</div>
                    </div>
                </CardContent>
            </Card>

             <Card>
              <CardHeader className="flex justify-between items-center">
                  <CardTitle>Timeline des projets</CardTitle>
                  <div className="flex items-center gap-2">
                    <button onClick={handleTimelineZoomOut} title="Dézoomer" className="p-2 rounded-md hover:bg-slate-200 text-slate-600 transition-colors disabled:opacity-50" disabled={timelineZoomLevel <= 0.25}><ZoomOut size={18} /></button>
                    <button onClick={handleTimelineZoomIn} title="Zoomer" className="p-2 rounded-md hover:bg-slate-200 text-slate-600 transition-colors disabled:opacity-50" disabled={timelineZoomLevel >= 8}><ZoomIn size={18} /></button>
                    <button onClick={handleTimelineZoomReset} title="Réinitialiser le zoom" className="p-2 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"><RotateCw size={18} /></button>
                  </div>
              </CardHeader>
              <CardContent ref={timelineContainerRef} className="h-[400px] overflow-auto">
                  <ProjectTimeline 
                    projects={projects}
                    zoomLevel={timelineZoomLevel}
                    onProjectClick={(projectId) => navigate('/projets', { state: { openProject: projectId } })}
                    scrollContainerRef={timelineContainerRef}
                  />
              </CardContent>
          </Card>
        </div>
    );
};

export default ProjectsDashboard;