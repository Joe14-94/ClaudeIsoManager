
import { useMemo } from 'react';
import { Project, ProjectTask, Resource } from '../types';
import { analyzeTaskCriticalPath } from '../utils/projectAnalysis';

export interface GanttRow {
  id: string;
  type: 'project' | 'phase' | 'task' | 'milestone';
  name: string;
  wbs: string;
  startDate: Date;
  endDate: Date;
  baselineStartDate?: Date;
  baselineEndDate?: Date;
  duration: number;
  progress: number;
  status?: string;
  assignee?: string;
  level: number;
  expanded: boolean;
  data: any;
  parentId?: string;
  visible: boolean;
  hasChildren: boolean;
  colorClass: string;
  dependencyIds?: string[];
  isCritical?: boolean;
}

const getPhaseColor = (index: number, type: string, isCritical: boolean): string => {
    if (isCritical) return 'bg-red-300';
    if (type === 'project') return 'bg-indigo-300';
    const colors = ['bg-blue-300', 'bg-sky-300', 'bg-cyan-300', 'bg-teal-300'];
    return colors[index % colors.length];
};

export const useGanttData = (
    projects: Project[],
    resources: Resource[],
    expandedIds: Set<string>,
    initialDatesMap: Map<string, { start: Date, end: Date }>
) => {
    
  return useMemo(() => {
    const result: GanttRow[] = [];
    
    const processTask = (
        task: ProjectTask, 
        level: number, 
        parentId: string, 
        wbsPrefix: string, 
        rootIndex: number,
        criticalTasks: Set<string>
    ): GanttRow[] => {
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

        const isCritical = criticalTasks.has(task.id);
        const colorClass = getPhaseColor(rootIndex, type, isCritical);
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
            colorClass,
            dependencyIds: task.dependencyIds,
            isCritical
        });

        if (task.children && task.children.length > 0) {
            task.children.forEach((child, idx) => {
                const childWbs = `${wbsPrefix}.${idx + 1}`;
                taskRows.push(...processTask(child, level + 1, task.id, childWbs, rootIndex, criticalTasks));
            });
        }
        return taskRows;
    };

    projects.forEach((project, projIndex) => {
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
        
        // Analyse du chemin critique pour les tâches de ce projet
        const criticalTasks = project.tasks ? analyzeTaskCriticalPath(project.tasks) : new Set<string>();

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
            colorClass: 'bg-indigo-300',
            isCritical: false // Project level criticality handled separately if needed
        });

        if (project.tasks) {
            project.tasks.forEach((task, taskIdx) => {
                const taskWbs = `${wbs}.${taskIdx + 1}`;
                result.push(...processTask(task, 1, project.id, taskWbs, taskIdx, criticalTasks));
            });
        }
    });
    return result;
  }, [projects, expandedIds, resources, initialDatesMap]);
};
