import { useSessionStore } from '../../store/sessionStore';

export function SessionTimer() {
  const elapsed = useSessionStore((s) => s.elapsedMs);
  const duration = useSessionStore((s) => s.durationMinutes);

  const totalMs = duration * 60 * 1000;
  const remainingMs = Math.max(0, totalMs - elapsed);
  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  const progress = Math.min(elapsed / totalMs, 1);

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2">
      <span className="text-soft-white/60 text-2xl font-light tabular-nums tracking-wider">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>

      {/* Progress bar */}
      <div className="w-32 h-0.5 bg-soft-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-lavender/40 transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
