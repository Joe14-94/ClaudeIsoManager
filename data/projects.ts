
import { Project, ProjectStatus, TShirtSize, ProjectCategory, ProjectWeather, TaskStatus } from '../types';

export const projects: Project[] = [
  {
    id: 'proj-demo-1',
    projectId: 'P25-001',
    title: 'Déploiement EDR Global',
    description: 'Déploiement de la solution CrowdStrike Falcon sur l\'ensemble du parc (Serveurs & Postes de travail).',
    status: ProjectStatus.NO,
    tShirtSize: TShirtSize.L,
    projectManagerMOA: 'res-demo-3',
    projectManagerMOE: 'res-demo-1',
    projectStartDate: '2025-06-01T00:00:00Z',
    projectEndDate: '2026-06-30T00:00:00Z',
    goLiveDate: '2026-05-31T00:00:00Z',
    isTop30: true,
    category: ProjectCategory.PROJECT,
    createdAt: '2025-04-01T00:00:00Z',
    updatedAt: '2025-11-01T00:00:00Z',
    initiativeId: 'init-demo-A',
    isoMeasures: ['8.7', '8.16'],
    predecessorIds: [], // Pas de dépendance inter-projet
    
    budgetRequested: 150000,
    budgetApproved: 120000,
    budgetCommitted: 75000,
    completedPV: 45000,
    forecastedPurchaseOrders: 40000,

    internalWorkloadRequested: 100, 
    internalWorkloadEngaged: 80,
    internalWorkloadConsumed: 57,
    externalWorkloadRequested: 50, 
    externalWorkloadEngaged: 50,
    externalWorkloadConsumed: 30,

    weather: ProjectWeather.SUNNY,
    weatherDescription: "Le déploiement avance bien sur le périmètre pilote.",
    strategicImpact: 5,
    riskCoverage: 5,
    effort: 3,
    priorityScore: 8.3,
    majorRiskIds: ['risk-ransomware', 'risk-insider', 'risk-availability'],
    
    milestones: [
        { id: 'm1', label: 'Validation Architecture', date: '2025-07-15T00:00:00Z', initialDate: '2025-07-01T00:00:00Z', completed: true, history: [{ updatedAt: '2025-06-20T10:00:00Z', previousDate: '2025-07-01T00:00:00Z', newDate: '2025-07-15T00:00:00Z'}] },
        { id: 'm2', label: 'Fin du Pilote', date: '2025-10-30T00:00:00Z', initialDate: '2025-10-15T00:00:00Z', completed: true, history: [{ updatedAt: '2025-09-01T10:00:00Z', previousDate: '2025-10-15T00:00:00Z', newDate: '2025-10-30T00:00:00Z'}] },
        { id: 'm3', label: 'Déploiement Général', date: '2026-06-30T00:00:00Z', initialDate: '2026-05-30T00:00:00Z', completed: false, history: [] },
    ],

    // Structure WBS avec Phases, Tâches, Jalons et Dépendances Intra-projet
    tasks: [
      {
        id: 'p1-ph1', name: 'Phase 1 : Cadrage & Architecture', startDate: '2025-06-01T00:00:00Z', endDate: '2025-07-15T00:00:00Z', progress: 100, status: TaskStatus.DONE,
        children: [
          { id: 'p1-t1', name: 'Ateliers de cadrage', startDate: '2025-06-01T00:00:00Z', endDate: '2025-06-15T00:00:00Z', progress: 100, status: TaskStatus.DONE, assigneeId: 'res-demo-1' },
          { id: 'p1-t2', name: 'Définition architecture technique', startDate: '2025-06-16T00:00:00Z', endDate: '2025-06-30T00:00:00Z', progress: 100, status: TaskStatus.DONE, assigneeId: 'res-demo-4', dependencyIds: ['p1-t1'] },
          { id: 'p1-t3', name: 'Validation DAT', startDate: '2025-07-01T00:00:00Z', endDate: '2025-07-15T00:00:00Z', progress: 100, status: TaskStatus.DONE, assigneeId: 'res-demo-3', dependencyIds: ['p1-t2'] },
          { id: 'p1-m1', name: 'Jalon : Architecture Validée', startDate: '2025-07-15T00:00:00Z', endDate: '2025-07-15T00:00:00Z', progress: 100, status: TaskStatus.DONE, dependencyIds: ['p1-t3'] }, // Jalon (durée 0)
        ]
      },
      {
        id: 'p1-ph2', name: 'Phase 2 : Pilote', startDate: '2025-07-16T00:00:00Z', endDate: '2025-10-30T00:00:00Z', progress: 100, status: TaskStatus.DONE, dependencyIds: ['p1-ph1'], // Dépendance de phase
        children: [
          { id: 'p1-t4', name: 'Configuration Tenant', startDate: '2025-07-16T00:00:00Z', endDate: '2025-07-30T00:00:00Z', progress: 100, status: TaskStatus.DONE, assigneeId: 'res-demo-1' },
          { id: 'p1-t5', name: 'Déploiement groupe IT', startDate: '2025-08-01T00:00:00Z', endDate: '2025-08-30T00:00:00Z', progress: 100, status: TaskStatus.DONE, assigneeId: 'res-demo-4', dependencyIds: ['p1-t4'] },
          { id: 'p1-t6', name: 'Déploiement périmètre Pilote (500)', startDate: '2025-09-01T00:00:00Z', endDate: '2025-10-30T00:00:00Z', progress: 100, status: TaskStatus.DONE, assigneeId: 'res-demo-6', dependencyIds: ['p1-t5'] },
          { id: 'p1-m2', name: 'Jalon : Fin Pilote', startDate: '2025-10-30T00:00:00Z', endDate: '2025-10-30T00:00:00Z', progress: 100, status: TaskStatus.DONE, dependencyIds: ['p1-t6'] },
        ]
      },
      {
        id: 'p1-ph3', name: 'Phase 3 : Déploiement Général', startDate: '2025-11-01T00:00:00Z', endDate: '2026-03-30T00:00:00Z', progress: 15, status: TaskStatus.IN_PROGRESS, dependencyIds: ['p1-ph2'],
        children: [
          { id: 'p1-t7', name: 'Vague 1 : Siège (1500)', startDate: '2025-11-01T00:00:00Z', endDate: '2025-12-31T00:00:00Z', progress: 40, status: TaskStatus.IN_PROGRESS, assigneeId: 'res-demo-6' },
          { id: 'p1-t8', name: 'Vague 2 : Filiales France', startDate: '2026-01-01T00:00:00Z', endDate: '2026-02-15T00:00:00Z', progress: 0, status: TaskStatus.TODO, assigneeId: 'res-demo-6', dependencyIds: ['p1-t7'] },
          { id: 'p1-t9', name: 'Vague 3 : International', startDate: '2026-02-16T00:00:00Z', endDate: '2026-03-30T00:00:00Z', progress: 0, status: TaskStatus.TODO, assigneeId: 'res-demo-4', dependencyIds: ['p1-t8'] },
        ]
      },
      {
        id: 'p1-ph4', name: 'Phase 4 : RUN & MCO', startDate: '2026-04-01T00:00:00Z', endDate: '2026-06-30T00:00:00Z', progress: 0, status: TaskStatus.TODO, dependencyIds: ['p1-ph3'],
        children: [
          { id: 'p1-t10', name: 'Formation équipe N1', startDate: '2026-04-01T00:00:00Z', endDate: '2026-04-15T00:00:00Z', progress: 0, status: TaskStatus.TODO, assigneeId: 'res-demo-1' },
          { id: 'p1-t11', name: 'Transfert de compétences', startDate: '2026-04-16T00:00:00Z', endDate: '2026-05-15T00:00:00Z', progress: 0, status: TaskStatus.TODO, assigneeId: 'res-demo-1', dependencyIds: ['p1-t10'] },
          { id: 'p1-m3', name: 'Jalon : Passage en RUN', startDate: '2026-05-15T00:00:00Z', endDate: '2026-05-15T00:00:00Z', progress: 0, status: TaskStatus.TODO, dependencyIds: ['p1-t11'] },
        ]
      }
    ],
    
    fdrHistory: [
        { week: '44', year: '2025', type: 'budget', importDate: '2025-10-31T12:00:00Z', data: { budgetCommitted: 75000, completedPV: 45000 } },
    ]
  },
  {
    id: 'proj-demo-2',
    projectId: 'P24-012',
    title: 'Migration Cloud Azure',
    description: 'Migration de l\'infrastructure on-premise vers Azure.',
    status: ProjectStatus.NF,
    tShirtSize: TShirtSize.XL,
    projectManagerMOA: 'res-demo-5',
    projectManagerMOE: 'res-demo-4',
    projectStartDate: '2024-01-15T00:00:00Z',
    projectEndDate: '2025-07-30T00:00:00Z',
    isTop30: true,
    category: ProjectCategory.PROJECT,
    createdAt: '2023-11-01T00:00:00Z',
    updatedAt: '2025-08-10T00:00:00Z',
    initiativeId: 'init-demo-B',
    isoMeasures: ['5.23', '7.11'],
    predecessorIds: [],
    budgetRequested: 250000,
    budgetApproved: 250000,
    weather: ProjectWeather.SUNNY,
    priorityScore: 3.0,
    
    milestones: [
        { id: 'p2-m3', label: 'Migration terminée', date: '2025-06-30T00:00:00Z', initialDate: '2025-06-30T00:00:00Z', completed: true, history: [] }
    ],

    tasks: [
        {
            id: 'p2-ph1', name: '1. Assessment & Plan', startDate: '2024-01-15T00:00:00Z', endDate: '2024-03-15T00:00:00Z', progress: 100, status: TaskStatus.DONE,
            children: [
                { id: 'p2-t1', name: 'Inventaire applicatif', startDate: '2024-01-15T00:00:00Z', endDate: '2024-02-15T00:00:00Z', progress: 100, status: TaskStatus.DONE },
                { id: 'p2-t2', name: 'Analyse de dépendances', startDate: '2024-02-15T00:00:00Z', endDate: '2024-03-15T00:00:00Z', progress: 100, status: TaskStatus.DONE, dependencyIds: ['p2-t1'] }
            ]
        },
        {
            id: 'p2-ph2', name: '2. Landing Zone', startDate: '2024-03-16T00:00:00Z', endDate: '2024-05-30T00:00:00Z', progress: 100, status: TaskStatus.DONE, dependencyIds: ['p2-ph1'],
            children: [
                { id: 'p2-t3', name: 'Design Architecture', startDate: '2024-03-16T00:00:00Z', endDate: '2024-04-15T00:00:00Z', progress: 100, status: TaskStatus.DONE },
                { id: 'p2-t4', name: 'Implémentation Hub & Spoke', startDate: '2024-04-16T00:00:00Z', endDate: '2024-05-30T00:00:00Z', progress: 100, status: TaskStatus.DONE, dependencyIds: ['p2-t3'] }
            ]
        },
        {
            id: 'p2-ph3', name: '3. Migration des Workloads', startDate: '2024-06-01T00:00:00Z', endDate: '2025-06-30T00:00:00Z', progress: 100, status: TaskStatus.DONE, dependencyIds: ['p2-ph2'],
            children: [
                { id: 'p2-t5', name: 'Lot 1 : Applications Web', startDate: '2024-06-01T00:00:00Z', endDate: '2024-09-30T00:00:00Z', progress: 100, status: TaskStatus.DONE },
                { id: 'p2-t6', name: 'Lot 2 : Bases de données', startDate: '2024-10-01T00:00:00Z', endDate: '2025-02-28T00:00:00Z', progress: 100, status: TaskStatus.DONE, dependencyIds: ['p2-t5'] },
                { id: 'p2-t7', name: 'Lot 3 : Legacy', startDate: '2025-03-01T00:00:00Z', endDate: '2025-06-30T00:00:00Z', progress: 100, status: TaskStatus.DONE, dependencyIds: ['p2-t6'] }
            ]
        }
    ]
  },
   {
    id: 'proj-demo-3',
    projectId: 'P25-003',
    title: 'Outil de Data Classification',
    description: 'Mise en place d\'un outil pour classifier et étiqueter automatiquement les données sensibles.',
    status: ProjectStatus.NT,
    tShirtSize: TShirtSize.M,
    projectManagerMOA: 'res-demo-3',
    projectManagerMOE: 'res-demo-2',
    projectStartDate: '2025-09-01T00:00:00Z',
    projectEndDate: '2026-04-01T00:00:00Z',
    isTop30: false,
    category: ProjectCategory.PROJECT,
    initiativeId: 'init-demo-C',
    isoMeasures: ['5.12', '5.13', '8.11'],
    budgetRequested: 80000,
    budgetApproved: 60000,
    predecessorIds: [], 
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2025-10-15T00:00:00Z',
    
    weather: ProjectWeather.CLOUDY,
    weatherDescription: "Retard sur la livraison de l'éditeur.",
    strategicImpact: 4,
    priorityScore: 5.3,
    
    tasks: [
        {
            id: 'p3-ph1', name: 'Phase 1 : Sélection', startDate: '2025-09-01T00:00:00Z', endDate: '2025-10-15T00:00:00Z', progress: 100, status: TaskStatus.DONE,
            children: [
                { id: 'p3-t1', name: 'RFI / RFP', startDate: '2025-09-01T00:00:00Z', endDate: '2025-09-30T00:00:00Z', progress: 100, status: TaskStatus.DONE },
                { id: 'p3-t2', name: 'Contractualisation', startDate: '2025-10-01T00:00:00Z', endDate: '2025-10-15T00:00:00Z', progress: 100, status: TaskStatus.DONE, dependencyIds: ['p3-t1'] },
                { id: 'p3-m1', name: 'Jalon : Outil Choisi', startDate: '2025-10-15T00:00:00Z', endDate: '2025-10-15T00:00:00Z', progress: 100, status: TaskStatus.DONE, dependencyIds: ['p3-t2'] }
            ]
        },
        {
            id: 'p3-ph2', name: 'Phase 2 : Implémentation', startDate: '2025-10-16T00:00:00Z', endDate: '2026-01-31T00:00:00Z', progress: 20, status: TaskStatus.IN_PROGRESS, dependencyIds: ['p3-ph1'],
            children: [
                { id: 'p3-t3', name: 'Installation & Config', startDate: '2025-10-16T00:00:00Z', endDate: '2025-11-15T00:00:00Z', progress: 80, status: TaskStatus.IN_PROGRESS },
                { id: 'p3-t4', name: 'POC (Proof of Concept)', startDate: '2025-11-15T00:00:00Z', endDate: '2025-12-15T00:00:00Z', progress: 0, status: TaskStatus.TODO, dependencyIds: ['p3-t3'] },
                { id: 'p3-t5', name: 'Déploiement Agents', startDate: '2026-01-01T00:00:00Z', endDate: '2026-01-31T00:00:00Z', progress: 0, status: TaskStatus.TODO, dependencyIds: ['p3-t4'] }
            ]
        }
    ]
  },
  {
    id: 'proj-demo-4',
    projectId: 'P26-001',
    title: 'Refonte de l\'IAM',
    description: 'Remplacer la solution IAM actuelle par une nouvelle plateforme supportant le Zero Trust.',
    status: ProjectStatus.IDENTIFIED,
    tShirtSize: TShirtSize.L,
    projectStartDate: '2026-01-15T00:00:00Z',
    projectEndDate: '2027-01-15T00:00:00Z',
    isTop30: true,
    category: ProjectCategory.OPPORTUNITY,
    initiativeId: 'init-demo-D',
    isoMeasures: ['5.16', '5.17', '5.18', '8.5'],
    predecessorIds: [], 
    priorityScore: 5.0,
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2025-12-01T00:00:00Z',
    tasks: [
        { id: 'p4-ph1', name: 'Phase 1 : Etude & Choix', startDate: '2026-01-15T00:00:00Z', endDate: '2026-03-30T00:00:00Z', progress: 0, status: TaskStatus.TODO },
        { id: 'p4-ph2', name: 'Phase 2 : Design & Build', startDate: '2026-04-01T00:00:00Z', endDate: '2026-09-30T00:00:00Z', progress: 0, status: TaskStatus.TODO, dependencyIds: ['p4-ph1'] },
        { id: 'p4-ph3', name: 'Phase 3 : Migration & Run', startDate: '2026-10-01T00:00:00Z', endDate: '2027-01-15T00:00:00Z', progress: 0, status: TaskStatus.TODO, dependencyIds: ['p4-ph2'] },
    ]
  },
  {
    id: 'proj-demo-5',
    projectId: 'P25-005',
    title: 'Audit de conformité RGPD',
    description: 'Audit annuel pour vérifier la conformité des traitements.',
    status: ProjectStatus.NO,
    tShirtSize: TShirtSize.M,
    isTop30: false,
    createdAt: '2025-09-15T00:00:00Z',
    updatedAt: '2025-10-01T00:00:00Z',
    projectStartDate: '2025-10-01T00:00:00Z',
    projectEndDate: '2025-12-20T00:00:00Z',
    category: ProjectCategory.MCO,
    initiativeId: 'init-demo-C',
    isoMeasures: ['5.34'],
    predecessorIds: [], 
    priorityScore: 30.0,
    tasks: [
        { id: 'p5-ph1', name: 'Phase 1 : Audit', startDate: '2025-10-01T00:00:00Z', endDate: '2025-12-20T00:00:00Z', progress: 50, status: TaskStatus.IN_PROGRESS,
          children: [
            { id: 'p5-t1', name: 'Préparation', startDate: '2025-10-01T00:00:00Z', endDate: '2025-10-15T00:00:00Z', progress: 100, status: TaskStatus.DONE },
            { id: 'p5-t2', name: 'Entretiens', startDate: '2025-10-16T00:00:00Z', endDate: '2025-11-30T00:00:00Z', progress: 70, status: TaskStatus.IN_PROGRESS, dependencyIds: ['p5-t1'] },
            { id: 'p5-t3', name: 'Rapport', startDate: '2025-12-01T00:00:00Z', endDate: '2025-12-20T00:00:00Z', progress: 0, status: TaskStatus.TODO, dependencyIds: ['p5-t2'] }
          ]
        }
    ]
  },
  {
    id: 'proj-demo-6',
    projectId: 'P25-020',
    title: 'Durcissement Active Directory',
    status: ProjectStatus.NO,
    tShirtSize: TShirtSize.L,
    isTop30: true,
    createdAt: '2025-04-15T00:00:00Z',
    updatedAt: '2025-05-01T00:00:00Z',
    projectStartDate: '2025-05-01T00:00:00Z',
    projectEndDate: '2026-03-01T00:00:00Z',
    category: ProjectCategory.PROJECT,
    initiativeId: 'init-demo-D',
    isoMeasures: ['8.2', '8.5', '5.15'],
    predecessorIds: [],
    priorityScore: 6.3,
    tasks: [
        { id: 'p6-ph1', name: 'Remédiation Tier 0', startDate: '2025-05-01T00:00:00Z', endDate: '2025-08-30T00:00:00Z', progress: 80, status: TaskStatus.IN_PROGRESS },
        { id: 'p6-ph2', name: 'Remédiation Tier 1', startDate: '2025-09-01T00:00:00Z', endDate: '2025-12-31T00:00:00Z', progress: 20, status: TaskStatus.IN_PROGRESS, dependencyIds: ['p6-ph1'] },
        { id: 'p6-ph3', name: 'Remédiation Tier 2', startDate: '2026-01-01T00:00:00Z', endDate: '2026-03-01T00:00:00Z', progress: 0, status: TaskStatus.TODO, dependencyIds: ['p6-ph2'] }
    ]
  },
  {
    id: 'proj-demo-7',
    projectId: 'P25-030',
    title: 'Mise en place SOC Hybride 24/7',
    status: ProjectStatus.NO,
    tShirtSize: TShirtSize.XL,
    isTop30: true,
    isoMeasures: ['8.16', '5.26'],
    createdAt: '2025-01-20T00:00:00Z',
    updatedAt: '2025-02-01T00:00:00Z',
    projectStartDate: '2025-02-01T00:00:00Z',
    projectEndDate: '2025-12-31T00:00:00Z',
    category: ProjectCategory.PROJECT,
    initiativeId: 'init-demo-A',
    predecessorIds: [],
    priorityScore: 8.3,
    tasks: [
        { id: 'p7-ph1', name: 'Phase 1 : Appel d\'offre', startDate: '2025-02-01T00:00:00Z', endDate: '2025-04-30T00:00:00Z', progress: 100, status: TaskStatus.DONE },
        { id: 'p7-ph2', name: 'Phase 2 : Onboarding & Build', startDate: '2025-05-01T00:00:00Z', endDate: '2025-09-30T00:00:00Z', progress: 100, status: TaskStatus.DONE, dependencyIds: ['p7-ph1'] },
        { id: 'p7-ph3', name: 'Phase 3 : Run (Service Régulier)', startDate: '2025-10-01T00:00:00Z', endDate: '2025-12-31T00:00:00Z', progress: 30, status: TaskStatus.IN_PROGRESS, dependencyIds: ['p7-ph2'] }
    ]
  },
   {
    id: 'proj-demo-8',
    projectId: 'P25-040',
    title: 'Campagne Phishing S2 2025',
    status: ProjectStatus.NO,
    tShirtSize: TShirtSize.S,
    isTop30: false,
    isoMeasures: ['6.3'],
    createdAt: '2025-10-25T00:00:00Z',
    updatedAt: '2025-11-01T00:00:00Z',
    projectStartDate: '2025-11-01T00:00:00Z',
    projectEndDate: '2025-11-30T00:00:00Z',
    category: ProjectCategory.ACTIVITY,
    initiativeId: 'init-demo-C',
    predecessorIds: [],
    priorityScore: 45.0,
    tasks: [
        { id: 'p8-t1', name: 'Préparation Scénarios', startDate: '2025-11-01T00:00:00Z', endDate: '2025-11-10T00:00:00Z', progress: 100, status: TaskStatus.DONE },
        { id: 'p8-t2', name: 'Lancement Campagne', startDate: '2025-11-13T00:00:00Z', endDate: '2025-11-20T00:00:00Z', progress: 0, status: TaskStatus.TODO, dependencyIds: ['p8-t1'] },
        { id: 'p8-t3', name: 'Analyse & REX', startDate: '2025-11-21T00:00:00Z', endDate: '2025-11-30T00:00:00Z', progress: 0, status: TaskStatus.TODO, dependencyIds: ['p8-t2'] }
    ]
  }
];
