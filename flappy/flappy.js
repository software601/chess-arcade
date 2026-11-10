(() => {
  const BEST_KEY = "arcade-flappy-best";

  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const overlayEl = document.getElementById("overlay");
  const hintEl = document.getElementById("hint");
  const btnStart = document.getElementById("btn-start");
  const boardWrap = document.querySelector(".board-wrap");
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const speedVal = document.getElementById("val-speed");
  const gapVal = document.getElementById("val-gap");
  const settingsEl = document.querySelector(".settings");

  let speed = 5;
  let gapLevel = 5;
  let score = 0;
  let best = Number(localStorage.getItem(BEST_KEY) || 0);
  let running = false;
  let started = false;
  let dead = false;
  let waiting = true;
  let last = 0;

  let bird;
  let pipes = [];
  let groundX = 0;
  let flapFlash = 0;

  function syncUI() {
    speedVal.textContent = String(speed);
    gapVal.textContent = String(gapLevel);
    scoreEl.textContent = String(score);
    bestEl.textContent = String(best);
    btnStart.textContent = started && !dead ? "Restart" : "Start";
  }

  function fit() {
    const w = Math.max(280, Math.floor(boardWrap?.clientWidth || 480));
    const h = Math.max(400, Math.floor(boardWrap?.clientHeight || 640));
    canvas.width = w;
    canvas.height = h;
  }

  function gapSize() {
    // higher gapLevel = easier (bigger opening)
    return canvas.height * (0.18 + gapLevel * 0.018);
  }

  function pipeSpeed() {
    return (1.8 + speed * 0.35) * (canvas.width / 480);
  }

  function gravity() {
    // Gentler fall — less "drop like a stone"
    return (0.14 + speed * 0.012) * (canvas.height / 640);
  }

  function flapForce() {
    // Slightly softer flap to match slower gravity
    return -(4.0 + speed * 0.1) * (canvas.height / 640);
  }

  function pipeSpacing() {
    // Longer gap before the next pipe/cliff
    return canvas.width * (0.62 + (10 - speed) * 0.012);
  }

  function resetBird() {
    bird = {
      x: canvas.width * 0.28,
      y: canvas.height * 0.42,
      r: Math.max(10, Math.min(canvas.width, canvas.height) * 0.028),
      vy: 0,
    };
  }

  function makePipe(x) {
    const gap = gapSize();
    const margin = canvas.height * 0.12;
    const maxTop = canvas.height - margin - gap - canvas.height * 0.14;
    const top = margin + Math.random() * Math.max(20, maxTop - margin);
    return {
      x,
      w: Math.max(42, canvas.width * 0.12),
      top,
      gap,
      passed: false,
    };
  }

  function resetPipes() {
    pipes = [];
    const spacing = pipeSpacing();
    for (let i = 0; i < 4; i++) {
      pipes.push(makePipe(canvas.width + spacing * 0.55 + i * spacing));
    }
  }

  function showTitle() {
    started = false;
    running = false;
    dead = false;
    waiting = true;
    score = 0;
    fit();
    resetBird();
    resetPipes();
    groundX = 0;
    overlayEl.hidden = false;
    overlayEl.textContent = "Press Start\nSpace to flap";
    hintEl.textContent = "Space / click / ↑ to flap · dodge the pipes";
    syncUI();
  }

  function startGame() {
    fit();
    score = 0;
    dead = false;
    waiting = true;
    started = true;
    running = true;
    last = 0;
    resetBird();
    resetPipes();
    groundX = 0;
    overlayEl.hidden = false;
    overlayEl.textContent = "Flap to begin";
    hintEl.textContent = "Space / click / ↑ flap · Enter restart";
    syncUI();
  }

  function flap() {
    if (!started || dead) return;
    if (waiting) {
      waiting = false;
      overlayEl.hidden = true;
    }
    bird.vy = flapForce();
    flapFlash = 8;
  }

  function die() {
    dead = true;
    running = false;
    if (score > best) {
      best = score;
      localStorage.setItem(BEST_KEY, String(best));
    }
    overlayEl.hidden = false;
    overlayEl.textContent = `Crash · ${score}\nStart / Enter`;
    hintEl.textContent = "Start / Enter to try again";
    syncUI();
  }

  function step(dt) {
    const t = dt / 16;
    const spd = pipeSpeed();

    groundX = (groundX - spd * t) % (canvas.width * 0.2);

    if (waiting) {
      bird.y = canvas.height * 0.42 + Math.sin(performance.now() / 180) * 8;
      return;
    }

    bird.vy += gravity() * t;
    // Cap dive speed so falls stay controllable
    const maxFall = (5.5 + speed * 0.2) * (canvas.height / 640);
    if (bird.vy > maxFall) bird.vy = maxFall;
    bird.y += bird.vy * t;
    if (flapFlash > 0) flapFlash -= 1;

    const groundY = canvas.height * 0.86;
    if (bird.y + bird.r >= groundY || bird.y - bird.r <= 0) {
      die();
      return;
    }

    for (const p of pipes) {
      p.x -= spd * t;
      if (!p.passed && p.x + p.w < bird.x - bird.r) {
        p.passed = true;
        score += 1;
        syncUI();
      }

      const inX = bird.x + bird.r > p.x && bird.x - bird.r < p.x + p.w;
      if (inX) {
        const gapTop = p.top;
        const gapBot = p.top + p.gap;
        if (bird.y - bird.r < gapTop || bird.y + bird.r > gapBot) {
          die();
          return;
        }
      }
    }

    // recycle pipes — keep longer open flight between cliffs
    const spacing = pipeSpacing();
    while (pipes.length && pipes[0].x + pipes[0].w < -10) {
      pipes.shift();
      const lastPipe = pipes[pipes.length - 1];
      pipes.push(makePipe(lastPipe.x + spacing));
    }
  }

  function drawSky() {
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, "#4ec0ca");
    g.addColorStop(0.7, "#70c5ce");
    g.addColorStop(1, "#ded895");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // clouds
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    const cx = ((performance.now() / 40) % (canvas.width + 120)) - 60;
    for (let i = 0; i < 3; i++) {
      const x = (cx + i * canvas.width * 0.38) % (canvas.width + 100);
      const y = canvas.height * (0.12 + i * 0.08);
      ctx.beginPath();
      ctx.ellipse(x, y, 34, 16, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 22, y + 4, 28, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPipes() {
    for (const p of pipes) {
      ctx.fillStyle = "#2f9e44";
      ctx.fillRect(p.x, 0, p.w, p.top);
      ctx.fillRect(p.x, p.top + p.gap, p.w, canvas.height);

      ctx.fillStyle = "#24963a";
      ctx.fillRect(p.x - 4, p.top - 18, p.w + 8, 18);
      ctx.fillRect(p.x - 4, p.top + p.gap, p.w + 8, 18);

      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(p.x + 4, 0, 8, p.top);
      ctx.fillRect(p.x + 4, p.top + p.gap, 8, canvas.height - (p.top + p.gap));
    }
  }

  function drawGround() {
    const gy = canvas.height * 0.86;
    ctx.fillStyle = "#ded895";
    ctx.fillRect(0, gy, canvas.width, canvas.height - gy);
    ctx.fillStyle = "#5c8a3c";
    ctx.fillRect(0, gy, canvas.width, 12);
    ctx.fillStyle = "#b89b4c";
    for (let x = groundX; x < canvas.width + 40; x += 28) {
      ctx.fillRect(x, gy + 16, 16, 6);
    }
  }

  function drawBird() {
    const tilt = Math.max(-0.7, Math.min(0.9, bird.vy / 10));
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(tilt);

    // body
    ctx.fillStyle = "#f4d35e";
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.r * 1.15, bird.r, 0, 0, Math.PI * 2);
    ctx.fill();

    // wing
    ctx.fillStyle = flapFlash > 0 ? "#f7e39a" : "#e2b93d";
    ctx.beginPath();
    ctx.ellipse(-bird.r * 0.15, bird.r * 0.15, bird.r * 0.7, bird.r * 0.35, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // eye
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(bird.r * 0.35, -bird.r * 0.2, bird.r * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.arc(bird.r * 0.45, -bird.r * 0.2, bird.r * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // beak
    ctx.fillStyle = "#f08a24";
    ctx.beginPath();
    ctx.moveTo(bird.r * 0.7, 0);
    ctx.lineTo(bird.r * 1.35, bird.r * 0.12);
    ctx.lineTo(bird.r * 0.7, bird.r * 0.28);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawScore() {
    ctx.font = `${Math.max(18, Math.floor(canvas.height * 0.06))}px "Press Start 2P", monospace`;
    ctx.textAlign = "center";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(20,48,28,0.45)";
    ctx.fillStyle = "#fff";
    ctx.strokeText(String(score), canvas.width / 2, canvas.height * 0.12);
    ctx.fillText(String(score), canvas.width / 2, canvas.height * 0.12);
  }

  function draw() {
    drawSky();
    drawPipes();
    drawGround();
    drawBird();
    if (started) drawScore();
  }

  function loop(ts) {
    if (!last) last = ts;
    const dt = Math.min(32, ts - last);
    last = ts;
    if (running && !dead) step(dt);
    draw();
    requestAnimationFrame(loop);
  }

  settingsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".step-btn");
    if (!btn) return;
    const row = btn.closest(".step");
    const dir = Number(btn.dataset.dir);
    if (row.dataset.setting === "speed") {
      speed = Math.min(10, Math.max(1, speed + dir));
    } else if (row.dataset.setting === "gap") {
      gapLevel = Math.min(10, Math.max(1, gapLevel + dir));
    }
    syncUI();
  });

  btnStart.addEventListener("click", () => startGame());

  function onFlapKey(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      startGame();
      return;
    }
    if (
      e.key === " " ||
      e.code === "Space" ||
      e.key === "ArrowUp" ||
      e.key === "w" ||
      e.key === "W"
    ) {
      e.preventDefault();
      if (!started || dead) startGame();
      flap();
    }
  }

  window.addEventListener("keydown", onFlapKey);
  canvas.addEventListener("mousedown", () => {
    if (!started || dead) startGame();
    flap();
  });
  canvas.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      if (!started || dead) startGame();
      flap();
    },
    { passive: false }
  );

  window.addEventListener("resize", () => {
    const ratio = bird ? bird.y / canvas.height : 0.42;
    fit();
    if (bird) {
      bird.x = canvas.width * 0.28;
      bird.y = ratio * canvas.height;
      bird.r = Math.max(10, Math.min(canvas.width, canvas.height) * 0.028);
    }
    if (!started || waiting) resetPipes();
  });

  bestEl.textContent = String(best);
  requestAnimationFrame(() => {
    showTitle();
    draw();
  });
  requestAnimationFrame(loop);
})();
