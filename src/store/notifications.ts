import { useState, useEffect } from 'react';

export interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  appId?: string;
  timestamp: number;
  read: boolean;
}

let nextId = 1;
let notifications: NotificationPayload[] = [];
let listeners: (() => void)[] = [];

export const addNotification = (title: string, message: string, appId?: string) => {
  const newNotification: NotificationPayload = {
    id: `notif_${Date.now()}_${nextId++}`,
    title,
    message,
    appId,
    timestamp: Date.now(),
    read: false,
  };
  notifications = [newNotification, ...notifications];
  emitChange();
};

export const markAsRead = (id: string) => {
  notifications = notifications.map(n => n.id === id ? { ...n, read: true } : n);
  emitChange();
};

export const markAllAsRead = () => {
  notifications = notifications.map(n => ({ ...n, read: true }));
  emitChange();
};

export const clearAll = () => {
  notifications = [];
  emitChange();
};

export const clearNotification = (id: string) => {
  notifications = notifications.filter(n => n.id !== id);
  emitChange();
};

const emitChange = () => {
  for (const listener of listeners) {
    listener();
  }
};

export const useNotifications = () => {
  const [state, setState] = useState(notifications);

  useEffect(() => {
    const listener = () => setState(notifications);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  return {
    notifications: state,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    clearNotification,
    unreadCount: state.filter(n => !n.read).length
  };
};
