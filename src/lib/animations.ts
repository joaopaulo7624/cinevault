import { Variants } from 'motion/react';

// ═══════════════════════════════════════════
//   EASINGS & PHYSICS
// ═══════════════════════════════════════════

/** Slow-burn cinematic cubic bezier easing (0.22, 1, 0.36, 1) */
export const cinematicEasing = [0.22, 1, 0.36, 1];

/** Luxury high-damping spring for weight and fluidity */
export const heavySpring = {
  type: "spring",
  stiffness: 80,
  damping: 20,
  mass: 1.5,
  restDelta: 0.001
};

// ═══════════════════════════════════════════
//   STAGGER CASCADES
// ═══════════════════════════════════════════

export const cascadeContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    }
  }
};

export const cinematicItem: Variants = {
  hidden: { 
    opacity: 0, 
    y: 16,
    scale: 0.97,
    filter: 'blur(8px)' // Motion blur effect
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      y: heavySpring,
      scale: heavySpring,
      opacity: { duration: 0.6, ease: cinematicEasing },
      filter: { duration: 0.4, ease: cinematicEasing }
    }
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    filter: 'blur(4px)',
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

// ═══════════════════════════════════════════
//   HOVER PARALLAX (Fallback to JS Configs)
// ═══════════════════════════════════════════

export const glassHoverPhysics = {
  hover: {
    scale: 1.02,
    transition: heavySpring
  },
  tap: {
    scale: 0.98,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
};
