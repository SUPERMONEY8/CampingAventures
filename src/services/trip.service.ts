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
    
    // Validate required fields
    if (!data.date) {
      throw new Error('Le champ "date" est obligatoire (type: timestamp)');
    }
    
    if (!data.location || !data.location.coordinates) {
      throw new Error('Le champ "location.coordinates" est obligatoire (map avec lat et lng)');
    }

    // Normalize status
    let status = data.status;
    if (typeof status === 'string') {
      const statusMap: Record<string, 'upcoming' | 'ongoing' | 'completed' | 'cancelled'> = {
        'a venir': 'upcoming',
        'à venir': 'upcoming',
        'upcoming': 'upcoming',
        'ongoing': 'ongoing',
        'en cours': 'ongoing',
        'completed': 'completed',
        'complété': 'completed',
        'terminé': 'completed',
        'cancelled': 'cancelled',
        'annulé': 'cancelled',
      };
      status = statusMap[status.toLowerCase()] || 'upcoming';
    }

    // Normalize duration (convert "3 jours" to 3)
    let duration = data.duration;
    if (typeof duration === 'string') {
      const match = duration.match(/\d+/);
      duration = match ? parseInt(match[0], 10) : undefined;
    }

    // Normalize maxParticipants (convert "12" to 12)
    let maxParticipants = data.maxParticipants;
    if (typeof maxParticipants === 'string') {
      maxParticipants = parseInt(maxParticipants, 10) || 0;
    }

    // Normalize price (extract number from "6000 DA")
    let price = data.price;
    if (typeof price === 'string') {
      const match = price.match(/\d+/);
      price = match ? parseInt(match[0], 10) : undefined;
    }

    // Combine images from different field names
    let images: string[] = [];
    if (Array.isArray(data.images)) {
      images = data.images;
    } else if (data.Image) {
      images = Array.isArray(data.Image) ? data.Image : [data.Image];
    } else if (data.image) {
      images = Array.isArray(data.image) ? data.image : [data.image];
    }
    // Add Image 2 if exists
    if (data['Image 2']) {
      const image2 = Array.isArray(data['Image 2']) ? data['Image 2'] : [data['Image 2']];
      images = [...images, ...image2];
    }

    // Convert Firestore timestamps to Date objects
    const trip: Trip = {
      id: tripDocSnap.id,
      title: data.title || '',
      date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
      endDate: data.endDate?.toDate ? data.endDate.toDate() : (data.endDate ? new Date(data.endDate) : undefined),
      duration: duration as number | undefined,
      location: {
        name: data.location?.name || '',
        coordinates: {
          lat: data.location?.coordinates?.lat || 0,
          lng: data.location?.coordinates?.lng || 0,
        },
      },
      difficulty: data.difficulty || 'débutant',
      maxParticipants: maxParticipants as number,
      participants: data.participants || [],
      status: status as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
      description: data.description,
      longDescription: data.longDescription,
      activities: data.activities || [],
      itinerary: data.itinerary || [],
      images: images,
      price: price as number | undefined,
      accommodation: data.accommodation || 'tente',
      meals: data.meals || [],
      included: data.included || [],
      notIncluded: data.notIncluded || [],
      highlights: data.highlights || [],
      meetingPoint: data.meetingPoint || undefined,
      equipment: data.equipment || [],
      weatherForecast: data.weatherForecast || [],
      reviews: data.reviews || [],
      averageRating: data.averageRating,
      totalReviews: data.totalReviews,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
    } as Trip;

    return trip;
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching trip:', err);
    throw new Error(`Failed to fetch trip: ${err.message}`);
  }
}

