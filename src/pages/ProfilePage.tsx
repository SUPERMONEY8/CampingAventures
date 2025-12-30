/**
 * Profile Page Component
 * 
 * Complete user profile page with 5 tabs: Informations, Mon Parcours,
 * Badges & Récompenses, Infos Médicales, Paramètres.
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  User as UserIcon,
  Save,
  Edit,
  X,
  Trophy,
  MapPin,
  Clock,
  Calendar,
  Lock,
  Bell,
  Moon,
  Globe,
  Shield,
  LogOut,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useUserProgress } from '../hooks/useUserProgress';
import { Tabs, type TabItem } from '../components/navigation/Tabs';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { AvatarUpload } from '../components/profile/AvatarUpload';
import { BadgeGrid } from '../components/profile/BadgeGrid';
import { ProgressChart } from '../components/profile/ProgressChart';
import type { User, Interest, MedicalInfo } from '../types';

/**
 * Profile form schema
 */
const profileSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  age: z.number().min(1).max(120, 'Âge invalide'),
  emergencyContactName: z.string().min(2, 'Le nom du contact est requis'),
  emergencyContactPhone: z.string().regex(/^[0-9+\s-]+$/, 'Numéro de téléphone invalide'),
  physicalLevel: z.enum(['débutant', 'intermédiaire', 'avancé']),
  interests: z.array(z.enum(['randonnée', 'photo', 'survie', 'détente', 'social'])),
});

/**
 * Medical info schema
 */
const medicalSchema = z.object({
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  conditions: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type MedicalFormData = z.infer<typeof medicalSchema>;

/**
 * Interest chips
 */
const interestOptions: Array<{ value: Interest; label: string }> = [
  { value: 'randonnée', label: 'Randonnée' },
  { value: 'photo', label: 'Photo' },
  { value: 'survie', label: 'Survie' },
  { value: 'détente', label: 'Détente' },
  { value: 'social', label: 'Social' },
];

/**
 * Profile Page Component
 */
export function ProfilePage() {
  const { user: authUser, signOut } = useAuth();
  const { profile, loading: profileLoading, updateProfile, updateMedicalInfo, uploadAvatar, deleteAvatar } = useProfile(
    authUser?.id || ''
  );
  const { progress, loading: progressLoading } = useUserProgress(authUser?.id || '');

  const [activeTab, setActiveTab] = useState('informations');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true' || document.documentElement.classList.contains('dark')
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || '',
      age: profile?.age || 0,
      emergencyContactName: profile?.emergencyContact?.name || '',
      emergencyContactPhone: profile?.emergencyContact?.phone || '',
      physicalLevel: profile?.physicalLevel || 'débutant',
      interests: profile?.interests || [],
    },
  });

  const {
    register: registerMedical,
    handleSubmit: handleSubmitMedical,
    reset: resetMedical,
  } = useForm<MedicalFormData>({
    resolver: zodResolver(medicalSchema),
    defaultValues: {
      bloodType: '',
      allergies: '',
      medications: '',
      conditions: '',
    },
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        age: profile.age,
        emergencyContactName: profile.emergencyContact.name,
        emergencyContactPhone: profile.emergencyContact.phone,
        physicalLevel: profile.physicalLevel,
        interests: profile.interests,
      });
      const medicalInfo = profile.medicalInfo;
      resetMedical({
        bloodType: medicalInfo?.bloodType || '',
        allergies: Array.isArray(medicalInfo?.allergies)
          ? medicalInfo.allergies.join(', ')
          : (medicalInfo?.allergies as string | undefined) || '',
        medications: Array.isArray(medicalInfo?.medications)
          ? medicalInfo.medications.join(', ')
          : (medicalInfo?.medications as string | undefined) || '',
        conditions: Array.isArray(medicalInfo?.conditions)
          ? medicalInfo.conditions.join(', ')
          : (medicalInfo?.conditions as string | undefined) || '',
      });
    }
  }, [profile, reset, resetMedical]);

  /**
   * Tabs configuration
   */
  const tabs: TabItem[] = [
    { id: 'informations', label: 'Informations', icon: UserIcon },
    { id: 'parcours', label: 'Mon Parcours', icon: TrendingUp },
    { id: 'badges', label: 'Badges & Récompenses', icon: Trophy },
    { id: 'medical', label: 'Infos Médicales', icon: Lock },
    { id: 'settings', label: 'Paramètres', icon: Shield },
  ];

  /**
   * Handle profile save
   */
  const onProfileSave = async (data: ProfileFormData): Promise<void> => {
    try {
      setSaving(true);
      await updateProfile({
        name: data.name,
        age: data.age,
        emergencyContact: {
          name: data.emergencyContactName,
          phone: data.emergencyContactPhone,
          relationship: 'Contact',
        },
        physicalLevel: data.physicalLevel,
        interests: data.interests,
      } as Partial<User>);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle medical info save
   */
  const onMedicalSave = async (data: MedicalFormData): Promise<void> => {
    try {
      setSaving(true);
      const medicalInfo: MedicalInfo = {
        bloodType: data.bloodType || '',
        allergies: data.allergies ? data.allergies.split(',').map((a) => a.trim()).filter(Boolean) : [],
        medications: data.medications ? data.medications.split(',').map((m) => m.trim()).filter(Boolean) : [],
        conditions: data.conditions ? data.conditions.split(',').map((c) => c.trim()).filter(Boolean) : [],
      };
      await updateMedicalInfo(medicalInfo);
    } catch (error) {
      console.error('Error saving medical info:', error);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Toggle interest
   */
  const toggleInterest = (interest: Interest): void => {
    const currentInterests = watch('interests');
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter((i) => i !== interest)
      : [...currentInterests, interest];
    setValue('interests', newInterests);
  };

  /**
   * Toggle dark mode
   */
  const toggleDarkMode = (): void => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('darkMode', String(newValue));
    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  /**
   * Handle sign out
   */
  const handleSignOut = async (): Promise<void> => {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      await signOut();
    }
  };

  const selectedInterests = watch('interests');

  // Mock badges data (in real app, fetch from Firestore)
  const allBadges = [
    {
      id: '1',
      name: 'Explorateur',
      description: 'Participez à votre première sortie',
      requirement: 'Compléter 1 sortie',
      icon: 'explorer',
    },
    {
      id: '2',
      name: 'Randonneur',
      description: 'Parcourez 50 km de randonnée',
      requirement: 'Parcourir 50 km',
      icon: 'hiker',
    },
    {
      id: '3',
      name: 'Photographe',
      description: 'Partagez 10 photos de vos aventures',
      requirement: 'Partager 10 photos',
      icon: 'camera',
    },
  ];

  // Mock progress data
  const progressData = [
    { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), value: 10 },
    { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), value: 25 },
    { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), value: 40 },
    { date: new Date(), value: 60 },
  ];

  // Show loading only if we don't have a user yet
  if (!authUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  // Show loading skeleton if profile is still loading
  if (profileLoading || progressLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64" />
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Mon Profil
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez vos informations personnelles et préférences
        </p>
      </div>

      {/* Tabs */}
      <div className="w-full">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} fullWidth={false} />
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Tab 1: Informations */}
        {activeTab === 'informations' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="glassmorphism">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Avatar Section */}
                <div className="lg:col-span-1">
                  <AvatarUpload
                    currentAvatar={profile?.avatarUrl}
                    onUpload={async (file) => {
                      await uploadAvatar(file);
                    }}
                    onDelete={deleteAvatar}
                  />
                </div>

                {/* Form Section */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Informations personnelles
                    </h2>
                    <Button
                      variant={isEditing ? 'outline' : 'primary'}
                      icon={isEditing ? X : Edit}
                      onClick={() => {
                        setIsEditing(!isEditing);
                        if (isEditing) {
                          reset();
                        }
                      }}
                    >
                      {isEditing ? 'Annuler' : 'Modifier'}
                    </Button>
                  </div>

                  <form onSubmit={handleSubmit(onProfileSave)} className="space-y-4">
                    <Input
                      label="Nom complet"
                      {...register('name')}
                      error={errors.name?.message}
                      disabled={!isEditing}
                    />

                    <Input
                      label="Âge"
                      type="number"
                      {...register('age', { valueAsNumber: true })}
                      error={errors.age?.message}
                      disabled={!isEditing}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Contact d'urgence - Nom"
                        {...register('emergencyContactName')}
                        error={errors.emergencyContactName?.message}
                        disabled={!isEditing}
                      />
                      <Input
                        label="Contact d'urgence - Téléphone"
                        {...register('emergencyContactPhone')}
                        error={errors.emergencyContactPhone?.message}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <label className="medical-label">Niveau physique</label>
                      <select
                        {...register('physicalLevel')}
                        disabled={!isEditing}
                        className="medical-input"
                      >
                        <option value="débutant">Débutant</option>
                        <option value="intermédiaire">Intermédiaire</option>
                        <option value="avancé">Avancé</option>
                      </select>
                    </div>

                    <div>
                      <label className="medical-label">Centres d'intérêt</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {interestOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => isEditing && toggleInterest(option.value)}
                            disabled={!isEditing}
                            className={`
                              px-4 py-2 rounded-full text-sm font-medium transition-smooth
                              ${
                                selectedInterests.includes(option.value)
                                  ? 'bg-primary text-white'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }
                              ${!isEditing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                            `}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {isEditing && (
                      <Button
                        type="submit"
                        variant="primary"
                        icon={Save}
                        loading={saving}
                        fullWidth
                      >
                        Enregistrer
                      </Button>
                    )}
                  </form>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Tab 2: Mon Parcours */}
        {activeTab === 'parcours' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card icon={Trophy} variant="glassmorphism">
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Sorties complétées</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {progress?.completedTrips?.length || 0}
                  </div>
                </div>
              </Card>

              <Card icon={MapPin} variant="glassmorphism">
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Distance totale</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">125 km</div>
                </div>
              </Card>

              <Card icon={Clock} variant="glassmorphism">
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Heures de randonnée</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">48h</div>
                </div>
              </Card>

              <Card icon={Calendar} variant="glassmorphism">
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Jours en camping</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">12</div>
                </div>
              </Card>
            </div>

            {/* Progress Chart */}
            <ProgressChart data={progressData} title="Progression des points" />

            {/* Trip History */}
            <Card variant="glassmorphism">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Historique des sorties
              </h3>
              <div className="space-y-3">
                {profile?.history?.slice(0, 5).map((entry) => (
                  <div
                    key={entry.tripId}
                    className="flex items-center gap-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{entry.tripTitle}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {entry.date.toLocaleDateString('fr-FR')} • {entry.role}
                      </p>
                    </div>
                    <Badge text={`+${entry.pointsEarned} pts`} variant="success" />
                  </div>
                ))}
                {(!profile?.history || profile.history.length === 0) && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Aucune sortie complétée pour le moment
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Tab 3: Badges & Récompenses */}
        {activeTab === 'badges' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="glassmorphism">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Badges & Récompenses
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Débloquez des badges en complétant des défis et en participant à des sorties
                </p>
              </div>
              <BadgeGrid
                badges={allBadges as any}
                achievements={progress?.badges || []}
                loading={progressLoading}
              />
            </Card>
          </motion.div>
        )}

        {/* Tab 4: Infos Médicales */}
        {activeTab === 'medical' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="glassmorphism">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Informations médicales
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Ces informations sont confidentielles et ne seront partagées qu'en cas d'urgence.
              </p>

              <form onSubmit={handleSubmitMedical(onMedicalSave)} className="space-y-4">
                <div>
                  <label className="medical-label">Groupe sanguin</label>
                  <select {...registerMedical('bloodType')} className="medical-input">
                    <option value="">Sélectionner</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="medical-label">Allergies</label>
                  <textarea
                    {...registerMedical('allergies')}
                    className="medical-input"
                    rows={3}
                    placeholder="Listez vos allergies..."
                  />
                </div>

                <div>
                  <label className="medical-label">Médicaments actuels</label>
                  <textarea
                    {...registerMedical('medications')}
                    className="medical-input"
                    rows={3}
                    placeholder="Listez vos médicaments..."
                  />
                </div>

                <div>
                  <label className="medical-label">Conditions médicales</label>
                  <textarea
                    {...registerMedical('conditions')}
                    className="medical-input"
                    rows={3}
                    placeholder="Décrivez vos conditions médicales..."
                  />
                </div>

                <Button type="submit" variant="primary" icon={Save} loading={saving} fullWidth>
                  Enregistrer les informations médicales
                </Button>
              </form>
            </Card>
          </motion.div>
        )}

        {/* Tab 5: Paramètres */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <Card variant="glassmorphism">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Paramètres
              </h2>

              <div className="space-y-6">
                {/* Notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notifications
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Recevoir des notifications sur les sorties et activités
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
                  </label>
                </div>

                {/* Dark Mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Moon className="w-5 h-5" />
                      Mode sombre
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Activer le thème sombre
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={darkMode}
                      onChange={toggleDarkMode}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
                  </label>
                </div>

                {/* Language */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Langue
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Choisir la langue de l'interface
                    </p>
                  </div>
                  <select className="medical-input w-32">
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>

                {/* Privacy */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Confidentialité
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Gérer vos paramètres de confidentialité
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configurer
                  </Button>
                </div>
              </div>
            </Card>

            {/* Sign Out */}
            <Card variant="glassmorphism" className="border-danger-200 dark:border-danger-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <LogOut className="w-5 h-5 text-danger-500" />
                    Déconnexion
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Se déconnecter de votre compte
                  </p>
                </div>
                <Button variant="danger" icon={LogOut} onClick={handleSignOut}>
                  Déconnexion
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

