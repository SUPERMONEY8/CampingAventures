/**
 * Trip Report Page
 * 
 * Personal trip report displayed after trip completion.
 * Journal-style design with statistics, photos, and achievements.
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Ruler,
  Mountain,
  Clock,
  Target,
  Trophy,
  Download,
  Share2,
  Star,
  ArrowRight,
  Edit2,
  Save,
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { generatePersonalReport, getPersonalReport, updateActivityNote } from '../services/tripReport.service';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatDate } from '../utils/date';
import { Certificate } from '../components/report/Certificate';

/**
 * TripReportPage Component
 */
export function TripReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState('');
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  // Fetch or generate report
  const { data: report, isLoading, refetch } = useQuery({
    queryKey: ['tripReport', id, user?.id],
    queryFn: async () => {
      if (!id || !user?.id) return null;
      
      // Try to get existing report
      const existing = await getPersonalReport(user.id, id);
      if (existing) {
        return existing;
      }
      
      // Generate new report
      return await generatePersonalReport(user.id, id);
    },
    enabled: !!id && !!user?.id,
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: ({ activityId, note }: { activityId: string; note: string }) =>
      updateActivityNote(report?.id || '', activityId, note),
    onSuccess: () => {
      refetch();
      setEditingNote(null);
    },
  });

  /**
   * Handle edit note
   */
  const handleEditNote = (activityId: string, currentNote?: string): void => {
    setEditingNote(activityId);
    setNoteValue(currentNote || '');
  };

  /**
   * Handle save note
   */
  const handleSaveNote = (activityId: string): void => {
    updateNoteMutation.mutate({ activityId, note: noteValue });
  };

  /**
   * Handle download all photos
   */
  const handleDownloadAll = (): void => {
    if (!report?.photos) return;
    
    report.photos.forEach((photo, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = photo.url;
        link.download = `photo-${index + 1}.jpg`;
        link.click();
      }, index * 200);
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Génération de votre rapport...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Rapport introuvable</p>
          <Button onClick={() => navigate('/dashboard')} variant="primary">
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Section 1 - Hero */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0">
          {report.photos.length > 0 ? (
            <img
              src={report.photos[0].url}
              alt={report.tripTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-accent" />
          )}
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative h-full flex items-end p-6 md:p-12">
          <div className="text-white">
            <Badge text="Sortie Complétée ✓" variant="success" className="mb-3" />
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{report.tripTitle}</h1>
            <div className="flex items-center gap-4 text-lg">
              <span>{formatDate(report.tripDate)}</span>
              <span>•</span>
              <span>{report.tripDuration} jour{report.tripDuration > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Section 2 - Statistics */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Statistiques
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="text-center">
              <Ruler className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {report.distance.toFixed(1)} km
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Distance</p>
            </Card>
            <Card className="text-center">
              <Mountain className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                +{report.elevation}m
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Dénivelé</p>
            </Card>
            <Card className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {report.activeHours.toFixed(1)}h
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Temps actif</p>
            </Card>
            <Card className="text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                +{report.pointsEarned} pts
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Points</p>
            </Card>
            <Card className="text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {report.challengesCompleted}/{report.challengesCompleted + 1}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Challenges</p>
            </Card>
          </div>
        </section>

        {/* Section 3 - Moments Forts */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Mes Moments Forts
          </h2>
          <div className="space-y-4">
            {report.activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="flex gap-4">
                  {activity.photoUrl && (
                    <img
                      src={activity.photoUrl}
                      alt={activity.name}
                      className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(activity.time).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {activity.completed && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {activity.name}
                    </h3>
                    {editingNote === activity.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={noteValue}
                          onChange={(e) => setNoteValue(e.target.value)}
                          className="flex-1 medical-input text-sm"
                          placeholder="Ajouter une anecdote..."
                        />
                        <Button
                          size="sm"
                          icon={Save}
                          onClick={() => handleSaveNote(activity.id)}
                          loading={updateNoteMutation.isPending}
                        >
                          Enregistrer
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.personalNote || 'Aucune note personnelle'}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit2}
                          onClick={() => handleEditNote(activity.id, activity.personalNote)}
                        >
                          {activity.personalNote ? 'Modifier' : 'Ajouter'}
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section 4 - Réalisations */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Mes Réalisations
          </h2>
          <Card>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Nouveaux Badges
                </h3>
                {report.badgesEarned.length > 0 ? (
                  <div className="flex gap-3">
                    {report.badgesEarned.map((badgeId) => (
                      <div
                        key={badgeId}
                        className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-3xl"
                      >
                        🏆
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Aucun nouveau badge débloqué
                  </p>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Progression
                </h3>
                <p className="text-lg text-primary font-semibold">
                  +{report.pointsEarned} points gagnés
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {report.activitiesCompleted} activités complétées
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 5 - Galerie Photos */}
        {report.photos.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Mes Photos ({report.photos.length})
              </h2>
              <Button
                variant="outline"
                icon={Download}
                onClick={handleDownloadAll}
              >
                Télécharger tout
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {report.photos.map((photo) => (
                <motion.div
                  key={photo.id}
                  whileHover={{ scale: 1.05 }}
                  className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => setLightboxPhoto(photo.url)}
                >
                  <img
                    src={photo.thumbnailUrl || photo.url}
                    alt={photo.caption || 'Photo'}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Section 6 - Le Groupe */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Le Groupe
          </h2>
          <Card>
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Participants ({report.participants.length})
              </h3>
              <div className="flex gap-2 flex-wrap">
                {report.participants.map((participant) => (
                  <div
                    key={participant.userId}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      {participant.avatarUrl ? (
                        <img
                          src={participant.avatarUrl}
                          alt={participant.userName}
                          className="w-full h-full rounded-full"
                        />
                      ) : (
                        <span className="text-sm font-semibold">
                          {participant.userName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {participant.userName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {report.groupPhotos.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Meilleures Photos du Groupe
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {report.groupPhotos.slice(0, 6).map((photoUrl, index) => (
                    <img
                      key={index}
                      src={photoUrl}
                      alt={`Photo groupe ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </Card>
        </section>

        {/* Section 7 - Message Personnalisé */}
        <section>
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <div className="text-center py-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Félicitations {user?.name} ! 🎉
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Félicitations pour cette superbe aventure !
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Nous espérons que tu as passé un moment inoubliable.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                À très bientôt pour de nouvelles explorations ! 🏕️
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                - L'équipe Camping Aventures
              </p>
            </div>
          </Card>
        </section>

        {/* Section 8 - Actions */}
        <section>
          <div className="grid md:grid-cols-2 gap-4">
            <Certificate report={report} />
            <Button
              variant="outline"
              icon={Share2}
              onClick={() => {
                // Share functionality
                if (navigator.share) {
                  navigator.share({
                    title: `Mon rapport: ${report.tripTitle}`,
                    text: `J'ai complété ${report.tripTitle} ! ${report.distance}km parcourus, ${report.pointsEarned} points gagnés !`,
                    url: window.location.href,
                  });
                }
              }}
              className="w-full"
            >
              Partager mon rapport
            </Button>
            <Button
              variant="outline"
              icon={Star}
              onClick={() => navigate(`/trips/${id}`)}
              className="w-full"
            >
              Laisser un avis
            </Button>
            <Link to="/explore" className="w-full">
              <Button variant="primary" icon={ArrowRight} className="w-full">
                Voir les prochaines sorties
              </Button>
            </Link>
          </div>
        </section>
      </div>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <img
            src={lightboxPhoto}
            alt="Photo"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}

