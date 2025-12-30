// Type definitions for the camping adventure app

// ============================================================================
// User Types
// ============================================================================

/**
 * Physical fitness level of a user
 */
export type PhysicalLevel = 'débutant' | 'intermédiaire' | 'avancé';

/**
 * User interests for trip matching
 */
export type Interest = 'randonnée' | 'photo' | 'survie' | 'détente' | 'social';

/**
 * Emergency contact information
 */
export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

/**
 * User trip history entry
 */
export interface TripHistoryEntry {
  tripId: string;
  tripTitle: string;
  date: Date;
  role: string;
  pointsEarned: number;
}

/**
 * Complete user profile information
 */
export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  emergencyContact: EmergencyContact;
  physicalLevel: PhysicalLevel;
  interests: Interest[];
  history: TripHistoryEntry[];
  avatarUrl?: string;
  medicalInfo?: MedicalInfo;
}

// ============================================================================
// Trip Types
// ============================================================================

/**
 * Status of a trip
 */
export type TripStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

/**
 * Activity type within a trip
 */
export type ActivityType = 'hiking' | 'camping' | 'cooking' | 'photography' | 'survival' | 'social';

/**
 * Participant information for a trip
 */
export interface TripParticipant {
  userId: string;
  userName: string;
  role: string;
  joinedAt: Date;
}

/**
 * Activity within a trip itinerary
 */
export interface Activity {
  id: string;
  tripId: string;
  name: string;
  time: Date;
  type: ActivityType;
  points: number;
  role: string;
  description?: string;
}

/**
 * Day itinerary entry
 */
export interface DayItinerary {
  day: number;
  date: Date;
  activities: Activity[];
  description?: string;
}

/**
 * Weather forecast entry
 */
export interface WeatherForecast {
  date: Date;
  temperature: {
    min: number;
    max: number;
  };
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
  icon: string;
  advice?: string;
}

/**
 * Equipment checklist item
 */
export interface EquipmentItem {
  id: string;
  name: string;
  category: 'clothing' | 'gear' | 'food' | 'safety' | 'other';
  required: boolean;
  description?: string;
}

/**
 * Review/rating for a trip
 */
export interface TripReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  comment: string;
  date: Date;
  photos?: string[];
}

/**
 * Meeting point information
 */
export interface MeetingPoint {
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  time: string; // HH:mm format
  notes?: string;
}

/**
 * Complete trip information
 */
export interface Trip {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;
  duration?: number; // in days
  location: {
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  difficulty: PhysicalLevel;
  maxParticipants: number;
  participants: TripParticipant[];
  status: TripStatus;
  description?: string;
  longDescription?: string;
  activities?: Activity[];
  itinerary?: DayItinerary[];
  images?: string[];
  price?: number;
  accommodation?: 'tente' | 'cabane' | 'refuge' | 'hôtel' | 'autre';
  meals?: string[];
  included?: string[];
  notIncluded?: string[];
  highlights?: string[];
  meetingPoint?: MeetingPoint;
  equipment?: EquipmentItem[];
  weatherForecast?: WeatherForecast[];
  reviews?: TripReview[];
  averageRating?: number;
  totalReviews?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Gamification Types
// ============================================================================

/**
 * Badge requirement criteria
 */
export interface BadgeRequirement {
  type: 'points' | 'trips' | 'activities' | 'streak' | 'custom';
  value: number;
  description: string;
}

/**
 * Badge that can be earned by users
 */
export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  requirement: BadgeRequirement;
}

/**
 * Achievement record when a user earns a badge
 */
export interface Achievement {
  userId: string;
  badgeId: string;
  earnedAt: Date;
}

/**
 * User progress and statistics
 */
export interface UserProgress {
  userId: string;
  totalPoints: number;
  level: number;
  badges: Achievement[];
  completedTrips: string[];
  currentStreak: number;
  longestStreak: number;
}

/**
 * User statistics and progress summary
 */
export interface UserStats {
  totalPoints: number;
  level: number;
  totalTrips: number;
  completedTrips: number;
  totalDistance: number;
  totalHours: number;
  badgesCount: number;
  currentStreak: number;
  longestStreak: number;
  nextLevelPoints: number;
}

// ============================================================================
// Emergency Types
// ============================================================================

/**
 * Medical information for emergency situations
 */
export interface MedicalInfo {
  bloodType: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
  notes?: string;
}

/**
 * SOS alert sent by a user during a trip
 */
export interface SOSAlert {
  id: string;
  userId: string;
  tripId: string;
  location: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  message?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// ============================================================================
// Content Types
// ============================================================================

/**
 * Message type classification
 */
export type MessageType = 'text' | 'image' | 'system' | 'alert' | 'announcement';

/**
 * Photo uploaded by a user during a trip
 */
export interface Photo {
  id: string;
  userId: string;
  tripId: string;
  url: string;
  caption?: string;
  timestamp: Date;
  location?: {
    lat: number;
    lng: number;
  };
  tags?: string[];
}

/**
 * Message in trip chat or notifications
 */
export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: MessageType;
  tripId?: string;
  replyToId?: string;
  attachments?: string[];
}

// ============================================================================
// Admin Types
// ============================================================================

/**
 * Incident report during a trip
 */
export interface Incident {
  id: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  resolved: boolean;
}

/**
 * Participant satisfaction rating
 */
export interface ParticipantSatisfaction {
  userId: string;
  rating: number; // 1-5
  feedback?: string;
}

/**
 * Trip report with analytics and feedback
 */
export interface TripReport {
  tripId: string;
  participants: {
    total: number;
    completed: number;
    cancelled: number;
  };
  revenue: number;
  satisfaction: {
    average: number;
    totalRatings: number;
    ratings: ParticipantSatisfaction[];
  };
  incidents: Incident[];
  startDate: Date;
  endDate: Date;
  generatedAt: Date;
}

/**
 * Overall platform analytics
 */
export interface Analytics {
  totalUsers: number;
  activeUsers: number; // Users active in last 30 days
  activeTrips: number;
  completedTrips: number;
  revenue: {
    total: number;
    monthly: number;
    yearly: number;
  };
  avgSatisfaction: number;
  totalBadgesEarned: number;
  totalPointsEarned: number;
  period: {
    start: Date;
    end: Date;
  };
}
