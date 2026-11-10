(() => {
  // # wall  @ player  + player on goal  $ box  * box on goal  . goal  space floor
  const LEVELS = [
    [
      "#####",
      "#.@ #",
      "# $ #",
      "#  .#",
      "#####",
    ],
    [
      "######",
      "#.   #",
      "# $$ #",
      "#.@  #",
      "#  . #",
      "######",
    ],
    [
      "  ####",
      "###  ####",
      "#   $   #",
      "# #  #$ #",
      "# .@.   #",
      "#########",
    ],
    [
      "########",
      "#      #",
      "# .**$ #",
      "#  $@$ #",
      "#  ..  #",
      "########",
    ],
    [
      "  #####",
      "###   #",
      "#.$ # #",
      "# # $.#",
      "#.$ #@#",
      "#   ###",
      "#####",
    ],
    [
      "#######",
      "#. # .#",
      "# $$$ #",
      "#. @ .#",
      "# $$$ #",
      "#. # .#",
      "#######",
    ],
    [
      "  ######",
      "  #    #",
      "  # ##$#",
      "### #  #",
      "#  $ . #",
      "# @ #. #",
      "#  $  ##",
      "###  ##",
      "  ####",
    ],
    [
      "#########",
      "#   .   #",
      "# $ $ $ #",
      "#. $@$ .#",
      "# $ $ $ #",
      "#   .   #",
      "#########",
    ],
  ];

  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const overlayEl = document.getElementById("overlay");
  const hintEl = document.getElementById("hint");
  const btnStart = document.getElementById("btn-start");
  const btnUndo = document.getElementById("btn-undo");
  const btnReset = document.getElementById("btn-reset");
  const boardWrap = document.querySelector(".board-wrap");
  const levelEl = document.getElementById("level");
  const movesEl = document.getElementById("moves");
  const pushesEl = document.getElementById("pushes");
  const levelVal = document.getElementById("val-level");
  const settingsEl = document.querySelector(".settings");

  let levelIndex = 0;
  let grid; // 2d of chars for static: # . and floor ' '
  let boxes; // Set "x,y"
  let goals; // Set "x,y"
  let player;
  let moves = 0;
  let pushes = 0;
  let history = [];
  let started = false;
  let won = false;
  let cell = 32;
  let ox = 0;
  let oy = 0;
  let rows = 0;
  let cols = 0;

  function key(x, y) {
    return `${x},${y}`;
  }

  function syncUI() {
    levelVal.textContent = String(levelIndex + 1);
    levelEl.textContent = String(levelIndex + 1);
    movesEl.textContent = String(moves);
    pushesEl.textContent = String(pushes);
    btnStart.textContent = started && !won ? "Restart level" : "Start";
  }

  function parseLevel(lines) {
    cols = Math.max(...lines.map((l) => l.length));
    rows = lines.length;
    grid = Array.from({ length: rows }, () => Array(cols).fill(" "));
    boxes = new Set();
    goals = new Set();
    player = { x: 1, y: 1 };

    for (let y = 0; y < rows; y++) {
      const line = lines[y].padEnd(cols, " ");
      for (let x = 0; x < cols; x++) {
        const ch = line[x];
        if (ch === "#") grid[y][x] = "#";
        else if (ch === ".") {
          grid[y][x] = " ";
          goals.add(key(x, y));
        } else if (ch === "$") {
          grid[y][x] = " ";
          boxes.add(key(x, y));
        } else if (ch === "*") {
          grid[y][x] = " ";
          boxes.add(key(x, y));
          goals.add(key(x, y));
        } else if (ch === "@") {
          grid[y][x] = " ";
          player = { x, y };
        } else if (ch === "+") {
          grid[y][x] = " ";
          goals.add(key(x, y));
          player = { x, y };
        } else {
          grid[y][x] = " ";
        }
      }
    }
  }

  function fit() {
    const w = Math.max(200, Math.floor(boardWrap?.clientWidth || 640));
    const h = Math.max(200, Math.floor(boardWrap?.clientHeight || 640));
    canvas.width = w;
    canvas.height = h;
    if (!cols || !rows) return;
    cell = Math.floor(Math.min(w / cols, h / rows));
    ox = Math.floor((w - cols * cell) / 2);
    oy = Math.floor((h - rows * cell) / 2);
  }

  function snapshot() {
    return {
      boxes: new Set(boxes),
      player: { ...player },
      moves,
      pushes,
    };
  }

  function restore(s) {
    boxes = new Set(s.boxes);
    player = { ...s.player };
    moves = s.moves;
    pushes = s.pushes;
  }

  function isWall(x, y) {
    if (y < 0 || y >= rows || x < 0 || x >= cols) return true;
    return grid[y][x] === "#";
  }

  function hasBox(x, y) {
    return boxes.has(key(x, y));
  }

  function tryMove(dx, dy) {
    if (!started || won) return;
    const nx = player.x + dx;
    const ny = player.y + dy;
    if (isWall(nx, ny)) return;

    const snap = snapshot();

    if (hasBox(nx, ny)) {
      const bx = nx + dx;
      const by = ny + dy;
      if (isWall(bx, by) || hasBox(bx, by)) return;
      boxes.delete(key(nx, ny));
      boxes.add(key(bx, by));
      pushes += 1;
    }

    player.x = nx;
    player.y = ny;
    moves += 1;
    history.push(snap);
    syncUI();
    checkWin();
  }

  function checkWin() {
    for (const g of goals) {
      if (!boxes.has(g)) return;
    }
    won = true;
    overlayEl.hidden = false;
    if (levelIndex < LEVELS.length - 1) {
      overlayEl.textContent = `Level ${levelIndex + 1} clear!\nEnter = next`;
      hintEl.textContent = "Enter / Start for next level";
    } else {
      overlayEl.textContent = `All levels clear!\nMoves ${moves}`;
      hintEl.textContent = "Pick a level or Start to replay";
    }
  }

  function loadLevel(index) {
    levelIndex = Math.max(0, Math.min(LEVELS.length - 1, index));
    parseLevel(LEVELS[levelIndex]);
    moves = 0;
    pushes = 0;
    history = [];
    won = false;
    started = true;
    fit();
    overlayEl.hidden = true;
    hintEl.textContent = "Arrows / WASD · U undo · R reset";
    syncUI();
  }

  function showTitle() {
    started = false;
    won = false;
    parseLevel(LEVELS[levelIndex]);
    moves = 0;
    pushes = 0;
    history = [];
    fit();
    overlayEl.hidden = false;
    overlayEl.textContent = "Press Start\nPush boxes to targets";
    hintEl.textContent = "Arrows / WASD · U undo · R reset";
    syncUI();
  }

  function undo() {
    if (!history.length || won) return;
    restore(history.pop());
    syncUI();
  }

  function reset() {
    loadLevel(levelIndex);
  }

  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = "#3d4f61";
    ctx.fillRect(0, 0, w, h);

    if (!grid) return;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const px = ox + x * cell;
        const py = oy + y * cell;
        if (grid[y][x] === "#") {
          ctx.fillStyle = "#1b2834";
          ctx.fillRect(px, py, cell, cell);
          ctx.fillStyle = "#2c3e50";
          ctx.fillRect(px + 2, py + 2, cell - 4, cell - 4);
          continue;
        }

        ctx.fillStyle = "#5d7290";
        ctx.fillRect(px, py, cell, cell);

        if (goals.has(key(x, y))) {
          ctx.strokeStyle = "#f1c40f";
          ctx.lineWidth = Math.max(2, cell * 0.08);
          ctx.beginPath();
          ctx.arc(px + cell / 2, py + cell / 2, cell * 0.18, 0, Math.PI * 2);
          ctx.stroke();
        }

        if (boxes.has(key(x, y))) {
          const onGoal = goals.has(key(x, y));
          ctx.fillStyle = onGoal ? "#27ae60" : "#e67e22";
          ctx.fillRect(px + cell * 0.12, py + cell * 0.12, cell * 0.76, cell * 0.76);
          ctx.fillStyle = "rgba(255,255,255,0.2)";
          ctx.fillRect(px + cell * 0.12, py + cell * 0.12, cell * 0.76, cell * 0.18);
        }
      }
    }

    // player
    const ppx = ox + player.x * cell;
    const ppy = oy + player.y * cell;
    ctx.fillStyle = "#3498db";
    ctx.beginPath();
    ctx.arc(ppx + cell / 2, ppy + cell / 2, cell * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(ppx + cell * 0.4, ppy + cell * 0.42, cell * 0.07, 0, Math.PI * 2);
    ctx.arc(ppx + cell * 0.6, ppy + cell * 0.42, cell * 0.07, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    draw();
    requestAnimationFrame(loop);
  }

  settingsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".step-btn");
    if (!btn) return;
    const dir = Number(btn.dataset.dir);
    const next = levelIndex + dir;
    if (next < 0 || next >= LEVELS.length) return;
    loadLevel(next);
  });

  btnStart.addEventListener("click", () => {
    if (won && levelIndex < LEVELS.length - 1) loadLevel(levelIndex + 1);
    else loadLevel(levelIndex);
  });
  btnUndo.addEventListener("click", () => undo());
  btnReset.addEventListener("click", () => reset());

  window.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (won && levelIndex < LEVELS.length - 1) loadLevel(levelIndex + 1);
      else loadLevel(levelIndex);
      return;
    }
    if (e.key === "u" || e.key === "U") {
      e.preventDefault();
      undo();
      return;
    }
    if (e.key === "r" || e.key === "R") {
      e.preventDefault();
      reset();
      return;
    }
    if (!started) return;
    const map = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      w: [0, -1],
      W: [0, -1],
      s: [0, 1],
      S: [0, 1],
      a: [-1, 0],
      A: [-1, 0],
      d: [1, 0],
      D: [1, 0],
    };
    const d = map[e.key];
    if (!d) return;
    e.preventDefault();
    tryMove(d[0], d[1]);
  });

  window.addEventListener("resize", () => {
    fit();
  });

  requestAnimationFrame(() => {
    showTitle();
  });
  requestAnimationFrame(loop);
})();
