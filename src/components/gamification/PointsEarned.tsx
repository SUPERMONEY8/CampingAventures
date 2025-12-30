/**
 * Points Earned Toast Component
 * 
 * Animated toast notification when user earns points.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target } from 'lucide-react';

/**
 * PointsEarned props
 */
interface PointsEarnedProps {
  /**
   * Points earned
   */
  points: number;

  /**
   * Whether toast is visible
   */
  visible: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Auto dismiss duration (ms)
   */
  autoDismiss?: number;

  /**
   * Play sound
   */
  playSound?: boolean;
}

/**
 * PointsEarned Component
 */
export function PointsEarned({
  points,
  visible,
  onClose,
  autoDismiss = 3000,
  playSound = false,
}: PointsEarnedProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  // Auto dismiss
  useEffect(() => {
    if (visible) {
      setShowConfetti(true);
      
      // Play sound if enabled
      if (playSound) {
        // Simple beep sound (can be replaced with actual audio file)
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      }

      const timer = setTimeout(() => {
        setShowConfetti(false);
        setTimeout(onClose, 300); // Wait for animation
      }, autoDismiss);

      return () => clearTimeout(timer);
    }
  }, [visible, autoDismiss, onClose, playSound]);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Confetti Effect */}
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-[9999]">
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][i % 5],
                  }}
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 1,
                    scale: 1,
                  }}
                  animate={{
                    x: (Math.random() - 0.5) * 400,
                    y: (Math.random() - 0.5) * 400,
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: Math.random() * 0.3,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>
          )}

          {/* Toast */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
            }}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[9998] pointer-events-none"
          >
            <div className="bg-gradient-to-r from-primary to-accent text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[200px]">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <Target className="w-6 h-6" />
              </motion.div>
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring' }}
                  className="text-2xl font-bold"
                >
                  +{points} points
                </motion.div>
                <div className="text-sm opacity-90">🎯</div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

