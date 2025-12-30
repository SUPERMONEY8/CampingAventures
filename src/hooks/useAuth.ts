/**
 * Custom hook to access authentication context
 * 
 * Provides easy access to authentication state and methods.
 * Includes error handling with French error messages.
 * 
 * @throws Error if used outside AuthProvider
 * @returns AuthContextValue with user, loading, error, and auth methods
 */

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import type { AuthContextValue } from '../contexts/AuthContext';

/**
 * Custom hook to access authentication context
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, loading, signIn, signOut } = useAuth();
 *   
 *   if (loading) return <Loading />;
 *   if (!user) return <LoginForm />;
 *   
 *   return <div>Welcome {user.name}</div>;
 * }
 * ```
 * 
 * @returns Authentication context value with:
 * - user: Current user profile or null
 * - firebaseUser: Firebase User object or null
 * - loading: Loading state
 * - error: Error message or null
 * - signUp: Register new user
 * - signIn: Sign in existing user
 * - signInWithGoogle: Sign in with Google
 * - signOut: Sign out current user
 * - updateProfile: Update user profile
 * - resetPassword: Send password reset email
 * - clearError: Clear error state
 * - refreshUser: Refresh user profile from Firestore
 * 
 * @throws {Error} If used outside AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Make sure to wrap your app with <AuthProvider> component.'
    );
  }

  return context;
}

/**
 * Type export for useAuth return value
 */
export type { AuthContextValue } from '../contexts/AuthContext';

