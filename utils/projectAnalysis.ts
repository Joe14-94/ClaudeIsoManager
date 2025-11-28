
import { Project } from '../types';

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
