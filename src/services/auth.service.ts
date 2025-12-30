/**
 * Authentication service for Firebase Auth
 * 
 * Provides all authentication-related functions:
 * - User registration and login
 * - Social authentication (Google)
 * - Password management
 * - Profile updates
 * - Session management
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
  type UserCredential,
  type AuthError as FirebaseAuthError,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User as UserType, EmergencyContact } from '../types';

/**
 * Custom error class for authentication errors
 */
export class AuthServiceError extends Error {
  public code: string;
  public originalError?: FirebaseAuthError;

  constructor(
    message: string,
    code: string,
    originalError?: FirebaseAuthError
  ) {
    super(message);
    this.name = 'AuthServiceError';
    this.code = code;
    this.originalError = originalError;
  }
}

/**
 * User data for registration
 */
export interface SignUpData {
  email: string;
  password: string;
  name: string;
  age: number;
  emergencyContact: EmergencyContact;
  physicalLevel: 'débutant' | 'intermédiaire' | 'avancé';
  interests: ('randonnée' | 'photo' | 'survie' | 'détente' | 'social')[];
}

/**
 * Profile update data
 */
export interface ProfileUpdateData {
  name?: string;
  age?: number;
  emergencyContact?: EmergencyContact;
  physicalLevel?: 'débutant' | 'intermédiaire' | 'avancé';
  interests?: ('randonnée' | 'photo' | 'survie' | 'détente' | 'social')[];
}

/**
 * Register a new user with email and password
 * 
 * @param email - User email address
 * @param password - User password (min 6 characters)
 * @param userData - Additional user profile data
 * @returns UserCredential with the created user
 * @throws AuthError if registration fails
 */
export async function signUp(
  email: string,
  password: string,
  userData: Omit<SignUpData, 'email' | 'password'>
): Promise<UserCredential> {
  try {
    // Create authentication account
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update Firebase Auth profile
    await firebaseUpdateProfile(userCredential.user, {
      displayName: userData.name,
    });

    // Create user document in Firestore
    const userDoc = {
      id: userCredential.user.uid,
      email: email,
      name: userData.name,
      age: userData.age,
      emergencyContact: userData.emergencyContact,
      physicalLevel: userData.physicalLevel,
      interests: userData.interests,
      history: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(
      doc(db, 'users', userCredential.user.uid),
      userDoc
    );

    return userCredential;
  } catch (error) {
    const authError = error as FirebaseAuthError;
    throw new AuthServiceError(
      getAuthErrorMessage(authError.code),
      authError.code,
      authError
    );
  }
}

/**
 * Sign in an existing user with email and password
 * 
 * @param email - User email address
 * @param password - User password
 * @returns UserCredential with the signed-in user
 * @throws AuthError if sign-in fails
 */
export async function signIn(
  email: string,
  password: string
): Promise<UserCredential> {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential;
  } catch (error) {
    const authError = error as FirebaseAuthError;
    throw new AuthServiceError(
      getAuthErrorMessage(authError.code),
      authError.code,
      authError
    );
  }
}

/**
 * Sign in with Google using popup
 * 
 * @returns UserCredential with the signed-in user
 * @throws AuthError if sign-in fails
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  try {
    const provider = new GoogleAuthProvider();
    // Request additional scopes if needed
    provider.addScope('profile');
    provider.addScope('email');

    const userCredential: UserCredential = await signInWithPopup(auth, provider);

    // Check if user document exists, create if not
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      // Create user document for first-time Google sign-in
      const userDoc = {
        id: userCredential.user.uid,
        email: userCredential.user.email || '',
        name: userCredential.user.displayName || 'User',
        age: 0, // Will need to be updated
        emergencyContact: {
          name: '',
          phone: '',
          relationship: '',
        },
        physicalLevel: 'débutant' as const,
        interests: [] as ('randonnée' | 'photo' | 'survie' | 'détente' | 'social')[],
        history: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(userDocRef, userDoc);
    }

    return userCredential;
  } catch (error) {
    const authError = error as FirebaseAuthError;
    
    // Handle popup closed by user
    if (authError.code === 'auth/popup-closed-by-user') {
      throw new AuthServiceError('Sign-in popup was closed', authError.code, authError);
    }
    
    throw new AuthServiceError(
      getAuthErrorMessage(authError.code),
      authError.code,
      authError
    );
  }
}

/**
 * Sign out the current user
 * 
 * @throws AuthError if sign-out fails
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    const authError = error as FirebaseAuthError;
      throw new AuthServiceError(
        'Failed to sign out: ' + authError.message,
        authError.code,
        authError
      );
  }
}

/**
 * Send password reset email to user
 * 
 * @param email - User email address
 * @throws AuthError if sending fails
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    const authError = error as FirebaseAuthError;
    throw new AuthServiceError(
      getAuthErrorMessage(authError.code),
      authError.code,
      authError
    );
  }
}

/**
 * Update user profile in both Auth and Firestore
 * 
 * @param userId - User ID
 * @param data - Profile data to update
 * @throws AuthError if update fails
 */
export async function updateProfile(
  userId: string,
  data: ProfileUpdateData
): Promise<void> {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser || currentUser.uid !== userId) {
      throw new AuthServiceError(
        'User not authenticated or user ID mismatch',
        'auth/user-mismatch'
      );
    }

    // Update Firebase Auth profile if name is provided
    if (data.name) {
      await firebaseUpdateProfile(currentUser, {
        displayName: data.name,
      });
    }

    // Update Firestore user document
    const userDocRef = doc(db, 'users', userId);
    const updateData: DocumentData = {
      ...data,
      updatedAt: new Date(),
    };

    await updateDoc(userDocRef, updateData);
  } catch (error) {
    const authError = error as FirebaseAuthError;
    throw new AuthServiceError(
      'Failed to update profile: ' + (authError.message || 'Unknown error'),
      authError.code || 'unknown',
      authError
    );
  }
}

/**
 * Get the current authenticated user
 * 
 * @returns Current User object or null if not authenticated
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Get user profile data from Firestore
 * 
 * @param userId - User ID (optional, defaults to current user)
 * @returns User profile data or null if not found
 * @throws AuthError if fetch fails
 */
export async function getUserProfile(
  userId?: string
): Promise<UserType | null> {
  try {
    const targetUserId = userId || auth.currentUser?.uid;

    if (!targetUserId) {
      throw new AuthServiceError(
        'No user ID provided and no user is authenticated',
        'auth/no-user'
      );
    }

    const userDocRef = doc(db, 'users', targetUserId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return null;
    }

    const userData = userDocSnap.data();
    
    // Convert Firestore timestamps to Date objects
    return {
      ...userData,
      history: userData.history.map((entry: {
        tripId: string;
        tripTitle: string;
        date: { toDate: () => Date };
        role: string;
        pointsEarned: number;
      }) => ({
        ...entry,
        date: entry.date.toDate ? entry.date.toDate() : entry.date,
      })),
    } as UserType;
  } catch (error) {
    const authError = error as FirebaseAuthError;
    throw new AuthServiceError(
      'Failed to fetch user profile: ' + (authError.message || 'Unknown error'),
      authError.code || 'unknown',
      authError
    );
  }
}

/**
 * Convert Firebase Auth error codes to user-friendly messages
 * 
 * @param code - Firebase Auth error code
 * @returns User-friendly error message
 */
function getAuthErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered',
    'auth/invalid-email': 'Invalid email address',
    'auth/operation-not-allowed': 'This operation is not allowed',
    'auth/weak-password': 'Password is too weak (minimum 6 characters)',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/invalid-credential': 'Invalid email or password',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later',
    'auth/network-request-failed': 'Network error. Please check your connection',
    'auth/popup-closed-by-user': 'Sign-in popup was closed',
    'auth/cancelled-popup-request': 'Only one popup request is allowed at a time',
  };

  return errorMessages[code] || `Authentication error: ${code}`;
}

