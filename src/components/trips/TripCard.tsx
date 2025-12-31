/**
 * Trip Card Component
 * 
 * Displays a trip card in grid or list mode with all trip information.
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Star,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../utils/date';
import type { Trip } from '../../types';

/**
 * TripCard props
 */
interface TripCardProps {
  /**
   * Trip data
   */
  trip: Trip;

  /**
   * Display mode: grid or list
   */
  mode?: 'grid' | 'list';

  /**
   * Is bookmarked
   */
  isBookmarked?: boolean;

  /**
   * On bookmark toggle
   */
  onBookmark?: (tripId: string) => void;

  /**
   * On register click
   */
  onRegister?: (tripId: string) => void;
}

/**
 * Get difficulty badge variant
 */
function getDifficultyVariant(difficulty: string): 'success' | 'warning' | 'danger' | 'info' {
  switch (difficulty) {
    case 'débutant':
      return 'success';
    case 'intermédiaire':
      return 'warning';
    case 'avancé':
      return 'danger';
    default:
      return 'info';
  }
}

/**
 * TripCard Component
 */
export function TripCard({
  trip,
  mode = 'grid',
  isBookmarked = false,
  onBookmark,
  onRegister,
}: TripCardProps) {
  const difficultyVariant = getDifficultyVariant(trip.difficulty);
  const placesLeft = trip.maxParticipants - trip.participants.length;
  const isFull = placesLeft === 0;

  // Mock rating (in real app, fetch from Firestore)
  const rating = 4.5;
  const price = 1500; // Mock price

  if (mode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card variant="glassmorphism" className="overflow-hidden">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Image */}
            <div className="md:w-64 flex-shrink-0">
              <div className="w-full h-48 md:h-full bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <MapPin className="w-16 h-16 text-white/80" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge text={trip.difficulty} variant={difficultyVariant} size="sm" />
                      {isFull && <Badge text="Complet" variant="danger" size="sm" />}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {trip.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {trip.location.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(trip.date, 'dd MMM yyyy')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        3 jours
                      </div>
                    </div>
                    {trip.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                        {trip.description}
                      </p>
                    )}
                  </div>
                  {onBookmark && (
                    <button
                      onClick={() => onBookmark(trip.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      aria-label={isBookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-5 h-5 text-primary" />
                      ) : (
                        <Bookmark className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {rating} ({Math.floor(Math.random() * 50) + 10} avis)
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-2xl font-bold text-primary">{price} DA</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400"> /personne</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    {placesLeft} places restantes
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/trips/${trip.id}`}>
                    <Button variant="outline" size="sm">
                      Détails
                    </Button>
                  </Link>
                  {!isFull && onRegister && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onRegister(trip.id)}
                    >
                      S'inscrire
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Grid mode
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card
        variant="glassmorphism"
        className="overflow-hidden h-full flex flex-col hover:scale-[1.02] transition-smooth cursor-pointer"
      >
        {/* Image Header */}
        <div className="relative w-full h-48 bg-gradient-to-br from-primary to-accent">
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="w-16 h-16 text-white/80" />
          </div>
          <div className="absolute top-3 left-3">
            <Badge text={trip.difficulty} variant={difficultyVariant} size="sm" />
          </div>
          {onBookmark && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark(trip.id);
              }}
              className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
              aria-label={isBookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-5 h-5 text-primary" />
              ) : (
                <Bookmark className="w-5 h-5 text-gray-400" />
              )}
            </button>
          )}
          {isFull && (
            <div className="absolute bottom-3 right-3">
              <Badge text="Complet" variant="danger" size="sm" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {trip.title}
          </h3>

          <div className="space-y-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {trip.location.name}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(trip.date, 'dd MMM yyyy')}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              3 jours
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= Math.round(rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {rating} ({Math.floor(Math.random() * 50) + 10})
            </span>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xl font-bold text-primary">{price} DA</span>
                <span className="text-xs text-gray-500 dark:text-gray-400"> /personne</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <Users className="w-3 h-3" />
                {placesLeft} places
              </div>
            </div>
            <div className="flex gap-2">
              <Link to={`/trips/${trip.id}`} className="flex-1">
                <Button variant="outline" size="sm" fullWidth icon={ArrowRight}>
                  Détails
                </Button>
              </Link>
              {!isFull && onRegister && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onRegister(trip.id)}
                  className="flex-1"
                  disabled={false} // Will be checked in parent component
                >
                  S'inscrire
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

