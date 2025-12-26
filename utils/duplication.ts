import { Project, Activity } from '../types';
import { DuplicateOptions } from '../components/ui/BulkDuplicateModal';

/**
 * Duplique un projet avec les options spécifiées
 */
export function duplicateProject(
  project: Project,
  options: DuplicateOptions,
  copyIndex: number = 1
): Project {
  const { prefix, suffix, adjustDates, daysOffset } = options;

  // Générer un nouvel ID
  const timestamp = Date.now();
  const newId = `${project.id}-copy-${timestamp}-${copyIndex}`;

  // Générer un nouveau projectId
  const match = project.projectId.match(/^(P\d{2}-)(\d{3})$/);
  let newProjectId = project.projectId;
  if (match) {
    const prefixPart = match[1];
    const numberPart = parseInt(match[2], 10);
    newProjectId = `${prefixPart}${String(numberPart + copyIndex).padStart(3, '0')}`;
  }

  // Nouveau titre avec préfixe/suffixe
  const newTitle = `${prefix || ''}${project.title}${suffix || ''}`;

  // Ajuster les dates si nécessaire
  const adjustDate = (dateStr?: string): string | undefined => {
    if (!dateStr || !adjustDates || !daysOffset) return dateStr;

    const date = new Date(dateStr);
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString();
  };

  // Dupliquer les jalons
  const duplicatedMilestones = project.milestones?.map(milestone => ({
    ...milestone,
    id: `${milestone.id}-copy-${timestamp}`,
    date: adjustDate(milestone.date) || milestone.date,
    initialDate: adjustDate(milestone.initialDate) || milestone.initialDate,
    completed: false, // Réinitialiser le statut
    history: [], // Effacer l'historique
  }));

  // Dupliquer les tâches
  const duplicatedTasks = project.tasks?.map(task => ({
    ...task,
    id: `${task.id}-copy-${timestamp}`,
    startDate: adjustDate(task.startDate) || task.startDate,
    endDate: adjustDate(task.endDate) || task.endDate,
    progress: 0, // Réinitialiser la progression
  }));

  return {
    ...project,
    id: newId,
    projectId: newProjectId,
    title: newTitle,
    projectStartDate: adjustDate(project.projectStartDate),
    projectEndDate: adjustDate(project.projectEndDate),
    goLiveDate: adjustDate(project.goLiveDate),
    endDate: adjustDate(project.endDate),
    milestones: duplicatedMilestones,
    tasks: duplicatedTasks,
    fdrHistory: [], // Effacer l'historique FDR
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Réinitialiser certains champs financiers
    budgetCommitted: undefined,
    validatedPurchaseOrders: undefined,
    completedPV: undefined,
    internalWorkloadConsumed: undefined,
    externalWorkloadConsumed: undefined,
  };
}

/**
 * Duplique une activité avec les options spécifiées
 */
export function duplicateActivity(
  activity: Activity,
  options: DuplicateOptions,
  copyIndex: number = 1
): Activity {
  const { prefix, suffix, adjustDates, daysOffset } = options;

  // Générer un nouvel ID
  const timestamp = Date.now();
  const newId = `${activity.id}-copy-${timestamp}-${copyIndex}`;

  // Générer un nouveau activityId
  const match = activity.activityId.match(/^(ACT-)(\d{3})$/);
  let newActivityId = activity.activityId;
  if (match) {
    const prefixPart = match[1];
    const numberPart = parseInt(match[2], 10);
    newActivityId = `${prefixPart}${String(numberPart + copyIndex).padStart(3, '0')}`;
  }

  // Nouveau titre avec préfixe/suffixe
  const newTitle = `${prefix || ''}${activity.title}${suffix || ''}`;

  // Ajuster les dates si nécessaire
  const adjustDate = (dateStr?: string): string | undefined => {
    if (!dateStr || !adjustDates || !daysOffset) return dateStr;

    const date = new Date(dateStr);
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString();
  };

  return {
    ...activity,
    id: newId,
    activityId: newActivityId,
    title: newTitle,
    startDate: adjustDate(activity.startDate),
    endDatePlanned: adjustDate(activity.endDatePlanned),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Réinitialiser la charge consommée
    consumedWorkload: undefined,
    // Réinitialiser certains champs financiers
    budgetCommitted: undefined,
    validatedPurchaseOrders: undefined,
    completedPV: undefined,
  };
}

/**
 * Duplique plusieurs projets
 */
export function duplicateProjects(
  projects: Project[],
  projectIds: string[],
  options: DuplicateOptions
): Project[] {
  const newProjects: Project[] = [];

  projectIds.forEach(projectId => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    for (let i = 1; i <= options.copiesCount; i++) {
      const duplicated = duplicateProject(project, options, i);
      newProjects.push(duplicated);
    }
  });

  return newProjects;
}

/**
 * Duplique plusieurs activités
 */
export function duplicateActivities(
  activities: Activity[],
  activityIds: string[],
  options: DuplicateOptions
): Activity[] {
  const newActivities: Activity[] = [];

  activityIds.forEach(activityId => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    for (let i = 1; i <= options.copiesCount; i++) {
      const duplicated = duplicateActivity(activity, options, i);
      newActivities.push(duplicated);
    }
  });

  return newActivities;
}
