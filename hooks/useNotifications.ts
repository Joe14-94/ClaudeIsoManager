
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import { Notification, ActivityStatus } from '../types';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/storage';

const NOTIFICATION_READ_STATUS_KEY = 'notificationReadStatus';

export const useNotificationGenerator = () => {
  const { activities, projects, lastCsvImportDate } = useData();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set(loadFromLocalStorage<string[]>(NOTIFICATION_READ_STATUS_KEY, [])));

  useEffect(() => {
    const generatedNotifications: Notification[] = [];
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    // Data freshness notification
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(now.getDate() - 15);

    if (lastCsvImportDate) {
      const importDate = new Date(lastCsvImportDate);
      if (importDate < fifteenDaysAgo) {
        const id = 'data-freshness-warning';
        generatedNotifications.push({
          id,
          entityId: 'data-management',
          message: `Les données de charges et budgets projets n'ont pas été mises à jour depuis plus de 15 jours. Pensez à importer les derniers fichiers CSV.`,
          type: 'warning',
          read: readIds.has(id),
          linkTo: {
            path: '/data-management',
            state: {},
          },
          createdAt: new Date().toISOString(),
        });
      }
    } else {
      const id = 'data-freshness-warning-initial';
      generatedNotifications.push({
        id,
        entityId: 'data-management',
        message: `Aucun import de données de charges/budgets (CSV) n'a été détecté. Pensez à importer les fichiers pour avoir des données à jour.`,
        type: 'warning',
        read: readIds.has(id),
        linkTo: {
          path: '/data-management',
          state: {},
        },
        createdAt: new Date().toISOString(),
      });
    }

    // Deadline notifications for activities
    activities.forEach(activity => {
      if (activity.endDatePlanned) {
        const endDate = new Date(activity.endDatePlanned);
        if (endDate <= sevenDaysFromNow && endDate >= now && activity.status !== ActivityStatus.COMPLETED && activity.status !== ActivityStatus.CANCELLED) {
          const id = `deadline-activity-${activity.id}`;
          generatedNotifications.push({
            id,
            entityId: activity.id,
            message: `L'activité "${activity.title}" arrive à échéance le ${endDate.toLocaleDateString('fr-FR')}.`,
            type: 'deadline',
            read: readIds.has(id),
            linkTo: {
              path: '/activities',
              state: { openActivity: activity.id },
            },
            createdAt: new Date().toISOString(),
          });
        }
      }
    });

    // Deadline and budget notifications for projects
    projects.forEach(project => {
      // Deadline
      if (project.projectEndDate) {
        const endDate = new Date(project.projectEndDate);
        if (endDate <= sevenDaysFromNow && endDate >= now && project.status !== ActivityStatus.COMPLETED && project.status !== ActivityStatus.CANCELLED) {
          const id = `deadline-project-${project.id}`;
          generatedNotifications.push({
            id,
            entityId: project.id,
            message: `Le projet "${project.title}" arrive à échéance le ${endDate.toLocaleDateString('fr-FR')}.`,
            type: 'deadline',
            read: readIds.has(id),
            linkTo: {
              path: '/projets',
              state: { openProject: project.id },
            },
            createdAt: new Date().toISOString(),
          });
        }
      }

      // Budget
      if (project.budgetCommitted && project.budgetApproved && project.budgetCommitted > project.budgetApproved) {
        const id = `budget-project-${project.id}`;
        generatedNotifications.push({
          id,
          entityId: project.id,
          message: `Le budget engagé du projet "${project.title}" a dépassé le budget accordé.`,
          type: 'budget',
          read: readIds.has(id),
          linkTo: {
            path: '/projets',
            state: { openProject: project.id },
          },
          createdAt: new Date().toISOString(),
        });
      }
    });
    
    // Mark as read and sort
    const updatedNotifications = generatedNotifications.map(n => ({...n, read: readIds.has(n.id)}));
    updatedNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setNotifications(updatedNotifications);
  }, [activities, projects, lastCsvImportDate, readIds]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const markAsRead = useCallback((id: string) => {
    setReadIds(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      saveToLocalStorage(NOTIFICATION_READ_STATUS_KEY, Array.from(newSet));
      return newSet;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds(prev => {
      const newSet = new Set(prev);
      notifications.forEach(n => newSet.add(n.id));
      saveToLocalStorage(NOTIFICATION_READ_STATUS_KEY, Array.from(newSet));
      return newSet;
    });
  }, [notifications]);

  return { notifications, unreadCount, markAsRead, markAllAsRead };
};