(() => {
  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const overlayEl = document.getElementById("overlay");
  const hintEl = document.getElementById("hint");
  const statusEl = document.getElementById("status");
  const btnStart = document.getElementById("btn-start");
  const btnHint = document.getElementById("btn-hint");
  const btnAi = document.getElementById("btn-ai");
  const btnBack = document.getElementById("btn-back");
  const boardWrap = document.querySelector(".board-wrap");
  const levelVal = document.getElementById("val-level");
  const levelRange = document.getElementById("level-range");
  const levelMeta = document.getElementById("level-meta");
  const settingsEl = document.querySelector(".settings");
  const setupPhaseEl = document.getElementById("setup-phase");
  const setupTitleEl = document.getElementById("setup-title");
  const setupSubEl = document.getElementById("setup-sub");
  const capBlackEl = document.getElementById("cap-black");
  const capWhiteEl = document.getElementById("cap-white");

  const ENGINE_JS = "/chessmulti/stockfish-19.js";
  const ENGINE_WASM = "/chessmulti/stockfish-19.wasm";
  const ENGINE_THREADS = Math.max(1, Math.min(navigator.hardwareConcurrency || 4, 8));
  const GLYPH = {
    wk: "♔", wq: "♕", wr: "♖", wb: "♗", wn: "♘", wp: "♙",
    bk: "♚", bq: "♛", br: "♜", bb: "♝", bn: "♞", bp: "♟",
  };

  const START = [
    ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"],
    ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
    ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"],
  ];

  let level = 20;
  let board = [];
  let turn = "w";
  let selected = null;
  let legal = [];
  let lastMove = null;
  let gameOver = false;
  let thinking = false;
  let castle = { wK: true, wQ: true, bK: true, bQ: true };
  let ep = null;
  let captured = { w: [], b: [] };
  let uciMoves = [];
  let ox = 0;
  let oy = 0;
  let size = 70;
  let history = [];
  let hintSquares = null;
  let aiMoveMark = null; // AI Move highlight (stays after CPU replies)
  let hintBusy = false;
  let hintPulse = 0;
  let hintAnim = 0;
  let lastNamedSetup = { phase: "Opening", name: "Starting Position", sub: "Play moves to enter a named line" };

  let engine = null;
  let engineReady = false;
  let engineFailed = false;
  let waitBest = null;
  let searchGen = 0;

  function cloneBoard(b) {
    return b.map((row) => row.slice());
  }

  function cloneState() {
    return {
      board: cloneBoard(board),
      turn,
      castle: { ...castle },
      ep: ep ? ep.slice() : null,
      captured: { w: captured.w.slice(), b: captured.b.slice() },
      uciMoves: uciMoves.slice(),
    };
  }

  function restoreState(s) {
    board = s.board;
    turn = s.turn;
    castle = s.castle;
    ep = s.ep;
    captured = s.captured;
    uciMoves = s.uciMoves;
  }

  function colorOf(p) {
    return p ? p[0] : null;
  }
  function typeOf(p) {
    return p ? p[1] : null;
  }
  function enemy(c) {
    return c === "w" ? "b" : "w";
  }
  function inBounds(r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
  }

  function sqName(r, c) {
    return String.fromCharCode(97 + c) + String(8 - r);
  }

  function parseUci(uci) {
    const fc = uci.charCodeAt(0) - 97;
    const fr = 8 - Number(uci[1]);
    const tc = uci.charCodeAt(2) - 97;
    const tr = 8 - Number(uci[3]);
    return [fr, fc, tr, tc];
  }

  /** Guest rating for level 1–100 (800 → 3000). Fair fight ≈ this Elo. */
  function guestRating(lv) {
    const t = (Math.max(1, Math.min(100, lv)) - 1) / 99;
    return Math.round(800 + t * 2200);
  }

  /** Map UI level 1–100 → Elo + think time / depth */
  function levelParams(lv) {
    const t = (lv - 1) / 99;
    const guest = guestRating(lv);
    // Stockfish UCI_Elo only accepts ~1320–3190
    const elo = Math.max(1320, Math.min(3190, guest));
    const movetime = Math.round(60 + t * 2940); // 60ms … ~3s
    const depth = Math.max(1, Math.min(20, Math.round(1 + t * 19)));
    const unlimited = lv >= 100;
    return { guest, elo, movetime, depth, unlimited };
  }

  function levelLabel(lv) {
    const p = levelParams(lv);
    const thr = crossOriginIsolated
      ? `${ENGINE_THREADS} threads`
      : "needs COOP/COEP";
    if (p.unlimited) {
      return `Guest ≈ ${p.guest}+ Elo · full Stockfish · ${thr}`;
    }
    return `Guest ≈ ${p.guest} Elo · multi WASM · ${thr}`;
  }

  function findKing(c, b = board) {
    const k = c + "k";
    for (let r = 0; r < 8; r++) {
      for (let col = 0; col < 8; col++) {
        if (b[r][col] === k) return [r, col];
      }
    }
    return null;
  }

  function attacked(r, c, byColor, b = board) {
    const pr = byColor === "w" ? r + 1 : r - 1;
    for (const dc of [-1, 1]) {
      const pc = c + dc;
      if (inBounds(pr, pc) && b[pr][pc] === byColor + "p") return true;
    }
    for (const [dr, dc] of [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ]) {
      const rr = r + dr;
      const cc = c + dc;
      if (inBounds(rr, cc) && b[rr][cc] === byColor + "n") return true;
    }
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const rr = r + dr;
        const cc = c + dc;
        if (inBounds(rr, cc) && b[rr][cc] === byColor + "k") return true;
      }
    }
    const rays = [
      [1, 0, "rq"], [-1, 0, "rq"], [0, 1, "rq"], [0, -1, "rq"],
      [1, 1, "bq"], [1, -1, "bq"], [-1, 1, "bq"], [-1, -1, "bq"],
    ];
    for (const [dr, dc, kinds] of rays) {
      let rr = r + dr;
      let cc = c + dc;
      while (inBounds(rr, cc)) {
        const p = b[rr][cc];
        if (p) {
          if (colorOf(p) === byColor && kinds.includes(typeOf(p))) return true;
          break;
        }
        rr += dr;
        cc += dc;
      }
    }
    return false;
  }

  function inCheck(c, b = board) {
    const k = findKing(c, b);
    if (!k) return true;
    return attacked(k[0], k[1], enemy(c), b);
  }

  function pushSlide(moves, r, c, dr, dc, me) {
    let rr = r + dr;
    let cc = c + dc;
    while (inBounds(rr, cc)) {
      const t = board[rr][cc];
      if (!t) moves.push([rr, cc]);
      else {
        if (colorOf(t) !== me) moves.push([rr, cc]);
        break;
      }
      rr += dr;
      cc += dc;
    }
  }

  function rawMoves(r, c) {
    const p = board[r][c];
    if (!p) return [];
    const me = colorOf(p);
    const t = typeOf(p);
    const moves = [];

    if (t === "p") {
      const dir = me === "w" ? -1 : 1;
      const start = me === "w" ? 6 : 1;
      const one = r + dir;
      if (inBounds(one, c) && !board[one][c]) {
        moves.push([one, c]);
        const two = r + dir * 2;
        if (r === start && !board[two][c]) moves.push([two, c]);
      }
      for (const dc of [-1, 1]) {
        const cc = c + dc;
        if (!inBounds(one, cc)) continue;
        const tpiece = board[one][cc];
        if (tpiece && colorOf(tpiece) !== me) moves.push([one, cc]);
        else if (ep && ep[0] === one && ep[1] === cc) moves.push([one, cc]);
      }
    } else if (t === "n") {
      for (const [dr, dc] of [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1],
      ]) {
        const rr = r + dr;
        const cc = c + dc;
        if (!inBounds(rr, cc)) continue;
        const tpiece = board[rr][cc];
        if (!tpiece || colorOf(tpiece) !== me) moves.push([rr, cc]);
      }
    } else if (t === "b") {
      for (const [dr, dc] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        pushSlide(moves, r, c, dr, dc, me);
      }
    } else if (t === "r") {
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        pushSlide(moves, r, c, dr, dc, me);
      }
    } else if (t === "q") {
      for (const [dr, dc] of [
        [1, 0], [-1, 0], [0, 1], [0, -1],
        [1, 1], [1, -1], [-1, 1], [-1, -1],
      ]) {
        pushSlide(moves, r, c, dr, dc, me);
      }
    } else if (t === "k") {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (!dr && !dc) continue;
          const rr = r + dr;
          const cc = c + dc;
          if (!inBounds(rr, cc)) continue;
          const tpiece = board[rr][cc];
          if (!tpiece || colorOf(tpiece) !== me) moves.push([rr, cc]);
        }
      }
      if (!inCheck(me)) {
        const row = me === "w" ? 7 : 0;
        if (r === row && c === 4) {
          if (
            (me === "w" ? castle.wK : castle.bK) &&
            !board[row][5] &&
            !board[row][6] &&
            board[row][7] === me + "r" &&
            !attacked(row, 5, enemy(me)) &&
            !attacked(row, 6, enemy(me))
          ) {
            moves.push([row, 6]);
          }
          if (
            (me === "w" ? castle.wQ : castle.bQ) &&
            !board[row][3] &&
            !board[row][2] &&
            !board[row][1] &&
            board[row][0] === me + "r" &&
            !attacked(row, 3, enemy(me)) &&
            !attacked(row, 2, enemy(me))
          ) {
            moves.push([row, 2]);
          }
        }
      }
    }
    return moves;
  }

  function legalMoves(r, c) {
    const p = board[r][c];
    if (!p || colorOf(p) !== turn) return [];
    const out = [];
    for (const [tr, tc] of rawMoves(r, c)) {
      const snap = cloneState();
      applyMove(r, c, tr, tc, true);
      const ok = !inCheck(colorOf(p));
      restoreState(snap);
      if (ok) out.push([tr, tc]);
    }
    return out;
  }

  function allLegal(side = turn) {
    const moves = [];
    const saved = turn;
    turn = side;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (colorOf(board[r][c]) !== side) continue;
        for (const [tr, tc] of legalMoves(r, c)) {
          moves.push([r, c, tr, tc]);
        }
      }
    }
    turn = saved;
    return moves;
  }

  function applyMove(fr, fc, tr, tc, silent = false) {
    const p = board[fr][fc];
    const me = colorOf(p);
    const t = typeOf(p);
    let capturedPiece = board[tr][tc];
    let promo = false;

    if (t === "p" && ep && tr === ep[0] && tc === ep[1] && !capturedPiece) {
      const pr = me === "w" ? tr + 1 : tr - 1;
      capturedPiece = board[pr][tc];
      board[pr][tc] = null;
    }

    board[tr][tc] = p;
    board[fr][fc] = null;

    if (t === "p" && (tr === 0 || tr === 7)) {
      board[tr][tc] = me + "q";
      promo = true;
    }

    if (t === "k" && Math.abs(tc - fc) === 2) {
      const row = fr;
      if (tc === 6) {
        board[row][5] = board[row][7];
        board[row][7] = null;
      } else if (tc === 2) {
        board[row][3] = board[row][0];
        board[row][0] = null;
      }
    }

    if (p === "wk") {
      castle.wK = false;
      castle.wQ = false;
    }
    if (p === "bk") {
      castle.bK = false;
      castle.bQ = false;
    }
    if (fr === 7 && fc === 0) castle.wQ = false;
    if (fr === 7 && fc === 7) castle.wK = false;
    if (fr === 0 && fc === 0) castle.bQ = false;
    if (fr === 0 && fc === 7) castle.bK = false;
    if (tr === 7 && tc === 0) castle.wQ = false;
    if (tr === 7 && tc === 7) castle.wK = false;
    if (tr === 0 && tc === 0) castle.bQ = false;
    if (tr === 0 && tc === 7) castle.bK = false;

    if (t === "p" && Math.abs(tr - fr) === 2) ep = [(fr + tr) / 2, fc];
    else ep = null;

    if (capturedPiece && !silent) captured[me].push(capturedPiece);

    if (!silent) {
      uciMoves.push(sqName(fr, fc) + sqName(tr, tc) + (promo ? "q" : ""));
      lastMove = { fr, fc, tr, tc };
    }

    turn = enemy(me);
  }

  /* ——— Stockfish worker ——— */

  function engineSend(cmd) {
    if (engine) engine.postMessage(cmd);
  }

  function applyEngineStrength() {
    if (!engineReady) return;
    const p = levelParams(level);
    engineSend(`setoption name Threads value ${ENGINE_THREADS}`);
    engineSend("setoption name Hash value 128");
    if (p.unlimited) {
      engineSend("setoption name UCI_LimitStrength value false");
      engineSend("setoption name Skill Level value 20");
    } else {
      engineSend("setoption name UCI_LimitStrength value true");
      engineSend(`setoption name UCI_Elo value ${p.elo}`);
      // Soften very low levels further with Skill Level (0–20)
      const skill = Math.round(((level - 1) / 99) * 20);
      engineSend(`setoption name Skill Level value ${skill}`);
    }
  }

  function goCommand() {
    const p = levelParams(level);
    if (p.unlimited) return `go movetime ${p.movetime}`;
    // Low levels: short depth (faster + weaker). Higher: movetime with Elo cap.
    if (level <= 25) return `go depth ${p.depth} movetime ${Math.min(p.movetime, 800)}`;
    return `go movetime ${p.movetime}`;
  }

  function handleEngineLine(raw) {
    const line = String(raw || "").trim();
    if (!line) return;
    if (line === "uciok") {
      engineSend("isready");
      return;
    }
    if (line === "readyok") {
      engineReady = true;
      engineFailed = false;
      applyEngineStrength();
      updateStatus();
      return;
    }
    if (line.startsWith("bestmove")) {
      const m = line.match(/^bestmove\s+(\S+)/);
      const move = m ? m[1] : "(none)";
      if (waitBest) {
        const { resolve, gen } = waitBest;
        waitBest = null;
        if (gen === searchGen) resolve(move === "(none)" ? null : move);
      }
    }
  }

  function initEngine() {
    if (!crossOriginIsolated) {
      console.warn("Chess Multi needs Cross-Origin isolation (COOP/COEP) for SharedArrayBuffer / threads");
    }
    const wasmUrl = `${location.origin}${ENGINE_WASM}`;
    const workerUrl = `${ENGINE_JS}#${encodeURIComponent(wasmUrl)}`;
    try {
      engine = new Worker(workerUrl);
    } catch (err) {
      console.warn("Stockfish worker failed", err);
      engineFailed = true;
      updateStatus();
      return;
    }

    engine.onerror = (err) => {
      console.warn("Stockfish error", err);
      engineFailed = true;
      engineReady = false;
      if (waitBest) {
        const reject = waitBest.reject;
        waitBest = null;
        reject(new Error("engine error"));
      }
      updateStatus();
    };

    engine.onmessage = (ev) => {
      if (typeof ev.data === "string") {
        for (const part of ev.data.split(/\n+/)) handleEngineLine(part);
      }
    };

    setTimeout(() => engineSend("uci"), 0);
    setTimeout(() => {
      if (!engineReady && !engineFailed) {
        console.warn("Stockfish load timeout");
        engineFailed = true;
        updateStatus();
      }
    }, 20000);
  }

  function clearWaitBest(resolveWith = null) {
    if (!waitBest) return;
    const prev = waitBest;
    waitBest = null;
    try {
      prev.resolve(resolveWith);
    } catch (_) {
      /* ignore */
    }
  }

  function askEngine() {
    return new Promise((resolve, reject) => {
      if (!engineReady) {
        reject(new Error("engine not ready"));
        return;
      }
      if (waitBest) {
        engineSend("stop");
        clearWaitBest(null);
      }
      const gen = ++searchGen;
      waitBest = { resolve, reject, gen };
      applyEngineStrength();
      engineSend("ucinewgame");
      engineSend("position startpos" + (uciMoves.length ? " moves " + uciMoves.join(" ") : ""));
      engineSend(goCommand());
    });
  }

  /** Full-strength hint search (ignores level Elo cap). */
  function askHintMove() {
    return new Promise((resolve, reject) => {
      if (!engineReady) {
        reject(new Error("engine not ready"));
        return;
      }
      if (waitBest) {
        engineSend("stop");
        clearWaitBest(null);
      }
      const gen = ++searchGen;
      waitBest = { resolve, reject, gen };
      engineSend("setoption name UCI_LimitStrength value false");
      engineSend("setoption name Skill Level value 20");
      engineSend("position startpos" + (uciMoves.length ? " moves " + uciMoves.join(" ") : ""));
      engineSend("go depth 12");
    }).finally(() => {
      applyEngineStrength();
    });
  }

  function fallbackCpuMove() {
    const moves = allLegal("b");
    if (!moves.length) return null;
    // Prefer captures; otherwise random — keeps game playable if WASM fails
    const caps = moves.filter(([fr, fc, tr, tc]) => board[tr][tc]);
    const pool = caps.length ? caps : moves;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function syncCaptured() {
    capBlackEl.textContent = captured.w.map((p) => GLYPH[p]).join("");
    capWhiteEl.textContent = captured.b.map((p) => GLYPH[p]).join("");
  }

  function showOverlay(text) {
    overlayEl.hidden = false;
    overlayEl.textContent = text;
  }
  function hideOverlay() {
    overlayEl.hidden = true;
  }

  function setLevel(n) {
    level = Math.max(1, Math.min(100, Math.round(n)));
    levelVal.textContent = String(level);
    levelRange.value = String(level);
    levelMeta.textContent = levelLabel(level);
    if (engineReady) applyEngineStrength();
  }

  function countMaterial() {
    const m = {
      w: { k: 0, q: 0, r: 0, b: 0, n: 0, p: 0 },
      b: { k: 0, q: 0, r: 0, b: 0, n: 0, p: 0 },
      total: 0,
    };
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p) continue;
        m[colorOf(p)][typeOf(p)] += 1;
        m.total += 1;
      }
    }
    return m;
  }

  /** Named opening lines keyed by UCI move sequence (space-separated). */
  const OPENING_BY_MOVES = {
    "": "Starting Position",
    e2e4: "King's Pawn Opening",
    "e2e4 e7e5": "Open Game",
    "e2e4 e7e5 g1f3": "King's Knight Opening",
    "e2e4 e7e5 g1f3 b8c6": "King's Knight · Three Knights path",
    "e2e4 e7e5 g1f3 b8c6 f1b5": "Ruy Lopez",
    "e2e4 e7e5 g1f3 b8c6 f1b5 a7a6": "Ruy Lopez · Morphy Defense",
    "e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4": "Ruy Lopez · Morphy",
    "e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6": "Ruy Lopez · Berlin / Closed path",
    "e2e4 e7e5 g1f3 b8c6 f1c4": "Italian Game",
    "e2e4 e7e5 g1f3 b8c6 f1c4 f8c5": "Giuoco Piano",
    "e2e4 e7e5 g1f3 b8c6 f1c4 g8f6": "Two Knights Defense",
    "e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 f3g5": "Two Knights · Knight Attack",
    "e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 f3g5 d7d5": "Fried Liver / Traxler path",
    "e2e4 e7e5 g1f3 b8c6 d2d4": "Scotch Game",
    "e2e4 e7e5 g1f3 b8c6 d2d4 e5d4": "Scotch Game",
    "e2e4 e7e5 g1f3 b8c6 d2d4 e5d4 f1c4": "Scotch Gambit",
    "e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 b2b4": "Evans Gambit",
    "e2e4 e7e5 f2f4": "King's Gambit",
    "e2e4 e7e5 f2f4 e5f4": "King's Gambit Accepted",
    "e2e4 e7e5 b1c3": "Vienna Game",
    "e2e4 e7e5 f1c4": "Bishop's Opening",
    "e2e4 e7e5 g1f3 g8f6": "Petrov Defense",
    "e2e4 e7e5 g1f3 d7d6": "Philidor Defense",
    "e2e4 c7c5": "Sicilian Defense",
    "e2e4 c7c5 g1f3": "Sicilian Defense",
    "e2e4 c7c5 g1f3 d7d6": "Sicilian · Open path",
    "e2e4 c7c5 g1f3 d7d6 d2d4": "Open Sicilian",
    "e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6": "Sicilian Najdorf",
    "e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 g7g6": "Sicilian Dragon",
    "e2e4 c7c5 b1c3": "Closed Sicilian",
    "e2e4 c7c6": "Caro-Kann Defense",
    "e2e4 c7c6 d2d4 d7d5": "Caro-Kann Defense",
    "e2e4 e7e6": "French Defense",
    "e2e4 e7e6 d2d4 d7d5": "French Defense",
    "e2e4 e7e6 d2d4 d7d5 b1c3 f8b4": "French Winawer",
    "e2e4 e7e6 d2d4 d7d5 e4e5": "French Advance",
    "e2e4 d7d5": "Scandinavian Defense",
    "e2e4 g8f6": "Alekhine Defense",
    "e2e4 d7d6": "Pirc / Modern path",
    "e2e4 g7g6": "Modern Defense",
    "e2e4 b8c6": "Nimzowitsch Defense",
    d2d4: "Queen's Pawn Opening",
    "d2d4 d7d5": "Closed Game",
    "d2d4 d7d5 c2c4": "Queen's Gambit",
    "d2d4 d7d5 c2c4 e7e6": "Queen's Gambit Declined",
    "d2d4 d7d5 c2c4 d5c4": "Queen's Gambit Accepted",
    "d2d4 d7d5 c2c4 c7c6": "Slav Defense",
    "d2d4 g8f6": "Indian Defense",
    "d2d4 g8f6 c2c4 e7e6 b1c3 f8b4": "Nimzo-Indian Defense",
    "d2d4 g8f6 c2c4 g7g6": "King's Indian / Grünfeld path",
    "d2d4 g8f6 c2c4 g7g6 b1c3 d7d5": "Grünfeld Defense",
    "d2d4 g8f6 c2c4 g7g6 b1c3 f8g7": "King's Indian Defense",
    "d2d4 g8f6 c2c4 e7e6 g1f3 b7b6": "Queen's Indian Defense",
    "d2d4 f7f5": "Dutch Defense",
    "d2d4 g8f6 c1f4": "London System",
    "d2d4 d7d5 g1f3 g8f6 c1f4": "London System",
    "d2d4 g8f6 c2c4 e7e6 g2g3": "Catalan Opening",
    "d2d4 g8f6 c1g5": "Trompowsky Attack",
    c2c4: "English Opening",
    "c2c4 e7e5": "English Opening · Reversed Sicilian",
    "c2c4 c7c5": "English Symmetrical",
    g1f3: "Réti / Zukertort",
    "g1f3 d7d5": "Réti Opening",
    f2f4: "Bird's Opening",
    b2b3: "Nimzo-Larsen Attack",
    g2g3: "King's Fianchetto Opening",
    b2b4: "Polish Opening",
    "e2e4 e7e5 d1h5": "Scholar's Mate threat",
    "e2e4 e7e5 d1h5 b8c6 f1c4": "Scholar's Mate path",
    "e2e4 g7g5 d2d4 f7f6": "Fool's Mate path",
  };

  function longestOpeningName() {
    if (!uciMoves.length) return OPENING_BY_MOVES[""];
    let best = null;
    let bestLen = -1;
    const seq = uciMoves.join(" ");
    for (const [key, name] of Object.entries(OPENING_BY_MOVES)) {
      if (!key) continue;
      if (seq === key || seq.startsWith(key + " ")) {
        const len = key.split(" ").length;
        if (len > bestLen) {
          bestLen = len;
          best = name;
        }
      }
    }
    return best;
  }

  function detectEndgameName() {
    const m = countMaterial();
    const nonKing = m.total - m.w.k - m.b.k;
    if (nonKing > 6) return null;
    if (m.total <= 3) {
      if (m.w.q + m.b.q === 1 && m.w.r + m.b.r + m.w.b + m.b.b + m.w.n + m.b.n + m.w.p + m.b.p === 0) {
        return "K+Q vs K";
      }
      if (m.w.r + m.b.r === 1 && m.w.q + m.b.q + m.w.b + m.b.b + m.w.n + m.b.n + m.w.p + m.b.p === 0) {
        return "K+R vs K";
      }
      if (m.w.p + m.b.p === 1 && m.w.q + m.b.q + m.w.r + m.b.r + m.w.b + m.b.b + m.w.n + m.b.n === 0) {
        return "King + Pawn Ending";
      }
    }
    if (m.w.q + m.b.q === 0 && m.w.r + m.b.r === 1 && m.w.p + m.b.p === 1 && nonKing <= 3) {
      return "Rook + Pawn Ending";
    }
    if (m.w.q + m.b.q === 0 && m.w.r + m.b.r === 2 && nonKing === 2) {
      return "Two Rooks vs King / Rook duel";
    }
    if (m.w.b + m.b.b === 2 && m.w.n + m.b.n === 0 && m.w.q + m.b.q + m.w.r + m.b.r === 0) {
      return "Bishop Ending";
    }
    if (m.w.b === 1 && m.b.b === 1 && m.w.q + m.b.q + m.w.r + m.b.r === 0) {
      return "Opposite / Same-Color Bishops";
    }
    if (m.w.n + m.b.n >= 1 && m.w.q + m.b.q + m.w.r + m.b.r === 0 && nonKing <= 4) {
      return "Minor-Piece Ending";
    }
    if (m.w.q >= 1 && m.b.q >= 1 && nonKing <= 5) {
      return "Queen Ending";
    }
    if (m.w.q + m.b.q === 1 && m.w.r + m.b.r === 1 && nonKing <= 4) {
      return "Queen vs Rook";
    }
    if (nonKing <= 6 && m.w.q + m.b.q === 0) {
      return "Endgame";
    }
    if (nonKing <= 4) return "Endgame";
    return null;
  }

  function detectMiddlegameHint() {
    const m = countMaterial();
    if (m.total < 20) return null;
    // Motif hints from last move geometry / simple patterns
    if (uciMoves.length < 8) return null;
    if (inCheck("w") || inCheck("b")) return "Middlegame · check";
    // Castled opposite?
    const wKing = findKing("w");
    const bKing = findKing("b");
    if (wKing && bKing) {
      if (wKing[1] >= 5 && bKing[1] <= 2) return "Opposite Castling · attack race";
      if (wKing[1] <= 2 && bKing[1] >= 5) return "Opposite Castling · attack race";
    }
    if (uciMoves.length >= 12) return "Middlegame";
    return null;
  }

  function detectSetup() {
    const end = detectEndgameName();
    if (end) {
      return { phase: "Endgame", name: end, sub: "Material points to a known ending" };
    }
    const open = longestOpeningName();
    const ply = uciMoves.length;
    // Stay on the deepest book name through the opening / early middlegame
    if (open && ply <= 36) {
      return {
        phase: ply <= 20 ? "Opening" : "Opening → Middlegame",
        name: open,
        sub: ply ? `Line after ${Math.ceil(ply / 2)} moves` : "Initial setup",
      };
    }
    const mid = detectMiddlegameHint();
    if (mid) {
      return { phase: "Middlegame", name: mid, sub: "Named motif when clear" };
    }
    if (open) {
      return {
        phase: "Middlegame",
        name: open,
        sub: "From that opening · now middlegame",
      };
    }
    if (ply >= 12) {
      return { phase: "Middlegame", name: "Middlegame", sub: "No book name for this branch" };
    }
    return lastNamedSetup;
  }

  function updateSetupPanel() {
    const info = detectSetup();
    lastNamedSetup = info;
    if (setupPhaseEl) setupPhaseEl.textContent = info.phase;
    if (setupTitleEl) setupTitleEl.textContent = info.name;
    if (setupSubEl) setupSubEl.textContent = info.sub;
  }

  function updateStatus() {
    syncCaptured();
    levelVal.textContent = String(level);
    levelMeta.textContent = levelLabel(level);
    updateSetupPanel();
    if (btnBack) btnBack.disabled = history.length === 0;
    const lockPlay = gameOver || thinking || hintBusy || turn !== "w";
    if (btnHint) btnHint.disabled = lockPlay;
    if (btnAi) btnAi.disabled = lockPlay;
    if (gameOver) return;
    if (engineFailed) {
      statusEl.textContent = thinking ? "CPU (fallback)…" : "Stockfish unavailable · fallback AI";
    }
    if (thinking) {
      statusEl.textContent = engineReady
        ? `Stockfish thinking… (L${level})`
        : "Loading Stockfish…";
      hintEl.textContent = engineReady
        ? levelLabel(level)
        : "Engine still starting — your move is saved";
      return;
    }
    if (!engineReady && !engineFailed) {
      statusEl.textContent = "Loading Stockfish…";
      hintEl.textContent = "You can move once the engine is ready";
    }
    if (turn === "w") {
      const check = inCheck("w");
      statusEl.textContent = check ? "Your turn — check!" : "Your turn";
      hintEl.textContent = check
        ? "White is in check · move the king or block"
        : "Click a white piece, then a square";
    }
  }

  function endIfNeeded() {
    const moves = allLegal(turn);
    if (moves.length) return false;
    gameOver = true;
    selected = null;
    legal = [];
    if (inCheck(turn)) {
      if (turn === "w") {
        showOverlay("Checkmate\nCPU wins");
        statusEl.textContent = "Checkmate — Black wins";
      } else {
        showOverlay("Checkmate\nYou win!");
        statusEl.textContent = "Checkmate — White wins";
      }
    } else {
      showOverlay("Stalemate\nDraw");
      statusEl.textContent = "Stalemate — draw";
    }
    hintEl.textContent = "New / Enter for another game";
    return true;
  }

  async function afterHumanMove() {
    selected = null;
    legal = [];
    draw();
    if (endIfNeeded()) {
      updateStatus();
      return;
    }
    thinking = true;
    updateStatus();
    draw();

    let played = false;
    try {
      // Wait briefly if engine still booting
      const start = performance.now();
      while (!engineReady && !engineFailed && performance.now() - start < 8000) {
        await new Promise((r) => setTimeout(r, 50));
      }
      if (engineReady) {
        const uci = await askEngine();
        if (uci && uci.length >= 4) {
          const [fr, fc, tr, tc] = parseUci(uci);
          // Validate against our legal list so a desync can't corrupt the board
          const ok = allLegal("b").some(
            ([a, b, c, d]) => a === fr && b === fc && c === tr && d === tc
          );
          if (ok) {
            applyMove(fr, fc, tr, tc);
            played = true;
          }
        }
      }
    } catch (err) {
      console.warn("engine move failed", err);
    }

    if (!played) {
      const m = fallbackCpuMove();
      if (m) applyMove(m[0], m[1], m[2], m[3]);
    }

    thinking = false;
    draw();
    if (endIfNeeded()) {
      updateStatus();
      return;
    }
    updateStatus();
    draw();
  }

  function fit() {
    const w = Math.max(280, Math.floor(boardWrap?.clientWidth || 640));
    const h = Math.max(280, Math.floor(boardWrap?.clientHeight || 640));
    canvas.width = w;
    canvas.height = h;
    size = Math.floor((Math.min(w, h) * 0.92) / 8);
    ox = Math.floor((w - size * 8) / 2);
    oy = Math.floor((h - size * 8) / 2);
  }

  function squareAt(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    const c = Math.floor((x - ox) / size);
    const r = Math.floor((y - oy) / size);
    if (!inBounds(r, c)) return null;
    return [r, c];
  }

  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = "#1a221c";
    ctx.fillRect(0, 0, w, h);

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const light = (r + c) % 2 === 0;
        ctx.fillStyle = light ? "#e8d9b5" : "#5a7a58";
        ctx.fillRect(ox + c * size, oy + r * size, size, size);

        if (
          lastMove &&
          ((lastMove.fr === r && lastMove.fc === c) ||
            (lastMove.tr === r && lastMove.tc === c))
        ) {
          ctx.fillStyle = "rgba(212, 168, 75, 0.35)";
          ctx.fillRect(ox + c * size, oy + r * size, size, size);
        }

        if (
          aiMoveMark &&
          ((aiMoveMark.fr === r && aiMoveMark.fc === c) ||
            (aiMoveMark.tr === r && aiMoveMark.tc === c))
        ) {
          // Distinct from CPU last-move gold — violet AI mark
          ctx.fillStyle = "rgba(170, 90, 255, 0.5)";
          ctx.fillRect(ox + c * size, oy + r * size, size, size);
          ctx.lineWidth = Math.max(3, size * 0.08);
          ctx.strokeStyle = "#d4a0ff";
          ctx.strokeRect(ox + c * size + 2, oy + r * size + 2, size - 4, size - 4);
        }

        if (selected && selected[0] === r && selected[1] === c) {
          ctx.fillStyle = "rgba(80, 160, 255, 0.4)";
          ctx.fillRect(ox + c * size, oy + r * size, size, size);
        }
      }
    }

    if (hintSquares) {
      const pulse = 0.55 + 0.35 * Math.sin(hintPulse);
      const drawHintSq = (r, c, kind) => {
        const x = ox + c * size;
        const y = oy + r * size;
        // From = hot cyan, to = neon amber — high contrast on both light/dark squares
        if (kind === "from") {
          ctx.fillStyle = `rgba(0, 230, 255, ${0.45 + pulse * 0.25})`;
        } else {
          ctx.fillStyle = `rgba(255, 140, 0, ${0.5 + pulse * 0.3})`;
        }
        ctx.fillRect(x, y, size, size);
        ctx.lineWidth = Math.max(4, size * 0.1);
        ctx.strokeStyle = kind === "from" ? "#00f0ff" : "#ffee55";
        ctx.strokeRect(x + 3, y + 3, size - 6, size - 6);
        ctx.lineWidth = Math.max(2, size * 0.045);
        ctx.strokeStyle = kind === "from" ? "#003844" : "#5a2800";
        ctx.strokeRect(x + 7, y + 7, size - 14, size - 14);
      };
      drawHintSq(hintSquares.fr, hintSquares.fc, "from");
      drawHintSq(hintSquares.tr, hintSquares.tc, "to");
    }

    for (const [r, c] of legal) {
      const cx = ox + c * size + size / 2;
      const cy = oy + r * size + size / 2;
      if (board[r][c]) {
        ctx.strokeStyle = "rgba(220, 60, 60, 0.75)";
        ctx.lineWidth = Math.max(3, size * 0.08);
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.42, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = "rgba(30, 40, 30, 0.35)";
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.14, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${Math.floor(size * 0.78)}px "Segoe UI Symbol", "DejaVu Sans", "Noto Sans Symbols", serif`;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p) continue;
        const cx = ox + c * size + size / 2;
        const cy = oy + r * size + size / 2 + size * 0.03;
        const white = colorOf(p) === "w";
        const glyph = GLYPH["b" + typeOf(p)];
        ctx.lineJoin = "round";
        ctx.lineWidth = Math.max(2, size * 0.06);
        ctx.strokeStyle = white ? "#1a1a1a" : "#f2efe6";
        ctx.strokeText(glyph, cx, cy);
        ctx.fillStyle = white ? "#f7f3ea" : "#1c1c1c";
        ctx.fillText(glyph, cx, cy);
      }
    }

    ctx.font = `700 ${Math.max(10, Math.floor(size * 0.18))}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = "rgba(232,238,232,0.55)";
    for (let c = 0; c < 8; c++) {
      ctx.fillText(
        String.fromCharCode(97 + c),
        ox + c * size + size / 2,
        oy + 8 * size + size * 0.28
      );
    }
    ctx.textAlign = "right";
    for (let r = 0; r < 8; r++) {
      ctx.fillText(String(8 - r), ox - 6, oy + r * size + size / 2);
    }

    if (!gameOver) {
      for (const side of ["w", "b"]) {
        if (!inCheck(side)) continue;
        const k = findKing(side);
        if (!k) continue;
        ctx.strokeStyle = "rgba(220, 50, 50, 0.85)";
        ctx.lineWidth = Math.max(3, size * 0.07);
        ctx.strokeRect(ox + k[1] * size + 3, oy + k[0] * size + 3, size - 6, size - 6);
      }
    }
  }

  function pushHistory() {
    history.push({
      state: cloneState(),
      lastMove: lastMove ? { ...lastMove } : null,
      hintText: hintEl.textContent,
    });
  }

  function takeBack() {
    if (history.length === 0) return;
    if (waitBest) {
      engineSend("stop");
      clearWaitBest(null);
    }
    searchGen += 1;
    thinking = false;
    hintBusy = false;
    gameOver = false;
    const snap = history.pop();
    restoreState(snap.state);
    lastMove = snap.lastMove;
    selected = null;
    legal = [];
    hintSquares = null;
    aiMoveMark = null;
    stopHintPulse();
    hideOverlay();
    hintEl.textContent = snap.hintText || "Your turn · click a white piece";
    updateStatus();
    draw();
  }

  function startHintPulse() {
    if (hintAnim) cancelAnimationFrame(hintAnim);
    const tick = (t) => {
      if (!hintSquares) {
        hintAnim = 0;
        return;
      }
      hintPulse = t / 220;
      draw();
      hintAnim = requestAnimationFrame(tick);
    };
    hintAnim = requestAnimationFrame(tick);
  }

  function stopHintPulse() {
    if (hintAnim) cancelAnimationFrame(hintAnim);
    hintAnim = 0;
    hintPulse = 0;
  }

  async function giveHint() {
    if (hintBusy || thinking || turn !== "w" || gameOver) return;
    hintBusy = true;
    updateStatus();
    hintEl.textContent = "Thinking…";
    try {
      let best = null;
      if (engineReady && !engineFailed) {
        try {
          best = await askHintMove();
        } catch (err) {
          console.warn("hint", err);
        }
      }
      if (best && best.length >= 4) {
        const [fr, fc, tr, tc] = parseUci(best);
        const ok = allLegal("w").some(
          ([a, b, c, d]) => a === fr && b === fc && c === tr && d === tc
        );
        if (ok) {
          hintSquares = { fr, fc, tr, tc };
          selected = [fr, fc];
          legal = legalMoves(fr, fc);
          hintEl.textContent = `Hint: ${sqName(fr, fc)} → ${sqName(tr, tc)}`;
          draw();
          startHintPulse();
          hintBusy = false;
          updateStatus();
          return;
        }
      }
      hintEl.textContent = engineReady
        ? "No clear hint — keep looking"
        : "Engine warming · try Hint again";
    } catch (err) {
      console.warn(err);
      hintEl.textContent = "Hint failed · try again";
    }
    hintBusy = false;
    updateStatus();
  }

  /** Play Stockfish's best move for White (then CPU replies). */
  async function playAiMove() {
    if (hintBusy || thinking || turn !== "w" || gameOver) return;
    hintBusy = true;
    updateStatus();
    hintEl.textContent = "AI moving…";
    try {
      let best = null;
      if (engineReady && !engineFailed) {
        try {
          best = await askHintMove();
        } catch (err) {
          console.warn("ai move", err);
        }
      }
      if (best && best.length >= 4) {
        const [fr, fc, tr, tc] = parseUci(best);
        const ok = allLegal("w").some(
          ([a, b, c, d]) => a === fr && b === fc && c === tr && d === tc
        );
        if (ok) {
          hintSquares = null;
          stopHintPulse();
          selected = null;
          legal = [];
          pushHistory();
          applyMove(fr, fc, tr, tc);
          aiMoveMark = { fr, fc, tr, tc };
          hintEl.textContent = `AI played ${sqName(fr, fc)} → ${sqName(tr, tc)}`;
          hintBusy = false;
          updateStatus();
          draw();
          await afterHumanMove();
          return;
        }
      }
      hintEl.textContent = engineReady
        ? "AI found no legal move"
        : "Engine warming · try AI Move again";
    } catch (err) {
      console.warn(err);
      hintEl.textContent = "AI move failed · try again";
    }
    hintBusy = false;
    updateStatus();
  }

  function newGame() {
    if (engineReady) {
      engineSend("stop");
      engineSend("ucinewgame");
    }
    searchGen += 1;
    clearWaitBest(null);
    board = cloneBoard(START);
    turn = "w";
    selected = null;
    legal = [];
    lastMove = null;
    gameOver = false;
    thinking = false;
    hintBusy = false;
    hintSquares = null;
    aiMoveMark = null;
    stopHintPulse();
    history = [];
    castle = { wK: true, wQ: true, bK: true, bQ: true };
    ep = null;
    captured = { w: [], b: [] };
    uciMoves = [];
    lastNamedSetup = {
      phase: "Opening",
      name: "Starting Position",
      sub: "Play moves to enter a named line",
    };
    hideOverlay();
    fit();
    updateStatus();
    draw();
  }

  function onClick(e) {
    if (gameOver || thinking || hintBusy || turn !== "w") return;
    const sq = squareAt(e.clientX, e.clientY);
    if (!sq) return;
    const [r, c] = sq;

    if (selected) {
      const [sr, sc] = selected;
      const hit = legal.some(([lr, lc]) => lr === r && lc === c);
      if (hit) {
        hintSquares = null;
        aiMoveMark = null;
        stopHintPulse();
        pushHistory();
        applyMove(sr, sc, r, c);
        afterHumanMove();
        return;
      }
      if (colorOf(board[r][c]) === "w") {
        selected = [r, c];
        legal = legalMoves(r, c);
        draw();
        return;
      }
      selected = null;
      legal = [];
      draw();
      return;
    }

    if (colorOf(board[r][c]) === "w") {
      selected = [r, c];
      legal = legalMoves(r, c);
      draw();
    }
  }

  settingsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".step-btn");
    if (!btn) return;
    const dir = Number(btn.dataset.dir);
    // Shift-click jumps by 10
    const step = e.shiftKey ? 10 : 1;
    setLevel(level + dir * step);
  });

  levelRange.addEventListener("input", () => {
    setLevel(Number(levelRange.value));
  });

  btnStart.addEventListener("click", () => newGame());
  btnHint.addEventListener("click", () => { window.__boardScrollY = window.scrollY || 0; giveHint(); });
  if (btnAi) btnAi.addEventListener("click", () => { window.__boardScrollY = window.scrollY || 0; playAiMove(); });
  btnBack.addEventListener("click", () => takeBack());

  const boardActions = document.querySelector(".board-actions");
  if (boardActions) {
    boardActions.addEventListener("click", (e) => {
      const b = e.target.closest("[data-board-act]");
      if (!b) return;
      e.preventDefault();
      const y = window.scrollY || window.pageYOffset || 0;
      window.__boardScrollY = y;
      const act = b.dataset.boardAct;
      if (act === "hint") giveHint();
      else if (act === "ai") playAiMove();
      else if (act === "back") takeBack();
      else if (act === "next") btnNext?.click();
      else if (act === "new") newGame();
      // Restore scroll so phone view stays on the board (panel button focus would jump otherwise)
      requestAnimationFrame(() => {
        window.scrollTo(0, y);
        try { b.blur(); } catch (_) {}
        try { document.activeElement && document.activeElement.blur && document.activeElement.blur(); } catch (_) {}
      });
    });
  }

  canvas.addEventListener("pointerdown", (e) => {
    window.__boardScrollY = window.scrollY || window.pageYOffset || 0;
    onClick(e);
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      newGame();
    }
    if (e.key === "h" || e.key === "H") giveHint();
    if (e.key === "a" || e.key === "A") playAiMove();
    if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      takeBack();
    }
    if (e.key === "Backspace") {
      e.preventDefault();
      takeBack();
    }
  });
  window.addEventListener("resize", () => {
    fit();
    draw();
  });

  setLevel(20);
  initEngine();
  newGame();
})();
