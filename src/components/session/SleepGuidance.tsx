import { useState, useEffect, useRef } from 'react';
import { useSessionStore } from '../../store/sessionStore';
import { SLEEP_GUIDANCE } from '../../constants/frequencies';

/**
 * SleepGuidance — Translucent text overlay for sleep mode.
 * Shows gentle guidance cues at specific points in the session.
 * Delays showing text if the user is actively touching the screen.
 */
export function SleepGuidance() {
  const elapsedMs = useSessionStore((s) => s.elapsedMs);
  const durationMinutes = useSessionStore((s) => s.durationMinutes);
  const therapyMode = useSessionStore((s) => s.therapyMode);
  const phase = useSessionStore((s) => s.phase);

  const [visibleText, setVisibleText] = useState<string | null>(null);
  const [opacity, setOpacity] = useState(0);
  const shownCuesRef = useRef<Set<number>>(new Set());
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (therapyMode !== 'sleep' || phase !== 'active') return;

    const durationMs = durationMinutes * 60 * 1000;
    if (durationMs <= 0) return;

    const progress = elapsedMs / durationMs;

    // Find the next cue that should trigger
    for (const cue of SLEEP_GUIDANCE) {
      if (shownCuesRef.current.has(cue.percent)) continue;
      if (progress >= cue.percent) {
        shownCuesRef.current.add(cue.percent);

        // Clear any existing fade timer
        if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);

        // Fade in
        setVisibleText(cue.text);
        requestAnimationFrame(() => setOpacity(1));

        // Hold, then fade out
        fadeTimerRef.current = setTimeout(() => {
          setOpacity(0);
          // Remove text after fade-out transition
          fadeTimerRef.current = setTimeout(() => {
            setVisibleText(null);
          }, 3000);
        }, cue.durationMs - 3000);

        break; // Only show one cue at a time
      }
    }
  }, [elapsedMs, durationMinutes, therapyMode, phase]);

  // Reset shown cues when session restarts
  useEffect(() => {
    if (phase !== 'active') {
      shownCuesRef.current.clear();
      setVisibleText(null);
      setOpacity(0);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    }
  }, [phase]);

  if (!visibleText) return null;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 px-8"
      style={{
        opacity,
        transition: 'opacity 2.5s ease-in-out',
      }}
    >
      <p
        className="text-center text-2xl md:text-3xl font-light tracking-wide leading-relaxed"
        style={{
          color: 'rgba(255, 255, 255, 0.6)',
          textShadow: '0 2px 20px rgba(0, 0, 0, 0.3)',
          maxWidth: '600px',
        }}
      >
        {visibleText}
      </p>
    </div>
  );
}
