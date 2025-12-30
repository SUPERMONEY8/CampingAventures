/**
 * User Service
 * 
 * Service layer for user-related operations including profile management,
 * statistics, trips, badges, and medical information.
 * 
 * All functions use async/await with robust error handling.
 */

import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  getDocs,
  type DocumentData,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { User, UserStats, Trip, Achievement, MedicalInfo } from '../types';
import {
  calculateLevel,
  calculateDistance,
  calculateHours,
  getNextLevelPoints,
} from '../utils/stats';

/**
 * Get user profile from Firestore
 * 
 * @param userId - User ID
 * @returns User profile object
 * @throws Error if user not found or fetch fails
 * 
 * @example
 * ```ts
 * const profile = await getUserProfile('user123');
 * ```
 */
export async function getUserProfile(userId: string): Promise<User> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const data = userSnap.data() as DocumentData;
    return {
      ...data,
      history: data.history?.map((entry: { date: { toDate?: () => Date } | Date | string }) => ({
        ...entry,
        date: entry.date && typeof entry.date === 'object' && 'toDate' in entry.date && entry.date.toDate
          ? entry.date.toDate()
          : new Date(entry.date as Date | string),
      })) || [],
    } as User;
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching user profile:', err);
    throw new Error(`Failed to fetch user profile: ${err.message}`);
  }
}

/**
 * Update user profile in Firestore
 * 
 * @param userId - User ID
 * @param data - Partial user data to update
 * @returns Promise that resolves when update is complete
 * @throws Error if update fails
 * 
 * @example
 * ```ts
 * await updateUserProfile('user123', { name: 'John Doe', age: 30 });
 * ```
 */
export async function updateUserProfile(
  userId: string,
  data: Partial<User>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date(),
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error updating user profile:', err);
    throw new Error(`Failed to update user profile: ${err.message}`);
  }
}

/**
 * Upload user avatar image to Firebase Storage
 * 
 * @param userId - User ID
 * @param file - Image file to upload
 * @returns Promise that resolves with the download URL
 * @throws Error if upload fails
 * 
 * @example
 * ```ts
 * const url = await uploadAvatar('user123', file);
 * ```
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }

    const avatarRef = ref(storage, `avatars/${userId}/${Date.now()}_${file.name}`);
    await uploadBytes(avatarRef, file);
    const downloadURL = await getDownloadURL(avatarRef);

    // Update user profile with new avatar URL
    await updateUserProfile(userId, { avatarUrl: downloadURL } as Partial<User>);

    return downloadURL;
  } catch (error) {
    const err = error as Error;
    console.error('Error uploading avatar:', err);
    throw new Error(`Failed to upload avatar: ${err.message}`);
  }
}

/**
 * Get user statistics
 * 
 * Calculates comprehensive user statistics including points, level,
 * trips, distance, hours, badges, and streaks.
 * 
 * @param userId - User ID
 * @returns User statistics object
 * @throws Error if fetch fails
 * 
 * @example
 * ```ts
 * const stats = await getUserStats('user123');
 * ```
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  try {
    // Fetch user profile and progress in parallel
    const [_profile, progressDoc] = await Promise.all([
      getUserProfile(userId),
      getDoc(doc(db, 'userProgress', userId)),
    ]);

    const progress = progressDoc.exists()
      ? (progressDoc.data() as DocumentData)
      : null;

    const totalPoints = progress?.totalPoints || 0;
    const level = calculateLevel(totalPoints);
    const nextLevelPoints = getNextLevelPoints(level);

    // Fetch user trips
    const trips = await getUserTrips(userId);
    const completedTrips = trips.filter((trip) => trip.status === 'completed');
    const totalDistance = calculateDistance(completedTrips);

    // Calculate total hours from trip activities
    const allActivities = trips.flatMap((trip) => trip.activities || []);
    const totalHours = calculateHours(allActivities);

    // Fetch badges
    const badges = await getUserBadges(userId);

    return {
      totalPoints,
      level,
      totalTrips: trips.length,
      completedTrips: completedTrips.length,
      totalDistance,
      totalHours,
      badgesCount: badges.length,
      currentStreak: progress?.currentStreak || 0,
      longestStreak: progress?.longestStreak || 0,
      nextLevelPoints,
    };
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching user stats:', err);
    throw new Error(`Failed to fetch user stats: ${err.message}`);
  }
}

/**
 * Get user trips
 * 
 * Fetches all trips where the user is a participant.
 * 
 * @param userId - User ID
 * @returns Array of trip objects
 * @throws Error if fetch fails
 * 
 * @example
 * ```ts
 * const trips = await getUserTrips('user123');
 * ```
 */
export async function getUserTrips(userId: string): Promise<Trip[]> {
  try {
    const tripsRef = collection(db, 'trips');
    // Fetch all trips and filter in memory to avoid index requirement
    const q = query(tripsRef);
    const querySnapshot = await getDocs(q);

    const trips: Trip[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      const trip = {
        id: doc.id,
        ...data,
        date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
        participants: data.participants || [],
      } as Trip;

      // Filter by userId in memory
      const participantIds = trip.participants.map((p: { userId?: string; id?: string }) => p.userId || p.id || p);
      if (participantIds.includes(userId)) {
        trips.push(trip);
      }
    });

    return trips;
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching user trips:', err);
    throw new Error(`Failed to fetch user trips: ${err.message}`);
  }
}

/**
 * Get user badges/achievements
 * 
 * Fetches all badges earned by the user.
 * 
 * @param userId - User ID
 * @returns Array of achievement objects
 * @throws Error if fetch fails
 * 
 * @example
 * ```ts
 * const badges = await getUserBadges('user123');
 * ```
 */
export async function getUserBadges(userId: string): Promise<Achievement[]> {
  try {
    const progressRef = doc(db, 'userProgress', userId);
    const progressSnap = await getDoc(progressRef);

    if (!progressSnap.exists()) {
      return [];
    }

    const data = progressSnap.data() as DocumentData;
    const badges = data.badges || [];

    return badges.map((badge: { earnedAt: { toDate?: () => Date } | Date | string }) => ({
      ...badge,
      earnedAt: badge.earnedAt && typeof badge.earnedAt === 'object' && 'toDate' in badge.earnedAt && badge.earnedAt.toDate
        ? badge.earnedAt.toDate()
        : new Date(badge.earnedAt as Date | string),
    })) as Achievement[];
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching user badges:', err);
    throw new Error(`Failed to fetch user badges: ${err.message}`);
  }
}

/**
 * Update user medical information
 * 
 * Updates the medical information in the user profile.
 * This data is stored securely and only accessible by the user.
 * 
 * @param userId - User ID
 * @param info - Medical information object
 * @returns Promise that resolves when update is complete
 * @throws Error if update fails
 * 
 * @example
 * ```ts
 * await updateMedicalInfo('user123', {
 *   bloodType: 'A+',
 *   allergies: ['Peanuts', 'Dust'],
 *   medications: ['Aspirin'],
 *   conditions: ['Asthma'],
 * });
 * ```
 */
export async function updateMedicalInfo(
  userId: string,
  info: MedicalInfo
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      medicalInfo: info,
      updatedAt: new Date(),
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error updating medical info:', err);
    throw new Error(`Failed to update medical info: ${err.message}`);
  }
}

