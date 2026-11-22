import { Easing } from 'react-native-reanimated';
import { colors } from '../../theme/tokens';

// Spring configs — raise stiffness or lower damping for more snap/bounce
export const SPRING_BLOB  = { mass: 1,   damping: 25, stiffness: 90  } as const;
export const SPRING_PHONE = { mass: 1,   damping: 18, stiffness: 120 } as const;
export const SPRING_CARD  = { mass: 0.8, damping: 14, stiffness: 180 } as const;

// Milliseconds between each card's entrance pop
export const CARD_STAGGER_MS = 120;

// Phone idle float
export const FLOAT_PHONE = {
  duration:     3200,  // ms per half-cycle (up or down)
  yAmplitude:   6,     // px vertical drift
  rotDeg:       1.5,   // degrees of rotation added to the base tilt
  baseTilt:     -4,    // base tilt in degrees matching illustration
} as const;

// Per-card float — different durations and phase offsets keep the cards out of sync.
// Order matches the entrance stagger: grad cap, calendar, megaphone, bar chart.
export const FLOAT_CARDS = [
  { duration: 2800, yAmp: 7, xAmp: 3,   rotDeg: 2.5, phase: 0    },
  { duration: 3400, yAmp: 5, xAmp: 2,   rotDeg: 1.8, phase: 600  },
  { duration: 3100, yAmp: 9, xAmp: 4,   rotDeg: 2.2, phase: 1200 },
  { duration: 3800, yAmp: 6, xAmp: 2.5, rotDeg: 1.5, phase: 400  },
] as const;

export const BLOB_BREATHE = { duration: 6500 } as const;

// Bar heights cycle amplitude as a fraction of their base height
export const BARS = {
  durations:  [2200, 2800, 1900] as const,
  amplitude:  0.15,
} as const;

// Sound arc pulse periods
export const SOUND_PULSES = { durations: [800, 1100, 1400] as const } as const;

// Spark line twinkle periods
export const SPARKS_CFG = { durations: [1200, 1800, 900] as const } as const;

// Squash-and-bounce on phone tap
export const TAP_SPRING = { mass: 0.5, damping: 10, stiffness: 300 } as const;

export const BRAND = {
  navy:    colors.primary,
  blue:    colors.accent,
  blobA:   colors.status.infoBorder,
  blobB:   colors.accentMuted,
  cardBg:  colors.surface,
  screen:  colors.surface,
  spark:   colors.status.infoBorder,
} as const;

// Shared easing used for all idle loops so they feel consistent
export const EASE_IO = Easing.inOut(Easing.ease);
