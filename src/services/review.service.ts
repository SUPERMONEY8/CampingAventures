/**
 * Review Service
 * 
 * Service for managing trip reviews and ratings.
 */

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { TripReview } from '../types';

/**
 * Create a review for a trip
 * 
 * @param tripId - Trip ID
 * @param userId - User ID
 * @param userName - User name
 * @param userAvatar - User avatar URL (optional)
 * @param rating - Rating (1-5)
 * @param comment - Review comment
 * @param photos - Review photos (optional)
 * @returns Review ID
 */
export async function createReview(
  tripId: string,
  userId: string,
  userName: string,
  userAvatar: string | undefined,
  rating: number,
  comment: string,
  photos?: File[]
): Promise<string> {
  try {
    // Check if user already reviewed this trip
    const existingReview = await getReviewByUserAndTrip(tripId, userId);
    if (existingReview) {
      throw new Error('Vous avez déjà laissé un avis pour cette sortie');
    }

    // Upload photos if provided
    const photoUrls: string[] = [];
    if (photos && photos.length > 0) {
      for (const photo of photos) {
        const photoRef = ref(storage, `reviews/${tripId}/${userId}/${Date.now()}_${photo.name}`);
        await uploadBytes(photoRef, photo);
        const url = await getDownloadURL(photoRef);
        photoUrls.push(url);
      }
    }

    // Create review document
    const reviewRef = await addDoc(collection(db, 'reviews'), {
      tripId,
      userId,
      userName,
      userAvatar: userAvatar || null,
      rating,
      comment,
      photos: photoUrls.length > 0 ? photoUrls : null,
      date: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Update trip's average rating
    await updateTripRating(tripId);

    return reviewRef.id;
  } catch (error) {
    const err = error as Error;
    console.error('Error creating review:', err);
    throw new Error(`Échec de la création de l'avis: ${err.message}`);
  }
}

/**
 * Get review by user and trip
 * 
 * @param tripId - Trip ID
 * @param userId - User ID
 * @returns Review or null
 */
async function getReviewByUserAndTrip(tripId: string, userId: string): Promise<TripReview | null> {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('tripId', '==', tripId),
      where('userId', '==', userId)
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
      userName: data.userName,
      userAvatar: data.userAvatar,
      rating: data.rating,
      comment: data.comment,
      date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
      photos: data.photos || [],
    };
  } catch (error) {
    console.error('Error fetching review:', error);
    return null;
  }
}

/**
 * Get reviews for a trip
 * 
 * @param tripId - Trip ID
 * @returns Array of reviews
 */
export async function getTripReviews(tripId: string): Promise<TripReview[]> {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, where('tripId', '==', tripId));
    const snapshot = await getDocs(q);

    const reviews: TripReview[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      reviews.push({
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        rating: data.rating,
        comment: data.comment,
        date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
        photos: data.photos || [],
      });
    });

    // Sort by date (newest first)
    reviews.sort((a, b) => b.date.getTime() - a.date.getTime());

    return reviews;
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching reviews:', err);
    throw new Error(`Échec de la récupération des avis: ${err.message}`);
  }
}

/**
 * Update trip's average rating
 * 
 * @param tripId - Trip ID
 */
async function updateTripRating(tripId: string): Promise<void> {
  try {
    const reviews = await getTripReviews(tripId);
    
    if (reviews.length === 0) {
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const tripRef = doc(db, 'trips', tripId);
    await updateDoc(tripRef, {
      averageRating,
      totalReviews: reviews.length,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating trip rating:', error);
    // Don't throw - rating update failure shouldn't prevent review creation
  }
}

