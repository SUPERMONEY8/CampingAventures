/**
 * Badge Grid Component
 * 
 * Displays badges in a grid with earned/unearned states and modal details.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock } from 'lucide-react';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import type { Badge as BadgeType, Achievement } from '../../types';

/**
 * BadgeGrid props
 */
interface BadgeGridProps {
  /**
   * All available badges
   */
  badges: BadgeType[];

  /**
   * User achievements
   */
  achievements: Achievement[];

  /**
   * Loading state
   */
  loading?: boolean;
}

/**
 * BadgeGrid Component
 */
export function BadgeGrid({ badges, achievements, loading = false }: BadgeGridProps) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);

  /**
   * Check if badge is earned
   */
  const isEarned = (badgeId: string): boolean => {
    return achievements.some((achievement) => achievement.badgeId === badgeId);
  };

  /**
   * Get achievement date
   */
  const getEarnedDate = (badgeId: string): Date | null => {
    const achievement = achievements.find((a) => a.badgeId === badgeId);
    return achievement?.earnedAt || null;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {badges.map((badge, index) => {
          const earned = isEarned(badge.id);
          const earnedDate = getEarnedDate(badge.id);

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                variant="glassmorphism"
                className={`
                  cursor-pointer
                  hover:scale-105
                  transition-smooth
                  text-center
                  p-4
                  ${earned ? '' : 'opacity-60'}
                `}
                onClick={() => setSelectedBadge(badge)}
              >
                <div className="flex flex-col items-center gap-3">
                  {/* Badge Icon */}
                  <div
                    className={`
                      w-16 h-16
                      rounded-full
                      flex items-center justify-center
                      ${earned ? 'bg-primary/20 text-primary' : 'bg-gray-300 dark:bg-gray-700 text-gray-500'}
                    `}
                  >
                    {earned ? (
                      <Trophy className="w-8 h-8" />
                    ) : (
                      <Lock className="w-8 h-8" />
                    )}
                  </div>

                  {/* Badge Name */}
                  <h3
                    className={`
                      font-semibold text-sm
                      ${earned ? 'text-gray-900 dark:text-white' : 'text-gray-500'}
                    `}
                  >
                    {badge.name}
                  </h3>

                  {/* Earned Date */}
                  {earned && earnedDate && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {earnedDate.toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Badge Details Modal */}
      <Modal
        open={selectedBadge !== null}
        onClose={() => setSelectedBadge(null)}
        title={selectedBadge?.name}
      >
        {selectedBadge && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div
                className={`
                  w-24 h-24
                  rounded-full
                  flex items-center justify-center
                  ${
                    isEarned(selectedBadge.id)
                      ? 'bg-primary/20 text-primary'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500'
                  }
                `}
              >
                {isEarned(selectedBadge.id) ? (
                  <Trophy className="w-12 h-12" />
                ) : (
                  <Lock className="w-12 h-12" />
                )}
              </div>
            </div>

            <p className="text-center text-gray-600 dark:text-gray-400">
              {selectedBadge.description}
            </p>

            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">Condition pour débloquer:</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {typeof selectedBadge.requirement === 'string'
                  ? selectedBadge.requirement
                  : JSON.stringify(selectedBadge.requirement)}
              </p>
            </div>

            {isEarned(selectedBadge.id) && getEarnedDate(selectedBadge.id) && (
              <Badge
                text={`Obtenu le ${getEarnedDate(selectedBadge.id)?.toLocaleDateString('fr-FR')}`}
                variant="success"
              />
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

