/**
 * Forgot Password Page Component
 * 
 * Password reset page with email input and confirmation message.
 * Features glassmorphism design and smooth animations.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '../../utils/zodResolver';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

/**
 * Forgot password form schema validation
 */
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Forgot Password Page Component
 */
export function ForgotPasswordPage() {
  const { resetPassword, clearError } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  /**
   * Handle password reset request
   */
  const onSubmit = async (data: ForgotPasswordFormData): Promise<void> => {
    try {
      setIsSubmitting(true);
      clearError();
      await resetPassword(data.email);
      setIsSubmitted(true);
    } catch (err) {
      // Error is handled by AuthContext
      console.error('Password reset error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="medical-card">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                isSubmitted
                  ? 'bg-green-500'
                  : 'bg-gradient-to-r from-primary to-accent'
              }`}
            >
              {isSubmitted ? (
                <CheckCircle className="w-8 h-8 text-white" />
              ) : (
                <Mail className="w-8 h-8 text-white" />
              )}
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isSubmitted ? 'Email envoyé !' : 'Mot de passe oublié'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isSubmitted
                ? 'Vérifiez votre boîte de réception'
                : 'Entrez votre email pour recevoir un lien de réinitialisation'}
            </p>
          </div>

          {/* Success Message */}
          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300 mb-1">
                    Email de réinitialisation envoyé
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Nous avons envoyé un lien de réinitialisation à{' '}
                    <span className="font-semibold">{getValues('email')}</span>.
                    Vérifiez votre boîte de réception et vos spams.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Form */}
          {!isSubmitted ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="medical-label">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="medical-input"
                  placeholder="votre@email.com"
                  autoComplete="email"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.email.message}
                  </motion.p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="medical-button w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Envoyer le lien de réinitialisation
                  </>
                )}
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Note :</strong> Le lien de réinitialisation expire dans 1 heure.
                  Si vous ne recevez pas l'email, vérifiez votre dossier spam ou réessayez.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="medical-button w-full flex items-center justify-center gap-2"
              >
                Envoyer un autre email
              </button>
            </motion.div>
          )}

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-accent font-semibold transition-smooth"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


