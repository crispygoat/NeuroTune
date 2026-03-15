import { useLogStore } from '../../store/logStore';

export function SafetyDisclaimer() {
  const setDisclaimerAccepted = useLogStore((s) => s.setDisclaimerAccepted);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/95 p-6">
      <div className="max-w-md w-full bg-navy-light rounded-2xl p-10 space-y-6 border border-lavender/15">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-light text-lavender">
            Welcome
          </h2>
          <p className="text-soft-white/50 text-sm">
            Before we start, a few things to know
          </p>
        </div>

        <div className="space-y-3 text-soft-white/70 text-sm leading-relaxed">
          <div className="flex gap-3 bg-navy/40 rounded-xl p-5">
            <span className="text-xl shrink-0">{'\u2728'}</span>
            <p>
              This app uses <strong className="text-soft-white/90">gentle light patterns</strong> and <strong className="text-soft-white/90">sound tones</strong>.
              If flickering light has ever bothered you, you can turn visuals off at any time.
            </p>
          </div>

          <div className="flex gap-3 bg-navy/40 rounded-xl p-5">
            <span className="text-xl shrink-0">{'\uD83C\uDFA7'}</span>
            <p>
              Everything starts <strong className="text-soft-white/90">quiet and subtle</strong>.
              You control how much sound and light feels right for you.
              You can stop at any moment.
            </p>
          </div>

          <div className="flex gap-3 bg-navy/40 rounded-xl p-5">
            <span className="text-xl shrink-0">{'\uD83D\uDC9C'}</span>
            <p>
              This is a <strong className="text-soft-white/90">personal exploration tool</strong>,
              not medicine. Go at your own pace — there is no wrong way to use it.
            </p>
          </div>
        </div>

        <button
          onClick={() => setDisclaimerAccepted(true)}
          className="w-full py-4 rounded-xl bg-lavender/20 text-lavender font-medium text-lg
                     hover:bg-lavender/30 active:bg-lavender/40 transition-colors
                     border border-lavender/30 cursor-pointer"
        >
          I'm ready
        </button>
      </div>
    </div>
  );
}
