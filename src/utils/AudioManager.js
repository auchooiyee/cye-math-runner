/**
 * CYE MATH RUNNER — Audio Engine
 * Zero-dependency procedural WebAudio synthesizer for retro-cyber SFX & synthwave BGM.
 */
class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;

    this.isMuted = false;
    this.sfxVolume = 0.8;
    this.musicVolume = 0.35;

    // Music scheduler state
    this.isPlayingBGM = false;
    this.bgmTimer = null;
    this.currentStep = 0;
    this.bpm = 128;
    this.baseBpm = 128;
    this.currentKey = 'Am'; // A minor default

    // Bassline and Arp patterns (in semitone offsets from root)
    this.chordRoots = {
      Am: [55, 55, 50, 48],   // A1, A1, D1, C1 (approx MIDI note numbers)
      Dm: [50, 50, 46, 48],   // D1, D1, Bb0, C1
      Em: [52, 52, 48, 50]    // E1, E1, C1, D1
    };
    this.arpScale = [0, 3, 7, 10, 12, 15, 19]; // Minor pentatonic / 7th intervals

    this.init();
  }

  init() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      this.ctx = new AudioContextClass();

      // Master output node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 1.0;
      this.masterGain.connect(this.ctx.destination);

      // SFX bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      // Music bus
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.masterGain);

      // Check saved mute preference
      const savedMute = localStorage.getItem('CYE_MATH_RUNNER_MUTED');
      if (savedMute === 'true') {
        this.mute();
      }

      // Resume context on first user touch/click
      const unlockAudio = () => {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };
      window.addEventListener('pointerdown', unlockAudio);
      window.addEventListener('keydown', unlockAudio);

    } catch (e) {
      console.warn('WebAudio not supported:', e);
    }
  }

  ensureContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
    return this.isMuted;
  }

  mute() {
    this.isMuted = true;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    try {
      localStorage.setItem('CYE_MATH_RUNNER_MUTED', 'true');
    } catch (e) {}
  }

  unmute() {
    this.isMuted = false;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    }
    try {
      localStorage.setItem('CYE_MATH_RUNNER_MUTED', 'false');
    } catch (e) {}
  }

  // ══════════════════════════════════════════════
  // SOUND EFFECTS (SFX)
  // ══════════════════════════════════════════════

  playJump() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(460, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  playSlide() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    // Filtered noise swoosh
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.18);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  playCoin() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    // High crystalline two-tone chime (E6 -> B6)
    [1318.5, 1975.5].forEach((freq, idx) => {
      const t = now + idx * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.17);
    });
  }

  playCorrect() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    // Major celebratory chord arpeggio: C5 -> E5 -> G5 -> C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.055;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  playWrong() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    // Dissonant buzzer drop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.24);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  playDamage() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    // Impact thump + distortion
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  playMathFever() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    // Shimmering laser power-up sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.35);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  playBossHit() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  playBossDefeat() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    // Royal fanfare: C4 -> G4 -> C5 -> E5 -> G5
    const fanfare = [261.63, 392.00, 523.25, 659.25, 783.99];
    fanfare.forEach((freq, idx) => {
      const t = now + idx * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.36);
    });
  }

  playGameOver() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    // Somber descending minor sequence: E4 -> C4 -> A3
    [329.63, 261.63, 220.00].forEach((freq, idx) => {
      const t = now + idx * 0.2;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.36);
    });
  }

  playClick() {
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // ══════════════════════════════════════════════
  // PROCEDURAL CYBERPUNK SYNTHWAVE MUSIC (BGM)
  // ══════════════════════════════════════════════

  startBGM(bpm = 125, key = 'Am') {
    if (this.isPlayingBGM) return;
    this.isPlayingBGM = true;
    this.bpm = bpm;
    this.baseBpm = bpm;
    this.currentKey = key;
    this.currentStep = 0;

    this.scheduleNextBeat();
  }

  stopBGM() {
    this.isPlayingBGM = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  setBGMTempoMultiplier(multiplier = 1.0) {
    this.bpm = Math.floor(this.baseBpm * multiplier);
  }

  setZoneKey(zoneId) {
    const keys = ['Am', 'Dm', 'Am', 'Em', 'Dm', 'Am', 'Em', 'Am'];
    this.currentKey = keys[(zoneId - 1) % keys.length] || 'Am';
  }

  scheduleNextBeat() {
    if (!this.isPlayingBGM || !this.ctx) return;
    this.ensureContext();

    const secondsPer16th = 60 / (this.bpm * 4);
    const now = this.ctx.currentTime;

    // Trigger synth note on this 16th step
    this.playSynthStep(this.currentStep, now);

    this.currentStep = (this.currentStep + 1) % 32;

    // Schedule next 16th note slightly ahead
    const intervalMs = secondsPer16th * 1000;
    this.bgmTimer = setTimeout(() => {
      this.scheduleNextBeat();
    }, intervalMs);
  }

  playSynthStep(step, time) {
    if (this.isMuted) return;

    // Driving Synthwave Bassline on 16ths
    const barIndex = Math.floor(step / 8);
    const rootNotes = this.chordRoots[this.currentKey] || this.chordRoots.Am;
    const basePitch = rootNotes[barIndex % rootNotes.length];

    // Bass rhythm: steady 16th pulse with accent on downbeats
    const isDownbeat = step % 4 === 0;
    const isOffbeat = step % 2 === 1;

    if (isDownbeat || isOffbeat) {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      const freq = 440 * Math.pow(2, (basePitch - 69) / 12);
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isDownbeat ? 600 : 380, time);
      filter.frequency.exponentialRampToValueAtTime(140, time + 0.12);

      gain.gain.setValueAtTime(isDownbeat ? 0.18 : 0.11, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + 0.15);
    }

    // Shimmering Arpeggio Lead (on every 8th note)
    if (step % 2 === 0) {
      const arpNoteIndex = (step / 2) % this.arpScale.length;
      const semitoneOffset = this.arpScale[arpNoteIndex];
      const leadPitch = basePitch + 24 + semitoneOffset; // 2 octaves above bass

      const leadOsc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();

      leadOsc.type = 'triangle';
      const leadFreq = 440 * Math.pow(2, (leadPitch - 69) / 12);
      leadOsc.frequency.setValueAtTime(leadFreq, time);

      leadGain.gain.setValueAtTime(0.08, time);
      leadGain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);

      leadOsc.connect(leadGain);
      leadGain.connect(this.musicGain);

      leadOsc.start(time);
      leadOsc.stop(time + 0.17);
    }
  }
}

// Global Singleton Instance
const audioManager = new AudioManager();
export default audioManager;
