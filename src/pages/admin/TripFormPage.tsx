/**
 * Trip Form Page
 * 
 * Multi-step form for creating/editing trips (10 steps).
 * Supports auto-save, validation, and preview.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Eye,
  MapPin,
  Calendar,
  Users,
  FileText,
  Image as ImageIcon,
  User,
  Settings,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTripById } from '../../services/trip.service';
import { createTrip, updateTrip, uploadTripImage, type TripFormData } from '../../services/admin/tripManagement.service';
import type { DayItinerary, EquipmentItem } from '../../types';

/**
 * Step configuration
 */
const steps = [
  { id: 1, title: 'Informations de Base', icon: FileText },
  { id: 2, title: 'Détails Pratiques', icon: Calendar },
  { id: 3, title: 'Logistique', icon: Users },
  { id: 4, title: 'Programme', icon: MapPin },
  { id: 5, title: 'Équipement', icon: FileText },
  { id: 6, title: 'Médias', icon: ImageIcon },
  { id: 7, title: 'Guide & Équipe', icon: User },
  { id: 8, title: 'Carte & Zones', icon: MapPin },
  { id: 9, title: 'Paramètres', icon: Settings },
  { id: 10, title: 'Récapitulatif', icon: CheckCircle2 },
];

/**
 * Form schema (simplified - full validation would be more complex)
 */
const tripFormSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  shortDescription: z.string().max(150, 'La description courte ne doit pas dépasser 150 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  category: z.string(),
  tags: z.array(z.string()),
  startDate: z.date(),
  endDate: z.date(),
  meetingTime: z.string(),
  meetingPointName: z.string(),
  meetingPointLat: z.number(),
  meetingPointLng: z.number(),
  difficulty: z.enum(['débutant', 'intermédiaire', 'avancé']),
  physicalLevel: z.string(),
  minAge: z.number().min(1).max(100),
  minParticipants: z.number().min(1),
  maxParticipants: z.number().min(1),
  price: z.number().min(0),
  included: z.array(z.string()),
  notIncluded: z.array(z.string()),
  accommodation: z.string(),
  meals: z.enum(['all', 'some', 'none']),
  visible: z.boolean(),
  enrollmentDeadline: z.date().optional(),
  freeCancellationDays: z.number().min(0),
  cancellationRefund: z.number().min(0).max(100),
  autoConfirm: z.boolean(),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']),
});

type TripFormValues = z.infer<typeof tripFormSchema>;

/**
 * Trip Form Page Component
 */
export function TripFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [mainImage, setMainImage] = useState<string>('');
  const [itinerary, setItinerary] = useState<DayItinerary[]>([]);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);

  /**
   * Fetch trip if editing
   */
  const { data: existingTrip, isLoading: loadingTrip } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => getTripById(id!),
    enabled: isEditMode && !!id,
  });

  /**
   * Form setup
   */
  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      title: '',
      shortDescription: '',
      description: '',
      category: 'randonnée',
      tags: [],
      startDate: new Date(),
      endDate: new Date(),
      meetingTime: '08:00',
      meetingPointName: '',
      meetingPointLat: 0,
      meetingPointLng: 0,
      difficulty: 'intermédiaire',
      physicalLevel: 'intermédiaire',
      minAge: 18,
      minParticipants: 1,
      maxParticipants: 10,
      price: 0,
      included: [],
      notIncluded: [],
      accommodation: 'tente',
      meals: 'some',
      visible: true,
      freeCancellationDays: 7,
      cancellationRefund: 50,
      autoConfirm: false,
      status: 'upcoming',
    },
  });

  /**
   * Load existing trip data
   */
  useEffect(() => {
    if (existingTrip) {
      form.reset({
        title: existingTrip.title,
        shortDescription: existingTrip.description?.substring(0, 150) || '',
        description: existingTrip.description || '',
        category: 'randonnée', // Would need to be stored in trip
        tags: [],
        startDate: existingTrip.date,
        endDate: existingTrip.endDate || existingTrip.date,
        meetingTime: existingTrip.meetingPoint?.time || '08:00',
        meetingPointName: existingTrip.location.name,
        meetingPointLat: existingTrip.location.coordinates.lat,
        meetingPointLng: existingTrip.location.coordinates.lng,
        difficulty: existingTrip.difficulty,
        physicalLevel: existingTrip.difficulty,
        minAge: 18,
        minParticipants: 1,
        maxParticipants: existingTrip.maxParticipants,
        price: existingTrip.price || 0,
        included: existingTrip.included || [],
        notIncluded: existingTrip.notIncluded || [],
        accommodation: existingTrip.accommodation || 'tente',
        meals: 'some',
        visible: true,
        freeCancellationDays: 7,
        cancellationRefund: 50,
        autoConfirm: false,
        status: existingTrip.status,
      });
      setImages(existingTrip.images || []);
      setMainImage(existingTrip.images?.[0] || '');
      setItinerary(existingTrip.itinerary || []);
      setEquipment(existingTrip.equipment || []);
    }
  }, [existingTrip, form]);

  /**
   * Create/Update mutations
   */
  const createMutation = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTrips'] });
      navigate('/admin/trips');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ tripId, data }: { tripId: string; data: Partial<TripFormData> }) =>
      updateTrip(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTrips'] });
      navigate('/admin/trips');
    },
  });

  /**
   * Auto-save to localStorage
   */
  useEffect(() => {
    const formData = form.getValues();
    const autoSaveData = {
      ...formData,
      images,
      mainImage,
      itinerary,
      equipment,
      currentStep,
    };
    localStorage.setItem('tripFormDraft', JSON.stringify(autoSaveData));
  }, [form.watch(), images, mainImage, itinerary, equipment, currentStep]);

  /**
   * Load draft from localStorage
   */
  useEffect(() => {
    const draft = localStorage.getItem('tripFormDraft');
    if (draft && !isEditMode) {
      try {
        const parsed = JSON.parse(draft);
        form.reset(parsed);
        setImages(parsed.images || []);
        setMainImage(parsed.mainImage || '');
        setItinerary(parsed.itinerary || []);
        setEquipment(parsed.equipment || []);
        setCurrentStep(parsed.currentStep || 1);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [isEditMode, form]);

  /**
   * Handle image upload
   */
  const handleImageUpload = async (file: File) => {
    setUploadingImages(true);
    try {
      const tripId = id || 'draft';
      const url = await uploadTripImage(file, tripId);
      setImages((prev) => [...prev, url]);
      if (!mainImage) {
        setMainImage(url);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erreur lors du téléchargement de l\'image');
    } finally {
      setUploadingImages(false);
    }
  };

  /**
   * Handle submit
   */
  const handleSubmit = async (asDraft: boolean) => {
    const formData = form.getValues();
    
    const tripData: TripFormData = {
      title: formData.title,
      shortDescription: formData.shortDescription,
      description: formData.description,
      category: formData.category,
      tags: formData.tags,
      startDate: formData.startDate,
      endDate: formData.endDate,
      meetingTime: formData.meetingTime,
      meetingPoint: {
        name: formData.meetingPointName,
        coordinates: {
          lat: formData.meetingPointLat,
          lng: formData.meetingPointLng,
        },
      },
      difficulty: formData.difficulty,
      physicalLevel: formData.physicalLevel,
      minAge: formData.minAge,
      minParticipants: formData.minParticipants,
      maxParticipants: formData.maxParticipants,
      price: formData.price,
      included: formData.included,
      notIncluded: formData.notIncluded,
      accommodation: formData.accommodation,
      meals: formData.meals,
      itinerary,
      equipment,
      images,
      mainImage,
      guide: {
        name: '',
        phone: '',
      },
      emergencyContact: {
        name: '',
        phone: '',
      },
      visible: formData.visible,
      enrollmentDeadline: formData.enrollmentDeadline,
      freeCancellationDays: formData.freeCancellationDays,
      cancellationRefund: formData.cancellationRefund,
      autoConfirm: formData.autoConfirm,
      status: asDraft ? 'upcoming' : formData.status,
    };

    if (isEditMode && id) {
      await updateMutation.mutateAsync({ tripId: id, data: tripData });
    } else {
      await createMutation.mutateAsync(tripData);
    }

    // Clear draft
    localStorage.removeItem('tripFormDraft');
  };

  if (loadingTrip) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? 'Modifier la sortie' : 'Créer une sortie'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Étape {currentStep} sur {steps.length}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            icon={Eye}
            onClick={() => setPreviewOpen(true)}
          >
            Aperçu
          </Button>
          <Button
            variant="outline"
            icon={Save}
            onClick={() => handleSubmit(true)}
            loading={createMutation.isPending || updateMutation.isPending}
          >
            Enregistrer brouillon
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <motion.div
          className="bg-primary-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Steps Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {steps.map((step) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          
          return (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : isCompleted
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <StepIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{step.title}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <Card className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep(currentStep, form, {
              images,
              mainImage,
              setImages,
              setMainImage,
              handleImageUpload,
              uploadingImages,
              itinerary,
              setItinerary,
              equipment,
              setEquipment,
            })}
          </motion.div>
        </AnimatePresence>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          icon={ChevronLeft}
          onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
          disabled={currentStep === 1}
        >
          Précédent
        </Button>
        <div className="flex gap-2">
          {currentStep < steps.length ? (
            <Button
              variant="primary"
              icon={ChevronRight}
              iconPosition="right"
              onClick={() => {
                form.trigger().then((isValid) => {
                  if (isValid) {
                    setCurrentStep((s) => Math.min(steps.length, s + 1));
                  }
                });
              }}
            >
              Suivant
            </Button>
          ) : (
            <Button
              variant="primary"
              icon={CheckCircle2}
              onClick={() => handleSubmit(false)}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {isEditMode ? 'Mettre à jour' : 'Publier'}
            </Button>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Aperçu de la sortie">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{form.watch('title') || 'Titre de la sortie'}</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {form.watch('description') || 'Description...'}
          </p>
          {/* More preview content would go here */}
        </div>
      </Modal>
    </div>
  );
}

/**
 * Render step content
 */
function renderStep(
  step: number,
  form: ReturnType<typeof useForm<TripFormValues>>,
  helpers: {
    images: string[];
    mainImage: string;
    setImages: (images: string[]) => void;
    setMainImage: (image: string) => void;
    handleImageUpload: (file: File) => Promise<void>;
    uploadingImages: boolean;
    itinerary: DayItinerary[];
    setItinerary: (itinerary: DayItinerary[]) => void;
    equipment: EquipmentItem[];
    setEquipment: (equipment: EquipmentItem[]) => void;
  }
) {
  switch (step) {
    case 1:
      return <Step1BasicInfo form={form} />;
    case 2:
      return <Step2PracticalDetails form={form} />;
    case 3:
      return <Step3Logistics form={form} />;
    case 4:
      return <Step4Itinerary helpers={helpers} />;
    case 5:
      return <Step5Equipment helpers={helpers} />;
    case 6:
      return <Step6Media helpers={helpers} />;
    case 7:
      return <Step7Guide form={form} />;
    case 8:
      return <Step8Map form={form} />;
    case 9:
      return <Step9Settings form={form} />;
    case 10:
      return <Step10Summary form={form} helpers={helpers} />;
    default:
      return null;
  }
}

/**
 * Step 1: Basic Information
 */
function Step1BasicInfo({ form }: { form: ReturnType<typeof useForm<TripFormValues>> }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Informations de Base</h2>
      
      <Input
        label="Titre de la sortie"
        {...form.register('title')}
        error={form.formState.errors.title?.message}
        required
      />
      
      <div>
        <label className="medical-label">
          Description courte (150 caractères max)
        </label>
        <textarea
          {...form.register('shortDescription')}
          maxLength={150}
          rows={3}
          className="medical-input"
        />
        <p className="text-sm text-gray-500 mt-1">
          {form.watch('shortDescription')?.length || 0}/150
        </p>
      </div>
      
      <div>
        <label className="medical-label">Description longue</label>
        <textarea
          {...form.register('description')}
          rows={8}
          className="medical-input"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="medical-label">Catégorie</label>
          <select {...form.register('category')} className="medical-input">
            <option value="randonnée">Randonnée</option>
            <option value="camping">Camping</option>
            <option value="survie">Survie</option>
            <option value="photo">Photo</option>
          </select>
        </div>
      </div>
    </div>
  );
}

/**
 * Step 2: Practical Details
 */
function Step2PracticalDetails({ form }: { form: ReturnType<typeof useForm<TripFormValues>> }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Détails Pratiques</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Date de début"
          type="date"
          {...form.register('startDate', { valueAsDate: true })}
        />
        <Input
          label="Date de fin"
          type="date"
          {...form.register('endDate', { valueAsDate: true })}
        />
      </div>
      
      <Input
        label="Heure de rendez-vous"
        type="time"
        {...form.register('meetingTime')}
      />
      
      <div>
        <label className="medical-label">Point de rendez-vous</label>
        <Input
          {...form.register('meetingPointName')}
          placeholder="Nom du lieu"
        />
        <div className="grid grid-cols-2 gap-4 mt-2">
          <Input
            type="number"
            step="any"
            placeholder="Latitude"
            {...form.register('meetingPointLat', { valueAsNumber: true })}
          />
          <Input
            type="number"
            step="any"
            placeholder="Longitude"
            {...form.register('meetingPointLng', { valueAsNumber: true })}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="medical-label">Difficulté</label>
          <select {...form.register('difficulty')} className="medical-input">
            <option value="débutant">Facile</option>
            <option value="intermédiaire">Moyen</option>
            <option value="avancé">Difficile</option>
          </select>
        </div>
        <div>
          <label className="medical-label">Niveau physique requis</label>
          <select {...form.register('physicalLevel')} className="medical-input">
            <option value="débutant">Débutant</option>
            <option value="intermédiaire">Intermédiaire</option>
            <option value="avancé">Avancé</option>
          </select>
        </div>
        <Input
          label="Âge minimum"
          type="number"
          {...form.register('minAge', { valueAsNumber: true })}
        />
      </div>
    </div>
  );
}

/**
 * Step 3: Logistics
 */
function Step3Logistics({ form }: { form: ReturnType<typeof useForm<TripFormValues>> }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Logistique</h2>
      
      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Participants minimum"
          type="number"
          {...form.register('minParticipants', { valueAsNumber: true })}
        />
        <Input
          label="Participants maximum"
          type="number"
          {...form.register('maxParticipants', { valueAsNumber: true })}
        />
        <Input
          label="Prix par personne (DA)"
          type="number"
          {...form.register('price', { valueAsNumber: true })}
        />
      </div>
      
      <div>
        <label className="medical-label">Type d'hébergement</label>
        <select {...form.register('accommodation')} className="medical-input">
          <option value="tente">Tente</option>
          <option value="cabane">Cabane</option>
          <option value="refuge">Refuge</option>
          <option value="hôtel">Hôtel</option>
          <option value="autre">Autre</option>
        </select>
      </div>
      
      <div>
        <label className="medical-label">Repas</label>
        <select {...form.register('meals')} className="medical-input">
          <option value="all">Tous les repas inclus</option>
          <option value="some">Certains repas inclus</option>
          <option value="none">Aucun repas inclus</option>
        </select>
      </div>
    </div>
  );
}

/**
 * Step 4: Itinerary (simplified)
 */
function Step4Itinerary(_props: { helpers: any }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Programme & Itinéraire</h2>
      <p className="text-gray-600 dark:text-gray-400">
        Fonctionnalité d'ajout d'itinéraire à venir...
      </p>
    </div>
  );
}

/**
 * Step 5: Equipment (simplified)
 */
function Step5Equipment(_props: { helpers: any }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Équipement Recommandé</h2>
      <p className="text-gray-600 dark:text-gray-400">
        Fonctionnalité d'ajout d'équipement à venir...
      </p>
    </div>
  );
}

/**
 * Step 6: Media
 */
function Step6Media({ helpers }: { helpers: any }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Médias</h2>
      
      <div>
        <label className="medical-label">Photos</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            files.forEach((file) => helpers.handleImageUpload(file));
          }}
          className="medical-input"
        />
        {helpers.uploadingImages && <p className="text-sm text-gray-500">Téléchargement...</p>}
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {helpers.images.map((url: string, index: number) => (
          <div key={index} className="relative">
            <img src={url} alt={`Image ${index + 1}`} className="w-full h-32 object-cover rounded" />
            {helpers.mainImage === url && (
              <Badge text="Principale" variant="success" className="absolute top-2 left-2" />
            )}
            <button
              onClick={() => helpers.setMainImage(url)}
              className="absolute bottom-2 left-2 text-xs bg-primary-600 text-white px-2 py-1 rounded"
            >
              Définir principale
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Step 7: Guide (simplified)
 */
function Step7Guide(_props: { form: ReturnType<typeof useForm<TripFormValues>> }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Guide & Équipe</h2>
      <p className="text-gray-600 dark:text-gray-400">
        Sélection du guide à venir...
      </p>
    </div>
  );
}

/**
 * Step 8: Map (simplified)
 */
function Step8Map(_props: { form: ReturnType<typeof useForm<TripFormValues>> }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Carte & Zones</h2>
      <p className="text-gray-600 dark:text-gray-400">
        Interface de carte à venir...
      </p>
    </div>
  );
}

/**
 * Step 9: Settings
 */
function Step9Settings({ form }: { form: ReturnType<typeof useForm<TripFormValues>> }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Paramètres</h2>
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...form.register('visible')}
          className="w-4 h-4"
        />
        <label className="medical-label">Visible sur le site</label>
      </div>
      
      <Input
        label="Date limite d'inscription"
        type="date"
        {...form.register('enrollmentDeadline', { valueAsDate: true })}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Annulation gratuite (jours avant)"
          type="number"
          {...form.register('freeCancellationDays', { valueAsNumber: true })}
        />
        <Input
          label="Remboursement en cas d'annulation (%)"
          type="number"
          {...form.register('cancellationRefund', { valueAsNumber: true })}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...form.register('autoConfirm')}
          className="w-4 h-4"
        />
        <label className="medical-label">Confirmation automatique</label>
      </div>
    </div>
  );
}

/**
 * Step 10: Summary
 */
function Step10Summary({
  form,
  helpers: _helpers,
}: {
  form: ReturnType<typeof useForm<TripFormValues>>;
  helpers: any;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Récapitulatif</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Titre</h3>
          <p className="text-gray-600 dark:text-gray-400">{form.watch('title')}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Description</h3>
          <p className="text-gray-600 dark:text-gray-400">{form.watch('description')}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Dates</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {form.watch('startDate')?.toLocaleDateString()} - {form.watch('endDate')?.toLocaleDateString()}
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Prix</h3>
          <p className="text-gray-600 dark:text-gray-400">{form.watch('price')} DA</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Participants</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {form.watch('minParticipants')} - {form.watch('maxParticipants')}
          </p>
        </div>
      </div>
    </div>
  );
}

