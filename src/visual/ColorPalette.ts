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

export { USER_COLOR_HSL };
