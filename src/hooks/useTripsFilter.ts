/**
 * Custom hook for filtering and searching trips
 * 
 * Handles trip filtering, searching, sorting, and pagination.
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, getDocs, type DocumentData } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { Trip } from '../types';
import type { TripFilters } from '../components/trips/TripFilters';

/**
 * Sort options
 */
export type SortOption = 'recent' | 'price-asc' | 'popularity';

/**
 * Hook return type
 */
interface UseTripsFilterReturn {
  trips: Trip[];
  filteredTrips: Trip[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  totalCount: number;
}

/**
 * Custom hook to filter and search trips
 */
export function useTripsFilter(
  filters: TripFilters,
  searchQuery: string,
  sortBy: SortOption = 'recent',
  pageSize: number = 12
): UseTripsFilterReturn {
  const [allTrips, setAllTrips] = useState<Trip[]>([]);

  /**
   * Fetch trips from Firestore
   */
  const { data, isLoading, error } = useQuery({
    queryKey: ['trips', 'all'],
    queryFn: async () => {
      try {
        const tripsRef = collection(db, 'trips');
        // Fetch all trips without orderBy to avoid index requirement
        const q = query(tripsRef);
        const querySnapshot = await getDocs(q);
        const trips: Trip[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data() as DocumentData;
          trips.push({
            id: doc.id,
            ...data,
            date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
            participants: data.participants || [],
          } as Trip);
        });

        // Sort by createdAt in memory (descending)
        trips.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        setAllTrips(trips);
        return trips;
      } catch (err) {
        console.error('Error fetching trips:', err);
        // Return empty array instead of throwing to prevent page crash
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  /**
   * Filter trips based on filters and search
   */
  const filteredTrips = useMemo(() => {
    if (!data) return [];

    let result = [...data];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (trip) =>
          trip.title.toLowerCase().includes(query) ||
          trip.location.name.toLowerCase().includes(query) ||
          trip.description?.toLowerCase().includes(query)
      );
    }

    // Date filter
    if (filters.dateFrom) {
      result = result.filter((trip) => new Date(trip.date) >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      result = result.filter((trip) => new Date(trip.date) <= filters.dateTo!);
    }

    // Difficulty filter
    if (filters.difficulties.length > 0) {
      result = result.filter((trip) => filters.difficulties.includes(trip.difficulty));
    }

    // Location filter
    if (filters.location && filters.location !== 'Tout l\'Algérie') {
      result = result.filter((trip) => trip.location.name.includes(filters.location!));
    }

    // Price filter (mock - trips don't have price yet)
    // if (filters.priceMin !== undefined) {
    //   result = result.filter((trip) => (trip as Trip & { price?: number }).price >= filters.priceMin!);
    // }
    // if (filters.priceMax !== undefined) {
    //   result = result.filter((trip) => (trip as Trip & { price?: number }).price <= filters.priceMax!);
    // }

    // Duration filter (mock - trips don't have duration yet)
    // if (filters.durations.length > 0) {
    //   result = result.filter((trip) => {
    //     const duration = (trip as Trip & { duration?: string }).duration || '2-3';
    //     return filters.durations.includes(duration);
    //   });
    // }

    // Only available filter
    if (filters.onlyAvailable) {
      result = result.filter((trip) => trip.participants.length < trip.maxParticipants);
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'price-asc':
        // Mock sort by price (same price for all, so no sorting needed)
        // In real app, trips would have a price property
        break;
      case 'popularity':
        // Sort by participants count (more participants = more popular)
        result.sort((a, b) => b.participants.length - a.participants.length);
        break;
    }

    return result;
  }, [data, filters, searchQuery, sortBy]);

  /**
   * Paginated trips
   */
  const paginatedTrips = useMemo(() => {
    return filteredTrips.slice(0, pageSize);
  }, [filteredTrips, pageSize]);

  /**
   * Load more trips
   */
  const loadMore = (): void => {
    // In a real implementation, this would fetch more from Firestore
    // For now, we're using client-side pagination
  };

  return {
    trips: allTrips,
    filteredTrips: paginatedTrips || [],
    loading: isLoading || false,
    error: error ? (error as Error).message : null,
    hasMore: (filteredTrips?.length || 0) > (paginatedTrips?.length || 0),
    loadMore,
    totalCount: filteredTrips?.length || 0,
  };
}

