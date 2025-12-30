/**
 * Trip Filters Component
 * 
 * Sidebar/drawer component for filtering trips with all filter options.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Filter,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { PhysicalLevel } from '../../types';

/**
 * Filter state interface
 */
export interface TripFilters {
  dateFrom?: Date;
  dateTo?: Date;
  difficulties: PhysicalLevel[];
  location?: string;
  priceMin?: number;
  priceMax?: number;
  durations: string[];
  onlyAvailable: boolean;
}

/**
 * TripFilters props
 */
interface TripFiltersProps {
  /**
   * Current filter values
   */
  filters: TripFilters;

  /**
   * Filter change handler
   */
  onFiltersChange: (filters: TripFilters) => void;

  /**
   * Is open (for mobile drawer)
   */
  isOpen?: boolean;

  /**
   * Close handler (for mobile drawer)
   */
  onClose?: () => void;
}

/**
 * TripFilters Component
 */
export function TripFilters({
  filters,
  onFiltersChange,
  isOpen = true,
  onClose,
}: TripFiltersProps) {
  const [localFilters, setLocalFilters] = useState<TripFilters>(filters);

  /**
   * Update local filter
   */
  const updateFilter = (key: keyof TripFilters, value: unknown): void => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * Toggle difficulty
   */
  const toggleDifficulty = (difficulty: PhysicalLevel): void => {
    const difficulties = localFilters.difficulties.includes(difficulty)
      ? localFilters.difficulties.filter((d) => d !== difficulty)
      : [...localFilters.difficulties, difficulty];
    updateFilter('difficulties', difficulties);
  };

  /**
   * Toggle duration
   */
  const toggleDuration = (duration: string): void => {
    const durations = localFilters.durations.includes(duration)
      ? localFilters.durations.filter((d) => d !== duration)
      : [...localFilters.durations, duration];
    updateFilter('durations', durations);
  };

  /**
   * Apply filters
   */
  const handleApply = (): void => {
    onFiltersChange(localFilters);
    onClose?.();
  };

  /**
   * Reset filters
   */
  const handleReset = (): void => {
    const resetFilters: TripFilters = {
      difficulties: [],
      durations: [],
      onlyAvailable: false,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const difficultyOptions: Array<{ value: PhysicalLevel; label: string; color: string }> = [
    { value: 'débutant', label: 'Débutant', color: 'bg-green-500' },
    { value: 'intermédiaire', label: 'Intermédiaire', color: 'bg-yellow-500' },
    { value: 'avancé', label: 'Avancé', color: 'bg-red-500' },
  ];

  const durationOptions = [
    { value: '1', label: '1 jour' },
    { value: '2-3', label: '2-3 jours' },
    { value: 'semaine', label: 'Semaine' },
  ];

  const algeriaRegions = [
    'Tout l\'Algérie',
    'Alger',
    'Oran',
    'Constantine',
    'Annaba',
    'Tlemcen',
    'Béjaïa',
    'Sétif',
    'Blida',
    'Batna',
    'Djelfa',
  ];

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtres
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            aria-label="Fermer les filtres"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Date Range */}
      <div>
        <label className="medical-label mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Date
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            value={localFilters.dateFrom ? localFilters.dateFrom.toISOString().split('T')[0] : ''}
            onChange={(e) => updateFilter('dateFrom', e.target.value ? new Date(e.target.value) : undefined)}
          />
          <Input
            type="date"
            value={localFilters.dateTo ? localFilters.dateTo.toISOString().split('T')[0] : ''}
            onChange={(e) => updateFilter('dateTo', e.target.value ? new Date(e.target.value) : undefined)}
          />
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <label className="medical-label mb-2">Difficulté</label>
        <div className="space-y-2">
          {difficultyOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg"
            >
              <input
                type="checkbox"
                checked={localFilters.difficulties.includes(option.value)}
                onChange={() => toggleDifficulty(option.value)}
                className="w-4 h-4 text-primary rounded focus:ring-primary"
              />
              <div className={`w-3 h-3 rounded-full ${option.color}`} />
              <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="medical-label mb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Localisation
        </label>
        <select
          value={localFilters.location || ''}
          onChange={(e) => updateFilter('location', e.target.value || undefined)}
          className="medical-input"
        >
          {algeriaRegions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="medical-label mb-2 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Prix (DA)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={localFilters.priceMin || ''}
            onChange={(e) => updateFilter('priceMin', e.target.value ? Number(e.target.value) : undefined)}
          />
          <Input
            type="number"
            placeholder="Max"
            value={localFilters.priceMax || ''}
            onChange={(e) => updateFilter('priceMax', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="medical-label mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Durée
        </label>
        <div className="space-y-2">
          {durationOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg"
            >
              <input
                type="checkbox"
                checked={localFilters.durations.includes(option.value)}
                onChange={() => toggleDuration(option.value)}
                className="w-4 h-4 text-primary rounded focus:ring-primary"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Only Available */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={localFilters.onlyAvailable}
            onChange={(e) => updateFilter('onlyAvailable', e.target.checked)}
            className="w-4 h-4 text-primary rounded focus:ring-primary"
          />
          <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Seulement les sorties disponibles
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="primary" fullWidth onClick={handleApply}>
          Appliquer
        </Button>
        <Button variant="outline" fullWidth onClick={handleReset}>
          Réinitialiser
        </Button>
      </div>
    </div>
  );

  // Mobile drawer
  if (onClose) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 z-50 lg:hidden overflow-y-auto p-4 shadow-xl"
            >
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop sidebar
  return (
    <div className="hidden lg:block w-64 flex-shrink-0">
      <div className="medical-card sticky top-4">{content}</div>
    </div>
  );
}

