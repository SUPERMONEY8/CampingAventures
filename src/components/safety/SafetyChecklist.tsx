/**
 * Safety Checklist Component
 * 
 * Pre-departure safety checklist that must be completed
 * before starting a trip.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, AlertTriangle, Shield } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { SafetyChecklistItem } from '../../types';

/**
 * SafetyChecklist props
 */
interface SafetyChecklistProps {
  /**
   * On checklist complete
   */
  onComplete: () => void;

  /**
   * Initial checklist items (optional)
   */
  initialItems?: SafetyChecklistItem[];
}

/**
 * Default safety checklist items
 */
const defaultChecklistItems: SafetyChecklistItem[] = [
  {
    id: 'battery',
    label: 'Batterie chargée',
    description: 'Vérifiez que votre téléphone est chargé à au moins 80%',
    checked: false,
    required: true,
    category: 'device',
  },
  {
    id: 'offline-map',
    label: 'Carte hors ligne téléchargée',
    description: 'Téléchargez la carte de la zone pour l\'accès hors ligne',
    checked: false,
    required: true,
    category: 'preparation',
  },
  {
    id: 'emergency-contact',
    label: 'Contact d\'urgence à jour',
    description: 'Vérifiez que votre contact d\'urgence est à jour',
    checked: false,
    required: true,
    category: 'communication',
  },
  {
    id: 'medical-info',
    label: 'Infos médicales à jour',
    description: 'Vérifiez que vos informations médicales sont complètes',
    checked: false,
    required: true,
    category: 'medical',
  },
  {
    id: 'gps-enabled',
    label: 'Signal GPS activé',
    description: 'Activez le GPS pour le suivi de sécurité',
    checked: false,
    required: true,
    category: 'device',
  },
  {
    id: 'first-aid',
    label: 'Trousse de secours',
    description: 'Vérifiez que vous avez une trousse de secours',
    checked: false,
    required: false,
    category: 'preparation',
  },
];

/**
 * SafetyChecklist Component
 */
export function SafetyChecklist({ onComplete, initialItems }: SafetyChecklistProps) {
  const [items, setItems] = useState<SafetyChecklistItem[]>(
    initialItems || defaultChecklistItems
  );

  /**
   * Toggle item checked state
   */
  const toggleItem = (id: string): void => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  /**
   * Check if all required items are checked
   */
  const allRequiredChecked = items
    .filter((item) => item.required)
    .every((item) => item.checked);

  /**
   * Get completion percentage
   */
  const completionPercentage = Math.round(
    (items.filter((item) => item.checked).length / items.length) * 100
  );

  /**
   * Handle complete
   */
  const handleComplete = (): void => {
    if (allRequiredChecked) {
      // Save checklist completion
      localStorage.setItem('safetyChecklistCompleted', JSON.stringify({
        items,
        completedAt: new Date().toISOString(),
      }));
      onComplete();
    }
  };

  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SafetyChecklistItem[]>);

  const categoryLabels: Record<string, string> = {
    device: 'Appareil',
    preparation: 'Préparation',
    medical: 'Médical',
    communication: 'Communication',
  };

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-primary" />
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Checklist de Sécurité
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Vérifiez tous les éléments avant de commencer
          </p>
        </div>
        <Badge text={`${completionPercentage}%`} variant={allRequiredChecked ? 'success' : 'warning'} />
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Checklist Items by Category */}
      <div className="space-y-6 mb-6">
        {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
          <div key={category}>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
              {categoryLabels[category] || category}
            </h4>
            <div className="space-y-2">
              {categoryItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    item.checked
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : item.required
                      ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {item.checked ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`font-semibold ${
                            item.checked
                              ? 'text-green-700 dark:text-green-300'
                              : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.required && (
                          <Badge text="Requis" variant="danger" className="text-xs" />
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Warning if not all required checked */}
      {!allRequiredChecked && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-4">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Tous les éléments requis doivent être cochés avant de commencer
          </p>
        </div>
      )}

      {/* Complete Button */}
      <Button
        variant="primary"
        onClick={handleComplete}
        disabled={!allRequiredChecked}
        className="w-full"
        size="lg"
      >
        {allRequiredChecked ? 'Commencer la Sortie' : 'Vérifiez tous les éléments requis'}
      </Button>
    </Card>
  );
}

