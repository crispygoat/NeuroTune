import { fadeIn, fadeOut } from './FadeController';
import { SAFETY } from '../constants/safety';
import type { PadConfig } from '../types/audio';

/**
 * AmbientPadNode — Configurable musical entrainment pad
 *
 * Creates a warm ambient pad chord with a binaural beat woven
 * into the harmonic structure. Frequency configuration is driven
 * by PadConfig so both 40 Hz (gamma) and 528 Hz (Solfeggio) modes
 * use the same synthesis engine.
 *
 * Layers:
 * 1. Pad chord (detuned voices) — warm, atmospheric
 * 2. Sub-bass drone — deep foundation
 * 3. Binaural beat — embedded at low volume
 * 4. Gentle LFO on filter — slow movement (breathing feel)
 */
export class AmbientPadNode {
  private ctx: AudioContext;
  private outputGain: GainNode;
  private padOscs: OscillatorNode[] = [];
  private padGains: GainNode[] = [];
  private subOsc: OscillatorNode | null = null;
  private subGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private filterLfo: OscillatorNode | null = null;
  private filterLfoGain: GainNode | null = null;
  // Binaural layer (quiet, embedded)
  private binLeftOsc: OscillatorNode | null = null;
  private binRightOsc: OscillatorNode | null = null;
  private binMerger: ChannelMergerNode | null = null;
  private binGain: GainNode | null = null;
  private started = false;

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.outputGain = ctx.createGain();
    this.outputGain.gain.value = SAFETY.MIN_AUDIBLE;
    this.outputGain.connect(destination);
  }

  start(volume: number, config: PadConfig): void {
    this.stop();
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // === Filter for warmth ===
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = config.filterCutoff;
    this.filter.Q.value = 0.7;
    this.filter.connect(this.outputGain);

    // Slow LFO on filter cutoff — breathing movement
    this.filterLfo = ctx.createOscillator();
    this.filterLfo.type = 'sine';
    this.filterLfo.frequency.value = config.filterLfoHz;
    this.filterLfoGain = ctx.createGain();
    this.filterLfoGain.gain.value = config.lfoDepth;
    this.filterLfo.connect(this.filterLfoGain);
    this.filterLfoGain.connect(this.filter.frequency);
    this.filterLfo.start(now);

    // === Pad chord with slight detune ===
    for (const freq of config.padFreqs) {
      // Each voice = 2 slightly detuned oscillators for thickness
      for (let detune = -4; detune <= 4; detune += 8) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.detune.value = detune + (Math.random() - 0.5) * 2;

        const gain = ctx.createGain();
        gain.gain.value = config.padGain;

        osc.connect(gain);
        gain.connect(this.filter);
        osc.start(now);

        this.padOscs.push(osc);
        this.padGains.push(gain);
      }
    }

    // === Sub-bass drone ===
    this.subOsc = ctx.createOscillator();
    this.subOsc.type = 'sine';
    this.subOsc.frequency.value = config.subFreq;
    this.subGain = ctx.createGain();
    this.subGain.gain.value = config.subGain;
    this.subOsc.connect(this.subGain);
    this.subGain.connect(this.filter);
    this.subOsc.start(now);

    // === Embedded binaural beat ===
    this.binMerger = ctx.createChannelMerger(2);
    this.binGain = ctx.createGain();
    this.binGain.gain.value = config.binGain;

    const halfBeat = config.binauralBeatHz / 2;
    this.binLeftOsc = ctx.createOscillator();
    this.binLeftOsc.type = 'sine';
    this.binLeftOsc.frequency.value = config.binauralCarrier - halfBeat;

    this.binRightOsc = ctx.createOscillator();
    this.binRightOsc.type = 'sine';
    this.binRightOsc.frequency.value = config.binauralCarrier + halfBeat;

    const leftGain = ctx.createGain();
    leftGain.gain.value = 1;
    const rightGain = ctx.createGain();
    rightGain.gain.value = 1;

    this.binLeftOsc.connect(leftGain);
    leftGain.connect(this.binMerger, 0, 0);
    this.binRightOsc.connect(rightGain);
    rightGain.connect(this.binMerger, 0, 1);
    this.binMerger.connect(this.binGain);
    this.binGain.connect(this.outputGain); // Bypasses filter for clarity

    this.binLeftOsc.start(now);
    this.binRightOsc.start(now);

    this.started = true;
    fadeIn(this.outputGain, volume, SAFETY.FADE_IN_MS);
  }

  stop(fadeMs: number = SAFETY.FADE_OUT_MS): void {
    if (!this.started) return;

    fadeOut(this.outputGain, fadeMs);

    const stopTime = this.ctx.currentTime + fadeMs / 1000 + 0.1;

    for (const osc of this.padOscs) {
      osc.stop(stopTime);
    }
    this.padOscs = [];
    this.padGains = [];

    this.subOsc?.stop(stopTime);
    this.subOsc = null;
    this.subGain = null;

    this.filterLfo?.stop(stopTime);
    this.filterLfo = null;
    this.filterLfoGain = null;
    this.filter = null;

    this.binLeftOsc?.stop(stopTime);
    this.binRightOsc?.stop(stopTime);
    this.binLeftOsc = null;
    this.binRightOsc = null;
    this.binMerger = null;
    this.binGain = null;

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
