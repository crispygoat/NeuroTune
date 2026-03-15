import { useSessionStore } from '../../store/sessionStore';

export function HeadphoneToggle() {
  const toneMode = useSessionStore((s) => s.toneMode);
  const setToneMode = useSessionStore((s) => s.setToneMode);

  const isBinaural = toneMode === 'binaural';

  return (
    <button
      onClick={() => setToneMode(isBinaural ? 'isochronic' : 'binaural')}
      className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2
                  transition-all duration-200 cursor-pointer
        ${isBinaural
          ? 'bg-teal/15 border-teal/30'
          : 'bg-navy-light/40 border-transparent hover:bg-navy-light/60'
        }`}
      aria-label={isBinaural ? 'Using headphones' : 'Using speakers'}
    >
      <span className="text-2xl">{isBinaural ? '\uD83C\uDFA7' : '\uD83D\uDD0A'}</span>
      <div className="text-left">
        <p className={`text-sm font-medium ${isBinaural ? 'text-teal' : 'text-muted'}`}>
          {isBinaural ? 'Wearing headphones' : 'Using speakers'}
        </p>
        <p className="text-[10px] text-soft-white/30">
          Tap to switch
        </p>
      </div>
    </button>
  );
}
