export type BrainwaveState = 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma';

export type UserColor = 'red' | 'green' | 'blue' | 'yellow';

export type ShapeType = 'mandala' | 'triangle' | 'hexagon' | 'circle';

export type SessionPhase = 'idle' | 'colorPick' | 'shapePick' | 'starting' | 'active' | 'ending' | 'feedback';

export type FeedbackRating = 'calm' | 'neutral' | 'distressed';

export type NatureSound = 'rain' | 'ocean' | 'forest';

export type SessionDuration = 5 | 10 | 20;

export interface SessionLogEntry {
  id: string;
  date: string;
  userColor: UserColor;
  shapeType: ShapeType;
  durationMinutes: SessionDuration;
  actualDurationMs: number;
  toneMode: 'binaural' | 'isochronic';
  feedback: FeedbackRating | null;
}
