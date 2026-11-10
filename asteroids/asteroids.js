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
  const rocksVal = document.getElementById("val-rocks");
  const settingsEl = document.querySelector(".settings");

  const TAU = Math.PI * 2;
  const SHIP_R = 12;
  const BULLET_LIFE = 1.15;
  const MAX_BULLETS = 6;
  const INVULN = 2.2;

  const SIZE = {
    large: { r: 42, score: 20, next: "medium", kids: 2 },
    medium: { r: 24, score: 50, next: "small", kids: 2 },
    small: { r: 12, score: 100, next: null, kids: 0 },
  };

  let speed = 5;
  let startLives = 3;
  let startRocks = 4;

  let score = 0;
  let lives = 3;
  let wave = 1;
  let running = false;
  let started = false;
  let paused = false;
  let gameOver = false;
  let last = 0;

  let ship = null;
  let rocks = [];
  let bullets = [];
  let sparks = [];
  let stars = [];
  let shootCooldown = 0;
  let keys = Object.create(null);

  function syncUI() {
    speedVal.textContent = String(speed);
    livesVal.textContent = String(startLives);
    rocksVal.textContent = String(startRocks);
    scoreEl.textContent = String(score);
    livesEl.textContent = String(lives);
    waveEl.textContent = String(wave);
    btnStart.textContent = started && !gameOver ? "Restart" : "Start";
  }

  function fit() {
    const w = Math.max(320, Math.floor(boardWrap?.clientWidth || 800));
    const h = Math.max(280, Math.floor(boardWrap?.clientHeight || 600));
    if (canvas.width === w && canvas.height === h) return;
    const ox = canvas.width || w;
    const oy = canvas.height || h;
    canvas.width = w;
    canvas.height = h;
    scaleWorld(w / ox, h / oy);
    buildStars();
  }

  function scaleWorld(sx, sy) {
    if (!ship) return;
    ship.x *= sx;
    ship.y *= sy;
    ship.vx *= sx;
    ship.vy *= sy;
    for (const r of rocks) {
      r.x *= sx;
      r.y *= sy;
      r.vx *= sx;
      r.vy *= sy;
      r.r *= Math.min(sx, sy);
      for (const p of r.pts) {
        p.x *= Math.min(sx, sy);
        p.y *= Math.min(sx, sy);
      }
    }
    for (const b of bullets) {
      b.x *= sx;
      b.y *= sy;
      b.vx *= sx;
      b.vy *= sy;
    }
  }

  function buildStars() {
    stars = [];
    const n = Math.floor((canvas.width * canvas.height) / 9000);
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        a: 0.25 + Math.random() * 0.75,
        s: Math.random() < 0.15 ? 2 : 1,
      });
    }
  }

  function wrap(o) {
    const m = o.r || 0;
    if (o.x < -m) o.x = canvas.width + m;
    else if (o.x > canvas.width + m) o.x = -m;
    if (o.y < -m) o.y = canvas.height + m;
    else if (o.y > canvas.height + m) o.y = -m;
  }

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function rockSpeed() {
    // pixels / second
    return (42 + speed * 10 + (wave - 1) * 7) * (canvas.width / 800);
  }

  function makeRock(size, x, y, boost = 1) {
    const def = SIZE[size];
    const n = 7 + Math.floor(Math.random() * 5);
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const d = def.r * rand(0.62, 1.12);
      pts.push({ x: Math.cos(a) * d, y: Math.sin(a) * d });
    }
    const sp = rockSpeed() * boost * rand(0.7, 1.25);
    const ang = Math.random() * TAU;
    return {
      size,
      x,
      y,
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp,
      r: def.r,
      rot: Math.random() * TAU,
      spin: rand(-1.4, 1.4),
      pts,
    };
  }

  function spawnWave() {
    rocks = [];
    const count = startRocks + wave - 1;
    const margin = 90;
    for (let i = 0; i < count; i++) {
      let x;
      let y;
      let tries = 0;
      do {
        x = rand(0, canvas.width);
        y = rand(0, canvas.height);
        tries++;
      } while (
        tries < 40 &&
        Math.hypot(x - canvas.width / 2, y - canvas.height / 2) < 140
      );
      // Prefer edges
      if (Math.random() < 0.7) {
        const edge = Math.floor(Math.random() * 4);
        if (edge === 0) {
          x = rand(0, canvas.width);
          y = -margin;
        } else if (edge === 1) {
          x = canvas.width + margin;
          y = rand(0, canvas.height);
        } else if (edge === 2) {
          x = rand(0, canvas.width);
          y = canvas.height + margin;
        } else {
          x = -margin;
          y = rand(0, canvas.height);
        }
      }
      rocks.push(makeRock("large", x, y));
    }
  }

  function resetShip(safe = true) {
    ship = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: 0,
      vy: 0,
      a: -Math.PI / 2,
      r: SHIP_R,
      thrust: false,
      inv: safe ? INVULN : 0,
      alive: true,
    };
  }

  function burst(x, y, n, color) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU;
      const sp = rand(40, 180);
      sparks.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: rand(0.25, 0.7),
        color,
      });
    }
  }

  function showOverlay(text) {
    overlayEl.hidden = false;
    overlayEl.textContent = text;
  }

  function hideOverlay() {
    overlayEl.hidden = true;
  }

  function startGame() {
    fit();
    score = 0;
    lives = startLives;
    wave = 1;
    bullets = [];
    sparks = [];
    shootCooldown = 0;
    gameOver = false;
    paused = false;
    started = true;
    running = true;
    resetShip(true);
    spawnWave();
    hideOverlay();
    hintEl.textContent = "← → rotate · ↑ thrust · Space fire · H jump · P pause";
    syncUI();
    last = performance.now();
  }

  function nextWave() {
    wave += 1;
    bullets = [];
    resetShip(true);
    spawnWave();
    syncUI();
    showOverlay(`Wave ${wave}`);
    setTimeout(() => {
      if (running && !gameOver && !paused) hideOverlay();
    }, 900);
  }

  function killShip() {
    if (!ship.alive || ship.inv > 0) return;
    burst(ship.x, ship.y, 28, "#7ec8ff");
    ship.alive = false;
    lives -= 1;
    syncUI();
    if (lives <= 0) {
      gameOver = true;
      running = false;
      showOverlay(`Game Over\nScore ${score}\nEnter to retry`);
      hintEl.textContent = "Out of lives · Start / Enter for a new run";
      syncUI();
      return;
    }
    setTimeout(() => {
      if (!started || gameOver) return;
      bullets = [];
      resetShip(true);
      hideOverlay();
    }, 900);
    showOverlay("Crash!");
  }

  function splitRock(rock, i) {
    const def = SIZE[rock.size];
    score += def.score;
    burst(rock.x, rock.y, 10 + def.r / 3, "#e8eef4");
    rocks.splice(i, 1);
    if (def.next) {
      for (let k = 0; k < def.kids; k++) {
        rocks.push(makeRock(def.next, rock.x, rock.y, 1.15));
      }
    }
    syncUI();
    if (rocks.length === 0) nextWave();
  }

  function fire() {
    if (!ship?.alive) return;
    if (shootCooldown > 0 || bullets.length >= MAX_BULLETS) return;
    const muzzle = SHIP_R + 2;
    const spd = (320 + speed * 18) * (canvas.width / 800);
    bullets.push({
      x: ship.x + Math.cos(ship.a) * muzzle,
      y: ship.y + Math.sin(ship.a) * muzzle,
      vx: Math.cos(ship.a) * spd + ship.vx * 0.35,
      vy: Math.sin(ship.a) * spd + ship.vy * 0.35,
      life: BULLET_LIFE,
      r: 2,
    });
    shootCooldown = 0.18;
  }

  function hyperspace() {
    if (!ship?.alive) return;
    burst(ship.x, ship.y, 12, "#7ec8ff");
    ship.x = rand(40, canvas.width - 40);
    ship.y = rand(40, canvas.height - 40);
    ship.vx = 0;
    ship.vy = 0;
    ship.inv = Math.max(ship.inv, 1.1);
    // 12% chance to land on a rock → instant death
    for (const r of rocks) {
      if (Math.hypot(ship.x - r.x, ship.y - r.y) < r.r + ship.r) {
        ship.inv = 0;
        killShip();
        return;
      }
    }
  }

  function hit(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r;
  }

  function update(dt) {
    if (!running || paused || gameOver) return;

    shootCooldown = Math.max(0, shootCooldown - dt);

    if (ship.alive) {
      if (keys.left) ship.a -= 3.6 * dt;
      if (keys.right) ship.a += 3.6 * dt;
      ship.thrust = !!(keys.up);
      if (ship.thrust) {
        const thrust = (145 + speed * 12) * (canvas.width / 800);
        ship.vx += Math.cos(ship.a) * thrust * dt;
        ship.vy += Math.sin(ship.a) * thrust * dt;
      }
      // light drag so the ship keeps coasting
      const drag = Math.exp(-0.55 * dt);
      ship.vx *= drag;
      ship.vy *= drag;
      // soft speed cap
      const maxV = (280 + speed * 20) * (canvas.width / 800);
      const v = Math.hypot(ship.vx, ship.vy);
      if (v > maxV) {
        ship.vx = (ship.vx / v) * maxV;
        ship.vy = (ship.vy / v) * maxV;
      }
      ship.x += ship.vx * dt;
      ship.y += ship.vy * dt;
      wrap(ship);
      if (ship.inv > 0) ship.inv -= dt;

      if (keys.fire) fire();

      if (ship.inv <= 0) {
        for (const r of rocks) {
          if (hit(ship, r)) {
            killShip();
            break;
          }
        }
      }
    }

    for (let i = rocks.length - 1; i >= 0; i--) {
      const r = rocks[i];
      r.x += r.vx * dt;
      r.y += r.vy * dt;
      r.rot += r.spin * dt;
      wrap(r);
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      wrap(b);
      if (b.life <= 0) {
        bullets.splice(i, 1);
        continue;
      }
      let hitRock = false;
      for (let j = rocks.length - 1; j >= 0; j--) {
        if (hit(b, rocks[j])) {
          splitRock(rocks[j], j);
          bullets.splice(i, 1);
          hitRock = true;
          break;
        }
      }
      if (hitRock) continue;
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
      if (s.life <= 0) sparks.splice(i, 1);
    }
  }

  function drawShip() {
    if (!ship?.alive) return;
    if (ship.inv > 0 && Math.floor(ship.inv * 12) % 2 === 0) return;
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.a);
    ctx.strokeStyle = "#7ec8ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(SHIP_R, 0);
    ctx.lineTo(-SHIP_R * 0.85, SHIP_R * 0.7);
    ctx.lineTo(-SHIP_R * 0.5, 0);
    ctx.lineTo(-SHIP_R * 0.85, -SHIP_R * 0.7);
    ctx.closePath();
    ctx.stroke();
    if (ship.thrust) {
      ctx.strokeStyle = "#ffb45a";
      ctx.beginPath();
      ctx.moveTo(-SHIP_R * 0.55, SHIP_R * 0.35);
      ctx.lineTo(-SHIP_R * (1.15 + Math.random() * 0.35), 0);
      ctx.lineTo(-SHIP_R * 0.55, -SHIP_R * 0.35);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawRock(r) {
    ctx.save();
    ctx.translate(r.x, r.y);
    ctx.rotate(r.rot);
    ctx.strokeStyle = "#e8eef4";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < r.pts.length; i++) {
      const p = r.pts[i];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  function draw() {
    ctx.fillStyle = "#02060c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const s of stars) {
      ctx.fillStyle = `rgba(200, 220, 255, ${s.a})`;
      ctx.fillRect(s.x, s.y, s.s, s.s);
    }

    for (const r of rocks) drawRock(r);

    ctx.fillStyle = "#fff6c8";
    for (const b of bullets) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 2.2, 0, TAU);
      ctx.fill();
    }

    for (const s of sparks) {
      ctx.globalAlpha = Math.max(0, s.life * 2);
      ctx.fillStyle = s.color;
      ctx.fillRect(s.x, s.y, 2, 2);
      ctx.globalAlpha = 1;
    }

    drawShip();

    if (paused && running) {
      ctx.fillStyle = "rgba(2, 6, 12, 0.45)";
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
    const dir = Number(btn.dataset.dir);
    const setting = step?.dataset.setting;
    if (setting === "speed") speed = Math.max(1, Math.min(10, speed + dir));
    if (setting === "lives") startLives = Math.max(1, Math.min(9, startLives + dir));
    if (setting === "rocks") startRocks = Math.max(2, Math.min(10, startRocks + dir));
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
    if (k === "ArrowUp" || k === "w" || k === "W") {
      keys.up = true;
      e.preventDefault();
    }
    if (k === " " || k === "Spacebar") {
      keys.fire = true;
      e.preventDefault();
      if (running && !paused && !gameOver) fire();
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
    if ((k === "h" || k === "H") && running && !paused && !gameOver) {
      hyperspace();
    }
  });

  window.addEventListener("keyup", (e) => {
    const k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") keys.left = false;
    if (k === "ArrowRight" || k === "d" || k === "D") keys.right = false;
    if (k === "ArrowUp" || k === "w" || k === "W") keys.up = false;
    if (k === " " || k === "Spacebar") keys.fire = false;
  });

  window.addEventListener("resize", () => {
    fit();
    draw();
  });

  fit();
  buildStars();
  syncUI();
  draw();
  requestAnimationFrame((t) => {
    last = t;
    requestAnimationFrame(frame);
  });
})();
