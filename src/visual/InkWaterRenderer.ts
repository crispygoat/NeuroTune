import type { BreathCycle, InkBlobState, Disturbance } from '../types/visual';
import type { ShapeType } from '../types/session';
import type { ColorPalette } from './ColorPalette';
import type { TrailPoint } from './TouchField';
import { getBreathState } from './BreathingCycle';
import { GeometricShape } from './GeometricShape';
import { createBlob, updateBlob, shouldRespawn, renderBlob } from './InkParticle';

const BLOB_COUNT = 12;

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
    // Spawn 2-4 vivid splash blobs
    const count = 2 + Math.floor(Math.random() * 3);
    const minDim = Math.min(this.canvas.width, this.canvas.height);
    for (let i = 0; i < count; i++) {
      const blob = createBlob(this.palette, this.canvas.width, this.canvas.height);
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const spread = 20 + Math.random() * 40;
      blob.x = x + Math.cos(angle) * spread;
      blob.y = y + Math.sin(angle) * spread;
      // Give them outward velocity (splash!)
      blob.vx = Math.cos(angle) * 3;
      blob.vy = Math.sin(angle) * 3;
      blob.radius = minDim * 0.04;
      blob.maxRadius = minDim * (0.12 + Math.random() * 0.18);
      blob.opacity = 0.25;
      // Brighter splash blobs
      blob.lightness = Math.min(blob.lightness + 15, 80);
      blob.saturation = Math.min(blob.saturation + 10, 100);
      this.blobs.push(blob);
    }

    while (this.blobs.length > BLOB_COUNT + 15) {
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

    // Update and render morphing blobs
    const empty: Disturbance[] = [];
    for (let i = 0; i < this.blobs.length; i++) {
      updateBlob(this.blobs[i], deltaMs, elapsedMs, expansion, empty, this.intensity);

      if (shouldRespawn(this.blobs[i]) && this.blobs.length <= BLOB_COUNT + 15) {
        this.blobs[i] = createBlob(this.palette, w, h);
      }

      renderBlob(ctx, this.blobs[i]);
    }

    if (this.blobs.length > BLOB_COUNT) {
      this.blobs = this.blobs.filter((b, i) => i < BLOB_COUNT || !shouldRespawn(b));
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

    // Render each trail point as a glowing circle with shifting hue (gasoline effect)
    for (let i = 0; i < this.trailRef.length; i++) {
      const t = this.trailRef[i];
      if (t.opacity < 0.01) continue;

      // Shift hue slightly per point for iridescent/gasoline look
      const hueShift = (t.age * 0.02 + i * 3) % 40 - 20; // ±20 degrees of hue shift
      const trailHue = h + hueShift;
      const trailL = 55 + Math.sin(t.age * 0.005 + i) * 15; // shimmer lightness

      const gradient = ctx.createRadialGradient(
        t.x, t.y, 0,
        t.x, t.y, t.width
      );

      gradient.addColorStop(0, `hsla(${trailHue}, ${s}%, ${trailL}%, ${t.opacity * 0.6})`);
      gradient.addColorStop(0.3, `hsla(${trailHue + 10}, ${s * 0.8}%, ${trailL + 10}%, ${t.opacity * 0.35})`);
      gradient.addColorStop(0.6, `hsla(${trailHue - 10}, ${s * 0.6}%, ${trailL + 5}%, ${t.opacity * 0.15})`);
      gradient.addColorStop(1, `hsla(${trailHue}, ${s * 0.4}%, ${trailL}%, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.width, 0, Math.PI * 2);
      ctx.fill();
    }

    // Connect recent trail points with a smooth glowing line
    const recent = this.trailRef.filter(t => t.age < 800 && t.opacity > 0.05);
    if (recent.length > 1) {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 1; i < recent.length; i++) {
        const prev = recent[i - 1];
        const curr = recent[i];
        const alpha = curr.opacity * 0.5;

        if (alpha < 0.01) continue;

        const hueShift = (curr.age * 0.03 + i * 5) % 30 - 15;

        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(curr.x, curr.y);
        ctx.strokeStyle = `hsla(${h + hueShift}, ${s}%, 70%, ${alpha})`;
        ctx.lineWidth = curr.width * 0.4;
        ctx.stroke();
      }

      ctx.restore();
    }
  }
}
