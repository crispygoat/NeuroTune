import { create } from 'zustand';
import type { UserColor, ShapeType, SessionPhase, SessionDuration } from '../types/session';
import type { ToneMode } from '../types/audio';

interface SessionState {
  userColor: UserColor | null;
  shapeType: ShapeType | null;
  durationMinutes: SessionDuration;
  phase: SessionPhase;
  elapsedMs: number;
  toneMode: ToneMode;
  headphoneOverride: boolean | null;

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
  userColor: null as UserColor | null,
  shapeType: null as ShapeType | null,
  durationMinutes: 10 as SessionDuration,
  phase: 'colorPick' as SessionPhase,
  elapsedMs: 0,
  toneMode: 'isochronic' as ToneMode,
  headphoneOverride: null as boolean | null,
};

export const useSessionStore = create<SessionState>((set) => ({
  ...initialState,

  setUserColor: (userColor) => set({ userColor }),
  setShapeType: (shapeType) => set({ shapeType }),
  setDuration: (durationMinutes) => set({ durationMinutes }),
  setPhase: (phase) => set({ phase }),
  setElapsed: (elapsedMs) => set({ elapsedMs }),
  setToneMode: (toneMode) => set({ toneMode }),
  setHeadphoneOverride: (headphoneOverride) => set({ headphoneOverride }),
  reset: () => set(initialState),
}));
