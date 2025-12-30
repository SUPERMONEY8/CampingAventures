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
 * Format relative time (e.g., "il y a 2 heures", "il y a 3 jours")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'À l\'instant';
  } else if (diffMin < 60) {
    return `Il y a ${diffMin} minute${diffMin > 1 ? 's' : ''}`;
  } else if (diffHour < 24) {
    return `Il y a ${diffHour} heure${diffHour > 1 ? 's' : ''}`;
  } else if (diffDay < 7) {
    return `Il y a ${diffDay} jour${diffDay > 1 ? 's' : ''}`;
  } else {
    return formatDate(dateObj, 'dd MMM yyyy');
  }
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

/**
 * Format time (HH:mm)
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'HH:mm', { locale: fr });
}
