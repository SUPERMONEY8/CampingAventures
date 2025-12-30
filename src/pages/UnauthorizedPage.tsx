/**
 * Unauthorized Page
 * 
 * Page displayed when user tries to access a route without required permissions.
 */

import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

/**
 * UnauthorizedPage Component
 */
export function UnauthorizedPage() {
  const location = useLocation();
  const state = location.state as { from?: Location; requiredRole?: string | string[] } | null;
  const requiredRole = state?.requiredRole;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full"
      >
        <Card className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-6"
          >
            <ShieldAlert className="w-24 h-24 mx-auto text-red-500" />
          </motion.div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Accès non autorisé
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>

          {requiredRole && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Rôle requis : {Array.isArray(requiredRole) ? requiredRole.join(' ou ') : requiredRole}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              icon={Home}
              onClick={() => window.location.href = '/'}
              className="w-full sm:w-auto"
            >
              Retour à l'accueil
            </Button>
            <Button
              variant="outline"
              icon={ArrowLeft}
              onClick={() => window.history.back()}
              className="w-full sm:w-auto"
            >
              Page précédente
            </Button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
            Si vous pensez que c'est une erreur, contactez un administrateur.
          </p>
        </Card>
      </motion.div>
    </div>
  );
}

