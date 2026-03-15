import { useState, useCallback } from 'react';
import type { UserColor } from '../../types/session';

interface ColorSwitcherProps {
  currentColor: UserColor;
  onSwitch: (color: UserColor) => void;
}

const COLORS: { color: UserColor; hex: string }[] = [
  { color: 'red',    hex: '#E63946' },
  { color: 'green',  hex: '#2D936C' },
  { color: 'blue',   hex: '#457B9D' },
  { color: 'yellow', hex: '#E9C46A' },
];

export function ColorSwitcher({ currentColor, onSwitch }: ColorSwitcherProps) {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = useCallback(() => {
    setExpanded((v) => !v);
  }, []);

  const handleSelect = useCallback((color: UserColor) => {
    setExpanded(false);
    onSwitch(color);
  }, [onSwitch]);

  return (
    <div className="fixed top-4 left-4 z-40 flex flex-col items-center gap-2">
      {/* Toggle button — shows current color */}
      <button
        onClick={handleToggle}
        className="w-10 h-10 rounded-full border-2 border-white/40 shadow-lg
                   transition-all duration-300 active:scale-90 cursor-pointer"
        style={{
          backgroundColor: COLORS.find((c) => c.color === currentColor)?.hex,
          transform: expanded ? 'rotate(45deg)' : undefined,
        }}
        aria-label="Switch color"
      />

      {/* Expanded: show all 4 colors */}
      {expanded && (
        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {COLORS.filter((c) => c.color !== currentColor).map(({ color, hex }) => (
            <button
              key={color}
              onClick={() => handleSelect(color)}
              className="w-9 h-9 rounded-full border-2 border-white/30 shadow-md
                         transition-all duration-200 active:scale-90
                         hover:scale-110 hover:border-white/60 cursor-pointer"
              style={{ backgroundColor: hex }}
              aria-label={`Switch to ${color}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
