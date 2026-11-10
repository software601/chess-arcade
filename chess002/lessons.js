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

  const ENGINE_JS = "/chess002/stockfish-19-lite-single.js";
  const ENGINE_WASM = "/chess002/stockfish-19-lite-single.wasm";
  const GLYPH = {
    wk: "♔", wq: "♕", wr: "♖", wb: "♗", wn: "♘", wp: "♙",
    bk: "♚", bq: "♛", br: "♜", bb: "♝", bn: "♞", bp: "♟",
  };

  /** 600 lessons: 200 Chandler · 200 Masetti · 200 Chernev. Original drills. */
  const LESSONS = [
    {
      "n": 1,
      "book": "chandler",
      "title": "Back-Rank Mate (1)",
      "teach": "The king is trapped behind its own pawns. A rook on the back rank mates.",
      "hint": "Rook to the 8th.",
      "fen": "6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1",
      "goal": "mate",
      "theme": "Back-rank",
      "about": "Back-rank — Deliver checkmate.",
      "desc": "The king is trapped behind its own pawns. A rook on the back rank mates. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 2,
      "book": "chandler",
      "title": "Back-Rank Mate (2)",
      "teach": "Same idea from the a-file.",
      "hint": "Rook to a8.",
      "fen": "6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1",
      "goal": "mate",
      "theme": "Back-rank",
      "about": "Back-rank — Deliver checkmate.",
      "desc": "Same idea from the a-file. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 3,
      "book": "chandler",
      "title": "Back-Rank Mate (3)",
      "teach": "Queen delivers the same back-rank finish.",
      "hint": "Queen to the 8th.",
      "fen": "6k1/5ppp/8/8/8/8/8/3Q2K1 w - - 0 1",
      "goal": "mate",
      "theme": "Back-rank",
      "about": "Back-rank — Deliver checkmate.",
      "desc": "Queen delivers the same back-rank finish. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 4,
      "book": "chandler",
      "title": "Back-Rank Mate (4)",
      "teach": "King in the h-corner still falls to a back-rank rook.",
      "hint": "Rook to the 8th.",
      "fen": "7k/5ppp/8/8/8/8/8/4R1K1 w - - 0 1",
      "goal": "mate",
      "theme": "Back-rank",
      "about": "Back-rank — Deliver checkmate.",
      "desc": "King in the h-corner still falls to a back-rank rook. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 5,
      "book": "chandler",
      "title": "Queen Mate (1)",
      "teach": "Queen + king squeeze — find the mate square.",
      "hint": "Queen to g7/g8/h5.",
      "fen": "7k/5Q2/6K1/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate — Deliver checkmate.",
      "desc": "Queen + king squeeze — find the mate square. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 6,
      "book": "chandler",
      "title": "Queen Mate (2)",
      "teach": "Corner king — queen mates with king support.",
      "hint": "Queen to a7 or b7.",
      "fen": "k7/8/1QK5/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate — Deliver checkmate.",
      "desc": "Corner king — queen mates with king support. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 7,
      "book": "chandler",
      "title": "Queen Mate (3)",
      "teach": "Open board — queen mates an edge king.",
      "hint": "Queen mates on the edge.",
      "fen": "6k1/8/5QK1/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate — Deliver checkmate.",
      "desc": "Open board — queen mates an edge king. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 8,
      "book": "chandler",
      "title": "Queen Mate (4)",
      "teach": "Queen on the 7th with king support.",
      "hint": "Queen to the mating square.",
      "fen": "7k/5Q2/5K2/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate — Deliver checkmate.",
      "desc": "Queen on the 7th with king support. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 9,
      "book": "chandler",
      "title": "Queen Mate (5)",
      "teach": "Drive to the corner pattern — one clean mate.",
      "hint": "Queen mates.",
      "fen": "7k/8/6K1/8/Q7/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate — Deliver checkmate.",
      "desc": "Drive to the corner pattern — one clean mate. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 10,
      "book": "chandler",
      "title": "Queen Mate (6)",
      "teach": "Another corner squeeze.",
      "hint": "Find the queen mate.",
      "fen": "k7/3Q4/1K6/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate — Deliver checkmate.",
      "desc": "Another corner squeeze. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 11,
      "book": "chandler",
      "title": "Rook Mate (1)",
      "teach": "King supports; rook delivers.",
      "hint": "Rook to the 8th.",
      "fen": "7k/4R3/6K1/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Rook mate",
      "about": "Rook mate — Deliver checkmate.",
      "desc": "King supports; rook delivers. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 12,
      "book": "chandler",
      "title": "Rook Mate (2)",
      "teach": "Rook on the f-file with king help.",
      "hint": "Rook mates.",
      "fen": "7k/5R2/6K1/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Rook mate",
      "about": "Rook mate — Deliver checkmate.",
      "desc": "Rook on the f-file with king help. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 13,
      "book": "chandler",
      "title": "Rook Mate (3)",
      "teach": "Corner king vs rook + king.",
      "hint": "Rook to the back rank.",
      "fen": "k7/8/K7/8/8/8/8/7R w - - 0 1",
      "goal": "mate",
      "theme": "Rook mate",
      "about": "Rook mate — Deliver checkmate.",
      "desc": "Corner king vs rook + king. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 14,
      "book": "chandler",
      "title": "Rook Mate (4)",
      "teach": "Same technique from the other wing.",
      "hint": "Rook mates.",
      "fen": "k7/7R/K7/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Rook mate",
      "about": "Rook mate — Deliver checkmate.",
      "desc": "Same technique from the other wing. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 15,
      "book": "chandler",
      "title": "Two Rooks on 7th (1)",
      "teach": "Two rooks on the 7th crush most kings.",
      "hint": "Rook to the 8th.",
      "fen": "4k3/R6R/8/8/8/8/8/6K1 w - - 0 1",
      "goal": "mate",
      "theme": "Rooks on 7th",
      "about": "Rooks on 7th — Deliver checkmate.",
      "desc": "Two rooks on the 7th crush most kings. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 16,
      "book": "chandler",
      "title": "Two Rooks on 7th (2)",
      "teach": "Doubled rooks — finish on the back rank.",
      "hint": "Mating rook check.",
      "fen": "3k4/1R4R1/8/8/8/8/8/6K1 w - - 0 1",
      "goal": "mate",
      "theme": "Rooks on 7th",
      "about": "Rooks on 7th — Deliver checkmate.",
      "desc": "Doubled rooks — finish on the back rank. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 17,
      "book": "chandler",
      "title": "Two Rooks on 7th (3)",
      "teach": "King stuck in the center of the 8th.",
      "hint": "Deliver mate.",
      "fen": "4k3/1R4R1/8/8/8/8/8/6K1 w - - 0 1",
      "goal": "mate",
      "theme": "Rooks on 7th",
      "about": "Rooks on 7th — Deliver checkmate.",
      "desc": "King stuck in the center of the 8th. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 18,
      "book": "chandler",
      "title": "Arabian Mate (1)",
      "teach": "Knight covers escapes; rook mates in the corner.",
      "hint": "Rook to h-file mate.",
      "fen": "7k/6R1/5N2/8/8/8/8/6K1 w - - 0 1",
      "goal": "mate",
      "theme": "Arabian",
      "about": "Arabian — Deliver checkmate.",
      "desc": "Knight covers escapes; rook mates in the corner. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 19,
      "book": "chandler",
      "title": "Arabian Mate (2)",
      "teach": "Same Arabian net from a different rook square.",
      "hint": "Finish with the rook.",
      "fen": "7k/5R2/5N2/8/8/8/8/6K1 w - - 0 1",
      "goal": "mate",
      "theme": "Arabian",
      "about": "Arabian — Deliver checkmate.",
      "desc": "Same Arabian net from a different rook square. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 20,
      "book": "chandler",
      "title": "Scholar's Mate Finish",
      "teach": "Classic early-mate shape — queen to f7.",
      "hint": "Queen to f7.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1",
      "goal": "mate",
      "theme": "Scholar",
      "about": "Scholar — Deliver checkmate.",
      "desc": "Classic early-mate shape — queen to f7. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 21,
      "book": "chandler",
      "title": "H-File Mate",
      "teach": "Heavy piece on the h-file finishes a castled king.",
      "hint": "Queen to h7 or h8.",
      "fen": "6k1/5ppp/8/8/8/7Q/8/6K1 w - - 0 1",
      "goal": "mate",
      "theme": "File mate",
      "about": "File mate — Deliver checkmate.",
      "desc": "Heavy piece on the h-file finishes a castled king. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 22,
      "book": "chandler",
      "title": "Battery Mate",
      "teach": "Queen + bishop battery into the castled king.",
      "hint": "Fire the mating shot.",
      "fen": "6k1/5ppp/8/8/8/5Q2/6B1/6K1 w - - 0 1",
      "goal": "mate",
      "theme": "Battery mate",
      "about": "Battery mate — Deliver checkmate.",
      "desc": "Queen + bishop battery into the castled king. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 23,
      "book": "chandler",
      "title": "Promotion Mate",
      "teach": "Promote (or use the passer) to force mate.",
      "hint": "Promote / mate.",
      "fen": "6k1/6P1/5K2/8/8/8/8/7R w - - 0 1",
      "goal": "mate",
      "theme": "Promotion mate",
      "about": "Promotion mate — Deliver checkmate.",
      "desc": "Promote (or use the passer) to force mate. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 24,
      "book": "chandler",
      "title": "Queen Mate (7)",
      "teach": "Far queen still mates when the king is boxed.",
      "hint": "Queen to the mate square.",
      "fen": "k7/8/K7/8/3Q4/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate — Deliver checkmate.",
      "desc": "Far queen still mates when the king is boxed. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 25,
      "book": "chandler",
      "title": "Queen Mate (8)",
      "teach": "Mate from the long side.",
      "hint": "Find queen mate.",
      "fen": "k7/5Q2/K7/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate — Deliver checkmate.",
      "desc": "Mate from the long side. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 26,
      "book": "chandler",
      "title": "Queen Mate (9)",
      "teach": "Another clean Q+K finish.",
      "hint": "Mate with the queen.",
      "fen": "7k/5Q2/5K2/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate — Deliver checkmate.",
      "desc": "Another clean Q+K finish. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 27,
      "book": "chandler",
      "title": "Rook Mate (5)",
      "teach": "Rook slides to the mating rank/file.",
      "hint": "Rook mates.",
      "fen": "k7/8/K7/8/8/8/8/4R3 w - - 0 1",
      "goal": "mate",
      "theme": "Rook mate",
      "about": "Rook mate — Deliver checkmate.",
      "desc": "Rook slides to the mating rank/file. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 28,
      "book": "chandler",
      "title": "Rook Mate (6)",
      "teach": "Edge technique with rook + king.",
      "hint": "Deliver mate.",
      "fen": "k7/8/K7/8/7R/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Rook mate",
      "about": "Rook mate — Deliver checkmate.",
      "desc": "Edge technique with rook + king. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 29,
      "book": "chandler",
      "title": "Queen Mate (10)",
      "teach": "Scan every queen check.",
      "hint": "The mating queen move.",
      "fen": "7k/4Q3/5K2/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Mate in 1",
      "about": "Mate in 1 — Deliver checkmate.",
      "desc": "Scan every queen check. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 30,
      "book": "chandler",
      "title": "Queen Mate (11)",
      "teach": "Keep the queen safe while mating.",
      "hint": "Mate from a distance or with support.",
      "fen": "7k/3Q4/5K2/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Mate in 1",
      "about": "Mate in 1 — Deliver checkmate.",
      "desc": "Keep the queen safe while mating. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 31,
      "book": "chandler",
      "title": "Queen Mate (12)",
      "teach": "Corner patterns repeat — trust the picture.",
      "hint": "Queen mates.",
      "fen": "k7/4Q3/1K6/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Mate in 1",
      "about": "Mate in 1 — Deliver checkmate.",
      "desc": "Corner patterns repeat — trust the picture. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 32,
      "book": "chandler",
      "title": "Two Rooks Review",
      "teach": "Two heavy pieces on the 7th — finish it.",
      "hint": "Rook to the 8th.",
      "fen": "4k3/R6R/8/8/8/8/8/6K1 w - - 0 1",
      "goal": "mate",
      "theme": "Review",
      "about": "Review — Deliver checkmate.",
      "desc": "Two heavy pieces on the 7th — finish it. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 33,
      "book": "chandler",
      "title": "Arabian Review",
      "teach": "Knight + rook corner mate again.",
      "hint": "Rook mates in the corner.",
      "fen": "7k/6R1/5N2/8/8/8/8/6K1 w - - 0 1",
      "goal": "mate",
      "theme": "Review",
      "about": "Review — Deliver checkmate.",
      "desc": "Knight + rook corner mate again. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 34,
      "book": "chandler",
      "title": "Back-Rank Review",
      "teach": "Pawns block the king — back-rank finish.",
      "hint": "Rook or queen to the 8th.",
      "fen": "6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1",
      "goal": "mate",
      "theme": "Review",
      "about": "Review — Deliver checkmate.",
      "desc": "Pawns block the king — back-rank finish. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 35,
      "book": "chandler",
      "title": "Clean Mate Review",
      "teach": "Finish cleanly — mate without stalemate.",
      "hint": "Mate in one.",
      "fen": "7k/5Q2/6K1/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Review",
      "about": "Review — Deliver checkmate.",
      "desc": "Finish cleanly — mate without stalemate. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 36,
      "book": "chandler",
      "title": "Corner Drill (36)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1",
      "goal": "mate",
      "theme": "Corner",
      "about": "Corner — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 37,
      "book": "chandler",
      "title": "Rooks on 7th Drill (37)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1",
      "goal": "mate",
      "theme": "Rooks on 7th",
      "about": "Rooks on 7th — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 38,
      "book": "chandler",
      "title": "Battery mate Drill (38)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "6k1/5ppp/8/8/8/8/8/3Q2K1 w - - 0 1",
      "goal": "mate",
      "theme": "Battery mate",
      "about": "Battery mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 39,
      "book": "chandler",
      "title": "File mate Drill (39)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/5ppp/8/8/8/8/8/4R1K1 w - - 0 1",
      "goal": "mate",
      "theme": "File mate",
      "about": "File mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 40,
      "book": "chandler",
      "title": "Support mate Drill (40)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/5Q2/6K1/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Support mate",
      "about": "Support mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 41,
      "book": "chandler",
      "title": "Review Drill (41)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/1QK5/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Review",
      "about": "Review — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 42,
      "book": "chandler",
      "title": "Pattern Drill (42)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "6k1/8/5QK1/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Pattern",
      "about": "Pattern — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 43,
      "book": "chandler",
      "title": "Back-rank Drill (43)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/5Q2/5K2/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Back-rank",
      "about": "Back-rank — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 44,
      "book": "chandler",
      "title": "Queen mate Drill (44)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/6K1/8/Q7/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 45,
      "book": "chandler",
      "title": "Rook mate Drill (45)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/3Q4/1K6/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Rook mate",
      "about": "Rook mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 46,
      "book": "chandler",
      "title": "Ladder Drill (46)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/4R3/6K1/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Ladder",
      "about": "Ladder — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 47,
      "book": "chandler",
      "title": "Arabian Drill (47)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/5R2/6K1/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Arabian",
      "about": "Arabian — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 48,
      "book": "chandler",
      "title": "Smothered Drill (48)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/K7/8/8/8/8/7R w - - 0 1",
      "goal": "mate",
      "theme": "Smothered",
      "about": "Smothered — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 49,
      "book": "chandler",
      "title": "Mate in 1 Drill (49)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/7R/K7/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Mate in 1",
      "about": "Mate in 1 — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 50,
      "book": "chandler",
      "title": "Corner Drill (50)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "4k3/R6R/8/8/8/8/8/6K1 w - - 0 1",
      "goal": "mate",
      "theme": "Corner",
      "about": "Corner — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 51,
      "book": "chandler",
      "title": "Rooks on 7th Drill (51)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "3k4/1R4R1/8/8/8/8/8/6K1 w - - 0 1",
      "goal": "mate",
      "theme": "Rooks on 7th",
      "about": "Rooks on 7th — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 52,
      "book": "chandler",
      "title": "Battery mate Drill (52)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "4k3/1R4R1/8/8/8/8/8/6K1 w - - 0 1",
      "goal": "mate",
      "theme": "Battery mate",
      "about": "Battery mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 53,
      "book": "chandler",
      "title": "File mate Drill (53)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/6R1/5N2/8/8/8/8/6K1 w - - 0 1",
      "goal": "mate",
      "theme": "File mate",
      "about": "File mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 54,
      "book": "chandler",
      "title": "Support mate Drill (54)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/5R2/5N2/8/8/8/8/6K1 w - - 0 1",
      "goal": "mate",
      "theme": "Support mate",
      "about": "Support mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 55,
      "book": "chandler",
      "title": "Review Drill (55)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1",
      "goal": "mate",
      "theme": "Review",
      "about": "Review — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 56,
      "book": "chandler",
      "title": "Pattern Drill (56)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "6k1/5ppp/8/8/8/7Q/8/6K1 w - - 0 1",
      "goal": "mate",
      "theme": "Pattern",
      "about": "Pattern — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 57,
      "book": "chandler",
      "title": "Back-rank Drill (57)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "6k1/5ppp/8/8/8/5Q2/6B1/6K1 w - - 0 1",
      "goal": "mate",
      "theme": "Back-rank",
      "about": "Back-rank — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 58,
      "book": "chandler",
      "title": "Queen mate Drill (58)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "6k1/6P1/5K2/8/8/8/8/7R w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 59,
      "book": "chandler",
      "title": "Rook mate Drill (59)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/K7/8/3Q4/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Rook mate",
      "about": "Rook mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 60,
      "book": "chandler",
      "title": "Ladder Drill (60)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/5Q2/K7/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Ladder",
      "about": "Ladder — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 61,
      "book": "chandler",
      "title": "Arabian Drill (61)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/K7/8/8/8/8/4R3 w - - 0 1",
      "goal": "mate",
      "theme": "Arabian",
      "about": "Arabian — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 62,
      "book": "chandler",
      "title": "Smothered Drill (62)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/K7/8/7R/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Smothered",
      "about": "Smothered — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 63,
      "book": "chandler",
      "title": "Mate in 1 Drill (63)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/4Q3/5K2/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Mate in 1",
      "about": "Mate in 1 — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 64,
      "book": "chandler",
      "title": "Corner Drill (64)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/3Q4/5K2/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Corner",
      "about": "Corner — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 65,
      "book": "chandler",
      "title": "Rooks on 7th Drill (65)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/4Q3/1K6/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Rooks on 7th",
      "about": "Rooks on 7th — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 66,
      "book": "chandler",
      "title": "Battery mate Drill (66)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/K7/8/Q7/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Battery mate",
      "about": "Battery mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 67,
      "book": "chandler",
      "title": "File mate Drill (67)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/K7/8/1Q6/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "File mate",
      "about": "File mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 68,
      "book": "chandler",
      "title": "Support mate Drill (68)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/K7/8/2Q5/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Support mate",
      "about": "Support mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 69,
      "book": "chandler",
      "title": "Review Drill (69)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/K7/8/5Q2/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Review",
      "about": "Review — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 70,
      "book": "chandler",
      "title": "Pattern Drill (70)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/K7/8/6Q1/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Pattern",
      "about": "Pattern — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 71,
      "book": "chandler",
      "title": "Back-rank Drill (71)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/K7/8/7Q/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Back-rank",
      "about": "Back-rank — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 72,
      "book": "chandler",
      "title": "Queen mate Drill (72)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/K7/Q7/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 73,
      "book": "chandler",
      "title": "Rook mate Drill (73)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/K7/1Q6/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Rook mate",
      "about": "Rook mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 74,
      "book": "chandler",
      "title": "Ladder Drill (74)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/K7/2Q5/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Ladder",
      "about": "Ladder — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 75,
      "book": "chandler",
      "title": "Arabian Drill (75)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/K7/4Q3/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Arabian",
      "about": "Arabian — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 76,
      "book": "chandler",
      "title": "Smothered Drill (76)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/K7/5Q2/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Smothered",
      "about": "Smothered — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 77,
      "book": "chandler",
      "title": "Mate in 1 Drill (77)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/K7/6Q1/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Mate in 1",
      "about": "Mate in 1 — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 78,
      "book": "chandler",
      "title": "Corner Drill (78)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/K7/7Q/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Corner",
      "about": "Corner — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 79,
      "book": "chandler",
      "title": "Rooks on 7th Drill (79)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/2Q5/K7/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Rooks on 7th",
      "about": "Rooks on 7th — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 80,
      "book": "chandler",
      "title": "Battery mate Drill (80)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/3Q4/K7/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Battery mate",
      "about": "Battery mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 81,
      "book": "chandler",
      "title": "File mate Drill (81)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/4Q3/K7/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "File mate",
      "about": "File mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 82,
      "book": "chandler",
      "title": "Support mate Drill (82)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/6Q1/K7/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Support mate",
      "about": "Support mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 83,
      "book": "chandler",
      "title": "Review Drill (83)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/7Q/K7/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Review",
      "about": "Review — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 84,
      "book": "chandler",
      "title": "Pattern Drill (84)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/K7/8/8/8/Q7/8 w - - 0 1",
      "goal": "mate",
      "theme": "Pattern",
      "about": "Pattern — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 85,
      "book": "chandler",
      "title": "Back-rank Drill (85)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/K7/8/8/8/7Q/8 w - - 0 1",
      "goal": "mate",
      "theme": "Back-rank",
      "about": "Back-rank — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 86,
      "book": "chandler",
      "title": "Queen mate Drill (86)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/K7/8/8/8/8/3Q4 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 87,
      "book": "chandler",
      "title": "Rook mate Drill (87)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/K7/8/8/8/8/4Q3 w - - 0 1",
      "goal": "mate",
      "theme": "Rook mate",
      "about": "Rook mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 88,
      "book": "chandler",
      "title": "Ladder Drill (88)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/K7/8/8/8/8/5Q2 w - - 0 1",
      "goal": "mate",
      "theme": "Ladder",
      "about": "Ladder — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 89,
      "book": "chandler",
      "title": "Arabian Drill (89)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/K7/8/8/8/8/2Q5 w - - 0 1",
      "goal": "mate",
      "theme": "Arabian",
      "about": "Arabian — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 90,
      "book": "chandler",
      "title": "Smothered Drill (90)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/K7/8/8/Q7/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Smothered",
      "about": "Smothered — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 91,
      "book": "chandler",
      "title": "Mate in 1 Drill (91)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/K7/8/8/7Q/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Mate in 1",
      "about": "Mate in 1 — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 92,
      "book": "chandler",
      "title": "Corner Drill (92)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/1K6/8/1Q6/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Corner",
      "about": "Corner — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 93,
      "book": "chandler",
      "title": "Rooks on 7th Drill (93)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/1K6/8/2Q5/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Rooks on 7th",
      "about": "Rooks on 7th — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 94,
      "book": "chandler",
      "title": "Battery mate Drill (94)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/1K6/8/3Q4/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Battery mate",
      "about": "Battery mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 95,
      "book": "chandler",
      "title": "File mate Drill (95)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/1K6/8/5Q2/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "File mate",
      "about": "File mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 96,
      "book": "chandler",
      "title": "Support mate Drill (96)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/1K6/8/6Q1/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Support mate",
      "about": "Support mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 97,
      "book": "chandler",
      "title": "Review Drill (97)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/1K6/8/7Q/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Review",
      "about": "Review — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 98,
      "book": "chandler",
      "title": "Pattern Drill (98)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/1K6/1Q6/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Pattern",
      "about": "Pattern — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 99,
      "book": "chandler",
      "title": "Back-rank Drill (99)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/1K6/2Q5/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Back-rank",
      "about": "Back-rank — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 100,
      "book": "chandler",
      "title": "Queen mate Drill (100)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/1K6/4Q3/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 101,
      "book": "chandler",
      "title": "Rook mate Drill (101)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/1K6/5Q2/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Rook mate",
      "about": "Rook mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 102,
      "book": "chandler",
      "title": "Ladder Drill (102)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/1K6/6Q1/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Ladder",
      "about": "Ladder — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 103,
      "book": "chandler",
      "title": "Arabian Drill (103)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/1K6/7Q/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Arabian",
      "about": "Arabian — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 104,
      "book": "chandler",
      "title": "Smothered Drill (104)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/2Q5/1K6/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Smothered",
      "about": "Smothered — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 105,
      "book": "chandler",
      "title": "Mate in 1 Drill (105)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/5Q2/1K6/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Mate in 1",
      "about": "Mate in 1 — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 106,
      "book": "chandler",
      "title": "Corner Drill (106)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/6Q1/1K6/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Corner",
      "about": "Corner — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 107,
      "book": "chandler",
      "title": "Rooks on 7th Drill (107)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/7Q/1K6/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Rooks on 7th",
      "about": "Rooks on 7th — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 108,
      "book": "chandler",
      "title": "Battery mate Drill (108)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/1K6/8/8/8/7Q/8 w - - 0 1",
      "goal": "mate",
      "theme": "Battery mate",
      "about": "Battery mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 109,
      "book": "chandler",
      "title": "File mate Drill (109)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/1K6/8/8/8/8/3Q4 w - - 0 1",
      "goal": "mate",
      "theme": "File mate",
      "about": "File mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 110,
      "book": "chandler",
      "title": "Support mate Drill (110)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/1K6/8/8/8/8/4Q3 w - - 0 1",
      "goal": "mate",
      "theme": "Support mate",
      "about": "Support mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 111,
      "book": "chandler",
      "title": "Review Drill (111)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/1K6/8/8/8/8/5Q2 w - - 0 1",
      "goal": "mate",
      "theme": "Review",
      "about": "Review — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 112,
      "book": "chandler",
      "title": "Pattern Drill (112)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/1K6/8/8/8/8/2Q5 w - - 0 1",
      "goal": "mate",
      "theme": "Pattern",
      "about": "Pattern — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 113,
      "book": "chandler",
      "title": "Back-rank Drill (113)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/1K6/8/8/7Q/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Back-rank",
      "about": "Back-rank — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 114,
      "book": "chandler",
      "title": "Queen mate Drill (114)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/2K5/8/1Q6/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 115,
      "book": "chandler",
      "title": "Rook mate Drill (115)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/8/2K5/1Q6/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Rook mate",
      "about": "Rook mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 116,
      "book": "chandler",
      "title": "Ladder Drill (116)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/2Q5/2K5/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Ladder",
      "about": "Ladder — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 117,
      "book": "chandler",
      "title": "Arabian Drill (117)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/3Q4/2K5/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Arabian",
      "about": "Arabian — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 118,
      "book": "chandler",
      "title": "Smothered Drill (118)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/4Q3/2K5/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Smothered",
      "about": "Smothered — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 119,
      "book": "chandler",
      "title": "Mate in 1 Drill (119)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/5Q2/2K5/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Mate in 1",
      "about": "Mate in 1 — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 120,
      "book": "chandler",
      "title": "Corner Drill (120)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/6Q1/2K5/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Corner",
      "about": "Corner — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 121,
      "book": "chandler",
      "title": "Rooks on 7th Drill (121)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "k7/7Q/2K5/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Rooks on 7th",
      "about": "Rooks on 7th — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 122,
      "book": "chandler",
      "title": "Battery mate Drill (122)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/5K2/8/6Q1/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Battery mate",
      "about": "Battery mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 123,
      "book": "chandler",
      "title": "File mate Drill (123)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/5K2/6Q1/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "File mate",
      "about": "File mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 124,
      "book": "chandler",
      "title": "Support mate Drill (124)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/Q7/5K2/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Support mate",
      "about": "Support mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 125,
      "book": "chandler",
      "title": "Review Drill (125)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/1Q6/5K2/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Review",
      "about": "Review — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 126,
      "book": "chandler",
      "title": "Pattern Drill (126)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/2Q5/5K2/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Pattern",
      "about": "Pattern — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 127,
      "book": "chandler",
      "title": "Back-rank Drill (127)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/6K1/8/1Q6/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Back-rank",
      "about": "Back-rank — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 128,
      "book": "chandler",
      "title": "Queen mate Drill (128)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/6K1/8/2Q5/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 129,
      "book": "chandler",
      "title": "Rook mate Drill (129)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/6K1/8/4Q3/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Rook mate",
      "about": "Rook mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 130,
      "book": "chandler",
      "title": "Ladder Drill (130)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/6K1/8/5Q2/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Ladder",
      "about": "Ladder — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 131,
      "book": "chandler",
      "title": "Arabian Drill (131)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/6K1/8/6Q1/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Arabian",
      "about": "Arabian — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 132,
      "book": "chandler",
      "title": "Smothered Drill (132)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/6K1/Q7/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Smothered",
      "about": "Smothered — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 133,
      "book": "chandler",
      "title": "Mate in 1 Drill (133)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/6K1/1Q6/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Mate in 1",
      "about": "Mate in 1 — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 134,
      "book": "chandler",
      "title": "Corner Drill (134)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/6K1/2Q5/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Corner",
      "about": "Corner — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 135,
      "book": "chandler",
      "title": "Rooks on 7th Drill (135)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/6K1/3Q4/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Rooks on 7th",
      "about": "Rooks on 7th — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 136,
      "book": "chandler",
      "title": "Battery mate Drill (136)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/6K1/5Q2/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Battery mate",
      "about": "Battery mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 137,
      "book": "chandler",
      "title": "File mate Drill (137)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/6K1/6Q1/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "File mate",
      "about": "File mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 138,
      "book": "chandler",
      "title": "Support mate Drill (138)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/Q7/6K1/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Support mate",
      "about": "Support mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 139,
      "book": "chandler",
      "title": "Review Drill (139)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/1Q6/6K1/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Review",
      "about": "Review — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 140,
      "book": "chandler",
      "title": "Pattern Drill (140)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/2Q5/6K1/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Pattern",
      "about": "Pattern — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 141,
      "book": "chandler",
      "title": "Back-rank Drill (141)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/3Q4/6K1/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Back-rank",
      "about": "Back-rank — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 142,
      "book": "chandler",
      "title": "Queen mate Drill (142)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/4Q3/6K1/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 143,
      "book": "chandler",
      "title": "Rook mate Drill (143)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/6K1/8/8/8/Q7/8 w - - 0 1",
      "goal": "mate",
      "theme": "Rook mate",
      "about": "Rook mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 144,
      "book": "chandler",
      "title": "Ladder Drill (144)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/6K1/8/8/8/8/3Q4 w - - 0 1",
      "goal": "mate",
      "theme": "Ladder",
      "about": "Ladder — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 145,
      "book": "chandler",
      "title": "Arabian Drill (145)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/6K1/8/8/8/8/4Q3 w - - 0 1",
      "goal": "mate",
      "theme": "Arabian",
      "about": "Arabian — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 146,
      "book": "chandler",
      "title": "Smothered Drill (146)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/6K1/8/8/8/8/5Q2 w - - 0 1",
      "goal": "mate",
      "theme": "Smothered",
      "about": "Smothered — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 147,
      "book": "chandler",
      "title": "Mate in 1 Drill (147)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/6K1/8/8/8/8/2Q5 w - - 0 1",
      "goal": "mate",
      "theme": "Mate in 1",
      "about": "Mate in 1 — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 148,
      "book": "chandler",
      "title": "Corner Drill (148)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/6K1/8/8/Q7/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Corner",
      "about": "Corner — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 149,
      "book": "chandler",
      "title": "Rooks on 7th Drill (149)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/7K/8/Q7/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Rooks on 7th",
      "about": "Rooks on 7th — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 150,
      "book": "chandler",
      "title": "Battery mate Drill (150)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/7K/8/1Q6/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Battery mate",
      "about": "Battery mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 151,
      "book": "chandler",
      "title": "File mate Drill (151)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/7K/8/2Q5/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "File mate",
      "about": "File mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 152,
      "book": "chandler",
      "title": "Support mate Drill (152)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/7K/8/4Q3/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Support mate",
      "about": "Support mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 153,
      "book": "chandler",
      "title": "Review Drill (153)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/7K/8/5Q2/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Review",
      "about": "Review — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 154,
      "book": "chandler",
      "title": "Pattern Drill (154)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/7K/8/6Q1/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Pattern",
      "about": "Pattern — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 155,
      "book": "chandler",
      "title": "Back-rank Drill (155)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/7K/8/7Q/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Back-rank",
      "about": "Back-rank — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 156,
      "book": "chandler",
      "title": "Queen mate Drill (156)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/7K/Q7/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 157,
      "book": "chandler",
      "title": "Rook mate Drill (157)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/7K/1Q6/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Rook mate",
      "about": "Rook mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 158,
      "book": "chandler",
      "title": "Ladder Drill (158)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/7K/2Q5/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Ladder",
      "about": "Ladder — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 159,
      "book": "chandler",
      "title": "Arabian Drill (159)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/7K/3Q4/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Arabian",
      "about": "Arabian — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 160,
      "book": "chandler",
      "title": "Smothered Drill (160)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/7K/5Q2/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Smothered",
      "about": "Smothered — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 161,
      "book": "chandler",
      "title": "Mate in 1 Drill (161)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/7K/6Q1/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Mate in 1",
      "about": "Mate in 1 — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 162,
      "book": "chandler",
      "title": "Corner Drill (162)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/7K/7Q/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Corner",
      "about": "Corner — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 163,
      "book": "chandler",
      "title": "Rooks on 7th Drill (163)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/Q7/7K/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Rooks on 7th",
      "about": "Rooks on 7th — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 164,
      "book": "chandler",
      "title": "Battery mate Drill (164)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/1Q6/7K/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Battery mate",
      "about": "Battery mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 165,
      "book": "chandler",
      "title": "File mate Drill (165)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/2Q5/7K/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "File mate",
      "about": "File mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 166,
      "book": "chandler",
      "title": "Support mate Drill (166)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/3Q4/7K/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Support mate",
      "about": "Support mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 167,
      "book": "chandler",
      "title": "Review Drill (167)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/4Q3/7K/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Review",
      "about": "Review — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 168,
      "book": "chandler",
      "title": "Pattern Drill (168)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/5Q2/7K/8/8/8/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Pattern",
      "about": "Pattern — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 169,
      "book": "chandler",
      "title": "Back-rank Drill (169)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/7K/8/8/8/Q7/8 w - - 0 1",
      "goal": "mate",
      "theme": "Back-rank",
      "about": "Back-rank — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 170,
      "book": "chandler",
      "title": "Queen mate Drill (170)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/7K/8/8/8/7Q/8 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 171,
      "book": "chandler",
      "title": "Rook mate Drill (171)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/7K/8/8/8/8/3Q4 w - - 0 1",
      "goal": "mate",
      "theme": "Rook mate",
      "about": "Rook mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 172,
      "book": "chandler",
      "title": "Ladder Drill (172)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/7K/8/8/8/8/4Q3 w - - 0 1",
      "goal": "mate",
      "theme": "Ladder",
      "about": "Ladder — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 173,
      "book": "chandler",
      "title": "Arabian Drill (173)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/7K/8/8/8/8/5Q2 w - - 0 1",
      "goal": "mate",
      "theme": "Arabian",
      "about": "Arabian — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 174,
      "book": "chandler",
      "title": "Smothered Drill (174)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/7K/8/8/8/8/2Q5 w - - 0 1",
      "goal": "mate",
      "theme": "Smothered",
      "about": "Smothered — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 175,
      "book": "chandler",
      "title": "Mate in 1 Drill (175)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/7K/8/8/Q7/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Mate in 1",
      "about": "Mate in 1 — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 176,
      "book": "chandler",
      "title": "Corner Drill (176)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "7k/8/7K/8/8/7Q/8/8 w - - 0 1",
      "goal": "mate",
      "theme": "Corner",
      "about": "Corner — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 177,
      "book": "chandler",
      "title": "Rooks on 7th Drill (177)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "8/8/8/8/Q7/K7/8/k7 w - - 0 1",
      "goal": "mate",
      "theme": "Rooks on 7th",
      "about": "Rooks on 7th — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 178,
      "book": "chandler",
      "title": "Battery mate Drill (178)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "8/8/8/8/1Q6/K7/8/k7 w - - 0 1",
      "goal": "mate",
      "theme": "Battery mate",
      "about": "Battery mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 179,
      "book": "chandler",
      "title": "File mate Drill (179)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "8/8/8/8/2Q5/K7/8/k7 w - - 0 1",
      "goal": "mate",
      "theme": "File mate",
      "about": "File mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 180,
      "book": "chandler",
      "title": "Support mate Drill (180)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "8/8/8/8/4Q3/K7/8/k7 w - - 0 1",
      "goal": "mate",
      "theme": "Support mate",
      "about": "Support mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 181,
      "book": "chandler",
      "title": "Review Drill (181)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "8/8/8/8/5Q2/K7/8/k7 w - - 0 1",
      "goal": "mate",
      "theme": "Review",
      "about": "Review — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 182,
      "book": "chandler",
      "title": "Pattern Drill (182)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "8/8/8/8/6Q1/K7/8/k7 w - - 0 1",
      "goal": "mate",
      "theme": "Pattern",
      "about": "Pattern — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 183,
      "book": "chandler",
      "title": "Back-rank Drill (183)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "8/8/8/8/7Q/K7/8/k7 w - - 0 1",
      "goal": "mate",
      "theme": "Back-rank",
      "about": "Back-rank — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 184,
      "book": "chandler",
      "title": "Queen mate Drill (184)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "8/8/8/Q7/8/K7/8/k7 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 185,
      "book": "chandler",
      "title": "Rook mate Drill (185)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "8/8/8/1Q6/8/K7/8/k7 w - - 0 1",
      "goal": "mate",
      "theme": "Rook mate",
      "about": "Rook mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 186,
      "book": "chandler",
      "title": "Ladder Drill (186)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "8/8/8/2Q5/8/K7/8/k7 w - - 0 1",
      "goal": "mate",
      "theme": "Ladder",
      "about": "Ladder — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 187,
      "book": "chandler",
      "title": "Arabian Drill (187)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "8/8/8/3Q4/8/K7/8/k7 w - - 0 1",
      "goal": "mate",
      "theme": "Arabian",
      "about": "Arabian — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 188,
      "book": "chandler",
      "title": "Smothered Drill (188)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "8/8/8/5Q2/8/K7/8/k7 w - - 0 1",
      "goal": "mate",
      "theme": "Smothered",
      "about": "Smothered — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 189,
      "book": "chandler",
      "title": "Mate in 1 Drill (189)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "8/8/8/6Q1/8/K7/8/k7 w - - 0 1",
      "goal": "mate",
      "theme": "Mate in 1",
      "about": "Mate in 1 — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 190,
      "book": "chandler",
      "title": "Corner Drill (190)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "8/8/8/7Q/8/K7/8/k7 w - - 0 1",
      "goal": "mate",
      "theme": "Corner",
      "about": "Corner — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 191,
      "book": "chandler",
      "title": "Rooks on 7th Drill (191)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "8/Q7/8/8/8/K7/8/k7 w - - 0 1",
      "goal": "mate",
      "theme": "Rooks on 7th",
      "about": "Rooks on 7th — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 192,
      "book": "chandler",
      "title": "Battery mate Drill (192)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "8/1Q6/8/8/8/K7/8/k7 w - - 0 1",
      "goal": "mate",
      "theme": "Battery mate",
      "about": "Battery mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 193,
      "book": "chandler",
      "title": "File mate Drill (193)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "8/2Q5/8/8/8/K7/8/k7 w - - 0 1",
      "goal": "mate",
      "theme": "File mate",
      "about": "File mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 194,
      "book": "chandler",
      "title": "Support mate Drill (194)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "8/3Q4/8/8/8/K7/8/k7 w - - 0 1",
      "goal": "mate",
      "theme": "Support mate",
      "about": "Support mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 195,
      "book": "chandler",
      "title": "Review Drill (195)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "8/4Q3/8/8/8/K7/8/k7 w - - 0 1",
      "goal": "mate",
      "theme": "Review",
      "about": "Review — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 196,
      "book": "chandler",
      "title": "Pattern Drill (196)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "8/5Q2/8/8/8/K7/8/k7 w - - 0 1",
      "goal": "mate",
      "theme": "Pattern",
      "about": "Pattern — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 197,
      "book": "chandler",
      "title": "Back-rank Drill (197)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "8/7Q/8/8/8/K7/8/k7 w - - 0 1",
      "goal": "mate",
      "theme": "Back-rank",
      "about": "Back-rank — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 198,
      "book": "chandler",
      "title": "Queen mate Drill (198)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "8/8/8/8/8/K7/7Q/k7 w - - 0 1",
      "goal": "mate",
      "theme": "Queen mate",
      "about": "Queen mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 199,
      "book": "chandler",
      "title": "Rook mate Drill (199)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "8/8/8/8/8/K6Q/8/k7 w - - 0 1",
      "goal": "mate",
      "theme": "Rook mate",
      "about": "Rook mate — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 200,
      "book": "chandler",
      "title": "Ladder Drill (200)",
      "teach": "Force checkmate with the classic pattern for this drill.",
      "hint": "Find the mating move.",
      "fen": "8/8/8/8/1Q6/1K6/8/k7 w - - 0 1",
      "goal": "mate",
      "theme": "Ladder",
      "about": "Ladder — Deliver checkmate.",
      "desc": "Force checkmate with the classic pattern for this drill. Play the forcing move that ends the game. (Mate-pattern drills — force the king with clear checks)",
      "pitfalls": [
        "Don't settle for a check that lets the king escape.",
        "Watch for stalemate when the king has no legal moves but isn't in check.",
        "Cover every flight square before you take the king's last square."
      ]
    },
    {
      "n": 201,
      "book": "masetti",
      "title": "Knight Fork (1)",
      "teach": "Knight checks the king and attacks a rook.",
      "hint": "Knight to the fork square.",
      "fen": "4k3/8/8/8/8/2n5/8/R3K3 b - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Knight checks the king and attacks a rook. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 202,
      "book": "masetti",
      "title": "Knight Fork (2)",
      "teach": "Fork king and queen with one hop.",
      "hint": "Knight check that hits the queen.",
      "fen": "4k3/8/8/8/4n3/8/8/3QK3 b - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Fork king and queen with one hop. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 203,
      "book": "masetti",
      "title": "Knight Fork (3)",
      "teach": "King and rook in the same knight net.",
      "hint": "Knight into the pocket.",
      "fen": "4k3/8/8/3n4/8/8/8/R3K3 b - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "King and rook in the same knight net. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 204,
      "book": "masetti",
      "title": "Royal Fork",
      "teach": "Knight checks king and eyes the queen.",
      "hint": "The royal fork hop.",
      "fen": "4k3/8/4n3/8/8/8/8/3QK3 b - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Knight checks king and eyes the queen. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 205,
      "book": "masetti",
      "title": "Pawn Fork",
      "teach": "Pawn hits two pieces at once.",
      "hint": "Push the forking pawn.",
      "fen": "4k3/8/8/3n1n2/4P3/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Pawn hits two pieces at once. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 206,
      "book": "masetti",
      "title": "Queen Fork",
      "teach": "Queen checks and attacks an undefended rook.",
      "hint": "Queen check that also hits the rook.",
      "fen": "4k3/8/8/8/8/8/1r6/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Queen checks and attacks an undefended rook. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 207,
      "book": "masetti",
      "title": "Absolute Pin (1)",
      "teach": "Pinned to the king — take or pile on.",
      "hint": "Exploit the pinned bishop.",
      "fen": "4k3/8/8/8/8/8/4b3/4QK2 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Pinned to the king — take or pile on. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 208,
      "book": "masetti",
      "title": "Absolute Pin (2)",
      "teach": "Pin on the file — add pressure.",
      "hint": "Attack the pinned knight.",
      "fen": "4k3/4n3/8/8/8/8/8/4RK2 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Pin on the file — add pressure. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 209,
      "book": "masetti",
      "title": "Relative Pin",
      "teach": "Pinned piece dare not move — take what hangs.",
      "hint": "Take the hanging unit.",
      "fen": "4k3/8/8/8/8/4q3/4N3/4RK2 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Pinned piece dare not move — take what hangs. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 210,
      "book": "masetti",
      "title": "Diagonal Pin",
      "teach": "Bishop pins knight to king.",
      "hint": "Take or pile on the knight.",
      "fen": "4k3/8/5n2/8/8/8/8/2B1K3 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Bishop pins knight to king. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 211,
      "book": "masetti",
      "title": "Skewer (1)",
      "teach": "Check the king; take the piece behind.",
      "hint": "Queen skewer on the file.",
      "fen": "4k3/8/8/8/8/8/8/3QK2r w - - 0 1",
      "goal": "win",
      "theme": "Skewer",
      "about": "Skewer — Find the best teaching move.",
      "desc": "Check the king; take the piece behind. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 212,
      "book": "masetti",
      "title": "Skewer (2)",
      "teach": "Bishop skewer: king in front, rook behind.",
      "hint": "Bishop check that skewers.",
      "fen": "4k3/8/8/8/8/8/8/r3K2B w - - 0 1",
      "goal": "win",
      "theme": "Skewer",
      "about": "Skewer — Find the best teaching move.",
      "desc": "Bishop skewer: king in front, rook behind. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 213,
      "book": "masetti",
      "title": "Skewer (3)",
      "teach": "Rook skewers king and queen on a rank.",
      "hint": "Rook to the 8th with skewer.",
      "fen": "4k2q/8/8/8/8/8/8/3R2K1 w - - 0 1",
      "goal": "win",
      "theme": "Skewer",
      "about": "Skewer — Find the best teaching move.",
      "desc": "Rook skewers king and queen on a rank. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 214,
      "book": "masetti",
      "title": "Discovered Attack",
      "teach": "Move the front piece; the rear piece strikes.",
      "hint": "Discover the attack.",
      "fen": "4k3/8/8/8/8/4N3/8/3RR1K1 w - - 0 1",
      "goal": "win",
      "theme": "Discovery",
      "about": "Discovery — Find the best teaching move.",
      "desc": "Move the front piece; the rear piece strikes. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 215,
      "book": "masetti",
      "title": "Discovered Check",
      "teach": "Slide away — check appears behind.",
      "hint": "Discover check.",
      "fen": "4k3/8/8/8/4B3/8/8/4RK2 w - - 0 1",
      "goal": "win",
      "theme": "Discovery",
      "about": "Discovery — Find the best teaching move.",
      "desc": "Slide away — check appears behind. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 216,
      "book": "masetti",
      "title": "Double Check",
      "teach": "Two pieces check — king must move.",
      "hint": "Give double check.",
      "fen": "4k3/8/8/8/4N3/8/8/4RK2 w - - 0 1",
      "goal": "win",
      "theme": "Double check",
      "about": "Double check — Find the best teaching move.",
      "desc": "Two pieces check — king must move. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 217,
      "book": "masetti",
      "title": "Remove the Guard",
      "teach": "Take the defender, then the prize.",
      "hint": "Remove the guard.",
      "fen": "4k3/8/8/3n4/8/8/3N4/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Remove guard",
      "about": "Remove guard — Find the best teaching move.",
      "desc": "Take the defender, then the prize. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 218,
      "book": "masetti",
      "title": "Overloaded Defender",
      "teach": "One piece, two jobs — overload it.",
      "hint": "Attack both jobs.",
      "fen": "4k3/8/8/8/8/8/3r4/3QK2R w - - 0 1",
      "goal": "win",
      "theme": "Overload",
      "about": "Overload — Find the best teaching move.",
      "desc": "One piece, two jobs — overload it. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 219,
      "book": "masetti",
      "title": "Attraction",
      "teach": "Force the king onto a bad square.",
      "hint": "Attract with a check.",
      "fen": "5k2/8/8/8/8/4Q3/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Attraction",
      "about": "Attraction — Find the best teaching move.",
      "desc": "Force the king onto a bad square. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 220,
      "book": "masetti",
      "title": "Deflection",
      "teach": "Lure a defender off a key square.",
      "hint": "Deflect, then strike.",
      "fen": "4k3/3r4/8/8/8/8/8/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Deflection",
      "about": "Deflection — Find the best teaching move.",
      "desc": "Lure a defender off a key square. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 221,
      "book": "masetti",
      "title": "Clearance",
      "teach": "Vacate a square for a stronger piece.",
      "hint": "Clear with tempo.",
      "fen": "4k3/8/8/8/8/4N3/4Q3/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Clearance",
      "about": "Clearance — Find the best teaching move.",
      "desc": "Vacate a square for a stronger piece. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 222,
      "book": "masetti",
      "title": "Hanging Piece",
      "teach": "Unprotected piece — take it safely.",
      "hint": "Capture the hanging rook.",
      "fen": "4k3/8/8/8/8/8/7r/4K2Q w - - 0 1",
      "goal": "win",
      "theme": "Hanging",
      "about": "Hanging — Find the best teaching move.",
      "desc": "Unprotected piece — take it safely. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 223,
      "book": "masetti",
      "title": "Two Attackers",
      "teach": "Attack more times than defended.",
      "hint": "Add attacker or take.",
      "fen": "4k3/8/8/3n4/8/8/3B4/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Count attackers",
      "about": "Count attackers — Find the best teaching move.",
      "desc": "Attack more times than defended. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 224,
      "book": "masetti",
      "title": "Back-Rank Threat",
      "teach": "Back-rank mate threat wins material or mates.",
      "hint": "Invade the back rank.",
      "fen": "6k1/5ppp/8/8/8/8/8/1R4K1 w - - 0 1",
      "goal": "win",
      "theme": "Back-rank threat",
      "about": "Back-rank threat — Find the best teaching move.",
      "desc": "Back-rank mate threat wins material or mates. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 225,
      "book": "masetti",
      "title": "Pin + Take",
      "teach": "Pin softens; capture finishes.",
      "hint": "Exploit the pin.",
      "fen": "4k3/8/5n2/8/8/8/4N3/2B1K3 w - - 0 1",
      "goal": "win",
      "theme": "Combo",
      "about": "Combo — Find the best teaching move.",
      "desc": "Pin softens; capture finishes. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 226,
      "book": "masetti",
      "title": "Capture with Check",
      "teach": "Take with check — tempo win.",
      "hint": "Capture that checks.",
      "fen": "4k3/8/8/8/8/8/3q4/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Check capture",
      "about": "Check capture — Find the best teaching move.",
      "desc": "Take with check — tempo win. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 227,
      "book": "masetti",
      "title": "Trapped Piece",
      "teach": "No safe squares — close the net.",
      "hint": "Trap the bishop.",
      "fen": "4k3/8/8/8/8/7b/6P1/4K2R w - - 0 1",
      "goal": "win",
      "theme": "Trap",
      "about": "Trap — Find the best teaching move.",
      "desc": "No safe squares — close the net. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 228,
      "book": "masetti",
      "title": "Promotion Tactic",
      "teach": "Queening wins.",
      "hint": "Promote the pawn.",
      "fen": "8/4P3/8/8/8/8/8/4k1K1 w - - 0 1",
      "goal": "win",
      "theme": "Promotion",
      "about": "Promotion — Find the best teaching move.",
      "desc": "Queening wins. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 229,
      "book": "masetti",
      "title": "X-Ray Attack",
      "teach": "Attack through a piece on a line.",
      "hint": "X-ray the target.",
      "fen": "4k3/8/8/8/8/8/4n3/4RK2 w - - 0 1",
      "goal": "win",
      "theme": "X-ray",
      "about": "X-ray — Find the best teaching move.",
      "desc": "Attack through a piece on a line. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 230,
      "book": "masetti",
      "title": "Quiet Threat",
      "teach": "A quiet move can be the killer.",
      "hint": "Find the quiet forcing move.",
      "fen": "6k1/5ppp/8/8/8/5Q2/8/6K1 w - - 0 1",
      "goal": "win",
      "theme": "Quiet move",
      "about": "Quiet move — Find the best teaching move.",
      "desc": "A quiet move can be the killer. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 231,
      "book": "masetti",
      "title": "Zwischenzug",
      "teach": "In-between check before the obvious capture.",
      "hint": "Check first.",
      "fen": "4k3/8/8/8/8/8/3q4/3QK2R w - - 0 1",
      "goal": "win",
      "theme": "Zwischenzug",
      "about": "Zwischenzug — Find the best teaching move.",
      "desc": "In-between check before the obvious capture. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 232,
      "book": "masetti",
      "title": "Desperado",
      "teach": "Doomed piece sells itself with check.",
      "hint": "Capture with check.",
      "fen": "4k3/8/8/8/8/8/8/3qK2Q w - - 0 1",
      "goal": "win",
      "theme": "Desperado",
      "about": "Desperado — Find the best teaching move.",
      "desc": "Doomed piece sells itself with check. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 233,
      "book": "masetti",
      "title": "Interference",
      "teach": "Block a defender's line.",
      "hint": "Interfere on the line.",
      "fen": "4k3/8/8/8/8/8/4n3/R3K2Q w - - 0 1",
      "goal": "win",
      "theme": "Interference",
      "about": "Interference — Find the best teaching move.",
      "desc": "Block a defender's line. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 234,
      "book": "masetti",
      "title": "Tactics Review · Fork",
      "teach": "Scan knight forks first.",
      "hint": "Deliver the fork.",
      "fen": "4k3/8/8/2n5/8/8/8/R2QK3 b - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best teaching move.",
      "desc": "Scan knight forks first. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 235,
      "book": "masetti",
      "title": "Tactics Review · Pin",
      "teach": "Pile on or take the pinned piece.",
      "hint": "Exploit the pin.",
      "fen": "4k3/4r3/8/8/8/8/8/4QK2 w - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best teaching move.",
      "desc": "Pile on or take the pinned piece. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 236,
      "book": "masetti",
      "title": "Knight Fork Drill B",
      "teach": "Royal fork: king and queen.",
      "hint": "Knight check that eyes the queen.",
      "fen": "4k3/8/8/3n4/8/8/8/3QK3 b - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Royal fork: king and queen. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 237,
      "book": "masetti",
      "title": "Knight Fork Drill C",
      "teach": "Fork on the queenside heavy pieces.",
      "hint": "Knight into the pocket.",
      "fen": "4k3/8/8/8/2n5/8/8/R3K3 b - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Fork on the queenside heavy pieces. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 238,
      "book": "masetti",
      "title": "Knight Fork Drill D",
      "teach": "King and rook on opposite wings — one hop hits both.",
      "hint": "The forking square.",
      "fen": "4k3/8/8/8/8/8/1n6/R3K3 b - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "King and rook on opposite wings — one hop hits both. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 239,
      "book": "masetti",
      "title": "Knight Fork Drill E",
      "teach": "Central knight fork vs king and queen.",
      "hint": "Jump to the fork.",
      "fen": "4k3/8/8/8/3n4/8/8/3QK3 b - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Central knight fork vs king and queen. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 240,
      "book": "masetti",
      "title": "Pawn Fork Drill A",
      "teach": "Pawn advances forking two knights.",
      "hint": "Push e4–e5 style.",
      "fen": "4k3/8/8/2n1n3/3P4/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Pawn advances forking two knights. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 241,
      "book": "masetti",
      "title": "Pawn Fork Drill B",
      "teach": "Pawn forks rook and knight.",
      "hint": "The forking pawn push.",
      "fen": "4k3/8/8/3r1n2/4P3/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Pawn forks rook and knight. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 242,
      "book": "masetti",
      "title": "Queen Fork Drill A",
      "teach": "Queen checks and attacks an undefended rook.",
      "hint": "Check that also hits the rook.",
      "fen": "4k3/8/8/8/8/8/r7/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Queen checks and attacks an undefended rook. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 243,
      "book": "masetti",
      "title": "Queen Fork Drill B",
      "teach": "Queen forks king and bishop.",
      "hint": "Queen check with a second target.",
      "fen": "4k3/8/8/8/8/7b/8/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Queen forks king and bishop. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 244,
      "book": "masetti",
      "title": "Bishop Fork Idea",
      "teach": "Bishop hits two targets on diagonals.",
      "hint": "Long diagonal double attack.",
      "fen": "4k3/8/8/8/8/8/7r/2B1K3 w - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Bishop hits two targets on diagonals. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 245,
      "book": "masetti",
      "title": "King+Queen Fork Net",
      "teach": "Use a check that also threatens material.",
      "hint": "The double-purpose check.",
      "fen": "4k3/8/8/8/8/8/6r1/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Use a check that also threatens material. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 246,
      "book": "masetti",
      "title": "Family Fork Setup",
      "teach": "Knight eyes king, queen, and rook geometry.",
      "hint": "Hop into the family fork.",
      "fen": "2q1k3/8/8/8/3n4/8/8/R3K3 b - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Knight eyes king, queen, and rook geometry. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 247,
      "book": "masetti",
      "title": "File Pin Drill A",
      "teach": "Absolute pin on the e-file — pile on.",
      "hint": "Attack the pinned piece.",
      "fen": "4k3/4n3/8/8/8/8/8/4RK2 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Absolute pin on the e-file — pile on. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 248,
      "book": "masetti",
      "title": "File Pin Drill B",
      "teach": "Pinned bishop on the file cannot leave the king.",
      "hint": "Take or add pressure.",
      "fen": "4k3/8/8/8/8/8/4b3/4QK2 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Pinned bishop on the file cannot leave the king. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 249,
      "book": "masetti",
      "title": "Diagonal Pin A",
      "teach": "Bishop pins knight to king.",
      "hint": "Capture or pile on.",
      "fen": "4k3/8/5n2/8/8/8/8/2B1K3 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Bishop pins knight to king. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 250,
      "book": "masetti",
      "title": "Diagonal Pin B",
      "teach": "Long-diagonal pin vs queen and king idea.",
      "hint": "Exploit the pinned line.",
      "fen": "4k3/8/8/8/8/5q2/8/2B1K3 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Long-diagonal pin vs queen and king idea. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 251,
      "book": "masetti",
      "title": "Relative Pin Drill",
      "teach": "Relative pin — the piece behind hangs if it moves.",
      "hint": "Take the hanging unit.",
      "fen": "4k3/8/8/8/8/4q3/4N3/4RK2 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Relative pin — the piece behind hangs if it moves. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 252,
      "book": "masetti",
      "title": "Cross Pin Idea",
      "teach": "Two pins meet — one must give.",
      "hint": "Choose the winning pressure.",
      "fen": "4k3/4n3/8/8/8/8/4B3/4QK2 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Two pins meet — one must give. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 253,
      "book": "masetti",
      "title": "Pin Then Capture",
      "teach": "Softened by a pin — take safely.",
      "hint": "Capture the pinned piece.",
      "fen": "4k3/8/8/4n3/8/8/8/2B1K3 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Softened by a pin — take safely. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 254,
      "book": "masetti",
      "title": "Pin Break Threat",
      "teach": "Threaten to win the pinned piece next.",
      "hint": "Add a second attacker.",
      "fen": "4k3/4r3/8/8/8/8/8/3QRK2 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Threaten to win the pinned piece next. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 255,
      "book": "masetti",
      "title": "Queen Pin File",
      "teach": "Queen pins down the file to the king.",
      "hint": "Use the pin immediately.",
      "fen": "4k3/4n3/8/8/8/8/8/4QK2 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Queen pins down the file to the king. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 256,
      "book": "masetti",
      "title": "Queen Skewer File",
      "teach": "Check the king; take the piece behind.",
      "hint": "Queen skewer on the file.",
      "fen": "4k3/8/8/8/8/8/8/3QK2r w - - 0 1",
      "goal": "win",
      "theme": "Skewer",
      "about": "Skewer — Find the best teaching move.",
      "desc": "Check the king; take the piece behind. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 257,
      "book": "masetti",
      "title": "Bishop Skewer",
      "teach": "Bishop skewers king and rook.",
      "hint": "Diagonal skewer check.",
      "fen": "4k3/8/8/8/8/8/8/r3K2B w - - 0 1",
      "goal": "win",
      "theme": "Skewer",
      "about": "Skewer — Find the best teaching move.",
      "desc": "Bishop skewers king and rook. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 258,
      "book": "masetti",
      "title": "Rook Skewer Rank",
      "teach": "Rook skewers king and queen on a rank.",
      "hint": "Rook to the back rank.",
      "fen": "4k2q/8/8/8/8/8/8/3R2K1 w - - 0 1",
      "goal": "win",
      "theme": "Skewer",
      "about": "Skewer — Find the best teaching move.",
      "desc": "Rook skewers king and queen on a rank. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 259,
      "book": "masetti",
      "title": "Rook Skewer File",
      "teach": "Rook check; queen sits behind the king.",
      "hint": "Skewer on the open file.",
      "fen": "4k3/8/8/8/8/8/8/3RKq2 w - - 0 1",
      "goal": "win",
      "theme": "Skewer",
      "about": "Skewer — Find the best teaching move.",
      "desc": "Rook check; queen sits behind the king. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 260,
      "book": "masetti",
      "title": "Queen Skewer Diagonal",
      "teach": "Queen checks on a diagonal with a prize behind.",
      "hint": "Diagonal skewer.",
      "fen": "4k3/8/8/8/8/8/7r/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Skewer",
      "about": "Skewer — Find the best teaching move.",
      "desc": "Queen checks on a diagonal with a prize behind. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 261,
      "book": "masetti",
      "title": "Bishop Skewer Deep",
      "teach": "Long bishop check through the king line.",
      "hint": "Find the skewer square.",
      "fen": "4k3/8/8/8/8/8/8/1r2K2B w - - 0 1",
      "goal": "win",
      "theme": "Skewer",
      "about": "Skewer — Find the best teaching move.",
      "desc": "Long bishop check through the king line. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 262,
      "book": "masetti",
      "title": "Skewer Review B",
      "teach": "Rank skewer with the rook.",
      "hint": "Slide to the mating/skewer rank.",
      "fen": "q3k3/8/8/8/8/8/8/3R2K1 w - - 0 1",
      "goal": "win",
      "theme": "Skewer",
      "about": "Skewer — Find the best teaching move.",
      "desc": "Rank skewer with the rook. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 263,
      "book": "masetti",
      "title": "Discovered Attack A",
      "teach": "Move the knight; the rook behind strikes.",
      "hint": "Discover with tempo.",
      "fen": "4k3/8/8/8/8/4N3/8/3RR1K1 w - - 0 1",
      "goal": "win",
      "theme": "Discovery",
      "about": "Discovery — Find the best teaching move.",
      "desc": "Move the knight; the rook behind strikes. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 264,
      "book": "masetti",
      "title": "Discovered Attack B",
      "teach": "Clear the bishop line onto a target.",
      "hint": "Discover the attack.",
      "fen": "4k3/8/8/8/4B3/8/8/4RK2 w - - 0 1",
      "goal": "win",
      "theme": "Discovery",
      "about": "Discovery — Find the best teaching move.",
      "desc": "Clear the bishop line onto a target. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 265,
      "book": "masetti",
      "title": "Discovered Check A",
      "teach": "Slide away and give discovered check.",
      "hint": "Discover check.",
      "fen": "4k3/8/8/8/4N3/8/8/4RK2 w - - 0 1",
      "goal": "win",
      "theme": "Discovery",
      "about": "Discovery — Find the best teaching move.",
      "desc": "Slide away and give discovered check. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 266,
      "book": "masetti",
      "title": "Discovered Check B",
      "teach": "Bishop vacates; rook checks.",
      "hint": "The discovering move.",
      "fen": "4k3/8/8/8/8/4B3/8/4RK2 w - - 0 1",
      "goal": "win",
      "theme": "Discovery",
      "about": "Discovery — Find the best teaching move.",
      "desc": "Bishop vacates; rook checks. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 267,
      "book": "masetti",
      "title": "Double Check Drill",
      "teach": "Two pieces check — king must move.",
      "hint": "Give the double check.",
      "fen": "4k3/8/8/8/4N3/8/8/4RK2 w - - 0 1",
      "goal": "win",
      "theme": "Double check",
      "about": "Double check — Find the best teaching move.",
      "desc": "Two pieces check — king must move. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 268,
      "book": "masetti",
      "title": "Remove Guard A",
      "teach": "Take the defender of a key piece.",
      "hint": "Remove the guard.",
      "fen": "4k3/8/8/3n4/8/8/3N4/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Remove guard",
      "about": "Remove guard — Find the best teaching move.",
      "desc": "Take the defender of a key piece. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 269,
      "book": "masetti",
      "title": "Remove Guard B",
      "teach": "Deflect or capture the protector.",
      "hint": "Eliminate the guard first.",
      "fen": "4k3/8/8/8/3n4/8/3B4/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Remove guard",
      "about": "Remove guard — Find the best teaching move.",
      "desc": "Deflect or capture the protector. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 270,
      "book": "masetti",
      "title": "Overload A",
      "teach": "One piece defends two jobs — overload it.",
      "hint": "Attack both jobs.",
      "fen": "4k3/8/8/8/8/8/3r4/3QK2R w - - 0 1",
      "goal": "win",
      "theme": "Overload",
      "about": "Overload — Find the best teaching move.",
      "desc": "One piece defends two jobs — overload it. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 271,
      "book": "masetti",
      "title": "Overload B",
      "teach": "The defender cannot cover everything.",
      "hint": "Force the overload.",
      "fen": "4k3/8/8/8/8/8/2rr4/2Q1K2R w - - 0 1",
      "goal": "win",
      "theme": "Overload",
      "about": "Overload — Find the best teaching move.",
      "desc": "The defender cannot cover everything. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 272,
      "book": "masetti",
      "title": "Deflection A",
      "teach": "Lure a defender off a key square.",
      "hint": "Deflect, then strike.",
      "fen": "4k3/3r4/8/8/8/8/8/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Deflection",
      "about": "Deflection — Find the best teaching move.",
      "desc": "Lure a defender off a key square. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 273,
      "book": "masetti",
      "title": "Deflection B",
      "teach": "Pull the guard away with a check or sacrifice idea.",
      "hint": "Deflect the defender.",
      "fen": "4k3/8/3r4/8/8/8/8/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Deflection",
      "about": "Deflection — Find the best teaching move.",
      "desc": "Pull the guard away with a check or sacrifice idea. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 274,
      "book": "masetti",
      "title": "Attraction A",
      "teach": "Force the king onto a bad square.",
      "hint": "Attract with a check.",
      "fen": "5k2/8/8/8/8/4Q3/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Attraction",
      "about": "Attraction — Find the best teaching move.",
      "desc": "Force the king onto a bad square. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 275,
      "book": "masetti",
      "title": "Attraction B",
      "teach": "Pull the king into a fork net.",
      "hint": "Attract, then fork.",
      "fen": "5k2/8/8/8/8/5N2/5Q2/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Attraction",
      "about": "Attraction — Find the best teaching move.",
      "desc": "Pull the king into a fork net. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 276,
      "book": "masetti",
      "title": "Clearance A",
      "teach": "Vacate a square for a stronger piece.",
      "hint": "Clear with tempo.",
      "fen": "4k3/8/8/8/8/4N3/4Q3/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Clearance",
      "about": "Clearance — Find the best teaching move.",
      "desc": "Vacate a square for a stronger piece. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 277,
      "book": "masetti",
      "title": "Clearance B",
      "teach": "Open a line by moving the blocker.",
      "hint": "Clear the line.",
      "fen": "4k3/8/8/8/8/3N4/3Q4/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Clearance",
      "about": "Clearance — Find the best teaching move.",
      "desc": "Open a line by moving the blocker. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 278,
      "book": "masetti",
      "title": "Interference A",
      "teach": "Block a defender’s line.",
      "hint": "Interfere on the defense.",
      "fen": "4k3/8/8/8/8/8/4n3/R3K2Q w - - 0 1",
      "goal": "win",
      "theme": "Interference",
      "about": "Interference — Find the best teaching move.",
      "desc": "Block a defender’s line. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 279,
      "book": "masetti",
      "title": "Interference B",
      "teach": "Drop a piece on the defensive ray.",
      "hint": "Cut the defense.",
      "fen": "4k3/8/8/8/8/8/3n4/R2QK3 w - - 0 1",
      "goal": "win",
      "theme": "Interference",
      "about": "Interference — Find the best teaching move.",
      "desc": "Drop a piece on the defensive ray. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 280,
      "book": "masetti",
      "title": "Zwischenzug A",
      "teach": "In-between check before the obvious capture.",
      "hint": "Check first.",
      "fen": "4k3/8/8/8/8/8/3q4/3QK2R w - - 0 1",
      "goal": "win",
      "theme": "Zwischenzug",
      "about": "Zwischenzug — Find the best teaching move.",
      "desc": "In-between check before the obvious capture. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 281,
      "book": "masetti",
      "title": "Zwischenzug B",
      "teach": "Don’t recapture yet — insert a check.",
      "hint": "The in-between move.",
      "fen": "4k3/8/8/8/8/8/2q5/2Q1K2R w - - 0 1",
      "goal": "win",
      "theme": "Zwischenzug",
      "about": "Zwischenzug — Find the best teaching move.",
      "desc": "Don’t recapture yet — insert a check. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 282,
      "book": "masetti",
      "title": "Hanging Piece A",
      "teach": "Unprotected rook — take it safely.",
      "hint": "Capture the hanging rook.",
      "fen": "4k3/8/8/8/8/8/7r/4K2Q w - - 0 1",
      "goal": "win",
      "theme": "Hanging",
      "about": "Hanging — Find the best teaching move.",
      "desc": "Unprotected rook — take it safely. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 283,
      "book": "masetti",
      "title": "Hanging Piece B",
      "teach": "Loose bishop sits for the taking.",
      "hint": "Take the hanging piece.",
      "fen": "4k3/8/8/8/8/7b/8/4K2Q w - - 0 1",
      "goal": "win",
      "theme": "Hanging",
      "about": "Hanging — Find the best teaching move.",
      "desc": "Loose bishop sits for the taking. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 284,
      "book": "masetti",
      "title": "Count Attackers A",
      "teach": "Attack more times than defended.",
      "hint": "Add attacker or take.",
      "fen": "4k3/8/8/3n4/8/8/3B4/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Count attackers",
      "about": "Count attackers — Find the best teaching move.",
      "desc": "Attack more times than defended. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 285,
      "book": "masetti",
      "title": "Count Attackers B",
      "teach": "Two attackers vs one defender.",
      "hint": "Win the exchange of attackers.",
      "fen": "4k3/8/8/8/3n4/8/3N4/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Count attackers",
      "about": "Count attackers — Find the best teaching move.",
      "desc": "Two attackers vs one defender. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 286,
      "book": "masetti",
      "title": "Trapped Piece A",
      "teach": "Bishop has no safe squares — close the net.",
      "hint": "Trap it.",
      "fen": "4k3/8/8/8/8/7b/6P1/4K2R w - - 0 1",
      "goal": "win",
      "theme": "Trap",
      "about": "Trap — Find the best teaching move.",
      "desc": "Bishop has no safe squares — close the net. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 287,
      "book": "masetti",
      "title": "Trapped Piece B",
      "teach": "Knight edge trap.",
      "hint": "Corner the knight.",
      "fen": "4k3/8/8/8/7n/6P1/8/4K2R w - - 0 1",
      "goal": "win",
      "theme": "Trap",
      "about": "Trap — Find the best teaching move.",
      "desc": "Knight edge trap. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 288,
      "book": "masetti",
      "title": "Back-Rank Threat A",
      "teach": "Back-rank mate threat wins material or mates.",
      "hint": "Invade the 8th.",
      "fen": "6k1/5ppp/8/8/8/8/8/1R4K1 w - - 0 1",
      "goal": "win",
      "theme": "Back-rank threat",
      "about": "Back-rank threat — Find the best teaching move.",
      "desc": "Back-rank mate threat wins material or mates. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 289,
      "book": "masetti",
      "title": "Back-Rank Threat B",
      "teach": "Same idea from the other file.",
      "hint": "Back-rank invasion.",
      "fen": "6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1",
      "goal": "win",
      "theme": "Back-rank threat",
      "about": "Back-rank threat — Find the best teaching move.",
      "desc": "Same idea from the other file. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 290,
      "book": "masetti",
      "title": "Promotion Drill A",
      "teach": "Queening wins.",
      "hint": "Promote the pawn.",
      "fen": "8/4P3/8/8/8/8/8/4k1K1 w - - 0 1",
      "goal": "win",
      "theme": "Promotion",
      "about": "Promotion — Find the best teaching move.",
      "desc": "Queening wins. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 291,
      "book": "masetti",
      "title": "Promotion Drill B",
      "teach": "Promote with check or tempo.",
      "hint": "Push through.",
      "fen": "8/5P2/8/8/8/8/8/5k1K w - - 0 1",
      "goal": "win",
      "theme": "Promotion",
      "about": "Promotion — Find the best teaching move.",
      "desc": "Promote with check or tempo. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 292,
      "book": "masetti",
      "title": "Desperado A",
      "teach": "Doomed piece sells itself with check.",
      "hint": "Capture with check.",
      "fen": "4k3/8/8/8/8/8/8/3qK2Q w - - 0 1",
      "goal": "win",
      "theme": "Desperado",
      "about": "Desperado — Find the best teaching move.",
      "desc": "Doomed piece sells itself with check. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 293,
      "book": "masetti",
      "title": "Desperado B",
      "teach": "Take as much as you can before the piece falls.",
      "hint": "Max-damage capture.",
      "fen": "4k3/8/8/8/8/8/3q4/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Desperado",
      "about": "Desperado — Find the best teaching move.",
      "desc": "Take as much as you can before the piece falls. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 294,
      "book": "masetti",
      "title": "X-Ray A",
      "teach": "Attack through a piece on a line.",
      "hint": "X-ray the target.",
      "fen": "4k3/8/8/8/8/8/4n3/4RK2 w - - 0 1",
      "goal": "win",
      "theme": "X-ray",
      "about": "X-ray — Find the best teaching move.",
      "desc": "Attack through a piece on a line. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 295,
      "book": "masetti",
      "title": "Quiet Threat A",
      "teach": "A quiet move can be the killer.",
      "hint": "Find the quiet forcing move.",
      "fen": "6k1/5ppp/8/8/8/5Q2/8/6K1 w - - 0 1",
      "goal": "win",
      "theme": "Quiet move",
      "about": "Quiet move — Find the best teaching move.",
      "desc": "A quiet move can be the killer. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 296,
      "book": "masetti",
      "title": "Quiet Threat B",
      "teach": "Threaten mate without checking yet.",
      "hint": "The quiet killer.",
      "fen": "6k1/5ppp/8/8/8/7Q/8/6K1 w - - 0 1",
      "goal": "win",
      "theme": "Quiet move",
      "about": "Quiet move — Find the best teaching move.",
      "desc": "Threaten mate without checking yet. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 297,
      "book": "masetti",
      "title": "Pin + Fork Combo A",
      "teach": "Pin softens; fork finishes.",
      "hint": "Use the pin, then fork.",
      "fen": "4k3/8/5n2/8/8/8/4N3/2B1K3 w - - 0 1",
      "goal": "win",
      "theme": "Combo",
      "about": "Combo — Find the best teaching move.",
      "desc": "Pin softens; fork finishes. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 298,
      "book": "masetti",
      "title": "Pin + Fork Combo B",
      "teach": "Pinned piece cannot recapture the fork.",
      "hint": "Combine themes.",
      "fen": "4k3/4n3/8/8/8/5N2/8/4RK2 w - - 0 1",
      "goal": "win",
      "theme": "Combo",
      "about": "Combo — Find the best teaching move.",
      "desc": "Pinned piece cannot recapture the fork. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 299,
      "book": "masetti",
      "title": "Check Capture Drill",
      "teach": "Take with check — tempo win.",
      "hint": "Capture that checks.",
      "fen": "4k3/8/8/8/8/8/3q4/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Check capture",
      "about": "Check capture — Find the best teaching move.",
      "desc": "Take with check — tempo win. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 300,
      "book": "masetti",
      "title": "Double Attack Review",
      "teach": "Two threats at once — only one can be stopped.",
      "hint": "Create the double attack.",
      "fen": "4k3/8/8/8/8/8/1r5r/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Double attack",
      "about": "Double attack — Find the best teaching move.",
      "desc": "Two threats at once — only one can be stopped. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 301,
      "book": "masetti",
      "title": "Tactics Mix · Fork",
      "teach": "Scan knight forks first.",
      "hint": "Deliver the fork.",
      "fen": "4k3/8/8/2n5/8/8/8/R2QK3 b - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best teaching move.",
      "desc": "Scan knight forks first. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 302,
      "book": "masetti",
      "title": "Tactics Mix · Pin",
      "teach": "Pile on or take the pinned piece.",
      "hint": "Exploit the pin.",
      "fen": "4k3/4r3/8/8/8/8/8/4QK2 w - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best teaching move.",
      "desc": "Pile on or take the pinned piece. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 303,
      "book": "masetti",
      "title": "Tactics Mix · Discovery",
      "teach": "Reveal the rear piece with tempo.",
      "hint": "Discover.",
      "fen": "4k3/8/8/8/4B3/8/8/4RK2 w - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best teaching move.",
      "desc": "Reveal the rear piece with tempo. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 304,
      "book": "masetti",
      "title": "Knight Fork Wing",
      "teach": "Edge fork geometry.",
      "hint": "Fork on the wing.",
      "fen": "4k3/8/8/8/8/n7/8/R3K3 b - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Edge fork geometry. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 305,
      "book": "masetti",
      "title": "Knight Fork Center",
      "teach": "Central outpost fork.",
      "hint": "Jump to the center fork.",
      "fen": "4k3/8/8/8/3n4/8/8/R3K2Q b - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Central outpost fork. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 306,
      "book": "masetti",
      "title": "Pawn Fork Center",
      "teach": "e-pawn forks two minors.",
      "hint": "Push the pawn.",
      "fen": "4k3/8/8/2b1n3/3P4/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "e-pawn forks two minors. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 307,
      "book": "masetti",
      "title": "Queen Double Hit",
      "teach": "Queen attacks king-safe square and a hang.",
      "hint": "Double hit with the queen.",
      "fen": "4k3/8/8/8/8/8/6b1/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Queen attacks king-safe square and a hang. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 308,
      "book": "masetti",
      "title": "Absolute Pin Rank",
      "teach": "Pin on the back rank corridor.",
      "hint": "Exploit the pin.",
      "fen": "4k3/3r4/8/8/8/8/8/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Pin on the back rank corridor. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 309,
      "book": "masetti",
      "title": "Bishop Pin Long",
      "teach": "Pin from afar on the long diagonal.",
      "hint": "Pressure the pinned unit.",
      "fen": "4k3/8/8/5n2/8/8/8/B3K3 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Pin from afar on the long diagonal. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 310,
      "book": "masetti",
      "title": "Rook Pin File",
      "teach": "Rook pins knight to king on a file.",
      "hint": "Win the pinned knight.",
      "fen": "4k3/4n3/8/8/8/8/8/4R1K1 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Rook pins knight to king on a file. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 311,
      "book": "masetti",
      "title": "Skewer Rook Diagonal Prep",
      "teach": "Prepare a skewer line.",
      "hint": "Align then skewer.",
      "fen": "4k3/8/8/8/8/8/6r1/2B1K3 w - - 0 1",
      "goal": "win",
      "theme": "Skewer",
      "about": "Skewer — Find the best teaching move.",
      "desc": "Prepare a skewer line. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 312,
      "book": "masetti",
      "title": "Double Check Net",
      "teach": "Double check forces the king.",
      "hint": "Deliver double check.",
      "fen": "4k3/8/8/8/3N4/8/8/3R1K2 w - - 0 1",
      "goal": "win",
      "theme": "Double check",
      "about": "Double check — Find the best teaching move.",
      "desc": "Double check forces the king. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 313,
      "book": "masetti",
      "title": "Remove Protector",
      "teach": "Trade off the guardian.",
      "hint": "Remove the protector.",
      "fen": "4k3/8/8/8/2n5/8/2N5/2Q1K3 w - - 0 1",
      "goal": "win",
      "theme": "Remove guard",
      "about": "Remove guard — Find the best teaching move.",
      "desc": "Trade off the guardian. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 314,
      "book": "masetti",
      "title": "Overload Rook",
      "teach": "Rook overworked on defense.",
      "hint": "Hit the second duty.",
      "fen": "4k3/8/8/8/8/8/2r5/2Q1K2R w - - 0 1",
      "goal": "win",
      "theme": "Overload",
      "about": "Overload — Find the best teaching move.",
      "desc": "Rook overworked on defense. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 315,
      "book": "masetti",
      "title": "Deflect Rook",
      "teach": "Deflect the rook from a key square.",
      "hint": "Lure it away.",
      "fen": "4k3/8/2r5/8/8/8/8/2Q1K3 w - - 0 1",
      "goal": "win",
      "theme": "Deflection",
      "about": "Deflection — Find the best teaching move.",
      "desc": "Deflect the rook from a key square. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 316,
      "book": "masetti",
      "title": "Attract to Fork",
      "teach": "Attract the king into a knight fork.",
      "hint": "Check that attracts.",
      "fen": "6k1/8/8/8/5N2/8/5Q2/6K1 w - - 0 1",
      "goal": "win",
      "theme": "Attraction",
      "about": "Attraction — Find the best teaching move.",
      "desc": "Attract the king into a knight fork. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 317,
      "book": "masetti",
      "title": "Clear for Queen",
      "teach": "Clear so the queen can enter.",
      "hint": "Vacate with gain.",
      "fen": "4k3/8/8/8/8/3B4/3Q4/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Clearance",
      "about": "Clearance — Find the best teaching move.",
      "desc": "Clear so the queen can enter. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 318,
      "book": "masetti",
      "title": "Interfere Defense",
      "teach": "Block the defender’s sight.",
      "hint": "Interference drop.",
      "fen": "4k3/8/8/8/8/4n3/8/R3K2Q w - - 0 1",
      "goal": "win",
      "theme": "Interference",
      "about": "Interference — Find the best teaching move.",
      "desc": "Block the defender’s sight. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 319,
      "book": "masetti",
      "title": "In-Between Check",
      "teach": "Zwischenzug before trading.",
      "hint": "Check in between.",
      "fen": "4k3/8/8/8/8/8/2q5/2QK3R w - - 0 1",
      "goal": "win",
      "theme": "Zwischenzug",
      "about": "Zwischenzug — Find the best teaching move.",
      "desc": "Zwischenzug before trading. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 320,
      "book": "masetti",
      "title": "Loose Piece Take",
      "teach": "Take the loose piece now.",
      "hint": "Safe capture.",
      "fen": "4k3/8/8/8/8/6r1/8/4K1Q1 w - - 0 1",
      "goal": "win",
      "theme": "Hanging",
      "about": "Hanging — Find the best teaching move.",
      "desc": "Take the loose piece now. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 321,
      "book": "masetti",
      "title": "Two vs One",
      "teach": "Two attackers beat one defender.",
      "hint": "Take on the overloaded square.",
      "fen": "4k3/8/8/8/4n3/8/4B3/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Count attackers",
      "about": "Count attackers — Find the best teaching move.",
      "desc": "Two attackers beat one defender. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 322,
      "book": "masetti",
      "title": "Trap the Bishop",
      "teach": "Shut the door on the bishop.",
      "hint": "Close the net.",
      "fen": "4k3/8/8/8/6b1/5P2/8/4K2R w - - 0 1",
      "goal": "win",
      "theme": "Trap",
      "about": "Trap — Find the best teaching move.",
      "desc": "Shut the door on the bishop. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 323,
      "book": "masetti",
      "title": "Back Rank Pressure",
      "teach": "Threaten mate to win material.",
      "hint": "Back-rank threat.",
      "fen": "5rk1/5ppp/8/8/8/8/8/1R4K1 w - - 0 1",
      "goal": "win",
      "theme": "Back-rank threat",
      "about": "Back-rank threat — Find the best teaching move.",
      "desc": "Threaten mate to win material. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 324,
      "book": "masetti",
      "title": "Promote Now",
      "teach": "Promotion is the tactic.",
      "hint": "Queen the pawn.",
      "fen": "8/3P4/8/8/8/8/8/3k1K2 w - - 0 1",
      "goal": "win",
      "theme": "Promotion",
      "about": "Promotion — Find the best teaching move.",
      "desc": "Promotion is the tactic. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 325,
      "book": "masetti",
      "title": "Desperado Queen",
      "teach": "Queen takes with check before dying.",
      "hint": "Check capture.",
      "fen": "4k3/8/8/8/8/8/8/2q1K2Q w - - 0 1",
      "goal": "win",
      "theme": "Desperado",
      "about": "Desperado — Find the best teaching move.",
      "desc": "Queen takes with check before dying. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 326,
      "book": "masetti",
      "title": "X-Ray Rook",
      "teach": "Rook x-rays through a knight.",
      "hint": "Pressure behind.",
      "fen": "4k3/8/8/8/8/8/3n4/3RK3 w - - 0 1",
      "goal": "win",
      "theme": "X-ray",
      "about": "X-ray — Find the best teaching move.",
      "desc": "Rook x-rays through a knight. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 327,
      "book": "masetti",
      "title": "Quiet Mate Threat",
      "teach": "Quiet move threatens unstoppable mate.",
      "hint": "The quiet threat.",
      "fen": "6k1/5ppp/8/8/8/4Q3/8/6K1 w - - 0 1",
      "goal": "win",
      "theme": "Quiet move",
      "about": "Quiet move — Find the best teaching move.",
      "desc": "Quiet move threatens unstoppable mate. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 328,
      "book": "masetti",
      "title": "Combo Pin Capture",
      "teach": "Pin then take.",
      "hint": "Finish the combo.",
      "fen": "4k3/8/4n3/8/8/8/8/2B1K2R w - - 0 1",
      "goal": "win",
      "theme": "Combo",
      "about": "Combo — Find the best teaching move.",
      "desc": "Pin then take. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 329,
      "book": "masetti",
      "title": "Final Fork Review",
      "teach": "One more knight fork scan.",
      "hint": "Fork it.",
      "fen": "4k3/8/8/8/1n6/8/8/R2QK3 b - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best teaching move.",
      "desc": "One more knight fork scan. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 330,
      "book": "masetti",
      "title": "Final Pin Review",
      "teach": "One more pin exploit.",
      "hint": "Win with the pin.",
      "fen": "4k3/8/4r3/8/8/8/8/4QK2 w - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best teaching move.",
      "desc": "One more pin exploit. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 331,
      "book": "masetti",
      "title": "Final Skewer Review",
      "teach": "One more skewer.",
      "hint": "Skewer the line.",
      "fen": "4k2r/8/8/8/8/8/8/3Q2K1 w - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best teaching move.",
      "desc": "One more skewer. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 332,
      "book": "masetti",
      "title": "Final Discovery Review",
      "teach": "One more discovery.",
      "hint": "Reveal the attack.",
      "fen": "4k3/8/8/8/8/4N3/8/4RK2 w - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best teaching move.",
      "desc": "One more discovery. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 333,
      "book": "masetti",
      "title": "Final Double Attack",
      "teach": "End with a clean double attack.",
      "hint": "Two threats.",
      "fen": "4k3/8/8/8/8/8/r6r/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Double attack",
      "about": "Double attack — Find the best teaching move.",
      "desc": "End with a clean double attack. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 334,
      "book": "masetti",
      "title": "Final Check Capture",
      "teach": "Capture with check to finish the set.",
      "hint": "Take with check.",
      "fen": "4k3/8/8/8/8/8/2q5/2Q1K3 w - - 0 1",
      "goal": "win",
      "theme": "Check capture",
      "about": "Check capture — Find the best teaching move.",
      "desc": "Capture with check to finish the set. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 335,
      "book": "masetti",
      "title": "Final Overload",
      "teach": "Last overload drill.",
      "hint": "Overload the defender.",
      "fen": "4k3/8/8/8/8/8/1r6/1Q2K2R w - - 0 1",
      "goal": "win",
      "theme": "Overload",
      "about": "Overload — Find the best teaching move.",
      "desc": "Last overload drill. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 336,
      "book": "masetti",
      "title": "Fork Drill 136",
      "teach": "Knight checks the king and attacks a rook.",
      "hint": "Knight to the fork square.",
      "fen": "4k3/8/8/8/8/2n5/8/R3K3 b - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Knight checks the king and attacks a rook. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 337,
      "book": "masetti",
      "title": "Fork Drill 137",
      "teach": "Fork king and queen with one hop.",
      "hint": "Knight check that hits the queen.",
      "fen": "4k3/8/8/8/4n3/8/8/3QK3 b - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Fork king and queen with one hop. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 338,
      "book": "masetti",
      "title": "Fork Drill 138",
      "teach": "King and rook in the same knight net.",
      "hint": "Knight into the pocket.",
      "fen": "4k3/8/8/3n4/8/8/8/R3K3 b - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "King and rook in the same knight net. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 339,
      "book": "masetti",
      "title": "Fork Drill 139",
      "teach": "Knight checks king and eyes the queen.",
      "hint": "The royal fork hop.",
      "fen": "4k3/8/4n3/8/8/8/8/3QK3 b - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Knight checks king and eyes the queen. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 340,
      "book": "masetti",
      "title": "Fork Drill 140",
      "teach": "Pawn hits two pieces at once.",
      "hint": "Push the forking pawn.",
      "fen": "4k3/8/8/3n1n2/4P3/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Pawn hits two pieces at once. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 341,
      "book": "masetti",
      "title": "Fork Drill 141",
      "teach": "Queen checks and attacks an undefended rook.",
      "hint": "Queen check that also hits the rook.",
      "fen": "4k3/8/8/8/8/8/1r6/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Queen checks and attacks an undefended rook. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 342,
      "book": "masetti",
      "title": "Pin Drill 142",
      "teach": "Pinned to the king — take or pile on.",
      "hint": "Exploit the pinned bishop.",
      "fen": "4k3/8/8/8/8/8/4b3/4QK2 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Pinned to the king — take or pile on. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 343,
      "book": "masetti",
      "title": "Pin Drill 143",
      "teach": "Pin on the file — add pressure.",
      "hint": "Attack the pinned knight.",
      "fen": "4k3/4n3/8/8/8/8/8/4RK2 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Pin on the file — add pressure. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 344,
      "book": "masetti",
      "title": "Pin Drill 144",
      "teach": "Pinned piece dare not move — take what hangs.",
      "hint": "Take the hanging unit.",
      "fen": "4k3/8/8/8/8/4q3/4N3/4RK2 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Pinned piece dare not move — take what hangs. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 345,
      "book": "masetti",
      "title": "Pin Drill 145",
      "teach": "Bishop pins knight to king.",
      "hint": "Take or pile on the knight.",
      "fen": "4k3/8/5n2/8/8/8/8/2B1K3 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Bishop pins knight to king. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 346,
      "book": "masetti",
      "title": "Skewer Drill 146",
      "teach": "Check the king; take the piece behind.",
      "hint": "Queen skewer on the file.",
      "fen": "4k3/8/8/8/8/8/8/3QK2r w - - 0 1",
      "goal": "win",
      "theme": "Skewer",
      "about": "Skewer — Find the best teaching move.",
      "desc": "Check the king; take the piece behind. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 347,
      "book": "masetti",
      "title": "Skewer Drill 147",
      "teach": "Bishop skewer: king in front, rook behind.",
      "hint": "Bishop check that skewers.",
      "fen": "4k3/8/8/8/8/8/8/r3K2B w - - 0 1",
      "goal": "win",
      "theme": "Skewer",
      "about": "Skewer — Find the best teaching move.",
      "desc": "Bishop skewer: king in front, rook behind. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 348,
      "book": "masetti",
      "title": "Skewer Drill 148",
      "teach": "Rook skewers king and queen on a rank.",
      "hint": "Rook to the 8th with skewer.",
      "fen": "4k2q/8/8/8/8/8/8/3R2K1 w - - 0 1",
      "goal": "win",
      "theme": "Skewer",
      "about": "Skewer — Find the best teaching move.",
      "desc": "Rook skewers king and queen on a rank. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 349,
      "book": "masetti",
      "title": "Discovery Drill 149",
      "teach": "Move the front piece; the rear piece strikes.",
      "hint": "Discover the attack.",
      "fen": "4k3/8/8/8/8/4N3/8/3RR1K1 w - - 0 1",
      "goal": "win",
      "theme": "Discovery",
      "about": "Discovery — Find the best teaching move.",
      "desc": "Move the front piece; the rear piece strikes. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 350,
      "book": "masetti",
      "title": "Discovery Drill 150",
      "teach": "Slide away — check appears behind.",
      "hint": "Discover check.",
      "fen": "4k3/8/8/8/4B3/8/8/4RK2 w - - 0 1",
      "goal": "win",
      "theme": "Discovery",
      "about": "Discovery — Find the best teaching move.",
      "desc": "Slide away — check appears behind. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 351,
      "book": "masetti",
      "title": "Double check Drill 151",
      "teach": "Two pieces check — king must move.",
      "hint": "Give double check.",
      "fen": "4k3/8/8/8/4N3/8/8/4RK2 w - - 0 1",
      "goal": "win",
      "theme": "Double check",
      "about": "Double check — Find the best teaching move.",
      "desc": "Two pieces check — king must move. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 352,
      "book": "masetti",
      "title": "Remove guard Drill 152",
      "teach": "Take the defender, then the prize.",
      "hint": "Remove the guard.",
      "fen": "4k3/8/8/3n4/8/8/3N4/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Remove guard",
      "about": "Remove guard — Find the best teaching move.",
      "desc": "Take the defender, then the prize. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 353,
      "book": "masetti",
      "title": "Overload Drill 153",
      "teach": "One piece, two jobs — overload it.",
      "hint": "Attack both jobs.",
      "fen": "4k3/8/8/8/8/8/3r4/3QK2R w - - 0 1",
      "goal": "win",
      "theme": "Overload",
      "about": "Overload — Find the best teaching move.",
      "desc": "One piece, two jobs — overload it. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 354,
      "book": "masetti",
      "title": "Attraction Drill 154",
      "teach": "Force the king onto a bad square.",
      "hint": "Attract with a check.",
      "fen": "5k2/8/8/8/8/4Q3/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Attraction",
      "about": "Attraction — Find the best teaching move.",
      "desc": "Force the king onto a bad square. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 355,
      "book": "masetti",
      "title": "Deflection Drill 155",
      "teach": "Lure a defender off a key square.",
      "hint": "Deflect, then strike.",
      "fen": "4k3/3r4/8/8/8/8/8/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Deflection",
      "about": "Deflection — Find the best teaching move.",
      "desc": "Lure a defender off a key square. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 356,
      "book": "masetti",
      "title": "Clearance Drill 156",
      "teach": "Vacate a square for a stronger piece.",
      "hint": "Clear with tempo.",
      "fen": "4k3/8/8/8/8/4N3/4Q3/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Clearance",
      "about": "Clearance — Find the best teaching move.",
      "desc": "Vacate a square for a stronger piece. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 357,
      "book": "masetti",
      "title": "Hanging Drill 157",
      "teach": "Unprotected piece — take it safely.",
      "hint": "Capture the hanging rook.",
      "fen": "4k3/8/8/8/8/8/7r/4K2Q w - - 0 1",
      "goal": "win",
      "theme": "Hanging",
      "about": "Hanging — Find the best teaching move.",
      "desc": "Unprotected piece — take it safely. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 358,
      "book": "masetti",
      "title": "Count attackers Drill 158",
      "teach": "Attack more times than defended.",
      "hint": "Add attacker or take.",
      "fen": "4k3/8/8/3n4/8/8/3B4/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Count attackers",
      "about": "Count attackers — Find the best teaching move.",
      "desc": "Attack more times than defended. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 359,
      "book": "masetti",
      "title": "Back-rank threat Drill 159",
      "teach": "Back-rank mate threat wins material or mates.",
      "hint": "Invade the back rank.",
      "fen": "6k1/5ppp/8/8/8/8/8/1R4K1 w - - 0 1",
      "goal": "win",
      "theme": "Back-rank threat",
      "about": "Back-rank threat — Find the best teaching move.",
      "desc": "Back-rank mate threat wins material or mates. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 360,
      "book": "masetti",
      "title": "Combo Drill 160",
      "teach": "Pin softens; capture finishes.",
      "hint": "Exploit the pin.",
      "fen": "4k3/8/5n2/8/8/8/4N3/2B1K3 w - - 0 1",
      "goal": "win",
      "theme": "Combo",
      "about": "Combo — Find the best teaching move.",
      "desc": "Pin softens; capture finishes. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 361,
      "book": "masetti",
      "title": "Check capture Drill 161",
      "teach": "Take with check — tempo win.",
      "hint": "Capture that checks.",
      "fen": "4k3/8/8/8/8/8/3q4/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Check capture",
      "about": "Check capture — Find the best teaching move.",
      "desc": "Take with check — tempo win. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 362,
      "book": "masetti",
      "title": "Trap Drill 162",
      "teach": "No safe squares — close the net.",
      "hint": "Trap the bishop.",
      "fen": "4k3/8/8/8/8/7b/6P1/4K2R w - - 0 1",
      "goal": "win",
      "theme": "Trap",
      "about": "Trap — Find the best teaching move.",
      "desc": "No safe squares — close the net. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 363,
      "book": "masetti",
      "title": "Promotion Drill 163",
      "teach": "Queening wins.",
      "hint": "Promote the pawn.",
      "fen": "8/4P3/8/8/8/8/8/4k1K1 w - - 0 1",
      "goal": "win",
      "theme": "Promotion",
      "about": "Promotion — Find the best teaching move.",
      "desc": "Queening wins. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 364,
      "book": "masetti",
      "title": "X-ray Drill 164",
      "teach": "Attack through a piece on a line.",
      "hint": "X-ray the target.",
      "fen": "4k3/8/8/8/8/8/4n3/4RK2 w - - 0 1",
      "goal": "win",
      "theme": "X-ray",
      "about": "X-ray — Find the best teaching move.",
      "desc": "Attack through a piece on a line. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 365,
      "book": "masetti",
      "title": "Quiet move Drill 165",
      "teach": "A quiet move can be the killer.",
      "hint": "Find the quiet forcing move.",
      "fen": "6k1/5ppp/8/8/8/5Q2/8/6K1 w - - 0 1",
      "goal": "win",
      "theme": "Quiet move",
      "about": "Quiet move — Find the best teaching move.",
      "desc": "A quiet move can be the killer. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 366,
      "book": "masetti",
      "title": "Zwischenzug Drill 166",
      "teach": "In-between check before the obvious capture.",
      "hint": "Check first.",
      "fen": "4k3/8/8/8/8/8/3q4/3QK2R w - - 0 1",
      "goal": "win",
      "theme": "Zwischenzug",
      "about": "Zwischenzug — Find the best teaching move.",
      "desc": "In-between check before the obvious capture. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 367,
      "book": "masetti",
      "title": "Desperado Drill 167",
      "teach": "Doomed piece sells itself with check.",
      "hint": "Capture with check.",
      "fen": "4k3/8/8/8/8/8/8/3qK2Q w - - 0 1",
      "goal": "win",
      "theme": "Desperado",
      "about": "Desperado — Find the best teaching move.",
      "desc": "Doomed piece sells itself with check. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 368,
      "book": "masetti",
      "title": "Interference Drill 168",
      "teach": "Block a defender's line.",
      "hint": "Interfere on the line.",
      "fen": "4k3/8/8/8/8/8/4n3/R3K2Q w - - 0 1",
      "goal": "win",
      "theme": "Interference",
      "about": "Interference — Find the best teaching move.",
      "desc": "Block a defender's line. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 369,
      "book": "masetti",
      "title": "Review Drill 169",
      "teach": "Scan knight forks first.",
      "hint": "Deliver the fork.",
      "fen": "4k3/8/8/2n5/8/8/8/R2QK3 b - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best teaching move.",
      "desc": "Scan knight forks first. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 370,
      "book": "masetti",
      "title": "Review Drill 170",
      "teach": "Pile on or take the pinned piece.",
      "hint": "Exploit the pin.",
      "fen": "4k3/4r3/8/8/8/8/8/4QK2 w - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best teaching move.",
      "desc": "Pile on or take the pinned piece. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 371,
      "book": "masetti",
      "title": "Fork Drill 171",
      "teach": "Royal fork: king and queen.",
      "hint": "Knight check that eyes the queen.",
      "fen": "4k3/8/8/3n4/8/8/8/3QK3 b - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Royal fork: king and queen. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 372,
      "book": "masetti",
      "title": "Fork Drill 172",
      "teach": "Fork on the queenside heavy pieces.",
      "hint": "Knight into the pocket.",
      "fen": "4k3/8/8/8/2n5/8/8/R3K3 b - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Fork on the queenside heavy pieces. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 373,
      "book": "masetti",
      "title": "Fork Drill 173",
      "teach": "King and rook on opposite wings — one hop hits both.",
      "hint": "The forking square.",
      "fen": "4k3/8/8/8/8/8/1n6/R3K3 b - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "King and rook on opposite wings — one hop hits both. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 374,
      "book": "masetti",
      "title": "Fork Drill 174",
      "teach": "Central knight fork vs king and queen.",
      "hint": "Jump to the fork.",
      "fen": "4k3/8/8/8/3n4/8/8/3QK3 b - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Central knight fork vs king and queen. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 375,
      "book": "masetti",
      "title": "Fork Drill 175",
      "teach": "Pawn advances forking two knights.",
      "hint": "Push e4–e5 style.",
      "fen": "4k3/8/8/2n1n3/3P4/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Pawn advances forking two knights. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 376,
      "book": "masetti",
      "title": "Fork Drill 176",
      "teach": "Pawn forks rook and knight.",
      "hint": "The forking pawn push.",
      "fen": "4k3/8/8/3r1n2/4P3/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Pawn forks rook and knight. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 377,
      "book": "masetti",
      "title": "Fork Drill 177",
      "teach": "Queen checks and attacks an undefended rook.",
      "hint": "Check that also hits the rook.",
      "fen": "4k3/8/8/8/8/8/r7/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Queen checks and attacks an undefended rook. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 378,
      "book": "masetti",
      "title": "Fork Drill 178",
      "teach": "Queen forks king and bishop.",
      "hint": "Queen check with a second target.",
      "fen": "4k3/8/8/8/8/7b/8/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Queen forks king and bishop. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 379,
      "book": "masetti",
      "title": "Fork Drill 179",
      "teach": "Bishop hits two targets on diagonals.",
      "hint": "Long diagonal double attack.",
      "fen": "4k3/8/8/8/8/8/7r/2B1K3 w - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Bishop hits two targets on diagonals. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 380,
      "book": "masetti",
      "title": "Fork Drill 180",
      "teach": "Use a check that also threatens material.",
      "hint": "The double-purpose check.",
      "fen": "4k3/8/8/8/8/8/6r1/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Use a check that also threatens material. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 381,
      "book": "masetti",
      "title": "Fork Drill 181",
      "teach": "Knight eyes king, queen, and rook geometry.",
      "hint": "Hop into the family fork.",
      "fen": "2q1k3/8/8/8/3n4/8/8/R3K3 b - - 0 1",
      "goal": "win",
      "theme": "Fork",
      "about": "Fork — Find the best teaching move.",
      "desc": "Knight eyes king, queen, and rook geometry. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 382,
      "book": "masetti",
      "title": "Pin Drill 182",
      "teach": "Absolute pin on the e-file — pile on.",
      "hint": "Attack the pinned piece.",
      "fen": "4k3/4n3/8/8/8/8/8/4RK2 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Absolute pin on the e-file — pile on. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 383,
      "book": "masetti",
      "title": "Pin Drill 183",
      "teach": "Pinned bishop on the file cannot leave the king.",
      "hint": "Take or add pressure.",
      "fen": "4k3/8/8/8/8/8/4b3/4QK2 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Pinned bishop on the file cannot leave the king. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 384,
      "book": "masetti",
      "title": "Pin Drill 184",
      "teach": "Bishop pins knight to king.",
      "hint": "Capture or pile on.",
      "fen": "4k3/8/5n2/8/8/8/8/2B1K3 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Bishop pins knight to king. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 385,
      "book": "masetti",
      "title": "Pin Drill 185",
      "teach": "Long-diagonal pin vs queen and king idea.",
      "hint": "Exploit the pinned line.",
      "fen": "4k3/8/8/8/8/5q2/8/2B1K3 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Long-diagonal pin vs queen and king idea. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 386,
      "book": "masetti",
      "title": "Pin Drill 186",
      "teach": "Relative pin — the piece behind hangs if it moves.",
      "hint": "Take the hanging unit.",
      "fen": "4k3/8/8/8/8/4q3/4N3/4RK2 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Relative pin — the piece behind hangs if it moves. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 387,
      "book": "masetti",
      "title": "Pin Drill 187",
      "teach": "Two pins meet — one must give.",
      "hint": "Choose the winning pressure.",
      "fen": "4k3/4n3/8/8/8/8/4B3/4QK2 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Two pins meet — one must give. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 388,
      "book": "masetti",
      "title": "Pin Drill 188",
      "teach": "Softened by a pin — take safely.",
      "hint": "Capture the pinned piece.",
      "fen": "4k3/8/8/4n3/8/8/8/2B1K3 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Softened by a pin — take safely. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 389,
      "book": "masetti",
      "title": "Pin Drill 189",
      "teach": "Threaten to win the pinned piece next.",
      "hint": "Add a second attacker.",
      "fen": "4k3/4r3/8/8/8/8/8/3QRK2 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Threaten to win the pinned piece next. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 390,
      "book": "masetti",
      "title": "Pin Drill 190",
      "teach": "Queen pins down the file to the king.",
      "hint": "Use the pin immediately.",
      "fen": "4k3/4n3/8/8/8/8/8/4QK2 w - - 0 1",
      "goal": "win",
      "theme": "Pin",
      "about": "Pin — Find the best teaching move.",
      "desc": "Queen pins down the file to the king. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 391,
      "book": "masetti",
      "title": "Skewer Drill 191",
      "teach": "Check the king; take the piece behind.",
      "hint": "Queen skewer on the file.",
      "fen": "4k3/8/8/8/8/8/8/3QK2r w - - 0 1",
      "goal": "win",
      "theme": "Skewer",
      "about": "Skewer — Find the best teaching move.",
      "desc": "Check the king; take the piece behind. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 392,
      "book": "masetti",
      "title": "Skewer Drill 192",
      "teach": "Bishop skewers king and rook.",
      "hint": "Diagonal skewer check.",
      "fen": "4k3/8/8/8/8/8/8/r3K2B w - - 0 1",
      "goal": "win",
      "theme": "Skewer",
      "about": "Skewer — Find the best teaching move.",
      "desc": "Bishop skewers king and rook. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 393,
      "book": "masetti",
      "title": "Skewer Drill 193",
      "teach": "Rook skewers king and queen on a rank.",
      "hint": "Rook to the back rank.",
      "fen": "4k2q/8/8/8/8/8/8/3R2K1 w - - 0 1",
      "goal": "win",
      "theme": "Skewer",
      "about": "Skewer — Find the best teaching move.",
      "desc": "Rook skewers king and queen on a rank. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 394,
      "book": "masetti",
      "title": "Skewer Drill 194",
      "teach": "Rook check; queen sits behind the king.",
      "hint": "Skewer on the open file.",
      "fen": "4k3/8/8/8/8/8/8/3RKq2 w - - 0 1",
      "goal": "win",
      "theme": "Skewer",
      "about": "Skewer — Find the best teaching move.",
      "desc": "Rook check; queen sits behind the king. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 395,
      "book": "masetti",
      "title": "Skewer Drill 195",
      "teach": "Queen checks on a diagonal with a prize behind.",
      "hint": "Diagonal skewer.",
      "fen": "4k3/8/8/8/8/8/7r/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Skewer",
      "about": "Skewer — Find the best teaching move.",
      "desc": "Queen checks on a diagonal with a prize behind. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 396,
      "book": "masetti",
      "title": "Skewer Drill 196",
      "teach": "Long bishop check through the king line.",
      "hint": "Find the skewer square.",
      "fen": "4k3/8/8/8/8/8/8/1r2K2B w - - 0 1",
      "goal": "win",
      "theme": "Skewer",
      "about": "Skewer — Find the best teaching move.",
      "desc": "Long bishop check through the king line. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 397,
      "book": "masetti",
      "title": "Skewer Drill 197",
      "teach": "Rank skewer with the rook.",
      "hint": "Slide to the mating/skewer rank.",
      "fen": "q3k3/8/8/8/8/8/8/3R2K1 w - - 0 1",
      "goal": "win",
      "theme": "Skewer",
      "about": "Skewer — Find the best teaching move.",
      "desc": "Rank skewer with the rook. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 398,
      "book": "masetti",
      "title": "Discovery Drill 198",
      "teach": "Move the knight; the rook behind strikes.",
      "hint": "Discover with tempo.",
      "fen": "4k3/8/8/8/8/4N3/8/3RR1K1 w - - 0 1",
      "goal": "win",
      "theme": "Discovery",
      "about": "Discovery — Find the best teaching move.",
      "desc": "Move the knight; the rook behind strikes. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 399,
      "book": "masetti",
      "title": "Discovery Drill 199",
      "teach": "Clear the bishop line onto a target.",
      "hint": "Discover the attack.",
      "fen": "4k3/8/8/8/4B3/8/8/4RK2 w - - 0 1",
      "goal": "win",
      "theme": "Discovery",
      "about": "Discovery — Find the best teaching move.",
      "desc": "Clear the bishop line onto a target. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 400,
      "book": "masetti",
      "title": "Discovery Drill 200",
      "teach": "Slide away and give discovered check.",
      "hint": "Discover check.",
      "fen": "4k3/8/8/8/4N3/8/8/4RK2 w - - 0 1",
      "goal": "win",
      "theme": "Discovery",
      "about": "Discovery — Find the best teaching move.",
      "desc": "Slide away and give discovered check. Prefer the clean idea over flashy side lines. (Beginner tactics — forks, pins, skewers, and double attacks)",
      "pitfalls": [
        "Look for checks, captures, and threats — in that order.",
        "Don't grab a small pawn if a fork or pin wins more.",
        "Ask: which enemy pieces are lined up or unprotected?"
      ]
    },
    {
      "n": 401,
      "book": "chernev",
      "title": "Why Develop?",
      "teach": "A developed piece fights; home pieces sleep.",
      "hint": "Develop toward the center.",
      "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
      "goal": "win",
      "theme": "Development",
      "about": "Development — Find the best teaching move.",
      "desc": "A developed piece fights; home pieces sleep. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 402,
      "book": "chernev",
      "title": "Knights Before Bishops",
      "teach": "In quiet openings, knights often come out first.",
      "hint": "Bring a knight out.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Development",
      "about": "Development — Find the best teaching move.",
      "desc": "In quiet openings, knights often come out first. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 403,
      "book": "chernev",
      "title": "Castle for a Reason",
      "teach": "Castling tucks the king and connects rooks.",
      "hint": "Castle kingside.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5",
      "goal": "win",
      "theme": "King safety",
      "about": "King safety — Find the best teaching move.",
      "desc": "Castling tucks the king and connects rooks. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 404,
      "book": "chernev",
      "title": "Center First",
      "teach": "Control e4/d4/e5/d5 — the engine room.",
      "hint": "Play in the center.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2",
      "goal": "win",
      "theme": "Center",
      "about": "Center — Find the best teaching move.",
      "desc": "Control e4/d4/e5/d5 — the engine room. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 405,
      "book": "chernev",
      "title": "Don't Move Twice",
      "teach": "Re-moving a piece steals a developing tempo.",
      "hint": "Develop a new piece.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
      "goal": "win",
      "theme": "Time",
      "about": "Time — Find the best teaching move.",
      "desc": "Re-moving a piece steals a developing tempo. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 406,
      "book": "chernev",
      "title": "Meet a Threat",
      "teach": "Are you safe? Parry before you plan.",
      "hint": "Stop the queen threat.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 1 2",
      "goal": "win",
      "theme": "Safety",
      "about": "Safety — Find the best teaching move.",
      "desc": "Are you safe? Parry before you plan. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 407,
      "book": "chernev",
      "title": "Trade When Ahead",
      "teach": "Simplify when up material.",
      "hint": "Offer or take a fair trade.",
      "fen": "4k3/8/8/8/8/8/3Q4/3qK3 w - - 0 1",
      "goal": "win",
      "theme": "Simplification",
      "about": "Simplification — Find the best teaching move.",
      "desc": "Simplify when up material. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 408,
      "book": "chernev",
      "title": "Keep Chances When Behind",
      "teach": "Down material? Avoid dead trades.",
      "hint": "Create play instead of simplifying.",
      "fen": "4k3/8/8/8/8/3Q4/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Imbalance",
      "about": "Imbalance — Find the best teaching move.",
      "desc": "Down material? Avoid dead trades. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 409,
      "book": "chernev",
      "title": "Improve the Worst Piece",
      "teach": "Give your idle piece a job.",
      "hint": "Activate the knight.",
      "fen": "4k3/8/8/8/8/8/8/R3K1N1 w Q - 0 1",
      "goal": "win",
      "theme": "Activity",
      "about": "Activity — Find the best teaching move.",
      "desc": "Give your idle piece a job. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 410,
      "book": "chernev",
      "title": "Open Files for Rooks",
      "teach": "Rooks belong on open files.",
      "hint": "Seize the open file.",
      "fen": "4k3/8/8/8/8/8/8/3RK3 w - - 0 1",
      "goal": "win",
      "theme": "Rooks",
      "about": "Rooks — Find the best teaching move.",
      "desc": "Rooks belong on open files. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 411,
      "book": "chernev",
      "title": "Seventh Rank",
      "teach": "A rook on the 7th cages the king.",
      "hint": "Invade the 7th.",
      "fen": "4k3/7p/8/8/8/8/8/3R2K1 w - - 0 1",
      "goal": "win",
      "theme": "Rooks",
      "about": "Rooks — Find the best teaching move.",
      "desc": "A rook on the 7th cages the king. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 412,
      "book": "chernev",
      "title": "Bishop Pair Idea",
      "teach": "Two bishops rake open boards.",
      "hint": "Activate a long diagonal.",
      "fen": "4k3/8/8/8/8/8/8/2B1KB2 w - - 0 1",
      "goal": "win",
      "theme": "Bishops",
      "about": "Bishops — Find the best teaching move.",
      "desc": "Two bishops rake open boards. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 413,
      "book": "chernev",
      "title": "Good Knight Outpost",
      "teach": "A knight on a hole is gold.",
      "hint": "Use the outpost.",
      "fen": "4k3/8/8/3p4/4N3/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Outpost",
      "about": "Outpost — Find the best teaching move.",
      "desc": "A knight on a hole is gold. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 414,
      "book": "chernev",
      "title": "Passed Pawn Push",
      "teach": "Passed pawns must be pushed.",
      "hint": "Advance the passer.",
      "fen": "8/8/4P3/8/8/8/8/4k1K1 w - - 0 1",
      "goal": "win",
      "theme": "Passed pawn",
      "about": "Passed pawn — Find the best teaching move.",
      "desc": "Passed pawns must be pushed. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 415,
      "book": "chernev",
      "title": "Blockade the Passer",
      "teach": "Sit in front of an enemy passer.",
      "hint": "Keep the blockade.",
      "fen": "4k3/4p3/4N3/8/8/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Blockade",
      "about": "Blockade — Find the best teaching move.",
      "desc": "Sit in front of an enemy passer. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 416,
      "book": "chernev",
      "title": "King in the Endgame",
      "teach": "The king is an attacking piece in endings.",
      "hint": "Centralize the king.",
      "fen": "8/8/8/8/8/4k3/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Endgame",
      "about": "Endgame — Find the best teaching move.",
      "desc": "The king is an attacking piece in endings. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 417,
      "book": "chernev",
      "title": "Opposition",
      "teach": "Seize the opposition with the kings.",
      "hint": "Take the opposition.",
      "fen": "8/8/8/3k4/8/8/3K4/8 w - - 0 1",
      "goal": "win",
      "theme": "Opposition",
      "about": "Opposition — Find the best teaching move.",
      "desc": "Seize the opposition with the kings. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 418,
      "book": "chernev",
      "title": "Don't Hang Pieces",
      "teach": "Every move: are your pieces safe?",
      "hint": "Save the hanging queen.",
      "fen": "4k3/8/8/8/8/8/7Q/4K2r w - - 0 1",
      "goal": "win",
      "theme": "Blunder check",
      "about": "Blunder check — Find the best teaching move.",
      "desc": "Every move: are your pieces safe? Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 419,
      "book": "chernev",
      "title": "Fix Weaknesses",
      "teach": "Isolated pawns need care.",
      "hint": "Address the weak pawn.",
      "fen": "4k3/8/3p4/8/3P4/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Structure",
      "about": "Structure — Find the best teaching move.",
      "desc": "Isolated pawns need care. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 420,
      "book": "chernev",
      "title": "Space Advantage",
      "teach": "More space means freer pieces.",
      "hint": "Use your space.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2",
      "goal": "win",
      "theme": "Space",
      "about": "Space — Find the best teaching move.",
      "desc": "More space means freer pieces. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 421,
      "book": "chernev",
      "title": "Prophylaxis",
      "teach": "Ask what they want — stop it.",
      "hint": "Prevent the advance.",
      "fen": "4k3/4p3/8/8/8/8/4P3/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Prophylaxis",
      "about": "Prophylaxis — Find the best teaching move.",
      "desc": "Ask what they want — stop it. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 422,
      "book": "chernev",
      "title": "Exchange to Convert",
      "teach": "If the ending is won, trade queens.",
      "hint": "Force a favorable trade.",
      "fen": "4k3/8/8/8/8/8/3Q4/3qK3 w - - 0 1",
      "goal": "win",
      "theme": "Conversion",
      "about": "Conversion — Find the best teaching move.",
      "desc": "If the ending is won, trade queens. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 423,
      "book": "chernev",
      "title": "Active Defense",
      "teach": "Defend with counter-threats.",
      "hint": "Parry with a threat.",
      "fen": "4k3/8/8/8/8/7q/8/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Defense",
      "about": "Defense — Find the best teaching move.",
      "desc": "Defend with counter-threats. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 424,
      "book": "chernev",
      "title": "Why That Capture?",
      "teach": "Capture only with a reason.",
      "hint": "Take for a clear reason.",
      "fen": "4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Logic",
      "about": "Logic — Find the best teaching move.",
      "desc": "Capture only with a reason. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 425,
      "book": "chernev",
      "title": "Connect the Rooks",
      "teach": "Clear the back rank so rooks talk.",
      "hint": "Connect the rooks.",
      "fen": "4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1",
      "goal": "win",
      "theme": "Rooks",
      "about": "Rooks — Find the best teaching move.",
      "desc": "Clear the back rank so rooks talk. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 426,
      "book": "chernev",
      "title": "Minor > Fancy",
      "teach": "Quiet development often beats a flashy check.",
      "hint": "The solid improving move.",
      "fen": "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Logic",
      "about": "Logic — Find the best teaching move.",
      "desc": "Quiet development often beats a flashy check. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 427,
      "book": "chernev",
      "title": "Explain Before You Move",
      "teach": "Name the reason, then play the move.",
      "hint": "The move you can explain.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Logic",
      "about": "Logic — Find the best teaching move.",
      "desc": "Name the reason, then play the move. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 428,
      "book": "chernev",
      "title": "Plan Over Move-Hunting",
      "teach": "Castle, develop, open a file — follow the plan.",
      "hint": "Continue the plan.",
      "fen": "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w - - 0 6",
      "goal": "win",
      "theme": "Plan",
      "about": "Plan — Find the best teaching move.",
      "desc": "Castle, develop, open a file — follow the plan. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 429,
      "book": "chernev",
      "title": "Review · Principle Move",
      "teach": "Safety, development, center.",
      "hint": "The principle move.",
      "fen": "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best teaching move.",
      "desc": "Safety, development, center. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 430,
      "book": "chernev",
      "title": "Review · Clean Technique",
      "teach": "Convert simply — no heroics.",
      "hint": "The clean converting move.",
      "fen": "6k1/5ppp/8/8/8/8/5PPP/4Q1K1 w - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best teaching move.",
      "desc": "Convert simply — no heroics. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 431,
      "book": "chernev",
      "title": "Development Lesson 31",
      "teach": "A developed piece fights; home pieces sleep.",
      "hint": "Develop toward the center.",
      "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
      "goal": "win",
      "theme": "Development",
      "about": "Development — Find the best teaching move.",
      "desc": "A developed piece fights; home pieces sleep. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 432,
      "book": "chernev",
      "title": "Development Lesson 32",
      "teach": "In quiet openings, knights often come out first.",
      "hint": "Bring a knight out.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Development",
      "about": "Development — Find the best teaching move.",
      "desc": "In quiet openings, knights often come out first. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 433,
      "book": "chernev",
      "title": "King safety Lesson 33",
      "teach": "Castling tucks the king and connects rooks.",
      "hint": "Castle kingside.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5",
      "goal": "win",
      "theme": "King safety",
      "about": "King safety — Find the best teaching move.",
      "desc": "Castling tucks the king and connects rooks. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 434,
      "book": "chernev",
      "title": "Center Lesson 34",
      "teach": "Control e4/d4/e5/d5 — the engine room.",
      "hint": "Play in the center.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2",
      "goal": "win",
      "theme": "Center",
      "about": "Center — Find the best teaching move.",
      "desc": "Control e4/d4/e5/d5 — the engine room. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 435,
      "book": "chernev",
      "title": "Time Lesson 35",
      "teach": "Re-moving a piece steals a developing tempo.",
      "hint": "Develop a new piece.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
      "goal": "win",
      "theme": "Time",
      "about": "Time — Find the best teaching move.",
      "desc": "Re-moving a piece steals a developing tempo. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 436,
      "book": "chernev",
      "title": "Safety Lesson 36",
      "teach": "Are you safe? Parry before you plan.",
      "hint": "Stop the queen threat.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 1 2",
      "goal": "win",
      "theme": "Safety",
      "about": "Safety — Find the best teaching move.",
      "desc": "Are you safe? Parry before you plan. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 437,
      "book": "chernev",
      "title": "Simplification Lesson 37",
      "teach": "Simplify when up material.",
      "hint": "Offer or take a fair trade.",
      "fen": "4k3/8/8/8/8/8/3Q4/3qK3 w - - 0 1",
      "goal": "win",
      "theme": "Simplification",
      "about": "Simplification — Find the best teaching move.",
      "desc": "Simplify when up material. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 438,
      "book": "chernev",
      "title": "Imbalance Lesson 38",
      "teach": "Down material? Avoid dead trades.",
      "hint": "Create play instead of simplifying.",
      "fen": "4k3/8/8/8/8/3Q4/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Imbalance",
      "about": "Imbalance — Find the best teaching move.",
      "desc": "Down material? Avoid dead trades. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 439,
      "book": "chernev",
      "title": "Activity Lesson 39",
      "teach": "Give your idle piece a job.",
      "hint": "Activate the knight.",
      "fen": "4k3/8/8/8/8/8/8/R3K1N1 w Q - 0 1",
      "goal": "win",
      "theme": "Activity",
      "about": "Activity — Find the best teaching move.",
      "desc": "Give your idle piece a job. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 440,
      "book": "chernev",
      "title": "Rooks Lesson 40",
      "teach": "Rooks belong on open files.",
      "hint": "Seize the open file.",
      "fen": "4k3/8/8/8/8/8/8/3RK3 w - - 0 1",
      "goal": "win",
      "theme": "Rooks",
      "about": "Rooks — Find the best teaching move.",
      "desc": "Rooks belong on open files. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 441,
      "book": "chernev",
      "title": "Rooks Lesson 41",
      "teach": "A rook on the 7th cages the king.",
      "hint": "Invade the 7th.",
      "fen": "4k3/7p/8/8/8/8/8/3R2K1 w - - 0 1",
      "goal": "win",
      "theme": "Rooks",
      "about": "Rooks — Find the best teaching move.",
      "desc": "A rook on the 7th cages the king. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 442,
      "book": "chernev",
      "title": "Bishops Lesson 42",
      "teach": "Two bishops rake open boards.",
      "hint": "Activate a long diagonal.",
      "fen": "4k3/8/8/8/8/8/8/2B1KB2 w - - 0 1",
      "goal": "win",
      "theme": "Bishops",
      "about": "Bishops — Find the best teaching move.",
      "desc": "Two bishops rake open boards. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 443,
      "book": "chernev",
      "title": "Outpost Lesson 43",
      "teach": "A knight on a hole is gold.",
      "hint": "Use the outpost.",
      "fen": "4k3/8/8/3p4/4N3/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Outpost",
      "about": "Outpost — Find the best teaching move.",
      "desc": "A knight on a hole is gold. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 444,
      "book": "chernev",
      "title": "Passed pawn Lesson 44",
      "teach": "Passed pawns must be pushed.",
      "hint": "Advance the passer.",
      "fen": "8/8/4P3/8/8/8/8/4k1K1 w - - 0 1",
      "goal": "win",
      "theme": "Passed pawn",
      "about": "Passed pawn — Find the best teaching move.",
      "desc": "Passed pawns must be pushed. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 445,
      "book": "chernev",
      "title": "Blockade Lesson 45",
      "teach": "Sit in front of an enemy passer.",
      "hint": "Keep the blockade.",
      "fen": "4k3/4p3/4N3/8/8/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Blockade",
      "about": "Blockade — Find the best teaching move.",
      "desc": "Sit in front of an enemy passer. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 446,
      "book": "chernev",
      "title": "Endgame Lesson 46",
      "teach": "The king is an attacking piece in endings.",
      "hint": "Centralize the king.",
      "fen": "8/8/8/8/8/4k3/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Endgame",
      "about": "Endgame — Find the best teaching move.",
      "desc": "The king is an attacking piece in endings. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 447,
      "book": "chernev",
      "title": "Opposition Lesson 47",
      "teach": "Seize the opposition with the kings.",
      "hint": "Take the opposition.",
      "fen": "8/8/8/3k4/8/8/3K4/8 w - - 0 1",
      "goal": "win",
      "theme": "Opposition",
      "about": "Opposition — Find the best teaching move.",
      "desc": "Seize the opposition with the kings. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 448,
      "book": "chernev",
      "title": "Blunder check Lesson 48",
      "teach": "Every move: are your pieces safe?",
      "hint": "Save the hanging queen.",
      "fen": "4k3/8/8/8/8/8/7Q/4K2r w - - 0 1",
      "goal": "win",
      "theme": "Blunder check",
      "about": "Blunder check — Find the best teaching move.",
      "desc": "Every move: are your pieces safe? Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 449,
      "book": "chernev",
      "title": "Structure Lesson 49",
      "teach": "Isolated pawns need care.",
      "hint": "Address the weak pawn.",
      "fen": "4k3/8/3p4/8/3P4/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Structure",
      "about": "Structure — Find the best teaching move.",
      "desc": "Isolated pawns need care. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 450,
      "book": "chernev",
      "title": "Space Lesson 50",
      "teach": "More space means freer pieces.",
      "hint": "Use your space.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2",
      "goal": "win",
      "theme": "Space",
      "about": "Space — Find the best teaching move.",
      "desc": "More space means freer pieces. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 451,
      "book": "chernev",
      "title": "Prophylaxis Lesson 51",
      "teach": "Ask what they want — stop it.",
      "hint": "Prevent the advance.",
      "fen": "4k3/4p3/8/8/8/8/4P3/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Prophylaxis",
      "about": "Prophylaxis — Find the best teaching move.",
      "desc": "Ask what they want — stop it. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 452,
      "book": "chernev",
      "title": "Conversion Lesson 52",
      "teach": "If the ending is won, trade queens.",
      "hint": "Force a favorable trade.",
      "fen": "4k3/8/8/8/8/8/3Q4/3qK3 w - - 0 1",
      "goal": "win",
      "theme": "Conversion",
      "about": "Conversion — Find the best teaching move.",
      "desc": "If the ending is won, trade queens. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 453,
      "book": "chernev",
      "title": "Defense Lesson 53",
      "teach": "Defend with counter-threats.",
      "hint": "Parry with a threat.",
      "fen": "4k3/8/8/8/8/7q/8/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Defense",
      "about": "Defense — Find the best teaching move.",
      "desc": "Defend with counter-threats. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 454,
      "book": "chernev",
      "title": "Logic Lesson 54",
      "teach": "Capture only with a reason.",
      "hint": "Take for a clear reason.",
      "fen": "4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Logic",
      "about": "Logic — Find the best teaching move.",
      "desc": "Capture only with a reason. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 455,
      "book": "chernev",
      "title": "Rooks Lesson 55",
      "teach": "Clear the back rank so rooks talk.",
      "hint": "Connect the rooks.",
      "fen": "4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1",
      "goal": "win",
      "theme": "Rooks",
      "about": "Rooks — Find the best teaching move.",
      "desc": "Clear the back rank so rooks talk. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 456,
      "book": "chernev",
      "title": "Logic Lesson 56",
      "teach": "Quiet development often beats a flashy check.",
      "hint": "The solid improving move.",
      "fen": "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Logic",
      "about": "Logic — Find the best teaching move.",
      "desc": "Quiet development often beats a flashy check. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 457,
      "book": "chernev",
      "title": "Logic Lesson 57",
      "teach": "Name the reason, then play the move.",
      "hint": "The move you can explain.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Logic",
      "about": "Logic — Find the best teaching move.",
      "desc": "Name the reason, then play the move. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 458,
      "book": "chernev",
      "title": "Plan Lesson 58",
      "teach": "Castle, develop, open a file — follow the plan.",
      "hint": "Continue the plan.",
      "fen": "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w - - 0 6",
      "goal": "win",
      "theme": "Plan",
      "about": "Plan — Find the best teaching move.",
      "desc": "Castle, develop, open a file — follow the plan. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 459,
      "book": "chernev",
      "title": "Review Lesson 59",
      "teach": "Safety, development, center.",
      "hint": "The principle move.",
      "fen": "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best teaching move.",
      "desc": "Safety, development, center. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 460,
      "book": "chernev",
      "title": "Review Lesson 60",
      "teach": "Convert simply — no heroics.",
      "hint": "The clean converting move.",
      "fen": "6k1/5ppp/8/8/8/8/5PPP/4Q1K1 w - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best teaching move.",
      "desc": "Convert simply — no heroics. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 461,
      "book": "chernev",
      "title": "Development Lesson 61",
      "teach": "Open with a center pawn idea — then develop.",
      "hint": "Play the principle move.",
      "fen": "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1",
      "goal": "win",
      "theme": "Development",
      "about": "Development — Find the best teaching move.",
      "desc": "Open with a center pawn idea — then develop. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 462,
      "book": "chernev",
      "title": "Development Lesson 62",
      "teach": "Develop before side adventures.",
      "hint": "Play the principle move.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
      "goal": "win",
      "theme": "Development",
      "about": "Development — Find the best teaching move.",
      "desc": "Develop before side adventures. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 463,
      "book": "chernev",
      "title": "King safety Lesson 63",
      "teach": "Prepare castling / keep king plans clear.",
      "hint": "Play the principle move.",
      "fen": "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
      "goal": "win",
      "theme": "King safety",
      "about": "King safety — Find the best teaching move.",
      "desc": "Prepare castling / keep king plans clear. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 464,
      "book": "chernev",
      "title": "Center Lesson 64",
      "teach": "Fight for the center with a developing move.",
      "hint": "Play the principle move.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Center",
      "about": "Center — Find the best teaching move.",
      "desc": "Fight for the center with a developing move. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 465,
      "book": "chernev",
      "title": "Center Lesson 65",
      "teach": "Clarify the central tension with a principled move.",
      "hint": "Play the principle move.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2",
      "goal": "win",
      "theme": "Center",
      "about": "Center — Find the best teaching move.",
      "desc": "Clarify the central tension with a principled move. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 466,
      "book": "chernev",
      "title": "King safety Lesson 66",
      "teach": "Castle when development allows.",
      "hint": "Play the principle move.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5",
      "goal": "win",
      "theme": "King safety",
      "about": "King safety — Find the best teaching move.",
      "desc": "Castle when development allows. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 467,
      "book": "chernev",
      "title": "Simplification Lesson 67",
      "teach": "Trade when ahead — simplify.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/8/3Q4/3qK3 w - - 0 1",
      "goal": "win",
      "theme": "Simplification",
      "about": "Simplification — Find the best teaching move.",
      "desc": "Trade when ahead — simplify. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 468,
      "book": "chernev",
      "title": "Activity Lesson 68",
      "teach": "Activate your strongest piece.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/3Q4/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Activity",
      "about": "Activity — Find the best teaching move.",
      "desc": "Activate your strongest piece. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 469,
      "book": "chernev",
      "title": "Activity Lesson 69",
      "teach": "Improve the idle knight.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/8/8/R3K1N1 w Q - 0 1",
      "goal": "win",
      "theme": "Activity",
      "about": "Activity — Find the best teaching move.",
      "desc": "Improve the idle knight. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 470,
      "book": "chernev",
      "title": "Rooks Lesson 70",
      "teach": "Seize the open file with the rook.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/8/8/3RK3 w - - 0 1",
      "goal": "win",
      "theme": "Rooks",
      "about": "Rooks — Find the best teaching move.",
      "desc": "Seize the open file with the rook. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 471,
      "book": "chernev",
      "title": "Rooks Lesson 71",
      "teach": "Invade the 7th rank.",
      "hint": "Play the principle move.",
      "fen": "4k3/7p/8/8/8/8/8/3R2K1 w - - 0 1",
      "goal": "win",
      "theme": "Rooks",
      "about": "Rooks — Find the best teaching move.",
      "desc": "Invade the 7th rank. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 472,
      "book": "chernev",
      "title": "Bishops Lesson 72",
      "teach": "Use a long bishop diagonal.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/8/8/2B1KB2 w - - 0 1",
      "goal": "win",
      "theme": "Bishops",
      "about": "Bishops — Find the best teaching move.",
      "desc": "Use a long bishop diagonal. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 473,
      "book": "chernev",
      "title": "Outpost Lesson 73",
      "teach": "Use the knight outpost.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/3p4/4N3/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Outpost",
      "about": "Outpost — Find the best teaching move.",
      "desc": "Use the knight outpost. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 474,
      "book": "chernev",
      "title": "Passed pawn Lesson 74",
      "teach": "Push the passed pawn.",
      "hint": "Play the principle move.",
      "fen": "8/8/4P3/8/8/8/8/4k1K1 w - - 0 1",
      "goal": "win",
      "theme": "Passed pawn",
      "about": "Passed pawn — Find the best teaching move.",
      "desc": "Push the passed pawn. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 475,
      "book": "chernev",
      "title": "Blockade Lesson 75",
      "teach": "Keep the blockade.",
      "hint": "Play the principle move.",
      "fen": "4k3/4p3/4N3/8/8/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Blockade",
      "about": "Blockade — Find the best teaching move.",
      "desc": "Keep the blockade. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 476,
      "book": "chernev",
      "title": "Endgame Lesson 76",
      "teach": "Centralize the king.",
      "hint": "Play the principle move.",
      "fen": "8/8/8/8/8/4k3/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Endgame",
      "about": "Endgame — Find the best teaching move.",
      "desc": "Centralize the king. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 477,
      "book": "chernev",
      "title": "Opposition Lesson 77",
      "teach": "Take the opposition.",
      "hint": "Play the principle move.",
      "fen": "8/8/8/3k4/8/8/3K4/8 w - - 0 1",
      "goal": "win",
      "theme": "Opposition",
      "about": "Opposition — Find the best teaching move.",
      "desc": "Take the opposition. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 478,
      "book": "chernev",
      "title": "Blunder check Lesson 78",
      "teach": "Save the hanging piece.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/8/7Q/4K2r w - - 0 1",
      "goal": "win",
      "theme": "Blunder check",
      "about": "Blunder check — Find the best teaching move.",
      "desc": "Save the hanging piece. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 479,
      "book": "chernev",
      "title": "Structure Lesson 79",
      "teach": "Handle the weak pawn.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/3p4/8/3P4/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Structure",
      "about": "Structure — Find the best teaching move.",
      "desc": "Handle the weak pawn. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 480,
      "book": "chernev",
      "title": "Space Lesson 80",
      "teach": "Use your space advantage.",
      "hint": "Play the principle move.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2",
      "goal": "win",
      "theme": "Space",
      "about": "Space — Find the best teaching move.",
      "desc": "Use your space advantage. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 481,
      "book": "chernev",
      "title": "Prophylaxis Lesson 81",
      "teach": "Stop their idea first.",
      "hint": "Play the principle move.",
      "fen": "4k3/4p3/8/8/8/8/4P3/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Prophylaxis",
      "about": "Prophylaxis — Find the best teaching move.",
      "desc": "Stop their idea first. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 482,
      "book": "chernev",
      "title": "Defense Lesson 82",
      "teach": "Active defense with a threat.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/7q/8/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Defense",
      "about": "Defense — Find the best teaching move.",
      "desc": "Active defense with a threat. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 483,
      "book": "chernev",
      "title": "Logic Lesson 83",
      "teach": "Capture only with a reason.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Logic",
      "about": "Logic — Find the best teaching move.",
      "desc": "Capture only with a reason. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 484,
      "book": "chernev",
      "title": "Rooks Lesson 84",
      "teach": "Connect the rooks.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1",
      "goal": "win",
      "theme": "Rooks",
      "about": "Rooks — Find the best teaching move.",
      "desc": "Connect the rooks. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 485,
      "book": "chernev",
      "title": "Logic Lesson 85",
      "teach": "Prefer the solid improving move.",
      "hint": "Play the principle move.",
      "fen": "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Logic",
      "about": "Logic — Find the best teaching move.",
      "desc": "Prefer the solid improving move. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 486,
      "book": "chernev",
      "title": "Logic Lesson 86",
      "teach": "Play the move you can explain.",
      "hint": "Play the principle move.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Logic",
      "about": "Logic — Find the best teaching move.",
      "desc": "Play the move you can explain. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 487,
      "book": "chernev",
      "title": "Plan Lesson 87",
      "teach": "Continue the small plan.",
      "hint": "Play the principle move.",
      "fen": "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w - - 0 6",
      "goal": "win",
      "theme": "Plan",
      "about": "Plan — Find the best teaching move.",
      "desc": "Continue the small plan. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 488,
      "book": "chernev",
      "title": "Review Lesson 88",
      "teach": "Principle move: safety/development/center.",
      "hint": "Play the principle move.",
      "fen": "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best teaching move.",
      "desc": "Principle move: safety/development/center. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 489,
      "book": "chernev",
      "title": "Review Lesson 89",
      "teach": "Convert cleanly without heroics.",
      "hint": "Play the principle move.",
      "fen": "6k1/5ppp/8/8/8/8/5PPP/4Q1K1 w - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best teaching move.",
      "desc": "Convert cleanly without heroics. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 490,
      "book": "chernev",
      "title": "Development Lesson 90",
      "teach": "Answer a center claim by developing.",
      "hint": "Play the principle move.",
      "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
      "goal": "win",
      "theme": "Development",
      "about": "Development — Find the best teaching move.",
      "desc": "Answer a center claim by developing. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 491,
      "book": "chernev",
      "title": "Imbalance Lesson 91",
      "teach": "Create play when material is thin.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/8/8/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Imbalance",
      "about": "Imbalance — Find the best teaching move.",
      "desc": "Create play when material is thin. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 492,
      "book": "chernev",
      "title": "Opposition Lesson 92",
      "teach": "King ending: opposition matters.",
      "hint": "Play the principle move.",
      "fen": "8/8/8/8/3k4/8/3K4/8 w - - 0 1",
      "goal": "win",
      "theme": "Opposition",
      "about": "Opposition — Find the best teaching move.",
      "desc": "King ending: opposition matters. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 493,
      "book": "chernev",
      "title": "Passed pawn Lesson 93",
      "teach": "Escort or advance the passer.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/8/3P4/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Passed pawn",
      "about": "Passed pawn — Find the best teaching move.",
      "desc": "Escort or advance the passer. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 494,
      "book": "chernev",
      "title": "Bishops Lesson 94",
      "teach": "Improve the bishop.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/8/8/2B1K3 w - - 0 1",
      "goal": "win",
      "theme": "Bishops",
      "about": "Bishops — Find the best teaching move.",
      "desc": "Improve the bishop. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 495,
      "book": "chernev",
      "title": "Activity Lesson 95",
      "teach": "Bring the knight into play.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/8/8/4K1N1 w - - 0 1",
      "goal": "win",
      "theme": "Activity",
      "about": "Activity — Find the best teaching move.",
      "desc": "Bring the knight into play. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 496,
      "book": "chernev",
      "title": "Development Lesson 96",
      "teach": "A developed piece fights; home pieces sleep.",
      "hint": "Develop toward the center.",
      "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
      "goal": "win",
      "theme": "Development",
      "about": "Development — Find the best teaching move.",
      "desc": "A developed piece fights; home pieces sleep. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 497,
      "book": "chernev",
      "title": "Development Lesson 97",
      "teach": "In quiet openings, knights often come out first.",
      "hint": "Bring a knight out.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Development",
      "about": "Development — Find the best teaching move.",
      "desc": "In quiet openings, knights often come out first. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 498,
      "book": "chernev",
      "title": "King safety Lesson 98",
      "teach": "Castling tucks the king and connects rooks.",
      "hint": "Castle kingside.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5",
      "goal": "win",
      "theme": "King safety",
      "about": "King safety — Find the best teaching move.",
      "desc": "Castling tucks the king and connects rooks. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 499,
      "book": "chernev",
      "title": "Center Lesson 99",
      "teach": "Control e4/d4/e5/d5 — the engine room.",
      "hint": "Play in the center.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2",
      "goal": "win",
      "theme": "Center",
      "about": "Center — Find the best teaching move.",
      "desc": "Control e4/d4/e5/d5 — the engine room. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 500,
      "book": "chernev",
      "title": "Time Lesson 100",
      "teach": "Re-moving a piece steals a developing tempo.",
      "hint": "Develop a new piece.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
      "goal": "win",
      "theme": "Time",
      "about": "Time — Find the best teaching move.",
      "desc": "Re-moving a piece steals a developing tempo. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 501,
      "book": "chernev",
      "title": "Safety Lesson 101",
      "teach": "Are you safe? Parry before you plan.",
      "hint": "Stop the queen threat.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 1 2",
      "goal": "win",
      "theme": "Safety",
      "about": "Safety — Find the best teaching move.",
      "desc": "Are you safe? Parry before you plan. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 502,
      "book": "chernev",
      "title": "Simplification Lesson 102",
      "teach": "Simplify when up material.",
      "hint": "Offer or take a fair trade.",
      "fen": "4k3/8/8/8/8/8/3Q4/3qK3 w - - 0 1",
      "goal": "win",
      "theme": "Simplification",
      "about": "Simplification — Find the best teaching move.",
      "desc": "Simplify when up material. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 503,
      "book": "chernev",
      "title": "Imbalance Lesson 103",
      "teach": "Down material? Avoid dead trades.",
      "hint": "Create play instead of simplifying.",
      "fen": "4k3/8/8/8/8/3Q4/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Imbalance",
      "about": "Imbalance — Find the best teaching move.",
      "desc": "Down material? Avoid dead trades. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 504,
      "book": "chernev",
      "title": "Activity Lesson 104",
      "teach": "Give your idle piece a job.",
      "hint": "Activate the knight.",
      "fen": "4k3/8/8/8/8/8/8/R3K1N1 w Q - 0 1",
      "goal": "win",
      "theme": "Activity",
      "about": "Activity — Find the best teaching move.",
      "desc": "Give your idle piece a job. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 505,
      "book": "chernev",
      "title": "Rooks Lesson 105",
      "teach": "Rooks belong on open files.",
      "hint": "Seize the open file.",
      "fen": "4k3/8/8/8/8/8/8/3RK3 w - - 0 1",
      "goal": "win",
      "theme": "Rooks",
      "about": "Rooks — Find the best teaching move.",
      "desc": "Rooks belong on open files. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 506,
      "book": "chernev",
      "title": "Rooks Lesson 106",
      "teach": "A rook on the 7th cages the king.",
      "hint": "Invade the 7th.",
      "fen": "4k3/7p/8/8/8/8/8/3R2K1 w - - 0 1",
      "goal": "win",
      "theme": "Rooks",
      "about": "Rooks — Find the best teaching move.",
      "desc": "A rook on the 7th cages the king. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 507,
      "book": "chernev",
      "title": "Bishops Lesson 107",
      "teach": "Two bishops rake open boards.",
      "hint": "Activate a long diagonal.",
      "fen": "4k3/8/8/8/8/8/8/2B1KB2 w - - 0 1",
      "goal": "win",
      "theme": "Bishops",
      "about": "Bishops — Find the best teaching move.",
      "desc": "Two bishops rake open boards. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 508,
      "book": "chernev",
      "title": "Outpost Lesson 108",
      "teach": "A knight on a hole is gold.",
      "hint": "Use the outpost.",
      "fen": "4k3/8/8/3p4/4N3/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Outpost",
      "about": "Outpost — Find the best teaching move.",
      "desc": "A knight on a hole is gold. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 509,
      "book": "chernev",
      "title": "Passed pawn Lesson 109",
      "teach": "Passed pawns must be pushed.",
      "hint": "Advance the passer.",
      "fen": "8/8/4P3/8/8/8/8/4k1K1 w - - 0 1",
      "goal": "win",
      "theme": "Passed pawn",
      "about": "Passed pawn — Find the best teaching move.",
      "desc": "Passed pawns must be pushed. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 510,
      "book": "chernev",
      "title": "Blockade Lesson 110",
      "teach": "Sit in front of an enemy passer.",
      "hint": "Keep the blockade.",
      "fen": "4k3/4p3/4N3/8/8/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Blockade",
      "about": "Blockade — Find the best teaching move.",
      "desc": "Sit in front of an enemy passer. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 511,
      "book": "chernev",
      "title": "Endgame Lesson 111",
      "teach": "The king is an attacking piece in endings.",
      "hint": "Centralize the king.",
      "fen": "8/8/8/8/8/4k3/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Endgame",
      "about": "Endgame — Find the best teaching move.",
      "desc": "The king is an attacking piece in endings. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 512,
      "book": "chernev",
      "title": "Opposition Lesson 112",
      "teach": "Seize the opposition with the kings.",
      "hint": "Take the opposition.",
      "fen": "8/8/8/3k4/8/8/3K4/8 w - - 0 1",
      "goal": "win",
      "theme": "Opposition",
      "about": "Opposition — Find the best teaching move.",
      "desc": "Seize the opposition with the kings. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 513,
      "book": "chernev",
      "title": "Blunder check Lesson 113",
      "teach": "Every move: are your pieces safe?",
      "hint": "Save the hanging queen.",
      "fen": "4k3/8/8/8/8/8/7Q/4K2r w - - 0 1",
      "goal": "win",
      "theme": "Blunder check",
      "about": "Blunder check — Find the best teaching move.",
      "desc": "Every move: are your pieces safe? Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 514,
      "book": "chernev",
      "title": "Structure Lesson 114",
      "teach": "Isolated pawns need care.",
      "hint": "Address the weak pawn.",
      "fen": "4k3/8/3p4/8/3P4/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Structure",
      "about": "Structure — Find the best teaching move.",
      "desc": "Isolated pawns need care. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 515,
      "book": "chernev",
      "title": "Space Lesson 115",
      "teach": "More space means freer pieces.",
      "hint": "Use your space.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2",
      "goal": "win",
      "theme": "Space",
      "about": "Space — Find the best teaching move.",
      "desc": "More space means freer pieces. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 516,
      "book": "chernev",
      "title": "Prophylaxis Lesson 116",
      "teach": "Ask what they want — stop it.",
      "hint": "Prevent the advance.",
      "fen": "4k3/4p3/8/8/8/8/4P3/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Prophylaxis",
      "about": "Prophylaxis — Find the best teaching move.",
      "desc": "Ask what they want — stop it. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 517,
      "book": "chernev",
      "title": "Conversion Lesson 117",
      "teach": "If the ending is won, trade queens.",
      "hint": "Force a favorable trade.",
      "fen": "4k3/8/8/8/8/8/3Q4/3qK3 w - - 0 1",
      "goal": "win",
      "theme": "Conversion",
      "about": "Conversion — Find the best teaching move.",
      "desc": "If the ending is won, trade queens. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 518,
      "book": "chernev",
      "title": "Defense Lesson 118",
      "teach": "Defend with counter-threats.",
      "hint": "Parry with a threat.",
      "fen": "4k3/8/8/8/8/7q/8/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Defense",
      "about": "Defense — Find the best teaching move.",
      "desc": "Defend with counter-threats. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 519,
      "book": "chernev",
      "title": "Logic Lesson 119",
      "teach": "Capture only with a reason.",
      "hint": "Take for a clear reason.",
      "fen": "4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Logic",
      "about": "Logic — Find the best teaching move.",
      "desc": "Capture only with a reason. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 520,
      "book": "chernev",
      "title": "Rooks Lesson 120",
      "teach": "Clear the back rank so rooks talk.",
      "hint": "Connect the rooks.",
      "fen": "4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1",
      "goal": "win",
      "theme": "Rooks",
      "about": "Rooks — Find the best teaching move.",
      "desc": "Clear the back rank so rooks talk. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 521,
      "book": "chernev",
      "title": "Logic Lesson 121",
      "teach": "Quiet development often beats a flashy check.",
      "hint": "The solid improving move.",
      "fen": "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Logic",
      "about": "Logic — Find the best teaching move.",
      "desc": "Quiet development often beats a flashy check. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 522,
      "book": "chernev",
      "title": "Logic Lesson 122",
      "teach": "Name the reason, then play the move.",
      "hint": "The move you can explain.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Logic",
      "about": "Logic — Find the best teaching move.",
      "desc": "Name the reason, then play the move. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 523,
      "book": "chernev",
      "title": "Plan Lesson 123",
      "teach": "Castle, develop, open a file — follow the plan.",
      "hint": "Continue the plan.",
      "fen": "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w - - 0 6",
      "goal": "win",
      "theme": "Plan",
      "about": "Plan — Find the best teaching move.",
      "desc": "Castle, develop, open a file — follow the plan. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 524,
      "book": "chernev",
      "title": "Review Lesson 124",
      "teach": "Safety, development, center.",
      "hint": "The principle move.",
      "fen": "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best teaching move.",
      "desc": "Safety, development, center. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 525,
      "book": "chernev",
      "title": "Review Lesson 125",
      "teach": "Convert simply — no heroics.",
      "hint": "The clean converting move.",
      "fen": "6k1/5ppp/8/8/8/8/5PPP/4Q1K1 w - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best teaching move.",
      "desc": "Convert simply — no heroics. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 526,
      "book": "chernev",
      "title": "Development Lesson 126",
      "teach": "Open with a center pawn idea — then develop.",
      "hint": "Play the principle move.",
      "fen": "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1",
      "goal": "win",
      "theme": "Development",
      "about": "Development — Find the best teaching move.",
      "desc": "Open with a center pawn idea — then develop. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 527,
      "book": "chernev",
      "title": "Development Lesson 127",
      "teach": "Develop before side adventures.",
      "hint": "Play the principle move.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
      "goal": "win",
      "theme": "Development",
      "about": "Development — Find the best teaching move.",
      "desc": "Develop before side adventures. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 528,
      "book": "chernev",
      "title": "King safety Lesson 128",
      "teach": "Prepare castling / keep king plans clear.",
      "hint": "Play the principle move.",
      "fen": "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
      "goal": "win",
      "theme": "King safety",
      "about": "King safety — Find the best teaching move.",
      "desc": "Prepare castling / keep king plans clear. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 529,
      "book": "chernev",
      "title": "Center Lesson 129",
      "teach": "Fight for the center with a developing move.",
      "hint": "Play the principle move.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Center",
      "about": "Center — Find the best teaching move.",
      "desc": "Fight for the center with a developing move. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 530,
      "book": "chernev",
      "title": "Center Lesson 130",
      "teach": "Clarify the central tension with a principled move.",
      "hint": "Play the principle move.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2",
      "goal": "win",
      "theme": "Center",
      "about": "Center — Find the best teaching move.",
      "desc": "Clarify the central tension with a principled move. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 531,
      "book": "chernev",
      "title": "King safety Lesson 131",
      "teach": "Castle when development allows.",
      "hint": "Play the principle move.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5",
      "goal": "win",
      "theme": "King safety",
      "about": "King safety — Find the best teaching move.",
      "desc": "Castle when development allows. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 532,
      "book": "chernev",
      "title": "Simplification Lesson 132",
      "teach": "Trade when ahead — simplify.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/8/3Q4/3qK3 w - - 0 1",
      "goal": "win",
      "theme": "Simplification",
      "about": "Simplification — Find the best teaching move.",
      "desc": "Trade when ahead — simplify. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 533,
      "book": "chernev",
      "title": "Activity Lesson 133",
      "teach": "Activate your strongest piece.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/3Q4/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Activity",
      "about": "Activity — Find the best teaching move.",
      "desc": "Activate your strongest piece. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 534,
      "book": "chernev",
      "title": "Activity Lesson 134",
      "teach": "Improve the idle knight.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/8/8/R3K1N1 w Q - 0 1",
      "goal": "win",
      "theme": "Activity",
      "about": "Activity — Find the best teaching move.",
      "desc": "Improve the idle knight. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 535,
      "book": "chernev",
      "title": "Rooks Lesson 135",
      "teach": "Seize the open file with the rook.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/8/8/3RK3 w - - 0 1",
      "goal": "win",
      "theme": "Rooks",
      "about": "Rooks — Find the best teaching move.",
      "desc": "Seize the open file with the rook. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 536,
      "book": "chernev",
      "title": "Rooks Lesson 136",
      "teach": "Invade the 7th rank.",
      "hint": "Play the principle move.",
      "fen": "4k3/7p/8/8/8/8/8/3R2K1 w - - 0 1",
      "goal": "win",
      "theme": "Rooks",
      "about": "Rooks — Find the best teaching move.",
      "desc": "Invade the 7th rank. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 537,
      "book": "chernev",
      "title": "Bishops Lesson 137",
      "teach": "Use a long bishop diagonal.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/8/8/2B1KB2 w - - 0 1",
      "goal": "win",
      "theme": "Bishops",
      "about": "Bishops — Find the best teaching move.",
      "desc": "Use a long bishop diagonal. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 538,
      "book": "chernev",
      "title": "Outpost Lesson 138",
      "teach": "Use the knight outpost.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/3p4/4N3/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Outpost",
      "about": "Outpost — Find the best teaching move.",
      "desc": "Use the knight outpost. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 539,
      "book": "chernev",
      "title": "Passed pawn Lesson 139",
      "teach": "Push the passed pawn.",
      "hint": "Play the principle move.",
      "fen": "8/8/4P3/8/8/8/8/4k1K1 w - - 0 1",
      "goal": "win",
      "theme": "Passed pawn",
      "about": "Passed pawn — Find the best teaching move.",
      "desc": "Push the passed pawn. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 540,
      "book": "chernev",
      "title": "Blockade Lesson 140",
      "teach": "Keep the blockade.",
      "hint": "Play the principle move.",
      "fen": "4k3/4p3/4N3/8/8/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Blockade",
      "about": "Blockade — Find the best teaching move.",
      "desc": "Keep the blockade. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 541,
      "book": "chernev",
      "title": "Endgame Lesson 141",
      "teach": "Centralize the king.",
      "hint": "Play the principle move.",
      "fen": "8/8/8/8/8/4k3/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Endgame",
      "about": "Endgame — Find the best teaching move.",
      "desc": "Centralize the king. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 542,
      "book": "chernev",
      "title": "Opposition Lesson 142",
      "teach": "Take the opposition.",
      "hint": "Play the principle move.",
      "fen": "8/8/8/3k4/8/8/3K4/8 w - - 0 1",
      "goal": "win",
      "theme": "Opposition",
      "about": "Opposition — Find the best teaching move.",
      "desc": "Take the opposition. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 543,
      "book": "chernev",
      "title": "Blunder check Lesson 143",
      "teach": "Save the hanging piece.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/8/7Q/4K2r w - - 0 1",
      "goal": "win",
      "theme": "Blunder check",
      "about": "Blunder check — Find the best teaching move.",
      "desc": "Save the hanging piece. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 544,
      "book": "chernev",
      "title": "Structure Lesson 144",
      "teach": "Handle the weak pawn.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/3p4/8/3P4/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Structure",
      "about": "Structure — Find the best teaching move.",
      "desc": "Handle the weak pawn. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 545,
      "book": "chernev",
      "title": "Space Lesson 145",
      "teach": "Use your space advantage.",
      "hint": "Play the principle move.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2",
      "goal": "win",
      "theme": "Space",
      "about": "Space — Find the best teaching move.",
      "desc": "Use your space advantage. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 546,
      "book": "chernev",
      "title": "Prophylaxis Lesson 146",
      "teach": "Stop their idea first.",
      "hint": "Play the principle move.",
      "fen": "4k3/4p3/8/8/8/8/4P3/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Prophylaxis",
      "about": "Prophylaxis — Find the best teaching move.",
      "desc": "Stop their idea first. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 547,
      "book": "chernev",
      "title": "Defense Lesson 147",
      "teach": "Active defense with a threat.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/7q/8/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Defense",
      "about": "Defense — Find the best teaching move.",
      "desc": "Active defense with a threat. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 548,
      "book": "chernev",
      "title": "Logic Lesson 148",
      "teach": "Capture only with a reason.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Logic",
      "about": "Logic — Find the best teaching move.",
      "desc": "Capture only with a reason. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 549,
      "book": "chernev",
      "title": "Rooks Lesson 149",
      "teach": "Connect the rooks.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1",
      "goal": "win",
      "theme": "Rooks",
      "about": "Rooks — Find the best teaching move.",
      "desc": "Connect the rooks. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 550,
      "book": "chernev",
      "title": "Logic Lesson 150",
      "teach": "Prefer the solid improving move.",
      "hint": "Play the principle move.",
      "fen": "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Logic",
      "about": "Logic — Find the best teaching move.",
      "desc": "Prefer the solid improving move. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 551,
      "book": "chernev",
      "title": "Logic Lesson 151",
      "teach": "Play the move you can explain.",
      "hint": "Play the principle move.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Logic",
      "about": "Logic — Find the best teaching move.",
      "desc": "Play the move you can explain. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 552,
      "book": "chernev",
      "title": "Plan Lesson 152",
      "teach": "Continue the small plan.",
      "hint": "Play the principle move.",
      "fen": "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w - - 0 6",
      "goal": "win",
      "theme": "Plan",
      "about": "Plan — Find the best teaching move.",
      "desc": "Continue the small plan. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 553,
      "book": "chernev",
      "title": "Review Lesson 153",
      "teach": "Principle move: safety/development/center.",
      "hint": "Play the principle move.",
      "fen": "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best teaching move.",
      "desc": "Principle move: safety/development/center. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 554,
      "book": "chernev",
      "title": "Review Lesson 154",
      "teach": "Convert cleanly without heroics.",
      "hint": "Play the principle move.",
      "fen": "6k1/5ppp/8/8/8/8/5PPP/4Q1K1 w - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best teaching move.",
      "desc": "Convert cleanly without heroics. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 555,
      "book": "chernev",
      "title": "Development Lesson 155",
      "teach": "Answer a center claim by developing.",
      "hint": "Play the principle move.",
      "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
      "goal": "win",
      "theme": "Development",
      "about": "Development — Find the best teaching move.",
      "desc": "Answer a center claim by developing. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 556,
      "book": "chernev",
      "title": "Imbalance Lesson 156",
      "teach": "Create play when material is thin.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/8/8/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Imbalance",
      "about": "Imbalance — Find the best teaching move.",
      "desc": "Create play when material is thin. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 557,
      "book": "chernev",
      "title": "Opposition Lesson 157",
      "teach": "King ending: opposition matters.",
      "hint": "Play the principle move.",
      "fen": "8/8/8/8/3k4/8/3K4/8 w - - 0 1",
      "goal": "win",
      "theme": "Opposition",
      "about": "Opposition — Find the best teaching move.",
      "desc": "King ending: opposition matters. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 558,
      "book": "chernev",
      "title": "Passed pawn Lesson 158",
      "teach": "Escort or advance the passer.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/8/3P4/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Passed pawn",
      "about": "Passed pawn — Find the best teaching move.",
      "desc": "Escort or advance the passer. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 559,
      "book": "chernev",
      "title": "Bishops Lesson 159",
      "teach": "Improve the bishop.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/8/8/2B1K3 w - - 0 1",
      "goal": "win",
      "theme": "Bishops",
      "about": "Bishops — Find the best teaching move.",
      "desc": "Improve the bishop. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 560,
      "book": "chernev",
      "title": "Activity Lesson 160",
      "teach": "Bring the knight into play.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/8/8/4K1N1 w - - 0 1",
      "goal": "win",
      "theme": "Activity",
      "about": "Activity — Find the best teaching move.",
      "desc": "Bring the knight into play. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 561,
      "book": "chernev",
      "title": "Development Lesson 161",
      "teach": "A developed piece fights; home pieces sleep.",
      "hint": "Develop toward the center.",
      "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
      "goal": "win",
      "theme": "Development",
      "about": "Development — Find the best teaching move.",
      "desc": "A developed piece fights; home pieces sleep. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 562,
      "book": "chernev",
      "title": "Development Lesson 162",
      "teach": "In quiet openings, knights often come out first.",
      "hint": "Bring a knight out.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Development",
      "about": "Development — Find the best teaching move.",
      "desc": "In quiet openings, knights often come out first. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 563,
      "book": "chernev",
      "title": "King safety Lesson 163",
      "teach": "Castling tucks the king and connects rooks.",
      "hint": "Castle kingside.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5",
      "goal": "win",
      "theme": "King safety",
      "about": "King safety — Find the best teaching move.",
      "desc": "Castling tucks the king and connects rooks. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 564,
      "book": "chernev",
      "title": "Center Lesson 164",
      "teach": "Control e4/d4/e5/d5 — the engine room.",
      "hint": "Play in the center.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2",
      "goal": "win",
      "theme": "Center",
      "about": "Center — Find the best teaching move.",
      "desc": "Control e4/d4/e5/d5 — the engine room. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 565,
      "book": "chernev",
      "title": "Time Lesson 165",
      "teach": "Re-moving a piece steals a developing tempo.",
      "hint": "Develop a new piece.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
      "goal": "win",
      "theme": "Time",
      "about": "Time — Find the best teaching move.",
      "desc": "Re-moving a piece steals a developing tempo. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 566,
      "book": "chernev",
      "title": "Safety Lesson 166",
      "teach": "Are you safe? Parry before you plan.",
      "hint": "Stop the queen threat.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 1 2",
      "goal": "win",
      "theme": "Safety",
      "about": "Safety — Find the best teaching move.",
      "desc": "Are you safe? Parry before you plan. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 567,
      "book": "chernev",
      "title": "Simplification Lesson 167",
      "teach": "Simplify when up material.",
      "hint": "Offer or take a fair trade.",
      "fen": "4k3/8/8/8/8/8/3Q4/3qK3 w - - 0 1",
      "goal": "win",
      "theme": "Simplification",
      "about": "Simplification — Find the best teaching move.",
      "desc": "Simplify when up material. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 568,
      "book": "chernev",
      "title": "Imbalance Lesson 168",
      "teach": "Down material? Avoid dead trades.",
      "hint": "Create play instead of simplifying.",
      "fen": "4k3/8/8/8/8/3Q4/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Imbalance",
      "about": "Imbalance — Find the best teaching move.",
      "desc": "Down material? Avoid dead trades. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 569,
      "book": "chernev",
      "title": "Activity Lesson 169",
      "teach": "Give your idle piece a job.",
      "hint": "Activate the knight.",
      "fen": "4k3/8/8/8/8/8/8/R3K1N1 w Q - 0 1",
      "goal": "win",
      "theme": "Activity",
      "about": "Activity — Find the best teaching move.",
      "desc": "Give your idle piece a job. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 570,
      "book": "chernev",
      "title": "Rooks Lesson 170",
      "teach": "Rooks belong on open files.",
      "hint": "Seize the open file.",
      "fen": "4k3/8/8/8/8/8/8/3RK3 w - - 0 1",
      "goal": "win",
      "theme": "Rooks",
      "about": "Rooks — Find the best teaching move.",
      "desc": "Rooks belong on open files. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 571,
      "book": "chernev",
      "title": "Rooks Lesson 171",
      "teach": "A rook on the 7th cages the king.",
      "hint": "Invade the 7th.",
      "fen": "4k3/7p/8/8/8/8/8/3R2K1 w - - 0 1",
      "goal": "win",
      "theme": "Rooks",
      "about": "Rooks — Find the best teaching move.",
      "desc": "A rook on the 7th cages the king. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 572,
      "book": "chernev",
      "title": "Bishops Lesson 172",
      "teach": "Two bishops rake open boards.",
      "hint": "Activate a long diagonal.",
      "fen": "4k3/8/8/8/8/8/8/2B1KB2 w - - 0 1",
      "goal": "win",
      "theme": "Bishops",
      "about": "Bishops — Find the best teaching move.",
      "desc": "Two bishops rake open boards. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 573,
      "book": "chernev",
      "title": "Outpost Lesson 173",
      "teach": "A knight on a hole is gold.",
      "hint": "Use the outpost.",
      "fen": "4k3/8/8/3p4/4N3/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Outpost",
      "about": "Outpost — Find the best teaching move.",
      "desc": "A knight on a hole is gold. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 574,
      "book": "chernev",
      "title": "Passed pawn Lesson 174",
      "teach": "Passed pawns must be pushed.",
      "hint": "Advance the passer.",
      "fen": "8/8/4P3/8/8/8/8/4k1K1 w - - 0 1",
      "goal": "win",
      "theme": "Passed pawn",
      "about": "Passed pawn — Find the best teaching move.",
      "desc": "Passed pawns must be pushed. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 575,
      "book": "chernev",
      "title": "Blockade Lesson 175",
      "teach": "Sit in front of an enemy passer.",
      "hint": "Keep the blockade.",
      "fen": "4k3/4p3/4N3/8/8/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Blockade",
      "about": "Blockade — Find the best teaching move.",
      "desc": "Sit in front of an enemy passer. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 576,
      "book": "chernev",
      "title": "Endgame Lesson 176",
      "teach": "The king is an attacking piece in endings.",
      "hint": "Centralize the king.",
      "fen": "8/8/8/8/8/4k3/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Endgame",
      "about": "Endgame — Find the best teaching move.",
      "desc": "The king is an attacking piece in endings. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 577,
      "book": "chernev",
      "title": "Opposition Lesson 177",
      "teach": "Seize the opposition with the kings.",
      "hint": "Take the opposition.",
      "fen": "8/8/8/3k4/8/8/3K4/8 w - - 0 1",
      "goal": "win",
      "theme": "Opposition",
      "about": "Opposition — Find the best teaching move.",
      "desc": "Seize the opposition with the kings. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 578,
      "book": "chernev",
      "title": "Blunder check Lesson 178",
      "teach": "Every move: are your pieces safe?",
      "hint": "Save the hanging queen.",
      "fen": "4k3/8/8/8/8/8/7Q/4K2r w - - 0 1",
      "goal": "win",
      "theme": "Blunder check",
      "about": "Blunder check — Find the best teaching move.",
      "desc": "Every move: are your pieces safe? Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 579,
      "book": "chernev",
      "title": "Structure Lesson 179",
      "teach": "Isolated pawns need care.",
      "hint": "Address the weak pawn.",
      "fen": "4k3/8/3p4/8/3P4/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Structure",
      "about": "Structure — Find the best teaching move.",
      "desc": "Isolated pawns need care. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 580,
      "book": "chernev",
      "title": "Space Lesson 180",
      "teach": "More space means freer pieces.",
      "hint": "Use your space.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2",
      "goal": "win",
      "theme": "Space",
      "about": "Space — Find the best teaching move.",
      "desc": "More space means freer pieces. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 581,
      "book": "chernev",
      "title": "Prophylaxis Lesson 181",
      "teach": "Ask what they want — stop it.",
      "hint": "Prevent the advance.",
      "fen": "4k3/4p3/8/8/8/8/4P3/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Prophylaxis",
      "about": "Prophylaxis — Find the best teaching move.",
      "desc": "Ask what they want — stop it. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 582,
      "book": "chernev",
      "title": "Conversion Lesson 182",
      "teach": "If the ending is won, trade queens.",
      "hint": "Force a favorable trade.",
      "fen": "4k3/8/8/8/8/8/3Q4/3qK3 w - - 0 1",
      "goal": "win",
      "theme": "Conversion",
      "about": "Conversion — Find the best teaching move.",
      "desc": "If the ending is won, trade queens. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 583,
      "book": "chernev",
      "title": "Defense Lesson 183",
      "teach": "Defend with counter-threats.",
      "hint": "Parry with a threat.",
      "fen": "4k3/8/8/8/8/7q/8/3QK3 w - - 0 1",
      "goal": "win",
      "theme": "Defense",
      "about": "Defense — Find the best teaching move.",
      "desc": "Defend with counter-threats. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 584,
      "book": "chernev",
      "title": "Logic Lesson 184",
      "teach": "Capture only with a reason.",
      "hint": "Take for a clear reason.",
      "fen": "4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Logic",
      "about": "Logic — Find the best teaching move.",
      "desc": "Capture only with a reason. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 585,
      "book": "chernev",
      "title": "Rooks Lesson 185",
      "teach": "Clear the back rank so rooks talk.",
      "hint": "Connect the rooks.",
      "fen": "4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1",
      "goal": "win",
      "theme": "Rooks",
      "about": "Rooks — Find the best teaching move.",
      "desc": "Clear the back rank so rooks talk. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 586,
      "book": "chernev",
      "title": "Logic Lesson 186",
      "teach": "Quiet development often beats a flashy check.",
      "hint": "The solid improving move.",
      "fen": "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Logic",
      "about": "Logic — Find the best teaching move.",
      "desc": "Quiet development often beats a flashy check. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 587,
      "book": "chernev",
      "title": "Logic Lesson 187",
      "teach": "Name the reason, then play the move.",
      "hint": "The move you can explain.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Logic",
      "about": "Logic — Find the best teaching move.",
      "desc": "Name the reason, then play the move. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 588,
      "book": "chernev",
      "title": "Plan Lesson 188",
      "teach": "Castle, develop, open a file — follow the plan.",
      "hint": "Continue the plan.",
      "fen": "r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w - - 0 6",
      "goal": "win",
      "theme": "Plan",
      "about": "Plan — Find the best teaching move.",
      "desc": "Castle, develop, open a file — follow the plan. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 589,
      "book": "chernev",
      "title": "Review Lesson 189",
      "teach": "Safety, development, center.",
      "hint": "The principle move.",
      "fen": "rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best teaching move.",
      "desc": "Safety, development, center. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 590,
      "book": "chernev",
      "title": "Review Lesson 190",
      "teach": "Convert simply — no heroics.",
      "hint": "The clean converting move.",
      "fen": "6k1/5ppp/8/8/8/8/5PPP/4Q1K1 w - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Find the best teaching move.",
      "desc": "Convert simply — no heroics. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 591,
      "book": "chernev",
      "title": "Development Lesson 191",
      "teach": "Open with a center pawn idea — then develop.",
      "hint": "Play the principle move.",
      "fen": "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1",
      "goal": "win",
      "theme": "Development",
      "about": "Development — Find the best teaching move.",
      "desc": "Open with a center pawn idea — then develop. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 592,
      "book": "chernev",
      "title": "Development Lesson 192",
      "teach": "Develop before side adventures.",
      "hint": "Play the principle move.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
      "goal": "win",
      "theme": "Development",
      "about": "Development — Find the best teaching move.",
      "desc": "Develop before side adventures. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 593,
      "book": "chernev",
      "title": "King safety Lesson 193",
      "teach": "Prepare castling / keep king plans clear.",
      "hint": "Play the principle move.",
      "fen": "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
      "goal": "win",
      "theme": "King safety",
      "about": "King safety — Find the best teaching move.",
      "desc": "Prepare castling / keep king plans clear. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 594,
      "book": "chernev",
      "title": "Center Lesson 194",
      "teach": "Fight for the center with a developing move.",
      "hint": "Play the principle move.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Center",
      "about": "Center — Find the best teaching move.",
      "desc": "Fight for the center with a developing move. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 595,
      "book": "chernev",
      "title": "Center Lesson 195",
      "teach": "Clarify the central tension with a principled move.",
      "hint": "Play the principle move.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2",
      "goal": "win",
      "theme": "Center",
      "about": "Center — Find the best teaching move.",
      "desc": "Clarify the central tension with a principled move. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 596,
      "book": "chernev",
      "title": "King safety Lesson 196",
      "teach": "Castle when development allows.",
      "hint": "Play the principle move.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5",
      "goal": "win",
      "theme": "King safety",
      "about": "King safety — Find the best teaching move.",
      "desc": "Castle when development allows. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 597,
      "book": "chernev",
      "title": "Simplification Lesson 197",
      "teach": "Trade when ahead — simplify.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/8/3Q4/3qK3 w - - 0 1",
      "goal": "win",
      "theme": "Simplification",
      "about": "Simplification — Find the best teaching move.",
      "desc": "Trade when ahead — simplify. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 598,
      "book": "chernev",
      "title": "Activity Lesson 198",
      "teach": "Activate your strongest piece.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/3Q4/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Activity",
      "about": "Activity — Find the best teaching move.",
      "desc": "Activate your strongest piece. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 599,
      "book": "chernev",
      "title": "Activity Lesson 199",
      "teach": "Improve the idle knight.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/8/8/R3K1N1 w Q - 0 1",
      "goal": "win",
      "theme": "Activity",
      "about": "Activity — Find the best teaching move.",
      "desc": "Improve the idle knight. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    },
    {
      "n": 600,
      "book": "chernev",
      "title": "Rooks Lesson 200",
      "teach": "Seize the open file with the rook.",
      "hint": "Play the principle move.",
      "fen": "4k3/8/8/8/8/8/8/3RK3 w - - 0 1",
      "goal": "win",
      "theme": "Rooks",
      "about": "Rooks — Find the best teaching move.",
      "desc": "Seize the open file with the rook. Prefer the clean idea over flashy side lines. (Logical chess — every move has a plain-English reason)",
      "pitfalls": [
        "Ask why each move helps — development, center, or safety.",
        "Don't hunt pawns while your king is still in the center.",
        "Prefer improving your worst piece over a random check."
      ]
    }
  ];

  const BOOK_LABEL = {
    chandler: "Chandler · Mates",
    masetti: "Masetti · Tactics",
    chernev: "Chernev · Logic",
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
    list.forEach((l, i) => {
      const opt = document.createElement("option");
      opt.value = String(l.n);
      const num = bookFilter === "all" ? l.n : i + 1;
      opt.textContent = `${num}. ${l.title}${completed.has(l.n) ? " ✓" : ""}`;
      lessonSelect.appendChild(opt);
    });
    if (![...lessonSelect.options].some((o) => o.value === String(lessonN))) {
      lessonN = list[0] ? list[0].n : 1;
    }
    lessonSelect.value = String(lessonN);
  }

  function setBookFilter(next) {
    if (!["all", "chandler", "masetti", "chernev"].includes(next)) return;
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
    syncLessonRange();
    loadPuzzle();
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

  function setLesson(uiOrGlobal) {
    // When filtered, treat stepper/slider as 1..bookCount; when all, global 1..600
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

  function syncLessonRange() {
    if (!lessonRange) return;
    const count = lessonCount();
    lessonRange.min = "1";
    lessonRange.max = String(count);
    lessonRange.value = String(uiIndexFromGlobal(lessonN));
    const label = document.querySelector(".level-slider .step-label");
    if (label) label.textContent = `1–${count}`;
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
      infoKickerEl.textContent = `Lesson ${uiIndexFromGlobal(puzzle.n)}/${lessonCount()} · ${bookLabel(puzzle.book)}`;
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
    return `Lesson ${uiIndexFromGlobal(l.n)}/${lessonCount()} · ${bookLabel(l.book)}`;
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
    if (lessonVal) lessonVal.textContent = String(uiIndexFromGlobal(lessonN));
    if (lessonRange) {
      syncLessonRange();
    }
    if (solvedEl) solvedEl.textContent = String(solved);
    if (streakEl) streakEl.textContent = String(streak);
    if (progressEl) progressEl.textContent = `${completed.size}/${LESSONS.length}`;
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
    const list = bookLessons();
    const cur = list.findIndex((l) => l.n === (puzzle ? puzzle.n : lessonN));
    const nxtLesson = list[Math.min(list.length - 1, Math.max(0, cur) + 1)];
    const nxt = nxtLesson ? uiIndexFromGlobal(nxtLesson.n) : lessonCount();
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
    statusEl.textContent = `Solved · ${completed.size}/${LESSONS.length} done`;
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
