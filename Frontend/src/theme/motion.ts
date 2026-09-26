// Shared motion tokens so every screen and control moves the same way.
export const durations = {
  screen: 350,
  entrance: 450,
} as const;

export const springs = {
  press: { type: 'spring', damping: 15, stiffness: 320, mass: 0.6 },
  entrance: { type: 'spring', damping: 18, stiffness: 160 },
} as const;

export const STAGGER_MS = 70;
export const PRESSED_SCALE = 0.96;
export const CARD_PRESSED_SCALE = 0.975;
// Only the first screenful staggers; later items (scrolled into view) appear without delay.
export const MAX_STAGGERED_ITEMS = 6;
