/**
 * Badge Unlocked Modal Component
 * 
 * Celebration modal when a user unlocks a new badge.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { Badge } from '../../types';

/**
 * BadgeUnlocked props
 */
interface BadgeUnlockedProps {
  /**
   * Badge that was unlocked
   */
  badge: Badge | null;

  /**
   * Whether modal is open
   */
  open: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Share handler
   */
  onShare?: () => void;
}

/**
 * BadgeUnlocked Component
 */
export function BadgeUnlocked({ badge, open, onClose, onShare }: BadgeUnlockedProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (open && badge) {
      setShowAnimation(true);
      // Reset animation after completion
      const timer = setTimeout(() => setShowAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [open, badge]);

  if (!badge) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="text-center py-6 max-w-md mx-auto">
        {/* Celebration Animation */}
        <AnimatePresence>
          {showAnimation && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2"
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 1,
                    scale: 0,
                  }}
                  animate={{
                    x: (Math.random() - 0.5) * 300,
                    y: (Math.random() - 0.5) * 300,
                    opacity: 0,
                    scale: 1,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: Math.random() * 0.5,
                    ease: 'easeOut',
                  }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Badge Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
          }}
          className="text-8xl mb-4"
        >
          {badge.icon}
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
        >
          Badge Débloqué !
        </motion.h2>

        {/* Badge Name */}
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-semibold text-primary mb-2"
        >
          {badge.name}
        </motion.h3>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 dark:text-gray-400 mb-6"
        >
          {badge.description}
        </motion.p>

        {/* Requirement */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-6"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Objectif :</span> {badge.requirement.description}
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-3 justify-center"
        >
          {onShare && (
            <Button
              variant="outline"
              icon={Share2}
              onClick={() => {
                onShare();
                onClose();
              }}
            >
              Partager
            </Button>
          )}
          <Button
            variant="primary"
            onClick={onClose}
            className="flex-1"
          >
            Génial !
          </Button>
        </motion.div>
      </div>
    </Modal>
  );
}

