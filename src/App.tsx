import { useCallback } from 'react';
import { useSessionStore } from './store/sessionStore';
import { useLogStore } from './store/logStore';
import { useSession } from './hooks/useSession';
import { useWakeLock } from './hooks/useWakeLock';
import { audioEngine } from './audio/AudioEngine';
import { generatePalette } from './visual/ColorPalette';
import { AppShell } from './components/layout/AppShell';
import { SafetyDisclaimer } from './components/layout/SafetyDisclaimer';
import { ColorPicker } from './components/session/ColorPicker';
import { ShapePicker } from './components/session/ShapePicker';
import { SafeExitButton } from './components/session/SafeExitButton';
import { SessionTimer } from './components/session/SessionTimer';
import { SessionControls } from './components/session/SessionControls';
import { InteractiveCanvas } from './components/visual/InteractiveCanvas';
import { FlickerOverlay } from './components/visual/FlickerOverlay';
import { ColorSwitcher } from './components/session/ColorSwitcher';
import { FloatingColorOrbs } from './components/session/FloatingColorOrbs';
import { PostSessionFeedback } from './components/feedback/PostSessionFeedback';
import type { UserColor, ShapeType } from './types/session';

function App() {
  const phase = useSessionStore((s) => s.phase);
  const userColor = useSessionStore((s) => s.userColor);
  const setUserColor = useSessionStore((s) => s.setUserColor);
  const setShapeType = useSessionStore((s) => s.setShapeType);
  const setPhase = useSessionStore((s) => s.setPhase);
  const disclaimerAccepted = useLogStore((s) => s.disclaimerAccepted);

  const {
    startSession,
    emergencyStop,
    submitFeedback,
    skipFeedback,
    flickerRef,
  } = useSession();

  useWakeLock(phase === 'active' || phase === 'starting');

  const palette = userColor ? generatePalette(userColor) : null;

  // Color pick initializes AudioContext (iPad Safari gesture requirement)
  const handleColorSelected = useCallback(async (color: UserColor) => {
    setUserColor(color);
    setPhase('shapePick');
    // Initialize audio early so it's ready when session starts
    await audioEngine.initialize();
  }, [setUserColor, setPhase]);

  // Shape pick starts the session immediately
  const handleShapeSelected = useCallback(async (shape: ShapeType) => {
    setShapeType(shape);
    await startSession();
  }, [setShapeType, startSession]);

  // ColorSwitcher (top-left menu) — stops session, lets user pick a new shape
  const handleColorSwitch = useCallback((color: UserColor) => {
    emergencyStop();
    setUserColor(color);
    setPhase('shapePick');
  }, [emergencyStop, setUserColor, setPhase]);

  // Floating orbs — seamless in-session transition, random shape, no interruption
  const SHAPES: ShapeType[] = ['mandala', 'triangle', 'hexagon', 'circle'];
  const handleOrbSwitch = useCallback((color: UserColor) => {
    const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    setUserColor(color);
    setShapeType(randomShape);
    // Play a chime to acknowledge the switch
    audioEngine.playTouchChime();
  }, [setUserColor, setShapeType]);

  // --- Safety disclaimer gate ---
  if (!disclaimerAccepted) {
    return (
      <AppShell>
        <SafetyDisclaimer />
      </AppShell>
    );
  }

  // --- Post-session feedback ---
  if (phase === 'feedback') {
    return (
      <AppShell backgroundColor={palette?.background}>
        <PostSessionFeedback onSubmit={submitFeedback} onSkip={skipFeedback} />
      </AppShell>
    );
  }

  // --- Active session ---
  if (phase === 'active' || phase === 'starting' || phase === 'ending') {
    return (
      <AppShell backgroundColor={palette?.background}>
        <div className="absolute inset-0">
          <InteractiveCanvas />
          <FlickerOverlay flickerRef={flickerRef} />
        </div>
        <SessionTimer />
        {userColor && <FloatingColorOrbs currentColor={userColor} onSwitch={handleOrbSwitch} />}
        {userColor && <ColorSwitcher currentColor={userColor} onSwitch={handleColorSwitch} />}
        <SafeExitButton onExit={emergencyStop} />
        <SessionControls />
      </AppShell>
    );
  }

  // --- Shape picker (color already selected) ---
  if (phase === 'shapePick' && userColor) {
    return (
      <AppShell backgroundColor={palette?.background}>
        <ShapePicker color={userColor} onSelect={handleShapeSelected} />
      </AppShell>
    );
  }

  // --- Color picker (default screen) ---
  return (
    <AppShell>
      <ColorPicker onSelect={handleColorSelected} />
    </AppShell>
  );
}

export default App;
