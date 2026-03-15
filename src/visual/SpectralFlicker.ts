import type { FlickerConfig } from '../types/visual';
import { shouldDisableFlicker } from './SafetyGuard';

export class SpectralFlicker {
  private overlay: HTMLDivElement | null = null;
  private active = false;
  private animFrameId: number | null = null;

  attach(overlay: HTMLDivElement): void {
    this.overlay = overlay;
  }

  start(config: FlickerConfig): void {
    if (!config.enabled || shouldDisableFlicker() || !this.overlay) {
      this.stop();
      return;
    }

    this.active = true;

    const halfPeriodMs = 1000 / (config.frequencyHz * 2);
    let lastToggle = performance.now();
    let isWarm = true;

    const tick = (now: number) => {
      if (!this.active || !this.overlay) return;

      if (now - lastToggle >= halfPeriodMs) {
        this.overlay.style.backgroundColor = isWarm ? config.warmTint : config.coolTint;
        isWarm = !isWarm;
        lastToggle = now;
      }

      this.animFrameId = requestAnimationFrame(tick);
    };

    this.animFrameId = requestAnimationFrame(tick);
  }

  stop(): void {
    this.active = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.overlay) {
      this.overlay.style.backgroundColor = 'transparent';
    }
  }

  isActive(): boolean {
    return this.active;
  }
}
