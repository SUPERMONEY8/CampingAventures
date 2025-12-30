/**
 * Badges Database
 * 
 * Complete list of all available badges with their requirements and metadata.
 */

import type { Badge } from '../types';

/**
 * All available badges
 */
export const badges: Badge[] = [
  {
    id: 'explorer',
    name: 'Explorateur',
    icon: '🎒',
    description: 'Complétez votre première sortie',
    requirement: {
      type: 'trips',
      value: 1,
      description: 'Compléter 1 sortie',
    },
  },
  {
    id: 'climber',
    name: 'Grimpeur',
    icon: '🏔️',
    description: 'Complétez 5 sorties',
    requirement: {
      type: 'trips',
      value: 5,
      description: 'Compléter 5 sorties',
    },
  },
  {
    id: 'photographer',
    name: 'Photographe',
    icon: '📸',
    description: 'Partagez 50 photos',
    requirement: {
      type: 'custom',
      value: 50,
      description: 'Partager 50 photos',
    },
  },
  {
    id: 'survivor',
    name: 'Survivant',
    icon: '🔥',
    description: 'Réussissez un challenge de survie',
    requirement: {
      type: 'custom',
      value: 1,
      description: 'Réussir un challenge de survie',
    },
  },
  {
    id: 'leader',
    name: 'Leader',
    icon: '👑',
    description: 'Soyez responsable de 10 activités',
    requirement: {
      type: 'activities',
      value: 10,
      description: 'Être responsable de 10 activités',
    },
  },
  {
    id: 'veteran',
    name: 'Vétéran',
    icon: '🌟',
    description: 'Membre depuis 1 an',
    requirement: {
      type: 'custom',
      value: 365,
      description: 'Membre depuis 365 jours',
    },
  },
  {
    id: 'globetrotter',
    name: 'Globe-trotter',
    icon: '🌍',
    description: 'Visitez 10 destinations différentes',
    requirement: {
      type: 'custom',
      value: 10,
      description: 'Visiter 10 destinations différentes',
    },
  },
  {
    id: 'social',
    name: 'Social',
    icon: '🤝',
    description: '100 interactions avec le groupe',
    requirement: {
      type: 'custom',
      value: 100,
      description: '100 interactions (messages, likes, commentaires)',
    },
  },
  {
    id: 'lightning',
    name: 'Éclair',
    icon: '⚡',
    description: 'Complétez un challenge sous le temps imparti',
    requirement: {
      type: 'custom',
      value: 1,
      description: 'Compléter un challenge avant la limite de temps',
    },
  },
  {
    id: 'perfectionist',
    name: 'Perfectionniste',
    icon: '🎯',
    description: 'Complétez tous les challenges d\'une sortie',
    requirement: {
      type: 'custom',
      value: 1,
      description: 'Compléter tous les challenges d\'une sortie',
    },
  },
  {
    id: 'early-bird',
    name: 'Lève-tôt',
    icon: '🌅',
    description: 'Participez à 5 activités matinales',
    requirement: {
      type: 'activities',
      value: 5,
      description: 'Participer à 5 activités avant 8h',
    },
  },
  {
    id: 'night-owl',
    name: 'Oiseau de nuit',
    icon: '🦉',
    description: 'Participez à 5 activités nocturnes',
    requirement: {
      type: 'activities',
      value: 5,
      description: 'Participer à 5 activités après 20h',
    },
  },
  {
    id: 'helper',
    name: 'Aidant',
    icon: '💪',
    description: 'Aidez 5 co-participants',
    requirement: {
      type: 'custom',
      value: 5,
      description: 'Aider 5 co-participants',
    },
  },
  {
    id: 'eco-warrior',
    name: 'Éco-guerrier',
    icon: '🌱',
    description: 'Respectez l\'environnement lors de 10 sorties',
    requirement: {
      type: 'custom',
      value: 10,
      description: 'Respecter l\'environnement lors de 10 sorties',
    },
  },
];

/**
 * Get badge by ID
 */
export function getBadgeById(badgeId: string): Badge | undefined {
  return badges.find((badge) => badge.id === badgeId);
}

/**
 * Get all badges
 */
export function getAllBadges(): Badge[] {
  return badges;
}

/**
 * Get badges by category (for filtering)
 */
export function getBadgesByCategory(category: 'trips' | 'activities' | 'social' | 'challenges'): Badge[] {
  return badges.filter((badge) => {
    if (category === 'trips') {
      return badge.requirement.type === 'trips';
    }
    if (category === 'activities') {
      return badge.requirement.type === 'activities';
    }
    if (category === 'challenges') {
      return badge.id === 'survivor' || badge.id === 'lightning' || badge.id === 'perfectionist';
    }
    if (category === 'social') {
      return badge.id === 'social' || badge.id === 'helper';
    }
    return false;
  });
}

