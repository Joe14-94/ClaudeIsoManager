import React from 'react';
import StatCardWidget from './StatCardWidget';
import IsoCoverageWidget from './IsoCoverageWidget';
import DomainDonutChartWidget from './DomainDonutChartWidget';
import ActivityTimelineWidget from './ActivityTimelineWidget';
import ProjectTimelineWidget from './ProjectTimelineWidget';
import ProjectBudgetSummaryWidget from './ProjectBudgetSummaryWidget';
import ProjectWorkloadSummaryWidget from './ProjectWorkloadSummaryWidget';
import KpiCardWidget from './KpiCardWidget';
import StrategicAlignmentWidget from './StrategicAlignmentWidget';
import ProjectInitiativeAlignmentWidget from './ProjectInitiativeAlignmentWidget';

export interface WidgetConfig {
  id: string;
  name: string;
  description: string;
  component: React.FC<any>;
  defaultLayout: {
    w: number;
    h: number;
    minW?: number;
    minH?: number;
  };
  props?: any;
}

export const WIDGET_REGISTRY: WidgetConfig[] = [
  // Stat cards
  {
    id: 'totalActivities',
    name: 'Stat : Activités totales',
    description: "Affiche le nombre total d'activités.",
    component: StatCardWidget,
    defaultLayout: { w: 3, h: 2, minW: 2, minH: 2 },
    props: { type: 'totalActivities' },
  },
  {
    id: 'totalProjects',
    name: 'Stat : Projets totaux',
    description: 'Affiche le nombre total de projets.',
    component: StatCardWidget,
    defaultLayout: { w: 3, h: 2, minW: 2, minH: 2 },
    props: { type: 'totalProjects' },
  },
  {
    id: 'coveredMeasures',
    name: 'Stat : Couverture ISO',
    description: 'Affiche le nombre de mesures ISO couvertes.',
    component: StatCardWidget,
    defaultLayout: { w: 3, h: 2, minW: 2, minH: 2 },
    props: { type: 'coveredMeasures' },
  },
   // Nouveaux indicateurs KPI
  {
    id: 'scheduleSlippage',
    name: 'KPI : Dérive calendrier',
    description: "Calcule l'écart moyen en jours entre la date de fin planifiée et la date de fin réelle/prévisionnelle des projets. Données utilisées : `projectEndDate`, `goLiveDate`.",
    component: KpiCardWidget,
    defaultLayout: { w: 3, h: 2, minW: 2, minH: 2 },
    props: { type: 'scheduleSlippage' },
  },
  {
    id: 'budgetForecast',
    name: 'KPI : Atterrissage budgétaire',
    description: "Estime le coût final moyen des projets en se basant sur la performance actuelle (rapport réalisé/engagé). Données utilisées : `budgetApproved`, `completedPV`, `budgetCommitted`.",
    component: KpiCardWidget,
    defaultLayout: { w: 3, h: 2, minW: 2, minH: 2 },
    props: { type: 'budgetForecast' },
  },
  {
    id: 'avgActivityAge',
    name: 'KPI : Âge moyen des activités "en cours"',
    description: "Calcule la durée moyenne en jours depuis laquelle les activités sont au statut 'En cours', pour identifier les points de blocage. Données utilisées : `activities.status`, `activities.startDate`.",
    component: KpiCardWidget,
    defaultLayout: { w: 3, h: 2, minW: 2, minH: 2 },
    props: { type: 'avgActivityAge' },
  },
  // Charts & complex widgets
  {
    id: 'strategicAlignment',
    name: 'Graphique : Alignement Activités par Orientation',
    description: "Répartit la charge de travail (J/H) et le budget estimé (€) des activités par orientation stratégique.",
    component: StrategicAlignmentWidget,
    defaultLayout: { w: 6, h: 5, minW: 5, minH: 4 },
  },
  {
    id: 'projectInitiativeAlignment',
    name: 'Graphique : Alignement Projets par Initiative',
    description: "Répartit la charge de travail engagée (J/H) des projets par initiative.",
    component: ProjectInitiativeAlignmentWidget,
    defaultLayout: { w: 6, h: 5, minW: 5, minH: 4 },
  },
  {
    id: 'isoCoverageMatrix',
    name: 'Matrice de couverture ISO',
    description: 'Affiche une matrice de toutes les mesures ISO et leur couverture.',
    component: IsoCoverageWidget,
    defaultLayout: { w: 12, h: 8, minW: 8, minH: 6 },
    props: {},
  },
  {
    id: 'domainDonutChart',
    name: 'Graphique : Activités par domaine',
    description: 'Répartition des activités par domaine de sécurité.',
    component: DomainDonutChartWidget,
    defaultLayout: { w: 6, h: 5, minW: 4, minH: 4 },
    props: {},
  },
  {
    id: 'activityTimeline',
    name: 'Timeline des activités',
    description: 'Vue chronologique des activités planifiées.',
    component: ActivityTimelineWidget,
    defaultLayout: { w: 12, h: 5, minW: 6, minH: 4 },
    props: {},
  },
  {
    id: 'projectTimeline',
    name: 'Timeline des projets',
    description: 'Vue chronologique des projets planifiés.',
    component: ProjectTimelineWidget,
    defaultLayout: { w: 12, h: 5, minW: 6, minH: 4 },
    props: {},
  },
    {
    id: 'projectBudgetSummary',
    name: 'Résumé budgétaire projets',
    description: 'Synthèse des budgets demandés, accordés et engagés pour les projets.',
    component: ProjectBudgetSummaryWidget,
    defaultLayout: { w: 12, h: 2, minW: 6, minH: 2 },
    props: {},
  },
  {
    id: 'projectWorkloadSummary',
    name: 'Résumé des charges projets',
    description: 'Synthèse des charges (J/H) pour les projets.',
    component: ProjectWorkloadSummaryWidget,
    defaultLayout: { w: 12, h: 3, minW: 6, minH: 3 },
    props: {},
  },
];
