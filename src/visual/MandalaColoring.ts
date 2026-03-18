import type { HSLColor, MandalaRegion } from '../types/mandala';
import type { ShapeType } from '../types/session';

// --- Shape-specific ring configs ---

const MANDALA_RINGS = [
  { innerFrac: 0.00, outerFrac: 0.12, segments: 1 },
  { innerFrac: 0.12, outerFrac: 0.30, segments: 6 },
  { innerFrac: 0.30, outerFrac: 0.55, segments: 10 },
  { innerFrac: 0.55, outerFrac: 0.78, segments: 12 },
  { innerFrac: 0.78, outerFrac: 1.00, segments: 8 },
];

const CIRCLE_RINGS = [
  { innerFrac: 0.00, outerFrac: 0.18, segments: 1 },
  { innerFrac: 0.18, outerFrac: 0.40, segments: 4 },
  { innerFrac: 0.40, outerFrac: 0.65, segments: 6 },
  { innerFrac: 0.65, outerFrac: 0.85, segments: 8 },
  { innerFrac: 0.85, outerFrac: 1.00, segments: 8 },
];

const TRI_RADII = [0.00, 0.22, 0.48, 0.75, 1.00];
const TRI_SEGS =  [1,    3,    6,    9,    9];

const HEX_RADII = [0.00, 0.18, 0.42, 0.70, 1.00];
const HEX_SEGS =  [1,    6,    12,   12,   6];

// --- Polygon vertex helpers ---

function polyVertex(cx: number, cy: number, R: number, sides: number, idx: number): [number, number] {
  const angle = (2 * Math.PI * idx) / sides - Math.PI / 2;
  return [cx + Math.cos(angle) * R, cy + Math.sin(angle) * R];
}

function polyEdgePoint(cx: number, cy: number, R: number, sides: number, edge: number, t: number): [number, number] {
  const [x0, y0] = polyVertex(cx, cy, R, sides, edge);
  const [x1, y1] = polyVertex(cx, cy, R, sides, (edge + 1) % sides);
  return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
}

export class MandalaColoring {
  private regions: MandalaRegion[] = [];
  private baseRadius = 0;
  private shapeType: ShapeType = 'mandala';
  private activeColor: HSLColor | null = null;
  private paintingEnabled = true;
  private outlineOpacity = 0.6;
  private fillDarkenFactor = 1.0;

  generate(cx: number, cy: number, maxRadius: number, shapeType: ShapeType = 'mandala'): void {
    this.baseRadius = maxRadius;
    this.shapeType = shapeType;

    const oldFills = this.regions.map((r) => r.fill);
    this.regions = [];

    switch (shapeType) {
      case 'mandala':  this.generateRadial(cx, cy, maxRadius, MANDALA_RINGS); break;
      case 'circle':   this.generateRadial(cx, cy, maxRadius, CIRCLE_RINGS); break;
      case 'triangle': this.generatePolygon(cx, cy, maxRadius, 3, TRI_RADII, TRI_SEGS); break;
      case 'hexagon':  this.generatePolygon(cx, cy, maxRadius, 6, HEX_RADII, HEX_SEGS); break;
    }

    // Restore fills from before resize
    for (let i = 0; i < this.regions.length; i++) {
      if (i < oldFills.length) this.regions[i].fill = oldFills[i];
    }
  }

  regenerate(cx: number, cy: number, maxRadius: number): void {
    this.generate(cx, cy, maxRadius, this.shapeType);
  }

  // --- Radial generator (mandala + circle) ---

  private generateRadial(
    cx: number, cy: number, R: number,
    rings: { innerFrac: number; outerFrac: number; segments: number }[],
  ): void {
    let index = 0;

    for (let ringIdx = 0; ringIdx < rings.length; ringIdx++) {
      const ring = rings[ringIdx];
      const innerR = R * ring.innerFrac;
      const outerR = R * ring.outerFrac;
      const n = ring.segments;
      const angleOffset = ringIdx % 2 !== 0 && n > 1 ? Math.PI / n : 0;

      for (let seg = 0; seg < n; seg++) {
        const path = new Path2D();
        let centroid: { x: number; y: number };

        if (n === 1) {
          path.arc(cx, cy, outerR, 0, Math.PI * 2);
          centroid = { x: cx, y: cy };
        } else {
          const a0 = (2 * Math.PI * seg) / n - Math.PI / 2 + angleOffset;
          const a1 = (2 * Math.PI * (seg + 1)) / n - Math.PI / 2 + angleOffset;

          path.arc(cx, cy, outerR, a0, a1);
          path.lineTo(cx + Math.cos(a1) * innerR, cy + Math.sin(a1) * innerR);
          path.arc(cx, cy, innerR, a1, a0, true);
          path.closePath();

          const midR = (outerR + innerR) / 2;
          const midA = (a0 + a1) / 2;
          centroid = { x: cx + Math.cos(midA) * midR, y: cy + Math.sin(midA) * midR };
        }

        this.regions.push({ index, ring: ringIdx, segment: seg, path, fill: null, centroid });
        index++;
      }
    }
  }

  // --- Polygon generator (triangle + hexagon) ---

  private generatePolygon(
    cx: number, cy: number, R: number,
    sides: number,
    radii: number[],
    segs: number[],
  ): void {
    let index = 0;

    // Band 0: center polygon
    {
      const r = R * radii[1];
      const path = new Path2D();
      for (let v = 0; v < sides; v++) {
        const [px, py] = polyVertex(cx, cy, r, sides, v);
        v === 0 ? path.moveTo(px, py) : path.lineTo(px, py);
      }
      path.closePath();
      this.regions.push({ index, ring: 0, segment: 0, path, fill: null, centroid: { x: cx, y: cy } });
      index++;
    }

    // Outer bands: trapezoidal cells between concentric polygons
    for (let band = 1; band < radii.length - 1; band++) {
      const innerR = R * radii[band];
      const outerR = R * radii[band + 1];
      const totalSegs = segs[band + 1];
      const segsPerSide = totalSegs / sides;

      for (let side = 0; side < sides; side++) {
        for (let s = 0; s < segsPerSide; s++) {
          const t0 = s / segsPerSide;
          const t1 = (s + 1) / segsPerSide;

          const [ix0, iy0] = polyEdgePoint(cx, cy, innerR, sides, side, t0);
          const [ix1, iy1] = polyEdgePoint(cx, cy, innerR, sides, side, t1);
          const [ox0, oy0] = polyEdgePoint(cx, cy, outerR, sides, side, t0);
          const [ox1, oy1] = polyEdgePoint(cx, cy, outerR, sides, side, t1);

          const path = new Path2D();
          path.moveTo(ox0, oy0);
          path.lineTo(ox1, oy1);
          path.lineTo(ix1, iy1);
          path.lineTo(ix0, iy0);
          path.closePath();

          const centroid = {
            x: (ox0 + ox1 + ix1 + ix0) / 4,
            y: (oy0 + oy1 + iy1 + iy0) / 4,
          };

          this.regions.push({ index, ring: band, segment: side * segsPerSide + s, path, fill: null, centroid });
          index++;
        }
      }
    }
  }

  // --- Hit testing & fill ---

  hitTest(ctx: CanvasRenderingContext2D, x: number, y: number): number {
    for (let i = this.regions.length - 1; i >= 0; i--) {
      if (ctx.isPointInPath(this.regions[i].path, x, y)) return i;
    }
    return -1;
  }

  fillRegion(regionIndex: number): boolean {
    if (!this.paintingEnabled || !this.activeColor) return false;
    if (regionIndex < 0 || regionIndex >= this.regions.length) return false;
    this.regions[regionIndex].fill = { ...this.activeColor };
    return true;
  }

  clearRegion(regionIndex: number): void {
    if (!this.paintingEnabled) return;
    if (regionIndex < 0 || regionIndex >= this.regions.length) return;
    this.regions[regionIndex].fill = null;
  }

  setActiveColor(color: HSLColor | null): void { this.activeColor = color; }
  getActiveColor(): HSLColor | null { return this.activeColor; }
  setPaintingEnabled(enabled: boolean): void { this.paintingEnabled = enabled; }
  isPaintingEnabled(): boolean { return this.paintingEnabled; }

  setOutlineOpacity(opacity: number): void {
    this.outlineOpacity = Math.max(0, Math.min(1, opacity));
  }

  setFillDarkenFactor(factor: number): void {
    this.fillDarkenFactor = Math.max(0, Math.min(1, factor));
  }

  // --- Rendering ---

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
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);

      for (const region of this.regions) {
        ctx.stroke(region.path);
      }

      // Region numbers on unfilled regions
      if (this.paintingEnabled && this.outlineOpacity > 0.3) {
        const fontSize = Math.min(24, Math.max(10, this.baseRadius * 0.035));
        ctx.font = `${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(255, 255, 255, ${(this.outlineOpacity * 0.25).toFixed(3)})`;

        for (const region of this.regions) {
          if (region.fill) continue;
          ctx.fillText(`${region.index + 1}`, region.centroid.x, region.centroid.y);
        }
      }
    }
  }
}
