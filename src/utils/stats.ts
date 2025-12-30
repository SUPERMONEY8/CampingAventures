/**
 * Statistics utility functions
 * 
 * Provides helper functions for calculating user statistics,
 * levels, distances, and other metrics.
 */

import type { Trip, Activity } from '../types';

/**
 * Calculate user level based on total points
 * 
 * Level formula: level = floor(points / 100) + 1
 * 
 * @param points - Total points earned by the user
 * @returns User level (minimum 1)
 * 
 * @example
 * ```ts
 * const level = calculateLevel(250); // Returns 3
 * ```
 */
export function calculateLevel(points: number): number {
  return Math.floor(points / 100) + 1;
}

/**
 * Calculate total distance from trips
 * 
 * Sums up the distance from all trips. If trips don't have
 * a distance property, returns 0.
 * 
 * @param trips - Array of trip objects
 * @returns Total distance in kilometers
 * 
 * @example
 * ```ts
 * const distance = calculateDistance(trips); // Returns 125.5
 * ```
 */
export function calculateDistance(trips: Trip[]): number {
  return trips.reduce((total, trip) => {
    // Assuming trips have a distance property
    // If not, you might need to calculate from activities or locations
    const tripDistance = (trip as Trip & { distance?: number }).distance || 0;
    return total + tripDistance;
  }, 0);
}

/**
 * Calculate total hours from activities
 * 
 * Sums up the duration of all activities. If activities don't have
 * a duration property, estimates from activity times.
 * 
 * @param activities - Array of activity objects
 * @returns Total hours spent on activities
 * 
 * @example
 * ```ts
 * const hours = calculateHours(activities); // Returns 48.5
 * ```
 */
export function calculateHours(activities: Activity[]): number {
  if (activities.length === 0) return 0;

  // Sort activities by time
  const sortedActivities = [...activities].sort(
    (a, b) => a.time.getTime() - b.time.getTime()
  );

  // Estimate hours based on activity count and time span
  if (sortedActivities.length === 1) {
    return 1; // Minimum 1 hour per activity
  }

  const firstActivity = sortedActivities[0];
  const lastActivity = sortedActivities[sortedActivities.length - 1];
  const timeSpan = lastActivity.time.getTime() - firstActivity.time.getTime();
  const hoursSpan = timeSpan / (1000 * 60 * 60);

  // Return the span or minimum 1 hour per activity
  return Math.max(hoursSpan, sortedActivities.length);
}

/**
 * Get points required for next level
 * 
 * Calculates how many points are needed to reach the next level
 * from the current level.
 * 
 * @param currentLevel - Current user level
 * @returns Points needed to reach next level
 * 
 * @example
 * ```ts
 * const nextLevelPoints = getNextLevelPoints(3); // Returns 100 (for level 4)
 * ```
 */
export function getNextLevelPoints(_currentLevel: number): number {
  // Each level requires 100 points
  // Level 1: 0-99 points
  // Level 2: 100-199 points
  // Level 3: 200-299 points
  // etc.
  return 100;
}

/**
 * Calculate points needed to reach a specific level
 * 
 * @param targetLevel - Target level to reach
 * @returns Total points needed to reach that level
 * 
 * @example
 * ```ts
 * const pointsNeeded = getPointsForLevel(5); // Returns 400
 * ```
 */
export function getPointsForLevel(targetLevel: number): number {
  return (targetLevel - 1) * 100;
}

/**
 * Calculate progress percentage to next level
 * 
 * @param currentPoints - Current user points
 * @param currentLevel - Current user level
 * @returns Progress percentage (0-100)
 * 
 * @example
 * ```ts
 * const progress = getLevelProgress(150, 2); // Returns 50 (50% to level 3)
 * ```
 */
export function getLevelProgress(currentPoints: number, currentLevel: number): number {
  const pointsForCurrentLevel = getPointsForLevel(currentLevel);
  const pointsInCurrentLevel = currentPoints - pointsForCurrentLevel;
  const pointsNeededForNextLevel = getNextLevelPoints(currentLevel);
  
  return Math.min(100, Math.max(0, (pointsInCurrentLevel / pointsNeededForNextLevel) * 100));
}

