import type { HSLColor, MandalaRegion } from '../types/mandala';

const SEGMENTS_PER_RING = [1, 6, 12, 12];
const RADIUS_FRACTIONS = [0.08, 0.18, 0.28, 0.38];

export class MandalaColoring {
  private regions: MandalaRegion[] = [];
  private centerX = 0;
  private centerY = 0;
  private baseRadius = 0;
  private activeColor: HSLColor | null = null;
  private paintingEnabled = true;
  private outlineOpacity = 0.6;
  private fillDarkenFactor = 1.0;

  /**
   * Generate all mandala regions as Path2D objects.
   * Call on init and on canvas resize (preserves fill state if regions already exist).
   */
  generate(cx: number, cy: number, maxRadius: number): void {
    this.centerX = cx;
    this.centerY = cy;
    this.baseRadius = maxRadius;

    // Preserve existing fills if regenerating after resize
    const oldFills = this.regions.map((r) => r.fill);

    this.regions = [];
    let index = 0;

    for (let ring = 0; ring < SEGMENTS_PER_RING.length; ring++) {
      const outerR = maxRadius * RADIUS_FRACTIONS[ring];
      const innerR = ring === 0 ? 0 : maxRadius * RADIUS_FRACTIONS[ring - 1];
      const segments = SEGMENTS_PER_RING[ring];
      // Offset odd rings by half a segment for visual variety
      const angleOffset = ring % 2 === 0 ? 0 : Math.PI / segments;

      for (let seg = 0; seg < segments; seg++) {
        const path = new Path2D();

        if (ring === 0) {
          // Center circle
          path.arc(cx, cy, outerR, 0, Math.PI * 2);
        } else {
          // Wedge segment (annular sector)
          const startAngle = (Math.PI * 2 * seg) / segments - Math.PI / 2 + angleOffset;
          const endAngle = (Math.PI * 2 * (seg + 1)) / segments - Math.PI / 2 + angleOffset;

          path.arc(cx, cy, outerR, startAngle, endAngle);
          path.lineTo(
            cx + Math.cos(endAngle) * innerR,
            cy + Math.sin(endAngle) * innerR,
          );
          path.arc(cx, cy, innerR, endAngle, startAngle, true);
          path.closePath();
        }

        this.regions.push({
          index,
          ring,
          segment: seg,
          path,
          fill: oldFills[index] ?? null,
        });
        index++;
      }
    }
  }

  /** Hit-test a canvas-space point. Returns region index or -1. */
  hitTest(ctx: CanvasRenderingContext2D, x: number, y: number): number {
    for (let i = this.regions.length - 1; i >= 0; i--) {
      if (ctx.isPointInPath(this.regions[i].path, x, y)) {
        return i;
      }
    }
    return -1;
  }

  /** Fill a region with the active paint color. Returns true if filled. */
  fillRegion(regionIndex: number): boolean {
    if (!this.paintingEnabled || !this.activeColor) return false;
    if (regionIndex < 0 || regionIndex >= this.regions.length) return false;
    this.regions[regionIndex].fill = { ...this.activeColor };
    return true;
  }

  /** Clear a region (eraser). */
  clearRegion(regionIndex: number): void {
    if (!this.paintingEnabled) return;
    if (regionIndex < 0 || regionIndex >= this.regions.length) return;
    this.regions[regionIndex].fill = null;
  }

  setActiveColor(color: HSLColor | null): void {
    this.activeColor = color;
  }

  getActiveColor(): HSLColor | null {
    return this.activeColor;
  }

  setPaintingEnabled(enabled: boolean): void {
    this.paintingEnabled = enabled;
  }

  isPaintingEnabled(): boolean {
    return this.paintingEnabled;
  }

  setOutlineOpacity(opacity: number): void {
    this.outlineOpacity = Math.max(0, Math.min(1, opacity));
  }

  setFillDarkenFactor(factor: number): void {
    this.fillDarkenFactor = Math.max(0, Math.min(1, factor));
  }

  /** Render all mandala regions. Fills first, then outlines on top. */
  render(ctx: CanvasRenderingContext2D): void {
    if (this.regions.length === 0) return;

    // Pass 1: filled regions
    for (const region of this.regions) {
      if (!region.fill) continue;
      const { h, s, l } = region.fill;
      const darkenedL = l * this.fillDarkenFactor;
      const alpha = 0.7 * this.fillDarkenFactor + 0.15;
      ctx.fillStyle = `hsla(${h}, ${s}%, ${darkenedL}%, ${alpha.toFixed(2)})`;
      ctx.fill(region.path);
    }

    // Pass 2: outlines
    if (this.outlineOpacity > 0.01) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${(this.outlineOpacity * 0.4).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([]);

      for (const region of this.regions) {
        ctx.stroke(region.path);
      }

      // Region numbers on unfilled regions (only while painting is active)
      if (this.paintingEnabled && this.outlineOpacity > 0.3) {
        ctx.font = `${Math.max(10, this.baseRadius * 0.04)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(255, 255, 255, ${(this.outlineOpacity * 0.25).toFixed(3)})`;

        for (const region of this.regions) {
          if (region.fill) continue;
          const c = this.getRegionCentroid(region);
          ctx.fillText(`${region.index + 1}`, c.x, c.y);
        }
      }
    }
  }

  private getRegionCentroid(region: MandalaRegion): { x: number; y: number } {
    if (region.ring === 0) {
      return { x: this.centerX, y: this.centerY };
    }

    const outerR = this.baseRadius * RADIUS_FRACTIONS[region.ring];
    const innerR = this.baseRadius * RADIUS_FRACTIONS[region.ring - 1];
    const midR = (outerR + innerR) / 2;
    const segments = SEGMENTS_PER_RING[region.ring];
    const angleOffset = region.ring % 2 === 0 ? 0 : Math.PI / segments;
    const midAngle = (Math.PI * 2 * (region.segment + 0.5)) / segments - Math.PI / 2 + angleOffset;

    return {
      x: this.centerX + Math.cos(midAngle) * midR,
      y: this.centerY + Math.sin(midAngle) * midR,
    };
  }
}
