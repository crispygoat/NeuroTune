import { useSessionStore } from '../../store/sessionStore';
import type { SessionDuration } from '../../types/session';

const DURATIONS: { min: SessionDuration; label: string; desc: string }[] = [
  { min: 5, label: '5 min', desc: 'Quick' },
  { min: 10, label: '10 min', desc: 'Balanced' },
  { min: 20, label: '20 min', desc: 'Deep' },
];

export function TimerSelector() {
  const selected = useSessionStore((s) => s.durationMinutes);
  const setDuration = useSessionStore((s) => s.setDuration);

  return (
    <div>
      <p className="text-soft-white/40 text-xs mb-3 text-center">
        How long?
      </p>
      <div className="flex gap-3 justify-center">
        {DURATIONS.map(({ min, label, desc }) => (
          <button
            key={min}
            onClick={() => setDuration(min)}
            className={`flex flex-col items-center px-5 py-3 rounded-xl
                        transition-all duration-200 cursor-pointer border-2
              ${selected === min
                ? 'bg-lavender/15 text-lavender border-lavender/30'
                : 'bg-navy-light/40 text-muted border-transparent hover:bg-navy-light/60'
              }`}
            aria-pressed={selected === min}
          >
            <span className="text-sm font-medium">{label}</span>
            <span className="text-[10px] opacity-60 mt-0.5">{desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
