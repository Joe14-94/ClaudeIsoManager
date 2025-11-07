
import React, { useMemo, useState } from 'react';
// FIX: The project appears to use react-router-dom v5. The import for 'useNavigate' is for v6. It is replaced with the v6 equivalent 'useNavigate'.
import { useNavigate } from 'react-router-dom';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Tooltip from '../components/ui/Tooltip';
import { Activity, CheckCircle, Target, ShieldCheck, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { ISO_MEASURES_DATA } from '../constants';
import { ActivityStatus, IsoMeasure, Objective, Resource } from '../types';
import { useData } from '../contexts/DataContext';
import DomainDonutChart from '../components/charts/DomainDonutChart';
import ActivityTimeline from '../components/charts/ActivityTimeline';
import Modal from '../components/ui/Modal';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; trend?: string; onClick?: () => void; }> = ({ title, value, icon, trend, onClick }) => (
  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
    <CardContent className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {trend && <p className="text-xs text-slate-400">{trend}</p>}
      </div>
      <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
        {icon}
      </div>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
    const { activities, objectives, resources } = useData();
    // FIX: Switched from useHistory to useNavigate for v6 compatibility.
    const navigate = useNavigate();
    const [isObjectivesModalOpen, setIsObjectivesModalOpen] = useState(false);
    const [timelineZoomLevel, setTimelineZoomLevel] = useState(1);

    const handleTimelineZoomIn = () => setTimelineZoomLevel(prev => Math.min(prev * 1.5, 8));
    const handleTimelineZoomOut = () => setTimelineZoomLevel(prev => Math.max(prev / 1.5, 0.25));
    const handleTimelineZoomReset = () => setTimelineZoomLevel(1);

    const { stats, achievedObjectivesList } = useMemo(() => {
        const totalActivities = activities.length;
        const completedActivities = activities.filter(a => a.status === ActivityStatus.COMPLETED).length;
        const completionRate = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;
        
        const coveredMeasures = new Set(activities.flatMap(a => a.isoMeasures)).size;
        
        const achievedObjectives = objectives.filter(obj => {
            const relatedActivities = activities.filter(a => a.objectives.includes(obj.id));
            if (relatedActivities.length === 0) return false;
            return relatedActivities.every(a => a.status === ActivityStatus.COMPLETED);
        });

        const stats = {
            totalActivities,
            completionRate,
            coveredMeasures,
            totalMeasures: ISO_MEASURES_DATA.length,
            achievedObjectives: achievedObjectives.length,
        };

        return { stats, achievedObjectivesList: achievedObjectives };
    }, [activities, objectives]);
    
    const { totalWorkload, workloadPerResource } = useMemo(() => {
      let total = 0;
      const byResource: { [key: string]: number } = {};
      const resourceMap = new Map(resources.map(r => [r.id, r.name]));

      for (const activity of activities) {
        if (activity.workloadInPersonDays && activity.workloadInPersonDays > 0) {
          total += activity.workloadInPersonDays;
          if (activity.owner) {
            byResource[activity.owner] = (byResource[activity.owner] || 0) + activity.workloadInPersonDays;
          }
        }
      }

      const perResource = Object.entries(byResource)
        .map(([resourceId, workload]) => ({
          resourceId,
          resourceName: resourceMap.get(resourceId) || 'Inconnu',
          workload,
        }))
        .sort((a, b) => b.workload - a.workload);
      
      return { totalWorkload: total, workloadPerResource: perResource };
    }, [activities, resources]);


    const coveredMeasuresCodes = useMemo(() => {
        return Array.from(new Set(activities.flatMap(a => a.isoMeasures)));
    }, [activities]);

    const coverageMatrix = useMemo(() => {
        const matrix: { [key: string]: { count: number; completed: number } } = {};
        ISO_MEASURES_DATA.forEach(measure => {
            const relatedActivities = activities.filter(a => a.isoMeasures.includes(measure.code));
            matrix[measure.code] = {
                count: relatedActivities.length,
                completed: relatedActivities.filter(a => a.status === ActivityStatus.COMPLETED).length,
            };
        });
        return matrix;
    }, [activities]);

    const measuresByChapter = useMemo(() => {
        return ISO_MEASURES_DATA.reduce<Record<string, Omit<IsoMeasure, 'id'>[]>>((acc, measure) => {
            if (!acc[measure.chapter]) {
                acc[measure.chapter] = [];
            }
            acc[measure.chapter].push(measure);
            return acc;
        }, {} as Record<string, Omit<IsoMeasure, 'id'>[]>);
    }, []);

    const getCoverageColor = (measureCode: string): string => {
      const data = coverageMatrix[measureCode];
      if (!data || data.count === 0) {
        return 'bg-slate-200 hover:bg-slate-300'; // Non couvert
      }
      const ratio = data.completed / data.count;
      if (ratio === 1) {
        return 'bg-emerald-400 hover:bg-emerald-500'; // 100%
      }
      if (ratio >= 0.5) {
        return 'bg-yellow-400 hover:bg-yellow-500'; // 50-99%
      }
      return 'bg-red-400 hover:bg-red-500'; // <50%
    };

    return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Tableau de bord</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* FIX: Updated to useNavigate for v6 */}
        <StatCard title="Activités totales" value={stats.totalActivities} icon={<Activity size={24} />} onClick={() => navigate('/activities')} />
        <StatCard title="Taux de complétion" value={`${stats.completionRate}%`} icon={<CheckCircle size={24} />} onClick={() => navigate('/activities', { state: { statusFilter: ActivityStatus.COMPLETED } })} />
        <StatCard title="Mesures ISO couvertes" value={`${stats.coveredMeasures} / ${stats.totalMeasures}`} icon={<ShieldCheck size={24} />} onClick={() => navigate('/iso27002', { state: { filter: 'covered', coveredMeasuresCodes } })} />
        <StatCard title="Objectifs atteints" value={stats.achievedObjectives} icon={<Target size={24} />} onClick={() => setIsObjectivesModalOpen(true)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Matrice de couverture ISO 27002</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Survolez une case pour voir le détail, cliquez pour accéder à la mesure.</p>
          </CardHeader>
          <CardContent>
              {Object.entries(measuresByChapter).map(([chapter, measures]) => (
                  <div key={chapter} className="mb-6">
                      <h4 className="text-md font-semibold text-slate-700 mb-2">{chapter}</h4>
                      <div className="flex flex-wrap gap-1">
                          {/* FIX: Explicitly type `measures` to ensure it is treated as an array. */}
                          {(measures as Omit<IsoMeasure, 'id'>[]).slice().sort((a,b) => {
                              const aParts = a.code.split('.').map(Number);
                              const bParts = b.code.split('.').map(Number);
                              if (aParts[0] !== bParts[0]) {
                                  return aParts[0] - bParts[0];
                              }
                              return aParts[1] - bParts[1];
                          }).map((measure) => (
                            <Tooltip key={measure.code} text={`${measure.code}: ${measure.title} (${coverageMatrix[measure.code]?.completed || 0}/${coverageMatrix[measure.code]?.count || 0})`}>
                              <div 
                                className={`h-10 w-10 flex items-center justify-center rounded text-xs font-mono cursor-pointer transition-colors ${getCoverageColor(measure.code)}`}
                                /* FIX: Updated to useNavigate for v6 */
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
            <CardHeader>
              <CardTitle>Charge de travail par ressource (J/H)</CardTitle>
              <p className="text-2xl font-bold text-slate-900 mt-2">{totalWorkload} <span className="text-base font-medium text-slate-500">Total J/H</span></p>
            </CardHeader>
            <CardContent>
              {workloadPerResource.length > 0 ? (
                <div className="space-y-4">
                  {(() => {
                    const maxWorkload = Math.max(...workloadPerResource.map(r => r.workload), 0);
                    return workloadPerResource.map(item => (
                      <div 
                           key={item.resourceId}
                           onClick={() => navigate('/activities', { state: { resourceFilter: item.resourceId } })}
                           className="group cursor-pointer p-1 -m-1 rounded-md hover:bg-slate-100"
                      >
                        <div className="flex justify-between items-center mb-1 text-sm">
                          <span className="font-medium text-slate-700">{item.resourceName}</span>
                          <span className="font-semibold text-slate-800">{item.workload} J/H</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full group-hover:bg-blue-700 transition-colors"
                            style={{ width: maxWorkload > 0 ? `${(item.workload / maxWorkload) * 100}%` : '0%' }}
                          ></div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">Aucune charge de travail renseignée sur les activités.</p>
              )}
            </CardContent>
          </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
              <CardHeader>
                  <CardTitle>Répartition par domaine</CardTitle>
              </CardHeader>
              <CardContent>
                  {/* FIX: Updated to useNavigate for v6 */}
                  <DomainDonutChart 
                    data={activities} 
                    onSliceClick={(domain) => navigate('/activities', { state: { domainFilter: domain } })}
                  />
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex justify-between items-center">
                  <CardTitle>Timeline des activités</CardTitle>
                  <div className="flex items-center gap-2">
                    <button onClick={handleTimelineZoomOut} title="Dézoomer" className="p-2 rounded-md hover:bg-slate-200 text-slate-600 transition-colors disabled:opacity-50" disabled={timelineZoomLevel <= 0.25}><ZoomOut size={18} /></button>
                    <button onClick={handleTimelineZoomIn} title="Zoomer" className="p-2 rounded-md hover:bg-slate-200 text-slate-600 transition-colors disabled:opacity-50" disabled={timelineZoomLevel >= 8}><ZoomIn size={18} /></button>
                    <button onClick={handleTimelineZoomReset} title="Réinitialiser le zoom" className="p-2 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"><RotateCw size={18} /></button>
                  </div>
              </CardHeader>
              <CardContent className="h-[400px] overflow-auto">
                  {/* FIX: Updated to useNavigate for v6 */}
                  <ActivityTimeline 
                    activities={activities}
                    zoomLevel={timelineZoomLevel}
                    onActivityClick={(activityId) => navigate('/activities', { state: { openActivity: activityId } })}
                  />
              </CardContent>
          </Card>
      </div>
      
      {isObjectivesModalOpen && (
        <Modal 
          isOpen={isObjectivesModalOpen}
          onClose={() => setIsObjectivesModalOpen(false)}
          title={`Objectifs atteints (${achievedObjectivesList.length})`}
        >
          <div className="space-y-4">
            {achievedObjectivesList.length > 0 ? (
              achievedObjectivesList.map(obj => (
                <div key={obj.id} className="p-3 border rounded-lg bg-slate-50">
                  <p className="font-semibold text-slate-800">
                    <span className="font-mono text-blue-600">{obj.code}</span> - {obj.label}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">{obj.description}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500">Aucun objectif n'a été atteint pour le moment.</p>
            )}
          </div>
        </Modal>
      )}

    </div>
  );
};

export default Dashboard;
