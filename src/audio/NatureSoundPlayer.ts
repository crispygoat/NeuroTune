import { fadeIn, fadeOut } from './FadeController';
import type { NatureSound } from '../types/session';
import { SAFETY } from '../constants/safety';

const SOUND_URLS: Record<NatureSound, string> = {
  rain: '/sounds/rain-loop.mp3',
  ocean: '/sounds/ocean-loop.mp3',
  forest: '/sounds/forest-loop.mp3',
};

export class NatureSoundPlayer {
  private audio: HTMLAudioElement | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode;
  private ctx: AudioContext;
  private currentSound: NatureSound | null = null;

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.gainNode = ctx.createGain();
    this.gainNode.gain.value = SAFETY.MIN_AUDIBLE;
    this.gainNode.connect(destination);
  }

  async play(sound: NatureSound, volume: number): Promise<void> {
    if (this.currentSound === sound && this.audio && !this.audio.paused) {
      return;
    }

    // Crossfade if switching sounds
    if (this.currentSound && this.currentSound !== sound) {
      await this.stop(SAFETY.CROSSFADE_MS);
    }

    this.audio = new Audio(SOUND_URLS[sound]);
    this.audio.loop = true;
    this.audio.crossOrigin = 'anonymous';

    this.source = this.ctx.createMediaElementSource(this.audio);
    this.source.connect(this.gainNode);

    this.currentSound = sound;

    try {
      await this.audio.play();
      fadeIn(this.gainNode, volume, SAFETY.FADE_IN_MS);
    } catch (err) {
      console.warn('Nature sound playback failed:', err);
    }
  }

  async stop(fadeMs: number = SAFETY.FADE_OUT_MS): Promise<void> {
    if (!this.audio) return;

    fadeOut(this.gainNode, fadeMs);

    await new Promise((resolve) => setTimeout(resolve, fadeMs));

    this.audio.pause();
    this.audio.src = '';
    this.source?.disconnect();
    this.source = null;
    this.audio = null;
    this.currentSound = null;
  }

  setVolume(volume: number): void {
    const now = this.ctx.currentTime;
    const target = Math.max(volume, SAFETY.MIN_AUDIBLE);
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(
      Math.max(this.gainNode.gain.value, SAFETY.MIN_AUDIBLE),
      now
    );
    this.gainNode.gain.exponentialRampToValueAtTime(target, now + 0.1);
  }
}
