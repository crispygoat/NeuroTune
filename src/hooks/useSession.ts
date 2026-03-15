import { useEffect, useRef, useCallback } from 'react';
import { useSessionStore } from '../store/sessionStore';
import { useAudioStore } from '../store/audioStore';
import { useLogStore } from '../store/logStore';
import { audioEngine } from '../audio/AudioEngine';
import { SESSION_FLICKER_CONFIG } from '../constants/frequencies';
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

    // Configure spectral flicker (always 40Hz gamma)
    if (flickerRef.current) {
      flickerRef.current.start(SESSION_FLICKER_CONFIG);
    }

    // Start ambient pad with embedded 40Hz entrainment
    audioEngine.startAmbientPad(audio.toneVolume);
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

    const tick = () => {
      const elapsed = performance.now() - tickStart;
      session.setElapsed(elapsed);

      if (elapsed >= durationMs) {
        endSessionRef.current();
        return;
      }

      // Fade out in the last 5 seconds
      const remaining = durationMs - elapsed;
      if (!fadeStarted && remaining <= SAFETY.FADE_OUT_MS) {
        fadeStarted = true;
        audioEngine.stopAmbientPad(SAFETY.FADE_OUT_MS);
        audioEngine.stopWindChimes();
      }

      timerRef.current = requestAnimationFrame(tick);
    };

    timerRef.current = requestAnimationFrame(tick);
  }, [session.durationMinutes, audio.toneVolume, audio.masterVolume, audio.chimeVolume]);

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
      userColor: session.userColor!,
      shapeType: session.shapeType!,
      durationMinutes: session.durationMinutes,
      actualDurationMs: Date.now() - startTimeRef.current,
      toneMode: session.toneMode,
      feedback: null,
    };
    log.addSession(entry);

    session.setPhase('feedback');
  }, [session.userColor, session.shapeType, session.durationMinutes, session.toneMode]);

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
      userColor: session.userColor!,
      shapeType: session.shapeType!,
      durationMinutes: session.durationMinutes,
      actualDurationMs: Date.now() - startTimeRef.current,
      toneMode: session.toneMode,
      feedback: null,
    };
    log.addSession(entry);

    session.setPhase('feedback');
  }, [session.userColor, session.shapeType, session.durationMinutes, session.toneMode]);

  const submitFeedback = useCallback((feedback: FeedbackRating) => {
    if (sessionIdRef.current) {
      log.setFeedback(sessionIdRef.current, feedback);
    }
    // Go back to color pick for next session
    session.setPhase('colorPick');
    session.setElapsed(0);
  }, []);

  const skipFeedback = useCallback(() => {
    session.setPhase('colorPick');
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
