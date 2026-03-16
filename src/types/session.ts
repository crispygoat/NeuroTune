export type BrainwaveState = 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma';

export type TherapyMode = '40hz' | '528hz';

export type UserColor = 'red' | 'green' | 'blue' | 'yellow';

export type ShapeType = 'mandala' | 'triangle' | 'hexagon' | 'circle';

export type SessionPhase = 'idle' | 'modePick' | 'colorPick' | 'shapePick' | 'starting' | 'active' | 'ending' | 'feedback';

export type FeedbackRating = 'calm' | 'neutral' | 'distressed';

export type NatureSound = 'rain' | 'ocean' | 'forest';

export type SessionDuration = 5 | 10 | 20;

export interface SessionLogEntry {
  id: string;
  date: string;
  therapyMode: TherapyMode;
  userColor: UserColor;
  shapeType: ShapeType;
  durationMinutes: SessionDuration;
  actualDurationMs: number;
  toneMode: 'binaural' | 'isochronic';
  feedback: FeedbackRating | null;
}
