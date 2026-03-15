import { useState, useEffect, useRef, useCallback } from 'react';
import type { UserColor } from '../../types/session';

interface FloatingColorOrbsProps {
  currentColor: UserColor;
  onSwitch: (color: UserColor) => void;
}

const COLORS: { color: UserColor; hex: string }[] = [
  { color: 'red',    hex: '#E63946' },
  { color: 'green',  hex: '#2D936C' },
  { color: 'blue',   hex: '#457B9D' },
  { color: 'yellow', hex: '#E9C46A' },
];

interface OrbState {
  color: UserColor;
  hex: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  size: number;
  pulsePhase: number;
}

function initOrbs(currentColor: UserColor): OrbState[] {
  const others = COLORS.filter((c) => c.color !== currentColor);
  return others.map((c, i) => {
    // Start at random positions around the edges
    const angle = (Math.PI * 2 * i) / others.length + Math.random() * 0.5;
    const edgeDist = 0.25 + Math.random() * 0.2;
    return {
      color: c.color,
      hex: c.hex,
      x: 0.5 + Math.cos(angle) * edgeDist,
      y: 0.5 + Math.sin(angle) * edgeDist,
      vx: (Math.random() - 0.5) * 0.00015,
      vy: (Math.random() - 0.5) * 0.00015,
      phase: Math.random() * Math.PI * 2,
      size: 38 + Math.random() * 10,
      pulsePhase: Math.random() * Math.PI * 2,
    };
  });
}

export function FloatingColorOrbs({ currentColor, onSwitch }: FloatingColorOrbsProps) {
  const [orbs, setOrbs] = useState<OrbState[]>(() => initOrbs(currentColor));
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(performance.now());
  const orbsRef = useRef(orbs);
  orbsRef.current = orbs;

  // Reinitialize when currentColor changes
  useEffect(() => {
    setOrbs(initOrbs(currentColor));
  }, [currentColor]);

  // Animate orbs with gentle drift
  useEffect(() => {
    const tick = () => {
      const now = performance.now();
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;

      setOrbs((prev) =>
        prev.map((orb) => {
          // Gentle sine-wave drift (organic, floaty movement)
          const driftX = Math.sin(now * 0.0003 + orb.phase) * 0.00008;
          const driftY = Math.cos(now * 0.00025 + orb.phase * 1.7) * 0.00008;

          let nx = orb.x + (orb.vx + driftX) * dt;
          let ny = orb.y + (orb.vy + driftY) * dt;
          let nvx = orb.vx;
          let nvy = orb.vy;

          // Soft bounce off edges (keep orbs in the middle ~70% of screen)
          const margin = 0.08;
          const maxX = 0.92;
          const maxY = 0.85; // avoid bottom controls
          const minY = 0.1;  // avoid top timer

          if (nx < margin) { nx = margin; nvx = Math.abs(nvx) * 0.5 + 0.00005; }
          if (nx > maxX) { nx = maxX; nvx = -Math.abs(nvx) * 0.5 - 0.00005; }
          if (ny < minY) { ny = minY; nvy = Math.abs(nvy) * 0.5 + 0.00005; }
          if (ny > maxY) { ny = maxY; nvy = -Math.abs(nvy) * 0.5 - 0.00005; }

          // Slight random velocity nudge for unpredictability
          nvx += (Math.random() - 0.5) * 0.000003;
          nvy += (Math.random() - 0.5) * 0.000003;

          // Damping
          nvx *= 0.9995;
          nvy *= 0.9995;

          return { ...orb, x: nx, y: ny, vx: nvx, vy: nvy };
        })
      );

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleClick = useCallback(
    (color: UserColor) => {
      onSwitch(color);
    },
    [onSwitch]
  );

  return (
    <>
      {orbs.map((orb) => {
        const pulse = Math.sin(performance.now() * 0.001 + orb.pulsePhase) * 0.15 + 0.85;
        return (
          <button
            key={orb.color}
            onClick={() => handleClick(orb.color)}
            className="fixed z-30 rounded-full cursor-pointer
                       transition-transform duration-300 active:scale-125
                       hover:scale-110"
            style={{
              left: `${orb.x * 100}%`,
              top: `${orb.y * 100}%`,
              width: orb.size,
              height: orb.size,
              transform: `translate(-50%, -50%) scale(${pulse})`,
              backgroundColor: orb.hex,
              opacity: 0.35,
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: `0 0 20px ${orb.hex}44, 0 0 40px ${orb.hex}22`,
            }}
            aria-label={`Switch to ${orb.color}`}
          />
        );
      })}
    </>
  );
}
