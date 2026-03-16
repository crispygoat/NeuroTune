import { useState, useCallback } from 'react';
import type { HSLColor } from '../../types/mandala';

interface PaintPaletteProps {
  onColorSelect: (color: HSLColor | null) => void;
}

const PAINT_COLORS: { label: string; hsl: HSLColor; hex: string }[] = [
  { label: 'Red',    hsl: { h: 355, s: 80, l: 55 }, hex: '#E63946' },
  { label: 'Orange', hsl: { h: 25,  s: 85, l: 55 }, hex: '#E76F51' },
  { label: 'Yellow', hsl: { h: 48,  s: 85, l: 58 }, hex: '#E9C46A' },
  { label: 'Green',  hsl: { h: 145, s: 65, l: 45 }, hex: '#2D936C' },
  { label: 'Teal',   hsl: { h: 180, s: 60, l: 45 }, hex: '#2A9D8F' },
  { label: 'Blue',   hsl: { h: 220, s: 75, l: 55 }, hex: '#457B9D' },
  { label: 'Purple', hsl: { h: 270, s: 65, l: 55 }, hex: '#7B2D8B' },
  { label: 'Pink',   hsl: { h: 330, s: 70, l: 65 }, hex: '#E07B9B' },
];

export function PaintPalette({ onColorSelect }: PaintPaletteProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Start with first color pre-selected
  const handleSelect = useCallback((index: number, color: HSLColor | null) => {
    setSelectedIndex(index);
    onColorSelect(color);
  }, [onColorSelect]);

  return (
    <div className="absolute bottom-20 left-0 right-0 flex justify-center z-20 pointer-events-none px-4">
      <div className="flex items-center gap-2 p-2 rounded-full bg-black/20 backdrop-blur-sm pointer-events-auto">
        {/* Eraser */}
        <button
          onClick={() => handleSelect(-1, null)}
          className="w-9 h-9 rounded-full border-2 flex items-center justify-center
                     transition-transform duration-150 active:scale-90 shrink-0"
          style={{
            borderColor: selectedIndex === -1 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)',
            backgroundColor: 'rgba(255,255,255,0.1)',
            transform: selectedIndex === -1 ? 'scale(1.15)' : undefined,
          }}
          aria-label="Eraser"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round">
            <line x1="2" y1="2" x2="12" y2="12" />
            <line x1="12" y1="2" x2="2" y2="12" />
          </svg>
        </button>

        {PAINT_COLORS.map((c, i) => (
          <button
            key={c.label}
            onClick={() => handleSelect(i, c.hsl)}
            className="w-9 h-9 rounded-full border-2 transition-transform duration-150 active:scale-90 shrink-0"
            style={{
              backgroundColor: c.hex,
              borderColor: selectedIndex === i ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)',
              transform: selectedIndex === i ? 'scale(1.15)' : undefined,
              boxShadow: selectedIndex === i ? `0 0 12px ${c.hex}66` : undefined,
            }}
            aria-label={`Paint ${c.label}`}
          />
        ))}
      </div>
    </div>
  );
}
