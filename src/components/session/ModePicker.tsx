import type { TherapyMode } from '../../types/session';
import { THERAPY_MODES } from '../../constants/frequencies';

interface ModePickerProps {
  onSelect: (mode: TherapyMode) => void;
}

const MODES: { mode: TherapyMode; accent: string }[] = [
  { mode: '40hz',  accent: '#f0abfc' }, // soft purple (gamma)
  { mode: '528hz', accent: '#5eead4' }, // soft teal (calm)
];

export function ModePicker({ onSelect }: ModePickerProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-light text-soft-white/80 tracking-wide">
          NeuroTune
        </h1>
        <p className="text-sm text-white/30">
          Choose your session type
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        {MODES.map(({ mode, accent }) => {
          const config = THERAPY_MODES[mode];
          return (
            <button
              key={mode}
              onClick={() => onSelect(mode)}
              className="relative rounded-3xl px-6 py-7 text-left
                         bg-white/5 backdrop-blur-sm
                         border border-white/8
                         transition-all duration-200
                         active:scale-[0.97] hover:bg-white/8"
              aria-label={`${config.label} — ${config.subtitle}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: accent, boxShadow: `0 0 12px ${accent}40` }}
                />
                <div className="space-y-1">
                  <div className="text-xl font-semibold text-white/90 tracking-wide">
                    {config.label}
                  </div>
                  <div className="text-sm text-white/40 leading-snug">
                    {config.subtitle}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
