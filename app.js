// ===================================================
// KRUNAL DESAI — PURE AESTHETIC SCROLL REEL LOGIC
// By Vedant for Krunal • Uncropped Looping Media
// Silky Scroll Snap & Clair de Lune Auto-Start Music
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

    // Restore soothing Clair de Lune if we scrolled away from an unmuted video
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

// --- 4. Soothing Clair de Lune Ambient Music Engine (Auto-Start) ---
let bgMusicAudio = null;
let isBgMusicPlaying = false;

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

function initSoothingBackgroundMusic() {
  const musicBtn = document.getElementById('bg-music-btn');
  bgMusicAudio = document.getElementById('bg-music-audio') || new Audio('assets/audio/clair_de_lune.mp3');
  bgMusicAudio.loop = true;
  bgMusicAudio.volume = 0.45;

  function setPlayState(playing) {
    isBgMusicPlaying = playing;
    if (musicBtn) {
      if (playing) musicBtn.classList.add('playing');
      else musicBtn.classList.remove('playing');
    }
  }

  function startMusic(fade = false) {
    if (fade) bgMusicAudio.volume = 0;
    const playPromise = bgMusicAudio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        setPlayState(true);
        if (fade) fadeAudio(bgMusicAudio, 0.45, 1200);
        else bgMusicAudio.volume = 0.45;
      }).catch(err => {
        // Will be triggered automatically on first gesture below
      });
    }
  }

  function togglePlayPause() {
    if (bgMusicAudio.paused) {
      startMusic(false);
    } else {
      bgMusicAudio.pause();
      setPlayState(false);
    }
  }

  if (musicBtn) {
    musicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlayPause();
    });
  }

  // 1. ATTEMPT IMMEDIATE AUTOPLAY ON PAGE LOAD
  startMusic(false);

  // 2. FOOLPROOF AUTO-START: UNLOCK ON ANY FIRST TOUCH / SCROLL / GESTURE
  const autoStartOnGesture = () => {
    if (bgMusicAudio.paused) {
      startMusic(true);
    }
    const events = ['pointerdown', 'touchstart', 'touchend', 'scroll', 'wheel', 'keydown', 'click', 'mousemove'];
    events.forEach(evt => {
      window.removeEventListener(evt, autoStartOnGesture, { capture: true });
    });
  };

  const events = ['pointerdown', 'touchstart', 'touchend', 'scroll', 'wheel', 'keydown', 'click', 'mousemove'];
  events.forEach(evt => {
    window.addEventListener(evt, autoStartOnGesture, { capture: true, once: true });
  });

  // Audio ducking for looping videos
  window.duckBackgroundMusic = function() {
    if (bgMusicAudio && !bgMusicAudio.paused) {
      fadeAudio(bgMusicAudio, 0.05, 400);
    }
  };

  window.restoreBackgroundMusic = function() {
    if (bgMusicAudio && !bgMusicAudio.paused) {
      fadeAudio(bgMusicAudio, 0.45, 600);
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

// --- 10. Candle Blowout Ritual & Toast ---
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

      if (window.triggerConfetti) {
        window.triggerConfetti(90);
      }

      blowBtn.innerHTML = "<span>Wish Sent to KD ✨</span>";
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
