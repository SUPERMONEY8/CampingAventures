/**
 * Explore Page Component
 * 
 * Page for exploring and filtering available trips with advanced search,
 * filters, sorting, and pagination.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Grid3x3,
  List,
  Filter,
  X,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import { useTripsFilter } from '../hooks/useTripsFilter';
import { TripCard } from '../components/trips/TripCard';
import { TripFilters, type TripFilters as TripFiltersType } from '../components/trips/TripFilters';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import type { SortOption } from '../hooks/useTripsFilter';
import type { Trip } from '../types';

/**
 * Popular tags for quick filtering
 */
const popularTags = [
  { label: 'Randonnée', value: 'randonnée' },
  { label: 'Camping', value: 'camping' },
  { label: 'Photo', value: 'photo' },
  { label: 'Aventure', value: 'aventure' },
  { label: 'Nature', value: 'nature' },
];

/**
 * Explore Page Component
 */
export function ExplorePage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TripFiltersType>({
    difficulties: [],
    durations: [],
    onlyAvailable: false,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [bookmarkedTrips, setBookmarkedTrips] = useState<Set<string>>(new Set());

  let tripsResult;
  try {
    tripsResult = useTripsFilter(filters, searchQuery, sortBy);
  } catch (error) {
    console.error('Error in useTripsFilter:', error);
    tripsResult = {
      filteredTrips: [],
      loading: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
      totalCount: 0,
    };
  }

  // Safe access with fallbacks
  const safeFilteredTrips = tripsResult?.filteredTrips || [];
  const safeLoading = tripsResult?.loading ?? false;
  const safeError = tripsResult?.error || null;
  const safeTotalCount = tripsResult?.totalCount || 0;

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
   * Handle register
   */
  const handleRegister = (tripId: string): void => {
    // TODO: Implement registration logic
    console.log('Register to trip:', tripId);
  };

  /**
   * Handle tag click
   */
  const handleTagClick = (tag: string): void => {
    setSearchQuery(tag);
  };

  // Debug: Log to ensure component renders
  console.log('ExplorePage rendering', { safeFilteredTrips: safeFilteredTrips.length, safeLoading, safeError });

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Explorer les Sorties
        </h1>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Input
            type="text"
            placeholder="Rechercher une sortie, une destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
            className="pr-12"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              aria-label="Effacer la recherche"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Popular Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Populaire:
          </span>
          {popularTags.map((tag) => (
            <button
              key={tag.value}
              onClick={() => handleTagClick(tag.label)}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-primary hover:text-white transition-colors"
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters and Results Layout */}
      <div className="flex gap-6">
        {/* Filters Sidebar (Desktop) / Drawer (Mobile) */}
        <TripFilters
          filters={filters}
          onFiltersChange={setFilters}
          isOpen={filtersOpen}
          onClose={() => setFiltersOpen(false)}
        />

        {/* Results Section */}
        <div className="flex-1 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Mobile Filter Button */}
              <Button
                variant="outline"
                size="sm"
                icon={Filter}
                onClick={() => setFiltersOpen(true)}
                className="lg:hidden"
              >
                Filtres
              </Button>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-700 text-primary'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                  aria-label="Vue grille"
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-700 text-primary'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                  aria-label="Vue liste"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="medical-input text-sm"
              >
                <option value="recent">Plus récent</option>
                <option value="price-asc">Prix croissant</option>
                <option value="popularity">Popularité</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold">{safeTotalCount}</span> sortie{safeTotalCount > 1 ? 's' : ''} trouvée{safeTotalCount > 1 ? 's' : ''}
            </div>
          </div>

          {/* Loading State */}
          {safeLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          {/* Error State */}
          {safeError && (
            <div className="medical-card text-center py-12">
              <p className="text-danger-600 dark:text-danger-400">{safeError}</p>
            </div>
          )}

          {/* Results */}
          {!safeLoading && !safeError && (
            <AnimatePresence mode="wait">
              {safeFilteredTrips.length > 0 ? (
                <>
                  <motion.div
                    key={viewMode}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                        : 'space-y-4'
                    }
                  >
                    {safeFilteredTrips.map((trip: Trip) => (
                      <TripCard
                        key={trip.id}
                        trip={trip}
                        mode={viewMode}
                        isBookmarked={bookmarkedTrips.has(trip.id)}
                        onBookmark={handleBookmark}
                        onRegister={handleRegister}
                      />
                    ))}
                  </motion.div>

                  {/* Load More */}
                  {safeFilteredTrips.length < safeTotalCount && (
                    <div className="flex justify-center pt-4">
                      <Button variant="outline" onClick={() => {}}>
                        Charger plus ({safeTotalCount - safeFilteredTrips.length} restantes)
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="medical-card text-center py-16"
                >
                  <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Aucune sortie trouvée
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Essayez de modifier vos filtres ou votre recherche
                  </p>
                  <Button variant="primary" onClick={() => setFilters({ difficulties: [], durations: [], onlyAvailable: false })}>
                    Voir toutes les sorties
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

