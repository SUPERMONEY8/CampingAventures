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
  phone?: string;
  emergencyContact: EmergencyContact;
  physicalLevel: PhysicalLevel;
  interests: Interest[];
  history: TripHistoryEntry[];
  avatarUrl?: string;
  medicalInfo?: MedicalInfo;
  role?: 'user' | 'admin' | 'ceo' | 'guide';
  createdAt?: Date;
  updatedAt?: Date;
  banned?: boolean;
  bannedUntil?: Date;
  bannedReason?: string;
  bannedAt?: Date;
  active?: boolean;
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
  duration?: number; // Duration in minutes
  location?: {
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  assignedParticipants?: string[]; // User IDs
  status?: 'upcoming' | 'active' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
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
  category: 'clothing' | 'gear' | 'food' | 'safety' | 'hygiene' | 'documents' | 'other';
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
 * Enrollment status
 */
export type EnrollmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

/**
 * Payment method
 */
export type PaymentMethod = 'ccp' | 'baridimob' | 'on-site' | 'pending';

/**
 * Dietary preference
 */
export type DietaryPreference = 'omnivore' | 'végétarien' | 'vegan' | 'sans-gluten';

/**
 * Checklist item for trip preparation
 */
export interface ChecklistItem {
  id: string;
  category: 'clothing' | 'gear' | 'documents' | 'food' | 'hygiene' | 'other';
  name: string;
  checked: boolean;
  quantity?: number;
  notes?: string;
  required: boolean;
}

/**
 * Checklist category with items
 */
export interface ChecklistCategory {
  id: string;
  name: string;
  items: ChecklistItem[];
}

/**
 * Document for trip preparation
 */
export interface TripDocument {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'map';
  url: string;
  downloaded: boolean;
  downloadDate?: Date;
  size?: string;
}

/**
 * Enrollment information for a trip
 */
export interface Enrollment {
  id: string;
  tripId: string;
  userId: string;
  status: EnrollmentStatus;
  enrollmentDate: Date;
  
  // Step 1
  acceptedTerms: boolean;
  
  // Step 2
  dietaryPreference?: DietaryPreference;
  tshirtSize?: string;
  needsTransport?: boolean;
  transportPickupPoint?: string;
  additionalQuestions?: string;
  
  // Step 3
  medicalInfoConfirmed: boolean;
  
  // Step 4
  paymentMethod?: PaymentMethod;
  paymentProofUrl?: string;
  transactionNumber?: string;
  totalAmount: number;
  paidAmount?: number;
  paymentDate?: Date;
  
  // Metadata
  reservationNumber: string;
  createdAt: Date;
  updatedAt: Date;
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
  visible?: boolean; // Whether the trip is visible to users
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
 * SOS Alert
 */
export interface SOSAlert {
  id: string;
  userId: string;
  tripId: string;
  location: {
    lat: number;
    lng: number;
    accuracy?: number;
    timestamp: Date;
  };
  triggeredAt: Date;
  resolvedAt?: Date;
  resolved: boolean;
  notes?: string;
  guideNotified: boolean;
  emergencyContactNotified: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Safety information for a trip
 */
export interface SafetyInfo {
  tripId: string;
  guideContact: {
    name: string;
    phone: string;
    whatsapp?: string;
  };
  emergencyNumbers: {
    police: string;
    protectionCivile: string;
    medical: string;
  };
  meetingPoint: {
    name: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  nearestHospital?: {
    name: string;
    address: string;
    phone: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
}

/**
 * Safety checklist item
 */
export interface SafetyChecklistItem {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  required: boolean;
  category: 'device' | 'preparation' | 'medical' | 'communication';
}

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
    timestamp: Date;
  };
  triggeredAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  notes?: string;
  guideNotified: boolean;
  emergencyContactNotified: boolean;
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
 * Post type in community feed
 */
export type PostType = 'trip_completion' | 'photo' | 'badge_unlock' | 'milestone' | 'reflection' | 'question';

/**
 * Post visibility
 */
export type PostVisibility = 'public' | 'friends' | 'private';

/**
 * Post reaction
 */
export interface PostReaction {
  userId: string;
  userName: string;
  emoji: string;
  timestamp: Date;
}

/**
 * Post comment
 */
export interface PostComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  likes: string[]; // User IDs
  replies?: PostComment[];
  replyToId?: string;
}

/**
 * Community post
 */
export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: PostType;
  visibility: PostVisibility;
  
  // Content
  content?: string;
  photoUrl?: string;
  tripId?: string;
  tripTitle?: string;
  badgeId?: string;
  badgeName?: string;
  badgeIcon?: string;
  milestone?: {
    level: number;
    points: number;
  };
  
  // Stats (for trip completion)
  stats?: {
    distance?: number;
    elevation?: number;
    points?: number;
    activitiesCompleted?: number;
  };
  
  // Location
  location?: {
    name: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  
  // Tags
  taggedUsers?: string[]; // User IDs
  hashtags?: string[];
  
  // Interactions
  likes: string[]; // User IDs
  reactions: PostReaction[];
  comments: PostComment[];
  shares: number;
  bookmarks: string[]; // User IDs
  
  // Metadata
  timestamp: Date;
  editedAt?: Date;
  reported: boolean;
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
 * Personal trip report for a user
 */
export interface PersonalTripReport {
  id: string;
  userId: string;
  tripId: string;
  tripTitle: string;
  tripDate: Date;
  tripDuration: number; // days
  
  // Statistics
  distance: number; // km
  elevation: number; // meters
  activeHours: number; // hours
  activitiesCompleted: number;
  challengesCompleted: number;
  pointsEarned: number;
  badgesEarned: string[]; // Badge IDs
  photosCount: number;
  momentsShared: number;
  roles: string[];
  
  // Activities timeline
  activities: Array<{
    id: string;
    name: string;
    time: Date;
    completed: boolean;
    photoUrl?: string;
    personalNote?: string;
  }>;
  
  // Photos
  photos: Array<{
    id: string;
    url: string;
    thumbnailUrl?: string;
    timestamp: Date;
    caption?: string;
  }>;
  
  // Group info
  participants: Array<{
    userId: string;
    userName: string;
    avatarUrl?: string;
  }>;
  groupPhotos: string[];
  
  // Generated at
  generatedAt: Date;
}

/**
 * Trip report with analytics and feedback (admin)
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
 * Admin dashboard KPIs
 */
export interface AdminKPIs {
  revenue: {
    current: number;
    previous: number;
    change: number; // percentage
    trend: number[]; // last 7 days
  };
  activeUsers: {
    total: number;
    newThisMonth: number;
    growthRate: number; // percentage
  };
  activeTrips: {
    ongoing: number;
    upcomingThisMonth: number;
    averageFillRate: number; // percentage
  };
  satisfaction: {
    average: number;
    change: number; // percentage
    totalRatings: number;
  };
}

/**
 * Revenue and registrations data point
 */
export interface RevenueDataPoint {
  period: string; // "2024-01" or "2024-W01"
  revenue: number;
  registrations: number;
}

/**
 * Trip status distribution
 */
export interface TripStatusDistribution {
  completed: number;
  ongoing: number;
  upcoming: number;
  cancelled: number;
}

/**
 * Trip satisfaction data
 */
export interface TripSatisfaction {
  tripId: string;
  tripTitle: string;
  averageRating: number;
  totalRatings: number;
}

/**
 * User growth data point
 */
export interface UserGrowthDataPoint {
  date: Date;
  totalUsers: number;
  newUsers: number;
  event?: string; // Optional event marker
}

/**
 * Admin alert
 */
export interface AdminAlert {
  id: string;
  type: 'sos' | 'underbooked' | 'negative_review' | 'pending_payment' | 'enrollment' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  tripId?: string;
  userId?: string;
  enrollmentId?: string;
  timestamp: Date;
  resolved: boolean;
}

/**
 * Recent activity
 */
export interface RecentActivity {
  id: string;
  type: 'registration' | 'trip_completed' | 'review_published' | 'payment_received' | 'trip_created' | 'user_joined';
  title: string;
  description: string;
  userId?: string;
  tripId?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Quick stats
 */
export interface QuickStats {
  conversionRate: number; // percentage
  averageRevenuePerTrip: number;
  retentionRate: number; // percentage
  npsScore: number; // -100 to 100
}

/**
 * Notification types
 */
export type NotificationType =
  | 'reminderJ7'
  | 'reminderJ3'
  | 'reminderJ1'
  | 'weatherAlert'
  | 'checklistReminder'
  | 'documentReminder'
  | 'groupMessage'
  | 'guideTip'
  | 'enrollmentConfirmed'
  | 'tripCancelled'
  | 'tripUpdated';

/**
 * Notification priority
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Notification data payload
 */
export interface NotificationData {
  tripId?: string;
  enrollmentId?: string;
  actionUrl?: string;
  [key: string]: unknown;
}

/**
 * Notification document
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: NotificationData;
  priority: NotificationPriority;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  scheduledFor?: Date;
  sent: boolean;
  sentAt?: Date;
}

/**
 * Challenge during a trip
 */
export interface Challenge {
  id: string;
  tripId: string;
  name: string;
  description: string;
  objective: string;
  targetValue: number;
  currentValue: number;
  points: number;
  timeLimit?: number; // Minutes
  startTime?: Date;
  endTime?: Date;
  completed: boolean;
  participants: string[]; // User IDs who completed
}

/**
 * Live trip participant status
 */
export type ParticipantStatus = 'active' | 'paused' | 'offline' | 'sos';

/**
 * Live trip participant
 */
export interface LiveParticipant {
  userId: string;
  userName: string;
  avatarUrl?: string;
  status: ParticipantStatus;
  lastSeen: Date;
  location?: {
    lat: number;
    lng: number;
    timestamp: Date;
    shared: boolean;
  };
}

/**
 * Trip photo
 */
export interface TripPhoto {
  id: string;
  tripId: string;
  userId: string;
  userName: string;
  avatarUrl?: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  timestamp: Date;
  likes: string[]; // User IDs
  comments: TripPhotoComment[];
  location?: {
    lat: number;
    lng: number;
  };
}

/**
 * Trip photo comment
 */
export interface TripPhotoComment {
  id: string;
  userId: string;
  userName: string;
  avatarUrl?: string;
  content: string;
  timestamp: Date;
}

/**
 * Group message during trip
 */
export interface GroupMessage {
  id: string;
  tripId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'photo' | 'location';
  timestamp: Date;
  isGuide: boolean;
  location?: {
    lat: number;
    lng: number;
  };
  photoUrl?: string;
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
