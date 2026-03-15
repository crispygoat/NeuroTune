import { useEffect, useRef } from 'react';

export function useWakeLock(enabled: boolean) {
  const wakeLock = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!enabled) {
      wakeLock.current?.release();
      wakeLock.current = null;
      return;
    }

    async function request() {
      if ('wakeLock' in navigator) {
        try {
          wakeLock.current = await navigator.wakeLock.request('screen');
        } catch {
          // Wake lock request failed (e.g., low battery)
        }
      }
    }

    request();

    // Re-acquire on visibility change (Safari releases on tab switch)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && enabled) {
        request();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      wakeLock.current?.release();
      wakeLock.current = null;
    };
  }, [enabled]);
}
