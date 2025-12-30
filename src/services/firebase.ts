/**
 * Firebase configuration and services initialization
 * 
 * This module initializes Firebase with all required services:
 * - Authentication
 * - Firestore (with offline persistence)
 * - Storage (with cache configuration)
 * - Analytics
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { 
  getFirestore, 
  enableIndexedDbPersistence, 
  type Firestore 
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAnalytics, type Analytics as FirebaseAnalytics } from 'firebase/analytics';

/**
 * Firebase configuration from environment variables
 * All variables must be prefixed with VITE_ to be accessible in the client
 * Falls back to hardcoded values for production if env vars are missing
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCLQ_9RsfXuADTNzcRLUu3ihfmLflNtzL8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'camping-aventures.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'camping-aventures',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'camping-aventures.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '57354850876',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:57354850876:web:97b68a125e664310b6e939',
};

// Validate that all required Firebase config values are present
const requiredConfigKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

const missingKeys = requiredConfigKeys.filter(
  (key) => !firebaseConfig[key as keyof typeof firebaseConfig]
);

if (missingKeys.length > 0) {
  console.error(
    `Missing required Firebase configuration: ${missingKeys.join(', ')}\n` +
    'Please check your .env.local file or Firebase configuration.'
  );
}

/**
 * Initialize Firebase app
 */
const app: FirebaseApp = initializeApp(firebaseConfig);

/**
 * Initialize Firebase Authentication
 */
export const auth: Auth = getAuth(app);

/**
 * Initialize Firestore with offline persistence
 * 
 * Offline persistence allows the app to work offline by:
 * - Caching data locally in IndexedDB
 * - Syncing changes when connection is restored
 * - Enabling read/write operations while offline
 */
export const db: Firestore = getFirestore(app);

// Enable offline persistence for Firestore
enableIndexedDbPersistence(db).catch((error: unknown) => {
  const err = error as { code?: string; message?: string };
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a time
    console.warn('Firestore persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    // Browser doesn't support persistence
    console.warn('Firestore persistence not available in this browser');
  } else {
    console.error('Error enabling Firestore persistence:', error);
  }
});

/**
 * Initialize Firebase Storage with cache configuration
 * 
 * Storage cache is automatically handled by Firebase SDK:
 * - Downloaded files are cached locally
 * - Cache size is managed automatically
 * - Cache can be cleared programmatically if needed
 */
export const storage: FirebaseStorage = getStorage(app);

/**
 * Initialize Firebase Analytics
 * Only available in browser environment
 */
export const analytics: FirebaseAnalytics | null = typeof window !== 'undefined' 
  ? getAnalytics(app) 
  : null;

export default app;

/**
 * ============================================================================
 * FIRESTORE SECURITY RULES (to be configured in Firebase Console)
 * ============================================================================
 * 
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     
 *     // Helper function to check if user is authenticated
 *     function isAuthenticated() {
 *       return request.auth != null;
 *     }
 *     
 *     // Helper function to check if user is admin
 *     function isAdmin() {
 *       return isAuthenticated() && 
 *              get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
 *     }
 *     
 *     // Helper function to check if user is trip participant
 *     function isTripParticipant(tripId) {
 *       return isAuthenticated() && 
 *              tripId in get(/databases/$(database)/documents/trips/$(tripId)).data.participants;
 *     }
 *     
 *     // Users collection
 *     // Read: Any authenticated user can read user profiles
 *     // Write: Users can only write their own profile
 *     match /users/{userId} {
 *       allow read: if isAuthenticated();
 *       allow write: if isAuthenticated() && request.auth.uid == userId;
 *       allow create: if isAuthenticated() && request.auth.uid == userId;
 *       allow update: if isAuthenticated() && request.auth.uid == userId;
 *       allow delete: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
 *     }
 *     
 *     // Trips collection
 *     // Read: All authenticated users can read trips
 *     // Write: Only admins can create/update trips
 *     match /trips/{tripId} {
 *       allow read: if isAuthenticated();
 *       allow write: if isAdmin();
 *       allow create: if isAdmin();
 *       allow update: if isAdmin();
 *       allow delete: if isAdmin();
 *     }
 *     
 *     // Messages collection
 *     // Read/Write: Only trip participants can read and write messages
 *     match /messages/{messageId} {
 *       allow read: if isAuthenticated() && 
 *                      isTripParticipant(resource.data.tripId);
 *       allow write: if isAuthenticated() && 
 *                      request.auth.uid == request.resource.data.senderId &&
 *                      isTripParticipant(request.resource.data.tripId);
 *       allow create: if isAuthenticated() && 
 *                        request.auth.uid == request.resource.data.senderId &&
 *                        isTripParticipant(request.resource.data.tripId);
 *     }
 *     
 *     // Photos collection
 *     // Read: Trip participants can read photos
 *     // Write: Users can only upload their own photos
 *     match /photos/{photoId} {
 *       allow read: if isAuthenticated() && 
 *                     isTripParticipant(resource.data.tripId);
 *       allow write: if isAuthenticated() && 
 *                      request.auth.uid == request.resource.data.userId;
 *       allow create: if isAuthenticated() && 
 *                        request.auth.uid == request.resource.data.userId;
 *     }
 *     
 *     // SOS Alerts collection
 *     // Read: Admins and the alert creator can read
 *     // Write: Users can create their own alerts, admins can update
 *     match /sosAlerts/{alertId} {
 *       allow read: if isAuthenticated() && 
 *                     (request.auth.uid == resource.data.userId || isAdmin());
 *       allow create: if isAuthenticated() && 
 *                        request.auth.uid == request.resource.data.userId;
 *       allow update: if isAuthenticated() && isAdmin();
 *     }
 *     
 *     // User Progress collection
 *     // Read: Users can read their own progress
 *     // Write: System only (via Cloud Functions)
 *     match /userProgress/{userId} {
 *       allow read: if isAuthenticated() && request.auth.uid == userId;
 *       allow write: if false; // Only Cloud Functions can write
 *     }
 *     
 *     // Badges collection
 *     // Read: All authenticated users
 *     // Write: Admin only
 *     match /badges/{badgeId} {
 *       allow read: if isAuthenticated();
 *       allow write: if isAdmin();
 *     }
 *     
 *     // Achievements collection
 *     // Read: Users can read their own achievements
 *     // Write: System only (via Cloud Functions)
 *     match /achievements/{achievementId} {
 *       allow read: if isAuthenticated() && 
 *                     request.auth.uid == resource.data.userId;
 *       allow write: if false; // Only Cloud Functions can write
 *     }
 *   }
 * }
 * 
 * ============================================================================
 */

