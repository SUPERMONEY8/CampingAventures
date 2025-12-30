/**
 * Button Component
 * 
 * Reusable button component with variants, sizes, loading state, and ripple effect.
 * Fully accessible with ARIA attributes.
 */

import { useState, useRef, type ReactNode, type MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { Loader2, type LucideIcon } from 'lucide-react';

/**
 * Button variants
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';

/**
 * Button sizes
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Icon position
 */
export type IconPosition = 'left' | 'right';

/**
 * Button props
 */
export interface ButtonProps {
  /**
   * Button content
   */
  children: ReactNode;

  /**
   * Button variant
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Button size
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Optional icon
   */
  icon?: LucideIcon;

  /**
   * Icon position
   * @default 'left'
   */
  iconPosition?: IconPosition;

  /**
   * Click handler
   */
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;

  /**
   * Button type
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Full width button
   */
  fullWidth?: boolean;
}

/**
 * Button Component
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  fullWidth = false,
}: ButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleIdRef = useRef(0);

  /**
   * Create ripple effect on click
   */
  const handleClick = (e: MouseEvent<HTMLButtonElement>): void => {
    if (disabled || loading) return;

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      x,
      y,
      id: rippleIdRef.current++,
    };

    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    onClick?.(e);
  };

  // Variant classes
  const variantClasses = {
    primary: 'medical-button',
    secondary:
      'px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600',
    danger:
      'px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg',
    ghost:
      'px-6 py-3 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800',
    outline:
      'px-6 py-3 border-2 border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800',
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-[44px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[48px]',
  };

  const baseClasses = `
    relative
    inline-flex
    items-center
    justify-center
    gap-2
    font-semibold
    rounded-lg
    transition-smooth
    touch-manipulation
    disabled:opacity-50
    disabled:cursor-not-allowed
    focus:outline-none
    focus:ring-2
    focus:ring-primary
    focus:ring-offset-2
    dark:focus:ring-offset-gray-900
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();

  const showIcon = Icon && !loading;
  const showLoading = loading;

  return (
    <motion.button
      ref={buttonRef}
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={baseClasses}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      aria-busy={loading}
      aria-disabled={disabled || loading}
    >
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none"
          initial={{ width: 0, height: 0, x: ripple.x, y: ripple.y }}
          animate={{
            width: 200,
            height: 200,
            x: ripple.x - 100,
            y: ripple.y - 100,
            opacity: [1, 0],
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}

      {/* Icon Left */}
      {showIcon && iconPosition === 'left' && (
        <Icon className="w-5 h-5" aria-hidden="true" />
      )}

      {/* Loading Spinner */}
      {showLoading && (
        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
      )}

      {/* Button Content */}
      <span>{children}</span>

      {/* Icon Right */}
      {showIcon && iconPosition === 'right' && (
        <Icon className="w-5 h-5" aria-hidden="true" />
      )}
    </motion.button>
  );
}

