/**
 * Custom hook for trips data
 * 
 * Fetches and manages trips data from Firestore.
 */

import { useCallback } from 'react';
import { collection, query, getDocs, type DocumentData } from 'firebase/firestore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  /**
   * Fetch trips from Firestore using React Query for better cache management
   */
  const { data: trips = [], isLoading, error: queryError } = useQuery({
    queryKey: ['trips', userId],
    queryFn: async (): Promise<Trip[]> => {
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

      return tripsData;
    },
    staleTime: 30 * 1000, // 30 seconds - data is considered fresh for 30s
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds (subtle background refresh)
    refetchIntervalInBackground: true, // Continue refetching even when tab is in background
  });

  // Subtle refresh function that doesn't show loading state
  const refresh = useCallback(async () => {
    await queryClient.refetchQueries({ queryKey: ['trips', userId] });
  }, [queryClient, userId]);

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
    loading: isLoading,
    error: queryError ? (queryError as Error).message : null,
    refresh,
  };
}

