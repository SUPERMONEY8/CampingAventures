/**
 * Notification Service
 * 
 * Service for managing notifications including scheduling, sending,
 * and managing notification history.
 */

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  limit,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';
// Firebase Cloud Messaging - Commented out until FCM is configured
// Uncomment when FCM is set up in Firebase Console:
// import { getMessaging, getToken, onMessage, type MessagePayload } from 'firebase/messaging';
import { db } from './firebase';
import type { Notification, NotificationType, NotificationData, NotificationPriority } from '../types';

/**
 * VAPID key for Firebase Cloud Messaging
 * In production, this should be in environment variables
 * TODO: Add to .env.local when FCM is configured
 */
// const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY || 'YOUR_VAPID_KEY_HERE';

/**
 * Get FCM token for current user
 * 
 * Note: Requires Firebase Cloud Messaging to be configured
 * Uncomment when FCM is set up in Firebase Console
 */
export async function getFCMToken(): Promise<string | null> {
  try {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    // TODO: Uncomment when FCM is configured
    // const messaging = getMessaging();
    // const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    // return token;
    
    return null;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

/**
 * Setup FCM message listener
 * 
 * Note: Requires Firebase Cloud Messaging to be configured
 */
export function setupFCMListener(
  _onMessageReceived: (payload: unknown) => void
): (() => void) | null {
  try {
    // TODO: Uncomment when FCM is configured
    // const messaging = getMessaging();
    // const unsubscribe = onMessage(messaging, onMessageReceived);
    // return unsubscribe;
    return null;
  } catch (error) {
    console.error('Error setting up FCM listener:', error);
    return null;
  }
}

/**
 * Schedule a notification
 * 
 * @param type - Notification type
 * @param userId - User ID
 * @param scheduledFor - Date when notification should be sent
 * @param data - Notification data payload
 * @param priority - Notification priority
 * @returns Notification ID
 */
export async function scheduleNotification(
  type: NotificationType,
  userId: string,
  scheduledFor: Date,
  data?: NotificationData,
  priority: NotificationPriority = 'normal'
): Promise<string> {
  try {
    // Get notification content based on type
    const content = getNotificationContent(type, data);

    const notificationRef = await addDoc(collection(db, 'notifications'), {
      userId,
      type,
      title: content.title,
      body: content.body,
      data: data || {},
      priority,
      read: false,
      sent: false,
      createdAt: Timestamp.now(),
      scheduledFor: Timestamp.fromDate(scheduledFor),
    });

    return notificationRef.id;
  } catch (error) {
    const err = error as Error;
    console.error('Error scheduling notification:', err);
    throw new Error(`Failed to schedule notification: ${err.message}`);
  }
}

/**
 * Send push notification immediately
 * 
 * @param userId - User ID
 * @param title - Notification title
 * @param body - Notification body
 * @param data - Notification data
 * @param priority - Notification priority
 * @returns Notification ID
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: NotificationData,
  priority: NotificationPriority = 'normal'
): Promise<string> {
  try {
    const notificationRef = await addDoc(collection(db, 'notifications'), {
      userId,
      type: 'guideTip',
      title,
      body,
      data: data || {},
      priority,
      read: false,
      sent: true,
      sentAt: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    // TODO: Send actual push notification via FCM
    // This would require a Cloud Function or backend service

    return notificationRef.id;
  } catch (error) {
    const err = error as Error;
    console.error('Error sending push notification:', err);
    throw new Error(`Failed to send notification: ${err.message}`);
  }
}

/**
 * Get notification history for user
 * 
 * @param userId - User ID
 * @param limitCount - Maximum number of notifications to fetch
 * @returns Array of notifications
 */
export async function getNotificationHistory(
  userId: string,
  limitCount: number = 50
): Promise<Notification[]> {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const notifications: Notification[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as DocumentData;
      notifications.push({
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        readAt: data.readAt?.toDate ? data.readAt.toDate() : (data.readAt ? new Date(data.readAt) : undefined),
        scheduledFor: data.scheduledFor?.toDate ? data.scheduledFor.toDate() : (data.scheduledFor ? new Date(data.scheduledFor) : undefined),
        sentAt: data.sentAt?.toDate ? data.sentAt.toDate() : (data.sentAt ? new Date(data.sentAt) : undefined),
      } as Notification);
    });

    return notifications;
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching notification history:', err);
    throw new Error(`Failed to fetch notifications: ${err.message}`);
  }
}

/**
 * Get unread notification count
 * 
 * @param userId - User ID
 * @returns Count of unread notifications
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
}

/**
 * Mark notification as read
 * 
 * @param notificationId - Notification ID
 */
export async function markAsRead(notificationId: string): Promise<void> {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: Timestamp.now(),
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error marking notification as read:', err);
    throw new Error(`Failed to mark as read: ${err.message}`);
  }
}

/**
 * Mark all notifications as read for user
 * 
 * @param userId - User ID
 */
export async function markAllAsRead(userId: string): Promise<void> {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const batch = querySnapshot.docs.map((docSnap) =>
      updateDoc(docSnap.ref, {
        read: true,
        readAt: Timestamp.now(),
      })
    );

    await Promise.all(batch);
  } catch (error) {
    const err = error as Error;
    console.error('Error marking all as read:', err);
    throw new Error(`Failed to mark all as read: ${err.message}`);
  }
}

/**
 * Clear all notifications for user
 * 
 * @param userId - User ID
 */
export async function clearAll(userId: string): Promise<void> {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, where('userId', '==', userId));

    const querySnapshot = await getDocs(q);
    const batch = querySnapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));

    await Promise.all(batch);
  } catch (error) {
    const err = error as Error;
    console.error('Error clearing notifications:', err);
    throw new Error(`Failed to clear notifications: ${err.message}`);
  }
}

/**
 * Schedule trip preparation reminders
 * 
 * @param tripId - Trip ID
 * @param userId - User ID
 * @param tripDate - Trip date
 */
export async function scheduleTripReminders(
  tripId: string,
  userId: string,
  tripDate: Date
): Promise<void> {
  try {
    // J-7 reminder
    const dateJ7 = new Date(tripDate);
    dateJ7.setDate(dateJ7.getDate() - 7);
    if (dateJ7 > new Date()) {
      await scheduleNotification(
        'reminderJ7',
        userId,
        dateJ7,
        { tripId, actionUrl: `/trips/${tripId}/prepare` },
        'normal'
      );
    }

    // J-3 reminder
    const dateJ3 = new Date(tripDate);
    dateJ3.setDate(dateJ3.getDate() - 3);
    if (dateJ3 > new Date()) {
      await scheduleNotification(
        'reminderJ3',
        userId,
        dateJ3,
        { tripId, actionUrl: `/trips/${tripId}/prepare` },
        'high'
      );
    }

    // J-1 reminder
    const dateJ1 = new Date(tripDate);
    dateJ1.setDate(dateJ1.getDate() - 1);
    if (dateJ1 > new Date()) {
      await scheduleNotification(
        'reminderJ1',
        userId,
        dateJ1,
        { tripId, actionUrl: `/trips/${tripId}/prepare` },
        'urgent'
      );
    }
  } catch (error) {
    const err = error as Error;
    console.error('Error scheduling trip reminders:', err);
    throw new Error(`Failed to schedule reminders: ${err.message}`);
  }
}

/**
 * Get notification content based on type
 */
function getNotificationContent(
  type: NotificationType,
  data?: NotificationData
): { title: string; body: string } {
  switch (type) {
    case 'reminderJ7':
      return {
        title: 'Plus que 7 jours !',
        body: 'Commence ta préparation pour la sortie. Vérifie ta checklist et télécharge les documents.',
      };

    case 'reminderJ3':
      return {
        title: '3 jours avant la sortie !',
        body: 'As-tu tout préparé ? Vérifie ta checklist et les prévisions météo.',
      };

    case 'reminderJ1':
      return {
        title: 'Demain c\'est le grand jour ! 🎉',
        body: 'Dernière vérification : checklist, documents, et point de rendez-vous.',
      };

    case 'weatherAlert':
      return {
        title: '⚠️ Alerte météo',
        body: data?.message as string || 'Conditions météorologiques difficiles prévues. Prévoyez des vêtements adaptés.',
      };

    case 'checklistReminder':
      return {
        title: 'Checklist incomplète',
        body: `Ta checklist n'est complétée qu'à ${data?.percentage || 0}%. Continue ta préparation !`,
      };

    case 'documentReminder':
      return {
        title: 'Documents à télécharger',
        body: 'N\'oublie pas de télécharger les documents importants (itinéraire, règlement, fiche de sécurité).',
      };

    case 'groupMessage':
      return {
        title: 'Nouveau message',
        body: data?.message as string || 'Nouveau message dans le groupe de la sortie.',
      };

    case 'guideTip':
      return {
        title: 'Conseil du guide',
        body: data?.message as string || 'Le guide a partagé un conseil important.',
      };

    case 'enrollmentConfirmed':
      return {
        title: 'Inscription confirmée !',
        body: 'Votre inscription à la sortie a été confirmée. Commencez votre préparation !',
      };

    case 'tripCancelled':
      return {
        title: 'Sortie annulée',
        body: 'La sortie a été annulée. Vous serez remboursé si applicable.',
      };

    case 'tripUpdated':
      return {
        title: 'Sortie mise à jour',
        body: 'Des informations importantes sur la sortie ont été mises à jour.',
      };

    default:
      return {
        title: 'Nouvelle notification',
        body: 'Vous avez une nouvelle notification.',
      };
  }
}

