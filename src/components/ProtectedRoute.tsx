/**
 * Protected Route Component
 * 
 * Higher-Order Component (HOC) to protect routes that require authentication.
 * Supports role-based access control (user, admin, ceo).
 * 
 * Features:
 * - Redirects to /login if user is not authenticated
 * - Shows loading state during authentication check
 * - Supports role-based access control
 * - TypeScript strict typing
 */

import React, { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * User role type
 */
export type UserRole = 'user' | 'admin' | 'ceo';

/**
 * Props for ProtectedRoute component
 */
interface ProtectedRouteProps {
  /**
   * Child components to render if user is authenticated
   */
  children: ReactNode;

  /**
   * Required role(s) to access the route
   * If not provided, any authenticated user can access
   */
  requiredRole?: UserRole | UserRole[];

  /**
   * Redirect path when user is not authenticated
   * Defaults to '/login'
   */
  redirectTo?: string;

  /**
   * Custom loading component to show during authentication check
   * If not provided, shows a simple loading message
   */
  loadingComponent?: ReactNode;
}

/**
 * Protected Route Component
 * 
 * Protects routes that require authentication and optionally specific roles.
 * 
 * @example
 * ```tsx
 * // Protect route for any authenticated user
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * // Protect route for admin only
 * <ProtectedRoute requiredRole="admin">
 *   <AdminPanel />
 * </ProtectedRoute>
 * 
 * // Protect route for admin or ceo
 * <ProtectedRoute requiredRole={['admin', 'ceo']}>
 *   <ManagementPanel />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/login',
  loadingComponent,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <>
        {loadingComponent || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement...</p>
            </div>
          </div>
        )}
      </>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('❌ ProtectedRoute: User is null - redirecting to login');
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  // Check role-based access if required
  if (requiredRole) {
    console.log('🔍 ProtectedRoute: Checking role access');
    console.log('🔍 User object:', user);
    console.log('🔍 User role from object:', (user as any).role);
    console.log('🔍 User email:', (user as any).email);
    
    const userRole = getUserRole(user as unknown as { id: string; [key: string]: unknown });
    console.log('🔍 Detected role:', userRole);
    console.log('🔍 Required role:', requiredRole);
    
    const allowedRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];

    if (!userRole || !allowedRoles.includes(userRole)) {
      console.log('❌ ProtectedRoute: User does not have required role');
      console.log('❌ User role:', userRole, 'Required:', allowedRoles);
      // User doesn't have required role, redirect to unauthorized page or home
      return (
        <Navigate
          to="/unauthorized"
          state={{ from: location, requiredRole }}
          replace
        />
      );
    }
    
    console.log('✅ ProtectedRoute: User has required role, allowing access');
  }

  // User is authenticated and has required role (if any)
  return <>{children}</>;
}

/**
 * Get user role from user object
 * 
 * This function checks for a role property in the user object.
 * You may need to extend the User type to include a role field,
 * or fetch it from a separate userRoles collection in Firestore.
 * 
 * @param user - User object
 * @returns User role or null if not found
 */
function getUserRole(user: { id: string; [key: string]: unknown }): UserRole | null {
  console.log('🔍 getUserRole: Checking user object', user);
  
  // Check if user has a role property
  if ('role' in user && typeof user.role === 'string') {
    const role = user.role as string;
    console.log('🔍 getUserRole: Found role property:', role);
    if (role === 'user' || role === 'admin' || role === 'ceo') {
      console.log('✅ getUserRole: Valid role found:', role);
      return role as UserRole;
    }
    console.log('⚠️ getUserRole: Invalid role value:', role);
  } else {
    console.log('⚠️ getUserRole: No role property found or not a string');
  }

  // Temporary: Check if user email contains 'admin' for testing
  // In production, this should come from Firestore user document
  if ('email' in user && typeof user.email === 'string') {
    const email = user.email.toLowerCase();
    console.log('🔍 getUserRole: Checking email:', email);
    if (email.includes('admin') || email === 'admin@camping-aventures.com') {
      console.log('✅ getUserRole: Admin email detected');
      return 'admin';
    }
  }

  // Default to 'user' role if no role is specified
  console.log('⚠️ getUserRole: Defaulting to user role');
  return 'user';
}

/**
 * Higher-Order Component version of ProtectedRoute
 * 
 * @example
 * ```tsx
 * const ProtectedDashboard = withProtectedRoute(Dashboard);
 * ```
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
): React.ComponentType<P> {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}


