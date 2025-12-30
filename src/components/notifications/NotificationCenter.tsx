/**
 * Notification Center Component
 * 
 * Dropdown component for displaying and managing notifications
 * with real-time updates, badges, and quick actions.
 */

import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  FileText,
  MessageCircle,
  Users,
  CloudRain,
  CheckCircle2,
  X,
  Info,
  ExternalLink,
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../hooks/useAuth';
import { formatRelativeTime } from '../../utils/date';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { Notification } from '../../types';

/**
 * Notification icon mapping
 */
const notificationIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  reminderJ7: Calendar,
  reminderJ3: Calendar,
  reminderJ1: Calendar,
  weatherAlert: CloudRain,
  checklistReminder: CheckCircle2,
  documentReminder: FileText,
  groupMessage: MessageCircle,
  guideTip: Users,
  enrollmentConfirmed: CheckCircle2,
  tripCancelled: X,
  tripUpdated: Info,
};

/**
 * Notification color mapping
 */
const notificationColors: Record<string, string> = {
  reminderJ7: 'text-blue-500',
  reminderJ3: 'text-yellow-500',
  reminderJ1: 'text-orange-500',
  weatherAlert: 'text-red-500',
  checklistReminder: 'text-purple-500',
  documentReminder: 'text-indigo-500',
  groupMessage: 'text-green-500',
  guideTip: 'text-primary',
  enrollmentConfirmed: 'text-green-500',
  tripCancelled: 'text-red-500',
  tripUpdated: 'text-blue-500',
};

/**
 * NotificationCenter props
 */
interface NotificationCenterProps {
  /**
   * Whether dropdown is open
   */
  open: boolean;

  /**
   * Close handler
   */
  onClose: () => void;
}

/**
 * NotificationCenter Component
 */
export function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications(user?.id, true);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, onClose]);

  /**
   * Handle notification click
   */
  const handleNotificationClick = async (notification: Notification): Promise<void> => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate if action URL exists
    if (notification.data?.actionUrl) {
      navigate(notification.data.actionUrl as string);
      onClose();
    }
  };

  /**
   * Handle mark all as read
   */
  const handleMarkAllAsRead = async (): Promise<void> => {
    await markAllAsRead();
  };

  /**
   * Handle clear all
   */
  const handleClearAll = async (): Promise<void> => {
    if (confirm('Voulez-vous vraiment supprimer toutes les notifications ?')) {
      await clearAll();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Dropdown */}
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[600px] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <Badge text={unreadCount.toString()} variant="danger" className="text-xs" />
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Tout marquer comme lu"
                  >
                    <CheckCheck className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                )}
                <button
                  onClick={handleClearAll}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Tout supprimer"
                >
                  <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Chargement...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Aucune notification
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Vous serez notifié des mises à jour importantes
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => {
                    const Icon = notificationIcons[notification.type] || Bell;
                    const iconColor = notificationColors[notification.type] || 'text-gray-500';

                    return (
                      <motion.button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                          !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                        }`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className={`text-sm font-semibold ${
                                !notification.read
                                  ? 'text-gray-900 dark:text-white'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                              {notification.body}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                {formatRelativeTime(notification.createdAt)}
                              </span>
                              {notification.data?.actionUrl && (
                                <ExternalLink className="w-3 h-3 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigate('/notifications');
                    onClose();
                  }}
                  className="w-full"
                >
                  Voir toutes les notifications
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

