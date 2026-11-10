(() => {
  const COLS = 10;
  const ROWS = 20;
  const COLORS = {
    I: "#5ce1ff",
    O: "#ffd93d",
    T: "#c77dff",
    S: "#6bcb77",
    Z: "#ff6b6b",
    J: "#4d96ff",
    L: "#ff9f43",
  };

  // each rotation is a list of [x,y] cells in a 4x4 box
  const SHAPES = {
    I: [
      [[0, 1], [1, 1], [2, 1], [3, 1]],
      [[2, 0], [2, 1], [2, 2], [2, 3]],
      [[0, 2], [1, 2], [2, 2], [3, 2]],
      [[1, 0], [1, 1], [1, 2], [1, 3]],
    ],
    O: [
      [[1, 0], [2, 0], [1, 1], [2, 1]],
      [[1, 0], [2, 0], [1, 1], [2, 1]],
      [[1, 0], [2, 0], [1, 1], [2, 1]],
      [[1, 0], [2, 0], [1, 1], [2, 1]],
    ],
    T: [
      [[1, 0], [0, 1], [1, 1], [2, 1]],
      [[1, 0], [1, 1], [2, 1], [1, 2]],
      [[0, 1], [1, 1], [2, 1], [1, 2]],
      [[1, 0], [0, 1], [1, 1], [1, 2]],
    ],
    S: [
      [[1, 0], [2, 0], [0, 1], [1, 1]],
      [[1, 0], [1, 1], [2, 1], [2, 2]],
      [[1, 1], [2, 1], [0, 2], [1, 2]],
      [[0, 0], [0, 1], [1, 1], [1, 2]],
    ],
    Z: [
      [[0, 0], [1, 0], [1, 1], [2, 1]],
      [[2, 0], [1, 1], [2, 1], [1, 2]],
      [[0, 1], [1, 1], [1, 2], [2, 2]],
      [[1, 0], [0, 1], [1, 1], [0, 2]],
    ],
    J: [
      [[0, 0], [0, 1], [1, 1], [2, 1]],
      [[1, 0], [2, 0], [1, 1], [1, 2]],
      [[0, 1], [1, 1], [2, 1], [2, 2]],
      [[1, 0], [1, 1], [0, 2], [1, 2]],
    ],
    L: [
      [[2, 0], [0, 1], [1, 1], [2, 1]],
      [[1, 0], [1, 1], [1, 2], [2, 2]],
      [[0, 1], [1, 1], [2, 1], [0, 2]],
      [[0, 0], [1, 0], [1, 1], [1, 2]],
    ],
  };

  const TYPES = Object.keys(SHAPES);
  const LINE_SCORES = [0, 100, 300, 500, 800];

  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const nextCanvas = document.getElementById("next");
  const nextCtx = nextCanvas.getContext("2d");
  const overlayEl = document.getElementById("overlay");
  const hintEl = document.getElementById("hint");
  const btnStart = document.getElementById("btn-start");
  const boardWrap = document.querySelector(".board-wrap");
  const scoreEl = document.getElementById("score");
  const linesEl = document.getElementById("lines");
  const levelEl = document.getElementById("level");
  const startLevelVal = document.getElementById("val-level");
  const settingsEl = document.querySelector(".settings");

  let startLevel = 1;
  let score = 0;
  let lines = 0;
  let level = 1;
  let grid;
  let piece;
  let nextType;
  let bag = [];
  let running = false;
  let paused = false;
  let started = false;
  let over = false;
  let dropMs = 800;
  let dropAcc = 0;
  let last = 0;
  let cell = 30;
  let offsetX = 0;
  let offsetY = 0;

  function syncUI() {
    startLevelVal.textContent = String(startLevel);
    scoreEl.textContent = String(score);
    linesEl.textContent = String(lines);
    levelEl.textContent = String(level);
    btnStart.textContent = started && !over ? "Restart" : "Start";
  }

  function levelSpeed(lv) {
    return Math.max(80, 850 - (lv - 1) * 70);
  }

  function fit() {
    const w = Math.max(200, Math.floor(boardWrap?.clientWidth || 300));
    const h = Math.max(400, Math.floor(boardWrap?.clientHeight || 600));
    canvas.width = w;
    canvas.height = h;
    cell = Math.floor(Math.min(w / COLS, h / ROWS));
    offsetX = Math.floor((w - COLS * cell) / 2);
    offsetY = Math.floor((h - ROWS * cell) / 2);
  }

  function emptyGrid() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }

  function refillBag() {
    bag = TYPES.slice();
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
  }

  function takeFromBag() {
    if (!bag.length) refillBag();
    return bag.pop();
  }

  function spawn(type) {
    return {
      type,
      rot: 0,
      x: 3,
      y: 0,
    };
  }

  function cellsOf(p) {
    return SHAPES[p.type][p.rot].map(([x, y]) => [p.x + x, p.y + y]);
  }

  function valid(p, gridRef = grid) {
    for (const [x, y] of cellsOf(p)) {
      if (x < 0 || x >= COLS || y >= ROWS) return false;
      if (y >= 0 && gridRef[y][x]) return false;
    }
    return true;
  }

  function lockPiece() {
    for (const [x, y] of cellsOf(piece)) {
      if (y < 0) {
        gameOver();
        return;
      }
      grid[y][x] = piece.type;
    }
    clearLines();
    piece = spawn(nextType);
    nextType = takeFromBag();
    drawNext();
    if (!valid(piece)) gameOver();
  }

  function clearLines() {
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (grid[y].every((c) => c)) {
        grid.splice(y, 1);
        grid.unshift(Array(COLS).fill(null));
        cleared += 1;
        y += 1;
      }
    }
    if (!cleared) return;
    lines += cleared;
    score += LINE_SCORES[cleared] * level;
    level = startLevel + Math.floor(lines / 10);
    dropMs = levelSpeed(level);
    syncUI();
  }

  function hardDrop() {
    if (!piece) return;
    let dist = 0;
    while (valid({ ...piece, y: piece.y + 1 })) {
      piece.y += 1;
      dist += 1;
    }
    score += dist * 2;
    syncUI();
    lockPiece();
  }

  function softDrop(fromPlayer = false) {
    if (!valid({ ...piece, y: piece.y + 1 })) {
      lockPiece();
      return false;
    }
    piece.y += 1;
    if (fromPlayer) {
      score += 1;
      syncUI();
    }
    return true;
  }

  function rotate(dir = 1) {
    const next = { ...piece, rot: (piece.rot + dir + 4) % 4 };
    const kicks = [0, -1, 1, -2, 2];
    for (const k of kicks) {
      const trial = { ...next, x: piece.x + k };
      if (valid(trial)) {
        piece = trial;
        return;
      }
    }
  }

  function move(dx) {
    const next = { ...piece, x: piece.x + dx };
    if (valid(next)) piece = next;
  }

  function gameOver() {
    over = true;
    running = false;
    overlayEl.hidden = false;
    overlayEl.textContent = `Game over · ${score}\nStart again`;
    hintEl.textContent = "Start / Enter to play again";
    syncUI();
  }

  function showTitle() {
    started = false;
    running = false;
    paused = false;
    over = false;
    score = 0;
    lines = 0;
    level = startLevel;
    grid = emptyGrid();
    piece = null;
    nextType = takeFromBag();
    fit();
    drawNext();
    overlayEl.hidden = false;
    overlayEl.textContent = "Press Start\n← → ↓ ↑ / Space";
    hintEl.textContent = "Clear lines · ←→ move · ↑ rotate · Space hard drop";
    syncUI();
  }

  function startGame() {
    fit();
    score = 0;
    lines = 0;
    level = startLevel;
    dropMs = levelSpeed(level);
    dropAcc = 0;
    last = 0;
    over = false;
    paused = false;
    started = true;
    running = true;
    grid = emptyGrid();
    bag = [];
    nextType = takeFromBag();
    piece = spawn(takeFromBag());
    drawNext();
    overlayEl.hidden = true;
    hintEl.textContent = "←→ move · ↑/X rotate · ↓ soft · Space hard · P pause";
    syncUI();
  }

  function drawCell(x, y, type, context, ox, oy, size) {
    if (y < 0) return;
    context.fillStyle = COLORS[type] || "#fff";
    context.fillRect(ox + x * size, oy + y * size, size - 1, size - 1);
    context.fillStyle = "rgba(255,255,255,0.18)";
    context.fillRect(ox + x * size, oy + y * size, size - 1, Math.max(2, size * 0.22));
  }

  function drawNext() {
    const size = 24;
    nextCtx.fillStyle = "#060b14";
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (!nextType) return;
    const cells = SHAPES[nextType][0];
    const xs = cells.map((c) => c[0]);
    const ys = cells.map((c) => c[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const w = maxX - minX + 1;
    const h = maxY - minY + 1;
    const ox = Math.floor((nextCanvas.width - w * size) / 2);
    const oy = Math.floor((nextCanvas.height - h * size) / 2);
    for (const [x, y] of cells) {
      drawCell(x - minX, y - minY, nextType, nextCtx, ox, oy, size);
    }
  }

  function ghostY() {
    if (!piece) return piece?.y ?? 0;
    let g = { ...piece };
    while (valid({ ...g, y: g.y + 1 })) g.y += 1;
    return g.y;
  }

  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = "#060b14";
    ctx.fillRect(0, 0, w, h);

    // playfield background
    ctx.fillStyle = "#0a1220";
    ctx.fillRect(offsetX, offsetY, COLS * cell, ROWS * cell);

    // grid lines
    ctx.strokeStyle = "rgba(154,215,255,0.08)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(offsetX + x * cell + 0.5, offsetY);
      ctx.lineTo(offsetX + x * cell + 0.5, offsetY + ROWS * cell);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY + y * cell + 0.5);
      ctx.lineTo(offsetX + COLS * cell, offsetY + y * cell + 0.5);
      ctx.stroke();
    }

    if (grid) {
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          if (grid[y][x]) drawCell(x, y, grid[y][x], ctx, offsetX, offsetY, cell);
        }
      }
    }

    if (piece && started) {
      const gy = ghostY();
      ctx.globalAlpha = 0.25;
      for (const [x, y] of cellsOf({ ...piece, y: gy })) {
        drawCell(x, y, piece.type, ctx, offsetX, offsetY, cell);
      }
      ctx.globalAlpha = 1;
      for (const [x, y] of cellsOf(piece)) {
        drawCell(x, y, piece.type, ctx, offsetX, offsetY, cell);
      }
    }

    if (paused && running) {
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0, 0, w, h);
    }
  }

  function loop(ts) {
    if (!last) last = ts;
    const dt = Math.min(40, ts - last);
    last = ts;

    if (running && !paused && !over && piece) {
      dropAcc += dt;
      const soft = keys.down ? dropMs / 12 : dropMs;
      while (dropAcc >= soft) {
        dropAcc -= soft;
        if (!softDrop(keys.down) && keys.down) break;
        if (!running) break;
      }
    }

    draw();
    requestAnimationFrame(loop);
  }

  const keys = { down: false };

  settingsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".step-btn");
    if (!btn) return;
    const dir = Number(btn.dataset.dir);
    startLevel = Math.min(15, Math.max(1, startLevel + dir));
    syncUI();
  });

  btnStart.addEventListener("click", () => startGame());

  window.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      startGame();
      return;
    }
    if (e.key === "p" || e.key === "P") {
      e.preventDefault();
      if (!started || over) return;
      paused = !paused;
      overlayEl.hidden = !paused;
      overlayEl.textContent = paused ? "Paused" : "";
      if (!paused) overlayEl.hidden = true;
      return;
    }
    if (!started || over || paused || !piece) return;

    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
      e.preventDefault();
      keys.down = true;
    } else if (e.key === "ArrowUp" || e.key === "x" || e.key === "X" || e.key === "w" || e.key === "W") {
      e.preventDefault();
      rotate(1);
    } else if (e.key === "z" || e.key === "Z") {
      e.preventDefault();
      rotate(-1);
    } else if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      hardDrop();
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") keys.down = false;
  });

  window.addEventListener("resize", () => {
    fit();
    draw();
    drawNext();
  });

  requestAnimationFrame(() => {
    showTitle();
    draw();
  });
  requestAnimationFrame(loop);
})();
