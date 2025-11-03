import { SecurityProcess } from '../types';

export const securityProcesses: SecurityProcess[] = [
  {
    id: 'gouvernance-politiques',
    name: '1. Gouvernance et politiques de sécurité',
    description: 'Ces contrôles établissent le cadre de gouvernance, définissent les orientations stratégiques et organisent la structure de responsabilité en matière de sécurité.'
  },
  {
    id: 'risques-conformite',
    name: '2. Gestion des risques et conformité',
    description: 'Ces contrôles assurent l\'identification, l\'évaluation et le traitement des risques, ainsi que le respect des exigences légales et réglementaires.'
  },
  {
    id: 'actifs-classification',
    name: '3. Gestion des actifs et classification',
    description: 'Ces contrôles établissent un système complet de gestion du cycle de vie des actifs informationnels, de leur identification à leur protection.'
  },
  {
    id: 'ressources-humaines',
    name: '4. Gestion des ressources humaines',
    description: 'Ces contrôles gèrent les aspects humains de la sécurité tout au long du cycle d\'emploi.'
  },
  {
    id: 'identites-acces',
    name: '5. Gestion des identités et des accès',
    description: 'Ces contrôles assurent que seules les personnes autorisées accèdent aux ressources appropriées avec le bon niveau de privilège.'
  },
  {
    id: 'securite-physique',
    name: '6. Sécurité physique et environnementale',
    description: 'Ces contrôles protègent les installations, équipements et supports physiques contre les accès non autorisés et les dommages.'
  },
  {
    id: 'fournisseurs-tiers',
    name: '7. Gestion des fournisseurs et tiers',
    description: 'Ces contrôles gèrent les risques liés aux relations avec les parties externes et l\'utilisation de services tiers.'
  },
  {
    id: 'operations-communications',
    name: '8. Sécurité des opérations et communications',
    description: 'Ces contrôles assurent la sécurité des opérations quotidiennes et des communications.'
  },
  {
    id: 'incidents-continuite',
    name: '9. Gestion des incidents et continuité',
    description: 'Ces contrôles établissent les capacités de détection, réponse et récupération face aux incidents et perturbations.'
  },
  {
    id: 'developpement-maintenance',
    name: '10. Développement et maintenance sécurisés',
    description: 'Ces contrôles intègrent la sécurité dans tout le cycle de développement logiciel.'
  },
  {
    id: 'surveillance-journalisation',
    name: '11. Surveillance et journalisation',
    description: 'Ces contrôles assurent la traçabilité et la détection des anomalies.'
  },
  {
    id: 'configuration-changements',
    name: '12. Gestion de la configuration et des changements',
    description: 'Ces contrôles maintiennent l\'intégrité des systèmes face aux modifications.'
  }
];
