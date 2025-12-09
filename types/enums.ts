
export enum IsoChapter {
  ORGANIZATIONAL = "Contrôles organisationnels",
  PEOPLE = "Contrôles relatifs aux personnes",
  PHYSICAL = "Contrôles physiques",
  TECHNOLOGICAL = "Contrôles technologiques"
}

export enum SecurityDomain {
  GOUVERNANCE = "Gouvernance",
  PROTECTION = "Protection",
  DEFENSE = "Défense",
  RESILIENCE = "Résilience"
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

export enum TaskStatus {
  TODO = "A faire",
  IN_PROGRESS = "En cours",
  DONE = "Terminé",
  BLOCKED = "Bloqué"
}

export type UserRole = 'admin' | 'pmo' | 'readonly';
