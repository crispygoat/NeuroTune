import type { BreathCycle } from './visual';

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

export interface SleepPhaseConfig {
  padConfig: PadConfig;
  breathCycle: BreathCycle;
  startPercent: number;   // 0-1 when this phase begins
  endPercent: number;     // 0-1 when this phase ends
}

export interface PadConfig {
  padFreqs: number[];      // chord frequencies (e.g. [130.81, 164.81, 196.00] for C3/E3/G3)
  subFreq: number;         // sub-bass drone frequency
  binauralCarrier: number; // center frequency for binaural beat
  binauralBeatHz: number;  // beat frequency (left-right difference)
  filterCutoff: number;    // lowpass filter base cutoff
  filterLfoHz: number;     // filter LFO rate
  lfoDepth: number;        // filter LFO sweep range (Hz)
  padGain: number;         // per-voice gain for pad oscillators
  subGain: number;         // sub-bass gain
  binGain: number;         // binaural beat gain
}
