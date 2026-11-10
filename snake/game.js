(() => {
  const LIMITS = {
    cols: { min: 12, max: 80, step: 1 },
    rows: { min: 12, max: 80, step: 1 },
    speed: { min: 1, max: 10, step: 1 },
    cell: { min: 8, max: 28, step: 1 }, // smaller cell = more blocks on screen
  };

  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const overlayEl = document.getElementById("overlay");
  const hintEl = document.getElementById("hint");
  const stageEl = document.querySelector(".stage");
  const boardWrap = document.querySelector(".board-wrap");
  const btnStart = document.getElementById("btn-start");
  const settingsEl = document.querySelector(".settings");

  const vals = {
    cols: document.getElementById("val-cols"),
    rows: document.getElementById("val-rows"),
    speed: document.getElementById("val-speed"),
    cell: document.getElementById("val-cell"),
  };

  const DIRS = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    d: { x: 1, y: 0 },
    W: { x: 0, y: -1 },
    S: { x: 0, y: 1 },
    A: { x: -1, y: 0 },
    D: { x: 1, y: 0 },
  };

  let preferredCell = 14; // keep blocks modest; fill screen with MORE tiles
  let cols = 20;
  let rows = 20;
  let cellW = 14;
  let cellH = 14;
  let speed = 5;
  let tickMs = speedToMs(5);
  let lockGrid = false; // true after manual width/length tweak until cell nudge/resize densify

  const GROW_ON_FOOD = 2; // segments added when eating the red

  let snake;
  let dir;
  let pendingDir;
  let food;
  let growLeft = 0;
  let score = 0;
  let running = false;
  let paused = false;
  let dead = false;
  let started = false;
  let lastTick = 0;

  function speedToMs(level) {
    return Math.round(240 - level * 20);
  }

  function syncLabels() {
    vals.cols.textContent = String(cols);
    vals.rows.textContent = String(rows);
    vals.speed.textContent = String(speed);
    vals.cell.textContent = String(Math.round(Math.min(cellW, cellH)));
  }

  function syncStartButton() {
    btnStart.textContent = started && !dead ? "Restart" : "Start";
  }

  function densifyFromCellSize() {
    const w = Math.max(8, Math.floor(boardWrap?.clientWidth || window.innerWidth));
    const h = Math.max(8, Math.floor(boardWrap?.clientHeight || window.innerHeight));
    cols = Math.min(
      LIMITS.cols.max,
      Math.max(LIMITS.cols.min, Math.floor(w / preferredCell))
    );
    rows = Math.min(
      LIMITS.rows.max,
      Math.max(LIMITS.rows.min, Math.floor(h / preferredCell))
    );
    lockGrid = false;
  }

  function applyCanvasSize() {
    // Board sits beside the left menu and fills that pane (no empty strip).
    const w = Math.max(8, Math.floor(boardWrap?.clientWidth || window.innerWidth));
    const h = Math.max(8, Math.floor(boardWrap?.clientHeight || window.innerHeight));
    if (!lockGrid) densifyFromCellSize();
    canvas.width = w;
    canvas.height = h;
    cellW = w / cols;
    cellH = h / rows;
    if (stageEl) stageEl.style.width = "";
    syncLabels();
  }

  function nudge(setting, dir) {
    const lim = LIMITS[setting];
    if (!lim) return;

    if (setting === "cols") {
      cols = Math.min(lim.max, Math.max(lim.min, cols + dir * lim.step));
      lockGrid = true;
    } else if (setting === "rows") {
      rows = Math.min(lim.max, Math.max(lim.min, rows + dir * lim.step));
      lockGrid = true;
    } else if (setting === "speed") {
      speed = Math.min(lim.max, Math.max(lim.min, speed + dir * lim.step));
      tickMs = speedToMs(speed);
    } else if (setting === "cell") {
      // Smaller preferred cell ⇒ more blocks across the board.
      // + = slightly larger blocks (fewer); − = smaller blocks (more on screen)
      preferredCell = Math.min(
        lim.max,
        Math.max(lim.min, preferredCell + dir * lim.step)
      );
      densifyFromCellSize();
    }

    syncLabels();
    applyCanvasSize();
    drawBoard();
  }

  function showTitle() {
    started = false;
    running = false;
    paused = false;
    dead = false;
    score = 0;
    scoreEl.textContent = "0";
    overlayEl.hidden = false;
    overlayEl.textContent = "Press Start";
    hintEl.textContent = "− / + to set · Start to play";
    syncStartButton();
  }

  function startGame() {
    tickMs = speedToMs(speed);
    applyCanvasSize();

    const startX = Math.floor(cols / 2);
    const startY = Math.floor(rows / 2);
    snake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
    ];
    dir = { x: 1, y: 0 };
    pendingDir = dir;
    growLeft = 0;
    score = 0;
    running = true;
    paused = false;
    dead = false;
    started = true;
    lastTick = 0;
    scoreEl.textContent = "0";
    overlayEl.hidden = true;
    hintEl.textContent = "Click board / arrows · Space pause";
    placeFood();
    syncStartButton();
  }

  function placeFood() {
    const occupied = new Set(snake.map((p) => `${p.x},${p.y}`));
    let spot;
    do {
      spot = {
        x: Math.floor(Math.random() * cols),
        y: Math.floor(Math.random() * rows),
      };
    } while (occupied.has(`${spot.x},${spot.y}`));
    food = spot;
  }

  function same(a, b) {
    return a.x === b.x && a.y === b.y;
  }

  function opposite(a, b) {
    return a.x + b.x === 0 && a.y + b.y === 0;
  }

  function setDirection(next) {
    if (!next || opposite(next, dir)) return;
    pendingDir = next;
  }

  function canvasPoint(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function steerToward(clientX, clientY) {
    if (!started || dead || paused || !snake) return;
    const pt = canvasPoint(clientX, clientY);
    const head = snake[0];
    const hx = head.x * cellW + cellW / 2;
    const hy = head.y * cellH + cellH / 2;
    const dx = pt.x - hx;
    const dy = pt.y - hy;
    const deadzone = Math.min(cellW, cellH) * 0.35;
    if (Math.abs(dx) < deadzone && Math.abs(dy) < deadzone) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      setDirection(dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
    } else {
      setDirection(dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
    }
  }

  function bumpScore() {
    scoreEl.textContent = String(score);
    scoreEl.classList.remove("bump");
    void scoreEl.offsetWidth;
    scoreEl.classList.add("bump");
  }

  function step() {
    dir = pendingDir;
    const head = snake[0];
    const next = { x: head.x + dir.x, y: head.y + dir.y };

    if (next.x < 0 || next.x >= cols || next.y < 0 || next.y >= rows) {
      gameOver();
      return;
    }

    if (snake.some((seg) => same(seg, next))) {
      gameOver();
      return;
    }

    snake.unshift(next);

    if (same(next, food)) {
      score += 1;
      growLeft += GROW_ON_FOOD;
      bumpScore();
      if (snake.length + growLeft >= cols * rows) {
        win();
        return;
      }
      placeFood();
    }

    if (growLeft > 0) {
      growLeft -= 1; // keep tail → snake gets longer
    } else {
      snake.pop();
    }
  }

  function gameOver() {
    dead = true;
    running = false;
    overlayEl.hidden = false;
    overlayEl.textContent = `Game over · ${score}\nStart to play`;
    hintEl.textContent = "Start / Enter to play again";
    syncStartButton();
  }

  function win() {
    dead = true;
    running = false;
    overlayEl.hidden = false;
    overlayEl.textContent = `You win · ${score}\nStart to play`;
    hintEl.textContent = "Start / Enter to play again";
    syncStartButton();
  }

  function drawCell(x, y, fill, insetX = 1, insetY = 1) {
    ctx.fillStyle = fill;
    ctx.fillRect(
      x * cellW + insetX,
      y * cellH + insetY,
      cellW - insetX * 2,
      cellH - insetY * 2
    );
  }

  function drawBoard() {
    ctx.fillStyle = "#18352b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    for (let i = 1; i < cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellW + 0.5, 0);
      ctx.lineTo(i * cellW + 0.5, canvas.height);
      ctx.stroke();
    }
    for (let j = 1; j < rows; j++) {
      ctx.beginPath();
      ctx.moveTo(0, j * cellH + 0.5);
      ctx.lineTo(canvas.width, j * cellH + 0.5);
      ctx.stroke();
    }
  }

  function draw() {
    drawBoard();
    if (!started) return;

    const pulse = 1 + Math.sin(performance.now() / 180) * 0.5;
    const foodInset = Math.max(1, 3 - pulse * 0.6);
    drawCell(food.x, food.y, "#ff6b4a", foodInset, foodInset);

    snake.forEach((seg, i) => {
      const fill = i === 0 ? "#e8ff9a" : "#b8f26e";
      const inset = i === 0 ? 1 : 2;
      drawCell(seg.x, seg.y, fill, inset, inset);
    });

    if (paused && running) {
      ctx.fillStyle = "rgba(20, 48, 40, 0.55)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  function loop(ts) {
    if (running && !paused && ts - lastTick >= tickMs) {
      step();
      lastTick = ts;
    }
    draw();
    requestAnimationFrame(loop);
  }

  settingsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".step-btn");
    if (!btn) return;
    const row = btn.closest(".step");
    if (!row) return;
    nudge(row.dataset.setting, Number(btn.dataset.dir));
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
      if (started && !dead) {
        paused = !paused;
        overlayEl.hidden = !paused;
        overlayEl.textContent = paused ? "Paused" : "";
        if (!paused) overlayEl.hidden = true;
      }
      return;
    }

    if (!started || dead || paused) return;

    const next = DIRS[e.key];
    if (!next) return;
    e.preventDefault();
    setDirection(next);
  });

  // Click only — no hover steering.
  canvas.addEventListener("click", (e) => {
    if (!started || dead || paused) return;
    steerToward(e.clientX, e.clientY);
  });

  canvas.addEventListener(
    "touchend",
    (e) => {
      if (!started || dead || paused) return;
      const t = e.changedTouches[0];
      if (!t) return;
      e.preventDefault();
      steerToward(t.clientX, t.clientY);
    },
    { passive: false }
  );

  window.addEventListener("resize", () => {
    applyCanvasSize();
    draw();
  });

  syncLabels();
  // Wait a frame so layout has real sizes, then fill the board.
  requestAnimationFrame(() => {
    applyCanvasSize();
    showTitle();
    draw();
  });
  requestAnimationFrame(loop);
})();
