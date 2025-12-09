
import { Project, ProjectTask } from '../types';

export const analyzeCriticalPath = (projects: Project[]): Set<string> => {
    const projectMap = new Map<string, Project>(projects.map(p => [p.id, p]));
    const criticalPathSet = new Set<string>();
    const memo = new Map<string, { path: string[], endDate: number }>();

    const getLongestPath = (projectId: string, visited: Set<string>): { path: string[], endDate: number } => {
        if (visited.has(projectId)) return { path: [], endDate: 0 };
        if (memo.has(projectId)) return memo.get(projectId)!;

        visited.add(projectId);
        const project = projectMap.get(projectId);
        if (!project) return { path: [], endDate: 0 };

        const currentEndDate = project.projectEndDate ? new Date(project.projectEndDate).getTime() : 0;
        let maxPredecessorPath: { path: string[], endDate: number } = { path: [], endDate: 0 };

        if (project.predecessorIds && project.predecessorIds.length > 0) {
            for (const predId of project.predecessorIds) {
                const predResult = getLongestPath(predId, new Set(visited));
                if (predResult.endDate > maxPredecessorPath.endDate) {
                    maxPredecessorPath = predResult;
                }
            }
        }

        const result = {
            path: [...maxPredecessorPath.path, projectId],
            endDate: currentEndDate
        };

        memo.set(projectId, result);
        return result;
    };

    let globalCriticalPath: string[] = [];
    let maxGlobalDate = 0;

    projects.forEach(p => {
        const result = getLongestPath(p.id, new Set());
        if (result.endDate > maxGlobalDate) {
            maxGlobalDate = result.endDate;
            globalCriticalPath = result.path;
        } else if (result.endDate === maxGlobalDate && result.path.length > globalCriticalPath.length) {
            globalCriticalPath = result.path;
        }
    });

    globalCriticalPath.forEach(id => criticalPathSet.add(id));
    return criticalPathSet;
};

export const hasCycle = (projects: Project[], sourceId: string, targetId: string): boolean => {
    const projectMap = new Map<string, Project>(projects.map(p => [p.id, p]));
    
    const visit = (currentId: string, visited: Set<string>): boolean => {
        if (currentId === targetId) return true;
        if (visited.has(currentId)) return false;
        
        visited.add(currentId);
        const project = projectMap.get(currentId);
        
        if (project && project.predecessorIds) {
            for (const predId of project.predecessorIds) {
                if (visit(predId, visited)) return true;
            }
        }
        return false;
    };
    return visit(sourceId, new Set());
};

export const analyzeTaskCriticalPath = (tasks: ProjectTask[]): Set<string> => {
    // 1. Aplatir la structure pour un accès facile
    const flatTasks: ProjectTask[] = [];
    const traverse = (t: ProjectTask[]) => {
        t.forEach(task => {
            flatTasks.push(task);
            if (task.children) traverse(task.children);
        });
    };
    traverse(tasks);

    const taskMap = new Map<string, ProjectTask>(flatTasks.map(t => [t.id, t]));
    const criticalPathSet = new Set<string>();
    const memo = new Map<string, { path: string[], endDate: number }>();

    // Recherche récursive du chemin le plus long se terminant par une tâche donnée
    // (en remontant les dépendances)
    const getLongestPath = (taskId: string, visited: Set<string>): { path: string[], endDate: number } => {
        if (visited.has(taskId)) return { path: [], endDate: 0 };
        if (memo.has(taskId)) return memo.get(taskId)!;

        visited.add(taskId);
        const task = taskMap.get(taskId);
        if (!task) return { path: [], endDate: 0 };

        const currentEndDate = new Date(task.endDate).getTime();
        let maxPredecessorPath: { path: string[], endDate: number } = { path: [], endDate: 0 };

        if (task.dependencyIds && task.dependencyIds.length > 0) {
            for (const depId of task.dependencyIds) {
                const depResult = getLongestPath(depId, new Set(visited));
                // On cherche le chemin qui pousse la date de fin le plus loin
                // Note: Dans un Gantt strict, la date de début dépend de la date de fin du prédécesseur.
                // Ici, on utilise la date de fin effective de la tâche comme métrique de "longueur".
                if (depResult.endDate > maxPredecessorPath.endDate) {
                    maxPredecessorPath = depResult;
                }
            }
        }
        
        const result = {
            path: [...maxPredecessorPath.path, taskId],
            endDate: currentEndDate
        };
        memo.set(taskId, result);
        return result;
    };

    // Trouver la tâche qui termine le plus tard dans tout le projet
    let maxDate = 0;
    let criticalPaths: string[][] = [];

    flatTasks.forEach(t => {
        const res = getLongestPath(t.id, new Set());
        if (res.endDate > maxDate) {
            maxDate = res.endDate;
            criticalPaths = [res.path];
        } else if (res.endDate === maxDate) {
             criticalPaths.push(res.path);
        }
    });

    criticalPaths.forEach(path => path.forEach(id => criticalPathSet.add(id)));
    return criticalPathSet;
};
