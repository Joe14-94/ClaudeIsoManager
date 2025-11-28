
import React, { useMemo } from 'react';
import { ProjectWeather } from '../../../types';
import { useData } from '../../../contexts/DataContext';
import { CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Sun, Cloud, CloudRain, CloudLightning } from 'lucide-react';

const ProjectWeatherWidget: React.FC = () => {
  const { projects } = useData();

  const weatherCounts = useMemo(() => {
    const counts = {
      [ProjectWeather.SUNNY]: 0,
      [ProjectWeather.CLOUDY]: 0,
      [ProjectWeather.RAINY]: 0,
      [ProjectWeather.STORM]: 0,
    };

    let totalWithWeather = 0;
    projects.forEach(p => {
      if (p.projectId !== 'TOTAL_GENERAL' && p.weather) {
        counts[p.weather] = (counts[p.weather] || 0) + 1;
        totalWithWeather++;
      }
    });
    return { counts, total: totalWithWeather };
  }, [projects]);

  const weatherConfig = [
    { type: ProjectWeather.SUNNY, label: 'Soleil', icon: Sun, colorClass: 'text-amber-500', bgClass: 'bg-amber-50', borderClass: 'border-amber-100' },
    { type: ProjectWeather.CLOUDY, label: 'Nuageux', icon: Cloud, colorClass: 'text-slate-500', bgClass: 'bg-slate-50', borderClass: 'border-slate-200' },
    { type: ProjectWeather.RAINY, label: 'Pluie', icon: CloudRain, colorClass: 'text-blue-500', bgClass: 'bg-blue-50', borderClass: 'border-blue-100' },
    { type: ProjectWeather.STORM, label: 'Orage', icon: CloudLightning, colorClass: 'text-purple-600', bgClass: 'bg-purple-50', borderClass: 'border-purple-100' },
  ];

  return (
    <div className="h-full w-full flex flex-col">
        <CardHeader className="non-draggable pb-2">
            <div className="flex justify-between items-center">
                <CardTitle>Météo des projets</CardTitle>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{weatherCounts.total} projets suivis</span>
            </div>
        </CardHeader>
        <CardContent className="flex-grow p-4">
            {weatherCounts.total === 0 ? (
                 <div className="flex items-center justify-center h-full text-slate-400 text-sm italic">Aucune donnée météo disponible</div>
            ) : (
                <div className="grid grid-cols-2 gap-3 h-full">
                    {weatherConfig.map((config) => {
                        const count = weatherCounts.counts[config.type];
                        const Icon = config.icon;
                        return (
                            <div key={config.type} className={`flex flex-col justify-center items-center p-3 rounded-xl border ${config.bgClass} ${config.borderClass} transition-all hover:shadow-sm`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon className={config.colorClass} size={24} />
                                    <span className={`text-2xl font-bold ${config.colorClass}`}>{count}</span>
                                </div>
                                <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">{config.label}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </CardContent>
    </div>
  );
};
export default ProjectWeatherWidget;
