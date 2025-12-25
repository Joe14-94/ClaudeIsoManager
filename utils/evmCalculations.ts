/**
 * Earned Value Management (EVM) Calculations
 * Gestion de la valeur acquise - méthodes de calcul
 */

import { Project } from '../types';

export interface EVMMetrics {
  // Valeurs de base
  pv: number;  // Planned Value (Valeur Planifiée)
  ac: number;  // Actual Cost (Coût Réel)
  ev: number;  // Earned Value (Valeur Acquise)
  bac: number; // Budget at Completion (Budget à l'Achèvement)

  // Écarts
  sv: number;  // Schedule Variance (Écart de Planning) = EV - PV
  cv: number;  // Cost Variance (Écart de Coût) = EV - AC

  // Indices de performance
  spi: number; // Schedule Performance Index = EV / PV
  cpi: number; // Cost Performance Index = EV / AC

  // Prévisions
  eac: number; // Estimate at Completion (Estimation à l'Achèvement)
  etc: number; // Estimate to Complete (Estimation pour Terminer)
  vac: number; // Variance at Completion (Écart à l'Achèvement) = BAC - EAC
  tcpi: number; // To-Complete Performance Index

  // Statut
  scheduleStatus: 'ahead' | 'on-track' | 'behind';
  costStatus: 'under-budget' | 'on-budget' | 'over-budget';

  // Pourcentages
  percentComplete: number;
  percentSpent: number;
}

/**
 * Calcule les métriques EVM pour un projet
 */
export function calculateEVM(project: Project, asOfDate?: Date): EVMMetrics {
  const now = asOfDate || new Date();

  // Budget à l'achèvement (BAC)
  const bac = project.budgetApproved || project.budgetRequested || 0;

  // Coût réel (AC) = Budget engagé
  const ac = project.budgetCommitted || 0;

  // Pourcentage d'avancement du projet
  const percentComplete = calculateProjectProgress(project) / 100;

  // Valeur acquise (EV) = BAC × % Avancement
  const ev = bac * percentComplete;

  // Valeur planifiée (PV) = calculée selon le planning
  const pv = calculatePlannedValue(project, now, bac);

  // Écart de planning (SV) = EV - PV
  const sv = ev - pv;

  // Écart de coût (CV) = EV - AC
  const cv = ev - ac;

  // Indice de performance de planning (SPI) = EV / PV
  const spi = pv > 0 ? ev / pv : 1;

  // Indice de performance de coût (CPI) = EV / AC
  const cpi = ac > 0 ? ev / ac : 1;

  // Estimation à l'achèvement (EAC) = BAC / CPI
  const eac = cpi > 0 ? bac / cpi : bac;

  // Estimation pour terminer (ETC) = EAC - AC
  const etc = eac - ac;

  // Écart à l'achèvement (VAC) = BAC - EAC
  const vac = bac - eac;

  // To-Complete Performance Index (TCPI)
  // TCPI = (BAC - EV) / (BAC - AC)
  const tcpi = (bac - ac) > 0 ? (bac - ev) / (bac - ac) : 1;

  // Statuts
  const scheduleStatus: 'ahead' | 'on-track' | 'behind' =
    spi > 1.05 ? 'ahead' : spi < 0.95 ? 'behind' : 'on-track';

  const costStatus: 'under-budget' | 'on-budget' | 'over-budget' =
    cpi > 1.05 ? 'under-budget' : cpi < 0.95 ? 'over-budget' : 'on-budget';

  // Pourcentages
  const percentSpent = bac > 0 ? (ac / bac) * 100 : 0;

  return {
    pv,
    ac,
    ev,
    bac,
    sv,
    cv,
    spi,
    cpi,
    eac,
    etc,
    vac,
    tcpi,
    scheduleStatus,
    costStatus,
    percentComplete: percentComplete * 100,
    percentSpent,
  };
}

/**
 * Calcule la valeur planifiée (PV) basée sur le planning du projet
 */
function calculatePlannedValue(project: Project, asOfDate: Date, bac: number): number {
  if (!project.projectStartDate || !project.projectEndDate) {
    return 0;
  }

  const startDate = new Date(project.projectStartDate);
  const endDate = new Date(project.projectEndDate);

  // Si on n'a pas encore commencé
  if (asOfDate < startDate) {
    return 0;
  }

  // Si le projet est terminé
  if (asOfDate >= endDate) {
    return bac;
  }

  // Calcul linéaire de la PV
  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = asOfDate.getTime() - startDate.getTime();
  const percentElapsed = elapsed / totalDuration;

  return bac * percentElapsed;
}

/**
 * Calcule le pourcentage d'avancement d'un projet
 */
function calculateProjectProgress(project: Project): number {
  if (!project.tasks || project.tasks.length === 0) {
    return 0;
  }

  const totalProgress = project.tasks.reduce((sum, task) => {
    return sum + (task.progress || 0);
  }, 0);

  return totalProgress / project.tasks.length;
}

/**
 * Génère un rapport EVM formaté
 */
export function generateEVMReport(metrics: EVMMetrics): string {
  const lines = [
    '=== RAPPORT EARNED VALUE MANAGEMENT ===',
    '',
    'VALEURS DE BASE:',
    `Budget à l'achèvement (BAC): ${formatCurrency(metrics.bac)}`,
    `Valeur planifiée (PV): ${formatCurrency(metrics.pv)}`,
    `Valeur acquise (EV): ${formatCurrency(metrics.ev)}`,
    `Coût réel (AC): ${formatCurrency(metrics.ac)}`,
    '',
    'ÉCARTS:',
    `Écart de planning (SV): ${formatCurrency(metrics.sv)} ${metrics.sv >= 0 ? '✓' : '✗'}`,
    `Écart de coût (CV): ${formatCurrency(metrics.cv)} ${metrics.cv >= 0 ? '✓' : '✗'}`,
    '',
    'INDICES DE PERFORMANCE:',
    `SPI (Schedule Performance Index): ${metrics.spi.toFixed(2)} - ${getPerformanceLabel(metrics.spi)}`,
    `CPI (Cost Performance Index): ${metrics.cpi.toFixed(2)} - ${getPerformanceLabel(metrics.cpi)}`,
    '',
    'PRÉVISIONS:',
    `Estimation à l'achèvement (EAC): ${formatCurrency(metrics.eac)}`,
    `Estimation pour terminer (ETC): ${formatCurrency(metrics.etc)}`,
    `Écart à l'achèvement (VAC): ${formatCurrency(metrics.vac)}`,
    `TCPI (To-Complete Performance Index): ${metrics.tcpi.toFixed(2)}`,
    '',
    'STATUTS:',
    `Planning: ${getScheduleStatusLabel(metrics.scheduleStatus)}`,
    `Budget: ${getCostStatusLabel(metrics.costStatus)}`,
    `Avancement: ${metrics.percentComplete.toFixed(1)}%`,
    `Budget consommé: ${metrics.percentSpent.toFixed(1)}%`,
  ];

  return lines.join('\n');
}

function formatCurrency(value: number): string {
  return `${value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

function getPerformanceLabel(index: number): string {
  if (index > 1.05) return 'Excellent';
  if (index >= 0.95) return 'Bon';
  if (index >= 0.85) return 'Attention';
  return 'Critique';
}

function getScheduleStatusLabel(status: 'ahead' | 'on-track' | 'behind'): string {
  switch (status) {
    case 'ahead': return '✓ En avance';
    case 'on-track': return '✓ Dans les temps';
    case 'behind': return '✗ En retard';
  }
}

function getCostStatusLabel(status: 'under-budget' | 'on-budget' | 'over-budget'): string {
  switch (status) {
    case 'under-budget': return '✓ Sous budget';
    case 'on-budget': return '✓ Dans le budget';
    case 'over-budget': return '✗ Dépassement de budget';
  }
}
