// WCAG 2.3.1: Three Flashes or Below Threshold
// Flicker is safe if ANY of these conditions hold:
// 1. Frequency <= 3 Hz (general flashes)
// 2. Luminance delta < 10% relative
// 3. Flashing area < 25% of viewport (at 1024x768)

export const SAFETY = {
  // Flicker limits
  MAX_GENERAL_FLASH_HZ: 3,
  MAX_LUMINANCE_DELTA: 0.10,
  MAX_FLASH_AREA_PERCENT: 25,

  // Our invisible spectral flicker uses 2% opacity — well below 10% threshold
  SPECTRAL_FLICKER_OPACITY: 0.02,

  // Audio fade durations (ms)
  FADE_IN_MS: 3000,
  FADE_OUT_MS: 5000,
  EMERGENCY_FADE_MS: 1000,
  CROSSFADE_MS: 2000,

  // Volume limits — start gentle, let user increase
  MAX_MASTER_VOLUME: 1.0,
  DEFAULT_MASTER_VOLUME: 0.25,
  DEFAULT_TONE_VOLUME: 0.3,
  DEFAULT_NATURE_VOLUME: 0.3,
  MIN_AUDIBLE: 0.001,  // exponentialRamp can't target 0

  // Visual intensity
  DEFAULT_VISUAL_INTENSITY: 0.6,

  // Session limits
  MIN_SESSION_MINUTES: 5,
  MAX_SESSION_MINUTES: 20,
} as const;
