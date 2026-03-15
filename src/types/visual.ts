export type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

export interface BreathCycle {
  inhale: number;  // seconds
  hold: number;    // seconds
  exhale: number;  // seconds
  rest: number;    // seconds
}

export interface FlickerConfig {
  enabled: boolean;
  frequencyHz: number;
  warmTint: string;
  coolTint: string;
  opacity: number;
}

export interface TouchPoint {
  id: number;
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  timestamp: number;
  active: boolean;
}

export interface Disturbance {
  x: number;
  y: number;
  vx: number;
  vy: number;
  strength: number;
  radius: number;
  age: number;
}

export interface InkBlobState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  hue: number;
  saturation: number;
  lightness: number;
  age: number;
  lifespan: number;
  phase: number;
}
