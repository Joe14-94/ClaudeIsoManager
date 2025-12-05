
import React, { useState, useMemo, useRef, useLayoutEffect, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Project, ProjectTask, Resource } from '../../types';
import { ChevronDown, ChevronRight, ZoomIn, ZoomOut, Calendar, MoreVertical, User, History, GitCommitVertical, X, Save, CheckSquare, Square } from 'lucide-react';

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

interface GanttRow {
  id: string;
  type: 'project' | 'phase' | 'task' | 'milestone';
  name: string;
  wbs: string; // Work Breakdown Structure (1, 1.1, 1.1.1)
  startDate: Date;
  endDate: Date;
  // Champs pour la comparaison (Baseline)
  baselineStartDate?: Date;
  baselineEndDate?: Date;
  duration: number; // en jours
  progress: number;
  status?: string;
  assignee?: string;
  level: number;
  expanded: boolean;
  data: any;
  parentId?: string;
  visible: boolean;
  hasChildren: boolean;
  colorClass: string; // Couleur de la barre
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
const HEADER_BUFFER = 200; // Buffer pour le scroll horizontal

// --- Fonctions Utilitaires ---

const getPhaseColor = (index: number, type: string): string => {
    if (type === 'project') return 'bg-indigo-600'; 
    
    const colors = [
        'bg-blue-500', 
        'bg-blue-500',
        'bg-blue-500',
        'bg-blue-500',
    ];
    return colors[index % colors.length];
};

const formatDateFR = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

const formatDateInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
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

const AdvancedGanttChart: React.FC<AdvancedGanttChartProps> = ({ projects, resources, onProjectClick, onDataChange }) => {
  // État local pour permettre l'édition "in-place"
  const [localProjects, setLocalProjects] = useState<Project[]>([]);
  // Snapshot des projets initiaux pour la baseline
  const [initialProjectsSnapshot, setInitialProjectsSnapshot] = useState<Project[]>([]);

  const [zoomIndex, setZoomIndex] = useState(2); // Vue Mois par défaut
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set()); 
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; content: React.ReactNode } | null>(null);
  const [showBaseline, setShowBaseline] = useState(false); 
  const [showDependencies, setShowDependencies] = useState(true);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  
  // État pour le volet d'édition
  const [selectedItem, setSelectedItem] = useState<GanttRow | null>(null);
  const [editFormData, setEditFormData] = useState<{ name: string; start: string; end: string; progress: number } | null>(null);

  // Refs pour la synchro du scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null); 
  const headerRef = useRef<HTMLDivElement>(null); 
  const verticalScrollContainerRef = useRef<HTMLDivElement>(null); 
  const optionsRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
              setIsOptionsOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- 1. Préparation des données (Data Flattening & WBS) ---
  const allRows = useMemo(() => {
    const result: GanttRow[] = [];
    
    const processTask = (task: ProjectTask, level: number, parentId: string, wbsPrefix: string, rootIndex: number): GanttRow[] => {
        const taskRows: GanttRow[] = [];
        const isExpanded = expandedIds.has(task.id);
        const assigneeName = task.assigneeId ? resources.find(r => r.id === task.assigneeId)?.name : undefined;
        const hasChildren = !!(task.children && task.children.length > 0);
        
        let type: GanttRow['type'] = 'task';
        if (hasChildren) type = 'phase';
        
        const start = new Date(task.startDate);
        const end = new Date(task.endDate);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        
        if (duration <= 0) type = 'milestone';

        const colorClass = getPhaseColor(rootIndex, type);
        const initialDates = initialDatesMap.get(task.id);
        const baselineStartDate = initialDates ? initialDates.start : start;
        const baselineEndDate = initialDates ? initialDates.end : end;

        taskRows.push({
            id: task.id,
            type,
            name: task.name,
            wbs: wbsPrefix,
            startDate: start,
            endDate: end,
            baselineStartDate,
            baselineEndDate,
            duration: Math.max(0, Math.round(duration)),
            progress: task.progress,
            status: task.status,
            assignee: assigneeName,
            level,
            expanded: isExpanded,
            data: task,
            parentId,
            visible: true,
            hasChildren,
            colorClass
        });

        if (task.children && task.children.length > 0) {
            task.children.forEach((child, idx) => {
                const childWbs = `${wbsPrefix}.${idx + 1}`;
                taskRows.push(...processTask(child, level + 1, task.id, childWbs, rootIndex));
            });
        }
        return taskRows;
    };

    localProjects.forEach((project, projIndex) => {
        const isExpanded = expandedIds.has(project.id);
        const startDate = project.projectStartDate ? new Date(project.projectStartDate) : new Date();
        const endDate = project.projectEndDate ? new Date(project.projectEndDate) : new Date();
        const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        const wbs = `${projIndex + 1}`;

        let progress = 0;
        if (project.internalWorkloadEngaged && (project.internalWorkloadEngaged + (project.externalWorkloadEngaged || 0)) > 0) {
             const totalEngaged = project.internalWorkloadEngaged + (project.externalWorkloadEngaged || 0);
             const totalConsumed = (project.internalWorkloadConsumed || 0) + (project.externalWorkloadConsumed || 0);
             progress = Math.min(100, Math.round((totalConsumed / totalEngaged) * 100));
        }

        const initialDates = initialDatesMap.get(project.id);
        const baselineStartDate = initialDates ? initialDates.start : startDate;
        const baselineEndDate = initialDates ? initialDates.end : endDate;

        result.push({
            id: project.id,
            type: 'project',
            name: project.title,
            wbs: wbs,
            startDate,
            endDate,
            baselineStartDate,
            baselineEndDate,
            duration: Math.round(duration),
            progress,
            level: 0,
            expanded: isExpanded,
            data: project,
            visible: true,
            hasChildren: !!(project.tasks && project.tasks.length > 0),
            colorClass: 'bg-indigo-600'
        });

        if (project.tasks) {
            project.tasks.forEach((task, taskIdx) => {
                const taskWbs = `${wbs}.${taskIdx + 1}`;
                result.push(...processTask(task, 1, project.id, taskWbs, taskIdx));
            });
        }
    });
    return result;
  }, [localProjects, expandedIds, resources, initialDatesMap]);

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

  useLayoutEffect(() => {
      const container = verticalScrollContainerRef.current;
      if (!container) return;
      const updateScrollbarWidth = () => {
          const width = container.offsetWidth - container.clientWidth;
          setScrollbarWidth(width);
      };
      const resizeObserver = new ResizeObserver(updateScrollbarWidth);
      resizeObserver.observe(container);
      updateScrollbarWidth();
      return () => resizeObserver.disconnect();
  }, [visibleRows.length]); 

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
      // On s'assure de commencer à 00:00
      current.setHours(0,0,0,0);
      
      // Fonction pour obtenir les labels en fonction du zoom
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
          if (currentZoom.mode === 'Month') return `S${getWeekNumber(d)}`; // Affichage semaine pour le mois
          if (currentZoom.mode === 'Week') return d.getDate().toString();
          if (currentZoom.mode === 'Day') return d.getDate().toString();
          return '';
      };

      // Clés uniques pour identifier les changements de blocs temporels
      const getMajorKey = (d: Date): string => {
          if (currentZoom.mode === 'Year') return d.getFullYear().toString();
          if (currentZoom.mode === 'Quarter' || currentZoom.mode === 'Month' || currentZoom.mode === 'Week') {
              return `${d.getFullYear()}-${d.getMonth()}`;
          }
          // Day mode: Major is Week
          return `${d.getFullYear()}-W${getWeekNumber(d)}`;
      };

      const getMinorKey = (d: Date): string => {
          if (currentZoom.mode === 'Year') return `${d.getFullYear()}-${d.getMonth()}`;
          if (currentZoom.mode === 'Quarter' || currentZoom.mode === 'Month') {
              return `${d.getFullYear()}-W${getWeekNumber(d)}`;
          }
          // Week and Day mode: Minor is Day
          return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      };

      let currentMajorLabel = getMajorLabel(current);
      let currentMinorLabel = getMinorLabel(current);
      
      let currentMajorKey = getMajorKey(current);
      let currentMinorKey = getMinorKey(current);
      
      let majorStartX = getXPosition(current);
      let minorStartX = getXPosition(current);
      
      let minorCount = 0; // Pour l'alternance (zebra)

      // On boucle jusqu'à maxDate + 1 jour pour fermer les derniers blocs
      const endDateLoop = new Date(maxDate);
      endDateLoop.setDate(endDateLoop.getDate() + 1);

      while (current <= endDateLoop) {
          const x = getXPosition(current);
          
          const majorKey = getMajorKey(current);
          const minorKey = getMinorKey(current);

          // Changement de bloc Majeur (Ligne du haut)
          if (majorKey !== currentMajorKey) {
              majorBlocks.push({
                  left: majorStartX,
                  width: x - majorStartX,
                  label: currentMajorLabel,
                  isEven: false 
              });
              currentMajorKey = majorKey;
              currentMajorLabel = getMajorLabel(current);
              majorStartX = x;
          }

          // Changement de bloc Mineur (Ligne du bas)
          if (minorKey !== currentMinorKey) {
              minorBlocks.push({
                  left: minorStartX,
                  width: x - minorStartX,
                  label: currentMinorLabel,
                  isEven: minorCount % 2 === 0
              });
              currentMinorKey = minorKey;
              currentMinorLabel = getMinorLabel(current);
              minorStartX = x;
              minorCount++;
          }
          
          current.setDate(current.getDate() + 1);
      }
      
      // Ajout des derniers blocs s'ils n'ont pas été fermés (fin de la plage)
      const endX = getXPosition(endDateLoop);
      if (endX > majorStartX) {
          majorBlocks.push({
              left: majorStartX,
              width: endX - majorStartX,
              label: currentMajorLabel,
              isEven: false
          });
      }
      if (endX > minorStartX) {
          minorBlocks.push({
              left: minorStartX,
              width: endX - minorStartX,
              label: currentMinorLabel,
              isEven: minorCount % 2 === 0
          });
      }

      return { major: majorBlocks, minor: minorBlocks };

  }, [minDate, maxDate, currentZoom, getXPosition]);


  // --- 3. Gestionnaires ---

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedIds(newSet);
  };

  const handleHorizontalScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const left = e.currentTarget.scrollLeft;
      if (headerRef.current) headerRef.current.scrollLeft = left;
  };

  const handleMouseMove = (e: React.MouseEvent, row: GanttRow) => {
    const x = e.clientX + 15;
    const y = e.clientY + 15;
    
    let delayText = null;
    if (row.baselineEndDate && row.endDate > row.baselineEndDate) {
        const diffTime = row.endDate.getTime() - row.baselineEndDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        delayText = <span className="text-red-500 font-bold">Retard : {diffDays} jours</span>;
    }

    setTooltip({ 
        visible: true, 
        x, y, 
        content: (
            <div className="bg-white text-slate-800 p-3 rounded shadow-xl border border-slate-200 text-xs z-[9999] min-w-[200px]">
                <div className="font-bold text-sm mb-1">{row.name}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <span className="text-slate-500">Début:</span> <span>{row.startDate.toLocaleDateString()}</span>
                    <span className="text-slate-500">Fin:</span> <span>{row.endDate.toLocaleDateString()}</span>
                    {showBaseline && row.baselineEndDate && (
                        <>
                         <span className="text-slate-400 italic">Initial:</span> <span className="text-slate-400 italic">{row.baselineEndDate.toLocaleDateString()}</span>
                        </>
                    )}
                </div>
                {delayText && <div className="mt-2 pt-2 border-t border-slate-100">{delayText}</div>}
                {row.type !== 'milestone' && <div className="mt-1 text-blue-600 font-medium">Avancement: {row.progress}%</div>}
                {row.assignee && <div className="mt-1 flex items-center gap-1 text-slate-500"><User size={12}/> {row.assignee}</div>}
            </div>
        ) 
    });
  };
  
  const handleRowClick = (e: React.MouseEvent, row: GanttRow) => {
      e.stopPropagation();
      setSelectedItem(row);
      setEditFormData({
          name: row.name,
          start: formatDateInput(row.startDate),
          end: formatDateInput(row.endDate),
          progress: row.progress
      });
  };
  
  const handleSaveEdit = () => {
      if (!selectedItem || !editFormData) return;

      // Créer une copie profonde pour éviter la mutation directe
      const updatedProjects = JSON.parse(JSON.stringify(localProjects));
      
      const updateTree = (items: ProjectTask[] | undefined): boolean => {
          if (!items) return false;
          for (let i = 0; i < items.length; i++) {
              if (items[i].id === selectedItem.id) {
                  items[i] = {
                      ...items[i],
                      name: editFormData.name,
                      startDate: editFormData.start + 'T00:00:00Z',
                      endDate: editFormData.end + 'T00:00:00Z',
                      progress: editFormData.progress
                  };
                  return true;
              }
              if (items[i].children && updateTree(items[i].children)) return true;
          }
          return false;
      };

      const getMaxEndDate = (tasks: ProjectTask[]): number => {
        let max = 0;
        tasks.forEach(t => {
            const end = new Date(t.endDate).getTime();
            if (end > max) max = end;
            if (t.children) {
                const childMax = getMaxEndDate(t.children);
                if (childMax > max) max = childMax;
            }
        });
        return max;
      };

      if (selectedItem.type === 'project') {
          const idx = updatedProjects.findIndex((p: Project) => p.id === selectedItem.id);
          if (idx !== -1) {
              updatedProjects[idx] = {
                  ...updatedProjects[idx],
                  title: editFormData.name,
                  projectStartDate: editFormData.start + 'T00:00:00Z',
                  projectEndDate: editFormData.end + 'T00:00:00Z',
              };
          }
      } else {
          updatedProjects.forEach((p: Project) => {
              if (p.tasks && updateTree(p.tasks)) {
                  const tasksMaxEnd = getMaxEndDate(p.tasks);
                  const currentProjectEnd = new Date(p.projectEndDate || 0).getTime();
                  if (tasksMaxEnd > currentProjectEnd) {
                      p.projectEndDate = new Date(tasksMaxEnd).toISOString();
                  }
              }
          });
      }
      
      setLocalProjects(updatedProjects);
      setSelectedItem(null);
      if (onDataChange) {
          onDataChange(updatedProjects);
      }
  };

  // --- 4. Rendu Graphique ---

  const renderDependencies = () => {
      if (!showDependencies) return null;

      const paths: React.ReactElement[] = [];
      const rowMap = new Map<string, GanttRow>(allRows.map(r => [r.id, r]));
      const rowYMap = new Map<string, number>();
      visibleRows.forEach((row, index) => rowYMap.set(row.id, index * ROW_HEIGHT + (ROW_HEIGHT / 2)));

      const getVisibleAnchor = (id: string): { id: string, y: number, row: GanttRow } | null => {
          let currentId: string | undefined = id;
          while (currentId) {
              if (rowYMap.has(currentId)) {
                  return { id: currentId, y: rowYMap.get(currentId)!, row: rowMap.get(currentId)! };
              }
              const currentRow = rowMap.get(currentId);
              currentId = currentRow?.parentId;
          }
          return null;
      };

      const drawnDependencies = new Set<string>();

      allRows.forEach(row => {
          const predecessors = [
              ...(row.data.predecessorIds || []),
              ...(row.data.dependencyIds || [])
          ];
          
          if (!visibleRows.find(r => r.id === row.id) && predecessors.length > 0) {
             return; 
          }

          if (predecessors.length > 0) {
              const targetAnchor = getVisibleAnchor(row.id);
              if (!targetAnchor) return; 

              predecessors.forEach(predId => {
                  const sourceAnchor = getVisibleAnchor(predId);
                  if (!sourceAnchor) return;

                  const key = `${sourceAnchor.id}-${targetAnchor.id}`;
                  if (sourceAnchor.id === targetAnchor.id || drawnDependencies.has(key)) return;
                  drawnDependencies.add(key);

                  const startX = getXPosition(sourceAnchor.row.endDate);
                  const endX = getXPosition(targetAnchor.row.startDate);
                  const startY = sourceAnchor.y;
                  const endY = targetAnchor.y;

                  const isConflict = sourceAnchor.row.endDate.getTime() > targetAnchor.row.startDate.getTime();
                  const midX = (startX + endX) / 2;
                  const controlX = isConflict ? startX + 20 : midX; 

                  const path = `M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`;
                  const strokeColor = isConflict ? "#ef4444" : "#94a3b8"; 
                  const strokeWidth = isConflict ? "2.5" : "1.5";
                  const opacity = isConflict ? "1" : "0.4";

                  paths.push(
                      <path 
                        key={key} 
                        d={path} 
                        fill="none" 
                        stroke={strokeColor} 
                        strokeWidth={strokeWidth} 
                        markerEnd={isConflict ? "url(#arrowhead-red)" : "url(#arrowhead)"}
                        className={`transition-all duration-200 hover:stroke-blue-600 hover:opacity-100 hover:stroke-[2.5px] z-10`}
                        style={{ opacity }}
                      />
                  );
              });
          }
      });

      return paths;
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden shadow-sm border border-slate-200 font-sans text-slate-700 text-xs select-none relative">
      
      {/* Toolbar */}
      <div className="flex justify-between items-center p-2 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-4">
             <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2"><Calendar size={16}/> Diagramme de Gantt</h3>
             <div className="flex items-center bg-white border border-slate-300 rounded-md shadow-sm p-0.5">
                 <button className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-50" onClick={() => setZoomIndex(prev => Math.max(0, prev - 1))} disabled={zoomIndex === 0}><ZoomOut size={14}/></button>
                 <span className="px-3 font-medium min-w-[140px] text-center text-slate-600">{currentZoom.label}</span>
                 <button className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-50" onClick={() => setZoomIndex(prev => Math.min(ZOOM_LEVELS.length - 1, prev + 1))} disabled={zoomIndex === ZOOM_LEVELS.length - 1}><ZoomIn size={14}/></button>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <button 
                onClick={() => setShowBaseline(!showBaseline)} 
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${showBaseline ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'}`}
             >
                 <History size={14} />
                 {showBaseline ? 'Masquer Suivi' : 'Mode Suivi'}
             </button>
             
             <div className="relative" ref={optionsRef}>
                <button 
                    onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                    className="flex items-center gap-1 bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-md hover:bg-slate-50 text-xs font-medium transition-colors shadow-sm"
                >
                    <MoreVertical size={14} /> Options
                </button>
                {isOptionsOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-md shadow-lg z-50 py-1">
                        <button 
                            onClick={() => { setShowDependencies(!showDependencies); setIsOptionsOpen(false); }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2"
                        >
                            {showDependencies ? <CheckSquare size={14} className="text-blue-600"/> : <Square size={14} className="text-slate-400"/>}
                            Afficher les dépendances
                        </button>
                    </div>
                )}
             </div>
          </div>
      </div>

      {/* Main Content with Fixed Header + Scrollable Body */}
      <div className="flex flex-col flex-grow overflow-hidden">
          {/* Header Area */}
          <div className="flex flex-shrink-0 border-b border-slate-200 bg-slate-50 h-[50px]">
               {/* Fixed Sidebar Header */}
               <div className="flex items-center font-semibold text-slate-600 border-r border-slate-200 flex-shrink-0" style={{ width: SIDEBAR_WIDTH }}>
                    <div className="w-16 px-3 text-center border-r border-slate-200">#</div>
                    <div className="flex-grow px-3 border-r border-slate-200">Projets et Tâches</div>
                    <div className="w-20 px-2 text-center border-r border-slate-200">Début</div>
                    <div className="w-20 px-2 text-center">Fin</div>
               </div>
               {/* Scrollable Timeline Header */}
               <div ref={headerRef} className="overflow-hidden flex-grow relative bg-white">
                   <div className="relative h-full" style={{ width: totalWidth + HEADER_BUFFER + 100 }}>
                        {/* Major Rows (Top) */}
                        {headerBlocks.major.map((block, i) => (
                             <div key={`major-${i}`} 
                                className="absolute top-0 h-1/2 border-l border-slate-300 flex items-center justify-center bg-slate-100/50 font-bold text-slate-600 text-[10px] uppercase tracking-wider z-10"
                                style={{ left: block.left, width: block.width }}>
                                {block.label}
                             </div>
                        ))}
                        {/* Minor Rows (Bottom) */}
                        {headerBlocks.minor.map((block, i) => (
                             <div key={`minor-${i}`}
                                className="absolute bottom-0 h-1/2 border-l border-slate-200 flex items-center justify-center text-[10px] text-slate-500 font-medium"
                                style={{ left: block.left, width: block.width }}>
                                {block.label}
                             </div>
                        ))}

                        {/* Today Indicator in Header */}
                        <div className="absolute top-0 bottom-0 border-l border-red-400 z-30 pointer-events-none" style={{ left: getXPosition(new Date()) }}>
                            <div className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-b-sm absolute top-0 transform -translate-x-1/2 shadow-sm font-bold">Aujourd'hui</div>
                        </div>
                   </div>
               </div>
               {/* Spacer to align with vertical scrollbar */}
               <div style={{ width: scrollbarWidth }} className="flex-shrink-0 bg-slate-50 border-b border-slate-200"></div>
          </div>

          {/* Scrollable Body Area (Sidebar + Timeline synchronized) */}
          <div className="flex flex-grow overflow-hidden relative">
               <div ref={verticalScrollContainerRef} className="flex-grow overflow-y-auto overflow-x-hidden flex">
                   {/* Sidebar Body */}
                   <div className="flex-shrink-0 border-r border-slate-200 bg-white" style={{ width: SIDEBAR_WIDTH }}>
                        {visibleRows.map((row) => (
                            <div 
                                key={row.id} 
                                className={`flex items-center border-b border-slate-100 hover:bg-slate-50 transition-colors group relative ${row.type === 'project' ? 'bg-slate-50/50' : ''} ${selectedItem?.id === row.id ? 'bg-blue-50' : ''}`} 
                                style={{ height: ROW_HEIGHT }}
                                onClick={(e) => handleRowClick(e, row)}
                            >
                                {/* WBS Column */}
                                <div className="w-16 px-2 text-center text-slate-400 font-mono text-[10px] truncate flex-shrink-0">{row.wbs}</div>
                                
                                {/* Name Column with Indentation and Expand Button */}
                                <div className="flex-grow px-2 flex items-center border-r border-transparent overflow-hidden relative">
                                    <div className="flex items-center flex-1 min-w-0">
                                        {/* Indentation Spacer */}
                                        <div style={{ width: row.level * 16, flexShrink: 0 }}></div>

                                        {/* Expand/Collapse Button Container */}
                                        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mr-1 z-50 relative">
                                            {row.hasChildren ? (
                                                <button 
                                                    onClick={(e) => { 
                                                        e.preventDefault();
                                                        e.stopPropagation(); 
                                                        toggleExpand(row.id); 
                                                    }} 
                                                    className="w-5 h-5 flex items-center justify-center bg-white hover:bg-blue-50 border border-slate-300 rounded text-slate-600 hover:text-blue-600 transition-colors shadow-sm focus:outline-none cursor-pointer"
                                                    aria-label={row.expanded ? "Replier" : "Déplier"}
                                                >
                                                    {row.expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                                </button>
                                            ) : (
                                                <GitCommitVertical size={14} className="text-slate-300 opacity-50"/>
                                            )}
                                        </div>
                                        
                                        {/* Project/Task Name */}
                                        <span className={`truncate cursor-pointer pl-1 ${row.type === 'project' ? 'font-bold text-slate-800' : 'text-slate-600'}`} title={row.name}>
                                            {row.name}
                                        </span>
                                    </div>
                                </div>

                                {/* Date Columns */}
                                <div className="w-20 px-2 text-center text-slate-500 text-[10px] font-mono flex-shrink-0">
                                    {formatDateFR(row.startDate)}
                                </div>
                                <div className="w-20 px-2 text-center text-slate-500 text-[10px] font-mono flex-shrink-0">
                                    {formatDateFR(row.endDate)}
                                </div>
                            </div>
                        ))}
                        {/* Spacer to match height with timeline */}
                        <div style={{ height: 20 }}></div>
                   </div>

                   {/* Timeline Body */}
                   <div ref={scrollContainerRef} onScroll={handleHorizontalScroll} className="flex-grow overflow-x-auto overflow-y-hidden bg-white">
                        <div className="relative" style={{ width: totalWidth + HEADER_BUFFER, height: visibleRows.length * ROW_HEIGHT }}>
                            
                            {/* Zebra Striped Background (based on Minor Blocks) */}
                            <div className="absolute inset-0 pointer-events-none h-full">
                                {headerBlocks.minor.map((block, i) => (
                                    <div key={`grid-col-${i}`} 
                                         className={`absolute top-0 bottom-0 border-l border-slate-100 ${block.isEven ? 'bg-white' : 'bg-slate-50/80'}`} 
                                         style={{ left: block.left, width: block.width }}>
                                    </div>
                                ))}
                                {/* Major Grid Lines (Darker) */}
                                {headerBlocks.major.map((block, i) => (
                                     <div key={`grid-major-${i}`} className="absolute top-0 bottom-0 border-l border-slate-200" style={{ left: block.left }}></div>
                                ))}
                                {/* Today Line Body */}
                                <div className="absolute top-0 bottom-0 border-l border-red-400 z-30 pointer-events-none" style={{ left: getXPosition(new Date()) }}></div>
                            </div>

                            {/* Dependencies SVG Layer */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                                <defs>
                                    <marker id="arrowhead" markerWidth="5" markerHeight="5" refX="5" refY="2.5" orient="auto">
                                        <path d="M0,0 L5,2.5 L0,5" fill="#94a3b8" />
                                    </marker>
                                    <marker id="arrowhead-red" markerWidth="5" markerHeight="5" refX="5" refY="2.5" orient="auto">
                                        <path d="M0,0 L5,2.5 L0,5" fill="#ef4444" />
                                    </marker>
                                </defs>
                                {renderDependencies()}
                            </svg>

                            {/* Rows */}
                            {visibleRows.map((row, index) => {
                                const xStart = getXPosition(row.startDate);
                                const width = Math.max(getXPosition(row.endDate) - xStart, Math.max(2, dayWidth));
                                
                                let baselineX = 0;
                                let baselineWidth = 0;
                                let isDelayed = false;
                                
                                if (showBaseline && row.baselineStartDate && row.baselineEndDate) {
                                    baselineX = getXPosition(row.baselineStartDate);
                                    baselineWidth = Math.max(getXPosition(row.baselineEndDate) - baselineX, Math.max(2, dayWidth));
                                    isDelayed = row.endDate.getTime() > row.baselineEndDate.getTime();
                                }

                                return (
                                    <div key={row.id} className={`absolute w-full border-b border-slate-100/50 hover:bg-blue-50/20 transition-colors ${selectedItem?.id === row.id ? 'bg-blue-50/30' : ''}`} style={{ top: index * ROW_HEIGHT, height: ROW_HEIGHT }}>
                                        
                                        {/* Baseline Ghost Bar (Mode Suivi) */}
                                        {showBaseline && row.baselineStartDate && (
                                            <>
                                                <div 
                                                    className="absolute h-2 top-1/2 mt-2 bg-slate-300/50 rounded-sm border border-slate-300 z-0"
                                                    style={{ left: baselineX, width: baselineWidth }}
                                                ></div>
                                                {/* Delay Connector */}
                                                {isDelayed && (
                                                    <div 
                                                        className="absolute h-2 top-1/2 mt-2 border-t border-b border-red-200 z-0 opacity-60"
                                                        style={{ 
                                                            left: baselineX + baselineWidth, 
                                                            width: (xStart + width) - (baselineX + baselineWidth),
                                                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #fecaca 2px, #fecaca 4px)'
                                                        }}
                                                    ></div>
                                                )}
                                            </>
                                        )}

                                        {/* Milestone (Diamond) */}
                                        {row.type === 'milestone' ? (
                                            <div 
                                                className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-amber-400 rotate-45 border-2 border-white shadow-sm z-20 cursor-pointer hover:scale-125 transition-transform"
                                                style={{ left: xStart }}
                                                onMouseMove={(e) => handleMouseMove(e, row)}
                                                onMouseLeave={() => setTooltip(null)}
                                                onClick={(e) => handleRowClick(e, row)}
                                            ></div>
                                        ) : (
                                            /* Task/Phase Bar */
                                            <div 
                                                className={`absolute top-1/2 transform -translate-y-1/2 h-5 rounded-sm shadow-sm z-20 cursor-pointer hover:ring-2 hover:ring-white/50 transition-all flex items-center overflow-hidden ${row.colorClass} ${showBaseline ? '-mt-2' : ''}`}
                                                style={{ 
                                                    left: xStart, 
                                                    width,
                                                    height: row.hasChildren ? 10 : 20,
                                                    borderRadius: row.hasChildren ? '2px' : '4px',
                                                }}
                                                onMouseMove={(e) => handleMouseMove(e, row)}
                                                onMouseLeave={() => setTooltip(null)}
                                                onClick={(e) => handleRowClick(e, row)}
                                            >
                                                {/* Progress bar inside */}
                                                {row.progress > 0 && (
                                                    <div className="h-full bg-white/20" style={{ width: `${row.progress}%` }}></div>
                                                )}
                                            </div>
                                        )}

                                        {/* Label next to bar */}
                                        <div 
                                            className="absolute top-1/2 transform -translate-y-1/2 text-[10px] font-medium text-slate-500 ml-2 whitespace-nowrap z-10 pointer-events-none flex items-center gap-1"
                                            style={{ left: xStart + (row.type === 'milestone' ? 10 : width) }}
                                        >
                                            {row.type !== 'milestone' ? (
                                                <>
                                                    <span className={showBaseline ? '-mt-3 block' : ''}>{row.name}</span>
                                                </>
                                            ) : (
                                                <span>{row.name}</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                   </div>
               </div>

               {/* Side Edit Panel (Drawer) */}
               <div className={`absolute top-0 right-0 h-full w-80 bg-white shadow-2xl border-l border-slate-200 z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${selectedItem ? 'translate-x-0' : 'translate-x-full'}`}>
                    {selectedItem && editFormData && (
                        <>
                            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-slate-800 truncate pr-2" title={selectedItem.name}>Édition</h3>
                                <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
                            </div>
                            <div className="p-4 space-y-4 flex-grow overflow-y-auto">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nom</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-slate-300 rounded p-2 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                        value={editFormData.name}
                                        onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Début</label>
                                        <input 
                                            type="date" 
                                            className="w-full border border-slate-300 rounded p-2 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                            value={editFormData.start}
                                            onChange={e => setEditFormData({...editFormData, start: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fin</label>
                                        <input 
                                            type="date" 
                                            className="w-full border border-slate-300 rounded p-2 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                            value={editFormData.end}
                                            onChange={e => setEditFormData({...editFormData, end: e.target.value})}
                                        />
                                    </div>
                                </div>
                                {selectedItem.type !== 'milestone' && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Progression ({editFormData.progress}%)</label>
                                        <input 
                                            type="range" 
                                            min="0" max="100" 
                                            className="w-full accent-blue-600"
                                            value={editFormData.progress}
                                            onChange={e => setEditFormData({...editFormData, progress: parseInt(e.target.value)})}
                                        />
                                    </div>
                                )}
                                
                                <div className="bg-blue-50 p-3 rounded border border-blue-100 text-xs text-blue-800">
                                    <p className="font-semibold mb-1">Informations</p>
                                    <p>Type: {selectedItem.type}</p>
                                    <p>Durée: {selectedItem.duration} jours</p>
                                    {selectedItem.assignee && <p>Responsable: {selectedItem.assignee}</p>}
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
                                <button onClick={() => setSelectedItem(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded transition-colors">Annuler</button>
                                <button onClick={handleSaveEdit} className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-colors"><Save size={16}/> Enregistrer</button>
                            </div>
                        </>
                    )}
               </div>
          </div>
      </div>

      {tooltip && tooltip.visible && createPortal(
          <div style={{ position: 'fixed', top: tooltip.y, left: tooltip.x, zIndex: 9999, pointerEvents: 'none' }}>
            {tooltip.content}
          </div>,
          document.body
      )}
    </div>
  );
};

export default AdvancedGanttChart;