/**
 * Challenge Card Component
 * 
 * Card displaying a challenge with progress, timer, and actions.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, CheckCircle2, Lock, XCircle, Play } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { Challenge } from '../../types';

/**
 * Challenge state
 */
type ChallengeState = 'active' | 'completed' | 'failed' | 'locked';

/**
 * ChallengeCard props
 */
interface ChallengeCardProps {
  /**
   * Challenge data
   */
  challenge: Challenge;

  /**
   * Current state
   */
  state?: ChallengeState;

  /**
   * On start handler
   */
  onStart?: () => void;

  /**
   * On complete handler
   */
  onComplete?: () => void;

  /**
   * On claim handler
   */
  onClaim?: () => void;
}

/**
 * ChallengeCard Component
 */
export function ChallengeCard({
  challenge,
  state = 'active',
  onStart,
  onComplete,
  onClaim,
}: ChallengeCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Calculate time remaining
  useEffect(() => {
    if (challenge.timeLimit && challenge.startTime && !challenge.completed) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const start = challenge.startTime!.getTime();
        const elapsed = (now - start) / 1000 / 60; // minutes
        const remaining = challenge.timeLimit! - elapsed;
        setTimeRemaining(Math.max(0, remaining));

        if (remaining <= 0) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [challenge.timeLimit, challenge.startTime, challenge.completed]);

  const progress = (challenge.currentValue / challenge.targetValue) * 100;
  const isCompleted = challenge.completed || state === 'completed';
  const isFailed = state === 'failed';
  const isLocked = state === 'locked';

  return (
    <Card
      className={`${
        isCompleted
          ? 'border-green-500 bg-green-500/10'
          : isFailed
          ? 'border-red-500 bg-red-500/10'
          : isLocked
          ? 'opacity-60'
          : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
              isCompleted
                ? 'bg-green-500/20'
                : isFailed
                ? 'bg-red-500/20'
                : isLocked
                ? 'bg-gray-500/20'
                : 'bg-primary/20'
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : isFailed ? (
              <XCircle className="w-6 h-6 text-red-500" />
            ) : isLocked ? (
              <Lock className="w-6 h-6 text-gray-500" />
            ) : (
              <Trophy className="w-6 h-6 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {challenge.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {challenge.description}
            </p>
          </div>
        </div>
        <Badge text={`+${challenge.points} pts`} variant="info" />
      </div>

      {/* Objective */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">{challenge.objective}</span>
          <span className="text-gray-600 dark:text-gray-400 font-semibold">
            {challenge.currentValue} / {challenge.targetValue}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div
            className={`h-2 rounded-full ${
              isCompleted
                ? 'bg-green-500'
                : isFailed
                ? 'bg-red-500'
                : 'bg-primary'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Timer */}
      {challenge.timeLimit && timeRemaining !== null && !isCompleted && !isLocked && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <Clock className="w-4 h-4" />
          <span>
            {timeRemaining > 0
              ? `${Math.floor(timeRemaining)} min restantes`
              : 'Temps écoulé'}
          </span>
        </div>
      )}

      {/* Status Messages */}
      {isCompleted && (
        <div className="flex items-center gap-2 text-green-500 text-sm mb-3">
          <CheckCircle2 className="w-4 h-4" />
          <span>Challenge complété !</span>
        </div>
      )}

      {isFailed && (
        <div className="flex items-center gap-2 text-red-500 text-sm mb-3">
          <XCircle className="w-4 h-4" />
          <span>Challenge échoué</span>
        </div>
      )}

      {isLocked && (
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
          <Lock className="w-4 h-4" />
          <span>Challenge verrouillé</span>
        </div>
      )}

      {/* Actions */}
      {!isLocked && (
        <div className="flex gap-2">
          {!isCompleted && !isFailed && !challenge.startTime && onStart && (
            <Button
              variant="primary"
              size="sm"
              icon={Play}
              onClick={onStart}
              className="flex-1"
            >
              Commencer
            </Button>
          )}
          {!isCompleted && !isFailed && challenge.startTime && onComplete && (
            <Button
              variant="primary"
              size="sm"
              onClick={onComplete}
              className="flex-1"
            >
              Terminer
            </Button>
          )}
          {isCompleted && onClaim && (
            <Button
              variant="primary"
              size="sm"
              onClick={onClaim}
              className="flex-1"
            >
              Récupérer les points
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

