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
 */
export function useTrips(userId?: string): UseTripsReturn {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch trips from Firestore
   */
  const fetchTrips = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const tripsRef = collection(db, 'trips');
      let q = query(tripsRef, orderBy('date', 'asc'));

      // Filter by user participation if userId provided
      // Note: This requires a composite index in Firestore
      // For now, we'll fetch all trips and filter in memory to avoid index error
      if (userId) {
        // Fetch all trips and filter by participants in memory
        // This avoids the need for a composite index
        q = query(tripsRef, orderBy('date', 'asc'));
      }

      const querySnapshot = await getDocs(q);
      const tripsData: Trip[] = [];

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

        // Filter by userId in memory if provided
        if (userId) {
          const participantIds = trip.participants.map((p: { userId?: string; id?: string }) => p.userId || p.id || p);
          if (participantIds.includes(userId)) {
            tripsData.push(trip);
          }
        } else {
          tripsData.push(trip);
        }
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

