// ===================================================
// KRUNAL DESAI — PURE AESTHETIC SCROLL REEL LOGIC
// By Vedant for Krunal • Uncropped Looping Media
// Silky Scroll Snap & KD's Music Journey Suite
// ===================================================

document.addEventListener('DOMContentLoaded', () => {
  try { initAestheticScrolly(); } catch (e) { console.warn("Scrolly init:", e); }
  try { initStorySegments(); } catch (e) { console.warn("Story segments init:", e); }
  try { initKeyboardNavigation(); } catch (e) { console.warn("Keyboard nav init:", e); }
  try { initSoothingBackgroundMusic(); } catch (e) { console.warn("Music init:", e); }
  try { initCountdown(); } catch (e) { console.warn("Countdown init:", e); }
  try { initConfettiCanvas(); } catch (e) { console.warn("Confetti init:", e); }
  try { initVideoSoundToggles(); } catch (e) { console.warn("Sound toggles init:", e); }
  try { initHeartReactions(); } catch (e) { console.warn("Heart reactions init:", e); }
  try { initPhotoSwitcher(); } catch (e) { console.warn("Photo switcher init:", e); }
  try { initCandleBlow(); } catch (e) { console.warn("Candle init:", e); }
  try { initScrollInteractions(); } catch (e) { console.warn("Scroll init:", e); }
});

let currentActiveIndex = 0;

// --- 1. Silky Scroll-Snap Stories Observer ---
function initAestheticScrolly() {
  const slides = document.querySelectorAll('.story-slide');
  const chapterLabel = document.getElementById('chapter-label');

  if (!slides.length) return;

  function setActiveSlide(activeIndex, chapterName) {
    currentActiveIndex = activeIndex;

    slides.forEach((slide, idx) => {
      const isTarget = idx === activeIndex;
      const video = slide.querySelector('video');

      if (isTarget) {
        slide.classList.add('is-active');
        if (video) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              video.muted = true;
              video.play();
            });
          }
        }
      } else {
        slide.classList.remove('is-active');
        if (video) {
          video.pause();
          video.muted = true;
          const sBtn = slide.querySelector('.sound-toggle-btn');
          if (sBtn) {
            sBtn.classList.remove('active');
            const sIcon = sBtn.querySelector('.sound-icon');
            const sLabel = sBtn.querySelector('.sound-label');
            if (sIcon) sIcon.textContent = '🔇';
            if (sLabel) sLabel.textContent = 'Audio';
          }
        }
      }
    });

    // Restore soothing music if we scrolled away from an unmuted video
    if (window.restoreBackgroundMusic) {
      window.restoreBackgroundMusic();
    }

    if (chapterLabel && chapterName) {
      chapterLabel.textContent = chapterName;
    }

    updateStorySegments(activeIndex);
  }

  // IntersectionObserver tuned for scroll snap boundaries
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const slide = entry.target;
        const index = parseInt(slide.dataset.index, 10) || 0;
        const chapter = slide.dataset.chapter;
        setActiveSlide(index, chapter);
      }
    });
  }, {
    root: null,
    threshold: 0.55
  });

  slides.forEach(slide => observer.observe(slide));

  // Momentum scroll fallback for swift flicks
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const viewportCenter = window.innerHeight / 2;
        let closestIndex = 0;
        let minDistance = Infinity;

        slides.forEach((slide, idx) => {
          const rect = slide.getBoundingClientRect();
          const slideCenter = rect.top + rect.height / 2;
          const dist = Math.abs(viewportCenter - slideCenter);
          if (dist < minDistance) {
            minDistance = dist;
            closestIndex = idx;
          }
        });

        if (closestIndex !== currentActiveIndex) {
          const activeSlide = slides[closestIndex];
          if (activeSlide) {
            setActiveSlide(closestIndex, activeSlide.dataset.chapter);
          }
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// --- 2. Instagram / Apple Style Segmented Progress Tracker ---
function updateStorySegments(activeIndex) {
  const segmentTracks = document.querySelectorAll('.story-segment-track');
  if (!segmentTracks.length) return;

  segmentTracks.forEach((track, idx) => {
    track.classList.remove('completed', 'current');
    if (idx < activeIndex) {
      track.classList.add('completed');
    } else if (idx === activeIndex) {
      track.classList.add('current');
    }
  });
}

function initStorySegments() {
  const segmentTracks = document.querySelectorAll('.story-segment-track');
  const slides = document.querySelectorAll('.story-slide');

  segmentTracks.forEach(track => {
    track.addEventListener('click', () => {
      const stepIdx = parseInt(track.dataset.step, 10);
      if (slides[stepIdx]) {
        slides[stepIdx].scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// --- 3. Fluid Keyboard Navigation ---
function initKeyboardNavigation() {
  const slides = document.querySelectorAll('.story-slide');

  window.addEventListener('keydown', (e) => {
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
      if (currentActiveIndex < slides.length - 1) {
        e.preventDefault();
        slides[currentActiveIndex + 1].scrollIntoView({ behavior: 'smooth' });
      }
    } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
      if (currentActiveIndex > 0) {
        e.preventDefault();
        slides[currentActiveIndex - 1].scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
}

// --- 4. KD's Music Journey — Curated Sound Experience ---
let bgMusicAudio = null;
let isBgMusicPlaying = false;
let currentBgTrackIdx = 0;

const soothingTracks = [
  { title: "Clair de Lune", artist: "Claude Debussy • Serenity & Soul", file: "assets/audio/clair_de_lune.mp3", duration: "5:02" },
  { title: "Nocturne Op. 9 No. 2", artist: "Frédéric Chopin • Grand Piano Emotion", file: "assets/audio/chopin_nocturne.mp3", duration: "4:15" },
  { title: "Gymnopédie No. 1", artist: "Erik Satie • Late-Night Solitude", file: "assets/audio/gymnopedie_no1.mp3", duration: "3:08" },
  { title: "Moonlight Sonata", artist: "Ludwig van Beethoven • Deep Atmospheric Flow", file: "assets/audio/moonlight_sonata.mp3", duration: "5:20" },
  { title: "Happy Birthday Grand Piano", artist: "Acoustic Symphony • 28th October Celebration", file: "assets/audio/happy_birthday.mp3", duration: "2:21" }
];

function fadeAudio(audio, targetVol, durationMs = 800) {
  if (!audio) return;
  const startVol = audio.volume;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / durationMs);
    audio.volume = Math.max(0, Math.min(1, startVol + (targetVol - startVol) * progress));
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function initSoothingBackgroundMusic() {
  const musicBtn = document.getElementById('bg-music-btn');
  const musicTitleEl = document.getElementById('music-title');
  bgMusicAudio = document.getElementById('bg-music-audio') || new Audio(soothingTracks[0].file);
  bgMusicAudio.volume = 0.42;

  // Modal elements
  const modal = document.getElementById('music-journey-modal');
  const modalClose = document.getElementById('music-modal-close');
  const modalBackdrop = document.getElementById('music-modal-backdrop');
  const vinylDisc = document.getElementById('vinyl-disc');
  const modalTrackName = document.getElementById('modal-track-name');
  const modalTrackDesc = document.getElementById('modal-track-desc');
  const modalTimeCur = document.getElementById('modal-time-current');
  const modalTimeDur = document.getElementById('modal-time-duration');
  const modalProgressFill = document.getElementById('modal-progress-fill');
  const modalProgressTrack = document.getElementById('modal-progress-track');
  const ctrlPlayBtn = document.getElementById('ctrl-play-btn');
  const ctrlPlayIcon = document.getElementById('ctrl-play-icon');
  const ctrlPrevBtn = document.getElementById('ctrl-prev-btn');
  const ctrlNextBtn = document.getElementById('ctrl-next-btn');
  const playlistItems = document.querySelectorAll('.playlist-item');

  function updateUIForTrack(idx) {
    const track = soothingTracks[idx];
    if (!track) return;

    if (musicTitleEl) musicTitleEl.textContent = track.title;
    if (modalTrackName) modalTrackName.textContent = track.title;
    if (modalTrackDesc) modalTrackDesc.textContent = track.artist;
    if (modalTimeDur) modalTimeDur.textContent = track.duration;

    playlistItems.forEach((item, i) => {
      if (i === idx) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  function setPlayState(playing) {
    isBgMusicPlaying = playing;
    if (musicBtn) {
      if (playing) musicBtn.classList.add('playing');
      else musicBtn.classList.remove('playing');
    }
    if (vinylDisc) {
      if (playing) vinylDisc.classList.add('spinning');
      else vinylDisc.classList.remove('spinning');
    }
    if (ctrlPlayIcon) {
      ctrlPlayIcon.textContent = playing ? '❚❚' : '▶';
    }
  }

  function playTrack(idx, fade = false) {
    currentBgTrackIdx = idx;
    const track = soothingTracks[idx];
    bgMusicAudio.src = track.file;
    updateUIForTrack(idx);

    if (fade) bgMusicAudio.volume = 0;
    const playPromise = bgMusicAudio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        setPlayState(true);
        if (fade) fadeAudio(bgMusicAudio, 0.42, 1200);
        else bgMusicAudio.volume = 0.42;
      }).catch(err => {
        console.log("Autoplay waiting for user gesture:", err);
      });
    }
  }

  function togglePlayPause() {
    if (bgMusicAudio.paused) {
      bgMusicAudio.play().then(() => {
        setPlayState(true);
        bgMusicAudio.volume = 0.42;
      }).catch(() => {});
    } else {
      bgMusicAudio.pause();
      setPlayState(false);
    }
  }

  // Open / Close Modal
  function openModal() {
    if (modal) {
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  if (musicBtn) {
    musicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal();
      if (bgMusicAudio.paused) {
        playTrack(currentBgTrackIdx, true);
      }
    });
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // Controls
  if (ctrlPlayBtn) {
    ctrlPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlayPause();
    });
  }

  if (ctrlNextBtn) {
    ctrlNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const nextIdx = (currentBgTrackIdx + 1) % soothingTracks.length;
      playTrack(nextIdx, false);
    });
  }

  if (ctrlPrevBtn) {
    ctrlPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const prevIdx = (currentBgTrackIdx - 1 + soothingTracks.length) % soothingTracks.length;
      playTrack(prevIdx, false);
    });
  }

  // Playlist Items Click
  playlistItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
      playTrack(idx, false);
    });
  });

  // Track progress & scrubber
  bgMusicAudio.addEventListener('timeupdate', () => {
    if (bgMusicAudio.duration) {
      const pct = (bgMusicAudio.currentTime / bgMusicAudio.duration) * 100;
      if (modalProgressFill) modalProgressFill.style.width = `${pct}%`;
      if (modalTimeCur) modalTimeCur.textContent = formatTime(bgMusicAudio.currentTime);
      if (modalTimeDur && !isNaN(bgMusicAudio.duration)) {
        modalTimeDur.textContent = formatTime(bgMusicAudio.duration);
      }
    }
  });

  if (modalProgressTrack) {
    modalProgressTrack.addEventListener('click', (e) => {
      const rect = modalProgressTrack.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      if (bgMusicAudio.duration) {
        bgMusicAudio.currentTime = pct * bgMusicAudio.duration;
      }
    });
  }

  // Auto-advance when piece finishes
  bgMusicAudio.addEventListener('ended', () => {
    const nextIdx = (currentBgTrackIdx + 1) % soothingTracks.length;
    playTrack(nextIdx, false);
  });

  // Autoplay unlock upon first user interaction
  const unlockAudio = () => {
    if (bgMusicAudio.paused && !isBgMusicPlaying) {
      playTrack(0, true);
    }
    ['click', 'touchstart', 'scroll', 'keydown'].forEach(evt => {
      window.removeEventListener(evt, unlockAudio, { capture: true });
    });
  };

  ['click', 'touchstart', 'scroll', 'keydown'].forEach(evt => {
    window.addEventListener(evt, unlockAudio, { capture: true, once: true });
  });

  // Export functions globally
  window.playTrack = playTrack;
  window.openMusicJourney = openModal;

  window.duckBackgroundMusic = function() {
    if (bgMusicAudio && !bgMusicAudio.paused) {
      fadeAudio(bgMusicAudio, 0.05, 400);
    }
  };

  window.restoreBackgroundMusic = function() {
    if (bgMusicAudio && !bgMusicAudio.paused) {
      fadeAudio(bgMusicAudio, 0.42, 700);
    }
  };
}

// --- 5. Video Sound Toggle with Equalizer Wave ---
function initVideoSoundToggles() {
  const toggleBtns = document.querySelectorAll('.sound-toggle-btn');

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const videoId = btn.dataset.video;
      const video = document.getElementById(videoId);
      if (!video) return;

      const soundIcon = btn.querySelector('.sound-icon');
      const soundLabel = btn.querySelector('.sound-label');

      if (video.muted) {
        video.muted = false;
        btn.classList.add('active');
        if (soundIcon) soundIcon.textContent = '🔊';
        if (soundLabel) soundLabel.textContent = 'Audio ON';
        if (window.duckBackgroundMusic) window.duckBackgroundMusic();
        if (window.triggerConfetti) window.triggerConfetti(25);
      } else {
        video.muted = true;
        btn.classList.remove('active');
        if (soundIcon) soundIcon.textContent = '🔇';
        if (soundLabel) soundLabel.textContent = 'Audio';
        if (window.restoreBackgroundMusic) window.restoreBackgroundMusic();
      }
    });
  });
}

// --- 6. Interactive Heart Burst Reaction Physics & Double-Tap ---
function initHeartReactions() {
  const heartBtn = document.getElementById('floating-heart-btn');
  const counterEl = document.getElementById('heart-counter');
  let count = 28; // KD's birthday date starting count

  const emojis = ['❤️', '💖', '✨', '👑', '🎂', '🔥', '⚡', '🎵', '🎹'];

  function spawnHeart(clientX, clientY) {
    count++;
    if (counterEl) {
      counterEl.textContent = count;
    }

    if (heartBtn) {
      heartBtn.classList.remove('bouncing');
      void heartBtn.offsetWidth; // Trigger reflow
      heartBtn.classList.add('bouncing');
      setTimeout(() => heartBtn.classList.remove('bouncing'), 200);
    }

    const particleCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < particleCount; i++) {
      const heart = document.createElement('div');
      heart.className = 'burst-heart-particle';
      heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];

      const x = clientX || (window.innerWidth * 0.15);
      const y = clientY || (window.innerHeight - 50);

      const driftX = (Math.random() - 0.5) * 80;
      const rot = (Math.random() - 0.5) * 45;

      heart.style.left = `${x}px`;
      heart.style.top = `${y}px`;
      heart.style.setProperty('--drift-x', `${driftX}px`);
      heart.style.setProperty('--rot', `${rot}deg`);

      document.body.appendChild(heart);

      heart.addEventListener('animationend', () => {
        heart.remove();
      });
    }

    if (count % 10 === 0 && window.triggerConfetti) {
      window.triggerConfetti(35);
    }

    if (navigator.vibrate) {
      try { navigator.vibrate([15, 25, 15]); } catch (e) {}
    }
  }

  if (heartBtn) {
    heartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = heartBtn.getBoundingClientRect();
      spawnHeart(rect.left + rect.width / 2, rect.top);
    });
  }

  // Double tap anywhere on screen to send love
  let lastTapTime = 0;
  window.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;
    if (tapLength < 350 && tapLength > 0) {
      const touch = e.changedTouches[0];
      if (touch) {
        spawnHeart(touch.clientX, touch.clientY);
      }
      e.preventDefault();
    }
    lastTapTime = currentTime;
  }, { passive: false });
}

// --- 7. Minimal Photo Switcher (Swaps Uncropped Real Photos) ---
function initPhotoSwitcher() {
  const pills = document.querySelectorAll('.minimal-pill-btn');
  const peaceMainImg = document.getElementById('peace-main-img');
  const peaceBlurBg = document.getElementById('peace-blur-bg');

  if (!pills.length || !peaceMainImg) return;

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const newSrc = pill.dataset.img;
      if (!newSrc) return;

      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      peaceMainImg.style.opacity = '0';
      peaceMainImg.style.transform = 'scale(1.05)';

      setTimeout(() => {
        peaceMainImg.src = newSrc;
        if (peaceBlurBg) {
          peaceBlurBg.style.backgroundImage = `url('${newSrc}')`;
        }
        peaceMainImg.style.opacity = '1';
        peaceMainImg.style.transform = 'scale(1.0)';
      }, 200);
    });
  });
}

// --- 8. Live Countdown to October 28th ---
function initCountdown() {
  const daysEl = document.getElementById('count-days');
  const hoursEl = document.getElementById('count-hours');
  const minsEl = document.getElementById('count-mins');
  const secsEl = document.getElementById('count-secs');
  const badgeEl = document.getElementById('bday-badge');

  function update() {
    const now = new Date();
    const currentYear = now.getFullYear();
    let target = new Date(currentYear, 9, 28, 0, 0, 0); // Month 9 = October

    if (now > new Date(currentYear, 9, 28, 23, 59, 59)) {
      target = new Date(currentYear + 1, 9, 28, 0, 0, 0);
    }

    const isToday = now.getDate() === 28 && now.getMonth() === 9;

    if (isToday) {
      if (badgeEl) {
        badgeEl.textContent = "TODAY IS KD's BIRTHDAY ✨";
      }
      if (daysEl) daysEl.innerText = "00";
      if (hoursEl) hoursEl.innerText = "00";
      if (minsEl) minsEl.innerText = "00";
      if (secsEl) secsEl.innerText = "00";
      return;
    }

    const diff = target - now;
    if (diff <= 0) {
      if (daysEl) daysEl.innerText = "00";
      if (hoursEl) hoursEl.innerText = "00";
      if (minsEl) minsEl.innerText = "00";
      if (secsEl) secsEl.innerText = "00";
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    if (daysEl) daysEl.innerText = String(d).padStart(2, '0');
    if (hoursEl) hoursEl.innerText = String(h).padStart(2, '0');
    if (minsEl) minsEl.innerText = String(m).padStart(2, '0');
    if (secsEl) secsEl.innerText = String(s).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// --- 9. Luxury Gold Confetti Particle Canvas ---
function initConfettiCanvas() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth || 800);
  let height = (canvas.height = window.innerHeight || 600);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth || 800;
    height = canvas.height = window.innerHeight || 600;
  });

  const particles = [];
  const colors = ['#d4af37', '#fceda1', '#c5a059', '#ffffff', '#e0c068'];

  function createParticle() {
    return {
      x: Math.random() * width,
      y: -20,
      size: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 2.2 + 1.2,
      speedX: (Math.random() - 0.5) * 1.8,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 2.5,
      opacity: Math.random() * 0.7 + 0.3
    };
  }

  window.triggerConfetti = function(count = 50) {
    for (let i = 0; i < count; i++) {
      particles.push(createParticle());
    }
  };

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      ctx.restore();

      if (p.y > height + 20) {
        particles.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

// --- 10. Candle Blowout Ritual & Birthday Symphony Toast ---
function initCandleBlow() {
  const blowBtn = document.getElementById('blow-candles-btn');
  const flame = document.getElementById('main-flame');
  const toast = document.getElementById('secret-birthday-letter');

  if (blowBtn) {
    blowBtn.addEventListener('click', () => {
      if (flame) flame.classList.add('extinguished');
      if (toast) {
        toast.classList.remove('hidden');
        toast.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Grand celebration: queue Track 4 (Happy Birthday Grand Piano) & fire confetti
      if (window.playTrack) {
        window.playTrack(4, true);
      }
      if (window.triggerConfetti) {
        window.triggerConfetti(90);
      }

      blowBtn.innerHTML = "<span>Wish Sent to KD 🎼✨</span>";
      blowBtn.style.opacity = '0.88';
      blowBtn.style.pointerEvents = 'none';

      if (navigator.vibrate) {
        try { navigator.vibrate([30, 50, 30, 80]); } catch (e) {}
      }
    });
  }
}

// --- 11. Scroll Progress Line & Back to Top ---
function initScrollInteractions() {
  const progressBar = document.getElementById('scroll-progress');
  const scrollTopBtn = document.getElementById('scroll-top-btn');

  const onScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = `${Math.min(100, pct)}%`;
    }

    if (scrollTopBtn) {
      if (scrollTop > 450) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
