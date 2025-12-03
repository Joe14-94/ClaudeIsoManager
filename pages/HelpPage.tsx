
import React from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Info, ListChecks, Workflow, Settings, BrainCircuit, Sparkles, TrendingUp, ShieldAlert, Target, CalendarDays, Calendar, GitBranch } from 'lucide-react';
import { APP_VERSION } from '../config';

const NewBadge = () => (
  <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-600 bg-indigo-100 border border-indigo-200 rounded-full align-middle">
    Nouveau
  </span>
);

const HelpPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Aide et informations</h1>

      {/* Section Nouveautés */}
      <Card className="border-l-4 border-l-indigo-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-900">
            <Sparkles size={22} className="text-indigo-600" />
            Nouveautés de la version {APP_VERSION}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-600">
          <div>
            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
              <CalendarDays size={18} /> Diagramme de Gantt Avancé
            </h4>
            <ul className="mt-2 space-y-2 text-sm list-disc list-inside pl-2">
              <li>
                <strong>Planification fine :</strong> Décomposez vos projets en phases et tâches avec une structure WBS (Work Breakdown Structure). <NewBadge />
              </li>
              <li>
                <strong>Dépendances :</strong> Visualisez les liens logiques entre les tâches pour identifier le chemin critique. <NewBadge />
              </li>
              <li>
                <strong>Mode Suivi :</strong> Comparez l'avancement réel par rapport au planning initial (Baseline). <NewBadge />
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
              <Calendar size={18} /> Import Calendrier
            </h4>
            <ul className="mt-2 space-y-2 text-sm list-disc list-inside pl-2">
              <li>
                <strong>Transformation du temps :</strong> Convertissez vos événements Outlook (ICS) en temps consommé sur vos projets ou activités. <NewBadge />
              </li>
              <li>
                <strong>Historique & Filtres :</strong> Gestion avancée des événements importés, détection des doublons et masquage des événements récurrents. <NewBadge />
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp size={18} /> Pilotage Financier Avancé
            </h4>
            <ul className="mt-2 space-y-2 text-sm list-disc list-inside pl-2">
              <li>
                <strong>Courbe en S (S-Curve) :</strong> Visualisez l'atterrissage budgétaire de vos projets en comparant le planifié, l'engagé et le réalisé dans le temps.
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
              <ShieldAlert size={18} /> Gestion des Risques & Conformité
            </h4>
            <ul className="mt-2 space-y-2 text-sm list-disc list-inside pl-2">
              <li>
                <strong>Matrice de Couverture :</strong> Un tableau croisé dynamique pour identifier les "trous dans la raquette" entre vos Risques Majeurs et vos Projets.
              </li>
              <li>
                <strong>Scoring d'arbitrage :</strong> Calcul automatique d'un score de priorité basé sur l'impact, la couverture de risque et l'effort.
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info size={22} />
            À propos de l'application
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-slate-600">
          <p>
            <strong>ISO Manager</strong> est un outil conçu pour aider les responsables de la sécurité des systèmes d'information (RSSI), les DSI et les chefs de projets à piloter la stratégie de cybersécurité.
          </p>
          <p>
            L'application permet de gérer des projets et des activités en les alignant sur plusieurs dimensions clés :
          </p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li><strong>La conformité normative :</strong> en liant les actions aux mesures du référentiel ISO 27002:2022.</li>
            <li><strong>La stratégie de l'entreprise :</strong> en associant les actions à des orientations stratégiques, des chantiers et des objectifs définis.</li>
            <li><strong>Le pilotage opérationnel :</strong> en suivant les statuts, les budgets, les charges, les jalons et les risques.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks size={22} />
            Fonctionnalités Détaillées
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-slate-600">
            <div>
                <h4 className="font-semibold text-slate-700 text-lg mb-2">1. Planification & Diagramme de Gantt</h4>
                <div className="pl-4 border-l-2 border-slate-200 space-y-2">
                    <p className="text-sm">Le <strong>Diagramme de Gantt Avancé</strong> (Menu Projets > Gantt) offre une vue complète sur le déroulement de vos projets.</p>
                    <ul className="list-disc list-inside text-sm pl-2">
                        <li><strong>Structure WBS :</strong> Vous pouvez créer une arborescence de tâches (Phases > Tâches > Sous-tâches) directement depuis l'éditeur ou dans la fiche projet.</li>
                        <li><strong>Dépendances :</strong> Liez des tâches entre elles (Fin à Début) pour visualiser l'impact d'un retard.</li>
                        <li><strong>Jalons :</strong> Placez des repères clés (losanges) pour marquer les étapes importantes.</li>
                        <li><strong>Mode Suivi (Baseline) :</strong> En activant ce mode, une barre grise apparaît sous la barre d'avancement, représentant les dates initiales prévues. Tout décalage vers la droite est automatiquement signalé en rouge comme un retard.</li>
                    </ul>
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-slate-700 text-lg mb-2">2. Importation de Calendrier (Suivi des Temps)</h4>
                <div className="pl-4 border-l-2 border-slate-200 space-y-2">
                    <p className="text-sm">Le module <strong>Import Calendrier</strong> (Menu Données) facilite la déclaration des temps passés (J/H).</p>
                    <ol className="list-decimal list-inside text-sm pl-2 space-y-1">
                        <li>Exportez votre calendrier Outlook au format <code>.ics</code>.</li>
                        <li>Chargez le fichier dans l'application.</li>
                        <li>Sélectionnez les réunions/événements correspondant à un projet ou une activité.</li>
                        <li>Utilisez la fonction "Sélectionner les occurrences" pour grouper rapidement les réunions récurrentes.</li>
                        <li>Cliquez sur <strong>"Valider l'imputation"</strong> : le temps total est calculé et ajouté au "Consommé" du projet ou de l'activité cible.</li>
                    </ol>
                    <p className="text-sm mt-2"><em>Astuce : Vous pouvez masquer les événements personnels ou non pertinents pour qu'ils n'apparaissent plus lors des prochains imports.</em></p>
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-slate-700 text-lg mb-2">3. Pilotage Stratégique</h4>
                <div className="pl-4 border-l-2 border-slate-200 space-y-2">
                    <p className="text-sm">Alignez vos actions opérationnelles avec la stratégie de l'entreprise.</p>
                    <ul className="list-disc list-inside text-sm pl-2">
                        <li><strong>Orientations & Chantiers :</strong> Définissez les grands axes.</li>
                        <li><strong>Objectifs :</strong> Déclinez les axes en objectifs mesurables.</li>
                        <li><strong>Initiatives :</strong> Regroupez des projets concourant à un but commun.</li>
                    </ul>
                </div>
            </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow size={22} />
                Initialisation de l'application
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
                <div>
                    <h4 className="font-semibold text-slate-700">Données de démonstration</h4>
                    <p>Au premier lancement, l'application est pré-chargée avec un jeu de données de test généré par une IA pour illustrer ses fonctionnalités.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-700">Pour utiliser vos propres données :</h4>
                    <ol className="list-decimal list-inside space-y-2 mt-2">
                        <li>Rendez-vous dans le menu <strong className="text-slate-800">Données &gt; Gestion des données</strong>.</li>
                        <li>Cliquez sur le bouton <strong className="text-red-600">"Supprimer toutes les données"</strong> pour vider les données de test.</li>
                        <li>Cliquez sur <strong className="text-blue-600">"Restaurer une sauvegarde"</strong> et sélectionnez votre propre fichier de données JSON.</li>
                    </ol>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit size={22} />
                Bonnes pratiques et conseils
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
                <div>
                    <h4 className="font-semibold text-slate-700">Sauvegardes régulières</h4>
                    <p>Utilisez la fonction "Sauvegarder les données" dans le menu pour exporter un fichier JSON de votre environnement. Conservez-le en lieu sûr.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-700">Utilisez les filtres</h4>
                    <p>Les filtres sont présents sur la plupart des pages pour vous aider à affiner vos recherches et à vous concentrer sur les informations pertinentes.</p>
                </div>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={22} />
            Informations techniques
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-slate-600">
          <p><strong>Version de l'application :</strong> {APP_VERSION}</p>
          <p>
            <strong>Stockage des données :</strong> <strong className="text-red-600">Toutes les données que vous saisissez sont stockées localement dans votre navigateur (via le `localStorage`). Aucune information n'est envoyée ou stockée sur un serveur distant.</strong>
          </p>
          <p className="text-sm p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <strong>Attention :</strong> Cela signifie que les données sont propres à un navigateur et à un ordinateur. Elles ne seront pas synchronisées sur d'autres appareils. Vider le cache de votre navigateur peut entraîner une perte de données, d'où l'importance des sauvegardes régulières.
          </p>
        </CardContent>
      </Card>

    </div>
  );
};

export default HelpPage;
