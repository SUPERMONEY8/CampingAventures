/**
 * Dashboard Page Component
 * 
 * Main user dashboard with stats, next trip, activity timeline, and recommendations.
 */

import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Trophy,
  Coins,
  MapPin,
  Cloud,
  Sun,
  CloudRain,
  Wind,
  CheckCircle2,
  Camera,
  UserPlus,
  Target,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Compass,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTrips } from '../hooks/useTrips';
import { useUserProgress } from '../hooks/useUserProgress';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DashboardSkeleton } from '../components/skeletons/DashboardSkeleton';
import { formatDate, getCountdown, getNext5Days } from '../utils/date';
import type { Trip } from '../types';

/**
 * Weather forecast mock data (in real app, fetch from API)
 */
const mockWeather = [
  { day: 0, icon: Sun, temp: 22, condition: 'Ensoleillé' },
  { day: 1, icon: Cloud, temp: 18, condition: 'Nuageux' },
  { day: 2, icon: CloudRain, temp: 15, condition: 'Pluvieux' },
  { day: 3, icon: Sun, temp: 20, condition: 'Ensoleillé' },
  { day: 4, icon: Wind, temp: 19, condition: 'Venteux' },
];

/**
 * Activity timeline item
 */
interface ActivityItem {
  id: string;
  type: 'badge' | 'photo' | 'registration' | 'challenge';
  title: string;
  description: string;
  icon: typeof CheckCircle2;
  timestamp: Date;
  color: string;
}

/**
 * Dashboard Page Component
 */
export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Use hooks directly - they handle errors internally
  const tripsResult = useTrips(user?.id);
  const progressResult = useUserProgress(user?.id || '');
  
  const upcomingTrips = tripsResult.upcomingTrips || [];
  const tripsLoading = tripsResult.loading || false;
  const progress = progressResult.progress;
  const progressLoading = progressResult.loading || false;

  // Get next trip
  const nextTrip = upcomingTrips.length > 0 ? upcomingTrips[0] : null;
  const countdown = nextTrip ? getCountdown(nextTrip.date) : null;

  // Calculate user level from points
  const userPoints = progress?.totalPoints || 0;
  const userLevel = Math.floor(userPoints / 100) + 1;
  const badgesCount = progress?.badges?.length || 0;

  // Mock activity timeline (in real app, fetch from Firestore)
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'badge',
      title: 'Badge gagné',
      description: 'Vous avez obtenu le badge "Explorateur"',
      icon: Trophy,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      color: 'text-yellow-600',
    },
    {
      id: '2',
      type: 'photo',
      title: 'Photo ajoutée',
      description: 'Vous avez ajouté une photo à votre sortie',
      icon: Camera,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      color: 'text-blue-600',
    },
    {
      id: '3',
      type: 'registration',
      title: 'Nouvelle inscription',
      description: 'Vous vous êtes inscrit à "Randonnée Mont Blanc"',
      icon: UserPlus,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      color: 'text-green-600',
    },
    {
      id: '4',
      type: 'challenge',
      title: 'Challenge complété',
      description: 'Vous avez complété le challenge "10 km"',
      icon: Target,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      color: 'text-purple-600',
    },
  ];

  // Get recommended trips (simple algorithm: match interests + physical level)
  const recommendedTrips: Trip[] = upcomingTrips
    .filter((trip) => {
      if (!user) return false;
      // Simple matching: same physical level or one level below
      const levelMap = { débutant: 1, intermédiaire: 2, avancé: 3 };
      const userLevelNum = levelMap[user.physicalLevel] || 1;
      const tripLevelNum = levelMap[trip.difficulty] || 1;
      return tripLevelNum <= userLevelNum + 1;
    })
    .slice(0, 3);


  const loading = tripsLoading || progressLoading;

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Bonjour {user?.name} 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Voici un aperçu de vos aventures
        </p>
      </motion.div>

      {/* Quick Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Next Trip Card */}
        <Card
          icon={Calendar}
          variant="glassmorphism"
          className="hover:scale-[1.02] transition-smooth"
        >
          <div className="space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">Prochaine sortie</div>
            {nextTrip ? (
              <>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatDate(nextTrip.date, 'dd MMM')}
                </div>
                {countdown && !countdown.isPast && (
                  <div className="text-sm text-primary">
                    Dans {countdown.days}j {countdown.hours}h
                  </div>
                )}
              </>
            ) : (
              <div className="text-lg text-gray-500 dark:text-gray-400">
                Aucune sortie prévue
              </div>
            )}
          </div>
        </Card>

        {/* Points & Level Card */}
        <Card
          icon={Coins}
          variant="glassmorphism"
          className="hover:scale-[1.02] transition-smooth"
        >
          <div className="space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">Points totaux</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {userPoints.toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-semibold">Niveau {userLevel}</span>
            </div>
          </div>
        </Card>

        {/* Badges Card */}
        <Card
          icon={Trophy}
          variant="glassmorphism"
          className="hover:scale-[1.02] transition-smooth"
        >
          <div className="space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">Badges gagnés</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {badgesCount}
            </div>
            <Link
              to="/profile?tab=badges"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              Voir mes badges <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>
      </motion.div>

      {/* Next Trip Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {nextTrip ? (
          <Card variant="glassmorphism" className="overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trip Image & Info */}
              <div className="lg:col-span-2 space-y-4">
                {/* Image Placeholder */}
                <div className="w-full h-48 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <MapPin className="w-16 h-16 text-white/80" />
                </div>

                {/* Trip Details */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {nextTrip.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(nextTrip.date, 'EEEE dd MMMM yyyy')}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {nextTrip.location.name}
                    </div>
                  </div>

                  {/* Weather Forecast */}
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Météo prévue (5 jours)
                    </h3>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {mockWeather.map((weather, index) => {
                        const WeatherIcon = weather.icon;
                        const dayDate = getNext5Days()[index];
                        return (
                          <div
                            key={index}
                            className="flex-shrink-0 w-16 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-center"
                          >
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                              {formatDate(dayDate, 'EEE')}
                            </div>
                            <WeatherIcon className="w-6 h-6 mx-auto mb-1 text-primary" />
                            <div className="text-xs font-semibold">{weather.temp}°C</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preparation Checklist */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Checklist de préparation
                      </h3>
                      <span className="text-sm text-primary font-semibold">60%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '60%' }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      6/10 items complétés
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col gap-3">
                <Button variant="primary" fullWidth icon={ArrowRight}>
                  Voir les détails
                </Button>
                <Button variant="outline" fullWidth>
                  Checklist
                </Button>
                <Button variant="ghost" fullWidth>
                  Partager
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card variant="glassmorphism" className="text-center py-12">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary opacity-50" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucune sortie prévue
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Explorez les sorties disponibles et rejoignez une aventure !
            </p>
            <Link to="/explore">
              <Button variant="primary" icon={Compass}>
                Explorer les sorties
              </Button>
            </Link>
          </Card>
        )}
      </motion.div>

      {/* Activity Timeline Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Activité Récente
          </h2>
          <Link
            to="/activity"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            Voir tout <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-4">
          {activities.slice(0, 5).map((activity, index) => {
            const Icon = activity.icon;
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
              >
                <Card variant="outlined" className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.color} bg-opacity-10 dark:bg-opacity-20 flex-shrink-0`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {activity.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Il y a {Math.floor((Date.now() - activity.timestamp.getTime()) / (1000 * 60 * 60))}h
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Recommendations Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recommandations pour vous
          </h2>
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>

        {recommendedTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              >
                <Card
                  variant="glassmorphism"
                  className="hover:scale-[1.02] transition-smooth cursor-pointer overflow-hidden"
                  onClick={() => (window.location.href = `/trips/${trip.id}`)}
                >
                  {/* Trip Image */}
                  <div className="w-full h-32 bg-gradient-to-br from-primary to-accent rounded-lg mb-4 flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-white/80" />
                  </div>

                  {/* Trip Info */}
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {trip.title}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(trip.date, 'dd MMM yyyy')}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {trip.location.name}
                    </div>
                    <Badge
                      text={trip.difficulty}
                      variant="info"
                      size="sm"
                    />
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {trip.participants.length}/{trip.maxParticipants} participants
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      icon={ArrowRight}
                      onClick={() => navigate(`/trips/${trip.id}`)}
                    >
                      Voir
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card variant="glassmorphism" className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              Aucune recommandation disponible pour le moment
            </p>
          </Card>
        )}
      </motion.div>
    </div>
  );
}

