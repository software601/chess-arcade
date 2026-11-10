(() => {
  // Larger maze = more puzzle (39 x 35). 0 path, 1 wall, 2 pellet, 3 power
  const RAW = [
    "111111111111111111111111111111111111111",
    "122222222222222222122222222222222222221",
    "121111111211111112121111111211111111121",
    "131111111211111112121111111211111111131",
    "122222222222222222222222222222222222221",
    "121111211211111111111111112112111111121",
    "122222211222222222122222222112222222221",
    "111111211111111112121111111121111111111",
    "000001211111111112121111111121100000000",
    "000001211000000000000000000112100000000",
    "111111211011111111011111110112111111111",
    "000000200010000001010000010002000000000",
    "111111211011111111011111110112111111111",
    "000001211000000000000000000112100000000",
    "000001211011111111111111110112100000000",
    "111111211012222222222222221012111111111",
    "122222222222222222122222222222222222221",
    "121111111211111112121111111211111111121",
    "121111111211111112121111111211111111121",
    "122222222222222200000222222222222222221",
    "111111211111111011111011111111211111111",
    "000001211111111011111011111111210000000",
    "000001211222222222222222222221210000000",
    "111111211211111111111111111121211111111",
    "122222222211222222122222211222222222221",
    "121111111211211112121112112111111111121",
    "131111111211211112121112112111111111131",
    "122222222222222222222222222222222222221",
    "121111211111111112121111111111211111121",
    "121111211111111112121111111111211111121",
    "122222211222222222222222222221122222221",
    "111111211211111111111111111121211111111",
    "122222222222222222122222222222222222221",
    "121111111111111112121111111111111111121",
    "111111111111111111111111111111111111111",
  ];

  const ROWS = RAW.length;
  const COLS = RAW[0].length;
  const GHOST_COLORS = ["#ff4b4b", "#ff9ad5", "#52e0ff", "#ffb84d"];

  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const livesEl = document.getElementById("lives");
  const overlayEl = document.getElementById("overlay");
  const hintEl = document.getElementById("hint");
  const btnStart = document.getElementById("btn-start");
  const btnSound = document.getElementById("btn-sound");
  const speedVal = document.getElementById("val-speed");
  const settingsEl = document.querySelector(".settings");
  const boardWrap = document.querySelector(".board-wrap");

  let cellW = 16;
  let cellH = 16;

  function fitBoard() {
    const w = Math.max(8, Math.floor(boardWrap?.clientWidth || window.innerWidth));
    const h = Math.max(8, Math.floor(boardWrap?.clientHeight || window.innerHeight));
    canvas.width = w;
    canvas.height = h;
    cellW = w / COLS;
    cellH = h / ROWS;
    if (pac) {
      pac.px = pac.x * cellW;
      pac.py = pac.y * cellH;
    }
    if (ghosts) {
      for (const g of ghosts) {
        g.px = g.x * cellW;
        g.py = g.y * cellH;
      }
    }
  }

  // --- Web Audio SFX (no sound files) ---
  const SFX = {
    ctx: null,
    muted: false,
    wakaFlip: false,
    lastWaka: 0,

    ensure() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
      }
      if (this.ctx.state === "suspended") this.ctx.resume();
      return this.ctx;
    },

    tone(freq, dur, type = "square", vol = 0.08, slideTo = null) {
      if (this.muted) return;
      const ac = this.ensure();
      if (!ac) return;
      const t0 = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo != null) {
        osc.frequency.linearRampToValueAtTime(slideTo, t0 + dur);
      }
      gain.gain.setValueAtTime(vol, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    },

    start() {
      this.tone(523, 0.1, "square", 0.07);
      setTimeout(() => this.tone(659, 0.1, "square", 0.07), 100);
      setTimeout(() => this.tone(784, 0.18, "square", 0.08), 200);
    },

    waka() {
      const now = performance.now();
      if (now - this.lastWaka < 90) return;
      this.lastWaka = now;
      this.wakaFlip = !this.wakaFlip;
      this.tone(this.wakaFlip ? 180 : 280, 0.07, "square", 0.055);
    },

    power() {
      this.tone(200, 0.35, "sawtooth", 0.06, 90);
    },

    eatGhost() {
      this.tone(400, 0.08, "square", 0.08);
      setTimeout(() => this.tone(600, 0.1, "square", 0.08), 80);
      setTimeout(() => this.tone(800, 0.14, "square", 0.08), 160);
    },

    death() {
      let f = 500;
      for (let i = 0; i < 6; i++) {
        const freq = f;
        setTimeout(() => this.tone(freq, 0.12, "sawtooth", 0.07, freq - 60), i * 90);
        f -= 55;
      }
    },

    win() {
      [523, 659, 784, 1046].forEach((f, i) => {
        setTimeout(() => this.tone(f, 0.14, "square", 0.07), i * 120);
      });
    },

    gameOver() {
      this.tone(300, 0.2, "triangle", 0.07, 120);
      setTimeout(() => this.tone(180, 0.35, "triangle", 0.07, 80), 180);
    },
  };

  const DIRS = {
    ArrowUp: { x: 0, y: -1, name: "up" },
    ArrowDown: { x: 0, y: 1, name: "down" },
    ArrowLeft: { x: -1, y: 0, name: "left" },
    ArrowRight: { x: 1, y: 0, name: "right" },
    w: { x: 0, y: -1, name: "up" },
    s: { x: 0, y: 1, name: "down" },
    a: { x: -1, y: 0, name: "left" },
    d: { x: 1, y: 0, name: "right" },
  };

  let speed = 5;
  let tickMs = speedToMs(5);
  let map;
  let pelletsLeft;
  let pac;
  let ghosts;
  let score = 0;
  let lives = 3;
  let running = false;
  let paused = false;
  let dead = false;
  let started = false;
  let won = false;
  let frightened = 0;
  let mouth = 0;
  let lastTick = 0;

  function speedToMs(level) {
    return Math.round(200 - level * 12);
  }

  function cloneMap() {
    return RAW.map((row) => row.split("").map((c) => Number(c)));
  }

  function isWall(x, y) {
    if (y < 0 || y >= ROWS) return true;
    // tunnel wrap on ghost house row sides
    if (x < 0 || x >= COLS) return false;
    return map[y][x] === 1;
  }

  function canMove(x, y, dir) {
    const nx = x + dir.x;
    const ny = y + dir.y;
    if (ny < 0 || ny >= ROWS) return false;
    if (nx < 0 || nx >= COLS) return true; // tunnel
    return map[ny][nx] !== 1;
  }

  function wrapX(x) {
    if (x < 0) return COLS - 1;
    if (x >= COLS) return 0;
    return x;
  }

  function syncUI() {
    speedVal.textContent = String(speed);
    scoreEl.textContent = String(score);
    livesEl.textContent = String(lives);
    btnStart.textContent = started && !dead && !won ? "Restart" : "Start";
  }

  function isOpenTile(x, y) {
    if (y < 0 || y >= ROWS || x < 0 || x >= COLS) return false;
    return map[y][x] !== 1;
  }

  function findOpenNear(tx, ty) {
    if (isOpenTile(tx, ty)) return { x: tx, y: ty };
    for (let r = 1; r < Math.max(ROWS, COLS); r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (isOpenTile(tx + dx, ty + dy)) return { x: tx + dx, y: ty + dy };
        }
      }
    }
    return { x: 1, y: 1 };
  }

  function resetActors() {
    const cx = Math.floor(COLS / 2);
    const pacSpot = findOpenNear(cx, ROWS - 5);
    const home = findOpenNear(cx, Math.floor(ROWS / 2) - 4);
    const homeL = findOpenNear(home.x - 1, home.y);
    const homeR = findOpenNear(home.x + 1, home.y);
    const homeU = findOpenNear(home.x, home.y - 1);
    pac = {
      x: pacSpot.x,
      y: pacSpot.y,
      dir: { x: -1, y: 0, name: "left" },
      next: { x: -1, y: 0, name: "left" },
      px: pacSpot.x * cellW,
      py: pacSpot.y * cellH,
    };
    ghosts = [
      { x: home.x, y: home.y, dir: { x: 1, y: 0 }, color: GHOST_COLORS[0], home: false },
      { x: homeL.x, y: homeL.y, dir: { x: -1, y: 0 }, color: GHOST_COLORS[1], home: false },
      { x: homeR.x, y: homeR.y, dir: { x: 1, y: 0 }, color: GHOST_COLORS[2], home: false },
      { x: homeU.x, y: homeU.y, dir: { x: 0, y: -1 }, color: GHOST_COLORS[3], home: false },
    ];
    ghosts.forEach((g) => {
      g.homeX = home.x;
      g.homeY = home.y;
      g.px = g.x * cellW;
      g.py = g.y * cellH;
    });
    frightened = 0;
  }

  function countPellets() {
    let n = 0;
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (map[y][x] === 2 || map[y][x] === 3) n += 1;
      }
    }
    return n;
  }

  function showTitle() {
    started = false;
    running = false;
    paused = false;
    dead = false;
    won = false;
    score = 0;
    lives = 3;
    map = cloneMap();
    pelletsLeft = countPellets();
    resetActors();
    overlayEl.hidden = false;
    overlayEl.textContent = "Press Start";
    hintEl.textContent = "Arrows / click board to turn · Eat dots · Avoid ghosts";
    syncUI();
  }

  function startGame() {
    SFX.ensure();
    tickMs = speedToMs(speed);
    map = cloneMap();
    pelletsLeft = countPellets();
    score = 0;
    lives = 3;
    dead = false;
    won = false;
    paused = false;
    started = true;
    running = true;
    lastTick = 0;
    resetActors();
    overlayEl.hidden = true;
    hintEl.textContent = "Click board / arrows · Space pause";
    syncUI();
    SFX.start();
  }

  function loseLife() {
    SFX.death();
    lives -= 1;
    syncUI();
    if (lives <= 0) {
      dead = true;
      running = false;
      overlayEl.hidden = false;
      overlayEl.textContent = `Game over · ${score}\nStart to play`;
      hintEl.textContent = "Start / Enter to play again";
      syncUI();
      setTimeout(() => SFX.gameOver(), 500);
      return;
    }
    resetActors();
    overlayEl.hidden = false;
    overlayEl.textContent = "Ready!";
    setTimeout(() => {
      if (!dead && started) overlayEl.hidden = true;
    }, 700);
  }

  function winGame() {
    won = true;
    running = false;
    overlayEl.hidden = false;
    overlayEl.textContent = `You win · ${score}\nStart to play`;
    hintEl.textContent = "Start / Enter to play again";
    syncUI();
    SFX.win();
  }

  function setPacDir(next) {
    if (!next) return;
    pac.next = next;
  }

  function opposite(a, b) {
    return a.x + b.x === 0 && a.y + b.y === 0;
  }

  function dirsList() {
    return [
      { x: 0, y: -1, name: "up" },
      { x: 0, y: 1, name: "down" },
      { x: -1, y: 0, name: "left" },
      { x: 1, y: 0, name: "right" },
    ];
  }

  function stepPac() {
    if (canMove(pac.x, pac.y, pac.next)) pac.dir = pac.next;

    if (canMove(pac.x, pac.y, pac.dir)) {
      pac.x = wrapX(pac.x + pac.dir.x);
      pac.y += pac.dir.y;
    }

    pac.px = pac.x * cellW;
    pac.py = pac.y * cellH;

    const tile = map[pac.y][pac.x];
    if (tile === 2) {
      map[pac.y][pac.x] = 0;
      score += 10;
      pelletsLeft -= 1;
      SFX.waka();
      syncUI();
    } else if (tile === 3) {
      map[pac.y][pac.x] = 0;
      score += 50;
      pelletsLeft -= 1;
      frightened = 40;
      SFX.power();
      syncUI();
    }

    if (pelletsLeft <= 0) winGame();
  }

  function ghostOptions(g) {
    return dirsList().filter((d) => {
      if (opposite(d, g.dir) && !(g.x === g.homeX && g.y === g.homeY)) return false;
      return canMove(g.x, g.y, d);
    });
  }

  function pickGhostDir(g) {
    let opts = ghostOptions(g);
    if (!opts.length) {
      opts = dirsList().filter((d) => canMove(g.x, g.y, d));
    }
    if (!opts.length) return g.dir;

    if (frightened > 0) {
      return opts[Math.floor(Math.random() * opts.length)];
    }

    // mostly chase Pac-Man
    let best = opts[0];
    let bestDist = Infinity;
    for (const d of opts) {
      const nx = wrapX(g.x + d.x);
      const ny = g.y + d.y;
      const dist = Math.abs(nx - pac.x) + Math.abs(ny - pac.y);
      if (dist < bestDist || (dist === bestDist && Math.random() < 0.3)) {
        bestDist = dist;
        best = d;
      }
    }
    // sprinkle randomness so they are not perfect
    if (Math.random() < 0.2) {
      return opts[Math.floor(Math.random() * opts.length)];
    }
    return best;
  }

  function stepGhosts() {
    for (const g of ghosts) {
      g.dir = pickGhostDir(g);
      if (canMove(g.x, g.y, g.dir)) {
        g.x = wrapX(g.x + g.dir.x);
        g.y += g.dir.y;
      }
      g.px = g.x * cellW;
      g.py = g.y * cellH;

      if (g.x === pac.x && g.y === pac.y) {
        if (frightened > 0) {
          score += 200;
          g.x = g.homeX;
          g.y = g.homeY;
          g.px = g.x * cellW;
          g.py = g.y * cellH;
          SFX.eatGhost();
          syncUI();
        } else {
          loseLife();
          return;
        }
      }
    }
  }

  function step() {
    mouth = (mouth + 1) % 10;
    stepPac();
    if (!running) return;
    stepGhosts();
    if (frightened > 0) frightened -= 1;
  }

  function drawMaze() {
    ctx.fillStyle = "#000814";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const dot = Math.max(1.5, Math.min(cellW, cellH) * 0.12);
    const power = Math.max(3, Math.min(cellW, cellH) * 0.28);
    const inset = Math.max(1, Math.min(cellW, cellH) * 0.06);

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const t = map[y][x];
        const px = x * cellW;
        const py = y * cellH;
        if (t === 1) {
          ctx.fillStyle = "#1e4d9c";
          ctx.fillRect(px + inset, py + inset, cellW - inset * 2, cellH - inset * 2);
        } else if (t === 2) {
          ctx.fillStyle = "#ffb8ae";
          ctx.beginPath();
          ctx.arc(px + cellW / 2, py + cellH / 2, dot, 0, Math.PI * 2);
          ctx.fill();
        } else if (t === 3) {
          ctx.fillStyle = "#ffb8ae";
          ctx.beginPath();
          ctx.arc(px + cellW / 2, py + cellH / 2, power, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  function drawPac() {
    const cx = pac.px + cellW / 2;
    const cy = pac.py + cellH / 2;
    const rad = Math.min(cellW, cellH) * 0.42;
    const open = mouth < 5 ? 0.55 : 0.12;
    const rot =
      pac.dir.name === "right"
        ? 0
        : pac.dir.name === "down"
          ? Math.PI / 2
          : pac.dir.name === "left"
            ? Math.PI
            : -Math.PI / 2;

    ctx.fillStyle = "#ffd400";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, rad, rot + open / 2, rot + Math.PI * 2 - open / 2);
    ctx.closePath();
    ctx.fill();
  }

  function drawGhosts() {
    const eye = Math.max(1.5, Math.min(cellW, cellH) * 0.12);
    for (const g of ghosts) {
      const cx = g.px + cellW / 2;
      const cy = g.py + cellH / 2;
      const rad = Math.min(cellW, cellH) * 0.38;
      ctx.fillStyle = frightened > 0 ? "#3b5bdb" : g.color;
      ctx.beginPath();
      ctx.arc(cx, cy - cellH * 0.05, rad, Math.PI, 0);
      ctx.lineTo(g.px + cellW - 2, g.py + cellH - 2);
      ctx.lineTo(g.px + cellW * 0.66, g.py + cellH * 0.7);
      ctx.lineTo(g.px + cellW * 0.5, g.py + cellH - 2);
      ctx.lineTo(g.px + cellW * 0.33, g.py + cellH * 0.7);
      ctx.lineTo(g.px + 2, g.py + cellH - 2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(cx - eye * 1.4, cy - eye, eye, 0, Math.PI * 2);
      ctx.arc(cx + eye * 1.4, cy - eye, eye, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1a1a2e";
      ctx.beginPath();
      ctx.arc(cx - eye * 1.4 + g.dir.x, cy - eye + g.dir.y, eye * 0.45, 0, Math.PI * 2);
      ctx.arc(cx + eye * 1.4 + g.dir.x, cy - eye + g.dir.y, eye * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function draw() {
    drawMaze();
    if (started) {
      drawPac();
      drawGhosts();
    }
    if (paused && running) {
      ctx.fillStyle = "rgba(0, 8, 20, 0.55)";
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

  function canvasPoint(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) * canvas.width) / rect.width,
      y: ((clientY - rect.top) * canvas.height) / rect.height,
    };
  }

  function steerByClick(clientX, clientY) {
    if (!started || dead || won || paused) return;
    const pt = canvasPoint(clientX, clientY);
    const dx = pt.x - (pac.px + cellW / 2);
    const dy = pt.y - (pac.py + cellH / 2);
    if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      setPacDir(dx > 0 ? DIRS.ArrowRight : DIRS.ArrowLeft);
    } else {
      setPacDir(dy > 0 ? DIRS.ArrowDown : DIRS.ArrowUp);
    }
  }

  settingsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".step-btn");
    if (!btn) return;
    const dir = Number(btn.dataset.dir);
    speed = Math.min(10, Math.max(1, speed + dir));
    tickMs = speedToMs(speed);
    syncUI();
  });

  btnSound.addEventListener("click", () => {
    SFX.ensure();
    SFX.muted = !SFX.muted;
    btnSound.textContent = SFX.muted ? "Sound: Off" : "Sound: On";
    btnSound.setAttribute("aria-pressed", SFX.muted ? "true" : "false");
    if (!SFX.muted) SFX.waka();
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
      if (started && !dead && !won) {
        paused = !paused;
        overlayEl.hidden = !paused;
        overlayEl.textContent = paused ? "Paused" : "";
        if (!paused) overlayEl.hidden = true;
      }
      return;
    }
    if (!started || dead || won || paused) return;
    const next = DIRS[e.key];
    if (!next) return;
    e.preventDefault();
    setPacDir(next);
  });

  canvas.addEventListener("click", (e) => steerByClick(e.clientX, e.clientY));

  window.addEventListener("resize", () => {
    fitBoard();
    draw();
  });

  requestAnimationFrame(() => {
    fitBoard();
    showTitle();
    draw();
  });
  requestAnimationFrame(loop);
})();
