/**
 * Trip Service
 * 
 * Service functions for fetching and managing trip data from Firestore.
 */

import { 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  updateDoc,
  query,
  where,
  getDocs,
  Timestamp,
  type DocumentData 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { Trip, Enrollment, PaymentMethod } from '../types';

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
    
    // Validate required fields - but be more lenient for new trips
    if (!data.date) {
      console.warn('Trip missing date field, using current date');
      data.date = Timestamp.now();
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
    // Handle itinerary dates conversion
    let itinerary: any[] = [];
    if (data.itinerary && Array.isArray(data.itinerary)) {
      itinerary = data.itinerary.map((day: any) => {
        if (day.date && day.date.toDate) {
          return { ...day, date: day.date.toDate() };
        }
        if (day.date) {
          return { ...day, date: new Date(day.date) };
        }
        return day;
      });
    }

    // Convert endDate safely
    let endDate: Date | undefined;
    if (data.endDate) {
      if (data.endDate.toDate) {
        endDate = data.endDate.toDate();
      } else {
        try {
          endDate = new Date(data.endDate);
          // Check if date is valid
          if (isNaN(endDate.getTime())) {
            endDate = undefined;
          }
        } catch {
          endDate = undefined;
        }
      }
    }

    // Convert date safely
    let tripDate: Date;
    if (data.date?.toDate) {
      tripDate = data.date.toDate();
    } else {
      try {
        tripDate = new Date(data.date);
        if (isNaN(tripDate.getTime())) {
          throw new Error('Invalid date format');
        }
      } catch {
        throw new Error('Le champ "date" est obligatoire et doit être une date valide');
      }
    }

    // Ensure location coordinates exist
    if (!data.location || !data.location.coordinates) {
      // Try to get from meetingPoint if location is missing
      if (data.meetingPoint && data.meetingPoint.coordinates) {
        data.location = {
          name: data.meetingPoint.name || data.location?.name || '',
          coordinates: data.meetingPoint.coordinates,
        };
      } else {
        // Set default coordinates if missing
        data.location = {
          name: data.location?.name || data.meetingPoint?.name || '',
          coordinates: {
            lat: data.location?.coordinates?.lat || data.meetingPoint?.coordinates?.lat || 0,
            lng: data.location?.coordinates?.lng || data.meetingPoint?.coordinates?.lng || 0,
          },
        };
      }
    }

    const trip: Trip = {
      id: tripDocSnap.id,
      title: data.title || '',
      date: tripDate,
      endDate: endDate,
      duration: duration as number | undefined,
      location: {
        name: data.location?.name || '',
        coordinates: {
          lat: data.location?.coordinates?.lat || 0,
          lng: data.location?.coordinates?.lng || 0,
        },
      },
      difficulty: data.difficulty || 'débutant',
      maxParticipants: maxParticipants as number || 1,
      participants: data.participants || [],
      status: status as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
      description: data.description || data.shortDescription || '',
      longDescription: data.longDescription || data.description || '',
      activities: data.activities || [],
      itinerary: itinerary,
      images: images,
      price: price as number | undefined,
      accommodation: data.accommodation || 'tente',
      meals: Array.isArray(data.meals) ? data.meals : (data.meals ? [data.meals] : []),
      included: data.included || [],
      notIncluded: data.notIncluded || [],
      highlights: data.highlights || [],
      meetingPoint: data.meetingPoint || undefined,
      equipment: data.equipment || [],
      weatherForecast: data.weatherForecast || [],
      reviews: data.reviews || [],
      averageRating: data.averageRating,
      totalReviews: data.totalReviews,
      visible: data.visible !== false,
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

/**
 * Enrollment data for creating an enrollment
 */
export interface EnrollmentData {
  acceptedTerms: boolean;
  dietaryPreference?: string;
  tshirtSize?: string;
  needsTransport?: boolean;
  transportPickupPoint?: string;
  additionalQuestions?: string;
  medicalInfoConfirmed: boolean;
  paymentMethod?: PaymentMethod;
  transactionNumber?: string;
  totalAmount: number;
}

/**
 * Enroll a user to a trip
 * 
 * @param tripId - Trip ID
 * @param userId - User ID
 * @param userData - User data (name, email)
 * @param enrollmentData - Enrollment information
 * @returns Enrollment object
 * @throws Error if enrollment fails
 */
export async function enrollToTrip(
  tripId: string,
  userId: string,
  userData: { name: string; email: string },
  enrollmentData: EnrollmentData
): Promise<Enrollment> {
  try {
    // Check if trip exists and has available spots
    const trip = await getTripById(tripId);
    if (!trip) {
      throw new Error('Sortie introuvable');
    }

    // Check availability
    const availableSpots = trip.maxParticipants - (trip.participants?.length || 0);
    if (availableSpots <= 0) {
      throw new Error('Plus de places disponibles pour cette sortie');
    }

    // Check if user is already enrolled
    const existingEnrollment = await getEnrollmentByUserAndTrip(tripId, userId);
    if (existingEnrollment) {
      throw new Error('Vous êtes déjà inscrit à cette sortie');
    }

    // Generate reservation number
    const reservationNumber = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create enrollment document - remove undefined fields
    const enrollmentDocData: Record<string, unknown> = {
      tripId,
      userId,
      userName: userData.name,
      userEmail: userData.email,
      status: 'pending',
      enrollmentDate: Timestamp.now(),
      reservationNumber,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      acceptedTerms: enrollmentData.acceptedTerms,
      dietaryPreference: enrollmentData.dietaryPreference,
      needsTransport: enrollmentData.needsTransport,
      medicalInfoConfirmed: enrollmentData.medicalInfoConfirmed,
      paymentMethod: enrollmentData.paymentMethod,
      totalAmount: enrollmentData.totalAmount,
    };

    // Only add optional fields if they exist
    if (enrollmentData.tshirtSize) {
      enrollmentDocData.tshirtSize = enrollmentData.tshirtSize;
    }
    if (enrollmentData.transportPickupPoint) {
      enrollmentDocData.transportPickupPoint = enrollmentData.transportPickupPoint;
    }
    if (enrollmentData.additionalQuestions) {
      enrollmentDocData.additionalQuestions = enrollmentData.additionalQuestions;
    }
    if (enrollmentData.transactionNumber) {
      enrollmentDocData.transactionNumber = enrollmentData.transactionNumber;
    }

    const enrollmentRef = await addDoc(collection(db, 'enrollments'), enrollmentDocData);

    // Add user to trip participants
    const tripRef = doc(db, 'trips', tripId);
    const currentParticipants = trip.participants || [];
    await updateDoc(tripRef, {
      participants: [
        ...currentParticipants,
        {
          userId,
          userName: userData.name,
          role: 'participant',
          joinedAt: Timestamp.now(),
        },
      ],
      updatedAt: Timestamp.now(),
    });

    // Fetch and return enrollment
    const enrollmentDoc = await getDoc(enrollmentRef);
    const data = enrollmentDoc.data() as DocumentData;
    
    return {
      id: enrollmentDoc.id,
      ...data,
      enrollmentDate: data.enrollmentDate?.toDate ? data.enrollmentDate.toDate() : new Date(data.enrollmentDate),
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
      paymentDate: data.paymentDate?.toDate ? data.paymentDate.toDate() : (data.paymentDate ? new Date(data.paymentDate) : undefined),
    } as Enrollment;
  } catch (error) {
    const err = error as Error;
    console.error('Error enrolling to trip:', err);
    throw new Error(`Échec de l'inscription: ${err.message}`);
  }
}

/**
 * Get enrollment by user and trip
 */
async function getEnrollmentByUserAndTrip(tripId: string, userId: string): Promise<Enrollment | null> {
  try {
    const enrollmentsRef = collection(db, 'enrollments');
    const q = query(
      enrollmentsRef,
      where('tripId', '==', tripId),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data() as DocumentData;
    
    return {
      id: doc.id,
      ...data,
      enrollmentDate: data.enrollmentDate?.toDate ? data.enrollmentDate.toDate() : new Date(data.enrollmentDate),
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
      paymentDate: data.paymentDate?.toDate ? data.paymentDate.toDate() : (data.paymentDate ? new Date(data.paymentDate) : undefined),
    } as Enrollment;
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    return null;
  }
}

/**
 * Cancel an enrollment
 * 
 * @param enrollmentId - Enrollment ID
 * @throws Error if cancellation fails
 */
export async function cancelEnrollment(enrollmentId: string): Promise<void> {
  try {
    const enrollmentRef = doc(db, 'enrollments', enrollmentId);
    const enrollmentDoc = await getDoc(enrollmentRef);

    if (!enrollmentDoc.exists()) {
      throw new Error('Inscription introuvable');
    }

    const enrollmentData = enrollmentDoc.data();
    
    // Update enrollment status
    await updateDoc(enrollmentRef, {
      status: 'cancelled',
      updatedAt: Timestamp.now(),
    });

    // Remove user from trip participants
    if (enrollmentData.tripId && enrollmentData.userId) {
      const trip = await getTripById(enrollmentData.tripId);
      if (trip) {
        const tripRef = doc(db, 'trips', enrollmentData.tripId);
        const updatedParticipants = (trip.participants || []).filter(
          (p: { userId?: string }) => p.userId !== enrollmentData.userId
        );
        await updateDoc(tripRef, {
          participants: updatedParticipants,
          updatedAt: Timestamp.now(),
        });
      }
    }
  } catch (error) {
    const err = error as Error;
    console.error('Error cancelling enrollment:', err);
    throw new Error(`Échec de l'annulation: ${err.message}`);
  }
}

/**
 * Upload payment proof
 * 
 * @param enrollmentId - Enrollment ID
 * @param file - Payment proof image file
 * @returns Download URL of uploaded file
 * @throws Error if upload fails
 */
export async function uploadPaymentProof(enrollmentId: string, file: File): Promise<string> {
  try {
    const storageRef = ref(storage, `payments/${enrollmentId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    // Update enrollment with payment proof URL
    const enrollmentRef = doc(db, 'enrollments', enrollmentId);
    await updateDoc(enrollmentRef, {
      paymentProofUrl: downloadURL,
      updatedAt: Timestamp.now(),
    });

    return downloadURL;
  } catch (error) {
    const err = error as Error;
    console.error('Error uploading payment proof:', err);
    throw new Error(`Échec du téléversement: ${err.message}`);
  }
}

/**
 * Get trip participants (users enrolled)
 * 
 * @param tripId - Trip ID
 * @returns Array of user IDs
 * @throws Error if fetch fails
 */
export async function getTripParticipants(tripId: string): Promise<string[]> {
  try {
    const enrollmentsRef = collection(db, 'enrollments');
    const q = query(
      enrollmentsRef,
      where('tripId', '==', tripId),
      where('status', 'in', ['pending', 'confirmed'])
    );
    const querySnapshot = await getDocs(q);

    const userIds: string[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.userId) {
        userIds.push(data.userId);
      }
    });

    return userIds;
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching trip participants:', err);
    throw new Error(`Échec de la récupération des participants: ${err.message}`);
  }
}

/**
 * Check if trip has available spots
 * 
 * @param tripId - Trip ID
 * @returns True if available spots > 0
 * @throws Error if check fails
 */
export async function checkAvailability(tripId: string): Promise<boolean> {
  try {
    const trip = await getTripById(tripId);
    if (!trip) {
      return false;
    }

    const enrolledCount = trip.participants?.length || 0;
    return trip.maxParticipants > enrolledCount;
  } catch (error) {
    const err = error as Error;
    console.error('Error checking availability:', err);
    return false;
  }
}
