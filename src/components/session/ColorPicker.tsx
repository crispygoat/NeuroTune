import type { UserColor, TherapyMode } from '../../types/session';

interface ColorPickerProps {
  onSelect: (color: UserColor) => void;
  therapyMode?: TherapyMode;
}

const BASE_COLORS: { color: UserColor; label: string; hex: string }[] = [
  { color: 'red',    label: 'Red',    hex: '#E63946' },
  { color: 'green',  label: 'Green',  hex: '#2D936C' },
  { color: 'blue',   label: 'Blue',   hex: '#457B9D' },
  { color: 'yellow', label: 'Yellow', hex: '#E9C46A' },
];

const EXTENDED_COLORS: { color: UserColor; label: string; hex: string }[] = [
  ...BASE_COLORS,
  { color: 'purple', label: 'Purple', hex: '#7B2D8B' },
  { color: 'orange', label: 'Orange', hex: '#E76F51' },
  { color: 'teal',   label: 'Teal',   hex: '#2A9D8F' },
  { color: 'pink',   label: 'Pink',   hex: '#E07B9B' },
];

export function ColorPicker({ onSelect, therapyMode }: ColorPickerProps) {
  const isSleep = therapyMode === 'sleep';
  const colors = isSleep ? EXTENDED_COLORS : BASE_COLORS;

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 gap-6">
      <h1 className="text-2xl font-light text-soft-white/80 tracking-wide">
        Pick a color
      </h1>

      <div className={`grid ${isSleep ? 'grid-cols-4 gap-3' : 'grid-cols-2 gap-4'} w-full max-w-sm`}>
        {colors.map(({ color, label, hex }) => (
          <button
            key={color}
            onClick={() => onSelect(color)}
            className="aspect-square rounded-3xl flex items-center justify-center
                       transition-transform duration-200 active:scale-95
                       shadow-lg"
            style={{ backgroundColor: hex }}
            aria-label={`Select ${label}`}
          >
            <span className={`text-white/90 font-bold drop-shadow-md ${isSleep ? 'text-sm' : 'text-lg'}`}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
