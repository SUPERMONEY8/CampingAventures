/**
 * Users Management Page
 * 
 * Admin page for managing all users with filters, search, and actions.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Search,
  Download,
  UserPlus,
  MoreVertical,
  Eye,
  Shield,
  Ban,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  getUsers,
  getUserStatistics,
  updateUserRole,
  banUser,
  unbanUser,
  updateUserStatus,
  deleteUser,
  exportUsersToCSV,
  type UserFilters,
} from '../../services/admin/userManagement.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { formatDate } from '../../utils/date';
import type { User } from '../../types';

/**
 * Role filter type
 */
type RoleFilter = 'all' | 'user' | 'admin' | 'ceo' | 'guide';

/**
 * Status filter type
 */
type StatusFilter = 'all' | 'active' | 'inactive' | 'banned';

/**
 * Sort option
 */
type SortOption = 'name' | 'email' | 'createdAt' | 'points' | 'trips';

/**
 * UsersManagementPage Component
 */
export function UsersManagementPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);

  // Build filters
  const filters: UserFilters = {
    role: roleFilter === 'all' ? undefined : roleFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
    searchQuery: searchQuery.trim() || undefined,
  };

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['adminUsers', filters],
    queryFn: () => getUsers(filters),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['userStatistics'],
    queryFn: getUserStatistics,
  });

  // Sort users
  const sortedUsers = [...users].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'email':
        return (a.email || '').localeCompare(b.email || '');
      case 'points':
        const aPoints = a.history?.reduce((sum, h) => sum + (h.pointsEarned || 0), 0) || 0;
        const bPoints = b.history?.reduce((sum, h) => sum + (h.pointsEarned || 0), 0) || 0;
        return bPoints - aPoints;
      case 'trips':
        return (b.history?.length || 0) - (a.history?.length || 0);
      case 'createdAt':
      default:
        const aDate = a.createdAt?.getTime() || 0;
        const bDate = b.createdAt?.getTime() || 0;
        return bDate - aDate;
    }
  });

  // Mutations
  const banMutation = useMutation({
    mutationFn: ({ userId, reason, duration }: { userId: string; reason: string; duration?: number }) =>
      banUser(userId, { reason, duration }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['userStatistics'] });
      setBanModalOpen(false);
      setTargetUser(null);
    },
  });

  const unbanMutation = useMutation({
    mutationFn: unbanUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['userStatistics'] });
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'user' | 'admin' | 'ceo' | 'guide' }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setRoleModalOpen(false);
      setTargetUser(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, active }: { userId: string; active: boolean }) =>
      updateUserStatus(userId, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['userStatistics'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['userStatistics'] });
      setDeleteModalOpen(false);
      setTargetUser(null);
    },
  });

  /**
   * Handle export CSV
   */
  const handleExportCSV = async (): Promise<void> => {
    try {
      const blob = await exportUsersToCSV(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Erreur lors de l\'export');
      console.error(error);
    }
  };

  /**
   * Toggle user selection
   */
  const toggleSelection = (userId: string): void => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  /**
   * Toggle select all
   */
  const toggleSelectAll = (): void => {
    if (selectedUsers.size === sortedUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(sortedUsers.map((u) => u.id)));
    }
  };

  /**
   * Get user status badge
   */
  const getStatusBadge = (user: User) => {
    if (user.banned) {
      return <Badge text="Banni" variant="danger" />;
    }
    if (!user.active) {
      return <Badge text="Inactif" variant="warning" />;
    }
    return <Badge text="Actif" variant="success" />;
  };

  /**
   * Get role badge
   */
  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
      admin: 'danger',
      ceo: 'danger',
      guide: 'warning',
      user: 'success',
    };
    return <Badge text={role} variant={variants[role] || 'info'} />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez tous les utilisateurs de la plateforme
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={Download} onClick={handleExportCSV}>
            Exporter CSV
          </Button>
          <Button variant="primary" icon={UserPlus}>
            Inviter utilisateur
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Nouveaux ce mois</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.newThisMonth}</p>
              </div>
              <UserPlus className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Actifs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Bannis</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.banned}</p>
              </div>
              <Ban className="w-8 h-8 text-red-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher par nom, email, téléphone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rôle
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                className="medical-input"
              >
                <option value="all">Tous</option>
                <option value="user">Utilisateurs</option>
                <option value="guide">Guides</option>
                <option value="admin">Admins</option>
                <option value="ceo">CEO</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="medical-input"
              >
                <option value="all">Tous</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
                <option value="banned">Bannis</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trier par
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="medical-input"
              >
                <option value="createdAt">Date d'inscription</option>
                <option value="name">Nom</option>
                <option value="email">Email</option>
                <option value="points">Points</option>
                <option value="trips">Sorties</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === sortedUsers.length && sortedUsers.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-primary rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Utilisateur
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Téléphone
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Rôle
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Niveau
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Sorties
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Points
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Inscription
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Chargement...
                  </td>
                </tr>
              ) : sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                sortedUsers.map((user) => {
                  const userPoints = user.history?.reduce((sum, h) => sum + (h.pointsEarned || 0), 0) || 0;
                  const userTrips = user.history?.length || 0;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => toggleSelection(user.id)}
                          className="w-4 h-4 text-primary rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-semibold">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {user.id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {user.phone || '-'}
                      </td>
                      <td className="px-4 py-3">
                        {getRoleBadge(user.role || 'user')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {user.physicalLevel || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {userTrips}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {userPoints}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {user.createdAt ? formatDate(user.createdAt) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(user)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </button>
                          {actionMenuOpen === user.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                              <button
                                onClick={() => {
                                  navigate(`/admin/users/${user.id}`);
                                  setActionMenuOpen(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                              >
                                <Eye className="w-4 h-4" />
                                Voir profil
                              </button>
                              <button
                                onClick={() => {
                                  setTargetUser(user);
                                  setRoleModalOpen(true);
                                  setActionMenuOpen(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                              >
                                <Shield className="w-4 h-4" />
                                Changer rôle
                              </button>
                              {user.banned ? (
                                <button
                                  onClick={() => {
                                    unbanMutation.mutate(user.id);
                                    setActionMenuOpen(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-green-600 dark:text-green-400"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Réactiver
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setTargetUser(user);
                                    setBanModalOpen(true);
                                    setActionMenuOpen(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
                                >
                                  <Ban className="w-4 h-4" />
                                  Bannir
                                </button>
                              )}
                              {user.active ? (
                                <button
                                  onClick={() => {
                                    statusMutation.mutate({ userId: user.id, active: false });
                                    setActionMenuOpen(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-orange-600 dark:text-orange-400"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Désactiver
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    statusMutation.mutate({ userId: user.id, active: true });
                                    setActionMenuOpen(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-green-600 dark:text-green-400"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Activer
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setTargetUser(user);
                                  setDeleteModalOpen(true);
                                  setActionMenuOpen(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                                Supprimer
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Ban Modal */}
      <Modal open={banModalOpen} onClose={() => setBanModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Bannir l'utilisateur
          </h2>
          {targetUser && (
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Vous êtes sur le point de bannir <strong>{targetUser.name}</strong> ({targetUser.email})
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Raison du bannissement *
                </label>
                <textarea
                  id="banReason"
                  rows={4}
                  className="medical-input w-full"
                  placeholder="Expliquez la raison du bannissement..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Durée (optionnel)
                </label>
                <select id="banDuration" className="medical-input w-full">
                  <option value="">Permanent</option>
                  <option value="7">7 jours</option>
                  <option value="30">30 jours</option>
                  <option value="90">90 jours</option>
                  <option value="365">1 an</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setBanModalOpen(false)}>
                  Annuler
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    const reason = (document.getElementById('banReason') as HTMLTextAreaElement).value;
                    const duration = (document.getElementById('banDuration') as HTMLSelectElement).value;
                    if (!reason.trim()) {
                      alert('Veuillez entrer une raison');
                      return;
                    }
                    banMutation.mutate({
                      userId: targetUser.id,
                      reason,
                      duration: duration ? parseInt(duration) : undefined,
                    });
                  }}
                  loading={banMutation.isPending}
                >
                  Bannir
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Supprimer l'utilisateur
          </h2>
          {targetUser && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900 dark:text-red-200">Attention !</p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      Cette action est irréversible. Toutes les données de l'utilisateur seront supprimées définitivement.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Êtes-vous sûr de vouloir supprimer <strong>{targetUser.name}</strong> ({targetUser.email}) ?
              </p>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                  Annuler
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    deleteMutation.mutate(targetUser.id);
                  }}
                  loading={deleteMutation.isPending}
                >
                  Supprimer définitivement
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Role Modal */}
      <Modal open={roleModalOpen} onClose={() => setRoleModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Changer le rôle
          </h2>
          {targetUser && (
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Changer le rôle de <strong>{targetUser.name}</strong>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nouveau rôle *
                </label>
                <select id="newRole" className="medical-input w-full" defaultValue={targetUser.role}>
                  <option value="user">Utilisateur</option>
                  <option value="guide">Guide</option>
                  <option value="admin">Administrateur</option>
                  <option value="ceo">CEO</option>
                </select>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Attention :</strong> Changer le rôle d'un utilisateur peut affecter ses permissions d'accès.
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setRoleModalOpen(false)}>
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    const newRole = (document.getElementById('newRole') as HTMLSelectElement).value as 'user' | 'admin' | 'ceo' | 'guide';
                    roleMutation.mutate({ userId: targetUser.id, role: newRole });
                  }}
                  loading={roleMutation.isPending}
                >
                  Confirmer
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

