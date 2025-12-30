/**
 * Bottom Navigation Component
 * 
 * Mobile-only bottom navigation with icons, badges, and glassmorphism.
 * Fixed position with safe-area-inset support for iOS.
 */

import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  MapPin,
  Compass,
  User,
  type LucideIcon,
} from 'lucide-react';

/**
 * Navigation item interface
 */
export interface BottomNavItem {
  /**
   * Item ID
   */
  id: string;

  /**
   * Item label
   */
  label: string;

  /**
   * Item path
   */
  path: string;

  /**
   * Item icon
   */
  icon: LucideIcon;

  /**
   * Optional badge count
   */
  badge?: number;
}

/**
 * Default navigation items
 */
const defaultItems: BottomNavItem[] = [
  {
    id: 'dashboard',
    label: 'Accueil',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    id: 'trips',
    label: 'Sorties',
    path: '/trips',
    icon: MapPin,
  },
  {
    id: 'explore',
    label: 'Explorer',
    path: '/explore',
    icon: Compass,
  },
  {
    id: 'profile',
    label: 'Profil',
    path: '/profile',
    icon: User,
  },
];

/**
 * BottomNavigation props
 */
export interface BottomNavigationProps {
  /**
   * Custom navigation items
   * @default defaultItems
   */
  items?: BottomNavItem[];

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * BottomNavigation Component
 */
export function BottomNavigation({
  items = defaultItems,
  className = '',
}: BottomNavigationProps) {
  const location = useLocation();

  return (
    <nav
      className={`
        fixed
        bottom-0
        left-0
        right-0
        z-50
        lg:hidden
        bg-white/80
        dark:bg-gray-900/80
        backdrop-blur-lg
        border-t
        border-gray-200
        dark:border-gray-800
        shadow-lg
        safe-area-inset-bottom
        ${className}
      `}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`
                relative
                flex
                flex-col
                items-center
                justify-center
                gap-1
                flex-1
                min-h-[44px]
                touch-manipulation
                transition-smooth
                ${
                  isActive
                    ? 'text-primary'
                    : 'text-gray-600 dark:text-gray-400'
                }
                active:scale-95
                focus:outline-none
                focus:ring-2
                focus:ring-primary
                focus:ring-offset-2
                focus:rounded-lg
              `}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Icon */}
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-smooth ${
                    isActive ? 'text-primary' : 'text-current'
                  }`}
                  aria-hidden="true"
                />

                {/* Badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </motion.span>
                )}
              </div>

              {/* Label */}
              <span
                className={`
                  text-xs
                  font-medium
                  transition-smooth
                  ${isActive ? 'text-primary' : 'text-current'}
                `}
              >
                {item.label}
              </span>

              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

