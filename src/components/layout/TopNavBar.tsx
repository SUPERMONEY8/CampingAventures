/**
 * Top Navigation Bar Component
 * 
 * Sticky top navigation with logo, burger menu, notifications, and user avatar.
 * Glassmorphism background with responsive design.
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { useNotifications } from '../../hooks/useNotifications';
import { Tent } from 'lucide-react';

/**
 * TopNavBar props
 */
interface TopNavBarProps {
  onMenuClick: () => void;
}

/**
 * TopNavBar Component
 */
export function TopNavBar({ onMenuClick }: TopNavBarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  
  const { unreadCount } = useNotifications(user?.id || null, !!user);

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Handle logout
   */
  const handleLogout = async (): Promise<void> => {
    await signOut();
    setIsDropdownOpen(false);
    navigate('/login');
  };

  /**
   * Get user initials for avatar
   */
  const getUserInitials = (): string => {
    if (!user) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="px-2 sm:px-3 md:px-4 lg:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Left Section: Logo + Burger Menu */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Burger Menu (Mobile only) */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-smooth touch-manipulation"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-smooth"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                <Tent className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white hidden sm:inline">
                Camping Aventures
              </span>
            </Link>
          </div>

          {/* Right Section: Notifications + Avatar */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Notifications */}
            {user && (
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-smooth touch-manipulation"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 md:w-6 md:h-6 text-gray-700 dark:text-gray-300" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </button>
                <NotificationCenter
                  open={notificationsOpen}
                  onClose={() => setNotificationsOpen(false)}
                />
              </div>
            )}

            {/* User Avatar Dropdown */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 md:gap-3 p-1 md:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-smooth touch-manipulation"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-semibold text-sm md:text-base">
                    {getUserInitials()}
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400 transition-transform ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 md:w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="p-2">
                        <Link
                          to="/profile"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-smooth text-gray-700 dark:text-gray-300"
                        >
                          <User className="w-5 h-5" />
                          <span className="font-medium">Mon profil</span>
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-smooth text-gray-700 dark:text-gray-300"
                        >
                          <Settings className="w-5 h-5" />
                          <span className="font-medium">Paramètres</span>
                        </Link>
                        <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-smooth text-red-600 dark:text-red-400"
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="font-medium">Déconnexion</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base font-semibold text-primary hover:text-accent transition-smooth"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

