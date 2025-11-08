import { Project, ActivityStatus, TShirtSize } from '../types';

export const projects: Project[] = [
  {
    id: 'proj-1',
    projectId: 'P25-001',
    title: 'Déploiement du SIEM',
    description: 'Projet de mise en place d\'une solution de Security Information and Event Management.',
    status: ActivityStatus.IN_PROGRESS,
    tShirtSize: TShirtSize.L,
    projectManagerMOA: 'res-2',
    projectManagerMOE: 'res-1',
    projectStartDate: '2025-01-15T00:00:00Z',
    projectEndDate: '2025-12-15T00:00:00Z',
    isTop30: true,
    createdAt: '2024-11-10T00:00:00Z',
    updatedAt: '2024-11-10T00:00:00Z',
    initiativeId: 'init-o7-004',
    isoMeasures: ['8.15', '8.16'],
    budgetRequested: 250000,
    budgetApproved: 220000,
    budgetCommitted: 150000,
    internalWorkloadRequested: 100,
    internalWorkloadEngaged: 80,
    internalWorkloadConsumed: 20,
    externalWorkloadRequested: 150,
    externalWorkloadEngaged: 120,
    externalWorkloadConsumed: 40,
  }
];
