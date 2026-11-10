(() => {
  const ROWS = 6;
  const COLS = 7;
  const EMPTY = 0;
  const RED = 1;
  const YELLOW = 2;

  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const overlayEl = document.getElementById("overlay");
  const hintEl = document.getElementById("hint");
  const turnEl = document.getElementById("turn");
  const btnStart = document.getElementById("btn-start");
  const boardWrap = document.querySelector(".board-wrap");
  const redEl = document.getElementById("score-red");
  const yellowEl = document.getElementById("score-yellow");
  const modeEl = document.getElementById("cfg-mode");
  const diffVal = document.getElementById("val-diff");
  const settingsEl = document.querySelector(".settings");

  let board;
  let current = RED;
  let started = false;
  let over = false;
  let winner = null;
  let winCells = [];
  let hoverCol = -1;
  let scoreRed = 0;
  let scoreYellow = 0;
  let difficulty = 3;
  let busy = false;
  let cell = 70;
  let ox = 0;
  let oy = 0;

  function syncUI() {
    diffVal.textContent = String(difficulty);
    redEl.textContent = String(scoreRed);
    yellowEl.textContent = String(scoreYellow);
    btnStart.textContent = started ? "New round" : "Start";
    if (!started) turnEl.textContent = "Press Start";
    else if (over) {
      turnEl.textContent =
        winner === RED ? "Red wins!" : winner === YELLOW ? "Yellow wins!" : "Draw";
    } else {
      turnEl.textContent = current === RED ? "Red's turn" : "Yellow's turn";
    }
  }

  function emptyBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
  }

  function fit() {
    const w = Math.max(280, Math.floor(boardWrap?.clientWidth || 700));
    const h = Math.max(240, Math.floor(boardWrap?.clientHeight || 600));
    canvas.width = w;
    canvas.height = h;
    cell = Math.floor(Math.min(w / COLS, h / (ROWS + 0.35)));
    ox = Math.floor((w - COLS * cell) / 2);
    oy = Math.floor((h - ROWS * cell) / 2 + cell * 0.1);
  }

  function showTitle() {
    started = false;
    over = false;
    winner = null;
    winCells = [];
    board = emptyBoard();
    current = RED;
    busy = false;
    fit();
    overlayEl.hidden = false;
    overlayEl.textContent = "Press Start\nClick a column";
    hintEl.textContent = "Click column or press 1–7 · get four in a row";
    syncUI();
  }

  function startGame() {
    started = true;
    over = false;
    winner = null;
    winCells = [];
    board = emptyBoard();
    current = RED;
    busy = false;
    fit();
    overlayEl.hidden = true;
    hintEl.textContent = "Click column or 1–7 · Enter new round";
    syncUI();
  }

  function nextOpenRow(col, b = board) {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (b[r][col] === EMPTY) return r;
    }
    return -1;
  }

  function validCols(b = board) {
    const out = [];
    for (let c = 0; c < COLS; c++) if (nextOpenRow(c, b) !== -1) out.push(c);
    return out;
  }

  function checkWin(b = board) {
    const dirs = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const p = b[r][c];
        if (!p) continue;
        for (const [dr, dc] of dirs) {
          const cells = [];
          for (let i = 0; i < 4; i++) {
            const rr = r + dr * i;
            const cc = c + dc * i;
            if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS || b[rr][cc] !== p) {
              cells.length = 0;
              break;
            }
            cells.push([rr, cc]);
          }
          if (cells.length === 4) return { player: p, cells };
        }
      }
    }
    return null;
  }

  function endGame(result) {
    over = true;
    busy = false;
    if (result) {
      winner = result.player;
      winCells = result.cells;
      if (winner === RED) scoreRed += 1;
      else scoreYellow += 1;
      overlayEl.hidden = false;
      overlayEl.textContent =
        winner === RED ? "Red wins!\nEnter = new" : "Yellow wins!\nEnter = new";
    } else {
      winner = null;
      winCells = [];
      overlayEl.hidden = false;
      overlayEl.textContent = "Draw\nEnter = new";
    }
    syncUI();
  }

  function drop(col) {
    if (!started || over || busy) return false;
    const row = nextOpenRow(col);
    if (row < 0) return false;
    board[row][col] = current;
    const win = checkWin();
    if (win) {
      endGame(win);
      return true;
    }
    if (!validCols().length) {
      endGame(null);
      return true;
    }
    current = current === RED ? YELLOW : RED;
    syncUI();
    return true;
  }

  // --- simple CPU (minimax depth = difficulty) ---
  function scoreWindow(window, piece) {
    const opp = piece === RED ? YELLOW : RED;
    const count = (p) => window.filter((x) => x === p).length;
    const mine = count(piece);
    const theirs = count(opp);
    const empties = count(EMPTY);
    if (mine === 4) return 100000;
    if (mine === 3 && empties === 1) return 100;
    if (mine === 2 && empties === 2) return 10;
    if (theirs === 3 && empties === 1) return -120;
    if (theirs === 2 && empties === 2) return -8;
    return 0;
  }

  function evaluate(b, piece) {
    let score = 0;
    const center = Math.floor(COLS / 2);
    for (let r = 0; r < ROWS; r++) if (b[r][center] === piece) score += 6;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        score += scoreWindow([b[r][c], b[r][c + 1], b[r][c + 2], b[r][c + 3]], piece);
      }
    }
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS - 3; r++) {
        score += scoreWindow([b[r][c], b[r + 1][c], b[r + 2][c], b[r + 3][c]], piece);
      }
    }
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        score += scoreWindow(
          [b[r][c], b[r + 1][c + 1], b[r + 2][c + 2], b[r + 3][c + 3]],
          piece
        );
      }
    }
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        score += scoreWindow(
          [b[r][c], b[r - 1][c + 1], b[r - 2][c + 2], b[r - 3][c + 3]],
          piece
        );
      }
    }
    return score;
  }

  function cloneBoard(b) {
    return b.map((row) => row.slice());
  }

  function minimax(b, depth, alpha, beta, maximizing) {
    const win = checkWin(b);
    if (win) return win.player === YELLOW ? 1000000 + depth : -1000000 - depth;
    const moves = validCols(b);
    if (!moves.length || depth === 0) return evaluate(b, YELLOW);

    if (maximizing) {
      let value = -Infinity;
      for (const col of moves) {
        const next = cloneBoard(b);
        next[nextOpenRow(col, next)][col] = YELLOW;
        value = Math.max(value, minimax(next, depth - 1, alpha, beta, false));
        alpha = Math.max(alpha, value);
        if (alpha >= beta) break;
      }
      return value;
    }
    let value = Infinity;
    for (const col of moves) {
      const next = cloneBoard(b);
      next[nextOpenRow(col, next)][col] = RED;
      value = Math.min(value, minimax(next, depth - 1, alpha, beta, true));
      beta = Math.min(beta, value);
      if (alpha >= beta) break;
    }
    return value;
  }

  function cpuMove() {
    if (!started || over || current !== YELLOW || modeEl.value !== "cpu") return;
    busy = true;
    const depth = difficulty;
    const moves = validCols();
    let bestCol = moves[Math.floor(Math.random() * moves.length)];
    let bestScore = -Infinity;
    for (const col of moves) {
      const next = cloneBoard(board);
      next[nextOpenRow(col, next)][col] = YELLOW;
      const score = minimax(next, depth - 1, -Infinity, Infinity, false);
      if (score > bestScore) {
        bestScore = score;
        bestCol = col;
      }
    }
    setTimeout(() => {
      busy = false;
      if (!over && current === YELLOW) {
        drop(bestCol);
        // if somehow still yellow (shouldn't), don't recurse infinitely
      }
    }, 280);
  }

  function afterHumanMove() {
    if (!over && modeEl.value === "cpu" && current === YELLOW) cpuMove();
  }

  function colFromEvent(clientX) {
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) * canvas.width) / rect.width;
    const col = Math.floor((x - ox) / cell);
    if (col < 0 || col >= COLS) return -1;
    return col;
  }

  function playCol(col) {
    if (col < 0 || busy) return;
    if (modeEl.value === "cpu" && current !== RED) return;
    if (drop(col)) afterHumanMove();
  }

  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = "#0d2244";
    ctx.fillRect(0, 0, w, h);

    // frame
    ctx.fillStyle = "#1d4e89";
    ctx.fillRect(ox - 8, oy - 8, COLS * cell + 16, ROWS * cell + 16);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cx = ox + c * cell + cell / 2;
        const cy = oy + r * cell + cell / 2;
        const rad = cell * 0.38;

        ctx.beginPath();
        ctx.fillStyle = "#0a2748";
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();

        const p = board?.[r]?.[c] || EMPTY;
        if (p) {
          ctx.beginPath();
          ctx.fillStyle = p === RED ? "#e63946" : "#ffd166";
          ctx.arc(cx, cy, rad * 0.92, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.22)";
          ctx.beginPath();
          ctx.arc(cx - rad * 0.25, cy - rad * 0.25, rad * 0.28, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // hover ghost
    if (started && !over && !busy && hoverCol >= 0 && nextOpenRow(hoverCol) !== -1) {
      const piece = modeEl.value === "cpu" ? RED : current;
      const cx = ox + hoverCol * cell + cell / 2;
      const cy = oy - cell * 0.35;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.fillStyle = piece === RED ? "#e63946" : "#ffd166";
      ctx.arc(cx, cy, cell * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // win highlight
    for (const [r, c] of winCells) {
      const cx = ox + c * cell + cell / 2;
      const cy = oy + r * cell + cell / 2;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = Math.max(3, cell * 0.08);
      ctx.beginPath();
      ctx.arc(cx, cy, cell * 0.42, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function loop() {
    draw();
    requestAnimationFrame(loop);
  }

  settingsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".step-btn");
    if (!btn) return;
    const dir = Number(btn.dataset.dir);
    difficulty = Math.min(5, Math.max(1, difficulty + dir));
    syncUI();
  });

  btnStart.addEventListener("click", () => startGame());

  canvas.addEventListener("mousemove", (e) => {
    hoverCol = colFromEvent(e.clientX);
  });
  canvas.addEventListener("mouseleave", () => {
    hoverCol = -1;
  });
  canvas.addEventListener("click", (e) => {
    playCol(colFromEvent(e.clientX));
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      startGame();
      return;
    }
    if (/^[1-7]$/.test(e.key)) {
      e.preventDefault();
      playCol(Number(e.key) - 1);
    }
  });

  window.addEventListener("resize", () => fit());

  requestAnimationFrame(() => {
    showTitle();
  });
  requestAnimationFrame(loop);
})();
