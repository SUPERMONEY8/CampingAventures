/**
 * Card Component
 * 
 * Reusable card component with variants, icon, and actions.
 * Supports glassmorphism, outlined, and default styles.
 */

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

/**
 * Card variants
 */
export type CardVariant = 'default' | 'glassmorphism' | 'outlined';

/**
 * Card props
 */
export interface CardProps {
  /**
   * Card title
   */
  title?: string;

  /**
   * Card content
   */
  children: ReactNode;

  /**
   * Optional icon displayed in header
   */
  icon?: LucideIcon;

  /**
   * Optional actions displayed in footer
   */
  actions?: ReactNode;

  /**
   * Card variant style
   * @default 'default'
   */
  variant?: CardVariant;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Click handler
   */
  onClick?: () => void;
}

/**
 * Card Component
 */
export function Card({
  title,
  children,
  icon: Icon,
  actions,
  variant = 'default',
  className = '',
  onClick,
}: CardProps) {
  const baseClasses = 'rounded-xl transition-smooth';
  const variantClasses = {
    default: 'medical-card',
    glassmorphism: 'medical-card',
    outlined: 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 p-6',
  };

  const cardClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}
    ${className}
  `.trim();

  const content = (
    <>
      {/* Header */}
      {(title || Icon) && (
        <div className="flex items-center gap-3 mb-4">
          {Icon && (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
          )}
          {title && (
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
        </div>
      )}

      {/* Content */}
      <div className="text-gray-700 dark:text-gray-300">{children}</div>

      {/* Footer */}
      {actions && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
          {actions}
        </div>
      )}
    </>
  );

  if (onClick) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cardClasses}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {content}
      </motion.div>
    );
  }

  return <div className={cardClasses}>{content}</div>;
}

