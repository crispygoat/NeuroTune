interface SafeExitButtonProps {
  onExit: () => void;
}

export function SafeExitButton({ onExit }: SafeExitButtonProps) {
  return (
    <button
      onClick={onExit}
      className="fixed top-8 right-8 z-50 w-14 h-14 rounded-full
                 bg-danger/20 border border-danger/40 text-danger
                 flex items-center justify-center
                 hover:bg-danger/30 active:bg-danger/40 transition-all
                 cursor-pointer backdrop-blur-sm"
      aria-label="Stop session immediately"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="18" y1="6" x2="6" y2="18" />
      </svg>
    </button>
  );
}
