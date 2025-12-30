/**
 * Page Transition Component
 * 
 * Wrapper component for page transitions using Framer Motion.
 * Provides smooth fade effects with custom easing.
 */

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

/**
 * PageTransition props
 */
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Animation variants
 */
const pageVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

/**
 * Transition configuration
 */
const pageTransition = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

/**
 * PageTransition Component
 */
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Slide transition variants (for conditional animations)
 */
export const slideVariants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: -20,
  },
};

/**
 * Scale transition variants
 */
export const scaleVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
  },
};

