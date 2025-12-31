/**
 * Custom hook for trips data
 * 
 * Fetches and manages trips data from Firestore.
 */

import { useState, useEffect } from 'react';
import { collection, query, getDocs, type DocumentData } from 'firebase/firestore';
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
      // Fetch all trips without orderBy to avoid index requirement
      // We'll sort in memory instead
      const q = query(tripsRef);

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

      // Sort by date in memory (ascending)
      tripsData.sort((a, b) => a.date.getTime() - b.date.getTime());

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

  // Refresh trips every 30 seconds to catch new trips
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTrips();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  /**
   * Get upcoming trips
   * Filter by status, date, and visibility
   */
  const upcomingTrips = trips.filter(
    (trip) => {
      const isUpcoming = trip.status === 'upcoming' || trip.status === 'ongoing';
      // Include trips from today onwards (set time to 00:00:00 for comparison)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tripDate = new Date(trip.date);
      tripDate.setHours(0, 0, 0, 0);
      const isFutureOrToday = tripDate >= today;
      const isVisible = trip.visible !== false; // Default to true if not set
      
      // Debug log (only in development)
      if (import.meta.env.DEV) {
        console.log('Trip filter:', {
          title: trip.title,
          status: trip.status,
          isUpcoming,
          date: trip.date,
          isFutureOrToday,
          visible: trip.visible,
          isVisible,
          willShow: isUpcoming && isFutureOrToday && isVisible,
        });
      }
      
      return isUpcoming && isFutureOrToday && isVisible;
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

