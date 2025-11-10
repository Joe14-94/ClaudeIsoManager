import React, { createContext, useContext, PropsWithChildren } from 'react';
import { Notification } from '../types';
import { useNotificationGenerator } from '../hooks/useNotifications';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: PropsWithChildren<{}>) => {
  const notificationState = useNotificationGenerator();

  return (
    <NotificationContext.Provider value={notificationState}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationsContext = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationsContext must be used within a NotificationProvider');
  }
  return context;
};