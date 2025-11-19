
import React from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Info, ListChecks, Workflow, Settings, BrainCircuit, Sparkles, TrendingUp, ShieldAlert, Target } from 'lucide-react';
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
              <TrendingUp size={18} /> Pilotage Financier Avancé
            </h4>
            <ul className="mt-2 space-y-2 text-sm list-disc list-inside pl-2">
              <li>
                <strong>Courbe en S (S-Curve) :</strong> Visualisez l'atterrissage budgétaire de vos projets en comparant le planifié, l'engagé et le réalisé dans le temps. <NewBadge />
              </li>
              <li>
                <strong>Jauges Budgétaires :</strong> Nouveaux visuels pour suivre la consommation des enveloppes (MOA/MOE). <NewBadge />
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
              <ShieldAlert size={18} /> Gestion des Risques & Conformité
            </h4>
            <ul className="mt-2 space-y-2 text-sm list-disc list-inside pl-2">
              <li>
                <strong>Matrice de Couverture :</strong> Un tableau croisé dynamique pour identifier les "trous dans la raquette" entre vos Risques Majeurs et vos Projets. <NewBadge />
              </li>
              <li>
                <strong>Scoring d'arbitrage :</strong> Calcul automatique d'un score de priorité basé sur l'impact, la couverture de risque et l'effort. <NewBadge />
              </li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
              <Target size={18} /> Suivi Opérationnel
            </h4>
            <p className="mt-2 text-sm">
              La fiche projet s'enrichit avec la <strong>Météo du projet</strong> (Flash Report) pour qualifier l'état de santé, et la gestion des <strong>Jalons clés</strong> pour suivre les échéances majeures. <NewBadge />
            </p>
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
            Principales fonctionnalités
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-600">
            <div>
                <h4 className="font-semibold text-slate-700">Tableaux de bord</h4>
                <p className="text-sm">Vues synthétiques et personnalisables pour suivre les indicateurs clés (KPIs), la couverture normative et l'état d'avancement général.</p>
            </div>
            <div>
                <h4 className="font-semibold text-slate-700">Gestion des Projets et Activités</h4>
                <p className="text-sm">Créez, modifiez et suivez vos projets et activités de sécurité. Liez-les aux référentiels pour contextualiser vos actions.</p>
            </div>
            <div>
                <h4 className="font-semibold text-slate-700">Explorateurs de données</h4>
                <p className="text-sm">Des outils puissants pour créer des tableaux croisés dynamiques. Explorez les relations entre vos orientations, chantiers, objectifs, activités et mesures ISO.</p>
            </div>
             <div>
                <h4 className="font-semibold text-slate-700">Timelines</h4>
                <p className="text-sm">Visualisez la planification de vos projets et activités sur un axe chronologique de type Gantt.</p>
            </div>
            <div>
                <h4 className="font-semibold text-slate-700">Référentiels</h4>
                <p className="text-sm">Consultez et gérez l'ensemble des éléments structurants de votre stratégie : référentiel ISO 27002, orientations, chantiers, objectifs, initiatives, ressources et processus.</p>
            </div>
            <div>
                <h4 className="font-semibold text-slate-700">Gestion des données</h4>
                <p className="text-sm">Importez et exportez vos données aux formats JSON et CSV. Sauvegardez et restaurez l'intégralité de votre environnement de travail.</p>
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
                        <li>Vous pouvez alors commencer à travailler avec vos données, et à importer des fichiers CSV de charges ou de budgets pour vos projets.</li>
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
                 <div>
                    <h4 className="font-semibold text-slate-700">Explorez vos données</h4>
                    <p>L'explorateur est un outil puissant pour créer des rapports personnalisés. N'hésitez pas à l'utiliser pour croiser les différentes dimensions de votre stratégie.</p>
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
