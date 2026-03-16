export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export interface MandalaRegion {
  index: number;
  ring: number;       // 0 = center, 1-3 = concentric rings
  segment: number;    // segment index within ring
  path: Path2D;       // pre-computed path for hit-test + render
  fill: HSLColor | null; // null = unfilled
}
