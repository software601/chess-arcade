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
  const lessonVal = document.getElementById("val-lesson");
  const lessonRange = document.getElementById("lesson-range");
  const levelMeta = document.getElementById("level-meta");
  const settingsEl = document.querySelector(".settings");
  const bookTabs = document.querySelector(".book-tabs");
  const lessonSelect = document.getElementById("lesson-select");
  const setupLabel = document.getElementById("setup-label");
  const puzzlePhaseEl = document.getElementById("puzzle-phase");
  const puzzleTitleEl = document.getElementById("puzzle-title");
  const puzzleSubEl = document.getElementById("puzzle-sub");
  const solvedEl = document.getElementById("solved");
  const streakEl = document.getElementById("streak");
  const progressEl = document.getElementById("progress");
  const teachEl = document.getElementById("teach-text");
  const infoKickerEl = document.getElementById("info-kicker");
  const infoTitleEl = document.getElementById("info-title");
  const infoAboutEl = document.getElementById("info-about");
  const infoDescEl = document.getElementById("info-desc");
  const infoPitfallsEl = document.getElementById("info-pitfalls");
  const infoGoalEl = document.getElementById("info-goal");
  const coachNoteEl = document.getElementById("coach-note");
  const coachHeadingEl = document.getElementById("coach-heading");
  const coachGradeEl = document.getElementById("coach-grade");
  const coachStarsEl = document.getElementById("coach-stars");
  const coachCommentEl = document.getElementById("coach-comment");
  const coachFixesEl = document.getElementById("coach-fixes");

  const GRADE_WORDS = {
    1: "Poor",
    2: "Okay",
    3: "Good",
    4: "Very good",
    5: "Excellent",
  };

  const ENGINE_JS = "/chess003/stockfish-19-lite-single.js";
  const ENGINE_WASM = "/chess003/stockfish-19-lite-single.wasm";
  const GLYPH = {
    wk: "♔", wq: "♕", wr: "♖", wb: "♗", wn: "♘", wp: "♙",
    bk: "♚", bq: "♛", br: "♜", bb: "♝", bn: "♞", bp: "♟",
  };

  /** 100 endgame lessons inspired by Silman-style rating bands. Original drills. */
  const LESSONS = [
    {
      "n": 1,
      "book": "class_e",
      "title": "Opposition (1)",
      "teach": "Kings face with one square between — seize the opposition.",
      "hint": "Take the opposition.",
      "fen": "8/8/8/3k4/8/8/3K4/8 w - - 0 1",
      "goal": "win",
      "theme": "Opposition",
      "about": "Opposition — Find the best endgame move.",
      "desc": "Kings face with one square between — seize the opposition. Prefer the clean endgame idea. (Silman-style · Class E (<1000) — elementary king and pawn endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 2,
      "book": "class_e",
      "title": "Opposition (2)",
      "teach": "Distant opposition still decides who yields ground.",
      "hint": "Step to take opposition.",
      "fen": "8/8/8/8/3k4/8/8/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Opposition",
      "about": "Opposition — Find the best endgame move.",
      "desc": "Distant opposition still decides who yields ground. Prefer the clean endgame idea. (Silman-style · Class E (<1000) — elementary king and pawn endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 3,
      "book": "class_e",
      "title": "King to the Key Square",
      "teach": "In K+P vs K, occupy the key square with your king.",
      "hint": "Walk toward the key square.",
      "fen": "8/8/8/3k4/8/3P4/8/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Key squares",
      "about": "Key squares — Find the best endgame move.",
      "desc": "In K+P vs K, occupy the key square with your king. Prefer the clean endgame idea. (Silman-style · Class E (<1000) — elementary king and pawn endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 4,
      "book": "class_e",
      "title": "Escort the Passer",
      "teach": "Your king must lead the passed pawn.",
      "hint": "Bring the king ahead of the pawn.",
      "fen": "8/8/8/8/3k4/3P4/8/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Passed pawn",
      "about": "Passed pawn — Find the best endgame move.",
      "desc": "Your king must lead the passed pawn. Prefer the clean endgame idea. (Silman-style · Class E (<1000) — elementary king and pawn endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 5,
      "book": "class_e",
      "title": "Push the Passer",
      "teach": "When the path is clear, advance the pawn.",
      "hint": "Push the passed pawn.",
      "fen": "8/8/4P3/8/8/8/8/4k1K1 w - - 0 1",
      "goal": "win",
      "theme": "Passed pawn",
      "about": "Passed pawn — Find the best endgame move.",
      "desc": "When the path is clear, advance the pawn. Prefer the clean endgame idea. (Silman-style · Class E (<1000) — elementary king and pawn endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 6,
      "book": "class_e",
      "title": "Shouldering",
      "teach": "Shoulder the enemy king away from the pawn.",
      "hint": "Shoulder the enemy king off.",
      "fen": "8/8/8/1k6/3P4/8/8/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Shouldering",
      "about": "Shouldering — Find the best endgame move.",
      "desc": "Shoulder the enemy king away from the pawn. Prefer the clean endgame idea. (Silman-style · Class E (<1000) — elementary king and pawn endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 7,
      "book": "class_e",
      "title": "Queen Mate Technique",
      "teach": "K+Q vs K — mate without stalemate.",
      "hint": "Queen to the mating square.",
      "fen": "7k/5Q2/6K1/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "K+Q mate",
      "about": "K+Q mate — Deliver checkmate.",
      "desc": "K+Q vs K — mate without stalemate. Play the forcing move that ends the game. (Silman-style · Class E (<1000) — elementary king and pawn endings)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate — especially with K+P or K+Q.",
        "Use your king as an attacking piece in the ending."
      ]
    },
    {
      "n": 8,
      "book": "class_e",
      "title": "Queen Mate Edge",
      "teach": "Drive the king to the edge, then mate.",
      "hint": "Mate with king support.",
      "fen": "k7/8/1QK5/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "K+Q mate",
      "about": "K+Q mate — Deliver checkmate.",
      "desc": "Drive the king to the edge, then mate. Play the forcing move that ends the game. (Silman-style · Class E (<1000) — elementary king and pawn endings)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate — especially with K+P or K+Q.",
        "Use your king as an attacking piece in the ending."
      ]
    },
    {
      "n": 9,
      "book": "class_e",
      "title": "Rook Mate Technique",
      "teach": "K+R vs K — cut off, then mate.",
      "hint": "Rook mates.",
      "fen": "7k/4R3/6K1/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "K+R mate",
      "about": "K+R mate — Deliver checkmate.",
      "desc": "K+R vs K — cut off, then mate. Play the forcing move that ends the game. (Silman-style · Class E (<1000) — elementary king and pawn endings)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate — especially with K+P or K+Q.",
        "Use your king as an attacking piece in the ending."
      ]
    },
    {
      "n": 10,
      "book": "class_e",
      "title": "Rook Cutoff Mate",
      "teach": "Cut off, then finish.",
      "hint": "Cut off / mate.",
      "fen": "7k/5R2/6K1/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "K+R mate",
      "about": "K+R mate — Deliver checkmate.",
      "desc": "Cut off, then finish. Play the forcing move that ends the game. (Silman-style · Class E (<1000) — elementary king and pawn endings)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate — especially with K+P or K+Q.",
        "Use your king as an attacking piece in the ending."
      ]
    },
    {
      "n": 11,
      "book": "class_e",
      "title": "Two Rooks Mate",
      "teach": "Two rooks on the 7th crush most kings.",
      "hint": "Mate with the rooks.",
      "fen": "4k3/R6R/8/8/8/8/8/6K1 w - - 0 1",
      "goal": "mate",
      "theme": "Two rooks",
      "about": "Two rooks — Deliver checkmate.",
      "desc": "Two rooks on the 7th crush most kings. Play the forcing move that ends the game. (Silman-style · Class E (<1000) — elementary king and pawn endings)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate — especially with K+P or K+Q.",
        "Use your king as an attacking piece in the ending."
      ]
    },
    {
      "n": 12,
      "book": "class_e",
      "title": "King Activity First",
      "teach": "The king is a fighting piece — centralize it.",
      "hint": "Centralize the king.",
      "fen": "8/8/8/8/8/4k3/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "King activity",
      "about": "King activity — Find the best endgame move.",
      "desc": "The king is a fighting piece — centralize it. Prefer the clean endgame idea. (Silman-style · Class E (<1000) — elementary king and pawn endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 13,
      "book": "class_e",
      "title": "Do Not Stalemate",
      "teach": "Leave the king a square until mate.",
      "hint": "Mate without stalemate.",
      "fen": "7k/5Q2/5K2/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Stalemate care",
      "about": "Stalemate care — Deliver checkmate.",
      "desc": "Leave the king a square until mate. Play the forcing move that ends the game. (Silman-style · Class E (<1000) — elementary king and pawn endings)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate — especially with K+P or K+Q.",
        "Use your king as an attacking piece in the ending."
      ]
    },
    {
      "n": 14,
      "book": "class_e",
      "title": "Pawn on 6th",
      "teach": "Support a 6th-rank pawn with the king.",
      "hint": "Support with the king.",
      "fen": "8/8/3P4/8/3k4/8/8/3K4 w - - 0 1",
      "goal": "win",
      "theme": "K+P",
      "about": "K+P — Find the best endgame move.",
      "desc": "Support a 6th-rank pawn with the king. Prefer the clean endgame idea. (Silman-style · Class E (<1000) — elementary king and pawn endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 15,
      "book": "class_e",
      "title": "Rook Behind Passer",
      "teach": "Rooks belong behind passed pawns.",
      "hint": "Rook behind the passer.",
      "fen": "4k3/8/8/3P4/8/8/8/3RK3 w - - 0 1",
      "goal": "win",
      "theme": "Rook + passer",
      "about": "Rook + passer — Find the best endgame move.",
      "desc": "Rooks belong behind passed pawns. Prefer the clean endgame idea. (Silman-style · Class E (<1000) — elementary king and pawn endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 16,
      "book": "class_e",
      "title": "Stop the Enemy Passer",
      "teach": "Blockade the enemy passer.",
      "hint": "Keep the blockade.",
      "fen": "4k3/4p3/4N3/8/8/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Blockade",
      "about": "Blockade — Find the best endgame move.",
      "desc": "Blockade the enemy passer. Prefer the clean endgame idea. (Silman-style · Class E (<1000) — elementary king and pawn endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 17,
      "book": "class_e",
      "title": "Basic Promotion",
      "teach": "Queening wins — promote when safe.",
      "hint": "Promote.",
      "fen": "8/4P3/8/8/8/8/8/4k1K1 w - - 0 1",
      "goal": "win",
      "theme": "Promotion",
      "about": "Promotion — Find the best endgame move.",
      "desc": "Queening wins — promote when safe. Prefer the clean endgame idea. (Silman-style · Class E (<1000) — elementary king and pawn endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 18,
      "book": "class_e",
      "title": "Corner Mate with Rook",
      "teach": "King in the corner — rook finishes.",
      "hint": "Rook mates on the edge.",
      "fen": "k7/8/1K6/8/8/8/8/1R6 w - - 0 1",
      "goal": "mate",
      "theme": "K+R mate",
      "about": "K+R mate — Deliver checkmate.",
      "desc": "King in the corner — rook finishes. Play the forcing move that ends the game. (Silman-style · Class E (<1000) — elementary king and pawn endings)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate — especially with K+P or K+Q.",
        "Use your king as an attacking piece in the ending."
      ]
    },
    {
      "n": 19,
      "book": "class_e",
      "title": "Class E Review · Opposition",
      "teach": "Review: opposition decides many K+P endings.",
      "hint": "Take the opposition.",
      "fen": "8/8/8/4k3/8/8/4K3/8 w - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best endgame move.",
      "desc": "Review: opposition decides many K+P endings. Prefer the clean endgame idea. (Silman-style · Class E (<1000) — elementary king and pawn endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 20,
      "book": "class_e",
      "title": "Class E Review · Mate",
      "teach": "Review: finish a basic heavy-piece mate.",
      "hint": "Mate in one.",
      "fen": "6k1/5R2/5K2/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Review",
      "about": "Review — Deliver checkmate.",
      "desc": "Review: finish a basic heavy-piece mate. Play the forcing move that ends the game. (Silman-style · Class E (<1000) — elementary king and pawn endings)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate — especially with K+P or K+Q.",
        "Use your king as an attacking piece in the ending."
      ]
    },
    {
      "n": 21,
      "book": "class_d",
      "title": "Outside Passed Pawn",
      "teach": "An outside passer distracts the enemy king.",
      "hint": "Use the outside passer.",
      "fen": "8/8/8/p7/8/8/1P6/4k1K1 w - - 0 1",
      "goal": "win",
      "theme": "Outside passer",
      "about": "Outside passer — Find the best endgame move.",
      "desc": "An outside passer distracts the enemy king. Prefer the clean endgame idea. (Silman-style · Class D (1000–1200) — pawn races and outside passers)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 22,
      "book": "class_d",
      "title": "Pawn Race",
      "teach": "Count tempi — promote first or with check.",
      "hint": "Push the winning race.",
      "fen": "8/5p2/8/8/8/8/4P3/4k1K1 w - - 0 1",
      "goal": "win",
      "theme": "Pawn race",
      "about": "Pawn race — Find the best endgame move.",
      "desc": "Count tempi — promote first or with check. Prefer the clean endgame idea. (Silman-style · Class D (1000–1200) — pawn races and outside passers)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 23,
      "book": "class_d",
      "title": "Protected Passed Pawn",
      "teach": "A protected passer is a lasting advantage.",
      "hint": "Use the protected passer.",
      "fen": "8/8/3P4/2P5/8/8/8/4k1K1 w - - 0 1",
      "goal": "win",
      "theme": "Protected passer",
      "about": "Protected passer — Find the best endgame move.",
      "desc": "A protected passer is a lasting advantage. Prefer the clean endgame idea. (Silman-style · Class D (1000–1200) — pawn races and outside passers)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 24,
      "book": "class_d",
      "title": "Connected Passers",
      "teach": "Connected passers support each other.",
      "hint": "Advance a connected passer.",
      "fen": "8/8/3PP3/8/8/8/8/4k1K1 w - - 0 1",
      "goal": "win",
      "theme": "Connected passers",
      "about": "Connected passers — Find the best endgame move.",
      "desc": "Connected passers support each other. Prefer the clean endgame idea. (Silman-style · Class D (1000–1200) — pawn races and outside passers)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 25,
      "book": "class_d",
      "title": "King Ahead of Pawns",
      "teach": "King leads; pawns follow.",
      "hint": "Bring the king up first.",
      "fen": "8/8/8/3k4/3P4/8/8/3K4 w - - 0 1",
      "goal": "win",
      "theme": "King + pawns",
      "about": "King + pawns — Find the best endgame move.",
      "desc": "King leads; pawns follow. Prefer the clean endgame idea. (Silman-style · Class D (1000–1200) — pawn races and outside passers)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 26,
      "book": "class_d",
      "title": "Break Through",
      "teach": "A pawn break opens a queen.",
      "hint": "Find the break.",
      "fen": "8/8/2p1p3/2P1P3/8/8/8/4k1K1 w - - 0 1",
      "goal": "win",
      "theme": "Pawn break",
      "about": "Pawn break — Find the best endgame move.",
      "desc": "A pawn break opens a queen. Prefer the clean endgame idea. (Silman-style · Class D (1000–1200) — pawn races and outside passers)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 27,
      "book": "class_d",
      "title": "Rook vs Passer",
      "teach": "Rook stops a passer from behind.",
      "hint": "Get behind the pawn.",
      "fen": "4k3/3P4/8/8/8/8/3r4/5K2 b - - 0 1",
      "goal": "win",
      "theme": "Rook vs pawn",
      "about": "Rook vs pawn — Find the best endgame move.",
      "desc": "Rook stops a passer from behind. Prefer the clean endgame idea. (Silman-style · Class D (1000–1200) — pawn races and outside passers)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 28,
      "book": "class_d",
      "title": "Active Rook",
      "teach": "Activity often beats a pawn in rook endings.",
      "hint": "Activate the rook.",
      "fen": "4k3/8/8/8/8/8/7p/3R2K1 w - - 0 1",
      "goal": "win",
      "theme": "Rook activity",
      "about": "Rook activity — Find the best endgame move.",
      "desc": "Activity often beats a pawn in rook endings. Prefer the clean endgame idea. (Silman-style · Class D (1000–1200) — pawn races and outside passers)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 29,
      "book": "class_d",
      "title": "Cut Off the King",
      "teach": "Rook cuts the enemy king from the pawn.",
      "hint": "Cut the king off.",
      "fen": "4k3/8/8/3P4/8/8/8/3R1K2 w - - 0 1",
      "goal": "win",
      "theme": "Cutoff",
      "about": "Cutoff — Find the best endgame move.",
      "desc": "Rook cuts the enemy king from the pawn. Prefer the clean endgame idea. (Silman-style · Class D (1000–1200) — pawn races and outside passers)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 30,
      "book": "class_d",
      "title": "King and Two Pawns",
      "teach": "Two pawns usually win vs bare king.",
      "hint": "Advance with king help.",
      "fen": "8/8/3PP3/8/8/8/8/3k1K2 w - - 0 1",
      "goal": "win",
      "theme": "Two pawns",
      "about": "Two pawns — Find the best endgame move.",
      "desc": "Two pawns usually win vs bare king. Prefer the clean endgame idea. (Silman-style · Class D (1000–1200) — pawn races and outside passers)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 31,
      "book": "class_d",
      "title": "Rook Pawn Care",
      "teach": "a/h pawns need accurate king play.",
      "hint": "Play the correct plan.",
      "fen": "8/8/8/8/7P/6K1/8/6k1 w - - 0 1",
      "goal": "win",
      "theme": "Rook pawn",
      "about": "Rook pawn — Find the best endgame move.",
      "desc": "a/h pawns need accurate king play. Prefer the clean endgame idea. (Silman-style · Class D (1000–1200) — pawn races and outside passers)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 32,
      "book": "class_d",
      "title": "Fix and Attack",
      "teach": "Fix enemy pawns, then attack the base.",
      "hint": "Fix / attack a weakness.",
      "fen": "4k3/8/3p4/8/3P4/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Weak pawns",
      "about": "Weak pawns — Find the best endgame move.",
      "desc": "Fix enemy pawns, then attack the base. Prefer the clean endgame idea. (Silman-style · Class D (1000–1200) — pawn races and outside passers)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 33,
      "book": "class_d",
      "title": "Space in the Ending",
      "teach": "More space means freer king routes.",
      "hint": "Use space to improve the king.",
      "fen": "8/8/8/3k4/3P4/8/8/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Space",
      "about": "Space — Find the best endgame move.",
      "desc": "More space means freer king routes. Prefer the clean endgame idea. (Silman-style · Class D (1000–1200) — pawn races and outside passers)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 34,
      "book": "class_d",
      "title": "Queen vs Passer",
      "teach": "Queen stops distant passers — check and approach.",
      "hint": "Check / approach the pawn.",
      "fen": "4k3/3P4/8/8/8/8/7q/4K3 b - - 0 1",
      "goal": "win",
      "theme": "Queen vs pawn",
      "about": "Queen vs pawn — Find the best endgame move.",
      "desc": "Queen stops distant passers — check and approach. Prefer the clean endgame idea. (Silman-style · Class D (1000–1200) — pawn races and outside passers)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 35,
      "book": "class_d",
      "title": "Promote with Tempo",
      "teach": "Promote with check when you can.",
      "hint": "Promote.",
      "fen": "8/5P2/8/8/8/8/8/5k1K w - - 0 1",
      "goal": "win",
      "theme": "Promotion",
      "about": "Promotion — Find the best endgame move.",
      "desc": "Promote with check when you can. Prefer the clean endgame idea. (Silman-style · Class D (1000–1200) — pawn races and outside passers)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 36,
      "book": "class_d",
      "title": "Rook on 7th",
      "teach": "Rook on the 7th cages the king and eats pawns.",
      "hint": "Invade the 7th.",
      "fen": "4k3/7p/8/8/8/8/8/3R2K1 w - - 0 1",
      "goal": "win",
      "theme": "7th rank",
      "about": "7th rank — Find the best endgame move.",
      "desc": "Rook on the 7th cages the king and eats pawns. Prefer the clean endgame idea. (Silman-style · Class D (1000–1200) — pawn races and outside passers)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 37,
      "book": "class_d",
      "title": "King Opposition Midboard",
      "teach": "Opposition in the center of the board.",
      "hint": "Seize opposition.",
      "fen": "8/8/8/8/3k4/8/3K4/8 w - - 0 1",
      "goal": "win",
      "theme": "Opposition",
      "about": "Opposition — Find the best endgame move.",
      "desc": "Opposition in the center of the board. Prefer the clean endgame idea. (Silman-style · Class D (1000–1200) — pawn races and outside passers)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 38,
      "book": "class_d",
      "title": "Escort Connected Pawns",
      "teach": "King escorts connected pawns up the board.",
      "hint": "Escort with the king.",
      "fen": "8/8/8/8/3PP3/8/8/3k1K2 w - - 0 1",
      "goal": "win",
      "theme": "Connected passers",
      "about": "Connected passers — Find the best endgame move.",
      "desc": "King escorts connected pawns up the board. Prefer the clean endgame idea. (Silman-style · Class D (1000–1200) — pawn races and outside passers)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 39,
      "book": "class_d",
      "title": "Class D Review · Passer",
      "teach": "Review: outside/protected passers win games.",
      "hint": "Use the passer.",
      "fen": "8/8/4P3/8/8/8/8/4k1K1 w - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best endgame move.",
      "desc": "Review: outside/protected passers win games. Prefer the clean endgame idea. (Silman-style · Class D (1000–1200) — pawn races and outside passers)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 40,
      "book": "class_d",
      "title": "Class D Review · Race",
      "teach": "Review: count the race before you push.",
      "hint": "The winning push.",
      "fen": "8/6p1/8/8/8/8/5P2/5k1K w - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best endgame move.",
      "desc": "Review: count the race before you push. Prefer the clean endgame idea. (Silman-style · Class D (1000–1200) — pawn races and outside passers)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 41,
      "book": "class_c",
      "title": "Philidor Setup Idea",
      "teach": "Rook on the 3rd keeps the enemy king out.",
      "hint": "Set up the defending rook.",
      "fen": "4k3/8/8/3P4/8/3R4/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Philidor idea",
      "about": "Philidor idea — Find the best endgame move.",
      "desc": "Rook on the 3rd keeps the enemy king out. Prefer the clean endgame idea. (Silman-style · Class C (1200–1400) — rook endings and basic technique)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 42,
      "book": "class_c",
      "title": "Lucena Bridge Idea",
      "teach": "Build a bridge so the king escapes checks.",
      "hint": "Start the bridging idea.",
      "fen": "3k4/3P4/8/8/8/8/8/3RK3 w - - 0 1",
      "goal": "win",
      "theme": "Lucena idea",
      "about": "Lucena idea — Find the best endgame move.",
      "desc": "Build a bridge so the king escapes checks. Prefer the clean endgame idea. (Silman-style · Class C (1200–1400) — rook endings and basic technique)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 43,
      "book": "class_c",
      "title": "Rook Behind Own Passer",
      "teach": "Tarrasch: rook behind your passed pawn.",
      "hint": "Rook behind the passer.",
      "fen": "4k3/8/8/8/3P4/8/8/3RK3 w - - 0 1",
      "goal": "win",
      "theme": "Tarrasch",
      "about": "Tarrasch — Find the best endgame move.",
      "desc": "Tarrasch: rook behind your passed pawn. Prefer the clean endgame idea. (Silman-style · Class C (1200–1400) — rook endings and basic technique)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 44,
      "book": "class_c",
      "title": "Rook Behind Their Passer",
      "teach": "Rook behind their passer to stop it.",
      "hint": "Get behind their passer.",
      "fen": "4k3/3p4/8/8/8/8/8/3RK3 w - - 0 1",
      "goal": "win",
      "theme": "Tarrasch",
      "about": "Tarrasch — Find the best endgame move.",
      "desc": "Rook behind their passer to stop it. Prefer the clean endgame idea. (Silman-style · Class C (1200–1400) — rook endings and basic technique)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 45,
      "book": "class_c",
      "title": "Active Defense in Rook Ending",
      "teach": "Checks from the side/rear keep you alive.",
      "hint": "Activate the rook.",
      "fen": "4k3/8/8/8/8/7p/8/3R2K1 w - - 0 1",
      "goal": "win",
      "theme": "Rook defense",
      "about": "Rook defense — Find the best endgame move.",
      "desc": "Checks from the side/rear keep you alive. Prefer the clean endgame idea. (Silman-style · Class C (1200–1400) — rook endings and basic technique)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 46,
      "book": "class_c",
      "title": "Trade into Won Pawn Ending",
      "teach": "If the pawn ending is won, simplify.",
      "hint": "Force a favorable trade.",
      "fen": "4k3/8/8/8/8/8/3R4/3rK3 w - - 0 1",
      "goal": "win",
      "theme": "Simplification",
      "about": "Simplification — Find the best endgame move.",
      "desc": "If the pawn ending is won, simplify. Prefer the clean endgame idea. (Silman-style · Class C (1200–1400) — rook endings and basic technique)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 47,
      "book": "class_c",
      "title": "Avoid Drawn Pawn Ending",
      "teach": "Do not trade into a known draw.",
      "hint": "Keep pieces.",
      "fen": "4k3/8/8/8/8/3R4/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Avoid draw",
      "about": "Avoid draw — Find the best endgame move.",
      "desc": "Do not trade into a known draw. Prefer the clean endgame idea. (Silman-style · Class C (1200–1400) — rook endings and basic technique)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 48,
      "book": "class_c",
      "title": "Bishop vs Passer",
      "teach": "Bishop stops a passer on one color.",
      "hint": "Stop the pawn with the bishop.",
      "fen": "4k3/8/3P4/8/8/8/8/2B1K3 w - - 0 1",
      "goal": "win",
      "theme": "Bishop vs pawn",
      "about": "Bishop vs pawn — Find the best endgame move.",
      "desc": "Bishop stops a passer on one color. Prefer the clean endgame idea. (Silman-style · Class C (1200–1400) — rook endings and basic technique)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 49,
      "book": "class_c",
      "title": "Knight vs Passer",
      "teach": "Knight needs short range — get in front early.",
      "hint": "Blockade with the knight.",
      "fen": "4k3/4p3/8/8/8/4N3/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Knight vs pawn",
      "about": "Knight vs pawn — Find the best endgame move.",
      "desc": "Knight needs short range — get in front early. Prefer the clean endgame idea. (Silman-style · Class C (1200–1400) — rook endings and basic technique)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 50,
      "book": "class_c",
      "title": "Same-Color Bishops",
      "teach": "Put pawns on the other color of your bishop.",
      "hint": "Improve bishop / pawns.",
      "fen": "4k3/8/3p4/8/3P4/8/8/2B1K3 w - - 0 1",
      "goal": "win",
      "theme": "Bishop ending",
      "about": "Bishop ending — Find the best endgame move.",
      "desc": "Put pawns on the other color of your bishop. Prefer the clean endgame idea. (Silman-style · Class C (1200–1400) — rook endings and basic technique)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 51,
      "book": "class_c",
      "title": "Opposite-Color Drawish",
      "teach": "Opposite bishops often draw — push for the exception.",
      "hint": "Create a passer / attack.",
      "fen": "4k3/8/8/8/8/8/8/2B1Kb2 w - - 0 1",
      "goal": "win",
      "theme": "Opposite bishops",
      "about": "Opposite bishops — Find the best endgame move.",
      "desc": "Opposite bishops often draw — push for the exception. Prefer the clean endgame idea. (Silman-style · Class C (1200–1400) — rook endings and basic technique)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 52,
      "book": "class_c",
      "title": "Rook + Pawn vs Rook",
      "teach": "Activate before pushing.",
      "hint": "Activate, then push.",
      "fen": "4k3/8/8/3P4/8/8/8/3R1K2 w - - 0 1",
      "goal": "win",
      "theme": "R+P vs R",
      "about": "R+P vs R — Find the best endgame move.",
      "desc": "Activate before pushing. Prefer the clean endgame idea. (Silman-style · Class C (1200–1400) — rook endings and basic technique)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 53,
      "book": "class_c",
      "title": "Cut and Advance",
      "teach": "Cut the king, then advance the pawn.",
      "hint": "Cutoff then push.",
      "fen": "5k2/8/8/4P3/8/8/8/3R1K2 w - - 0 1",
      "goal": "win",
      "theme": "Cutoff",
      "about": "Cutoff — Find the best endgame move.",
      "desc": "Cut the king, then advance the pawn. Prefer the clean endgame idea. (Silman-style · Class C (1200–1400) — rook endings and basic technique)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 54,
      "book": "class_c",
      "title": "King Shelter from Checks",
      "teach": "Tuck the king so checks stop.",
      "hint": "Find shelter.",
      "fen": "4k3/8/3P4/8/8/8/8/3RK3 w - - 0 1",
      "goal": "win",
      "theme": "Lucena idea",
      "about": "Lucena idea — Find the best endgame move.",
      "desc": "Tuck the king so checks stop. Prefer the clean endgame idea. (Silman-style · Class C (1200–1400) — rook endings and basic technique)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 55,
      "book": "class_c",
      "title": "Vancura Idea Sketch",
      "teach": "Side checks can hold rook vs rook+pawn.",
      "hint": "Set up side checks.",
      "fen": "4k3/7P/8/8/8/8/8/3R2K1 w - - 0 1",
      "goal": "win",
      "theme": "Vancura idea",
      "about": "Vancura idea — Find the best endgame move.",
      "desc": "Side checks can hold rook vs rook+pawn. Prefer the clean endgame idea. (Silman-style · Class C (1200–1400) — rook endings and basic technique)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 56,
      "book": "class_c",
      "title": "Minor Piece Activity",
      "teach": "A passive minor piece loses.",
      "hint": "Activate the minor piece.",
      "fen": "4k3/8/8/8/8/8/8/2B1K3 w - - 0 1",
      "goal": "win",
      "theme": "Activity",
      "about": "Activity — Find the best endgame move.",
      "desc": "A passive minor piece loses. Prefer the clean endgame idea. (Silman-style · Class C (1200–1400) — rook endings and basic technique)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 57,
      "book": "class_c",
      "title": "Two Bishops Technique",
      "teach": "Two bishops rake — restrict the king.",
      "hint": "Use both bishops.",
      "fen": "4k3/8/8/8/8/8/8/2B1KB2 w - - 0 1",
      "goal": "win",
      "theme": "Two bishops",
      "about": "Two bishops — Find the best endgame move.",
      "desc": "Two bishops rake — restrict the king. Prefer the clean endgame idea. (Silman-style · Class C (1200–1400) — rook endings and basic technique)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 58,
      "book": "class_c",
      "title": "Rook Lift to 7th",
      "teach": "Get the rook to the 7th with tempo.",
      "hint": "Invade.",
      "fen": "4k3/8/7p/8/8/8/8/3R2K1 w - - 0 1",
      "goal": "win",
      "theme": "7th rank",
      "about": "7th rank — Find the best endgame move.",
      "desc": "Get the rook to the 7th with tempo. Prefer the clean endgame idea. (Silman-style · Class C (1200–1400) — rook endings and basic technique)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 59,
      "book": "class_c",
      "title": "Class C Review · Lucena",
      "teach": "Review: bridge idea to queen the pawn.",
      "hint": "Bridge / promote plan.",
      "fen": "3k4/3P4/8/8/8/8/3R4/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best endgame move.",
      "desc": "Review: bridge idea to queen the pawn. Prefer the clean endgame idea. (Silman-style · Class C (1200–1400) — rook endings and basic technique)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 60,
      "book": "class_c",
      "title": "Class C Review · Philidor",
      "teach": "Review: 3rd-rank defense idea.",
      "hint": "Defensive rook setup.",
      "fen": "4k3/8/8/4P3/8/3R4/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best endgame move.",
      "desc": "Review: 3rd-rank defense idea. Prefer the clean endgame idea. (Silman-style · Class C (1200–1400) — rook endings and basic technique)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 61,
      "book": "class_b",
      "title": "Rook Ending Checks",
      "teach": "Prefer side/rear checks over passive defense.",
      "hint": "Choose the checking angle.",
      "fen": "4k3/8/8/8/8/8/4P3/3R2K1 w - - 0 1",
      "goal": "win",
      "theme": "Rook checks",
      "about": "Rook checks — Find the best endgame move.",
      "desc": "Prefer side/rear checks over passive defense. Prefer the clean endgame idea. (Silman-style · Class B (1400–1600) — rook/minor endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 62,
      "book": "class_b",
      "title": "Passed Pawn + Rook",
      "teach": "Coordinate rook and passer.",
      "hint": "Advance with rook support.",
      "fen": "4k3/8/8/3P4/8/8/8/3R2K1 w - - 0 1",
      "goal": "win",
      "theme": "R+P",
      "about": "R+P — Find the best endgame move.",
      "desc": "Coordinate rook and passer. Prefer the clean endgame idea. (Silman-style · Class B (1400–1600) — rook/minor endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 63,
      "book": "class_b",
      "title": "Knight Outpost Ending",
      "teach": "A knight on a hole dominates.",
      "hint": "Use the outpost.",
      "fen": "4k3/8/8/3p4/4N3/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Outpost",
      "about": "Outpost — Find the best endgame move.",
      "desc": "A knight on a hole dominates. Prefer the clean endgame idea. (Silman-style · Class B (1400–1600) — rook/minor endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 64,
      "book": "class_b",
      "title": "Bishop vs Knight Ending",
      "teach": "Open board favors bishops; closed favors knights.",
      "hint": "Play to your piece.",
      "fen": "4k3/8/3p4/8/8/8/8/2B1K1N1 w - - 0 1",
      "goal": "win",
      "theme": "B vs N",
      "about": "B vs N — Find the best endgame move.",
      "desc": "Open board favors bishops; closed favors knights. Prefer the clean endgame idea. (Silman-style · Class B (1400–1600) — rook/minor endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 65,
      "book": "class_b",
      "title": "Zugzwang Theme",
      "teach": "Put them where every move loses.",
      "hint": "The waiting / zugzwang move.",
      "fen": "8/8/8/3k4/8/3P4/8/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Zugzwang",
      "about": "Zugzwang — Find the best endgame move.",
      "desc": "Put them where every move loses. Prefer the clean endgame idea. (Silman-style · Class B (1400–1600) — rook/minor endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 66,
      "book": "class_b",
      "title": "Triangulation",
      "teach": "Lose a tempo to gain opposition.",
      "hint": "Triangulate with the king.",
      "fen": "8/8/8/4k3/8/8/3K4/8 w - - 0 1",
      "goal": "win",
      "theme": "Triangulation",
      "about": "Triangulation — Find the best endgame move.",
      "desc": "Lose a tempo to gain opposition. Prefer the clean endgame idea. (Silman-style · Class B (1400–1600) — rook/minor endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 67,
      "book": "class_b",
      "title": "Rook vs Bishop+Pawn",
      "teach": "Know when the rook holds or wins.",
      "hint": "Active rook plan.",
      "fen": "4k3/8/3p4/8/8/8/8/2B1K2R w - - 0 1",
      "goal": "win",
      "theme": "R vs B",
      "about": "R vs B — Find the best endgame move.",
      "desc": "Know when the rook holds or wins. Prefer the clean endgame idea. (Silman-style · Class B (1400–1600) — rook/minor endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 68,
      "book": "class_b",
      "title": "Rook vs Knight+Pawn",
      "teach": "Short-range knight needs help.",
      "hint": "Coordinate vs the knight.",
      "fen": "4k3/8/3p4/8/8/8/8/4K1NR w - - 0 1",
      "goal": "win",
      "theme": "R vs N",
      "about": "R vs N — Find the best endgame move.",
      "desc": "Short-range knight needs help. Prefer the clean endgame idea. (Silman-style · Class B (1400–1600) — rook/minor endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 69,
      "book": "class_b",
      "title": "Two Passers Split",
      "teach": "Split passers pull the king both ways.",
      "hint": "Advance the distant passer.",
      "fen": "8/8/P6P/8/8/8/8/4k1K1 w - - 0 1",
      "goal": "win",
      "theme": "Split passers",
      "about": "Split passers — Find the best endgame move.",
      "desc": "Split passers pull the king both ways. Prefer the clean endgame idea. (Silman-style · Class B (1400–1600) — rook/minor endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 70,
      "book": "class_b",
      "title": "King Invasion",
      "teach": "Invade via weak squares.",
      "hint": "Invade with the king.",
      "fen": "8/5ppp/8/8/8/8/5PPP/4K2k w - - 0 1",
      "goal": "win",
      "theme": "Invasion",
      "about": "Invasion — Find the best endgame move.",
      "desc": "Invade via weak squares. Prefer the clean endgame idea. (Silman-style · Class B (1400–1600) — rook/minor endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 71,
      "book": "class_b",
      "title": "Exchange into Lucena",
      "teach": "Trade into a known win.",
      "hint": "Simplify into the win.",
      "fen": "4k3/8/3P4/8/8/8/2R5/2r1K3 w - - 0 1",
      "goal": "win",
      "theme": "Conversion",
      "about": "Conversion — Find the best endgame move.",
      "desc": "Trade into a known win. Prefer the clean endgame idea. (Silman-style · Class B (1400–1600) — rook/minor endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 72,
      "book": "class_b",
      "title": "Hold Philidor",
      "teach": "Defend accurately vs R+P.",
      "hint": "Hold the draw setup.",
      "fen": "4k3/8/8/3P4/8/8/3R4/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Defense",
      "about": "Defense — Find the best endgame move.",
      "desc": "Defend accurately vs R+P. Prefer the clean endgame idea. (Silman-style · Class B (1400–1600) — rook/minor endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 73,
      "book": "class_b",
      "title": "Bishop Pair Ending",
      "teach": "Two bishops convert with care.",
      "hint": "Use the bishop pair.",
      "fen": "4k3/8/8/8/8/8/8/1NB1KB2 w - - 0 1",
      "goal": "win",
      "theme": "Bishop pair",
      "about": "Bishop pair — Find the best endgame move.",
      "desc": "Two bishops convert with care. Prefer the clean endgame idea. (Silman-style · Class B (1400–1600) — rook/minor endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 74,
      "book": "class_b",
      "title": "Pawn Breakthrough Combo",
      "teach": "Breakthrough creates a queen.",
      "hint": "Break through.",
      "fen": "8/8/2ppp3/2PPP3/8/8/8/4k1K1 w - - 0 1",
      "goal": "win",
      "theme": "Breakthrough",
      "about": "Breakthrough — Find the best endgame move.",
      "desc": "Breakthrough creates a queen. Prefer the clean endgame idea. (Silman-style · Class B (1400–1600) — rook/minor endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 75,
      "book": "class_b",
      "title": "Rook on Open File Ending",
      "teach": "Control the only open file.",
      "hint": "Seize the file.",
      "fen": "4k3/8/8/8/8/8/8/3RK3 w - - 0 1",
      "goal": "win",
      "theme": "Open file",
      "about": "Open file — Find the best endgame move.",
      "desc": "Control the only open file. Prefer the clean endgame idea. (Silman-style · Class B (1400–1600) — rook/minor endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 76,
      "book": "class_b",
      "title": "Knight Fork Caution",
      "teach": "Watch knight forks while converting.",
      "hint": "Safe converting move.",
      "fen": "4k3/8/8/8/8/5n2/8/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Tactics in ending",
      "about": "Tactics in ending — Find the best endgame move.",
      "desc": "Watch knight forks while converting. Prefer the clean endgame idea. (Silman-style · Class B (1400–1600) — rook/minor endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 77,
      "book": "class_b",
      "title": "Queen Ending Checks",
      "teach": "Shelter the king vs perpetual ideas.",
      "hint": "Shelter / chase carefully.",
      "fen": "4k3/8/8/8/8/7q/8/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Queen ending",
      "about": "Queen ending — Find the best endgame move.",
      "desc": "Shelter the king vs perpetual ideas. Prefer the clean endgame idea. (Silman-style · Class B (1400–1600) — rook/minor endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 78,
      "book": "class_b",
      "title": "Active King vs Passive",
      "teach": "The more active king wins equal endings.",
      "hint": "Activate your king.",
      "fen": "8/8/8/8/8/3k4/8/3K4 w - - 0 1",
      "goal": "win",
      "theme": "King activity",
      "about": "King activity — Find the best endgame move.",
      "desc": "The more active king wins equal endings. Prefer the clean endgame idea. (Silman-style · Class B (1400–1600) — rook/minor endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 79,
      "book": "class_b",
      "title": "Class B Review · Bridge",
      "teach": "Review: bridging ideas to promote.",
      "hint": "Bridge plan.",
      "fen": "3k4/3P4/8/8/8/3R4/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best endgame move.",
      "desc": "Review: bridging ideas to promote. Prefer the clean endgame idea. (Silman-style · Class B (1400–1600) — rook/minor endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 80,
      "book": "class_b",
      "title": "Class B Review · Activity",
      "teach": "Review: activity over material in rook endings.",
      "hint": "Activate.",
      "fen": "4k3/8/8/8/8/8/7p/R3K3 w - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best endgame move.",
      "desc": "Review: activity over material in rook endings. Prefer the clean endgame idea. (Silman-style · Class B (1400–1600) — rook/minor endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 81,
      "book": "class_a",
      "title": "Complex R+P Conversion",
      "teach": "Activate, cut off, then push.",
      "hint": "The converting move.",
      "fen": "4k3/8/8/4P3/8/8/8/3R1K2 w - - 0 1",
      "goal": "win",
      "theme": "Conversion",
      "about": "Conversion — Find the best endgame move.",
      "desc": "Activate, cut off, then push. Prefer the clean endgame idea. (Silman-style · Class A (1600–1800) — harder technical endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 82,
      "book": "class_a",
      "title": "Fortress Recognition",
      "teach": "Do not smash into a fortress — change the plan.",
      "hint": "Avoid the fortress / improve.",
      "fen": "4k3/8/8/8/8/8/8/2B1K1N1 w - - 0 1",
      "goal": "win",
      "theme": "Fortress",
      "about": "Fortress — Find the best endgame move.",
      "desc": "Do not smash into a fortress — change the plan. Prefer the clean endgame idea. (Silman-style · Class A (1600–1800) — harder technical endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 83,
      "book": "class_a",
      "title": "Opposite Bishops Win Try",
      "teach": "Create two distant passers.",
      "hint": "Create a second passer.",
      "fen": "4k3/8/8/8/P6P/8/8/2B1Kb2 w - - 0 1",
      "goal": "win",
      "theme": "Opposite bishops",
      "about": "Opposite bishops — Find the best endgame move.",
      "desc": "Create two distant passers. Prefer the clean endgame idea. (Silman-style · Class A (1600–1800) — harder technical endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 84,
      "book": "class_a",
      "title": "Knight Ending Precision",
      "teach": "Knight endings are pawn endings with forks.",
      "hint": "Precise king/knight move.",
      "fen": "4k3/8/8/3p4/8/4N3/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Knight ending",
      "about": "Knight ending — Find the best endgame move.",
      "desc": "Knight endings are pawn endings with forks. Prefer the clean endgame idea. (Silman-style · Class A (1600–1800) — harder technical endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 85,
      "book": "class_a",
      "title": "Bishop Ending Precision",
      "teach": "Pawns on the opposite color of your bishop.",
      "hint": "Improve structure / bishop.",
      "fen": "4k3/8/3p4/8/8/8/3P4/2B1K3 w - - 0 1",
      "goal": "win",
      "theme": "Bishop ending",
      "about": "Bishop ending — Find the best endgame move.",
      "desc": "Pawns on the opposite color of your bishop. Prefer the clean endgame idea. (Silman-style · Class A (1600–1800) — harder technical endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 86,
      "book": "class_a",
      "title": "Rook Ending 4 vs 3",
      "teach": "Majority on one wing — create a passer.",
      "hint": "Create the passer.",
      "fen": "4k3/5ppp/8/8/8/5PPP/8/3R1K2 w - - 0 1",
      "goal": "win",
      "theme": "4 vs 3",
      "about": "4 vs 3 — Find the best endgame move.",
      "desc": "Majority on one wing — create a passer. Prefer the clean endgame idea. (Silman-style · Class A (1600–1800) — harder technical endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 87,
      "book": "class_a",
      "title": "Corresponding Squares Idea",
      "teach": "Some king squares correspond — step carefully.",
      "hint": "The key corresponding square.",
      "fen": "8/8/8/3k4/8/8/3K4/8 w - - 0 1",
      "goal": "win",
      "theme": "Corresponding squares",
      "about": "Corresponding squares — Find the best endgame move.",
      "desc": "Some king squares correspond — step carefully. Prefer the clean endgame idea. (Silman-style · Class A (1600–1800) — harder technical endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 88,
      "book": "class_a",
      "title": "Queen vs Rook Technique",
      "teach": "Drive into a fork or mate net.",
      "hint": "Restrict then win material.",
      "fen": "4k3/8/8/8/8/8/8/3QK2r w - - 0 1",
      "goal": "win",
      "theme": "Q vs R",
      "about": "Q vs R — Find the best endgame move.",
      "desc": "Drive into a fork or mate net. Prefer the clean endgame idea. (Silman-style · Class A (1600–1800) — harder technical endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 89,
      "book": "class_a",
      "title": "Rook+Bishop vs Rook",
      "teach": "Keep pieces active in the grind.",
      "hint": "Improve coordination.",
      "fen": "4k3/8/8/8/8/8/8/2BRK3 w - - 0 1",
      "goal": "win",
      "theme": "R+B vs R",
      "about": "R+B vs R — Find the best endgame move.",
      "desc": "Keep pieces active in the grind. Prefer the clean endgame idea. (Silman-style · Class A (1600–1800) — harder technical endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 90,
      "book": "class_a",
      "title": "Two Passers vs Rook",
      "teach": "Two connected passers often beat a rook.",
      "hint": "Push the pair.",
      "fen": "4k3/8/3PP3/8/8/8/8/3rK3 w - - 0 1",
      "goal": "win",
      "theme": "Passers vs rook",
      "about": "Passers vs rook — Find the best endgame move.",
      "desc": "Two connected passers often beat a rook. Prefer the clean endgame idea. (Silman-style · Class A (1600–1800) — harder technical endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 91,
      "book": "class_a",
      "title": "Prophylaxis in Endings",
      "teach": "Ask what they want — stop it first.",
      "hint": "Prophylactic move.",
      "fen": "4k3/4p3/8/8/8/8/4P3/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Prophylaxis",
      "about": "Prophylaxis — Find the best endgame move.",
      "desc": "Ask what they want — stop it first. Prefer the clean endgame idea. (Silman-style · Class A (1600–1800) — harder technical endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 92,
      "book": "class_a",
      "title": "Exchange for a Clear Win",
      "teach": "Calculate the pawn ending before trading.",
      "hint": "Trade only if winning.",
      "fen": "4k3/8/8/8/8/8/3Q4/3qK3 w - - 0 1",
      "goal": "win",
      "theme": "Calculation",
      "about": "Calculation — Find the best endgame move.",
      "desc": "Calculate the pawn ending before trading. Prefer the clean endgame idea. (Silman-style · Class A (1600–1800) — harder technical endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 93,
      "book": "class_a",
      "title": "King March Behind Lines",
      "teach": "Long king march to the weak wing.",
      "hint": "Start the march.",
      "fen": "8/p6p/8/8/8/8/P6P/4K2k w - - 0 1",
      "goal": "win",
      "theme": "King march",
      "about": "King march — Find the best endgame move.",
      "desc": "Long king march to the weak wing. Prefer the clean endgame idea. (Silman-style · Class A (1600–1800) — harder technical endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 94,
      "book": "class_a",
      "title": "Rook Lift Switch",
      "teach": "Switch the rook to the other file.",
      "hint": "Switch files.",
      "fen": "4k3/8/8/8/8/8/8/R3K3 w Q - 0 1",
      "goal": "win",
      "theme": "Rook switch",
      "about": "Rook switch — Find the best endgame move.",
      "desc": "Switch the rook to the other file. Prefer the clean endgame idea. (Silman-style · Class A (1600–1800) — harder technical endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 95,
      "book": "class_a",
      "title": "Mate Net in Ending",
      "teach": "Mating nets appear even in endings.",
      "hint": "Deliver mate.",
      "fen": "6k1/5R2/5K2/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Mating net",
      "about": "Mating net — Deliver checkmate.",
      "desc": "Mating nets appear even in endings. Play the forcing move that ends the game. (Silman-style · Class A (1600–1800) — harder technical endings)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate — especially with K+P or K+Q.",
        "Use your king as an attacking piece in the ending."
      ]
    },
    {
      "n": 96,
      "book": "class_a",
      "title": "Stalemate Care",
      "teach": "Convert without allowing stalemate.",
      "hint": "Mate cleanly.",
      "fen": "7k/5Q2/5K2/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Stalemate care",
      "about": "Stalemate care — Deliver checkmate.",
      "desc": "Convert without allowing stalemate. Play the forcing move that ends the game. (Silman-style · Class A (1600–1800) — harder technical endings)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate — especially with K+P or K+Q.",
        "Use your king as an attacking piece in the ending."
      ]
    },
    {
      "n": 97,
      "book": "class_a",
      "title": "Tablebase Mentality",
      "teach": "Play the move that shortens the win cleanly.",
      "hint": "The clean technical move.",
      "fen": "7k/4R3/6K1/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Technique",
      "about": "Technique — Deliver checkmate.",
      "desc": "Play the move that shortens the win cleanly. Play the forcing move that ends the game. (Silman-style · Class A (1600–1800) — harder technical endings)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate — especially with K+P or K+Q.",
        "Use your king as an attacking piece in the ending."
      ]
    },
    {
      "n": 98,
      "book": "class_a",
      "title": "Class A Review · Conversion",
      "teach": "Review: activate, restrict, then promote.",
      "hint": "Convert.",
      "fen": "4k3/8/8/3P4/8/8/8/3R1K2 w - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best endgame move.",
      "desc": "Review: activate, restrict, then promote. Prefer the clean endgame idea. (Silman-style · Class A (1600–1800) — harder technical endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 99,
      "book": "class_a",
      "title": "Class A Review · Defense",
      "teach": "Review: know the hold before you need it.",
      "hint": "Hold / improve.",
      "fen": "4k3/8/8/8/3P4/8/3R4/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best endgame move.",
      "desc": "Review: know the hold before you need it. Prefer the clean endgame idea. (Silman-style · Class A (1600–1800) — harder technical endings)",
      "pitfalls": [
        "Ask what the key square / opposition / passer needs.",
        "Activate the king before pushing pawns blindly.",
        "Don't trade into a drawn pawn ending by accident."
      ]
    },
    {
      "n": 100,
      "book": "class_a",
      "title": "Course Finale",
      "teach": "Finish with clean endgame technique.",
      "hint": "The final teaching move.",
      "fen": "7k/5Q2/6K1/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Review",
      "about": "Review — Deliver checkmate.",
      "desc": "Finish with clean endgame technique. Play the forcing move that ends the game. (Silman-style · Class A (1600–1800) — harder technical endings)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate — especially with K+P or K+Q.",
        "Use your king as an attacking piece in the ending."
      ]
    }
  ];


  const BOOK_LABEL = {
    class_e: "Class E · <1000",
    class_d: "Class D · 1000+",
    class_c: "Class C · 1200+",
    class_b: "Class B · 1400+",
    class_a: "Class A · 1600+",
  };

  function bookLabel(b) {
    return BOOK_LABEL[b] || b;
  }

  function lessonByN(n) {
    return LESSONS.find((l) => l.n === n) || LESSONS[0];
  }

  function lessonsInFilter() {
    if (bookFilter === "all") return LESSONS.slice();
    return LESSONS.filter((l) => l.book === bookFilter);
  }

  function bookLessons() {
    return lessonsInFilter();
  }

  function lessonCount() {
    return bookLessons().length || LESSONS.length;
  }

  /** Map UI index (1..count in current filter) -> global lesson n */
  function globalNFromUi(uiN) {
    const list = bookLessons();
    if (!list.length) return 1;
    const idx = Math.max(0, Math.min(list.length - 1, Math.round(uiN) - 1));
    return list[idx].n;
  }

  function uiIndexFromGlobal(n) {
    const list = bookLessons();
    const idx = list.findIndex((l) => l.n === n);
    return idx >= 0 ? idx + 1 : 1;
  }

  function updateLessonSelect() {
    if (!lessonSelect) return;
    const list = lessonsInFilter();
    lessonSelect.innerHTML = "";
    for (const l of list) {
      const opt = document.createElement("option");
      opt.value = String(l.n);
      const ui = bookFilter === "all" ? l.n : uiIndexFromGlobal(l.n);
      opt.textContent = `${ui}. ${l.title}${completed.has(l.n) ? " ✓" : ""}`;
      lessonSelect.appendChild(opt);
    }
    if (![...lessonSelect.options].some((o) => o.value === String(lessonN))) {
      lessonN = list[0] ? list[0].n : 1;
    }
    lessonSelect.value = String(lessonN);
  }

  function syncLessonRange() {
    if (!lessonRange) return;
    const count = lessonCount();
    lessonRange.min = "1";
    lessonRange.max = String(count);
    lessonRange.value = String(uiIndexFromGlobal(lessonN));
    const label = document.querySelector(".level-slider .step-label");
    if (label) label.textContent = `1–${count}`;
  }

  function setBookFilter(next) {
    if (!["all", "class_e", "class_d", "class_c", "class_b", "class_a"].includes(next)) return;
    bookFilter = next;
    if (bookTabs) {
      for (const btn of bookTabs.querySelectorAll(".book-btn")) {
        const on = btn.dataset.book === bookFilter;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-selected", on ? "true" : "false");
      }
    }
    const list = lessonsInFilter();
    if (!list.some((l) => l.n === lessonN)) lessonN = list[0].n;
    if (setupLabel) {
      setupLabel.textContent = bookFilter === "all" ? "All lessons" : bookLabel(bookFilter);
    }
    syncLessonRange();
    updateLessonSelect();
    loadPuzzle();
  }

  function setLesson(uiOrGlobal) {
    // When filtered, treat stepper/slider as 1..bandCount; when all, global 1..100
    if (bookFilter === "all") {
      lessonN = Math.max(1, Math.min(LESSONS.length, Math.round(uiOrGlobal)));
    } else {
      lessonN = globalNFromUi(uiOrGlobal);
    }
    if (!lessonsInFilter().some((l) => l.n === lessonN)) {
      bookFilter = "all";
      if (bookTabs) {
        for (const btn of bookTabs.querySelectorAll(".book-btn")) {
          const on = btn.dataset.book === "all";
          btn.classList.toggle("is-active", on);
          btn.setAttribute("aria-selected", on ? "true" : "false");
        }
      }
      if (setupLabel) setupLabel.textContent = "All lessons";
    }
    syncLessonRange();
    updateLessonSelect();
    loadPuzzle();
  }


  let lessonN = 1;
  let bookFilter = "all";
  let setupFamily = "";
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
  let completed = new Set();
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

  function puzzleSetupSub(p = puzzle) {
    if (!p) return "Choose Opening · Middlegame · Endgame";
    const goal = p.goal === "mate" ? "Force checkmate" : "Find the winning idea";
    return `${goal} · puzzle L${p.d}`;
  }

  function updatePuzzleNamePanel() {
    if (!puzzlePhaseEl || !puzzle) return;
    puzzlePhaseEl.textContent = bookLabel(puzzle.book);
    puzzleTitleEl.textContent = `${puzzle.n}. ${puzzle.title}`;
    puzzleSubEl.textContent =
      puzzle.goal === "mate" ? `${puzzle.theme} · force checkmate` : `${puzzle.theme} · find the best idea`;
    if (teachEl) teachEl.textContent = puzzle.teach;

    if (infoKickerEl) {
      infoKickerEl.textContent = `Lesson ${puzzle.n}/100 · ${bookLabel(puzzle.book)}`;
    }
    if (infoTitleEl) infoTitleEl.textContent = puzzle.title;
    if (infoAboutEl) {
      infoAboutEl.textContent = puzzle.about || puzzle.theme || "Lesson focus";
    }
    if (infoDescEl) {
      infoDescEl.textContent = puzzle.desc || puzzle.teach || "";
    }
    if (infoPitfallsEl) {
      const pits = Array.isArray(puzzle.pitfalls) ? puzzle.pitfalls : [];
      infoPitfallsEl.innerHTML = "";
      for (const pit of pits) {
        const li = document.createElement("li");
        li.textContent = pit;
        infoPitfallsEl.appendChild(li);
      }
      if (!pits.length) {
        const li = document.createElement("li");
        li.textContent = "Stay forcing — check the opponent's reply before you commit.";
        infoPitfallsEl.appendChild(li);
      }
    }
    if (infoGoalEl) {
      infoGoalEl.textContent =
        puzzle.goal === "mate"
          ? "Goal: force checkmate · Hint shows the key square"
          : "Goal: play the teaching move · Hint / AI Move available";
    }
  }

  function levelBlurb() {
    const l = lessonByN(lessonN);
    const ui = uiIndexFromGlobal(l.n);
    const count = lessonCount();
    if (bookFilter === "all") return `Lesson ${l.n}/100 · ${bookLabel(l.book)}`;
    return `Lesson ${ui}/${count} · ${bookLabel(l.book)}`;
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
    // Lite WASM: modest fixed depth is reliable for lessons
    return 12;
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

  /** Offline / fallback: mate → check → capture → pawn push → king closer → any. */
  function localHintMove() {
    const side = turn;
    const moves = allLegal(side);
    if (!moves.length) return null;
    let checkMove = null;
    let captureMove = null;
    let pawnPush = null;
    let kingCloser = null;
    const enemyKing = findKing(enemy(side));
    for (const [fr, fc, tr, tc] of moves) {
      const before = cloneState();
      const moving = board[fr][fc];
      const target = board[tr][tc];
      applyMove(fr, fc, tr, tc, true);
      const opp = turn;
      const mate = allLegal(opp).length === 0 && inCheck(opp);
      const chk = inCheck(opp);
      restoreState(before);
      if (mate) return [fr, fc, tr, tc];
      if (chk && !checkMove) checkMove = [fr, fc, tr, tc];
      if (target && !captureMove) captureMove = [fr, fc, tr, tc];
      if (typeOf(moving) === "p" && !pawnPush) {
        const dir = side === "w" ? -1 : 1;
        if (tr === fr + dir && tc === fc) pawnPush = [fr, fc, tr, tc];
      }
      if (typeOf(moving) === "k" && enemyKing && !kingCloser) {
        const beforeDist = Math.abs(fr - enemyKing[0]) + Math.abs(fc - enemyKing[1]);
        const afterDist = Math.abs(tr - enemyKing[0]) + Math.abs(tc - enemyKing[1]);
        if (afterDist < beforeDist) kingCloser = [fr, fc, tr, tc];
      }
    }
    return checkMove || captureMove || pawnPush || kingCloser || moves[0];
  }

  /** Always answer for the side to move so Hint/AI never strand on the opponent. */
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
          if (legalOpp.some(([a, b, c, d]) => a === parsed[0] && b === parsed[1] && c === parsed[2] && d === parsed[3])) {
            move = parsed;
          }
        }
      }
    } catch (err) {
      console.warn("opponent engine", err);
    }
    if (!move) {
      const local = localHintMove();
      if (local) move = local;
      else move = legalOpp[0];
    }
    if (move) {
      applyMove(move[0], move[1], move[2], move[3]);
      draw();
    }
  }

  function teachingMoveUci() {
    if (puzzle && puzzle.move && puzzle.move.length >= 4) return puzzle.move.slice(0, 4);
    return null;
  }

  function clearCoachNote() {
    if (coachNoteEl) {
      coachNoteEl.hidden = true;
      coachNoteEl.classList.remove("is-good");
    }
    if (coachHeadingEl) coachHeadingEl.textContent = "Coach";
    if (coachGradeEl) coachGradeEl.textContent = "";
    if (coachStarsEl) coachStarsEl.textContent = "";
    if (coachCommentEl) coachCommentEl.textContent = "";
    if (coachFixesEl) coachFixesEl.innerHTML = "";
  }

  function starsText(n) {
    const s = Math.max(1, Math.min(5, Math.round(n)));
    return "★".repeat(s) + "☆".repeat(5 - s);
  }

  /**
   * @param {object} opts
   * @param {string} opts.comment
   * @param {string[]} [opts.points]
   * @param {number} [opts.stars] 1–5
   * @param {"good"|"bad"} [opts.tone]
   */
  function showCoachNote({ comment, points, stars, tone } = {}) {
    if (!coachNoteEl) return;
    const good = tone === "good";
    coachNoteEl.hidden = false;
    coachNoteEl.classList.toggle("is-good", good);
    if (coachHeadingEl) coachHeadingEl.textContent = good ? "Nice move" : "Coach";
    if (coachGradeEl) {
      if (stars) {
        const word = GRADE_WORDS[stars] || "Good";
        coachGradeEl.textContent = `${word} · ${stars}/5`;
      } else {
        coachGradeEl.textContent = good ? "Well played" : "Needs work";
      }
    }
    if (coachStarsEl) {
      coachStarsEl.textContent = stars ? starsText(stars) : "";
      coachStarsEl.hidden = !stars;
    }
    if (coachCommentEl) coachCommentEl.textContent = comment || "";
    if (coachFixesEl) {
      coachFixesEl.innerHTML = "";
      for (const fix of points || []) {
        const li = document.createElement("li");
        li.textContent = fix;
        coachFixesEl.appendChild(li);
      }
    }
    /* keep phone scroll on the board — do not scroll to coach */
    if (window.matchMedia && window.matchMedia("(max-width: 768px)").matches) {
      const y = window.__boardScrollY;
      if (typeof y === "number") {
        requestAnimationFrame(() => window.scrollTo(0, y));
      }
    }
  }

  /** Positive rating for a correct / teaching move. Stars: 1 Poor … 5 Excellent. */
  function evaluateGoodMove(uci, { mated = false, taught = false, progress = false } = {}) {
    const theme = `${puzzle?.theme || ""} ${puzzle?.title || ""}`.toLowerCase();
    let stars = 4;
    let why = [];

    if (mated) {
      stars = 5;
      why.push("You forced checkmate — the king has no escape.");
      why.push("That's the cleanest result this lesson asks for.");
    } else if (progress) {
      stars = 4;
      why.push("Right idea — keep going; the mate net is forming.");
    } else if (taught || (puzzle?.move && puzzle.move.slice(0, 4) === uci.slice(0, 4))) {
      stars = 5;
      why.push("Exact teaching move for this lesson.");
    } else {
      stars = 4;
      why.push("Matches the engine's best idea in this position.");
    }

    if (/back-rank|ladder|mate/.test(theme) && mated) {
      why.push("Classic mating pattern — keep that picture in mind.");
    } else if (/pawn|passer|opposition|key/.test(theme)) {
      why.push("You respected the endgame idea (king/pawn), not a random check.");
    } else if (/force|hang|fork|skewer/.test(theme)) {
      why.push("Good sense for material / tactics — force first.");
    } else if (/time|develop|castle|space/.test(theme)) {
      why.push("Principle move: development, time, or space over side trips.");
    } else if (/queen|rook/.test(theme) && mated) {
      why.push("Heavy piece + king coordination — textbook technique.");
    }

    if (puzzle?.teach) why.push(puzzle.teach);

    const word = GRADE_WORDS[stars];
    let comment;
    if (stars === 5) {
      comment = mated
        ? `Excellent — ${prettySq(uci)} finishes the job.`
        : `Excellent — ${prettySq(uci)} is exactly what this lesson wants.`;
    } else if (stars === 4) {
      comment = progress
        ? `Very good — ${prettySq(uci)} is the right step. Keep pressing.`
        : `Very good — ${prettySq(uci)} is a strong, principled choice.`;
    } else if (stars === 3) {
      comment = `Good — ${prettySq(uci)} works, and it fits the lesson idea.`;
    } else if (stars === 2) {
      comment = `Okay — ${prettySq(uci)} is playable, but aim for the cleaner idea.`;
    } else {
      comment = `Poor — ${prettySq(uci)} misses the lesson idea.`;
    }

    const points = [];
    points.push(`Why ${word.toLowerCase()}: this move follows the lesson plan.`);
    for (const w of why) {
      if (w && !points.includes(w)) points.push(w);
      if (points.length >= 4) break;
    }

    return { stars, grade: word, comment, points };
  }

  /** Low stars for a wrong move (still informative, not only critical). */
  function rateWrongMove(fixes) {
    return {
      stars: 2,
      tone: "bad",
      comment: null, // filled by caller
      points: fixes,
    };
  }

  function prettySq(uci4) {
    if (!uci4 || uci4.length < 4) return "?";
    return `${uci4.slice(0, 2)} → ${uci4.slice(2, 4)}`;
  }

  /** Build a short coach comment + correction tips for a non-teaching move. */
  function explainWrongMove(playedUci, bestUci, fr, fc, tr, tc, beforeSnap) {
    const moving = beforeSnap && beforeSnap.board ? beforeSnap.board[fr][fc] : null;
    const target = beforeSnap && beforeSnap.board ? beforeSnap.board[tr][tc] : null;
    const piece = moving ? typeOf(moving) : null;
    const names = { k: "king", q: "queen", r: "rook", b: "bishop", n: "knight", p: "pawn" };
    const pieceName = names[piece] || "piece";
    const wasCapture = !!target;
    const pits = Array.isArray(puzzle?.pitfalls) ? puzzle.pitfalls : [];

    // Probe whether the played move checked / left king safer
    let gaveCheck = false;
    let leftInCheck = false;
    if (beforeSnap) {
      const cur = cloneState();
      restoreState(beforeSnap);
      applyMove(fr, fc, tr, tc, true);
      gaveCheck = inCheck(turn);
      leftInCheck = inCheck(playerColor);
      restoreState(cur);
    }

    let comment;
    if (puzzle?.goal === "mate") {
      if (gaveCheck) {
        comment = `Check is good energy, but ${prettySq(playedUci)} doesn't finish the mate yet.`;
      } else if (wasCapture) {
        comment = `Taking with the ${pieceName} isn't the mating idea here.`;
      } else {
        comment = `${prettySq(playedUci)} isn't the mating move this lesson wants.`;
      }
    } else if (piece === "p" && (puzzle?.theme || "").toLowerCase().includes("pawn")) {
      comment = wasCapture
        ? "That capture misses the pawn lesson — look at advancing or supporting the passer."
        : "That pawn/king move isn't the teaching idea — think key squares and the passer.";
    } else if (piece === "k" && /(pawn|opposition|key|shoulder)/i.test(`${puzzle?.theme || ""} ${puzzle?.title || ""}`)) {
      comment = "King move matters here — but that square doesn't take the key idea (opposition / escort).";
    } else if (wasCapture) {
      comment = `Capturing with the ${pieceName} looks tempting, but it isn't the teaching move.`;
    } else if (gaveCheck) {
      comment = "A check, but not the principle this lesson is drilling.";
    } else {
      comment = `${prettySq(playedUci)} isn't the idea — this lesson wants a clearer teaching move.`;
    }

    if (leftInCheck) {
      comment = "That move leaves you in trouble — illegal in spirit even if the UI allowed a reply path. Take back.";
    }

    const fixes = [];
    if (puzzle?.hint) fixes.push(`Correction: ${puzzle.hint}`);
    if (bestUci && bestUci.length >= 4) {
      fixes.push(`Try looking at ${prettySq(bestUci.slice(0, 4))} (Hint highlights it).`);
    } else {
      fixes.push("Tap Hint to highlight the teaching move, or Take back and try again.");
    }
    if (pits[0]) fixes.push(`Watch out: ${pits[0]}`);
    if (puzzle?.goal === "mate") {
      fixes.push("Ask: which move leaves the enemy king with zero safe squares?");
    } else {
      fixes.push("Ask: what principle is this lesson named for — then play that.");
    }

    return { comment, fixes: fixes.slice(0, 4) };
  }

  function applyHintSquares(fr, fc, tr, tc, label) {
    hintSquares = { fr, fc, tr, tc };
    hintEl.textContent = label || `Hint: look at ${sqName(fr, fc)}`;
    selected = [fr, fc];
    legal = legalMoves(fr, fc);
    draw();
  }

  function pickPuzzle() {
    const L = lessonByN(lessonN);
    return { ...L, id: L.n, d: L.n, phase: L.book, name: L.title };
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
    const ui = uiIndexFromGlobal(lessonN);
    if (lessonVal) lessonVal.textContent = String(ui);
    syncLessonRange();
    if (solvedEl) solvedEl.textContent = String(solved);
    if (streakEl) streakEl.textContent = String(streak);
    if (progressEl) progressEl.textContent = `${completed.size}/100`;
    if (btnBack) btnBack.disabled = history.length === 0;
    const lockPlay = complete || busy || !puzzle;
    if (btnHint) btnHint.disabled = lockPlay;
    if (btnAi) btnAi.disabled = lockPlay;
    updatePuzzleNamePanel();
    if (puzzle && !complete) {
      statusEl.textContent = `Lesson ${puzzle.n} · ${puzzle.title}`;
    } else if (complete) {
      /* keep */
    } else if (engineFailed) {
      statusEl.textContent = "Engine unavailable";
    } else if (!engineReady) {
      statusEl.textContent = "Starting…";
    }
    if (!engineReady && !engineFailed) levelMeta.textContent = levelBlurb() + " · engine warming";
    else if (engineFailed) levelMeta.textContent = levelBlurb() + " · offline checks";
    else levelMeta.textContent = levelBlurb() + " · Stockfish lite ready";
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
      history = [];
      clearCoachNote();

      puzzle = pickPuzzle();
      const parsed = parseFen(puzzle.fen);
      board = parsed.board;
      turn = parsed.turn;
      castle = parsed.castle;
      ep = parsed.ep;
      playerColor = turn;
      flip = playerColor === "b";
      lastMove = null;

      hintEl.textContent = puzzle.hint || (
        puzzle.goal === "mate" ? `${puzzle.title} — force checkmate` : `${puzzle.title} — find the best idea`
      );
      updateLessonSelect();
      updateChrome();
      fit();
      draw();
      hideOverlay();
    } catch (err) {
      console.warn("loadLesson failed", err);
      showOverlay("Lesson error\nTap Next", "bad");
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

  async function resolveTeachingUci() {
    let best = teachingMoveUci();
    if (!best && engineReady && !engineFailed) {
      try {
        best = await askBest(boardToFen());
      } catch (err) {
        console.warn(err);
      }
    }
    if (!best) {
      const local = localHintMove();
      if (local) best = sqName(local[0], local[1]) + sqName(local[2], local[3]);
    }
    return best && best.length >= 4 ? best.slice(0, 4) : null;
  }

  async function onPlayerMove(fr, fc, tr, tc) {
    if (busy || complete || turn !== playerColor) return;
    busy = true;
    updateChrome();
    const uci = sqName(fr, fc) + sqName(tr, tc);
    const beforeSnap = cloneState();

    const best = await resolveTeachingUci();

    pushHistory();
    applyMove(fr, fc, tr, tc);
    selected = null;
    legal = [];
    hintSquares = null;
    hideOverlay();
    draw();

    const okBest = best && best === uci.slice(0, 4);
    const taughtHit = !!(puzzle?.move && puzzle.move.slice(0, 4) === uci.slice(0, 4));

    if (isMate()) {
      const praise = evaluateGoodMove(uci, { mated: true, taught: taughtHit || okBest });
      await finishSolved(winnerSide(), praise);
      busy = false;
      updateChrome();
      return;
    }

    if (puzzle && puzzle.goal === "win" && okBest) {
      const praise = evaluateGoodMove(uci, { taught: taughtHit || okBest });
      await finishSolved(playerColor, praise);
      busy = false;
      updateChrome();
      return;
    }

    // Correct step in a multi-move mate lesson
    if (puzzle && puzzle.goal === "mate" && okBest) {
      const praise = evaluateGoodMove(uci, { progress: true, taught: taughtHit });
      showCoachNote({
        tone: "good",
        stars: praise.stars,
        comment: praise.comment,
        points: praise.points,
      });
      hintEl.textContent = `Very good · keep going · ${puzzle.hint || "find the finish"}`;
    } else if (puzzle && !okBest) {
      // Wrong move → coach comment + correction tips (right panel)
      const { comment, fixes } = explainWrongMove(uci, best, fr, fc, tr, tc, beforeSnap);
      showCoachNote({
        tone: "bad",
        stars: 2,
        comment,
        points: fixes,
      });
      hintEl.textContent = best
        ? `Not yet · try ${prettySq(best)} · Hint / Take back`
        : "Not yet · Hint, Take back, or keep exploring";
      if (best && best.length >= 4) {
        const [bfr, bfc, btr, btc] = parseUci(best);
        hintSquares = { fr: bfr, fc: bfc, tr: btr, tc: btc };
      }
    } else {
      clearCoachNote();
    }

    await playOpponentReply();

    if (isMate()) {
      streak = 0;
      const win = winnerSide();
      showOverlay(`${sideName(win)} wins\nCheckmate`, "bad");
      hintEl.textContent = `${sideName(win)} wins by checkmate · Take back or Next`;
      statusEl.textContent = `${sideName(win)} wins · checkmate`;
      showCoachNote({
        tone: "bad",
        stars: 1,
        comment: `${sideName(win)} just checkmated you — that line wasn't safe.`,
        points: [
          "Take back and try the teaching move.",
          puzzle?.hint ? `Correction: ${puzzle.hint}` : "Tap Hint before you move.",
          best ? `Look at ${prettySq(best)}.` : "Use Hint to see the key idea.",
        ],
      });
      busy = false;
      updateChrome();
      return;
    }

    if (allLegal(turn).length === 0) {
      hintEl.textContent = "No moves left · Take back";
      hideOverlay();
      busy = false;
      updateChrome();
      return;
    }

    // Safety: never leave controls locked on the opponent's turn
    if (turn !== playerColor) {
      await playOpponentReply();
    }

    if (puzzle && puzzle.goal === "mate" && !okBest) {
      /* coach note already set */
    } else if (!(puzzle && puzzle.goal === "win")) {
      hintEl.textContent = puzzle && puzzle.hint ? puzzle.hint : "Your move · Hint uses this position";
    }
    busy = false;
    updateChrome();
  }

  async function finishSolved(winSide = playerColor, praise = null) {
    complete = true;
    solved += 1;
    streak += 1;
    if (puzzle) completed.add(puzzle.n);
    updateLessonSelect();
    updateChrome();
    const label = puzzle && puzzle.goal === "mate"
      ? `${sideName(winSide)} wins\nCheckmate`
      : "Nice idea\nLesson clear";
    showOverlay(label, "ok");
    const nxt = Math.min(100, (puzzle ? puzzle.n : lessonN) + 1);
    if (praise) {
      showCoachNote({
        tone: "good",
        stars: praise.stars,
        comment: praise.comment,
        points: praise.points,
      });
      hintEl.textContent = `${praise.grade} ${praise.stars}/5 · Next → lesson ${nxt}`;
    } else {
      clearCoachNote();
      hintEl.textContent = puzzle
        ? `${puzzle.teach} · Next → lesson ${nxt}`
        : "Next lesson";
    }
    statusEl.textContent = `Solved · ${completed.size}/100 done`;
  }

  async function giveHint() {
    if (complete || busy || !puzzle) return;
    if (turn !== playerColor) {
      await playOpponentReply();
      if (turn !== playerColor) {
        hintEl.textContent = "Opponent to move · Take back";
        updateChrome();
        return;
      }
    }
    busy = true;
    updateChrome();
    hintEl.textContent = "Thinking…";
    try {
      let best = teachingMoveUci();
      if (!best && engineReady && !engineFailed) {
        try {
          best = await askBest(boardToFen());
        } catch (err) {
          console.warn("hint engine", err);
        }
      }
      if (best && best.length >= 4) {
        const [fr, fc, tr, tc] = parseUci(best);
        const ok = allLegal(playerColor).some(
          ([a, b, c, d]) => a === fr && b === fc && c === tr && d === tc
        );
        if (ok) {
          applyHintSquares(fr, fc, tr, tc, puzzle.hint ? `Hint: ${puzzle.hint}` : undefined);
          busy = false;
          updateChrome();
          return;
        }
      }
      const local = localHintMove();
      if (local) {
        applyHintSquares(
          local[0],
          local[1],
          local[2],
          local[3],
          puzzle.hint ? `Hint: ${puzzle.hint}` : `Hint: look at ${sqName(local[0], local[1])}`
        );
      } else {
        hintEl.textContent = "No legal moves · Take back";
      }
    } catch (err) {
      console.warn(err);
      hintEl.textContent = "Hint failed · try again";
    }
    busy = false;
    updateChrome();
  }

  async function playAiMove() {
    if (complete || busy || !puzzle) return;
    if (turn !== playerColor) {
      await playOpponentReply();
      if (turn !== playerColor) {
        hintEl.textContent = "Opponent to move · Take back";
        updateChrome();
        return;
      }
    }
    busy = true;
    updateChrome();
    hintEl.textContent = "AI moving…";
    try {
      let move = null;
      const taught = teachingMoveUci();
      if (taught) {
        const parsed = parseUci(taught);
        const ok = allLegal(playerColor).some(
          ([a, b, c, d]) => a === parsed[0] && b === parsed[1] && c === parsed[2] && d === parsed[3]
        );
        if (ok) move = parsed;
      }
      if (!move && engineReady && !engineFailed) {
        try {
          const best = await askBest(boardToFen());
          if (best && best.length >= 4) {
            const parsed = parseUci(best);
            const ok = allLegal(playerColor).some(
              ([a, b, c, d]) =>
                a === parsed[0] && b === parsed[1] && c === parsed[2] && d === parsed[3]
            );
            if (ok) move = parsed;
          }
        } catch (err) {
          console.warn("ai move", err);
        }
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
      hintEl.textContent = "AI found no move · Take back";
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
    // Leave gutters for a–h / 1–8 labels beside the board
    const gutter = Math.max(20, Math.floor(Math.min(w, h) * 0.045));
    size = Math.floor((Math.min(w, h) - gutter * 2) * 0.9 / 8);
    const boardPx = size * 8;
    ox = Math.floor((w - boardPx) / 2) + Math.floor(gutter * 0.35);
    oy = Math.floor((h - boardPx) / 2) - Math.floor(gutter * 0.2);
  }

  function drawCoordinates() {
    const fontPx = Math.max(12, Math.floor(size * 0.3));
    ctx.save();
    ctx.font = `700 ${fontPx}px "Space Grotesk", sans-serif`;
    ctx.fillStyle = "rgba(230, 238, 242, 0.78)";

    // Files a–h under the board (follow flip)
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let c = 0; c < 8; c++) {
      const [, dc] = displayRC(0, c);
      const x = ox + dc * size + size / 2;
      const y = oy + size * 8 + Math.max(4, Math.floor(fontPx * 0.25));
      ctx.fillText(String.fromCharCode(97 + c), x, y);
    }

    // Ranks 8–1 to the left of the board (follow flip)
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
    const bookBtn = e.target.closest(".book-btn");
    if (bookBtn) {
      setBookFilter(bookBtn.dataset.book);
      return;
    }
    const btn = e.target.closest(".step-btn");
    if (!btn) return;
    const dir = Number(btn.dataset.dir);
    setLesson(uiIndexFromGlobal(lessonN) + dir * (e.shiftKey ? 10 : 1));
  });
  if (lessonRange) {
    lessonRange.addEventListener("input", () => setLesson(Number(lessonRange.value)));
  }
  if (lessonSelect) {
    lessonSelect.addEventListener("change", () => {
      const n = Number(lessonSelect.value);
      setLesson(bookFilter === "all" ? n : uiIndexFromGlobal(n));
    });
  }
  btnNext.addEventListener("click", () => {
    const list = lessonsInFilter();
    if (!list.length) return;
    if (bookFilter === "all") {
      // All: jump to a random lesson (avoid repeating current when possible).
      let pick = list[Math.floor(Math.random() * list.length)];
      if (list.length > 1) {
        let guard = 0;
        while (pick.n === lessonN && guard++ < 8) {
          pick = list[Math.floor(Math.random() * list.length)];
        }
      }
      setLesson(pick.n);
      return;
    }
    const i = list.findIndex((l) => l.n === lessonN);
    const nextIdx = (Math.max(0, i) + 1) % list.length;
    setLesson(nextIdx + 1);
  });
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
      btnNext.click();
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

  updateLessonSelect();
  requestAnimationFrame(() => {
    fit();
    draw();
    loadPuzzle();
    initEngine();
  });
})();
