

export type DateTime = string;

export enum IsoChapter {
  ORGANIZATIONAL = "Contrôles organisationnels",
  PEOPLE = "Contrôles relatifs aux personnes",
  PHYSICAL = "Contrôles physiques",
  TECHNOLOGICAL = "Contrôles technologiques"
}

export interface SecurityProcess {
  id: string;
  name: string;
  description: string;
  isoMeasureIds: string[];
}

export interface IsoMeasureDetails {
    type: string[];
    properties: string[];
    concepts: string[];
    processes: string[];
    functionalProcess: string;
    domains: string[];
    measure: string;
    objective: string;
    recommendations: string;
    extraInfo?: string;
}

export interface IsoMeasure {
  id: string;
  code: string;
  title: string;
  chapter: IsoChapter;
  description?: string;
  details?: IsoMeasureDetails;
}

export enum SecurityDomain {
  GOUVERNANCE = "Gouvernance",
  PROTECTION = "Protection",
  DEFENSE = "Défense",
  RESILIENCE = "Résilience"
}

export interface StrategicOrientation {
  id: string;
  code: string;
  label: string;
  description?: string;
  color?: string;
  createdAt: DateTime;
}

export interface Initiative {
  id: string;
  code: string;
  label: string;
  description?: string;
  isoMeasureIds: string[];
  createdAt: DateTime;
}

export interface Chantier {
  id: string;
  code: string;
  label: string;
  description?: string;
  strategicOrientationId: string;
  statut?: string;
  date_debut?: string;
  date_fin_prevue?: string;
  budget_estime?: string;
  responsable?: string;
  createdAt: DateTime;
}

export interface IsoLink {
  domaine: string;
  numero_mesure: string;
  titre: string;
  description: string;
  niveau_application: string;
}

export interface Indicator {
  nom: string;
  type: string;
  cible: string;
  frequence_mesure: string;
}

export interface Risk {
  description: string;
  impact: string;
  probabilite: string;
  mitigation: string;
}

export interface MajorRisk {
  id: string;
  label: string;
  description: string;
  category: string; // e.g., "Cybercriminalité", "Conformité", "Opérationnel"
}

export interface Objective {
  id: string;
  code: string;
  label: string;
  description?: string;
  targetDate?: DateTime;
  chantierId: string;
  strategicOrientations: string[];
  createdAt: DateTime;
  
  type?: string;
  priorite?: string;
  complexite?: string;
  statut?: string;
  date_debut?: string;
  responsable?: string;
  parties_prenantes?: string[];
  livrables?: string[];
  mesures_iso?: IsoLink[];
  indicateurs?: Indicator[];
  risques?: Risk[];
  dependances?: string[];
  budget_estime?: string;
  charge_estimee?: string;
  origine?: string;
  recurrence?: string;
}

export enum ActivityStatus {
  NOT_STARTED = "Non démarré",
  IN_PROGRESS = "En cours",
  ON_HOLD = "En pause",
  COMPLETED = "Terminé",
  CANCELLED = "Annulé"
}

export enum Priority {
  LOW = "Basse",
  MEDIUM = "Moyenne",
  HIGH = "Haute",
  CRITICAL = "Critique"
}

export enum ActivityType {
  PONCTUAL = "Ponctuelle",
  PERMANENT = "Permanente"
}

export interface Activity {
  id: string;
  activityId: string;
  title: string;
  description?: string;
  status: ActivityStatus;
  priority: Priority;
  activityType: ActivityType;
  securityDomain: SecurityDomain;
  isoMeasures: string[];
  strategicOrientations: string[];
  objectives: string[];
  owner?: string;
  startDate?: DateTime;
  endDatePlanned?: DateTime;
  workloadInPersonDays?: number; // Charge prévue
  consumedWorkload?: number; // Charge consommée (via import calendrier par ex)
  createdAt: DateTime;
  updatedAt: DateTime;
  functionalProcessId: string;
  isExternalService?: boolean;
  
  budgetRequested?: number;
  budgetApproved?: number;
  budgetCommitted?: number;
  validatedPurchaseOrders?: number;
  completedPV?: number;
  forecastedPurchaseOrders?: number;
}

export interface Resource {
    id: string;
    name: string;
    entity: string;
}

export enum TShirtSize {
  XS = "XS",
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
}

export enum ProjectCategory {
  ACTIVITY = "Activité",
  EPA = "EPA",
  MCO = "MCO",
  OPERATION = "Opération",
  OPPORTUNITY = "Opportunité",
  PROJECT = "Projet",
}

export enum ProjectStatus {
  IDENTIFIED = "Identifié",
  NO = "NO",
  NF = "NF",
  NT = "NT",
}

export enum ProjectWeather {
  SUNNY = "Soleil",
  CLOUDY = "Nuageux",
  RAINY = "Pluie",
  STORM = "Orage"
}

export interface MilestoneHistoryEntry {
    updatedAt: DateTime;
    previousDate: DateTime;
    newDate: DateTime;
}

export interface ProjectMilestone {
  id: string;
  label: string;
  date: DateTime;
  initialDate: DateTime;
  completed: boolean;
  dependencyIds?: string[];
  history?: MilestoneHistoryEntry[];
}

export interface FdrHistoryEntry {
  week: string;
  year: string;
  type: 'workload' | 'budget';
  importDate: DateTime;
  data: Partial<Project>;
}

// Nouvelles interfaces pour le Gantt détaillé
export enum TaskStatus {
  TODO = "A faire",
  IN_PROGRESS = "En cours",
  DONE = "Terminé",
  BLOCKED = "Bloqué"
}

export interface ProjectTask {
  id: string;
  name: string;
  startDate: DateTime;
  endDate: DateTime;
  progress: number; // 0-100
  status: TaskStatus;
  assigneeId?: string;
  dependencyIds?: string[]; // IDs des tâches dont celle-ci dépend (Fin-Début)
  children?: ProjectTask[]; // Pour les sous-tâches
}

export interface Project {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  tShirtSize: TShirtSize;
  category: ProjectCategory;
  projectManagerMOA?: string;
  projectManagerMOE?: string;
  projectStartDate?: DateTime;
  projectEndDate?: DateTime;
  goLiveDate?: DateTime;
  endDate?: DateTime;
  isTop30: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
  initiativeId: string;
  isoMeasures: string[];

  // Météo & Reporting
  weather?: ProjectWeather;
  weatherDescription?: string;

  // Jalons
  milestones?: ProjectMilestone[];
  
  // Risques Majeurs
  majorRiskIds?: string[];

  // Gestion des dépendances
  predecessorIds?: string[];

  // Tâches détaillées pour le Gantt
  tasks?: ProjectTask[];

  // Scoring d'arbitrage
  strategicImpact?: number; // 1-5
  riskCoverage?: number; // 1-5
  effort?: number; // 1-5
  priorityScore?: number;

  // Historique FDR
  fdrHistory?: FdrHistoryEntry[];

  // Charges (Interne/Externe)
  internalWorkloadRequested?: number;
  internalWorkloadEngaged?: number;
  internalWorkloadConsumed?: number;
  
  externalWorkloadRequested?: number;
  externalWorkloadEngaged?: number;
  externalWorkloadConsumed?: number;

  // Budget
  budgetRequested?: number;
  budgetApproved?: number;
  budgetCommitted?: number;
  validatedPurchaseOrders?: number;
  completedPV?: number;
  forecastedPurchaseOrders?: number;
}

export interface DashboardStats {
  totalActivities: number;
  completionRate: number;
  coveredMeasures: number;
  totalMeasures: number;
  achievedObjectives: number;
}

export interface CoverageMatrix {
  [key: string]: {
    count: number;
    completed: number;
  }
}

export type UserRole = 'admin' | 'pmo' | 'readonly';

export interface Notification {
  id: string;
  message: string;
  type: 'deadline' | 'budget' | 'warning';
  read: boolean;
  linkTo: {
    path: string;
    state: any;
  };
  createdAt: DateTime;
  entityId: string;
}