/**
 * Custom hook for user data management with React Query
 * 
 * Provides cached user data with automatic refetching,
 * optimistic updates, and error handling.
 * 
 * Uses React Query for:
 * - Automatic caching
 * - Background refetching
 * - Optimistic updates
 * - Error retry logic
 * - Loading states
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  getUserStats,
  getUserTrips,
  getUserBadges,
  updateMedicalInfo,
} from '../services/user.service';
import type { User, MedicalInfo } from '../types';

/**
 * Query keys for React Query
 */
export const userQueryKeys = {
  all: ['users'] as const,
  profile: (userId: string) => [...userQueryKeys.all, 'profile', userId] as const,
  stats: (userId: string) => [...userQueryKeys.all, 'stats', userId] as const,
  trips: (userId: string) => [...userQueryKeys.all, 'trips', userId] as const,
  badges: (userId: string) => [...userQueryKeys.all, 'badges', userId] as const,
};

/**
 * Hook to get user profile
 * 
 * @param userId - User ID
 * @param options - Query options (enabled, staleTime, etc.)
 * @returns Query result with user profile data
 * 
 * @example
 * ```tsx
 * const { data: profile, isLoading, error } = useUserProfile('user123');
 * ```
 */
export function useUserProfile(
  userId: string | null | undefined,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) {
  return useQuery({
    queryKey: userQueryKeys.profile(userId || ''),
    queryFn: () => getUserProfile(userId!),
    enabled: !!userId && (options?.enabled !== false),
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to update user profile
 * 
 * Provides mutation with optimistic updates.
 * 
 * @param userId - User ID
 * @returns Mutation object with mutate function
 * 
 * @example
 * ```tsx
 * const updateProfile = useUpdateUserProfile('user123');
 * updateProfile.mutate({ name: 'John Doe' });
 * ```
 */
export function useUpdateUserProfile(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User>) => updateUserProfile(userId, data),
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userQueryKeys.profile(userId) });

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData<User>(userQueryKeys.profile(userId));

      // Optimistically update
      if (previousProfile) {
        queryClient.setQueryData<User>(userQueryKeys.profile(userId), {
          ...previousProfile,
          ...newData,
        });
      }

      return { previousProfile };
    },
    onError: (_err, _newData, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(userQueryKeys.profile(userId), context.previousProfile);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile(userId) });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.stats(userId) });
    },
  });
}

/**
 * Hook to upload user avatar
 * 
 * @param userId - User ID
 * @returns Mutation object with mutate function
 * 
 * @example
 * ```tsx
 * const uploadAvatar = useUploadAvatar('user123');
 * uploadAvatar.mutate(file);
 * ```
 */
export function useUploadAvatar(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadAvatar(userId, file),
    onSuccess: (avatarUrl) => {
      // Update profile cache with new avatar URL
      queryClient.setQueryData<User>(userQueryKeys.profile(userId), (old) => {
        if (!old) return old;
        return { ...old, avatarUrl };
      });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile(userId) });
    },
  });
}

/**
 * Hook to get user statistics
 * 
 * @param userId - User ID
 * @param options - Query options
 * @returns Query result with user stats
 * 
 * @example
 * ```tsx
 * const { data: stats, isLoading } = useUserStats('user123');
 * ```
 */
export function useUserStats(
  userId: string | null | undefined,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) {
  return useQuery({
    queryKey: userQueryKeys.stats(userId || ''),
    queryFn: () => getUserStats(userId!),
    enabled: !!userId && (options?.enabled !== false),
    staleTime: options?.staleTime || 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

/**
 * Hook to get user trips
 * 
 * @param userId - User ID
 * @param options - Query options
 * @returns Query result with user trips
 * 
 * @example
 * ```tsx
 * const { data: trips, isLoading } = useUserTrips('user123');
 * ```
 */
export function useUserTrips(
  userId: string | null | undefined,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) {
  return useQuery({
    queryKey: userQueryKeys.trips(userId || ''),
    queryFn: () => getUserTrips(userId!),
    enabled: !!userId && (options?.enabled !== false),
    staleTime: options?.staleTime || 1 * 60 * 1000, // 1 minute
    retry: 2,
  });
}

/**
 * Hook to get user badges
 * 
 * @param userId - User ID
 * @param options - Query options
 * @returns Query result with user badges
 * 
 * @example
 * ```tsx
 * const { data: badges, isLoading } = useUserBadges('user123');
 * ```
 */
export function useUserBadges(
  userId: string | null | undefined,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) {
  return useQuery({
    queryKey: userQueryKeys.badges(userId || ''),
    queryFn: () => getUserBadges(userId!),
    enabled: !!userId && (options?.enabled !== false),
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to update medical information
 * 
 * @param userId - User ID
 * @returns Mutation object with mutate function
 * 
 * @example
 * ```tsx
 * const updateMedical = useUpdateMedicalInfo('user123');
 * updateMedical.mutate({ bloodType: 'A+', allergies: [] });
 * ```
 */
export function useUpdateMedicalInfo(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (info: MedicalInfo) => updateMedicalInfo(userId, info),
    onSuccess: () => {
      // Invalidate profile to refetch with new medical info
      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile(userId) });
    },
  });
}

