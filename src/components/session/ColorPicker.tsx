import type { UserColor } from '../../types/session';

interface ColorPickerProps {
  onSelect: (color: UserColor) => void;
}

const COLORS: { color: UserColor; label: string; hex: string }[] = [
  { color: 'red',    label: 'Red',    hex: '#E63946' },
  { color: 'green',  label: 'Green',  hex: '#2D936C' },
  { color: 'blue',   label: 'Blue',   hex: '#457B9D' },
  { color: 'yellow', label: 'Yellow', hex: '#E9C46A' },
];

export function ColorPicker({ onSelect }: ColorPickerProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 gap-6">
      <h1 className="text-2xl font-light text-soft-white/80 tracking-wide">
        Pick a color
      </h1>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {COLORS.map(({ color, label, hex }) => (
          <button
            key={color}
            onClick={() => onSelect(color)}
            className="aspect-square rounded-3xl flex items-center justify-center
                       transition-transform duration-200 active:scale-95
                       shadow-lg"
            style={{ backgroundColor: hex }}
            aria-label={`Select ${label}`}
          >
            <span className="text-white/80 text-lg font-medium drop-shadow-md">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
