export type ToneMode = 'binaural' | 'isochronic';

export interface FrequencyBand {
  name: string;
  feeling: string;       // one word the user sees: "Sleep", "Dream", etc.
  emoji: string;         // visual icon for the card
  beatHz: number;
  carrierHz: number;
  description: string;   // short feeling-based sentence
  label: string;         // longer explanation (shown on hover/detail)
}
