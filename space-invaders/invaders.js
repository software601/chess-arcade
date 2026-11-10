(() => {
  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const overlayEl = document.getElementById("overlay");
  const hintEl = document.getElementById("hint");
  const btnStart = document.getElementById("btn-start");
  const boardWrap = document.querySelector(".board-wrap");
  const scoreEl = document.getElementById("score");
  const livesEl = document.getElementById("lives");
  const waveEl = document.getElementById("wave");
  const speedVal = document.getElementById("val-speed");
  const livesVal = document.getElementById("val-lives");
  const rowsVal = document.getElementById("val-rows");
  const settingsEl = document.querySelector(".settings");

  const COLS = 11;
  const SCORES = [30, 20, 20, 10, 10];
  const COLORS = ["#ff6b8a", "#ffd45a", "#ffd45a", "#53e07a", "#53e07a"];

  let speed = 5;
  let startLives = 3;
  let alienRows = 5;

  let score = 0;
  let lives = 3;
  let wave = 1;
  let running = false;
  let started = false;
  let paused = false;
  let gameOver = false;
  let last = 0;

  let ship = null;
  let aliens = [];
  let bunkers = [];
  let playerShots = [];
  let enemyShots = [];
  let sparks = [];
  let stars = [];
  let dir = 1;
  let stepTimer = 0;
  let shootCooldown = 0;
  let invuln = 0;
  let keys = Object.create(null);
  let unit = 8;
  let anim = 0;

  function syncUI() {
    speedVal.textContent = String(speed);
    livesVal.textContent = String(startLives);
    rowsVal.textContent = String(alienRows);
    scoreEl.textContent = String(score);
    livesEl.textContent = String(lives);
    waveEl.textContent = String(wave);
    btnStart.textContent = started && !gameOver ? "Restart" : "Start";
  }

  function showOverlay(text) {
    overlayEl.hidden = false;
    overlayEl.textContent = text;
  }

  function hideOverlay() {
    overlayEl.hidden = true;
  }

  function fit() {
    const w = Math.max(320, Math.floor(boardWrap?.clientWidth || 720));
    const h = Math.max(360, Math.floor(boardWrap?.clientHeight || 640));
    canvas.width = w;
    canvas.height = h;
    unit = Math.max(5, Math.min(w / 56, h / 52));
    buildStars();
  }

  function buildStars() {
    stars = [];
    const n = Math.floor((canvas.width * canvas.height) / 11000);
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        a: 0.2 + Math.random() * 0.7,
      });
    }
  }

  function shipW() {
    return unit * 5;
  }
  function shipH() {
    return unit * 2.2;
  }
  function alienW() {
    return unit * 3.2;
  }
  function alienH() {
    return unit * 2.2;
  }

  function resetShip() {
    ship = {
      x: canvas.width / 2,
      y: canvas.height - unit * 4.5,
      w: shipW(),
      h: shipH(),
    };
    invuln = 1.4;
  }

  function spawnAliens() {
    aliens = [];
    const aw = alienW();
    const ah = alienH();
    const gapX = unit * 1.35;
    const gapY = unit * 1.15;
    const totalW = COLS * aw + (COLS - 1) * gapX;
    const startX = (canvas.width - totalW) / 2;
    const startY = unit * (3.5 + Math.min(2, wave - 1) * 0.4);
    const rows = alienRows;
    for (let r = 0; r < rows; r++) {
      const kind = Math.min(4, r);
      for (let c = 0; c < COLS; c++) {
        aliens.push({
          x: startX + c * (aw + gapX),
          y: startY + r * (ah + gapY),
          w: aw,
          h: ah,
          kind,
          alive: true,
        });
      }
    }
    dir = 1;
    stepTimer = 0;
  }

  function spawnBunkers() {
    bunkers = [];
    const count = 4;
    const bw = unit * 7;
    const bh = unit * 4;
    const span = canvas.width * 0.78;
    const left = (canvas.width - span) / 2;
    for (let i = 0; i < count; i++) {
      const bx = left + (i + 0.5) * (span / count) - bw / 2;
      const by = canvas.height - unit * 11;
      const cols = 7;
      const rows = 4;
      const bricks = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // carve an arch
          if (r >= 2 && c >= 2 && c <= 4) continue;
          bricks.push({
            x: bx + c * (bw / cols),
            y: by + r * (bh / rows),
            w: bw / cols - 1,
            h: bh / rows - 1,
            hp: 3,
          });
        }
      }
      bunkers.push(...bricks);
    }
  }

  function livingAliens() {
    return aliens.filter((a) => a.alive);
  }

  function stepInterval() {
    const alive = livingAliens().length;
    const total = Math.max(1, COLS * alienRows);
    const thin = 1 - alive / total;
    // fewer aliens → faster march
    return Math.max(0.08, (0.72 - speed * 0.035 - (wave - 1) * 0.03) * (1 - thin * 0.72));
  }

  function stepSize() {
    return unit * (0.55 + speed * 0.04);
  }

  function burst(x, y, n, color) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 40 + Math.random() * 140;
      sparks.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0.2 + Math.random() * 0.45,
        color,
      });
    }
  }

  function startGame() {
    fit();
    score = 0;
    lives = startLives;
    wave = 1;
    playerShots = [];
    enemyShots = [];
    sparks = [];
    shootCooldown = 0;
    gameOver = false;
    paused = false;
    started = true;
    running = true;
    resetShip();
    spawnAliens();
    spawnBunkers();
    hideOverlay();
    hintEl.textContent = "← → move · Space fire · bunkers block shots";
    syncUI();
    last = performance.now();
  }

  function nextWave() {
    wave += 1;
    playerShots = [];
    enemyShots = [];
    resetShip();
    spawnAliens();
    // soft-repair bunkers a bit
    for (const b of bunkers) {
      if (b.hp > 0 && b.hp < 3) b.hp = Math.min(3, b.hp + 1);
    }
    if (bunkers.every((b) => b.hp <= 0)) spawnBunkers();
    syncUI();
    showOverlay(`Wave ${wave}`);
    setTimeout(() => {
      if (running && !gameOver && !paused) hideOverlay();
    }, 900);
  }

  function killPlayer() {
    if (invuln > 0) return;
    burst(ship.x, ship.y, 22, "#53e07a");
    lives -= 1;
    syncUI();
    playerShots = [];
    enemyShots = [];
    if (lives <= 0) {
      gameOver = true;
      running = false;
      showOverlay(`Game Over\nScore ${score}\nEnter to retry`);
      hintEl.textContent = "Invaded · Start / Enter for a new run";
      return;
    }
    resetShip();
    showOverlay("Hit!");
    setTimeout(() => {
      if (running && !gameOver && !paused) hideOverlay();
    }, 700);
  }

  function firePlayer() {
    if (shootCooldown > 0 || playerShots.length >= 1) return;
    playerShots.push({
      x: ship.x,
      y: ship.y - ship.h / 2,
      w: Math.max(2, unit * 0.28),
      h: unit * 1.2,
      vy: -unit * 28,
    });
    shootCooldown = 0.28;
  }

  function maybeEnemyFire(dt) {
    const alive = livingAliens();
    if (!alive.length) return;
    // pick bottom-most alien per column
    const byCol = new Map();
    for (const a of alive) {
      const col = Math.round(a.x);
      const prev = byCol.get(col);
      if (!prev || a.y > prev.y) byCol.set(col, a);
    }
    const shooters = [...byCol.values()];
    const rate = (0.35 + speed * 0.08 + wave * 0.05) * dt;
    if (Math.random() > rate) return;
    if (enemyShots.length >= 4 + Math.floor(wave / 2)) return;
    const a = shooters[Math.floor(Math.random() * shooters.length)];
    enemyShots.push({
      x: a.x + a.w / 2,
      y: a.y + a.h,
      w: Math.max(2, unit * 0.32),
      h: unit * 1.1,
      vy: unit * (9 + speed * 0.6),
    });
  }

  function rectHit(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  function damageBunker(shot, fromPlayer) {
    for (let i = bunkers.length - 1; i >= 0; i--) {
      const b = bunkers[i];
      if (b.hp <= 0) continue;
      if (!rectHit(shot, b)) continue;
      b.hp -= 1;
      return true;
    }
    return false;
  }

  function marchAliens() {
    const alive = livingAliens();
    if (!alive.length) return;
    let minX = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const a of alive) {
      minX = Math.min(minX, a.x);
      maxX = Math.max(maxX, a.x + a.w);
      maxY = Math.max(maxY, a.y + a.h);
    }
    const margin = unit * 1.2;
    let drop = false;
    if (dir > 0 && maxX + stepSize() > canvas.width - margin) drop = true;
    if (dir < 0 && minX - stepSize() < margin) drop = true;

    if (drop) {
      dir *= -1;
      for (const a of alive) a.y += unit * 1.35;
      anim ^= 1;
    } else {
      for (const a of alive) a.x += dir * stepSize();
      anim ^= 1;
    }

    // invasion check
    const ground = ship.y - ship.h;
    for (const a of livingAliens()) {
      if (a.y + a.h >= ground) {
        gameOver = true;
        running = false;
        showOverlay(`Invaded!\nScore ${score}\nEnter to retry`);
        hintEl.textContent = "Aliens reached the ground";
        return;
      }
    }
  }

  function update(dt) {
    if (!running || paused || gameOver) return;

    shootCooldown = Math.max(0, shootCooldown - dt);
    if (invuln > 0) invuln -= dt;

    const move = unit * (22 + speed * 1.2);
    if (keys.left) ship.x -= move * dt;
    if (keys.right) ship.x += move * dt;
    ship.x = Math.max(ship.w / 2 + unit, Math.min(canvas.width - ship.w / 2 - unit, ship.x));
    if (keys.fire) firePlayer();

    stepTimer += dt;
    while (stepTimer >= stepInterval()) {
      stepTimer -= stepInterval();
      marchAliens();
      if (gameOver) return;
    }

    maybeEnemyFire(dt);

    for (let i = playerShots.length - 1; i >= 0; i--) {
      const s = playerShots[i];
      s.y += s.vy * dt;
      if (s.y + s.h < 0) {
        playerShots.splice(i, 1);
        continue;
      }
      if (damageBunker(s, true)) {
        playerShots.splice(i, 1);
        continue;
      }
      let hit = false;
      for (const a of aliens) {
        if (!a.alive) continue;
        if (rectHit({ x: s.x - s.w / 2, y: s.y, w: s.w, h: s.h }, a)) {
          a.alive = false;
          score += SCORES[a.kind] || 10;
          burst(a.x + a.w / 2, a.y + a.h / 2, 10, COLORS[a.kind]);
          playerShots.splice(i, 1);
          hit = true;
          syncUI();
          break;
        }
      }
      if (hit && livingAliens().length === 0) nextWave();
    }

    const shipBox = {
      x: ship.x - ship.w / 2,
      y: ship.y - ship.h / 2,
      w: ship.w,
      h: ship.h,
    };

    for (let i = enemyShots.length - 1; i >= 0; i--) {
      const s = enemyShots[i];
      s.y += s.vy * dt;
      if (s.y > canvas.height) {
        enemyShots.splice(i, 1);
        continue;
      }
      if (damageBunker(s, false)) {
        enemyShots.splice(i, 1);
        continue;
      }
      if (invuln <= 0 && rectHit(s, shipBox)) {
        enemyShots.splice(i, 1);
        killPlayer();
      }
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const sp = sparks[i];
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.life -= dt;
      if (sp.life <= 0) sparks.splice(i, 1);
    }
  }

  function drawAlien(a) {
    const { x, y, w, h, kind } = a;
    ctx.fillStyle = COLORS[kind];
    // body
    ctx.fillRect(x + w * 0.15, y + h * 0.25, w * 0.7, h * 0.45);
    // head dome / eyes
    if (kind === 0) {
      ctx.fillRect(x + w * 0.3, y + h * 0.08, w * 0.4, h * 0.25);
      ctx.fillRect(x + w * 0.18, y + h * 0.35, w * 0.15, h * 0.15);
      ctx.fillRect(x + w * 0.67, y + h * 0.35, w * 0.15, h * 0.15);
    } else {
      ctx.fillRect(x + w * 0.2, y + h * 0.1, w * 0.6, h * 0.25);
      ctx.fillStyle = "#030a06";
      ctx.fillRect(x + w * 0.28, y + h * 0.32, w * 0.14, h * 0.14);
      ctx.fillRect(x + w * 0.58, y + h * 0.32, w * 0.14, h * 0.14);
      ctx.fillStyle = COLORS[kind];
    }
    // legs — alternate with anim
    const leg = anim ? 0.08 : -0.08;
    ctx.fillRect(x + w * (0.2 + leg), y + h * 0.7, w * 0.16, h * 0.28);
    ctx.fillRect(x + w * (0.64 - leg), y + h * 0.7, w * 0.16, h * 0.28);
    ctx.fillRect(x + w * 0.42, y + h * 0.7, w * 0.16, h * 0.22);
  }

  function drawShip() {
    if (invuln > 0 && Math.floor(invuln * 10) % 2 === 0) return;
    const x = ship.x;
    const y = ship.y;
    const w = ship.w;
    const h = ship.h;
    ctx.fillStyle = "#53e07a";
    ctx.beginPath();
    ctx.moveTo(x, y - h / 2);
    ctx.lineTo(x + w / 2, y + h / 2);
    ctx.lineTo(x + w * 0.18, y + h * 0.25);
    ctx.lineTo(x - w * 0.18, y + h * 0.25);
    ctx.lineTo(x - w / 2, y + h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#c8ffd8";
    ctx.fillRect(x - w * 0.08, y - h * 0.15, w * 0.16, h * 0.35);
  }

  function draw() {
    ctx.fillStyle = "#030a06";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const s of stars) {
      ctx.fillStyle = `rgba(180, 255, 200, ${s.a})`;
      ctx.fillRect(s.x, s.y, 1.5, 1.5);
    }

    for (const b of bunkers) {
      if (b.hp <= 0) continue;
      const alpha = 0.35 + b.hp * 0.22;
      ctx.fillStyle = `rgba(83, 224, 122, ${alpha})`;
      ctx.fillRect(b.x, b.y, b.w, b.h);
    }

    for (const a of aliens) {
      if (a.alive) drawAlien(a);
    }

    ctx.fillStyle = "#c8ffd8";
    for (const s of playerShots) {
      ctx.fillRect(s.x - s.w / 2, s.y, s.w, s.h);
    }
    ctx.fillStyle = "#ff6b8a";
    for (const s of enemyShots) {
      ctx.fillRect(s.x - s.w / 2, s.y, s.w, s.h);
    }

    for (const sp of sparks) {
      ctx.globalAlpha = Math.max(0, sp.life * 2.2);
      ctx.fillStyle = sp.color;
      ctx.fillRect(sp.x, sp.y, 2, 2);
      ctx.globalAlpha = 1;
    }

    if (ship) drawShip();

    // ground line
    ctx.strokeStyle = "rgba(83, 224, 122, 0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(unit, canvas.height - unit * 2.2);
    ctx.lineTo(canvas.width - unit, canvas.height - unit * 2.2);
    ctx.stroke();

    if (paused && running) {
      ctx.fillStyle = "rgba(3, 10, 6, 0.45)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }

  settingsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".step-btn");
    if (!btn) return;
    const step = btn.closest(".step");
    const dirN = Number(btn.dataset.dir);
    const setting = step?.dataset.setting;
    if (setting === "speed") speed = Math.max(1, Math.min(10, speed + dirN));
    if (setting === "lives") startLives = Math.max(1, Math.min(9, startLives + dirN));
    if (setting === "rows") alienRows = Math.max(3, Math.min(6, alienRows + dirN));
    syncUI();
  });

  btnStart.addEventListener("click", () => startGame());

  window.addEventListener("keydown", (e) => {
    const k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") {
      keys.left = true;
      e.preventDefault();
    }
    if (k === "ArrowRight" || k === "d" || k === "D") {
      keys.right = true;
      e.preventDefault();
    }
    if (k === " " || k === "Spacebar") {
      keys.fire = true;
      e.preventDefault();
      if (running && !paused && !gameOver) firePlayer();
    }
    if (k === "Enter") {
      e.preventDefault();
      startGame();
    }
    if ((k === "p" || k === "P") && started && !gameOver) {
      paused = !paused;
      if (paused) showOverlay("Paused");
      else hideOverlay();
    }
  });

  window.addEventListener("keyup", (e) => {
    const k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") keys.left = false;
    if (k === "ArrowRight" || k === "d" || k === "D") keys.right = false;
    if (k === " " || k === "Spacebar") keys.fire = false;
  });

  window.addEventListener("resize", () => {
    const was = { w: canvas.width, h: canvas.height };
    fit();
    if (ship && was.w && was.h) {
      const sx = canvas.width / was.w;
      const sy = canvas.height / was.h;
      ship.x *= sx;
      ship.y = canvas.height - unit * 4.5;
      ship.w = shipW();
      ship.h = shipH();
      for (const a of aliens) {
        a.x *= sx;
        a.y *= sy;
        a.w = alienW();
        a.h = alienH();
      }
      for (const b of bunkers) {
        b.x *= sx;
        b.y *= sy;
        b.w *= sx;
        b.h *= sy;
      }
    }
    draw();
  });

  fit();
  syncUI();
  draw();
  requestAnimationFrame((t) => {
    last = t;
    requestAnimationFrame(frame);
  });
})();
