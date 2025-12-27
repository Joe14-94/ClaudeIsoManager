/**
 * Velocity Tracking - Calculs et métriques de vélocité d'équipe
 * Mesure la quantité de travail complétée par période (sprint/semaine/mois)
 */

import { Project, Activity, ProjectTask } from '../types';

export interface VelocityDataPoint {
  period: string; // Label de la période (ex: "Sprint 1", "Semaine 1", "Janvier 2025")
  startDate: Date;
  endDate: Date;
  plannedWork: number; // Travail planifié pour cette période
  completedWork: number; // Travail réellement complété
  velocity: number; // Vélocité = travail complété
  cumulativePlanned: number; // Planifié cumulatif
  cumulativeCompleted: number; // Complété cumulatif
}

export interface VelocityMetrics {
  dataPoints: VelocityDataPoint[];
  averageVelocity: number;
  standardDeviation: number;
  predictedCompletionDate: Date | null;
  velocityTrend: 'increasing' | 'stable' | 'decreasing';
  consistency: number; // 0-100, basé sur l'écart-type
}

export type PeriodType = 'sprint' | 'week' | 'month';

/**
 * Calcule la vélocité pour des projets
 */
export function calculateProjectVelocity(
  projects: Project[],
  periodType: PeriodType = 'sprint',
  periodDuration: number = 14 // durée en jours (14 pour sprint de 2 semaines)
): VelocityMetrics {
  // Trouver la date de début et de fin globale
  const allDates = projects
    .filter(p => p.projectStartDate && p.projectEndDate)
    .flatMap(p => [new Date(p.projectStartDate!), new Date(p.projectEndDate!)]);

  if (allDates.length === 0) {
    return {
      dataPoints: [],
      averageVelocity: 0,
      standardDeviation: 0,
      predictedCompletionDate: null,
      velocityTrend: 'stable',
      consistency: 0,
    };
  }

  const startDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const endDate = new Date();

  // Générer les périodes
  const periods: VelocityDataPoint[] = [];
  let currentDate = new Date(startDate);
  let periodIndex = 1;

  while (currentDate < endDate) {
    const periodEnd = new Date(currentDate);
    periodEnd.setDate(periodEnd.getDate() + periodDuration);

    const periodLabel = getPeriodLabel(periodType, periodIndex, currentDate);

    // Calculer le travail pour cette période
    const periodData = calculatePeriodWork(projects, currentDate, periodEnd);

    const cumulativePlanned = periods.reduce((sum, p) => sum + p.plannedWork, 0) + periodData.plannedWork;
    const cumulativeCompleted = periods.reduce((sum, p) => sum + p.completedWork, 0) + periodData.completedWork;

    periods.push({
      period: periodLabel,
      startDate: new Date(currentDate),
      endDate: new Date(periodEnd),
      plannedWork: periodData.plannedWork,
      completedWork: periodData.completedWork,
      velocity: periodData.completedWork,
      cumulativePlanned,
      cumulativeCompleted,
    });

    currentDate = periodEnd;
    periodIndex++;
  }

  // Calculer les métriques
  const velocities = periods.map(p => p.velocity).filter(v => v > 0);
  const averageVelocity = velocities.length > 0 ? velocities.reduce((a, b) => a + b, 0) / velocities.length : 0;

  const standardDeviation = calculateStandardDeviation(velocities);
  const consistency = calculateConsistency(standardDeviation, averageVelocity);
  const velocityTrend = calculateTrend(periods);
  const predictedCompletionDate = predictCompletion(periods, projects);

  return {
    dataPoints: periods,
    averageVelocity,
    standardDeviation,
    predictedCompletionDate,
    velocityTrend,
    consistency,
  };
}

/**
 * Calcule la vélocité pour des activités
 */
export function calculateActivityVelocity(
  activities: Activity[],
  periodType: PeriodType = 'week',
  periodDuration: number = 7
): VelocityMetrics {
  // Logique similaire aux projets mais adaptée aux activités
  const allDates = activities
    .filter(a => a.startDate && a.endDatePlanned)
    .flatMap(a => [new Date(a.startDate!), new Date(a.endDatePlanned!)]);

  if (allDates.length === 0) {
    return {
      dataPoints: [],
      averageVelocity: 0,
      standardDeviation: 0,
      predictedCompletionDate: null,
      velocityTrend: 'stable',
      consistency: 0,
    };
  }

  const startDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const endDate = new Date();

  const periods: VelocityDataPoint[] = [];
  let currentDate = new Date(startDate);
  let periodIndex = 1;

  while (currentDate < endDate) {
    const periodEnd = new Date(currentDate);
    periodEnd.setDate(periodEnd.getDate() + periodDuration);

    const periodLabel = getPeriodLabel(periodType, periodIndex, currentDate);

    const periodData = calculateActivityPeriodWork(activities, currentDate, periodEnd);

    const cumulativePlanned = periods.reduce((sum, p) => sum + p.plannedWork, 0) + periodData.plannedWork;
    const cumulativeCompleted = periods.reduce((sum, p) => sum + p.completedWork, 0) + periodData.completedWork;

    periods.push({
      period: periodLabel,
      startDate: new Date(currentDate),
      endDate: new Date(periodEnd),
      plannedWork: periodData.plannedWork,
      completedWork: periodData.completedWork,
      velocity: periodData.completedWork,
      cumulativePlanned,
      cumulativeCompleted,
    });

    currentDate = periodEnd;
    periodIndex++;
  }

  const velocities = periods.map(p => p.velocity).filter(v => v > 0);
  const averageVelocity = velocities.length > 0 ? velocities.reduce((a, b) => a + b, 0) / velocities.length : 0;
  const standardDeviation = calculateStandardDeviation(velocities);
  const consistency = calculateConsistency(standardDeviation, averageVelocity);
  const velocityTrend = calculateTrend(periods);

  return {
    dataPoints: periods,
    averageVelocity,
    standardDeviation,
    predictedCompletionDate: null,
    velocityTrend,
    consistency,
  };
}

/**
 * Génère le label d'une période
 */
function getPeriodLabel(periodType: PeriodType, index: number, date: Date): string {
  switch (periodType) {
    case 'sprint':
      return `Sprint ${index}`;
    case 'week':
      return `Semaine ${index}`;
    case 'month':
      return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    default:
      return `Période ${index}`;
  }
}

/**
 * Calcule le travail pour une période donnée (projets)
 */
function calculatePeriodWork(
  projects: Project[],
  startDate: Date,
  endDate: Date
): { plannedWork: number; completedWork: number } {
  let plannedWork = 0;
  let completedWork = 0;

  projects.forEach(project => {
    if (!project.tasks || project.tasks.length === 0) return;

    project.tasks.forEach(task => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);

      // Vérifier si la tâche chevauche cette période
      if (taskStart <= endDate && taskEnd >= startDate) {
        // Calculer la durée de la tâche
        const taskDuration = (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24);

        // Travail planifié = durée de la tâche
        plannedWork += taskDuration;

        // Travail complété = durée * progression
        completedWork += taskDuration * ((task.progress || 0) / 100);
      }
    });
  });

  return { plannedWork, completedWork };
}

/**
 * Calcule le travail pour une période donnée (activités)
 */
function calculateActivityPeriodWork(
  activities: Activity[],
  startDate: Date,
  endDate: Date
): { plannedWork: number; completedWork: number } {
  let plannedWork = 0;
  let completedWork = 0;

  activities.forEach(activity => {
    if (!activity.startDate || !activity.endDatePlanned) return;

    const actStart = new Date(activity.startDate);
    const actEnd = new Date(activity.endDatePlanned);

    // Vérifier si l'activité chevauche cette période
    if (actStart <= endDate && actEnd >= startDate) {
      const workload = activity.workloadInPersonDays || 1;

      // Travail planifié
      plannedWork += workload;

      // Travail complété (basé sur le statut ou la charge consommée)
      if (activity.consumedWorkload) {
        completedWork += activity.consumedWorkload;
      }
    }
  });

  return { plannedWork, completedWork };
}

/**
 * Calcule l'écart-type
 */
function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;

  return Math.sqrt(variance);
}

/**
 * Calcule la consistance (0-100)
 */
function calculateConsistency(stdDev: number, average: number): number {
  if (average === 0) return 0;

  // Coefficient de variation inversé et normalisé
  const cv = stdDev / average;
  const consistency = Math.max(0, Math.min(100, 100 * (1 - cv)));

  return consistency;
}

/**
 * Calcule la tendance de vélocité
 */
function calculateTrend(periods: VelocityDataPoint[]): 'increasing' | 'stable' | 'decreasing' {
  if (periods.length < 3) return 'stable';

  // Prendre les 3 dernières périodes avec vélocité > 0
  const recentPeriods = periods.filter(p => p.velocity > 0).slice(-3);
  if (recentPeriods.length < 3) return 'stable';

  const firstAvg = recentPeriods[0].velocity;
  const lastAvg = recentPeriods[recentPeriods.length - 1].velocity;

  const change = ((lastAvg - firstAvg) / firstAvg) * 100;

  if (change > 10) return 'increasing';
  if (change < -10) return 'decreasing';
  return 'stable';
}

/**
 * Prédit la date de complétion basée sur la vélocité
 */
function predictCompletion(periods: VelocityDataPoint[], projects: Project[]): Date | null {
  if (periods.length === 0) return null;

  const velocities = periods.map(p => p.velocity).filter(v => v > 0);
  if (velocities.length === 0) return null;

  const avgVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length;

  // Calculer le travail restant
  const totalWork = projects.reduce((sum, p) => {
    if (!p.tasks) return sum;
    return sum + p.tasks.reduce((taskSum, t) => {
      const taskStart = new Date(t.startDate);
      const taskEnd = new Date(t.endDate);
      const duration = (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24);
      return taskSum + duration;
    }, 0);
  }, 0);

  const completedWork = periods[periods.length - 1]?.cumulativeCompleted || 0;
  const remainingWork = totalWork - completedWork;

  if (remainingWork <= 0 || avgVelocity === 0) return null;

  // Durée moyenne d'une période
  const avgPeriodDuration = periods.length > 0
    ? (periods[0].endDate.getTime() - periods[0].startDate.getTime()) / (1000 * 60 * 60 * 24)
    : 14;

  const periodsNeeded = Math.ceil(remainingWork / avgVelocity);
  const daysNeeded = periodsNeeded * avgPeriodDuration;

  const predictedDate = new Date();
  predictedDate.setDate(predictedDate.getDate() + daysNeeded);

  return predictedDate;
}
