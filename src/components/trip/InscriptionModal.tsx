/**
 * Inscription Modal Component
 * 
 * Multi-step modal for trip enrollment with 5 steps:
 * 1. Confirmation & Terms
 * 2. Additional Information
 * 3. Medical Verification
 * 4. Payment
 * 5. Confirmation
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
  CreditCard,
  Shield,
  AlertCircle,
  Download,
  Mail,
  Calendar,
  MapPin,
  Users,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { enrollToTrip, uploadPaymentProof, checkAvailability, type EnrollmentData } from '../../services/trip.service';
import { useAuth } from '../../hooks/useAuth';
import { useUserProfile } from '../../hooks/useUser';
import type { Trip, PaymentMethod, DietaryPreference } from '../../types';
import { formatDate } from '../../utils/date';

/**
 * InscriptionModal props
 */
interface InscriptionModalProps {
  /**
   * Whether modal is open
   */
  open: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Trip data
   */
  trip: Trip;

  /**
   * On successful enrollment
   */
  onSuccess?: (enrollmentId: string) => void;
}

/**
 * Step configuration
 */
const steps = [
  { id: 1, title: 'Confirmation', icon: CheckCircle2 },
  { id: 2, title: 'Informations', icon: FileText },
  { id: 3, title: 'Médical', icon: Shield },
  { id: 4, title: 'Paiement', icon: CreditCard },
  { id: 5, title: 'Confirmation', icon: CheckCircle2 },
];

/**
 * InscriptionModal Component
 */
export function InscriptionModal({ open, onClose, trip, onSuccess }: InscriptionModalProps) {
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile(user?.id);
  
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservationNumber, setReservationNumber] = useState<string>('');

  // Form data
  const [formData, setFormData] = useState<Partial<EnrollmentData>>({
    acceptedTerms: false,
    dietaryPreference: 'omnivore',
    needsTransport: false,
    medicalInfoConfirmed: false,
    totalAmount: trip.price || 0,
  });

  // Payment data
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [transactionNumber, setTransactionNumber] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null);

  // Check availability on mount
  useEffect(() => {
    if (open && trip.id) {
      checkAvailability(trip.id).catch((err: Error) => {
        setError('Impossible de vérifier la disponibilité');
        console.error(err);
      });
    }
  }, [open, trip.id]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setCurrentStep(1);
      setFormData({
        acceptedTerms: false,
        dietaryPreference: 'omnivore',
        needsTransport: false,
        medicalInfoConfirmed: false,
        totalAmount: trip.price || 0,
      });
      setError(null);
      setPaymentMethod('');
      setPaymentProof(null);
      setTransactionNumber('');
      setPaymentProofUrl(null);
      setReservationNumber('');
    }
  }, [open, trip.price]);

  /**
   * Handle next step
   */
  const handleNext = async (): Promise<void> => {
    // Validate current step
    if (!validateStep(currentStep)) {
      return;
    }

    // If on payment step, process enrollment
    if (currentStep === 4) {
      await handleEnrollment();
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  /**
   * Handle previous step
   */
  const handlePrevious = (): void => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError(null);
  };

  /**
   * Validate current step
   */
  const validateStep = (step: number): boolean => {
    setError(null);

    switch (step) {
      case 1:
        if (!formData.acceptedTerms) {
          setError('Vous devez accepter les conditions pour continuer');
          return false;
        }
        return true;

      case 2:
        // Step 2 is optional, always valid
        return true;

      case 3:
        if (!formData.medicalInfoConfirmed) {
          setError('Vous devez confirmer que vos informations médicales sont à jour');
          return false;
        }
        return true;

      case 4:
        if (!paymentMethod) {
          setError('Veuillez sélectionner un mode de paiement');
          return false;
        }
        if (paymentMethod !== 'on-site' && !paymentProof && !paymentProofUrl) {
          setError('Veuillez téléverser une preuve de paiement');
          return false;
        }
        if (paymentMethod !== 'on-site' && !transactionNumber) {
          setError('Veuillez entrer le numéro de transaction');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  /**
   * Handle enrollment submission
   */
  const handleEnrollment = async (): Promise<void> => {
    if (!user || !userProfile) {
      setError('Vous devez être connecté pour vous inscrire');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload payment proof if provided
      let proofUrl = paymentProofUrl;
      if (paymentProof && !proofUrl) {
        // We'll upload after enrollment creation
        proofUrl = 'pending';
      }

      // Prepare enrollment data
      const enrollmentData: EnrollmentData = {
        acceptedTerms: formData.acceptedTerms || false,
        dietaryPreference: formData.dietaryPreference,
        tshirtSize: formData.tshirtSize,
        needsTransport: formData.needsTransport,
        transportPickupPoint: formData.transportPickupPoint,
        additionalQuestions: formData.additionalQuestions,
        medicalInfoConfirmed: formData.medicalInfoConfirmed || false,
        paymentMethod: paymentMethod as PaymentMethod,
        transactionNumber: transactionNumber || undefined,
        totalAmount: formData.totalAmount || trip.price || 0,
      };

      // Create enrollment
      const enrollment = await enrollToTrip(
        trip.id,
        user.id,
        {
          name: userProfile.name,
          email: user.email || '',
        },
        enrollmentData
      );

      setReservationNumber(enrollment.reservationNumber);

      // Upload payment proof if provided
      if (paymentProof && enrollment.id) {
        try {
          const uploadedUrl = await uploadPaymentProof(enrollment.id, paymentProof);
          setPaymentProofUrl(uploadedUrl);
        } catch (uploadError) {
          console.error('Error uploading payment proof:', uploadError);
          // Don't fail enrollment if proof upload fails
        }
      }

      // Move to confirmation step
      setCurrentStep(5);
      if (onSuccess) {
        onSuccess(enrollment.id);
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle payment proof upload
   */
  const handlePaymentProofChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Le fichier doit être une image');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Le fichier ne doit pas dépasser 5MB');
        return;
      }
      setPaymentProof(file);
      setError(null);
    }
  };

  /**
   * Download summary PDF (placeholder)
   */
  const handleDownloadSummary = (): void => {
    // TODO: Generate and download PDF
    alert('Fonctionnalité de téléchargement PDF à venir');
  };

  /**
   * Calculate progress percentage
   */
  const progress = (currentStep / steps.length) * 100;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Inscription à la sortie"
      maxWidth="max-w-3xl"
      closeOnBackdropClick={currentStep === 5}
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Étape {currentStep} sur {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex items-center justify-between">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center gap-1 ${
                    isActive ? 'text-primary' : isCompleted ? 'text-green-500' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                    }`}
                  >
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 1: Confirmation */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <Card title="Récapitulatif de la sortie">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      {trip.images && trip.images[0] && (
                        <img
                          src={trip.images[0]}
                          alt={trip.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {trip.title}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDate(trip.date)}
                            {trip.endDate && ` - ${formatDate(trip.endDate)}`}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {trip.location.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {trip.participants?.length || 0} / {trip.maxParticipants} participants
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">Prix de la sortie</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {trip.price ? `${trip.price} DA` : 'Gratuit'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Frais de service</span>
                      <span className="text-gray-600 dark:text-gray-400">0 DA</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex items-center justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                      <span className="text-xl font-bold text-primary">
                        {trip.price ? `${trip.price} DA` : 'Gratuit'}
                      </span>
                    </div>
                  </div>
                </Card>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={formData.acceptedTerms}
                    onChange={(e) =>
                      setFormData({ ...formData, acceptedTerms: e.target.checked })
                    }
                    className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-gray-700 dark:text-gray-300">
                    J'ai lu et j'accepte les{' '}
                    <a href="/terms" target="_blank" className="text-primary hover:underline">
                      conditions générales
                    </a>{' '}
                    et la{' '}
                    <a href="/privacy" target="_blank" className="text-primary hover:underline">
                      politique de confidentialité
                    </a>
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: Additional Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <Card title="Informations complémentaires">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Régime alimentaire
                      </label>
                      <select
                        value={formData.dietaryPreference || 'omnivore'}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dietaryPreference: e.target.value as DietaryPreference,
                          })
                        }
                        className="medical-input w-full"
                      >
                        <option value="omnivore">Omnivore</option>
                        <option value="végétarien">Végétarien</option>
                        <option value="vegan">Vegan</option>
                        <option value="sans-gluten">Sans gluten</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Taille de t-shirt (pour goodies éventuels)
                      </label>
                      <select
                        value={formData.tshirtSize || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, tshirtSize: e.target.value })
                        }
                        className="medical-input w-full"
                      >
                        <option value="">Non applicable</option>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <input
                          type="checkbox"
                          id="needsTransport"
                          checked={formData.needsTransport}
                          onChange={(e) =>
                            setFormData({ ...formData, needsTransport: e.target.checked })
                          }
                          className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <label
                          htmlFor="needsTransport"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          J'ai besoin de transport
                        </label>
                      </div>
                      {formData.needsTransport && (
                        <select
                          value={formData.transportPickupPoint || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, transportPickupPoint: e.target.value })
                          }
                          className="medical-input w-full mt-2"
                        >
                          <option value="">Sélectionner un point de départ</option>
                          <option value="alger">Alger</option>
                          <option value="batna">Batna</option>
                          <option value="constantine">Constantine</option>
                          <option value="annaba">Annaba</option>
                          <option value="autre">Autre</option>
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Questions supplémentaires (optionnel)
                      </label>
                      <textarea
                        value={formData.additionalQuestions || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, additionalQuestions: e.target.value })
                        }
                        rows={4}
                        className="medical-input w-full"
                        placeholder="Avez-vous des questions ou des besoins particuliers ?"
                      />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Step 3: Medical Verification */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <Card title="Vérification des informations médicales">
                  <div className="space-y-4">
                    {userProfile?.medicalInfo ? (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Vos informations médicales enregistrées
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {userProfile.medicalInfo.bloodType && (
                            <p>Groupe sanguin: {userProfile.medicalInfo.bloodType}</p>
                          )}
                          {userProfile.medicalInfo.allergies && userProfile.medicalInfo.allergies.length > 0 && (
                            <p>Allergies: {userProfile.medicalInfo.allergies.join(', ')}</p>
                          )}
                          {userProfile.medicalInfo.medications && userProfile.medicalInfo.medications.length > 0 && (
                            <p>Médicaments: {userProfile.medicalInfo.medications.join(', ')}</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Open medical info update modal
                            window.location.href = '/profile?tab=medical';
                          }}
                          className="mt-2"
                        >
                          Mettre à jour
                        </Button>
                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-400">
                          Aucune information médicale enregistrée. Veuillez les compléter dans votre profil.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            window.location.href = '/profile?tab=medical';
                          }}
                          className="mt-2"
                        >
                          Compléter mes informations
                        </Button>
                      </div>
                    )}

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800 dark:text-blue-400">
                          <p className="font-medium mb-1">Important pour votre sécurité</p>
                          <p>
                            Vos informations médicales sont essentielles pour assurer votre sécurité
                            pendant la sortie. Veuillez vous assurer qu'elles sont à jour.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="medicalConfirmed"
                        checked={formData.medicalInfoConfirmed}
                        onChange={(e) =>
                          setFormData({ ...formData, medicalInfoConfirmed: e.target.checked })
                        }
                        className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <label
                        htmlFor="medicalConfirmed"
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
                        Je confirme que mes informations médicales sont à jour et exactes
                      </label>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Step 4: Payment */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <Card title="Paiement">
                  <div className="space-y-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          Montant total
                        </span>
                        <span className="text-2xl font-bold text-primary">
                          {trip.price ? `${trip.price} DA` : 'Gratuit'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Mode de paiement
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary transition-colors">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="ccp"
                            checked={paymentMethod === 'ccp'}
                            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">CCP</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Compte CCP: 123 456 789 012 345
                              <br />
                              Nom: Camping Aventures
                              <br />
                              Référence: {reservationNumber || 'À générer'}
                            </p>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary transition-colors">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="baridimob"
                            checked={paymentMethod === 'baridimob'}
                            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">BaridiMob</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Numéro: 0555 123 456
                              <br />
                              Référence: {reservationNumber || 'À générer'}
                            </p>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary transition-colors">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="on-site"
                            checked={paymentMethod === 'on-site'}
                            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              Paiement sur place
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Vous paierez directement le jour de la sortie
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {paymentMethod && paymentMethod !== 'on-site' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Numéro de transaction
                          </label>
                          <Input
                            type="text"
                            value={transactionNumber}
                            onChange={(e) => setTransactionNumber(e.target.value)}
                            placeholder="Entrez le numéro de transaction"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Preuve de paiement (image)
                          </label>
                          <div className="flex items-center gap-4">
                            <label className="flex-1">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handlePaymentProofChange}
                                className="hidden"
                                id="paymentProof"
                              />
                              <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary transition-colors">
                                <Upload className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {paymentProof
                                    ? paymentProof.name
                                    : 'Cliquez pour téléverser une image'}
                                </span>
                              </div>
                            </label>
                            {paymentProof && (
                              <img
                                src={URL.createObjectURL(paymentProof)}
                                alt="Payment proof"
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* Step 5: Confirmation */}
            {currentStep === 5 && (
              <div className="space-y-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                >
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  </div>
                </motion.div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Inscription confirmée ! 🎉
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Votre inscription a été enregistrée avec succès
                  </p>
                </div>

                <Card>
                  <div className="space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Numéro de réservation</span>
                      <span className="font-mono font-semibold text-gray-900 dark:text-white">
                        {reservationNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4" />
                      <span>Email de confirmation envoyé à {user?.email}</span>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Prochaines étapes
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 text-left">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Vous recevrez un email de confirmation avec tous les détails
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        {paymentMethod === 'on-site'
                          ? 'Le paiement se fera sur place le jour de la sortie'
                          : 'Votre paiement sera vérifié sous 24-48h'}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Un rappel vous sera envoyé 3 jours avant la sortie
                      </span>
                    </li>
                  </ul>
                </Card>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="primary"
                    onClick={() => {
                      window.location.href = `/trips/${trip.id}`;
                    }}
                    className="flex-1"
                  >
                    Voir ma sortie
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownloadSummary}
                    icon={Download}
                    className="flex-1"
                  >
                    Télécharger le récapitulatif
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={currentStep > 1 ? handlePrevious : onClose}
              icon={currentStep > 1 ? ChevronLeft : X}
              disabled={loading}
            >
              {currentStep > 1 ? 'Précédent' : 'Annuler'}
            </Button>
            <Button
              variant="primary"
              onClick={handleNext}
              icon={currentStep < 4 ? ChevronRight : CheckCircle2}
              iconPosition="right"
              loading={loading && currentStep === 4}
              disabled={loading}
            >
              {currentStep < 4 ? 'Suivant' : 'Confirmer l\'inscription'}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

