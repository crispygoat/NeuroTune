import type { SessionDuration } from '../../types/session';

interface SleepDurationPickerProps {
  onSelect: (minutes: SessionDuration) => void;
}

const DURATIONS: { minutes: SessionDuration; label: string; desc: string }[] = [
  { minutes: 20, label: '20 min', desc: 'A shorter wind-down session' },
  { minutes: 30, label: '30 min', desc: 'Full progressive sleep journey' },
];

export function SleepDurationPicker({ onSelect }: SleepDurationPickerProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-light text-soft-white/80 tracking-wide">
          How long?
        </h1>
        <p className="text-sm text-white/30">
          Choose your sleep session length
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        {DURATIONS.map(({ minutes, label, desc }) => (
          <button
            key={minutes}
            onClick={() => onSelect(minutes)}
            className="relative rounded-3xl px-6 py-7 text-left
                       bg-white/5 backdrop-blur-sm
                       border border-white/8
                       transition-all duration-200
                       active:scale-[0.97] hover:bg-white/8"
            aria-label={`${label} — ${desc}`}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: '#6366f1', boxShadow: '0 0 12px rgba(99, 102, 241, 0.25)' }}
              />
              <div className="space-y-1">
                <div className="text-xl font-semibold text-white/90 tracking-wide">
                  {label}
                </div>
                <div className="text-sm text-white/40 leading-snug">
                  {desc}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
