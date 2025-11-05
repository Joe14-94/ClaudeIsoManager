
import React, { useMemo, useState } from 'react';
// FIX: The project appears to use react-router-dom v5. The import for 'useNavigate' is for v6. It is replaced with the v6 equivalent 'useNavigate'.
import { useNavigate } from 'react-router-dom';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Tooltip from '../components/ui/Tooltip';
import { Activity, CheckCircle, Target, ShieldCheck } from 'lucide-react';
import { ISO_MEASURES_DATA } from '../constants';
import { ActivityStatus, IsoMeasure, Objective } from '../types';
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
    const { activities, objectives } = useData();
    // FIX: Switched from useHistory to useNavigate for v6 compatibility.
    const navigate = useNavigate();
    const [isObjectivesModalOpen, setIsObjectivesModalOpen] = useState(false);

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
              <CardHeader>
                  <CardTitle>Timeline des activités</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px] overflow-hidden">
                  {/* FIX: Updated to useNavigate for v6 */}
                  <ActivityTimeline 
                    activities={activities} 
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
