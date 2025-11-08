import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, ClipboardList } from 'lucide-react';
import { useData } from '../../../contexts/DataContext';
import { ISO_MEASURES_DATA } from '../../../constants';

interface StatCardWidgetProps {
  type: 'totalActivities' | 'totalProjects' | 'coveredMeasures';
  isEditMode?: boolean;
  width?: number;
  height?: number;
}

const StatCardWidget: React.FC<StatCardWidgetProps> = ({ type, isEditMode, width = 0, height = 0 }) => {
  const { activities, projects } = useData();
  const navigate = useNavigate();

  const stat = useMemo(() => {
    switch (type) {
      case 'totalActivities':
        return {
          title: 'Activités totales',
          value: activities.length,
          icon: <Activity />,
          onClick: () => navigate('/activities'),
        };
      case 'totalProjects':
        return {
          title: 'Projets totaux',
          value: projects.length,
          icon: <ClipboardList />,
          onClick: () => navigate('/projets'),
        };
      case 'coveredMeasures':
        const covered = new Set([...activities.flatMap(a => a.isoMeasures), ...projects.flatMap(p => p.isoMeasures || [])]);
        return {
          title: 'Mesures ISO couvertes',
          value: `${covered.size} / ${ISO_MEASURES_DATA.length}`,
          icon: <ShieldCheck />,
          onClick: () => navigate('/iso27002', { state: { filter: 'covered', coveredMeasuresCodes: Array.from(covered) } }),
        };
      default:
        return null;
    }
  }, [type, activities, projects, navigate]);

  if (!stat) return null;

  const isVertical = height > width * 1.2 && width > 0;
  const iconSize = Math.max(20, Math.min(width / 6, height / 4, 32));

  return (
    <div 
        className={`h-full w-full p-4 flex items-center justify-center ${!isEditMode ? 'cursor-pointer' : 'cursor-default'}`}
        onClick={!isEditMode ? stat.onClick : undefined}
    >
        <div className={`flex w-full h-full ${isVertical ? 'flex-col items-center justify-center text-center gap-2' : 'flex-row items-center justify-between gap-4'}`}>
            <div className={`flex flex-col gap-0 ${isVertical ? 'order-2 items-center' : 'items-start'}`}>
                <p className="text-sm font-medium text-slate-500 non-draggable">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-900 non-draggable leading-tight">{stat.value}</p>
            </div>
            <div className={`p-3 bg-slate-100 rounded-lg text-slate-600 non-draggable flex items-center justify-center ${isVertical ? 'order-1' : ''}`}>
                {React.cloneElement(stat.icon as React.ReactElement<{ size: number }>, { size: iconSize })}
            </div>
        </div>
    </div>
  );
};

export default StatCardWidget;
