/**
 * Admin Users Page
 * 
 * Page for managing users in the admin panel.
 */

import { Card } from '../../components/ui/Card';
import { Users } from 'lucide-react';

export function AdminUsersPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Gestion des Utilisateurs</h1>
      
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Users className="w-8 h-8 text-primary-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Liste des utilisateurs</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Cette page permettra de voir et gérer tous les utilisateurs.
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
          Fonctionnalité à venir...
        </p>
      </Card>
    </div>
  );
}

