
import { Activity, ActivityStatus, Priority, ActivityType, SecurityDomain, Chantier, Initiative, MajorRisk, Objective, StrategicOrientation, Project, ProjectStatus, TShirtSize, ProjectCategory, ProjectWeather, TaskStatus, Resource, SecurityProcess } from '../types';

export const demoData = {
    majorRisks: [
        { id: 'risk-ransomware', label: 'Cybercriminalité / Rançongiciel', description: 'Attaque par chiffrement des données avec demande de rançon.', category: 'Menace Externe' },
        { id: 'risk-leak', label: 'Fuite de données sensibles', description: 'Exfiltration de données confidentielles (clients, stratégiques).', category: 'Confidentialité' },
        { id: 'risk-availability', label: 'Indisponibilité Système Critique', description: 'Arrêt de production suite à panne ou attaque.', category: 'Disponibilité' },
        { id: 'risk-compliance', label: 'Non-conformité Réglementaire', description: 'Sanctions (RGPD, NIS2, DORA) suite à un audit.', category: 'Conformité' },
        { id: 'risk-supplychain', label: 'Compromission Tiers (Supply Chain)', description: 'Attaque rebond via un prestataire ou fournisseur.', category: 'Menace Externe' },
        { id: 'risk-obsolescence', label: 'Obsolescence Technologique', description: 'Vulnérabilités non patchables sur systèmes en fin de vie.', category: 'Dette Technique' },
        { id: 'risk-fraud', label: 'Fraude au Président / FOVI', description: 'Ingénierie sociale visant les virements bancaires.', category: 'Menace Externe' },
        { id: 'risk-insider', label: 'Menace Interne', description: 'Action malveillante ou erreur d\'un collaborateur.', category: 'Interne' },
    ] as MajorRisk[],

    resources: [
        { id: 'res-demo-1', name: 'Alice Martin', entity: 'Équipe Sécurité Opérationnelle (SecOps)' },
        { id: 'res-demo-2', name: 'Bruno Lemaire', entity: 'Développement Applicatif (DEV)' },
        { id: 'res-demo-3', name: 'Chloé Dubois', entity: 'Gouvernance, Risque et Conformité (GRC)' },
        { id: 'res-demo-4', name: 'David Moreau', entity: 'Infrastructure & Réseau' },
        { id: 'res-demo-5', name: 'Eva Petit', entity: 'Project Management Office (PMO)' },
        { id: 'res-demo-6', name: 'Fabien Joly', entity: 'Support Utilisateurs' }
    ] as Resource[],

    securityProcesses: [
        { id: 'proc-demo-1', name: '1. Gouvernance et politiques de sécurité', description: 'Définition, approbation et communication des politiques et directives de sécurité.', isoMeasureIds: ['5.1', '5.2', '5.3', '5.4', '5.37'] },
        { id: 'proc-demo-2', name: '2. Gestion des risques et conformité', description: 'Identification, évaluation et traitement des risques de sécurité, et veille réglementaire.', isoMeasureIds: ['5.5', '5.6', '5.7', '5.8', '5.31', '5.32', '5.33', '5.34', '5.35', '5.36'] },
        { id: 'proc-demo-3', name: '3. Gestion des actifs et classification', description: 'Inventaire, classification et gestion du cycle de vie des actifs informationnels.', isoMeasureIds: ['5.9', '5.10', '5.11', '5.12', '5.13', '5.14'] },
        { id: 'proc-demo-4', name: '4. Gestion des ressources humaines', description: 'Processus de sécurité liés au cycle de vie des employés (arrivée, mobilité, départ).', isoMeasureIds: ['6.1', '6.2', '6.3', '6.4', '6.5', '6.6', '6.7', '6.8'] },
        { id: 'proc-demo-5', name: '5. Gestion des identités et des accès (IAM)', description: 'Gestion du cycle de vie des identités et de leurs droits d\'accès aux ressources.', isoMeasureIds: ['5.15', '5.16', '5.17', '5.18', '8.2', '8.3', '8.4', '8.5'] },
        { id: 'proc-demo-7', name: '7. Gestion des fournisseurs et tiers', description: 'Sécurisation des relations et des services fournis par des entités externes.', isoMeasureIds: ['5.19', '5.20', '5.21', '5.22', '5.23'] },
        { id: 'proc-demo-9', name: '9. Gestion des incidents et continuité', description: 'Préparation, détection, réponse aux incidents de sécurité et planification de la continuité.', isoMeasureIds: ['5.24', '5.25', '5.26', '5.27', '5.28', '5.29', '5.30'] },
        { id: 'proc-demo-10', name: '10. Développement et maintenance sécurisés', description: 'Intégration de la sécurité dans le cycle de vie de développement logiciel (DevSecOps).', isoMeasureIds: ['8.25', '8.26', '8.27', '8.28', '8.29', '8.30', '8.31', '8.33', '8.34'] }
    ] as SecurityProcess[],

    orientations: [
        { id: "so-demo-1", code: "OS-GOUV", label: "Gouvernance & Conformité", description: "Structurer le pilotage de la sécurité, maîtriser les risques et assurer la conformité réglementaire.", createdAt: "2025-11-01T10:00:00Z", color: "#9333ea" },
        { id: "so-demo-2", code: "OS-PROT", label: "Protection des Actifs", description: "Renforcer la protection des données, des applications et des infrastructures contre les menaces.", createdAt: "2025-11-01T10:00:00Z", color: "#2563eb" },
        { id: "so-demo-3", code: "OS-DETEC", label: "Détection & Réponse", description: "Améliorer les capacités à détecter les incidents de sécurité et à y répondre efficacement.", createdAt: "2025-11-01T10:00:00Z", color: "#db2777" },
        { id: "so-demo-4", code: "OS-RESIL", label: "Résilience Opérationnelle", description: "Assurer la continuité et la reprise des activités en cas d'incident ou de crise majeure.", createdAt: "2025-11-01T10:00:00Z", color: "#16a34a" }
    ] as StrategicOrientation[],

    chantiers: [
        { id: "ch-demo-1.1", code: "C-DEMO-1.1", label: "Cadre Politique et Documentaire", description: "Structurer et maintenir le corpus documentaire de la cybersécurité.", strategicOrientationId: "so-demo-1", createdAt: "2025-11-01T10:00:00Z" },
        { id: "ch-demo-1.2", code: "C-DEMO-1.2", label: "Gestion des Risques et des Tiers", description: "Piloter les risques et sécuriser les relations avec les fournisseurs.", strategicOrientationId: "so-demo-1", createdAt: "2025-11-01T10:00:00Z" },
        { id: "ch-demo-2.1", code: "C-DEMO-2.1", label: "Sécurisation des Données et des Accès", description: "Protéger l'information par la classification et le contrôle des accès.", strategicOrientationId: "so-demo-2", createdAt: "2025-11-01T10:00:00Z" },
        { id: "ch-demo-2.2", code: "C-DEMO-2.2", label: "Renforcement des Infrastructures", description: "Durcir les systèmes, les réseaux et les postes de travail.", strategicOrientationId: "so-demo-2", createdAt: "2025-11-01T10:00:00Z" },
        { id: "ch-demo-3.1", code: "C-DEMO-3.1", label: "Surveillance et Détection", description: "Améliorer les capacités de détection des incidents de sécurité.", strategicOrientationId: "so-demo-3", createdAt: "2025-11-01T10:00:00Z" },
        { id: "ch-demo-4.1", code: "C-DEMO-4.1", label: "Planification de la Continuité", description: "Définir et formaliser les stratégies de continuité et de reprise.", strategicOrientationId: "so-demo-4", createdAt: "2025-11-01T10:00:00Z" },
        { id: "ch-demo-4.2", code: "C-DEMO-4.2", label: "Tests et Exercices de Résilience", description: "Valider régulièrement l'efficacité des plans de continuité d'activité.", strategicOrientationId: "so-demo-4", createdAt: "2025-11-01T10:00:00Z" }
    ] as Chantier[],

    objectives: [
        { id: "obj-demo-1.1.1", code: "OBJ-1.1.1", label: "Refondre la PSSI et les politiques associées", description: "Mettre à jour le corpus documentaire pour refléter les nouvelles menaces et réglementations.", chantierId: "ch-demo-1.1", strategicOrientations: ["so-demo-1"], createdAt: "2025-11-01T10:00:00Z", mesures_iso: [{"domaine": "5. Mesures Organisationnelles", "numero_mesure": "5.1", "titre": "Politiques de sécurité", "description": "Réviser la PSSI.", "niveau_application": ""}] },
        { id: "obj-demo-1.1.2", code: "OBJ-1.1.2", label: "Accroître la culture sécurité", description: "Réduire le taux de clics lors des campagnes de phishing de 50%.", chantierId: "ch-demo-1.1", strategicOrientations: ["so-demo-1"], createdAt: "2025-11-01T10:00:00Z", mesures_iso: [{"domaine": "6. Mesures relatives aux personnes", "numero_mesure": "6.3", "titre": "Sensibilisation", "description": "Former le personnel aux risques.", "niveau_application": ""}] },
        { id: "obj-demo-1.2.1", code: "OBJ-1.2.1", label: "Généraliser la revue des comptes à privilèges", description: "Mettre en place une revue trimestrielle certifiée de tous les comptes administrateurs.", chantierId: "ch-demo-1.2", strategicOrientations: ["so-demo-1"], createdAt: "2025-11-01T10:00:00Z", mesures_iso: [{"domaine": "5. Mesures Organisationnelles", "numero_mesure": "5.18", "titre": "Droits d'accès", "description": "Revue des droits d'accès.", "niveau_application": ""}] },
        { id: "obj-demo-1.2.2", code: "OBJ-1.2.2", label: "Auditer les 10 fournisseurs les plus critiques", description: "Réaliser un audit de sécurité chez les 10 principaux fournisseurs et sous-traitants.", chantierId: "ch-demo-1.2", strategicOrientations: ["so-demo-1"], createdAt: "2025-11-01T10:00:00Z", mesures_iso: [{"domaine": "5. Mesures Organisationnelles", "numero_mesure": "5.22", "titre": "Surveillance des services fournisseurs", "description": "Auditer les fournisseurs.", "niveau_application": ""}] },
        { id: "obj-demo-2.1.1", code: "OBJ-2.1.1", label: "Déployer le MFA sur 100% des accès externes", description: "Imposer l'authentification multifacteur pour toutes les connexions depuis l'extérieur du SI.", chantierId: "ch-demo-2.1", strategicOrientations: ["so-demo-2"], createdAt: "2025-11-01T10:00:00Z", mesures_iso: [{"domaine": "8. Mesures Technologiques", "numero_mesure": "8.5", "titre": "Authentification sécurisée", "description": "Mise en place du MFA.", "niveau_application": ""}] },
        { id: "obj-demo-2.1.2", code: "OBJ-2.1.2", label: "Chiffrer 100% des postes de travail nomades", description: "Assurer le chiffrement complet du disque sur tous les ordinateurs portables.", chantierId: "ch-demo-2.1", strategicOrientations: ["so-demo-2"], createdAt: "2025-11-01T10:00:00Z", mesures_iso: [{"domaine": "8. Mesures Technologiques", "numero_mesure": "8.1", "titre": "Terminaux finaux des utilisateurs", "description": "Chiffrement des postes.", "niveau_application": ""}] },
        { id: "obj-demo-2.2.1", code: "OBJ-2.2.1", label: "Déployer un EDR sur 95% des serveurs critiques", description: "Installer et configurer une solution EDR sur le périmètre des serveurs critiques.", chantierId: "ch-demo-2.2", strategicOrientations: ["so-demo-2", "so-demo-3"], createdAt: "2025-11-01T10:00:00Z", mesures_iso: [{"domaine": "8. Mesures Technologiques", "numero_mesure": "8.7", "titre": "Protection contre les malwares", "description": "Déploiement EDR.", "niveau_application": ""}] },
        { id: "obj-demo-2.2.2", code: "OBJ-2.2.2", label: "Réduire le nombre de vulnérabilités critiques de 80%", description: "Mettre en place un processus de patch management efficace pour les vulnérabilités critiques.", chantierId: "ch-demo-2.2", strategicOrientations: ["so-demo-2"], createdAt: "2025-11-01T10:00:00Z", mesures_iso: [{"domaine": "8. Mesures Technologiques", "numero_mesure": "8.8", "titre": "Gestion des vulnérabilités", "description": "Patch management.", "niveau_application": ""}] },
        { id: "obj-demo-3.1.1", code: "OBJ-3.1.1", label: "Centraliser 100% des logs de sécurité dans le SIEM", description: "Intégrer toutes les sources de logs pertinentes dans l'outil SIEM central.", chantierId: "ch-demo-3.1", strategicOrientations: ["so-demo-3"], createdAt: "2025-11-01T10:00:00Z", mesures_iso: [{"domaine": "8. Mesures Technologiques", "numero_mesure": "8.15", "titre": "Journalisation", "description": "Centralisation des logs.", "niveau_application": ""}] },
        { id: "obj-demo-3.1.2", code: "OBJ-3.1.2", label: "Réaliser des tests d'intrusion sur toutes les applications critiques", description: "Planifier et exécuter des pentests annuels sur le périmètre des applications critiques.", chantierId: "ch-demo-3.1", strategicOrientations: ["so-demo-3"], createdAt: "2025-11-01T10:00:00Z", mesures_iso: [{"domaine": "5. Mesures Organisationnelles", "numero_mesure": "5.35", "titre": "Révision indépendante", "description": "Tests d'intrusion.", "niveau_application": ""}] },
        { id: "obj-demo-4.1.1", code: "OBJ-4.1.1", label: "Formaliser les plans de continuité pour 5 applications critiques", description: "Rédiger et valider les PCA/PRA pour les 5 applications les plus critiques de l'entreprise.", chantierId: "ch-demo-4.1", strategicOrientations: ["so-demo-4"], createdAt: "2025-11-01T10:00:00Z", mesures_iso: [{"domaine": "5. Mesures Organisationnelles", "numero_mesure": "5.29", "titre": "Sécurité pendant une perturbation", "description": "Plans de continuité.", "niveau_application": ""}] },
        { id: "obj-demo-4.2.1", code: "OBJ-4.2.1", label: "Réaliser un exercice de crise cyber annuel", description: "Simuler une cyberattaque majeure pour tester la cellule de crise et les processus de réponse.", chantierId: "ch-demo-4.2", strategicOrientations: ["so-demo-4"], createdAt: "2025-11-01T10:00:00Z", mesures_iso: [{"domaine": "5. Mesures Organisationnelles", "numero_mesure": "5.26", "titre": "Réponse aux incidents", "description": "Exercice de crise.", "niveau_application": ""}] }
    ] as Objective[],

    initiatives: [
        { id: 'init-demo-A', code: 'INIT-A', label: 'Modernisation du SOC', description: "Améliorer les capacités de détection et de réponse via de nouveaux outils (SIEM, SOAR) et processus.", isoMeasureIds: ['8.16', '5.26', '5.7'], createdAt: '2025-01-15T00:00:00Z' },
        { id: 'init-demo-B', code: 'INIT-B', label: 'Sécurité du Cloud', description: "Définir et mettre en œuvre le cadre de sécurité pour l'utilisation des services cloud (IaaS, PaaS, SaaS).", isoMeasureIds: ['5.23', '8.9', '8.12'], createdAt: '2025-02-20T00:00:00Z' },
        { id: 'init-demo-C', code: 'INIT-C', label: 'Gouvernance des Données', description: "Mettre en place la classification des données et les contrôles de protection associés.", isoMeasureIds: ['5.12', '5.13', '8.11'], createdAt: '2025-03-10T00:00:00Z' },
        { id: 'init-demo-D', code: 'INIT-D', label: 'Architecture Zero Trust', description: "Faire évoluer l'architecture réseau et applicative vers un modèle Zero Trust.", isoMeasureIds: ['8.5', '8.22', '5.15'], createdAt: '2025-04-05T00:00:00Z' }
    ] as Initiative[],

    projects: [
      {
        id: 'proj-demo-1',
        projectId: 'P25-001',
        title: 'Déploiement EDR Global',
        description: 'Déploiement de la solution CrowdStrike Falcon sur l\'ensemble du parc (Serveurs & Postes de travail).',
        status: ProjectStatus.NO,
        tShirtSize: TShirtSize.L,
        projectManagerMOA: 'res-demo-3',
        projectManagerMOE: 'res-demo-1',
        projectStartDate: '2025-06-01T00:00:00Z',
        projectEndDate: '2026-08-30T00:00:00Z', // Prolongé suite au retard du pilote
        goLiveDate: '2026-07-31T00:00:00Z',
        isTop30: true,
        category: ProjectCategory.PROJECT,
        createdAt: '2025-04-01T00:00:00Z',
        updatedAt: '2025-11-01T00:00:00Z',
        initiativeId: 'init-demo-A',
        isoMeasures: ['8.7', '8.16'],
        predecessorIds: [],
        budgetRequested: 150000,
        budgetApproved: 120000,
        budgetCommitted: 75000,
        completedPV: 45000,
        forecastedPurchaseOrders: 40000,
        internalWorkloadRequested: 100, 
        internalWorkloadEngaged: 80,
        internalWorkloadConsumed: 57,
        externalWorkloadRequested: 50, 
        externalWorkloadEngaged: 50,
        externalWorkloadConsumed: 30,
        weather: ProjectWeather.CLOUDY,
        weatherDescription: "Retard constaté sur la phase pilote due à des incompatibilités logicielles.",
        strategicImpact: 5,
        riskCoverage: 5,
        effort: 3,
        priorityScore: 8.3,
        majorRiskIds: ['risk-ransomware', 'risk-insider', 'risk-availability'],
        milestones: [
            { 
                id: 'm1', 
                label: 'Validation Architecture', 
                date: '2025-07-15T00:00:00Z', 
                initialDate: '2025-07-01T00:00:00Z', 
                completed: true, 
                history: [
                    { updatedAt: '2025-06-20T10:00:00Z', previousDate: '2025-07-01T00:00:00Z', newDate: '2025-07-15T00:00:00Z'}
                ] 
            },
            { 
                id: 'm2', 
                label: 'Fin du Pilote', 
                date: '2025-11-30T00:00:00Z', // Retardé
                initialDate: '2025-10-15T00:00:00Z', 
                completed: false, 
                history: [
                    { updatedAt: '2025-09-01T10:00:00Z', previousDate: '2025-10-15T00:00:00Z', newDate: '2025-10-30T00:00:00Z'},
                    { updatedAt: '2025-10-25T10:00:00Z', previousDate: '2025-10-30T00:00:00Z', newDate: '2025-11-30T00:00:00Z'}
                ] 
            },
            { 
                id: 'm3', 
                label: 'Déploiement Général', 
                date: '2026-07-31T00:00:00Z', 
                initialDate: '2026-05-30T00:00:00Z', 
                completed: false, 
                history: [] 
            },
        ],
        tasks: [
          { id: 'p1-ph1', name: 'Phase 1 : Cadrage & Architecture', startDate: '2025-06-01T00:00:00Z', endDate: '2025-07-15T00:00:00Z', progress: 100, status: TaskStatus.DONE, children: [
              { id: 'p1-t1', name: 'Ateliers de cadrage', startDate: '2025-06-01T00:00:00Z', endDate: '2025-06-15T00:00:00Z', progress: 100, status: TaskStatus.DONE, assigneeId: 'res-demo-1' },
              { id: 'p1-t2', name: 'Définition architecture technique', startDate: '2025-06-16T00:00:00Z', endDate: '2025-06-30T00:00:00Z', progress: 100, status: TaskStatus.DONE, assigneeId: 'res-demo-4', dependencyIds: ['p1-t1'] },
              { id: 'p1-t3', name: 'Validation DAT', startDate: '2025-07-01T00:00:00Z', endDate: '2025-07-15T00:00:00Z', progress: 100, status: TaskStatus.DONE, assigneeId: 'res-demo-3', dependencyIds: ['p1-t2'] },
              { id: 'p1-m1', name: 'Jalon : Architecture Validée', startDate: '2025-07-15T00:00:00Z', endDate: '2025-07-15T00:00:00Z', progress: 100, status: TaskStatus.DONE, dependencyIds: ['p1-t3'] },
            ]
          },
          { id: 'p1-ph2', name: 'Phase 2 : Pilote', startDate: '2025-07-16T00:00:00Z', endDate: '2025-11-30T00:00:00Z', progress: 80, status: TaskStatus.IN_PROGRESS, dependencyIds: ['p1-ph1'], children: [
              { id: 'p1-t4', name: 'Configuration Tenant', startDate: '2025-07-16T00:00:00Z', endDate: '2025-07-30T00:00:00Z', progress: 100, status: TaskStatus.DONE, assigneeId: 'res-demo-1' },
              { id: 'p1-t5', name: 'Déploiement groupe IT', startDate: '2025-08-01T00:00:00Z', endDate: '2025-08-30T00:00:00Z', progress: 100, status: TaskStatus.DONE, assigneeId: 'res-demo-4', dependencyIds: ['p1-t4'] },
              { id: 'p1-t6', name: 'Déploiement périmètre Pilote (500)', startDate: '2025-09-01T00:00:00Z', endDate: '2025-11-30T00:00:00Z', progress: 60, status: TaskStatus.IN_PROGRESS, assigneeId: 'res-demo-6', dependencyIds: ['p1-t5'] },
              { id: 'p1-m2', name: 'Jalon : Fin Pilote', startDate: '2025-11-30T00:00:00Z', endDate: '2025-11-30T00:00:00Z', progress: 0, status: TaskStatus.TODO, dependencyIds: ['p1-t6'] },
            ]
          },
          { id: 'p1-ph3', name: 'Phase 3 : Déploiement Général', startDate: '2025-12-01T00:00:00Z', endDate: '2026-05-30T00:00:00Z', progress: 0, status: TaskStatus.TODO, dependencyIds: ['p1-ph2'], children: [
              { id: 'p1-t7', name: 'Vague 1 : Siège (1500)', startDate: '2025-12-01T00:00:00Z', endDate: '2026-01-31T00:00:00Z', progress: 0, status: TaskStatus.TODO, assigneeId: 'res-demo-6' },
              { id: 'p1-t8', name: 'Vague 2 : Filiales France', startDate: '2026-02-01T00:00:00Z', endDate: '2026-03-31T00:00:00Z', progress: 0, status: TaskStatus.TODO, assigneeId: 'res-demo-6', dependencyIds: ['p1-t7'] },
              { id: 'p1-t9', name: 'Vague 3 : International', startDate: '2026-04-01T00:00:00Z', endDate: '2026-05-30T00:00:00Z', progress: 0, status: TaskStatus.TODO, assigneeId: 'res-demo-4', dependencyIds: ['p1-t8'] },
            ]
          },
          { id: 'p1-ph4', name: 'Phase 4 : RUN & MCO', startDate: '2026-06-01T00:00:00Z', endDate: '2026-08-30T00:00:00Z', progress: 0, status: TaskStatus.TODO, dependencyIds: ['p1-ph3'], children: [
              { id: 'p1-t10', name: 'Formation équipe N1', startDate: '2026-06-01T00:00:00Z', endDate: '2026-06-15T00:00:00Z', progress: 0, status: TaskStatus.TODO, assigneeId: 'res-demo-1' },
              { id: 'p1-t11', name: 'Transfert de compétences', startDate: '2026-06-16T00:00:00Z', endDate: '2026-07-15T00:00:00Z', progress: 0, status: TaskStatus.TODO, assigneeId: 'res-demo-1', dependencyIds: ['p1-t10'] },
              { id: 'p1-m3', name: 'Jalon : Passage en RUN', startDate: '2026-07-15T00:00:00Z', endDate: '2026-07-15T00:00:00Z', progress: 0, status: TaskStatus.TODO, dependencyIds: ['p1-t11'] },
            ]
          }
        ],
        fdrHistory: [
            { week: '44', year: '2025', type: 'budget', importDate: '2025-10-31T12:00:00Z', data: { budgetCommitted: 75000, completedPV: 45000 } },
        ]
      },
      {
        id: 'proj-demo-2',
        projectId: 'P24-012',
        title: 'Migration Cloud Azure',
        description: 'Migration de l\'infrastructure on-premise vers Azure.',
        status: ProjectStatus.NF,
        tShirtSize: TShirtSize.XL,
        projectManagerMOA: 'res-demo-5',
        projectManagerMOE: 'res-demo-4',
        projectStartDate: '2024-01-15T00:00:00Z',
        projectEndDate: '2025-07-30T00:00:00Z',
        isTop30: true,
        category: ProjectCategory.PROJECT,
        createdAt: '2023-11-01T00:00:00Z',
        updatedAt: '2025-08-10T00:00:00Z',
        initiativeId: 'init-demo-B',
        isoMeasures: ['5.23', '7.11'],
        predecessorIds: [],
        budgetRequested: 250000,
        budgetApproved: 250000,
        weather: ProjectWeather.SUNNY,
        priorityScore: 3.0,
        milestones: [
            { 
                id: 'p2-m3', 
                label: 'Migration terminée', 
                date: '2025-06-30T00:00:00Z', 
                initialDate: '2025-06-30T00:00:00Z', 
                completed: true, 
                history: [] 
            }
        ],
        tasks: [
            { id: 'p2-ph1', name: '1. Assessment & Plan', startDate: '2024-01-15T00:00:00Z', endDate: '2024-03-15T00:00:00Z', progress: 100, status: TaskStatus.DONE, children: [
                    { id: 'p2-t1', name: 'Inventaire applicatif', startDate: '2024-01-15T00:00:00Z', endDate: '2024-02-15T00:00:00Z', progress: 100, status: TaskStatus.DONE },
                    { id: 'p2-t2', name: 'Analyse de dépendances', startDate: '2024-02-15T00:00:00Z', endDate: '2024-03-15T00:00:00Z', progress: 100, status: TaskStatus.DONE, dependencyIds: ['p2-t1'] }
                ]
            },
            { id: 'p2-ph2', name: '2. Landing Zone', startDate: '2024-03-16T00:00:00Z', endDate: '2024-05-30T00:00:00Z', progress: 100, status: TaskStatus.DONE, dependencyIds: ['p2-ph1'], children: [
                    { id: 'p2-t3', name: 'Design Architecture', startDate: '2024-03-16T00:00:00Z', endDate: '2024-04-15T00:00:00Z', progress: 100, status: TaskStatus.DONE },
                    { id: 'p2-t4', name: 'Implémentation Hub & Spoke', startDate: '2024-04-16T00:00:00Z', endDate: '2024-05-30T00:00:00Z', progress: 100, status: TaskStatus.DONE, dependencyIds: ['p2-t3'] }
                ]
            },
            { id: 'p2-ph3', name: '3. Migration des Workloads', startDate: '2024-06-01T00:00:00Z', endDate: '2025-06-30T00:00:00Z', progress: 100, status: TaskStatus.DONE, dependencyIds: ['p2-ph2'], children: [
                    { id: 'p2-t5', name: 'Lot 1 : Applications Web', startDate: '2024-06-01T00:00:00Z', endDate: '2024-09-30T00:00:00Z', progress: 100, status: TaskStatus.DONE },
                    { id: 'p2-t6', name: 'Lot 2 : Bases de données', startDate: '2024-10-01T00:00:00Z', endDate: '2025-02-28T00:00:00Z', progress: 100, status: TaskStatus.DONE, dependencyIds: ['p2-t5'] },
                    { id: 'p2-t7', name: 'Lot 3 : Legacy', startDate: '2025-03-01T00:00:00Z', endDate: '2025-06-30T00:00:00Z', progress: 100, status: TaskStatus.DONE, dependencyIds: ['p2-t6'] }
                ]
            }
        ]
      },
       {
        id: 'proj-demo-3',
        projectId: 'P25-003',
        title: 'Outil de Data Classification',
        description: 'Mise en place d\'un outil pour classifier et étiqueter automatiquement les données sensibles.',
        status: ProjectStatus.NT,
        tShirtSize: TShirtSize.M,
        projectManagerMOA: 'res-demo-3',
        projectManagerMOE: 'res-demo-2',
        projectStartDate: '2025-09-01T00:00:00Z',
        projectEndDate: '2026-04-01T00:00:00Z',
        isTop30: false,
        category: ProjectCategory.PROJECT,
        initiativeId: 'init-demo-C',
        isoMeasures: ['5.12', '5.13', '8.11'],
        budgetRequested: 80000,
        budgetApproved: 60000,
        predecessorIds: [], 
        createdAt: '2025-09-01T00:00:00Z',
        updatedAt: '2025-10-15T00:00:00Z',
        weather: ProjectWeather.CLOUDY,
        weatherDescription: "Retard sur la livraison de l'éditeur.",
        strategicImpact: 4,
        priorityScore: 5.3,
        tasks: [
            { id: 'p3-ph1', name: 'Phase 1 : Sélection', startDate: '2025-09-01T00:00:00Z', endDate: '2025-10-15T00:00:00Z', progress: 100, status: TaskStatus.DONE, children: [
                    { id: 'p3-t1', name: 'RFI / RFP', startDate: '2025-09-01T00:00:00Z', endDate: '2025-09-30T00:00:00Z', progress: 100, status: TaskStatus.DONE },
                    { id: 'p3-t2', name: 'Contractualisation', startDate: '2025-10-01T00:00:00Z', endDate: '2025-10-15T00:00:00Z', progress: 100, status: TaskStatus.DONE, dependencyIds: ['p3-t1'] },
                    { id: 'p3-m1', name: 'Jalon : Outil Choisi', startDate: '2025-10-15T00:00:00Z', endDate: '2025-10-15T00:00:00Z', progress: 100, status: TaskStatus.DONE, dependencyIds: ['p3-t2'] }
                ]
            },
            { id: 'p3-ph2', name: 'Phase 2 : Implémentation', startDate: '2025-10-16T00:00:00Z', endDate: '2026-01-31T00:00:00Z', progress: 20, status: TaskStatus.IN_PROGRESS, dependencyIds: ['p3-ph1'], children: [
                    { id: 'p3-t3', name: 'Installation & Config', startDate: '2025-10-16T00:00:00Z', endDate: '2025-11-15T00:00:00Z', progress: 80, status: TaskStatus.IN_PROGRESS },
                    { id: 'p3-t4', name: 'POC (Proof of Concept)', startDate: '2025-11-15T00:00:00Z', endDate: '2025-12-15T00:00:00Z', progress: 0, status: TaskStatus.TODO, dependencyIds: ['p3-t3'] },
                    { id: 'p3-t5', name: 'Déploiement Agents', startDate: '2026-01-01T00:00:00Z', endDate: '2026-01-31T00:00:00Z', progress: 0, status: TaskStatus.TODO, dependencyIds: ['p3-t4'] }
                ]
            }
        ]
      },
      {
        id: 'proj-demo-4',
        projectId: 'P26-001',
        title: 'Refonte de l\'IAM',
        description: 'Remplacer la solution IAM actuelle par une nouvelle plateforme supportant le Zero Trust.',
        status: ProjectStatus.IDENTIFIED,
        tShirtSize: TShirtSize.L,
        projectStartDate: '2026-01-15T00:00:00Z',
        projectEndDate: '2027-01-15T00:00:00Z',
        isTop30: true,
        category: ProjectCategory.OPPORTUNITY,
        initiativeId: 'init-demo-D',
        isoMeasures: ['5.16', '5.17', '5.18', '8.5'],
        predecessorIds: [], 
        priorityScore: 5.0,
        createdAt: '2025-12-01T00:00:00Z',
        updatedAt: '2025-12-01T00:00:00Z',
        tasks: [
            { id: 'p4-ph1', name: 'Phase 1 : Etude & Choix', startDate: '2026-01-15T00:00:00Z', endDate: '2026-03-30T00:00:00Z', progress: 0, status: TaskStatus.TODO },
            { id: 'p4-ph2', name: 'Phase 2 : Design & Build', startDate: '2026-04-01T00:00:00Z', endDate: '2026-09-30T00:00:00Z', progress: 0, status: TaskStatus.TODO, dependencyIds: ['p4-ph1'] },
            { id: 'p4-ph3', name: 'Phase 3 : Migration & Run', startDate: '2026-10-01T00:00:00Z', endDate: '2027-01-15T00:00:00Z', progress: 0, status: TaskStatus.TODO, dependencyIds: ['p4-ph2'] },
        ]
      },
      {
        id: 'proj-demo-5',
        projectId: 'P25-005',
        title: 'Audit de conformité RGPD',
        description: 'Audit annuel pour vérifier la conformité des traitements.',
        status: ProjectStatus.NO,
        tShirtSize: TShirtSize.M,
        isTop30: false,
        createdAt: '2025-09-15T00:00:00Z',
        updatedAt: '2025-10-01T00:00:00Z',
        projectStartDate: '2025-10-01T00:00:00Z',
        projectEndDate: '2025-12-20T00:00:00Z',
        category: ProjectCategory.MCO,
        initiativeId: 'init-demo-C',
        isoMeasures: ['5.34'],
        predecessorIds: [], 
        priorityScore: 30.0,
        tasks: [
            { id: 'p5-ph1', name: 'Phase 1 : Audit', startDate: '2025-10-01T00:00:00Z', endDate: '2025-12-20T00:00:00Z', progress: 50, status: TaskStatus.IN_PROGRESS, children: [
                { id: 'p5-t1', name: 'Préparation', startDate: '2025-10-01T00:00:00Z', endDate: '2025-10-15T00:00:00Z', progress: 100, status: TaskStatus.DONE },
                { id: 'p5-t2', name: 'Entretiens', startDate: '2025-10-16T00:00:00Z', endDate: '2025-11-30T00:00:00Z', progress: 70, status: TaskStatus.IN_PROGRESS, dependencyIds: ['p5-t1'] },
                { id: 'p5-t3', name: 'Rapport', startDate: '2025-12-01T00:00:00Z', endDate: '2025-12-20T00:00:00Z', progress: 0, status: TaskStatus.TODO, dependencyIds: ['p5-t2'] }
              ]
            }
        ]
      },
      {
        id: 'proj-demo-6',
        projectId: 'P25-020',
        title: 'Durcissement Active Directory',
        status: ProjectStatus.NO,
        tShirtSize: TShirtSize.L,
        isTop30: true,
        createdAt: '2025-04-15T00:00:00Z',
        updatedAt: '2025-05-01T00:00:00Z',
        projectStartDate: '2025-05-01T00:00:00Z',
        projectEndDate: '2026-03-01T00:00:00Z',
        category: ProjectCategory.PROJECT,
        initiativeId: 'init-demo-D',
        isoMeasures: ['8.2', '8.5', '5.15'],
        predecessorIds: [],
        priorityScore: 6.3,
        tasks: [
            { id: 'p6-ph1', name: 'Remédiation Tier 0', startDate: '2025-05-01T00:00:00Z', endDate: '2025-08-30T00:00:00Z', progress: 80, status: TaskStatus.IN_PROGRESS },
            { id: 'p6-ph2', name: 'Remédiation Tier 1', startDate: '2025-09-01T00:00:00Z', endDate: '2025-12-31T00:00:00Z', progress: 20, status: TaskStatus.IN_PROGRESS, dependencyIds: ['p6-ph1'] },
            { id: 'p6-ph3', name: 'Remédiation Tier 2', startDate: '2026-01-01T00:00:00Z', endDate: '2026-03-01T00:00:00Z', progress: 0, status: TaskStatus.TODO, dependencyIds: ['p6-ph2'] }
        ]
      },
      {
        id: 'proj-demo-7',
        projectId: 'P25-030',
        title: 'Mise en place SOC Hybride 24/7',
        status: ProjectStatus.NO,
        tShirtSize: TShirtSize.XL,
        isTop30: true,
        isoMeasures: ['8.16', '5.26'],
        createdAt: '2025-01-20T00:00:00Z',
        updatedAt: '2025-02-01T00:00:00Z',
        projectStartDate: '2025-02-01T00:00:00Z',
        projectEndDate: '2025-12-31T00:00:00Z',
        category: ProjectCategory.PROJECT,
        initiativeId: 'init-demo-A',
        predecessorIds: [],
        priorityScore: 8.3,
        tasks: [
            { id: 'p7-ph1', name: 'Phase 1 : Appel d\'offre', startDate: '2025-02-01T00:00:00Z', endDate: '2025-04-30T00:00:00Z', progress: 100, status: TaskStatus.DONE },
            { id: 'p7-ph2', name: 'Phase 2 : Onboarding & Build', startDate: '2025-05-01T00:00:00Z', endDate: '2025-09-30T00:00:00Z', progress: 100, status: TaskStatus.DONE, dependencyIds: ['p7-ph1'] },
            { id: 'p7-ph3', name: 'Phase 3 : Run (Service Régulier)', startDate: '2025-10-01T00:00:00Z', endDate: '2025-12-31T00:00:00Z', progress: 30, status: TaskStatus.IN_PROGRESS, dependencyIds: ['p7-ph2'] }
        ]
      },
       {
        id: 'proj-demo-8',
        projectId: 'P25-040',
        title: 'Campagne Phishing S2 2025',
        status: ProjectStatus.NO,
        tShirtSize: TShirtSize.S,
        isTop30: false,
        isoMeasures: ['6.3'],
        createdAt: '2025-10-25T00:00:00Z',
        updatedAt: '2025-11-01T00:00:00Z',
        projectStartDate: '2025-11-01T00:00:00Z',
        projectEndDate: '2025-11-30T00:00:00Z',
        category: ProjectCategory.ACTIVITY,
        initiativeId: 'init-demo-C',
        predecessorIds: [],
        priorityScore: 45.0,
        tasks: [
            { id: 'p8-t1', name: 'Préparation Scénarios', startDate: '2025-11-01T00:00:00Z', endDate: '2025-11-10T00:00:00Z', progress: 100, status: TaskStatus.DONE },
            { id: 'p8-t2', name: 'Lancement Campagne', startDate: '2025-11-13T00:00:00Z', endDate: '2025-11-20T00:00:00Z', progress: 0, status: TaskStatus.TODO, dependencyIds: ['p8-t1'] },
            { id: 'p8-t3', name: 'Analyse & REX', startDate: '2025-11-21T00:00:00Z', endDate: '2025-11-30T00:00:00Z', progress: 0, status: TaskStatus.TODO, dependencyIds: ['p8-t2'] }
        ]
      }
    ] as Project[],

    activities: [
        { id: 'act-demo-1', activityId: 'ACT-25-001', title: "Revue trimestrielle des accès admin", description: 'Vérifier et valider tous les comptes à privilèges sur les systèmes critiques.', status: ActivityStatus.IN_PROGRESS, priority: Priority.CRITICAL, activityType: ActivityType.PERMANENT, securityDomain: SecurityDomain.GOUVERNANCE, isoMeasures: ['5.18', '8.2'], strategicOrientations: ['so-demo-1'], objectives: ['obj-demo-1.2.1'], owner: 'res-demo-3', startDate: '2025-10-01T00:00:00Z', endDatePlanned: '2025-12-31T00:00:00Z', workloadInPersonDays: 15, createdAt: '2025-09-01T00:00:00Z', updatedAt: '2025-11-10T00:00:00Z', functionalProcessId: 'proc-demo-5' },
        { id: 'act-demo-2', activityId: 'ACT-25-002', title: "Pentest annuel de l'application mobile", description: 'Audit de sécurité externe de l\'application mobile pour identifier les vulnérabilités.', status: ActivityStatus.NOT_STARTED, priority: Priority.HIGH, activityType: ActivityType.PONCTUAL, securityDomain: SecurityDomain.DEFENSE, isoMeasures: ['5.35', '8.8'], strategicOrientations: ['so-demo-3'], objectives: ['obj-demo-3.1.2'], owner: 'res-demo-1', startDate: '2026-02-01T00:00:00Z', endDatePlanned: '2026-03-15T00:00:00Z', workloadInPersonDays: 25, createdAt: '2025-10-05T00:00:00Z', updatedAt: '2025-10-05T00:00:00Z', functionalProcessId: 'proc-demo-2' },
        { id: 'act-demo-3', activityId: 'ACT-24-035', title: "Mise à jour des serveurs web", description: 'Application des derniers correctifs de sécurité sur les serveurs Apache.', status: ActivityStatus.COMPLETED, priority: Priority.HIGH, activityType: ActivityType.PONCTUAL, securityDomain: SecurityDomain.PROTECTION, isoMeasures: ['8.8'], strategicOrientations: ['so-demo-2'], objectives: ['obj-demo-2.2.2'], owner: 'res-demo-4', startDate: '2025-09-15T00:00:00Z', endDatePlanned: '2025-09-20T00:00:00Z', workloadInPersonDays: 5, createdAt: '2025-09-10T00:00:00Z', updatedAt: '2025-09-21T00:00:00Z', functionalProcessId: 'proc-demo-8' },
        { id: 'act-demo-4', activityId: 'ACT-25-004', title: "Campagne de sensibilisation hameçonnage", description: 'Simulation de campagne de phishing pour l\'ensemble des collaborateurs.', status: ActivityStatus.IN_PROGRESS, priority: Priority.MEDIUM, activityType: ActivityType.PONCTUAL, securityDomain: SecurityDomain.GOUVERNANCE, isoMeasures: ['6.3'], strategicOrientations: [], objectives: ['obj-demo-1.1.2'], owner: 'res-demo-3', startDate: '2025-11-01T00:00:00Z', endDatePlanned: '2025-11-30T00:00:00Z', workloadInPersonDays: 10, createdAt: '2025-10-15T00:00:00Z', updatedAt: '2025-11-05T00:00:00Z', functionalProcessId: 'proc-demo-4' },
        { id: 'act-demo-5', activityId: 'ACT-25-005', title: "Rédaction politique de sauvegarde cloud", description: 'Définir les règles et procédures pour la sauvegarde des données sur les plateformes cloud.', status: ActivityStatus.ON_HOLD, priority: Priority.LOW, activityType: ActivityType.PONCTUAL, securityDomain: SecurityDomain.RESILIENCE, isoMeasures: ['5.1', '8.13'], strategicOrientations: ['so-demo-4'], objectives: ['obj-demo-4.1.1'], owner: 'res-demo-3', startDate: '2025-07-01T00:00:00Z', endDatePlanned: '2025-09-30T00:00:00Z', workloadInPersonDays: 8, createdAt: '2025-06-20T00:00:00Z', updatedAt: '2025-08-15T00:00:00Z', functionalProcessId: 'proc-demo-1' },
        { id: 'act-demo-6', activityId: 'ACT-25-006', title: "Déploiement MFA pour les accès externes", description: 'Activer l\'authentification multifacteur pour tous les accès VPN et extranets.', status: ActivityStatus.COMPLETED, priority: Priority.CRITICAL, activityType: ActivityType.PONCTUAL, securityDomain: SecurityDomain.PROTECTION, isoMeasures: ['8.5'], strategicOrientations: ['so-demo-2'], objectives: ['obj-demo-2.1.1'], owner: 'res-demo-1', startDate: '2025-01-10T00:00:00Z', endDatePlanned: '2025-04-30T00:00:00Z', workloadInPersonDays: 40, createdAt: '2024-12-01T00:00:00Z', updatedAt: '2025-05-02T00:00:00Z', functionalProcessId: 'proc-demo-5' },
        { id: 'act-demo-7', activityId: 'ACT-23-089', title: "Analyse de logs de sécurité", description: 'Revue quotidienne des alertes de sécurité provenant du SIEM.', status: ActivityStatus.IN_PROGRESS, priority: Priority.HIGH, activityType: ActivityType.PERMANENT, securityDomain: SecurityDomain.DEFENSE, isoMeasures: ['8.16'], strategicOrientations: ['so-demo-3'], objectives: ['obj-demo-3.1.1'], owner: 'res-demo-1', startDate: '2023-01-01T00:00:00Z', endDatePlanned: '2026-12-31T00:00:00Z', workloadInPersonDays: 0.5, createdAt: '2022-12-15T00:00:00Z', updatedAt: '2025-11-10T00:00:00Z', functionalProcessId: 'proc-demo-11' },
        { id: 'act-demo-8', activityId: 'ACT-25-008', title: "Projet abandonné : Refonte portail", description: 'Le projet de refonte du portail interne a été annulé pour des raisons budgétaires.', status: ActivityStatus.CANCELLED, priority: Priority.MEDIUM, activityType: ActivityType.PONCTUAL, securityDomain: SecurityDomain.GOUVERNANCE, isoMeasures: [], strategicOrientations: [], objectives: [], owner: 'res-demo-2', startDate: '2025-03-01T00:00:00Z', endDatePlanned: '2025-10-01T00:00:00Z', workloadInPersonDays: 120, createdAt: '2025-02-01T00:00:00Z', updatedAt: '2025-06-15T00:00:00Z', functionalProcessId: 'proc-demo-10' },
        { id: 'act-demo-9', activityId: 'ACT-26-001', title: 'Mise en place de la gouvernance des données', description: 'Définir les rôles et responsabilités pour la gouvernance des données sensibles.', status: ActivityStatus.NOT_STARTED, priority: Priority.HIGH, activityType: ActivityType.PONCTUAL, securityDomain: SecurityDomain.GOUVERNANCE, isoMeasures: ['5.9', '5.10', '5.12'], strategicOrientations: ['so-demo-1', 'so-demo-2'], objectives: ['obj-demo-1.1.1', 'obj-demo-2.1.2'], owner: 'res-demo-3', startDate: '2026-01-15T00:00:00Z', endDatePlanned: '2026-07-15T00:00:00Z', workloadInPersonDays: 60, createdAt: '2025-11-01T00:00:00Z', updatedAt: '2025-11-01T00:00:00Z', functionalProcessId: 'proc-demo-3' },
        { id: 'act-demo-10', activityId: 'ACT-25-010', title: "Test de continuité d'activité (PCA)", description: 'Exercice annuel de bascule sur le site de secours pour les applications critiques.', status: ActivityStatus.IN_PROGRESS, priority: Priority.CRITICAL, activityType: ActivityType.PERMANENT, securityDomain: SecurityDomain.RESILIENCE, isoMeasures: ['5.30'], strategicOrientations: ['so-demo-4'], objectives: ['obj-demo-4.2.1'], owner: 'res-demo-4', startDate: '2025-11-20T00:00:00Z', endDatePlanned: '2025-11-25T00:00:00Z', workloadInPersonDays: 20, createdAt: '2025-10-01T00:00:00Z', updatedAt: '2025-11-10T00:00:00Z', functionalProcessId: 'proc-demo-9' },
        { id: 'act-demo-11', activityId: 'ACT-25-011', title: "Audit d'un fournisseur critique", description: 'Audit de sécurité sur site du fournisseur Cloud Hélios.', status: ActivityStatus.NOT_STARTED, priority: Priority.HIGH, activityType: ActivityType.PONCTUAL, securityDomain: SecurityDomain.GOUVERNANCE, isoMeasures: ['5.22'], strategicOrientations: ['so-demo-1'], objectives: ['obj-demo-1.2.2'], owner: 'res-demo-5', startDate: '2026-04-01T00:00:00Z', endDatePlanned: '2026-04-15T00:00:00Z', workloadInPersonDays: 10, createdAt: '2025-11-05T00:00:00Z', updatedAt: '2025-11-05T00:00:00Z', functionalProcessId: 'proc-demo-7' },
        { id: 'act-demo-12', activityId: 'ACT-25-012', title: "Mise à jour des règles de pare-feu", description: 'Revue et nettoyage annuel des règles de pare-feu obsolètes.', status: ActivityStatus.IN_PROGRESS, priority: Priority.MEDIUM, activityType: ActivityType.PERMANENT, securityDomain: SecurityDomain.PROTECTION, isoMeasures: ['8.22'], strategicOrientations: [], objectives: [], owner: 'res-demo-1', startDate: '2025-11-01T00:00:00Z', endDatePlanned: '2025-11-15T00:00:00Z', workloadInPersonDays: 5, createdAt: '2025-10-20T00:00:00Z', updatedAt: '2025-11-02T00:00:00Z', functionalProcessId: 'proc-demo-8' }
    ] as Activity[],
};
