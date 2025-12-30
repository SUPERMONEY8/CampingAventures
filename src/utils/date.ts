import { format, formatDistance, isAfter, isBefore } from 'date-fns';

/**
 * Format a date to a readable string
 */
export const formatDate = (date: Date | string, formatStr = 'PPP'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr);
};

/**
 * Get the distance between two dates in a human-readable format
 */
export const getDateDistance = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true });
};

/**
 * Check if a date is in the future
 */
export const isFutureDate = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isAfter(dateObj, new Date());
};

/**
 * Check if a date is in the past
 */
export const isPastDate = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isBefore(dateObj, new Date());
};

