
import React, { useMemo, useRef, useEffect, useCallback } from 'react';
import { Project } from '../../types';
import { PROJECT_STATUS_HEX_COLORS } from '../../constants';
// FIX: Replace monolithic d3 import with specific named imports to resolve type errors.
import { min, max, timeMonth, scaleTime } from 'd3';

interface ProjectTimelineProps {
  projects: Project[];
  zoomLevel?: number;
  onProjectClick?: (projectId: string) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

const BASE_MONTH_WIDTH = 120; // px

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ projects, zoomLevel = 1, onProjectClick, scrollContainerRef }) => {
  const initialScrollDone = useRef(false);
  
  const monthWidth = useMemo(() => BASE_MONTH_WIDTH * zoomLevel, [zoomLevel]);

  const { timedProjects, months, minDate } = useMemo(() => {
    const filtered = projects
      .filter(p => p.projectStartDate && p.projectEndDate)
      .map(p => ({
        ...p,
        projectStartDate: new Date(p.projectStartDate!),
        projectEndDate: new Date(p.projectEndDate!),
      }))
      .sort((a, b) => a.projectStartDate.getTime() - b.projectStartDate.getTime());

    if (filtered.length === 0) {
      return { timedProjects: [], months: [], minDate: new Date() };
    }

    let minDateCalc = min(filtered, d => d.projectStartDate) as Date;
    let maxDate = max(filtered, d => d.projectEndDate) as Date;

    if (!minDateCalc || !maxDate) return { timedProjects: [], months: [], minDate: new Date() };
    
    minDateCalc = timeMonth.offset(timeMonth.floor(minDateCalc), -1);
    maxDate = timeMonth.offset(timeMonth.ceil(maxDate), 1);
    
    if (timeMonth.count(minDateCalc, maxDate) < 12) {
      maxDate = timeMonth.offset(minDateCalc, 12);
    }

    const timeScale = scaleTime().domain([minDateCalc, maxDate]);
    const months = timeScale.ticks(timeMonth.every(1));
    
    return { timedProjects: filtered, months, minDate: months[0] };
  }, [projects]);

  const getPositionForDate = useCallback((date: Date, isEndDate: boolean = false): number => {
      if (months.length === 0) return 0;
      
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();

      const monthIndex = timeMonth.count(minDate, timeMonth.floor(date));
      
      if (monthIndex < 0) return 0;

      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const dayFraction = isEndDate ? day / daysInMonth : (day - 1) / daysInMonth;

      return (monthIndex * monthWidth) + (dayFraction * monthWidth);
  }, [months, monthWidth, minDate]);
  
  useEffect(() => {
    if (scrollContainerRef.current && !initialScrollDone.current && months.length > 0) {
        const now = new Date();
        const containerWidth = scrollContainerRef.current.offsetWidth;
        const scrollPosition = getPositionForDate(now) - (containerWidth / 2) + (monthWidth / 2);

        setTimeout(() => {
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scroll({
                    left: Math.max(0, scrollPosition),
                    behavior: 'smooth'
                });
                initialScrollDone.current = true;
            }
        }, 100);
    }
  }, [months, monthWidth, getPositionForDate, scrollContainerRef]);


  if (timedProjects.length === 0) {
    return <div className="flex items-center justify-center h-full text-slate-500">Aucun projet avec des dates planifiées à afficher.</div>;
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

        {/* Projects grid */}
        <div className="relative pt-2" style={{ height: `${timedProjects.length * 2.5 + 2}rem` }}>
            {timedProjects.map((project, index) => {
                const left = getPositionForDate(project.projectStartDate, false);
                const right = getPositionForDate(project.projectEndDate, true);
                const width = Math.max(right - left, 2);
                
                const tooltipText = `
                    ${project.title} (${project.status})
                    Début: ${project.projectStartDate.toLocaleDateString('fr-FR')}
                    Fin: ${project.projectEndDate.toLocaleDateString('fr-FR')}
                `;

                return (
                    <div
                        key={project.id}
                        className="absolute h-8 mb-1 flex items-center group cursor-pointer"
                        style={{
                            top: `${index * 2.5}rem`,
                            left: `${left}px`,
                            width: `${width}px`,
                        }}
                        onClick={() => onProjectClick && onProjectClick(project.id)}
                    >
                        <div 
                            className="w-full h-full rounded-md px-2 overflow-hidden whitespace-nowrap text-sm flex items-center transition-all duration-200 group-hover:ring-2 group-hover:ring-blue-500 group-hover:z-10"
                            style={{ backgroundColor: PROJECT_STATUS_HEX_COLORS[project.status] }}
                        >
                            <p className="truncate text-slate-800 font-medium">{project.title}</p>
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

export default ProjectTimeline;
