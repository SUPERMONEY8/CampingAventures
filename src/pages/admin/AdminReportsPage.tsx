/**
 * Admin Reports Page
 * 
 * Page for generating reports in the admin panel.
 */

import { Card } from '../../components/ui/Card';
import { FileText, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function AdminReportsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Rapports</h1>
      
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <FileText className="w-8 h-8 text-green-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Génération de rapports</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Cette page permettra de générer et télécharger des rapports.
            </p>
          </div>
        </div>
        <div className="mt-6">
          <Button variant="outline" icon={Download}>
            Télécharger un rapport
          </Button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
          Fonctionnalité à venir...
        </p>
      </Card>
    </div>
  );
}

