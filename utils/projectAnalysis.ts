
import { Project } from '../types';

/**
 * Analyse les projets pour identifier le chemin critique.
 * Le chemin critique est la séquence de projets dépendants qui détermine la durée totale la plus longue.
 * Dans ce contexte de portefeuille, nous cherchons la chaîne de dépendances qui se termine le plus tard.
 */
export const analyzeCriticalPath = (projects: Project[]): Set<string> => {
    const projectMap = new Map<string, Project>(projects.map(p => [p.id, p]));
    const criticalPathSet = new Set<string>();

    // 1. Construire le graphe et calculer les dates de fin au plus tôt basées sur les dépendances
    // Note: Ici, les dates sont fixes dans l'objet Project, donc nous validons plutôt la chaîne.
    // Pour trouver le chemin critique "logique" basé sur les dates saisies :
    
    // Fonction récursive pour trouver la profondeur (durée cumulée ou date de fin max) d'un chemin
    // Retourne { path: string[], endDate: number }
    const memo = new Map<string, { path: string[], endDate: number }>();

    const getLongestPath = (projectId: string, visited: Set<string>): { path: string[], endDate: number } => {
        if (visited.has(projectId)) return { path: [], endDate: 0 }; // Cycle détecté, on arrête
        if (memo.has(projectId)) return memo.get(projectId)!;

        visited.add(projectId);
        const project = projectMap.get(projectId);
        if (!project) return { path: [], endDate: 0 };

        const currentEndDate = project.projectEndDate ? new Date(project.projectEndDate).getTime() : 0;
        
        // Trouver les prédécesseurs (ceux dont ce projet dépend)
        // Le chemin critique se construit en remontant les dépendances : 
        // Si A dépend de B, le chemin est B -> A.
        // Ici predecessorIds stocke B dans l'objet A.
        
        let maxPredecessorPath: { path: string[], endDate: number } = { path: [], endDate: 0 };

        if (project.predecessorIds && project.predecessorIds.length > 0) {
            for (const predId of project.predecessorIds) {
                const predResult = getLongestPath(predId, new Set(visited));
                if (predResult.endDate > maxPredecessorPath.endDate) {
                    maxPredecessorPath = predResult;
                }
            }
        }

        // Le chemin actuel inclut ce projet + le meilleur chemin précédent
        // Note: Dans une analyse CPM stricte, on additionne les durées.
        // Ici, avec des dates calendaires fixes, le chemin critique est la chaîne qui aboutit à la date de fin la plus tardive.
        // Si les dates sont incohérentes (ex: A finit après le début de B qui dépend de A), c'est un conflit, mais le chemin reste structurel.
        // Simplification: On considère la chaîne la plus longue en nombre de nœuds qui se termine le plus tard.
        
        const result = {
            path: [...maxPredecessorPath.path, projectId],
            endDate: currentEndDate // La date de fin de la chaîne est la date de fin du dernier élément
        };

        memo.set(projectId, result);
        return result;
    };

    // 2. Trouver la chaîne se terminant le plus tard dans tout le portefeuille
    let globalCriticalPath: string[] = [];
    let maxGlobalDate = 0;

    projects.forEach(p => {
        // On lance l'analyse pour chaque projet comme point final potentiel
        const result = getLongestPath(p.id, new Set());
        if (result.endDate > maxGlobalDate) {
            maxGlobalDate = result.endDate;
            globalCriticalPath = result.path;
        } else if (result.endDate === maxGlobalDate && result.path.length > globalCriticalPath.length) {
            // En cas d'égalité de date, on prend la chaîne la plus longue
            globalCriticalPath = result.path;
        }
    });

    globalCriticalPath.forEach(id => criticalPathSet.add(id));
    return criticalPathSet;
};

/**
 * Vérifie si l'ajout d'une dépendance crée un cycle.
 * targetId dépend de sourceId.
 */
export const hasCycle = (projects: Project[], sourceId: string, targetId: string): boolean => {
    const projectMap = new Map<string, Project>(projects.map(p => [p.id, p]));
    
    const visit = (currentId: string, visited: Set<string>): boolean => {
        if (currentId === targetId) return true; // Cycle trouvé
        if (visited.has(currentId)) return false;
        
        visited.add(currentId);
        const project = projectMap.get(currentId);
        
        // On regarde les prédécesseurs du prédécesseur potentiel
        if (project && project.predecessorIds) {
            for (const predId of project.predecessorIds) {
                if (visit(predId, visited)) return true;
            }
        }
        return false;
    };

    // On vérifie si targetId est déjà un ancêtre de sourceId
    return visit(sourceId, new Set());
};
