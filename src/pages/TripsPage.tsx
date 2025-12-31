/**
 * Trips Page Component
 * 
 * Displays all available trips for users to browse and register.
 * This replaces the ExplorePage functionality.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Grid, List, Filter } from 'lucide-react';
import { useTripsFilter, type SortOption } from '../hooks/useTripsFilter';
import { TripCard } from '../components/trips/TripCard';
import { TripFilters, type TripFilters as TripFiltersType } from '../components/trips/TripFilters';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';

/**
 * Trips Page Component
 */
export function TripsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy] = useState<SortOption>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TripFiltersType>({
    difficulties: [],
    durations: [],
    onlyAvailable: false,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [bookmarkedTrips, setBookmarkedTrips] = useState<Set<string>>(new Set());

  // Fetch trips
  const tripsResult = useTripsFilter(filters, searchQuery, sortBy);
  const filteredTrips = tripsResult.filteredTrips || [];
  const loading = tripsResult.loading || false;

  /**
   * Handle bookmark toggle
   */
  const handleBookmark = (tripId: string): void => {
    setBookmarkedTrips((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tripId)) {
        newSet.delete(tripId);
      } else {
        newSet.add(tripId);
      }
      return newSet;
    });
  };

  /**
   * Handle register - navigate to trip details
   */
  const handleRegister = (tripId: string): void => {
    // Prevent admin from registering
    if (user?.role === 'admin') {
      alert('Les administrateurs ne peuvent pas s\'inscrire aux sorties.');
      return;
    }
    navigate(`/trips/${tripId}`);
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-6">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Mes sorties
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Découvrez toutes les sorties disponibles
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher une sortie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              icon={Filter}
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="md:hidden"
            >
              Filtres
            </Button>
            <div className="flex gap-2 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                icon={Grid}
                onClick={() => setViewMode('grid')}
              >
                <span className="sr-only">Vue grille</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                icon={List}
                onClick={() => setViewMode('list')}
              >
                <span className="sr-only">Vue liste</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <TripFilters
            filters={filters}
            onFiltersChange={setFilters}
            isOpen={filtersOpen}
            onClose={() => setFiltersOpen(false)}
          />

          {/* Trips Grid/List */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredTrips.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Aucune sortie trouvée
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Essayez de modifier vos filtres ou votre recherche
                </p>
              </Card>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {filteredTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    mode={viewMode}
                    isBookmarked={bookmarkedTrips.has(trip.id)}
                    onBookmark={handleBookmark}
                    onRegister={user?.role !== 'admin' ? handleRegister : undefined}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

