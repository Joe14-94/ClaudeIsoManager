import React, { createContext, useContext, useState, useCallback, useEffect, PropsWithChildren } from 'react';
import { useAuth } from './AuthContext';

// Types pour le système d'audit
export type AuditAction = 'create' | 'update' | 'delete' | 'import' | 'export' | 'login' | 'logout';

export type AuditEntityType =
  | 'project'
  | 'activity'
  | 'initiative'
  | 'objective'
  | 'orientation'
  | 'chantier'
  | 'process'
  | 'resource'
  | 'risk'
  | 'user'
  | 'system';

export interface AuditChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userRole: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  entityName: string;
  changes: AuditChange[];
  metadata?: Record<string, unknown>;
}

interface AuditContextType {
  logs: AuditLogEntry[];
  logAction: (
    action: AuditAction,
    entityType: AuditEntityType,
    entityId: string,
    entityName: string,
    changes?: AuditChange[],
    metadata?: Record<string, unknown>
  ) => void;
  logCreate: (entityType: AuditEntityType, entityId: string, entityName: string, data?: unknown) => void;
  logUpdate: (entityType: AuditEntityType, entityId: string, entityName: string, changes: AuditChange[]) => void;
  logDelete: (entityType: AuditEntityType, entityId: string, entityName: string) => void;
  getLogsForEntity: (entityType: AuditEntityType, entityId: string) => AuditLogEntry[];
  getRecentLogs: (limit?: number) => AuditLogEntry[];
  clearOldLogs: (daysToKeep?: number) => void;
  exportLogs: () => string;
}

const AUDIT_STORAGE_KEY = 'iso_manager_audit_logs';
const MAX_LOGS = 1000; // Limite pour éviter de surcharger le localStorage

const AuditContext = createContext<AuditContextType | undefined>(undefined);

/**
 * Génère les différences entre deux objets
 */
function generateChanges(oldObj: Record<string, unknown>, newObj: Record<string, unknown>): AuditChange[] {
  const changes: AuditChange[] = [];
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  for (const key of allKeys) {
    const oldValue = oldObj[key];
    const newValue = newObj[key];

    // Comparaison simple (ne gère pas les objets imbriqués profondément)
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({ field: key, oldValue, newValue });
    }
  }

  return changes;
}

export const AuditProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { userRole } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);

  // Charger les logs depuis le localStorage au démarrage
  useEffect(() => {
    try {
      const storedLogs = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs) as AuditLogEntry[];
        setLogs(parsedLogs);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des logs d\'audit:', error);
    }
  }, []);

  // Sauvegarder les logs dans le localStorage
  const saveLogs = useCallback((newLogs: AuditLogEntry[]) => {
    try {
      // Limiter le nombre de logs
      const logsToSave = newLogs.slice(-MAX_LOGS);
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logsToSave));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des logs d\'audit:', error);
      // Si quota dépassé, supprimer les anciens logs
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        const reducedLogs = newLogs.slice(-Math.floor(MAX_LOGS / 2));
        try {
          localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(reducedLogs));
        } catch {
          // En dernier recours, vider les logs
          localStorage.removeItem(AUDIT_STORAGE_KEY);
        }
      }
    }
  }, []);

  const generateId = () => `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const logAction = useCallback((
    action: AuditAction,
    entityType: AuditEntityType,
    entityId: string,
    entityName: string,
    changes: AuditChange[] = [],
    metadata?: Record<string, unknown>
  ) => {
    const newEntry: AuditLogEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      userId: 'current-user', // Dans une vraie app, ce serait l'ID utilisateur
      userRole: userRole ?? 'anonymous',
      action,
      entityType,
      entityId,
      entityName,
      changes,
      metadata,
    };

    setLogs((prevLogs) => {
      const updatedLogs = [...prevLogs, newEntry];
      saveLogs(updatedLogs);
      return updatedLogs;
    });
  }, [userRole, saveLogs]);

  const logCreate = useCallback((
    entityType: AuditEntityType,
    entityId: string,
    entityName: string,
    data?: unknown
  ) => {
    logAction('create', entityType, entityId, entityName, [], { createdData: data });
  }, [logAction]);

  const logUpdate = useCallback((
    entityType: AuditEntityType,
    entityId: string,
    entityName: string,
    changes: AuditChange[]
  ) => {
    if (changes.length > 0) {
      logAction('update', entityType, entityId, entityName, changes);
    }
  }, [logAction]);

  const logDelete = useCallback((
    entityType: AuditEntityType,
    entityId: string,
    entityName: string
  ) => {
    logAction('delete', entityType, entityId, entityName);
  }, [logAction]);

  const getLogsForEntity = useCallback((
    entityType: AuditEntityType,
    entityId: string
  ): AuditLogEntry[] => {
    return logs.filter(
      (log) => log.entityType === entityType && log.entityId === entityId
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs]);

  const getRecentLogs = useCallback((limit: number = 50): AuditLogEntry[] => {
    return [...logs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }, [logs]);

  const clearOldLogs = useCallback((daysToKeep: number = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    setLogs((prevLogs) => {
      const filteredLogs = prevLogs.filter(
        (log) => new Date(log.timestamp) >= cutoffDate
      );
      saveLogs(filteredLogs);
      return filteredLogs;
    });
  }, [saveLogs]);

  const exportLogs = useCallback((): string => {
    return JSON.stringify(logs, null, 2);
  }, [logs]);

  return (
    <AuditContext.Provider
      value={{
        logs,
        logAction,
        logCreate,
        logUpdate,
        logDelete,
        getLogsForEntity,
        getRecentLogs,
        clearOldLogs,
        exportLogs,
      }}
    >
      {children}
    </AuditContext.Provider>
  );
};

export const useAudit = (): AuditContextType => {
  const context = useContext(AuditContext);
  if (context === undefined) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
};

// Utilitaire pour générer les changements
export { generateChanges };
