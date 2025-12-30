/**
 * Trip Service
 * 
 * Service functions for fetching and managing trip data from Firestore.
 */

import { doc, getDoc, type DocumentData } from 'firebase/firestore';
import { db } from './firebase';
import type { Trip } from '../types';

/**
 * Get a single trip by ID
 * 
 * Fetches trip data from Firestore by trip ID.
 * 
 * @param tripId - Trip ID
 * @returns Trip object or null if not found
 * @throws Error if fetch fails
 * 
 * @example
 * ```ts
 * const trip = await getTripById('trip123');
 * ```
 */
export async function getTripById(tripId: string): Promise<Trip | null> {
  try {
    const tripDocRef = doc(db, 'trips', tripId);
    const tripDocSnap = await getDoc(tripDocRef);

    if (!tripDocSnap.exists()) {
      return null;
    }

    const data = tripDocSnap.data() as DocumentData;
    
    // Convert Firestore timestamps to Date objects
    const trip: Trip = {
      id: tripDocSnap.id,
      ...data,
      date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
      participants: data.participants || [],
      images: data.images || [],
      itinerary: data.itinerary || [],
      equipment: data.equipment || [],
      included: data.included || [],
      notIncluded: data.notIncluded || [],
      highlights: data.highlights || [],
      meetingPoint: data.meetingPoint || {},
      accommodation: data.accommodation || 'tente',
      meals: data.meals || [],
      weatherForecast: data.weatherForecast || [],
      reviews: data.reviews || [],
    } as Trip;

    return trip;
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching trip:', err);
    throw new Error(`Failed to fetch trip: ${err.message}`);
  }
}

