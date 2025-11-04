import React, { useMemo } from 'react';
import { Activity } from '../../types';
import { STATUS_HEX_COLORS } from '../../constants';
import * as d3 from 'd3';

interface ActivityTimelineProps {
  activities: Activity[];
  zoomLevel?: number;
  onActivityClick?: (activityId: string) => void;
}

const BASE_MONTH_WIDTH = 120; // px

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities, zoomLevel = 1, onActivityClick }) => {
  
  const monthWidth = useMemo(() => BASE_MONTH_WIDTH * zoomLevel, [zoomLevel]);

  const { timedActivities, months } = useMemo(() => {
    const filtered = activities
      .filter(a => a.startDate && a.endDatePlanned)
      .map(a => ({
        ...a,
        startDate: new Date(a.startDate!),
        endDatePlanned: new Date(a.endDatePlanned!),
      }))
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    if (filtered.length === 0) {
      return { timedActivities: [], months: [] };
    }

    let minDate = d3.min(filtered, d => d.startDate) as Date;
    let maxDate = d3.max(filtered, d => d.endDatePlanned) as Date;

    if (!minDate || !maxDate) return { timedActivities: [], months: [] };
    
    // Extend range by a bit of padding on each side
    minDate = d3.timeMonth.offset(d3.timeMonth.floor(minDate), -1);
    maxDate = d3.timeMonth.offset(d3.timeMonth.ceil(maxDate), 1);
    
    // If the range is very short, extend it to at least a year for better visualization
    if (d3.timeMonth.count(minDate, maxDate) < 12) {
      maxDate = d3.timeMonth.offset(minDate, 12);
    }

    const timeScale = d3.scaleTime().domain([minDate, maxDate]);
    const months = timeScale.ticks(d3.timeMonth.every(1));
    
    return { timedActivities: filtered, months };
  }, [activities]);

  const getPositionForDate = (date: Date, isEndDate: boolean = false): number => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();

      const monthIndex = months.findIndex(m => m.getFullYear() === year && m.getMonth() === month);
      
      if (monthIndex === -1) {
          if (date < months[0]) return 0;
          if (date > d3.timeMonth.offset(months[months.length-1], 1)) return months.length * monthWidth;
          // Fallback for edge cases, though it should ideally not be reached with the current date range logic
          return 0;
      }

      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      // For start date, day 1 is 0% into the month. For end date, day 31 (of 31) is 100% through the month.
      const dayFraction = isEndDate ? day / daysInMonth : (day - 1) / daysInMonth;

      return (monthIndex * monthWidth) + (dayFraction * monthWidth);
  };

  if (timedActivities.length === 0) {
    return <div className="flex items-center justify-center h-full text-slate-500">Aucune activité avec des dates planifiées à afficher pour les filtres sélectionnés.</div>;
  }
  
  return (
    <div className="relative w-full h-full">
      <div className="relative" style={{ width: `${months.length * monthWidth}px`, minWidth: '100%' }}>
        {/* Header with months */}
        <div className="sticky top-0 bg-white z-10 flex border-b border-slate-200">
          {months.map((month, i) => {
            const monthFormat: 'long' | 'short' = monthWidth < 80 ? 'short' : 'long';
            const monthName = month.toLocaleString('fr-FR', { month: monthFormat });
            const year = month.getFullYear();

            return (
              <div key={i} className="flex-shrink-0 text-center py-1 border-r border-slate-200 flex flex-col justify-center" style={{ width: `${monthWidth}px` }}>
                <p className="text-sm font-semibold text-slate-600 capitalize truncate" title={month.toLocaleString('fr-FR', { month: 'long' })}>
                  {monthName}
                </p>
                <p className="text-xs text-slate-500">{year}</p>
              </div>
            );
          })}
        </div>
        
        {/* Vertical grid lines */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
           {months.map((_, i) => (
              <div key={i} className="absolute top-0 h-full border-r border-slate-200/70" style={{ left: `${(i + 1) * monthWidth}px` }}></div>
           ))}
        </div>

        {/* Activities grid */}
        <div className="relative pt-2" style={{ height: `${timedActivities.length * 2.5 + 2}rem` }}>
            {timedActivities.map((activity, index) => {
                const left = getPositionForDate(activity.startDate, false);
                const right = getPositionForDate(activity.endDatePlanned, true);
                const width = Math.max(right - left, 2); // Minimum width of 2px
                
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
                            left: `${left}px`,
                            width: `${width}px`,
                        }}
                        onClick={() => onActivityClick && onActivityClick(activity.id)}
                    >
                        <div 
                            className="w-full h-full rounded-md px-2 overflow-hidden whitespace-nowrap text-sm flex items-center transition-all duration-200 group-hover:ring-2 group-hover:ring-blue-500 group-hover:z-10"
                            style={{ backgroundColor: STATUS_HEX_COLORS[activity.status] }}
                        >
                            <p className="truncate text-slate-800 font-medium">{activity.title}</p>
                        </div>
                        <div className="absolute bottom-full mb-2 w-max max-w-xs p-2 text-xs text-white bg-slate-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 whitespace-pre-wrap">
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