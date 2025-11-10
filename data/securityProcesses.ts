import { SecurityProcess } from '../types';

export const securityProcesses: SecurityProcess[] = [
  {
    id: 'proc-demo-1',
    name: '1. Gouvernance et politiques de sécurité',
    description: 'Définition, approbation et communication des politiques et directives de sécurité.',
    isoMeasureIds: ['5.1', '5.2', '5.3', '5.4', '5.37'],
  },
  {
    id: 'proc-demo-2',
    name: '2. Gestion des risques et conformité',
    description: 'Identification, évaluation et traitement des risques de sécurité, et veille réglementaire.',
    isoMeasureIds: ['5.5', '5.6', '5.7', '5.8', '5.31', '5.32', '5.33', '5.34', '5.35', '5.36'],
  },
  {
    id: 'proc-demo-3',
    name: '3. Gestion des actifs et classification',
    description: 'Inventaire, classification et gestion du cycle de vie des actifs informationnels.',
    isoMeasureIds: ['5.9', '5.10', '5.11', '5.12', '5.13', '5.14'],
  },
  {
    id: 'proc-demo-4',
    name: '4. Gestion des ressources humaines',
    description: 'Processus de sécurité liés au cycle de vie des employés (arrivée, mobilité, départ).',
    isoMeasureIds: ['6.1', '6.2', '6.3', '6.4', '6.5', '6.6', '6.7', '6.8'],
  },
  {
    id: 'proc-demo-5',
    name: '5. Gestion des identités et des accès (IAM)',
    description: 'Gestion du cycle de vie des identités et de leurs droits d\'accès aux ressources.',
    isoMeasureIds: ['5.15', '5.16', '5.17', '5.18', '8.2', '8.3', '8.4', '8.5'],
  },
  {
    id: 'proc-demo-7',
    name: '7. Gestion des fournisseurs et tiers',
    description: 'Sécurisation des relations et des services fournis par des entités externes.',
    isoMeasureIds: ['5.19', '5.20', '5.21', '5.22', '5.23'],
  },
  {
    id: 'proc-demo-9',
    name: '9. Gestion des incidents et continuité',
    description: 'Préparation, détection, réponse aux incidents de sécurité et planification de la continuité.',
    isoMeasureIds: ['5.24', '5.25', '5.26', '5.27', '5.28', '5.29', '5.30'],
  },
  {
    id: 'proc-demo-10',
    name: '10. Développement et maintenance sécurisés',
    description: 'Intégration de la sécurité dans le cycle de vie de développement logiciel (DevSecOps).',
    isoMeasureIds: ['8.25', '8.26', '8.27', '8.28', '8.29', '8.30', '8.31', '8.33', '8.34'],
  }
];
