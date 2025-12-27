import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import BurndownChart from '../components/charts/BurndownChart';
import { TrendingDown, TrendingUp, Info } from 'lucide-react';

/**
 * Page dédiée aux graphiques Burndown/Burnup
 * Permet de visualiser l'avancement des projets avec tâches
 */
const ProjectBurndownPage: React.FC = () => {
  const { projects } = useData();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [chartMode, setChartMode] = useState<'burndown' | 'burnup'>('burndown');

  // Filtrer les projets qui ont des tâches
  const projectsWithTasks = useMemo(() => {
    return projects.filter(p => p.tasks && p.tasks.length > 0);
  }, [projects]);

  const selectedProject = useMemo(() => {
    if (!selectedProjectId && projectsWithTasks.length > 0) {
      return projectsWithTasks[0];
    }
    return projectsWithTasks.find(p => p.id === selectedProjectId) || projectsWithTasks[0];
  }, [selectedProjectId, projectsWithTasks]);

  // Calculer les statistiques du projet sélectionné
  const projectStats = useMemo(() => {
    if (!selectedProject || !selectedProject.tasks) {
      return null;
    }

    const tasks = selectedProject.tasks;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.progress === 100).length;
    const inProgressTasks = tasks.filter(t => t.progress > 0 && t.progress < 100).length;
    const notStartedTasks = tasks.filter(t => t.progress === 0).length;

    const totalProgress = tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / totalTasks;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      notStartedTasks,
      avgProgress: totalProgress,
    };
  }, [selectedProject]);

  if (projectsWithTasks.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-800">Burndown / Burnup Charts</h1>
        <Card>
          <CardContent>
            <div className="text-center py-16">
              <div className="text-slate-400 mb-4">
                <Info size={64} className="mx-auto" />
              </div>
              <h2 className="text-xl font-semibold text-slate-700 mb-2">
                Aucun projet avec tâches disponible
              </h2>
              <p className="text-slate-500">
                Les graphiques Burndown/Burnup nécessitent des projets avec des tâches planifiées.
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Ajoutez des tâches à vos projets dans la page Gantt ou dans les détails du projet.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Burndown / Burnup Charts</h1>
      </div>

      {/* Sélection du projet et du mode */}
      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sélecteur de projet */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Projet
              </label>
              <select
                value={selectedProject?.id || ''}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {projectsWithTasks.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.projectId} - {project.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Sélecteur de mode */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type de graphique
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setChartMode('burndown')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    chartMode === 'burndown'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <TrendingDown size={18} />
                  Burndown
                </button>
                <button
                  onClick={() => setChartMode('burnup')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    chartMode === 'burnup'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <TrendingUp size={18} />
                  Burnup
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistiques du projet */}
      {selectedProject && projectStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="text-center py-4">
              <p className="text-sm text-slate-500 mb-1">Total Tâches</p>
              <p className="text-3xl font-bold text-slate-800">{projectStats.totalTasks}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-4">
              <p className="text-sm text-slate-500 mb-1">Terminées</p>
              <p className="text-3xl font-bold text-green-600">{projectStats.completedTasks}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-4">
              <p className="text-sm text-slate-500 mb-1">En Cours</p>
              <p className="text-3xl font-bold text-blue-600">{projectStats.inProgressTasks}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center py-4">
              <p className="text-sm text-slate-500 mb-1">Non Démarrées</p>
              <p className="text-3xl font-bold text-slate-400">{projectStats.notStartedTasks}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Graphique Burndown/Burnup */}
      {selectedProject && (
        <Card>
          <CardContent className="py-6">
            <BurndownChart
              project={selectedProject}
              mode={chartMode}
              width={1100}
              height={500}
            />
          </CardContent>
        </Card>
      )}

      {/* Légende et explications */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-800">
            {chartMode === 'burndown' ? 'À propos du Burndown Chart' : 'À propos du Burnup Chart'}
          </h3>
        </CardHeader>
        <CardContent>
          {chartMode === 'burndown' ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Le <strong>Burndown Chart</strong> affiche le travail restant au fil du temps. Il permet de visualiser
                si le projet est sur la bonne voie pour être terminé à la date prévue.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Ligne idéale (pointillés)</h4>
                  <p className="text-sm text-slate-600">
                    Représente le rythme idéal de progression si le travail est distribué uniformément sur toute la durée du projet.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Ligne réelle (bleu)</h4>
                  <p className="text-sm text-slate-600">
                    Représente le travail réellement restant basé sur l'avancement des tâches.
                  </p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-blue-900 mb-2">Interprétation</h4>
                <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                  <li><strong>Ligne réelle au-dessus de l'idéale</strong> : Le projet est en retard</li>
                  <li><strong>Ligne réelle au-dessous de l'idéale</strong> : Le projet est en avance</li>
                  <li><strong>Ligne réelle sur l'idéale</strong> : Le projet est dans les temps</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Le <strong>Burnup Chart</strong> affiche le travail complété au fil du temps. Il permet de visualiser
                la progression cumulative du projet.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Ligne idéale (pointillés)</h4>
                  <p className="text-sm text-slate-600">
                    Représente le rythme idéal de progression si le travail est distribué uniformément.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Ligne réelle (bleu)</h4>
                  <p className="text-sm text-slate-600">
                    Représente le travail réellement complété basé sur l'avancement des tâches.
                  </p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-blue-900 mb-2">Interprétation</h4>
                <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                  <li><strong>Ligne réelle au-dessous de l'idéale</strong> : Le projet est en retard</li>
                  <li><strong>Ligne réelle au-dessus de l'idéale</strong> : Le projet est en avance</li>
                  <li><strong>Ligne réelle sur l'idéale</strong> : Le projet est dans les temps</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectBurndownPage;
