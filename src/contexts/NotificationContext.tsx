"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type NotificationType = "success" | "error" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: Date;
  metadata?: {
    taskName?: string;
    taskId?: string;
    projectName?: string;
    projectId?: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: NotificationType, message: string, metadata?: Notification['metadata']) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  unreadCount: number;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = "smart-task-notifications";
const UNREAD_COUNT_KEY = "smart-task-notifications-unread";
const MAX_NOTIFICATIONS = 8;

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedUnreadCount = localStorage.getItem(UNREAD_COUNT_KEY);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const notificationsWithDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
        setNotifications(notificationsWithDates);
        if (storedUnreadCount) {
          setUnreadCount(parseInt(storedUnreadCount, 10));
        }
      } catch (error) {
        console.error("Failed to parse notifications:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    
    if (notifications.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }

    localStorage.setItem(UNREAD_COUNT_KEY, unreadCount.toString());
  }, [notifications, unreadCount, isHydrated]);

  const addNotification = useCallback((type: NotificationType, message: string, metadata?: Notification['metadata']) => {
    const newNotification: Notification = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      message,
      timestamp: new Date(),
      metadata,
    };

    setNotifications((prev) => {
      const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
      return updated;
    });

    setUnreadCount((prev) => prev + 1);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem(UNREAD_COUNT_KEY);
  }, []);

  const markAllAsRead = useCallback(() => {
    setUnreadCount(0);
    localStorage.setItem(UNREAD_COUNT_KEY, "0");
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
        unreadCount,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};
