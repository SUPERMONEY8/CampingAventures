/**
 * Push Notification Service
 * 
 * Service for sending browser push notifications (Web Push API)
 * Works on both desktop (Chrome) and mobile browsers
 */

import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { Trip } from '../types';

/**
 * Request notification permission and get subscription
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Send a browser notification
 */
export async function sendBrowserNotification(
  title: string,
  options: NotificationOptions = {}
): Promise<void> {
  const hasPermission = await requestNotificationPermission();
  
  if (!hasPermission) {
    console.warn('Notification permission not granted');
    return;
  }

  try {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    // Handle click
    notification.onclick = (event) => {
      event.preventDefault();
      if (options.data?.url) {
        window.focus();
        window.location.href = options.data.url as string;
      }
      notification.close();
    };
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

/**
 * Notify all users about a new trip
 */
export async function notifyNewTrip(trip: Trip): Promise<void> {
  try {
    // Get all users from Firestore
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);

    // Send notification to each user
    const notifications = usersSnapshot.docs.map(async (userDoc) => {
      const userId = userDoc.id;
      
      // Create notification in Firestore
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        userId,
        type: 'newTrip',
        title: 'Nouvelle sortie disponible ! 🎉',
        body: `${trip.title} - ${trip.location.name}`,
        data: {
          tripId: trip.id,
          actionUrl: `/trips/${trip.id}`,
        },
        read: false,
        createdAt: Timestamp.now(),
      });

      // Send browser notification if permission granted
      const hasPermission = await requestNotificationPermission();
      if (hasPermission) {
        await sendBrowserNotification('Nouvelle sortie disponible ! 🎉', {
          body: `${trip.title} - ${trip.location.name}`,
          data: {
            url: `/trips/${trip.id}`,
            tripId: trip.id,
          },
        });
      }
    });

    await Promise.all(notifications);
  } catch (error) {
    console.error('Error notifying users about new trip:', error);
    // Don't throw - notification is not critical
  }
}

/**
 * Notify specific user about a new trip
 */
export async function notifyUserAboutNewTrip(
  userId: string,
  trip: Trip
): Promise<void> {
  try {
    // Create notification in Firestore
    const notificationsRef = collection(db, 'notifications');
    await addDoc(notificationsRef, {
      userId,
      type: 'newTrip',
      title: 'Nouvelle sortie disponible ! 🎉',
      body: `${trip.title} - ${trip.location.name}`,
      data: {
        tripId: trip.id,
        actionUrl: `/trips/${trip.id}`,
      },
      read: false,
      createdAt: Timestamp.now(),
    });

    // Send browser notification if permission granted
    const hasPermission = await requestNotificationPermission();
    if (hasPermission) {
      await sendBrowserNotification('Nouvelle sortie disponible ! 🎉', {
        body: `${trip.title} - ${trip.location.name}`,
        data: {
          url: `/trips/${trip.id}`,
          tripId: trip.id,
        },
      });
    }
  } catch (error) {
    console.error('Error notifying user about new trip:', error);
  }
}

