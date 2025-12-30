/**
 * Badge Component
 * 
 * Reusable badge component with variants, icon, and optional pulse animation.
 * Fully accessible and responsive.
 */

import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

/**
 * Badge variants
 */
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

/**
 * Badge props
 */
export interface BadgeProps {
  /**
   * Badge text
   */
  text: string;

  /**
   * Badge variant
   * @default 'default'
   */
  variant?: BadgeVariant;

  /**
   * Optional icon
   */
  icon?: LucideIcon;

  /**
   * Pulse animation
   * @default false
   */
  pulse?: boolean;

  /**
   * Badge size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Badge Component
 */
export function Badge({
  text,
  variant = 'default',
  icon: Icon,
  pulse = false,
  size = 'md',
  className = '',
}: BadgeProps) {
  // Variant classes
  const variantClasses = {
    success:
      'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
    warning:
      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    danger:
      'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    default:
      'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const baseClasses = `
    inline-flex
    items-center
    gap-1.5
    font-semibold
    rounded-full
    border
    transition-smooth
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim();

  const badgeContent = (
    <>
      {Icon && (
        <Icon
          className={iconSizeClasses[size]}
          aria-hidden="true"
        />
      )}
      <span>{text}</span>
    </>
  );

  if (pulse) {
    return (
      <motion.span
        className={baseClasses}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        role="status"
        aria-live="polite"
      >
        {badgeContent}
      </motion.span>
    );
  }

  return (
    <span className={baseClasses} role="status">
      {badgeContent}
    </span>
  );
}

