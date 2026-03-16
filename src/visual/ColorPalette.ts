import type { UserColor } from '../types/session';

export interface ColorPalette {
  background: string;
  backgroundLight: string;
  ink: string[];
  shape: string;
  shapeFill: string;
  accent: string;
  text: string;
  hue: number;
  saturation: number;
  lightness: number;
}

const USER_COLOR_HSL: Record<UserColor, { hue: number; saturation: number; lightness: number; hex: string }> = {
  red:    { hue: 355, saturation: 85, lightness: 55, hex: '#E63946' },
  green:  { hue: 145, saturation: 70, lightness: 45, hex: '#2D936C' },
  blue:   { hue: 220, saturation: 80, lightness: 55, hex: '#457B9D' },
  yellow: { hue: 48,  saturation: 90, lightness: 58, hex: '#E9C46A' },
  purple: { hue: 270, saturation: 65, lightness: 55, hex: '#7B2D8B' },
  orange: { hue: 25,  saturation: 85, lightness: 55, hex: '#E76F51' },
  teal:   { hue: 180, saturation: 60, lightness: 45, hex: '#2A9D8F' },
  pink:   { hue: 330, saturation: 70, lightness: 65, hex: '#E07B9B' },
};

export function generatePalette(color: UserColor): ColorPalette {
  const base = USER_COLOR_HSL[color];
  const h = base.hue;
  const s = base.saturation;
  const l = base.lightness;

  return {
    hue: h,
    saturation: s,
    lightness: l,

    // Bright, vivid background — the color IS the background
    background: `hsl(${h}, ${Math.round(s * 0.8)}%, ${Math.round(l * 0.45)}%)`,
    backgroundLight: `hsl(${h}, ${Math.round(s * 0.9)}%, ${Math.round(l * 0.55)}%)`,

    // Blob colors: brighter, more visible — variations of the chosen color
    ink: [
      `hsla(${h}, ${s}%, ${Math.round(l * 0.7)}%, 0.35)`,
      `hsla(${h}, ${Math.round(s * 0.95)}%, ${Math.round(l * 0.8)}%, 0.30)`,
      `hsla(${h}, ${Math.round(s * 0.9)}%, ${Math.round(l * 0.9)}%, 0.25)`,
      `hsla(${h}, ${Math.round(s * 0.85)}%, ${Math.round(l * 1.0)}%, 0.22)`,
      `hsla(${h}, ${Math.round(s * 0.8)}%, ${Math.round(l * 1.1)}%, 0.18)`,
      `hsla(${h}, ${Math.round(s * 0.7)}%, ${Math.round(l * 1.2)}%, 0.15)`,
    ],

    // Shape: WHITE for contrast
    shape: 'rgba(255, 255, 255, 0.5)',
    shapeFill: 'rgba(255, 255, 255, 0.04)',

    accent: 'rgba(255, 255, 255, 0.8)',

    text: 'rgba(255, 255, 255, 0.75)',
  };
}

/**
 * Generate a progressively darkened palette for sleep mode.
 * @param progress 0-1 overall session progress
 * @param startColor the user's chosen starting color
 */
export function generateSleepPalette(progress: number, startColor: UserColor): ColorPalette {
  const base = USER_COLOR_HSL[startColor];

  // Target waypoints (deep indigo → near-black)
  const windDown = { hue: 260, saturation: 35, lightness: 15 };
  const deepSleep = { hue: 270, saturation: 25, lightness: 8 };

  let h: number, s: number, l: number;

  if (progress < 0.4) {
    // Phase 1: user's color (no change)
    h = base.hue;
    s = base.saturation;
    l = base.lightness;
  } else if (progress < 0.75) {
    // Phase 2: interpolate from user's color toward deep indigo
    const t = (progress - 0.4) / 0.35; // 0→1 within phase 2
    h = base.hue + (windDown.hue - base.hue) * t;
    s = base.saturation + (windDown.saturation - base.saturation) * t;
    l = base.lightness + (windDown.lightness - base.lightness) * t;
  } else {
    // Phase 3: interpolate from deep indigo toward near-black
    const t = (progress - 0.75) / 0.25; // 0→1 within phase 3
    h = windDown.hue + (deepSleep.hue - windDown.hue) * t;
    s = windDown.saturation + (deepSleep.saturation - windDown.saturation) * t;
    l = windDown.lightness + (deepSleep.lightness - windDown.lightness) * t;
  }

  // Shape and text opacity fade down with progress
  const shapeAlpha = Math.max(0.1, 0.5 - progress * 0.5);
  const textAlpha = Math.max(0.2, 0.75 - progress * 0.6);

  return {
    hue: h,
    saturation: s,
    lightness: l,

    background: `hsl(${Math.round(h)}, ${Math.round(s * 0.8)}%, ${Math.round(l * 0.45)}%)`,
    backgroundLight: `hsl(${Math.round(h)}, ${Math.round(s * 0.9)}%, ${Math.round(l * 0.55)}%)`,

    ink: [
      `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l * 0.7)}%, ${(0.35 * (1 - progress * 0.4)).toFixed(2)})`,
      `hsla(${Math.round(h)}, ${Math.round(s * 0.95)}%, ${Math.round(l * 0.8)}%, ${(0.30 * (1 - progress * 0.4)).toFixed(2)})`,
      `hsla(${Math.round(h)}, ${Math.round(s * 0.9)}%, ${Math.round(l * 0.9)}%, ${(0.25 * (1 - progress * 0.4)).toFixed(2)})`,
      `hsla(${Math.round(h)}, ${Math.round(s * 0.85)}%, ${Math.round(l * 1.0)}%, ${(0.22 * (1 - progress * 0.4)).toFixed(2)})`,
      `hsla(${Math.round(h)}, ${Math.round(s * 0.8)}%, ${Math.round(l * 1.1)}%, ${(0.18 * (1 - progress * 0.4)).toFixed(2)})`,
      `hsla(${Math.round(h)}, ${Math.round(s * 0.7)}%, ${Math.round(l * 1.2)}%, ${(0.15 * (1 - progress * 0.4)).toFixed(2)})`,
    ],

    shape: `rgba(255, 255, 255, ${shapeAlpha.toFixed(2)})`,
    shapeFill: `rgba(255, 255, 255, ${(shapeAlpha * 0.08).toFixed(3)})`,

    accent: `rgba(255, 255, 255, ${(shapeAlpha * 1.6).toFixed(2)})`,
    text: `rgba(255, 255, 255, ${textAlpha.toFixed(2)})`,
  };
}

export { USER_COLOR_HSL };
