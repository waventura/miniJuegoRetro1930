// Motor de sonido Web Audio estilo caricatura clásica 1930 (Ragtime / Swing + SFX cómicos)

export class RetroAudio {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.musicEnabled = true;
    this.musicTimer = null;
    this.beatIndex = 0;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  unlock() {
    this.ensureContext();
    if (this.musicEnabled && !this.musicTimer) {
      this.startMusic();
    }
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
    } else {
      this.ensureContext();
      this.startMusic();
    }
  }

  setSfxEnabled(enabled) {
    this.sfxEnabled = enabled;
  }

  startMusic() {
    if (this.musicTimer || !this.musicEnabled) return;
    // Melodía alegre ragtime/swing en Do mayor (estilo Silly Symphonies)
    const melody = [
      523.25, 659.25, 783.99, 659.25, 880.0, 783.99, 659.25, 587.33,
      523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 0,
      698.46, 880.0, 1046.5, 880.0, 783.99, 659.25, 587.33, 659.25,
      523.25, 659.25, 783.99, 659.25, 587.33, 523.25, 392.0, 523.25
    ];
    const bass = [
      130.81, 196.0, 130.81, 196.0, 174.61, 220.0, 130.81, 196.0,
      146.83, 196.0, 130.81, 196.0, 196.0, 146.83, 130.81, 196.0
    ];

    this.musicTimer = setInterval(() => {
      if (!this.musicEnabled || !this.ctx || this.ctx.state !== 'running') return;
      const now = this.ctx.currentTime;
      const mFreq = melody[this.beatIndex % melody.length];
      const bFreq = bass[Math.floor(this.beatIndex / 2) % bass.length];

      // Bajo tuba/piano ragtime
      if (this.beatIndex % 2 === 0 && bFreq) {
        this._tone(bFreq, 'triangle', 0.17, 0.045, now);
      }
      // Melodía clarinete/xilófono vintage
      if (mFreq > 0) {
        this._tone(mFreq, 'sine', 0.14, 0.032, now);
        this._tone(mFreq * 2, 'triangle', 0.06, 0.012, now);
      }
      // Woodblock suave en contratiempo
      if (this.beatIndex % 2 === 1) {
        this._tone(920, 'sine', 0.03, 0.015, now, 620);
      }
      this.beatIndex++;
    }, 235);
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  _tone(freq, type, duration, gainVal, startTime, endFreq = null) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (endFreq !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), startTime + duration);
    }
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  play(sfx) {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    switch (sfx) {
      case 'swing':
        this._tone(420, 'triangle', 0.12, 0.12, now, 170);
        break;
      case 'chop':
        this._tone(210, 'square', 0.07, 0.11, now, 95);
        this._tone(480, 'triangle', 0.05, 0.08, now + 0.02, 260);
        break;
      case 'stone':
        this._tone(680, 'square', 0.06, 0.09, now, 440);
        this._tone(920, 'triangle', 0.08, 0.07, now + 0.03, 760);
        break;
      case 'crystal':
        this._tone(880, 'sine', 0.14, 0.1, now, 1320);
        this._tone(1320, 'sine', 0.16, 0.08, now + 0.05, 1760);
        break;
      case 'pickup':
        this._tone(587, 'sine', 0.08, 0.09, now, 880);
        this._tone(880, 'sine', 0.1, 0.08, now + 0.06, 1175);
        break;
      case 'star':
        this._tone(740, 'triangle', 0.15, 0.11, now, 1480);
        this._tone(1100, 'sine', 0.12, 0.08, now + 0.04, 1650);
        break;
      case 'hit':
        this._tone(320, 'sawtooth', 0.11, 0.12, now, 110);
        this._tone(520, 'triangle', 0.08, 0.09, now + 0.03, 220);
        break;
      case 'hurt':
        // Silbato cómico descendente 1930
        this._tone(620, 'sine', 0.26, 0.13, now, 180);
        break;
      case 'shield':
        this._tone(520, 'triangle', 0.12, 0.12, now, 780);
        this._tone(1040, 'sine', 0.15, 0.08, now + 0.02, 920);
        break;
      case 'potion':
        this._tone(400, 'sine', 0.08, 0.1, now, 620);
        this._tone(550, 'sine', 0.08, 0.1, now + 0.08, 820);
        this._tone(720, 'sine', 0.14, 0.12, now + 0.16, 1100);
        break;
      case 'craft':
        [523, 659, 784, 1046].forEach((f, i) => {
          this._tone(f, 'triangle', 0.14, 0.11, now + i * 0.07);
        });
        break;
      case 'chest':
        [523, 659, 784, 988, 1046].forEach((f, i) => {
          this._tone(f, 'sine', 0.18, 0.12, now + i * 0.08);
        });
        break;
      case 'boss_stomp':
        this._tone(150, 'sawtooth', 0.24, 0.15, now, 52);
        break;
      case 'victory':
        [523, 659, 784, 1046, 784, 1046].forEach((f, i) => {
          this._tone(f, 'triangle', 0.2, 0.13, now + i * 0.11);
        });
        break;
      case 'ui':
        this._tone(640, 'sine', 0.06, 0.08, now, 820);
        break;
      default:
        break;
    }
  }
}
