/**
 * Tiny Web Audio API synthesizer — every sound in the game is generated
 * in real time. No audio files needed.
 */

type ToneOpts = {
  freq: number;
  dur: number; // seconds
  type?: OscillatorType;
  vol?: number;
  when?: number; // seconds from now
  slideTo?: number;
};

class Synth {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  muted = false;

  private ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!this.ctx) {
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  /** Call from a user gesture to unlock audio. */
  unlock() {
    this.ensure();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.55;
  }

  private tone({ freq, dur, type = 'sine', vol = 0.3, when = 0, slideTo }: ToneOpts) {
    const ctx = this.ensure();
    if (!ctx || !this.master || this.muted) return;
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(slideTo, 1), t0 + dur);
    }
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  click() {
    this.tone({ freq: 720, dur: 0.06, type: 'square', vol: 0.12 });
  }

  tick() {
    this.tone({ freq: 1350, dur: 0.028, type: 'square', vol: 0.05 });
  }

  typing() {
    this.tone({ freq: 300 + Math.random() * 120, dur: 0.03, type: 'triangle', vol: 0.03 });
  }

  pop() {
    this.tone({ freq: 520, dur: 0.07, type: 'sine', vol: 0.25 });
    this.tone({ freq: 880, dur: 0.1, type: 'sine', vol: 0.22, when: 0.06 });
  }

  buzz() {
    this.tone({ freq: 130, dur: 0.5, type: 'sawtooth', vol: 0.3, slideTo: 70 });
    this.tone({ freq: 98, dur: 0.5, type: 'square', vol: 0.18, when: 0.02, slideTo: 60 });
  }

  gong() {
    this.tone({ freq: 392, dur: 0.9, type: 'triangle', vol: 0.28 });
    this.tone({ freq: 523, dur: 1.1, type: 'sine', vol: 0.2, when: 0.03 });
    this.tone({ freq: 196, dur: 1.4, type: 'sine', vol: 0.16, when: 0.05 });
  }

  stopFanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => this.tone({ freq: f, dur: 0.16, type: 'triangle', vol: 0.26, when: i * 0.09 }));
    this.tone({ freq: 1046.5, dur: 0.5, type: 'sine', vol: 0.24, when: 0.38 });
  }

  countBeep(final = false) {
    this.tone({ freq: final ? 1046 : 660, dur: final ? 0.4 : 0.12, type: 'square', vol: 0.16 });
  }

  win() {
    const melody: [number, number][] = [
      [523.25, 0], [659.25, 0.12], [783.99, 0.24], [1046.5, 0.36],
      [880, 0.52], [1046.5, 0.64], [1318.5, 0.8],
    ];
    melody.forEach(([f, w]) => this.tone({ freq: f, dur: 0.22, type: 'triangle', vol: 0.26, when: w }));
    this.tone({ freq: 1567.98, dur: 0.7, type: 'sine', vol: 0.2, when: 1.0 });
  }

  debateLaugh() {
    [0, 0.09, 0.2].forEach((w, i) =>
      this.tone({ freq: 500 + i * 140, dur: 0.08, type: 'square', vol: 0.07, when: w }),
    );
  }
}

export const synth = new Synth();
