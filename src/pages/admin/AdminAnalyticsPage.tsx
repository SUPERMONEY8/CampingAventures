/**
 * Admin Analytics Page
 * 
 * Page for viewing analytics in the admin panel.
 */

import { Card } from '../../components/ui/Card';
import { BarChart3 } from 'lucide-react';

export function AdminAnalyticsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Analytiques</h1>
      
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <BarChart3 className="w-8 h-8 text-blue-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Statistiques détaillées</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Cette page affichera des analyses approfondies et des statistiques.
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

