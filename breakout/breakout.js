(() => {
  const BRICK_COLORS = ["#ff6b6b", "#ff9f43", "#feca57", "#1dd1a1", "#54a0ff", "#5f27cd"];

  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const overlayEl = document.getElementById("overlay");
  const hintEl = document.getElementById("hint");
  const btnStart = document.getElementById("btn-start");
  const boardWrap = document.querySelector(".board-wrap");
  const scoreEl = document.getElementById("score");
  const livesEl = document.getElementById("lives");
  const speedVal = document.getElementById("val-speed");
  const rowsVal = document.getElementById("val-rows");
  const settingsEl = document.querySelector(".settings");

  let speed = 5;
  let brickRows = 6;
  const brickCols = 12;
  let score = 0;
  let lives = 3;
  let running = false;
  let paused = false;
  let started = false;
  let over = false;
  let won = false;
  let last = 0;

  let paddle;
  let ball;
  let bricks = [];
  let keys = { left: false, right: false };
  let mouseX = null;

  function syncUI() {
    speedVal.textContent = String(speed);
    rowsVal.textContent = String(brickRows);
    scoreEl.textContent = String(score);
    livesEl.textContent = String(lives);
    btnStart.textContent = started && !over && !won ? "Restart" : "Start";
  }

  function fit() {
    const w = Math.max(320, Math.floor(boardWrap?.clientWidth || 800));
    const h = Math.max(240, Math.floor(boardWrap?.clientHeight || 600));
    canvas.width = w;
    canvas.height = h;
  }

  function ballSpeed() {
    return (3.1 + speed * 0.55) * (canvas.width / 800);
  }

  function makeBricks() {
    bricks = [];
    const marginX = canvas.width * 0.04;
    const top = canvas.height * 0.1;
    const gap = Math.max(3, canvas.width * 0.005);
    const bw = (canvas.width - marginX * 2 - gap * (brickCols - 1)) / brickCols;
    const bh = Math.max(12, canvas.height * 0.028);
    for (let r = 0; r < brickRows; r++) {
      for (let c = 0; c < brickCols; c++) {
        bricks.push({
          x: marginX + c * (bw + gap),
          y: top + r * (bh + gap),
          w: bw,
          h: bh,
          alive: true,
          color: BRICK_COLORS[r % BRICK_COLORS.length],
          points: (brickRows - r) * 10,
        });
      }
    }
  }

  function resetBall(stuck = true) {
    const sp = ballSpeed();
    ball = {
      x: paddle.x + paddle.w / 2,
      y: paddle.y - paddle.h,
      r: Math.max(6, Math.min(canvas.width, canvas.height) * 0.012),
      vx: sp * (Math.random() < 0.5 ? -0.75 : 0.75),
      vy: -sp,
      stuck,
    };
  }

  function resetPaddle() {
    const pw = Math.max(60, canvas.width * 0.14);
    const ph = Math.max(10, canvas.height * 0.02);
    paddle = {
      w: pw,
      h: ph,
      x: canvas.width / 2 - pw / 2,
      y: canvas.height - ph * 3.5,
    };
  }

  function showTitle() {
    started = false;
    running = false;
    paused = false;
    over = false;
    won = false;
    score = 0;
    lives = 3;
    fit();
    resetPaddle();
    makeBricks();
    resetBall(true);
    overlayEl.hidden = false;
    overlayEl.textContent = "Press Start\nA/D or mouse";
    hintEl.textContent = "Break all bricks · A/D or mouse · Space pause";
    syncUI();
  }

  function startGame() {
    fit();
    score = 0;
    lives = 3;
    over = false;
    won = false;
    paused = false;
    started = true;
    running = true;
    last = 0;
    resetPaddle();
    makeBricks();
    resetBall(true);
    overlayEl.hidden = false;
    overlayEl.textContent = "Click / Space\nto launch";
    hintEl.textContent = "←→ / A D / mouse · Space launch or pause · Enter restart";
    syncUI();
  }

  function launch() {
    if (!started || over || won) return;
    if (ball.stuck) {
      ball.stuck = false;
      overlayEl.hidden = true;
      const sp = ballSpeed();
      ball.vx = sp * (Math.random() < 0.5 ? -0.7 : 0.7);
      ball.vy = -sp;
    }
  }

  function loseLife() {
    lives -= 1;
    syncUI();
    if (lives <= 0) {
      over = true;
      running = false;
      overlayEl.hidden = false;
      overlayEl.textContent = `Game over · ${score}\nStart again`;
      hintEl.textContent = "Start / Enter to play again";
      return;
    }
    resetPaddle();
    resetBall(true);
    overlayEl.hidden = false;
    overlayEl.textContent = "Click / Space\nto launch";
  }

  function checkWin() {
    if (bricks.every((b) => !b.alive)) {
      won = true;
      running = false;
      overlayEl.hidden = false;
      overlayEl.textContent = `You win · ${score}\nStart again`;
      hintEl.textContent = "Start / Enter to play again";
      syncUI();
    }
  }

  function clampPaddle() {
    paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, paddle.x));
  }

  function collideBrick(b) {
    const closestX = Math.max(b.x, Math.min(ball.x, b.x + b.w));
    const closestY = Math.max(b.y, Math.min(ball.y, b.y + b.h));
    const dx = ball.x - closestX;
    const dy = ball.y - closestY;
    return dx * dx + dy * dy <= ball.r * ball.r;
  }

  function step(dt) {
    const move = (380 + speed * 45) * (dt / 1000) * (canvas.width / 800);

    if (keys.left) paddle.x -= move;
    if (keys.right) paddle.x += move;
    if (mouseX != null) paddle.x = mouseX - paddle.w / 2;
    clampPaddle();

    if (ball.stuck) {
      ball.x = paddle.x + paddle.w / 2;
      ball.y = paddle.y - ball.r - 1;
      return;
    }

    ball.x += ball.vx * (dt / 16);
    ball.y += ball.vy * (dt / 16);

    if (ball.x - ball.r <= 0) {
      ball.x = ball.r;
      ball.vx = Math.abs(ball.vx);
    } else if (ball.x + ball.r >= canvas.width) {
      ball.x = canvas.width - ball.r;
      ball.vx = -Math.abs(ball.vx);
    }
    if (ball.y - ball.r <= 0) {
      ball.y = ball.r;
      ball.vy = Math.abs(ball.vy);
    }

    // paddle
    if (
      ball.vy > 0 &&
      ball.y + ball.r >= paddle.y &&
      ball.y + ball.r <= paddle.y + paddle.h + ball.r &&
      ball.x >= paddle.x - ball.r &&
      ball.x <= paddle.x + paddle.w + ball.r
    ) {
      const rel = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
      const sp = Math.min(ballSpeed() * 1.35, Math.hypot(ball.vx, ball.vy) * 1.03 + 0.25);
      const angle = rel * 0.7;
      ball.vx = Math.sin(angle) * sp;
      ball.vy = -Math.abs(Math.cos(angle) * sp);
      ball.y = paddle.y - ball.r - 0.5;
    }

    for (const b of bricks) {
      if (!b.alive || !collideBrick(b)) continue;
      b.alive = false;
      score += b.points;
      syncUI();

      const overlapL = ball.x + ball.r - b.x;
      const overlapR = b.x + b.w - (ball.x - ball.r);
      const overlapT = ball.y + ball.r - b.y;
      const overlapB = b.y + b.h - (ball.y - ball.r);
      const minX = Math.min(overlapL, overlapR);
      const minY = Math.min(overlapT, overlapB);
      if (minX < minY) ball.vx *= -1;
      else ball.vy *= -1;
      checkWin();
      break;
    }

    if (ball.y - ball.r > canvas.height) loseLife();
  }

  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = "#0c0814";
    ctx.fillRect(0, 0, w, h);

    for (const b of bricks) {
      if (!b.alive) continue;
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(b.x, b.y, b.w, Math.max(2, b.h * 0.22));
    }

    ctx.fillStyle = "#f4eaff";
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

    ctx.beginPath();
    ctx.fillStyle = "#ff8f6b";
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();

    if (paused && running) {
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0, 0, w, h);
    }
  }

  function loop(ts) {
    if (!last) last = ts;
    const dt = Math.min(32, ts - last);
    last = ts;
    if (running && !paused && !over && !won) step(dt);
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
    } else if (row.dataset.setting === "rows") {
      brickRows = Math.min(10, Math.max(3, brickRows + dir));
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
      if (!started || over || won) return;
      if (ball.stuck) {
        launch();
        return;
      }
      paused = !paused;
      overlayEl.hidden = !paused;
      overlayEl.textContent = paused ? "Paused" : "";
      if (!paused) overlayEl.hidden = true;
      return;
    }
    if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") keys.left = true;
    if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") keys.right = true;
  });

  window.addEventListener("keyup", (e) => {
    if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") keys.left = false;
    if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") keys.right = false;
  });

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) * canvas.width) / rect.width;
  });

  canvas.addEventListener("click", () => launch());

  canvas.addEventListener(
    "touchmove",
    (e) => {
      const t = e.touches[0];
      if (!t) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      mouseX = ((t.clientX - rect.left) * canvas.width) / rect.width;
    },
    { passive: false }
  );

  canvas.addEventListener(
    "touchstart",
    (e) => {
      const t = e.touches[0];
      if (!t) return;
      const rect = canvas.getBoundingClientRect();
      mouseX = ((t.clientX - rect.left) * canvas.width) / rect.width;
      launch();
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    const px = paddle ? paddle.x / canvas.width : 0.5;
    fit();
    resetPaddle();
    paddle.x = px * canvas.width;
    clampPaddle();
    makeBricks();
    if (ball?.stuck) resetBall(true);
  });

  requestAnimationFrame(() => {
    showTitle();
    draw();
  });
  requestAnimationFrame(loop);
})();
