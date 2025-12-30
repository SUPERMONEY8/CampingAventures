/**
 * Authentication Context Provider
 * 
 * Provides authentication state and methods throughout the application.
 * Manages user session persistence and authentication state changes.
 */

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '../services/firebase';
import {
  signUp as authSignUp,
  signIn as authSignIn,
  signInWithGoogle as authSignInWithGoogle,
  signOut as authSignOut,
  updateProfile as authUpdateProfile,
  resetPassword as authResetPassword,
  getUserProfile,
  type SignUpData,
  type ProfileUpdateData,
  AuthServiceError,
} from '../services/auth.service';
import type { User } from '../types';

/**
 * Authentication context value interface
 */
export interface AuthContextValue {
  // State
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;

  // Methods
  signUp: (
    email: string,
    password: string,
    userData: Omit<SignUpData, 'email' | 'password'>
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (userId: string, data: ProfileUpdateData) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

/**
 * Authentication context
 */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Props for AuthProvider component
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * 
 * Manages authentication state and provides auth methods to child components.
 * Automatically persists session and listens to auth state changes.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh user profile from Firestore
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    if (!firebaseUser) {
      setUser(null);
      return;
    }

    try {
      const userProfile = await getUserProfile(firebaseUser.uid);
      setUser(userProfile);
    } catch (err) {
      const authError = err as AuthServiceError;
      console.error('Failed to refresh user profile:', authError);
      setError('Erreur lors du chargement du profil utilisateur');
    }
  }, [firebaseUser]);

  /**
   * Handle authentication state changes
   * Automatically loads user profile when user signs in
   */
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        if (!isMounted) return;

        setFirebaseUser(firebaseUser);
        setLoading(true);

        if (firebaseUser) {
          try {
            const userProfile = await getUserProfile(firebaseUser.uid);
            if (isMounted) {
              setUser(userProfile);
            }
          } catch (err) {
            const authError = err as AuthServiceError;
            console.error('Failed to load user profile:', authError);
            if (isMounted) {
              setError('Erreur lors du chargement du profil utilisateur');
              setUser(null);
            }
          }
        } else {
          setUser(null);
        }

        if (isMounted) {
          setLoading(false);
        }
      },
      (err) => {
        if (isMounted) {
          console.error('Auth state change error:', err);
          setError('Erreur d\'authentification');
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  /**
   * Sign up a new user
   */
  const signUp = useCallback(
    async (
      email: string,
      password: string,
      userData: Omit<SignUpData, 'email' | 'password'>
    ): Promise<void> => {
      try {
        setError(null);
        setLoading(true);
        await authSignUp(email, password, userData);
        // User profile will be loaded automatically by onAuthStateChanged
      } catch (err) {
        const authError = err as AuthServiceError;
        setError(getFrenchErrorMessage(authError));
        throw authError;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Sign in an existing user
   */
  const signIn = useCallback(
    async (email: string, password: string): Promise<void> => {
      try {
        setError(null);
        setLoading(true);
        await authSignIn(email, password);
        // User profile will be loaded automatically by onAuthStateChanged
      } catch (err) {
        const authError = err as AuthServiceError;
        setError(getFrenchErrorMessage(authError));
        throw authError;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Sign in with Google
   */
  const signInWithGoogle = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      await authSignInWithGoogle();
      // User profile will be loaded automatically by onAuthStateChanged
    } catch (err) {
      const authError = err as AuthServiceError;
      setError(getFrenchErrorMessage(authError));
      throw authError;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign out current user
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      await authSignOut();
      setUser(null);
      setFirebaseUser(null);
    } catch (err) {
      const authError = err as AuthServiceError;
      setError(getFrenchErrorMessage(authError));
      throw authError;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(
    async (userId: string, data: ProfileUpdateData): Promise<void> => {
      try {
        setError(null);
        await authUpdateProfile(userId, data);
        // Refresh user profile after update
        await refreshUser();
      } catch (err) {
        const authError = err as AuthServiceError;
        setError(getFrenchErrorMessage(authError));
        throw authError;
      }
    },
    [refreshUser]
  );

  /**
   * Reset password
   */
  const resetPassword = useCallback(async (email: string): Promise<void> => {
    try {
      setError(null);
      await authResetPassword(email);
    } catch (err) {
      const authError = err as AuthServiceError;
      setError(getFrenchErrorMessage(authError));
      throw authError;
    }
  }, []);

  /**
   * Memoized context value to prevent unnecessary re-renders
   */
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      firebaseUser,
      loading,
      error,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      updateProfile,
      resetPassword,
      clearError,
      refreshUser,
    }),
    [
      user,
      firebaseUser,
      loading,
      error,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      updateProfile,
      resetPassword,
      clearError,
      refreshUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Convert authentication error to French message
 */
function getFrenchErrorMessage(error: AuthServiceError): string {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'Cet email est déjà utilisé',
    'auth/invalid-email': 'Adresse email invalide',
    'auth/operation-not-allowed': 'Cette opération n\'est pas autorisée',
    'auth/weak-password': 'Le mot de passe est trop faible (minimum 6 caractères)',
    'auth/user-disabled': 'Ce compte a été désactivé',
    'auth/user-not-found': 'Aucun compte trouvé avec cet email',
    'auth/wrong-password': 'Mot de passe incorrect',
    'auth/invalid-credential': 'Email ou mot de passe invalide',
    'auth/too-many-requests':
      'Trop de tentatives échouées. Veuillez réessayer plus tard',
    'auth/network-request-failed':
      'Erreur réseau. Veuillez vérifier votre connexion',
    'auth/popup-closed-by-user': 'La fenêtre de connexion a été fermée',
    'auth/cancelled-popup-request':
      'Une seule demande de connexion est autorisée à la fois',
    'auth/user-mismatch': 'Utilisateur non authentifié ou ID utilisateur incorrect',
    'auth/no-user': 'Aucun utilisateur connecté',
  };

  return (
    errorMessages[error.code] ||
    `Erreur d'authentification: ${error.message}`
  );
}

