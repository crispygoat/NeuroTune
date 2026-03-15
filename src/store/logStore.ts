import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SessionLogEntry, FeedbackRating } from '../types/session';

interface LogState {
  sessions: SessionLogEntry[];
  disclaimerAccepted: boolean;

  addSession: (entry: SessionLogEntry) => void;
  setFeedback: (sessionId: string, feedback: FeedbackRating) => void;
  setDisclaimerAccepted: (accepted: boolean) => void;
  clearHistory: () => void;
}

export const useLogStore = create<LogState>()(
  persist(
    (set) => ({
      sessions: [],
      disclaimerAccepted: false,

      addSession: (entry) =>
        set((state) => ({ sessions: [entry, ...state.sessions] })),

      setFeedback: (sessionId, feedback) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, feedback } : s
          ),
        })),

      setDisclaimerAccepted: (disclaimerAccepted) => set({ disclaimerAccepted }),

      clearHistory: () => set({ sessions: [] }),
    }),
    {
      name: 'neurotune-log',
    }
  )
);
