/**
 * Modal Component
 * 
 * Reusable modal component with backdrop, animations, and keyboard support.
 * Portal rendering to body, full-screen on mobile, centered on desktop.
 */

import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Modal props
 */
export interface ModalProps {
  /**
   * Whether modal is open
   */
  open: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Modal title
   */
  title?: string;

  /**
   * Modal content
   */
  children: ReactNode;

  /**
   * Optional actions (buttons) in footer
   */
  actions?: ReactNode;

  /**
   * Show close button
   * @default true
   */
  showCloseButton?: boolean;

  /**
   * Close on backdrop click
   * @default true
   */
  closeOnBackdropClick?: boolean;

  /**
   * Close on escape key
   * @default true
   */
  closeOnEscape?: boolean;

  /**
   * Full width modal
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Maximum width
   * @default 'max-w-2xl'
   */
  maxWidth?: string;
}

/**
 * Modal Component
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  actions,
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  fullWidth = false,
  maxWidth = 'max-w-2xl',
}: ModalProps) {
  /**
   * Handle escape key
   */
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, closeOnEscape, onClose]);

  /**
   * Prevent body scroll when modal is open
   */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  /**
   * Handle backdrop click
   */
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
            }}
            className={`
              relative
              z-10
              w-full
              ${fullWidth ? '' : maxWidth}
              max-h-[90vh]
              overflow-y-auto
              bg-white
              dark:bg-gray-800
              rounded-xl
              shadow-2xl
              md:rounded-2xl
              ${fullWidth ? 'md:w-full md:max-w-full md:rounded-none md:max-h-screen' : ''}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                {title && (
                  <h2
                    id="modal-title"
                    className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white"
                  >
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-smooth touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="Fermer la modale"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-4 md:p-6 text-gray-700 dark:text-gray-300">
              {children}
            </div>

            {/* Footer */}
            {actions && (
              <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                {actions}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Portal rendering to body
  if (typeof window === 'undefined') {
    return null;
  }

  return createPortal(modalContent, document.body);
}

