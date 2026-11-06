import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeAlerts, setActiveAlerts] = useState([]);

  const [browserPermission, setBrowserPermission] = useState(() => {
    return typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default';
  });

  const requestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setBrowserPermission(perm);
        if (perm === 'granted') {
          new Notification('Hostel Expense Tracker', {
            body: 'Desktop budget notifications are now enabled! You will be alerted when reaching 70%, 90%, or 100% budget thresholds.',
            icon: '/icon.png',
          });
        }
      } catch (e) {
        console.error('Error requesting notification permission:', e);
      }
    }
  };

  const triggerDesktopAlert = (title, message) => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      new Notification(title, {
        body: message,
        icon: '/icon.png',
      });
    }
  };

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);

        // Check if there are unread critical alerts and alert the user
        const unreadCritical = res.data.notifications.find(
          (n) => !n.isRead && (n.type === 'danger' || n.type === 'exceeded' || n.type === 'warning')
        );
        if (unreadCritical) {
          triggerDesktopAlert(unreadCritical.title, unreadCritical.message);
        }
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const dismissNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      // Also remove from activeAlerts if matching
      setActiveAlerts((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error('Failed to dismiss notification:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        browserPermission,
        requestBrowserPermission,
        triggerDesktopAlert,
        activeAlerts,
        setActiveAlerts,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        dismissNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);

