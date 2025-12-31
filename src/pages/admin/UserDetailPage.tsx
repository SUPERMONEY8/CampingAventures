/**
 * User Detail Page
 * 
 * Admin page for viewing detailed user information with multiple tabs.
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  User,
  Calendar,
  Activity,
  CreditCard,
  Trophy,
  MessageSquare,
  Edit,
  Save,
  Clock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { getUserDetails, updateAdminNotes } from '../../services/admin/userManagement.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/navigation/Tabs';
import { formatDate, formatRelativeTime } from '../../utils/date';

/**
 * Tab type
 */
type TabType = 'info' | 'trips' | 'activity' | 'payments' | 'gamification' | 'support';

/**
 * UserDetailPage Component
 */
export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [editingNotes, setEditingNotes] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch user details
  const { data: userDetail, isLoading } = useQuery({
    queryKey: ['userDetail', id],
    queryFn: () => {
      if (!id) throw new Error('User ID is required');
      return getUserDetails(id);
    },
    enabled: !!id,
  });

  // Update admin notes mutation
  const notesMutation = useMutation({
    mutationFn: (notes: string) => {
      if (!id) throw new Error('User ID is required');
      return updateAdminNotes(id, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userDetail', id] });
      setEditingNotes(false);
    },
  });


  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">Chargement...</p>
      </div>
    );
  }

  if (!userDetail) {
    return (
      <div className="p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">Utilisateur introuvable</p>
      </div>
    );
  }

  const userPoints = userDetail.history?.reduce((sum, h) => sum + (h.pointsEarned || 0), 0) || 0;
  const userLevel = Math.floor(userPoints / 100) + 1;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/admin/users')}>
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{userDetail.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{userDetail.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge text={userDetail.role || 'user'} variant={userDetail.role === 'admin' ? 'danger' : 'info'} />
          {userDetail.banned ? (
            <Badge text="Banni" variant="danger" />
          ) : userDetail.active ? (
            <Badge text="Actif" variant="success" />
          ) : (
            <Badge text="Inactif" variant="warning" />
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sorties</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {userDetail.totalTrips}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-primary" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Points</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{userPoints}</p>
            </div>
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Niveau</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{userLevel}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total dépensé</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {userDetail.totalSpent} DA
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'info', label: 'Informations', icon: User },
          { id: 'trips', label: 'Historique Sorties', icon: Calendar },
          { id: 'activity', label: 'Activité', icon: Activity },
          { id: 'payments', label: 'Paiements', icon: CreditCard },
          { id: 'gamification', label: 'Gamification', icon: Trophy },
          { id: 'support', label: 'Support', icon: MessageSquare },
        ]}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as TabType)}
      />

      {/* Tab Content */}
      <div>
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Personal Information */}
            <Card title="Informations personnelles">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom complet
                  </label>
                  <p className="text-gray-900 dark:text-white">{userDetail.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-white">{userDetail.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Téléphone
                  </label>
                  <p className="text-gray-900 dark:text-white">{userDetail.phone || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Âge
                  </label>
                  <p className="text-gray-900 dark:text-white">{userDetail.age || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Niveau physique
                  </label>
                  <p className="text-gray-900 dark:text-white">{userDetail.physicalLevel || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date d'inscription
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {userDetail.createdAt ? formatDate(userDetail.createdAt) : '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Dernière connexion
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {userDetail.lastLogin ? formatRelativeTime(userDetail.lastLogin) : 'Jamais'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre de connexions
                  </label>
                  <p className="text-gray-900 dark:text-white">{userDetail.loginCount || 0}</p>
                </div>
              </div>
            </Card>

            {/* Medical Information */}
            {userDetail.medicalInfo && (
              <Card title="Informations médicales (Accès sécurisé)">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Groupe sanguin
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {userDetail.medicalInfo.bloodType || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Allergies
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {userDetail.medicalInfo.allergies?.join(', ') || 'Aucune'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Conditions médicales
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {userDetail.medicalInfo.conditions?.join(', ') || 'Aucune'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Médicaments
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {userDetail.medicalInfo.medications?.join(', ') || 'Aucun'}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Emergency Contact */}
            {userDetail.emergencyContact && (
              <Card title="Contact d'urgence">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nom
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {userDetail.emergencyContact.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Téléphone
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {userDetail.emergencyContact.phone}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Relation
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {userDetail.emergencyContact.relationship}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Admin Notes */}
            <Card
              title="Notes admin (privées)"
              actions={
                editingNotes ? (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Save}
                    onClick={() => {
                      notesMutation.mutate(adminNotes);
                    }}
                    loading={notesMutation.isPending}
                  >
                    Enregistrer
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit}
                    onClick={() => {
                      setAdminNotes(userDetail.adminNotes || '');
                      setEditingNotes(true);
                    }}
                  >
                    Éditer
                  </Button>
                )
              }
            >
              {editingNotes ? (
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={5}
                  className="medical-input w-full"
                  placeholder="Ajoutez des notes privées sur cet utilisateur..."
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {userDetail.adminNotes || 'Aucune note'}
                </p>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'trips' && (
          <Card title="Historique des sorties">
            <div className="space-y-4">
              {userDetail.history && userDetail.history.length > 0 ? (
                userDetail.history.map((entry) => (
                  <div
                    key={entry.tripId}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {entry.tripTitle}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(entry.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Trophy className="w-4 h-4" />
                            {entry.pointsEarned} points
                          </span>
                          <Badge text={entry.role} variant="info" />
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/trips/${entry.tripId}`)}
                      >
                        Voir
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Aucune sortie
                </p>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'activity' && (
          <Card title="Timeline d'activité">
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Inscription</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {userDetail.createdAt ? formatDate(userDetail.createdAt) : '-'}
                    </p>
                  </div>
                </div>
              </div>
              {userDetail.lastLogin && (
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Dernière connexion
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatRelativeTime(userDetail.lastLogin)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {userDetail.totalTrips} sorties
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {userDetail.completedTrips} complétées
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'payments' && (
          <Card title="Historique des paiements">
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Total dépensé</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userDetail.totalSpent} DA
                  </span>
                </div>
              </div>
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Détails des paiements à venir...
              </p>
            </div>
          </Card>
        )}

        {activeTab === 'gamification' && (
          <Card title="Gamification">
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Points totaux</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{userPoints}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Niveau</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{userLevel}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Badges</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userDetail.history?.length || 0}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Badges obtenus</h3>
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Liste des badges à venir...
                </p>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'support' && (
          <Card title="Support & Signalements">
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Messages support
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userDetail.supportMessages}
                  </p>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">Signalements</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userDetail.reports}
                  </p>
                </div>
              </div>
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Détails des messages et signalements à venir...
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

