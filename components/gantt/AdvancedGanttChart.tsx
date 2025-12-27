
import React, { useState, useMemo, useRef, useLayoutEffect, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Project, ProjectTask, Resource } from '../../types';
import { ChevronDown, ChevronRight, ZoomIn, ZoomOut, Calendar, MoreVertical, User, History, GitCommitVertical, X, Save, CheckSquare, Square, AlertCircle } from 'lucide-react';
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

// Helper pour formater une date Date en YYYY-MM-DD pour les inputs
const formatDateForInput = (date: Date): string => {
    if (!date || isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
  
  // Mapping pour les dépendances
  const rowCoords = useMemo(() => {
    const coords = new Map<string, { xStart: number, xEnd: number, y: number, isCritical?: boolean }>();
    visibleRows.forEach((row, index) => {
        coords.set(row.id, {
            xStart: getXPosition(row.startDate),
            xEnd: getXPosition(row.endDate),
            y: index * ROW_HEIGHT + ROW_HEIGHT / 2,
            isCritical: row.isCritical
        });
    });
    return coords;
  }, [visibleRows, getXPosition]);

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

  // Mise à jour des données (Dates et Pourcentage)
  const handleCellChange = (id: string, type: 'project' | 'task', field: 'start' | 'end' | 'progress', value: string | number) => {
      const updateRecursive = (list: any[]): any[] => {
          return list.map(item => {
              if (item.id === id) {
                  const updates: any = {};
                  if (field === 'start') {
                    if (type === 'project') updates.projectStartDate = new Date(value as string).toISOString();
                    else updates.startDate = new Date(value as string).toISOString();
                  }
                  if (field === 'end') {
                    if (type === 'project') updates.projectEndDate = new Date(value as string).toISOString();
                    else updates.endDate = new Date(value as string).toISOString();
                  }
                  if (field === 'progress') {
                    updates.progress = Number(value);
                  }
                  return { ...item, ...updates };
              }
              if (item.tasks) return { ...item, tasks: updateRecursive(item.tasks) };
              if (item.children) return { ...item, children: updateRecursive(item.children) };
              return item;
          });
      };

      const newProjects = updateRecursive(localProjects);
      setLocalProjects(newProjects);
      if (onDataChange) onDataChange(newProjects);
  };

  // --- 4. Rendu ---

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200 overflow-hidden text-sm">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-2 border-b border-slate-200 bg-slate-50 flex-shrink-0">
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
                     <div className="flex items-center gap-1"><div className="w-3 h-3 bg-indigo-300 rounded-sm"></div> Projet</div>
                     <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-300 rounded-sm"></div> Phase/Tâche</div>
                     <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-300 rounded-sm"></div> Critique</div>
                     <div className="flex items-center gap-1"><div className="w-3 h-3 rotate-45 bg-amber-200 border border-amber-400 rounded-[1px]"></div> Jalon</div>
                     <div className="flex items-center gap-1"><div className="w-3 h-1 bg-slate-400"></div> Baseline</div>
                     {/* Légende Retard */}
                     <div className="flex items-center gap-1">
                        <div className="w-3 h-3 border border-rose-300 bg-white" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(252, 165, 165, 0.5) 2px, rgba(252, 165, 165, 0.5) 4px)' }}></div>
                        Retard
                     </div>
                 </div>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col min-h-0 relative">
            
            {/* Headers Row */}
            <div className="flex flex-shrink-0 z-30 bg-white">
                 {/* Sidebar Header */}
                <div className="flex-shrink-0 flex items-center bg-slate-50 px-2 font-semibold text-slate-600 text-xs border-r border-b border-slate-200 overflow-hidden" style={{ width: SIDEBAR_WIDTH, height: HEADER_HEIGHT }}>
                    <div className="w-8 text-center">#</div>
                    <div className="flex-grow pl-2">Nom</div>
                    <div className="w-24 text-center">Début</div>
                    <div className="w-24 text-center">Fin</div>
                    <div className="w-12 text-center">%</div>
                </div>

                {/* Timeline Header */}
                <div ref={headerRef} className="flex-grow overflow-hidden bg-white border-b border-slate-200 relative select-none" style={{ height: HEADER_HEIGHT }}>
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
            </div>

            {/* Bodies Row (Container for syncing vertical scroll) */}
            <div className="flex-grow flex overflow-hidden relative">
                
                {/* Sidebar Body */}
                <div className="flex-shrink-0 flex flex-col border-r border-slate-200 bg-white z-20 overflow-hidden" style={{ width: SIDEBAR_WIDTH }} ref={sidebarRef}>
                    <div className="relative" style={{ height: visibleRows.length * ROW_HEIGHT }}>
                        {visibleRows.map((row, index) => {
                            const isProject = row.type === 'project';
                            const today = new Date();
                            const isOverdue = row.progress < 100 && row.endDate < today;
                            
                            return (
                                <div 
                                    key={row.id}
                                    className={`absolute w-full flex items-center px-2 border-b border-slate-100 hover:bg-slate-50 transition-colors ${isProject ? 'bg-slate-50 font-semibold' : ''}`}
                                    style={{ height: ROW_HEIGHT, top: index * ROW_HEIGHT }}
                                    onClick={() => {
                                        if(isProject && onProjectClick) onProjectClick(row.id);
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
                                        <span className="truncate cursor-pointer flex items-center gap-1" title={row.name}>
                                            {row.name}
                                            {isOverdue && <AlertCircle size={12} className="text-rose-400 flex-shrink-0" />}
                                        </span>
                                        {row.isCritical && <span className="w-2 h-2 rounded-full bg-red-300 ml-2" title="Tâche critique"></span>}
                                    </div>
                                    {/* Editable Inputs */}
                                    <div className="w-24 px-1" onClick={e => e.stopPropagation()}>
                                        <input 
                                            type="date" 
                                            className={`w-full text-xs bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded px-1 text-slate-500 focus:text-slate-900 ${isOverdue ? 'text-red-600 font-semibold' : ''}`}
                                            value={formatDateForInput(row.startDate)}
                                            onChange={(e) => handleCellChange(row.id, isProject ? 'project' : 'task', 'start', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-24 px-1" onClick={e => e.stopPropagation()}>
                                        <input 
                                            type="date" 
                                            className={`w-full text-xs bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded px-1 text-slate-500 focus:text-slate-900 ${isOverdue ? 'text-red-600 font-semibold' : ''}`}
                                            value={formatDateForInput(row.endDate)}
                                            onChange={(e) => handleCellChange(row.id, isProject ? 'project' : 'task', 'end', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-12 px-1" onClick={e => e.stopPropagation()}>
                                        <input 
                                            type="number" 
                                            min="0" max="100"
                                            className="w-full text-xs text-right bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded px-1 text-slate-500 focus:text-slate-900"
                                            value={row.progress}
                                            onChange={(e) => handleCellChange(row.id, isProject ? 'project' : 'task', 'progress', e.target.value)}
                                            readOnly={isProject} // Project progress is typically calculated
                                            title={isProject ? "Calculé automatiquement pour les projets" : ""}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Timeline Body */}
                <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-grow overflow-auto bg-white relative">
                    <div className="relative" style={{ width: totalWidth, height: visibleRows.length * ROW_HEIGHT }}>
                        
                         {/* SVG Layer for Dependencies and Patterns */}
                         <svg className="absolute top-0 left-0 pointer-events-none z-0" style={{ width: totalWidth, height: visibleRows.length * ROW_HEIGHT }}>
                                <defs>
                                    <marker id="arrow" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
                                        <path d="M0,0 L0,6 L6,3 z" fill="#94a3b8" />
                                    </marker>
                                    <marker id="arrow-critical" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
                                        <path d="M0,0 L0,6 L6,3 z" fill="#ef4444" />
                                    </marker>
                                </defs>
                                {showDependencies && visibleRows.map(row => {
                                    if (!row.dependencyIds || row.dependencyIds.length === 0) return null;
                                    const targetCoords = rowCoords.get(row.id);
                                    if (!targetCoords) return null;

                                    return row.dependencyIds.map(depId => {
                                        const sourceCoords = rowCoords.get(depId);
                                        if (!sourceCoords) return null;

                                        const sourceRow = visibleRows.find(r => r.id === depId);
                                        const isCriticalLink = row.isCritical && sourceRow?.isCritical;

                                        const x1 = sourceCoords.xEnd;
                                        const y1 = sourceCoords.y;
                                        const x2 = targetCoords.xStart;
                                        const y2 = targetCoords.y;

                                        const curveOffset = 20;
                                        const path = `M ${x1} ${y1} C ${x1 + curveOffset} ${y1}, ${x2 - curveOffset} ${y2}, ${x2} ${y2}`;

                                        return (
                                            <path 
                                                key={`${depId}-${row.id}`}
                                                d={path}
                                                fill="none"
                                                stroke={isCriticalLink ? '#ef4444' : '#94a3b8'}
                                                strokeWidth={isCriticalLink ? 2 : 1}
                                                markerEnd={isCriticalLink ? "url(#arrow-critical)" : "url(#arrow)"}
                                            />
                                        );
                                    });
                                })}
                        </svg>

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
                            className="absolute top-0 h-full border-l-2 border-rose-300 z-10 pointer-events-none"
                            style={{ left: getXPosition(new Date()) }}
                        >
                            <div className="absolute -top-1 -left-[3px] w-[6px] h-[6px] rounded-full bg-rose-400"></div>
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
                            
                            // Calcul du décalage (Slippage) par rapport à la baseline
                            // Le décalage correspond à la partie de la barre actuelle qui se trouve APRES la date de fin de la baseline.
                            // Si la fin actuelle est après la fin de la baseline
                            // On prend le max entre le début actuel et la fin de la baseline comme point de départ du hachurage pour gérer les cas où la tâche a aussi commencé en retard.
                            // Mais visuellement, on veut juste montrer ce qui dépasse à droite.
                            
                            // Logique simplifiée : 
                            // Si la barre finit après la baseline, la partie qui dépasse est rouge hachurée.
                            // Attention : Si la barre commence après la fin de la baseline, toute la barre est hachurée.
                            
                            const slippageStart = Math.max(xStart, baselineEnd);
                            const slippageWidth = Math.max(0, xEnd - baselineEnd);
                            
                            // La largeur "normale" est la largeur totale moins la partie hachurée
                            // SAUF si la barre est entièrement hachurée (début après fin baseline)
                            const normalWidth = width - slippageWidth;
                            
                            // Indicateur de dépassement (Overdue) : Pas fini et date de fin passée
                            const isOverdue = row.progress < 100 && new Date() > row.endDate;
                            const overdueClass = isOverdue ? 'ring-2 ring-rose-300 ring-offset-1' : '';
                            const criticalBorderClass = row.isCritical ? 'border-2 border-red-300' : '';

                            return (
                                <div 
                                    key={`bar-${row.id}`} 
                                    className="absolute w-full border-b border-slate-100/50 hover:bg-blue-50/10 transition-colors z-10"
                                    style={{ height: ROW_HEIGHT, top: rowTop }}
                                >
                                    {/* Baseline Bar */}
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
                                            className={`absolute w-4 h-4 rotate-45 bg-amber-200 border border-amber-400 z-10 group ${criticalBorderClass}`}
                                            style={{ left: xStart - 8, top: 12 }}
                                            onMouseEnter={(e) => setTooltip({ visible: true, x: e.clientX, y: e.clientY, content: <div className="text-xs font-bold">{row.name}<br/>{formatDateFR(row.startDate)}</div> })}
                                            onMouseLeave={() => setTooltip(null)}
                                        />
                                    ) : (
                                        <div 
                                            className={`absolute h-5 rounded-sm shadow-sm z-10 group cursor-pointer ${overdueClass}`}
                                            style={{ 
                                                left: xStart, 
                                                width: width,
                                                top: 8,
                                                opacity: row.type === 'phase' ? 0.8 : 1
                                            }}
                                            onMouseEnter={(e) => setTooltip({ visible: true, x: e.clientX, y: e.clientY, content: <div className="text-xs"><strong>{row.name}</strong><br/>Du {formatDateFR(row.startDate)} au {formatDateFR(row.endDate)}<br/>{row.progress}% {row.isCritical ? '(Critique)' : ''}{slippageWidth > 0 ? <span className="text-red-300"><br/>Retard planifié détecté</span> : ''}</div> })}
                                            onMouseLeave={() => setTooltip(null)}
                                        >
                                            {/* Partie Normale de la barre */}
                                            {normalWidth > 0 && (
                                                <div className={`absolute left-0 top-0 h-full ${row.colorClass} ${criticalBorderClass} ${slippageWidth > 0 ? 'rounded-l-sm' : 'rounded-sm'}`} style={{ width: normalWidth }}>
                                                </div>
                                            )}

                                            {/* Partie Retard (Slippage) */}
                                            {slippageWidth > 0 && (
                                                <div
                                                    className={`absolute top-0 h-full border-t border-b border-r border-rose-300 ${normalWidth <= 0 ? 'rounded-sm border-l' : 'rounded-r-sm'}`}
                                                    style={{
                                                        left: normalWidth,
                                                        width: slippageWidth,
                                                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(252, 165, 165, 0.5) 5px, rgba(252, 165, 165, 0.5) 10px)',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.5)'
                                                    }}
                                                >
                                                </div>
                                            )}
                                            
                                            {/* Progress Overlay - on top of both parts */}
                                            <div className="absolute left-0 top-0 h-full bg-white/30 rounded-sm" style={{ width: `${row.progress}%` }} />

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
