import React, { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { useData } from '../../../contexts/DataContext';
import { calculateEVM } from '../../../utils/evmCalculations';

/**
 * Widget EVM pour dashboard personnalisable
 * Permet de sélectionner un projet et affiche ses métriques EVM
 */
export function EVMWidgetForDashboard() {
  const { projects } = useData();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Filtrer les projets qui ont des données pour EVM
  const projectsWithData = useMemo(() => {
    return projects.filter(p =>
      p.projectStartDate &&
      p.projectEndDate &&
      (p.budgetApproved || p.budgetRequested)
    );
  }, [projects]);

  const selectedProject = useMemo(() => {
    if (!selectedProjectId && projectsWithData.length > 0) {
      // Sélectionner le premier projet par défaut
      return projectsWithData[0];
    }
    return projectsWithData.find(p => p.id === selectedProjectId) || projectsWithData[0];
  }, [selectedProjectId, projectsWithData]);

  const evmMetrics = useMemo(() => {
    if (!selectedProject) return null;
    return calculateEVM(selectedProject);
  }, [selectedProject]);

  const getStatusColor = (status: string, type: 'schedule' | 'cost') => {
    if (type === 'schedule') {
      switch (status) {
        case 'ahead': return 'text-green-600 bg-green-50';
        case 'on-track': return 'text-blue-600 bg-blue-50';
        case 'behind': return 'text-red-600 bg-red-50';
      }
    } else {
      switch (status) {
        case 'under-budget': return 'text-green-600 bg-green-50';
        case 'on-budget': return 'text-blue-600 bg-blue-50';
        case 'over-budget': return 'text-red-600 bg-red-50';
      }
    }
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('ahead') || status.includes('under')) return <CheckCircle size={20} />;
    if (status.includes('on')) return <CheckCircle size={20} />;
    return <AlertTriangle size={20} />;
  };

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €`;
  };

  const formatIndex = (value: number) => {
    return value.toFixed(2);
  };

  if (projectsWithData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Earned Value Management</h3>
        <div className="text-center py-8 text-slate-500">
          <p>Aucun projet avec données EVM disponibles</p>
          <p className="text-xs mt-2">Les projets doivent avoir des dates et un budget</p>
        </div>
      </div>
    );
  }

  if (!evmMetrics || !selectedProject) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          Earned Value Management
        </h3>

        {/* Sélecteur de projet */}
        <select
          value={selectedProject.id}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {projectsWithData.map(project => (
            <option key={project.id} value={project.id}>
              {project.projectId} - {project.title}
            </option>
          ))}
        </select>
      </div>

      {/* Statuts principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className={`p-3 rounded-lg ${getStatusColor(evmMetrics.scheduleStatus, 'schedule')}`}>
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={16} />
            <span className="text-xs font-medium">Planning</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold">
              {evmMetrics.scheduleStatus === 'ahead' && 'En avance'}
              {evmMetrics.scheduleStatus === 'on-track' && 'Dans les temps'}
              {evmMetrics.scheduleStatus === 'behind' && 'En retard'}
            </span>
            {getStatusIcon(evmMetrics.scheduleStatus)}
          </div>
          <p className="text-xs mt-1">SPI: {formatIndex(evmMetrics.spi)}</p>
        </div>

        <div className={`p-3 rounded-lg ${getStatusColor(evmMetrics.costStatus, 'cost')}`}>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={16} />
            <span className="text-xs font-medium">Budget</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold">
              {evmMetrics.costStatus === 'under-budget' && 'Sous budget'}
              {evmMetrics.costStatus === 'on-budget' && 'Dans le budget'}
              {evmMetrics.costStatus === 'over-budget' && 'Dépassement'}
            </span>
            {getStatusIcon(evmMetrics.costStatus)}
          </div>
          <p className="text-xs mt-1">CPI: {formatIndex(evmMetrics.cpi)}</p>
        </div>
      </div>

      {/* Métriques clés */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
        <div>
          <p className="text-xs text-slate-500 mb-1">Planifié (PV)</p>
          <p className="text-sm font-semibold text-slate-800">{formatCurrency(evmMetrics.pv)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Acquis (EV)</p>
          <p className="text-sm font-semibold text-blue-600">{formatCurrency(evmMetrics.ev)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Réel (AC)</p>
          <p className="text-sm font-semibold text-slate-800">{formatCurrency(evmMetrics.ac)}</p>
        </div>
      </div>

      {/* Écarts */}
      <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-1 mb-1">
            {evmMetrics.sv >= 0 ? (
              <TrendingUp size={14} className="text-green-600" />
            ) : (
              <TrendingDown size={14} className="text-red-600" />
            )}
            <p className="text-xs text-slate-600">Écart Planning (SV)</p>
          </div>
          <p className={`text-sm font-semibold ${evmMetrics.sv >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(evmMetrics.sv))}
            {evmMetrics.sv >= 0 ? ' ✓' : ' ✗'}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            {evmMetrics.cv >= 0 ? (
              <TrendingUp size={14} className="text-green-600" />
            ) : (
              <TrendingDown size={14} className="text-red-600" />
            )}
            <p className="text-xs text-slate-600">Écart Coût (CV)</p>
          </div>
          <p className={`text-sm font-semibold ${evmMetrics.cv >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(evmMetrics.cv))}
            {evmMetrics.cv >= 0 ? ' ✓' : ' ✗'}
          </p>
        </div>
      </div>

      {/* Prévisions */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-700">Prévisions</h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-slate-500">Budget initial (BAC)</p>
            <p className="font-semibold text-slate-800">{formatCurrency(evmMetrics.bac)}</p>
          </div>
          <div>
            <p className="text-slate-500">Estimation finale (EAC)</p>
            <p className={`font-semibold ${evmMetrics.vac >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(evmMetrics.eac)}
            </p>
          </div>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="flex justify-between text-xs text-slate-600 mb-2">
          <span>Avancement: {evmMetrics.percentComplete.toFixed(1)}%</span>
          <span>Budget: {evmMetrics.percentSpent.toFixed(1)}%</span>
        </div>
        <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-blue-500"
            style={{ width: `${Math.min(evmMetrics.percentComplete, 100)}%` }}
          />
          <div
            className="absolute h-full bg-orange-400 opacity-50"
            style={{ width: `${Math.min(evmMetrics.percentSpent, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-sm"></span>
            Avancement
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-orange-400 rounded-sm"></span>
            Consommation
          </span>
        </div>
      </div>
    </div>
  );
}

export default EVMWidgetForDashboard;
