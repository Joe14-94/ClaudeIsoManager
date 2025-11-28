
import React, { useMemo, useRef, useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; content: React.ReactNode } | null>(null);
  
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

  const handleMouseMove = (e: React.MouseEvent, project: any) => {
    const sortedMilestones = (project.milestones || []).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const tooltipContent = (
        <div className="p-2 text-xs text-slate-800 bg-white border border-slate-200 rounded-md shadow-xl max-w-xs">
            <div className="font-bold text-sm mb-1">{project.title} <span className="font-normal text-slate-500">({project.status})</span></div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
                <div>Début: <span className="font-mono">{project.projectStartDate.toLocaleDateString('fr-FR')}</span></div>
                <div>Fin: <span className="font-mono">{project.projectEndDate.toLocaleDateString('fr-FR')}</span></div>
            </div>
            {sortedMilestones.length > 0 && (
                <div className="border-t border-slate-100 pt-2 mt-1">
                    <div className="font-semibold mb-1 text-slate-600">Jalons :</div>
                    <ul className="space-y-1">
                        {sortedMilestones.map((ms: any) => {
                            const isDelayed = ms.initialDate && new Date(ms.date).getTime() > new Date(ms.initialDate).getTime();
                            return (
                                <li key={ms.id} className="flex items-start gap-1">
                                    <span>{ms.completed ? '✅' : isDelayed ? '⚠️' : '📅'}</span>
                                    <div>
                                        <span className="font-mono">{new Date(ms.date).toLocaleDateString('fr-FR')}</span>: {ms.label}
                                        {ms.history && ms.history.length > 0 && (
                                            <div className="text-[10px] text-slate-400 pl-1 border-l-2 border-slate-200 ml-1">
                                                ↪️ Modifié {ms.history.length} fois
                                            </div>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );

    setTooltip({
        visible: true,
        x: e.clientX + 15,
        y: e.clientY + 15,
        content: tooltipContent
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };


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
                        onMouseMove={(e) => handleMouseMove(e, project)}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div 
                            className="w-full h-full rounded-md px-2 overflow-hidden whitespace-nowrap text-sm flex items-center transition-all duration-200 group-hover:ring-2 group-hover:ring-blue-500 group-hover:z-10 relative"
                            style={{ backgroundColor: PROJECT_STATUS_HEX_COLORS[project.status] }}
                        >
                            <p className="truncate text-slate-800 font-medium z-10 relative">{project.title}</p>
                            {/* Milestones indicators on the bar */}
                            {project.milestones?.map(ms => {
                                const msDate = new Date(ms.date);
                                const msInitialDate = ms.initialDate ? new Date(ms.initialDate) : msDate;
                                
                                // Vérifier si le jalon est dans la plage de temps visible
                                if (msDate >= project.projectStartDate! && msDate <= project.projectEndDate!) {
                                    const msPos = getPositionForDate(msDate, false) - left;
                                    const msInitialPos = getPositionForDate(msInitialDate, false) - left;
                                    
                                    const isDelayed = msDate.getTime() > msInitialDate.getTime();
                                    const isAdvance = msDate.getTime() < msInitialDate.getTime();
                                    const hasShift = isDelayed || isAdvance;

                                    return (
                                        <React.Fragment key={ms.id}>
                                            {/* Connecteur si décalage */}
                                            {hasShift && (
                                                <>
                                                    <div 
                                                        className="absolute top-1/2 h-[1px] bg-slate-500 border-t-2 border-dotted z-10 opacity-60"
                                                        style={{ 
                                                            left: `${Math.min(msPos, msInitialPos)}px`, 
                                                            width: `${Math.abs(msPos - msInitialPos)}px`
                                                        }}
                                                    />
                                                    {/* Jalon Fantôme (Initial) */}
                                                    <div 
                                                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border border-slate-500 bg-slate-300 z-10 opacity-60"
                                                        style={{ left: `${msInitialPos}px` }}
                                                    />
                                                </>
                                            )}
                                            
                                            {/* Jalon Actuel */}
                                            <div 
                                                className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 border-2 z-20 transition-transform group-hover:scale-125 ${ms.completed ? 'bg-green-500 border-white' : isDelayed ? 'bg-red-500 border-white' : 'bg-blue-500 border-white'}`}
                                                style={{ left: `${msPos}px` }}
                                            />
                                        </React.Fragment>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
      
      {/* Portal for Tooltip to escape overflow:hidden contexts */}
      {tooltip && tooltip.visible && createPortal(
          <div 
            style={{ 
                position: 'fixed', 
                top: tooltip.y, 
                left: tooltip.x, 
                pointerEvents: 'none',
                zIndex: 9999 // Ensure tooltip is on top of everything
            }}
          >
            {tooltip.content}
          </div>,
          document.body
      )}
    </div>
  );
};

export default ProjectTimeline;
