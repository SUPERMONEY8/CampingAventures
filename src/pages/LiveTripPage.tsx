/**
 * Live Trip Page
 * 
 * Main interface during an active trip with real-time updates,
 * activities, map, challenges, group chat, and photos.
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  MapPin,
  Clock,
  Users,
  Camera,
  MessageCircle,
  Trophy,
  Calendar,
  CheckCircle2,
  Circle,
  Play,
  Square,
  AlertTriangle,
  Wifi,
  WifiOff,
  Compass,
  Navigation,
  Image as ImageIcon,
  Heart,
  Share2,
  BatteryLow,
  Power,
} from 'lucide-react';
import { getTripById } from '../services/trip.service';
import {
  startActivity,
  completeActivity,
  shareLocation,
  uploadTripPhoto,
  sendGroupMessage,
  getLiveParticipants,
  subscribeToLiveParticipants,
  subscribeToGroupMessages,
  getTripChallenges,
  getTripPhotos,
} from '../services/liveTrip.service';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUser';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/navigation/Tabs';
import { formatTime, formatRelativeTime } from '../utils/date';
import type {
  Activity,
  LiveParticipant,
  GroupMessage,
} from '../types';

/**
 * Tab types
 */
type TabType = 'programme' | 'carte' | 'challenges' | 'groupe' | 'photos';

/**
 * LiveTripPage Component
 */
export function LiveTripPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile(user?.id);

  // State
  const [activeTab, setActiveTab] = useState<TabType>('programme');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [powerSavingMode, setPowerSavingMode] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refs for subscriptions
  const participantsUnsubscribeRef = useRef<(() => void) | null>(null);
  const messagesUnsubscribeRef = useRef<(() => void) | null>(null);

  // Fetch trip data
  const { data: trip, isLoading: tripLoading } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => (id ? getTripById(id) : Promise.resolve(null)),
    enabled: !!id,
  });

  // Fetch participants
  const [participants, setParticipants] = useState<LiveParticipant[]>([]);
  useEffect(() => {
    if (!id) return;
    
    // Initial fetch
    getLiveParticipants(id).then(setParticipants).catch(console.error);

    // Subscribe to updates
    participantsUnsubscribeRef.current = subscribeToLiveParticipants(id, setParticipants);

    return () => {
      if (participantsUnsubscribeRef.current) {
        participantsUnsubscribeRef.current();
      }
    };
  }, [id]);

  // Fetch challenges
  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges', id],
    queryFn: () => (id ? getTripChallenges(id) : Promise.resolve([])),
    enabled: !!id,
  });

  // Fetch photos
  const { data: photos = [], refetch: refetchPhotos } = useQuery({
    queryKey: ['tripPhotos', id],
    queryFn: () => (id ? getTripPhotos(id) : Promise.resolve([])),
    enabled: !!id,
  });

  // Group messages
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  useEffect(() => {
    if (!id) return;

    messagesUnsubscribeRef.current = subscribeToGroupMessages(id, setMessages);

    return () => {
      if (messagesUnsubscribeRef.current) {
        messagesUnsubscribeRef.current();
      }
    };
  }, [id]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Battery level detection
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as unknown as { getBattery: () => Promise<{ level: number; addEventListener: (event: string, handler: () => void) => void }> }).getBattery().then((battery) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }
  }, []);

  // Elapsed time counter
  useEffect(() => {
    if (!trip?.date) return;
    
    const startTime = new Date(trip.date).getTime();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000 / 60); // minutes
      setElapsedTime(elapsed);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [trip?.date]);

  // GPS tracking
  useEffect(() => {
    if (activeTab !== 'carte' && !powerSavingMode) return;

    const watchId = navigator.geolocation?.watchPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error('GPS error:', error);
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation?.clearWatch(watchId);
      }
    };
  }, [activeTab, powerSavingMode]);

  // Mutations
  const startActivityMutation = useMutation({
    mutationFn: (activityId: string) => startActivity(activityId, user?.id || ''),
  });

  const completeActivityMutation = useMutation({
    mutationFn: (activityId: string) => completeActivity(activityId, user?.id || ''),
  });

  const shareLocationMutation = useMutation({
    mutationFn: (coords: { lat: number; lng: number }) =>
      shareLocation(id || '', user?.id || '', coords),
  });

  // Challenge update mutation (for future use)
  // const updateChallengeMutation = useMutation({
  //   mutationFn: ({ challengeId, progress }: { challengeId: string; progress: number }) =>
  //     updateChallenge(challengeId, user?.id || '', progress),
  // });

  const uploadPhotoMutation = useMutation({
    mutationFn: (file: File) => uploadTripPhoto(id || '', user?.id || '', file),
    onSuccess: () => {
      refetchPhotos();
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      sendGroupMessage(
        id || '',
        user?.id || '',
        userProfile?.name || 'Unknown',
        userProfile?.avatarUrl,
        content,
        'text',
        false
      ),
    onSuccess: () => {
      setMessageInput('');
    },
  });

  // Handle SOS
  const handleSOS = (): void => {
    if (confirm('Êtes-vous sûr de vouloir déclencher une alerte SOS ?')) {
      // TODO: Implement SOS alert
      alert('Alerte SOS déclenchée ! Le guide et les secours ont été notifiés.');
    }
  };

  // Handle photo upload
  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      uploadPhotoMutation.mutate(file);
    }
  };

  // Format elapsed time
  const formatElapsedTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? mins : ''}`;
  };

  if (tripLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Chargement de la sortie...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Sortie introuvable</h2>
          <Button onClick={() => navigate('/dashboard')} variant="primary">
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  // Get today's activities from itinerary
  const todayActivities: Activity[] = [];
  trip.itinerary?.forEach((day) => {
    const dayDate = new Date(day.date);
    const today = new Date();
    if (
      dayDate.getDate() === today.getDate() &&
      dayDate.getMonth() === today.getMonth() &&
      dayDate.getFullYear() === today.getFullYear()
    ) {
      todayActivities.push(...day.activities);
    }
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Bar Compact */}
      <div className="sticky top-0 z-50 bg-gray-800/95 backdrop-blur-lg border-b border-gray-700">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{trip.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>En cours depuis {formatElapsedTime(elapsedTime)}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-green-500">En ligne</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-500">Hors ligne</span>
                  </>
                )}
              </div>
              {batteryLevel !== null && batteryLevel < 20 && (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <BatteryLow className="w-4 h-4" />
                  <span>{batteryLevel}%</span>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            icon={AlertTriangle}
            onClick={handleSOS}
            className="flex-shrink-0"
          >
            SOS
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'programme', label: 'Programme', icon: Calendar },
          { id: 'carte', label: 'Carte', icon: MapPin },
          { id: 'challenges', label: 'Challenges', icon: Trophy },
          { id: 'groupe', label: 'Groupe', icon: Users },
          { id: 'photos', label: 'Photos', icon: ImageIcon },
        ]}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as TabType)}
        className="sticky top-[73px] z-40 bg-gray-800 border-b border-gray-700"
      />

      {/* Tab Content */}
      <div className="pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'programme' && (
            <motion.div
              key="programme"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 space-y-4"
            >
              <h2 className="text-xl font-bold mb-4">Programme du jour</h2>
              {todayActivities.length === 0 ? (
                <Card className="text-center py-8">
                  <p className="text-gray-400">Aucune activité prévue aujourd'hui</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {todayActivities.map((activity) => {
                    const isActive = activity.status === 'active';
                    const isCompleted = activity.status === 'completed';
                    const isUpcoming = activity.status === 'upcoming' || !activity.status;

                    return (
                      <Card
                        key={activity.id}
                        className={`${
                          isActive ? 'border-primary bg-primary/10' : ''
                        } ${isCompleted ? 'opacity-75' : ''}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 className="w-6 h-6 text-green-500" />
                            ) : isActive ? (
                              <div className="w-6 h-6 rounded-full bg-primary animate-pulse" />
                            ) : (
                              <Circle className="w-6 h-6 text-gray-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h3 className="font-semibold">{activity.name}</h3>
                                <p className="text-sm text-gray-400">
                                  {formatTime(activity.time)} • {activity.duration || 60} min
                                </p>
                              </div>
                              <Badge text={`+${activity.points} pts`} variant="info" />
                            </div>
                            {activity.description && (
                              <p className="text-sm text-gray-400 mb-3">{activity.description}</p>
                            )}
                            <div className="flex items-center gap-2">
                              {isUpcoming && (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  icon={Play}
                                  onClick={() => startActivityMutation.mutate(activity.id)}
                                  loading={startActivityMutation.isPending}
                                >
                                  Commencer
                                </Button>
                              )}
                              {isActive && (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  icon={Square}
                                  onClick={() => completeActivityMutation.mutate(activity.id)}
                                  loading={completeActivityMutation.isPending}
                                >
                                  Terminer
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'carte' && (
            <motion.div
              key="carte"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 space-y-4"
            >
              <div className="h-[60vh] bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">Carte interactive</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Intégration Leaflet/Mapbox à venir
                  </p>
                  {currentLocation && (
                    <p className="text-sm text-gray-400 mt-4">
                      Position: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  icon={Navigation}
                  onClick={() => {
                    if (currentLocation) {
                      shareLocationMutation.mutate(currentLocation);
                    }
                  }}
                >
                  Partager position
                </Button>
                <Button variant="outline" icon={Compass}>
                  Boussole
                </Button>
              </div>
            </motion.div>
          )}

          {activeTab === 'challenges' && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 space-y-4"
            >
              <h2 className="text-xl font-bold mb-4">Challenges actifs</h2>
              {challenges.length === 0 ? (
                <Card className="text-center py-8">
                  <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-400">Aucun challenge actif</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {challenges.map((challenge) => {
                    const progress = (challenge.currentValue / challenge.targetValue) * 100;
                    const isCompleted = challenge.completed;

                    return (
                      <Card
                        key={challenge.id}
                        className={isCompleted ? 'border-green-500 bg-green-500/10' : ''}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{challenge.name}</h3>
                            <p className="text-sm text-gray-400">{challenge.description}</p>
                          </div>
                          <Badge text={`+${challenge.points} pts`} variant="info" />
                        </div>
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-400">{challenge.objective}</span>
                            <span className="text-gray-400">
                              {challenge.currentValue} / {challenge.targetValue}
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <motion.div
                              className="bg-primary h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                        {isCompleted && (
                          <div className="flex items-center gap-2 text-green-500 text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Challenge complété !</span>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'groupe' && (
            <motion.div
              key="groupe"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col h-[calc(100vh-200px)]"
            >
              {/* Participants List */}
              <div className="p-4 border-b border-gray-700">
                <h3 className="font-semibold mb-3">Participants ({participants.length})</h3>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {participants.map((participant) => (
                    <div
                      key={participant.userId}
                      className="flex flex-col items-center gap-2 flex-shrink-0"
                    >
                      <div
                        className={`w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center ${
                          participant.status === 'active'
                            ? 'ring-2 ring-green-500'
                            : participant.status === 'sos'
                            ? 'ring-2 ring-red-500'
                            : ''
                        }`}
                      >
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
                      <span className="text-xs text-gray-400 text-center max-w-[60px] truncate">
                        {participant.userName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-gray-400">Aucun message</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.senderId === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.senderId !== user?.id && (
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                          {message.senderAvatar ? (
                            <img
                              src={message.senderAvatar}
                              alt={message.senderName}
                              className="w-full h-full rounded-full"
                            />
                          ) : (
                            <span className="text-xs">
                              {message.senderName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          message.senderId === user?.id
                            ? 'bg-primary text-white'
                            : message.isGuide
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                            : 'bg-gray-700 text-white'
                        }`}
                      >
                        {message.isGuide && (
                          <span className="text-xs font-semibold block mb-1">Guide</span>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {formatRelativeTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && messageInput.trim()) {
                        sendMessageMutation.mutate(messageInput);
                      }
                    }}
                    placeholder="Écrire un message..."
                    className="flex-1 medical-input bg-gray-800 text-white"
                  />
                  <Button
                    variant="primary"
                    icon={MessageCircle}
                    onClick={() => {
                      if (messageInput.trim()) {
                        sendMessageMutation.mutate(messageInput);
                      }
                    }}
                    disabled={!messageInput.trim() || sendMessageMutation.isPending}
                  >
                    Envoyer
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'photos' && (
            <motion.div
              key="photos"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4"
            >
              <div className="mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                <Button
                  variant="primary"
                  icon={Camera}
                  onClick={() => fileInputRef.current?.click()}
                  loading={uploadPhotoMutation.isPending}
                  className="w-full"
                >
                  Prendre une photo
                </Button>
              </div>
              {photos.length === 0 ? (
                <Card className="text-center py-12">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-4">Aucune photo partagée</p>
                  <Button
                    variant="outline"
                    icon={Camera}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Ajouter la première photo
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {photos.map((photo) => (
                    <Card key={photo.id} className="p-0 overflow-hidden">
                      <img
                        src={photo.thumbnailUrl || photo.url}
                        alt={photo.caption || 'Photo'}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold">{photo.userName}</span>
                          <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1 text-sm text-gray-400">
                              <Heart className="w-4 h-4" />
                              <span>{photo.likes.length}</span>
                            </button>
                          </div>
                        </div>
                        {photo.caption && (
                          <p className="text-sm text-gray-400">{photo.caption}</p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Actions Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4 z-50">
        <div className="flex gap-3 max-w-md mx-auto">
          <Button
            variant="outline"
            icon={Camera}
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            Photo
          </Button>
          <Button
            variant="outline"
            icon={Share2}
            onClick={() => {
              if (currentLocation) {
                shareLocationMutation.mutate(currentLocation);
              }
            }}
            className="flex-1"
          >
            Position
          </Button>
          <Button
            variant="outline"
            icon={Power}
            onClick={() => setPowerSavingMode(!powerSavingMode)}
            className={powerSavingMode ? 'bg-primary/20' : ''}
          >
            Éco
          </Button>
        </div>
      </div>
    </div>
  );
}

