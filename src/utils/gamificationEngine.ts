/**
 * Gamification Engine
 * 
 * Rules engine for calculating points, checking badge unlocks,
 * and managing gamification logic.
 */

import { badges } from '../data/badges';
import type { Badge, UserProgress } from '../types';

/**
 * Action types that can earn points
 */
export type PointsAction =
  | 'activity_completed'
  | 'challenge_completed'
  | 'photo_shared'
  | 'help_provided'
  | 'eco_action'
  | 'message_sent'
  | 'early_activity'
  | 'night_activity'
  | 'perfect_challenge';

/**
 * Context for point calculation
 */
export interface PointsContext {
  action: PointsAction;
  tripId?: string;
  activityId?: string;
  challengeId?: string;
  difficulty?: 'débutant' | 'intermédiaire' | 'avancé';
  timeBonus?: boolean;
  quality?: number; // 0-1 quality score
  [key: string]: unknown;
}

/**
 * Point values for each action
 */
const POINT_VALUES: Record<PointsAction, number> = {
  activity_completed: 10,
  challenge_completed: 50, // Base, can be modified by difficulty
  photo_shared: 5,
  help_provided: 15,
  eco_action: 10,
  message_sent: 1,
  early_activity: 5, // Bonus for early morning
  night_activity: 5, // Bonus for night
  perfect_challenge: 25, // Bonus for perfect completion
};

/**
 * Difficulty multipliers for challenges
 */
const DIFFICULTY_MULTIPLIERS: Record<string, number> = {
  débutant: 1.0,
  intermédiaire: 1.5,
  avancé: 2.0,
};

/**
 * Calculate points earned for an action
 * 
 * @param context - Action context
 * @returns Points earned
 */
export function calculatePoints(context: PointsContext): number {
  const basePoints = POINT_VALUES[context.action] || 0;

  // Apply difficulty multiplier for challenges
  if (context.action === 'challenge_completed' && context.difficulty) {
    const multiplier = DIFFICULTY_MULTIPLIERS[context.difficulty] || 1.0;
    return Math.round(basePoints * multiplier);
  }

  // Time bonus
  if (context.timeBonus) {
    return basePoints + 5;
  }

  // Quality bonus
  if (context.quality && context.quality > 0.8) {
    return Math.round(basePoints * 1.2);
  }

  return basePoints;
}

/**
 * Check if a badge should be unlocked
 * 
 * @param userId - User ID
 * @param userProgress - Current user progress
 * @param action - Action that was just performed
 * @param context - Action context
 * @returns Badge if unlocked, null otherwise
 */
export function checkBadgeUnlock(
  _userId: string,
  userProgress: UserProgress,
  action: PointsAction,
  context: PointsContext
): Badge | null {
  // Check each badge requirement
  for (const badge of badges) {
    // Skip if already earned
    const alreadyEarned = userProgress.badges.some((achievement) => achievement.badgeId === badge.id);
    if (alreadyEarned) {
      continue;
    }

    // Check if requirement is met
    if (checkBadgeRequirement(badge, userProgress, action, context)) {
      return badge;
    }
  }

  return null;
}

/**
 * Check if a badge requirement is met
 */
function checkBadgeRequirement(
  badge: Badge,
  userProgress: UserProgress,
  action: PointsAction,
  context: PointsContext
): boolean {
  const requirement = badge.requirement;

  switch (requirement.type) {
    case 'points':
      return userProgress.totalPoints >= requirement.value;

    case 'trips':
      return userProgress.completedTrips.length >= requirement.value;

    case 'activities':
      // This would need to be tracked separately
      // For now, we estimate based on points
      const estimatedActivities = Math.floor(userProgress.totalPoints / 10);
      return estimatedActivities >= requirement.value;

    case 'streak':
      return userProgress.currentStreak >= requirement.value;

    case 'custom':
      // Custom requirements need specific logic
      return checkCustomRequirement(badge.id, userProgress, action, context);

    default:
      return false;
  }
}

/**
 * Check custom badge requirements
 */
function checkCustomRequirement(
  badgeId: string,
  userProgress: UserProgress,
  action: PointsAction,
  context: PointsContext
): boolean {
  switch (badgeId) {
    case 'photographer':
      // Would need to track photos separately
      // For now, estimate: 1 photo = 5 points
      const estimatedPhotos = Math.floor((userProgress.totalPoints % 1000) / 5);
      return estimatedPhotos >= 50;

    case 'survivor':
      return action === 'challenge_completed' && Boolean(context.challengeId?.includes('survie'));

    case 'lightning':
      return action === 'perfect_challenge' && Boolean(context.timeBonus);

    case 'perfectionist':
      // Would need to track challenges per trip
      return action === 'perfect_challenge';

    case 'veteran':
      // Would need to track membership date
      // For now, estimate based on trips
      return userProgress.completedTrips.length >= 20;

    case 'globetrotter':
      // Would need to track unique locations
      // For now, estimate based on trips
      return userProgress.completedTrips.length >= 10;

    case 'social':
      // Would need to track interactions
      // For now, estimate: 1 message = 1 point
      const estimatedInteractions = userProgress.totalPoints % 100;
      return estimatedInteractions >= 100;

    case 'helper':
      return action === 'help_provided';

    case 'eco-warrior':
      return action === 'eco_action';

    case 'early-bird':
      return action === 'early_activity';

    case 'night-owl':
      return action === 'night_activity';

    default:
      return false;
  }
}

/**
 * Get next badge to unlock
 * 
 * @param userProgress - Current user progress
 * @returns Next badge to unlock or null
 */
export function getNextBadge(userProgress: UserProgress): Badge | null {
  const earnedBadgeIds = userProgress.badges.map((achievement) => achievement.badgeId);

  // Find the closest badge to unlock
  let closestBadge: Badge | null = null;
  let closestProgress = 1; // 0-1 ratio

  for (const badge of badges) {
    if (earnedBadgeIds.includes(badge.id)) {
      continue;
    }

    const progress = getBadgeProgress(badge, userProgress);
    if (progress < closestProgress && progress < 1) {
      closestProgress = progress;
      closestBadge = badge;
    }
  }

  return closestBadge;
}

/**
 * Get progress towards a badge (0-1)
 */
function getBadgeProgress(badge: Badge, userProgress: UserProgress): number {
  const requirement = badge.requirement;

  switch (requirement.type) {
    case 'points':
      return Math.min(userProgress.totalPoints / requirement.value, 1);

    case 'trips':
      return Math.min(userProgress.completedTrips.length / requirement.value, 1);

    case 'activities':
      const estimatedActivities = Math.floor(userProgress.totalPoints / 10);
      return Math.min(estimatedActivities / requirement.value, 1);

    case 'streak':
      return Math.min(userProgress.currentStreak / requirement.value, 1);

    case 'custom':
      // Custom progress calculation
      return calculateCustomProgress(badge.id, userProgress);

    default:
      return 0;
  }
}

/**
 * Calculate custom badge progress
 */
function calculateCustomProgress(badgeId: string, userProgress: UserProgress): number {
  switch (badgeId) {
    case 'photographer':
      const estimatedPhotos = Math.floor((userProgress.totalPoints % 1000) / 5);
      return Math.min(estimatedPhotos / 50, 1);

    case 'veteran':
      return Math.min(userProgress.completedTrips.length / 20, 1);

    case 'globetrotter':
      return Math.min(userProgress.completedTrips.length / 10, 1);

    case 'social':
      const estimatedInteractions = userProgress.totalPoints % 100;
      return Math.min(estimatedInteractions / 100, 1);

    default:
      return 0;
  }
}

/**
 * Get user level from total points
 * 
 * @param totalPoints - Total points
 * @returns Level number
 */
export function calculateLevel(totalPoints: number): number {
  // Level formula: level = floor(sqrt(points / 100)) + 1
  return Math.floor(Math.sqrt(totalPoints / 100)) + 1;
}

/**
 * Get points needed for next level
 * 
 * @param currentLevel - Current level
 * @returns Points needed for next level
 */
export function getPointsForNextLevel(currentLevel: number): number {
  // Points for level N = (N-1)^2 * 100
  return currentLevel * currentLevel * 100;
}

/**
 * Get points progress to next level
 * 
 * @param totalPoints - Current total points
 * @returns Progress (0-1)
 */
export function getLevelProgress(totalPoints: number): number {
  const currentLevel = calculateLevel(totalPoints);
  const pointsForCurrentLevel = (currentLevel - 1) * (currentLevel - 1) * 100;
  const pointsForNextLevel = currentLevel * currentLevel * 100;
  const pointsInCurrentLevel = totalPoints - pointsForCurrentLevel;
  const pointsNeeded = pointsForNextLevel - pointsForCurrentLevel;

  return Math.min(pointsInCurrentLevel / pointsNeeded, 1);
}

