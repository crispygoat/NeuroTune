import type { FeedbackRating } from '../../types/session';

interface PostSessionFeedbackProps {
  onSubmit: (feedback: FeedbackRating) => void;
  onSkip: () => void;
}

const FEEDBACK_OPTIONS: { rating: FeedbackRating; emoji: string; label: string }[] = [
  { rating: 'calm', emoji: '\uD83D\uDE0C', label: 'Good' },
  { rating: 'neutral', emoji: '\uD83D\uDE10', label: 'Okay' },
  { rating: 'distressed', emoji: '\uD83D\uDE1F', label: 'Too much' },
];

export function PostSessionFeedback({ onSubmit, onSkip }: PostSessionFeedbackProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-10 px-6">
      <div className="text-center space-y-2">
        <p className="text-soft-white/50 text-sm">
          Session complete
        </p>
        <h2 className="text-2xl font-light text-soft-white/80">
          How was that?
        </h2>
      </div>

      <div className="flex gap-5">
        {FEEDBACK_OPTIONS.map(({ rating, emoji, label }) => (
          <button
            key={rating}
            onClick={() => onSubmit(rating)}
            className="flex flex-col items-center gap-3 w-24 h-24 justify-center
                       rounded-2xl bg-navy-light/50 border-2 border-transparent
                       hover:border-lavender/20 hover:bg-navy-light/70
                       active:scale-95 transition-all cursor-pointer"
            aria-label={label}
          >
            <span className="text-5xl">{emoji}</span>
            <span className="text-xs text-soft-white/40">{label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onSkip}
        className="text-sm text-soft-white/25 hover:text-soft-white/40 transition-colors cursor-pointer"
      >
        Skip
      </button>
    </div>
  );
}
