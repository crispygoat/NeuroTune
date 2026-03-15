import { useEffect, useRef } from 'react';
import { SpectralFlicker } from '../../visual/SpectralFlicker';

interface FlickerOverlayProps {
  flickerRef: React.MutableRefObject<SpectralFlicker | null>;
}

export function FlickerOverlay({ flickerRef }: FlickerOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current) return;

    const flicker = new SpectralFlicker();
    flicker.attach(overlayRef.current);
    flickerRef.current = flicker;

    return () => {
      flicker.stop();
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 pointer-events-none z-10"
      aria-hidden="true"
    />
  );
}
