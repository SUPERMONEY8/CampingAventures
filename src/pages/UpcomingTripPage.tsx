/**
 * Upcoming Trip Preparation Page
 * 
 * Complete preparation page for an upcoming trip with countdown,
 * checklist, documents, participants, and all preparation information.
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Users,
  Download,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Share2,
  X,
  AlertTriangle,
  FileText,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  Activity,
  BookOpen,
  PlayCircle,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { getTripById } from '../services/trip.service';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Breadcrumb } from '../components/navigation/Breadcrumb';
import { PreparationAssistant } from '../components/trip/PreparationAssistant';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/date';
import type { ChecklistItem, ChecklistCategory, TripDocument } from '../types';

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
 * Checklist categories
 */
const checklistCategories: Omit<ChecklistCategory, 'items'>[] = [
  { id: 'clothing', name: 'Vêtements' },
  { id: 'gear', name: 'Équipement' },
  { id: 'documents', name: 'Documents' },
  { id: 'food', name: 'Nourriture' },
  { id: 'hygiene', name: 'Hygiène' },
  { id: 'other', name: 'Divers' },
];

/**
 * Upcoming Trip Page Component
 */
export function UpcomingTripPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // State
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [documents, setDocuments] = useState<TripDocument[]>([]);

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
    staleTime: 5 * 60 * 1000,
  });

  /**
   * Initialize checklist from trip equipment
   */
  useEffect(() => {
    if (trip?.equipment) {
      const items: ChecklistItem[] = trip.equipment.map((eq) => {
        // Map category: safety -> hygiene for checklist
        let category: ChecklistItem['category'] = 'other';
        if (eq.category === 'clothing') category = 'clothing';
        else if (eq.category === 'gear') category = 'gear';
        else if (eq.category === 'food') category = 'food';
        else if (eq.category === 'safety') category = 'hygiene';
        else if (eq.category === 'other') category = 'other';
        
        return {
          id: eq.id,
          category,
          name: eq.name,
          checked: false,
          quantity: 1,
          notes: eq.description,
          required: eq.required,
        };
      });
      
      // Load saved checklist from localStorage
      const saved = localStorage.getItem(`checklist-${trip.id}`);
      if (saved) {
        try {
          const savedItems = JSON.parse(saved) as ChecklistItem[];
          // Merge with trip equipment
          const merged = items.map((item) => {
            const saved = savedItems.find((s) => s.id === item.id);
            return saved ? { ...item, ...saved } : item;
          });
          setChecklist(merged);
        } catch {
          setChecklist(items);
        }
      } else {
        setChecklist(items);
      }
    }
  }, [trip?.equipment, trip?.id]);

  /**
   * Initialize documents
   */
  useEffect(() => {
    if (trip) {
      const docs: TripDocument[] = [
        {
          id: 'itinerary',
          name: 'Itinéraire détaillé',
          type: 'pdf',
          url: '#',
          downloaded: false,
        },
        {
          id: 'rules',
          name: 'Règlement intérieur',
          type: 'pdf',
          url: '#',
          downloaded: false,
        },
        {
          id: 'safety',
          name: 'Fiche de sécurité',
          type: 'pdf',
          url: '#',
          downloaded: false,
        },
        {
          id: 'map',
          name: 'Carte hors ligne',
          type: 'map',
          url: '#',
          downloaded: false,
        },
      ];
      
      // Load saved documents state
      const saved = localStorage.getItem(`documents-${trip.id}`);
      if (saved) {
        try {
          const savedDocs = JSON.parse(saved) as TripDocument[];
          const merged = docs.map((doc) => {
            const saved = savedDocs.find((s) => s.id === doc.id);
            return saved ? { ...doc, ...saved } : doc;
          });
          setDocuments(merged);
        } catch {
          setDocuments(docs);
        }
      } else {
        setDocuments(docs);
      }
    }
  }, [trip]);

  /**
   * Countdown timer
   */
  useEffect(() => {
    if (!trip?.date) return;

    const updateCountdown = (): void => {
      const now = new Date().getTime();
      const tripDate = trip.date.getTime();
      const difference = tripDate - now;

      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [trip?.date]);

  /**
   * Calculate checklist progress
   */
  const checklistProgress = useMemo(() => {
    if (checklist.length === 0) return 0;
    const checked = checklist.filter((item) => item.checked).length;
    return Math.round((checked / checklist.length) * 100);
  }, [checklist]);

  /**
   * Toggle checklist item
   */
  const toggleChecklistItem = (itemId: string): void => {
    setChecklist((prev) => {
      const updated = prev.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      );
      // Save to localStorage
      if (trip?.id) {
        localStorage.setItem(`checklist-${trip.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  /**
   * Check all items in category
   */
  const checkAllInCategory = (categoryId: string): void => {
    setChecklist((prev) => {
      const updated = prev.map((item) =>
        item.category === categoryId ? { ...item, checked: true } : item
      );
      if (trip?.id) {
        localStorage.setItem(`checklist-${trip.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  /**
   * Handle document download
   */
  const handleDocumentDownload = (doc: TripDocument): void => {
    // TODO: Implement actual download
    setDocuments((prev) => {
      const updated = prev.map((d) =>
        d.id === doc.id
          ? { ...d, downloaded: true, downloadDate: new Date() }
          : d
      );
      if (trip?.id) {
        localStorage.setItem(`documents-${trip.id}`, JSON.stringify(updated));
      }
      return updated;
    });
    alert(`Téléchargement de ${doc.name}... (Fonctionnalité à venir)`);
  };

  /**
   * Handle cancel enrollment
   */
  const cancelEnrollmentMutation = useMutation({
    mutationFn: async () => {
      if (!trip?.id || !user?.id) throw new Error('Missing trip or user ID');
      // Find enrollment ID (simplified - in production, fetch from enrollments collection)
      // For now, we'll need to pass enrollmentId as a prop or fetch it
      throw new Error('Enrollment ID required');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', id] });
      navigate('/dashboard');
    },
  });

  /**
   * Get days until trip
   */
  const daysUntilTrip = useMemo(() => {
    if (!trip?.date) return 0;
    const now = new Date().getTime();
    const tripDate = trip.date.getTime();
    const difference = tripDate - now;
    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  }, [trip?.date]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
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
            {error ? (error as Error).message : 'Cette sortie n\'existe pas.'}
          </p>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Retour au tableau de bord
          </Button>
        </Card>
      </div>
    );
  }

  // Group checklist by category
  const checklistByCategory = useMemo(() => {
    const grouped: Record<string, ChecklistItem[]> = {};
    checklist.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  }, [checklist]);

  // FAQs
  const faqs = [
    {
      question: 'Que faire si je dois annuler ?',
      answer: 'Contactez l\'organisateur au moins 48h avant le départ. Les conditions d\'annulation sont disponibles dans le règlement intérieur.',
    },
    {
      question: 'Puis-je venir avec un ami ?',
      answer: 'Toute inscription doit être faite à l\'avance. Contactez l\'organisateur pour vérifier la disponibilité.',
    },
    {
      question: 'Que faire en cas de retard ?',
      answer: 'Contactez immédiatement le guide. Le groupe partira à l\'heure prévue. En cas de retard, vous devrez rejoindre le groupe à vos frais.',
    },
    {
      question: 'Y a-t-il un point de rendez-vous alternatif ?',
      answer: 'Le point de rendez-vous principal est indiqué ci-dessus. En cas de besoin, contactez le guide pour un point alternatif.',
    },
  ];

  return (
    <div className="min-h-screen pb-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Tableau de bord', href: '/dashboard' },
          { label: trip.title },
        ]}
      />

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[300px] max-h-[500px] overflow-hidden mb-8">
        {trip.images && trip.images[0] ? (
          <img
            src={trip.images[0]}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12 text-white z-10">
          <div className="max-w-7xl mx-auto">
            <Badge
              text={daysUntilTrip > 0 ? `Dans ${daysUntilTrip} jour${daysUntilTrip > 1 ? 's' : ''}` : 'Aujourd\'hui'}
              variant={daysUntilTrip <= 1 ? 'warning' : 'info'}
              className="mb-4"
            />
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">{trip.title}</h1>

            {/* Countdown */}
            <div className="flex items-center gap-6">
              <motion.div
                className="text-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="text-4xl font-bold">{countdown.days}</div>
                <div className="text-sm opacity-80">Jours</div>
              </motion.div>
              <div className="text-2xl opacity-50">:</div>
              <motion.div
                className="text-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-4xl font-bold">{countdown.hours}</div>
                <div className="text-sm opacity-80">Heures</div>
              </motion.div>
              <div className="text-2xl opacity-50">:</div>
              <motion.div
                className="text-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-4xl font-bold">{countdown.minutes}</div>
                <div className="text-sm opacity-80">Minutes</div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 space-y-8">
        {/* Section 1: Essential Information */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Informations Essentielles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trip.meetingPoint && (
              <Card variant="glassmorphism">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Point de rendez-vous
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {trip.meetingPoint.address}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = `https://www.google.com/maps?q=${trip.meetingPoint!.coordinates.lat},${trip.meetingPoint!.coordinates.lng}`;
                        window.open(url, '_blank');
                      }}
                      icon={ExternalLink}
                    >
                      Ouvrir dans Maps
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {trip.meetingPoint?.time && (
              <Card variant="glassmorphism">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Heure de départ
                    </h3>
                    <p className="text-2xl font-bold text-primary">{trip.meetingPoint.time}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Rendez-vous 15 minutes avant
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <Card variant="glassmorphism">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Contact du guide
                  </h3>
                  {trip.participants?.find((p) => p.role === 'guide') ? (
                    <>
                      <p className="text-gray-900 dark:text-white font-medium mb-2">
                        {trip.participants.find((p) => p.role === 'guide')?.userName}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" icon={Phone}>
                          Appeler
                        </Button>
                        <Button variant="outline" size="sm" icon={MessageCircle}>
                          WhatsApp
                        </Button>
                        <Button variant="outline" size="sm" icon={Mail}>
                          Email
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Guide à confirmer
                    </p>
                  )}
                </div>
              </div>
            </Card>

            <Card variant="glassmorphism">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Groupe WhatsApp
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Rejoignez le groupe pour échanger avec les autres participants
                  </p>
                  <Button variant="primary" size="sm" icon={MessageCircle}>
                    Rejoindre le groupe
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Section 2: Weather */}
        {trip.weatherForecast && trip.weatherForecast.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Météo Actualisée
            </h2>
            <Card>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
                {trip.weatherForecast.slice(0, 7).map((forecast, idx) => {
                  const WeatherIcon = weatherIcons[forecast.condition] || Cloud;
                  const isToday = idx === 0;
                  
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg ${
                        isToday
                          ? 'bg-primary/10 border-2 border-primary'
                          : 'bg-gray-50 dark:bg-gray-800'
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        {isToday ? 'Aujourd\'hui' : formatDate(forecast.date)}
                      </p>
                      <WeatherIcon className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="text-lg font-bold text-gray-900 dark:text-white text-center">
                        {forecast.temperature.max}°
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        {forecast.temperature.min}°
                      </p>
                      {forecast.advice && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 text-center">
                          {forecast.advice}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              {(trip.weatherForecast[0]?.condition === 'rainy' ||
                trip.weatherForecast[0]?.condition === 'stormy') && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-400">
                      Alerte météo
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-500">
                      Conditions météorologiques difficiles prévues. Prévoyez des vêtements
                      imperméables et soyez prudent.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </section>
        )}

        {/* Section 3: Checklist */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Ma Checklist de Préparation
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {checklistProgress}% complété
            </div>
          </div>
          <Card>
            <div className="mb-4">
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${checklistProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div className="space-y-4">
              {checklistCategories.map((category) => {
                const items = checklistByCategory[category.id] || [];
                if (items.length === 0) return null;

                const isExpanded = expandedCategory === category.id;

                return (
                  <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                    <button
                      onClick={() =>
                        setExpandedCategory(isExpanded ? null : category.id)
                      }
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {category.name}
                        </span>
                        <Badge
                          text={`${items.filter((i) => i.checked).length}/${items.length}`}
                          variant="info"
                          className="text-xs"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          checkAllInCategory(category.id);
                        }}
                      >
                        Tout cocher
                      </Button>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 space-y-2">
                            {items.map((item) => (
                              <label
                                key={item.id}
                                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <button
                                  type="button"
                                  onClick={() => toggleChecklistItem(item.id)}
                                  className="mt-0.5 flex-shrink-0"
                                >
                                  {item.checked ? (
                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-gray-400" />
                                  )}
                                </button>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`font-medium ${
                                        item.checked
                                          ? 'text-gray-500 line-through'
                                          : 'text-gray-900 dark:text-white'
                                      }`}
                                    >
                                      {item.name}
                                    </span>
                                    {item.required && (
                                      <Badge text="Requis" variant="danger" className="text-xs" />
                                    )}
                                  </div>
                                  {item.notes && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {item.notes}
                                    </p>
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>

        {/* Section 4: Documents */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Documents Importants
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <Card key={doc.id} variant="glassmorphism">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                      {doc.downloaded && (
                        <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Téléchargé
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant={doc.downloaded ? 'outline' : 'primary'}
                    size="sm"
                    icon={doc.downloaded ? CheckCircle2 : Download}
                    onClick={() => handleDocumentDownload(doc)}
                  >
                    {doc.downloaded ? 'Téléchargé' : 'Télécharger'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 5: Participants */}
        {trip.participants && trip.participants.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Participants
            </h2>
            <Card>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {trip.participants.map((participant, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg text-center ${
                      participant.role === 'guide'
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                      <span className="text-primary font-semibold text-lg">
                        {participant.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white mb-1">
                      {participant.userName}
                    </p>
                    {participant.role === 'guide' && (
                      <Badge text="Guide" variant="info" className="text-xs" />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" icon={Users}>
                  Voir tous les profils
                </Button>
                <Button variant="outline" icon={MessageCircle}>
                  Envoyer un message
                </Button>
              </div>
            </Card>
          </section>
        )}

        {/* Section 6: Physical Preparation */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Préparation Physique
          </h2>
          <Card>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Recommandations pour niveau {trip.difficulty}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {trip.difficulty === 'débutant' &&
                    'Pour les débutants, nous recommandons de commencer par des marches régulières de 30 minutes, 3 fois par semaine.'}
                  {trip.difficulty === 'intermédiaire' &&
                    'Pour un niveau intermédiaire, pratiquez des randonnées de 2-3 heures avec dénivelé modéré.'}
                  {trip.difficulty === 'avancé' &&
                    'Pour un niveau avancé, maintenez votre condition avec des randonnées régulières et des exercices de renforcement.'}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" icon={BookOpen}>
                  Articles conseillés
                </Button>
                <Button variant="outline" icon={PlayCircle}>
                  Vidéos d'exercices
                </Button>
                <Button variant="outline" icon={Activity}>
                  Programme d'entraînement
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 7: FAQs */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Questions Fréquentes
          </h2>
          <Card>
            <div className="space-y-2">
              {faqs.map((faq, idx) => {
                const isExpanded = expandedFAQ === idx;
                return (
                  <div
                    key={idx}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFAQ(isExpanded ? null : idx)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span className="font-medium text-gray-900 dark:text-white text-left">
                        {faq.question}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 text-sm text-gray-600 dark:text-gray-400">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>

        {/* Section 8: Assistant IA */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Assistant IA de Préparation
          </h2>
          <PreparationAssistant
            trip={trip}
            weather={trip.weatherForecast}
            open={true}
          />
        </section>

        {/* Section 9: Actions */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Actions</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" icon={Share2} className="flex-1">
              Partager avec un ami
            </Button>
            <Button variant="outline" icon={Mail} className="flex-1">
              Contacter l'organisateur
            </Button>
            <Button
              variant="danger"
              icon={X}
              onClick={() => setCancelModalOpen(true)}
              className="flex-1"
            >
              Annuler mon inscription
            </Button>
          </div>
        </section>
      </div>

      {/* Cancel Enrollment Modal */}
      <Modal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Annuler mon inscription"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Êtes-vous sûr de vouloir annuler votre inscription à cette sortie ?
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cette action est irréversible. Vous perdrez votre place et ne pourrez plus y accéder.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setCancelModalOpen(false)} className="flex-1">
              Non, garder mon inscription
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                cancelEnrollmentMutation.mutate();
              }}
              loading={cancelEnrollmentMutation.isPending}
              className="flex-1"
            >
              Oui, annuler
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

