
import { Objective } from '../types';

export const objectives: Objective[] = [
  {
    "id": "obj-demo-1.1.1",
    "code": "OBJ-1.1.1",
    "label": "Refondre la PSSI et les politiques associées",
    "description": "Mettre à jour le corpus documentaire pour refléter les nouvelles menaces et réglementations.",
    "chantierId": "ch-demo-1.1",
    "strategicOrientations": ["so-demo-1"],
    "createdAt": "2025-11-01T10:00:00Z",
    "mesures_iso": [{"domaine": "5. Mesures Organisationnelles", "numero_mesure": "5.1", "titre": "Politiques de sécurité", "description": "Réviser la PSSI.", "niveau_application": ""}]
  },
  {
    "id": "obj-demo-1.1.2",
    "code": "OBJ-1.1.2",
    "label": "Accroître la culture sécurité",
    "description": "Réduire le taux de clics lors des campagnes de phishing de 50%.",
    "chantierId": "ch-demo-1.1",
    "strategicOrientations": ["so-demo-1"],
    "createdAt": "2025-11-01T10:00:00Z",
    "mesures_iso": [{"domaine": "6. Mesures relatives aux personnes", "numero_mesure": "6.3", "titre": "Sensibilisation", "description": "Former le personnel aux risques.", "niveau_application": ""}]
  },
  {
    "id": "obj-demo-1.2.1",
    "code": "OBJ-1.2.1",
    "label": "Généraliser la revue des comptes à privilèges",
    "description": "Mettre en place une revue trimestrielle certifiée de tous les comptes administrateurs.",
    "chantierId": "ch-demo-1.2",
    "strategicOrientations": ["so-demo-1"],
    "createdAt": "2025-11-01T10:00:00Z",
    "mesures_iso": [{"domaine": "5. Mesures Organisationnelles", "numero_mesure": "5.18", "titre": "Droits d'accès", "description": "Revue des droits d'accès.", "niveau_application": ""}]
  },
  {
    "id": "obj-demo-1.2.2",
    "code": "OBJ-1.2.2",
    "label": "Auditer les 10 fournisseurs les plus critiques",
    "description": "Réaliser un audit de sécurité chez les 10 principaux fournisseurs et sous-traitants.",
    "chantierId": "ch-demo-1.2",
    "strategicOrientations": ["so-demo-1"],
    "createdAt": "2025-11-01T10:00:00Z",
    "mesures_iso": [{"domaine": "5. Mesures Organisationnelles", "numero_mesure": "5.22", "titre": "Surveillance des services fournisseurs", "description": "Auditer les fournisseurs.", "niveau_application": ""}]
  },
  {
    "id": "obj-demo-2.1.1",
    "code": "OBJ-2.1.1",
    "label": "Déployer le MFA sur 100% des accès externes",
    "description": "Imposer l'authentification multifacteur pour toutes les connexions depuis l'extérieur du SI.",
    "chantierId": "ch-demo-2.1",
    "strategicOrientations": ["so-demo-2"],
    "createdAt": "2025-11-01T10:00:00Z",
    "mesures_iso": [{"domaine": "8. Mesures Technologiques", "numero_mesure": "8.5", "titre": "Authentification sécurisée", "description": "Mise en place du MFA.", "niveau_application": ""}]
  },
  {
    "id": "obj-demo-2.1.2",
    "code": "OBJ-2.1.2",
    "label": "Chiffrer 100% des postes de travail nomades",
    "description": "Assurer le chiffrement complet du disque sur tous les ordinateurs portables.",
    "chantierId": "ch-demo-2.1",
    "strategicOrientations": ["so-demo-2"],
    "createdAt": "2025-11-01T10:00:00Z",
    "mesures_iso": [{"domaine": "8. Mesures Technologiques", "numero_mesure": "8.1", "titre": "Terminaux finaux des utilisateurs", "description": "Chiffrement des postes.", "niveau_application": ""}]
  },
  {
    "id": "obj-demo-2.2.1",
    "code": "OBJ-2.2.1",
    "label": "Déployer un EDR sur 95% des serveurs critiques",
    "description": "Installer et configurer une solution EDR sur le périmètre des serveurs critiques.",
    "chantierId": "ch-demo-2.2",
    "strategicOrientations": ["so-demo-2", "so-demo-3"],
    "createdAt": "2025-11-01T10:00:00Z",
    "mesures_iso": [{"domaine": "8. Mesures Technologiques", "numero_mesure": "8.7", "titre": "Protection contre les malwares", "description": "Déploiement EDR.", "niveau_application": ""}]
  },
   {
    "id": "obj-demo-2.2.2",
    "code": "OBJ-2.2.2",
    "label": "Réduire le nombre de vulnérabilités critiques de 80%",
    "description": "Mettre en place un processus de patch management efficace pour les vulnérabilités critiques.",
    "chantierId": "ch-demo-2.2",
    "strategicOrientations": ["so-demo-2"],
    "createdAt": "2025-11-01T10:00:00Z",
    "mesures_iso": [{"domaine": "8. Mesures Technologiques", "numero_mesure": "8.8", "titre": "Gestion des vulnérabilités", "description": "Patch management.", "niveau_application": ""}]
  },
  {
    "id": "obj-demo-3.1.1",
    "code": "OBJ-3.1.1",
    "label": "Centraliser 100% des logs de sécurité dans le SIEM",
    "description": "Intégrer toutes les sources de logs pertinentes dans l'outil SIEM central.",
    "chantierId": "ch-demo-3.1",
    "strategicOrientations": ["so-demo-3"],
    "createdAt": "2025-11-01T10:00:00Z",
    "mesures_iso": [{"domaine": "8. Mesures Technologiques", "numero_mesure": "8.15", "titre": "Journalisation", "description": "Centralisation des logs.", "niveau_application": ""}]
  },
   {
    "id": "obj-demo-3.1.2",
    "code": "OBJ-3.1.2",
    "label": "Réaliser des tests d'intrusion sur toutes les applications critiques",
    "description": "Planifier et exécuter des pentests annuels sur le périmètre des applications critiques.",
    "chantierId": "ch-demo-3.1",
    "strategicOrientations": ["so-demo-3"],
    "createdAt": "2025-11-01T10:00:00Z",
    "mesures_iso": [{"domaine": "5. Mesures Organisationnelles", "numero_mesure": "5.35", "titre": "Révision indépendante", "description": "Tests d'intrusion.", "niveau_application": ""}]
  },
  {
    "id": "obj-demo-4.1.1",
    "code": "OBJ-4.1.1",
    "label": "Formaliser les plans de continuité pour 5 applications critiques",
    "description": "Rédiger et valider les PCA/PRA pour les 5 applications les plus critiques de l'entreprise.",
    "chantierId": "ch-demo-4.1",
    "strategicOrientations": ["so-demo-4"],
    "createdAt": "2025-11-01T10:00:00Z",
    "mesures_iso": [{"domaine": "5. Mesures Organisationnelles", "numero_mesure": "5.29", "titre": "Sécurité pendant une perturbation", "description": "Plans de continuité.", "niveau_application": ""}]
  },
  {
    "id": "obj-demo-4.2.1",
    "code": "OBJ-4.2.1",
    "label": "Réaliser un exercice de crise cyber annuel",
    "description": "Simuler une cyberattaque majeure pour tester la cellule de crise et les processus de réponse.",
    "chantierId": "ch-demo-4.2",
    "strategicOrientations": ["so-demo-4"],
    "createdAt": "2025-11-01T10:00:00Z",
    "mesures_iso": [{"domaine": "5. Mesures Organisationnelles", "numero_mesure": "5.26", "titre": "Réponse aux incidents", "description": "Exercice de crise.", "niveau_application": ""}]
  }
];
