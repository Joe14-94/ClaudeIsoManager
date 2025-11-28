
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
import ConsolidatedWorkloadWidget from './ConsolidatedWorkloadWidget';
import ConsolidatedBudgetWidget from './ConsolidatedBudgetWidget';
import ProjectWeatherWidget from './ProjectWeatherWidget';
import TopPriorityProjectsWidget from './TopPriorityProjectsWidget';
import ProjectSCurveWidget from './ProjectSCurveWidget';
import RiskCoverageMatrixWidget from './RiskCoverageMatrixWidget';

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
  {
    id: 'scheduleSlippage',
    name: 'KPI : Dérive calendrier',
    description: "Calcule l'écart moyen en jours entre la date de fin planifiée et la date de fin réelle/prévisionnelle des projets.",
    component: KpiCardWidget,
    defaultLayout: { w: 3, h: 2, minW: 2, minH: 2 },
    props: { type: 'scheduleSlippage' },
  },
  {
    id: 'budgetForecast',
    name: 'KPI : Atterrissage budgétaire',
    description: "Estime le coût final moyen des projets en se basant sur la performance actuelle.",
    component: KpiCardWidget,
    defaultLayout: { w: 3, h: 2, minW: 2, minH: 2 },
    props: { type: 'budgetForecast' },
  },
  {
    id: 'avgActivityAge',
    name: 'KPI : Âge moyen activités "en cours"',
    description: "Calcule la durée moyenne en jours depuis laquelle les activités sont au statut 'En cours'.",
    component: KpiCardWidget,
    defaultLayout: { w: 3, h: 2, minW: 2, minH: 2 },
    props: { type: 'avgActivityAge' },
  },
  {
    id: 'projectSCurve',
    name: 'Courbe en S (Finance)',
    description: "Graphique comparant le budget planifié (linéaire) au budget engagé et réalisé au fil du temps.",
    component: ProjectSCurveWidget,
    defaultLayout: { w: 6, h: 5, minW: 4, minH: 4 },
  },
  {
    id: 'riskMatrix',
    name: 'Matrice de Risques',
    description: "Tableau croisant les Risques Majeurs et les Projets pour identifier la couverture des risques.",
    component: RiskCoverageMatrixWidget,
    defaultLayout: { w: 8, h: 6, minW: 6, minH: 4 },
  },
  {
    id: 'projectWeather',
    name: 'Météo des Projets',
    description: 'Répartition des projets selon leur indicateur météo (Soleil, Nuageux, Pluie, Orage).',
    component: ProjectWeatherWidget,
    defaultLayout: { w: 4, h: 4, minW: 3, minH: 3 },
  },
  {
    id: 'topPriorityProjects',
    name: 'Top 5 Projets Prioritaires',
    description: 'Liste des 5 projets actifs ayant le score de priorité le plus élevé.',
    component: TopPriorityProjectsWidget,
    defaultLayout: { w: 4, h: 4, minW: 3, minH: 3 },
  },
  {
    id: 'consolidatedWorkload',
    name: 'Synthèse des Charges (J/H)',
    description: 'Affiche un tableau consolidé des charges MOA, MOE et Totales avec gestion de la ligne Totale.',
    component: ConsolidatedWorkloadWidget,
    defaultLayout: { w: 12, h: 4, minW: 6, minH: 4 },
  },
  {
    id: 'consolidatedBudget',
    name: 'Synthèse Budgétaire (€)',
    description: 'Affiche un tableau consolidé complet des budgets avec gestion de la ligne Totale.',
    component: ConsolidatedBudgetWidget,
    defaultLayout: { w: 12, h: 4, minW: 6, minH: 4 },
  },
  {
    id: 'strategicAlignment',
    name: 'Graphique : Alignement Activités/Orientation',
    description: "Répartit la charge de travail (J/H) des activités par orientation stratégique.",
    component: StrategicAlignmentWidget,
    defaultLayout: { w: 6, h: 5, minW: 5, minH: 4 },
  },
  {
    id: 'projectInitiativeAlignment',
    name: 'Graphique : Alignement Projets/Initiative',
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
    name: 'Résumé budgétaire (Simple)',
    description: 'Synthèse simplifiée des budgets demandés, accordés et engagés.',
    component: ProjectBudgetSummaryWidget,
    defaultLayout: { w: 12, h: 2, minW: 6, minH: 2 },
    props: {},
  },
  {
    id: 'projectWorkloadSummary',
    name: 'Résumé des charges (Simple)',
    description: 'Synthèse simplifiée des charges (J/H).',
    component: ProjectWorkloadSummaryWidget,
    defaultLayout: { w: 12, h: 3, minW: 6, minH: 3 },
    props: {},
  },
];
