import React, { useState, useMemo } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Tooltip from '../components/ui/Tooltip';
import { Activity, BarChart, FileText, CheckCircle, Target, ShieldCheck } from 'lucide-react';
import { ISO_MEASURES_DATA } from '../constants';
import { IsoChapter, ActivityStatus, IsoMeasure } from '../types';
import { useData } from '../contexts/DataContext';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; trend?: string; }> = ({ title, value, icon, trend }) => (
  <Card>
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

    const stats = useMemo(() => {
        const totalActivities = activities.length;
        const completedActivities = activities.filter(a => a.status === ActivityStatus.COMPLETED).length;
        const completionRate = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;
        
        const coveredMeasures = new Set(activities.flatMap(a => a.isoMeasures)).size;
        
        const achievedObjectives = objectives.filter(obj => {
            const relatedActivities = activities.filter(a => a.objectives.includes(obj.id));
            if (relatedActivities.length === 0) return false;
            return relatedActivities.every(a => a.status === ActivityStatus.COMPLETED);
        }).length;

        return {
            totalActivities,
            completionRate,
            coveredMeasures,
            totalMeasures: ISO_MEASURES_DATA.length,
            achievedObjectives,
        };
    }, [activities, objectives]);

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
        // Fix: Explicitly type the accumulator with the generic on `reduce` to ensure correct type inference.
        return ISO_MEASURES_DATA.reduce<Record<string, Omit<IsoMeasure, 'id'>[]>>((acc, measure) => {
            if (!acc[measure.chapter]) {
                acc[measure.chapter] = [];
            }
            acc[measure.chapter].push(measure);
            return acc;
        }, {});
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
        <StatCard title="Activités totales" value={stats.totalActivities} icon={<Activity size={24} />} />
        <StatCard title="Taux de complétion" value={`${stats.completionRate}%`} icon={<CheckCircle size={24} />} />
        <StatCard title="Mesures ISO couvertes" value={`${stats.coveredMeasures} / ${stats.totalMeasures}`} icon={<ShieldCheck size={24} />} />
        <StatCard title="Objectifs atteints" value={stats.achievedObjectives} icon={<Target size={24} />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Matrice de couverture ISO 27002</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Survolez une case pour voir le détail de la mesure.</p>
        </CardHeader>
        <CardContent>
            {Object.entries(measuresByChapter).map(([chapter, measures]) => (
                <div key={chapter} className="mb-6">
                    <h4 className="text-md font-semibold text-slate-700 mb-2">{chapter}</h4>
                    <div className="flex flex-wrap gap-1">
                        {measures.slice().sort((a,b) => {
                            const aParts = a.code.split('.').map(Number);
                            const bParts = b.code.split('.').map(Number);
                            if (aParts[0] !== bParts[0]) {
                                return aParts[0] - bParts[0];
                            }
                            return aParts[1] - bParts[1];
                        }).map((measure) => (
                          <Tooltip key={measure.code} text={`${measure.code}: ${measure.title} (${coverageMatrix[measure.code]?.completed || 0}/${coverageMatrix[measure.code]?.count || 0})`}>
                            <div className={`h-10 w-10 flex items-center justify-center rounded text-xs font-mono cursor-pointer transition-colors ${getCoverageColor(measure.code)}`}>
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
              <CardContent className="h-64 flex items-center justify-center text-slate-400">
                  <BarChart size={48} />
                  <p className="ml-4">Graphique Sunburst à venir...</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader>
                  <CardTitle>Timeline des activités</CardTitle>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center text-slate-400">
                  <FileText size={48} />
                   <p className="ml-4">Graphique Gantt à venir...</p>
              </CardContent>
          </Card>
      </div>

    </div>
  );
};

export default Dashboard;
