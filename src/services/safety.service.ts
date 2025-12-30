/**
 * Safety Service
 * 
 * Service for managing SOS alerts, safety information, and emergency contacts.
 * Offline-first with local storage backup.
 */

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type { SOSAlert, SafetyInfo } from '../types';

/**
 * Trigger SOS alert
 * 
 * @param userId - User ID
 * @param tripId - Trip ID
 * @param location - GPS location
 * @param severity - Alert severity
 * @returns SOS Alert ID
 */
export async function triggerSOS(
  userId: string,
  tripId: string,
  location: { lat: number; lng: number; accuracy?: number },
  severity: 'low' | 'medium' | 'high' | 'critical' = 'critical'
): Promise<string> {
  try {
    // Save to local storage first (offline support)
    const sosAlert: SOSAlert = {
      id: `sos-${Date.now()}`,
      userId,
      tripId,
      location: {
        ...location,
        timestamp: new Date(),
      },
      triggeredAt: new Date(),
      resolved: false,
      guideNotified: false,
      emergencyContactNotified: false,
      severity,
    };

    // Save locally
    const localSOS = localStorage.getItem('sosAlerts');
    const alerts = localSOS ? JSON.parse(localSOS) : [];
    alerts.push(sosAlert);
    localStorage.setItem('sosAlerts', JSON.stringify(alerts));

    // Try to save to Firestore (if online)
    try {
      const sosRef = await addDoc(collection(db, 'sosAlerts'), {
        userId,
        tripId,
        location: {
          lat: location.lat,
          lng: location.lng,
          accuracy: location.accuracy || null,
          timestamp: Timestamp.now(),
        },
        triggeredAt: Timestamp.now(),
        resolved: false,
        guideNotified: false,
        emergencyContactNotified: false,
        severity,
      });

      // Update local with Firestore ID
      sosAlert.id = sosRef.id;
      alerts[alerts.length - 1] = sosAlert;
      localStorage.setItem('sosAlerts', JSON.stringify(alerts));

      // Notify guide and emergency contact
      await notifyGuide(sosRef.id);
      await notifyEmergencyContact(sosRef.id);

      return sosRef.id;
    } catch (error) {
      // Offline mode - will sync later
      console.warn('SOS alert saved locally, will sync when online:', error);
      return sosAlert.id;
    }
  } catch (error) {
    console.error('Error triggering SOS:', error);
    const err = error as Error;
    throw new Error(`Failed to trigger SOS: ${err.message}`);
  }
}

/**
 * Notify guide about SOS alert
 * 
 * @param sosId - SOS Alert ID
 */
export async function notifyGuide(sosId: string): Promise<void> {
  try {
    const sosRef = doc(db, 'sosAlerts', sosId);
    await updateDoc(sosRef, {
      guideNotified: true,
      guideNotifiedAt: Timestamp.now(),
    });

    // TODO: Send push notification to guide
    // This would require FCM setup and guide's device token
  } catch (error) {
    console.error('Error notifying guide:', error);
    // Don't throw - SOS is already triggered
  }
}

/**
 * Notify emergency contact about SOS alert
 * 
 * @param sosId - SOS Alert ID
 */
export async function notifyEmergencyContact(sosId: string): Promise<void> {
  try {
    const sosRef = doc(db, 'sosAlerts', sosId);
    await updateDoc(sosRef, {
      emergencyContactNotified: true,
      emergencyContactNotifiedAt: Timestamp.now(),
    });

    // TODO: Send SMS/Email to emergency contact
    // This would require a backend service or third-party API
  } catch (error) {
    console.error('Error notifying emergency contact:', error);
    // Don't throw - SOS is already triggered
  }
}

/**
 * Resolve SOS alert
 * 
 * @param sosId - SOS Alert ID
 * @param notes - Resolution notes
 */
export async function resolveSOS(sosId: string, notes?: string): Promise<void> {
  try {
    // Update local storage
    const localSOS = localStorage.getItem('sosAlerts');
    if (localSOS) {
      const alerts = JSON.parse(localSOS) as SOSAlert[];
      const alertIndex = alerts.findIndex((a) => a.id === sosId);
      if (alertIndex >= 0) {
        alerts[alertIndex].resolved = true;
        alerts[alertIndex].resolvedAt = new Date();
        alerts[alertIndex].notes = notes;
        localStorage.setItem('sosAlerts', JSON.stringify(alerts));
      }
    }

    // Update Firestore (if online)
    try {
      const sosRef = doc(db, 'sosAlerts', sosId);
      await updateDoc(sosRef, {
        resolved: true,
        resolvedAt: Timestamp.now(),
        notes: notes || null,
      });
    } catch (error) {
      console.warn('Could not update Firestore, saved locally:', error);
    }
  } catch (error) {
    const err = error as Error;
    console.error('Error resolving SOS:', err);
    throw new Error(`Failed to resolve SOS: ${err.message}`);
  }
}

/**
 * Get safety information for a trip
 * 
 * @param tripId - Trip ID
 * @returns Safety information
 */
export async function getSafetyInfo(tripId: string): Promise<SafetyInfo | null> {
  try {
    // Try to get from Firestore
    const tripSnap = await getDocs(query(collection(db, 'trips'), where('id', '==', tripId)));

    if (!tripSnap.empty) {
      const tripData = tripSnap.docs[0].data() as DocumentData;
      
      // Get guide from participants
      const guide = tripData.participants?.find((p: { role: string }) => p.role === 'guide');

      return {
        tripId,
        guideContact: {
          name: guide?.userName || 'Guide',
          phone: guide?.phone || '',
          whatsapp: guide?.whatsapp,
        },
        emergencyNumbers: {
          police: '17',
          protectionCivile: '14',
          medical: '1021',
        },
        meetingPoint: tripData.meetingPoint || {
          name: 'Point de rendez-vous',
          address: '',
          coordinates: {
            lat: tripData.location?.coordinates?.lat || 0,
            lng: tripData.location?.coordinates?.lng || 0,
          },
        },
        nearestHospital: tripData.nearestHospital || undefined,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching safety info:', error);
    // Return default safety info if offline
    return {
      tripId,
      guideContact: {
        name: 'Guide',
        phone: '',
      },
      emergencyNumbers: {
        police: '17',
        protectionCivile: '14',
        medical: '1021',
      },
      meetingPoint: {
        name: 'Point de rendez-vous',
        address: '',
        coordinates: { lat: 0, lng: 0 },
      },
    };
  }
}

/**
 * Get active SOS alerts for user
 * 
 * @param userId - User ID
 * @returns Array of active SOS alerts
 */
export async function getActiveSOSAlerts(userId: string): Promise<SOSAlert[]> {
  try {
    // Check local storage first
    const localSOS = localStorage.getItem('sosAlerts');
    if (localSOS) {
      const alerts = JSON.parse(localSOS) as SOSAlert[];
      return alerts.filter((a) => a.userId === userId && !a.resolved);
    }

    // Try Firestore
    const sosRef = collection(db, 'sosAlerts');
    const q = query(
      sosRef,
      where('userId', '==', userId),
      where('resolved', '==', false)
    );

    const snapshot = await getDocs(q);
    const alerts: SOSAlert[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as DocumentData;
      alerts.push({
        id: docSnap.id,
        userId: data.userId,
        tripId: data.tripId,
        location: {
          lat: data.location.lat,
          lng: data.location.lng,
          accuracy: data.location.accuracy,
          timestamp: data.location.timestamp?.toDate ? data.location.timestamp.toDate() : new Date(data.location.timestamp),
        },
        triggeredAt: data.triggeredAt?.toDate ? data.triggeredAt.toDate() : new Date(data.triggeredAt),
        resolvedAt: data.resolvedAt?.toDate ? data.resolvedAt.toDate() : (data.resolvedAt ? new Date(data.resolvedAt) : undefined),
        resolved: data.resolved || false,
        notes: data.notes,
        guideNotified: data.guideNotified || false,
        emergencyContactNotified: data.emergencyContactNotified || false,
        severity: data.severity || 'critical',
      });
    });

    return alerts;
  } catch (error) {
    console.error('Error fetching SOS alerts:', error);
    return [];
  }
}

/**
 * Save location history (for safety tracking)
 * 
 * @param userId - User ID
 * @param tripId - Trip ID
 * @param location - GPS location
 */
export async function saveLocationHistory(
  userId: string,
  tripId: string,
  location: { lat: number; lng: number; accuracy?: number }
): Promise<void> {
  try {
    // Save to local storage (offline-first)
    const historyKey = `locationHistory-${tripId}-${userId}`;
    const existing = localStorage.getItem(historyKey);
    const history = existing ? JSON.parse(existing) : [];
    
    history.push({
      lat: location.lat,
      lng: location.lng,
      accuracy: location.accuracy,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 100 locations
    if (history.length > 100) {
      history.shift();
    }

    localStorage.setItem(historyKey, JSON.stringify(history));

    // Try to sync to Firestore (if online)
    try {
      await addDoc(collection(db, 'locationHistory'), {
        userId,
        tripId,
        location: {
          lat: location.lat,
          lng: location.lng,
          accuracy: location.accuracy || null,
        },
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      // Offline - will sync later
      console.warn('Location saved locally, will sync when online');
    }
  } catch (error) {
    console.error('Error saving location history:', error);
  }
}

