/**
 * Trip Management Service
 * 
 * Service for admin to manage trips (CRUD operations, statistics, export).
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import type { Trip, DayItinerary, EquipmentItem } from '../../types';

/**
 * Location type for trip form
 */
interface Location {
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

/**
 * Guide type for trip form
 */
interface Guide {
  name: string;
  phone: string;
  email?: string;
}

/**
 * Trip statistics
 */
export interface TripStats {
  totalViews: number;
  totalEnrollments: number;
  currentEnrollments: number;
  fillRate: number; // percentage
  averageRating: number;
  totalReviews: number;
  revenue: number;
  cancellationRate: number;
}

/**
 * Trip form data (simplified for creation/update)
 */
export interface TripFormData {
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  tags: string[];
  startDate: Date;
  endDate: Date;
  meetingTime: string;
  meetingPoint: Location;
  difficulty: Trip['difficulty'];
  physicalLevel: string;
  minAge: number;
  minParticipants: number;
  maxParticipants: number;
  price: number;
  included: string[];
  notIncluded: string[];
  accommodation: string;
  meals: 'all' | 'some' | 'none';
  itinerary: DayItinerary[];
  equipment: EquipmentItem[];
  images: string[];
  mainImage: string;
  videoUrl?: string;
  guide: Guide;
  coGuides?: Guide[];
  emergencyContact: Guide;
  route?: { lat: number; lng: number }[];
  campingZones?: { lat: number; lng: number; name: string }[];
  waterPoints?: { lat: number; lng: number; name: string }[];
  dangerZones?: { lat: number; lng: number; name: string; description: string }[];
  pointsOfInterest?: { lat: number; lng: number; name: string; description: string }[];
  visible: boolean;
  enrollmentDeadline?: Date;
  freeCancellationDays: number;
  cancellationRefund: number; // percentage
  autoConfirm: boolean;
  status: Trip['status'];
}

/**
 * Create a new trip
 */
export async function createTrip(tripData: TripFormData): Promise<Trip> {
  try {
    const tripsRef = collection(db, 'trips');
    
    const tripDoc: DocumentData = {
      title: tripData.title,
      shortDescription: tripData.shortDescription,
      description: tripData.description,
      category: tripData.category,
      tags: tripData.tags,
      date: Timestamp.fromDate(tripData.startDate),
      endDate: Timestamp.fromDate(tripData.endDate),
      meetingTime: tripData.meetingTime,
      location: tripData.meetingPoint,
      difficulty: tripData.difficulty,
      physicalLevel: tripData.physicalLevel,
      minAge: tripData.minAge,
      minParticipants: tripData.minParticipants,
      maxParticipants: tripData.maxParticipants,
      price: tripData.price,
      included: tripData.included,
      notIncluded: tripData.notIncluded,
      accommodation: tripData.accommodation,
      meals: tripData.meals,
      itinerary: tripData.itinerary.map((day) => ({
        ...day,
        date: Timestamp.fromDate(day.date),
      })),
      equipment: tripData.equipment,
      images: tripData.images,
      mainImage: tripData.mainImage,
      videoUrl: tripData.videoUrl || null,
      guide: tripData.guide,
      coGuides: tripData.coGuides || [],
      emergencyContact: tripData.emergencyContact,
      route: tripData.route || [],
      campingZones: tripData.campingZones || [],
      waterPoints: tripData.waterPoints || [],
      dangerZones: tripData.dangerZones || [],
      pointsOfInterest: tripData.pointsOfInterest || [],
      visible: tripData.visible !== false, // Default to true if not set
      enrollmentDeadline: tripData.enrollmentDeadline
        ? Timestamp.fromDate(tripData.enrollmentDeadline)
        : null,
      freeCancellationDays: tripData.freeCancellationDays,
      cancellationRefund: tripData.cancellationRefund,
      autoConfirm: tripData.autoConfirm,
      status: tripData.status || 'upcoming',
      participants: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(tripsRef, tripDoc);
    
    // Fetch the created trip
    const createdDoc = await getDoc(docRef);
    const data = createdDoc.data() as DocumentData;
    
    return {
      id: docRef.id,
      ...data,
      date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
      endDate: data.endDate?.toDate ? data.endDate.toDate() : new Date(data.endDate),
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
    } as Trip;
  } catch (error) {
    console.error('Error creating trip:', error);
    throw new Error('Failed to create trip: ' + (error as Error).message);
  }
}

/**
 * Update an existing trip
 */
export async function updateTrip(tripId: string, data: Partial<TripFormData>): Promise<void> {
  try {
    const tripRef = doc(db, 'trips', tripId);
    
    const updateData: DocumentData = {
      updatedAt: Timestamp.now(),
    };

    // Map form data to Firestore format
    if (data.title !== undefined) updateData.title = data.title;
    if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.startDate !== undefined) updateData.date = Timestamp.fromDate(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = Timestamp.fromDate(data.endDate);
    if (data.meetingTime !== undefined) updateData.meetingTime = data.meetingTime;
    if (data.meetingPoint !== undefined) updateData.location = data.meetingPoint;
    if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
    if (data.physicalLevel !== undefined) updateData.physicalLevel = data.physicalLevel;
    if (data.minAge !== undefined) updateData.minAge = data.minAge;
    if (data.minParticipants !== undefined) updateData.minParticipants = data.minParticipants;
    if (data.maxParticipants !== undefined) updateData.maxParticipants = data.maxParticipants;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.included !== undefined) updateData.included = data.included;
    if (data.notIncluded !== undefined) updateData.notIncluded = data.notIncluded;
    if (data.accommodation !== undefined) updateData.accommodation = data.accommodation;
    if (data.meals !== undefined) updateData.meals = data.meals;
    if (data.itinerary !== undefined) {
      updateData.itinerary = data.itinerary.map((day) => ({
        ...day,
        date: Timestamp.fromDate(day.date),
      }));
    }
    if (data.equipment !== undefined) updateData.equipment = data.equipment;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.mainImage !== undefined) updateData.mainImage = data.mainImage;
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
    if (data.guide !== undefined) updateData.guide = data.guide;
    if (data.coGuides !== undefined) updateData.coGuides = data.coGuides;
    if (data.emergencyContact !== undefined) updateData.emergencyContact = data.emergencyContact;
    if (data.route !== undefined) updateData.route = data.route;
    if (data.campingZones !== undefined) updateData.campingZones = data.campingZones;
    if (data.waterPoints !== undefined) updateData.waterPoints = data.waterPoints;
    if (data.dangerZones !== undefined) updateData.dangerZones = data.dangerZones;
    if (data.pointsOfInterest !== undefined) updateData.pointsOfInterest = data.pointsOfInterest;
    if (data.visible !== undefined) updateData.visible = data.visible;
    if (data.enrollmentDeadline !== undefined) {
      updateData.enrollmentDeadline = data.enrollmentDeadline
        ? Timestamp.fromDate(data.enrollmentDeadline)
        : null;
    }
    if (data.freeCancellationDays !== undefined) updateData.freeCancellationDays = data.freeCancellationDays;
    if (data.cancellationRefund !== undefined) updateData.cancellationRefund = data.cancellationRefund;
    if (data.autoConfirm !== undefined) updateData.autoConfirm = data.autoConfirm;
    if (data.status !== undefined) updateData.status = data.status;

    await updateDoc(tripRef, updateData);
  } catch (error) {
    console.error('Error updating trip:', error);
    throw new Error('Failed to update trip: ' + (error as Error).message);
  }
}

/**
 * Delete a trip
 */
export async function deleteTrip(tripId: string): Promise<void> {
  try {
    const tripRef = doc(db, 'trips', tripId);
    
    // Get trip to delete associated images
    const tripDoc = await getDoc(tripRef);
    if (tripDoc.exists()) {
      const tripData = tripDoc.data() as DocumentData;
      const images = tripData.images || [];
      
      // Delete images from storage
      for (const imageUrl of images) {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.warn('Failed to delete image:', imageUrl, error);
        }
      }
    }
    
    await deleteDoc(tripRef);
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw new Error('Failed to delete trip: ' + (error as Error).message);
  }
}

/**
 * Duplicate a trip
 */
export async function duplicateTrip(tripId: string): Promise<Trip> {
  try {
    const tripRef = doc(db, 'trips', tripId);
    const tripDoc = await getDoc(tripRef);
    
    if (!tripDoc.exists()) {
      throw new Error('Trip not found');
    }
    
    const tripData = tripDoc.data() as DocumentData;
    
    // Create new trip with modified title and dates
    const newTripData: DocumentData = {
      ...tripData,
      title: `${tripData.title} (Copie)`,
      date: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days from now
      endDate: tripData.endDate
        ? Timestamp.fromDate(new Date(tripData.endDate.toDate().getTime() + 30 * 24 * 60 * 60 * 1000))
        : null,
      status: 'upcoming',
      participants: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    // Remove id field
    delete newTripData.id;
    
    const tripsRef = collection(db, 'trips');
    const newDocRef = await addDoc(tripsRef, newTripData);
    
    // Fetch the created trip
    const createdDoc = await getDoc(newDocRef);
    const data = createdDoc.data() as DocumentData;
    
    return {
      id: newDocRef.id,
      ...data,
      date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
      endDate: data.endDate?.toDate ? data.endDate.toDate() : new Date(data.endDate),
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
    } as Trip;
  } catch (error) {
    console.error('Error duplicating trip:', error);
    throw new Error('Failed to duplicate trip: ' + (error as Error).message);
  }
}

/**
 * Export trips to CSV
 */
export async function exportTrips(filters: {
  status?: Trip['status'];
  dateFrom?: Date;
  dateTo?: Date;
}): Promise<Blob> {
  try {
    const tripsRef = collection(db, 'trips');
    const allTripsSnapshot = await getDocs(tripsRef);
    
    let trips: any[] = allTripsSnapshot.docs.map((doc) => {
      const data = doc.data() as DocumentData;
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
      };
    });
    
    // Apply filters
    if (filters.status) {
      trips = trips.filter((trip: any) => trip.status === filters.status);
    }
    if (filters.dateFrom) {
      trips = trips.filter((trip: any) => new Date(trip.date) >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      trips = trips.filter((trip: any) => new Date(trip.date) <= filters.dateTo!);
    }
    
    // Convert to CSV
    const headers = [
      'ID',
      'Titre',
      'Date',
      'Statut',
      'Participants',
      'Prix',
      'Difficulté',
      'Lieu',
    ];
    
    const rows = trips.map((trip: any) => [
      trip.id,
      trip.title || '',
      new Date(trip.date).toLocaleDateString('fr-FR'),
      trip.status || '',
      `${trip.participants?.length || 0}/${trip.maxParticipants || 0}`,
      trip.price || 0,
      trip.difficulty || '',
      trip.location?.name || '',
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  } catch (error) {
    console.error('Error exporting trips:', error);
    throw new Error('Failed to export trips: ' + (error as Error).message);
  }
}

/**
 * Get trip statistics
 */
export async function getTripStatistics(tripId: string): Promise<TripStats> {
  try {
    const tripRef = doc(db, 'trips', tripId);
    const tripDoc = await getDoc(tripRef);
    
    if (!tripDoc.exists()) {
      throw new Error('Trip not found');
    }
    
    const tripData = tripDoc.data() as DocumentData;
    const participants = tripData.participants || [];
    const maxParticipants = tripData.maxParticipants || 1;
    
    // Get reviews for this trip
    const reviewsRef = collection(db, 'reviews');
    const allReviewsSnapshot = await getDocs(reviewsRef);
    const tripReviews = allReviewsSnapshot.docs
      .filter((doc) => {
        const review = doc.data() as DocumentData;
        return review.tripId === tripId;
      })
      .map((doc) => doc.data() as DocumentData);
    
    const totalRating = tripReviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    const averageRating = tripReviews.length > 0 ? totalRating / tripReviews.length : 0;
    
    // Get enrollments (from enrollments collection if exists)
    const enrollmentsRef = collection(db, 'enrollments');
    const allEnrollmentsSnapshot = await getDocs(enrollmentsRef);
    const tripEnrollments = allEnrollmentsSnapshot.docs.filter((doc) => {
      const enrollment = doc.data() as DocumentData;
      return enrollment.tripId === tripId;
    });
    
    const cancelledEnrollments = tripEnrollments.filter((doc) => {
      const enrollment = doc.data() as DocumentData;
      return enrollment.status === 'cancelled';
    });
    
    const cancellationRate =
      tripEnrollments.length > 0
        ? (cancelledEnrollments.length / tripEnrollments.length) * 100
        : 0;
    
    // Calculate revenue
    const price = parseFloat(tripData.price?.toString().replace(/[^0-9.]/g, '') || '0');
    const revenue = price * participants.length;
    
    return {
      totalViews: tripData.views || 0,
      totalEnrollments: tripEnrollments.length,
      currentEnrollments: participants.length,
      fillRate: (participants.length / maxParticipants) * 100,
      averageRating,
      totalReviews: tripReviews.length,
      revenue,
      cancellationRate,
    };
  } catch (error) {
    console.error('Error getting trip statistics:', error);
    throw new Error('Failed to get trip statistics: ' + (error as Error).message);
  }
}

/**
 * Upload trip image
 */
export async function uploadTripImage(file: File, tripId: string): Promise<string> {
  try {
    const imageRef = ref(storage, `trips/${tripId}/${Date.now()}_${file.name}`);
    await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading trip image:', error);
    throw new Error('Failed to upload image: ' + (error as Error).message);
  }
}

