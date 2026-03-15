import { SAFETY } from '../constants/safety';

export function fadeIn(
  gainNode: GainNode,
  targetVolume: number,
  durationMs: number = SAFETY.FADE_IN_MS
): void {
  const now = gainNode.context.currentTime;
  const target = Math.max(targetVolume, SAFETY.MIN_AUDIBLE);
  gainNode.gain.cancelScheduledValues(now);
  gainNode.gain.setValueAtTime(SAFETY.MIN_AUDIBLE, now);
  gainNode.gain.exponentialRampToValueAtTime(target, now + durationMs / 1000);
}

export function fadeOut(
  gainNode: GainNode,
  durationMs: number = SAFETY.FADE_OUT_MS
): void {
  const now = gainNode.context.currentTime;
  const current = Math.max(gainNode.gain.value, SAFETY.MIN_AUDIBLE);
  gainNode.gain.cancelScheduledValues(now);
  gainNode.gain.setValueAtTime(current, now);
  gainNode.gain.exponentialRampToValueAtTime(SAFETY.MIN_AUDIBLE, now + durationMs / 1000);
}

export function setVolume(
  gainNode: GainNode,
  volume: number,
  rampMs: number = 100
): void {
  const now = gainNode.context.currentTime;
  const target = Math.max(volume, SAFETY.MIN_AUDIBLE);
  gainNode.gain.cancelScheduledValues(now);
  gainNode.gain.setValueAtTime(Math.max(gainNode.gain.value, SAFETY.MIN_AUDIBLE), now);
  gainNode.gain.exponentialRampToValueAtTime(target, now + rampMs / 1000);
}
