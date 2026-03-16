import { AmbientPadNode } from './AmbientPadNode';
import { NatureSoundPlayer } from './NatureSoundPlayer';
import { WindChimePlayer } from './WindChimePlayer';
import { fadeOut } from './FadeController';
import { SAFETY } from '../constants/safety';
import type { PadConfig } from '../types/audio';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private toneGain: GainNode | null = null;
  private ambientPad: AmbientPadNode | null = null;
  private natureSounds: NatureSoundPlayer | null = null;
  private windChimes: WindChimePlayer | null = null;
  private visibilityHandler: (() => void) | null = null;

  async initialize(): Promise<void> {
    if (this.ctx && this.masterGain) {
      // Already initialized — just resume if needed
      if (this.ctx.state === 'suspended' || (this.ctx.state as string) === 'interrupted') {
        await this.ctx.resume();
      }
      return;
    }

    this.ctx = new AudioContext({ sampleRate: 44100 });

    if (this.ctx.state === 'suspended' || (this.ctx.state as string) === 'interrupted') {
      await this.ctx.resume();
    }

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = SAFETY.DEFAULT_MASTER_VOLUME;
    this.masterGain.connect(this.ctx.destination);

    this.toneGain = this.ctx.createGain();
    this.toneGain.gain.value = 1;
    this.toneGain.connect(this.masterGain);

    this.ambientPad = new AmbientPadNode(this.ctx, this.toneGain);
    this.natureSounds = new NatureSoundPlayer(this.ctx, this.masterGain);
    this.windChimes = new WindChimePlayer(this.ctx, this.masterGain);

    // Handle Safari's "interrupted" state when switching tabs
    this.visibilityHandler = () => {
      if (document.visibilityState === 'visible' && this.ctx?.state !== 'running') {
        this.ctx?.resume();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  startAmbientPad(volume: number, config: PadConfig): void {
    this.ambientPad?.start(volume, config);
  }

  stopAmbientPad(fadeMs?: number): void {
    this.ambientPad?.stop(fadeMs);
  }

  startWindChimes(volume: number): void {
    this.windChimes?.setVolume(volume);
    this.windChimes?.startAmbient();
  }

  stopWindChimes(): void {
    this.windChimes?.stopAmbient();
  }

  playTouchChime(): void {
    this.windChimes?.playChime();
  }

  emergencyStop(): void {
    if (this.masterGain) {
      fadeOut(this.masterGain, SAFETY.EMERGENCY_FADE_MS);
    }
    this.windChimes?.stopAmbient();
    setTimeout(() => {
      this.ambientPad?.stop(0);
      this.natureSounds?.stop(0);
    }, SAFETY.EMERGENCY_FADE_MS + 100);
  }

  setMasterVolume(volume: number): void {
    if (!this.masterGain) return;
    const now = this.masterGain.context.currentTime;
    const target = Math.min(Math.max(volume, SAFETY.MIN_AUDIBLE), SAFETY.MAX_MASTER_VOLUME);
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(
      Math.max(this.masterGain.gain.value, SAFETY.MIN_AUDIBLE),
      now
    );
    this.masterGain.gain.exponentialRampToValueAtTime(target, now + 0.1);
  }

  setToneVolume(volume: number): void {
    this.ambientPad?.setVolume(volume);
  }

  setChimeVolume(volume: number): void {
    this.windChimes?.setVolume(volume);
  }

  getContext(): AudioContext | null {
    return this.ctx;
  }

  dispose(): void {
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
    this.windChimes?.stopAmbient();
    this.ambientPad?.stop(0);
    this.natureSounds?.stop(0);
    this.ctx?.close();
    this.ctx = null;
    this.masterGain = null;
    this.toneGain = null;
    this.ambientPad = null;
    this.natureSounds = null;
    this.windChimes = null;
  }
}

// Singleton
export const audioEngine = new AudioEngine();
