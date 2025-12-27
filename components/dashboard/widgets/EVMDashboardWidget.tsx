import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Coins, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { Project } from '../../../types';
import { calculateEVM, EVMMetrics } from '../../../utils/evmCalculations';

interface EVMDashboardWidgetProps {
  project: Project;
}

/**
 * Widget EVM pour afficher les métriques de valeur acquise
 */
export function EVMDashboardWidget({ project }: EVMDashboardWidgetProps) {
  const evmMetrics = useMemo(() => calculateEVM(project), [project]);

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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-1">
          Earned Value Management
        </h3>
        <p className="text-sm text-slate-500">{project.title}</p>
      </div>

      {/* Statuts principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${getStatusColor(evmMetrics.scheduleStatus, 'schedule')}`}>
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={18} />
            <span className="text-sm font-medium">Planning</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">
              {evmMetrics.scheduleStatus === 'ahead' && 'En avance'}
              {evmMetrics.scheduleStatus === 'on-track' && 'Dans les temps'}
              {evmMetrics.scheduleStatus === 'behind' && 'En retard'}
            </span>
            {getStatusIcon(evmMetrics.scheduleStatus)}
          </div>
          <p className="text-xs mt-1">SPI: {formatIndex(evmMetrics.spi)}</p>
        </div>

        <div className={`p-4 rounded-lg ${getStatusColor(evmMetrics.costStatus, 'cost')}`}>
          <div className="flex items-center gap-2 mb-1">
            <Coins size={18} />
            <span className="text-sm font-medium">Budget</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">
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
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-xs text-slate-500 mb-1">Planifié (PV)</p>
          <p className="text-lg font-semibold text-slate-800">{formatCurrency(evmMetrics.pv)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500 mb-1">Acquis (EV)</p>
          <p className="text-lg font-semibold text-blue-600">{formatCurrency(evmMetrics.ev)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500 mb-1">Réel (AC)</p>
          <p className="text-lg font-semibold text-slate-800">{formatCurrency(evmMetrics.ac)}</p>
        </div>
      </div>

      {/* Écarts */}
      <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {evmMetrics.sv >= 0 ? (
              <TrendingUp size={16} className="text-green-600" />
            ) : (
              <TrendingDown size={16} className="text-red-600" />
            )}
            <p className="text-xs text-slate-600">Écart Planning (SV)</p>
          </div>
          <p className={`text-base font-semibold ${evmMetrics.sv >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(evmMetrics.sv))}
            {evmMetrics.sv >= 0 ? ' ✓' : ' ✗'}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            {evmMetrics.cv >= 0 ? (
              <TrendingUp size={16} className="text-green-600" />
            ) : (
              <TrendingDown size={16} className="text-red-600" />
            )}
            <p className="text-xs text-slate-600">Écart Coût (CV)</p>
          </div>
          <p className={`text-base font-semibold ${evmMetrics.cv >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(evmMetrics.cv))}
            {evmMetrics.cv >= 0 ? ' ✓' : ' ✗'}
          </p>
        </div>
      </div>

      {/* Prévisions */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-700">Prévisions</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
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
          <div>
            <p className="text-slate-500">Reste à faire (ETC)</p>
            <p className="font-semibold text-slate-800">{formatCurrency(evmMetrics.etc)}</p>
          </div>
          <div>
            <p className="text-slate-500">Écart final (VAC)</p>
            <p className={`font-semibold ${evmMetrics.vac >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(evmMetrics.vac))}
              {evmMetrics.vac >= 0 ? ' ✓' : ' ✗'}
            </p>
          </div>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex justify-between text-xs text-slate-600 mb-2">
          <span>Avancement: {evmMetrics.percentComplete.toFixed(1)}%</span>
          <span>Budget consommé: {evmMetrics.percentSpent.toFixed(1)}%</span>
        </div>
        <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden">
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
            <span className="w-3 h-3 bg-blue-500 rounded-sm"></span>
            Avancement
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-orange-400 rounded-sm"></span>
            Consommation
          </span>
        </div>
      </div>
    </div>
  );
}

export default EVMDashboardWidget;
