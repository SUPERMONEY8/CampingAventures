/**
 * Admin Service
 * 
 * Service for admin dashboard data and analytics.
 */

import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  AdminKPIs,
  RevenueDataPoint,
  TripStatusDistribution,
  TripSatisfaction,
  UserGrowthDataPoint,
  AdminAlert,
  RecentActivity,
  QuickStats,
  Trip,
} from '../types';

/**
 * Get admin KPIs
 */
export async function getAdminKPIs(): Promise<AdminKPIs> {
  try {
    // This would typically aggregate data from multiple collections
    // For now, we'll return mock data structure
    
    // In production, you would:
    // 1. Query trips collection for revenue
    // 2. Query users collection for active users
    // 3. Query trips for active trips
    // 4. Query reviews for satisfaction

    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get revenue data
    // Note: Removed orderBy to avoid index requirement - we'll sort in memory
    const tripsRef = collection(db, 'trips');
    const allTripsSnapshot = await getDocs(tripsRef);
    const completedTrips = allTripsSnapshot.docs.filter((doc) => {
      const data = doc.data() as DocumentData;
      const tripDate = data.date?.toDate ? data.date.toDate() : new Date(data.date);
      return data.status === 'completed' && tripDate >= thisMonth;
    });

    let currentRevenue = 0;
    let previousRevenue = 0;

    completedTrips.forEach((doc) => {
      const trip = doc.data() as DocumentData;
      const price = parseFloat(trip.price?.toString().replace(/[^0-9.]/g, '') || '0');
      const participants = trip.participants?.length || 0;
      currentRevenue += price * participants;
    });

    // Get previous month revenue - filter in memory to avoid index
    const previousMonthTrips = allTripsSnapshot.docs.filter((doc) => {
      const data = doc.data() as DocumentData;
      const tripDate = data.date?.toDate ? data.date.toDate() : new Date(data.date);
      return data.status === 'completed' && tripDate >= lastMonth && tripDate < thisMonth;
    });

    previousMonthTrips.forEach((doc) => {
      const trip = doc.data() as DocumentData;
      const price = parseFloat(trip.price?.toString().replace(/[^0-9.]/g, '') || '0');
      const participants = trip.participants?.length || 0;
      previousRevenue += price * participants;
    });

    const revenueChange = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

    // Get active users
    const usersRef = collection(db, 'users');
    const allUsers = await getDocs(usersRef);
    const totalUsers = allUsers.size;

    // Filter users in memory to avoid index requirement
    const allUsersSnapshot = await getDocs(usersRef);
    const newUsersThisMonth = allUsersSnapshot.docs.filter((doc) => {
      const data = doc.data() as DocumentData;
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      return createdAt >= thisMonth;
    });
    const newUsersCount = newUsersThisMonth.length;

    const previousMonthUsers = allUsersSnapshot.docs.filter((doc) => {
      const data = doc.data() as DocumentData;
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      return createdAt >= lastMonth && createdAt < thisMonth;
    });
    const previousUsersCount = previousMonthUsers.length;
    const growthRate = previousUsersCount > 0
      ? ((newUsersCount - previousUsersCount) / previousUsersCount) * 100
      : 0;

    // Get active trips
    const ongoingTrips = await getDocs(
      query(tripsRef, where('status', '==', 'ongoing'))
    );

    // Filter upcoming trips in memory
    const upcomingTripsFiltered = allTripsSnapshot.docs.filter((doc) => {
      const data = doc.data() as DocumentData;
      const tripDate = data.date?.toDate ? data.date.toDate() : new Date(data.date);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return data.status === 'upcoming' && tripDate >= thisMonth && tripDate < nextMonth;
    });

    // Calculate average fill rate
    let totalFillRate = 0;
    let tripsWithParticipants = 0;

    const allTrips = await getDocs(tripsRef);
    allTrips.forEach((doc) => {
      const trip = doc.data() as DocumentData;
      const maxParticipants = trip.maxParticipants || 1;
      const participants = trip.participants?.length || 0;
      if (maxParticipants > 0) {
        totalFillRate += (participants / maxParticipants) * 100;
        tripsWithParticipants++;
      }
    });

    const averageFillRate = tripsWithParticipants > 0
      ? totalFillRate / tripsWithParticipants
      : 0;

    // Get satisfaction
    const reviewsRef = collection(db, 'reviews');
    const allReviews = await getDocs(reviewsRef);
    
    let totalRating = 0;
    let reviewCount = 0;

    allReviews.forEach((doc) => {
      const review = doc.data() as DocumentData;
      if (review.rating) {
        totalRating += review.rating;
        reviewCount++;
      }
    });

    const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;

    // Generate trend data (last 7 days)
    const trend: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      // Simplified: would calculate actual revenue per day
      trend.push(Math.random() * 1000 + 500);
    }

    return {
      revenue: {
        current: currentRevenue,
        previous: previousRevenue,
        change: revenueChange,
        trend,
      },
      activeUsers: {
        total: totalUsers,
        newThisMonth: newUsersCount,
        growthRate,
      },
      activeTrips: {
        ongoing: ongoingTrips.size,
        upcomingThisMonth: upcomingTripsFiltered.length,
        averageFillRate,
      },
      satisfaction: {
        average: averageRating,
        change: 0, // Would calculate from previous period
        totalRatings: reviewCount,
      },
    };
  } catch (error) {
    console.error('Error fetching admin KPIs:', error);
    // Return default structure
    return {
      revenue: { current: 0, previous: 0, change: 0, trend: [] },
      activeUsers: { total: 0, newThisMonth: 0, growthRate: 0 },
      activeTrips: { ongoing: 0, upcomingThisMonth: 0, averageFillRate: 0 },
      satisfaction: { average: 0, change: 0, totalRatings: 0 },
    };
  }
}

/**
 * Get revenue and registrations data
 */
export async function getRevenueData(period: 'month' | 'week' | 'year' = 'month'): Promise<RevenueDataPoint[]> {
  try {
    const tripsRef = collection(db, 'trips');
    const usersRef = collection(db, 'users');
    
    const data: RevenueDataPoint[] = [];
    const now = new Date();
    
    // Generate data for last 12 periods
    for (let i = 11; i >= 0; i--) {
      let periodStart: Date;
      let periodLabel: string;

      if (period === 'month') {
        periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        periodLabel = `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, '0')}`;
      } else if (period === 'week') {
        periodStart = new Date(now);
        periodStart.setDate(periodStart.getDate() - (i * 7));
        periodLabel = `${periodStart.getFullYear()}-W${String(Math.ceil((periodStart.getDate() + new Date(periodStart.getFullYear(), 0, 1).getDay()) / 7)).padStart(2, '0')}`;
      } else {
        periodStart = new Date(now.getFullYear() - i, 0, 1);
        periodLabel = String(periodStart.getFullYear());
      }

      const periodEnd = new Date(periodStart);
      if (period === 'month') {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else if (period === 'week') {
        periodEnd.setDate(periodEnd.getDate() + 7);
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }

      // Get revenue for this period - filter in memory to avoid index
      const allTripsSnapshot = await getDocs(tripsRef);
      const trips = allTripsSnapshot.docs.filter((doc) => {
        const data = doc.data() as DocumentData;
        const tripDate = data.date?.toDate ? data.date.toDate() : new Date(data.date);
        return data.status === 'completed' && tripDate >= periodStart && tripDate < periodEnd;
      });

      let revenue = 0;
      trips.forEach((doc) => {
        const trip = doc.data() as DocumentData;
        const price = parseFloat(trip.price?.toString().replace(/[^0-9.]/g, '') || '0');
        const participants = trip.participants?.length || 0;
        revenue += price * participants;
      });

      // Get registrations for this period - filter in memory
      const allUsersSnapshot = await getDocs(usersRef);
      const users = allUsersSnapshot.docs.filter((doc) => {
        const data = doc.data() as DocumentData;
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        return createdAt >= periodStart && createdAt < periodEnd;
      });

      data.push({
        period: periodLabel,
        revenue,
        registrations: users.length,
      });
    }

    return data;
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return [];
  }
}

/**
 * Get trip status distribution
 */
export async function getTripStatusDistribution(): Promise<TripStatusDistribution> {
  try {
    const tripsRef = collection(db, 'trips');
    
    const completed = await getDocs(query(tripsRef, where('status', '==', 'completed')));
    const ongoing = await getDocs(query(tripsRef, where('status', '==', 'ongoing')));
    const upcoming = await getDocs(query(tripsRef, where('status', '==', 'upcoming')));
    const cancelled = await getDocs(query(tripsRef, where('status', '==', 'cancelled')));

    return {
      completed: completed.size,
      ongoing: ongoing.size,
      upcoming: upcoming.size,
      cancelled: cancelled.size,
    };
  } catch (error) {
    console.error('Error fetching trip status distribution:', error);
    return { completed: 0, ongoing: 0, upcoming: 0, cancelled: 0 };
  }
}

/**
 * Get trip satisfaction data
 */
export async function getTripSatisfaction(): Promise<{
  topRated: TripSatisfaction[];
  bottomRated: TripSatisfaction[];
}> {
  try {
    const reviewsRef = collection(db, 'reviews');
    const allReviews = await getDocs(reviewsRef);

    const tripRatings: Map<string, { total: number; sum: number; title: string }> = new Map();

    allReviews.forEach((doc) => {
      const review = doc.data() as DocumentData;
      const tripId = review.tripId;
      if (tripId && review.rating) {
        const existing = tripRatings.get(tripId) || { total: 0, sum: 0, title: review.tripTitle || 'Unknown' };
        existing.total += 1;
        existing.sum += review.rating;
        tripRatings.set(tripId, existing);
      }
    });

    const satisfactions: TripSatisfaction[] = Array.from(tripRatings.entries()).map(([tripId, data]) => ({
      tripId,
      tripTitle: data.title,
      averageRating: data.sum / data.total,
      totalRatings: data.total,
    }));

    const sorted = satisfactions.sort((a, b) => b.averageRating - a.averageRating);

    return {
      topRated: sorted.slice(0, 5),
      bottomRated: sorted.slice(-5).reverse(),
    };
  } catch (error) {
    console.error('Error fetching trip satisfaction:', error);
    return { topRated: [], bottomRated: [] };
  }
}

/**
 * Get user growth data
 */
export async function getUserGrowthData(): Promise<UserGrowthDataPoint[]> {
  try {
    const usersRef = collection(db, 'users');
    const allUsers = await getDocs(query(usersRef, orderBy('createdAt', 'asc')));

    const data: UserGrowthDataPoint[] = [];
    const userMap = new Map<string, number>();

    allUsers.forEach((doc) => {
      const user = doc.data() as DocumentData;
      const createdAt = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
      const dateKey = createdAt.toISOString().split('T')[0];
      userMap.set(dateKey, (userMap.get(dateKey) || 0) + 1);
    });

    let cumulative = 0;
    const sortedDates = Array.from(userMap.keys()).sort();

    sortedDates.forEach((dateKey) => {
      const newUsers = userMap.get(dateKey) || 0;
      cumulative += newUsers;
      data.push({
        date: new Date(dateKey),
        totalUsers: cumulative,
        newUsers,
      });
    });

    return data;
  } catch (error) {
    console.error('Error fetching user growth data:', error);
    return [];
  }
}

/**
 * Get admin alerts
 */
export async function getAdminAlerts(): Promise<AdminAlert[]> {
  try {
    const alerts: AdminAlert[] = [];

    // Check for active SOS alerts - filter in memory to avoid index
    const sosRef = collection(db, 'sosAlerts');
    const allSOSSnapshot = await getDocs(sosRef);
    const activeSOS = allSOSSnapshot.docs.filter((doc) => {
      const data = doc.data() as DocumentData;
      return data.resolved === false;
    });
    activeSOS.forEach((doc) => {
      const sos = doc.data() as DocumentData;
      alerts.push({
        id: doc.id,
        type: 'sos',
        priority: 'critical',
        title: 'Alerte SOS active',
        message: `Alerte SOS déclenchée par un utilisateur`,
        tripId: sos.tripId,
        userId: sos.userId,
        timestamp: sos.timestamp?.toDate ? sos.timestamp.toDate() : new Date(sos.timestamp),
        resolved: false,
      });
    });

    // Check for underbooked trips
    const tripsRef = collection(db, 'trips');
    const upcomingTrips = await getDocs(
      query(tripsRef, where('status', '==', 'upcoming'), where('date', '>=', Timestamp.now()))
    );

    upcomingTrips.forEach((doc) => {
      const trip = doc.data() as DocumentData;
      const maxParticipants = trip.maxParticipants || 0;
      const participants = trip.participants?.length || 0;
      const fillRate = maxParticipants > 0 ? (participants / maxParticipants) * 100 : 0;

      if (fillRate < 30) {
        alerts.push({
          id: `underbooked-${doc.id}`,
          type: 'underbooked',
          priority: fillRate < 10 ? 'high' : 'medium',
          title: 'Sortie sous-remplie',
          message: `${trip.title} n'est remplie qu'à ${fillRate.toFixed(0)}%`,
          tripId: doc.id,
          timestamp: trip.date?.toDate ? trip.date.toDate() : new Date(trip.date),
          resolved: false,
        });
      }
    });

    // Check for negative reviews
    const reviewsRef = collection(db, 'reviews');
    const negativeReviews = await getDocs(
      query(reviewsRef, where('rating', '<=', 2), orderBy('rating', 'asc'), limit(10))
    );

    negativeReviews.forEach((doc) => {
      const review = doc.data() as DocumentData;
      alerts.push({
        id: `review-${doc.id}`,
        type: 'negative_review',
        priority: review.rating === 1 ? 'high' : 'medium',
        title: 'Avis négatif',
        message: `Avis ${review.rating}/5 pour ${review.tripTitle || 'une sortie'}`,
        tripId: review.tripId,
        userId: review.userId,
        timestamp: review.timestamp?.toDate ? review.timestamp.toDate() : new Date(review.timestamp),
        resolved: false,
      });
    });

    // Sort by priority and timestamp
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    alerts.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    return alerts.slice(0, 20); // Limit to 20 most important
  } catch (error) {
    console.error('Error fetching admin alerts:', error);
    return [];
  }
}

/**
 * Get recent activities
 */
export async function getRecentActivities(limitCount: number = 20): Promise<RecentActivity[]> {
  try {
    const activities: RecentActivity[] = [];

    // Get recent registrations - fetch all and sort in memory to avoid index
    const usersRef = collection(db, 'users');
    const allUsersSnapshot = await getDocs(usersRef);
    const recentUsers = allUsersSnapshot.docs
      .sort((a, b) => {
        const aData = a.data() as DocumentData;
        const bData = b.data() as DocumentData;
        const aDate = aData.createdAt?.toDate ? aData.createdAt.toDate() : new Date(aData.createdAt);
        const bDate = bData.createdAt?.toDate ? bData.createdAt.toDate() : new Date(bData.createdAt);
        return bDate.getTime() - aDate.getTime();
      })
      .slice(0, limitCount);

    recentUsers.forEach((doc) => {
      const user = doc.data() as DocumentData;
      activities.push({
        id: `user-${doc.id}`,
        type: 'registration',
        title: 'Nouvelle inscription',
        description: `${user.name || 'Utilisateur'} s'est inscrit`,
        userId: doc.id,
        timestamp: user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt),
      });
    });

    // Get completed trips
    const tripsRef = collection(db, 'trips');
    const completedTrips = await getDocs(
      query(tripsRef, where('status', '==', 'completed'), orderBy('date', 'desc'), limit(limitCount))
    );

    completedTrips.forEach((doc) => {
      const trip = doc.data() as DocumentData;
      activities.push({
        id: `trip-${doc.id}`,
        type: 'trip_completed',
        title: 'Sortie complétée',
        description: `${trip.title || 'Sortie'} a été complétée`,
        tripId: doc.id,
        timestamp: trip.date?.toDate ? trip.date.toDate() : new Date(trip.date),
      });
    });

    // Get recent reviews
    const reviewsRef = collection(db, 'reviews');
    const recentReviews = await getDocs(
      query(reviewsRef, orderBy('timestamp', 'desc'), limit(limitCount))
    );

    recentReviews.forEach((doc) => {
      const review = doc.data() as DocumentData;
      activities.push({
        id: `review-${doc.id}`,
        type: 'review_published',
        title: 'Nouvel avis',
        description: `Avis ${review.rating}/5 publié pour ${review.tripTitle || 'une sortie'}`,
        tripId: review.tripId,
        userId: review.userId,
        timestamp: review.timestamp?.toDate ? review.timestamp.toDate() : new Date(review.timestamp),
      });
    });

    // Sort by timestamp
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return activities.slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
}

/**
 * Get quick stats
 */
export async function getQuickStats(): Promise<QuickStats> {
  try {
    // This would calculate actual metrics
    // For now, return mock structure
    
    const usersRef = collection(db, 'users');
    const tripsRef = collection(db, 'trips');

    const totalUsers = (await getDocs(usersRef)).size;
    const totalTrips = (await getDocs(tripsRef)).size;

    // Simplified calculations
    const conversionRate = totalUsers > 0 ? (totalUsers / (totalUsers * 10)) * 100 : 0; // Mock
    const averageRevenuePerTrip = totalTrips > 0 ? 5000 : 0; // Would calculate from actual revenue
    const retentionRate = 75; // Mock - would calculate from user activity
    const npsScore = 50; // Mock - would calculate from NPS survey

    return {
      conversionRate,
      averageRevenuePerTrip,
      retentionRate,
      npsScore,
    };
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    return {
      conversionRate: 0,
      averageRevenuePerTrip: 0,
      retentionRate: 0,
      npsScore: 0,
    };
  }
}

/**
 * Get upcoming trips for admin table
 */
export async function getUpcomingTripsForAdmin(): Promise<Trip[]> {
  try {
    const tripsRef = collection(db, 'trips');
    const upcomingTrips = await getDocs(
      query(
        tripsRef,
        where('status', '==', 'upcoming'),
        orderBy('date', 'asc'),
        limit(50)
      )
    );

    const trips: (Trip & { guide?: { name: string; phone: string } })[] = [];

    upcomingTrips.forEach((doc) => {
      const data = doc.data() as DocumentData;
      const trip: Trip & { guide?: { name: string; phone: string } } = {
        id: doc.id,
        title: data.title || '',
        date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
        location: data.location || { name: '', coordinates: { lat: 0, lng: 0 } },
        difficulty: data.difficulty || 'intermédiaire',
        maxParticipants: data.maxParticipants || 0,
        participants: data.participants || [],
        status: data.status || 'upcoming',
        price: data.price || 0,
        description: data.description || '',
        images: data.images || [],
        itinerary: data.itinerary || [],
      } as Trip & { guide?: { name: string; phone: string } };
      
      if (data.guide) {
        trip.guide = data.guide;
      }
      
      trips.push(trip);
    });

    return trips;
  } catch (error) {
    console.error('Error fetching upcoming trips:', error);
    return [];
  }
}

