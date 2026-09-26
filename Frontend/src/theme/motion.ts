// Shared motion tokens so every screen and control moves the same way.
export const durations = {
  /** Exits and tiny state flips (clear button, removed rows). */
  fast: 150,
  /** Colour/border changes on focus, selection and toggles. */
  colorShift: 200,
  /** Text that swaps value (counts, labels) fading up. */
  textSwap: 220,
  /** Opacity part of staggered entrances. */
  fadeIn: 320,
  screen: 350,
  /** Branded splash reveal. */
  splash: 700,
  /** One beat of looping indicators (splash dot). */
  pulse: 800,
} as const;

/** Ready-made moti `transition` values for the durations above. */
export const timings = {
  fast: { type: 'timing', duration: durations.fast },
  colorShift: { type: 'timing', duration: durations.colorShift },
  textSwap: { type: 'timing', duration: durations.textSwap },
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
