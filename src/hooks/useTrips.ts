/**
 * Custom hook for trips data
 * 
 * Fetches and manages trips data from Firestore.
 */

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, type DocumentData } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { Trip } from '../types';

/**
 * Hook return type
 */
interface UseTripsReturn {
  trips: Trip[];
  upcomingTrips: Trip[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Custom hook to fetch trips
 * 
 * @param userId - Optional user ID. If provided, fetches all visible trips (not just user's trips)
 *                 Use getUserTrips() if you need only trips where user is a participant
 */
export function useTrips(userId?: string): UseTripsReturn {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch trips from Firestore
   * Always fetches all visible trips, regardless of userId
   */
  const fetchTrips = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const tripsRef = collection(db, 'trips');
      // Fetch all trips - we'll filter by visibility in memory
      const q = query(tripsRef, orderBy('date', 'asc'));

      const querySnapshot = await getDocs(q);
      const tripsData: Trip[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        const trip = {
          id: doc.id,
          ...data,
          date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
          endDate: data.endDate?.toDate ? data.endDate.toDate() : undefined,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
          participants: data.participants || [],
          visible: data.visible !== false, // Default to true if not set
          status: data.status || 'upcoming',
        } as Trip;

        // Always include all trips - visibility filtering happens in upcomingTrips
        // This allows users to see all available trips, not just ones they're registered for
        tripsData.push(trip);
      });

      setTrips(tripsData);
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching trips:', error);
      setError('Erreur lors du chargement des sorties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [userId]);

  /**
   * Get upcoming trips
   * Filter by status, date, and visibility
   */
  const upcomingTrips = trips.filter(
    (trip) => {
      const isUpcoming = trip.status === 'upcoming' || trip.status === 'ongoing';
      const isFuture = new Date(trip.date) >= new Date();
      const isVisible = trip.visible !== false; // Default to visible if not set
      return isUpcoming && isFuture && isVisible;
    }
  );

  return {
    trips,
    upcomingTrips,
    loading,
    error,
    refresh: fetchTrips,
  };
}

