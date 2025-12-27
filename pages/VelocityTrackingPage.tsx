import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import { calculateProjectVelocity, calculateActivityVelocity, PeriodType } from '../utils/velocityTracking';
import VelocityChart from '../components/charts/VelocityChart';
import { TrendingUp, TrendingDown, Minus, Activity, Zap, Target } from 'lucide-react';

/**
 * Page de suivi de vélocité
 * Affiche les métriques de vélocité pour les projets et activités
 */
const VelocityTrackingPage: React.FC = () => {
  const { projects, activities } = useData();
  const [dataSource, setDataSource] = useState<'projects' | 'activities'>('projects');
  const [periodType, setPeriodType] = useState<PeriodType>('sprint');
  const [periodDuration, setPeriodDuration] = useState<number>(14);
  const [showCumulative, setShowCumulative] = useState(false);

  // Calculer les métriques de vélocité
  const velocityMetrics = useMemo(() => {
    if (dataSource === 'projects') {
      return calculateProjectVelocity(projects, periodType, periodDuration);
    } else {
      return calculateActivityVelocity(activities, periodType, periodDuration);
    }
  }, [projects, activities, dataSource, periodType, periodDuration]);

  const getTrendIcon = () => {
    switch (velocityMetrics.velocityTrend) {
      case 'increasing':
        return <TrendingUp size={20} className="text-green-600" />;
      case 'decreasing':
        return <TrendingDown size={20} className="text-red-600" />;
      default:
        return <Minus size={20} className="text-slate-600" />;
    }
  };

  const getTrendColor = () => {
    switch (velocityMetrics.velocityTrend) {
      case 'increasing':
        return 'text-green-600 bg-green-50';
      case 'decreasing':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const getTrendLabel = () => {
    switch (velocityMetrics.velocityTrend) {
      case 'increasing':
        return 'En augmentation';
      case 'decreasing':
        return 'En diminution';
      default:
        return 'Stable';
    }
  };

  // Modifier la durée selon le type de période
  const handlePeriodTypeChange = (newType: PeriodType) => {
    setPeriodType(newType);
    switch (newType) {
      case 'sprint':
        setPeriodDuration(14);
        break;
      case 'week':
        setPeriodDuration(7);
        break;
      case 'month':
        setPeriodDuration(30);
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Velocity Tracking</h1>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Source de données */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Source de données
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDataSource('projects')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    dataSource === 'projects'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Projets
                </button>
                <button
                  onClick={() => setDataSource('activities')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    dataSource === 'activities'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Activités
                </button>
              </div>
            </div>

            {/* Type de période */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type de période
              </label>
              <select
                value={periodType}
                onChange={(e) => handlePeriodTypeChange(e.target.value as PeriodType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="sprint">Sprint (2 semaines)</option>
                <option value="week">Semaine</option>
                <option value="month">Mois</option>
              </select>
            </div>

            {/* Durée personnalisée */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Durée (jours)
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={periodDuration}
                onChange={(e) => setPeriodDuration(parseInt(e.target.value) || 7)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métriques clés */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Vélocité Moyenne</p>
              <Zap size={20} className="text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-800">
              {velocityMetrics.averageVelocity.toFixed(1)}
            </p>
            <p className="text-xs text-slate-500 mt-1">jours par période</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Consistance</p>
              <Target size={20} className="text-green-600" />
            </div>
            <p className="text-3xl font-bold text-slate-800">
              {velocityMetrics.consistency.toFixed(0)}%
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {velocityMetrics.consistency >= 80 ? 'Très consistant' :
               velocityMetrics.consistency >= 60 ? 'Consistant' :
               velocityMetrics.consistency >= 40 ? 'Modéré' : 'Variable'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Tendance</p>
              {getTrendIcon()}
            </div>
            <p className={`text-base font-bold ${getTrendColor()} px-2 py-1 rounded inline-block`}>
              {getTrendLabel()}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Écart-type: {velocityMetrics.standardDeviation.toFixed(1)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Périodes</p>
              <Activity size={20} className="text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-slate-800">
              {velocityMetrics.dataPoints.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              périodes mesurées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Prédiction de complétion */}
      {velocityMetrics.predictedCompletionDate && (
        <Card>
          <CardContent className="p-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Target size={24} className="text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">Date de complétion prédite</h3>
                  <p className="text-sm text-blue-800 mt-1">
                    Basé sur la vélocité moyenne, le travail devrait être complété le{' '}
                    <strong>
                      {velocityMetrics.predictedCompletionDate.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Options de visualisation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Graphique de Vélocité</h3>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCumulative}
                  onChange={(e) => setShowCumulative(e.target.checked)}
                  className="rounded"
                />
                Vue cumulative
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <VelocityChart
            data={velocityMetrics.dataPoints}
            width={1100}
            height={450}
            showCumulative={showCumulative}
          />
        </CardContent>
      </Card>

      {/* Explication */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-800">À propos du Velocity Tracking</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-slate-600">
            <p>
              Le <strong>Velocity Tracking</strong> mesure la quantité de travail qu'une équipe peut
              accomplir pendant une période définie (sprint, semaine, mois). C'est un indicateur clé
              de la performance et de la prévisibilité.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Vélocité Moyenne</h4>
                <p className="text-sm text-blue-800">
                  Moyenne du travail complété par période. Utilisée pour planifier les futures itérations.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Consistance</h4>
                <p className="text-sm text-green-800">
                  Mesure la stabilité de la vélocité. Une consistance élevée (≥80%) indique une équipe prévisible.
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">Tendance</h4>
                <p className="text-sm text-purple-800">
                  Indique si la vélocité augmente, diminue ou reste stable. Aide à identifier les améliorations ou les problèmes.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-900 mb-2">Prédiction</h4>
                <p className="text-sm text-amber-800">
                  Utilise la vélocité moyenne pour estimer la date de complétion du travail restant.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VelocityTrackingPage;
