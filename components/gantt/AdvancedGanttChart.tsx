
import React, { useState, useMemo, useRef, useLayoutEffect, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Project, ProjectTask, Resource } from '../../types';
import { ChevronDown, ChevronRight, ZoomIn, ZoomOut, Calendar, MoreVertical, User, History, GitCommitVertical, X, Save, CheckSquare, Square } from 'lucide-react';
import { useGanttData, GanttRow } from '../../hooks/useGanttData';

// --- Types et Constantes ---

type ViewMode = 'Year' | 'Quarter' | 'Month' | 'Week' | 'Day';

interface ZoomLevel {
    mode: ViewMode;
    dayWidth: number; // Largeur en pixels d'une journée
    label: string;
}

const ZOOM_LEVELS: ZoomLevel[] = [
    { mode: 'Year', dayWidth: 1, label: 'Année (Ultra Compact)' },
    { mode: 'Quarter', dayWidth: 4, label: 'Trimestre' }, 
    { mode: 'Month', dayWidth: 15, label: 'Mois' }, 
    { mode: 'Week', dayWidth: 40, label: 'Semaine' },
    { mode: 'Day', dayWidth: 80, label: 'Jour' },
];

interface AdvancedGanttChartProps {
  projects: Project[];
  resources: Resource[];
  onProjectClick?: (projectId: string) => void;
  onDataChange?: (updatedProjects: Project[]) => void;
}

interface TimeBlock {
    left: number;
    width: number;
    label: string;
    isEven: boolean;
}

const HEADER_HEIGHT = 50; 
const ROW_HEIGHT = 40; 
const SIDEBAR_WIDTH = 450; 

// --- Fonctions Utilitaires ---

const formatDateFR = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

// Helper pour obtenir le numéro de semaine ISO
const getWeekNumber = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

// --- Composant Principal ---

export const AdvancedGanttChart: React.FC<AdvancedGanttChartProps> = ({ projects, resources, onProjectClick, onDataChange }) => {
  // État local pour permettre l'édition "in-place"
  const [localProjects, setLocalProjects] = useState<Project[]>([]);
  // Snapshot des projets initiaux pour la baseline
  const [initialProjectsSnapshot, setInitialProjectsSnapshot] = useState<Project[]>([]);

  const [zoomIndex, setZoomIndex] = useState(2); // Vue Mois par défaut
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set()); 
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; content: React.ReactNode } | null>(null);
  const [showBaseline, setShowBaseline] = useState(false); 
  const [showDependencies, setShowDependencies] = useState(true);
  
  // Refs pour la synchro du scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null); 
  const headerRef = useRef<HTMLDivElement>(null); 
  const sidebarRef = useRef<HTMLDivElement>(null);

  const currentZoom = ZOOM_LEVELS[zoomIndex];
  const dayWidth = currentZoom.dayWidth;

  // Initialisation des données locales et du snapshot
  useEffect(() => {
      if (projects && projects.length > 0) {
          const projectsCopy = JSON.parse(JSON.stringify(projects));
          setLocalProjects(projectsCopy);
          setInitialProjectsSnapshot((prev) => prev.length === 0 ? JSON.parse(JSON.stringify(projects)) : prev);
          
          setExpandedIds(prev => {
             if (prev.size === 0) {
                 return new Set(projects.map(p => p.id));
             }
             return prev;
          });
      }
  }, [projects]);

  const initialDatesMap = useMemo(() => {
      const map = new Map<string, { start: Date, end: Date }>();
      const traverse = (items: any[]) => {
          items.forEach(item => {
              const startStr = item.startDate || item.projectStartDate;
              const endStr = item.endDate || item.projectEndDate;

              if (startStr && endStr) {
                  map.set(item.id, { 
                      start: new Date(startStr), 
                      end: new Date(endStr) 
                  });
              }
              
              if (item.tasks) traverse(item.tasks);
              if (item.children) traverse(item.children);
          });
      };
      traverse(initialProjectsSnapshot);
      return map;
  }, [initialProjectsSnapshot]);

  // --- 1. Préparation des données via le Hook ---
  const allRows = useGanttData(localProjects, resources, expandedIds, initialDatesMap);

  const visibleRows = useMemo(() => {
    const visible: GanttRow[] = [];
    const isParentExpanded = (parentId?: string): boolean => {
        if (!parentId) return true;
        if (!expandedIds.has(parentId)) return false;
        const parent = allRows.find(r => r.id === parentId);
        return parent ? isParentExpanded(parent.parentId) : true;
    };

    allRows.forEach(row => {
        if (row.level === 0 || isParentExpanded(row.parentId)) {
            visible.push(row);
        }
    });
    return visible;
  }, [allRows, expandedIds]);

  // --- 2. Calculs de temps et dimensions ---
  const { minDate, maxDate } = useMemo(() => {
    if (localProjects.length === 0) return { minDate: new Date(), maxDate: new Date() };
    
    let min = new Date(3000, 0, 1);
    let max = new Date(1900, 0, 1);

    localProjects.forEach(p => {
        if(p.projectStartDate) { const d = new Date(p.projectStartDate); if(d < min) min = d; }
        if(p.projectEndDate) { const d = new Date(p.projectEndDate); if(d > max) max = d; }
    });
    
    min.setDate(min.getDate() - 30); 
    max.setDate(max.getDate() + 30); 
    return { minDate: min, maxDate: max };
  }, [localProjects]);

  const getXPosition = useCallback((date: Date) => {
    const diffTime = date.getTime() - minDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return Math.floor(diffDays * dayWidth);
  }, [minDate, dayWidth]);

  const totalWidth = useMemo(() => {
      const diffTime = maxDate.getTime() - minDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return Math.ceil(diffDays * dayWidth);
  }, [minDate, maxDate, dayWidth]);

  useLayoutEffect(() => {
     if (scrollContainerRef.current) {
         const todayX = getXPosition(new Date());
         const containerWidth = scrollContainerRef.current.clientWidth;
         scrollContainerRef.current.scrollLeft = todayX - (containerWidth / 2);
         if(headerRef.current) headerRef.current.scrollLeft = todayX - (containerWidth / 2);
     }
  }, [zoomIndex, getXPosition]);

  // Génération des blocs d'en-tête (Majeurs et Mineurs)
  const headerBlocks = useMemo(() => {
      const majorBlocks: TimeBlock[] = [];
      const minorBlocks: TimeBlock[] = [];
      
      let current = new Date(minDate);
      current.setHours(0,0,0,0);
      
      const getMajorLabel = (d: Date): string => {
          if (currentZoom.mode === 'Year') return d.getFullYear().toString();
          if (currentZoom.mode === 'Quarter') {
            const label = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
            return label.charAt(0).toUpperCase() + label.slice(1);
          }
          if (currentZoom.mode === 'Month') {
            const label = d.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
            return label.charAt(0).toUpperCase() + label.slice(1);
          }
          if (currentZoom.mode === 'Week') {
            const label = d.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
            return label.charAt(0).toUpperCase() + label.slice(1);
          }
          if (currentZoom.mode === 'Day') return `Semaine du ${d.toLocaleDateString()}`;
          return '';
      };

      const getMinorLabel = (d: Date): string => {
          if (currentZoom.mode === 'Year') return d.toLocaleDateString('fr-FR', { month: 'narrow' }).toUpperCase();
          if (currentZoom.mode === 'Quarter') return `S${getWeekNumber(d)}`;
          if (currentZoom.mode === 'Month') return `S${getWeekNumber(d)}`;
          if (currentZoom.mode === 'Week') return d.getDate().toString();
          if (currentZoom.mode === 'Day') return d.getDate().toString();
          return '';
      };

      const getMajorKey = (d: Date): string => {
          if (currentZoom.mode === 'Year') return d.getFullYear().toString();
          if (currentZoom.mode === 'Quarter' || currentZoom.mode === 'Month' || currentZoom.mode === 'Week') {
              return `${d.getFullYear()}-${d.getMonth()}`;
          }
          return `${d.getFullYear()}-W${getWeekNumber(d)}`;
      };

      let currentMajorLabel = getMajorLabel(current);
      let currentMinorLabel = getMinorLabel(current);
      let currentMajorKey = getMajorKey(current);
      
      let majorStartX = getXPosition(current);
      let minorStartX = getXPosition(current);
      
      let minorCount = 0;

      while (current < maxDate) {
          const nextMinor = new Date(current);
          if (currentZoom.mode === 'Year') nextMinor.setMonth(current.getMonth() + 1);
          else if (currentZoom.mode === 'Quarter') nextMinor.setDate(current.getDate() + 7);
          else if (currentZoom.mode === 'Month') nextMinor.setDate(current.getDate() + 7);
          else nextMinor.setDate(current.getDate() + 1);

          const nextMinorX = getXPosition(nextMinor);
          const width = nextMinorX - minorStartX;
          
          minorBlocks.push({
              left: minorStartX,
              width: width,
              label: currentMinorLabel,
              isEven: minorCount % 2 === 0
          });
          minorCount++;
          minorStartX = nextMinorX;
          current = nextMinor;
          currentMinorLabel = getMinorLabel(current);

          const nextMajorKey = getMajorKey(current);
          if (nextMajorKey !== currentMajorKey || current >= maxDate) {
              const majorWidth = minorStartX - majorStartX;
              majorBlocks.push({
                  left: majorStartX,
                  width: majorWidth,
                  label: currentMajorLabel,
                  isEven: false
              });
              currentMajorLabel = getMajorLabel(current);
              currentMajorKey = nextMajorKey;
              majorStartX = minorStartX;
          }
      }
      return { majorBlocks, minorBlocks };
  }, [minDate, maxDate, currentZoom, getXPosition]);

  // --- 3. Gestion des intéractions ---

  const handleExpand = (id: string) => {
      setExpandedIds(prev => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
      });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      // Synchronisation horizontale (Header de la timeline)
      if (headerRef.current) {
          headerRef.current.scrollLeft = e.currentTarget.scrollLeft;
      }
      // Synchronisation verticale (Sidebar gauche)
      if (sidebarRef.current) {
          sidebarRef.current.scrollTop = e.currentTarget.scrollTop;
      }
  };

  // --- 4. Rendu ---

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200 overflow-hidden text-sm">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-2 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2">
                <div className="flex bg-white rounded-md border border-slate-300 p-0.5">
                    <button onClick={() => setZoomIndex(Math.max(0, zoomIndex - 1))} disabled={zoomIndex === 0} className="p-1 hover:bg-slate-100 rounded disabled:opacity-50"><ZoomOut size={16}/></button>
                    <span className="px-2 text-xs font-medium text-slate-600 min-w-[80px] text-center">{currentZoom.label}</span>
                    <button onClick={() => setZoomIndex(Math.min(ZOOM_LEVELS.length - 1, zoomIndex + 1))} disabled={zoomIndex === ZOOM_LEVELS.length - 1} className="p-1 hover:bg-slate-100 rounded disabled:opacity-50"><ZoomIn size={16}/></button>
                </div>
                <div className="h-6 w-px bg-slate-300 mx-2"></div>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={showBaseline} onChange={e => setShowBaseline(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"/>
                    Afficher Baseline
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={showDependencies} onChange={e => setShowDependencies(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"/>
                    Afficher Liens
                </label>
            </div>
            
            <div className="flex items-center gap-2">
                 <div className="flex items-center gap-3 text-xs text-slate-500 mr-4">
                     <div className="flex items-center gap-1"><div className="w-3 h-3 bg-indigo-600 rounded-sm"></div> Projet</div>
                     <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Phase/Tâche</div>
                     <div className="flex items-center gap-1"><div className="w-3 h-3 rotate-45 bg-yellow-500 rounded-[1px]"></div> Jalon</div>
                     <div className="flex items-center gap-1"><div className="w-3 h-1 bg-slate-400"></div> Baseline</div>
                 </div>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow flex min-h-0 relative">
            
            {/* Sidebar (Task List) */}
            <div className="flex-shrink-0 flex flex-col border-r border-slate-200 bg-white z-20" style={{ width: SIDEBAR_WIDTH }}>
                {/* Header Sidebar */}
                <div className="h-[50px] border-b border-slate-200 bg-slate-50 flex items-center px-2 font-semibold text-slate-600 text-xs">
                    <div className="w-8 text-center">#</div>
                    <div className="flex-grow pl-2">Nom</div>
                    <div className="w-24 text-center">Début</div>
                    <div className="w-24 text-center">Fin</div>
                    <div className="w-12 text-center">%</div>
                </div>
                {/* Rows Sidebar */}
                <div className="flex-grow overflow-hidden relative" ref={sidebarRef}>
                    <div className="relative" style={{ height: visibleRows.length * ROW_HEIGHT }}>
                        {visibleRows.map((row) => (
                            <div 
                                key={row.id}
                                className={`absolute w-full flex items-center px-2 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${row.type === 'project' ? 'bg-slate-50 font-semibold' : ''}`}
                                style={{ height: ROW_HEIGHT, top: 0, transform: `translateY(${visibleRows.indexOf(row) * ROW_HEIGHT}px)` }}
                                onClick={() => {
                                    if(row.type === 'project' && onProjectClick) onProjectClick(row.id);
                                }}
                            >
                                <div className="w-8 text-center text-slate-400 text-[10px]">{row.wbs}</div>
                                <div className="flex-grow pl-2 flex items-center gap-1 overflow-hidden" style={{ paddingLeft: `${row.level * 16}px` }}>
                                    {row.hasChildren && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleExpand(row.id); }}
                                            className="p-0.5 hover:bg-slate-200 rounded"
                                        >
                                            {row.expanded ? <ChevronDown size={12}/> : <ChevronRight size={12}/>}
                                        </button>
                                    )}
                                    <span className="truncate" title={row.name}>{row.name}</span>
                                </div>
                                <div className="w-24 text-center text-xs text-slate-500">{formatDateFR(row.startDate)}</div>
                                <div className="w-24 text-center text-xs text-slate-500">{formatDateFR(row.endDate)}</div>
                                <div className="w-12 text-center text-xs text-slate-500">{row.progress}%</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Gantt Area */}
            <div className="flex-grow flex flex-col min-w-0 bg-slate-50 overflow-hidden relative">
                {/* Timeline Header */}
                <div ref={headerRef} className="flex-shrink-0 overflow-hidden bg-white border-b border-slate-200 relative select-none" style={{ height: HEADER_HEIGHT }}>
                    <div className="absolute top-0 left-0 h-full" style={{ width: totalWidth }}>
                        {headerBlocks.majorBlocks.map((block, i) => (
                            <div 
                                key={`major-${i}`}
                                className="absolute top-0 h-1/2 border-r border-slate-300 flex items-center justify-center text-xs font-bold text-slate-600 bg-slate-100/50"
                                style={{ left: block.left, width: block.width }}
                            >
                                {block.label}
                            </div>
                        ))}
                        {headerBlocks.minorBlocks.map((block, i) => (
                            <div 
                                key={`minor-${i}`}
                                className={`absolute bottom-0 h-1/2 border-r border-slate-200 flex items-center justify-center text-[10px] text-slate-500 ${block.isEven ? 'bg-white' : 'bg-slate-50'}`}
                                style={{ left: block.left, width: block.width }}
                            >
                                {block.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bars Area */}
                <div ref={scrollContainerRef} className="flex-grow overflow-auto overflow-y-hidden relative" onScroll={handleScroll}>
                    <div className="relative" style={{ width: totalWidth, height: visibleRows.length * ROW_HEIGHT }}>
                        {/* Grid Columns Background */}
                        {headerBlocks.minorBlocks.map((block, i) => (
                            <div 
                                key={`grid-${i}`}
                                className={`absolute top-0 h-full border-r border-slate-100 pointer-events-none ${block.isEven ? 'bg-white' : 'bg-slate-50/30'}`}
                                style={{ left: block.left, width: block.width }}
                            />
                        ))}

                        {/* Today Line */}
                        <div 
                            className="absolute top-0 h-full border-l-2 border-red-400 z-10 pointer-events-none"
                            style={{ left: getXPosition(new Date()) }}
                        >
                            <div className="absolute -top-1 -left-[3px] w-[6px] h-[6px] rounded-full bg-red-500"></div>
                        </div>

                        {/* Rows */}
                        {visibleRows.map((row, index) => {
                            const rowTop = index * ROW_HEIGHT;
                            const xStart = getXPosition(row.startDate);
                            const xEnd = getXPosition(row.endDate);
                            const width = Math.max(2, xEnd - xStart);
                            
                            const baselineStart = row.baselineStartDate ? getXPosition(row.baselineStartDate) : xStart;
                            const baselineEnd = row.baselineEndDate ? getXPosition(row.baselineEndDate) : xEnd;
                            const baselineWidth = Math.max(2, baselineEnd - baselineStart);

                            const isMilestone = row.type === 'milestone';

                            return (
                                <div 
                                    key={`bar-${row.id}`} 
                                    className="absolute w-full border-b border-slate-100/50 hover:bg-blue-50/10 transition-colors"
                                    style={{ height: ROW_HEIGHT, top: rowTop }}
                                >
                                    {showBaseline && row.baselineStartDate && (
                                        <div 
                                            className="absolute h-1.5 bg-slate-300 rounded-full opacity-60"
                                            style={{ 
                                                left: baselineStart, 
                                                width: baselineWidth,
                                                top: '70%'
                                            }}
                                        />
                                    )}

                                    {isMilestone ? (
                                        <div
                                            className="absolute w-4 h-4 rotate-45 bg-yellow-400 border border-yellow-600 z-10 group"
                                            style={{ left: xStart - 8, top: 12 }}
                                            onMouseEnter={(e) => setTooltip({ visible: true, x: e.clientX, y: e.clientY, content: <div className="text-xs font-bold">{row.name}<br/>{formatDateFR(row.startDate)}</div> })}
                                            onMouseLeave={() => setTooltip(null)}
                                        />
                                    ) : (
                                        <div 
                                            className={`absolute h-5 rounded-sm shadow-sm z-10 group cursor-pointer ${row.colorClass}`}
                                            style={{ 
                                                left: xStart, 
                                                width: width,
                                                top: 8,
                                                opacity: row.type === 'phase' ? 0.8 : 1
                                            }}
                                            onMouseEnter={(e) => setTooltip({ visible: true, x: e.clientX, y: e.clientY, content: <div className="text-xs"><strong>{row.name}</strong><br/>Du {formatDateFR(row.startDate)} au {formatDateFR(row.endDate)}<br/>{row.progress}%</div> })}
                                            onMouseLeave={() => setTooltip(null)}
                                        >
                                            <div className="h-full bg-white/30" style={{ width: `${row.progress}%` }} />
                                            {width < 50 && (
                                                <div className="absolute left-full ml-2 top-0 h-full flex items-center text-xs text-slate-500 whitespace-nowrap pointer-events-none">
                                                    {row.name}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>

        {tooltip && tooltip.visible && createPortal(
            <div 
                className="fixed bg-slate-800 text-white p-2 rounded shadow-lg z-[9999] pointer-events-none max-w-xs"
                style={{ top: tooltip.y + 10, left: tooltip.x + 10 }}
            >
                {tooltip.content}
            </div>,
            document.body
        )}
    </div>
  );
};
