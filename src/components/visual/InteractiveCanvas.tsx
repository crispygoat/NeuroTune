import { useEffect, useRef, useCallback } from 'react';
import { useSessionStore } from '../../store/sessionStore';
import { InkWaterRenderer } from '../../visual/InkWaterRenderer';
import { TouchField } from '../../visual/TouchField';
import { generatePalette } from '../../visual/ColorPalette';
import { SESSION_BREATH_CYCLE } from '../../constants/frequencies';
import { audioEngine } from '../../audio/AudioEngine';

export function InteractiveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<InkWaterRenderer | null>(null);
  const touchFieldRef = useRef<TouchField>(new TouchField());
  const tickIdRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);

  const userColor = useSessionStore((s) => s.userColor);
  const shapeType = useSessionStore((s) => s.shapeType);
  const phase = useSessionStore((s) => s.phase);

  // Track previous color/shape to detect mid-session changes
  const prevColorRef = useRef<string | null>(null);
  const prevShapeRef = useRef<string | null>(null);

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
    renderer.configure(palette, shapeType, SESSION_BREATH_CYCLE);
    renderer.setTrailRef(touchFieldRef.current.getTrail());
    renderer.start();
    rendererRef.current = renderer;
    prevColorRef.current = userColor;
    prevShapeRef.current = shapeType;

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

  // Pointer events (work for both touch and mouse)
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const x = (e.clientX - rect.left) * dpr;
    const y = (e.clientY - rect.top) * dpr;

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
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      aria-hidden="true"
    />
  );
}
