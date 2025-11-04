import React, { useMemo } from 'react';
import { Activity } from '../../types';
import { STATUS_HEX_COLORS } from '../../constants';
import * as d3 from 'd3';

interface ActivityTimelineProps {
  activities: Activity[];
  onActivityClick?: (activityId: string) => void;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities, onActivityClick }) => {
  const { timedActivities, minDate, maxDate, months } = useMemo(() => {
    const filtered = activities
      .filter(a => a.startDate && a.endDatePlanned)
      .map(a => ({
        ...a,
        startDate: new Date(a.startDate!),
        endDatePlanned: new Date(a.endDatePlanned!),
      }))
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    if (filtered.length === 0) {
      return { timedActivities: [], minDate: null, maxDate: null, months: [] };
    }

    let minDate = d3.min(filtered, d => d.startDate) as Date;
    let maxDate = d3.max(filtered, d => d.endDatePlanned) as Date;

    if (!minDate || !maxDate) return { timedActivities: [], minDate: null, maxDate: null, months: [] };
    
    // Extend range by a month on each side for padding
    minDate = d3.timeMonth.floor(minDate);
    maxDate = d3.timeMonth.ceil(maxDate);

    const timeScale = d3.scaleTime().domain([minDate, maxDate]);
    const months = timeScale.ticks(d3.timeMonth.every(1));
    
    return { timedActivities: filtered, minDate, maxDate, months };
  }, [activities]);

  if (timedActivities.length === 0) {
    return <div className="flex items-center justify-center h-full text-slate-500">Aucune activité avec des dates planifiées à afficher.</div>;
  }

  const totalDuration = maxDate!.getTime() - minDate!.getTime();

  return (
    <div className="relative w-full h-full overflow-x-auto overflow-y-hidden">
      <div className="relative" style={{ width: `${months.length * 120}px`, minWidth: '100%' }}>
        {/* Header with months */}
        <div className="sticky top-0 bg-white z-10 flex border-b border-slate-200">
          {months.map((month, i) => (
            <div key={i} className="flex-shrink-0 text-center py-2 border-r border-slate-200" style={{ width: '120px' }}>
              <p className="text-sm font-semibold text-slate-600">
                {month.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>

        {/* Activities grid */}
        <div className="relative pt-2">
            {timedActivities.map((activity, index) => {
                const left = ((activity.startDate.getTime() - minDate!.getTime()) / totalDuration) * 100;
                const width = ((activity.endDatePlanned.getTime() - activity.startDate.getTime()) / totalDuration) * 100;
                
                const tooltipText = `
                    ${activity.title} (${activity.status})
                    Début: ${activity.startDate.toLocaleDateString('fr-FR')}
                    Fin: ${activity.endDatePlanned.toLocaleDateString('fr-FR')}
                `;

                return (
                    <div
                        key={activity.id}
                        className="absolute h-8 mb-1 flex items-center group cursor-pointer"
                        style={{
                            top: `${index * 2.5}rem`,
                            left: `${left}%`,
                            width: `${width}%`,
                        }}
                        onClick={() => onActivityClick && onActivityClick(activity.id)}
                    >
                        <div 
                            className="w-full h-full rounded-md px-2 overflow-hidden whitespace-nowrap text-sm flex items-center"
                            style={{ backgroundColor: STATUS_HEX_COLORS[activity.status] }}
                        >
                            <p className="truncate text-slate-800">{activity.title}</p>
                        </div>
                        <div className="absolute bottom-full mb-2 w-max max-w-xs p-2 text-xs text-white bg-slate-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 whitespace-pre-wrap">
                            {tooltipText.trim()}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default ActivityTimeline;
