/**
 * Admin Trips Page
 * 
 * Page for managing trips in the admin panel.
 */

import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus } from 'lucide-react';

export function AdminTripsPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Sorties</h1>
        <Button variant="primary" icon={Plus}>
          Créer une sortie
        </Button>
      </div>
      
      <Card className="p-6">
        <p className="text-gray-600 dark:text-gray-400">
          Cette page permettra de gérer toutes les sorties (créer, modifier, supprimer).
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          Fonctionnalité à venir...
        </p>
      </Card>
    </div>
  );
}

