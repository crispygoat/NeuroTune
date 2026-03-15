import type { ColorPalette } from './ColorPalette';
import type { ShapeType } from '../types/session';
import type { Disturbance } from '../types/visual';

export class GeometricShape {
  private type: ShapeType = 'mandala';
  private palette: ColorPalette | null = null;
  private offsetX = 0;
  private offsetY = 0;
  private velocityX = 0;
  private velocityY = 0;
  private rotation = 0;
  private rotVelocity = 0;

  configure(type: ShapeType, palette: ColorPalette): void {
    this.type = type;
    this.palette = palette;
  }

  applyDisturbances(disturbances: Disturbance[], cx: number, cy: number): void {
    for (const d of disturbances) {
      const dx = cx + this.offsetX - d.x;
      const dy = cy + this.offsetY - d.y;
      const dist = Math.sqrt(dx * dx + dy * dy) + 1;
      if (dist < 300) {
        const force = d.strength * 8 / dist;
        this.velocityX += (dx / dist) * force;
        this.velocityY += (dy / dist) * force;
        // Swipe adds rotational force
        this.rotVelocity += (d.vx * dy - d.vy * dx) / (dist * dist) * d.strength * 0.001;
      }
    }
  }

  update(): void {
    // Spring-damper: pull back to center
    const springK = 0.005;
    const damping = 0.95;

    this.velocityX += -this.offsetX * springK;
    this.velocityY += -this.offsetY * springK;
    this.velocityX *= damping;
    this.velocityY *= damping;
    this.offsetX += this.velocityX;
    this.offsetY += this.velocityY;

    this.rotVelocity *= 0.97;
    this.rotation += this.rotVelocity;
  }

  render(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    size: number,
    elapsedMs: number,
    expansion: number
  ): void {
    if (!this.palette) return;

    ctx.save();
    ctx.translate(cx + this.offsetX, cy + this.offsetY);
    ctx.rotate(this.rotation + elapsedMs * 0.00002);

    // Breathing-linked size
    const breathSize = size * (0.85 + 0.15 * expansion);

    ctx.strokeStyle = this.palette.shape;
    ctx.fillStyle = this.palette.shapeFill;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 8]);
    ctx.lineDashOffset = elapsedMs * 0.008; // slow marching ants

    switch (this.type) {
      case 'mandala': this.drawMandala(ctx, breathSize, expansion); break;
      case 'triangle': this.drawTriangle(ctx, breathSize, expansion); break;
      case 'hexagon': this.drawHexagon(ctx, breathSize, expansion); break;
      case 'circle': this.drawCircles(ctx, breathSize, expansion); break;
    }

    ctx.restore();
  }

  private drawMandala(ctx: CanvasRenderingContext2D, size: number, expansion: number): void {
    if (!this.palette) return;
    const rings = 3;
    for (let ring = 1; ring <= rings; ring++) {
      const r = size * ring * 0.28;
      const dotCount = ring * 8;

      // Dashed ring
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();

      // Dots at vertices
      ctx.setLineDash([]);
      for (let i = 0; i < dotCount; i++) {
        const angle = (Math.PI * 2 * i) / dotCount;
        const dx = Math.cos(angle) * r;
        const dy = Math.sin(angle) * r;
        const dotSize = 1.5 + expansion * 1.5;
        ctx.beginPath();
        ctx.arc(dx, dy, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = this.palette.shape;
        ctx.fill();
      }
      ctx.setLineDash([4, 8]);
    }

    // Center dot
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(0, 0, 3 + expansion * 2, 0, Math.PI * 2);
    ctx.fillStyle = this.palette.accent;
    ctx.fill();
  }

  private drawTriangle(ctx: CanvasRenderingContext2D, size: number, expansion: number): void {
    if (!this.palette) return;
    const layers = 2;
    for (let layer = 0; layer < layers; layer++) {
      const r = size * (0.6 + layer * 0.35);
      const rotation = layer * Math.PI / 6;

      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const angle = (Math.PI * 2 * i) / 3 - Math.PI / 2 + rotation;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      if (layer === 0) ctx.fill();

      // Vertex dots
      ctx.setLineDash([]);
      for (let i = 0; i < 3; i++) {
        const angle = (Math.PI * 2 * i) / 3 - Math.PI / 2 + rotation;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        ctx.beginPath();
        ctx.arc(x, y, 2 + expansion * 2, 0, Math.PI * 2);
        ctx.fillStyle = this.palette.shape;
        ctx.fill();
      }
      ctx.setLineDash([4, 8]);
    }
  }

  private drawHexagon(ctx: CanvasRenderingContext2D, size: number, expansion: number): void {
    if (!this.palette) return;
    const layers = 2;
    for (let layer = 0; layer < layers; layer++) {
      const r = size * (0.5 + layer * 0.4);
      const rotation = layer * Math.PI / 12;

      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2 + rotation;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      if (layer === 0) ctx.fill();

      // Vertex dots
      ctx.setLineDash([]);
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2 + rotation;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        ctx.beginPath();
        ctx.arc(x, y, 2 + expansion, 0, Math.PI * 2);
        ctx.fillStyle = this.palette.shape;
        ctx.fill();
      }
      ctx.setLineDash([4, 8]);
    }
  }

  private drawCircles(ctx: CanvasRenderingContext2D, size: number, expansion: number): void {
    if (!this.palette) return;
    const rings = 3;
    for (let ring = 1; ring <= rings; ring++) {
      const r = size * ring * 0.3;
      ctx.setLineDash([3 + ring * 2, 6 + ring * 3]);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Center glow dot
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(0, 0, 4 + expansion * 3, 0, Math.PI * 2);
    ctx.fillStyle = this.palette.accent;
    ctx.fill();
  }
}
