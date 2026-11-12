/** Shared motion tokens so every component moves with the same character. */
export const spring = { type: "spring", stiffness: 520, damping: 36, mass: 0.9 } as const;
export const springSoft = { type: "spring", stiffness: 280, damping: 28 } as const;
export const springBouncy = { type: "spring", stiffness: 560, damping: 22 } as const;
export const easeOut = [0.22, 1, 0.36, 1] as const;

export const pop = {
  initial: { opacity: 0, scale: 0.6 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.6 },
  transition: spring,
} as const;
