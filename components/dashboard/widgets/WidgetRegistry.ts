import React from 'react';
import StatCardWidget from './StatCardWidget';
import IsoCoverageWidget from './IsoCoverageWidget';
import DomainDonutChartWidget from './DomainDonutChartWidget';
import ActivityTimelineWidget from './ActivityTimelineWidget';
import ProjectTimelineWidget from './ProjectTimelineWidget';
import ProjectBudgetSummaryWidget from './ProjectBudgetSummaryWidget';
import ProjectWorkloadSummaryWidget from './ProjectWorkloadSummaryWidget';

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
    name: 'Stat: Activités totales',
    description: "Affiche le nombre total d'activités.",
    component: StatCardWidget,
    defaultLayout: { w: 3, h: 2, minW: 2, minH: 2 },
    props: { type: 'totalActivities' },
  },
  {
    id: 'totalProjects',
    name: 'Stat: Projets totaux',
    description: 'Affiche le nombre total de projets.',
    component: StatCardWidget,
    defaultLayout: { w: 3, h: 2, minW: 2, minH: 2 },
    props: { type: 'totalProjects' },
  },
  {
    id: 'coveredMeasures',
    name: 'Stat: Couverture ISO',
    description: 'Affiche le nombre de mesures ISO couvertes.',
    component: StatCardWidget,
    defaultLayout: { w: 3, h: 2, minW: 2, minH: 2 },
    props: { type: 'coveredMeasures' },
  },
  // Charts & complex widgets
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
    name: 'Activités par domaine',
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
    name: 'Résumé Budgétaire Projets',
    description: 'Synthèse des budgets demandés, accordés et engagés pour les projets.',
    component: ProjectBudgetSummaryWidget,
    defaultLayout: { w: 12, h: 2, minW: 6, minH: 2 },
    props: {},
  },
  {
    id: 'projectWorkloadSummary',
    name: 'Résumé des Charges Projets',
    description: 'Synthèse des charges (J/H) pour les projets.',
    component: ProjectWorkloadSummaryWidget,
    defaultLayout: { w: 12, h: 3, minW: 6, minH: 3 },
    props: {},
  },
];