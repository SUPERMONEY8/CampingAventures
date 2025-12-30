/**
 * Signup Page Component
 * 
 * Multi-step registration form with progress bar and animations.
 * Features glassmorphism design, form validation, and smooth transitions.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '../../utils/zodResolver';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  Calendar,
  Phone,
  UserCircle,
  Heart,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { PhysicalLevel, Interest, EmergencyContact } from '../../types';

/**
 * Step 1: Account Information Schema
 */
const step1Schema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
  password: z
    .string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirmPassword: z.string().min(1, 'Veuillez confirmer votre mot de passe'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

/**
 * Step 2: Personal Information Schema
 */
const step2Schema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  age: z
    .number()
    .min(18, 'Vous devez avoir au moins 18 ans')
    .max(100, 'Âge invalide'),
  emergencyContactName: z
    .string()
    .min(2, 'Le nom du contact doit contenir au moins 2 caractères'),
  emergencyContactPhone: z
    .string()
    .min(10, 'Le numéro de téléphone doit contenir au moins 10 chiffres')
    .regex(/^[0-9+\-\s()]+$/, 'Format de téléphone invalide'),
  emergencyContactRelationship: z
    .string()
    .min(2, 'La relation doit contenir au moins 2 caractères'),
});

/**
 * Step 3: Preferences Schema
 */
const step3Schema = z.object({
  physicalLevel: z.enum(['débutant', 'intermédiaire', 'avancé']).refine(
    (val) => val !== undefined,
    { message: 'Veuillez sélectionner votre niveau physique' }
  ),
  interests: z
    .array(z.enum(['randonnée', 'photo', 'survie', 'détente', 'social']))
    .min(1, 'Veuillez sélectionner au moins un centre d\'intérêt'),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Vous devez accepter les conditions d\'utilisation',
  }),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

/**
 * Signup Page Component
 */
export function SignupPage() {
  const navigate = useNavigate();
  const { signUp, loading, error, clearError, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Form handlers for each step
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    mode: 'onChange',
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    mode: 'onChange',
  });

  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    mode: 'onChange',
    defaultValues: {
      interests: [],
      acceptTerms: false,
    },
  });

  /**
   * Handle step 1 submission
   */
  const onStep1Submit = (_data: Step1Data): void => {
    setCurrentStep(2);
  };

  /**
   * Handle step 2 submission
   */
  const onStep2Submit = (_data: Step2Data): void => {
    setCurrentStep(3);
  };

  /**
   * Handle step 3 submission and final registration
   */
  const onStep3Submit = async (data: Step3Data): Promise<void> => {
    try {
      setIsSubmitting(true);
      clearError();

      const step1Data = step1Form.getValues();
      const step2Data = step2Form.getValues();

      const userData = {
        name: step2Data.name,
        age: step2Data.age,
        emergencyContact: {
          name: step2Data.emergencyContactName,
          phone: step2Data.emergencyContactPhone,
          relationship: step2Data.emergencyContactRelationship,
        } as EmergencyContact,
        physicalLevel: data.physicalLevel as PhysicalLevel,
        interests: data.interests as Interest[],
      };

      await signUp(step1Data.email, step1Data.password, userData);
      navigate('/', { replace: true });
    } catch (err) {
      // Error is handled by AuthContext
      console.error('Signup error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Go to previous step
   */
  const goToPreviousStep = (): void => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Toggle interest selection
   */
  const toggleInterest = (interest: Interest): void => {
    const currentInterests = step3Form.getValues('interests') || [];
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter((i) => i !== interest)
      : [...currentInterests, interest];
    step3Form.setValue('interests', newInterests);
  };

  const steps = [
    { number: 1, title: 'Compte', icon: Mail },
    { number: 2, title: 'Profil', icon: User },
    { number: 3, title: 'Préférences', icon: Heart },
  ];

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="medical-card">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full mb-4"
            >
              <UserCircle className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Créer un compte
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Rejoignez notre communauté d'aventuriers
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
                  {steps.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep >= step.number;
                const isCurrent = currentStep === step.number;

                return (
                  <div
                    key={step.number}
                    className="flex flex-col items-center flex-1"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-smooth ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      }`}
                    >
                      {isActive && !isCurrent ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isCurrent
                          ? 'text-primary'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </motion.div>
          )}

          {/* Step Forms */}
          <AnimatePresence mode="wait">
            {/* Step 1: Account Information */}
            {currentStep === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={step1Form.handleSubmit(onStep1Submit)}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="email" className="medical-label">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...step1Form.register('email')}
                    className="medical-input"
                    placeholder="votre@email.com"
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                  {step1Form.formState.errors.email && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {step1Form.formState.errors.email.message}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="medical-label">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...step1Form.register('password')}
                      className="medical-input pr-10"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      tabIndex={-1}
                    >
                      <Lock className="w-5 h-5" />
                    </button>
                  </div>
                  {step1Form.formState.errors.password && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {step1Form.formState.errors.password.message}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="medical-label">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...step1Form.register('confirmPassword')}
                      className="medical-input pr-10"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      tabIndex={-1}
                    >
                      <Lock className="w-5 h-5" />
                    </button>
                  </div>
                  {step1Form.formState.errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {step1Form.formState.errors.confirmPassword.message}
                    </motion.p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="medical-button w-full flex items-center justify-center gap-2"
                >
                  Suivant
                  <ChevronRight className="w-5 h-5" />
                </button>
              </motion.form>
            )}

            {/* Step 2: Personal Information */}
            {currentStep === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={step2Form.handleSubmit(onStep2Submit)}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="name" className="medical-label">
                    <User className="w-4 h-4 inline mr-2" />
                    Nom complet
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...step2Form.register('name')}
                    className="medical-input"
                    placeholder="Jean Dupont"
                    autoComplete="name"
                    disabled={isSubmitting}
                  />
                  {step2Form.formState.errors.name && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {step2Form.formState.errors.name.message}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label htmlFor="age" className="medical-label">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Âge
                  </label>
                  <input
                    id="age"
                    type="number"
                    {...step2Form.register('age', { valueAsNumber: true })}
                    className="medical-input"
                    placeholder="25"
                    min="18"
                    max="100"
                    disabled={isSubmitting}
                  />
                  {step2Form.formState.errors.age && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {step2Form.formState.errors.age.message}
                    </motion.p>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Contact d'urgence
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="emergencyContactName" className="medical-label">
                        Nom du contact
                      </label>
                      <input
                        id="emergencyContactName"
                        type="text"
                        {...step2Form.register('emergencyContactName')}
                        className="medical-input"
                        placeholder="Marie Dupont"
                        disabled={isSubmitting}
                      />
                      {step2Form.formState.errors.emergencyContactName && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {step2Form.formState.errors.emergencyContactName.message}
                        </motion.p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="emergencyContactPhone" className="medical-label">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Téléphone
                      </label>
                      <input
                        id="emergencyContactPhone"
                        type="tel"
                        {...step2Form.register('emergencyContactPhone')}
                        className="medical-input"
                        placeholder="+33 6 12 34 56 78"
                        disabled={isSubmitting}
                      />
                      {step2Form.formState.errors.emergencyContactPhone && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {step2Form.formState.errors.emergencyContactPhone.message}
                        </motion.p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="emergencyContactRelationship" className="medical-label">
                        Relation
                      </label>
                      <input
                        id="emergencyContactRelationship"
                        type="text"
                        {...step2Form.register('emergencyContactRelationship')}
                        className="medical-input"
                        placeholder="Conjoint, Parent, Ami..."
                        disabled={isSubmitting}
                      />
                      {step2Form.formState.errors.emergencyContactRelationship && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {step2Form.formState.errors.emergencyContactRelationship.message}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-smooth flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Précédent
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 medical-button flex items-center justify-center gap-2"
                  >
                    Suivant
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.form>
            )}

            {/* Step 3: Preferences */}
            {currentStep === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={step3Form.handleSubmit(onStep3Submit)}
                className="space-y-6"
              >
                <div>
                  <label className="medical-label">
                    Niveau physique
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {(['débutant', 'intermédiaire', 'avancé'] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => step3Form.setValue('physicalLevel', level)}
                        className={`p-4 rounded-lg border-2 transition-smooth ${
                          step3Form.watch('physicalLevel') === level
                            ? 'border-primary bg-primary/10 dark:bg-primary/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
                        }`}
                      >
                        <div className="text-sm font-semibold capitalize">
                          {level}
                        </div>
                      </button>
                    ))}
                  </div>
                  {step3Form.formState.errors.physicalLevel && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {step3Form.formState.errors.physicalLevel.message}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="medical-label">
                    Centres d'intérêt (sélectionnez au moins un)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(['randonnée', 'photo', 'survie', 'détente', 'social'] as const).map((interest) => {
                      const isSelected = step3Form.watch('interests')?.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`p-3 rounded-lg border-2 transition-smooth flex items-center justify-center gap-2 ${
                            isSelected
                              ? 'border-primary bg-primary/10 dark:bg-primary/20'
                              : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
                          }`}
                        >
                          {isSelected && <CheckCircle className="w-4 h-4 text-primary" />}
                          <span className="text-sm font-medium capitalize">{interest}</span>
                        </button>
                      );
                    })}
                  </div>
                  {step3Form.formState.errors.interests && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {step3Form.formState.errors.interests.message}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...step3Form.register('acceptTerms')}
                      className="mt-1 w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      J'accepte les{' '}
                      <Link to="/terms" className="text-primary hover:underline">
                        conditions d'utilisation
                      </Link>{' '}
                      et la{' '}
                      <Link to="/privacy" className="text-primary hover:underline">
                        politique de confidentialité
                      </Link>
                    </span>
                  </label>
                  {step3Form.formState.errors.acceptTerms && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {step3Form.formState.errors.acceptTerms.message}
                    </motion.p>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-smooth flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Précédent
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !step3Form.watch('acceptTerms')}
                    className="flex-1 medical-button flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Inscription...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Créer mon compte
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Déjà un compte ?{' '}
              <Link
                to="/auth/login"
                className="text-primary hover:text-accent font-semibold transition-smooth"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


