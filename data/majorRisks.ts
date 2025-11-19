
import { MajorRisk } from '../types';

export const majorRisks: MajorRisk[] = [
  { id: 'risk-ransomware', label: 'Cybercriminalité / Rançongiciel', description: 'Attaque par chiffrement des données avec demande de rançon.', category: 'Menace Externe' },
  { id: 'risk-leak', label: 'Fuite de données sensibles', description: 'Exfiltration de données confidentielles (clients, stratégiques).', category: 'Confidentialité' },
  { id: 'risk-availability', label: 'Indisponibilité Système Critique', description: 'Arrêt de production suite à panne ou attaque.', category: 'Disponibilité' },
  { id: 'risk-compliance', label: 'Non-conformité Réglementaire', description: 'Sanctions (RGPD, NIS2, DORA) suite à un audit.', category: 'Conformité' },
  { id: 'risk-supplychain', label: 'Compromission Tiers (Supply Chain)', description: 'Attaque rebond via un prestataire ou fournisseur.', category: 'Menace Externe' },
  { id: 'risk-obsolescence', label: 'Obsolescence Technologique', description: 'Vulnérabilités non patchables sur systèmes en fin de vie.', category: 'Dette Technique' },
  { id: 'risk-fraud', label: 'Fraude au Président / FOVI', description: 'Ingénierie sociale visant les virements bancaires.', category: 'Menace Externe' },
  { id: 'risk-insider', label: 'Menace Interne', description: 'Action malveillante ou erreur d\'un collaborateur.', category: 'Interne' },
];
