import React, { useState, useMemo } from 'react';
import { History, Download, Trash2, Filter, RefreshCw, ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import { useAudit, AuditLogEntry, AuditAction, AuditEntityType } from '../contexts/AuditContext';
import { useToast } from '../contexts/ToastContext';
import ConfirmModal from '../components/ui/ConfirmModal';
import { useConfirm } from '../hooks/useConfirm';

const actionLabels: Record<AuditAction, { label: string; color: string }> = {
  create: { label: 'Création', color: 'bg-green-100 text-green-800' },
  update: { label: 'Modification', color: 'bg-blue-100 text-blue-800' },
  delete: { label: 'Suppression', color: 'bg-red-100 text-red-800' },
  import: { label: 'Import', color: 'bg-purple-100 text-purple-800' },
  export: { label: 'Export', color: 'bg-indigo-100 text-indigo-800' },
  login: { label: 'Connexion', color: 'bg-cyan-100 text-cyan-800' },
  logout: { label: 'Déconnexion', color: 'bg-slate-100 text-slate-800' },
};

const entityLabels: Record<AuditEntityType, string> = {
  project: 'Projet',
  activity: 'Activité',
  initiative: 'Initiative',
  objective: 'Objectif',
  orientation: 'Orientation',
  chantier: 'Chantier',
  process: 'Processus',
  resource: 'Ressource',
  risk: 'Risque',
  user: 'Utilisateur',
  system: 'Système',
};

const AuditLogPage: React.FC = () => {
  const { logs, getRecentLogs, clearOldLogs, exportLogs } = useAudit();
  const { showSuccess, showInfo } = useToast();
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();

  const [filterAction, setFilterAction] = useState<AuditAction | 'all'>('all');
  const [filterEntity, setFilterEntity] = useState<AuditEntityType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  // Filtrer les logs
  const filteredLogs = useMemo(() => {
    let result = [...logs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    if (filterAction !== 'all') {
      result = result.filter((log) => log.action === filterAction);
    }

    if (filterEntity !== 'all') {
      result = result.filter((log) => log.entityType === filterEntity);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (log) =>
          log.entityName.toLowerCase().includes(query) ||
          log.entityId.toLowerCase().includes(query)
      );
    }

    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      result = result.filter((log) => new Date(log.timestamp) >= startDate);
    }

    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter((log) => new Date(log.timestamp) <= endDate);
    }

    return result;
  }, [logs, filterAction, filterEntity, searchQuery, dateRange]);

  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExport = () => {
    const data = exportLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('Export réussi', 'Le journal d\'audit a été exporté');
  };

  const handleClearOldLogs = async () => {
    const confirmed = await confirm({
      title: 'Nettoyer les anciens logs',
      message: 'Cette action supprimera tous les logs de plus de 30 jours. Cette action est irréversible.',
      variant: 'warning',
      confirmText: 'Nettoyer',
      cancelText: 'Annuler',
    });

    if (confirmed) {
      clearOldLogs(30);
      showInfo('Nettoyage effectué', 'Les logs de plus de 30 jours ont été supprimés');
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'medium',
    }).format(date);
  };

  const resetFilters = () => {
    setFilterAction('all');
    setFilterEntity('all');
    setSearchQuery('');
    setDateRange({ start: '', end: '' });
  };

  return (
    <div className="space-y-3">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <History className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Journal d'Audit</h1>
            <p className="text-sm text-slate-500">
              {filteredLogs.length} entrée{filteredLogs.length > 1 ? 's' : ''} sur {logs.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download size={16} />
            Exporter
          </button>
          <button
            onClick={handleClearOldLogs}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
            Nettoyer
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-slate-500" />
          <h2 className="font-medium text-slate-700">Filtres</h2>
          <button
            onClick={resetFilters}
            className="ml-auto flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <RefreshCw size={14} />
            Réinitialiser
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Recherche */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Recherche
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nom ou ID..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Action */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Action
            </label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value as AuditAction | 'all')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Toutes les actions</option>
              {Object.entries(actionLabels).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Type d'entité */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Type
            </label>
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value as AuditEntityType | 'all')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Tous les types</option>
              {Object.entries(entityLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Date de début */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Du
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Date de fin */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Au
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Tableau des logs */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Calendar className="mx-auto mb-4 text-slate-300" size={48} />
            <p className="text-lg font-medium">Aucune entrée dans le journal</p>
            <p className="text-sm mt-1">
              Les actions effectuées seront enregistrées ici
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="w-8 px-4 py-3"></th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Élément
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Utilisateur
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLogs.map((log) => {
                  const isExpanded = expandedRows.has(log.id);
                  const hasChanges = log.changes.length > 0;

                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        className={`hover:bg-slate-50 transition-colors ${
                          hasChanges ? 'cursor-pointer' : ''
                        }`}
                        onClick={() => hasChanges && toggleRowExpansion(log.id)}
                      >
                        <td className="px-4 py-3">
                          {hasChanges && (
                            <button className="text-slate-400 hover:text-slate-600">
                              {isExpanded ? (
                                <ChevronDown size={16} />
                              ) : (
                                <ChevronRight size={16} />
                              )}
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              actionLabels[log.action]?.color ?? 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {actionLabels[log.action]?.label ?? log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {entityLabels[log.entityType] ?? log.entityType}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-800 max-w-xs truncate">
                          {log.entityName}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          <span className="capitalize">{log.userRole}</span>
                        </td>
                      </tr>

                      {/* Détails des changements */}
                      {isExpanded && hasChanges && (
                        <tr className="bg-slate-50">
                          <td colSpan={6} className="px-8 py-4">
                            <div className="text-sm">
                              <h4 className="font-medium text-slate-700 mb-2">
                                Modifications ({log.changes.length})
                              </h4>
                              <div className="space-y-2">
                                {log.changes.map((change, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-4 p-2 bg-white rounded border border-slate-200"
                                  >
                                    <span className="font-medium text-slate-700 min-w-[120px]">
                                      {change.field}
                                    </span>
                                    <div className="flex-1 flex items-center gap-2">
                                      <span className="text-red-600 line-through">
                                        {JSON.stringify(change.oldValue) ?? '(vide)'}
                                      </span>
                                      <span className="text-slate-400">→</span>
                                      <span className="text-green-600">
                                        {JSON.stringify(change.newValue) ?? '(vide)'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmation */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant}
      />
    </div>
  );
};

export default AuditLogPage;
