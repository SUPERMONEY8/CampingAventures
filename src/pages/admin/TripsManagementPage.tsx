/**
 * Trips Management Page
 * 
 * Complete interface for admin to manage trips with filters, search, table, and bulk actions.
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Plus,
  Download,
  Bell,
  Eye,
  Edit,
  Copy,
  Trash2,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  deleteTrip,
  duplicateTrip,
  exportTrips,
} from '../../services/admin/tripManagement.service';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import type { Trip, TripStatus } from '../../types';
import { formatDate } from '../../utils/date';

/**
 * Status filter type
 */
type StatusFilter = 'all' | TripStatus;

/**
 * Sort option
 */
type SortOption = 'date' | 'name' | 'participants';

/**
 * Trips Management Page Component
 */
export function TripsManagementPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTrips, setSelectedTrips] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);
  const itemsPerPage = 20;

  /**
   * Fetch all trips
   */
  const { data: trips = [], isLoading, error } = useQuery<Trip[]>({
    queryKey: ['adminTrips'],
    queryFn: async () => {
      const tripsRef = collection(db, 'trips');
      const snapshot = await getDocs(tripsRef);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
          endDate: data.endDate?.toDate ? data.endDate.toDate() : new Date(data.endDate || data.date),
        } as Trip;
      });
    },
  });

  /**
   * Delete trip mutation
   */
  const deleteMutation = useMutation({
    mutationFn: deleteTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTrips'] });
      setDeleteModalOpen(false);
      setTripToDelete(null);
    },
  });

  /**
   * Duplicate trip mutation
   */
  const duplicateMutation = useMutation({
    mutationFn: duplicateTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTrips'] });
    },
  });

  /**
   * Filter and sort trips
   */
  const filteredAndSortedTrips = useMemo(() => {
    let result = [...trips];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((trip) => trip.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (trip) =>
          trip.title.toLowerCase().includes(query) ||
          trip.location.name.toLowerCase().includes(query) ||
          trip.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.date.getTime() - a.date.getTime();
        case 'name':
          return a.title.localeCompare(b.title);
        case 'participants':
          return (b.participants?.length || 0) - (a.participants?.length || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [trips, statusFilter, searchQuery, sortBy]);

  /**
   * Pagination
   */
  const totalPages = Math.ceil(filteredAndSortedTrips.length / itemsPerPage);
  const paginatedTrips = filteredAndSortedTrips.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /**
   * Handle select all
   */
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTrips(new Set(paginatedTrips.map((trip) => trip.id)));
    } else {
      setSelectedTrips(new Set());
    }
  };

  /**
   * Handle select trip
   */
  const handleSelectTrip = (tripId: string, checked: boolean) => {
    const newSelected = new Set(selectedTrips);
    if (checked) {
      newSelected.add(tripId);
    } else {
      newSelected.delete(tripId);
    }
    setSelectedTrips(newSelected);
  };

  /**
   * Handle delete
   */
  const handleDelete = (tripId: string) => {
    setTripToDelete(tripId);
    setDeleteModalOpen(true);
  };

  /**
   * Handle confirm delete
   */
  const handleConfirmDelete = () => {
    if (tripToDelete) {
      deleteMutation.mutate(tripToDelete);
    }
  };

  /**
   * Handle duplicate
   */
  const handleDuplicate = (tripId: string) => {
    duplicateMutation.mutate(tripId);
  };

  /**
   * Handle export
   */
  const handleExport = async () => {
    try {
      const blob = await exportTrips({
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `trips_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting trips:', error);
      alert('Erreur lors de l\'export');
    }
  };

  /**
   * Get status badge variant
   */
  const getStatusBadgeVariant = (status: TripStatus) => {
    switch (status) {
      case 'upcoming':
        return 'info';
      case 'ongoing':
        return 'success';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-6 text-center">
          <p className="text-red-600">Erreur lors du chargement des sorties</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Sorties</h1>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => navigate('/admin/trips/new')}
        >
          Créer une sortie
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Rechercher une sortie..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              icon={Search}
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'upcoming', 'ongoing', 'completed', 'cancelled'] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'outline'}
                size="sm"
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
              >
                {status === 'all'
                  ? 'Toutes'
                  : status === 'upcoming'
                  ? 'À venir'
                  : status === 'ongoing'
                  ? 'En cours'
                  : status === 'completed'
                  ? 'Terminées'
                  : 'Annulées'}
              </Button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="medical-input"
          >
            <option value="date">Trier par: Date</option>
            <option value="name">Trier par: Nom</option>
            <option value="participants">Trier par: Participants</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedTrips.size > 0 && (
          <div className="mt-4 flex items-center gap-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedTrips.size} sortie{selectedTrips.size > 1 ? 's' : ''} sélectionnée{selectedTrips.size > 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={handleExport}
              >
                Exporter
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Bell}
                onClick={() => alert('Fonctionnalité à venir')}
              >
                Envoyer notification
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="w-12 px-4 py-3">
                  <button
                    onClick={() => handleSelectAll(selectedTrips.size !== paginatedTrips.length)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {selectedTrips.size === paginatedTrips.length && paginatedTrips.length > 0 ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Miniature
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nom
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Durée
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Participants
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Prix
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedTrips.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Aucune sortie trouvée
                  </td>
                </tr>
              ) : (
                paginatedTrips.map((trip) => (
                  <tr
                    key={trip.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleSelectTrip(trip.id, !selectedTrips.has(trip.id))}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {selectedTrips.has(trip.id) ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {trip.images && trip.images.length > 0 ? (
                        <img
                          src={trip.images[0]}
                          alt={trip.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">Pas d'image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{trip.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{trip.location.name}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-200">
                      {formatDate(trip.date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-200">
                      {trip.duration || (trip.endDate ? Math.ceil((trip.endDate.getTime() - trip.date.getTime()) / (1000 * 60 * 60 * 24)) : 1)} jour{trip.duration !== 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-200">
                      {trip.participants?.length || 0}/{trip.maxParticipants}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-200">
                      {trip.price ? `${trip.price} DA` : 'Gratuit'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        text={
                          trip.status === 'upcoming'
                            ? 'À venir'
                            : trip.status === 'ongoing'
                            ? 'En cours'
                            : trip.status === 'completed'
                            ? 'Terminée'
                            : 'Annulée'
                        }
                        variant={getStatusBadgeVariant(trip.status)}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/trips/${trip.id}`)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/trips/${trip.id}/edit`)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Éditer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(trip.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Dupliquer"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(trip.id)}
                          className="p-2 text-red-400 hover:text-red-600"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} sur {totalPages} ({filteredAndSortedTrips.length} sortie{filteredAndSortedTrips.length > 1 ? 's' : ''})
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={ChevronLeft}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={ChevronRight}
                iconPosition="right"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setTripToDelete(null);
        }}
        title="Confirmer la suppression"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Êtes-vous sûr de vouloir supprimer cette sortie ? Cette action est irréversible.
        </p>
        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setDeleteModalOpen(false);
              setTripToDelete(null);
            }}
          >
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDelete}
            loading={deleteMutation.isPending}
          >
            Supprimer
          </Button>
        </div>
      </Modal>
    </div>
  );
}

