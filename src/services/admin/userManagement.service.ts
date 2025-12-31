/**
 * User Management Service
 * 
 * Service for admin to manage users: view, edit, ban, delete, etc.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { User } from '../../types';

/**
 * User filters
 */
export interface UserFilters {
  role?: 'user' | 'admin' | 'ceo' | 'guide';
  status?: 'active' | 'inactive' | 'banned';
  searchQuery?: string;
}

/**
 * User detail with extended information
 */
export interface UserDetail extends User {
  totalTrips: number;
  completedTrips: number;
  totalSpent: number;
  lastLogin?: Date;
  loginCount: number;
  supportMessages: number;
  reports: number;
  adminNotes?: string;
}

/**
 * Ban user data
 */
export interface BanData {
  reason: string;
  duration?: number; // days, undefined = permanent
  bannedUntil?: Date;
}

/**
 * Get all users with filters
 * 
 * @param filters - Filter options
 * @returns Array of users
 */
export async function getUsers(filters: UserFilters = {}): Promise<User[]> {
  try {
    const usersRef = collection(db, 'users');
    let q = query(usersRef);

    // Apply role filter
    if (filters.role) {
      q = query(q, where('role', '==', filters.role));
    }

    const snapshot = await getDocs(q);
    const users: User[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as DocumentData;
      
      // Apply status filter in memory
      const status = data.banned ? 'banned' : (data.active === false ? 'inactive' : 'active');
      if (filters.status && filters.status !== status) {
        return;
      }

      // Apply search filter in memory
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const name = (data.name || '').toLowerCase();
        const email = (data.email || '').toLowerCase();
        const phone = (data.phone || '').toLowerCase();
        
        if (!name.includes(query) && !email.includes(query) && !phone.includes(query)) {
          return;
        }
      }

      users.push({
        id: docSnap.id,
        name: data.name || 'Unknown',
        email: data.email || '',
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        role: data.role || 'user',
        age: data.age,
        interests: data.interests || [],
        physicalLevel: data.physicalLevel,
        medicalInfo: data.medicalInfo,
        emergencyContact: data.emergencyContact,
        history: data.history || [],
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
        banned: data.banned || false,
        bannedUntil: data.bannedUntil?.toDate ? data.bannedUntil.toDate() : (data.bannedUntil ? new Date(data.bannedUntil) : undefined),
        bannedReason: data.bannedReason,
        active: data.active !== false,
      } as User);
    });

    // Sort by creation date (newest first)
    users.sort((a, b) => {
      const aDate = a.createdAt?.getTime() || 0;
      const bDate = b.createdAt?.getTime() || 0;
      return bDate - aDate;
    });

    return users;
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching users:', err);
    throw new Error(`Échec de la récupération des utilisateurs: ${err.message}`);
  }
}

/**
 * Get user statistics
 * 
 * @returns User statistics
 */
export async function getUserStatistics(): Promise<{
  total: number;
  newThisMonth: number;
  active: number;
  banned: number;
}> {
  try {
    const users = await getUsers();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const newThisMonth = users.filter((user) => {
      const createdAt = user.createdAt || new Date(0);
      return createdAt >= startOfMonth;
    }).length;
    const active = users.filter((user) => (user.active !== false) && !user.banned).length;
    const banned = users.filter((user) => user.banned === true).length;

    return {
      total: users.length,
      newThisMonth,
      active,
      banned,
    };
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    return { total: 0, newThisMonth: 0, active: 0, banned: 0 };
  }
}

/**
 * Get detailed user information
 * 
 * @param userId - User ID
 * @returns User detail object
 */
export async function getUserDetails(userId: string): Promise<UserDetail> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('Utilisateur introuvable');
    }

    const data = userDoc.data() as DocumentData;

    // Get user's trips
    const enrollmentsRef = collection(db, 'enrollments');
    const enrollmentsSnapshot = await getDocs(
      query(enrollmentsRef, where('userId', '==', userId))
    );
    const totalTrips = enrollmentsSnapshot.size;
    const completedTrips = enrollmentsSnapshot.docs.filter((doc) => {
      const enrollment = doc.data() as DocumentData;
      return enrollment.status === 'completed';
    }).length;

    // Get total spent
    const totalSpent = enrollmentsSnapshot.docs.reduce((sum, doc) => {
      const enrollment = doc.data() as DocumentData;
      return sum + (enrollment.totalAmount || 0);
    }, 0);

    // Get login count and last login (would need to be tracked separately)
    const loginCount = data.loginCount || 0;
    const lastLogin = data.lastLogin?.toDate ? data.lastLogin.toDate() : (data.lastLogin ? new Date(data.lastLogin) : undefined);

    // Get support messages count
    const messagesRef = collection(db, 'supportMessages');
    const messagesSnapshot = await getDocs(
      query(messagesRef, where('userId', '==', userId))
    );
    const supportMessages = messagesSnapshot.size;

    // Get reports count
    const reportsRef = collection(db, 'reports');
    const reportsSnapshot = await getDocs(
      query(reportsRef, where('reportedUserId', '==', userId))
    );
    const reports = reportsSnapshot.size;

    return {
      id: userDoc.id,
      name: data.name || 'Unknown',
      email: data.email || '',
      phone: data.phone,
      avatarUrl: data.avatarUrl,
      role: data.role || 'user',
      age: data.age,
      interests: data.interests || [],
      physicalLevel: data.physicalLevel,
      medicalInfo: data.medicalInfo,
      emergencyContact: data.emergencyContact,
      history: data.history || [],
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
      banned: data.banned === true,
      bannedUntil: data.bannedUntil?.toDate ? data.bannedUntil.toDate() : (data.bannedUntil ? new Date(data.bannedUntil) : undefined),
      bannedReason: data.bannedReason,
      active: data.active !== false,
      totalTrips,
      completedTrips,
      totalSpent,
      lastLogin,
      loginCount,
      supportMessages,
      reports,
      adminNotes: data.adminNotes,
    } as UserDetail;
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching user details:', err);
    throw new Error(`Échec de la récupération des détails: ${err.message}`);
  }
}

/**
 * Update user role
 * 
 * @param userId - User ID
 * @param role - New role
 */
export async function updateUserRole(userId: string, role: 'user' | 'admin' | 'ceo' | 'guide'): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role,
      updatedAt: Timestamp.now(),
    });

    // Log the change (would be stored in audit logs)
    console.log(`User ${userId} role changed to ${role}`);
  } catch (error) {
    const err = error as Error;
    console.error('Error updating user role:', err);
    throw new Error(`Échec de la mise à jour du rôle: ${err.message}`);
  }
}

/**
 * Ban a user
 * 
 * @param userId - User ID
 * @param banData - Ban information
 */
export async function banUser(userId: string, banData: BanData): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const bannedUntil = banData.duration
      ? Timestamp.fromDate(new Date(Date.now() + banData.duration * 24 * 60 * 60 * 1000))
      : null;

    await updateDoc(userRef, {
      banned: true,
      bannedReason: banData.reason,
      bannedUntil: bannedUntil,
      bannedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log(`User ${userId} banned: ${banData.reason}`);
  } catch (error) {
    const err = error as Error;
    console.error('Error banning user:', err);
    throw new Error(`Échec du bannissement: ${err.message}`);
  }
}

/**
 * Unban a user
 * 
 * @param userId - User ID
 */
export async function unbanUser(userId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      banned: false,
      bannedReason: null,
      bannedUntil: null,
      bannedAt: null,
      updatedAt: Timestamp.now(),
    });

    console.log(`User ${userId} unbanned`);
  } catch (error) {
    const err = error as Error;
    console.error('Error unbanning user:', err);
    throw new Error(`Échec de la réactivation: ${err.message}`);
  }
}

/**
 * Update user active status
 * 
 * @param userId - User ID
 * @param active - Active status
 */
export async function updateUserStatus(userId: string, active: boolean): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      active,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error updating user status:', err);
    throw new Error(`Échec de la mise à jour du statut: ${err.message}`);
  }
}

/**
 * Delete a user account
 * 
 * @param userId - User ID
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    // Note: In production, you might want to soft-delete or anonymize instead
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);

    console.log(`User ${userId} deleted`);
  } catch (error) {
    const err = error as Error;
    console.error('Error deleting user:', err);
    throw new Error(`Échec de la suppression: ${err.message}`);
  }
}

/**
 * Send notification to user
 * 
 * @param userId - User ID
 * @param title - Notification title
 * @param message - Notification message
 */
export async function sendNotificationToUser(
  userId: string,
  title: string,
  message: string
): Promise<void> {
  try {
    const notificationsRef = collection(db, 'notifications');
    await addDoc(notificationsRef, {
      userId,
      type: 'admin',
      title,
      body: message,
      read: false,
      createdAt: Timestamp.now(),
      sentAt: Timestamp.now(),
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error sending notification:', err);
    throw new Error(`Échec de l'envoi de la notification: ${err.message}`);
  }
}

/**
 * Award badge to user
 * 
 * @param userId - User ID
 * @param badgeId - Badge ID
 */
export async function awardBadgeToUser(userId: string, badgeId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('Utilisateur introuvable');
    }

    const data = userDoc.data() as DocumentData;
    const badges = data.badges || [];

    if (!badges.includes(badgeId)) {
      await updateDoc(userRef, {
        badges: [...badges, badgeId],
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    const err = error as Error;
    console.error('Error awarding badge:', err);
    throw new Error(`Échec de l'attribution du badge: ${err.message}`);
  }
}

/**
 * Update admin notes for user
 * 
 * @param userId - User ID
 * @param notes - Admin notes
 */
export async function updateAdminNotes(userId: string, notes: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      adminNotes: notes,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error updating admin notes:', err);
    throw new Error(`Échec de la mise à jour des notes: ${err.message}`);
  }
}

/**
 * Export users to CSV
 * 
 * @param filters - Filter options
 * @returns CSV blob
 */
export async function exportUsersToCSV(filters: UserFilters = {}): Promise<Blob> {
  try {
    const users = await getUsers(filters);

    const headers = [
      'ID',
      'Nom',
      'Email',
      'Téléphone',
      'Rôle',
      'Niveau',
      'Points',
      'Sorties',
      'Inscription',
      'Statut',
    ];

    const rows = users.map((user) => [
      user.id,
      user.name,
      user.email,
      user.phone || '',
      user.role,
      user.physicalLevel || '',
      user.history?.reduce((sum, h) => sum + (h.pointsEarned || 0), 0) || 0,
      user.history?.length || 0,
      user.createdAt?.toISOString() || '',
      user.banned ? 'Banni' : user.active ? 'Actif' : 'Inactif',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  } catch (error) {
    const err = error as Error;
    console.error('Error exporting users:', err);
    throw new Error(`Échec de l'export: ${err.message}`);
  }
}

