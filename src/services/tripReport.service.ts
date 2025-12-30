/**
 * Trip Report Service
 * 
 * Service for generating personal trip reports after trip completion.
 */

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import { getTripById } from './trip.service';
import { getUserProfile } from './user.service';
import { getTripPhotos } from './liveTrip.service';
import { getTripChallenges } from './liveTrip.service';
import type { PersonalTripReport, Trip, Activity } from '../types';

/**
 * Generate personal trip report
 * 
 * @param userId - User ID
 * @param tripId - Trip ID
 * @returns Personal trip report
 */
export async function generatePersonalReport(
  userId: string,
  tripId: string
): Promise<PersonalTripReport> {
  try {
    // Fetch trip data
    const trip = await getTripById(tripId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    // User profile fetched but not needed for report generation
    await getUserProfile(userId);

    // Fetch activities (from itinerary)
    const activities = trip.itinerary?.flatMap((day) => day.activities) || [];

    // Fetch challenges
    const challenges = await getTripChallenges(tripId);

    // Fetch photos
    const photos = await getTripPhotos(tripId);
    const userPhotos = photos.filter((photo) => photo.userId === userId);

    // Calculate statistics
    const activitiesCompleted = activities.filter((a) => a.status === 'completed').length;
    const challengesCompleted = challenges.filter((c) => c.completed && c.participants.includes(userId)).length;
    
    // Calculate points (simplified - would need actual tracking)
    const pointsEarned = 
      activitiesCompleted * 10 + 
      challengesCompleted * 50 + 
      userPhotos.length * 5;

    // Get badges earned during trip (would need to track this)
    const badgesEarned: string[] = []; // TODO: Track badges earned during trip

    // Calculate distance and elevation (would need GPS tracking data)
    const distance = calculateDistance(trip); // Simplified
    const elevation = calculateElevation(trip); // Simplified
    const activeHours = calculateActiveHours(activities);

    // Get participants
    const participants = trip.participants || [];

    // Get group photos (top 5 by likes)
    const groupPhotos = photos
      .sort((a, b) => b.likes.length - a.likes.length)
      .slice(0, 5)
      .map((p) => p.url);

    // Create report
    const report: PersonalTripReport = {
      id: `report-${tripId}-${userId}-${Date.now()}`,
      userId,
      tripId,
      tripTitle: trip.title,
      tripDate: trip.date,
      tripDuration: trip.duration || 1,
      distance,
      elevation,
      activeHours,
      activitiesCompleted,
      challengesCompleted,
      pointsEarned,
      badgesEarned,
      photosCount: userPhotos.length,
      momentsShared: userPhotos.length, // Simplified
      roles: activities
        .filter((a) => a.assignedParticipants?.includes(userId))
        .map((a) => a.role)
        .filter((role, index, self) => self.indexOf(role) === index), // Unique roles
      activities: activities.map((activity) => ({
        id: activity.id,
        name: activity.name,
        time: activity.time,
        completed: activity.status === 'completed' || false,
        photoUrl: userPhotos.find((p) => {
          const photoTime = new Date(p.timestamp);
          const activityTime = new Date(activity.time);
          const diff = Math.abs(photoTime.getTime() - activityTime.getTime());
          return diff < 3600000; // Within 1 hour
        })?.url,
      })),
      photos: userPhotos.map((photo) => ({
        id: photo.id,
        url: photo.url,
        thumbnailUrl: photo.thumbnailUrl,
        timestamp: photo.timestamp,
        caption: photo.caption,
      })),
      participants: participants.map((p) => ({
        userId: p.userId,
        userName: p.userName,
        avatarUrl: undefined, // Would need to fetch from user profile
      })),
      groupPhotos,
      generatedAt: new Date(),
    };

    // Save report to Firestore
    try {
      await addDoc(collection(db, 'tripReports'), {
        ...report,
        tripDate: Timestamp.fromDate(report.tripDate),
        activities: report.activities.map((a) => ({
          ...a,
          time: Timestamp.fromDate(a.time),
        })),
        photos: report.photos.map((p) => ({
          ...p,
          timestamp: Timestamp.fromDate(p.timestamp),
        })),
        generatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.warn('Could not save report to Firestore:', error);
    }

    return report;
  } catch (error) {
    const err = error as Error;
    console.error('Error generating trip report:', err);
    throw new Error(`Failed to generate report: ${err.message}`);
  }
}

/**
 * Get personal trip report
 * 
 * @param userId - User ID
 * @param tripId - Trip ID
 * @returns Personal trip report or null
 */
export async function getPersonalReport(
  userId: string,
  tripId: string
): Promise<PersonalTripReport | null> {
  try {
    const reportsRef = collection(db, 'tripReports');
    const q = query(
      reportsRef,
      where('userId', '==', userId),
      where('tripId', '==', tripId)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data() as DocumentData;

    return {
      id: doc.id,
      userId: data.userId,
      tripId: data.tripId,
      tripTitle: data.tripTitle,
      tripDate: data.tripDate?.toDate ? data.tripDate.toDate() : new Date(data.tripDate),
      tripDuration: data.tripDuration,
      distance: data.distance,
      elevation: data.elevation,
      activeHours: data.activeHours,
      activitiesCompleted: data.activitiesCompleted,
      challengesCompleted: data.challengesCompleted,
      pointsEarned: data.pointsEarned,
      badgesEarned: data.badgesEarned || [],
      photosCount: data.photosCount,
      momentsShared: data.momentsShared,
      roles: data.roles || [],
      activities: (data.activities || []).map((a: DocumentData) => ({
        id: a.id,
        name: a.name,
        time: a.time?.toDate ? a.time.toDate() : new Date(a.time),
        completed: a.completed || false,
        photoUrl: a.photoUrl,
        personalNote: a.personalNote,
      })),
      photos: (data.photos || []).map((p: DocumentData) => ({
        id: p.id,
        url: p.url,
        thumbnailUrl: p.thumbnailUrl,
        timestamp: p.timestamp?.toDate ? p.timestamp.toDate() : new Date(p.timestamp),
        caption: p.caption,
      })),
      participants: data.participants || [],
      groupPhotos: data.groupPhotos || [],
      generatedAt: data.generatedAt?.toDate ? data.generatedAt.toDate() : new Date(data.generatedAt),
    };
  } catch (error) {
    console.error('Error fetching trip report:', error);
    return null;
  }
}

/**
 * Update personal note for an activity
 * 
 * @param reportId - Report ID
 * @param activityId - Activity ID
 * @param note - Personal note
 */
export async function updateActivityNote(
  reportId: string,
  activityId: string,
  note: string
): Promise<void> {
  try {
    // This would update the report in Firestore
    // For now, we'll save to localStorage
    const key = `tripReport-${reportId}-notes`;
    const existing = localStorage.getItem(key);
    const notes = existing ? JSON.parse(existing) : {};
    notes[activityId] = note;
    localStorage.setItem(key, JSON.stringify(notes));
  } catch (error) {
    console.error('Error updating activity note:', error);
  }
}

/**
 * Calculate distance (simplified - would use GPS tracking)
 */
function calculateDistance(trip: Trip): number {
  // Simplified calculation
  // In production, would use actual GPS tracking data
  return trip.duration ? trip.duration * 8 : 20; // ~8km per day average
}

/**
 * Calculate elevation (simplified)
 */
function calculateElevation(trip: Trip): number {
  // Simplified calculation
  // In production, would use actual GPS tracking data
  return trip.difficulty === 'avancé' ? 800 : trip.difficulty === 'intermédiaire' ? 450 : 200;
}

/**
 * Calculate active hours
 */
function calculateActiveHours(activities: Activity[]): number {
  // Sum of activity durations
  const totalMinutes = activities.reduce((sum, activity) => {
    return sum + (activity.duration || 60);
  }, 0);
  return Math.round((totalMinutes / 60) * 10) / 10; // Round to 1 decimal
}

