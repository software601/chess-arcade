(() => {
  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const overlayEl = document.getElementById("overlay");
  const hintEl = document.getElementById("hint");
  const statusEl = document.getElementById("status");
  const btnNext = document.getElementById("btn-next");
  const btnHint = document.getElementById("btn-hint");
  const btnAi = document.getElementById("btn-ai");
  const btnBack = document.getElementById("btn-back");
  const boardWrap = document.querySelector(".board-wrap");
  const levelVal = document.getElementById("val-level");
  const levelRange = document.getElementById("level-range");
  const levelMeta = document.getElementById("level-meta");
  const settingsEl = document.querySelector(".settings");
  const phaseTabs = document.querySelector(".phase-tabs");
  const setupSelect = document.getElementById("setup-select");
  const setupLabel = document.getElementById("setup-label");
  const puzzlePhaseEl = document.getElementById("puzzle-phase");
  const puzzleTitleEl = document.getElementById("puzzle-title");
  const puzzleSubEl = document.getElementById("puzzle-sub");
  const solvedEl = document.getElementById("solved");
  const streakEl = document.getElementById("streak");
  const failsEl = document.getElementById("fails");
  const guideAboutEl = document.getElementById("guide-about");
  const coachNoteEl = document.getElementById("coach-note");
  const coachHeadingEl = document.getElementById("coach-heading");
  const coachGradeEl = document.getElementById("coach-grade");
  const coachStarsEl = document.getElementById("coach-stars");
  const coachCommentEl = document.getElementById("coach-comment");
  const coachFixesEl = document.getElementById("coach-fixes");
  const GRADE_WORDS = { 1: "Poor", 2: "Okay", 3: "Good", 4: "Very good", 5: "Excellent" };

  const ENGINE_JS = "/chesspuzzles/stockfish-19-lite-single.js";
  const ENGINE_WASM = "/chesspuzzles/stockfish-19-lite-single.wasm";
  const GLYPH = {
    wk: "♔", wq: "♕", wr: "♖", wb: "♗", wn: "♘", wp: "♙",
    bk: "♚", bq: "♛", br: "♜", bb: "♝", bn: "♞", bp: "♟",
  };

  /**
   * Puzzle bank by phase: opening | middle | endgame.
   * difficulty 1–100 · goal "mate" or "win" · fen: side to move is the player
   */
  const PUZZLES = [
    { phase: "endgame", d: 1, goal: "mate", theme: "Mate in 1", name: "Queen Mate (1)", fen: "7k/5Q2/6K1/8/8/8/8/8 w - - 0 1" },
    { phase: "endgame", d: 2, goal: "mate", theme: "Mate in 1", name: "Queen Mate (2)", fen: "6k1/6Q1/5K2/8/8/8/8/8 w - - 0 1" },
    { phase: "endgame", d: 3, goal: "mate", theme: "Mate in 1", name: "Queen Mate (3)", fen: "5k2/8/4KQ2/8/8/8/8/8 w - - 0 1" },
    { phase: "endgame", d: 3, goal: "mate", theme: "Mate in 1", name: "Queen Mate (4)", fen: "k7/8/1Q6/8/8/8/8/K7 w - - 0 1" },
    { phase: "endgame", d: 4, goal: "mate", theme: "Mate in 1", name: "Queen Mate (5)", fen: "7k/6pp/8/8/8/8/6Q1/6K1 w - - 0 1" },
    { phase: "endgame", d: 5, goal: "mate", theme: "Mate in 1", name: "Queen Mate (6)", fen: "8/8/8/8/8/5K1k/6Q1/8 w - - 0 1" },
    { phase: "endgame", d: 6, goal: "mate", theme: "Mate in 1", name: "Queen Mate (7)", fen: "8/8/8/8/8/4K2k/8/6Q1 w - - 0 1" },
    { phase: "endgame", d: 7, goal: "mate", theme: "Mate in 1", name: "Queen Mate (8)", fen: "8/5pk1/5p2/8/8/8/5Q2/6K1 w - - 0 1" },
    { phase: "endgame", d: 7, goal: "mate", theme: "Mate in 1", name: "Smothered Mate idea (9)", fen: "6rk/6pp/8/8/8/8/5Q2/6K1 w - - 0 1" },
    { phase: "endgame", d: 8, goal: "mate", theme: "Mate in 1", name: "Queen Mate (10)", fen: "7k/5Q2/7K/8/8/8/8/8 w - - 0 1" },
    { phase: "endgame", d: 9, goal: "mate", theme: "Mate in 1", name: "Queen Mate (11)", fen: "8/8/8/8/8/7k/5Q2/6K1 w - - 0 1" },
    { phase: "endgame", d: 10, goal: "mate", theme: "Mate in 1", name: "Queen Mate (12)", fen: "8/8/8/8/6Qk/8/5K2/8 w - - 0 1" },
    { phase: "endgame", d: 11, goal: "mate", theme: "Mate in 1", name: "Queen Mate (13)", fen: "8/8/8/7k/5Q2/8/5K2/8 w - - 0 1" },
    { phase: "endgame", d: 11, goal: "mate", theme: "Mate in 1", name: "Queen Mate (14)", fen: "8/8/8/8/8/k1K5/1Q6/8 w - - 0 1" },
    { phase: "endgame", d: 12, goal: "mate", theme: "Mate in 1", name: "Queen Mate (15)", fen: "8/8/8/8/8/2K4k/5Q2/8 w - - 0 1" },
    { phase: "endgame", d: 13, goal: "mate", theme: "Rook mate", name: "Rook Mate (1)", fen: "7k/8/6KR/8/8/8/8/8 w - - 0 1" },
    { phase: "endgame", d: 14, goal: "mate", theme: "Rook mate", name: "Rook Mate (2)", fen: "k7/8/1K5R/8/8/8/8/8 w - - 0 1" },
    { phase: "endgame", d: 15, goal: "mate", theme: "Rook mate", name: "Back-rank Mate (3)", fen: "6k1/5ppp/8/8/8/8/8/R3K3 w Q - 0 1" },
    { phase: "endgame", d: 15, goal: "mate", theme: "Rook mate", name: "Back-rank Mate (4)", fen: "r5k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1" },
    { phase: "endgame", d: 16, goal: "mate", theme: "Rook mate", name: "Back-rank Mate (5)", fen: "6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1" },
    { phase: "endgame", d: 17, goal: "mate", theme: "Rook mate", name: "Ladder Mate (6)", fen: "7k/8/6R1/8/8/8/8/R5K1 w - - 0 1" },
    { phase: "endgame", d: 18, goal: "mate", theme: "Rook mate", name: "Rook Corridor Mate (7)", fen: "8/8/8/8/8/4k3/8/R3K2R w - - 0 1" },
    { phase: "endgame", d: 19, goal: "mate", theme: "Rook mate", name: "Rook Mate Net (8)", fen: "8/8/8/8/4k3/8/4R3/4K2R w - - 0 1" },
    { phase: "endgame", d: 20, goal: "mate", theme: "Rook mate", name: "Rook Mate (9)", fen: "8/8/8/8/8/k1K5/8/1R6 w - - 0 1" },
    { phase: "endgame", d: 20, goal: "mate", theme: "Rook mate", name: "Rook Mate (10)", fen: "8/8/8/8/8/k1K5/8/2R5 w - - 0 1" },
    { phase: "endgame", d: 21, goal: "mate", theme: "Rook mate", name: "Anastasia's Mate (11)", fen: "5rk1/5ppp/8/8/8/2N5/5PPP/4R1K1 w - - 0 1" },
    { phase: "endgame", d: 22, goal: "mate", theme: "Rook mate", name: "Arabian Mate (12)", fen: "6k1/5R2/6N1/8/8/8/8/6K1 w - - 0 1" },
    { phase: "endgame", d: 23, goal: "mate", theme: "Mate in 2", name: "Mate in 2 (1)", fen: "8/8/8/8/8/4K2k/8/5Q2 w - - 0 1" },
    { phase: "endgame", d: 24, goal: "mate", theme: "Mate in 2", name: "Mate in 2 (2)", fen: "8/8/8/8/8/5K1k/8/6R1 w - - 0 1" },
    { phase: "endgame", d: 24, goal: "mate", theme: "Mate in 2", name: "Mate in 2 (3)", fen: "8/8/8/8/4K3/7k/8/5Q2 w - - 0 1" },
    { phase: "endgame", d: 25, goal: "mate", theme: "Mate in 2", name: "Mate in 2 (4)", fen: "8/8/8/4K3/8/7k/8/6R1 w - - 0 1" },
    { phase: "endgame", d: 26, goal: "mate", theme: "Two-Rook Mate", name: "Two-Rook Mate (5)", fen: "7k/8/8/8/8/8/6R1/R5K1 w - - 0 1" },
    { phase: "endgame", d: 27, goal: "mate", theme: "Mate in 2", name: "Mate in 2 (6)", fen: "8/8/8/8/8/1K5k/8/7Q w - - 0 1" },
    { phase: "endgame", d: 28, goal: "mate", theme: "Mate in 2", name: "Mate in 2 (7)", fen: "8/8/8/8/5K1k/8/6Q1/8 w - - 0 1" },
    { phase: "endgame", d: 28, goal: "mate", theme: "Ladder Mate", name: "Ladder Mate (8)", fen: "8/7k/8/8/8/8/1R6/1R4K1 w - - 0 1" },
    { phase: "endgame", d: 29, goal: "mate", theme: "Mate in 3", name: "Mate in 3 (9)", fen: "8/8/8/8/8/4K2k/5Q2/8 w - - 0 1" },
    { phase: "endgame", d: 30, goal: "mate", theme: "Mate in 3", name: "Mate in 3 (10)", fen: "8/8/8/8/5K2/7k/8/6R1 w - - 0 1" },
    { phase: "endgame", d: 31, goal: "mate", theme: "Mate in 3", name: "Mate in 3 (11)", fen: "8/8/8/7k/5K2/8/6Q1/8 w - - 0 1" },
    { phase: "endgame", d: 32, goal: "mate", theme: "Deep Mating Net", name: "Deep Mating Net (12)", fen: "8/8/8/8/8/2K4k/8/3Q4 w - - 0 1" },
    { phase: "endgame", d: 32, goal: "mate", theme: "Mate in 4", name: "Mate in 4 (13)", fen: "8/8/8/8/5K2/6k1/8/5Q2 w - - 0 1" },
    { phase: "endgame", d: 33, goal: "mate", theme: "Mate in 4 · K+Q", name: "Mate in 4 · K+Q (14)", fen: "8/8/8/8/8/5k2/8/4KQ2 w - - 0 1" },
    { phase: "endgame", d: 34, goal: "mate", theme: "Mate in 3", name: "Mate in 3 (15)", fen: "8/8/8/8/8/7k/5Q2/5K2 w - - 0 1" },
    { phase: "endgame", d: 35, goal: "win", theme: "K+Q vs K", name: "K+Q vs K (1)", fen: "8/8/8/8/8/3K3k/8/4Q3 w - - 0 1" },
    { phase: "endgame", d: 36, goal: "win", theme: "K+R vs K", name: "K+R vs K (1)", fen: "8/8/8/8/8/3K3k/8/4R3 w - - 0 1" },
    { phase: "endgame", d: 36, goal: "win", theme: "Opposition", name: "Opposition (1)", fen: "8/8/8/3k4/8/3K4/8/3R4 w - - 0 1" },
    { phase: "endgame", d: 37, goal: "win", theme: "Queen Check Technique", name: "Queen Check Technique (1)", fen: "8/8/8/8/8/4k3/8/3QK3 w - - 0 1" },
    { phase: "endgame", d: 38, goal: "win", theme: "Pawn Race", name: "Pawn Race (1)", fen: "8/8/8/8/8/4k3/3P4/4K3 w - - 0 1" },
    { phase: "endgame", d: 39, goal: "win", theme: "Key Squares", name: "Key Squares (1)", fen: "8/8/8/3k4/8/3P4/8/3K4 w - - 0 1" },
    { phase: "endgame", d: 40, goal: "win", theme: "King Opposition", name: "King Opposition (1)", fen: "8/8/8/8/3k4/8/3P4/3K4 w - - 0 1" },
    { phase: "endgame", d: 40, goal: "win", theme: "Outside Passed Pawn", name: "Outside Passed Pawn (1)", fen: "8/8/8/1k6/8/1P6/8/1K6 w - - 0 1" },
    { phase: "endgame", d: 41, goal: "win", theme: "Protected Passed Pawn", name: "Protected Passed Pawn (1)", fen: "8/8/8/3k4/3P4/3K4/8/8 w - - 0 1" },
    { phase: "endgame", d: 42, goal: "win", theme: "King + Pawn Ending", name: "King + Pawn Ending (1)", fen: "8/8/4k3/8/4P3/4K3/8/8 w - - 0 1" },
    { phase: "endgame", d: 43, goal: "win", theme: "Lucena Position", name: "Lucena Position (1)", fen: "1K1k4/1P6/8/8/8/8/8/1R6 w - - 0 1" },
    { phase: "endgame", d: 44, goal: "win", theme: "Building the Lucena", name: "Building the Lucena (1)", fen: "1K6/1P1k4/8/8/8/8/8/2R5 w - - 0 1" },
    { phase: "endgame", d: 44, goal: "win", theme: "Lucena Bridge", name: "Lucena Bridge (1)", fen: "1k6/1P6/2K5/8/8/8/8/1R6 w - - 0 1" },
    { phase: "endgame", d: 45, goal: "win", theme: "Rook + Pawn Ending", name: "Rook + Pawn Ending (1)", fen: "8/8/8/8/4k3/8/3PR3/4K3 w - - 0 1" },
    { phase: "endgame", d: 46, goal: "win", theme: "Cutting Off the King", name: "Cutting Off the King (1)", fen: "8/8/8/3k4/8/8/8/3RKR2 w - - 0 1" },
    { phase: "endgame", d: 47, goal: "win", theme: "Skewer", name: "Skewer (1)", fen: "8/8/8/7k/8/8/7R/K6r w - - 0 1" },
    { phase: "endgame", d: 48, goal: "win", theme: "Rook Ending", name: "Rook Ending (1)", fen: "8/5k2/8/8/8/5R2/5K2/8 w - - 0 1" },
    { phase: "endgame", d: 48, goal: "win", theme: "Bishop + Knight Mate", name: "Bishop + Knight Mate (1)", fen: "8/8/8/8/8/2K4k/8/4BN2 w - - 0 1" },
    { phase: "endgame", d: 49, goal: "win", theme: "Two Bishops Mate", name: "Two Bishops Mate (1)", fen: "8/8/8/8/8/3K3k/8/3BB3 w - - 0 1" },
    { phase: "endgame", d: 50, goal: "win", theme: "Bishop Pair Mate", name: "Bishop Pair Mate (1)", fen: "8/8/8/8/7k/8/3BB3/4K3 w - - 0 1" },
    { phase: "endgame", d: 51, goal: "win", theme: "Bishop + Pawn Ending", name: "Bishop + Pawn Ending (1)", fen: "8/8/8/8/3k4/8/3PB3/3K4 w - - 0 1" },
    { phase: "endgame", d: 52, goal: "win", theme: "Knight Fork Net", name: "Knight Fork Net (1)", fen: "8/8/8/4k3/8/3N4/4K3/8 w - - 0 1" },
    { phase: "endgame", d: 53, goal: "win", theme: "Queen + Knight Mate", name: "Queen + Knight Mate (1)", fen: "7k/6pp/8/8/8/5N2/5Q2/6K1 w - - 0 1" },
    { phase: "endgame", d: 53, goal: "win", theme: "Queen vs Rook", name: "Queen vs Rook (1)", fen: "8/8/8/8/4k3/8/4Q3/3Kr3 w - - 0 1" },
    { phase: "endgame", d: 54, goal: "win", theme: "Rook + Bishop vs Rook", name: "Rook + Bishop vs Rook (1)", fen: "8/8/8/8/4k3/8/3RB3/4K3 w - - 0 1" },
    { phase: "endgame", d: 55, goal: "win", theme: "Connected Passed Pawns", name: "Connected Passed Pawns (1)", fen: "8/8/8/3k4/8/3PP3/4K3/8 w - - 0 1" },
    { phase: "endgame", d: 56, goal: "win", theme: "Wrong Bishop Ending", name: "Wrong Bishop Ending (1)", fen: "8/8/8/7k/8/6P1/5B2/6K1 w - - 0 1" },
    { phase: "endgame", d: 57, goal: "win", theme: "Queen vs Knight", name: "Queen vs Knight (1)", fen: "8/8/8/4k3/8/4n3/4Q3/4K3 w - - 0 1" },
    { phase: "endgame", d: 57, goal: "win", theme: "Rook vs Pawn", name: "Rook vs Pawn (1)", fen: "8/8/8/8/3k4/8/3pR3/3K4 w - - 0 1" },
    { phase: "endgame", d: 58, goal: "win", theme: "Philidor Position", name: "Philidor Position (1)", fen: "8/8/8/4k3/3R4/8/4P3/4K3 w - - 0 1" },
    { phase: "endgame", d: 59, goal: "win", theme: "Two Knights vs Pawn", name: "Two Knights vs Pawn (1)", fen: "8/8/8/8/3k4/3p4/3NN3/3K4 w - - 0 1" },
    { phase: "endgame", d: 60, goal: "win", theme: "Complex Pawn Ending", name: "Complex Pawn Ending (1)", fen: "8/8/1k6/8/1P3P2/8/1K6/8 w - - 0 1" },
    { phase: "endgame", d: 61, goal: "win", theme: "Rook vs Connected Pawns", name: "Rook vs Connected Pawns (1)", fen: "8/8/8/8/3k4/3pp3/8/3RK3 w - - 0 1" },
    { phase: "endgame", d: 61, goal: "win", theme: "Queen + Pawn vs Queen", name: "Queen + Pawn vs Queen (1)", fen: "8/8/8/4k3/8/4P3/4Q3/3Kq3 w - - 0 1" },
    { phase: "endgame", d: 62, goal: "win", theme: "Rook + Bishop Mate", name: "Rook + Bishop Mate (1)", fen: "8/8/8/8/4k3/8/4RB2/4K3 w - - 0 1" },
    { phase: "endgame", d: 63, goal: "win", theme: "Opposite-Colored Bishops", name: "Opposite-Colored Bishops (1)", fen: "8/8/8/3k4/8/3P4/3B4/3K1b2 w - - 0 1" },
    { phase: "endgame", d: 64, goal: "win", theme: "Tablebase Ending", name: "Tablebase Ending (1)", fen: "8/8/8/8/3k4/8/2N1P3/3K4 w - - 0 1" },
    { phase: "endgame", d: 65, goal: "win", theme: "Queen vs Rook + Pawn", name: "Queen vs Rook + Pawn (1)", fen: "8/8/8/4k3/8/3p4/3Q4/3Kr3 w - - 0 1" },
    { phase: "endgame", d: 65, goal: "win", theme: "Master Endgame", name: "Master Endgame (1)", fen: "8/8/8/4k3/8/3R4/3P4/3K4 w - - 0 1" },
    { phase: "endgame", d: 66, goal: "win", theme: "Réti Endgame Idea", name: "Réti Endgame Idea (1)", fen: "8/8/8/8/8/3k4/4P3/4K3 w - - 0 1" },
    { phase: "endgame", d: 67, goal: "win", theme: "Shouldering", name: "Shouldering (1)", fen: "8/8/8/4k3/8/3P4/8/4K3 w - - 0 1" },
    { phase: "endgame", d: 68, goal: "win", theme: "Knight + Pawn vs King", name: "Knight + Pawn vs King (1)", fen: "8/8/8/3k4/8/3P4/3N4/3K4 w - - 0 1" },
    { phase: "endgame", d: 69, goal: "win", theme: "Queen vs Rook + Bishop", name: "Queen vs Rook + Bishop (1)", fen: "8/8/8/4k3/8/8/3Q4/2BKr3 w - - 0 1" },
    { phase: "endgame", d: 69, goal: "win", theme: "Two Passed Pawns", name: "Two Passed Pawns (1)", fen: "8/8/8/2k5/8/1P1P4/8/2K5 w - - 0 1" },
    { phase: "endgame", d: 70, goal: "win", theme: "Breaking a Fortress", name: "Breaking a Fortress (1)", fen: "8/8/8/5k2/8/5P2/4B3/5K2 w - - 0 1" },
    { phase: "endgame", d: 71, goal: "win", theme: "Queen vs Bishop + Knight", name: "Queen vs Bishop + Knight (1)", fen: "8/8/8/4k3/8/3bn3/4Q3/4K3 w - - 0 1" },
    { phase: "endgame", d: 72, goal: "win", theme: "Rook vs Two Pawns", name: "Rook vs Two Pawns (1)", fen: "8/8/8/8/3kpp2/8/8/3RK3 w - - 0 1" },
    { phase: "endgame", d: 73, goal: "win", theme: "Knight + Pawn Technique", name: "Knight + Pawn Technique (1)", fen: "8/8/8/4k3/8/3N4/4P3/4K3 w - - 0 1" },
    { phase: "endgame", d: 73, goal: "win", theme: "Key Squares", name: "Key Squares (2)", fen: "8/8/8/8/3k4/8/3P4/3K4 w - - 0 1" },
    { phase: "endgame", d: 74, goal: "win", theme: "Outside Passed Pawn", name: "Outside Passed Pawn (2)", fen: "8/8/8/2k5/8/2P5/8/2K5 w - - 0 1" },
    { phase: "endgame", d: 75, goal: "win", theme: "King + Pawn Ending", name: "King + Pawn Ending (2)", fen: "8/8/8/4k3/8/4P3/8/4K3 w - - 0 1" },
    { phase: "endgame", d: 76, goal: "win", theme: "King + Pawn Ending", name: "King + Pawn Ending (3)", fen: "8/8/8/5k2/8/5P2/8/5K2 w - - 0 1" },
    { phase: "endgame", d: 77, goal: "win", theme: "Outside Passed Pawn", name: "Outside Passed Pawn (3)", fen: "8/8/8/1k6/8/1P6/1K6/8 w - - 0 1" },
    { phase: "endgame", d: 77, goal: "win", theme: "Protected Passed Pawn", name: "Protected Passed Pawn (2)", fen: "8/8/3k4/8/3P4/3K4/8/8 w - - 0 1" },
    { phase: "endgame", d: 78, goal: "win", theme: "Rook Ending", name: "Rook Ending (2)", fen: "8/8/8/8/4k3/8/3R4/4K3 w - - 0 1" },
    { phase: "endgame", d: 79, goal: "win", theme: "Rook Ending", name: "Rook Ending (3)", fen: "8/8/8/8/5k2/8/4R3/5K2 w - - 0 1" },
    { phase: "endgame", d: 80, goal: "win", theme: "Rook Ending", name: "Rook Ending (4)", fen: "8/8/8/8/3k4/8/2R5/3K4 w - - 0 1" },
    { phase: "endgame", d: 81, goal: "win", theme: "K+Q vs K", name: "K+Q vs K (2)", fen: "8/8/8/8/8/3k4/3Q4/3K4 w - - 0 1" },
    { phase: "endgame", d: 81, goal: "win", theme: "K+Q vs K", name: "K+Q vs K (3)", fen: "8/8/8/8/8/4k3/4Q3/4K3 w - - 0 1" },
    { phase: "endgame", d: 82, goal: "win", theme: "K+R vs K", name: "K+R vs K (2)", fen: "8/8/8/8/8/2k5/2R5/2K5 w - - 0 1" },
    { phase: "endgame", d: 83, goal: "win", theme: "K+R vs K", name: "K+R vs K (3)", fen: "8/8/8/8/8/5k2/5R2/5K2 w - - 0 1" },
    { phase: "endgame", d: 84, goal: "mate", theme: "Queen Mate", name: "Queen Mate (15)", fen: "8/8/8/8/8/6k1/5Q2/6K1 w - - 0 1" },
    { phase: "endgame", d: 85, goal: "mate", theme: "Queen Mate", name: "Queen Mate (16)", fen: "8/8/8/8/8/5k2/4Q3/5K2 w - - 0 1" },
    { phase: "endgame", d: 86, goal: "mate", theme: "Queen Mate", name: "Queen Mate (17)", fen: "8/8/8/8/8/4k3/3Q4/4K3 w - - 0 1" },
    { phase: "endgame", d: 86, goal: "mate", theme: "Queen Mate", name: "Queen Mate (18)", fen: "8/8/8/8/8/3k4/2Q5/3K4 w - - 0 1" },
    { phase: "endgame", d: 87, goal: "mate", theme: "Queen Mate", name: "Queen Mate (19)", fen: "8/8/8/8/8/2k5/1Q6/2K5 w - - 0 1" },
    { phase: "endgame", d: 88, goal: "mate", theme: "Queen Mate", name: "Queen Mate (20)", fen: "8/8/8/8/8/1k6/Q7/1K6 w - - 0 1" },
    { phase: "endgame", d: 89, goal: "mate", theme: "Rook Mate", name: "Rook Mate (6)", fen: "8/8/8/8/8/6k1/6R1/6K1 w - - 0 1" },
    { phase: "endgame", d: 90, goal: "mate", theme: "Rook Mate", name: "Rook Mate (7)", fen: "8/8/8/8/8/5k2/5R2/5K2 w - - 0 1" },
    { phase: "endgame", d: 90, goal: "mate", theme: "Rook Mate", name: "Rook Mate (8)", fen: "8/8/8/8/8/4k3/4R3/4K3 w - - 0 1" },
    { phase: "endgame", d: 91, goal: "mate", theme: "Rook Mate", name: "Rook Mate (9)", fen: "8/8/8/8/8/3k4/3R4/3K4 w - - 0 1" },
    { phase: "endgame", d: 92, goal: "mate", theme: "Rook Mate", name: "Rook Mate (10)", fen: "8/k7/2K5/1R6/8/8/8/8 w - - 0 1" },
    { phase: "endgame", d: 93, goal: "mate", theme: "Queen Mate", name: "Queen Mate (21)", fen: "k7/2K5/1Q6/8/8/8/8/8 w - - 0 1" },
    { phase: "endgame", d: 94, goal: "mate", theme: "Queen Mate", name: "Queen Mate (22)", fen: "7k/5K2/6Q1/8/8/8/8/8 w - - 0 1" },
    { phase: "endgame", d: 94, goal: "mate", theme: "Rook Mate", name: "Rook Mate (11)", fen: "7k/5K1R/8/8/8/8/8/8 w - - 0 1" },
    { phase: "endgame", d: 95, goal: "mate", theme: "Rook Mate", name: "Rook Mate (12)", fen: "6k1/4K3/5R2/8/8/8/8/8 w - - 0 1" },
    { phase: "endgame", d: 96, goal: "mate", theme: "Queen Mate", name: "Queen Mate (23)", fen: "8/8/8/8/8/7k/6Q1/5K2 w - - 0 1" },
    { phase: "endgame", d: 97, goal: "mate", theme: "Rook Mate", name: "Rook Mate (13)", fen: "8/8/8/8/8/7k/6R1/5K2 w - - 0 1" },
    { phase: "endgame", d: 98, goal: "mate", theme: "Mate in 2", name: "Mate in 2 (7)", fen: "8/8/8/8/7k/5K2/6Q1/8 w - - 0 1" },
    { phase: "endgame", d: 98, goal: "mate", theme: "Mate in 2", name: "Mate in 2 (8)", fen: "8/8/8/8/7k/5K2/6R1/8 w - - 0 1" },
    { phase: "endgame", d: 99, goal: "mate", theme: "Mate in 2", name: "Mate in 2 (9)", fen: "8/8/8/8/k7/2K5/1Q6/8 w - - 0 1" },
    { phase: "endgame", d: 100, goal: "mate", theme: "Mate in 2", name: "Mate in 2 (10)", fen: "8/8/8/8/k7/2K5/1R6/8 w - - 0 1" },
    { phase: "opening", d: 1, goal: "mate", theme: "Fool's Mate", name: "Fool's Mate (1)", fen: "rnbqkbnr/ppppp2p/5p2/6p1/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3" },
    { phase: "opening", d: 2, goal: "mate", theme: "Scholar's Mate", name: "Scholar's Mate (1)", fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 4" },
    { phase: "opening", d: 2, goal: "mate", theme: "Scholar's Mate · defend", name: "Scholar's Mate · defend (1)", fen: "rnbqkbnr/pppp1ppp/8/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR b KQkq - 0 3" },
    { phase: "opening", d: 3, goal: "mate", theme: "Legal's Mate", name: "Legal's Mate (1)", fen: "r2qkbnr/ppp2ppp/2np4/4N3/2B1P1b1/8/PPPP1PPP/RNBQK2R w KQkq - 0 6" },
    { phase: "opening", d: 4, goal: "win", theme: "Italian Game", name: "Italian Game (1)", fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4" },
    { phase: "opening", d: 4, goal: "win", theme: "Giuoco Piano", name: "Giuoco Piano (1)", fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq - 0 5" },
    { phase: "opening", d: 5, goal: "win", theme: "Fried Liver Attack", name: "Fried Liver Attack (1)", fen: "r1bqkb1r/ppp2ppp/2n2n2/3Pp1N1/2B5/8/PPPP1PPP/RNBQK2R b KQkq - 0 5" },
    { phase: "opening", d: 6, goal: "win", theme: "Traxler Counterattack", name: "Traxler Counterattack (1)", fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p1N1/2B1P3/8/PPPP1PPP/RNBQK2R b KQkq - 0 4" },
    { phase: "opening", d: 6, goal: "win", theme: "Evans Gambit", name: "Evans Gambit (1)", fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/1BB1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 4" },
    { phase: "opening", d: 7, goal: "win", theme: "Two Knights Defense", name: "Two Knights Defense (1)", fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4" },
    { phase: "opening", d: 8, goal: "win", theme: "Ruy Lopez", name: "Ruy Lopez (1)", fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 3" },
    { phase: "opening", d: 8, goal: "win", theme: "Ruy Lopez · Exchange", name: "Ruy Lopez · Exchange (1)", fen: "r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5" },
    { phase: "opening", d: 9, goal: "win", theme: "Ruy Lopez · Berlin", name: "Ruy Lopez · Berlin (1)", fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 4" },
    { phase: "opening", d: 10, goal: "win", theme: "Ruy Lopez · Marshall", name: "Ruy Lopez · Marshall (1)", fen: "r1bq1rk1/2p1bppp/p1n2n2/1p1pp3/4P3/1BP2N2/PP1P1PPP/RNBQR1K1 w - - 0 9" },
    { phase: "opening", d: 10, goal: "win", theme: "Scotch Game", name: "Scotch Game (1)", fen: "r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3" },
    { phase: "opening", d: 11, goal: "win", theme: "Scotch Gambit", name: "Scotch Gambit (1)", fen: "r1bqk1nr/pppp1ppp/2n5/2b5/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 0 5" },
    { phase: "opening", d: 12, goal: "win", theme: "King's Gambit", name: "King's Gambit (1)", fen: "rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq - 0 2" },
    { phase: "opening", d: 12, goal: "win", theme: "King's Gambit Accepted", name: "King's Gambit Accepted (1)", fen: "rnbqkbnr/pppp1ppp/8/8/4Pp2/5N2/PPPP2PP/RNBQKB1R b KQkq - 0 3" },
    { phase: "opening", d: 13, goal: "win", theme: "Danish Gambit", name: "Danish Gambit (1)", fen: "rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2" },
    { phase: "opening", d: 14, goal: "win", theme: "Center Counter", name: "Center Counter (1)", fen: "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2" },
    { phase: "opening", d: 14, goal: "win", theme: "Scandinavian", name: "Scandinavian (1)", fen: "rnbqkbnr/ppp1pppp/8/3P4/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2" },
    { phase: "opening", d: 15, goal: "win", theme: "French Defense", name: "French Defense (1)", fen: "rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2" },
    { phase: "opening", d: 16, goal: "win", theme: "French Advance", name: "French Advance (1)", fen: "rnbqkbnr/ppp2ppp/4p3/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3" },
    { phase: "opening", d: 16, goal: "win", theme: "French Winawer", name: "French Winawer (1)", fen: "rnbqk1nr/ppp2ppp/4p3/3p4/1b1PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 0 4" },
    { phase: "opening", d: 17, goal: "win", theme: "Caro-Kann", name: "Caro-Kann (1)", fen: "rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2" },
    { phase: "opening", d: 18, goal: "win", theme: "Caro-Kann Advance", name: "Caro-Kann Advance (1)", fen: "rnbqkbnr/pp2pppp/2p5/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3" },
    { phase: "opening", d: 18, goal: "win", theme: "Sicilian Defense", name: "Sicilian Defense (1)", fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2" },
    { phase: "opening", d: 19, goal: "win", theme: "Sicilian Open", name: "Sicilian Open (1)", fen: "rnbqkbnr/pp2pppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3" },
    { phase: "opening", d: 20, goal: "win", theme: "Sicilian Najdorf", name: "Sicilian Najdorf (1)", fen: "rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6" },
    { phase: "opening", d: 20, goal: "win", theme: "Sicilian Dragon", name: "Sicilian Dragon (1)", fen: "rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6" },
    { phase: "opening", d: 21, goal: "win", theme: "Dragon · Yugoslav", name: "Dragon · Yugoslav (1)", fen: "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R b - - 0 9" },
    { phase: "opening", d: 22, goal: "win", theme: "Sicilian Scheveningen", name: "Sicilian Scheveningen (1)", fen: "rnbqkb1r/pp2pppp/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6" },
    { phase: "opening", d: 22, goal: "win", theme: "Sicilian Sveshnikov", name: "Sicilian Sveshnikov (1)", fen: "rnbqkb1r/pp2pp1p/3p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6" },
    { phase: "opening", d: 23, goal: "win", theme: "Pirc Defense", name: "Pirc Defense (1)", fen: "rnbqkb1r/ppp1pppp/3p1n2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3" },
    { phase: "opening", d: 24, goal: "win", theme: "Modern Defense", name: "Modern Defense (1)", fen: "rnbqkbnr/pppppp1p/6p1/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2" },
    { phase: "opening", d: 24, goal: "win", theme: "Alekhine Defense", name: "Alekhine Defense (1)", fen: "rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2" },
    { phase: "opening", d: 25, goal: "win", theme: "Queen's Gambit", name: "Queen's Gambit (1)", fen: "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2" },
    { phase: "opening", d: 26, goal: "win", theme: "Queen's Gambit Declined", name: "Queen's Gambit Declined (1)", fen: "rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3" },
    { phase: "opening", d: 26, goal: "win", theme: "Queen's Gambit Accepted", name: "Queen's Gambit Accepted (1)", fen: "rnbqkbnr/ppp1pppp/8/8/2pP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3" },
    { phase: "opening", d: 27, goal: "win", theme: "Slav Defense", name: "Slav Defense (1)", fen: "rnbqkbnr/pp2pppp/2p5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3" },
    { phase: "opening", d: 28, goal: "win", theme: "Semi-Slav", name: "Semi-Slav (1)", fen: "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5" },
    { phase: "opening", d: 28, goal: "win", theme: "Semi-Slav · Botvinnik", name: "Semi-Slav · Botvinnik (1)", fen: "rnbqkb1r/pp3ppp/2p1pn2/6B1/2pPP3/2N2N2/PP3PPP/R2QKB1R b KQkq - 0 6" },
    { phase: "opening", d: 29, goal: "win", theme: "Nimzo-Indian", name: "Nimzo-Indian (1)", fen: "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4" },
    { phase: "opening", d: 30, goal: "win", theme: "King's Indian", name: "King's Indian (1)", fen: "rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3" },
    { phase: "opening", d: 30, goal: "win", theme: "Grünfeld", name: "Grünfeld (1)", fen: "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4" },
    { phase: "opening", d: 31, goal: "win", theme: "Queen's Indian", name: "Queen's Indian (1)", fen: "rnbqkb1r/p1pp1ppp/1p2pn2/8/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4" },
    { phase: "opening", d: 32, goal: "win", theme: "Benoni", name: "Benoni (1)", fen: "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4" },
    { phase: "opening", d: 32, goal: "win", theme: "Dutch Defense", name: "Dutch Defense (1)", fen: "rnbqkbnr/ppppp1pp/8/5p2/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2" },
    { phase: "opening", d: 33, goal: "win", theme: "English Opening", name: "English Opening (1)", fen: "rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq - 0 1" },
    { phase: "opening", d: 34, goal: "win", theme: "English Symmetrical", name: "English Symmetrical (1)", fen: "rnbqkbnr/pp1ppppp/8/2p5/2P5/8/PP1PPPPP/RNBQKBNR w KQkq - 0 2" },
    { phase: "opening", d: 34, goal: "win", theme: "Reti Opening", name: "Reti Opening (1)", fen: "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2" },
    { phase: "opening", d: 35, goal: "win", theme: "London System", name: "London System (1)", fen: "rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/5N2/PPP1PPPP/RN1QKB1R b KQkq - 0 3" },
    { phase: "opening", d: 36, goal: "win", theme: "Colle System", name: "Colle System (1)", fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/3P4/3BPN2/PPP2PPP/RNBQK2R b KQkq - 0 4" },
    { phase: "opening", d: 36, goal: "win", theme: "Bird's Opening", name: "Bird's Opening (1)", fen: "rnbqkbnr/pppppppp/8/8/5P2/8/PPPPP1PP/RNBQKBNR b KQkq - 0 1" },
    { phase: "opening", d: 37, goal: "win", theme: "Vienna Game", name: "Vienna Game (1)", fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 0 2" },
    { phase: "opening", d: 38, goal: "win", theme: "Bishop's Opening", name: "Bishop's Opening (1)", fen: "rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 0 2" },
    { phase: "opening", d: 38, goal: "win", theme: "Petrov Defense", name: "Petrov Defense (1)", fen: "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3" },
    { phase: "opening", d: 39, goal: "win", theme: "Philidor Defense", name: "Philidor Defense (1)", fen: "rnbqkbnr/ppp2ppp/3p4/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3" },
    { phase: "opening", d: 40, goal: "win", theme: "Four Knights", name: "Four Knights (1)", fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 0 4" },
    { phase: "opening", d: 40, goal: "win", theme: "Three Knights", name: "Three Knights (1)", fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R b KQkq - 0 3" },
    { phase: "opening", d: 41, goal: "win", theme: "Ponziani", name: "Ponziani (1)", fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/2P2N2/PP1P1PPP/RNBQKB1R b KQkq - 0 3" },
    { phase: "opening", d: 42, goal: "win", theme: "Center Game", name: "Center Game (1)", fen: "rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2" },
    { phase: "opening", d: 42, goal: "win", theme: "Grob Attack", name: "Grob Attack (1)", fen: "rnbqkbnr/pppppppp/8/8/6P1/8/PPPPPP1P/RNBQKBNR b KQkq - 0 1" },
    { phase: "opening", d: 43, goal: "win", theme: "Polish Opening", name: "Polish Opening (1)", fen: "rnbqkbnr/pppppppp/8/8/1P6/8/P1PPPPPP/RNBQKBNR b KQkq - 0 1" },
    { phase: "opening", d: 44, goal: "win", theme: "Catalan", name: "Catalan (1)", fen: "rnbqkb1r/pppp1ppp/4pn2/8/2PP4/6P1/PP2PP1P/RNBQKBNR b KQkq - 0 3" },
    { phase: "opening", d: 44, goal: "win", theme: "Trompowsky", name: "Trompowsky (1)", fen: "rnbqkb1r/pppppppp/5n2/6B1/3P4/8/PPP1PPPP/RN1QKBNR b KQkq - 0 2" },
    { phase: "opening", d: 45, goal: "win", theme: "Veresov", name: "Veresov (1)", fen: "rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/2N5/PPP1PPPP/R2QKBNR b KQkq - 0 3" },
    { phase: "opening", d: 46, goal: "win", theme: "Blackmar-Diemer", name: "Blackmar-Diemer (1)", fen: "rnbqkbnr/ppp1pppp/8/3p4/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2" },
    { phase: "opening", d: 46, goal: "win", theme: "Budapest Gambit", name: "Budapest Gambit (1)", fen: "rnbqkb1r/pppp1ppp/5n2/4p3/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3" },
    { phase: "opening", d: 47, goal: "win", theme: "Albin Countergambit", name: "Albin Countergambit (1)", fen: "rnbqkbnr/ppp2ppp/8/3pp3/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3" },
    { phase: "opening", d: 48, goal: "win", theme: "Chigorin", name: "Chigorin (1)", fen: "r1bqkbnr/ppp1pppp/2n5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3" },
    { phase: "opening", d: 48, goal: "win", theme: "Tarrasch Defense", name: "Tarrasch Defense (1)", fen: "rnbqkbnr/pp3ppp/4p3/2pp4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4" },
    { phase: "opening", d: 49, goal: "win", theme: "Benko Gambit", name: "Benko Gambit (1)", fen: "rnbqkb1r/p2ppppp/5n2/1ppP4/2P5/8/PP2PPPP/RNBQKBNR w KQkq - 0 4" },
    { phase: "opening", d: 50, goal: "win", theme: "King's Indian Attack", name: "King's Indian Attack (1)", fen: "rnbqkb1r/ppp1pppp/5n2/3p4/8/5NP1/PPPPPP1P/RNBQKB1R w KQkq - 0 3" },
    { phase: "opening", d: 51, goal: "win", theme: "Closed Sicilian", name: "Closed Sicilian (1)", fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 0 2" },
    { phase: "opening", d: 51, goal: "win", theme: "Grand Prix Attack", name: "Grand Prix Attack (1)", fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 0 2" },
    { phase: "opening", d: 52, goal: "win", theme: "Smith-Morra", name: "Smith-Morra (1)", fen: "rnbqkbnr/pp1ppppp/8/2p5/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2" },
    { phase: "opening", d: 53, goal: "win", theme: "Wing Gambit", name: "Wing Gambit (1)", fen: "rnbqkbnr/pp1ppppp/8/2p5/1P2P3/8/P1PP1PPP/RNBQKBNR b KQkq - 0 2" },
    { phase: "opening", d: 53, goal: "win", theme: "Morra Gambit", name: "Morra Gambit (1)", fen: "rnbqkbnr/pp1ppppp/8/8/3pP3/2P5/PP3PPP/RNBQKBNR b KQkq - 0 3" },
    { phase: "opening", d: 54, goal: "win", theme: "Vienna Gambit", name: "Vienna Gambit (1)", fen: "rnbqkbnr/pppp1ppp/8/4p3/4PP2/2N5/PPPP2PP/R1BQKBNR b KQkq - 0 3" },
    { phase: "opening", d: 55, goal: "win", theme: "Max Lange Attack", name: "Max Lange Attack (1)", fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 5" },
    { phase: "opening", d: 55, goal: "mate", theme: "Italian · Opera motif", name: "Italian · Opera motif (1)", fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 5" },
    { phase: "opening", d: 56, goal: "win", theme: "Center fork trick", name: "Center fork trick (1)", fen: "rnbqkbnr/ppp2ppp/8/3pp3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3" },
    { phase: "opening", d: 57, goal: "win", theme: "Open Game · center", name: "Open Game · center (1)", fen: "rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2" },
    { phase: "opening", d: 57, goal: "win", theme: "Italian Game", name: "Italian Game (2)", fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4" },
    { phase: "opening", d: 58, goal: "win", theme: "Italian Game", name: "Italian Game (3)", fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 5" },
    { phase: "opening", d: 59, goal: "win", theme: "Italian Game", name: "Italian Game (4)", fen: "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQ - 0 6" },
    { phase: "opening", d: 59, goal: "win", theme: "Italian Game", name: "Italian Game (5)", fen: "r1bqk2r/ppp2ppp/2n2n2/2bpp3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq - 0 6" },
    { phase: "opening", d: 60, goal: "win", theme: "Ruy Lopez", name: "Ruy Lopez (5)", fen: "r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4" },
    { phase: "opening", d: 61, goal: "win", theme: "Ruy Lopez", name: "Ruy Lopez (6)", fen: "r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5" },
    { phase: "opening", d: 61, goal: "win", theme: "Ruy Lopez", name: "Ruy Lopez (7)", fen: "r1bqkb1r/2pp1ppp/p1n2n2/1p2p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 6" },
    { phase: "opening", d: 62, goal: "win", theme: "Ruy Lopez", name: "Ruy Lopez (8)", fen: "r1bqk2r/2ppbppp/p1n2n2/1p2p3/4P3/1B3N2/PPPP1PPP/RNBQK2R w KQkq - 0 7" },
    { phase: "opening", d: 63, goal: "win", theme: "Sicilian Defense", name: "Sicilian Defense (2)", fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 0 2" },
    { phase: "opening", d: 63, goal: "win", theme: "Sicilian Defense", name: "Sicilian Defense (3)", fen: "rnbqkbnr/pp2pppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3" },
    { phase: "opening", d: 64, goal: "win", theme: "Sicilian Defense", name: "Sicilian Defense (4)", fen: "rnbqkbnr/pp2pppp/3p4/2p5/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3" },
    { phase: "opening", d: 65, goal: "win", theme: "Sicilian Defense", name: "Sicilian Defense (5)", fen: "rnbqkbnr/pp2pppp/3p4/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4" },
    { phase: "opening", d: 65, goal: "win", theme: "Sicilian Najdorf", name: "Sicilian Najdorf (2)", fen: "rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6" },
    { phase: "opening", d: 66, goal: "win", theme: "Sicilian Najdorf", name: "Sicilian Najdorf (3)", fen: "rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP1BPPP/R1BQK2R b KQkq - 0 6" },
    { phase: "opening", d: 67, goal: "win", theme: "Sicilian Najdorf", name: "Sicilian Najdorf (4)", fen: "rnbqkb1r/1p3ppp/p2ppn2/8/3NP3/2N5/PPP1BPPP/R1BQK2R w KQkq - 0 7" },
    { phase: "opening", d: 67, goal: "win", theme: "Sicilian Dragon", name: "Sicilian Dragon (2)", fen: "rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6" },
    { phase: "opening", d: 68, goal: "win", theme: "Sicilian Dragon", name: "Sicilian Dragon (3)", fen: "rnbqkb1r/pp2ppbp/3p1np1/8/3NP3/2N1B3/PPP2PPP/R2QKB1R w KQkq - 0 7" },
    { phase: "opening", d: 69, goal: "win", theme: "Sicilian Dragon", name: "Sicilian Dragon (4)", fen: "r1bqkb1r/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPP3PP/R2QKB1R w KQkq - 0 8" },
    { phase: "opening", d: 69, goal: "win", theme: "French Defense", name: "French Defense (2)", fen: "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3" },
    { phase: "opening", d: 70, goal: "win", theme: "French Defense", name: "French Defense (3)", fen: "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 0 3" },
    { phase: "opening", d: 71, goal: "win", theme: "French Defense", name: "French Defense (4)", fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 0 4" },
    { phase: "opening", d: 71, goal: "win", theme: "Caro-Kann", name: "Caro-Kann (3)", fen: "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3" },
    { phase: "opening", d: 72, goal: "win", theme: "Caro-Kann", name: "Caro-Kann (4)", fen: "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 0 3" },
    { phase: "opening", d: 73, goal: "win", theme: "Caro-Kann", name: "Caro-Kann (5)", fen: "rnbqkbnr/pp2pppp/2p5/8/3Pp3/2N5/PPP2PPP/R1BQKBNR w KQkq - 0 4" },
    { phase: "opening", d: 73, goal: "win", theme: "Queen's Gambit", name: "Queen's Gambit (4)", fen: "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2" },
    { phase: "opening", d: 74, goal: "win", theme: "Queen's Gambit", name: "Queen's Gambit (5)", fen: "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3" },
    { phase: "opening", d: 75, goal: "win", theme: "Queen's Gambit", name: "Queen's Gambit (6)", fen: "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 0 3" },
    { phase: "opening", d: 75, goal: "win", theme: "Queen's Gambit Declined", name: "Queen's Gambit Declined (2)", fen: "rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3" },
    { phase: "opening", d: 76, goal: "win", theme: "Queen's Gambit Declined", name: "Queen's Gambit Declined (3)", fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4" },
    { phase: "opening", d: 77, goal: "win", theme: "Queen's Gambit Declined", name: "Queen's Gambit Declined (4)", fen: "rnbqkb1r/ppp2ppp/4pn2/3p2B1/2PP4/2N5/PP2PPPP/R2QKBNR b KQkq - 0 4" },
    { phase: "opening", d: 77, goal: "win", theme: "King's Indian", name: "King's Indian (3)", fen: "rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3" },
    { phase: "opening", d: 78, goal: "win", theme: "King's Indian", name: "King's Indian (4)", fen: "rnbqkb1r/pppppp1p/5np1/8/2PP4/2N5/PP2PPPP/R1BQKBNR b KQkq - 0 3" },
    { phase: "opening", d: 79, goal: "win", theme: "King's Indian", name: "King's Indian (5)", fen: "rnbqk2r/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 0 4" },
    { phase: "opening", d: 79, goal: "win", theme: "Nimzo-Indian", name: "Nimzo-Indian (2)", fen: "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4" },
    { phase: "opening", d: 80, goal: "win", theme: "Nimzo-Indian", name: "Nimzo-Indian (3)", fen: "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 0 4" },
    { phase: "opening", d: 81, goal: "win", theme: "Nimzo-Indian", name: "Nimzo-Indian (4)", fen: "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N1P3/PP3PPP/R1BQKBNR b KQkq - 0 4" },
    { phase: "opening", d: 81, goal: "win", theme: "English Opening", name: "English Opening (2)", fen: "rnbqkbnr/pppp1ppp/8/4p3/2P5/8/PP1PPPPP/RNBQKBNR w KQkq - 0 2" },
    { phase: "opening", d: 82, goal: "win", theme: "English Opening", name: "English Opening (3)", fen: "rnbqkb1r/pppp1ppp/5n2/4p3/2P5/2N5/PP1PPPPP/R1BQKBNR w KQkq - 0 3" },
    { phase: "opening", d: 83, goal: "win", theme: "English Opening", name: "English Opening (4)", fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2P5/2N2N2/PP1PPPPP/R1BQKB1R w KQkq - 0 4" },
    { phase: "opening", d: 83, goal: "win", theme: "London System", name: "London System (2)", fen: "rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/5N2/PPP1PPPP/RN1QKB1R b KQkq - 0 3" },
    { phase: "opening", d: 84, goal: "win", theme: "London System", name: "London System (3)", fen: "rnbqkb1r/pp2pppp/2p2n2/3p4/3P1B2/4PN2/PPP2PPP/RN1QKB1R b KQkq - 0 4" },
    { phase: "opening", d: 85, goal: "win", theme: "London System", name: "London System (4)", fen: "rnbqkb1r/pp3ppp/2p1pn2/3p4/3P1B2/4PN2/PPP2PPP/RN1QKB1R w KQkq - 0 5" },
    { phase: "opening", d: 85, goal: "win", theme: "Scotch Game", name: "Scotch Game (2)", fen: "r1bqkbnr/pppp1ppp/2n5/8/3pP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4" },
    { phase: "opening", d: 86, goal: "win", theme: "Scotch Game", name: "Scotch Game (3)", fen: "r1bqkbnr/pppp1ppp/2n5/8/3NP3/8/PPP2PPP/RNBQKB1R b KQkq - 0 4" },
    { phase: "opening", d: 87, goal: "win", theme: "King's Gambit", name: "King's Gambit (3)", fen: "rnbqkbnr/pppp1ppp/8/8/4Pp2/8/PPPP2PP/RNBQKBNR w KQkq - 0 3" },
    { phase: "opening", d: 87, goal: "win", theme: "King's Gambit", name: "King's Gambit (4)", fen: "rnbqkbnr/pppp1p1p/8/6p1/4Pp2/5N2/PPPP2PP/RNBQKB1R w KQkq - 0 4" },
    { phase: "opening", d: 88, goal: "win", theme: "Pirc Defense", name: "Pirc Defense (2)", fen: "rnbqkb1r/ppp1pp1p/3p1np1/8/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 0 4" },
    { phase: "opening", d: 89, goal: "win", theme: "Pirc Defense", name: "Pirc Defense (3)", fen: "rnbqkb1r/ppp1pp1p/3p1np1/8/3PP3/2N2N2/PPP2PPP/R1BQKB1R b KQkq - 0 4" },
    { phase: "opening", d: 89, goal: "win", theme: "Alekhine Defense", name: "Alekhine Defense (2)", fen: "rnbqkb1r/pppppppp/8/3nP3/8/8/PPPP1PPP/RNBQKBNR w KQkq - 0 3" },
    { phase: "opening", d: 90, goal: "win", theme: "Alekhine Defense", name: "Alekhine Defense (3)", fen: "rnbqkb1r/pppppppp/8/3nP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3" },
    { phase: "opening", d: 91, goal: "win", theme: "Dutch Defense", name: "Dutch Defense (2)", fen: "rnbqkb1r/ppppp1pp/5n2/5p2/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq - 0 3" },
    { phase: "opening", d: 91, goal: "win", theme: "Dutch Defense", name: "Dutch Defense (3)", fen: "rnbqkb1r/ppppp1pp/5n2/5p2/2PP4/5N2/PP2PPPP/RNBQKB1R b KQkq - 0 3" },
    { phase: "opening", d: 92, goal: "win", theme: "Grünfeld", name: "Grünfeld (2)", fen: "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4" },
    { phase: "opening", d: 93, goal: "win", theme: "Grünfeld", name: "Grünfeld (3)", fen: "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 0 4" },
    { phase: "opening", d: 93, goal: "win", theme: "Catalan", name: "Catalan (2)", fen: "rnbqkb1r/pppp1ppp/4pn2/8/2PP4/6P1/PP2PP1P/RNBQKBNR b KQkq - 0 3" },
    { phase: "opening", d: 94, goal: "win", theme: "Catalan", name: "Catalan (3)", fen: "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/6P1/PP2PPBP/RNBQK1NR b KQkq - 0 4" },
    { phase: "opening", d: 95, goal: "mate", theme: "Scholar's Mate", name: "Scholar's Mate (3)", fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 4" },
    { phase: "opening", d: 95, goal: "win", theme: "Scholar's Mate", name: "Scholar's Mate (4)", fen: "rnbqkbnr/pppp1ppp/8/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 0 2" },
    { phase: "opening", d: 96, goal: "win", theme: "Scholar's Mate", name: "Scholar's Mate (5)", fen: "r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 3" },
    { phase: "opening", d: 97, goal: "win", theme: "Fried Liver Attack", name: "Fried Liver Attack (2)", fen: "r1bqkb1r/ppp2ppp/2n2n2/3pp1N1/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 0 5" },
    { phase: "opening", d: 97, goal: "win", theme: "Fried Liver Attack", name: "Fried Liver Attack (3)", fen: "r1bqkb1r/ppp2Npp/2n2n2/3pp3/2B1P3/8/PPPP1PPP/RNBQK2R b KQkq - 0 6" },
    { phase: "opening", d: 98, goal: "win", theme: "Evans Gambit", name: "Evans Gambit (2)", fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/1BB1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 4" },
    { phase: "opening", d: 99, goal: "win", theme: "Evans Gambit", name: "Evans Gambit (3)", fen: "r1bqk1nr/pppp1ppp/2n5/b3p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5" },
    { phase: "opening", d: 99, goal: "win", theme: "Two Knights Defense", name: "Two Knights Defense (2)", fen: "r1bqkb1r/pppp1ppp/2n2n2/4p1N1/2B1P3/8/PPPP1PPP/RNBQK2R b KQkq - 0 4" },
    { phase: "opening", d: 100, goal: "win", theme: "Two Knights Defense", name: "Two Knights Defense (3)", fen: "r1bqkb1r/ppp2ppp/2n2n2/3pp1N1/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 0 5" },
    { phase: "middle", d: 1, goal: "mate", theme: "Back-rank Mate", name: "Back-rank Mate (1)", fen: "6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1" },
    { phase: "middle", d: 2, goal: "mate", theme: "Back-rank Mate", name: "Back-rank Mate (2)", fen: "r5k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1" },
    { phase: "middle", d: 3, goal: "mate", theme: "Back-rank Mate", name: "Back-rank Mate (3)", fen: "6k1/5ppp/8/8/8/8/5PPP/1R4K1 w - - 0 1" },
    { phase: "middle", d: 4, goal: "mate", theme: "Queen Snap Mate", name: "Queen Snap Mate (1)", fen: "r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4" },
    { phase: "middle", d: 5, goal: "mate", theme: "Smothered Mate", name: "Smothered Mate (1)", fen: "6rk/6pp/8/8/8/8/5N2/6K1 w - - 0 1" },
    { phase: "middle", d: 6, goal: "mate", theme: "Smothered Mate", name: "Smothered Mate (2)", fen: "5r1k/6pp/8/8/8/5N2/6PP/6K1 w - - 0 1" },
    { phase: "middle", d: 7, goal: "mate", theme: "Arabian Mate", name: "Arabian Mate (1)", fen: "6k1/5R2/6N1/8/8/8/8/6K1 w - - 0 1" },
    { phase: "middle", d: 8, goal: "mate", theme: "Arabian Mate", name: "Arabian Mate (2)", fen: "7k/6R1/5N2/8/8/8/8/6K1 w - - 0 1" },
    { phase: "middle", d: 9, goal: "mate", theme: "Anastasia's Mate", name: "Anastasia's Mate (1)", fen: "5rk1/5ppp/8/8/8/2N5/5PPP/4R1K1 w - - 0 1" },
    { phase: "middle", d: 9, goal: "mate", theme: "Anastasia's Mate", name: "Anastasia's Mate (2)", fen: "5r1k/5ppp/8/8/8/2N5/5PPP/4R1K1 w - - 0 1" },
    { phase: "middle", d: 10, goal: "win", theme: "Knight Fork", name: "Knight Fork (1)", fen: "r1bqkb1r/pppp1ppp/2n2n2/4p1N1/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 0 5" },
    { phase: "middle", d: 11, goal: "win", theme: "Knight Fork", name: "Knight Fork (2)", fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4" },
    { phase: "middle", d: 12, goal: "win", theme: "Absolute Pin", name: "Absolute Pin (1)", fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 5" },
    { phase: "middle", d: 13, goal: "win", theme: "Absolute Pin", name: "Absolute Pin (2)", fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4" },
    { phase: "middle", d: 14, goal: "mate", theme: "Discovered Attack", name: "Discovered Attack (1)", fen: "r2qkb1r/ppp2ppp/2n1bn2/3pp1N1/2B1P3/3P4/PPP2PPP/RNBQK2R w KQkq - 0 6" },
    { phase: "middle", d: 15, goal: "win", theme: "Discovered Attack", name: "Discovered Attack (2)", fen: "r2qkbnr/ppp2ppp/2n1b3/3pp3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5" },
    { phase: "middle", d: 16, goal: "win", theme: "Remove the Defender", name: "Remove the Defender (1)", fen: "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQ - 0 7" },
    { phase: "middle", d: 17, goal: "win", theme: "Remove the Defender", name: "Remove the Defender (2)", fen: "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQ - 0 7" },
    { phase: "middle", d: 18, goal: "win", theme: "Greek Gift Sacrifice", name: "Greek Gift Sacrifice (1)", fen: "r1bq1rk1/ppp2ppp/2n2n2/3p4/1bBPP3/2N2N2/PP3PPP/R1BQ1RK1 w - - 0 8" },
    { phase: "middle", d: 19, goal: "win", theme: "Greek Gift Sacrifice", name: "Greek Gift Sacrifice (2)", fen: "r1bq1rk1/ppp2ppp/2np1n2/3p4/1bBPP3/2N2N2/PP3PPP/R1BQ1RK1 w - - 0 8" },
    { phase: "middle", d: 20, goal: "win", theme: "Double Attack", name: "Double Attack (1)", fen: "r2q1rk1/ppp2ppp/2n1bn2/3p4/3P4/2NB1N2/PPP2PPP/R1BQ1RK1 w - - 0 9" },
    { phase: "middle", d: 21, goal: "win", theme: "Double Attack", name: "Double Attack (2)", fen: "r2q1rk1/ppp1bppp/2n1bn2/3p4/3P4/2NB1N2/PPP2PPP/R1BQ1RK1 w - - 0 9" },
    { phase: "middle", d: 22, goal: "win", theme: "Exchange Sacrifice", name: "Exchange Sacrifice (1)", fen: "r1bq1rk1/pp2bppp/2n1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9" },
    { phase: "middle", d: 23, goal: "win", theme: "Exchange Sacrifice", name: "Exchange Sacrifice (2)", fen: "r2q1rk1/1pp1bppp/p1np1n2/4p3/B3P1b1/2PP1N2/PP3PPP/RNBQR1K1 w - - 0 10" },
    { phase: "middle", d: 24, goal: "win", theme: "Knight Outpost", name: "Knight Outpost (1)", fen: "r2q1rk1/ppp1bppp/2n1bn2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 w - - 0 10" },
    { phase: "middle", d: 25, goal: "win", theme: "Knight Outpost", name: "Knight Outpost (2)", fen: "r2q1rk1/ppp1bppp/2n1bn2/3p4/3P4/2N2N2/PPP1BPPP/R1BQ1RK1 w - - 0 9" },
    { phase: "middle", d: 26, goal: "win", theme: "Battery on h7", name: "Battery on h7 (1)", fen: "r1bq1rk1/ppp2pp1/2np1n1p/4p3/1bB1P3/2NP1N2/PPP1QPPP/R1B2RK1 w - - 0 9" },
    { phase: "middle", d: 26, goal: "win", theme: "Battery on h7", name: "Battery on h7 (2)", fen: "r1bq1rk1/ppp2pp1/2n2n1p/3pp3/1bB1P3/2NP1N2/PPP1QPPP/R1B2RK1 w - - 0 9" },
    { phase: "middle", d: 27, goal: "win", theme: "Clearance Sacrifice", name: "Clearance Sacrifice (1)", fen: "r2q1rk1/1pp1bppp/p1npbn2/4p3/2B1P3/2NP1N2/PPPBQPPP/R4RK1 w - - 0 11" },
    { phase: "middle", d: 28, goal: "win", theme: "Interference", name: "Interference (1)", fen: "r1b2rk1/pp3ppp/2n1pn2/3q4/3P4/2NB1N2/PP3PPP/R1BQ1RK1 w - - 0 11" },
    { phase: "middle", d: 29, goal: "win", theme: "Windmill Attack", name: "Windmill Attack (1)", fen: "r4rk1/pp3ppp/2n5/3q4/3P2b1/2PB1N2/P4PPP/R1BQR1K1 w - - 0 14" },
    { phase: "middle", d: 30, goal: "win", theme: "Positional Squeeze", name: "Positional Squeeze (1)", fen: "r2q1rk1/1b2bppp/p2p1n2/1p2p3/3NP3/1BN1BP2/PPPQ2PP/2KR3R w - - 0 14" },
    { phase: "middle", d: 31, goal: "win", theme: "Opposite Castling Attack", name: "Opposite Castling Attack (1)", fen: "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10" },
    { phase: "middle", d: 32, goal: "win", theme: "Quiet Combination", name: "Quiet Combination (1)", fen: "r1bq1rk1/pp2nppp/2n1p3/3pP3/3P4/2PB1N2/P4PPP/R1BQ1RK1 w - - 0 12" },
    { phase: "middle", d: 33, goal: "win", theme: "Master Combination", name: "Master Combination (1)", fen: "r2q1rk1/1b1nbppp/p2p1n2/1pp1p3/3PP3/2N1BN1P/PPBQ1PP1/R3KB1R w KQ - 0 12" },
    { phase: "middle", d: 34, goal: "win", theme: "Pin", name: "Pin (1)", fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 6" },
    { phase: "middle", d: 35, goal: "win", theme: "Pin", name: "Pin (2)", fen: "r1bqk2r/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 7" },
    { phase: "middle", d: 36, goal: "win", theme: "Pin", name: "Pin (3)", fen: "r2qk2r/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 7" },
    { phase: "middle", d: 37, goal: "win", theme: "Skewer", name: "Skewer (1)", fen: "r3k2r/ppp2ppp/2n5/3q4/3P4/2N5/PPP2PPP/R2QKB1R w KQkq - 0 8" },
    { phase: "middle", d: 38, goal: "win", theme: "Skewer", name: "Skewer (2)", fen: "r3k2r/ppp2ppp/2n5/3q4/3P2b1/2N2N2/PPP2PPP/R2QKB1R w KQkq - 0 9" },
    { phase: "middle", d: 39, goal: "win", theme: "Fork", name: "Fork (1)", fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 4" },
    { phase: "middle", d: 40, goal: "win", theme: "Fork", name: "Fork (2)", fen: "r1bqkb1r/ppp2ppp/2n2n2/3pp3/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 5" },
    { phase: "middle", d: 41, goal: "win", theme: "Fork", name: "Fork (3)", fen: "rnbqkb1r/ppp2ppp/5n2/3pp3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4" },
    { phase: "middle", d: 42, goal: "win", theme: "Discovery", name: "Discovery (1)", fen: "r2qkb1r/ppp2ppp/2n1bn2/3p4/3P4/2N2N2/PPP1BPPP/R1BQK2R w KQkq - 0 7" },
    { phase: "middle", d: 42, goal: "win", theme: "Discovery", name: "Discovery (2)", fen: "r2qkb1r/ppp2ppp/2n1bn2/3p4/3P4/2NB1N2/PPP2PPP/R1BQK2R w KQkq - 0 7" },
    { phase: "middle", d: 43, goal: "win", theme: "Deflection", name: "Deflection (1)", fen: "r1bq1rk1/ppp2ppp/2n2n2/3p4/1bBP4/2N2N2/PP3PPP/R1BQ1RK1 w - - 0 9" },
    { phase: "middle", d: 44, goal: "win", theme: "Deflection", name: "Deflection (2)", fen: "r1bq1rk1/pp3ppp/2n2n2/2pp4/1bBP4/2N2N2/PP3PPP/R1BQ1RK1 w - - 0 10" },
    { phase: "middle", d: 45, goal: "win", theme: "Decoy", name: "Decoy (1)", fen: "r1bq1rk1/ppp2ppp/2np1n2/4p3/1bB1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8" },
    { phase: "middle", d: 46, goal: "win", theme: "Decoy", name: "Decoy (2)", fen: "r1bq1rk1/ppp2ppp/2n2n2/3pp3/1bB1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8" },
    { phase: "middle", d: 47, goal: "win", theme: "Overloaded Piece", name: "Overloaded Piece (1)", fen: "r2q1rk1/ppp2ppp/2n1bn2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 w - - 0 10" },
    { phase: "middle", d: 48, goal: "win", theme: "Overloaded Piece", name: "Overloaded Piece (2)", fen: "r2q1rk1/ppp1bppp/2n1bn2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 w - - 0 10" },
    { phase: "middle", d: 49, goal: "win", theme: "Zwischenzug", name: "Zwischenzug (1)", fen: "r1bq1rk1/pp3ppp/2n1pn2/2pp4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9" },
    { phase: "middle", d: 50, goal: "win", theme: "Zwischenzug", name: "Zwischenzug (2)", fen: "r1bq1rk1/pp3ppp/2n1pn2/3p4/2pP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9" },
    { phase: "middle", d: 51, goal: "win", theme: "X-Ray", name: "X-Ray (1)", fen: "r2q1rk1/ppp2ppp/2n1bn2/3p4/3P4/2NB1N1P/PPP2PP1/R1BQ1RK1 w - - 0 10" },
    { phase: "middle", d: 52, goal: "win", theme: "X-Ray", name: "X-Ray (2)", fen: "r2q1rk1/ppp1bppp/2n1bn2/3p4/3P4/2NB1N1P/PPP2PP1/R1BQ1RK1 w - - 0 10" },
    { phase: "middle", d: 53, goal: "win", theme: "Attraction", name: "Attraction (1)", fen: "r1bq1rk1/ppp2ppp/2n2n2/3pp3/1bB1P3/2NP1N2/PPP1QPPP/R1B2RK1 w - - 0 9" },
    { phase: "middle", d: 54, goal: "win", theme: "Attraction", name: "Attraction (2)", fen: "r1bq1rk1/ppp2pp1/2n2n1p/3pp3/1bB1P3/2NP1N2/PPP1QPPP/R1B2RK1 w - - 0 9" },
    { phase: "middle", d: 55, goal: "win", theme: "Trapped Piece", name: "Trapped Piece (1)", fen: "r2qkb1r/ppp2ppp/2n1bn2/3p4/3P4/2N2N2/PPP1BPPP/R1BQK2R b KQkq - 0 7" },
    { phase: "middle", d: 56, goal: "win", theme: "Trapped Piece", name: "Trapped Piece (2)", fen: "r2qk2r/ppp1bppp/2n1bn2/3p4/3P4/2N2N2/PPP1BPPP/R1BQK2R w KQkq - 0 8" },
    { phase: "middle", d: 57, goal: "win", theme: "Back-rank Threat", name: "Back-rank Threat (1)", fen: "r4rk1/ppp2ppp/2n5/3q4/3P4/2N2N2/PPP2PPP/R2Q1RK1 w - - 0 12" },
    { phase: "middle", d: 58, goal: "win", theme: "Back-rank Threat", name: "Back-rank Threat (2)", fen: "r4rk1/pp3ppp/2n5/3q4/3P4/2N2N2/PP3PPP/R2Q1RK1 w - - 0 13" },
    { phase: "middle", d: 59, goal: "win", theme: "Mating Net", name: "Mating Net (1)", fen: "r1bq1rk1/ppp2ppp/2n2n2/3p4/1bBP4/2N2N2/PP3PPP/R1BQ1RK1 w - - 0 9" },
    { phase: "middle", d: 59, goal: "win", theme: "Mating Net", name: "Mating Net (2)", fen: "r1bq1rk1/pp3ppp/2n2n2/2pp4/1bBP4/2N2N2/PP3PPP/R1BQ1RK1 w - - 0 10" },
    { phase: "middle", d: 60, goal: "win", theme: "Pawn Break", name: "Pawn Break (1)", fen: "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9" },
    { phase: "middle", d: 61, goal: "win", theme: "Pawn Break", name: "Pawn Break (2)", fen: "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPP3PP/R2QKB1R w KQ - 0 9" },
    { phase: "middle", d: 62, goal: "win", theme: "Kingside Attack", name: "Kingside Attack (1)", fen: "r1bq1rk1/ppp2pp1/2np1n1p/4p3/1bB1P3/2NP1N2/PPP1QPPP/R1B2RK1 w - - 0 9" },
    { phase: "middle", d: 63, goal: "win", theme: "Kingside Attack", name: "Kingside Attack (2)", fen: "r1bq1rk1/ppp2pp1/2n2n1p/3pp3/1bB1P3/2NP1N2/PPP1QPPP/R1B2RK1 w - - 0 9" },
    { phase: "middle", d: 64, goal: "win", theme: "Queenside Attack", name: "Queenside Attack (1)", fen: "r2q1rk1/1pp1bppp/p1np1n2/4p3/B3P3/2PP1N2/PP3PPP/RNBQR1K1 w - - 0 10" },
    { phase: "middle", d: 65, goal: "win", theme: "Queenside Attack", name: "Queenside Attack (2)", fen: "r2q1rk1/1pp1bppp/p1n2n2/3pp3/B3P3/2PP1N2/PP3PPP/RNBQR1K1 w - - 0 10" },
    { phase: "middle", d: 66, goal: "win", theme: "Central Breakthrough", name: "Central Breakthrough (1)", fen: "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10" },
    { phase: "middle", d: 67, goal: "win", theme: "Central Breakthrough", name: "Central Breakthrough (2)", fen: "r1bq1rk1/pp2ppbp/2np1np1/8/3NPP2/2N1B3/PPP3PP/R2QKB1R w KQ - 0 10" },
    { phase: "middle", d: 68, goal: "win", theme: "Sacrifice on f7", name: "Sacrifice on f7 (1)", fen: "r1bqkb1r/pppp1ppp/2n2n2/4p1N1/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 0 5" },
    { phase: "middle", d: 69, goal: "win", theme: "Sacrifice on f7", name: "Sacrifice on f7 (2)", fen: "r1bqkb1r/ppp2ppp/2n2n2/3pp1N1/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 0 5" },
    { phase: "middle", d: 70, goal: "win", theme: "Sacrifice on h7", name: "Sacrifice on h7 (1)", fen: "r1bq1rk1/ppp2pp1/2np1n1p/4p3/1bB1P3/2NP1N2/PPP1QPPP/R1B2RK1 w - - 0 9" },
    { phase: "middle", d: 71, goal: "win", theme: "Sacrifice on h7", name: "Sacrifice on h7 (2)", fen: "r1bq1rk1/ppp2ppp/2np1n2/4p3/1bB1P3/2NP1N2/PPP1QPPP/R1B2RK1 w - - 0 8" },
    { phase: "middle", d: 72, goal: "win", theme: "Sacrifice on g7", name: "Sacrifice on g7 (1)", fen: "r1bq1rk1/pp3pbp/2np1np1/2p1p3/2B1P3/2NP1N2/PPP1QPPP/R1B2RK1 w - - 0 10" },
    { phase: "middle", d: 73, goal: "win", theme: "Rook Lift", name: "Rook Lift (1)", fen: "r1bq1rk1/ppp2ppp/2n2n2/3pp3/1bB1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8" },
    { phase: "middle", d: 74, goal: "win", theme: "Rook Lift", name: "Rook Lift (2)", fen: "r1bq1rk1/ppp2ppp/2np1n2/4p3/1bB1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8" },
    { phase: "middle", d: 75, goal: "win", theme: "Bishop Pair", name: "Bishop Pair (1)", fen: "r2q1rk1/ppp2ppp/2n1bn2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 w - - 0 10" },
    { phase: "middle", d: 75, goal: "win", theme: "Bishop Pair", name: "Bishop Pair (2)", fen: "r2q1rk1/ppp1bppp/2n1bn2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 w - - 0 10" },
    { phase: "middle", d: 76, goal: "win", theme: "Passed Pawn Push", name: "Passed Pawn Push (1)", fen: "r2q1rk1/pp3ppp/2n1bn2/2pp4/3P4/2N1BN2/PP2BPPP/R2Q1RK1 w - - 0 11" },
    { phase: "middle", d: 77, goal: "win", theme: "Passed Pawn Push", name: "Passed Pawn Push (2)", fen: "r2q1rk1/pp3ppp/2n1bn2/3p4/2pP4/2N1BN2/PP2BPPP/R2Q1RK1 w - - 0 11" },
    { phase: "middle", d: 78, goal: "win", theme: "Blockade", name: "Blockade (1)", fen: "r2q1rk1/pp3ppp/2n1pn2/3p4/3P4/2N1BN2/PP2BPPP/R2Q1RK1 w - - 0 11" },
    { phase: "middle", d: 79, goal: "win", theme: "Blockade", name: "Blockade (2)", fen: "r2q1rk1/pp3ppp/2n1pn2/8/3p4/2N1BN2/PP2BPPP/R2Q1RK1 w - - 0 12" },
    { phase: "middle", d: 80, goal: "win", theme: "Prophylaxis", name: "Prophylaxis (1)", fen: "r2q1rk1/ppp1bppp/2n1bn2/3p4/3P4/2N1BN1P/PPP1BPP1/R2Q1RK1 w - - 0 11" },
    { phase: "middle", d: 81, goal: "win", theme: "Prophylaxis", name: "Prophylaxis (2)", fen: "r2q1rk1/ppp1bppp/2n1bn2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 w - - 0 10" },
    { phase: "middle", d: 82, goal: "win", theme: "Initiative", name: "Initiative (1)", fen: "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 9" },
    { phase: "middle", d: 83, goal: "win", theme: "Initiative", name: "Initiative (2)", fen: "r1bq1rk1/pp2bppp/2n1pn2/3p4/2pP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 9" },
    { phase: "middle", d: 84, goal: "win", theme: "Counterattack", name: "Counterattack (1)", fen: "r1bq1rk1/pp3ppp/2n1pn2/2bp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 9" },
    { phase: "middle", d: 85, goal: "win", theme: "Counterattack", name: "Counterattack (2)", fen: "r1bq1rk1/pp3ppp/2n1pn2/2b5/2Pp4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 10" },
    { phase: "middle", d: 86, goal: "win", theme: "Simplification", name: "Simplification (1)", fen: "r2q1rk1/ppp1bppp/2n1bn2/3p4/3P4/2N1BN2/PPP1BPPP/R2Q1RK1 w - - 0 10" },
    { phase: "middle", d: 87, goal: "win", theme: "Simplification", name: "Simplification (2)", fen: "r2q1rk1/ppp1bppp/2n2n2/3p4/3P2b1/2N1BN2/PPP1BPPP/R2Q1RK1 w - - 0 10" },
    { phase: "middle", d: 88, goal: "win", theme: "Space Advantage", name: "Space Advantage (1)", fen: "r1bq1rk1/pp2ppbp/2np1np1/8/2PNP3/2N1B3/PP2BPPP/R2Q1RK1 w - - 0 10" },
    { phase: "middle", d: 89, goal: "win", theme: "Space Advantage", name: "Space Advantage (2)", fen: "r1bq1rk1/pp2ppbp/2np1np1/8/2PNP3/2N5/PP2BPPP/R1BQ1RK1 w - - 0 10" },
    { phase: "middle", d: 90, goal: "win", theme: "Weak Color Complex", name: "Weak Color Complex (1)", fen: "r2q1rk1/pp2ppbp/2np1np1/8/3NP1b1/2N1BP2/PPP3PP/R2QKB1R w KQ - 0 10" },
    { phase: "middle", d: 91, goal: "win", theme: "Weak Color Complex", name: "Weak Color Complex (2)", fen: "r2q1rk1/pp2ppbp/2np1np1/8/3NP1b1/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10" },
    { phase: "middle", d: 92, goal: "win", theme: "Outpost on d5", name: "Outpost on d5 (1)", fen: "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N1BN2/PP2BPPP/R2Q1RK1 w - - 0 11" },
    { phase: "middle", d: 92, goal: "win", theme: "Outpost on d5", name: "Outpost on d5 (2)", fen: "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2N2/PP2BPPP/R1BQ1RK1 w - - 0 10" },
    { phase: "middle", d: 93, goal: "win", theme: "Outpost on e5", name: "Outpost on e5 (1)", fen: "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10" },
    { phase: "middle", d: 94, goal: "win", theme: "Outpost on e5", name: "Outpost on e5 (2)", fen: "r1bq1rk1/pp2ppbp/2np1np1/4P3/3N4/2N1B3/PPP1BPPP/R2Q1RK1 b - - 0 10" },
    { phase: "middle", d: 95, goal: "win", theme: "Hanging Pawns", name: "Hanging Pawns (1)", fen: "r1bq1rk1/pp3ppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 9" },
    { phase: "middle", d: 96, goal: "win", theme: "Hanging Pawns", name: "Hanging Pawns (2)", fen: "r1bq1rk1/pp3ppp/2n1pn2/3p4/2pP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 9" },
    { phase: "middle", d: 97, goal: "win", theme: "Isolated Queen Pawn", name: "Isolated Queen Pawn (1)", fen: "r1bq1rk1/pp3ppp/2n1pn2/3p4/3P4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 10" },
    { phase: "middle", d: 98, goal: "win", theme: "Isolated Queen Pawn", name: "Isolated Queen Pawn (2)", fen: "r1bq1rk1/pp3ppp/2n1pn2/8/3p4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 11" },
    { phase: "middle", d: 99, goal: "win", theme: "Minority Attack", name: "Minority Attack (1)", fen: "r1bq1rk1/pp3ppp/2n1pn2/3p4/2PP4/2N1PN2/PP3PPP/R1BQ1RK1 w - - 0 10" },
    { phase: "middle", d: 100, goal: "win", theme: "Minority Attack", name: "Minority Attack (2)", fen: "r1bq1rk1/1p3ppp/p1n1pn2/3p4/2PP4/2N1PN2/PP3PPP/R1BQ1RK1 w - - 0 11" },
  ];

  let level = 20;
  let phase = "endgame"; // opening | middle | endgame
  let setupFamily = ""; // "" = any setup in phase
  let board = [];
  let turn = "w";
  let selected = null;
  let legal = [];
  let lastMove = null;
  let ep = null;
  let castle = { wK: false, wQ: false, bK: false, bQ: false };
  let flip = false;
  let ox = 0;
  let oy = 0;
  let size = 70;

  let puzzle = null;
  let playerColor = "w";
  let solved = 0;
  let streak = 0;
  let fails = 0;
  let hintSquares = null;
  let aiMoveMark = null; // AI Move highlight (distinct from opponent last move)
  let busy = false;
  let complete = false;
  let usedIds = new Set();
  /** Snapshots taken before each player move (for Take back). */
  let history = [];

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
    };
  }
  function restoreState(s) {
    board = s.board;
    turn = s.turn;
    castle = s.castle;
    ep = s.ep;
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
    return [
      8 - Number(uci[1]),
      uci.charCodeAt(0) - 97,
      8 - Number(uci[3]),
      uci.charCodeAt(2) - 97,
    ];
  }

  function emptyBoard() {
    return Array.from({ length: 8 }, () => Array(8).fill(null));
  }

  function parseFen(fen) {
    const parts = fen.trim().split(/\s+/);
    const rows = parts[0].split("/");
    const b = emptyBoard();
    for (let r = 0; r < 8; r++) {
      let c = 0;
      for (const ch of rows[r]) {
        if (/\d/.test(ch)) c += Number(ch);
        else {
          const color = ch === ch.toUpperCase() ? "w" : "b";
          const type = ch.toLowerCase();
          b[r][c] = color + type;
          c += 1;
        }
      }
    }
    const side = parts[1] === "b" ? "b" : "w";
    const cr = parts[2] || "-";
    const cast = {
      wK: cr.includes("K"),
      wQ: cr.includes("Q"),
      bK: cr.includes("k"),
      bQ: cr.includes("q"),
    };
    let epSq = null;
    if (parts[3] && parts[3] !== "-") {
      const file = parts[3].charCodeAt(0) - 97;
      const rank = 8 - Number(parts[3][1]);
      epSq = [rank, file];
    }
    return { board: b, turn: side, castle: cast, ep: epSq };
  }

  function boardToFen() {
    const rows = [];
    for (let r = 0; r < 8; r++) {
      let row = "";
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p) empty += 1;
        else {
          if (empty) {
            row += empty;
            empty = 0;
          }
          const ch = typeOf(p);
          row += colorOf(p) === "w" ? ch.toUpperCase() : ch;
        }
      }
      if (empty) row += empty;
      rows.push(row);
    }
    let cr = "";
    if (castle.wK) cr += "K";
    if (castle.wQ) cr += "Q";
    if (castle.bK) cr += "k";
    if (castle.bQ) cr += "q";
    if (!cr) cr = "-";
    const epStr = ep ? sqName(ep[0], ep[1]) : "-";
    return `${rows.join("/")} ${turn} ${cr} ${epStr} 0 1`;
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
        const tp = board[one][cc];
        if (tp && colorOf(tp) !== me) moves.push([one, cc]);
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
        const tp = board[rr][cc];
        if (!tp || colorOf(tp) !== me) moves.push([rr, cc]);
      }
    } else if (t === "b") {
      for (const [dr, dc] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) pushSlide(moves, r, c, dr, dc, me);
    } else if (t === "r") {
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) pushSlide(moves, r, c, dr, dc, me);
    } else if (t === "q") {
      for (const [dr, dc] of [
        [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1],
      ]) pushSlide(moves, r, c, dr, dc, me);
    } else if (t === "k") {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (!dr && !dc) continue;
          const rr = r + dr;
          const cc = c + dc;
          if (!inBounds(rr, cc)) continue;
          const tp = board[rr][cc];
          if (!tp || colorOf(tp) !== me) moves.push([rr, cc]);
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
        for (const [tr, tc] of legalMoves(r, c)) moves.push([r, c, tr, tc]);
      }
    }
    turn = saved;
    return moves;
  }

  function applyMove(fr, fc, tr, tc, silent = false) {
    const p = board[fr][fc];
    const me = colorOf(p);
    const t = typeOf(p);
    if (t === "p" && ep && tr === ep[0] && tc === ep[1] && !board[tr][tc]) {
      const pr = me === "w" ? tr + 1 : tr - 1;
      board[pr][tc] = null;
    }
    board[tr][tc] = p;
    board[fr][fc] = null;
    if (t === "p" && (tr === 0 || tr === 7)) board[tr][tc] = me + "q";
    if (t === "p" && Math.abs(tr - fr) === 2) ep = [(fr + tr) / 2, fc];
    else ep = null;
    turn = enemy(me);
    if (!silent) lastMove = { fr, fc, tr, tc };
  }

  /** Guest rating for level 1–100 (800 → 3000). Display-only for puzzles. */
  function guestRating(lv) {
    const t = (Math.max(1, Math.min(100, lv)) - 1) / 99;
    return Math.round(800 + t * 2200);
  }

  function phaseLabel(p = phase) {
    return p === "opening" ? "Opening" : p === "middle" ? "Middlegame" : "Endgame";
  }

  /** Clear classic names for known setups (theme → display name). */
  const SETUP_NAMES = {
    "Fool's mate": "Fool's Mate",
    "Scholar's mate": "Scholar's Mate",
    "Scholar threat": "Scholar's Mate · defend",
    "Legal's mate": "Legal's Mate",
    "Opening fork": "Center Fork Trick",
    "Center grab": "Open Game · center",
    "Opera start": "Italian · Opera motif",
    "Pin on e-file": "Italian Game",
    "Fried Liver": "Fried Liver Attack",
    "Traxler idea": "Traxler Counterattack",
    "Italian pressure": "Giuoco Piano",
    "Ruy exchange": "Ruy Lopez · Exchange",
    "Scotch gambit": "Scotch Gambit",
    "Danish idea": "Danish Gambit",
    "Evans gambit": "Evans Gambit",
    "King's gambit": "King's Gambit",
    "Sicilian fork trick": "Sicilian Defense",
    "French poison": "French Defense",
    "Najdorf hook": "Sicilian Najdorf",
    "Dragon Yugoslav": "Dragon · Yugoslav Attack",
    "Marshall attack": "Ruy Lopez · Marshall",
    "Botvinnik Semi-Slav": "Semi-Slav · Botvinnik",
    "Berlin wall": "Ruy Lopez · Berlin",
    "Back-rank mate": "Back-rank Mate",
    "Back-rank": "Back-rank Mate",
    "Queen snap mate": "Queen Snap Mate",
    "Smothered setup": "Smothered Mate",
    "Smothered-ish": "Smothered Mate idea",
    "Arabian mate": "Arabian Mate",
    "Knight fork": "Knight Fork",
    "Pin & win": "Absolute Pin",
    "Discovery mate": "Discovered Attack",
    "Remove defender": "Remove the Defender",
    "Greek gift": "Greek Gift Sacrifice",
    "Double attack": "Double Attack",
    "Anastasia mate": "Anastasia's Mate",
    "Exchange sac": "Exchange Sacrifice",
    "Exchange sacrifice": "Exchange Sacrifice",
    "Outpost knight": "Knight Outpost",
    "Battery on h7": "Battery on h7",
    "Clearance sac": "Clearance Sacrifice",
    "Interference": "Interference",
    "Windmill setup": "Windmill Attack",
    "Positional squeeze": "Positional Squeeze",
    "Opposite castling race": "Opposite Castling Attack",
    "Quiet killer": "Quiet Combination",
    "Master combination": "Master Combination",
    "Rook mate": "Rook Mate",
    "Queen mate": "Queen Mate",
    "Ladder start": "Ladder Mate",
    "Ladder mate": "Ladder Mate",
    "Two rooks": "Two-Rook Mate",
    "Queen endgame": "Queen vs King",
    "KQ vs K": "K+Q vs K",
    "KR vs K": "K+R vs K",
    "King opposition": "Opposition",
    "Opposition": "King Opposition",
    "Queen check": "Queen Check Technique",
    "Pawn race": "Pawn Race",
    "Key squares": "Key Squares",
    "Outside passer": "Outside Passed Pawn",
    "Protected passer": "Protected Passed Pawn",
    "Pawn endgame": "King + Pawn Ending",
    "Lucena-ish": "Lucena Position",
    "Lucena building": "Building the Lucena",
    "R+P vs R bridge": "Lucena Bridge",
    "Rook + pawn": "Rook + Pawn Ending",
    "Cut off king": "Cutting Off the King",
    "Rook mate net": "Rook Mate Net",
    "Skewer setup": "Skewer",
    "Rook endgame": "Rook Ending",
    "BN vs K (mate)": "Bishop + Knight Mate",
    "Two bishops": "Two Bishops Mate",
    "Bishop + pawn": "Bishop + Pawn Ending",
    "Knight fork net": "Knight Fork Net",
    "Queen + knight": "Queen + Knight Mate",
    "Q vs R": "Queen vs Rook",
    "R+B vs R": "Rook + Bishop vs Rook",
    "Connected passers": "Connected Passed Pawns",
    "Wrong bishop?": "Wrong Bishop Ending",
    "Q vs N": "Queen vs Knight",
    "Rook vs pawn": "Rook vs Pawn",
    "Philidor defense break": "Philidor Position",
    "Two knights vs pawn": "Two Knights vs Pawn",
    "Complex pawn": "Complex Pawn Ending",
    "Rook vs connected pawns": "Rook vs Connected Pawns",
    "Q+P vs Q": "Queen + Pawn vs Queen",
    "Mate in 4 net": "Mate in 4",
    "Rook + bishop mate net": "Rook + Bishop Mate",
    "Deep mate": "Deep Mating Net",
    "Opposite bishops": "Opposite-Colored Bishops",
    "Tablebase-hard": "Tablebase Ending",
    "Q vs R+P": "Queen vs Rook + Pawn",
    "Master endgame": "Master Endgame",
    "Reti idea": "Réti Endgame Idea",
    "Shouldering": "Shouldering",
    "Rook corridor": "Rook Corridor Mate",
    "Bishop pair hunt": "Bishop Pair Mate",
    "N+P vs K": "Knight + Pawn vs King",
    "Q vs R+B": "Queen vs Rook + Bishop",
    "Mate in 3 edge": "Mate in 3",
    "Mate in 3": "Mate in 3",
    "Mate in 3+": "Mate in 3+",
    "Mate in 2": "Mate in 2",
    "Mate in 1": "Mate in 1",
    "Two passers race": "Two Passed Pawns",
    "Fortress break?": "Breaking a Fortress",
    "Mate in 4 K+Q": "Mate in 4 · K+Q",
    "Q vs B+N": "Queen vs Bishop + Knight",
    "R vs 2 pawns": "Rook vs Two Pawns",
    "Knight dance win": "Knight + Pawn Technique",
  };

  function puzzleSetupName(p = puzzle) {
    if (!p) return "—";
    return p.name || SETUP_NAMES[p.theme] || p.theme || "Puzzle";
  }

  function setupBaseName(p) {
    const full = puzzleSetupName(p);
    return full.replace(/\s*\(\d+\)\s*$/, "").trim() || full;
  }

  function familiesForPhase(ph = phase) {
    const set = new Set();
    for (const p of PUZZLES) {
      if (p.phase !== ph) continue;
      set.add(setupBaseName(p));
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }

  function refreshSetupSelect() {
    if (!setupSelect) return;
    const families = familiesForPhase(phase);
    const prev = setupFamily;
    const phaseWord =
      phase === "opening" ? "opening" : phase === "middle" ? "middlegame" : "endgame";
    if (setupLabel) {
      setupLabel.textContent =
        phase === "opening" ? "Opening" : phase === "middle" ? "Middlegame" : "Endgame";
    }
    setupSelect.innerHTML = "";
    const any = document.createElement("option");
    any.value = "";
    any.textContent = `Any ${phaseWord}`;
    setupSelect.appendChild(any);
    for (const name of families) {
      const opt = document.createElement("option");
      opt.value = name;
      const count = PUZZLES.filter((p) => p.phase === phase && setupBaseName(p) === name).length;
      opt.textContent = count > 1 ? `${name} (${count})` : name;
      setupSelect.appendChild(opt);
    }
    setupFamily = prev && families.includes(prev) ? prev : "";
    setupSelect.value = setupFamily;
  }

  function puzzleSetupSub(p = puzzle) {
    if (!p) return "Choose Opening · Middlegame · Endgame";
    const goal = p.goal === "mate" ? "Force checkmate" : "Find the winning idea";
    return `${goal} · puzzle L${p.d}`;
  }

  function updatePuzzleNamePanel() {
    if (!puzzlePhaseEl) return;
    puzzlePhaseEl.textContent = phaseLabel(puzzle?.phase || phase);
    puzzleTitleEl.textContent = puzzleSetupName();
    puzzleSubEl.textContent = puzzleSetupSub();
  }

  function levelBlurb(lv) {
    const guest = guestRating(lv);
    let band;
    if (phase === "opening") {
      band =
        lv <= 20 ? "Traps & early mates" :
        lv <= 50 ? "Open-game tactics" :
        lv <= 80 ? "Gambit theory" :
        "Deep opening battles";
    } else if (phase === "middle") {
      band =
        lv <= 20 ? "Basic tactics" :
        lv <= 50 ? "Pins · forks · gifts" :
        lv <= 80 ? "Attacks & sacs" :
        "Master combinations";
    } else {
      band =
        lv <= 15 ? "Mate in 1 drills" :
        lv <= 35 ? "Short mates · KQ/KR" :
        lv <= 55 ? "Pawn endgames" :
        lv <= 75 ? "Rook & minor pieces" :
        lv <= 90 ? "Expert technique" :
        "Master / tablebase hard";
    }
    return `Guest ≈ ${guest} Elo · ${phaseLabel()} · ${band}`;
  }

  /** Difficulty window: higher level ⇒ higher floor (no easy leftovers). */
  function levelWindow(lv) {
    const slackBelow = Math.max(1, Math.min(6, Math.round(2 + lv * 0.04)));
    const slackAbove = Math.max(2, Math.min(8, Math.round(3 + (100 - lv) * 0.04)));
    const floor = Math.max(1, lv - slackBelow);
    const ceil = Math.min(100, lv + slackAbove);
    return { floor, ceil };
  }

  /* —— Stockfish —— */
  let waitReady = null;
  const ANALYZE_TIMEOUT_MS = 4500;

  function analyzeDepth() {
    // Stronger replies at higher puzzle levels
    return Math.max(8, Math.min(18, 8 + Math.floor(level / 10)));
  }

  function engineSend(cmd) {
    if (engine) engine.postMessage(cmd);
  }

  function failPending(err) {
    if (waitBest) {
      const { reject } = waitBest;
      waitBest = null;
      try {
        reject(err || new Error("engine failed"));
      } catch (_) {
        /* ignore */
      }
    }
    if (waitReady) {
      const { reject } = waitReady;
      waitReady = null;
      try {
        reject(err || new Error("engine failed"));
      } catch (_) {
        /* ignore */
      }
    }
  }

  function handleEngineLine(raw) {
    const line = String(raw || "").trim();
    if (!line) return;
    if (line === "uciok") {
      engineSend("isready");
      return;
    }
    if (line === "readyok") {
      if (!engineReady) {
        engineReady = true;
        engineFailed = false;
        engineSend("setoption name Hash value 16");
        engineSend("setoption name UCI_LimitStrength value false");
        updateChrome();
        if (puzzle) hideOverlay();
        else loadPuzzle();
      }
      if (waitReady) {
        const { resolve } = waitReady;
        waitReady = null;
        resolve();
      }
      return;
    }
    if (line.startsWith("bestmove") && waitBest) {
      const m = line.match(/^bestmove\s+(\S+)/);
      const move = m && m[1] !== "(none)" ? m[1] : null;
      const { resolve, gen, timer } = waitBest;
      if (timer) clearTimeout(timer);
      waitBest = null;
      if (gen === searchGen) resolve(move);
    }
  }

  function initEngine() {
    const wasmUrl = new URL(ENGINE_WASM, location.href).href;
    const workerUrl = new URL(ENGINE_JS, location.href).href + "#" + encodeURIComponent(wasmUrl);
    try {
      engine = new Worker(workerUrl);
    } catch (err) {
      console.warn("Stockfish worker failed", err);
      engineFailed = true;
      updateChrome();
      return;
    }
    engine.onerror = (err) => {
      console.warn("Stockfish error", err);
      engineFailed = true;
      engineReady = false;
      failPending(new Error("Stockfish crashed"));
      updateChrome();
    };
    engine.onmessage = (ev) => {
      if (typeof ev.data === "string") {
        for (const part of ev.data.split(/\n+/)) handleEngineLine(part);
      }
    };
    // Boot UCI; retry isready a few times in case the first is dropped during wasm init
    let boots = 0;
    const boot = () => {
      if (engineReady || engineFailed) return;
      boots += 1;
      engineSend(boots === 1 ? "uci" : "isready");
      if (boots < 8) setTimeout(boot, 700);
    };
    setTimeout(boot, 50);
    setTimeout(() => {
      if (engineReady || engineFailed) return;
      console.warn("Stockfish load timeout — continuing offline");
      engineFailed = true;
      updateChrome();
    }, 15000);
  }

  function engineIsReady() {
    return new Promise((resolve, reject) => {
      if (!engine || engineFailed) {
        reject(new Error("engine not ready"));
        return;
      }
      if (waitReady) {
        engineSend("stop");
        const prev = waitReady;
        waitReady = null;
        try {
          prev.reject(new Error("superseded"));
        } catch (_) {
          /* ignore */
        }
      }
      waitReady = { resolve, reject };
      engineSend("isready");
      setTimeout(() => {
        if (waitReady && waitReady.resolve === resolve) {
          waitReady = null;
          reject(new Error("isready timeout"));
        }
      }, 2000);
    });
  }

  async function askBest(fen) {
    if (!engineReady || engineFailed) {
      throw new Error("engine not ready");
    }
    if (waitBest) {
      engineSend("stop");
      const prev = waitBest;
      waitBest = null;
      if (prev.timer) clearTimeout(prev.timer);
      try {
        prev.resolve(null);
      } catch (_) {
        /* ignore */
      }
    }
    await engineIsReady();
    engineSend("ucinewgame");
    await engineIsReady();
    return new Promise((resolve, reject) => {
      const gen = ++searchGen;
      const timer = setTimeout(() => {
        if (waitBest && waitBest.gen === gen) {
          waitBest = null;
          engineSend("stop");
          reject(new Error("analyze timeout"));
        }
      }, ANALYZE_TIMEOUT_MS);
      waitBest = { resolve, reject, gen, timer };
      engineSend(`position fen ${fen}`);
      // Depth-only: more reliable on Stockfish Lite than depth+movetime together
      engineSend(`go depth ${analyzeDepth()}`);
    });
  }

  /** Offline / fallback: prefer mate-in-1, else a checking move. */
  function localHintMove() {
    const side = turn;
    const moves = allLegal(side);
    let checkMove = null;
    for (const [fr, fc, tr, tc] of moves) {
      const before = cloneState();
      applyMove(fr, fc, tr, tc, true);
      const opp = turn;
      const mate = allLegal(opp).length === 0 && inCheck(opp);
      const chk = inCheck(opp);
      restoreState(before);
      if (mate) return [fr, fc, tr, tc];
      if (chk && !checkMove) checkMove = [fr, fc, tr, tc];
    }
    return checkMove;
  }

  function applyHintSquares(fr, fc, tr, tc, label) {
    hintSquares = { fr, fc, tr, tc };
    hintEl.textContent = label || `Hint: look at ${sqName(fr, fc)}`;
    selected = [fr, fc];
    legal = legalMoves(fr, fc);
    draw();
  }

  function prettySq(uci4) {
    if (!uci4 || uci4.length < 4) return "?";
    return `${uci4.slice(0, 2)} → ${uci4.slice(2, 4)}`;
  }

  function clearCoachNote() {
    if (!coachNoteEl) return;
    coachNoteEl.hidden = true;
    coachNoteEl.classList.remove("is-good");
    if (coachHeadingEl) coachHeadingEl.textContent = "Coach";
    if (coachGradeEl) coachGradeEl.textContent = "";
    if (coachStarsEl) coachStarsEl.textContent = "";
    if (coachCommentEl) coachCommentEl.textContent = "";
    if (coachFixesEl) coachFixesEl.innerHTML = "";
  }

  function showCoachNote({ comment, points, stars, tone } = {}) {
    if (!coachNoteEl) return;
    const good = tone === "good";
    coachNoteEl.hidden = false;
    coachNoteEl.classList.toggle("is-good", good);
    if (coachHeadingEl) coachHeadingEl.textContent = good ? "Nice move" : "Better choice";
    if (coachGradeEl) {
      coachGradeEl.textContent = stars
        ? `${GRADE_WORDS[stars] || "Good"} · ${stars}/5`
        : good
          ? "Well played"
          : "Needs work";
    }
    if (coachStarsEl) {
      const s = Math.max(1, Math.min(5, Math.round(stars || 0)));
      coachStarsEl.textContent = stars ? "★".repeat(s) + "☆".repeat(5 - s) : "";
      coachStarsEl.hidden = !stars;
    }
    if (coachCommentEl) coachCommentEl.textContent = comment || "";
    if (coachFixesEl) {
      coachFixesEl.innerHTML = "";
      for (const p of points || []) {
        const li = document.createElement("li");
        li.textContent = p;
        coachFixesEl.appendChild(li);
      }
    }
  }

  function commentPuzzleMove(playedUci, bestUci, { mated = false } = {}) {
    const played = (playedUci || "").slice(0, 4);
    const best = (bestUci || "").slice(0, 4);
    const theme = puzzle?.theme || puzzle?.name || "this puzzle";

    if (mated) {
      showCoachNote({
        tone: "good",
        stars: 5,
        comment: `Excellent — ${prettySq(played)} solves it with checkmate.`,
        points: [
          `Why excellent: you finished the ${theme} idea.`,
          "Tap Next for another puzzle.",
        ],
      });
      return;
    }

    if (best && played === best) {
      showCoachNote({
        tone: "good",
        stars: 5,
        comment: `Excellent — ${prettySq(played)} is Stockfish's top move.`,
        points: [
          `Why excellent: it fits ${theme}.`,
          "Keep going — the puzzle ends only on checkmate.",
        ],
      });
      return;
    }

    if (!best) {
      showCoachNote({
        tone: "good",
        stars: 3,
        comment: `Okay — ${prettySq(played)}. Keep playing toward checkmate.`,
        points: ["Hint is available when you want a stronger idea."],
      });
      return;
    }

    const samePiece = played.slice(0, 2) === best.slice(0, 2);
    const stars = samePiece ? 3 : 2;
    showCoachNote({
      tone: "bad",
      stars,
      comment: `${GRADE_WORDS[stars]} — ${prettySq(played)} isn't the strongest; better was ${prettySq(best)}.`,
      points: [
        `Better choice: ${prettySq(best)} (Hint can highlight it).`,
        "You can keep playing — wrong moves don’t end the puzzle.",
        "Clear the puzzle by delivering checkmate (or Take back to retry).",
      ],
    });
  }

  /** Always reply as the opponent so play never stalls off-turn. */
  async function playOpponentReply() {
    if (turn === playerColor) return;
    const legalOpp = allLegal(turn);
    if (!legalOpp.length) return;
    let move = null;
    try {
      if (engineReady && !engineFailed) {
        const reply = await askBest(boardToFen());
        if (reply && reply.length >= 4) {
          const parsed = parseUci(reply);
          if (
            legalOpp.some(
              ([a, b, c, d]) =>
                a === parsed[0] && b === parsed[1] && c === parsed[2] && d === parsed[3]
            )
          ) {
            move = parsed;
          }
        }
      }
    } catch (err) {
      console.warn("opponent", err);
    }
    if (!move) {
      const local = localHintMove();
      move = local || legalOpp[0];
    }
    if (move) {
      applyMove(move[0], move[1], move[2], move[3]);
      draw();
    }
  }

  function pickPuzzle() {
    let phased = PUZZLES.map((p, i) => ({ ...p, id: i })).filter((p) => p.phase === phase);
    if (setupFamily) {
      const fam = phased.filter((p) => setupBaseName(p) === setupFamily);
      if (fam.length) phased = fam;
    }
    const all = phased.length ? phased : PUZZLES.map((p, i) => ({ ...p, id: i }));
    const { floor, ceil } = levelWindow(level);
    let pool = all.filter((p) => p.d >= floor && p.d <= ceil);

    // If sparse: take nearest at-or-above level first (never dump easy mates on high levels)
    if (!pool.length) {
      pool = all.filter((p) => p.d >= level);
    }
    if (!pool.length) {
      pool = [...all].sort((a, b) => Math.abs(a.d - level) - Math.abs(b.d - level));
    }

    // Prefer closest to level; penalize easier-than-level so difficulty tracks the slider
    const score = (p) => Math.abs(p.d - level) * 2 + (p.d < level ? 5 : 0);
    pool.sort((a, b) => score(a) - score(b) || b.d - a.d);
    const near = pool.slice(0, Math.min(8, pool.length));
    let fresh = near.filter((p) => !usedIds.has(p.id));
    if (!fresh.length) {
      usedIds.clear();
      fresh = near;
    }
    return fresh[Math.floor(Math.random() * fresh.length)];
  }

  function setPhase(next) {
    if (!["opening", "middle", "endgame"].includes(next) || next === phase) return;
    phase = next;
    setupFamily = "";
    usedIds.clear();
    if (phaseTabs) {
      for (const btn of phaseTabs.querySelectorAll(".phase-btn")) {
        const on = btn.dataset.phase === phase;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-selected", on ? "true" : "false");
      }
    }
    refreshSetupSelect();
    updateChrome();
    loadPuzzle();
  }

  function setSetupFamily(name, reload = true) {
    const next = name || "";
    if (next === setupFamily) {
      if (reload) loadPuzzle();
      return;
    }
    setupFamily = next;
    usedIds.clear();
    if (setupSelect) setupSelect.value = setupFamily;
    updateChrome();
    if (reload) loadPuzzle();
  }

  function showOverlay(text, cls = "") {
    overlayEl.hidden = false;
    overlayEl.className = "overlay" + (cls ? " " + cls : "");
    overlayEl.textContent = text;
  }
  function hideOverlay() {
    overlayEl.hidden = true;
    overlayEl.className = "overlay";
  }

  function updateChrome() {
    levelVal.textContent = String(level);
    levelRange.value = String(level);
    solvedEl.textContent = String(solved);
    streakEl.textContent = String(streak);
    failsEl.textContent = String(fails);
    if (btnBack) btnBack.disabled = history.length === 0;
    const lockPlay = complete || busy || !puzzle || turn !== playerColor;
    if (btnHint) btnHint.disabled = lockPlay;
    if (btnAi) btnAi.disabled = lockPlay;
    updatePuzzleNamePanel();
    if (puzzle && !complete) {
      statusEl.textContent = `${puzzleSetupName()} · L${puzzle.d}`;
    } else if (complete) {
      /* keep last status */
    } else if (engineFailed) {
      statusEl.textContent = "Engine unavailable";
    } else if (!engineReady) {
      statusEl.textContent = "Starting…";
    }
    if (!engineReady && !engineFailed) {
      levelMeta.textContent = levelBlurb(level) + " · engine warming";
    } else if (engineFailed) {
      levelMeta.textContent = levelBlurb(level) + " · offline checks";
    } else {
      levelMeta.textContent = levelBlurb(level) + " · Stockfish ready";
    }
  }

  function setLevel(n, reload = true) {
    const next = Math.max(1, Math.min(100, Math.round(n)));
    const changed = next !== level;
    level = next;
    updateChrome();
    if (reload && changed) loadPuzzle();
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
    // Always available — cancel an in-flight engine reply if needed
    if (waitBest) {
      engineSend("stop");
      const prev = waitBest;
      waitBest = null;
      if (prev.timer) clearTimeout(prev.timer);
      try {
        prev.resolve(null);
      } catch (_) {
        /* ignore */
      }
    }
    searchGen += 1;
    busy = false;
    const snap = history.pop();
    restoreState(snap.state);
    lastMove = snap.lastMove;
    selected = null;
    legal = [];
    hintSquares = null;
    aiMoveMark = null;
    complete = false;
    hideOverlay();
    clearCoachNote();
    hintEl.textContent = snap.hintText || "Your move · Hint follows this board";
    updateChrome();
    draw();
  }

  function loadPuzzle() {
    try {
      busy = true;
      complete = false;
      selected = null;
      legal = [];
      hintSquares = null;
      aiMoveMark = null;
      fails = 0;
      history = [];
      clearCoachNote();

      puzzle = pickPuzzle();
      usedIds.add(puzzle.id);
      const parsed = parseFen(puzzle.fen);
      board = parsed.board;
      turn = parsed.turn;
      castle = parsed.castle;
      ep = parsed.ep;
      playerColor = turn;
      flip = playerColor === "b";
      lastMove = null;

      hintEl.textContent =
        puzzle.goal === "mate"
          ? `${puzzleSetupName()} — force checkmate`
          : `${puzzleSetupName()} — find the win`;
      if (guideAboutEl) {
        guideAboutEl.textContent = `${puzzleSetupName()} — keep playing until you checkmate. Coach notes better choices; wrong moves don’t end it.`;
      }
      updateChrome();
      fit();
      draw();
      hideOverlay();
    } catch (err) {
      console.warn("loadPuzzle failed", err);
      showOverlay("Puzzle error\nTap Next", "bad");
    }
    busy = false;
    updateChrome();
  }

  function isMate() {
    return allLegal(turn).length === 0 && inCheck(turn);
  }

  function sideName(c) {
    return c === "w" ? "White" : "Black";
  }

  /** Side that just delivered mate = enemy of the side to move. */
  function winnerSide() {
    return enemy(turn);
  }

  async function onPlayerMove(fr, fc, tr, tc) {
    if (busy || complete || turn !== playerColor) return;
    busy = true;
    updateChrome();
    const played = sqName(fr, fc) + sqName(tr, tc);

    let best = null;
    if (engineReady && !engineFailed) {
      showCoachNote({
        tone: "good",
        comment: "Evaluating your move…",
        points: ["Comparing with Stockfish…"],
      });
      if (coachStarsEl) coachStarsEl.hidden = true;
      if (coachGradeEl) coachGradeEl.textContent = "Review";
      try {
        best = await askBest(boardToFen());
      } catch (err) {
        console.warn(err);
      }
    }

    pushHistory();
    applyMove(fr, fc, tr, tc);
    selected = null;
    legal = [];
    hintSquares = null;
    hideOverlay();
    draw();

    // Only checkmate by you clears the puzzle
    if (isMate()) {
      commentPuzzleMove(played, best, { mated: true });
      await finishSolved(winnerSide());
      busy = false;
      updateChrome();
      return;
    }

    // Wrong or imperfect moves still continue — coach notes only
    commentPuzzleMove(played, best, { mated: false });
    if (best && best.length >= 4 && played !== best.slice(0, 4)) {
      const [bfr, bfc, btr, btc] = parseUci(best);
      hintSquares = { fr: bfr, fc: bfc, tr: btr, tc: btc };
      draw();
    }

    await playOpponentReply();

    // If opponent mated you: soft stop (not complete) — Take back and keep trying
    if (isMate()) {
      fails += 1;
      streak = 0;
      const win = winnerSide();
      showOverlay(`${sideName(win)} wins\nTake back`, "bad");
      hintEl.textContent = "Checkmated — Take back and keep playing until you mate";
      statusEl.textContent = `${sideName(win)} wins · take back to continue`;
      showCoachNote({
        tone: "bad",
        stars: 1,
        comment: `${sideName(win)} checkmated you — that line wasn't safe.`,
        points: [
          "Take back — the puzzle isn’t over until you deliver mate.",
          best ? `A stronger idea was ${prettySq(best)}.` : "Tap Hint for a better plan.",
          "Wrong moves never block you from continuing after Take back.",
        ],
      });
      busy = false;
      updateChrome();
      return;
    }

    if (allLegal(turn).length === 0) {
      hintEl.textContent = "No moves left · Take back and keep going";
      hideOverlay();
      busy = false;
      updateChrome();
      return;
    }

    // Never leave controls locked on the opponent's turn
    if (turn !== playerColor) {
      await playOpponentReply();
    }

    hintEl.textContent = "Keep going · checkmate clears the puzzle";
    busy = false;
    updateChrome();
  }

  async function finishSolved(winSide = playerColor) {
    // Success condition: you delivered checkmate
    complete = true;
    solved += 1;
    streak += 1;
    updateChrome();
    showOverlay(`${sideName(winSide)} wins\nCheckmate`, "ok");
    hintEl.textContent = `Checkmate · Next for another puzzle`;
    statusEl.textContent = `${sideName(winSide)} wins · streak ${streak}`;
  }

  async function giveHint() {
    if (complete || busy || !puzzle || turn !== playerColor) return;
    busy = true;
    updateChrome();
    hintEl.textContent = "Thinking…";
    try {
      let best = null;
      if (engineReady && !engineFailed) {
        try {
          best = await askBest(boardToFen());
        } catch (err) {
          console.warn("hint engine", err);
        }
      }
      if (best && best.length >= 4) {
        const [fr, fc, tr, tc] = parseUci(best);
        applyHintSquares(fr, fc, tr, tc);
        busy = false;
        updateChrome();
        return;
      }
      const local = localHintMove();
      if (local) {
        applyHintSquares(
          local[0],
          local[1],
          local[2],
          local[3],
          `Hint: look at ${sqName(local[0], local[1])} (local)`
        );
      } else {
        hintEl.textContent = engineReady
          ? "No clear hint — keep probing"
          : "Engine warming · try Hint again";
      }
    } catch (err) {
      console.warn(err);
      hintEl.textContent = "Hint failed · try again";
    }
    busy = false;
    updateChrome();
  }

  /** Play the engine's best move for you (then opponent replies). */
  async function playAiMove() {
    if (complete || busy || !puzzle || turn !== playerColor) return;
    busy = true;
    updateChrome();
    hintEl.textContent = "AI moving…";
    try {
      let best = null;
      if (engineReady && !engineFailed) {
        try {
          best = await askBest(boardToFen());
        } catch (err) {
          console.warn("ai move", err);
        }
      }
      let move = null;
      if (best && best.length >= 4) {
        const parsed = parseUci(best);
        const ok = allLegal(playerColor).some(
          ([a, b, c, d]) =>
            a === parsed[0] && b === parsed[1] && c === parsed[2] && d === parsed[3]
        );
        if (ok) move = parsed;
      }
      if (!move) {
        const local = localHintMove();
        if (local) move = local;
      }
      if (move) {
        hintSquares = null;
        selected = null;
        legal = [];
        hintEl.textContent = `AI played ${sqName(move[0], move[1])} → ${sqName(move[2], move[3])}`;
        busy = false;
        updateChrome();
        await onPlayerMove(move[0], move[1], move[2], move[3]);
        aiMoveMark = { fr: move[0], fc: move[1], tr: move[2], tc: move[3] };
        draw();
        return;
      }
      hintEl.textContent = engineReady
        ? "AI found no move"
        : "Engine warming · try AI Move again";
    } catch (err) {
      console.warn(err);
      hintEl.textContent = "AI move failed · try again";
    }
    busy = false;
    updateChrome();
  }

  function fit() {
    const w = Math.max(280, Math.floor(boardWrap?.clientWidth || 640));
    const h = Math.max(280, Math.floor(boardWrap?.clientHeight || 640));
    canvas.width = w;
    canvas.height = h;
    const gutter = Math.max(20, Math.floor(Math.min(w, h) * 0.045));
    size = Math.floor(((Math.min(w, h) - gutter * 2) * 0.9) / 8);
    const boardPx = size * 8;
    ox = Math.floor((w - boardPx) / 2) + Math.floor(gutter * 0.35);
    oy = Math.floor((h - boardPx) / 2) - Math.floor(gutter * 0.2);
  }

  function drawCoordinates() {
    const fontPx = Math.max(12, Math.floor(size * 0.3));
    ctx.save();
    ctx.font = `700 ${fontPx}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = "rgba(240, 232, 242, 0.78)";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let c = 0; c < 8; c++) {
      const [, dc] = displayRC(0, c);
      const x = ox + dc * size + size / 2;
      const y = oy + size * 8 + Math.max(4, Math.floor(fontPx * 0.25));
      ctx.fillText(String.fromCharCode(97 + c), x, y);
    }
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let r = 0; r < 8; r++) {
      const [dr] = displayRC(r, 0);
      const x = ox - Math.max(6, Math.floor(fontPx * 0.35));
      const y = oy + dr * size + size / 2;
      ctx.fillText(String(8 - r), x, y);
    }
    ctx.restore();
  }

  function displayRC(r, c) {
    if (!flip) return [r, c];
    return [7 - r, 7 - c];
  }
  function boardRC(dr, dc) {
    if (!flip) return [dr, dc];
    return [7 - dr, 7 - dc];
  }

  function squareAt(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    const dc = Math.floor((x - ox) / size);
    const dr = Math.floor((y - oy) / size);
    if (dr < 0 || dr > 7 || dc < 0 || dc > 7) return null;
    return boardRC(dr, dc);
  }

  function draw() {
    ctx.fillStyle = "#1a221c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const [dr, dc] = displayRC(r, c);
        const light = (r + c) % 2 === 0;
        ctx.fillStyle = light ? "#e8d9b5" : "#5a7a58";
        ctx.fillRect(ox + dc * size, oy + dr * size, size, size);

        if (lastMove && ((lastMove.fr === r && lastMove.fc === c) || (lastMove.tr === r && lastMove.tc === c))) {
          ctx.fillStyle = "rgba(232, 160, 192, 0.35)";
          ctx.fillRect(ox + dc * size, oy + dr * size, size, size);
        }
        if (
          aiMoveMark &&
          ((aiMoveMark.fr === r && aiMoveMark.fc === c) ||
            (aiMoveMark.tr === r && aiMoveMark.tc === c))
        ) {
          ctx.fillStyle = "rgba(170, 90, 255, 0.5)";
          ctx.fillRect(ox + dc * size, oy + dr * size, size, size);
          ctx.lineWidth = Math.max(3, size * 0.08);
          ctx.strokeStyle = "#d4a0ff";
          ctx.strokeRect(ox + dc * size + 2, oy + dr * size + 2, size - 4, size - 4);
        }
        if (selected && selected[0] === r && selected[1] === c) {
          ctx.lineWidth = Math.max(3, size * 0.08);
          ctx.strokeStyle = "rgba(255, 220, 120, 0.95)";
          ctx.strokeRect(ox + dc * size + 2, oy + dr * size + 2, size - 4, size - 4);
        }
        if (hintSquares && ((hintSquares.fr === r && hintSquares.fc === c) || (hintSquares.tr === r && hintSquares.tc === c))) {
          ctx.fillStyle = "rgba(255, 220, 100, 0.4)";
          ctx.fillRect(ox + dc * size, oy + dr * size, size, size);
        }
      }
    }

    for (const [r, c] of legal) {
      const [dr, dc] = displayRC(r, c);
      const cx = ox + dc * size + size / 2;
      const cy = oy + dr * size + size / 2;
      if (board[r][c]) {
        ctx.strokeStyle = "rgba(232, 112, 112, 0.8)";
        ctx.lineWidth = Math.max(3, size * 0.08);
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.42, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = "rgba(20, 16, 28, 0.35)";
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
        const [dr, dc] = displayRC(r, c);
        const cx = ox + dc * size + size / 2;
        const cy = oy + dr * size + size / 2 + size * 0.03;
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

    drawCoordinates();
  }

  function onClick(e) {
    if (busy || complete || !puzzle || turn !== playerColor) return;
    const sq = squareAt(e.clientX, e.clientY);
    if (!sq) return;
    const [r, c] = sq;

    if (selected) {
      const [sr, sc] = selected;
      if (legal.some(([lr, lc]) => lr === r && lc === c)) {
        aiMoveMark = null;
        onPlayerMove(sr, sc, r, c);
        return;
      }
      if (colorOf(board[r][c]) === playerColor) {
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
    if (colorOf(board[r][c]) === playerColor) {
      selected = [r, c];
      legal = legalMoves(r, c);
      draw();
    }
  }

  settingsEl.addEventListener("click", (e) => {
    const phaseBtn = e.target.closest(".phase-btn");
    if (phaseBtn) {
      setPhase(phaseBtn.dataset.phase);
      return;
    }
    const btn = e.target.closest(".step-btn");
    if (!btn) return;
    const dir = Number(btn.dataset.dir);
    setLevel(level + dir * (e.shiftKey ? 10 : 1));
  });
  levelRange.addEventListener("input", () => setLevel(Number(levelRange.value)));
  if (setupSelect) {
    setupSelect.addEventListener("change", () => {
      setSetupFamily(setupSelect.value, true);
    });
  }
  btnNext.addEventListener("click", () => loadPuzzle());
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
      else if (act === "next" || act === "new") loadPuzzle();
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
      loadPuzzle();
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

  setLevel(20, false);
  refreshSetupSelect();
  // Defer first puzzle until layout has real board dimensions
  requestAnimationFrame(() => {
    fit();
    loadPuzzle();
    initEngine();
  });
})();
