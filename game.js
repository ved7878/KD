// MBBS Intern Shift Survivor - Dr. KD Birthday Mini-Game
class KDInternGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width = 480;
    this.height = this.canvas.height = 360;

    this.player = {
      x: this.width / 2 - 25,
      y: this.height - 60,
      width: 50,
      height: 50,
      speed: 7,
      isMovingLeft: false,
      isMovingRight: false
    };

    this.items = [];
    this.score = 0;
    this.lives = 3;
    this.isRunning = false;
    this.gameOver = false;
    this.gameWon = false;
    this.spawnTimer = 0;
    this.highScore = parseInt(localStorage.getItem('kd_game_high') || '0', 10);

    this.goodTypes = [
      { char: '☕', name: 'Canteen Chai', pts: 10, color: '#f59e0b' },
      { char: '🎧', name: 'Beats', pts: 15, color: '#38bdf8' },
      { char: '🎂', name: 'Birthday Cake', pts: 25, color: '#ec4899' },
      { char: '🩺', name: 'Stethoscope', pts: 10, color: '#10b981' },
      { char: '💤', name: 'Power Nap', pts: 20, color: '#a855f7' }
    ];

    this.badTypes = [
      { char: '👴', name: 'Angry GCS Consultant', pts: -1, color: '#ef4444' },
      { char: '📋', name: '36-Hr Night Duty Roster', pts: -1, color: '#dc2626' },
      { char: '⏰', name: '6 AM Round Alarm', pts: -1, color: '#f97316' },
      { char: '🛵', name: 'Wobbly Activa Crash feat. Miky', pts: -1, color: '#f59e0b', isActiva: true }
    ];

    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (!this.isRunning) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.player.isMovingLeft = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.player.isMovingRight = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.player.isMovingLeft = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.player.isMovingRight = false;
      }
    });

    // Direct iOS Canvas Touch Drag (iPhone & iPad optimized)
    const handleCanvasTouch = (e) => {
      if (!this.isRunning) return;
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const touchX = ((touch.clientX - rect.left) / rect.width) * this.width;
      this.player.x = Math.max(5, Math.min(this.width - this.player.width - 5, touchX - this.player.width / 2));
    };

    this.canvas.addEventListener('touchstart', handleCanvasTouch, { passive: false });
    this.canvas.addEventListener('touchmove', handleCanvasTouch, { passive: false });

    // Touch button controls for mobile
    const leftBtn = document.getElementById('game-left-btn');
    const rightBtn = document.getElementById('game-right-btn');
    if (leftBtn && rightBtn) {
      const handleLeftStart = (e) => { e.preventDefault(); this.player.isMovingLeft = true; };
      const handleLeftEnd = (e) => { e.preventDefault(); this.player.isMovingLeft = false; };
      const handleRightStart = (e) => { e.preventDefault(); this.player.isMovingRight = true; };
      const handleRightEnd = (e) => { e.preventDefault(); this.player.isMovingRight = false; };

      leftBtn.addEventListener('touchstart', handleLeftStart, { passive: false });
      leftBtn.addEventListener('touchend', handleLeftEnd, { passive: false });
      leftBtn.addEventListener('mousedown', handleLeftStart);
      leftBtn.addEventListener('mouseup', handleLeftEnd);

      rightBtn.addEventListener('touchstart', handleRightStart, { passive: false });
      rightBtn.addEventListener('touchend', handleRightEnd, { passive: false });
      rightBtn.addEventListener('mousedown', handleRightStart);
      rightBtn.addEventListener('mouseup', handleRightEnd);
    }
  }

  start() {
    this.score = 0;
    this.lives = 3;
    this.items = [];
    this.isRunning = true;
    this.gameOver = false;
    this.gameWon = false;
    this.player.x = this.width / 2 - 25;
    this.spawnTimer = 0;

    if (window.kdAudio) {
      window.kdAudio.playHeartbeat();
    }

    this.loop();
  }

  spawnItem() {
    const isBad = Math.random() < 0.38;
    const pool = isBad ? this.badTypes : this.goodTypes;
    const type = pool[Math.floor(Math.random() * pool.length)];

    this.items.push({
      x: Math.random() * (this.width - 40) + 10,
      y: -30,
      size: 32,
      speed: 2.2 + Math.random() * 2.2,
      isBad: isBad,
      ...type
    });
  }

  update() {
    // Player movement
    if (this.player.isMovingLeft && this.player.x > 5) {
      this.player.x -= this.player.speed;
    }
    if (this.player.isMovingRight && this.player.x < this.width - this.player.width - 5) {
      this.player.x += this.player.speed;
    }

    // Spawn items
    this.spawnTimer++;
    if (this.spawnTimer > 35) {
      this.spawnItem();
      this.spawnTimer = 0;
    }

    // Update items & collisions
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      it.y += it.speed;

      // Check collision with player
      const hitX = it.x + it.size / 2 >= this.player.x && it.x <= this.player.x + this.player.width;
      const hitY = it.y + it.size >= this.player.y && it.y <= this.player.y + this.player.height;

      if (hitX && hitY) {
        if (it.isBad) {
          this.lives--;
          if (window.kdAudio) {
            if (it.isActiva) {
              window.kdAudio.playActivaSkid();
            } else {
              window.kdAudio.playCodeBlue();
            }
          }
          if (this.lives <= 0) {
            this.gameOver = true;
            this.isRunning = false;
          }
        } else {
          this.score += it.pts;
          if (window.kdAudio) window.kdAudio.playCanteenBell();
          if (this.score >= 120 && !this.gameWon) {
            this.gameWon = true;
            this.isRunning = false;
            if (window.kdAudio) window.kdAudio.playFanfare();
            if (window.triggerConfetti) window.triggerConfetti();
          }
        }
        this.items.splice(i, 1);
        continue;
      }

      // Out of bounds
      if (it.y > this.height + 20) {
        this.items.splice(i, 1);
      }
    }

    // Save high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('kd_game_high', this.highScore.toString());
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Background hospital ward grid
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Floor line
    this.ctx.strokeStyle = 'rgba(0, 242, 254, 0.2)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height - 10);
    this.ctx.lineTo(this.width, this.height - 10);
    this.ctx.stroke();

    // Draw Falling items
    for (const it of this.items) {
      this.ctx.font = '26px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(it.char, it.x + it.size / 2, it.y + it.size / 2);
    }

    // Draw Player (Dr. KD with scrubs & headphones)
    const px = this.player.x;
    const py = this.player.y;

    // Scrub body
    this.ctx.fillStyle = '#00f2fe';
    this.ctx.beginPath();
    this.ctx.roundRect(px + 8, py + 18, 34, 28, [4, 4, 8, 8]);
    this.ctx.fill();

    // Stethoscope around neck
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(px + 25, py + 22, 11, 0, Math.PI);
    this.ctx.stroke();

    // Head
    this.ctx.fillStyle = '#fbcfe8';
    this.ctx.beginPath();
    this.ctx.arc(px + 25, py + 12, 12, 0, Math.PI * 2);
    this.ctx.fill();

    // Cool DJ Headphones
    this.ctx.strokeStyle = '#ec4899';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.arc(px + 25, py + 12, 14, Math.PI, 0);
    this.ctx.stroke();
    // Earcups
    this.ctx.fillStyle = '#ec4899';
    this.ctx.fillRect(px + 9, py + 7, 5, 10);
    this.ctx.fillRect(px + 36, py + 7, 5, 10);

    // Smile & glasses
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(px + 18, py + 10, 4, 3);
    this.ctx.fillRect(px + 28, py + 10, 4, 3);
    this.ctx.strokeStyle = '#1e293b';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.arc(px + 25, py + 15, 4, 0, Math.PI);
    this.ctx.stroke();

    // Label: "Dr. KD"
    this.ctx.font = 'bold 10px sans-serif';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('DR. KD', px + 25, py + 54);

    // HUD Header (Score, Lives, Target)
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    this.ctx.fillRect(0, 0, this.width, 34);

    this.ctx.font = 'bold 14px "Space Grotesk", sans-serif';
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${this.score} / 120`, 14, 22);

    this.ctx.textAlign = 'center';
    let hearts = '';
    for (let l = 0; l < 3; l++) {
      hearts += l < this.lives ? '❤️ ' : '🖤 ';
    }
    this.ctx.fillText(hearts, this.width / 2, 22);

    this.ctx.textAlign = 'right';
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillText(`High: ${this.highScore}`, this.width - 14, 22);

    // Overlays
    if (!this.isRunning && !this.gameOver && !this.gameWon) {
      this.drawOverlay("DR. KD's SHIFT SURVIVOR", "Catch Chai ☕ & Cake 🎂, Dodge 36-Hr Duties 📋!", "Click 'Start Duty' to Play");
    } else if (this.gameOver) {
      this.drawOverlay("DUTY EXHAUSTION! 💤", `Final Score: ${this.score} pts`, "Click 'Try Again' to Revive Dr. KD!");
    } else if (this.gameWon) {
      this.drawOverlay("🎉 INTERNSHIP SURVIVED! 🎉", "Official 100% Birthday Clearance Approved!", "You are the Ultimate Legend, KD!");
    }
  }

  drawOverlay(title, subtitle, action) {
    this.ctx.fillStyle = 'rgba(11, 15, 25, 0.88)';
    this.ctx.fillRect(20, 45, this.width - 40, this.height - 70);

    this.ctx.strokeStyle = '#00f2fe';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(20, 45, this.width - 40, this.height - 70);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 20px "Space Grotesk", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(title, this.width / 2, 115);

    this.ctx.font = '14px sans-serif';
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillText(subtitle, this.width / 2, 155);

    this.ctx.font = 'bold 15px sans-serif';
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.fillText(action, this.width / 2, 205);
  }

  loop() {
    if (!this.isRunning) {
      this.draw();
      return;
    }
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
}

window.KDInternGame = KDInternGame;
