// KD Birthday Audio Engine: Dual-Engine Studio Acoustic Music & Real-time Web Audio Synthesizer
// 1. High-Fidelity Studio Acoustic Master Tracks (Chopin, Debussy, Satie, Happy Birthday Piano)
// 2. Physical Modeling Rhodes / Grand Piano Synth with Master Hall Reverb & Warm Analog Filter
// 3. iOS Safari Audio Auto-Unlock, 100% Offline Capable, Zero External CDNs

class KDAudioEngine {
  constructor() {
    this.ctx = null;
    this.analyser = null;
    this.masterGain = null;
    this.warmFilter = null;
    this.reverbNode = null;
    this.reverbGain = null;
    this.dryGain = null;
    this.compressor = null;
    this.sourceNode = null;

    this.isPlaying = false;
    this.currentTrackIndex = 0;
    this.loopTimer = null;
    this.isMuted = false;
    this.volume = 0.85;
    this.visualizerCanvas = null;
    this.visualizerCtx = null;
    this.animFrameId = null;

    this.soundType = 'piano'; // 'piano', 'synth', 'vibes', 'organ'

    // HTML5 Studio Audio Player for Authentic Acoustic Masterpieces
    this.audioEl = new Audio();
    this.audioEl.preload = 'auto';

    // 5 Soothing, World-Class Acoustic & Classical Masterpieces
    this.tracks = [
      {
        title: "Happy Birthday Dr. KD (Acoustic Grand Piano)",
        artist: "The Gang • Dedicated to Dr. Krunal Desai",
        type: "audio",
        file: "assets/audio/happy_birthday.mp3",
        duration: "2:21",
        albumArt: "assets/images/kd_hero_dj.jpg",
        desc: "Joyful, uplifting acoustic piano arrangement of Happy Birthday"
      },
      {
        title: "Chopin: Nocturne in E-Flat Major, Op. 9 No. 2",
        artist: "Frank Levy • Grand Piano Acoustic Masterpiece",
        type: "audio",
        file: "assets/audio/chopin_nocturne.mp3",
        duration: "4:15",
        albumArt: "assets/images/kd_keyboard_singer.jpg",
        desc: "The most romantic, sublime acoustic piano nocturne in history"
      },
      {
        title: "Debussy: Clair de Lune (GCS Hospital Late Night Peace)",
        artist: "Claude Debussy • Dr. KD Relaxation Sanctuary",
        type: "audio",
        file: "assets/audio/clair_de_lune.mp3",
        duration: "5:02",
        albumArt: "assets/images/kd_gaitonde.jpg",
        desc: "Ethereal, calming moonlight piano for unwinding after rounds"
      },
      {
        title: "Satie: Gymnopédie No. 1 (Post-Shift Stethoscope Chill)",
        artist: "Erik Satie • MBBS Intern Recovery Room",
        type: "audio",
        file: "assets/audio/gymnopedie_no1.mp3",
        duration: "3:08",
        albumArt: "assets/images/kd_jadyo.jpg",
        desc: "Hypnotic, deeply soothing minimalist piano meditation"
      },
      {
        title: "Beethoven: Moonlight Sonata (Ahmedabad Night Duty)",
        artist: "Ludwig van Beethoven • Dr. KD Midnight Round",
        type: "audio",
        file: "assets/audio/moonlight_sonata.mp3",
        duration: "5:20",
        albumArt: "assets/images/kd_hero_dj.jpg",
        desc: "Deeply moving, atmospheric classical piano masterpiece"
      }
    ];

    this.bindAudioElementEvents();
    this.setupIOSAudioUnlock();
  }

  // Bind HTML5 Audio Element playback and scrubber callbacks
  bindAudioElementEvents() {
    this.audioEl.addEventListener('play', () => {
      this.isPlaying = true;
      if (window.onKDTrackStateChange) window.onKDTrackStateChange(true);
    });

    this.audioEl.addEventListener('pause', () => {
      this.isPlaying = false;
      if (window.onKDTrackStateChange) window.onKDTrackStateChange(false);
    });

    this.audioEl.addEventListener('ended', () => {
      this.nextTrack();
    });

    this.audioEl.addEventListener('timeupdate', () => {
      if (window.onKDTimeUpdate && this.audioEl.duration) {
        window.onKDTimeUpdate(this.audioEl.currentTime, this.audioEl.duration);
      }
    });

    this.audioEl.addEventListener('loadedmetadata', () => {
      if (window.onKDTimeUpdate && this.audioEl.duration) {
        window.onKDTimeUpdate(this.audioEl.currentTime, this.audioEl.duration);
      }
    });
  }

  // iOS Safari strict audio policy unlock
  setupIOSAudioUnlock() {
    const unlock = () => {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      if (this.ctx) {
        try {
          const buffer = this.ctx.createBuffer(1, 1, 22050);
          const source = this.ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(this.ctx.destination);
          source.start(0);
        } catch (e) {}
      }
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('touchend', unlock);
      window.removeEventListener('click', unlock);
    };

    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('touchend', unlock, { passive: true });
    window.addEventListener('click', unlock, { passive: true });
  }

  // Algorithmic Studio Hall Reverb Buffer (warm 2.2s room impulse response)
  createReverbBuffer(duration = 2.2, decay = 2.4) {
    if (!this.ctx) return null;
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const env = Math.pow(1 - n, decay);
      left[i] = (Math.random() * 2 - 1) * env;
      right[i] = (Math.random() * 2 - 1) * env;
    }

    const convolver = this.ctx.createConvolver();
    convolver.buffer = impulse;
    return convolver;
  }

  // Initialize Web Audio Graph & Routing
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // 1. Master Output Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      // 2. Master Warm Lowpass Filter (Cuts harsh digital fizz & piercing highs)
      this.warmFilter = this.ctx.createBiquadFilter();
      this.warmFilter.type = 'lowpass';
      this.warmFilter.frequency.setValueAtTime(3200, this.ctx.currentTime);
      this.warmFilter.Q.setValueAtTime(0.707, this.ctx.currentTime);

      // 3. Studio Hall Reverb
      this.reverbNode = this.createReverbBuffer(2.2, 2.5);
      this.reverbGain = this.ctx.createGain();
      this.reverbGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

      this.dryGain = this.ctx.createGain();
      this.dryGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

      // 4. Mastering Compressor
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(8, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(3.2, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.015, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.22, this.ctx.currentTime);

      // 5. Analyser for the canvas visualizer
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.82;

      // Master Signal Routing:
      this.masterGain.connect(this.warmFilter);
      this.warmFilter.connect(this.dryGain);

      if (this.reverbNode) {
        this.warmFilter.connect(this.reverbNode);
        this.reverbNode.connect(this.reverbGain);
        this.reverbGain.connect(this.compressor);
      }

      this.dryGain.connect(this.compressor);
      this.compressor.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      // Connect HTML5 Audio element to Web Audio graph (for visualizer + master gain)
      try {
        if (!this.sourceNode) {
          this.sourceNode = this.ctx.createMediaElementSource(this.audioEl);
          this.sourceNode.connect(this.masterGain);
        }
      } catch (e) {
        // Fallback for file:// CORS policies in strict browsers
      }
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // ===================================================
  // PLAYBACK CONTROLS (SOOTHING & FINE-TUNED)
  // ===================================================

  getCurrentTrack() {
    return this.tracks[this.currentTrackIndex] || this.tracks[0];
  }

  loadTrack(index) {
    this.playTrack(index);
  }

  play() {
    if (!this.isPlaying) this.togglePlay();
  }

  pause() {
    if (this.isPlaying) this.togglePlay();
  }

  get duration() {
    return (this.audioEl && this.audioEl.duration && !isNaN(this.audioEl.duration)) ? this.audioEl.duration : 140;
  }

  get currentTime() {
    return (this.audioEl && this.audioEl.currentTime) ? this.audioEl.currentTime : 0;
  }

  getVisualizerData() {
    if (this.analyser && this.isPlaying) {
      const data = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(data);
      return data;
    }
    const fake = new Uint8Array(64);
    for (let i = 0; i < 64; i++) {
      fake[i] = Math.floor(Math.sin(Date.now() * 0.003 + i * 0.2) * 20 + 25);
    }
    return fake;
  }

  playTrack(index) {
    this.init();
    this.stopSynthFallback();

    this.currentTrackIndex = (index + this.tracks.length) % this.tracks.length;
    const track = this.tracks[this.currentTrackIndex];

    this.audioEl.src = track.file;
    this.audioEl.volume = this.isMuted ? 0 : this.volume;

    const playPromise = this.audioEl.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        this.isPlaying = true;
        if (window.onKDTrackChange) window.onKDTrackChange(track, this.currentTrackIndex);
        if (window.onKDTrackStateChange) window.onKDTrackStateChange(true);
      }).catch(err => {
        // In case media element play fails, seamlessly run physical modeled synthesis
        console.warn("Switching to soothing synthesized mode:", err);
        this.isPlaying = true;
        this.startSynthMode(this.currentTrackIndex);
        if (window.onKDTrackChange) window.onKDTrackChange(track, this.currentTrackIndex);
        if (window.onKDTrackStateChange) window.onKDTrackStateChange(true);
      });
    }
  }

  togglePlay() {
    this.init();
    if (this.isPlaying) {
      this.pauseMusic();
    } else {
      if (this.audioEl.src && !this.audioEl.ended && this.audioEl.currentTime > 0) {
        this.audioEl.play().catch(() => this.playTrack(this.currentTrackIndex));
      } else {
        this.playTrack(this.currentTrackIndex);
      }
    }
  }

  pauseMusic() {
    this.isPlaying = false;
    this.audioEl.pause();
    this.stopSynthFallback();
    if (window.onKDTrackStateChange) {
      window.onKDTrackStateChange(false);
    }
  }

  nextTrack() {
    this.playTrack(this.currentTrackIndex + 1);
  }

  prevTrack() {
    this.playTrack(this.currentTrackIndex - 1);
  }

  seek(pct) {
    if (this.audioEl && this.audioEl.duration) {
      this.audioEl.currentTime = (Math.max(0, Math.min(100, pct)) / 100) * this.audioEl.duration;
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    this.audioEl.volume = this.isMuted ? 0 : this.volume;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.setVolume(this.volume);
    return this.isMuted;
  }

  stopSynthFallback() {
    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
  }

  // ===================================================
  // PHYSICAL SYNTHESIS (FALLBACK & STAGE PIANO JAMMING)
  // ===================================================

  // 1. Warm Neo-Soul Fender Rhodes / Wurlitzer Note
  playRhodesNote(freq, dur = 1.2, velocity = 0.35, time = null) {
    this.init();
    const t = time !== null ? time : this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, t);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, t);
    osc2.detune.setValueAtTime(3.5, t);

    const tine = this.ctx.createOscillator();
    tine.type = 'sine';
    tine.frequency.setValueAtTime(freq * 3.5, t);

    const gain1 = this.ctx.createGain();
    const gain2 = this.ctx.createGain();
    const gainTine = this.ctx.createGain();

    gain1.gain.setValueAtTime(0.0001, t);
    gain1.gain.linearRampToValueAtTime(velocity * 0.75, t + 0.012);
    gain1.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    gain2.gain.setValueAtTime(0.0001, t);
    gain2.gain.linearRampToValueAtTime(velocity * 0.22, t + 0.008);
    gain2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.65);

    gainTine.gain.setValueAtTime(0.0001, t);
    gainTine.gain.linearRampToValueAtTime(velocity * 0.12, t + 0.004);
    gainTine.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

    osc1.connect(gain1);
    osc2.connect(gain2);
    tine.connect(gainTine);

    gain1.connect(this.masterGain);
    gain2.connect(this.masterGain);
    gainTine.connect(this.masterGain);

    osc1.start(t);
    osc2.start(t);
    tine.start(t);

    osc1.stop(t + dur + 0.05);
    osc2.stop(t + dur + 0.05);
    tine.stop(t + 0.06);
  }

  // 2. Virtual Piano Key Trigger (Studio Stage Jam)
  playPianoKey(freq, soundType = this.soundType, dur = 1.0) {
    this.init();
    const t = this.ctx.currentTime;

    if (soundType === 'piano') {
      this.playRhodesNote(freq, dur * 1.3, 0.45, t);
    } else if (soundType === 'synth') {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(freq, t);
      osc2.frequency.setValueAtTime(freq, t);
      osc1.detune.setValueAtTime(-5, t);
      osc2.detune.setValueAtTime(5, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 2.2, t);
      filter.frequency.exponentialRampToValueAtTime(freq * 0.9, t + dur);
      filter.Q.value = 1.2;

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.24, t + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + dur + 0.05);
      osc2.stop(t + dur + 0.05);
    } else if (soundType === 'vibes') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.36, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur * 1.5);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + dur * 1.55);
    } else if (soundType === 'organ') {
      [1, 2, 3].forEach((mult, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * mult, t);

        const vol = 0.22 / (i + 1);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(vol, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.9);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + dur * 0.95);
      });
    }
  }

  playChord(frequencies, soundType = this.soundType) {
    frequencies.forEach((f, idx) => {
      setTimeout(() => {
        this.playPianoKey(f, soundType, 1.4);
      }, idx * 28);
    });
  }

  playConcertCheer() {
    this.init();
    this.playChord([261.63, 329.63, 392.00, 523.25], 'piano');
    setTimeout(() => this.playChord([349.23, 440.00, 523.25, 698.46], 'vibes'), 300);
    setTimeout(() => this.playChord([392.00, 493.88, 587.33, 783.99], 'piano'), 650);
  }

  playPianoGlissando() {
    this.init();
    const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33];
    notes.forEach((f, i) => {
      setTimeout(() => {
        this.playPianoKey(f, this.soundType, 0.6);
      }, i * 40);
    });
  }

  // ===================================================
  // SOUNDBOARD SFX
  // ===================================================

  playHeartbeat() {
    this.init();
    const t = this.ctx.currentTime;
    const playThump = (time, freq, gainVal) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(28, time + 0.16);

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(gainVal, time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + 0.22);
    };

    playThump(t, 80, 0.75);
    playThump(t + 0.22, 65, 0.55);
  }

  playCodeBlue() {
    this.init();
    const t = this.ctx.currentTime;
    [0, 0.18, 0.36].forEach((offset) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t + offset);

      gain.gain.setValueAtTime(0.0001, t + offset);
      gain.gain.linearRampToValueAtTime(0.2, t + offset + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + offset);
      osc.stop(t + offset + 0.14);
    });
  }

  playVinylScratch() {
    this.init();
    const t = this.ctx.currentTime;
    const dur = 0.22;
    const bSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, t);
    filter.frequency.exponentialRampToValueAtTime(2400, t + 0.1);
    filter.frequency.exponentialRampToValueAtTime(500, t + dur);
    filter.Q.value = 3.5;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
    noise.stop(t + dur + 0.01);
  }

  playPartyHorn() {
    this.init();
    const t = this.ctx.currentTime;
    const chords = [523.25, 659.25, 783.99];
    chords.forEach(f => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.48);
    });
  }

  playCanteenBell() {
    this.init();
    const t = this.ctx.currentTime;
    const freqs = [1046.5, 2093.0];
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.25 / (idx + 1), t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 1.25);
    });
  }

  playGaitondeStab() {
    this.init();
    const t = this.ctx.currentTime;
    const freqs = [146.83, 220.00, 293.66, 349.23];
    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, t);
      filter.frequency.exponentialRampToValueAtTime(400, t + 0.35);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.42);
    });
  }

  playActivaSkid() {
    this.init();
    const t = this.ctx.currentTime;
    const bSize = Math.floor(this.ctx.sampleRate * 0.35);
    const buffer = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, t);
    filter.frequency.exponentialRampToValueAtTime(600, t + 0.32);
    filter.Q.value = 4.5;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
    noise.stop(t + 0.36);

    setTimeout(() => {
      if (this.ctx) this.playHeartbeat();
    }, 240);
  }

  playFanfare() {
    this.init();
    const notes = [
      { f: 523.25, d: 0.25, pause: 0.28 },
      { f: 659.25, d: 0.25, pause: 0.28 },
      { f: 783.99, d: 0.35, pause: 0.38 },
      { f: 1046.50, d: 0.8, pause: 0.9 }
    ];
    let timeAcc = 0;
    notes.forEach(n => {
      setTimeout(() => {
        this.playRhodesNote(n.f, n.d * 1.5, 0.45);
      }, timeAcc * 1000);
      timeAcc += n.pause;
    });
  }

  // Synthesizer Fallback Mode (Soothing Neo-Soul chords)
  startSynthMode(trackIndex) {
    const progression = [
      { root: 87.31, chord: [220.00, 261.63, 329.63, 392.00] }, // Fmaj9
      { root: 73.42, chord: [174.61, 220.00, 261.63, 329.63] }, // Dm9
      { root: 98.00, chord: [233.08, 293.66, 349.23, 440.00] }, // Gm9
      { root: 65.41, chord: [233.08, 277.18, 329.63, 440.00] }  // C13b9
    ];

    let bar = 0;
    const loop = () => {
      if (!this.isPlaying) return;
      const cur = progression[bar % progression.length];
      const now = this.ctx ? this.ctx.currentTime : 0;

      cur.chord.forEach((note, idx) => {
        this.playRhodesNote(note, 2.0, 0.3, now + idx * 0.06);
      });

      bar++;
      this.loopTimer = setTimeout(loop, 2200);
    };

    loop();
  }

  // ===================================================
  // CANVAS AUDIO VISUALIZER
  // ===================================================

  bindVisualizer(canvasElement) {
    this.visualizerCanvas = canvasElement;
    this.visualizerCtx = canvasElement.getContext('2d');
    this.renderVisualizer();
  }

  renderVisualizer() {
    if (!this.visualizerCanvas || !this.visualizerCtx) return;

    const render = () => {
      this.animFrameId = requestAnimationFrame(render);
      const width = this.visualizerCanvas.width;
      const height = this.visualizerCanvas.height;
      const ctx = this.visualizerCtx;

      ctx.clearRect(0, 0, width, height);

      if (!this.analyser || !this.isPlaying) {
        // Delicate, peaceful resting sine wave
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.35)';
        ctx.lineWidth = 2;
        const time = Date.now() * 0.0025;
        for (let x = 0; x < width; x += 4) {
          const y = height / 2 + Math.sin(x * 0.035 + time) * 5;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        return;
      }

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      this.analyser.getByteFrequencyData(dataArray);

      const barWidth = (width / bufferLength) * 2.2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.95;

        const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
        grad.addColorStop(0, '#00f2fe');
        grad.addColorStop(0.5, '#4facfe');
        grad.addColorStop(1, '#ff007f');

        ctx.fillStyle = grad;
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, height - barHeight - 2, barWidth - 1, 2);

        x += barWidth + 1;
        if (x > width) break;
      }
    };

    render();
  }
}

// Global audio engine instance
window.kdAudio = new KDAudioEngine();
