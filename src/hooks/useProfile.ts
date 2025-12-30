/**
 * Custom hook for user profile management
 * 
 * Handles profile updates, avatar upload, and medical info.
 */

import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc, type DocumentData } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import { updateProfile as updateFirebaseAuthProfile } from '../services/auth.service';
import type { User, MedicalInfo } from '../types';

/**
 * Hook return type
 */
interface UseProfileReturn {
  profile: User | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateMedicalInfo: (data: MedicalInfo) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  deleteAvatar: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Custom hook to manage user profile
 */
export function useProfile(userId: string): UseProfileReturn {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch user profile from Firestore
   */
  const fetchProfile = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as DocumentData;
        setProfile({
          ...data,
          history: data.history?.map((entry: { date: { toDate?: () => Date } | Date | string }) => ({
            ...entry,
            date: entry.date && typeof entry.date === 'object' && 'toDate' in entry.date && entry.date.toDate
              ? entry.date.toDate()
              : new Date(entry.date as Date | string),
          })) || [],
        } as User);
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching profile:', error);
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      setError(null);
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date(),
      });

      // Update Firebase Auth profile if name changed
      if (data.name) {
        await updateFirebaseAuthProfile(userId, { name: data.name });
      }

      await fetchProfile();
    } catch (err) {
      const error = err as Error;
      console.error('Error updating profile:', error);
      setError('Erreur lors de la mise à jour du profil');
      throw error;
    }
  };

  /**
   * Update medical information
   */
  const updateMedicalInfo = async (data: MedicalInfo): Promise<void> => {
    try {
      setError(null);
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        medicalInfo: data,
        updatedAt: new Date(),
      });
      await fetchProfile();
    } catch (err) {
      const error = err as Error;
      console.error('Error updating medical info:', error);
      setError('Erreur lors de la mise à jour des informations médicales');
      throw error;
    }
  };

  /**
   * Upload avatar image
   */
  const uploadAvatar = async (file: File): Promise<string> => {
    try {
      setError(null);
      const avatarRef = ref(storage, `avatars/${userId}/${Date.now()}_${file.name}`);
      await uploadBytes(avatarRef, file);
      const downloadURL = await getDownloadURL(avatarRef);

      // Update profile with new avatar URL
      await updateProfile({ avatarUrl: downloadURL } as Partial<User>);

      return downloadURL;
    } catch (err) {
      const error = err as Error;
      console.error('Error uploading avatar:', error);
      setError('Erreur lors du téléchargement de l\'avatar');
      throw error;
    }
  };

  /**
   * Delete avatar
   */
  const deleteAvatar = async (): Promise<void> => {
    try {
      setError(null);
      if (profile?.avatarUrl) {
        const avatarRef = ref(storage, profile.avatarUrl);
        await deleteObject(avatarRef);
      }
      await updateProfile({ avatarUrl: undefined } as Partial<User>);
    } catch (err) {
      const error = err as Error;
      console.error('Error deleting avatar:', error);
      setError('Erreur lors de la suppression de l\'avatar');
      throw error;
    }
  };

  /**
   * Fetch profile on mount and when userId changes
   */
  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    updateMedicalInfo,
    uploadAvatar,
    deleteAvatar,
    refresh: fetchProfile,
  };
}

