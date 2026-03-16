import { useEffect, useRef, useCallback } from 'react';
import { useSessionStore } from '../store/sessionStore';
import { useAudioStore } from '../store/audioStore';
import { useLogStore } from '../store/logStore';
import { audioEngine } from '../audio/AudioEngine';
import { THERAPY_MODES, SLEEP_PHASES } from '../constants/frequencies';
import { SAFETY } from '../constants/safety';
import type { SessionLogEntry, FeedbackRating } from '../types/session';
import { SpectralFlicker } from '../visual/SpectralFlicker';

export function useSession() {
  const session = useSessionStore();
  const audio = useAudioStore();
  const log = useLogStore();

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const sessionIdRef = useRef<string>('');
  const flickerRef = useRef<SpectralFlicker | null>(null);
  const endSessionRef = useRef<() => void>(() => {});

  const startSession = useCallback(async () => {
    session.setPhase('starting');

    // Initialize audio (must be inside user gesture handler)
    await audioEngine.initialize();
    audio.setAudioReady(true);

    // Get mode-specific config
    const modeConfig = THERAPY_MODES[session.therapyMode];

    // Configure spectral flicker (mode-dependent)
    if (flickerRef.current) {
      flickerRef.current.start(modeConfig.flickerConfig);
    }

    // Start ambient pad with mode-specific frequencies
    audioEngine.startAmbientPad(audio.toneVolume, modeConfig.padConfig);
    audioEngine.setMasterVolume(audio.masterVolume);

    // Start ambient wind chimes
    audioEngine.startWindChimes(audio.chimeVolume);

    // Create session log entry
    sessionIdRef.current = crypto.randomUUID();
    startTimeRef.current = Date.now();

    session.setPhase('active');
    session.setElapsed(0);

    // Start timer
    const durationMs = session.durationMinutes * 60 * 1000;
    const tickStart = performance.now();
    let fadeStarted = false;
    const isSleep = session.therapyMode === 'sleep';
    let currentSleepPhase = 0;

    const tick = () => {
      const elapsed = performance.now() - tickStart;
      session.setElapsed(elapsed);

      if (elapsed >= durationMs) {
        endSessionRef.current();
        return;
      }

      // Sleep mode: crossfade audio at phase boundaries
      if (isSleep) {
        const progress = elapsed / durationMs;
        const newPhaseIdx = SLEEP_PHASES.findIndex(
          (p) => progress >= p.startPercent && progress < p.endPercent
        );
        const phaseIdx = newPhaseIdx >= 0 ? newPhaseIdx : SLEEP_PHASES.length - 1;

        if (phaseIdx !== currentSleepPhase) {
          currentSleepPhase = phaseIdx;
          audioEngine.crossfadePad(audio.toneVolume, SLEEP_PHASES[phaseIdx].padConfig, 6000);

          // Disable chimes in phase 3
          if (phaseIdx >= 2) {
            audioEngine.stopWindChimes();
          }
        }

        // Final 30 seconds: gentle volume fade-down
        const remaining = durationMs - elapsed;
        if (!fadeStarted && remaining <= 30000) {
          fadeStarted = true;
          audioEngine.stopAmbientPad(30000);
          audioEngine.stopWindChimes();
        }
      }

      // Non-sleep: fade out in the last 5 seconds
      if (!isSleep) {
        const remaining = durationMs - elapsed;
        if (!fadeStarted && remaining <= SAFETY.FADE_OUT_MS) {
          fadeStarted = true;
          audioEngine.stopAmbientPad(SAFETY.FADE_OUT_MS);
          audioEngine.stopWindChimes();
        }
      }

      timerRef.current = requestAnimationFrame(tick);
    };

    timerRef.current = requestAnimationFrame(tick);
  }, [session.durationMinutes, session.therapyMode, audio.toneVolume, audio.masterVolume, audio.chimeVolume]);

  const endSession = useCallback(() => {
    session.setPhase('ending');

    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }

    flickerRef.current?.stop();
    audioEngine.stopWindChimes();

    const entry: SessionLogEntry = {
      id: sessionIdRef.current,
      date: new Date().toISOString(),
      therapyMode: session.therapyMode,
      userColor: session.userColor!,
      shapeType: session.shapeType!,
      durationMinutes: session.durationMinutes,
      actualDurationMs: Date.now() - startTimeRef.current,
      toneMode: session.toneMode,
      feedback: null,
    };
    log.addSession(entry);

    session.setPhase('feedback');
  }, [session.therapyMode, session.userColor, session.shapeType, session.durationMinutes, session.toneMode]);

  // Keep endSessionRef up to date so the timer tick always calls the latest endSession
  useEffect(() => {
    endSessionRef.current = endSession;
  }, [endSession]);

  const emergencyStop = useCallback(() => {
    audioEngine.emergencyStop();

    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }

    flickerRef.current?.stop();

    const entry: SessionLogEntry = {
      id: sessionIdRef.current || crypto.randomUUID(),
      date: new Date().toISOString(),
      therapyMode: session.therapyMode,
      userColor: session.userColor!,
      shapeType: session.shapeType!,
      durationMinutes: session.durationMinutes,
      actualDurationMs: Date.now() - startTimeRef.current,
      toneMode: session.toneMode,
      feedback: null,
    };
    log.addSession(entry);

    session.setPhase('feedback');
  }, [session.therapyMode, session.userColor, session.shapeType, session.durationMinutes, session.toneMode]);

  const submitFeedback = useCallback((feedback: FeedbackRating) => {
    if (sessionIdRef.current) {
      log.setFeedback(sessionIdRef.current, feedback);
    }
    // Go back to mode pick for next session
    session.setPhase('modePick');
    session.setElapsed(0);
  }, []);

  const skipFeedback = useCallback(() => {
    session.setPhase('modePick');
    session.setElapsed(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
      flickerRef.current?.stop();
    };
  }, []);

  return {
    startSession,
    endSession,
    emergencyStop,
    submitFeedback,
    skipFeedback,
    flickerRef,
  };
}
