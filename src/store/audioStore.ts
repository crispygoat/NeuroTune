import { create } from 'zustand';
import { SAFETY } from '../constants/safety';

interface AudioState {
  masterVolume: number;
  toneVolume: number;
  chimeVolume: number;
  isAudioReady: boolean;

  setMasterVolume: (v: number) => void;
  setToneVolume: (v: number) => void;
  setChimeVolume: (v: number) => void;
  setAudioReady: (ready: boolean) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  masterVolume: SAFETY.DEFAULT_MASTER_VOLUME,
  toneVolume: SAFETY.DEFAULT_TONE_VOLUME,
  chimeVolume: 0.1,
  isAudioReady: false,

  setMasterVolume: (masterVolume) =>
    set({ masterVolume: Math.min(masterVolume, SAFETY.MAX_MASTER_VOLUME) }),
  setToneVolume: (toneVolume) => set({ toneVolume }),
  setChimeVolume: (chimeVolume) => set({ chimeVolume }),
  setAudioReady: (isAudioReady) => set({ isAudioReady }),
}));
