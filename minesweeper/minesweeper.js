(() => {
  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const overlayEl = document.getElementById("overlay");
  const hintEl = document.getElementById("hint");
  const btnStart = document.getElementById("btn-start");
  const boardWrap = document.querySelector(".board-wrap");
  const minesLeftEl = document.getElementById("mines-left");
  const timerEl = document.getElementById("timer");
  const colsVal = document.getElementById("val-cols");
  const rowsVal = document.getElementById("val-rows");
  const minesVal = document.getElementById("val-mines");
  const settingsEl = document.querySelector(".settings");
  const presetsEl = document.querySelector(".presets");

  const PRESETS = {
    beginner: { cols: 9, rows: 9, mines: 10 },
    intermediate: { cols: 16, rows: 16, mines: 40 },
    expert: { cols: 30, rows: 16, mines: 99 },
  };

  const NUM_COLORS = [
    null,
    "#4ea1ff",
    "#3ecf7a",
    "#e85a5a",
    "#7a6cff",
    "#c45c26",
    "#2bb8c9",
    "#e8eef4",
    "#9aa5b1",
  ];

  let cols = 9;
  let rows = 9;
  let mineCount = 10;

  let grid = [];
  let started = false;
  let dead = false;
  let won = false;
  let flags = 0;
  let revealed = 0;
  let seconds = 0;
  let timerId = null;
  let hover = { c: -1, r: -1 };
  let cell = 30;
  let ox = 0;
  let oy = 0;

  function maxMines() {
    return Math.max(1, cols * rows - 9);
  }

  function clampMines() {
    mineCount = Math.max(1, Math.min(maxMines(), mineCount));
  }

  function syncUI() {
    colsVal.textContent = String(cols);
    rowsVal.textContent = String(rows);
    minesVal.textContent = String(mineCount);
    minesLeftEl.textContent = String(Math.max(0, mineCount - flags));
    timerEl.textContent = String(seconds);
    btnStart.textContent = started ? "New" : "New";
  }

  function showOverlay(text) {
    overlayEl.hidden = false;
    overlayEl.textContent = text;
  }

  function hideOverlay() {
    overlayEl.hidden = true;
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function startTimer() {
    stopTimer();
    timerId = setInterval(() => {
      if (dead || won) return;
      seconds += 1;
      timerEl.textContent = String(seconds);
    }, 1000);
  }

  function fit() {
    const w = Math.max(280, Math.floor(boardWrap?.clientWidth || 540));
    const h = Math.max(280, Math.floor(boardWrap?.clientHeight || 540));
    canvas.width = w;
    canvas.height = h;
    const pad = 10;
    cell = Math.floor(Math.min((w - pad * 2) / cols, (h - pad * 2) / rows));
    cell = Math.max(14, cell);
    ox = Math.floor((w - cols * cell) / 2);
    oy = Math.floor((h - rows * cell) / 2);
  }

  function idx(c, r) {
    return r * cols + c;
  }

  function inBounds(c, r) {
    return c >= 0 && r >= 0 && c < cols && r < rows;
  }

  function neighbors(c, r) {
    const out = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nc = c + dx;
        const nr = r + dy;
        if (inBounds(nc, nr)) out.push([nc, nr]);
      }
    }
    return out;
  }

  function makeCell() {
    return { mine: false, open: false, flag: false, adj: 0 };
  }

  function resetBoard() {
    stopTimer();
    grid = Array.from({ length: cols * rows }, makeCell);
    started = false;
    dead = false;
    won = false;
    flags = 0;
    revealed = 0;
    seconds = 0;
    hideOverlay();
    hintEl.textContent = "Left-click open · right-click flag · first click is safe";
    syncUI();
    draw();
  }

  function placeMines(safeC, safeR) {
    const forbidden = new Set();
    forbidden.add(idx(safeC, safeR));
    for (const [nc, nr] of neighbors(safeC, safeR)) {
      forbidden.add(idx(nc, nr));
    }
    const slots = [];
    for (let i = 0; i < cols * rows; i++) {
      if (!forbidden.has(i)) slots.push(i);
    }
    // Fisher–Yates partial shuffle
    const n = Math.min(mineCount, slots.length);
    for (let i = 0; i < n; i++) {
      const j = i + Math.floor(Math.random() * (slots.length - i));
      [slots[i], slots[j]] = [slots[j], slots[i]];
      grid[slots[i]].mine = true;
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = grid[idx(c, r)];
        if (cell.mine) {
          cell.adj = 0;
          continue;
        }
        let nAdj = 0;
        for (const [nc, nr] of neighbors(c, r)) {
          if (grid[idx(nc, nr)].mine) nAdj++;
        }
        cell.adj = nAdj;
      }
    }
  }

  function floodOpen(c, r) {
    const stack = [[c, r]];
    const seen = new Set();
    while (stack.length) {
      const [cc, rr] = stack.pop();
      const key = idx(cc, rr);
      if (seen.has(key)) continue;
      seen.add(key);
      const cell = grid[key];
      if (cell.open || cell.flag || cell.mine) continue;
      cell.open = true;
      revealed += 1;
      if (cell.adj === 0) {
        for (const [nc, nr] of neighbors(cc, rr)) {
          const n = grid[idx(nc, nr)];
          if (!n.open && !n.flag) stack.push([nc, nr]);
        }
      }
    }
  }

  function checkWin() {
    const safe = cols * rows - mineCount;
    if (revealed >= safe) {
      won = true;
      stopTimer();
      // auto-flag remaining mines
      for (const cell of grid) {
        if (cell.mine && !cell.flag) {
          cell.flag = true;
          flags += 1;
        }
      }
      syncUI();
      showOverlay(`Cleared!\n${seconds}s`);
      hintEl.textContent = "All clear · New / Enter for another board";
    }
  }

  function lose(hitC, hitR) {
    dead = true;
    stopTimer();
    for (const cell of grid) {
      if (cell.mine) cell.open = true;
    }
    grid[idx(hitC, hitR)].boom = true;
    showOverlay("Boom!\nEnter = new");
    hintEl.textContent = "Hit a mine · New / Enter to try again";
    syncUI();
  }

  function openCell(c, r) {
    if (dead || won) return;
    const cell = grid[idx(c, r)];
    if (cell.open || cell.flag) return;

    if (!started) {
      placeMines(c, r);
      started = true;
      startTimer();
      hideOverlay();
    }

    if (cell.mine) {
      lose(c, r);
      draw();
      return;
    }

    if (cell.adj === 0) floodOpen(c, r);
    else {
      cell.open = true;
      revealed += 1;
    }
    checkWin();
    syncUI();
    draw();
  }

  function toggleFlag(c, r) {
    if (dead || won) return;
    const cell = grid[idx(c, r)];
    if (cell.open) return;
    cell.flag = !cell.flag;
    flags += cell.flag ? 1 : -1;
    syncUI();
    draw();
  }

  function chord(c, r) {
    // open neighbors when flags match adjacent count
    if (dead || won) return;
    const cell = grid[idx(c, r)];
    if (!cell.open || cell.adj === 0) return;
    let flagged = 0;
    const closed = [];
    for (const [nc, nr] of neighbors(c, r)) {
      const n = grid[idx(nc, nr)];
      if (n.flag) flagged++;
      else if (!n.open) closed.push([nc, nr]);
    }
    if (flagged !== cell.adj) return;
    for (const [nc, nr] of closed) openCell(nc, nr);
  }

  function cellAt(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    const c = Math.floor((x - ox) / cell);
    const r = Math.floor((y - oy) / cell);
    if (!inBounds(c, r)) return null;
    return { c, r };
  }

  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = "#141c26";
    ctx.fillRect(0, 0, w, h);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = ox + c * cell;
        const y = oy + r * cell;
        const s = cell - 1;
        const t = grid[idx(c, r)];
        const isHover = hover.c === c && hover.r === r && !t.open;

        if (t.open) {
          ctx.fillStyle = t.boom ? "#6b1f1f" : "#1c2836";
          ctx.fillRect(x, y, s, s);
          if (t.mine) {
            ctx.fillStyle = t.boom ? "#ff6b6b" : "#cfd8e3";
            const cx = x + s / 2;
            const cy = y + s / 2;
            const rad = Math.max(3, s * 0.22);
            ctx.beginPath();
            ctx.arc(cx, cy, rad, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = ctx.fillStyle;
            ctx.lineWidth = Math.max(1, s * 0.06);
            for (let a = 0; a < 4; a++) {
              const ang = (a * Math.PI) / 4;
              ctx.beginPath();
              ctx.moveTo(cx + Math.cos(ang) * rad * 0.4, cy + Math.sin(ang) * rad * 0.4);
              ctx.lineTo(cx + Math.cos(ang) * rad * 1.55, cy + Math.sin(ang) * rad * 1.55);
              ctx.stroke();
            }
          } else if (t.adj > 0) {
            ctx.fillStyle = NUM_COLORS[t.adj];
            ctx.font = `700 ${Math.floor(s * 0.58)}px "Space Grotesk", sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(String(t.adj), x + s / 2, y + s / 2 + 1);
          }
        } else {
          // raised tile
          ctx.fillStyle = isHover ? "#3a4d63" : "#2a3a4c";
          ctx.fillRect(x, y, s, s);
          ctx.fillStyle = "rgba(255,255,255,0.14)";
          ctx.fillRect(x, y, s, 2);
          ctx.fillRect(x, y, 2, s);
          ctx.fillStyle = "rgba(0,0,0,0.28)";
          ctx.fillRect(x, y + s - 2, s, 2);
          ctx.fillRect(x + s - 2, y, 2, s);

          if (t.flag) {
            const poleX = x + s * 0.32;
            ctx.strokeStyle = "#d7dee8";
            ctx.lineWidth = Math.max(1.5, s * 0.07);
            ctx.beginPath();
            ctx.moveTo(poleX, y + s * 0.22);
            ctx.lineTo(poleX, y + s * 0.78);
            ctx.stroke();
            ctx.fillStyle = "#e85a5a";
            ctx.beginPath();
            ctx.moveTo(poleX, y + s * 0.22);
            ctx.lineTo(x + s * 0.72, y + s * 0.36);
            ctx.lineTo(poleX, y + s * 0.5);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
    }

    // grid outline
    ctx.strokeStyle = "rgba(230,237,244,0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(ox - 1, oy - 1, cols * cell + 1, rows * cell + 1);
  }

  function newGame() {
    clampMines();
    fit();
    resetBoard();
    showOverlay("Click a cell\nRight-click to flag");
  }

  settingsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".step-btn");
    if (!btn) return;
    const step = btn.closest(".step");
    const dir = Number(btn.dataset.dir);
    const setting = step?.dataset.setting;
    if (setting === "cols") cols = Math.max(5, Math.min(40, cols + dir));
    if (setting === "rows") rows = Math.max(5, Math.min(30, rows + dir));
    if (setting === "mines") mineCount = Math.max(1, Math.min(maxMines(), mineCount + dir));
    clampMines();
    newGame();
  });

  presetsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".preset");
    if (!btn) return;
    const p = PRESETS[btn.dataset.preset];
    if (!p) return;
    cols = p.cols;
    rows = p.rows;
    mineCount = p.mines;
    newGame();
  });

  btnStart.addEventListener("click", () => newGame());

  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  canvas.addEventListener("pointerdown", (e) => {
    const pos = cellAt(e.clientX, e.clientY);
    if (!pos) return;
    if (e.button === 2 || e.altKey || e.ctrlKey || e.metaKey) {
      toggleFlag(pos.c, pos.r);
      return;
    }
    if (e.button === 1 || e.shiftKey) {
      chord(pos.c, pos.r);
      return;
    }
    if (e.button === 0) {
      const cell = grid[idx(pos.c, pos.r)];
      if (cell.open) chord(pos.c, pos.r);
      else openCell(pos.c, pos.r);
    }
  });

  canvas.addEventListener("pointermove", (e) => {
    const pos = cellAt(e.clientX, e.clientY);
    const nc = pos ? pos.c : -1;
    const nr = pos ? pos.r : -1;
    if (nc === hover.c && nr === hover.r) return;
    hover = { c: nc, r: nr };
    draw();
  });

  canvas.addEventListener("pointerleave", () => {
    hover = { c: -1, r: -1 };
    draw();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      newGame();
    }
    if ((e.key === "f" || e.key === "F") && hover.c >= 0) {
      e.preventDefault();
      toggleFlag(hover.c, hover.r);
    }
  });

  window.addEventListener("resize", () => {
    fit();
    draw();
  });

  newGame();
})();
