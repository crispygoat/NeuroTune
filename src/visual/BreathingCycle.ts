import type { BreathCycle, BreathPhase } from '../types/visual';

export interface BreathState {
  phase: BreathPhase;
  progress: number;    // 0-1 within current phase
  expansion: number;   // 0-1 overall expansion factor
}

function getTotalCycleDuration(cycle: BreathCycle): number {
  return cycle.inhale + cycle.hold + cycle.exhale + cycle.rest;
}

function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

export function getBreathState(elapsedMs: number, cycle: BreathCycle): BreathState {
  const totalS = getTotalCycleDuration(cycle);
  const positionS = (elapsedMs / 1000) % totalS;

  let phase: BreathPhase;
  let progress: number;
  let expansion: number;

  if (positionS < cycle.inhale) {
    // Inhale: expansion goes from 0 to 1
    phase = 'inhale';
    progress = positionS / cycle.inhale;
    expansion = easeInOutSine(progress);
  } else if (positionS < cycle.inhale + cycle.hold) {
    // Hold at full expansion
    phase = 'hold';
    progress = (positionS - cycle.inhale) / cycle.hold;
    expansion = 1;
  } else if (positionS < cycle.inhale + cycle.hold + cycle.exhale) {
    // Exhale: expansion goes from 1 to 0
    phase = 'exhale';
    progress = (positionS - cycle.inhale - cycle.hold) / cycle.exhale;
    expansion = 1 - easeInOutSine(progress);
  } else {
    // Rest at minimum
    phase = 'rest';
    progress = (positionS - cycle.inhale - cycle.hold - cycle.exhale) / cycle.rest;
    expansion = 0;
  }

  return { phase, progress, expansion };
}
