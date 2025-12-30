/**
 * Input Component
 * 
 * Reusable input component with label, error, icon, and accessibility.
 * Optimized for mobile (16px font-size to prevent iOS zoom).
 */

import { forwardRef, type InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, type LucideIcon } from 'lucide-react';

/**
 * Icon position
 */
export type IconPosition = 'left' | 'right';

/**
 * Input props
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Input label
   */
  label?: string;

  /**
   * Error message
   */
  error?: string;

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
   * Helper text
   */
  helperText?: string;

  /**
   * Full width input
   */
  fullWidth?: boolean;
}

/**
 * Input Component
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon: Icon,
      iconPosition = 'left',
      helperText,
      fullWidth = true,
      className = '',
      id,
      ...inputProps
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    const inputClasses = `
      medical-input
      ${Icon && iconPosition === 'left' ? 'pl-10' : ''}
      ${Icon && iconPosition === 'right' ? 'pr-10' : ''}
      ${hasError ? 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
      ${fullWidth ? 'w-full' : ''}
      text-base
      ${className}
    `.trim();

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className="medical-label">
            {label}
            {inputProps.required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Icon Left */}
          {Icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icon
                className={`w-5 h-5 ${
                  hasError
                    ? 'text-red-500'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
                aria-hidden="true"
              />
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...inputProps}
          />

          {/* Icon Right */}
          {Icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icon
                className={`w-5 h-5 ${
                  hasError
                    ? 'text-red-500'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
                aria-hidden="true"
              />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <motion.p
            id={`${inputId}-error`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            {error}
          </motion.p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="mt-1 text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

