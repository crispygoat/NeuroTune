export type BrainwaveState = 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma';

export type TherapyMode = '40hz' | '528hz' | 'sleep';

export type UserColor = 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'orange' | 'teal' | 'pink';

export type ShapeType = 'mandala' | 'triangle' | 'hexagon' | 'circle';

export type SessionPhase = 'idle' | 'modePick' | 'colorPick' | 'durationPick' | 'shapePick' | 'starting' | 'active' | 'ending' | 'feedback';

export type FeedbackRating = 'calm' | 'neutral' | 'distressed';

export type NatureSound = 'rain' | 'ocean' | 'forest';

export type SessionDuration = 5 | 10 | 20 | 30;

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
