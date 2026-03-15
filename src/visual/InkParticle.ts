import type { InkBlobState, Disturbance } from '../types/visual';
import type { ColorPalette } from './ColorPalette';

// Organic drift using layered sine waves — slow, dreamlike
function organicDrift(time: number, phase: number, scale: number): number {
  return Math.sin(time * 0.00015 + phase) * scale * 0.5
       + Math.sin(time * 0.00035 + phase * 2.3) * scale * 0.3
       + Math.sin(time * 0.00075 + phase * 5.7) * scale * 0.2;
}

export function createBlob(
  palette: ColorPalette,
  canvasW: number,
  canvasH: number
): InkBlobState {
  const inkColor = palette.ink[Math.floor(Math.random() * palette.ink.length)];
  const match = inkColor.match(/hsla?\((\d+),\s*(\d+)%?,\s*(\d+)%?,\s*([\d.]+)\)/);
  const h = match ? parseInt(match[1]) : palette.hue;
  const s = match ? parseInt(match[2]) : palette.saturation;
  const l = match ? parseInt(match[3]) : palette.lightness;

  const cx = canvasW / 2;
  const cy = canvasH / 2;
  const spread = Math.min(canvasW, canvasH) * 0.5;
  const minDim = Math.min(canvasW, canvasH);

  return {
    x: cx + (Math.random() - 0.5) * spread,
    y: cy + (Math.random() - 0.5) * spread,
    vx: 0,
    vy: 0,
    radius: minDim * (0.15 + Math.random() * 0.15),       // BIG: 15-30% of screen
    maxRadius: minDim * (0.25 + Math.random() * 0.25),     // Grow up to 25-50%
    opacity: 0.01,
    hue: h,
    saturation: s + (Math.random() - 0.5) * 10,
    lightness: l + (Math.random() - 0.5) * 15,
    age: 0,
    lifespan: 15000 + Math.random() * 20000, // 15-35 seconds (slower lifecycle)
    phase: Math.random() * Math.PI * 2,
  };
}

export function updateBlob(
  blob: InkBlobState,
  deltaMs: number,
  elapsedMs: number,
  expansion: number,
  disturbances: Disturbance[],
  intensity: number
): void {
  blob.age += deltaMs;

  // Very slow organic drift — blobs glide and morph
  const driftScale = 30;
  blob.vx += organicDrift(elapsedMs, blob.phase, driftScale) * 0.003;
  blob.vy += organicDrift(elapsedMs, blob.phase + 100, driftScale) * 0.003;

  // Apply disturbance forces
  for (const d of disturbances) {
    const dx = blob.x - d.x;
    const dy = blob.y - d.y;
    const dist = Math.sqrt(dx * dx + dy * dy) + 1;
    if (dist < d.radius * 2) {
      const force = d.strength * 5 / dist;
      blob.vx += (dx / dist) * force + d.vx * d.strength * 0.1;
      blob.vy += (dy / dist) * force + d.vy * d.strength * 0.1;
    }
  }

  // Apply velocity with heavy damping (viscous, underwater feel)
  blob.x += blob.vx;
  blob.y += blob.vy;
  blob.vx *= 0.985;
  blob.vy *= 0.985;

  // Breathing-linked radius morphing
  const ageRatio = blob.age / blob.lifespan;
  const breathRadius = blob.maxRadius * (0.7 + 0.3 * expansion);
  // Smooth approach to target radius
  blob.radius += (breathRadius - blob.radius) * 0.01;

  // Opacity lifecycle: fade in, sustain with breathing, fade out
  const targetOpacity = intensity * 0.35;
  if (ageRatio < 0.15) {
    blob.opacity += (targetOpacity - blob.opacity) * 0.02;
  } else if (ageRatio > 0.75) {
    blob.opacity *= 0.997;
  } else {
    const breathOpacity = targetOpacity * (0.8 + 0.2 * expansion);
    blob.opacity += (breathOpacity - blob.opacity) * 0.02;
  }
}

export function shouldRespawn(blob: InkBlobState): boolean {
  return blob.opacity < 0.005 || blob.age > blob.lifespan;
}

export function renderBlob(
  ctx: CanvasRenderingContext2D,
  blob: InkBlobState
): void {
  if (blob.opacity < 0.003) return;

  const gradient = ctx.createRadialGradient(
    blob.x, blob.y, 0,
    blob.x, blob.y, blob.radius
  );
  gradient.addColorStop(0, `hsla(${blob.hue}, ${blob.saturation}%, ${blob.lightness}%, ${blob.opacity})`);
  gradient.addColorStop(0.4, `hsla(${blob.hue}, ${blob.saturation}%, ${blob.lightness}%, ${blob.opacity * 0.6})`);
  gradient.addColorStop(0.7, `hsla(${blob.hue}, ${blob.saturation}%, ${blob.lightness}%, ${blob.opacity * 0.25})`);
  gradient.addColorStop(1, `hsla(${blob.hue}, ${blob.saturation}%, ${blob.lightness}%, 0)`);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
  ctx.fill();
}
