/**
 * Date utility functions
 */

import { format, formatDistanceToNow, isAfter, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Format date to French format
 */
export function formatDate(date: Date | string, formatStr = 'dd MMMM yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr, { locale: fr });
}

/**
 * Get relative time (e.g., "dans 3 jours")
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: fr });
}

/**
 * Calculate countdown to date
 */
export function getCountdown(targetDate: Date | string): {
  days: number;
  hours: number;
  minutes: number;
  isPast: boolean;
} {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes, isPast: false };
}

/**
 * Check if date is upcoming
 */
export function isUpcoming(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isAfter(dateObj, new Date());
}

/**
 * Get next 5 days for weather forecast
 */
export function getNext5Days(): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 5; i++) {
    days.push(addDays(new Date(), i));
  }
  return days;
}
