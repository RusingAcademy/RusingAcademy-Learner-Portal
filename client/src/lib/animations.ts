/**
 * RusingAcademy Animation Utilities
 * 
 * Framer Motion animation variants and utilities for consistent,
 * professional animations across the ecosystem.
 */

import { Variants, Transition } from 'framer-motion';

// ============================================================================
// TRANSITION PRESETS
// ============================================================================

export const transitions = {
  spring: { type: 'spring', stiffness: 300, damping: 30 } as Transition,
  springBouncy: { type: 'spring', stiffness: 400, damping: 25 } as Transition,
  springGentle: { type: 'spring', stiffness: 200, damping: 35 } as Transition,
  smooth: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } as Transition,
  smoothSlow: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } as Transition,
  smoothFast: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] } as Transition,
  elastic: { type: 'spring', stiffness: 500, damping: 15 } as Transition,
};

// ============================================================================
// FADE ANIMATIONS
// ============================================================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: transitions.smooth
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.spring
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.spring
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitions.spring
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitions.spring
  },
};

// ============================================================================
// SCALE ANIMATIONS
// ============================================================================

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: transitions.springBouncy
  },
};

export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: transitions.elastic
  },
};

// ============================================================================
// STAGGER ANIMATIONS (for lists/grids)
// ============================================================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.spring
  },
};

// ============================================================================
// HOVER ANIMATIONS
// ============================================================================

export const hoverScale = {
  scale: 1.02,
  transition: transitions.springBouncy,
};

export const hoverScaleLarge = {
  scale: 1.05,
  transition: transitions.springBouncy,
};

export const hoverLift = {
  y: -8,
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
  transition: transitions.spring,
};

export const hoverGlow = {
  boxShadow: '0 0 30px rgba(20, 184, 166, 0.4)',
  transition: transitions.smooth,
};

// ============================================================================
// TAP ANIMATIONS
// ============================================================================

export const tapScale = {
  scale: 0.98,
  transition: transitions.smoothFast,
};

export const tapBounce = {
  scale: 0.95,
  transition: transitions.elastic,
};

// ============================================================================
// CARD ANIMATIONS
// ============================================================================

export const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 40,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      ...transitions.spring,
      opacity: { duration: 0.3 }
    }
  },
  hover: {
    y: -10,
    scale: 1.02,
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
    transition: transitions.spring
  }
};

export const glassCardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    backdropFilter: 'blur(0px)'
  },
  visible: { 
    opacity: 1, 
    y: 0,
    backdropFilter: 'blur(12px)',
    transition: transitions.smoothSlow
  },
  hover: {
    y: -5,
    backdropFilter: 'blur(16px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
    transition: transitions.spring
  }
};

// ============================================================================
// HERO ANIMATIONS
// ============================================================================

export const heroTextVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1],
    }
  }
};

export const heroImageVariants: Variants = {
  hidden: { opacity: 0, scale: 1.1, x: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      duration: 1,
      ease: [0.25, 0.1, 0.25, 1],
    }
  }
};

// ============================================================================
// BUTTON ANIMATIONS
// ============================================================================

export const buttonVariants: Variants = {
  idle: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: transitions.springBouncy
  },
  tap: { 
    scale: 0.95,
    transition: transitions.smoothFast
  }
};

export const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut'
  }
};

// ============================================================================
// SCROLL-TRIGGERED ANIMATIONS
// ============================================================================

export const scrollReveal: Variants = {
  hidden: { 
    opacity: 0, 
    y: 60,
    scale: 0.98
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

export const scrollRevealLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitions.smoothSlow
  }
};

export const scrollRevealRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitions.smoothSlow
  }
};

// ============================================================================
// FLOATING/AMBIENT ANIMATIONS
// ============================================================================

export const floatAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut'
  }
};

export const floatRotateAnimation = {
  y: [0, -15, 0],
  rotate: [-2, 2, -2],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut'
  }
};

export const shimmerAnimation = {
  backgroundPosition: ['200% 0', '-200% 0'],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'linear'
  }
};

// ============================================================================
// LOADING ANIMATIONS
// ============================================================================

export const spinAnimation = {
  rotate: 360,
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: 'linear'
  }
};

export const bounceAnimation = {
  y: [0, -20, 0],
  transition: {
    duration: 0.6,
    repeat: Infinity,
    ease: 'easeOut'
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a stagger delay based on index
 */
export const getStaggerDelay = (index: number, baseDelay: number = 0.1) => ({
  delay: index * baseDelay
});

/**
 * Create viewport settings for scroll animations
 */
export const viewportSettings = {
  once: true,
  amount: 0.2,
  margin: '-50px'
};

/**
 * Create custom spring transition
 */
export const createSpring = (stiffness: number, damping: number): Transition => ({
  type: 'spring',
  stiffness,
  damping
});
