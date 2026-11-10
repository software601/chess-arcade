(() => {
  const WORDS = {
    animals: [
      "ELEPHANT",
      "GIRAFFE",
      "PENGUIN",
      "DOLPHIN",
      "KANGAROO",
      "OCTOPUS",
      "PANTHER",
      "SPARROW",
      "BUFFALO",
      "RACCOON",
    ],
    food: [
      "PIZZA",
      "BANANA",
      "CHEESE",
      "BURRITO",
      "POPCORN",
      "WAFFLE",
      "NOODLE",
      "AVOCADO",
      "MUFFIN",
      "PICKLE",
    ],
    tech: [
      "KEYBOARD",
      "MONITOR",
      "BROWSER",
      "SERVER",
      "PYTHON",
      "PACKAGE",
      "PIXEL",
      "ROUTER",
      "BINARY",
      "LAPTOP",
    ],
    places: [
      "LONDON",
      "TOKYO",
      "CAIRO",
      "BERLIN",
      "SYDNEY",
      "MADRID",
      "HAVANA",
      "OSLO",
      "NAIROBI",
      "QUEBEC",
    ],
  };

  const MAX_MISS = 6;
  const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const wordEl = document.getElementById("word");
  const overlayEl = document.getElementById("overlay");
  const hintEl = document.getElementById("hint");
  const keysEl = document.getElementById("keys");
  const btnStart = document.getElementById("btn-start");
  const catEl = document.getElementById("cfg-category");
  const winsEl = document.getElementById("wins");
  const missesEl = document.getElementById("misses");
  const maxMissEl = document.getElementById("max-miss");

  maxMissEl.textContent = String(MAX_MISS);

  let secret = "";
  let guessed = new Set();
  let misses = 0;
  let wins = 0;
  let playing = false;
  let over = false;

  function allWords(category) {
    if (category === "mixed") {
      return Object.values(WORDS).flat();
    }
    return WORDS[category] || WORDS.animals;
  }

  function pickWord() {
    const list = allWords(catEl.value);
    return list[Math.floor(Math.random() * list.length)];
  }

  function displayWord() {
    return secret
      .split("")
      .map((ch) => (guessed.has(ch) ? ch : "_"))
      .join(" ");
  }

  function syncHud() {
    wordEl.textContent = secret ? displayWord() : "_ _ _ _ _";
    missesEl.textContent = String(misses);
    winsEl.textContent = String(wins);
    btnStart.textContent = playing && !over ? "Restart" : "Start";
  }

  function buildKeys() {
    keysEl.innerHTML = "";
    for (const letter of ALPHA) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "key";
      btn.textContent = letter;
      btn.dataset.letter = letter;
      btn.disabled = true;
      keysEl.appendChild(btn);
    }
  }

  function setKeyState(letter, state) {
    const btn = keysEl.querySelector(`[data-letter="${letter}"]`);
    if (!btn) return;
    btn.disabled = true;
    btn.classList.remove("hit", "miss");
    if (state) btn.classList.add(state);
  }

  function enableKeys() {
    for (const btn of keysEl.querySelectorAll(".key")) {
      btn.disabled = false;
      btn.classList.remove("hit", "miss");
    }
  }

  function disableKeys() {
    for (const btn of keysEl.querySelectorAll(".key")) {
      btn.disabled = true;
    }
  }

  function drawGallows(stage) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = "#3b2a1a";
    ctx.fillStyle = "#3b2a1a";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";

    // base + post always
    ctx.beginPath();
    ctx.moveTo(40, h - 28);
    ctx.lineTo(160, h - 28);
    ctx.moveTo(70, h - 28);
    ctx.lineTo(70, 36);
    ctx.lineTo(190, 36);
    ctx.lineTo(190, 58);
    ctx.stroke();

    if (stage < 1) return;

    // head
    ctx.beginPath();
    ctx.arc(190, 82, 22, 0, Math.PI * 2);
    ctx.stroke();
    if (stage < 2) return;

    // body
    ctx.beginPath();
    ctx.moveTo(190, 104);
    ctx.lineTo(190, 178);
    ctx.stroke();
    if (stage < 3) return;

    // left arm
    ctx.beginPath();
    ctx.moveTo(190, 122);
    ctx.lineTo(155, 150);
    ctx.stroke();
    if (stage < 4) return;

    // right arm
    ctx.beginPath();
    ctx.moveTo(190, 122);
    ctx.lineTo(225, 150);
    ctx.stroke();
    if (stage < 5) return;

    // left leg
    ctx.beginPath();
    ctx.moveTo(190, 178);
    ctx.lineTo(160, 220);
    ctx.stroke();
    if (stage < 6) return;

    // right leg
    ctx.beginPath();
    ctx.moveTo(190, 178);
    ctx.lineTo(220, 220);
    ctx.stroke();

    // X eyes when fully hung
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(180, 76);
    ctx.lineTo(188, 84);
    ctx.moveTo(188, 76);
    ctx.lineTo(180, 84);
    ctx.moveTo(192, 76);
    ctx.lineTo(200, 84);
    ctx.moveTo(200, 76);
    ctx.lineTo(192, 84);
    ctx.stroke();
  }

  function revealed() {
    return secret.split("").every((ch) => guessed.has(ch));
  }

  function win() {
    over = true;
    playing = false;
    wins += 1;
    disableKeys();
    overlayEl.hidden = false;
    overlayEl.textContent = `You win!\n${secret}`;
    hintEl.textContent = "Start for a new word";
    syncHud();
  }

  function lose() {
    over = true;
    playing = false;
    // reveal word
    for (const ch of secret) guessed.add(ch);
    disableKeys();
    overlayEl.hidden = false;
    overlayEl.textContent = `You lose\n${secret}`;
    hintEl.textContent = "Start for a new word";
    syncHud();
    drawGallows(MAX_MISS);
  }

  function guess(letter) {
    if (!playing || over) return;
    letter = String(letter || "").toUpperCase();
    if (!/^[A-Z]$/.test(letter) || guessed.has(letter)) return;

    guessed.add(letter);

    if (secret.includes(letter)) {
      setKeyState(letter, "hit");
      syncHud();
      drawGallows(misses);
      if (revealed()) win();
      return;
    }

    misses += 1;
    setKeyState(letter, "miss");
    syncHud();
    drawGallows(misses);
    if (misses >= MAX_MISS) lose();
  }

  function startGame() {
    secret = pickWord();
    guessed = new Set();
    misses = 0;
    playing = true;
    over = false;
    enableKeys();
    overlayEl.hidden = true;
    overlayEl.textContent = "";
    hintEl.textContent = `Category: ${catEl.value} · Click letters or type`;
    syncHud();
    drawGallows(0);
  }

  function showTitle() {
    playing = false;
    over = false;
    secret = "";
    guessed = new Set();
    misses = 0;
    overlayEl.hidden = false;
    overlayEl.textContent = "Press Start";
    hintEl.textContent = "Pick a category · Start to play";
    disableKeys();
    syncHud();
    drawGallows(0);
  }

  keysEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".key");
    if (!btn || btn.disabled) return;
    guess(btn.dataset.letter);
  });

  btnStart.addEventListener("click", () => startGame());

  window.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      startGame();
      return;
    }
    if (!playing || over) return;
    if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      guess(e.key);
    }
  });

  buildKeys();
  showTitle();
})();
