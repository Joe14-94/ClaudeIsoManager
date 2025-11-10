import { SecurityProcess } from '../types';

export const securityProcesses: SecurityProcess[] = [
  {
    id: 'gouvernance-politiques',
    name: '1. Gouvernance et politiques de sécurité',
    description: 'Ces contrôles établissent le cadre de gouvernance, définissent les orientations stratégiques et organisent la structure de responsabilité en matière de sécurité.',
    // FIX: Added missing isoMeasureIds property
    isoMeasureIds: ['5.1', '5.2', '5.3', '5.4', '5.37'],
  },
  {
    id: 'risques-conformite',
    name: '2. Gestion des risques et conformité',
    description: 'Ces contrôles assurent l\'identification, l\'évaluation et le traitement des risques, ainsi que le respect des exigences légales et réglementaires.',
    // FIX: Added missing isoMeasureIds property
    isoMeasureIds: ['5.5', '5.6', '5.7', '5.8', '5.31', '5.32', '5.33', '5.34', '5.35', '5.36'],
  },
  {
    id: 'actifs-classification',
    name: '3. Gestion des actifs et classification',
    description: 'Ces contrôles établissent un système complet de gestion du cycle de vie des actifs informationnels, de leur identification à leur protection.',
    // FIX: Added missing isoMeasureIds property
    isoMeasureIds: ['5.9', '5.10', '5.11', '5.12', '5.13', '5.14'],
  },
  {
    id: 'ressources-humaines',
    name: '4. Gestion des ressources humaines',
    description: 'Ces contrôles gèrent les aspects humains de la sécurité tout au long du cycle d\'emploi.',
    // FIX: Added missing isoMeasureIds property
    isoMeasureIds: ['6.1', '6.2', '6.3', '6.4', '6.5', '6.6', '6.7', '6.8'],
  },
  {
    id: 'identites-acces',
    name: '5. Gestion des identités et des accès',
    description: 'Ces contrôles assurent que seules les personnes autorisées accèdent aux ressources appropriées avec le bon niveau de privilège.',
    // FIX: Added missing isoMeasureIds property
    isoMeasureIds: ['5.15', '5.16', '5.17', '5.18', '8.2', '8.3', '8.4', '8.5'],
  },
  {
    id: 'securite-physique',
    name: '6. Sécurité physique et environnementale',
    description: 'Ces contrôles protègent les installations, équipements et supports physiques contre les accès non autorisés et les dommages.',
    // FIX: Added missing isoMeasureIds property
    isoMeasureIds: ['7.1', '7.2', '7.3', '7.4', '7.5', '7.6', '7.7', '7.8', '7.9', '7.10', '7.11', '7.12', '7.13', '7.14'],
  },
  {
    id: 'fournisseurs-tiers',
    name: '7. Gestion des fournisseurs et tiers',
    description: 'Ces contrôles gèrent les risques liés aux relations avec les parties externes et l\'utilisation de services tiers.',
    // FIX: Added missing isoMeasureIds property
    isoMeasureIds: ['5.19', '5.20', '5.21', '5.22', '5.23'],
  },
  {
    id: 'operations-communications',
    name: '8. Sécurité des opérations et communications',
    description: 'Ces contrôles assurent la sécurité des opérations quotidiennes et des communications.',
    // FIX: Added missing isoMeasureIds property
    isoMeasureIds: ['8.1', '8.6', '8.7', '8.8', '8.10', '8.11', '8.12', '8.13', '8.14', '8.20', '8.21', '8.22', '8.23', '8.24'],
  },
  {
    id: 'incidents-continuite',
    name: '9. Gestion des incidents et continuité',
    description: 'Ces contrôles établissent les capacités de détection, réponse et récupération face aux incidents et perturbations.',
    // FIX: Added missing isoMeasureIds property
    isoMeasureIds: ['5.24', '5.25', '5.26', '5.27', '5.28', '5.29', '5.30'],
  },
  {
    id: 'developpement-maintenance',
    name: '10. Développement et maintenance sécurisés',
    description: 'Ces contrôles intègrent la sécurité dans tout le cycle de développement logiciel.',
    // FIX: Added missing isoMeasureIds property
    isoMeasureIds: ['8.25', '8.26', '8.27', '8.28', '8.29', '8.30', '8.31', '8.33', '8.34'],
  },
  {
    id: 'surveillance-journalisation',
    name: '11. Surveillance et journalisation',
    description: 'Ces contrôles assurent la traçabilité et la détection des anomalies.',
    // FIX: Added missing isoMeasureIds property
    isoMeasureIds: ['8.15', '8.16', '8.17', '8.18'],
  },
  {
    id: 'configuration-changements',
    name: '12. Gestion de la configuration et des changements',
    description: 'Ces contrôles maintiennent l\'intégrité des systèmes face aux modifications.',
    // FIX: Added missing isoMeasureIds property
    isoMeasureIds: ['8.9', '8.19', '8.32'],
  }
];
