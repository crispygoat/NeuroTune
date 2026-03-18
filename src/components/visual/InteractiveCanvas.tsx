import { useEffect, useRef, useCallback, useState } from 'react';
import { useSessionStore } from '../../store/sessionStore';
import { InkWaterRenderer } from '../../visual/InkWaterRenderer';
import { TouchField } from '../../visual/TouchField';
import { generatePalette, generateSleepPalette } from '../../visual/ColorPalette';
import { THERAPY_MODES, SLEEP_PHASES } from '../../constants/frequencies';
import { audioEngine } from '../../audio/AudioEngine';
import { PaintPalette } from '../session/PaintPalette';
import type { HSLColor } from '../../types/mandala';

const TEN_MINUTES_MS = 10 * 60 * 1000;
const OUTLINE_FADE_MS = 2 * 60 * 1000; // 2 min fade after cutoff

export function InteractiveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<InkWaterRenderer | null>(null);
  const touchFieldRef = useRef<TouchField>(new TouchField());
  const tickIdRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);

  const userColor = useSessionStore((s) => s.userColor);
  const shapeType = useSessionStore((s) => s.shapeType);
  const phase = useSessionStore((s) => s.phase);
  const therapyMode = useSessionStore((s) => s.therapyMode);
  const elapsedMs = useSessionStore((s) => s.elapsedMs);
  const durationMinutes = useSessionStore((s) => s.durationMinutes);

  // Track previous color/shape to detect mid-session changes
  const prevColorRef = useRef<string | null>(null);
  const prevShapeRef = useRef<string | null>(null);
  // Sleep mode: track last applied progress to avoid thrashing
  const sleepProgressRef = useRef(-1);
  const sleepPhaseIdxRef = useRef(0);

  // Paint-by-numbers state (sleep mode only)
  const [paintingActive, setPaintingActive] = useState(false);
  const paintingCutoffRef = useRef(false);

  // Initialize renderer (only on phase transitions)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !userColor || !shapeType) return;
    if (phase !== 'active' && phase !== 'starting') return;

    // If renderer already running, skip full re-init (transitions handled below)
    if (rendererRef.current) return;

    const palette = generatePalette(userColor);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);

    const renderer = new InkWaterRenderer(canvas);
    renderer.configure(palette, shapeType, THERAPY_MODES[therapyMode].breathCycle);
    renderer.setTrailRef(touchFieldRef.current.getTrail());
    renderer.start();
    rendererRef.current = renderer;
    prevColorRef.current = userColor;
    prevShapeRef.current = shapeType;

    // Enable mandala coloring for sleep mode
    if (therapyMode === 'sleep') {
      renderer.enableMandalaColoring(shapeType);
      // Pre-select first paint color (Red)
      renderer.setMandalaColor({ h: 355, s: 80, l: 55 });
      setPaintingActive(true);
      paintingCutoffRef.current = false;
    }

    // Touch field tick loop (decays disturbances)
    lastTickRef.current = performance.now();
    const tickTouchField = () => {
      const now = performance.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      touchFieldRef.current.tick(delta);

      const disturbances = touchFieldRef.current.getDisturbances();
      if (disturbances.length > 0) {
        renderer.applyDisturbances(disturbances);
      }

      tickIdRef.current = requestAnimationFrame(tickTouchField);
    };
    tickIdRef.current = requestAnimationFrame(tickTouchField);

    return () => {
      renderer.stop();
      rendererRef.current = null;
      prevColorRef.current = null;
      prevShapeRef.current = null;
      setPaintingActive(false);
      paintingCutoffRef.current = false;
      if (tickIdRef.current !== null) {
        cancelAnimationFrame(tickIdRef.current);
        tickIdRef.current = null;
      }
    };
  }, [phase]); // Only depends on phase — color/shape transitions handled below

  // Seamless color/shape transition on a running renderer
  useEffect(() => {
    if (!rendererRef.current || !userColor || !shapeType) return;
    if (phase !== 'active') return;

    // Skip if nothing changed
    if (userColor === prevColorRef.current && shapeType === prevShapeRef.current) return;

    const palette = generatePalette(userColor);
    rendererRef.current.transitionTo(palette, shapeType);
    prevColorRef.current = userColor;
    prevShapeRef.current = shapeType;
  }, [userColor, shapeType, phase]);

  // Sleep mode: progressive palette darkening, breath cycle updates, mandala cutoff
  useEffect(() => {
    if (therapyMode !== 'sleep' || phase !== 'active' || !rendererRef.current || !userColor || !shapeType) return;

    const durationMs = durationMinutes * 60 * 1000;
    if (durationMs <= 0) return;

    const progress = Math.min(elapsedMs / durationMs, 1);

    // Only update visuals every ~2% progress to avoid excessive work
    const quantized = Math.floor(progress * 50) / 50;
    if (quantized === sleepProgressRef.current) return;
    sleepProgressRef.current = quantized;

    // Update palette progressively
    const sleepPalette = generateSleepPalette(progress, userColor);
    rendererRef.current.transitionTo(sleepPalette, shapeType);

    // Update breath cycle when crossing phase boundaries
    const currentPhaseIdx = SLEEP_PHASES.findIndex(
      (p) => progress >= p.startPercent && progress < p.endPercent
    );
    const phaseIdx = currentPhaseIdx >= 0 ? currentPhaseIdx : SLEEP_PHASES.length - 1;

    if (phaseIdx !== sleepPhaseIdxRef.current) {
      sleepPhaseIdxRef.current = phaseIdx;
      rendererRef.current.setBreathCycle(SLEEP_PHASES[phaseIdx].breathCycle);
    }

    // Mandala painting: 10-minute cutoff
    if (elapsedMs >= TEN_MINUTES_MS && !paintingCutoffRef.current) {
      paintingCutoffRef.current = true;
      rendererRef.current.disableMandalaColoring();
      setPaintingActive(false);
    }

    // Mandala outline fade: from full at 10 min to 0 at 12 min
    if (elapsedMs > TEN_MINUTES_MS) {
      const fadeProgress = Math.min((elapsedMs - TEN_MINUTES_MS) / OUTLINE_FADE_MS, 1);
      rendererRef.current.setMandalaOutlineOpacity(0.6 * (1 - fadeProgress));
    }

    // Darken mandala fills with sleep progression
    const darkenFactor = Math.max(0.15, 1 - progress * 0.85);
    rendererRef.current.setMandalaDarkenFactor(darkenFactor);
  }, [elapsedMs, therapyMode, phase, userColor, shapeType, durationMinutes]);

  // Paint color selection handler
  const handlePaintColorSelect = useCallback((color: HSLColor | null) => {
    rendererRef.current?.setMandalaColor(color);
  }, []);

  // Pointer events (work for both touch and mouse)
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const x = (e.clientX - rect.left) * dpr;
    const y = (e.clientY - rect.top) * dpr;

    // Try mandala painting first (sleep mode)
    const painted = rendererRef.current?.handleMandalaTap(x, y) ?? false;
    if (painted) {
      audioEngine.playTouchChime();
      return;
    }

    touchFieldRef.current.addTouch(e.pointerId, x, y);

    // Spawn ink at touch point
    rendererRef.current?.spawnAtPoint(x, y);

    // Play a wind chime
    audioEngine.playTouchChime();
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const x = (e.clientX - rect.left) * dpr;
    const y = (e.clientY - rect.top) * dpr;

    touchFieldRef.current.updateTouch(e.pointerId, x, y);
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    touchFieldRef.current.removeTouch(e.pointerId);
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        aria-hidden="true"
      />
      {paintingActive && <PaintPalette onColorSelect={handlePaintColorSelect} />}
    </>
  );
}
