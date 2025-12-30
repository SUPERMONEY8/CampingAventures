/**
 * SOS Emergency Page
 * 
 * Emergency page displayed when SOS is triggered.
 * Accessible offline, with all critical information.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Phone,
  MapPin,
  X,
  CheckCircle2,
  User,
  Building2,
  Shield,
} from 'lucide-react';
import { getSafetyInfo, resolveSOS, getActiveSOSAlerts } from '../services/safety.service';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

/**
 * SOSPage Component
 */
export function SOSPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [safetyInfo, setSafetyInfo] = useState<any>(null);
  const [activeAlert, setActiveAlert] = useState<any>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [resolving, setResolving] = useState(false);

  // Load safety info
  useEffect(() => {
    if (id) {
      getSafetyInfo(id).then(setSafetyInfo).catch(console.error);
    }
  }, [id]);

  // Load active SOS alert
  useEffect(() => {
    if (user?.id) {
      getActiveSOSAlerts(user.id).then((alerts) => {
        if (alerts.length > 0) {
          setActiveAlert(alerts[0]);
        }
      }).catch(console.error);
    }
  }, [user?.id]);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('GPS error:', error);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  /**
   * Handle resolve SOS
   */
  const handleResolve = async (): Promise<void> => {
    if (!activeAlert) return;

    if (confirm('Êtes-vous sûr de vouloir annuler l\'alerte ?')) {
      setResolving(true);
      try {
        await resolveSOS(activeAlert.id, 'Alerte annulée par l\'utilisateur');
        navigate(`/trips/${id}/live`);
      } catch (error) {
        console.error('Error resolving SOS:', error);
        alert('Erreur lors de l\'annulation de l\'alerte');
      } finally {
        setResolving(false);
      }
    }
  };

  /**
   * Handle phone call
   */
  const handleCall = (phone: string): void => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="min-h-screen bg-red-50 dark:bg-red-900/20">
      {/* Header */}
      <div className="bg-red-600 text-white p-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
        </motion.div>
        <h1 className="text-3xl font-bold mb-2">URGENCE ACTIVÉE</h1>
        <p className="text-red-100">Alerte envoyée au guide et aux secours</p>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Status Card */}
        <Card className="border-red-500 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Alerte envoyée
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Le guide et votre contact d'urgence ont été notifiés
              </p>
            </div>
          </div>
          {location && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>
                Position envoyée: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            </div>
          )}
        </Card>

        {/* Guide Contact */}
        {safetyInfo?.guideContact && (
          <Card>
            <div className="flex items-center gap-3 mb-3">
              <User className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Contact du Guide</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              {safetyInfo.guideContact.name}
            </p>
            <Button
              variant="primary"
              icon={Phone}
              onClick={() => handleCall(safetyInfo.guideContact.phone)}
              className="w-full"
            >
              Appeler {safetyInfo.guideContact.phone}
            </Button>
          </Card>
        )}

        {/* Emergency Numbers */}
        {safetyInfo?.emergencyNumbers && (
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Numéros d'Urgence</h3>
            </div>
            <div className="space-y-2">
              <Button
                variant="danger"
                icon={Phone}
                onClick={() => handleCall(safetyInfo.emergencyNumbers.police)}
                className="w-full"
              >
                Police: {safetyInfo.emergencyNumbers.police}
              </Button>
              <Button
                variant="danger"
                icon={Phone}
                onClick={() => handleCall(safetyInfo.emergencyNumbers.protectionCivile)}
                className="w-full"
              >
                Protection Civile: {safetyInfo.emergencyNumbers.protectionCivile}
              </Button>
              <Button
                variant="danger"
                icon={Phone}
                onClick={() => handleCall(safetyInfo.emergencyNumbers.medical)}
                className="w-full"
              >
                SAMU: {safetyInfo.emergencyNumbers.medical}
              </Button>
            </div>
          </Card>
        )}

        {/* Meeting Point */}
        {safetyInfo?.meetingPoint && (
          <Card>
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Point de Rendez-vous</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {safetyInfo.meetingPoint.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {safetyInfo.meetingPoint.address}
            </p>
          </Card>
        )}

        {/* Nearest Hospital */}
        {safetyInfo?.nearestHospital && (
          <Card>
            <div className="flex items-center gap-3 mb-3">
              <Building2 className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Hôpital le Plus Proche</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {safetyInfo.nearestHospital.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
              {safetyInfo.nearestHospital.address}
            </p>
            <Button
              variant="outline"
              icon={Phone}
              onClick={() => handleCall(safetyInfo.nearestHospital.phone)}
              className="w-full"
            >
              Appeler {safetyInfo.nearestHospital.phone}
            </Button>
          </Card>
        )}

        {/* Cancel Alert */}
        {activeAlert && (
          <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Si c'était une fausse alerte, vous pouvez l'annuler.
            </p>
            <Button
              variant="outline"
              icon={X}
              onClick={handleResolve}
              loading={resolving}
              className="w-full"
            >
              Annuler l'alerte
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

