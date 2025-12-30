/**
 * Custom hook for managing notifications
 * 
 * Provides real-time notification updates, unread count, and notification management.
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import {
  getNotificationHistory,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  clearAll,
} from '../services/notification.service';
import type { Notification } from '../types';

/**
 * Use notifications hook return type
 */
interface UseNotificationsReturn {
  /**
   * List of notifications
   */
  notifications: Notification[];

  /**
   * Unread notification count
   */
  unreadCount: number;

  /**
   * Loading state
   */
  loading: boolean;

  /**
   * Error message
   */
  error: string | null;

  /**
   * Mark notification as read
   */
  markAsRead: (notificationId: string) => Promise<void>;

  /**
   * Mark all as read
   */
  markAllAsRead: () => Promise<void>;

  /**
   * Clear all notifications
   */
  clearAll: () => Promise<void>;

  /**
   * Refresh notifications
   */
  refresh: () => void;
}

/**
 * Custom hook to manage notifications
 * 
 * @param userId - User ID
 * @param enabled - Whether to enable the hook
 * @returns Notifications data and methods
 */
export function useNotifications(
  userId: string | null | undefined,
  enabled: boolean = true
): UseNotificationsReturn {
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  /**
   * Fetch notifications
   */
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) return [];
      return await getNotificationHistory(userId, 50);
    },
    enabled: enabled && !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });

  /**
   * Fetch unread count
   */
  const { data: unreadCountData } = useQuery({
    queryKey: ['notifications', 'unread', userId],
    queryFn: async () => {
      if (!userId) return 0;
      return await getUnreadCount(userId);
    },
    enabled: enabled && !!userId,
    staleTime: 30 * 1000,
  });

  /**
   * Real-time listener
   */
  useEffect(() => {
    if (!userId || !enabled) return;

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notificationsData: Notification[] = [];
        let unread = 0;

        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as DocumentData;
          const notification = {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
            readAt: data.readAt?.toDate ? data.readAt.toDate() : (data.readAt ? new Date(data.readAt) : undefined),
            scheduledFor: data.scheduledFor?.toDate ? data.scheduledFor.toDate() : (data.scheduledFor ? new Date(data.scheduledFor) : undefined),
            sentAt: data.sentAt?.toDate ? data.sentAt.toDate() : (data.sentAt ? new Date(data.sentAt) : undefined),
          } as Notification;

          notificationsData.push(notification);
          if (!notification.read) {
            unread++;
          }
        });

        setNotifications(notificationsData);
        setUnreadCount(unread);
      },
      (error) => {
        console.error('Error in notifications listener:', error);
      }
    );

    return () => unsubscribe();
  }, [userId, enabled]);

  /**
   * Mark as read mutation
   */
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await markAsRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread', userId] });
    },
  });

  /**
   * Mark all as read mutation
   */
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      await markAllAsRead(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread', userId] });
    },
  });

  /**
   * Clear all mutation
   */
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      await clearAll(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread', userId] });
    },
  });

  return {
    notifications: notifications.length > 0 ? notifications : (data || []),
    unreadCount: unreadCount > 0 ? unreadCount : (unreadCountData || 0),
    loading: isLoading,
    error: error ? (error as Error).message : null,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    clearAll: clearAllMutation.mutateAsync,
    refresh: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  };
}

