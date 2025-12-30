/**
 * Medical Info Component
 * 
 * Quick access component for displaying medical information
 * in a simplified format for first responders.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Lock, Unlock } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useUserProfile } from '../../hooks/useUser';
import { useAuth } from '../../hooks/useAuth';
import type { MedicalInfo as MedicalInfoType } from '../../types';

/**
 * MedicalInfo props
 */
interface MedicalInfoProps {
  /**
   * Whether to show as compact card
   */
  compact?: boolean;

  /**
   * Whether info is locked (requires unlock to view)
   */
  locked?: boolean;
}

/**
 * MedicalInfo Component
 */
export function MedicalInfo({ compact = false, locked = false }: MedicalInfoProps) {
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile(user?.id);
  const [isUnlocked, setIsUnlocked] = useState(!locked);
  const [showFull, setShowFull] = useState(false);

  const medicalInfo = userProfile?.medicalInfo;

  if (!medicalInfo) {
    return (
      <Card>
        <div className="text-center py-4">
          <Heart className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Aucune information médicale enregistrée
          </p>
        </div>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Infos Médicales
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFull(!showFull)}
          >
            {showFull ? 'Masquer' : 'Afficher'}
          </Button>
        </div>
        <AnimatePresence>
          {showFull && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
            >
              <MedicalInfoContent medicalInfo={medicalInfo} />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    );
  }

  if (locked && !isUnlocked) {
    return (
      <Card className="text-center py-8">
        <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          Informations Médicales Verrouillées
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Cliquez pour déverrouiller et afficher les informations médicales
        </p>
        <Button
          variant="primary"
          icon={Unlock}
          onClick={() => setIsUnlocked(true)}
        >
          Déverrouiller
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Informations Médicales
          </h3>
        </div>
        {locked && (
          <Button
            variant="ghost"
            size="sm"
            icon={Lock}
            onClick={() => setIsUnlocked(false)}
          >
            Verrouiller
          </Button>
        )}
      </div>
      <MedicalInfoContent medicalInfo={medicalInfo} />
    </Card>
  );
}

/**
 * Medical Info Content Component
 */
function MedicalInfoContent({ medicalInfo }: { medicalInfo: MedicalInfoType }) {
  return (
    <div className="space-y-4">
      {/* Blood Type */}
      {medicalInfo.bloodType && (
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Groupe Sanguin
          </label>
          <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-1">
            {medicalInfo.bloodType}
          </p>
        </div>
      )}

      {/* Allergies */}
      {medicalInfo.allergies && medicalInfo.allergies.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Allergies
          </label>
          <div className="mt-1 space-y-1">
            {medicalInfo.allergies.map((allergy, index) => (
              <p key={index} className="text-sm text-gray-900 dark:text-white bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                ⚠️ {allergy}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Medications */}
      {medicalInfo.medications && medicalInfo.medications.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Médicaments Actuels
          </label>
          <div className="mt-1 space-y-1">
            {medicalInfo.medications.map((med, index) => (
              <p key={index} className="text-sm text-gray-900 dark:text-white">
                💊 {med}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Conditions */}
      {medicalInfo.conditions && medicalInfo.conditions.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Conditions Médicales
          </label>
          <div className="mt-1 space-y-1">
            {medicalInfo.conditions.map((condition, index) => (
              <p key={index} className="text-sm text-gray-900 dark:text-white">
                🏥 {condition}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!medicalInfo.bloodType &&
        (!medicalInfo.allergies || medicalInfo.allergies.length === 0) &&
        (!medicalInfo.medications || medicalInfo.medications.length === 0) &&
        (!medicalInfo.conditions || medicalInfo.conditions.length === 0) && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            Aucune information médicale spécifique
          </p>
        )}
    </div>
  );
}

