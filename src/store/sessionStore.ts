import { create } from 'zustand';
import type { UserColor, ShapeType, SessionPhase, SessionDuration, TherapyMode } from '../types/session';
import type { ToneMode } from '../types/audio';

interface SessionState {
  therapyMode: TherapyMode;
  userColor: UserColor | null;
  shapeType: ShapeType | null;
  durationMinutes: SessionDuration;
  phase: SessionPhase;
  elapsedMs: number;
  toneMode: ToneMode;
  headphoneOverride: boolean | null;

  setTherapyMode: (mode: TherapyMode) => void;
  setUserColor: (color: UserColor) => void;
  setShapeType: (shape: ShapeType) => void;
  setDuration: (minutes: SessionDuration) => void;
  setPhase: (phase: SessionPhase) => void;
  setElapsed: (ms: number) => void;
  setToneMode: (mode: ToneMode) => void;
  setHeadphoneOverride: (override: boolean | null) => void;
  reset: () => void;
}

const initialState = {
  therapyMode: '40hz' as TherapyMode,
  userColor: null as UserColor | null,
  shapeType: null as ShapeType | null,
  durationMinutes: 10 as SessionDuration,
  phase: 'modePick' as SessionPhase,
  elapsedMs: 0,
  toneMode: 'isochronic' as ToneMode,
  headphoneOverride: null as boolean | null,
};

export const useSessionStore = create<SessionState>((set) => ({
  ...initialState,

  setTherapyMode: (therapyMode) => set({ therapyMode }),
  setUserColor: (userColor) => set({ userColor }),
  setShapeType: (shapeType) => set({ shapeType }),
  setDuration: (durationMinutes) => set({ durationMinutes }),
  setPhase: (phase) => set({ phase }),
  setElapsed: (elapsedMs) => set({ elapsedMs }),
  setToneMode: (toneMode) => set({ toneMode }),
  setHeadphoneOverride: (headphoneOverride) => set({ headphoneOverride }),
  reset: () => set(initialState),
}));
