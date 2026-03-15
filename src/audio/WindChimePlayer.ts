import { CHIME_FREQUENCIES } from '../constants/frequencies';

export class WindChimePlayer {
  private ctx: AudioContext;
  private output: GainNode;
  private volume = 0.1;
  private ambientTimer: number | null = null;
  private lastChimeIndex = -1;

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.output = ctx.createGain();
    this.output.gain.value = this.volume;
    this.output.connect(destination);
  }

  playChime(frequency?: number): void {
    const freq = frequency ?? this.pickRandom();
    const now = this.ctx.currentTime;

    // Fundamental (sine for purity)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = freq;

    // Second partial — one octave up, slightly detuned for shimmer
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 2.003;

    // Third partial — two octaves up, very quiet
    const osc3 = this.ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.value = freq * 3.98;

    // Individual gains for partials
    const gain1 = this.ctx.createGain();
    gain1.gain.value = 1.0;

    const gain2 = this.ctx.createGain();
    gain2.gain.value = 0.3;

    const gain3 = this.ctx.createGain();
    gain3.gain.value = 0.1;

    // Envelope: fast attack, exponential decay (bell character)
    const envelope = this.ctx.createGain();
    envelope.gain.setValueAtTime(0.001, now);
    envelope.gain.linearRampToValueAtTime(0.15, now + 0.003);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    // Connect: osc → partial gain → envelope → output
    osc1.connect(gain1).connect(envelope);
    osc2.connect(gain2).connect(envelope);
    osc3.connect(gain3).connect(envelope);
    envelope.connect(this.output);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    osc1.stop(now + 3);
    osc2.stop(now + 3);
    osc3.stop(now + 3);
  }

  startAmbient(): void {
    this.stopAmbient();
    this.scheduleNext();
  }

  stopAmbient(): void {
    if (this.ambientTimer !== null) {
      clearTimeout(this.ambientTimer);
      this.ambientTimer = null;
    }
  }

  setVolume(volume: number): void {
    this.volume = volume;
    const now = this.ctx.currentTime;
    this.output.gain.cancelScheduledValues(now);
    this.output.gain.setValueAtTime(this.output.gain.value, now);
    this.output.gain.linearRampToValueAtTime(Math.max(volume, 0.001), now + 0.1);
  }

  private scheduleNext(): void {
    const delay = 2000 + Math.random() * 3000; // 2-5 seconds
    this.ambientTimer = window.setTimeout(() => {
      if (Math.random() < 0.5) {
        this.playChime();

        // Sometimes play a second chime shortly after (gentle chord)
        if (Math.random() < 0.3) {
          setTimeout(() => this.playChime(), 100 + Math.random() * 300);
        }
      }
      this.scheduleNext();
    }, delay);
  }

  private pickRandom(): number {
    // Avoid repeating the same note
    let idx: number;
    do {
      idx = Math.floor(Math.random() * CHIME_FREQUENCIES.length);
    } while (idx === this.lastChimeIndex && CHIME_FREQUENCIES.length > 1);
    this.lastChimeIndex = idx;
    return CHIME_FREQUENCIES[idx];
  }
}
