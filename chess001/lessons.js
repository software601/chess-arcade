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

  const ENGINE_JS = "/chess001/stockfish-19-lite-single.js";
  const ENGINE_WASM = "/chess001/stockfish-19-lite-single.wasm";
  const GLYPH = {
    wk: "♔", wq: "♕", wr: "♖", wb: "♗", wn: "♘", wp: "♙",
    bk: "♚", bq: "♛", br: "♜", bb: "♝", bn: "♞", bp: "♟",
  };

  /** 100 beginning lessons (Fischer / Seirawan / Capablanca style). Original drills. */
  const LESSONS = [
    {
      "n": 1,
      "book": "fischer",
      "title": "Queen Checkmate (1)",
      "teach": "The queen attacks every square around the enemy king. Deliver mate on the back rank.",
      "hint": "Look at the 7th/8th rank.",
      "fen": "7k/5Q2/6K1/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate \u2014 Deliver checkmate.",
      "desc": "The queen attacks every square around the enemy king. Deliver mate on the back rank. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Keep the queen safe from the enemy king \u2014 check from a distance when needed."
      ]
    },
    {
      "n": 2,
      "book": "fischer",
      "title": "Queen Checkmate (2)",
      "teach": "A king + queen team mates by cutting escape squares, then checking.",
      "hint": "Queen next to the king on the edge.",
      "fen": "6k1/6Q1/5K2/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate \u2014 Deliver checkmate.",
      "desc": "A king + queen team mates by cutting escape squares, then checking. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Keep the queen safe from the enemy king \u2014 check from a distance when needed."
      ]
    },
    {
      "n": 3,
      "book": "fischer",
      "title": "Queen Checkmate (3)",
      "teach": "Corner and edge kings have fewer escapes \u2014 use that.",
      "hint": "Slide the queen to the edge file.",
      "fen": "5k2/8/4KQ2/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate \u2014 Deliver checkmate.",
      "desc": "Corner and edge kings have fewer escapes \u2014 use that. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Keep the queen safe from the enemy king \u2014 check from a distance when needed."
      ]
    },
    {
      "n": 4,
      "book": "fischer",
      "title": "Queen Checkmate (4)",
      "teach": "Keep your king supporting the queen so she can sit safely near the enemy.",
      "hint": "Queen to b7 or a7.",
      "fen": "k7/8/1Q6/8/8/8/8/K7 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate \u2014 Deliver checkmate.",
      "desc": "Keep your king supporting the queen so she can sit safely near the enemy. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Keep the queen safe from the enemy king \u2014 check from a distance when needed."
      ]
    },
    {
      "n": 5,
      "book": "fischer",
      "title": "Queen vs Castled King",
      "teach": "Pawns in front of a castled king can block its own escape.",
      "hint": "Queen to the back rank or g-file.",
      "fen": "7k/6pp/8/8/8/8/6Q1/6K1 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate \u2014 Deliver checkmate.",
      "desc": "Pawns in front of a castled king can block its own escape. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Keep the queen safe from the enemy king \u2014 check from a distance when needed."
      ]
    },
    {
      "n": 6,
      "book": "fischer",
      "title": "Close-Range Queen Mate",
      "teach": "When kings face each other, the queen mates from a knight\u2019s move away\u2026 or closer with support.",
      "hint": "Put the queen on g2 or h2.",
      "fen": "8/8/8/8/8/5K1k/6Q1/8 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate \u2014 Deliver checkmate.",
      "desc": "When kings face each other, the queen mates from a knight\u2019s move away\u2026 or closer with support. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Keep the queen safe from the enemy king \u2014 check from a distance when needed."
      ]
    },
    {
      "n": 7,
      "book": "fischer",
      "title": "Driving the King",
      "teach": "First restrict, then mate. Here the mate is already one move away.",
      "hint": "Queen to the h-file.",
      "fen": "8/8/8/8/8/4K2k/8/6Q1 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate \u2014 Deliver checkmate.",
      "desc": "First restrict, then mate. Here the mate is already one move away. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Keep the queen safe from the enemy king \u2014 check from a distance when needed."
      ]
    },
    {
      "n": 8,
      "book": "fischer",
      "title": "Queen Through Pawns",
      "teach": "Find the open line into the king\u2019s pocket.",
      "hint": "Check along the file/diagonal that hits g7/h8.",
      "fen": "8/5pk1/5p2/8/8/8/5Q2/6K1 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate \u2014 Deliver checkmate.",
      "desc": "Find the open line into the king\u2019s pocket. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Keep the queen safe from the enemy king \u2014 check from a distance when needed."
      ]
    },
    {
      "n": 9,
      "book": "fischer",
      "title": "Smother Idea",
      "teach": "When the king\u2019s own pieces steal its squares, one check can finish it.",
      "hint": "Queen into the crowded corner.",
      "fen": "6rk/6pp/8/8/8/8/5Q2/6K1 w - - 0 1",
      "goal": "mate",
      "theme": "Smothered idea",
      "about": "Smothered idea \u2014 Deliver checkmate.",
      "desc": "When the king\u2019s own pieces steal its squares, one check can finish it. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "The mating net only works if escape squares stay covered."
      ]
    },
    {
      "n": 10,
      "book": "fischer",
      "title": "Queen Mate Drill",
      "teach": "Same pattern: edge king, supported queen.",
      "hint": "Queen to the 7th or 8th.",
      "fen": "7k/5Q2/7K/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate \u2014 Deliver checkmate.",
      "desc": "Same pattern: edge king, supported queen. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Keep the queen safe from the enemy king \u2014 check from a distance when needed."
      ]
    },
    {
      "n": 11,
      "book": "fischer",
      "title": "Queen Mate Drill (2)",
      "teach": "Keep practicing: mate in one with king + queen.",
      "hint": "Check from the f-file or h-file.",
      "fen": "8/8/8/8/8/7k/5Q2/6K1 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate \u2014 Deliver checkmate.",
      "desc": "Keep practicing: mate in one with king + queen. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Keep the queen safe from the enemy king \u2014 check from a distance when needed."
      ]
    },
    {
      "n": 12,
      "book": "fischer",
      "title": "Queen Mate Drill (3)",
      "teach": "Place the queen so every flight square is covered.",
      "hint": "Queen adjacent on the file.",
      "fen": "8/8/8/8/6Qk/8/5K2/8 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate \u2014 Deliver checkmate.",
      "desc": "Place the queen so every flight square is covered. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Keep the queen safe from the enemy king \u2014 check from a distance when needed."
      ]
    },
    {
      "n": 13,
      "book": "fischer",
      "title": "Rook Mate Intro",
      "teach": "A rook mates like a queen on ranks and files \u2014 use the edge.",
      "hint": "Rook to the 8th rank.",
      "fen": "7k/8/6KR/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Rook mate",
      "about": "Rook mate \u2014 Deliver checkmate.",
      "desc": "A rook mates like a queen on ranks and files \u2014 use the edge. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Don't put the rook where the king can capture it."
      ]
    },
    {
      "n": 14,
      "book": "fischer",
      "title": "Rook on the A-file",
      "teach": "Box the king against the rim with rook + king.",
      "hint": "Rook check on the a-file or 7th.",
      "fen": "k7/8/1K5R/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Rook mate",
      "about": "Rook mate \u2014 Deliver checkmate.",
      "desc": "Box the king against the rim with rook + king. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Don't put the rook where the king can capture it."
      ]
    },
    {
      "n": 15,
      "book": "fischer",
      "title": "Back-Rank Mate",
      "teach": "When the enemy king is trapped behind its own pawns, a rook on the back rank ends the game.",
      "hint": "Rook to a8.",
      "fen": "6k1/5ppp/8/8/8/8/8/R3K3 w Q - 0 1",
      "goal": "mate",
      "theme": "Back-rank",
      "about": "Back-rank mate \u2014 the king is trapped behind its own pawns.",
      "desc": "When the enemy king has no luft (escape square), a rook or queen on the back rank mates instantly. Classic beginner pattern.",
      "pitfalls": [
        "If they have h6/g6 luft, the back-rank mate fails.",
        "Don't leave your own back rank soft while hunting theirs.",
        "Check that the mating square isn't defended."
      ]
    },
    {
      "n": 16,
      "book": "fischer",
      "title": "Back-Rank Mate (2)",
      "teach": "Always ask: is the back rank soft?",
      "hint": "Rook (or queen) to the 8th.",
      "fen": "r5k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
      "goal": "mate",
      "theme": "Back-rank",
      "about": "Back-rank \u2014 Deliver checkmate.",
      "desc": "Always ask: is the back rank soft?. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Don't put the rook where the king can capture it."
      ]
    },
    {
      "n": 17,
      "book": "fischer",
      "title": "Back-Rank Mate (3)",
      "teach": "Same motif from the a-file.",
      "hint": "Rook lifts to a8.",
      "fen": "6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1",
      "goal": "mate",
      "theme": "Back-rank",
      "about": "Back-rank \u2014 Deliver checkmate.",
      "desc": "Same motif from the a-file. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Don't put the rook where the king can capture it."
      ]
    },
    {
      "n": 18,
      "book": "fischer",
      "title": "Ladder Mate Start",
      "teach": "Two rooks (or rook + queen) climb ranks like a ladder.",
      "hint": "Check on the 7th, then the 8th later.",
      "fen": "7k/8/6R1/8/8/8/8/R5K1 w - - 0 1",
      "goal": "mate",
      "theme": "Ladder",
      "about": "Ladder mate \u2014 two heavy pieces climb rank by rank.",
      "desc": "Use two rooks (or rook + queen) to check on successive ranks, driving the king to the edge and mating.",
      "pitfalls": [
        "Keep each checking piece safe from the king.",
        "Don't check on a rank the king can capture from.",
        "Avoid accidental stalemate if the king is already boxed."
      ]
    },
    {
      "n": 19,
      "book": "fischer",
      "title": "Corridor Mate",
      "teach": "Rooks on open files cut the king\u2019s corridor.",
      "hint": "Double on the e-file or check from the rim.",
      "fen": "8/8/8/8/8/4k3/8/R3K2R w - - 0 1",
      "goal": "mate",
      "theme": "Corridor",
      "about": "Corridor \u2014 Deliver checkmate.",
      "desc": "Rooks on open files cut the king\u2019s corridor. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check."
      ]
    },
    {
      "n": 20,
      "book": "fischer",
      "title": "Rook Net",
      "teach": "Coordinate rook + king so the enemy has no safe square.",
      "hint": "Rook to the edge file next to the king.",
      "fen": "8/8/8/8/8/k1K5/8/1R6 w - - 0 1",
      "goal": "mate",
      "theme": "Rook mate",
      "about": "Rook mate \u2014 Deliver checkmate.",
      "desc": "Coordinate rook + king so the enemy has no safe square. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Don't put the rook where the king can capture it."
      ]
    },
    {
      "n": 21,
      "book": "fischer",
      "title": "Rook Net (2)",
      "teach": "Cut the king off, then checkmate.",
      "hint": "Rook to c-file check.",
      "fen": "8/8/8/8/8/k1K5/8/2R5 w - - 0 1",
      "goal": "mate",
      "theme": "Rook mate",
      "about": "Rook mate \u2014 Deliver checkmate.",
      "desc": "Cut the king off, then checkmate. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Don't put the rook where the king can capture it."
      ]
    },
    {
      "n": 22,
      "book": "fischer",
      "title": "Anastasia Pattern",
      "teach": "Knight + rook: the knight covers escape squares the rook cannot.",
      "hint": "Rook to the e-file/back rank with knight covering.",
      "fen": "5rk1/5ppp/8/8/8/2N5/5PPP/4R1K1 w - - 0 1",
      "goal": "mate",
      "theme": "Pattern mate",
      "about": "Pattern mate \u2014 Deliver checkmate.",
      "desc": "Knight + rook: the knight covers escape squares the rook cannot. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "The mating net only works if escape squares stay covered."
      ]
    },
    {
      "n": 23,
      "book": "fischer",
      "title": "Arabian Mate",
      "teach": "Knight on f6/g6 ideas with a rook on the 7th/8th \u2014 classic mating net.",
      "hint": "Rook to the 8th with knight covering g8/h8.",
      "fen": "6k1/5R2/6N1/8/8/8/8/6K1 w - - 0 1",
      "goal": "mate",
      "theme": "Arabian",
      "about": "Arabian \u2014 Deliver checkmate.",
      "desc": "Knight on f6/g6 ideas with a rook on the 7th/8th \u2014 classic mating net. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "The mating net only works if escape squares stay covered."
      ]
    },
    {
      "n": 24,
      "book": "fischer",
      "title": "Mate in Two (Queen)",
      "teach": "Sometimes you check first to force the king, then mate.",
      "hint": "Give a checking move that shrinks the box.",
      "fen": "8/8/8/8/8/4K2k/8/5Q2 w - - 0 1",
      "goal": "mate",
      "theme": "Mate in 2",
      "about": "Mate in 2 \u2014 Deliver checkmate.",
      "desc": "Sometimes you check first to force the king, then mate. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Keep the queen safe from the enemy king \u2014 check from a distance when needed."
      ]
    },
    {
      "n": 25,
      "book": "fischer",
      "title": "Mate in Two (Rook)",
      "teach": "Force the king to the rim, then deliver.",
      "hint": "Check that leaves only one flight.",
      "fen": "8/8/8/8/8/5K1k/8/6R1 w - - 0 1",
      "goal": "mate",
      "theme": "Mate in 2",
      "about": "Mate in 2 \u2014 Deliver checkmate.",
      "desc": "Force the king to the rim, then deliver. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Don't put the rook where the king can capture it."
      ]
    },
    {
      "n": 26,
      "book": "fischer",
      "title": "Mate in Two Drill",
      "teach": "Programmed learning: find the forcing check.",
      "hint": "Don\u2019t move the king first \u2014 use the heavy piece.",
      "fen": "8/8/8/8/4K3/7k/8/5Q2 w - - 0 1",
      "goal": "mate",
      "theme": "Mate in 2",
      "about": "Mate in 2 \u2014 Deliver checkmate.",
      "desc": "Programmed learning: find the forcing check. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "The first move must be forcing \u2014 quiet moves often let the defense reset."
      ]
    },
    {
      "n": 27,
      "book": "fischer",
      "title": "Two-Rook Ladder",
      "teach": "Climb: check on one rank, then the next.",
      "hint": "Rook to the 7th rank checking.",
      "fen": "7k/8/8/8/8/8/6R1/R5K1 w - - 0 1",
      "goal": "mate",
      "theme": "Ladder",
      "about": "Ladder \u2014 Deliver checkmate.",
      "desc": "Climb: check on one rank, then the next. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Don't put the rook where the king can capture it."
      ]
    },
    {
      "n": 28,
      "book": "fischer",
      "title": "Mate in Two (Edge)",
      "teach": "Kings on the edge fall faster.",
      "hint": "Queen check that covers the flight square.",
      "fen": "8/8/8/8/8/1K5k/8/7Q w - - 0 1",
      "goal": "mate",
      "theme": "Mate in 2",
      "about": "Mate in 2 \u2014 Deliver checkmate.",
      "desc": "Kings on the edge fall faster. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "The first move must be forcing \u2014 quiet moves often let the defense reset."
      ]
    },
    {
      "n": 29,
      "book": "fischer",
      "title": "Shrinking the Box",
      "teach": "Queen checks that take squares away from the king.",
      "hint": "Check from a distance first.",
      "fen": "8/8/8/8/5K1k/8/6Q1/8 w - - 0 1",
      "goal": "mate",
      "theme": "Mate in 2",
      "about": "Mate in 2 \u2014 Deliver checkmate.",
      "desc": "Queen checks that take squares away from the king. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "The first move must be forcing \u2014 quiet moves often let the defense reset."
      ]
    },
    {
      "n": 30,
      "book": "fischer",
      "title": "Ladder Climb",
      "teach": "Two rooks: keep them safe from the king while checking.",
      "hint": "Check far enough that the king cannot capture.",
      "fen": "8/7k/8/8/8/8/1R6/1R4K1 w - - 0 1",
      "goal": "mate",
      "theme": "Ladder",
      "about": "Ladder \u2014 Deliver checkmate.",
      "desc": "Two rooks: keep them safe from the king while checking. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Don't put the rook where the king can capture it."
      ]
    },
    {
      "n": 31,
      "book": "fischer",
      "title": "Mate in Three Intro",
      "teach": "Plan: restrict \u2192 force \u2192 mate. First move still matters most.",
      "hint": "Start by cutting the king off a rank/file.",
      "fen": "8/8/8/8/8/4K2k/5Q2/8 w - - 0 1",
      "goal": "mate",
      "theme": "Mate in 3",
      "about": "Mate in 3 \u2014 Deliver checkmate.",
      "desc": "Plan: restrict \u2192 force \u2192 mate. First move still matters most. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "The first move must be forcing \u2014 quiet moves often let the defense reset."
      ]
    },
    {
      "n": 32,
      "book": "fischer",
      "title": "Rook Technique",
      "teach": "Use the rook to cut the board in half.",
      "hint": "Cut the king to the edge before mating.",
      "fen": "8/8/8/8/5K2/7k/8/6R1 w - - 0 1",
      "goal": "mate",
      "theme": "Mate in 3",
      "about": "Mate in 3 \u2014 Deliver checkmate.",
      "desc": "Use the rook to cut the board in half. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Don't put the rook where the king can capture it."
      ]
    },
    {
      "n": 33,
      "book": "fischer",
      "title": "Queen Technique",
      "teach": "King opposition + queen checks = short mate.",
      "hint": "Bring the king closer while checking.",
      "fen": "8/8/8/7k/5K2/8/6Q1/8 w - - 0 1",
      "goal": "mate",
      "theme": "Mate in 3",
      "about": "Mate in 3 \u2014 Deliver checkmate.",
      "desc": "King opposition + queen checks = short mate. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Keep the queen safe from the enemy king \u2014 check from a distance when needed."
      ]
    },
    {
      "n": 34,
      "book": "fischer",
      "title": "Deep Net",
      "teach": "Don\u2019t rush a stalemate \u2014 leave a flight until mate is ready.",
      "hint": "Avoid stalemate; keep giving checks that progress.",
      "fen": "8/8/8/8/8/2K4k/8/3Q4 w - - 0 1",
      "goal": "mate",
      "theme": "Mating net",
      "about": "Mating net \u2014 Deliver checkmate.",
      "desc": "Don\u2019t rush a stalemate \u2014 leave a flight until mate is ready. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check."
      ]
    },
    {
      "n": 35,
      "book": "fischer",
      "title": "Avoid Stalemate",
      "teach": "With king + queen, stalemate is the main trap for beginners.",
      "hint": "Give a check, or leave the king a square.",
      "fen": "8/8/8/8/5K2/6k1/8/5Q2 w - - 0 1",
      "goal": "mate",
      "theme": "Mate in 4",
      "about": "Mate in 4 \u2014 Deliver checkmate.",
      "desc": "With king + queen, stalemate is the main trap for beginners. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "The first move must be forcing \u2014 quiet moves often let the defense reset."
      ]
    },
    {
      "n": 36,
      "book": "fischer",
      "title": "Corner Drive",
      "teach": "Drive toward a corner, then mate.",
      "hint": "Force toward a8/h8/a1/h1.",
      "fen": "8/8/8/8/8/5k2/8/4KQ2 w - - 0 1",
      "goal": "mate",
      "theme": "K+Q",
      "about": "K+Q \u2014 Deliver checkmate.",
      "desc": "Drive toward a corner, then mate. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Stalemate is the classic trap when the lone king is on the edge."
      ]
    },
    {
      "n": 37,
      "book": "fischer",
      "title": "Near Mate",
      "teach": "One accurate queen move ends it.",
      "hint": "Find the safe checking square.",
      "fen": "8/8/8/8/8/7k/5Q2/5K2 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate \u2014 Deliver checkmate.",
      "desc": "One accurate queen move ends it. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Keep the queen safe from the enemy king \u2014 check from a distance when needed."
      ]
    },
    {
      "n": 38,
      "book": "fischer",
      "title": "Scholar Pattern Prep",
      "teach": "Early mates punish unused pieces and open diagonals to f7/h7.",
      "hint": "Look at the diagonal into the king.",
      "fen": "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 4",
      "goal": "mate",
      "theme": "Scholar idea",
      "about": "Scholar idea \u2014 Deliver checkmate.",
      "desc": "Early mates punish unused pieces and open diagonals to f7/h7. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Don't weaken f7/f2 early without development."
      ]
    },
    {
      "n": 39,
      "book": "fischer",
      "title": "Fool\u2019s Mate Pattern",
      "teach": "Weakening f- and g-pawns early can lose instantly.",
      "hint": "Queen to h5 mates.",
      "fen": "rnbqkbnr/ppppp2p/5p2/6p1/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
      "goal": "mate",
      "theme": "Fool's mate",
      "about": "Fool's mate \u2014 Deliver checkmate.",
      "desc": "Weakening f- and g-pawns early can lose instantly. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Don't weaken f7/f2 early without development."
      ]
    },
    {
      "n": 40,
      "book": "fischer",
      "title": "Legal-Style Alert",
      "teach": "Loose pieces + unsafe king = tactical finish. Look for discovered ideas.",
      "hint": "Capture/check that opens a line.",
      "fen": "r2qkbnr/ppp2ppp/2np4/4N3/2B1P1b1/8/PPPP1PPP/RNBQK2R w KQkq - 0 6",
      "goal": "mate",
      "theme": "Opening trap",
      "about": "Opening trap \u2014 Deliver checkmate.",
      "desc": "Loose pieces + unsafe king = tactical finish. Look for discovered ideas. Play the forcing move that ends the game. (Programmed mate patterns \u2014 force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Don't weaken f7/f2 early without development."
      ]
    },
    {
      "n": 41,
      "book": "seirawan",
      "title": "Force: Take the Free Piece",
      "teach": "Material (force) wins games. An undefended piece is a gift \u2014 collect it.",
      "hint": "Capture the hanging piece.",
      "fen": "4k3/8/8/3n4/8/8/4Q3/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Force",
      "about": "Force \u2014 Find the best teaching move.",
      "desc": "Material (force) wins games. An undefended piece is a gift \u2014 collect it. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Count attackers and defenders before you capture.",
        "Don't grab material that hangs your own piece next move."
      ]
    },
    {
      "n": 42,
      "book": "seirawan",
      "title": "Force: Trade Up",
      "teach": "Trade your lesser force for greater force when the capture is safe.",
      "hint": "Take the higher-value piece.",
      "fen": "4k3/8/8/3r4/8/3N4/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Force",
      "about": "Force \u2014 Find the best teaching move.",
      "desc": "Trade your lesser force for greater force when the capture is safe. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Count attackers and defenders before you capture.",
        "Don't grab material that hangs your own piece next move.",
        "Trade pieces when ahead, but keep enough pawns to win."
      ]
    },
    {
      "n": 43,
      "book": "seirawan",
      "title": "Force: Queen Hanging",
      "teach": "Always ask: is anything en prise? Count attackers vs defenders.",
      "hint": "Take the unprotected queen.",
      "fen": "4k3/8/8/3q4/8/8/3R4/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Force",
      "about": "Force \u2014 Find the best teaching move.",
      "desc": "Always ask: is anything en prise? Count attackers vs defenders. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Keep the queen safe from the enemy king \u2014 check from a distance when needed.",
        "Count attackers and defenders before you capture.",
        "Don't grab material that hangs your own piece next move."
      ]
    },
    {
      "n": 44,
      "book": "seirawan",
      "title": "Force: Equal Trade?",
      "teach": "Don\u2019t trade your queen for a rook unless you get more (mate/attack). Prefer winning force.",
      "hint": "Win material without giving equal value back.",
      "fen": "4k3/8/2q5/8/8/8/3R4/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Force",
      "about": "Force \u2014 Find the best teaching move.",
      "desc": "Don\u2019t trade your queen for a rook unless you get more (mate/attack). Prefer winning force. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Count attackers and defenders before you capture.",
        "Don't grab material that hangs your own piece next move.",
        "Trade pieces when ahead, but keep enough pawns to win."
      ]
    },
    {
      "n": 45,
      "book": "seirawan",
      "title": "Force: Two Attackers",
      "teach": "When you attack a piece twice and it is defended once, you win force.",
      "hint": "Capture with the right piece first.",
      "fen": "4k3/8/8/3n4/8/2N5/3R4/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Force",
      "about": "Force \u2014 Find the best teaching move.",
      "desc": "When you attack a piece twice and it is defended once, you win force. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Count attackers and defenders before you capture.",
        "Don't grab material that hangs your own piece next move."
      ]
    },
    {
      "n": 46,
      "book": "seirawan",
      "title": "Force: Safe Capture",
      "teach": "Before capturing, check that your piece isn\u2019t hanging afterward.",
      "hint": "Capture that stays defended or escapes.",
      "fen": "4k3/8/8/3b4/8/8/3Q4/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Force",
      "about": "Force \u2014 Find the best teaching move.",
      "desc": "Before capturing, check that your piece isn\u2019t hanging afterward. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Count attackers and defenders before you capture.",
        "Don't grab material that hangs your own piece next move."
      ]
    },
    {
      "n": 47,
      "book": "seirawan",
      "title": "Force: Knight Fork",
      "teach": "A knight fork hits two targets at once \u2014 often king and queen.",
      "hint": "Check that also attacks the queen.",
      "fen": "6k1/4q3/8/5N2/8/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Force",
      "about": "Force \u2014 Find the best teaching move.",
      "desc": "A knight fork hits two targets at once \u2014 often king and queen. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Count attackers and defenders before you capture.",
        "Don't grab material that hangs your own piece next move."
      ]
    },
    {
      "n": 48,
      "book": "seirawan",
      "title": "Force: Skewer Preview",
      "teach": "A skewer checks the king and wins the piece behind it.",
      "hint": "Rook check on the h-file.",
      "fen": "7k/7r/8/8/8/8/7R/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Force",
      "about": "Force \u2014 Find the best teaching move.",
      "desc": "A skewer checks the king and wins the piece behind it. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Count attackers and defenders before you capture.",
        "Don't grab material that hangs your own piece next move."
      ]
    },
    {
      "n": 49,
      "book": "seirawan",
      "title": "Time: Develop with Tempo",
      "teach": "Time = moves. Developing while threatening gains a free tempo.",
      "hint": "Develop and threaten at once.",
      "fen": "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
      "goal": "win",
      "theme": "Time",
      "about": "Time \u2014 Find the best teaching move.",
      "desc": "Time = moves. Developing while threatening gains a free tempo. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Avoid moving the same piece twice in the opening without a reason.",
        "Don't hunt pawns while your king is still in the center."
      ]
    },
    {
      "n": 50,
      "book": "seirawan",
      "title": "Time: Punish Sleeping Pieces",
      "teach": "If the opponent ignores development, open lines and strike.",
      "hint": "Open a center file or aim at f7.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Time",
      "about": "Time \u2014 Find the best teaching move.",
      "desc": "If the opponent ignores development, open lines and strike. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Avoid moving the same piece twice in the opening without a reason.",
        "Don't hunt pawns while your king is still in the center."
      ]
    },
    {
      "n": 51,
      "book": "seirawan",
      "title": "Time: Castle Early",
      "teach": "Getting the king safe is a tempo well spent \u2014 then your rook joins the fight.",
      "hint": "Castle (or prepare it) before launching.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5",
      "goal": "win",
      "theme": "Time",
      "about": "Time \u2014 Find the best teaching move.",
      "desc": "Getting the king safe is a tempo well spent \u2014 then your rook joins the fight. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Avoid moving the same piece twice in the opening without a reason.",
        "Don't hunt pawns while your king is still in the center."
      ]
    },
    {
      "n": 52,
      "book": "seirawan",
      "title": "Time: Don\u2019t Move Twice",
      "teach": "Moving the same piece again in the opening often wastes time. Prefer a new piece.",
      "hint": "Develop an undeveloped piece.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      "goal": "win",
      "theme": "Time",
      "about": "Time \u2014 Find the best teaching move.",
      "desc": "Moving the same piece again in the opening often wastes time. Prefer a new piece. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Avoid moving the same piece twice in the opening without a reason.",
        "Don't hunt pawns while your king is still in the center."
      ]
    },
    {
      "n": 53,
      "book": "seirawan",
      "title": "Time: Capture with Tempo",
      "teach": "Captures that also develop or check buy time.",
      "hint": "Capture that develops/checks.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
      "goal": "win",
      "theme": "Time",
      "about": "Time \u2014 Find the best teaching move.",
      "desc": "Captures that also develop or check buy time. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Avoid moving the same piece twice in the opening without a reason.",
        "Don't hunt pawns while your king is still in the center."
      ]
    },
    {
      "n": 54,
      "book": "seirawan",
      "title": "Time: Initiative",
      "teach": "Keep making threats so the opponent answers instead of developing.",
      "hint": "Make a concrete threat.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p1N1/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 0 5",
      "goal": "win",
      "theme": "Time",
      "about": "Time \u2014 Find the best teaching move.",
      "desc": "Keep making threats so the opponent answers instead of developing. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Avoid moving the same piece twice in the opening without a reason.",
        "Don't hunt pawns while your king is still in the center."
      ]
    },
    {
      "n": 55,
      "book": "seirawan",
      "title": "Time: Recapture Fast",
      "teach": "After a capture, recapture promptly unless there\u2019s a stronger tactic.",
      "hint": "Restore material balance correctly.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4N3/4P3/8/PPPP1PPP/RNBQKB1R b KQkq - 0 3",
      "goal": "win",
      "theme": "Time",
      "about": "Time \u2014 Find the best teaching move.",
      "desc": "After a capture, recapture promptly unless there\u2019s a stronger tactic. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Avoid moving the same piece twice in the opening without a reason.",
        "Don't hunt pawns while your king is still in the center."
      ]
    },
    {
      "n": 56,
      "book": "seirawan",
      "title": "Time: Race to Attack",
      "teach": "In opposite-side castling races, every tempo counts \u2014 hit first.",
      "hint": "Start the pawn storm or piece lift.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Time",
      "about": "Time \u2014 Find the best teaching move.",
      "desc": "In opposite-side castling races, every tempo counts \u2014 hit first. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Avoid moving the same piece twice in the opening without a reason.",
        "Don't hunt pawns while your king is still in the center."
      ]
    },
    {
      "n": 57,
      "book": "seirawan",
      "title": "Space: Claim the Center",
      "teach": "Space lets your pieces move; occupy or control d4/e4/d5/e5.",
      "hint": "Play a central pawn break or occupy the center.",
      "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "goal": "win",
      "theme": "Space",
      "about": "Space \u2014 Find the best teaching move.",
      "desc": "Space lets your pieces move; occupy or control d4/e4/d5/e5. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Don't overextend pawns you can't defend.",
        "An outpost is useless if the piece can be traded off for free."
      ]
    },
    {
      "n": 58,
      "book": "seirawan",
      "title": "Space: Cramp the Enemy",
      "teach": "Advance pawns to take squares from enemy pieces.",
      "hint": "Gain space with a pawn that isn\u2019t hanging.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Space",
      "about": "Space \u2014 Find the best teaching move.",
      "desc": "Advance pawns to take squares from enemy pieces. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Don't overextend pawns you can't defend.",
        "An outpost is useless if the piece can be traded off for free."
      ]
    },
    {
      "n": 59,
      "book": "seirawan",
      "title": "Space: Outpost Square",
      "teach": "A knight on a hole (no enemy pawn can kick it) dominates.",
      "hint": "Plant the knight on the outpost.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Space",
      "about": "Space \u2014 Find the best teaching move.",
      "desc": "A knight on a hole (no enemy pawn can kick it) dominates. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Don't overextend pawns you can't defend.",
        "An outpost is useless if the piece can be traded off for free."
      ]
    },
    {
      "n": 60,
      "book": "seirawan",
      "title": "Space: Don\u2019t Overextend",
      "teach": "Space is useless if your pawns become targets. Support advances.",
      "hint": "Advance only if you can defend the new weaknesses.",
      "fen": "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Space",
      "about": "Space \u2014 Find the best teaching move.",
      "desc": "Space is useless if your pawns become targets. Support advances. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Don't overextend pawns you can't defend.",
        "An outpost is useless if the piece can be traded off for free."
      ]
    },
    {
      "n": 61,
      "book": "seirawan",
      "title": "Space: Open Lines",
      "teach": "When you have more space, open files for rooks.",
      "hint": "Pawn break that opens a file.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/4P3/2N2N2/PPP1BPPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Space",
      "about": "Space \u2014 Find the best teaching move.",
      "desc": "When you have more space, open files for rooks. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Don't overextend pawns you can't defend.",
        "An outpost is useless if the piece can be traded off for free."
      ]
    },
    {
      "n": 62,
      "book": "seirawan",
      "title": "Space: Restrict Pieces",
      "teach": "Use pawns and pieces to deny the enemy good squares.",
      "hint": "Take away the knight\u2019s best hop.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Space",
      "about": "Space \u2014 Find the best teaching move.",
      "desc": "Use pawns and pieces to deny the enemy good squares. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Don't overextend pawns you can't defend.",
        "An outpost is useless if the piece can be traded off for free."
      ]
    },
    {
      "n": 63,
      "book": "seirawan",
      "title": "Space: Central Majority",
      "teach": "A pawn majority in the center can create a passed pawn later.",
      "hint": "Push the majority carefully.",
      "fen": "rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Space",
      "about": "Space \u2014 Find the best teaching move.",
      "desc": "A pawn majority in the center can create a passed pawn later. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Don't overextend pawns you can't defend.",
        "An outpost is useless if the piece can be traded off for free."
      ]
    },
    {
      "n": 64,
      "book": "seirawan",
      "title": "Pawns: Passed Pawn",
      "teach": "A passed pawn has no enemy pawns in its path \u2014 escort it.",
      "hint": "Advance or support the passer.",
      "fen": "8/8/8/3k4/8/3P4/8/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Pawns",
      "move": "d3d4",
      "about": "Passed pawn \u2014 escort it, don't abandon it.",
      "desc": "A passed pawn has a clear road to promotion. Advance it with king support so the enemy king can't blockade forever.",
      "pitfalls": [
        "Pushing too early can leave the pawn en prise.",
        "If the enemy king reaches the square in front, the pawn may be stuck.",
        "Don't wander with the king away from the passer."
      ]
    },
    {
      "n": 65,
      "book": "seirawan",
      "title": "Pawns: Outside Passer",
      "teach": "An outside passed pawn distracts the enemy king.",
      "hint": "Push the outside pawn to pull their king away.",
      "fen": "8/8/8/1k6/8/1P6/8/1K6 w - - 0 1",
      "goal": "win",
      "theme": "Pawns",
      "move": "b3b4",
      "about": "Pawns \u2014 Find the best teaching move.",
      "desc": "An outside passed pawn distracts the enemy king. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Don't push the pawn so far that the enemy king blockades it forever.",
        "King first \u2014 often the king must reach a key square before the pawn runs.",
        "Opposition matters: the wrong king move can turn a win into a draw."
      ]
    },
    {
      "n": 66,
      "book": "seirawan",
      "title": "Pawns: Isolated Pawn",
      "teach": "An isolated pawn can be a target \u2014 attack it or use the open files.",
      "hint": "Pressure the isolani or occupy the file.",
      "fen": "r1bq1rk1/pp3ppp/2n1pn2/3p4/3P4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Pawns",
      "about": "Pawns \u2014 Find the best teaching move.",
      "desc": "An isolated pawn can be a target \u2014 attack it or use the open files. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Don't push the pawn so far that the enemy king blockades it forever.",
        "King first \u2014 often the king must reach a key square before the pawn runs.",
        "Opposition matters: the wrong king move can turn a win into a draw."
      ]
    },
    {
      "n": 67,
      "book": "seirawan",
      "title": "Pawns: Doubled Pawns",
      "teach": "Doubled pawns are often weak; attack the front one.",
      "hint": "Target the doubled file.",
      "fen": "rnbqkbnr/pppp1ppp/8/8/4p3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      "goal": "win",
      "theme": "Pawns",
      "about": "Pawns \u2014 Find the best teaching move.",
      "desc": "Doubled pawns are often weak; attack the front one. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Don't push the pawn so far that the enemy king blockades it forever.",
        "King first \u2014 often the king must reach a key square before the pawn runs.",
        "Opposition matters: the wrong king move can turn a win into a draw."
      ]
    },
    {
      "n": 68,
      "book": "seirawan",
      "title": "Pawns: Pawn Break",
      "teach": "Break with \u2026c5/\u2026e5 (or c4/e4) to free your position.",
      "hint": "Play the freeing pawn break.",
      "fen": "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 0 5",
      "goal": "win",
      "theme": "Pawns",
      "about": "Pawns \u2014 Find the best teaching move.",
      "desc": "Break with \u2026c5/\u2026e5 (or c4/e4) to free your position. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Don't push the pawn so far that the enemy king blockades it forever.",
        "King first \u2014 often the king must reach a key square before the pawn runs.",
        "Opposition matters: the wrong king move can turn a win into a draw."
      ]
    },
    {
      "n": 69,
      "book": "seirawan",
      "title": "Pawns: Chain Base",
      "teach": "Attack the base of a pawn chain, not the tip.",
      "hint": "Hit the rearmost pawn of the chain.",
      "fen": "rnbqkbnr/pp2pppp/2p5/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3",
      "goal": "win",
      "theme": "Pawns",
      "about": "Pawns \u2014 Find the best teaching move.",
      "desc": "Attack the base of a pawn chain, not the tip. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Don't push the pawn so far that the enemy king blockades it forever.",
        "King first \u2014 often the king must reach a key square before the pawn runs.",
        "Opposition matters: the wrong king move can turn a win into a draw."
      ]
    },
    {
      "n": 70,
      "book": "seirawan",
      "title": "Pawns: Connected Passers",
      "teach": "Connected passed pawns protect each other \u2014 advance together.",
      "hint": "Push the pair; don\u2019t leave one hanging.",
      "fen": "8/8/8/3k4/8/3PP3/4K3/8 w - - 0 1",
      "goal": "win",
      "theme": "Pawns",
      "move": "d3d4",
      "about": "Pawns \u2014 Find the best teaching move.",
      "desc": "Connected passed pawns protect each other \u2014 advance together. Prefer the clean principle move over flashy side lines. (Core principles: force, time, space, and pawn structure)",
      "pitfalls": [
        "Don't push the pawn so far that the enemy king blockades it forever.",
        "King first \u2014 often the king must reach a key square before the pawn runs.",
        "Opposition matters: the wrong king move can turn a win into a draw."
      ]
    },
    {
      "n": 71,
      "book": "capablanca",
      "title": "K+Q vs K: Cut Off",
      "teach": "Use the queen like a barrier \u2014 cut the king to the edge before mating.",
      "hint": "Cut a rank/file away from the king.",
      "fen": "8/8/8/8/8/3K3k/8/4Q3 w - - 0 1",
      "goal": "win",
      "theme": "Endgame",
      "move": "e1e4",
      "about": "Endgame \u2014 Find the best teaching move.",
      "desc": "Use the queen like a barrier \u2014 cut the king to the edge before mating. Prefer the clean principle move over flashy side lines. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Stalemate is the classic trap when the lone king is on the edge.",
        "Cut the king off before delivering mate \u2014 don't rush."
      ]
    },
    {
      "n": 72,
      "book": "capablanca",
      "title": "K+Q vs K: Opposition",
      "teach": "Bring your king to oppose theirs; the queen alone rarely mates without help.",
      "hint": "Improve the king.",
      "fen": "8/8/8/8/8/4k3/8/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Endgame",
      "about": "Endgame \u2014 Find the best teaching move.",
      "desc": "Bring your king to oppose theirs; the queen alone rarely mates without help. Prefer the clean principle move over flashy side lines. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Don't push the pawn so far that the enemy king blockades it forever.",
        "King first \u2014 often the king must reach a key square before the pawn runs.",
        "Opposition matters: the wrong king move can turn a win into a draw."
      ]
    },
    {
      "n": 73,
      "book": "capablanca",
      "title": "K+Q vs K: Safe Checks",
      "teach": "Check from a distance so the king cannot capture the queen.",
      "hint": "Check far enough away.",
      "fen": "8/8/8/8/8/3k4/3Q4/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Endgame",
      "about": "Endgame \u2014 Find the best teaching move.",
      "desc": "Check from a distance so the king cannot capture the queen. Prefer the clean principle move over flashy side lines. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Stalemate is the classic trap when the lone king is on the edge.",
        "Cut the king off before delivering mate \u2014 don't rush."
      ]
    },
    {
      "n": 74,
      "book": "capablanca",
      "title": "K+Q vs K: Avoid Stalemate",
      "teach": "Leave the enemy king a square until mate is forced.",
      "hint": "Don\u2019t take the last flight too early.",
      "fen": "8/8/8/8/8/4k3/4Q3/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Endgame",
      "about": "Endgame \u2014 Find the best teaching move.",
      "desc": "Leave the enemy king a square until mate is forced. Prefer the clean principle move over flashy side lines. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Stalemate is the classic trap when the lone king is on the edge.",
        "Cut the king off before delivering mate \u2014 don't rush."
      ]
    },
    {
      "n": 75,
      "book": "capablanca",
      "title": "K+R vs K: Cut the Board",
      "teach": "The rook cuts the king off; your king then helps deliver mate.",
      "hint": "Cut with the rook on a rank.",
      "fen": "8/8/8/8/8/3K3k/8/4R3 w - - 0 1",
      "goal": "win",
      "theme": "Endgame",
      "about": "Endgame \u2014 Find the best teaching move.",
      "desc": "The rook cuts the king off; your king then helps deliver mate. Prefer the clean principle move over flashy side lines. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Stalemate is the classic trap when the lone king is on the edge.",
        "Cut the king off before delivering mate \u2014 don't rush."
      ]
    },
    {
      "n": 76,
      "book": "capablanca",
      "title": "K+R vs K: Wait Move",
      "teach": "Sometimes a quiet rook move waits for opposition.",
      "hint": "A waiting check or tempo move.",
      "fen": "8/8/8/8/8/2k5/2R5/2K5 w - - 0 1",
      "goal": "win",
      "theme": "Endgame",
      "about": "Endgame \u2014 Find the best teaching move.",
      "desc": "Sometimes a quiet rook move waits for opposition. Prefer the clean principle move over flashy side lines. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Stalemate is the classic trap when the lone king is on the edge.",
        "Cut the king off before delivering mate \u2014 don't rush."
      ]
    },
    {
      "n": 77,
      "book": "capablanca",
      "title": "K+R vs K: Edge Mate",
      "teach": "Mate with rook on the edge file, king opposing.",
      "hint": "Rook to the edge when kings oppose.",
      "fen": "8/8/8/8/8/5k2/5R2/5K2 w - - 0 1",
      "goal": "win",
      "theme": "Endgame",
      "about": "Endgame \u2014 Find the best teaching move.",
      "desc": "Mate with rook on the edge file, king opposing. Prefer the clean principle move over flashy side lines. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Stalemate is the classic trap when the lone king is on the edge.",
        "Cut the king off before delivering mate \u2014 don't rush."
      ]
    },
    {
      "n": 78,
      "book": "capablanca",
      "title": "K+R vs K: Box Smaller",
      "teach": "Shrink the box each move \u2014 never let the king out.",
      "hint": "Reduce the rectangle around the king.",
      "fen": "8/8/8/8/8/4k3/4R3/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Endgame",
      "about": "Endgame \u2014 Find the best teaching move.",
      "desc": "Shrink the box each move \u2014 never let the king out. Prefer the clean principle move over flashy side lines. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Stalemate is the classic trap when the lone king is on the edge.",
        "Cut the king off before delivering mate \u2014 don't rush."
      ]
    },
    {
      "n": 79,
      "book": "capablanca",
      "title": "Opposition Basics",
      "teach": "Kings face with one square between \u2014 the side not to move often yields ground.",
      "hint": "Take the opposition with your king.",
      "fen": "8/8/8/3k4/8/3K4/8/3R4 w - - 0 1",
      "goal": "win",
      "theme": "Opposition",
      "about": "Opposition \u2014 Find the best teaching move.",
      "desc": "Kings face with one square between \u2014 the side not to move often yields ground. Prefer the clean principle move over flashy side lines. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Don't push the pawn so far that the enemy king blockades it forever.",
        "King first \u2014 often the king must reach a key square before the pawn runs.",
        "Opposition matters: the wrong king move can turn a win into a draw."
      ]
    },
    {
      "n": 80,
      "book": "capablanca",
      "title": "Key Squares",
      "teach": "For a pawn to queen, the king must reach key squares in front of it.",
      "hint": "King to a key square, then push.",
      "fen": "8/8/8/3k4/8/3P4/8/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Pawns",
      "move": "d1d2",
      "about": "Key squares \u2014 the king must arrive before the pawn runs.",
      "desc": "In king + pawn endings, certain squares in front of the pawn decide the win. Bring your king there, then advance.",
      "pitfalls": [
        "Pushing the pawn first often draws if the enemy king gets opposition.",
        "Wrong king move can hand them the opposition.",
        "Don't allow a blockade on the promotion path."
      ]
    },
    {
      "n": 81,
      "book": "capablanca",
      "title": "King + Pawn Win",
      "teach": "With opposition and a protected path, the pawn promotes.",
      "hint": "Gain opposition, then advance.",
      "fen": "8/8/8/8/3k4/8/3P4/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Pawns",
      "move": "d1d2",
      "about": "Pawns \u2014 Find the best teaching move.",
      "desc": "With opposition and a protected path, the pawn promotes. Prefer the clean principle move over flashy side lines. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Don't push the pawn so far that the enemy king blockades it forever.",
        "King first \u2014 often the king must reach a key square before the pawn runs.",
        "Opposition matters: the wrong king move can turn a win into a draw."
      ]
    },
    {
      "n": 82,
      "book": "capablanca",
      "title": "Shouldering",
      "teach": "Use your king to shoulder the enemy king away from the pawn.",
      "hint": "King move that blocks theirs.",
      "fen": "8/8/8/4k3/8/3P4/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Pawns",
      "move": "e1d2",
      "about": "Pawns \u2014 Find the best teaching move.",
      "desc": "Use your king to shoulder the enemy king away from the pawn. Prefer the clean principle move over flashy side lines. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Don't push the pawn so far that the enemy king blockades it forever.",
        "King first \u2014 often the king must reach a key square before the pawn runs.",
        "Opposition matters: the wrong king move can turn a win into a draw."
      ]
    },
    {
      "n": 83,
      "book": "capablanca",
      "title": "Rook Cutoff",
      "teach": "In endings, cutting the enemy king off with a rook is Capablanca-simple and strong.",
      "hint": "Rook to a cutting file/rank.",
      "fen": "8/8/8/3k4/8/8/8/3RKR2 w - - 0 1",
      "goal": "win",
      "theme": "Endgame",
      "about": "Endgame \u2014 Find the best teaching move.",
      "desc": "In endings, cutting the enemy king off with a rook is Capablanca-simple and strong. Prefer the clean principle move over flashy side lines. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Don't put the rook where the king can capture it.",
        "On back-rank mates, make sure the escape square (luft) isn't open.",
        "Stalemate is the classic trap when the lone king is on the edge."
      ]
    },
    {
      "n": 84,
      "book": "capablanca",
      "title": "Simplify When Ahead",
      "teach": "When up material, trade pieces (not always pawns) to clarify the win.",
      "hint": "Offer or force a favorable trade.",
      "fen": "4k3/8/8/3q4/3Q4/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Strategy",
      "move": "d4d5",
      "about": "Strategy \u2014 Find the best teaching move.",
      "desc": "When up material, trade pieces (not always pawns) to clarify the win. Prefer the clean principle move over flashy side lines. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Trade pieces when ahead, but keep enough pawns to win.",
        "Don't trade into a drawn ending (wrong bishop, bare king issues)."
      ]
    },
    {
      "n": 85,
      "book": "capablanca",
      "title": "Activity Over Passivity",
      "teach": "Active pieces beat passive ones even at equal material.",
      "hint": "Activate the passive piece.",
      "fen": "4k3/8/8/8/8/8/3R4/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Strategy",
      "move": "d2d7",
      "about": "Strategy \u2014 Find the best teaching move.",
      "desc": "Active pieces beat passive ones even at equal material. Prefer the clean principle move over flashy side lines. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Trade pieces when ahead, but keep enough pawns to win.",
        "Don't trade into a drawn ending (wrong bishop, bare king issues)."
      ]
    },
    {
      "n": 86,
      "book": "capablanca",
      "title": "Two Bishops Intro",
      "teach": "The bishop pair likes open diagonals \u2014 open the center.",
      "hint": "Open a diagonal or centralize a bishop.",
      "fen": "8/8/8/8/7k/8/3BB3/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Endgame",
      "about": "Endgame \u2014 Find the best teaching move.",
      "desc": "The bishop pair likes open diagonals \u2014 open the center. Prefer the clean principle move over flashy side lines. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Stalemate is the classic trap when the lone king is on the edge.",
        "Cut the king off before delivering mate \u2014 don't rush."
      ]
    },
    {
      "n": 87,
      "book": "capablanca",
      "title": "Knight vs Bishop Sense",
      "teach": "Knights want outposts; bishops want open diagonals. Choose the plan that fits.",
      "hint": "Improve the minor piece\u2019s square.",
      "fen": "8/8/8/3k4/8/3N4/3P4/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Endgame",
      "about": "Endgame \u2014 Find the best teaching move.",
      "desc": "Knights want outposts; bishops want open diagonals. Choose the plan that fits. Prefer the clean principle move over flashy side lines. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Stalemate is the classic trap when the lone king is on the edge.",
        "Cut the king off before delivering mate \u2014 don't rush."
      ]
    },
    {
      "n": 88,
      "book": "capablanca",
      "title": "Passed Pawn Push",
      "teach": "Passed pawns must be pushed \u2014 but escorted.",
      "hint": "Advance the passer with king support.",
      "fen": "8/8/4k3/8/4P3/4K3/8/8 w - - 0 1",
      "goal": "win",
      "theme": "Pawns",
      "move": "e4e5",
      "about": "Passed pawn push \u2014 advance with escort.",
      "desc": "Passed pawns must be pushed, but the king should support the advance so the enemy can't simply blockade or capture.",
      "pitfalls": [
        "A naked pawn push can drop the pawn.",
        "Don't let their king step in front of the passer.",
        "Opposition and shouldering still matter while you advance."
      ]
    },
    {
      "n": 89,
      "book": "capablanca",
      "title": "Lucena Idea",
      "teach": "In rook endings, building a bridge frees the king from checks.",
      "hint": "Prepare the bridge / cut checks.",
      "fen": "1K1k4/1P6/8/8/8/8/8/1R6 w - - 0 1",
      "goal": "win",
      "theme": "Rook ending",
      "about": "Rook ending \u2014 Find the best teaching move.",
      "desc": "In rook endings, building a bridge frees the king from checks. Prefer the clean principle move over flashy side lines. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Don't put the rook where the king can capture it.",
        "On back-rank mates, make sure the escape square (luft) isn't open.",
        "Stalemate is the classic trap when the lone king is on the edge."
      ]
    },
    {
      "n": 90,
      "book": "capablanca",
      "title": "Philidor Idea",
      "teach": "Defending rook endings: keep the rook active on the 3rd/6th rank ideas.",
      "hint": "Active rook defense.",
      "fen": "8/8/8/4k3/3R4/8/4P3/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Rook ending",
      "about": "Rook ending \u2014 Find the best teaching move.",
      "desc": "Defending rook endings: keep the rook active on the 3rd/6th rank ideas. Prefer the clean principle move over flashy side lines. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Don't put the rook where the king can capture it.",
        "On back-rank mates, make sure the escape square (luft) isn't open.",
        "Stalemate is the classic trap when the lone king is on the edge."
      ]
    },
    {
      "n": 91,
      "book": "capablanca",
      "title": "Opening: Center First",
      "teach": "Capablanca: occupy the center, develop rapidly, castle.",
      "hint": "Central pawn or developing move.",
      "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "goal": "win",
      "theme": "Opening",
      "about": "Opening \u2014 Find the best teaching move.",
      "desc": "Capablanca: occupy the center, develop rapidly, castle. Prefer the clean principle move over flashy side lines. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Don't overextend pawns you can't defend.",
        "An outpost is useless if the piece can be traded off for free.",
        "Don't weaken f7/f2 early without development."
      ]
    },
    {
      "n": 92,
      "book": "capablanca",
      "title": "Opening: Knights Before Bishops",
      "teach": "A simple rule of thumb: knights before bishops in many quiet openings.",
      "hint": "Develop a knight.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Opening",
      "about": "Opening \u2014 Find the best teaching move.",
      "desc": "A simple rule of thumb: knights before bishops in many quiet openings. Prefer the clean principle move over flashy side lines. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Don't weaken f7/f2 early without development.",
        "Early queen raids often lose time if they don't win material or mate."
      ]
    },
    {
      "n": 93,
      "book": "capablanca",
      "title": "Opening: Don\u2019t Grab Poison",
      "teach": "Early queen raids often lose time \u2014 develop instead unless the raid wins force.",
      "hint": "Prefer development over early queen hunting.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/5Q2/PPPP1PPP/RNB1KBNR b KQkq - 0 2",
      "goal": "win",
      "theme": "Opening",
      "about": "Opening \u2014 Find the best teaching move.",
      "desc": "Early queen raids often lose time \u2014 develop instead unless the raid wins force. Prefer the clean principle move over flashy side lines. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Don't weaken f7/f2 early without development.",
        "Early queen raids often lose time if they don't win material or mate."
      ]
    },
    {
      "n": 94,
      "book": "capablanca",
      "title": "Middle: Piece Coordination",
      "teach": "Pieces work best together \u2014 aim multiple attackers at one weakness.",
      "hint": "Double on a file or target.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/4P3/2N2N2/PPP1BPPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Middlegame",
      "about": "Middlegame \u2014 Find the best teaching move.",
      "desc": "Pieces work best together \u2014 aim multiple attackers at one weakness. Prefer the clean principle move over flashy side lines. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Look for the opponent's reply before you commit.",
        "If your move isn't forcing, ask what they threaten next."
      ]
    },
    {
      "n": 95,
      "book": "capablanca",
      "title": "Middle: Weak Squares",
      "teach": "Occupy weak squares (holes) that pawns can no longer guard.",
      "hint": "Knight or piece into the hole.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Middlegame",
      "about": "Middlegame \u2014 Find the best teaching move.",
      "desc": "Occupy weak squares (holes) that pawns can no longer guard. Prefer the clean principle move over flashy side lines. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Look for the opponent's reply before you commit.",
        "If your move isn't forcing, ask what they threaten next."
      ]
    },
    {
      "n": 96,
      "book": "capablanca",
      "title": "Endgame: King Activity",
      "teach": "In endings the king is an attacking piece \u2014 centralize it.",
      "hint": "Bring the king toward the center/action.",
      "fen": "8/8/8/4k3/8/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Endgame",
      "move": "e1e2",
      "about": "King activity \u2014 in endings the king is an attacker.",
      "desc": "Centralize the king. In simplified positions the king fights; leaving it on the back rank wastes a piece.",
      "pitfalls": [
        "Don't walk into checks you can't answer.",
        "Approach carefully against a remaining heavy piece.",
        "Activity beats passive waiting when material is equal."
      ]
    },
    {
      "n": 97,
      "book": "capablanca",
      "title": "Endgame: Rook Behind Passer",
      "teach": "Rooks belong behind passed pawns (yours or theirs).",
      "hint": "Put the rook behind the pawn.",
      "fen": "8/8/8/8/4k3/8/3PR3/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Rook ending",
      "move": "d2d4",
      "about": "Rook ending \u2014 Find the best teaching move.",
      "desc": "Rooks belong behind passed pawns (yours or theirs). Prefer the clean principle move over flashy side lines. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Don't put the rook where the king can capture it.",
        "On back-rank mates, make sure the escape square (luft) isn't open.",
        "Don't push the pawn so far that the enemy king blockades it forever."
      ]
    },
    {
      "n": 98,
      "book": "capablanca",
      "title": "Endgame: Trade Into Win",
      "teach": "Trade into a known winning ending (K+Q, K+R, good pawn ending).",
      "hint": "Simplify into a clear win.",
      "fen": "4k3/8/8/3r4/3Q4/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Strategy",
      "about": "Strategy \u2014 Find the best teaching move.",
      "desc": "Trade into a known winning ending (K+Q, K+R, good pawn ending). Prefer the clean principle move over flashy side lines. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Trade pieces when ahead, but keep enough pawns to win.",
        "Don't trade into a drawn ending (wrong bishop, bare king issues)."
      ]
    },
    {
      "n": 99,
      "book": "capablanca",
      "title": "Mate Pattern Review",
      "teach": "Combine ideas: cut off, check, cover flights.",
      "hint": "Deliver the mating move.",
      "fen": "7k/5K1R/8/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Review",
      "about": "Review \u2014 Deliver checkmate.",
      "desc": "Combine ideas: cut off, check, cover flights. Play the forcing move that ends the game. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Re-check that every flight square is covered before you take the king's last square."
      ]
    },
    {
      "n": 100,
      "book": "capablanca",
      "title": "Final Drill: Clean Mate",
      "teach": "Finish cleanly \u2014 checkmate without stalemate.",
      "hint": "Mate in one.",
      "fen": "6k1/4K3/5R2/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Review",
      "about": "Review \u2014 Deliver checkmate.",
      "desc": "Finish cleanly \u2014 checkmate without stalemate. Play the forcing move that ends the game. (Simple fundamentals \u2014 endgames, activity, and clean technique)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Re-check that every flight square is covered before you take the king's last square."
      ]
    }
  ];

  const BOOK_LABEL = {
    fischer: "Fischer · Mates",
    seirawan: "Seirawan · Principles",
    capablanca: "Capablanca · Fundamentals",
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

  function updateLessonSelect() {
    if (!lessonSelect) return;
    const list = lessonsInFilter();
    lessonSelect.innerHTML = "";
    for (const l of list) {
      const opt = document.createElement("option");
      opt.value = String(l.n);
      opt.textContent = `${l.n}. ${l.title}${completed.has(l.n) ? " ✓" : ""}`;
      lessonSelect.appendChild(opt);
    }
    if (![...lessonSelect.options].some((o) => o.value === String(lessonN))) {
      lessonN = list[0] ? list[0].n : 1;
    }
    lessonSelect.value = String(lessonN);
  }

  function setBookFilter(next) {
    if (!["all", "fischer", "seirawan", "capablanca"].includes(next)) return;
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
    updateLessonSelect();
    loadPuzzle();
  }

  function setLesson(n) {
    lessonN = Math.max(1, Math.min(100, Math.round(n)));
    if (!lessonsInFilter().some((l) => l.n === lessonN)) {
      bookFilter = "all";
      if (bookTabs) {
        for (const btn of bookTabs.querySelectorAll(".book-btn")) {
          const on = btn.dataset.book === "all";
          btn.classList.toggle("is-active", on);
        }
      }
    }
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
    return `Lesson ${l.n}/100 · ${bookLabel(l.book)}`;
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
    if (lessonVal) lessonVal.textContent = String(lessonN);
    if (lessonRange) lessonRange.value = String(lessonN);
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
    setLesson(lessonN + dir * (e.shiftKey ? 10 : 1));
  });
  if (lessonRange) {
    lessonRange.addEventListener("input", () => setLesson(Number(lessonRange.value)));
  }
  if (lessonSelect) {
    lessonSelect.addEventListener("change", () => setLesson(Number(lessonSelect.value)));
  }
  btnNext.addEventListener("click", () => {
    const list = lessonsInFilter();
    if (!list.length) return;
    if (bookFilter === "all") {
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
    setLesson(list[nextIdx].n);
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
