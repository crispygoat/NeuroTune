import { fadeIn, fadeOut } from './FadeController';
import { SAFETY } from '../constants/safety';

export class IsochronicToneNode {
  private carrierOsc: OscillatorNode | null = null;
  private lfoOsc: OscillatorNode | null = null;
  private envelopeGain: GainNode;
  private lfoGain: GainNode;
  private outputGain: GainNode;
  private ctx: AudioContext;
  private started = false;

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;

    this.envelopeGain = ctx.createGain();
    this.lfoGain = ctx.createGain();
    this.outputGain = ctx.createGain();

    this.envelopeGain.gain.value = 0.5;  // base value; LFO oscillates around this
    this.lfoGain.gain.value = 0.5;       // scale LFO from -0.5..+0.5
    this.outputGain.gain.value = SAFETY.MIN_AUDIBLE;

    this.envelopeGain.connect(this.outputGain);
    this.outputGain.connect(destination);
  }

  start(carrierHz: number, beatHz: number, volume: number): void {
    this.stop();

    // Carrier oscillator
    this.carrierOsc = this.ctx.createOscillator();
    this.carrierOsc.type = 'sine';
    this.carrierOsc.frequency.value = carrierHz;
    this.carrierOsc.connect(this.envelopeGain);

    // LFO for amplitude modulation
    this.lfoOsc = this.ctx.createOscillator();
    this.lfoOsc.type = 'sine';
    this.lfoOsc.frequency.value = beatHz;

    // LFO -> lfoGain (scales to -0.5..+0.5) -> envelopeGain.gain (base 0.5)
    // Net effect: envelope oscillates 0.0..1.0 at beatHz
    this.lfoGain.gain.value = 0.5;
    this.lfoOsc.connect(this.lfoGain);
    this.lfoGain.connect(this.envelopeGain.gain);

    this.carrierOsc.start();
    this.lfoOsc.start();
    this.started = true;

    fadeIn(this.outputGain, volume);
  }

  stop(fadeMs: number = SAFETY.FADE_OUT_MS): void {
    if (!this.started) return;

    fadeOut(this.outputGain, fadeMs);

    const stopTime = this.ctx.currentTime + fadeMs / 1000 + 0.1;
    this.carrierOsc?.stop(stopTime);
    this.lfoOsc?.stop(stopTime);

    this.carrierOsc = null;
    this.lfoOsc = null;
    this.started = false;
  }

  setVolume(volume: number): void {
    const now = this.ctx.currentTime;
    const target = Math.max(volume, SAFETY.MIN_AUDIBLE);
    this.outputGain.gain.cancelScheduledValues(now);
    this.outputGain.gain.setValueAtTime(
      Math.max(this.outputGain.gain.value, SAFETY.MIN_AUDIBLE),
      now
    );
    this.outputGain.gain.exponentialRampToValueAtTime(target, now + 0.1);
  }

  isActive(): boolean {
    return this.started;
  }
}
