/**
 * Trip Details Page Component
 * 
 * Complete trip details page with hero section, info cards, description,
 * itinerary, weather, equipment checklist, map, participants, reviews, and CTA.
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Tent,
  UtensilsCrossed,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  X,
  Star,
  CheckCircle2,
  Circle,
  ExternalLink,
  MessageCircle,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
} from 'lucide-react';
import { getTripById } from '../services/trip.service';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Breadcrumb } from '../components/navigation/Breadcrumb';
import { formatDate } from '../utils/date';
import type { TripReview, EquipmentItem, DayItinerary, WeatherForecast } from '../types';

/**
 * Weather icon mapping
 */
const weatherIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  stormy: CloudLightning,
  snowy: Snowflake,
};

/**
 * Trip Details Page Component
 */
export function TripDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string>('');
  const [reviewFilter, setReviewFilter] = useState<number | null>(null);
  const [equipmentChecked, setEquipmentChecked] = useState<Set<string>>(new Set());

  // Refs for smooth scroll
  const sectionsRef = useRef<Record<string, HTMLDivElement>>({});

  /**
   * Fetch trip data
   */
  const { data: trip, isLoading, error } = useQuery({
    queryKey: ['trip', id],
    queryFn: async () => {
      if (!id) throw new Error('Trip ID is required');
      const tripData = await getTripById(id);
      if (!tripData) throw new Error('Trip not found');
      return tripData;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  /**
   * Load equipment checklist from localStorage
   */
  useEffect(() => {
    if (trip?.id) {
      const saved = localStorage.getItem(`trip-equipment-${trip.id}`);
      if (saved) {
        try {
          const checked = JSON.parse(saved) as string[];
          setEquipmentChecked(new Set(checked));
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, [trip?.id]);

  /**
   * Save equipment checklist to localStorage
   */
  const toggleEquipmentItem = (itemId: string): void => {
    const newChecked = new Set(equipmentChecked);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setEquipmentChecked(newChecked);
    if (trip?.id) {
      localStorage.setItem(`trip-equipment-${trip.id}`, JSON.stringify(Array.from(newChecked)));
    }
  };

  /**
   * Handle share
   */
  const handleShare = async (): Promise<void> => {
    if (navigator.share && trip) {
      try {
        await navigator.share({
          title: trip.title,
          text: trip.description || '',
          url: window.location.href,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      setShareModalOpen(true);
    }
  };

  /**
   * Copy link to clipboard
   */
  const copyLink = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Lien copié !');
      setShareModalOpen(false);
    } catch {
      alert('Erreur lors de la copie');
    }
  };


  /**
   * Filter reviews by rating
   */
  const filteredReviews = trip?.reviews?.filter((review) => 
    reviewFilter === null || review.rating === reviewFilter
  ) || [];

  /**
   * Calculate average rating
   */
  const averageRating = trip?.reviews?.length 
    ? trip.reviews.reduce((sum, r) => sum + r.rating, 0) / trip.reviews.length
    : 0;

  /**
   * Get available spots
   */
  const availableSpots = trip 
    ? trip.maxParticipants - (trip.participants?.length || 0)
    : 0;

  /**
   * Get participants to display (max 8)
   */
  const displayedParticipants = trip?.participants?.slice(0, 8) || [];
  const remainingParticipants = trip?.participants?.length 
    ? Math.max(0, trip.participants.length - 8)
    : 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement de la sortie...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center py-12 max-w-md mx-auto">
          <X className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Sortie introuvable
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error ? (error as Error).message : 'Cette sortie n\'existe pas ou a été supprimée.'}
          </p>
          <Button variant="primary" onClick={() => navigate('/explore')}>
            Retour aux sorties
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Explorer', href: '/explore' },
          { label: trip.title },
        ]}
      />

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] max-h-[600px] overflow-hidden">
        {/* Image Carousel */}
        {trip.images && trip.images.length > 0 ? (
          <div className="relative w-full h-full">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={trip.images[currentImageIndex]}
                alt={trip.title}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>

            {/* Navigation arrows */}
            {trip.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => 
                    prev === 0 ? trip.images!.length - 1 : prev - 1
                  )}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                  aria-label="Image précédente"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => 
                    prev === trip.images!.length - 1 ? 0 : prev + 1
                  )}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                  aria-label="Image suivante"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Thumbnails */}
            {trip.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {trip.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex 
                        ? 'border-white scale-110' 
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${trip.title} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
            <Tent className="w-24 h-24 text-primary/50" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12 text-white z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge 
                    text={trip.difficulty} 
                    variant={trip.difficulty === 'débutant' ? 'success' : trip.difficulty === 'intermédiaire' ? 'warning' : 'danger'}
                  />
                  <MapPin className="w-5 h-5" />
                  <span className="text-lg">{trip.location.name}</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-4">{trip.title}</h1>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`p-3 rounded-full transition-colors ${
                    isBookmarked 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
                  }`}
                  aria-label={isBookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                  <Heart className={`w-6 h-6 ${isBookmarked ? 'fill-white' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
                  aria-label="Partager"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        {/* Info Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card variant="glassmorphism" className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(trip.date)}
                </p>
                {trip.endDate && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    au {formatDate(trip.endDate)}
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card variant="glassmorphism" className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Durée</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {trip.duration || 'N/A'} jour{trip.duration && trip.duration > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="glassmorphism" className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Participants</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {trip.participants?.length || 0} / {trip.maxParticipants}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {availableSpots} place{availableSpots > 1 ? 's' : ''} disponible{availableSpots > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="glassmorphism" className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Prix</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {trip.price ? `${trip.price} DA` : 'Gratuit'}
                </p>
              </div>
            </div>
          </Card>

          {trip.accommodation && (
            <Card variant="glassmorphism" className="p-4">
              <div className="flex items-center gap-3">
                <Tent className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Hébergement</p>
                  <p className="font-semibold text-gray-900 dark:text-white capitalize">
                    {trip.accommodation}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {trip.meals && trip.meals.length > 0 && (
            <Card variant="glassmorphism" className="p-4">
              <div className="flex items-center gap-3">
                <UtensilsCrossed className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Repas</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {trip.meals.join(', ')}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {trip.meetingPoint && (
            <>
              <Card variant="glassmorphism" className="p-4">
                <div className="flex items-center gap-3">
                  <Navigation className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Rendez-vous</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {trip.meetingPoint.name}
                    </p>
                  </div>
                </div>
              </Card>

              <Card variant="glassmorphism" className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Heure de départ</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {trip.meetingPoint.time}
                    </p>
                  </div>
                </div>
              </Card>
            </>
          )}
        </section>

        {/* Description Section */}
        {(trip.longDescription || trip.description) && (
          <section 
            ref={(el) => { if (el) sectionsRef.current['description'] = el as HTMLDivElement; }}
            className="mb-12"
          >
            <Card title="Description" className="mb-6">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {trip.longDescription || trip.description}
                </p>
              </div>

              {/* Highlights */}
              {trip.highlights && trip.highlights.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Points forts
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {trip.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Included / Not Included */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-6">
                {trip.included && trip.included.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      ✅ Ce qui est inclus
                    </h4>
                    <ul className="space-y-1">
                      {trip.included.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {trip.notIncluded && trip.notIncluded.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      ❌ Ce qui n'est pas inclus
                    </h4>
                    <ul className="space-y-1">
                      {trip.notIncluded.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          </section>
        )}

        {/* Itinerary Section */}
        {trip.itinerary && trip.itinerary.length > 0 && (
          <section 
            ref={(el) => { if (el) sectionsRef.current['itinerary'] = el as HTMLDivElement; }}
            className="mb-12"
          >
            <Card title="Itinéraire & Programme" className="mb-6">
              <div className="relative">
                {/* Timeline */}
                {trip.itinerary.map((day: DayItinerary, dayIdx: number) => (
                  <div key={dayIdx} className="relative pb-8 last:pb-0">
                    {/* Timeline line */}
                    {dayIdx < trip.itinerary!.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                    )}

                    {/* Day header */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg z-10 relative">
                        {day.day}
                      </div>
                      <div className="flex-1 pt-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                          Jour {day.day} - {formatDate(day.date)}
                        </h3>
                        {day.description && (
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {day.description}
                          </p>
                        )}

                        {/* Activities */}
                        {day.activities && day.activities.length > 0 && (
                          <div className="space-y-3 mt-4">
                            {day.activities.map((activity) => (
                              <div
                                key={activity.id}
                                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                              >
                                <Clock className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {activity.name}
                                  </p>
                                  {activity.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {activity.description}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {new Date(activity.time).toLocaleTimeString('fr-FR', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        )}

        {/* Weather Section */}
        {trip.weatherForecast && trip.weatherForecast.length > 0 && (
          <section 
            ref={(el) => { if (el) sectionsRef.current['weather'] = el as HTMLDivElement; }}
            className="mb-12"
          >
            <Card title="Prévisions Météo" className="mb-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
                {trip.weatherForecast.map((forecast: WeatherForecast, idx: number) => {
                  const WeatherIcon = weatherIcons[forecast.condition] || Cloud;
                  return (
                    <div
                      key={idx}
                      className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        {formatDate(forecast.date)}
                      </p>
                      <WeatherIcon className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {forecast.temperature.max}°
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {forecast.temperature.min}°
                      </p>
                      {forecast.advice && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {forecast.advice}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </section>
        )}

        {/* Equipment Checklist */}
        {trip.equipment && trip.equipment.length > 0 && (
          <section 
            ref={(el) => { if (el) sectionsRef.current['equipment'] = el as HTMLDivElement; }}
            className="mb-12"
          >
            <Card title="Équipement Recommandé" className="mb-6">
              <div className="space-y-4">
                {['clothing', 'gear', 'food', 'safety', 'other'].map((category) => {
                  const categoryItems = trip.equipment!.filter(
                    (item: EquipmentItem) => item.category === category
                  );
                  if (categoryItems.length === 0) return null;

                  const categoryLabels: Record<string, string> = {
                    clothing: 'Vêtements',
                    gear: 'Matériel',
                    food: 'Nourriture',
                    safety: 'Sécurité',
                    other: 'Autre',
                  };

                  return (
                    <div key={category}>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {categoryLabels[category]}
                      </h4>
                      <div className="space-y-2">
                        {categoryItems.map((item: EquipmentItem) => (
                          <label
                            key={item.id}
                            className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <button
                              type="button"
                              onClick={() => toggleEquipmentItem(item.id)}
                              className="mt-0.5 flex-shrink-0"
                            >
                              {equipmentChecked.has(item.id) ? (
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {item.name}
                                {item.required && (
                                  <Badge text="Requis" variant="danger" className="ml-2 text-xs" />
                                )}
                              </p>
                              {item.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </section>
        )}

        {/* Map Section */}
        {trip.location.coordinates && (
          <section 
            ref={(el) => { if (el) sectionsRef.current['map'] = el as HTMLDivElement; }}
            className="mb-12"
          >
            <Card title="Localisation" className="mb-6">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                {/* Placeholder for map - in production, use Google Maps or Mapbox */}
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {trip.location.name}
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${trip.location.coordinates.lat},${trip.location.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      Voir sur Google Maps
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
              {trip.meetingPoint && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white mb-1">
                    Point de rendez-vous
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {trip.meetingPoint.address}
                  </p>
                  {trip.meetingPoint.notes && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      {trip.meetingPoint.notes}
                    </p>
                  )}
                </div>
              )}
            </Card>
          </section>
        )}

        {/* Participants Section */}
        {trip.participants && trip.participants.length > 0 && (
          <section 
            ref={(el) => { if (el) sectionsRef.current['participants'] = el as HTMLDivElement; }}
            className="mb-12"
          >
            <Card title="Participants" className="mb-6">
              <div className="flex items-center gap-4 flex-wrap">
                {displayedParticipants.map((participant, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className={`w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center ${
                      participant.role === 'guide' || participant.role === 'organizer'
                        ? 'ring-2 ring-primary'
                        : ''
                    }`}>
                      {participant.userName.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center max-w-[60px] truncate">
                      {participant.userName}
                    </p>
                    {(participant.role === 'guide' || participant.role === 'organizer') && (
                      <Badge text={participant.role === 'guide' ? 'Guide' : 'Organisateur'} variant="info" className="text-xs" />
                    )}
                  </div>
                ))}
                {remainingParticipants > 0 && (
                  <button
                    onClick={() => setParticipantsModalOpen(true)}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        +{remainingParticipants}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Voir tout</p>
                  </button>
                )}
              </div>
            </Card>
          </section>
        )}

        {/* Reviews Section */}
        {trip.reviews && trip.reviews.length > 0 && (
          <section 
            ref={(el) => { if (el) sectionsRef.current['reviews'] = el as HTMLDivElement; }}
            className="mb-12"
          >
            <Card title="Avis & Notes" className="mb-6">
              {/* Rating Summary */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">
                    {averageRating.toFixed(1)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(averageRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {trip.reviews.length} avis
                  </p>
                </div>

                {/* Rating Filter */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Filtrer:</span>
                    <button
                      onClick={() => setReviewFilter(null)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        reviewFilter === null
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Tous
                    </button>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setReviewFilter(reviewFilter === rating ? null : rating)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          reviewFilter === rating
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {rating} ⭐
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-6">
                {filteredReviews.map((review: TripReview) => (
                  <div key={review.id} className="pb-6 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        {review.userAvatar ? (
                          <img src={review.userAvatar} alt={review.userName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-primary font-semibold">
                            {review.userName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {review.userName}
                          </p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-500">
                            {formatDate(review.date)}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                          {review.comment}
                        </p>
                        {review.photos && review.photos.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {review.photos.map((photo, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setLightboxImage(photo);
                                  setLightboxOpen(true);
                                }}
                                className="w-20 h-20 rounded-lg overflow-hidden"
                              >
                                <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        )}
      </div>

      {/* CTA Section - Sticky on mobile */}
      <div className="fixed bottom-0 left-0 right-0 lg:relative lg:sticky lg:bottom-auto bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 lg:p-6 z-40 shadow-lg lg:shadow-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {trip.price ? `${trip.price} DA` : 'Gratuit'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {availableSpots > 0 
                ? `${availableSpots} place${availableSpots > 1 ? 's' : ''} disponible${availableSpots > 1 ? 's' : ''}`
                : 'Complet'
              }
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => {
                // TODO: Open question modal
                alert('Fonctionnalité à venir');
              }}
              className="flex-1 sm:flex-none"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Poser une question
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                // TODO: Implement registration
                alert('Fonctionnalité d\'inscription à venir');
              }}
              disabled={availableSpots === 0}
              className="flex-1 sm:flex-none"
            >
              S'inscrire maintenant
            </Button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <Modal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Partager cette sortie"
      >
        <div className="space-y-4">
          <Button variant="outline" onClick={copyLink} className="w-full">
            Copier le lien
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              Facebook
            </Button>
            <Button variant="outline" className="flex-1">
              Twitter
            </Button>
            <Button variant="outline" className="flex-1">
              WhatsApp
            </Button>
          </div>
        </div>
      </Modal>

      {/* Participants Modal */}
      <Modal
        open={participantsModalOpen}
        onClose={() => setParticipantsModalOpen(false)}
        title="Tous les participants"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {trip.participants?.map((participant, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className={`w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center ${
                participant.role === 'guide' || participant.role === 'organizer'
                  ? 'ring-2 ring-primary'
                  : ''
              }`}>
                {participant.userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {participant.userName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Inscrit le {formatDate(participant.joinedAt)}
                </p>
              </div>
              {(participant.role === 'guide' || participant.role === 'organizer') && (
                <Badge 
                  text={participant.role === 'guide' ? 'Guide' : 'Organisateur'} 
                  variant="info" 
                />
              )}
            </div>
          ))}
        </div>
      </Modal>

      {/* Lightbox Modal */}
      <Modal
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        showCloseButton={true}
      >
        <div className="relative">
          <img
            src={lightboxImage}
            alt="Trip image"
            className="max-w-full max-h-[80vh] mx-auto rounded-lg"
          />
        </div>
      </Modal>
    </div>
  );
}

