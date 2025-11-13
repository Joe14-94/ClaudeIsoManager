
import { Initiative } from '../types';

export const initiatives: Initiative[] = [
  {
    id: 'init-demo-A',
    code: 'INIT-A',
    label: 'Modernisation du SOC',
    description: "Améliorer les capacités de détection et de réponse via de nouveaux outils (SIEM, SOAR) et processus.",
    isoMeasureIds: ['8.16', '5.26', '5.7'],
    createdAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'init-demo-B',
    code: 'INIT-B',
    label: 'Sécurité du Cloud',
    description: "Définir et mettre en œuvre le cadre de sécurité pour l'utilisation des services cloud (IaaS, PaaS, SaaS).",
    isoMeasureIds: ['5.23', '8.9', '8.12'],
    createdAt: '2025-02-20T00:00:00Z',
  },
  {
    id: 'init-demo-C',
    code: 'INIT-C',
    label: 'Gouvernance des Données',
    description: "Mettre en place la classification des données et les contrôles de protection associés.",
    isoMeasureIds: ['5.12', '5.13', '8.11'],
    createdAt: '2025-03-10T00:00:00Z',
  },
  {
    id: 'init-demo-D',
    code: 'INIT-D',
    label: 'Architecture Zero Trust',
    description: "Faire évoluer l'architecture réseau et applicative vers un modèle Zero Trust.",
    isoMeasureIds: ['8.5', '8.22', '5.15'],
    createdAt: '2025-04-05T00:00:00Z',
  }
];