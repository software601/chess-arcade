(() => {
  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const overlayEl = document.getElementById("overlay");
  const hintEl = document.getElementById("hint");
  const btnStart = document.getElementById("btn-start");
  const boardWrap = document.querySelector(".board-wrap");
  const youEl = document.getElementById("score-you");
  const cpuEl = document.getElementById("score-cpu");
  const speedVal = document.getElementById("val-speed");
  const winVal = document.getElementById("val-win");
  const settingsEl = document.querySelector(".settings");

  let speed = 5;
  let winAt = 7;
  let you = 0;
  let cpu = 0;
  let running = false;
  let paused = false;
  let started = false;
  let over = false;
  let last = 0;

  let paddleH;
  let paddleW;
  let ballR;
  let left;
  let right;
  let ball;
  let keys = { up: false, down: false };
  let mouseY = null;

  function syncUI() {
    speedVal.textContent = String(speed);
    winVal.textContent = String(winAt);
    youEl.textContent = String(you);
    cpuEl.textContent = String(cpu);
    btnStart.textContent = started && !over ? "Restart" : "Start";
  }

  function fit() {
    const w = Math.max(320, Math.floor(boardWrap?.clientWidth || 800));
    const h = Math.max(240, Math.floor(boardWrap?.clientHeight || 500));
    canvas.width = w;
    canvas.height = h;
    paddleW = Math.max(10, Math.round(w * 0.015));
    paddleH = Math.max(50, Math.round(h * 0.18));
    ballR = Math.max(6, Math.round(Math.min(w, h) * 0.014));
  }

  function ballSpeed() {
    return (2.6 + speed * 0.55) * (canvas.width / 800);
  }

  function resetBall(dir = Math.random() < 0.5 ? -1 : 1) {
    const sp = ballSpeed();
    const angle = (Math.random() * 0.7 - 0.35) * Math.PI; // ~±63°
    ball = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: Math.cos(angle) * sp * dir,
      vy: Math.sin(angle) * sp,
    };
  }

  function resetPaddles() {
    left = { x: paddleW * 2, y: canvas.height / 2 - paddleH / 2 };
    right = {
      x: canvas.width - paddleW * 3,
      y: canvas.height / 2 - paddleH / 2,
    };
  }

  function showTitle() {
    started = false;
    running = false;
    paused = false;
    over = false;
    you = 0;
    cpu = 0;
    fit();
    resetPaddles();
    resetBall();
    overlayEl.hidden = false;
    overlayEl.textContent = "Press Start\nW/S or mouse";
    hintEl.textContent = "You = left · CPU = right · W/S or mouse · Space pause";
    syncUI();
  }

  function startGame() {
    fit();
    you = 0;
    cpu = 0;
    over = false;
    paused = false;
    started = true;
    running = true;
    last = 0;
    resetPaddles();
    resetBall(Math.random() < 0.5 ? -1 : 1);
    overlayEl.hidden = true;
    hintEl.textContent = "W/S · ↑/↓ · mouse on court · Space pause · Enter restart";
    syncUI();
  }

  function endGame(msg) {
    over = true;
    running = false;
    overlayEl.hidden = false;
    overlayEl.textContent = `${msg}\n${you} – ${cpu}`;
    hintEl.textContent = "Start to play again";
    syncUI();
  }

  function clampPaddle(p) {
    p.y = Math.max(0, Math.min(canvas.height - paddleH, p.y));
  }

  function hitPaddle(p, fromLeft) {
    const nearX = fromLeft ? p.x + paddleW : p.x;
    const withinY = ball.y >= p.y && ball.y <= p.y + paddleH;
    if (!withinY) return false;
    if (fromLeft) {
      if (ball.vx < 0 && ball.x - ballR <= nearX && ball.x - ballR >= p.x - ballR) {
        return true;
      }
    } else if (ball.vx > 0 && ball.x + ballR >= nearX && ball.x + ballR <= p.x + paddleW + ballR) {
      return true;
    }
    return false;
  }

  function bounce(p, fromLeft) {
    const rel = (ball.y - (p.y + paddleH / 2)) / (paddleH / 2);
    const sp = Math.min(ballSpeed() * 1.35, Math.hypot(ball.vx, ball.vy) * 1.05 + 0.4);
    const angle = rel * 0.6;
    ball.vx = Math.cos(angle) * sp * (fromLeft ? 1 : -1);
    ball.vy = Math.sin(angle) * sp;
    ball.x = fromLeft ? p.x + paddleW + ballR + 0.5 : p.x - ballR - 0.5;
  }

  function step(dt) {
    const move = (320 + speed * 40) * (dt / 1000) * (canvas.height / 500);

    // player
    if (keys.up) left.y -= move;
    if (keys.down) left.y += move;
    if (mouseY != null) left.y = mouseY - paddleH / 2;
    clampPaddle(left);

    // CPU tracks ball with slight lag / error
    const target = ball.y - paddleH / 2;
    const aiSpeed = move * (0.72 + speed * 0.035);
    if (right.y + 4 < target) right.y += aiSpeed;
    else if (right.y - 4 > target) right.y -= aiSpeed;
    clampPaddle(right);

    ball.x += ball.vx * (dt / 16);
    ball.y += ball.vy * (dt / 16);

    if (ball.y - ballR <= 0) {
      ball.y = ballR;
      ball.vy *= -1;
    } else if (ball.y + ballR >= canvas.height) {
      ball.y = canvas.height - ballR;
      ball.vy *= -1;
    }

    if (hitPaddle(left, true)) bounce(left, true);
    if (hitPaddle(right, false)) bounce(right, false);

    if (ball.x + ballR < 0) {
      cpu += 1;
      syncUI();
      if (cpu >= winAt) endGame("CPU wins");
      else resetBall(1);
    } else if (ball.x - ballR > canvas.width) {
      you += 1;
      syncUI();
      if (you >= winAt) endGame("You win");
      else resetBall(-1);
    }
  }

  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = "#060a10";
    ctx.fillRect(0, 0, w, h);

    // center dashed line
    ctx.strokeStyle = "rgba(217,226,236,0.28)";
    ctx.lineWidth = Math.max(2, w * 0.004);
    ctx.setLineDash([h * 0.04, h * 0.03]);
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#e8eef4";
    ctx.fillRect(left.x, left.y, paddleW, paddleH);
    ctx.fillRect(right.x, right.y, paddleW, paddleH);

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballR, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = `${Math.max(16, Math.floor(h * 0.06))}px "Press Start 2P", monospace`;
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(125,255,179,0.85)";
    ctx.fillText(String(you), w * 0.25, h * 0.12);
    ctx.fillStyle = "rgba(232,238,244,0.7)";
    ctx.fillText(String(cpu), w * 0.75, h * 0.12);

    if (paused && running) {
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0, 0, w, h);
    }
  }

  function loop(ts) {
    if (!last) last = ts;
    const dt = Math.min(32, ts - last);
    last = ts;
    if (running && !paused && !over) step(dt);
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
    } else if (row.dataset.setting === "win") {
      winAt = Math.min(21, Math.max(3, winAt + dir));
    }
    syncUI();
  });

  btnStart.addEventListener("click", () => startGame());

  window.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      startGame();
      return;
    }
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      if (started && !over) {
        paused = !paused;
        overlayEl.hidden = !paused;
        overlayEl.textContent = paused ? "Paused" : "";
        if (!paused) overlayEl.hidden = true;
      }
      return;
    }
    if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") keys.up = true;
    if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") keys.down = true;
  });

  window.addEventListener("keyup", (e) => {
    if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") keys.up = false;
    if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") keys.down = false;
  });

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = ((e.clientY - rect.top) * canvas.height) / rect.height;
  });

  canvas.addEventListener(
    "touchmove",
    (e) => {
      const t = e.touches[0];
      if (!t) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      mouseY = ((t.clientY - rect.top) * canvas.height) / rect.height;
    },
    { passive: false }
  );

  window.addEventListener("resize", () => {
    const lx = left?.y ?? 0;
    const rx = right?.y ?? 0;
    const ratioL = canvas.height ? lx / canvas.height : 0.5;
    const ratioR = canvas.height ? rx / canvas.height : 0.5;
    fit();
    resetPaddles();
    left.y = ratioL * canvas.height;
    right.y = ratioR * canvas.height;
    clampPaddle(left);
    clampPaddle(right);
    if (!started) resetBall();
  });

  requestAnimationFrame(() => {
    showTitle();
    draw();
  });
  requestAnimationFrame(loop);
})();
