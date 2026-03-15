import { useEffect, useRef } from 'react';
import type { UserColor, ShapeType } from '../../types/session';
import { generatePalette } from '../../visual/ColorPalette';

interface ShapePickerProps {
  color: UserColor;
  onSelect: (shape: ShapeType) => void;
}

const SHAPES: { type: ShapeType; label: string }[] = [
  { type: 'mandala',  label: 'Mandala' },
  { type: 'triangle', label: 'Triangle' },
  { type: 'hexagon',  label: 'Hexagon' },
  { type: 'circle',   label: 'Circle' },
];

function ShapePreview({ type, palette }: { type: ShapeType; palette: ReturnType<typeof generatePalette> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 120;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);
    ctx.translate(size / 2, size / 2);
    ctx.strokeStyle = palette.accent;
    ctx.fillStyle = palette.shapeFill;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 6]);

    const r = size * 0.32;

    switch (type) {
      case 'mandala':
        // 3 concentric rings with dots
        for (let ring = 1; ring <= 3; ring++) {
          const cr = r * ring * 0.33;
          ctx.beginPath();
          ctx.arc(0, 0, cr, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          const dots = ring * 6;
          for (let i = 0; i < dots; i++) {
            const angle = (Math.PI * 2 * i) / dots;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * cr, Math.sin(angle) * cr, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = palette.accent;
            ctx.fill();
          }
          ctx.setLineDash([3, 6]);
        }
        break;

      case 'triangle':
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const angle = (Math.PI * 2 * i) / 3 - Math.PI / 2;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'hexagon':
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'circle':
        for (let ring = 1; ring <= 3; ring++) {
          ctx.setLineDash([2 + ring * 2, 4 + ring * 2]);
          ctx.beginPath();
          ctx.arc(0, 0, r * ring * 0.33, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
    }
  }, [type, palette]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ imageRendering: 'auto' }}
    />
  );
}

export function ShapePicker({ color, onSelect }: ShapePickerProps) {
  const palette = generatePalette(color);

  return (
    <div
      className="flex flex-col items-center justify-center h-full px-6 gap-6 transition-colors duration-500"
      style={{ backgroundColor: palette.background }}
    >
      <h1 className="text-2xl font-light tracking-wide" style={{ color: palette.text }}>
        Pick a shape
      </h1>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {SHAPES.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className="aspect-square rounded-3xl flex flex-col items-center justify-center
                       gap-2 transition-transform duration-200 active:scale-95 p-4"
            style={{
              backgroundColor: palette.backgroundLight,
              border: `1px solid ${palette.shape}`,
            }}
            aria-label={`Select ${label} shape`}
          >
            <div className="w-20 h-20">
              <ShapePreview type={type} palette={palette} />
            </div>
            <span className="text-sm font-medium" style={{ color: palette.text }}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
