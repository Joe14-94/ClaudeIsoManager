
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
    processes: string[]; // Capacités Opérationnelles
    functionalProcess: string; // Processus Fonctionnels (12)
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
  isoMeasureIds: string[]; // Array of ISO measure codes
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
  chantierId: string; // Lien direct vers le chantier parent
  strategicOrientations: string[]; // Array of IDs
  createdAt: DateTime;
  
  // Enriched fields
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
  isoMeasures: string[]; // Array of codes
  strategicOrientations: string[]; // Array of IDs
  objectives: string[]; // Array of IDs
  owner?: string; // Resource ID
  startDate?: DateTime;
  endDatePlanned?: DateTime;
  workloadInPersonDays?: number;
  createdAt: DateTime;
  updatedAt: DateTime;
  functionalProcessId: string;
  isExternalService?: boolean;
  
  // Budget fields
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

export interface ProjectMilestone {
  id: string;
  label: string;
  date: DateTime;
  completed: boolean;
}

export interface FdrHistoryEntry {
  week: string;
  year: string;
  type: 'workload' | 'budget';
  importDate: DateTime;
  data: Partial<Project>;
}

export interface Project {
  id: string;
  projectId: string; // e.g., P25-123
  title: string;
  description?: string;
  status: ProjectStatus;
  tShirtSize: TShirtSize;
  category: ProjectCategory;
  projectManagerMOA?: string; // Resource ID
  projectManagerMOE?: string; // Resource ID
  projectStartDate?: DateTime;
  projectEndDate?: DateTime;
  goLiveDate?: DateTime; // Date de passage en NO
  endDate?: DateTime; // Date de passage en NF
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
  majorRiskIds?: string[]; // IDs of MajorRisk

  // Gestion des dépendances
  predecessorIds?: string[]; // IDs of projects this project depends on (End-to-Start)

  // Scoring d'arbitrage
  strategicImpact?: number; // 1-5
  riskCoverage?: number; // 1-5
  effort?: number; // 1-5
  priorityScore?: number; // Calculé

  // History of FDR imports
  fdrHistory?: FdrHistoryEntry[];

  // Workload fields (Simplified: Internal vs External)
  // Internal (derived from history)
  internalWorkloadRequested?: number;
  internalWorkloadEngaged?: number;
  internalWorkloadConsumed?: number;
  
  // External (derived from history)
  externalWorkloadRequested?: number;
  externalWorkloadEngaged?: number;
  externalWorkloadConsumed?: number;

  // Budget fields (Derived from latest history)
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
  entityId: string; // ID of the activity or project
}
