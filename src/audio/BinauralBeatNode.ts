import { fadeIn, fadeOut } from './FadeController';
import { SAFETY } from '../constants/safety';

export class BinauralBeatNode {
  private leftOsc: OscillatorNode | null = null;
  private rightOsc: OscillatorNode | null = null;
  private leftGain: GainNode;
  private rightGain: GainNode;
  private merger: ChannelMergerNode;
  private outputGain: GainNode;
  private ctx: AudioContext;
  private started = false;

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;

    // Use ChannelMerger for maximum Safari compatibility
    this.merger = ctx.createChannelMerger(2);
    this.leftGain = ctx.createGain();
    this.rightGain = ctx.createGain();
    this.outputGain = ctx.createGain();

    this.leftGain.gain.value = SAFETY.MIN_AUDIBLE;
    this.rightGain.gain.value = SAFETY.MIN_AUDIBLE;
    this.outputGain.gain.value = SAFETY.MIN_AUDIBLE;

    // Left channel -> merger input 0, Right channel -> merger input 1
    this.leftGain.connect(this.merger, 0, 0);
    this.rightGain.connect(this.merger, 0, 1);
    this.merger.connect(this.outputGain);
    this.outputGain.connect(destination);
  }

  start(carrierHz: number, beatHz: number, volume: number): void {
    this.stop();

    const leftFreq = carrierHz - beatHz / 2;
    const rightFreq = carrierHz + beatHz / 2;

    this.leftOsc = this.ctx.createOscillator();
    this.leftOsc.type = 'sine';
    this.leftOsc.frequency.value = leftFreq;
    this.leftOsc.connect(this.leftGain);

    this.rightOsc = this.ctx.createOscillator();
    this.rightOsc.type = 'sine';
    this.rightOsc.frequency.value = rightFreq;
    this.rightOsc.connect(this.rightGain);

    this.leftGain.gain.value = volume;
    this.rightGain.gain.value = volume;

    this.leftOsc.start();
    this.rightOsc.start();
    this.started = true;

    fadeIn(this.outputGain, volume);
  }

  stop(fadeMs: number = SAFETY.FADE_OUT_MS): void {
    if (!this.started) return;

    fadeOut(this.outputGain, fadeMs);

    const stopTime = this.ctx.currentTime + fadeMs / 1000 + 0.1;
    this.leftOsc?.stop(stopTime);
    this.rightOsc?.stop(stopTime);

    this.leftOsc = null;
    this.rightOsc = null;
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
