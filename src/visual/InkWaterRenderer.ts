import type { BreathCycle, InkBlobState, Disturbance } from '../types/visual';
import type { ShapeType } from '../types/session';
import type { ColorPalette } from './ColorPalette';
import type { TrailPoint } from './TouchField';
import { getBreathState } from './BreathingCycle';
import { GeometricShape } from './GeometricShape';
import { createBlob, updateBlob, shouldRespawn, renderBlob } from './InkParticle';

const BLOB_COUNT = 12;
const MAX_RIPPLES = 10;

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  hue: number;
}

export class InkWaterRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private blobs: InkBlobState[] = [];
  private shape: GeometricShape;
  private palette: ColorPalette | null = null;
  private breathCycle: BreathCycle | null = null;
  private intensity = 0.6;
  private animFrameId: number | null = null;
  private running = false;
  private startTime = 0;
  private lastFrameTime = 0;
  private trailRef: TrailPoint[] = [];
  private ripples: Ripple[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.shape = new GeometricShape();
  }

  configure(palette: ColorPalette, shapeType: ShapeType, breathCycle: BreathCycle): void {
    this.palette = palette;
    this.breathCycle = breathCycle;
    this.shape.configure(shapeType, palette);

    this.blobs = [];
    const w = this.canvas.width;
    const h = this.canvas.height;
    for (let i = 0; i < BLOB_COUNT; i++) {
      const blob = createBlob(palette, w, h);
      blob.age = Math.random() * blob.lifespan * 0.6;
      this.blobs.push(blob);
    }
  }

  /** Seamlessly transition to a new palette/shape without restarting the animation */
  transitionTo(palette: ColorPalette, shapeType: ShapeType): void {
    const prevPalette = this.palette;
    this.palette = palette;
    this.shape.configure(shapeType, palette);

    if (!prevPalette) return;

    // Gradually morph existing blobs toward the new palette hue/saturation
    const w = this.canvas.width;
    const h = this.canvas.height;
    for (const blob of this.blobs) {
      // Shift hue/saturation halfway toward new palette (rest will come from natural respawn)
      blob.hue = blob.hue + (palette.hue - prevPalette.hue) * 0.6;
      blob.saturation = blob.saturation + (palette.saturation - prevPalette.saturation) * 0.6;
      blob.lightness = blob.lightness + (palette.lightness - prevPalette.lightness) * 0.4;
    }

    // Spawn a few fresh blobs with the new palette to immediately show the new color
    for (let i = 0; i < 4; i++) {
      const blob = createBlob(palette, w, h);
      blob.opacity = 0.15;
      this.blobs.push(blob);
    }

    // Trim excess
    while (this.blobs.length > BLOB_COUNT + 20) {
      this.blobs.shift();
    }
  }

  setIntensity(intensity: number): void {
    this.intensity = Math.max(0, Math.min(1, intensity));
  }

  setTrailRef(trail: TrailPoint[]): void {
    this.trailRef = trail;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.startTime = performance.now();
    this.lastFrameTime = this.startTime;
    this.tick();
  }

  stop(): void {
    this.running = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  applyDisturbances(disturbances: Disturbance[]): void {
    if (!this.palette) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    this.shape.applyDisturbances(disturbances, cx, cy);

    // Push blobs with stronger force for more dramatic reaction
    for (const blob of this.blobs) {
      for (const d of disturbances) {
        const dx = blob.x - d.x;
        const dy = blob.y - d.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1;
        if (dist < d.radius * 3) {
          const force = d.strength * 15 / dist;
          // Push away from touch
          blob.vx += (dx / dist) * force;
          blob.vy += (dy / dist) * force;
          // Add swirl — perpendicular to the distance vector
          const swirlForce = d.strength * 3 / dist;
          blob.vx += (-dy / dist) * swirlForce * (d.vx > 0 ? 1 : -1);
          blob.vy += (dx / dist) * swirlForce * (d.vy > 0 ? 1 : -1);
        }
      }
    }
  }

  spawnAtPoint(x: number, y: number): void {
    if (!this.palette) return;
    const minDim = Math.min(this.canvas.width, this.canvas.height);

    // Spawn 2-3 splash blobs (softer, fewer)
    const count = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      const blob = createBlob(this.palette, this.canvas.width, this.canvas.height);
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const spread = 20 + Math.random() * 40;
      blob.x = x + Math.cos(angle) * spread;
      blob.y = y + Math.sin(angle) * spread;
      blob.vx = Math.cos(angle) * 3;
      blob.vy = Math.sin(angle) * 3;
      blob.radius = minDim * 0.04;
      blob.maxRadius = minDim * (0.10 + Math.random() * 0.15);
      blob.opacity = 0.15;
      blob.lightness = Math.min(blob.lightness + 15, 75);
      blob.saturation = Math.min(blob.saturation + 10, 95);
      this.blobs.push(blob);
    }

    // Expanding ripple ring at tap point (subtle)
    this.ripples.push({
      x, y,
      radius: 10,
      maxRadius: minDim * (0.12 + Math.random() * 0.08),
      opacity: 0.3,
      hue: this.palette.hue + (Math.random() - 0.5) * 30,
    });
    while (this.ripples.length > MAX_RIPPLES) {
      this.ripples.shift();
    }

    while (this.blobs.length > BLOB_COUNT + 20) {
      this.blobs.shift();
    }
  }

  private tick = (): void => {
    if (!this.running) return;

    const now = performance.now();
    const deltaMs = now - this.lastFrameTime;
    this.lastFrameTime = now;
    const elapsedMs = now - this.startTime;

    this.render(elapsedMs, deltaMs);
    this.animFrameId = requestAnimationFrame(this.tick);
  };

  private render(elapsedMs: number, deltaMs: number): void {
    if (!this.palette || !this.breathCycle) return;

    const ctx = this.ctx;
    const dpr = window.devicePixelRatio || 1;

    const targetW = Math.floor(this.canvas.clientWidth * dpr);
    const targetH = Math.floor(this.canvas.clientHeight * dpr);
    if (this.canvas.width !== targetW || this.canvas.height !== targetH) {
      this.canvas.width = targetW;
      this.canvas.height = targetH;
    }

    const w = this.canvas.width;
    const h = this.canvas.height;

    const breath = getBreathState(elapsedMs, this.breathCycle);
    const expansion = breath.expansion;

    // Clear with vivid background
    ctx.fillStyle = this.palette.background;
    ctx.fillRect(0, 0, w, h);

    // Breathing radial glow
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
    bgGrad.addColorStop(0, this.palette.backgroundLight);
    bgGrad.addColorStop(1, this.palette.background);
    ctx.globalAlpha = 0.4 + expansion * 0.3;
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;

    // ===== Render touch trails (gasoline-on-water effect) =====
    this.renderTrails(ctx, elapsedMs);

    // ===== Update and render expanding ripple rings =====
    this.updateAndRenderRipples(ctx, deltaMs);

    // Update and render morphing blobs
    const empty: Disturbance[] = [];
    for (let i = 0; i < this.blobs.length; i++) {
      updateBlob(this.blobs[i], deltaMs, elapsedMs, expansion, empty, this.intensity);

      if (shouldRespawn(this.blobs[i]) && this.blobs.length <= BLOB_COUNT + 20) {
        this.blobs[i] = createBlob(this.palette, w, h);
      }

      renderBlob(ctx, this.blobs[i]);
    }

    if (this.blobs.length > BLOB_COUNT) {
      this.blobs = this.blobs.filter((b, idx) => idx < BLOB_COUNT || !shouldRespawn(b));
    }

    // Render geometric shape
    const cx = w / 2;
    const cy = h / 2;
    const shapeSize = Math.min(w, h) * 0.2;
    this.shape.update();
    this.shape.render(ctx, cx, cy, shapeSize, elapsedMs, expansion);
  }

  private renderTrails(ctx: CanvasRenderingContext2D, _elapsedMs: number): void {
    if (!this.palette || this.trailRef.length === 0) return;

    const h = this.palette.hue;
    const s = this.palette.saturation;

    // Layer 1: Soft bloom underlay (large, blurred glow behind each trail point)
    for (let i = 0; i < this.trailRef.length; i++) {
      const t = this.trailRef[i];
      if (t.opacity < 0.02) continue;

      const bloomRadius = t.width * 2;
      const bloomAlpha = t.opacity * 0.08;
      const hueShift = (t.age * 0.015 + i * 4) % 60 - 30;

      const bloom = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, bloomRadius);
      bloom.addColorStop(0, `hsla(${h + hueShift}, ${s * 0.7}%, 65%, ${bloomAlpha})`);
      bloom.addColorStop(0.5, `hsla(${h + hueShift + 15}, ${s * 0.5}%, 60%, ${bloomAlpha * 0.4})`);
      bloom.addColorStop(1, `hsla(${h + hueShift}, ${s * 0.3}%, 55%, 0)`);

      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(t.x, t.y, bloomRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Layer 2: Core iridescent trail points (gasoline shimmer)
    for (let i = 0; i < this.trailRef.length; i++) {
      const t = this.trailRef[i];
      if (t.opacity < 0.01) continue;

      // Wider chromatic shift for more rainbow iridescence
      const hueShift = (t.age * 0.025 + i * 5) % 60 - 30;
      const trailHue = h + hueShift;
      const trailL = 55 + Math.sin(t.age * 0.004 + i * 0.7) * 20;

      const gradient = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, t.width);
      gradient.addColorStop(0, `hsla(${trailHue}, ${s}%, ${trailL + 10}%, ${t.opacity * 0.5})`);
      gradient.addColorStop(0.25, `hsla(${trailHue + 20}, ${s * 0.9}%, ${trailL + 15}%, ${t.opacity * 0.3})`);
      gradient.addColorStop(0.5, `hsla(${trailHue - 15}, ${s * 0.7}%, ${trailL + 5}%, ${t.opacity * 0.12})`);
      gradient.addColorStop(0.75, `hsla(${trailHue + 30}, ${s * 0.5}%, ${trailL}%, ${t.opacity * 0.04})`);
      gradient.addColorStop(1, `hsla(${trailHue}, ${s * 0.3}%, ${trailL}%, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.width, 0, Math.PI * 2);
      ctx.fill();
    }

    // Layer 3: Smooth Bezier curve connecting recent trail points
    const recent = this.trailRef.filter(t => t.age < 1000 && t.opacity > 0.04);
    if (recent.length > 2) {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Outer glow stroke (wider, softer)
      for (let i = 2; i < recent.length; i++) {
        const p0 = recent[i - 2];
        const p1 = recent[i - 1];
        const curr = recent[i];
        const alpha = curr.opacity * 0.2;
        if (alpha < 0.01) continue;

        const hueShift = (curr.age * 0.03 + i * 6) % 40 - 20;
        const midX = (p1.x + curr.x) / 2;
        const midY = (p1.y + curr.y) / 2;

        ctx.beginPath();
        ctx.moveTo((p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
        ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
        ctx.strokeStyle = `hsla(${h + hueShift}, ${s * 0.8}%, 70%, ${alpha})`;
        ctx.lineWidth = curr.width * 0.7;
        ctx.stroke();
      }

      // Inner bright core stroke (thinner, brighter)
      for (let i = 2; i < recent.length; i++) {
        const p0 = recent[i - 2];
        const p1 = recent[i - 1];
        const curr = recent[i];
        const alpha = curr.opacity * 0.5;
        if (alpha < 0.01) continue;

        const hueShift = (curr.age * 0.02 + i * 4) % 30 - 15;
        const midX = (p1.x + curr.x) / 2;
        const midY = (p1.y + curr.y) / 2;

        ctx.beginPath();
        ctx.moveTo((p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
        ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
        ctx.strokeStyle = `hsla(${h + hueShift + 10}, ${s}%, 80%, ${alpha})`;
        ctx.lineWidth = curr.width * 0.2;
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  private updateAndRenderRipples(ctx: CanvasRenderingContext2D, deltaMs: number): void {
    if (!this.palette) return;
    const s = this.palette.saturation;

    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      // Expand and fade
      r.radius += deltaMs * 0.15;
      r.opacity *= 0.97;

      if (r.opacity < 0.005 || r.radius > r.maxRadius) {
        this.ripples.splice(i, 1);
        continue;
      }

      const progress = r.radius / r.maxRadius;

      // Draw ring with gradient stroke
      ctx.save();
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${r.hue}, ${s}%, ${65 + progress * 15}%, ${r.opacity})`;
      ctx.lineWidth = 3 * (1 - progress) + 1;
      ctx.stroke();

      // Inner softer ring
      if (r.opacity > 0.1) {
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${r.hue + 20}, ${s * 0.7}%, 75%, ${r.opacity * 0.4})`;
        ctx.lineWidth = 1.5 * (1 - progress) + 0.5;
        ctx.stroke();
      }
      ctx.restore();
    }
  }
}
