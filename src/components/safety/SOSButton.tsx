/**
 * SOS Button Component
 * 
 * Floating SOS button with long press activation to prevent false triggers.
 * Always visible, with countdown and vibration feedback.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

/**
 * SOSButton props
 */
interface SOSButtonProps {
  /**
   * On SOS triggered
   */
  onTrigger: () => void;

  /**
   * Whether button is disabled
   */
  disabled?: boolean;
}

/**
 * SOSButton Component
 */
export function SOSButton({ onTrigger, disabled = false }: SOSButtonProps) {
  const [isPressing, setIsPressing] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);
  const countdownTimerRef = useRef<number | null>(null);
  const vibrationRef = useRef<number | null>(null);

  /**
   * Start vibration pattern
   */
  const startVibration = (): void => {
    if ('vibrate' in navigator) {
      // Vibrate pattern: vibrate for 200ms, pause 100ms, repeat
      const pattern = [200, 100, 200, 100, 200];
      vibrationRef.current = window.setInterval(() => {
        navigator.vibrate(pattern);
      }, 600);
    }
  };

  /**
   * Stop vibration
   */
  const stopVibration = (): void => {
    if (vibrationRef.current !== null) {
      clearInterval(vibrationRef.current);
      vibrationRef.current = null;
    }
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }
  };

  /**
   * Handle press start
   */
  const handlePressStart = (): void => {
    if (disabled) return;

    setIsPressing(true);
    setCountdown(3);
    setShowCountdown(true);
    startVibration();

    // Start countdown
    countdownTimerRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Trigger SOS
          stopVibration();
          onTrigger();
          setIsPressing(false);
          setShowCountdown(false);
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
          }
          return 3;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /**
   * Handle press end
   */
  const handlePressEnd = (): void => {
    if (disabled) return;

    setIsPressing(false);
    setShowCountdown(false);
    setCountdown(3);
    stopVibration();

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  };

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      stopVibration();
    };
  }, []);

  return (
    <>
      {/* Countdown Overlay */}
      <AnimatePresence>
        {showCountdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="text-9xl font-bold text-red-500 mb-4"
              >
                {countdown}
              </motion.div>
              <p className="text-white text-xl">Relâchez pour annuler</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SOS Button */}
      <motion.button
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        disabled={disabled}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-2xl z-[9998] flex items-center justify-center ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        animate={{
          scale: isPressing ? 1.1 : 1,
          boxShadow: isPressing
            ? '0 0 0 0 rgba(220, 38, 38, 0.7)'
            : '0 10px 25px rgba(220, 38, 38, 0.5)',
        }}
        transition={{
          scale: { duration: 0.2 },
          boxShadow: {
            duration: 0.5,
            repeat: isPressing ? Infinity : 0,
            repeatType: 'reverse',
          },
        }}
        aria-label="SOS - Appuyez longuement pour déclencher"
      >
        <AlertTriangle className="w-8 h-8 text-white" />
      </motion.button>
    </>
  );
}

