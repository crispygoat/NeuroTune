import { SAFETY } from '../constants/safety';

export function isFlickerSafe(
  frequencyHz: number,
  luminanceDelta: number,
  areaPercent: number = 100
): boolean {
  if (frequencyHz <= SAFETY.MAX_GENERAL_FLASH_HZ) return true;
  if (luminanceDelta < SAFETY.MAX_LUMINANCE_DELTA) return true;
  if (areaPercent < SAFETY.MAX_FLASH_AREA_PERCENT) return true;
  return false;
}

export function shouldDisableFlicker(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
