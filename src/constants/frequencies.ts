import type { BrainwaveState } from '../types/session';
import type { FrequencyBand } from '../types/audio';
import type { BreathCycle, FlickerConfig } from '../types/visual';

export const FREQUENCY_BANDS: Record<BrainwaveState, FrequencyBand> = {
  delta: {
    name: 'Delta',
    feeling: 'Sleep',
    emoji: '\uD83C\uDF19',
    beatHz: 2.0,
    carrierHz: 800,
    description: 'Deep rest',
    label: 'A slow, warm tone for winding down',
  },
  theta: {
    name: 'Theta',
    feeling: 'Dream',
    emoji: '\u2728',
    beatHz: 6.0,
    carrierHz: 900,
    description: 'Daydream',
    label: 'A gentle hum for drifting into imagination',
  },
  alpha: {
    name: 'Alpha',
    feeling: 'Calm',
    emoji: '\uD83C\uDF3F',
    beatHz: 10.0,
    carrierHz: 1000,
    description: 'Peaceful',
    label: 'A soft sound for feeling calm and present',
  },
  beta: {
    name: 'Beta',
    feeling: 'Focus',
    emoji: '\uD83C\uDFAF',
    beatHz: 20.0,
    carrierHz: 1200,
    description: 'Alert',
    label: 'A steady tone for paying attention',
  },
  gamma: {
    name: 'Gamma',
    feeling: 'Clarity',
    emoji: '\uD83D\uDCA1',
    beatHz: 40.0,
    carrierHz: 1000,
    description: 'Clear mind',
    label: 'A bright tone for thinking clearly',
  },
};

export const BREATH_CYCLES: Record<BrainwaveState, BreathCycle> = {
  delta: { inhale: 5, hold: 3, exhale: 8, rest: 3 },
  theta: { inhale: 4, hold: 2, exhale: 6, rest: 2 },
  alpha: { inhale: 4, hold: 2, exhale: 5, rest: 1 },
  beta:  { inhale: 3, hold: 1, exhale: 4, rest: 2 },
  gamma: { inhale: 4, hold: 2, exhale: 5, rest: 1 },
};

// Default session uses gamma breathing
export const SESSION_BREATH_CYCLE: BreathCycle = { inhale: 4, hold: 2, exhale: 5, rest: 1 };

export const FLICKER_CONFIGS: Record<BrainwaveState, FlickerConfig> = {
  delta: { enabled: false, frequencyHz: 0, warmTint: '', coolTint: '', opacity: 0 },
  theta: { enabled: false, frequencyHz: 0, warmTint: '', coolTint: '', opacity: 0 },
  alpha: {
    enabled: true,
    frequencyHz: 10,
    warmTint: 'rgba(255, 248, 240, 0.015)',
    coolTint: 'rgba(240, 245, 255, 0.015)',
    opacity: 0.015,
  },
  beta:  { enabled: false, frequencyHz: 0, warmTint: '', coolTint: '', opacity: 0 },
  gamma: {
    enabled: true,
    frequencyHz: 40,
    warmTint: 'rgba(255, 248, 240, 0.02)',
    coolTint: 'rgba(240, 245, 255, 0.02)',
    opacity: 0.02,
  },
};

// Always use gamma flicker for sessions
export const SESSION_FLICKER_CONFIG: FlickerConfig = FLICKER_CONFIGS.gamma;

export const BRAINWAVE_ORDER: BrainwaveState[] = ['delta', 'theta', 'alpha', 'beta', 'gamma'];

export const BRAINWAVE_COLORS: Record<BrainwaveState, { primary: string; glow: string }> = {
  delta: { primary: '#818cf8', glow: 'rgba(129, 140, 248, 0.3)' },
  theta: { primary: '#a78bfa', glow: 'rgba(167, 139, 250, 0.3)' },
  alpha: { primary: '#5eead4', glow: 'rgba(94, 234, 212, 0.3)' },
  beta:  { primary: '#fbbf24', glow: 'rgba(251, 191, 36, 0.3)' },
  gamma: { primary: '#f0abfc', glow: 'rgba(240, 171, 252, 0.3)' },
};

// C major pentatonic scale for wind chimes (C5-E6)
export const CHIME_FREQUENCIES = [
  523.25,  // C5
  587.33,  // D5
  659.25,  // E5
  783.99,  // G5
  880.00,  // A5
  1046.50, // C6
  1174.66, // D6
  1318.51, // E6
];
