/**
 * Custom hook for user progress data
 * 
 * Fetches and manages user progress, points, level, and badges.
 */

import { useState, useEffect } from 'react';
import { doc, getDoc, type DocumentData } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { UserProgress } from '../types';

/**
 * Hook return type
 */
interface UseUserProgressReturn {
  progress: UserProgress | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Custom hook to fetch user progress
 */
export function useUserProgress(userId: string): UseUserProgressReturn {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch user progress from Firestore
   */
  const fetchProgress = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const progressRef = doc(db, 'userProgress', userId);
      const progressSnap = await getDoc(progressRef);

      if (progressSnap.exists()) {
        const data = progressSnap.data() as DocumentData;
        setProgress({
          ...data,
          badges: data.badges?.map((badge: { earnedAt: { toDate?: () => Date } | Date | string }) => {
            let earnedAtDate: Date;
            if (badge.earnedAt && typeof badge.earnedAt === 'object' && 'toDate' in badge.earnedAt && badge.earnedAt.toDate) {
              earnedAtDate = badge.earnedAt.toDate();
            } else {
              earnedAtDate = new Date(badge.earnedAt as Date | string);
            }
            return {
              ...badge,
              earnedAt: earnedAtDate,
            };
          }) || [],
        } as UserProgress);
      } else {
        // Create default progress if doesn't exist
        const defaultProgress: UserProgress = {
          userId,
          totalPoints: 0,
          level: 1,
          badges: [],
          completedTrips: [],
          currentStreak: 0,
          longestStreak: 0,
        };
        setProgress(defaultProgress);
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching user progress:', error);
      setError('Erreur lors du chargement du progrès');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProgress();
    }
  }, [userId]);

  return {
    progress,
    loading,
    error,
    refresh: fetchProgress,
  };
}

