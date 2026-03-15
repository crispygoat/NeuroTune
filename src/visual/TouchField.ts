import type { TouchPoint, Disturbance } from '../types/visual';

const MAX_DISTURBANCES = 20;
const MAX_TRAIL_POINTS = 150;

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

  addTouch(id: number, x: number, y: number): void {
    this.points.set(id, {
      id, x, y,
      prevX: x, prevY: y,
      vx: 0, vy: 0,
      timestamp: performance.now(),
      active: true,
    });

    // Tap creates a strong radial burst
    this.disturbances.push({
      x, y,
      vx: 0, vy: 0,
      strength: 1.5,
      radius: 100,
      age: 0,
    });

    // Start trail at tap point
    this.trail.push({
      x, y, vx: 0, vy: 0,
      age: 0, opacity: 0.8, width: 30,
    });

    this.trimDisturbances();
  }

  updateTouch(id: number, x: number, y: number): void {
    const point = this.points.get(id);
    if (!point) return;

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

    // Add trail point for every move (visible gasoline streak)
    this.trail.push({
      x, y,
      vx: point.vx, vy: point.vy,
      age: 0,
      opacity: Math.min(0.6 + speed * 0.05, 0.9),
      width: 15 + speed * 8,
    });

    // Swipe creates directional disturbances
    if (speed > 0.3) {
      this.disturbances.push({
        x, y,
        vx: point.vx,
        vy: point.vy,
        strength: Math.min(speed * 0.4, 1.5),
        radius: 60 + speed * 15,
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
