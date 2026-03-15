import type { TouchPoint, Disturbance } from '../types/visual';

const MAX_DISTURBANCES = 20;
const MAX_TRAIL_POINTS = 100;

export interface TrailPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  opacity: number;
  width: number;
}

export class TouchField {
  private points: Map<number, TouchPoint> = new Map();
  private disturbances: Disturbance[] = [];
  private trail: TrailPoint[] = [];
  // Activity tracking — dampens visuals during rapid input
  private recentInputCount = 0;
  private lastInputDecay = 0;

  /** Returns 0-1 dampening factor: 1 = normal, lower = reduce intensity */
  private getActivityDampen(): number {
    // Ramp down when lots of input: 0-10 inputs = full, 10-40 = fading, 40+ = minimum
    if (this.recentInputCount < 10) return 1;
    if (this.recentInputCount > 40) return 0.2;
    return 1 - (this.recentInputCount - 10) / 40;
  }

  addTouch(id: number, x: number, y: number): void {
    this.recentInputCount += 3; // taps count more
    const dampen = this.getActivityDampen();

    this.points.set(id, {
      id, x, y,
      prevX: x, prevY: y,
      vx: 0, vy: 0,
      timestamp: performance.now(),
      active: true,
    });

    // Tap creates a radial burst (dampened)
    this.disturbances.push({
      x, y,
      vx: 0, vy: 0,
      strength: 1.2 * dampen,
      radius: 80,
      age: 0,
    });

    // Start trail at tap point
    this.trail.push({
      x, y, vx: 0, vy: 0,
      age: 0, opacity: 0.5 * dampen, width: 25,
    });

    this.trimDisturbances();
  }

  updateTouch(id: number, x: number, y: number): void {
    const point = this.points.get(id);
    if (!point) return;

    this.recentInputCount += 1;
    const dampen = this.getActivityDampen();

    const now = performance.now();
    const dt = Math.max(now - point.timestamp, 1);

    point.prevX = point.x;
    point.prevY = point.y;
    point.vx = (x - point.x) / dt * 16;
    point.vy = (y - point.y) / dt * 16;
    point.x = x;
    point.y = y;
    point.timestamp = now;

    const speed = Math.sqrt(point.vx * point.vx + point.vy * point.vy);

    // Trail point with dampened opacity
    const baseOpacity = Math.min(0.3 + speed * 0.04, 0.55);
    this.trail.push({
      x, y,
      vx: point.vx, vy: point.vy,
      age: 0,
      opacity: baseOpacity * dampen,
      width: 12 + speed * 6,
    });

    // Swipe creates directional disturbances (dampened)
    if (speed > 0.3) {
      this.disturbances.push({
        x, y,
        vx: point.vx,
        vy: point.vy,
        strength: Math.min(speed * 0.3, 1.2) * dampen,
        radius: 50 + speed * 12,
        age: 0,
      });
      this.trimDisturbances();
    }

    // Trim trail
    while (this.trail.length > MAX_TRAIL_POINTS) {
      this.trail.shift();
    }
  }

  removeTouch(id: number): void {
    this.points.delete(id);
  }

  tick(deltaMs: number): void {
    // Decay activity counter (recovers ~5 per frame at 60fps)
    this.lastInputDecay += deltaMs;
    if (this.lastInputDecay > 16) {
      this.recentInputCount = Math.max(0, this.recentInputCount - 3);
      this.lastInputDecay = 0;
    }

    // Decay disturbances
    for (let i = this.disturbances.length - 1; i >= 0; i--) {
      const d = this.disturbances[i];
      d.age += deltaMs;
      d.strength *= 0.96;
      d.radius += 2;

      if (d.strength < 0.01) {
        this.disturbances.splice(i, 1);
      }
    }

    // Age and fade trail points
    for (let i = this.trail.length - 1; i >= 0; i--) {
      const t = this.trail[i];
      t.age += deltaMs;
      t.opacity *= 0.985; // Slow fade — trails linger beautifully
      t.width *= 1.003;   // Trails slightly expand as they age (oil spreading)

      // Trails drift slightly based on their initial velocity
      t.x += t.vx * 0.02;
      t.y += t.vy * 0.02;
      t.vx *= 0.98;
      t.vy *= 0.98;

      if (t.opacity < 0.01) {
        this.trail.splice(i, 1);
      }
    }
  }

  getDisturbances(): Disturbance[] {
    return this.disturbances;
  }

  getTrail(): TrailPoint[] {
    return this.trail;
  }

  getActiveTouchCount(): number {
    return this.points.size;
  }

  private trimDisturbances(): void {
    while (this.disturbances.length > MAX_DISTURBANCES) {
      this.disturbances.shift();
    }
  }
}
