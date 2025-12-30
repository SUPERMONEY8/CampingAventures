/**
 * Admin Reviews Page
 * 
 * Page for managing reviews in the admin panel.
 */

import { Card } from '../../components/ui/Card';
import { Star } from 'lucide-react';

export function AdminReviewsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Gestion des Avis</h1>
      
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Star className="w-8 h-8 text-yellow-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Avis des utilisateurs</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Cette page permettra de voir et modérer tous les avis.
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

