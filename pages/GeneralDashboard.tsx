import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Tooltip from '../components/ui/Tooltip';
import { Activity, ShieldCheck, ClipboardList } from 'lucide-react';
import { ISO_MEASURES_DATA } from '../constants';
import { ActivityStatus, IsoMeasure } from '../types';
import { useData } from '../contexts/DataContext';

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

const GeneralDashboard: React.FC = () => {
    const { activities, projects } = useData();
    const navigate = useNavigate();

    const stats = useMemo(() => {
        const totalActivities = activities.length;
        const totalProjects = projects.length;
        const coveredMeasures = new Set(activities.flatMap(a => a.isoMeasures)).size;
        
        return {
            totalActivities,
            totalProjects,
            coveredMeasures,
            totalMeasures: ISO_MEASURES_DATA.length,
        };
    }, [activities, projects]);
    
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
      <h1 className="text-3xl font-bold text-slate-800">Tableau de bord général</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Activités totales" value={stats.totalActivities} icon={<Activity size={24} />} onClick={() => navigate('/activities')} />
        <StatCard title="Nombre de projets" value={stats.totalProjects} icon={<ClipboardList size={24} />} onClick={() => navigate('/projets')} />
        <StatCard title="Mesures ISO couvertes" value={`${stats.coveredMeasures} / ${stats.totalMeasures}`} icon={<ShieldCheck size={24} />} onClick={() => navigate('/iso27002', { state: { filter: 'covered', coveredMeasuresCodes } })} />
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
    </div>
  );
};

export default GeneralDashboard;