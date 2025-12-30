/**
 * Sidebar Navigation Component
 * 
 * Main navigation sidebar with user info, menu items, and dark mode toggle.
 * Fixed on desktop (lg+), slide-in overlay on mobile.
 */

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MapPin,
  Compass,
  User,
  Settings,
  X,
  Moon,
  Sun,
  Trophy,
  Coins,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

/**
 * Menu item interface
 */
interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  badge?: number;
}

/**
 * Sidebar props
 */
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Sidebar Component
 */
export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isDark, setIsDark] = useState(false);

  // Check dark mode on mount and listen for changes
  useEffect(() => {
    const checkDarkMode = (): void => {
      const darkMode = document.documentElement.classList.contains('dark');
      setIsDark(darkMode);
    };

    // Check on mount
    checkDarkMode();

    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  /**
   * Toggle dark mode
   */
  const toggleDarkMode = (): void => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      setIsDark(false);
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.add('dark');
      setIsDark(true);
      localStorage.setItem('theme', 'dark');
    }
  };

  /**
   * Menu items
   */
  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard' },
    { icon: MapPin, label: 'Mes sorties', path: '/trips' },
    { icon: Compass, label: 'Explorer', path: '/explore' },
    { icon: User, label: 'Profil', path: '/profile' },
    { icon: Settings, label: 'Paramètres', path: '/settings' },
  ];

  /**
   * Calculate user level from points (simple formula)
   */
  const userLevel = user ? Math.floor((user.history?.reduce((sum, h) => sum + (h.pointsEarned || 0), 0) || 0) / 100) + 1 : 1;
  const userPoints = user ? user.history?.reduce((sum, h) => sum + (h.pointsEarned || 0), 0) || 0 : 0;

  /**
   * Handle menu item click (close sidebar on mobile)
   */
  const handleMenuItemClick = (): void => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = async (): Promise<void> => {
    await signOut();
    navigate('/auth/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={onClose}
            />
          </>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 200,
            }}
            className="fixed lg:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 flex flex-col shadow-xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Camping Aventures
                </h2>
                <button
                  onClick={onClose}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-smooth"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* User Level Badge */}
              {user && (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary to-accent rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold">Niveau {userLevel}</div>
                    <div className="text-white/80 text-sm">{user.name}</div>
                  </div>
                </div>
              )}

              {/* Points Counter */}
              {user && (
                <div className="mt-3 flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Coins className="w-4 h-4 text-accent" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {userPoints} points
                  </span>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={handleMenuItemClick}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth group ${
                          isActive
                            ? 'bg-primary text-white shadow-md'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            isActive
                              ? 'text-white'
                              : 'text-gray-500 dark:text-gray-400 group-hover:text-primary'
                          }`}
                        />
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto px-2 py-0.5 text-xs font-semibold bg-accent text-white rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-smooth"
              >
                {isDark ? (
                  <>
                    <Sun className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium">Mode clair</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium">Mode sombre</span>
                  </>
                )}
              </button>

              {/* Logout Button */}
              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-smooth"
                >
                  <X className="w-5 h-5" />
                  <span className="font-medium">Déconnexion</span>
                </button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

