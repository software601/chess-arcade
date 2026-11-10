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

  const ENGINE_JS = "/chess005/stockfish-19-lite-single.js";
  const ENGINE_WASM = "/chess005/stockfish-19-lite-single.wasm";
  const GLYPH = {
    wk: "♔", wq: "♕", wr: "♖", wb: "♗", wn: "♘", wp: "♙",
    bk: "♚", bq: "♛", br: "♜", bb: "♝", bn: "♞", bp: "♟",
  };

  /** 300 lessons: Chess Structures / Modern Strategy / Calculation (100 each). Original drills. */
  const LESSONS = [
    {
      "n": 1,
      "book": "structures",
      "title": "IQP (1)",
      "teach": "Isolated queen pawn: piece activity justifies the scar — use open files/diagonals.",
      "hint": "Activate before the IQP bites.",
      "fen": "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "IQP",
      "about": "IQP — Flores Rios–style structure plan.",
      "desc": "Isolated queen pawn: piece activity justifies the scar — use open files/diagonals. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 2,
      "book": "structures",
      "title": "IQP (2)",
      "teach": "Against IQP: blockade d5, trade pieces, endgame favors you.",
      "hint": "Blockade the isolani.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "IQP",
      "about": "IQP — Flores Rios–style structure plan.",
      "desc": "Against IQP: blockade d5, trade pieces, endgame favors you. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 3,
      "book": "structures",
      "title": "Hanging pawns (1)",
      "teach": "Hanging pawns want space and piece support — advance with purpose.",
      "hint": "Support then advance the hangers.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Hanging pawns",
      "about": "Hanging pawns — Flores Rios–style structure plan.",
      "desc": "Hanging pawns want space and piece support — advance with purpose. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 4,
      "book": "structures",
      "title": "Hanging pawns (2)",
      "teach": "Vs hanging pawns: pressure and force an unfavorable advance.",
      "hint": "Pressure the hanging duo.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Hanging pawns",
      "about": "Hanging pawns — Flores Rios–style structure plan.",
      "desc": "Vs hanging pawns: pressure and force an unfavorable advance. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 5,
      "book": "structures",
      "title": "Carlsbad (1)",
      "teach": "Minority attack: create a queenside weakness, then sit on it.",
      "hint": "Start the minority attack.",
      "fen": "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
      "goal": "win",
      "theme": "Carlsbad",
      "about": "Carlsbad — Flores Rios–style structure plan.",
      "desc": "Minority attack: create a queenside weakness, then sit on it. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 6,
      "book": "structures",
      "title": "Carlsbad (2)",
      "teach": "Vs minority attack: ...b5 or piece activity in the center/kingside.",
      "hint": "Meet the minority plan.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "Carlsbad",
      "about": "Carlsbad — Flores Rios–style structure plan.",
      "desc": "Vs minority attack: ...b5 or piece activity in the center/kingside. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 7,
      "book": "structures",
      "title": "Orthodox Exchange (1)",
      "teach": "Same-side minority themes — know who benefits from trades.",
      "hint": "Choose the structure-friendly trade.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Orthodox Exchange",
      "about": "Orthodox Exchange — Flores Rios–style structure plan.",
      "desc": "Same-side minority themes — know who benefits from trades. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 8,
      "book": "structures",
      "title": "Sicilian Scheveningen (1)",
      "teach": "Classic Sicilian: ...d6/...e6 — prepare ...d5 or queenside play.",
      "hint": "Play the Scheveningen break/plan.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Sicilian Scheveningen",
      "about": "Sicilian Scheveningen — Flores Rios–style structure plan.",
      "desc": "Classic Sicilian: ...d6/...e6 — prepare ...d5 or queenside play. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 9,
      "book": "structures",
      "title": "Sicilian Najdorf (1)",
      "teach": "Najdorf: English Attack or classical — pick a coherent plan.",
      "hint": "Follow the Najdorf scheme.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Sicilian Najdorf",
      "about": "Sicilian Najdorf — Flores Rios–style structure plan.",
      "desc": "Najdorf: English Attack or classical — pick a coherent plan. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 10,
      "book": "structures",
      "title": "Sicilian Dragon (1)",
      "teach": "Dragon: Yugoslav vs positional — open the long diagonal or storm.",
      "hint": "Play the Dragon plan.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 2 9",
      "goal": "win",
      "theme": "Sicilian Dragon",
      "about": "Sicilian Dragon — Flores Rios–style structure plan.",
      "desc": "Dragon: Yugoslav vs positional — open the long diagonal or storm. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 11,
      "book": "structures",
      "title": "Sicilian Maróczy (1)",
      "teach": "Maróczy bind: restrain ...d5; squeeze with space.",
      "hint": "Maintain the bind.",
      "fen": "r1bqk2r/pp1pppbp/2n2np1/2p5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5",
      "goal": "win",
      "theme": "Sicilian Maróczy",
      "about": "Sicilian Maróczy — Flores Rios–style structure plan.",
      "desc": "Maróczy bind: restrain ...d5; squeeze with space. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 12,
      "book": "structures",
      "title": "Sicilian Maróczy (2)",
      "teach": "Break the Maróczy with timely ...d5/...b5 preparation.",
      "hint": "Prepare the freeing break.",
      "fen": "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Sicilian Maróczy",
      "about": "Sicilian Maróczy — Flores Rios–style structure plan.",
      "desc": "Break the Maróczy with timely ...d5/...b5 preparation. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 13,
      "book": "structures",
      "title": "French Advance (1)",
      "teach": "French Advance: attack the chain base or tip the wedge.",
      "hint": "Strike the pawn chain correctly.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "French Advance",
      "about": "French Advance — Flores Rios–style structure plan.",
      "desc": "French Advance: attack the chain base or tip the wedge. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 14,
      "book": "structures",
      "title": "French Winawer (1)",
      "teach": "Winawer: doubled c-pawns vs bishop pair and dark squares.",
      "hint": "Use the Winawer imbalance.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "French Winawer",
      "about": "French Winawer — Flores Rios–style structure plan.",
      "desc": "Winawer: doubled c-pawns vs bishop pair and dark squares. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 15,
      "book": "structures",
      "title": "French Tarrasch (1)",
      "teach": "Tarrasch IQP/hanging structures — know which side you want.",
      "hint": "Steer into the right French structure.",
      "fen": "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "French Tarrasch",
      "about": "French Tarrasch — Flores Rios–style structure plan.",
      "desc": "Tarrasch IQP/hanging structures — know which side you want. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 16,
      "book": "structures",
      "title": "KID Classical (1)",
      "teach": "King's Indian: ...f5 storm vs queenside play — race consciously.",
      "hint": "Start the KID plan.",
      "fen": "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "KID Classical",
      "about": "KID Classical — Flores Rios–style structure plan.",
      "desc": "King's Indian: ...f5 storm vs queenside play — race consciously. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 17,
      "book": "structures",
      "title": "KID Sämisch (1)",
      "teach": "Sämisch: space and center; Black needs ...c5/...e5 breaks.",
      "hint": "Time the KID break.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "KID Sämisch",
      "about": "KID Sämisch — Flores Rios–style structure plan.",
      "desc": "Sämisch: space and center; Black needs ...c5/...e5 breaks. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 18,
      "book": "structures",
      "title": "KID Fianchetto (1)",
      "teach": "Fianchetto systems: long diagonal and central restraint.",
      "hint": "Use the fianchetto plan.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "KID Fianchetto",
      "about": "KID Fianchetto — Flores Rios–style structure plan.",
      "desc": "Fianchetto systems: long diagonal and central restraint. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 19,
      "book": "structures",
      "title": "Benoni (1)",
      "teach": "Benoni: queenside majority vs white center — push ...b5 ideas.",
      "hint": "Mobilize the Benoni majority.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Benoni",
      "about": "Benoni — Flores Rios–style structure plan.",
      "desc": "Benoni: queenside majority vs white center — push ...b5 ideas. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 20,
      "book": "structures",
      "title": "Benko (1)",
      "teach": "Benko: lasting queenside pressure for the pawn.",
      "hint": "Use Benko-file pressure.",
      "fen": "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Benko",
      "about": "Benko — Flores Rios–style structure plan.",
      "desc": "Benko: lasting queenside pressure for the pawn. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 21,
      "book": "structures",
      "title": "Hedgehog (1)",
      "teach": "Hedgehog: coiled springs — break with ...b5/...d5 when ready.",
      "hint": "Time the Hedgehog break.",
      "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      "goal": "win",
      "theme": "Hedgehog",
      "about": "Hedgehog — Flores Rios–style structure plan.",
      "desc": "Hedgehog: coiled springs — break with ...b5/...d5 when ready. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 22,
      "book": "structures",
      "title": "Hedgehog (2)",
      "teach": "Vs Hedgehog: restrain breaks; don't overextend into the coil.",
      "hint": "Restrain the Hedgehog.",
      "fen": "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Hedgehog",
      "about": "Hedgehog — Flores Rios–style structure plan.",
      "desc": "Vs Hedgehog: restrain breaks; don't overextend into the coil. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 23,
      "book": "structures",
      "title": "Stonewall (1)",
      "teach": "Stonewall: e4/e5 holes and attacking lanes — own the holes.",
      "hint": "Occupy/control the Stonewall hole.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Stonewall",
      "about": "Stonewall — Flores Rios–style structure plan.",
      "desc": "Stonewall: e4/e5 holes and attacking lanes — own the holes. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 24,
      "book": "structures",
      "title": "Closed Spanish (1)",
      "teach": "Spanish structures: maneuvering, ...d5 breaks, knight tours.",
      "hint": "Play the Spanish maneuver.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Closed Spanish",
      "about": "Closed Spanish — Flores Rios–style structure plan.",
      "desc": "Spanish structures: maneuvering, ...d5 breaks, knight tours. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 25,
      "book": "structures",
      "title": "Open Spanish (1)",
      "teach": "Open Spanish: piece play and central tension — calculate the breaks.",
      "hint": "Resolve/maintain Open Spanish tension.",
      "fen": "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Open Spanish",
      "about": "Open Spanish — Flores Rios–style structure plan.",
      "desc": "Open Spanish: piece play and central tension — calculate the breaks. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 26,
      "book": "structures",
      "title": "QGD Tartakower (1)",
      "teach": "Tartakower/QGD: solid structure — improve minors before breaks.",
      "hint": "Improve within the QGD shell.",
      "fen": "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "QGD Tartakower",
      "about": "QGD Tartakower — Flores Rios–style structure plan.",
      "desc": "Tartakower/QGD: solid structure — improve minors before breaks. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 27,
      "book": "structures",
      "title": "Semi-Slav (1)",
      "teach": "Semi-Slav: Meran or anti-Meran — know the pawn levers.",
      "hint": "Play the Semi-Slav lever.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Semi-Slav",
      "about": "Semi-Slav — Flores Rios–style structure plan.",
      "desc": "Semi-Slav: Meran or anti-Meran — know the pawn levers. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 28,
      "book": "structures",
      "title": "Slav (1)",
      "teach": "Slav: solid c6; decide between ...dxc4 and holding the center.",
      "hint": "Choose the Slav plan.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Slav",
      "about": "Slav — Flores Rios–style structure plan.",
      "desc": "Slav: solid c6; decide between ...dxc4 and holding the center. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 29,
      "book": "structures",
      "title": "Catalan (1)",
      "teach": "Catalan pressure on the long diagonal — open or keep the bind.",
      "hint": "Use Catalan diagonal pressure.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Catalan",
      "about": "Catalan — Flores Rios–style structure plan.",
      "desc": "Catalan pressure on the long diagonal — open or keep the bind. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 30,
      "book": "structures",
      "title": "English Symmetrical (1)",
      "teach": "Symmetrical English: small edges via better piece placement.",
      "hint": "Improve the English setup.",
      "fen": "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
      "goal": "win",
      "theme": "English Symmetrical",
      "about": "English Symmetrical — Flores Rios–style structure plan.",
      "desc": "Symmetrical English: small edges via better piece placement. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 31,
      "book": "structures",
      "title": "English Botvinnik (1)",
      "teach": "Botvinnik English: clamp on d5; kingside space.",
      "hint": "Maintain the Botvinnik clamp.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "English Botvinnik",
      "about": "English Botvinnik — Flores Rios–style structure plan.",
      "desc": "Botvinnik English: clamp on d5; kingside space. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 32,
      "book": "structures",
      "title": "d5 Chain (1)",
      "teach": "Pawn chain: attack the base, not only the head.",
      "hint": "Attack the chain base.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "d5 Chain",
      "about": "d5 Chain — Flores Rios–style structure plan.",
      "desc": "Pawn chain: attack the base, not only the head. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 33,
      "book": "structures",
      "title": "e5 Chain (1)",
      "teach": "Advance chain: tip it or undermine with timely breaks.",
      "hint": "Undermine the e5 wedge.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "e5 Chain",
      "about": "e5 Chain — Flores Rios–style structure plan.",
      "desc": "Advance chain: tip it or undermine with timely breaks. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 34,
      "book": "structures",
      "title": "Doubled c-pawns (1)",
      "teach": "Doubled c-pawns: open b-file and dark-square play.",
      "hint": "Use the doubled-c imbalance.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Doubled c-pawns",
      "about": "Doubled c-pawns — Flores Rios–style structure plan.",
      "desc": "Doubled c-pawns: open b-file and dark-square play. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 35,
      "book": "structures",
      "title": "Backward d-pawn (1)",
      "teach": "Backward pawn on open file: pile up or liberate with a break.",
      "hint": "Pressure or free the backward pawn.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 2 9",
      "goal": "win",
      "theme": "Backward d-pawn",
      "about": "Backward d-pawn — Flores Rios–style structure plan.",
      "desc": "Backward pawn on open file: pile up or liberate with a break. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 36,
      "book": "structures",
      "title": "Isolated pair (1)",
      "teach": "Related isolani themes — activity vs long-term weakness.",
      "hint": "Pick activity or restraint.",
      "fen": "r1bqk2r/pp1pppbp/2n2np1/2p5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5",
      "goal": "win",
      "theme": "Isolated pair",
      "about": "Isolated pair — Flores Rios–style structure plan.",
      "desc": "Related isolani themes — activity vs long-term weakness. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 37,
      "book": "structures",
      "title": "Panov structure (1)",
      "teach": "Panov IQP: classic piece play vs the isolani.",
      "hint": "Play the Panov IQP plan.",
      "fen": "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Panov structure",
      "about": "Panov structure — Flores Rios–style structure plan.",
      "desc": "Panov IQP: classic piece play vs the isolani. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 38,
      "book": "structures",
      "title": "Exchange French (1)",
      "teach": "Exchange French: open files and minority ideas.",
      "hint": "Use the open French file.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Exchange French",
      "about": "Exchange French — Flores Rios–style structure plan.",
      "desc": "Exchange French: open files and minority ideas. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 39,
      "book": "structures",
      "title": "Ruy Exchange (1)",
      "teach": "Exchange Spanish: bishop pair vs structure — open when ready.",
      "hint": "Open for the bishop pair.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Ruy Exchange",
      "about": "Ruy Exchange — Flores Rios–style structure plan.",
      "desc": "Exchange Spanish: bishop pair vs structure — open when ready. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 40,
      "book": "structures",
      "title": "Philidor shell (1)",
      "teach": "Cramped but solid: prepare the freeing break carefully.",
      "hint": "Prepare the freeing break.",
      "fen": "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Philidor shell",
      "about": "Philidor shell — Flores Rios–style structure plan.",
      "desc": "Cramped but solid: prepare the freeing break carefully. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 41,
      "book": "structures",
      "title": "Colle/Zukertort (1)",
      "teach": "Colle systems: e4 break and kingside battery.",
      "hint": "Time the e4 break.",
      "fen": "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Colle/Zukertort",
      "about": "Colle/Zukertort — Flores Rios–style structure plan.",
      "desc": "Colle systems: e4 break and kingside battery. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 42,
      "book": "structures",
      "title": "London structure (1)",
      "teach": "London: solid setup — improve pieces, then break.",
      "hint": "Improve then break.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "London structure",
      "about": "London structure — Flores Rios–style structure plan.",
      "desc": "London: solid setup — improve pieces, then break. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 43,
      "book": "structures",
      "title": "Trompowsky/Veresov (1)",
      "teach": "Early bishop pin structures — decide whether to keep tension.",
      "hint": "Handle the early pin structure.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "Trompowsky/Veresov",
      "about": "Trompowsky/Veresov — Flores Rios–style structure plan.",
      "desc": "Early bishop pin structures — decide whether to keep tension. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 44,
      "book": "structures",
      "title": "King's Indian Attack (1)",
      "teach": "KIA: automatic kingside plan vs queenside counter.",
      "hint": "Launch the KIA scheme.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "King's Indian Attack",
      "about": "King's Indian Attack — Flores Rios–style structure plan.",
      "desc": "KIA: automatic kingside plan vs queenside counter. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 45,
      "book": "structures",
      "title": "Grand Prix structure (1)",
      "teach": "Sicilian GP: f4–f5 attacking shell.",
      "hint": "Push the GP attack plan.",
      "fen": "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Grand Prix structure",
      "about": "Grand Prix structure — Flores Rios–style structure plan.",
      "desc": "Sicilian GP: f4–f5 attacking shell. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 46,
      "book": "structures",
      "title": "Closed Sicilian (1)",
      "teach": "Closed Sicilian: slow kingside build vs ...b5.",
      "hint": "Build or break in Closed Sicilian.",
      "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      "goal": "win",
      "theme": "Closed Sicilian",
      "about": "Closed Sicilian — Flores Rios–style structure plan.",
      "desc": "Closed Sicilian: slow kingside build vs ...b5. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 47,
      "book": "structures",
      "title": "Accelerated Dragon (1)",
      "teach": "Maróczy vs Accelerated — know the bind plans.",
      "hint": "Play vs/with the Accelerated structure.",
      "fen": "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Accelerated Dragon",
      "about": "Accelerated Dragon — Flores Rios–style structure plan.",
      "desc": "Maróczy vs Accelerated — know the bind plans. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 48,
      "book": "structures",
      "title": "Classical Sicilian (1)",
      "teach": "Classical: ...Be7/...0-0 and thematic ...d5.",
      "hint": "Prepare ...d5.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Classical Sicilian",
      "about": "Classical Sicilian — Flores Rios–style structure plan.",
      "desc": "Classical: ...Be7/...0-0 and thematic ...d5. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 49,
      "book": "structures",
      "title": "4...Nf6 Caro (1)",
      "teach": "Caro-Kann structures: solid vs space — choose the break.",
      "hint": "Play the Caro plan.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "4...Nf6 Caro",
      "about": "4...Nf6 Caro — Flores Rios–style structure plan.",
      "desc": "Caro-Kann structures: solid vs space — choose the break. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 50,
      "book": "structures",
      "title": "Advance Caro (1)",
      "teach": "Advance Caro: ...c5 and piece pressure on d4.",
      "hint": "Strike with ...c5 ideas.",
      "fen": "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Advance Caro",
      "about": "Advance Caro — Flores Rios–style structure plan.",
      "desc": "Advance Caro: ...c5 and piece pressure on d4. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 51,
      "book": "structures",
      "title": "IQP (3)",
      "teach": "Isolated queen pawn: piece activity justifies the scar — use open files/diagonals.",
      "hint": "Activate before the IQP bites.",
      "fen": "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "IQP",
      "about": "IQP — Flores Rios–style structure plan.",
      "desc": "Isolated queen pawn: piece activity justifies the scar — use open files/diagonals. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 52,
      "book": "structures",
      "title": "IQP (4)",
      "teach": "Against IQP: blockade d5, trade pieces, endgame favors you.",
      "hint": "Blockade the isolani.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "IQP",
      "about": "IQP — Flores Rios–style structure plan.",
      "desc": "Against IQP: blockade d5, trade pieces, endgame favors you. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 53,
      "book": "structures",
      "title": "Hanging pawns (3)",
      "teach": "Hanging pawns want space and piece support — advance with purpose.",
      "hint": "Support then advance the hangers.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Hanging pawns",
      "about": "Hanging pawns — Flores Rios–style structure plan.",
      "desc": "Hanging pawns want space and piece support — advance with purpose. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 54,
      "book": "structures",
      "title": "Hanging pawns (4)",
      "teach": "Vs hanging pawns: pressure and force an unfavorable advance.",
      "hint": "Pressure the hanging duo.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Hanging pawns",
      "about": "Hanging pawns — Flores Rios–style structure plan.",
      "desc": "Vs hanging pawns: pressure and force an unfavorable advance. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 55,
      "book": "structures",
      "title": "Carlsbad (3)",
      "teach": "Minority attack: create a queenside weakness, then sit on it.",
      "hint": "Start the minority attack.",
      "fen": "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
      "goal": "win",
      "theme": "Carlsbad",
      "about": "Carlsbad — Flores Rios–style structure plan.",
      "desc": "Minority attack: create a queenside weakness, then sit on it. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 56,
      "book": "structures",
      "title": "Carlsbad (4)",
      "teach": "Vs minority attack: ...b5 or piece activity in the center/kingside.",
      "hint": "Meet the minority plan.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "Carlsbad",
      "about": "Carlsbad — Flores Rios–style structure plan.",
      "desc": "Vs minority attack: ...b5 or piece activity in the center/kingside. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 57,
      "book": "structures",
      "title": "Orthodox Exchange (2)",
      "teach": "Same-side minority themes — know who benefits from trades.",
      "hint": "Choose the structure-friendly trade.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Orthodox Exchange",
      "about": "Orthodox Exchange — Flores Rios–style structure plan.",
      "desc": "Same-side minority themes — know who benefits from trades. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 58,
      "book": "structures",
      "title": "Sicilian Scheveningen (2)",
      "teach": "Classic Sicilian: ...d6/...e6 — prepare ...d5 or queenside play.",
      "hint": "Play the Scheveningen break/plan.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Sicilian Scheveningen",
      "about": "Sicilian Scheveningen — Flores Rios–style structure plan.",
      "desc": "Classic Sicilian: ...d6/...e6 — prepare ...d5 or queenside play. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 59,
      "book": "structures",
      "title": "Sicilian Najdorf (2)",
      "teach": "Najdorf: English Attack or classical — pick a coherent plan.",
      "hint": "Follow the Najdorf scheme.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Sicilian Najdorf",
      "about": "Sicilian Najdorf — Flores Rios–style structure plan.",
      "desc": "Najdorf: English Attack or classical — pick a coherent plan. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 60,
      "book": "structures",
      "title": "Sicilian Dragon (2)",
      "teach": "Dragon: Yugoslav vs positional — open the long diagonal or storm.",
      "hint": "Play the Dragon plan.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 2 9",
      "goal": "win",
      "theme": "Sicilian Dragon",
      "about": "Sicilian Dragon — Flores Rios–style structure plan.",
      "desc": "Dragon: Yugoslav vs positional — open the long diagonal or storm. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 61,
      "book": "structures",
      "title": "Sicilian Maróczy (3)",
      "teach": "Maróczy bind: restrain ...d5; squeeze with space.",
      "hint": "Maintain the bind.",
      "fen": "r1bqk2r/pp1pppbp/2n2np1/2p5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5",
      "goal": "win",
      "theme": "Sicilian Maróczy",
      "about": "Sicilian Maróczy — Flores Rios–style structure plan.",
      "desc": "Maróczy bind: restrain ...d5; squeeze with space. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 62,
      "book": "structures",
      "title": "Sicilian Maróczy (4)",
      "teach": "Break the Maróczy with timely ...d5/...b5 preparation.",
      "hint": "Prepare the freeing break.",
      "fen": "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Sicilian Maróczy",
      "about": "Sicilian Maróczy — Flores Rios–style structure plan.",
      "desc": "Break the Maróczy with timely ...d5/...b5 preparation. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 63,
      "book": "structures",
      "title": "French Advance (2)",
      "teach": "French Advance: attack the chain base or tip the wedge.",
      "hint": "Strike the pawn chain correctly.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "French Advance",
      "about": "French Advance — Flores Rios–style structure plan.",
      "desc": "French Advance: attack the chain base or tip the wedge. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 64,
      "book": "structures",
      "title": "French Winawer (2)",
      "teach": "Winawer: doubled c-pawns vs bishop pair and dark squares.",
      "hint": "Use the Winawer imbalance.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "French Winawer",
      "about": "French Winawer — Flores Rios–style structure plan.",
      "desc": "Winawer: doubled c-pawns vs bishop pair and dark squares. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 65,
      "book": "structures",
      "title": "French Tarrasch (2)",
      "teach": "Tarrasch IQP/hanging structures — know which side you want.",
      "hint": "Steer into the right French structure.",
      "fen": "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "French Tarrasch",
      "about": "French Tarrasch — Flores Rios–style structure plan.",
      "desc": "Tarrasch IQP/hanging structures — know which side you want. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 66,
      "book": "structures",
      "title": "KID Classical (2)",
      "teach": "King's Indian: ...f5 storm vs queenside play — race consciously.",
      "hint": "Start the KID plan.",
      "fen": "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "KID Classical",
      "about": "KID Classical — Flores Rios–style structure plan.",
      "desc": "King's Indian: ...f5 storm vs queenside play — race consciously. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 67,
      "book": "structures",
      "title": "KID Sämisch (2)",
      "teach": "Sämisch: space and center; Black needs ...c5/...e5 breaks.",
      "hint": "Time the KID break.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "KID Sämisch",
      "about": "KID Sämisch — Flores Rios–style structure plan.",
      "desc": "Sämisch: space and center; Black needs ...c5/...e5 breaks. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 68,
      "book": "structures",
      "title": "KID Fianchetto (2)",
      "teach": "Fianchetto systems: long diagonal and central restraint.",
      "hint": "Use the fianchetto plan.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "KID Fianchetto",
      "about": "KID Fianchetto — Flores Rios–style structure plan.",
      "desc": "Fianchetto systems: long diagonal and central restraint. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 69,
      "book": "structures",
      "title": "Benoni (2)",
      "teach": "Benoni: queenside majority vs white center — push ...b5 ideas.",
      "hint": "Mobilize the Benoni majority.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Benoni",
      "about": "Benoni — Flores Rios–style structure plan.",
      "desc": "Benoni: queenside majority vs white center — push ...b5 ideas. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 70,
      "book": "structures",
      "title": "Benko (2)",
      "teach": "Benko: lasting queenside pressure for the pawn.",
      "hint": "Use Benko-file pressure.",
      "fen": "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Benko",
      "about": "Benko — Flores Rios–style structure plan.",
      "desc": "Benko: lasting queenside pressure for the pawn. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 71,
      "book": "structures",
      "title": "Hedgehog (3)",
      "teach": "Hedgehog: coiled springs — break with ...b5/...d5 when ready.",
      "hint": "Time the Hedgehog break.",
      "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      "goal": "win",
      "theme": "Hedgehog",
      "about": "Hedgehog — Flores Rios–style structure plan.",
      "desc": "Hedgehog: coiled springs — break with ...b5/...d5 when ready. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 72,
      "book": "structures",
      "title": "Hedgehog (4)",
      "teach": "Vs Hedgehog: restrain breaks; don't overextend into the coil.",
      "hint": "Restrain the Hedgehog.",
      "fen": "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Hedgehog",
      "about": "Hedgehog — Flores Rios–style structure plan.",
      "desc": "Vs Hedgehog: restrain breaks; don't overextend into the coil. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 73,
      "book": "structures",
      "title": "Stonewall (2)",
      "teach": "Stonewall: e4/e5 holes and attacking lanes — own the holes.",
      "hint": "Occupy/control the Stonewall hole.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Stonewall",
      "about": "Stonewall — Flores Rios–style structure plan.",
      "desc": "Stonewall: e4/e5 holes and attacking lanes — own the holes. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 74,
      "book": "structures",
      "title": "Closed Spanish (2)",
      "teach": "Spanish structures: maneuvering, ...d5 breaks, knight tours.",
      "hint": "Play the Spanish maneuver.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Closed Spanish",
      "about": "Closed Spanish — Flores Rios–style structure plan.",
      "desc": "Spanish structures: maneuvering, ...d5 breaks, knight tours. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 75,
      "book": "structures",
      "title": "Open Spanish (2)",
      "teach": "Open Spanish: piece play and central tension — calculate the breaks.",
      "hint": "Resolve/maintain Open Spanish tension.",
      "fen": "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Open Spanish",
      "about": "Open Spanish — Flores Rios–style structure plan.",
      "desc": "Open Spanish: piece play and central tension — calculate the breaks. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 76,
      "book": "structures",
      "title": "QGD Tartakower (2)",
      "teach": "Tartakower/QGD: solid structure — improve minors before breaks.",
      "hint": "Improve within the QGD shell.",
      "fen": "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "QGD Tartakower",
      "about": "QGD Tartakower — Flores Rios–style structure plan.",
      "desc": "Tartakower/QGD: solid structure — improve minors before breaks. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 77,
      "book": "structures",
      "title": "Semi-Slav (2)",
      "teach": "Semi-Slav: Meran or anti-Meran — know the pawn levers.",
      "hint": "Play the Semi-Slav lever.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Semi-Slav",
      "about": "Semi-Slav — Flores Rios–style structure plan.",
      "desc": "Semi-Slav: Meran or anti-Meran — know the pawn levers. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 78,
      "book": "structures",
      "title": "Slav (2)",
      "teach": "Slav: solid c6; decide between ...dxc4 and holding the center.",
      "hint": "Choose the Slav plan.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Slav",
      "about": "Slav — Flores Rios–style structure plan.",
      "desc": "Slav: solid c6; decide between ...dxc4 and holding the center. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 79,
      "book": "structures",
      "title": "Catalan (2)",
      "teach": "Catalan pressure on the long diagonal — open or keep the bind.",
      "hint": "Use Catalan diagonal pressure.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Catalan",
      "about": "Catalan — Flores Rios–style structure plan.",
      "desc": "Catalan pressure on the long diagonal — open or keep the bind. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 80,
      "book": "structures",
      "title": "English Symmetrical (2)",
      "teach": "Symmetrical English: small edges via better piece placement.",
      "hint": "Improve the English setup.",
      "fen": "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
      "goal": "win",
      "theme": "English Symmetrical",
      "about": "English Symmetrical — Flores Rios–style structure plan.",
      "desc": "Symmetrical English: small edges via better piece placement. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 81,
      "book": "structures",
      "title": "English Botvinnik (2)",
      "teach": "Botvinnik English: clamp on d5; kingside space.",
      "hint": "Maintain the Botvinnik clamp.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "English Botvinnik",
      "about": "English Botvinnik — Flores Rios–style structure plan.",
      "desc": "Botvinnik English: clamp on d5; kingside space. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 82,
      "book": "structures",
      "title": "d5 Chain (2)",
      "teach": "Pawn chain: attack the base, not only the head.",
      "hint": "Attack the chain base.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "d5 Chain",
      "about": "d5 Chain — Flores Rios–style structure plan.",
      "desc": "Pawn chain: attack the base, not only the head. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 83,
      "book": "structures",
      "title": "e5 Chain (2)",
      "teach": "Advance chain: tip it or undermine with timely breaks.",
      "hint": "Undermine the e5 wedge.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "e5 Chain",
      "about": "e5 Chain — Flores Rios–style structure plan.",
      "desc": "Advance chain: tip it or undermine with timely breaks. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 84,
      "book": "structures",
      "title": "Doubled c-pawns (2)",
      "teach": "Doubled c-pawns: open b-file and dark-square play.",
      "hint": "Use the doubled-c imbalance.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Doubled c-pawns",
      "about": "Doubled c-pawns — Flores Rios–style structure plan.",
      "desc": "Doubled c-pawns: open b-file and dark-square play. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 85,
      "book": "structures",
      "title": "Backward d-pawn (2)",
      "teach": "Backward pawn on open file: pile up or liberate with a break.",
      "hint": "Pressure or free the backward pawn.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 2 9",
      "goal": "win",
      "theme": "Backward d-pawn",
      "about": "Backward d-pawn — Flores Rios–style structure plan.",
      "desc": "Backward pawn on open file: pile up or liberate with a break. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 86,
      "book": "structures",
      "title": "Isolated pair (2)",
      "teach": "Related isolani themes — activity vs long-term weakness.",
      "hint": "Pick activity or restraint.",
      "fen": "r1bqk2r/pp1pppbp/2n2np1/2p5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5",
      "goal": "win",
      "theme": "Isolated pair",
      "about": "Isolated pair — Flores Rios–style structure plan.",
      "desc": "Related isolani themes — activity vs long-term weakness. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 87,
      "book": "structures",
      "title": "Panov structure (2)",
      "teach": "Panov IQP: classic piece play vs the isolani.",
      "hint": "Play the Panov IQP plan.",
      "fen": "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Panov structure",
      "about": "Panov structure — Flores Rios–style structure plan.",
      "desc": "Panov IQP: classic piece play vs the isolani. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 88,
      "book": "structures",
      "title": "Exchange French (2)",
      "teach": "Exchange French: open files and minority ideas.",
      "hint": "Use the open French file.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Exchange French",
      "about": "Exchange French — Flores Rios–style structure plan.",
      "desc": "Exchange French: open files and minority ideas. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 89,
      "book": "structures",
      "title": "Ruy Exchange (2)",
      "teach": "Exchange Spanish: bishop pair vs structure — open when ready.",
      "hint": "Open for the bishop pair.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Ruy Exchange",
      "about": "Ruy Exchange — Flores Rios–style structure plan.",
      "desc": "Exchange Spanish: bishop pair vs structure — open when ready. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 90,
      "book": "structures",
      "title": "Philidor shell (2)",
      "teach": "Cramped but solid: prepare the freeing break carefully.",
      "hint": "Prepare the freeing break.",
      "fen": "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Philidor shell",
      "about": "Philidor shell — Flores Rios–style structure plan.",
      "desc": "Cramped but solid: prepare the freeing break carefully. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 91,
      "book": "structures",
      "title": "Colle/Zukertort (2)",
      "teach": "Colle systems: e4 break and kingside battery.",
      "hint": "Time the e4 break.",
      "fen": "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Colle/Zukertort",
      "about": "Colle/Zukertort — Flores Rios–style structure plan.",
      "desc": "Colle systems: e4 break and kingside battery. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 92,
      "book": "structures",
      "title": "London structure (2)",
      "teach": "London: solid setup — improve pieces, then break.",
      "hint": "Improve then break.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "London structure",
      "about": "London structure — Flores Rios–style structure plan.",
      "desc": "London: solid setup — improve pieces, then break. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 93,
      "book": "structures",
      "title": "Trompowsky/Veresov (2)",
      "teach": "Early bishop pin structures — decide whether to keep tension.",
      "hint": "Handle the early pin structure.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "Trompowsky/Veresov",
      "about": "Trompowsky/Veresov — Flores Rios–style structure plan.",
      "desc": "Early bishop pin structures — decide whether to keep tension. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 94,
      "book": "structures",
      "title": "King's Indian Attack (2)",
      "teach": "KIA: automatic kingside plan vs queenside counter.",
      "hint": "Launch the KIA scheme.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "King's Indian Attack",
      "about": "King's Indian Attack — Flores Rios–style structure plan.",
      "desc": "KIA: automatic kingside plan vs queenside counter. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 95,
      "book": "structures",
      "title": "Grand Prix structure (2)",
      "teach": "Sicilian GP: f4–f5 attacking shell.",
      "hint": "Push the GP attack plan.",
      "fen": "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Grand Prix structure",
      "about": "Grand Prix structure — Flores Rios–style structure plan.",
      "desc": "Sicilian GP: f4–f5 attacking shell. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 96,
      "book": "structures",
      "title": "Closed Sicilian (2)",
      "teach": "Closed Sicilian: slow kingside build vs ...b5.",
      "hint": "Build or break in Closed Sicilian.",
      "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      "goal": "win",
      "theme": "Closed Sicilian",
      "about": "Closed Sicilian — Flores Rios–style structure plan.",
      "desc": "Closed Sicilian: slow kingside build vs ...b5. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 97,
      "book": "structures",
      "title": "Accelerated Dragon (2)",
      "teach": "Maróczy vs Accelerated — know the bind plans.",
      "hint": "Play vs/with the Accelerated structure.",
      "fen": "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Accelerated Dragon",
      "about": "Accelerated Dragon — Flores Rios–style structure plan.",
      "desc": "Maróczy vs Accelerated — know the bind plans. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 98,
      "book": "structures",
      "title": "Classical Sicilian (2)",
      "teach": "Classical: ...Be7/...0-0 and thematic ...d5.",
      "hint": "Prepare ...d5.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Classical Sicilian",
      "about": "Classical Sicilian — Flores Rios–style structure plan.",
      "desc": "Classical: ...Be7/...0-0 and thematic ...d5. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 99,
      "book": "structures",
      "title": "4...Nf6 Caro (2)",
      "teach": "Caro-Kann structures: solid vs space — choose the break.",
      "hint": "Play the Caro plan.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "4...Nf6 Caro",
      "about": "4...Nf6 Caro — Flores Rios–style structure plan.",
      "desc": "Caro-Kann structures: solid vs space — choose the break. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 100,
      "book": "structures",
      "title": "Advance Caro (2)",
      "teach": "Advance Caro: ...c5 and piece pressure on d4.",
      "hint": "Strike with ...c5 ideas.",
      "fen": "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Advance Caro",
      "about": "Advance Caro — Flores Rios–style structure plan.",
      "desc": "Advance Caro: ...c5 and piece pressure on d4. Prefer the typical plan for this pawn structure. (Chess Structures–style · advanced ≈1700–2200)",
      "pitfalls": [
        "Name the pawn structure before inventing a plan.",
        "Play the typical break for this structure — not a random attack.",
        "Improve the worst piece that belongs in this structure's scheme."
      ]
    },
    {
      "n": 101,
      "book": "watson",
      "title": "Rule skepticism (1)",
      "teach": "Classical rules are guidelines — test them against dynamics.",
      "hint": "Prefer the modern dynamic choice.",
      "fen": "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
      "goal": "win",
      "theme": "Rule skepticism",
      "about": "Rule skepticism — Watson-style modern strategy.",
      "desc": "Classical rules are guidelines — test them against dynamics. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 102,
      "book": "watson",
      "title": "Dynamic vs static (1)",
      "teach": "Static pluses last; dynamics must be cashed now.",
      "hint": "Cash the dynamic chance.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "Dynamic vs static",
      "about": "Dynamic vs static — Watson-style modern strategy.",
      "desc": "Static pluses last; dynamics must be cashed now. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 103,
      "book": "watson",
      "title": "Exchange sac modern (1)",
      "teach": "Modern exchange sacs buy squares, not just attack.",
      "hint": "Consider the positional exchange sac.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Exchange sac modern",
      "about": "Exchange sac modern — Watson-style modern strategy.",
      "desc": "Modern exchange sacs buy squares, not just attack. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 104,
      "book": "watson",
      "title": "Exchange sac decline (1)",
      "teach": "Not every exchange sac is sound — calculate returns.",
      "hint": "Decline or refute the sac.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Exchange sac decline",
      "about": "Exchange sac decline — Watson-style modern strategy.",
      "desc": "Not every exchange sac is sound — calculate returns. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 105,
      "book": "watson",
      "title": "Prophylaxis modern (1)",
      "teach": "Prevent their only idea, then improve.",
      "hint": "Play the prophylactic move.",
      "fen": "r1bqkb1r/pp1ppppp/2n2n2/2p5/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 4",
      "goal": "win",
      "theme": "Prophylaxis modern",
      "about": "Prophylaxis modern — Watson-style modern strategy.",
      "desc": "Prevent their only idea, then improve. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 106,
      "book": "watson",
      "title": "Overprotection update (1)",
      "teach": "Overprotection is rare now — activity usually trumps it.",
      "hint": "Choose activity over ritual overprotection.",
      "fen": "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Overprotection update",
      "about": "Overprotection update — Watson-style modern strategy.",
      "desc": "Overprotection is rare now — activity usually trumps it. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 107,
      "book": "watson",
      "title": "Blockade evolved (1)",
      "teach": "Blockade still matters — but sometimes transform instead.",
      "hint": "Blockade or transform wisely.",
      "fen": "rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 6",
      "goal": "win",
      "theme": "Blockade evolved",
      "about": "Blockade evolved — Watson-style modern strategy.",
      "desc": "Blockade still matters — but sometimes transform instead. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 108,
      "book": "watson",
      "title": "Two bishops modern (1)",
      "teach": "Open when ready; don't wait forever for the 'ideal' moment.",
      "hint": "Open for the bishops.",
      "fen": "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Two bishops modern",
      "about": "Two bishops modern — Watson-style modern strategy.",
      "desc": "Open when ready; don't wait forever for the 'ideal' moment. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 109,
      "book": "watson",
      "title": "Knight outposts (1)",
      "teach": "Outposts remain gold — create and occupy them.",
      "hint": "Claim the outpost.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Knight outposts",
      "about": "Knight outposts — Watson-style modern strategy.",
      "desc": "Outposts remain gold — create and occupy them. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 110,
      "book": "watson",
      "title": "Pawn chain myths (1)",
      "teach": "Attacking the base isn't automatic — calculate the timing.",
      "hint": "Time the chain attack.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "Pawn chain myths",
      "about": "Pawn chain myths — Watson-style modern strategy.",
      "desc": "Attacking the base isn't automatic — calculate the timing. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 111,
      "book": "watson",
      "title": "Restraint (1)",
      "teach": "Restrain first, attack second — modern Botvinnik echo.",
      "hint": "Restrain their breaks.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Restraint",
      "about": "Restraint — Watson-style modern strategy.",
      "desc": "Restrain first, attack second — modern Botvinnik echo. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 112,
      "book": "watson",
      "title": "Transformation (1)",
      "teach": "Convert one advantage into an easier one.",
      "hint": "Transform the plus.",
      "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      "goal": "win",
      "theme": "Transformation",
      "about": "Transformation — Watson-style modern strategy.",
      "desc": "Convert one advantage into an easier one. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 113,
      "book": "watson",
      "title": "Initiative over material (1)",
      "teach": "A lasting initiative can outweigh a pawn.",
      "hint": "Keep the initiative.",
      "fen": "rnbqk2r/pp2ppbp/5np1/2pp4/3P4/2P2NP1/PP2PP1P/RNBQKB1R w KQkq - 0 6",
      "goal": "win",
      "theme": "Initiative over material",
      "about": "Initiative over material — Watson-style modern strategy.",
      "desc": "A lasting initiative can outweigh a pawn. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 114,
      "book": "watson",
      "title": "Material over initiative (1)",
      "teach": "Sometimes just take the pawn and consolidate.",
      "hint": "Grab and consolidate.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Material over initiative",
      "about": "Material over initiative — Watson-style modern strategy.",
      "desc": "Sometimes just take the pawn and consolidate. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 115,
      "book": "watson",
      "title": "Space with purpose (1)",
      "teach": "Space needs plans; empty space evaporates.",
      "hint": "Use the space (or release correctly).",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Space with purpose",
      "about": "Space with purpose — Watson-style modern strategy.",
      "desc": "Space needs plans; empty space evaporates. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 116,
      "book": "watson",
      "title": "Freeing breaks (1)",
      "teach": "The freeing break is often the whole plan.",
      "hint": "Play/prepare the freeing break.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Freeing breaks",
      "about": "Freeing breaks — Watson-style modern strategy.",
      "desc": "The freeing break is often the whole plan. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 117,
      "book": "watson",
      "title": "Modern center (1)",
      "teach": "Centers can be controlled with pieces, not only pawns.",
      "hint": "Control the center dynamically.",
      "fen": "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Modern center",
      "about": "Modern center — Watson-style modern strategy.",
      "desc": "Centers can be controlled with pieces, not only pawns. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 118,
      "book": "watson",
      "title": "Hanging pawns modern (1)",
      "teach": "Hanging pawns are tools — advance or restrain with intent.",
      "hint": "Handle hangers modernly.",
      "fen": "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
      "goal": "win",
      "theme": "Hanging pawns modern",
      "about": "Hanging pawns modern — Watson-style modern strategy.",
      "desc": "Hanging pawns are tools — advance or restrain with intent. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 119,
      "book": "watson",
      "title": "IQP modern (1)",
      "teach": "IQP play is more concrete now — calculate the timing.",
      "hint": "Play the concrete IQP move.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "IQP modern",
      "about": "IQP modern — Watson-style modern strategy.",
      "desc": "IQP play is more concrete now — calculate the timing. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 120,
      "book": "watson",
      "title": "Opposite castling (1)",
      "teach": "Opposite castling: race, but don't forget central breaks.",
      "hint": "Race with a central eye.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Opposite castling",
      "about": "Opposite castling — Watson-style modern strategy.",
      "desc": "Opposite castling: race, but don't forget central breaks. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 121,
      "book": "watson",
      "title": "King safety priority (1)",
      "teach": "Unsafe king trumps pretty structure.",
      "hint": "Prioritize king safety.",
      "fen": "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "King safety priority",
      "about": "King safety priority — Watson-style modern strategy.",
      "desc": "Unsafe king trumps pretty structure. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 122,
      "book": "watson",
      "title": "Piece trades update (1)",
      "teach": "Trade your worst for their best — still true.",
      "hint": "Offer the right trade.",
      "fen": "r1bqk2r/pp1pppbp/2n2np1/2p5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5",
      "goal": "win",
      "theme": "Piece trades update",
      "about": "Piece trades update — Watson-style modern strategy.",
      "desc": "Trade your worst for their best — still true. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 123,
      "book": "watson",
      "title": "Bad bishop modern (1)",
      "teach": "Bad bishops can be useful defenders — evaluate case by case.",
      "hint": "Keep or free the bishop wisely.",
      "fen": "r2q1rk1/ppp1ppbp/2np1np1/8/2PPP1b1/2N2N2/PP2BPPP/R1BQK2R w KQ - 4 8",
      "goal": "win",
      "theme": "Bad bishop modern",
      "about": "Bad bishop modern — Watson-style modern strategy.",
      "desc": "Bad bishops can be useful defenders — evaluate case by case. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 124,
      "book": "watson",
      "title": "Good knight closed (1)",
      "teach": "Closed positions still love knights.",
      "hint": "Keep the knight vs open bishops.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Good knight closed",
      "about": "Good knight closed — Watson-style modern strategy.",
      "desc": "Closed positions still love knights. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 125,
      "book": "watson",
      "title": "Rook lifts (1)",
      "teach": "Rook lifts are modern attacking currency.",
      "hint": "Start the rook lift.",
      "fen": "r1bqk2r/pppp1ppp/2n1pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Rook lifts",
      "about": "Rook lifts — Watson-style modern strategy.",
      "desc": "Rook lifts are modern attacking currency. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 126,
      "book": "watson",
      "title": "Quiet improving move (1)",
      "teach": "Not every position needs a tactic — improve.",
      "hint": "Find the quiet improvement.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Quiet improving move",
      "about": "Quiet improving move — Watson-style modern strategy.",
      "desc": "Not every position needs a tactic — improve. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 127,
      "book": "watson",
      "title": "Practical conversion (1)",
      "teach": "Remove counterplay before pushing the win.",
      "hint": "Kill counterplay first.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/4R1K1 w - - 0 18",
      "goal": "win",
      "theme": "Practical conversion",
      "about": "Practical conversion — Watson-style modern strategy.",
      "desc": "Remove counterplay before pushing the win. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 128,
      "book": "watson",
      "title": "Psychological modern (1)",
      "teach": "Pose problems; don't play only 'best' if unclear.",
      "hint": "Pose a practical problem.",
      "fen": "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Psychological modern",
      "about": "Psychological modern — Watson-style modern strategy.",
      "desc": "Pose problems; don't play only 'best' if unclear. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 129,
      "book": "watson",
      "title": "Computer-age structures (1)",
      "teach": "Some 'ugly' moves are engine-approved — understand why.",
      "hint": "Play the ugly-but-strong idea.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Computer-age structures",
      "about": "Computer-age structures — Watson-style modern strategy.",
      "desc": "Some 'ugly' moves are engine-approved — understand why. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 130,
      "book": "watson",
      "title": "Nimzo heritage (1)",
      "teach": "Restraint and blockade live on — in new clothes.",
      "hint": "Apply updated Nimzo ideas.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Nimzo heritage",
      "about": "Nimzo heritage — Watson-style modern strategy.",
      "desc": "Restraint and blockade live on — in new clothes. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 131,
      "book": "watson",
      "title": "Classical exception (1)",
      "teach": "When the classical move fails, find the exception.",
      "hint": "Play the exceptional move.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Classical exception",
      "about": "Classical exception — Watson-style modern strategy.",
      "desc": "When the classical move fails, find the exception. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 132,
      "book": "watson",
      "title": "Positional sac (1)",
      "teach": "Sac for lasting soft squares, not hope.",
      "hint": "Positional sac only with compensation.",
      "fen": "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Positional sac",
      "about": "Positional sac — Watson-style modern strategy.",
      "desc": "Sac for lasting soft squares, not hope. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 133,
      "book": "watson",
      "title": "Color complex (1)",
      "teach": "Dominate a color complex after the right trade.",
      "hint": "Target the soft color.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Color complex",
      "about": "Color complex — Watson-style modern strategy.",
      "desc": "Dominate a color complex after the right trade. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 134,
      "book": "watson",
      "title": "Minority ideas (1)",
      "teach": "Minority attack logic appears beyond Carlsbad.",
      "hint": "Create the structural weakness.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Minority ideas",
      "about": "Minority ideas — Watson-style modern strategy.",
      "desc": "Minority attack logic appears beyond Carlsbad. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 135,
      "book": "watson",
      "title": "Majority use (1)",
      "teach": "Mobilize your majority before theirs runs.",
      "hint": "Mobilize the majority.",
      "fen": "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Majority use",
      "about": "Majority use — Watson-style modern strategy.",
      "desc": "Mobilize your majority before theirs runs. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 136,
      "book": "watson",
      "title": "Passed pawn modern (1)",
      "teach": "Passed pawns need support nets, not lonely runs.",
      "hint": "Support the passer.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Passed pawn modern",
      "about": "Passed pawn modern — Watson-style modern strategy.",
      "desc": "Passed pawns need support nets, not lonely runs. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 137,
      "book": "watson",
      "title": "Endgame transition (1)",
      "teach": "Modern players liquidate earlier — calculate first.",
      "hint": "Only liquidate into a plus.",
      "fen": "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Endgame transition",
      "about": "Endgame transition — Watson-style modern strategy.",
      "desc": "Modern players liquidate earlier — calculate first. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 138,
      "book": "watson",
      "title": "Prophylaxis vs attack (1)",
      "teach": "Sometimes the best attack starts with a defensive nudge.",
      "hint": "Nudge their plan aside.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 2 9",
      "goal": "win",
      "theme": "Prophylaxis vs attack",
      "about": "Prophylaxis vs attack — Watson-style modern strategy.",
      "desc": "Sometimes the best attack starts with a defensive nudge. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 139,
      "book": "watson",
      "title": "Flexible structures (1)",
      "teach": "Keep pawn options open until information arrives.",
      "hint": "Stay flexible with the structure.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Flexible structures",
      "about": "Flexible structures — Watson-style modern strategy.",
      "desc": "Keep pawn options open until information arrives. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 140,
      "book": "watson",
      "title": "Committing pawns (1)",
      "teach": "Commit pawns only when the piece setup is ready.",
      "hint": "Commit the pawn now.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Committing pawns",
      "about": "Committing pawns — Watson-style modern strategy.",
      "desc": "Commit pawns only when the piece setup is ready. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 141,
      "book": "watson",
      "title": "Outpost prep (1)",
      "teach": "Create the hole, then occupy.",
      "hint": "Prepare the outpost.",
      "fen": "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Outpost prep",
      "about": "Outpost prep — Watson-style modern strategy.",
      "desc": "Create the hole, then occupy. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 142,
      "book": "watson",
      "title": "Undermining (1)",
      "teach": "Undermine wedges with the right lever.",
      "hint": "Undermine.",
      "fen": "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Undermining",
      "about": "Undermining — Watson-style modern strategy.",
      "desc": "Undermine wedges with the right lever. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 143,
      "book": "watson",
      "title": "Overextension (1)",
      "teach": "Punish overextended pawns by fixing then attacking.",
      "hint": "Fix and attack the overextension.",
      "fen": "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14",
      "goal": "win",
      "theme": "Overextension",
      "about": "Overextension — Watson-style modern strategy.",
      "desc": "Punish overextended pawns by fixing then attacking. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 144,
      "book": "watson",
      "title": "Piece coordination (1)",
      "teach": "Coordination beats lone-wolf brilliance.",
      "hint": "Coordinate the army.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Piece coordination",
      "about": "Piece coordination — Watson-style modern strategy.",
      "desc": "Coordination beats lone-wolf brilliance. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 145,
      "book": "watson",
      "title": "Second weakness (1)",
      "teach": "One weakness is holdable — create a second.",
      "hint": "Open the second front.",
      "fen": "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Second weakness",
      "about": "Second weakness — Watson-style modern strategy.",
      "desc": "One weakness is holdable — create a second. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 146,
      "book": "watson",
      "title": "Modern defense (1)",
      "teach": "Active defense and counterbreaks beat pure passivity.",
      "hint": "Defend actively.",
      "fen": "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Modern defense",
      "about": "Modern defense — Watson-style modern strategy.",
      "desc": "Active defense and counterbreaks beat pure passivity. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 147,
      "book": "watson",
      "title": "Initiative retention (1)",
      "teach": "After a gain, keep asking questions.",
      "hint": "Maintain the initiative.",
      "fen": "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/2N2NP1/PP2PP1P/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Initiative retention",
      "about": "Initiative retention — Watson-style modern strategy.",
      "desc": "After a gain, keep asking questions. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 148,
      "book": "watson",
      "title": "Evaluation skill (1)",
      "teach": "Update your eval after every structural change.",
      "hint": "Play to the new evaluation.",
      "fen": "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Evaluation skill",
      "about": "Evaluation skill — Watson-style modern strategy.",
      "desc": "Update your eval after every structural change. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 149,
      "book": "watson",
      "title": "Plan hierarchy (1)",
      "teach": "Main plan, backup plan — switch without ego.",
      "hint": "Switch to the backup plan.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Plan hierarchy",
      "about": "Plan hierarchy — Watson-style modern strategy.",
      "desc": "Main plan, backup plan — switch without ego. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 150,
      "book": "watson",
      "title": "Watson review (1)",
      "teach": "Test the classical rule; play the modern truth.",
      "hint": "Play the modern choice.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Watson review",
      "about": "Watson review — Watson-style modern strategy.",
      "desc": "Test the classical rule; play the modern truth. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 151,
      "book": "watson",
      "title": "Rule skepticism (2)",
      "teach": "Classical rules are guidelines — test them against dynamics.",
      "hint": "Prefer the modern dynamic choice.",
      "fen": "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
      "goal": "win",
      "theme": "Rule skepticism",
      "about": "Rule skepticism — Watson-style modern strategy.",
      "desc": "Classical rules are guidelines — test them against dynamics. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 152,
      "book": "watson",
      "title": "Dynamic vs static (2)",
      "teach": "Static pluses last; dynamics must be cashed now.",
      "hint": "Cash the dynamic chance.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "Dynamic vs static",
      "about": "Dynamic vs static — Watson-style modern strategy.",
      "desc": "Static pluses last; dynamics must be cashed now. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 153,
      "book": "watson",
      "title": "Exchange sac modern (2)",
      "teach": "Modern exchange sacs buy squares, not just attack.",
      "hint": "Consider the positional exchange sac.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Exchange sac modern",
      "about": "Exchange sac modern — Watson-style modern strategy.",
      "desc": "Modern exchange sacs buy squares, not just attack. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 154,
      "book": "watson",
      "title": "Exchange sac decline (2)",
      "teach": "Not every exchange sac is sound — calculate returns.",
      "hint": "Decline or refute the sac.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Exchange sac decline",
      "about": "Exchange sac decline — Watson-style modern strategy.",
      "desc": "Not every exchange sac is sound — calculate returns. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 155,
      "book": "watson",
      "title": "Prophylaxis modern (2)",
      "teach": "Prevent their only idea, then improve.",
      "hint": "Play the prophylactic move.",
      "fen": "r1bqkb1r/pp1ppppp/2n2n2/2p5/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 4",
      "goal": "win",
      "theme": "Prophylaxis modern",
      "about": "Prophylaxis modern — Watson-style modern strategy.",
      "desc": "Prevent their only idea, then improve. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 156,
      "book": "watson",
      "title": "Overprotection update (2)",
      "teach": "Overprotection is rare now — activity usually trumps it.",
      "hint": "Choose activity over ritual overprotection.",
      "fen": "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Overprotection update",
      "about": "Overprotection update — Watson-style modern strategy.",
      "desc": "Overprotection is rare now — activity usually trumps it. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 157,
      "book": "watson",
      "title": "Blockade evolved (2)",
      "teach": "Blockade still matters — but sometimes transform instead.",
      "hint": "Blockade or transform wisely.",
      "fen": "rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 6",
      "goal": "win",
      "theme": "Blockade evolved",
      "about": "Blockade evolved — Watson-style modern strategy.",
      "desc": "Blockade still matters — but sometimes transform instead. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 158,
      "book": "watson",
      "title": "Two bishops modern (2)",
      "teach": "Open when ready; don't wait forever for the 'ideal' moment.",
      "hint": "Open for the bishops.",
      "fen": "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Two bishops modern",
      "about": "Two bishops modern — Watson-style modern strategy.",
      "desc": "Open when ready; don't wait forever for the 'ideal' moment. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 159,
      "book": "watson",
      "title": "Knight outposts (2)",
      "teach": "Outposts remain gold — create and occupy them.",
      "hint": "Claim the outpost.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Knight outposts",
      "about": "Knight outposts — Watson-style modern strategy.",
      "desc": "Outposts remain gold — create and occupy them. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 160,
      "book": "watson",
      "title": "Pawn chain myths (2)",
      "teach": "Attacking the base isn't automatic — calculate the timing.",
      "hint": "Time the chain attack.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "Pawn chain myths",
      "about": "Pawn chain myths — Watson-style modern strategy.",
      "desc": "Attacking the base isn't automatic — calculate the timing. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 161,
      "book": "watson",
      "title": "Restraint (2)",
      "teach": "Restrain first, attack second — modern Botvinnik echo.",
      "hint": "Restrain their breaks.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Restraint",
      "about": "Restraint — Watson-style modern strategy.",
      "desc": "Restrain first, attack second — modern Botvinnik echo. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 162,
      "book": "watson",
      "title": "Transformation (2)",
      "teach": "Convert one advantage into an easier one.",
      "hint": "Transform the plus.",
      "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      "goal": "win",
      "theme": "Transformation",
      "about": "Transformation — Watson-style modern strategy.",
      "desc": "Convert one advantage into an easier one. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 163,
      "book": "watson",
      "title": "Initiative over material (2)",
      "teach": "A lasting initiative can outweigh a pawn.",
      "hint": "Keep the initiative.",
      "fen": "rnbqk2r/pp2ppbp/5np1/2pp4/3P4/2P2NP1/PP2PP1P/RNBQKB1R w KQkq - 0 6",
      "goal": "win",
      "theme": "Initiative over material",
      "about": "Initiative over material — Watson-style modern strategy.",
      "desc": "A lasting initiative can outweigh a pawn. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 164,
      "book": "watson",
      "title": "Material over initiative (2)",
      "teach": "Sometimes just take the pawn and consolidate.",
      "hint": "Grab and consolidate.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Material over initiative",
      "about": "Material over initiative — Watson-style modern strategy.",
      "desc": "Sometimes just take the pawn and consolidate. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 165,
      "book": "watson",
      "title": "Space with purpose (2)",
      "teach": "Space needs plans; empty space evaporates.",
      "hint": "Use the space (or release correctly).",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Space with purpose",
      "about": "Space with purpose — Watson-style modern strategy.",
      "desc": "Space needs plans; empty space evaporates. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 166,
      "book": "watson",
      "title": "Freeing breaks (2)",
      "teach": "The freeing break is often the whole plan.",
      "hint": "Play/prepare the freeing break.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Freeing breaks",
      "about": "Freeing breaks — Watson-style modern strategy.",
      "desc": "The freeing break is often the whole plan. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 167,
      "book": "watson",
      "title": "Modern center (2)",
      "teach": "Centers can be controlled with pieces, not only pawns.",
      "hint": "Control the center dynamically.",
      "fen": "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Modern center",
      "about": "Modern center — Watson-style modern strategy.",
      "desc": "Centers can be controlled with pieces, not only pawns. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 168,
      "book": "watson",
      "title": "Hanging pawns modern (2)",
      "teach": "Hanging pawns are tools — advance or restrain with intent.",
      "hint": "Handle hangers modernly.",
      "fen": "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
      "goal": "win",
      "theme": "Hanging pawns modern",
      "about": "Hanging pawns modern — Watson-style modern strategy.",
      "desc": "Hanging pawns are tools — advance or restrain with intent. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 169,
      "book": "watson",
      "title": "IQP modern (2)",
      "teach": "IQP play is more concrete now — calculate the timing.",
      "hint": "Play the concrete IQP move.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "IQP modern",
      "about": "IQP modern — Watson-style modern strategy.",
      "desc": "IQP play is more concrete now — calculate the timing. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 170,
      "book": "watson",
      "title": "Opposite castling (2)",
      "teach": "Opposite castling: race, but don't forget central breaks.",
      "hint": "Race with a central eye.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Opposite castling",
      "about": "Opposite castling — Watson-style modern strategy.",
      "desc": "Opposite castling: race, but don't forget central breaks. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 171,
      "book": "watson",
      "title": "King safety priority (2)",
      "teach": "Unsafe king trumps pretty structure.",
      "hint": "Prioritize king safety.",
      "fen": "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "King safety priority",
      "about": "King safety priority — Watson-style modern strategy.",
      "desc": "Unsafe king trumps pretty structure. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 172,
      "book": "watson",
      "title": "Piece trades update (2)",
      "teach": "Trade your worst for their best — still true.",
      "hint": "Offer the right trade.",
      "fen": "r1bqk2r/pp1pppbp/2n2np1/2p5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5",
      "goal": "win",
      "theme": "Piece trades update",
      "about": "Piece trades update — Watson-style modern strategy.",
      "desc": "Trade your worst for their best — still true. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 173,
      "book": "watson",
      "title": "Bad bishop modern (2)",
      "teach": "Bad bishops can be useful defenders — evaluate case by case.",
      "hint": "Keep or free the bishop wisely.",
      "fen": "r2q1rk1/ppp1ppbp/2np1np1/8/2PPP1b1/2N2N2/PP2BPPP/R1BQK2R w KQ - 4 8",
      "goal": "win",
      "theme": "Bad bishop modern",
      "about": "Bad bishop modern — Watson-style modern strategy.",
      "desc": "Bad bishops can be useful defenders — evaluate case by case. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 174,
      "book": "watson",
      "title": "Good knight closed (2)",
      "teach": "Closed positions still love knights.",
      "hint": "Keep the knight vs open bishops.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Good knight closed",
      "about": "Good knight closed — Watson-style modern strategy.",
      "desc": "Closed positions still love knights. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 175,
      "book": "watson",
      "title": "Rook lifts (2)",
      "teach": "Rook lifts are modern attacking currency.",
      "hint": "Start the rook lift.",
      "fen": "r1bqk2r/pppp1ppp/2n1pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Rook lifts",
      "about": "Rook lifts — Watson-style modern strategy.",
      "desc": "Rook lifts are modern attacking currency. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 176,
      "book": "watson",
      "title": "Quiet improving move (2)",
      "teach": "Not every position needs a tactic — improve.",
      "hint": "Find the quiet improvement.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Quiet improving move",
      "about": "Quiet improving move — Watson-style modern strategy.",
      "desc": "Not every position needs a tactic — improve. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 177,
      "book": "watson",
      "title": "Practical conversion (2)",
      "teach": "Remove counterplay before pushing the win.",
      "hint": "Kill counterplay first.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/4R1K1 w - - 0 18",
      "goal": "win",
      "theme": "Practical conversion",
      "about": "Practical conversion — Watson-style modern strategy.",
      "desc": "Remove counterplay before pushing the win. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 178,
      "book": "watson",
      "title": "Psychological modern (2)",
      "teach": "Pose problems; don't play only 'best' if unclear.",
      "hint": "Pose a practical problem.",
      "fen": "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Psychological modern",
      "about": "Psychological modern — Watson-style modern strategy.",
      "desc": "Pose problems; don't play only 'best' if unclear. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 179,
      "book": "watson",
      "title": "Computer-age structures (2)",
      "teach": "Some 'ugly' moves are engine-approved — understand why.",
      "hint": "Play the ugly-but-strong idea.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Computer-age structures",
      "about": "Computer-age structures — Watson-style modern strategy.",
      "desc": "Some 'ugly' moves are engine-approved — understand why. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 180,
      "book": "watson",
      "title": "Nimzo heritage (2)",
      "teach": "Restraint and blockade live on — in new clothes.",
      "hint": "Apply updated Nimzo ideas.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Nimzo heritage",
      "about": "Nimzo heritage — Watson-style modern strategy.",
      "desc": "Restraint and blockade live on — in new clothes. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 181,
      "book": "watson",
      "title": "Classical exception (2)",
      "teach": "When the classical move fails, find the exception.",
      "hint": "Play the exceptional move.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Classical exception",
      "about": "Classical exception — Watson-style modern strategy.",
      "desc": "When the classical move fails, find the exception. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 182,
      "book": "watson",
      "title": "Positional sac (2)",
      "teach": "Sac for lasting soft squares, not hope.",
      "hint": "Positional sac only with compensation.",
      "fen": "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Positional sac",
      "about": "Positional sac — Watson-style modern strategy.",
      "desc": "Sac for lasting soft squares, not hope. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 183,
      "book": "watson",
      "title": "Color complex (2)",
      "teach": "Dominate a color complex after the right trade.",
      "hint": "Target the soft color.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Color complex",
      "about": "Color complex — Watson-style modern strategy.",
      "desc": "Dominate a color complex after the right trade. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 184,
      "book": "watson",
      "title": "Minority ideas (2)",
      "teach": "Minority attack logic appears beyond Carlsbad.",
      "hint": "Create the structural weakness.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Minority ideas",
      "about": "Minority ideas — Watson-style modern strategy.",
      "desc": "Minority attack logic appears beyond Carlsbad. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 185,
      "book": "watson",
      "title": "Majority use (2)",
      "teach": "Mobilize your majority before theirs runs.",
      "hint": "Mobilize the majority.",
      "fen": "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Majority use",
      "about": "Majority use — Watson-style modern strategy.",
      "desc": "Mobilize your majority before theirs runs. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 186,
      "book": "watson",
      "title": "Passed pawn modern (2)",
      "teach": "Passed pawns need support nets, not lonely runs.",
      "hint": "Support the passer.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Passed pawn modern",
      "about": "Passed pawn modern — Watson-style modern strategy.",
      "desc": "Passed pawns need support nets, not lonely runs. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 187,
      "book": "watson",
      "title": "Endgame transition (2)",
      "teach": "Modern players liquidate earlier — calculate first.",
      "hint": "Only liquidate into a plus.",
      "fen": "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Endgame transition",
      "about": "Endgame transition — Watson-style modern strategy.",
      "desc": "Modern players liquidate earlier — calculate first. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 188,
      "book": "watson",
      "title": "Prophylaxis vs attack (2)",
      "teach": "Sometimes the best attack starts with a defensive nudge.",
      "hint": "Nudge their plan aside.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 2 9",
      "goal": "win",
      "theme": "Prophylaxis vs attack",
      "about": "Prophylaxis vs attack — Watson-style modern strategy.",
      "desc": "Sometimes the best attack starts with a defensive nudge. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 189,
      "book": "watson",
      "title": "Flexible structures (2)",
      "teach": "Keep pawn options open until information arrives.",
      "hint": "Stay flexible with the structure.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Flexible structures",
      "about": "Flexible structures — Watson-style modern strategy.",
      "desc": "Keep pawn options open until information arrives. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 190,
      "book": "watson",
      "title": "Committing pawns (2)",
      "teach": "Commit pawns only when the piece setup is ready.",
      "hint": "Commit the pawn now.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Committing pawns",
      "about": "Committing pawns — Watson-style modern strategy.",
      "desc": "Commit pawns only when the piece setup is ready. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 191,
      "book": "watson",
      "title": "Outpost prep (2)",
      "teach": "Create the hole, then occupy.",
      "hint": "Prepare the outpost.",
      "fen": "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Outpost prep",
      "about": "Outpost prep — Watson-style modern strategy.",
      "desc": "Create the hole, then occupy. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 192,
      "book": "watson",
      "title": "Undermining (2)",
      "teach": "Undermine wedges with the right lever.",
      "hint": "Undermine.",
      "fen": "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Undermining",
      "about": "Undermining — Watson-style modern strategy.",
      "desc": "Undermine wedges with the right lever. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 193,
      "book": "watson",
      "title": "Overextension (2)",
      "teach": "Punish overextended pawns by fixing then attacking.",
      "hint": "Fix and attack the overextension.",
      "fen": "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14",
      "goal": "win",
      "theme": "Overextension",
      "about": "Overextension — Watson-style modern strategy.",
      "desc": "Punish overextended pawns by fixing then attacking. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 194,
      "book": "watson",
      "title": "Piece coordination (2)",
      "teach": "Coordination beats lone-wolf brilliance.",
      "hint": "Coordinate the army.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Piece coordination",
      "about": "Piece coordination — Watson-style modern strategy.",
      "desc": "Coordination beats lone-wolf brilliance. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 195,
      "book": "watson",
      "title": "Second weakness (2)",
      "teach": "One weakness is holdable — create a second.",
      "hint": "Open the second front.",
      "fen": "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Second weakness",
      "about": "Second weakness — Watson-style modern strategy.",
      "desc": "One weakness is holdable — create a second. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 196,
      "book": "watson",
      "title": "Modern defense (2)",
      "teach": "Active defense and counterbreaks beat pure passivity.",
      "hint": "Defend actively.",
      "fen": "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Modern defense",
      "about": "Modern defense — Watson-style modern strategy.",
      "desc": "Active defense and counterbreaks beat pure passivity. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 197,
      "book": "watson",
      "title": "Initiative retention (2)",
      "teach": "After a gain, keep asking questions.",
      "hint": "Maintain the initiative.",
      "fen": "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/2N2NP1/PP2PP1P/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Initiative retention",
      "about": "Initiative retention — Watson-style modern strategy.",
      "desc": "After a gain, keep asking questions. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 198,
      "book": "watson",
      "title": "Evaluation skill (2)",
      "teach": "Update your eval after every structural change.",
      "hint": "Play to the new evaluation.",
      "fen": "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Evaluation skill",
      "about": "Evaluation skill — Watson-style modern strategy.",
      "desc": "Update your eval after every structural change. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 199,
      "book": "watson",
      "title": "Plan hierarchy (2)",
      "teach": "Main plan, backup plan — switch without ego.",
      "hint": "Switch to the backup plan.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Plan hierarchy",
      "about": "Plan hierarchy — Watson-style modern strategy.",
      "desc": "Main plan, backup plan — switch without ego. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 200,
      "book": "watson",
      "title": "Watson review (2)",
      "teach": "Test the classical rule; play the modern truth.",
      "hint": "Play the modern choice.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Watson review",
      "about": "Watson review — Watson-style modern strategy.",
      "desc": "Test the classical rule; play the modern truth. Update classical dogma with concrete modern play. (Secrets of Modern Chess Strategy–style · ≈1800+)",
      "pitfalls": [
        "Modern strategy often prefers dynamics over static 'rules'.",
        "Ask whether the classical prohibition still applies here.",
        "Transform the advantage — don't cling to one obsolete plan."
      ]
    },
    {
      "n": 201,
      "book": "aagaard",
      "title": "Candidate moves (1)",
      "teach": "List candidates before calculating any line deeply.",
      "hint": "Compare candidates; pick one.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Candidate moves",
      "about": "Candidate moves — Aagaard-style calculation drill.",
      "desc": "List candidates before calculating any line deeply. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 202,
      "book": "aagaard",
      "title": "Forcing first (1)",
      "teach": "Checks, captures, threats — force the tree down.",
      "hint": "Start with the forcing move.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Forcing first",
      "about": "Forcing first — Aagaard-style calculation drill.",
      "desc": "Checks, captures, threats — force the tree down. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 203,
      "book": "aagaard",
      "title": "Quiet after tactics (1)",
      "teach": "After the fireworks, the quiet consolidating move wins.",
      "hint": "Find the quiet follow-up.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Quiet after tactics",
      "about": "Quiet after tactics — Aagaard-style calculation drill.",
      "desc": "After the fireworks, the quiet consolidating move wins. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 204,
      "book": "aagaard",
      "title": "Between-move vision (1)",
      "teach": "See the position after the sequence — not only the first check.",
      "hint": "Visualize the resulting position.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Between-move vision",
      "about": "Between-move vision — Aagaard-style calculation drill.",
      "desc": "See the position after the sequence — not only the first check. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 205,
      "book": "aagaard",
      "title": "Elimination method (1)",
      "teach": "Refute all but one candidate.",
      "hint": "Eliminate the inferior tries.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Elimination method",
      "about": "Elimination method — Aagaard-style calculation drill.",
      "desc": "Refute all but one candidate. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 206,
      "book": "aagaard",
      "title": "Comparison method (1)",
      "teach": "Same idea, different move order — compare.",
      "hint": "Pick the better move order.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Comparison method",
      "about": "Comparison method — Aagaard-style calculation drill.",
      "desc": "Same idea, different move order — compare. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 207,
      "book": "aagaard",
      "title": "Depth control (1)",
      "teach": "Calculate as deep as the position demands — no less.",
      "hint": "Go one ply deeper.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Depth control",
      "about": "Depth control — Aagaard-style calculation drill.",
      "desc": "Calculate as deep as the position demands — no less. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 208,
      "book": "aagaard",
      "title": "Stop condition (1)",
      "teach": "Know when a line is enough — then choose.",
      "hint": "Stop and choose.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Stop condition",
      "about": "Stop condition — Aagaard-style calculation drill.",
      "desc": "Know when a line is enough — then choose. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 209,
      "book": "aagaard",
      "title": "Tactical seed (1)",
      "teach": "Spot the motif, then calculate cleanly.",
      "hint": "Execute the motif.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Tactical seed",
      "about": "Tactical seed — Aagaard-style calculation drill.",
      "desc": "Spot the motif, then calculate cleanly. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 210,
      "book": "aagaard",
      "title": "Deflection calc (1)",
      "teach": "Deflect the key defender — check all replies.",
      "hint": "Deflect and calculate.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Deflection calc",
      "about": "Deflection calc — Aagaard-style calculation drill.",
      "desc": "Deflect the key defender — check all replies. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 211,
      "book": "aagaard",
      "title": "Decoy calc (1)",
      "teach": "Decoy onto a fatal square.",
      "hint": "Decoy the piece.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Decoy calc",
      "about": "Decoy calc — Aagaard-style calculation drill.",
      "desc": "Decoy onto a fatal square. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 212,
      "book": "aagaard",
      "title": "Clearance calc (1)",
      "teach": "Clear the line/square with tempo.",
      "hint": "Clear with tempo.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Clearance calc",
      "about": "Clearance calc — Aagaard-style calculation drill.",
      "desc": "Clear the line/square with tempo. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 213,
      "book": "aagaard",
      "title": "Interference calc (1)",
      "teach": "Interfere with a defensive connection.",
      "hint": "Interfere.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Interference calc",
      "about": "Interference calc — Aagaard-style calculation drill.",
      "desc": "Interfere with a defensive connection. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 214,
      "book": "aagaard",
      "title": "Overloaded defender (1)",
      "teach": "One piece, two jobs — overload it.",
      "hint": "Overload the defender.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Overloaded defender",
      "about": "Overloaded defender — Aagaard-style calculation drill.",
      "desc": "One piece, two jobs — overload it. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 215,
      "book": "aagaard",
      "title": "Pin calculation (1)",
      "teach": "Absolute vs relative pins change the tree.",
      "hint": "Use/break the pin correctly.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Pin calculation",
      "about": "Pin calculation — Aagaard-style calculation drill.",
      "desc": "Absolute vs relative pins change the tree. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 216,
      "book": "aagaard",
      "title": "Skewer lines (1)",
      "teach": "Align valuables on a line.",
      "hint": "Set the skewer.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Skewer lines",
      "about": "Skewer lines — Aagaard-style calculation drill.",
      "desc": "Align valuables on a line. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 217,
      "book": "aagaard",
      "title": "Fork net (1)",
      "teach": "Knight forks need flight-square control.",
      "hint": "Net the fork.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Fork net",
      "about": "Fork net — Aagaard-style calculation drill.",
      "desc": "Knight forks need flight-square control. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 218,
      "book": "aagaard",
      "title": "Discovered threats (1)",
      "teach": "Discoveries multiply forcing options.",
      "hint": "Play the discovery.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Discovered threats",
      "about": "Discovered threats — Aagaard-style calculation drill.",
      "desc": "Discoveries multiply forcing options. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 219,
      "book": "aagaard",
      "title": "Zwischenzug (1)",
      "teach": "Insert the in-between move before recapturing.",
      "hint": "Insert the zwischenzug.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Zwischenzug",
      "about": "Zwischenzug — Aagaard-style calculation drill.",
      "desc": "Insert the in-between move before recapturing. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 220,
      "book": "aagaard",
      "title": "Desperado (1)",
      "teach": "Desperate piece sells itself for max value.",
      "hint": "Find the desperado.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Desperado",
      "about": "Desperado — Aagaard-style calculation drill.",
      "desc": "Desperate piece sells itself for max value. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 221,
      "book": "aagaard",
      "title": "Attraction (1)",
      "teach": "Attract the king/piece into a mating net.",
      "hint": "Attract into the net.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Attraction",
      "about": "Attraction — Aagaard-style calculation drill.",
      "desc": "Attract the king/piece into a mating net. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 222,
      "book": "aagaard",
      "title": "Windmill sense (1)",
      "teach": "Repeating discoveries — calculate the exit.",
      "hint": "Ride/exit the windmill.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Windmill sense",
      "about": "Windmill sense — Aagaard-style calculation drill.",
      "desc": "Repeating discoveries — calculate the exit. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 223,
      "book": "aagaard",
      "title": "Back-rank calc (1)",
      "teach": "Back-rank motifs need luft calculation.",
      "hint": "Use or avoid the back rank.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Back-rank calc",
      "about": "Back-rank calc — Aagaard-style calculation drill.",
      "desc": "Back-rank motifs need luft calculation. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 224,
      "book": "aagaard",
      "title": "Mating net build (1)",
      "teach": "Build the net before the final check.",
      "hint": "Build the mating net.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Mating net build",
      "about": "Mating net build — Aagaard-style calculation drill.",
      "desc": "Build the net before the final check. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 225,
      "book": "aagaard",
      "title": "Perpetual hunt (1)",
      "teach": "When losing, calculate perpetual paths.",
      "hint": "Hunt the perpetual.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Perpetual hunt",
      "about": "Perpetual hunt — Aagaard-style calculation drill.",
      "desc": "When losing, calculate perpetual paths. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 226,
      "book": "aagaard",
      "title": "Sacrifice precision (1)",
      "teach": "Sac only with a calculated continuum.",
      "hint": "Sac with a continuum.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Sacrifice precision",
      "about": "Sacrifice precision — Aagaard-style calculation drill.",
      "desc": "Sac only with a calculated continuum. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 227,
      "book": "aagaard",
      "title": "Refutation alert (1)",
      "teach": "Your idea fails to one resource — find it (as them).",
      "hint": "Find the refutation resource.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Refutation alert",
      "about": "Refutation alert — Aagaard-style calculation drill.",
      "desc": "Your idea fails to one resource — find it (as them). Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 228,
      "book": "aagaard",
      "title": "Prophylactic calc (1)",
      "teach": "Calculate their only counter before committing.",
      "hint": "Include their counter in the tree.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Prophylactic calc",
      "about": "Prophylactic calc — Aagaard-style calculation drill.",
      "desc": "Calculate their only counter before committing. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 229,
      "book": "aagaard",
      "title": "Endgame calc (1)",
      "teach": "Endgame calculation is forcing too — tempi count.",
      "hint": "Calculate the tempi.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Endgame calc",
      "about": "Endgame calc — Aagaard-style calculation drill.",
      "desc": "Endgame calculation is forcing too — tempi count. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 230,
      "book": "aagaard",
      "title": "Pawn race calc (1)",
      "teach": "Count races without moving the pieces.",
      "hint": "Win the race count.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Pawn race calc",
      "about": "Pawn race calc — Aagaard-style calculation drill.",
      "desc": "Count races without moving the pieces. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 231,
      "book": "aagaard",
      "title": "King walk calc (1)",
      "teach": "King marches need safety checks each ply.",
      "hint": "Walk the king safely.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "King walk calc",
      "about": "King walk calc — Aagaard-style calculation drill.",
      "desc": "King marches need safety checks each ply. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 232,
      "book": "aagaard",
      "title": "Quiet killer (1)",
      "teach": "The non-check that ends resistance.",
      "hint": "Play the quiet killer.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Quiet killer",
      "about": "Quiet killer — Aagaard-style calculation drill.",
      "desc": "The non-check that ends resistance. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 233,
      "book": "aagaard",
      "title": "Double attack (1)",
      "teach": "Two threats, one move.",
      "hint": "Create the double attack.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Double attack",
      "about": "Double attack — Aagaard-style calculation drill.",
      "desc": "Two threats, one move. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 234,
      "book": "aagaard",
      "title": "Trap setting (1)",
      "teach": "Calculate the bait and the escape.",
      "hint": "Set a sound trap.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Trap setting",
      "about": "Trap setting — Aagaard-style calculation drill.",
      "desc": "Calculate the bait and the escape. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 235,
      "book": "aagaard",
      "title": "Trap avoiding (1)",
      "teach": "See the bait — decline.",
      "hint": "Avoid the trap.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Trap avoiding",
      "about": "Trap avoiding — Aagaard-style calculation drill.",
      "desc": "See the bait — decline. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 236,
      "book": "aagaard",
      "title": "Calculation stamina (1)",
      "teach": "Long lines: write the spine in your head.",
      "hint": "Hold the long line.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Calculation stamina",
      "about": "Calculation stamina — Aagaard-style calculation drill.",
      "desc": "Long lines: write the spine in your head. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 237,
      "book": "aagaard",
      "title": "Reset visualization (1)",
      "teach": "If lost in the tree, reset to the root position.",
      "hint": "Reset and recalc.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Reset visualization",
      "about": "Reset visualization — Aagaard-style calculation drill.",
      "desc": "If lost in the tree, reset to the root position. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 238,
      "book": "aagaard",
      "title": "Priority of force (1)",
      "teach": "Force before fancy.",
      "hint": "Prefer the forcing line.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Priority of force",
      "about": "Priority of force — Aagaard-style calculation drill.",
      "desc": "Force before fancy. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 239,
      "book": "aagaard",
      "title": "Safety check (1)",
      "teach": "Before the brilliancy, check you aren't mated.",
      "hint": "Safety-check first.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Safety check",
      "about": "Safety check — Aagaard-style calculation drill.",
      "desc": "Before the brilliancy, check you aren't mated. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 240,
      "book": "aagaard",
      "title": "Material count mid-line (1)",
      "teach": "Track material after each capture in the tree.",
      "hint": "Keep the material tally.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Material count mid-line",
      "about": "Material count mid-line — Aagaard-style calculation drill.",
      "desc": "Track material after each capture in the tree. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 241,
      "book": "aagaard",
      "title": "Square color awareness (1)",
      "teach": "Bishop nets care about colors — track them.",
      "hint": "Track the color complex.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Square color awareness",
      "about": "Square color awareness — Aagaard-style calculation drill.",
      "desc": "Bishop nets care about colors — track them. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 242,
      "book": "aagaard",
      "title": "Flight squares (1)",
      "teach": "Cover flights before the final blow.",
      "hint": "Cover the flight squares.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Flight squares",
      "about": "Flight squares — Aagaard-style calculation drill.",
      "desc": "Cover flights before the final blow. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 243,
      "book": "aagaard",
      "title": "Intermezzo defense (1)",
      "teach": "Defensive zwischenzugs break attacker's tree.",
      "hint": "Find the defensive intermezzo.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Intermezzo defense",
      "about": "Intermezzo defense — Aagaard-style calculation drill.",
      "desc": "Defensive zwischenzugs break attacker's tree. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 244,
      "book": "aagaard",
      "title": "Only-move sense (1)",
      "teach": "Some positions have one move — find it.",
      "hint": "Find the only move.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Only-move sense",
      "about": "Only-move sense — Aagaard-style calculation drill.",
      "desc": "Some positions have one move — find it. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 245,
      "book": "aagaard",
      "title": "Engine-free method (1)",
      "teach": "Human method: candidates → force → compare.",
      "hint": "Apply the method.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Engine-free method",
      "about": "Engine-free method — Aagaard-style calculation drill.",
      "desc": "Human method: candidates → force → compare. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 246,
      "book": "aagaard",
      "title": "Attack ratio (1)",
      "teach": "Count attackers vs defenders honestly.",
      "hint": "Only strike if the ratio works.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Attack ratio",
      "about": "Attack ratio — Aagaard-style calculation drill.",
      "desc": "Count attackers vs defenders honestly. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 247,
      "book": "aagaard",
      "title": "Defense ratio (1)",
      "teach": "Add a defender or exchange an attacker.",
      "hint": "Fix the defensive ratio.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Defense ratio",
      "about": "Defense ratio — Aagaard-style calculation drill.",
      "desc": "Add a defender or exchange an attacker. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 248,
      "book": "aagaard",
      "title": "Line switch (1)",
      "teach": "If line A fails, switch — don't force it.",
      "hint": "Switch calculation lines.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Line switch",
      "about": "Line switch — Aagaard-style calculation drill.",
      "desc": "If line A fails, switch — don't force it. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 249,
      "book": "aagaard",
      "title": "Final check habit (1)",
      "teach": "Blunder-check the intended move.",
      "hint": "Blunder-check, then play.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Final check habit",
      "about": "Final check habit — Aagaard-style calculation drill.",
      "desc": "Blunder-check the intended move. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 250,
      "book": "aagaard",
      "title": "Aagaard review (1)",
      "teach": "Candidates, forcing moves, quiet conversion.",
      "hint": "Calculate like a GM prep session.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Aagaard review",
      "about": "Aagaard review — Aagaard-style calculation drill.",
      "desc": "Candidates, forcing moves, quiet conversion. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 251,
      "book": "aagaard",
      "title": "Candidate moves (2)",
      "teach": "List candidates before calculating any line deeply.",
      "hint": "Compare candidates; pick one.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Candidate moves",
      "about": "Candidate moves — Aagaard-style calculation drill.",
      "desc": "List candidates before calculating any line deeply. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 252,
      "book": "aagaard",
      "title": "Forcing first (2)",
      "teach": "Checks, captures, threats — force the tree down.",
      "hint": "Start with the forcing move.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Forcing first",
      "about": "Forcing first — Aagaard-style calculation drill.",
      "desc": "Checks, captures, threats — force the tree down. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 253,
      "book": "aagaard",
      "title": "Quiet after tactics (2)",
      "teach": "After the fireworks, the quiet consolidating move wins.",
      "hint": "Find the quiet follow-up.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Quiet after tactics",
      "about": "Quiet after tactics — Aagaard-style calculation drill.",
      "desc": "After the fireworks, the quiet consolidating move wins. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 254,
      "book": "aagaard",
      "title": "Between-move vision (2)",
      "teach": "See the position after the sequence — not only the first check.",
      "hint": "Visualize the resulting position.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Between-move vision",
      "about": "Between-move vision — Aagaard-style calculation drill.",
      "desc": "See the position after the sequence — not only the first check. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 255,
      "book": "aagaard",
      "title": "Elimination method (2)",
      "teach": "Refute all but one candidate.",
      "hint": "Eliminate the inferior tries.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Elimination method",
      "about": "Elimination method — Aagaard-style calculation drill.",
      "desc": "Refute all but one candidate. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 256,
      "book": "aagaard",
      "title": "Comparison method (2)",
      "teach": "Same idea, different move order — compare.",
      "hint": "Pick the better move order.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Comparison method",
      "about": "Comparison method — Aagaard-style calculation drill.",
      "desc": "Same idea, different move order — compare. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 257,
      "book": "aagaard",
      "title": "Depth control (2)",
      "teach": "Calculate as deep as the position demands — no less.",
      "hint": "Go one ply deeper.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Depth control",
      "about": "Depth control — Aagaard-style calculation drill.",
      "desc": "Calculate as deep as the position demands — no less. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 258,
      "book": "aagaard",
      "title": "Stop condition (2)",
      "teach": "Know when a line is enough — then choose.",
      "hint": "Stop and choose.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Stop condition",
      "about": "Stop condition — Aagaard-style calculation drill.",
      "desc": "Know when a line is enough — then choose. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 259,
      "book": "aagaard",
      "title": "Tactical seed (2)",
      "teach": "Spot the motif, then calculate cleanly.",
      "hint": "Execute the motif.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Tactical seed",
      "about": "Tactical seed — Aagaard-style calculation drill.",
      "desc": "Spot the motif, then calculate cleanly. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 260,
      "book": "aagaard",
      "title": "Deflection calc (2)",
      "teach": "Deflect the key defender — check all replies.",
      "hint": "Deflect and calculate.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Deflection calc",
      "about": "Deflection calc — Aagaard-style calculation drill.",
      "desc": "Deflect the key defender — check all replies. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 261,
      "book": "aagaard",
      "title": "Decoy calc (2)",
      "teach": "Decoy onto a fatal square.",
      "hint": "Decoy the piece.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Decoy calc",
      "about": "Decoy calc — Aagaard-style calculation drill.",
      "desc": "Decoy onto a fatal square. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 262,
      "book": "aagaard",
      "title": "Clearance calc (2)",
      "teach": "Clear the line/square with tempo.",
      "hint": "Clear with tempo.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Clearance calc",
      "about": "Clearance calc — Aagaard-style calculation drill.",
      "desc": "Clear the line/square with tempo. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 263,
      "book": "aagaard",
      "title": "Interference calc (2)",
      "teach": "Interfere with a defensive connection.",
      "hint": "Interfere.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Interference calc",
      "about": "Interference calc — Aagaard-style calculation drill.",
      "desc": "Interfere with a defensive connection. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 264,
      "book": "aagaard",
      "title": "Overloaded defender (2)",
      "teach": "One piece, two jobs — overload it.",
      "hint": "Overload the defender.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Overloaded defender",
      "about": "Overloaded defender — Aagaard-style calculation drill.",
      "desc": "One piece, two jobs — overload it. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 265,
      "book": "aagaard",
      "title": "Pin calculation (2)",
      "teach": "Absolute vs relative pins change the tree.",
      "hint": "Use/break the pin correctly.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Pin calculation",
      "about": "Pin calculation — Aagaard-style calculation drill.",
      "desc": "Absolute vs relative pins change the tree. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 266,
      "book": "aagaard",
      "title": "Skewer lines (2)",
      "teach": "Align valuables on a line.",
      "hint": "Set the skewer.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Skewer lines",
      "about": "Skewer lines — Aagaard-style calculation drill.",
      "desc": "Align valuables on a line. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 267,
      "book": "aagaard",
      "title": "Fork net (2)",
      "teach": "Knight forks need flight-square control.",
      "hint": "Net the fork.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Fork net",
      "about": "Fork net — Aagaard-style calculation drill.",
      "desc": "Knight forks need flight-square control. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 268,
      "book": "aagaard",
      "title": "Discovered threats (2)",
      "teach": "Discoveries multiply forcing options.",
      "hint": "Play the discovery.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Discovered threats",
      "about": "Discovered threats — Aagaard-style calculation drill.",
      "desc": "Discoveries multiply forcing options. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 269,
      "book": "aagaard",
      "title": "Zwischenzug (2)",
      "teach": "Insert the in-between move before recapturing.",
      "hint": "Insert the zwischenzug.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Zwischenzug",
      "about": "Zwischenzug — Aagaard-style calculation drill.",
      "desc": "Insert the in-between move before recapturing. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 270,
      "book": "aagaard",
      "title": "Desperado (2)",
      "teach": "Desperate piece sells itself for max value.",
      "hint": "Find the desperado.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Desperado",
      "about": "Desperado — Aagaard-style calculation drill.",
      "desc": "Desperate piece sells itself for max value. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 271,
      "book": "aagaard",
      "title": "Attraction (2)",
      "teach": "Attract the king/piece into a mating net.",
      "hint": "Attract into the net.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Attraction",
      "about": "Attraction — Aagaard-style calculation drill.",
      "desc": "Attract the king/piece into a mating net. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 272,
      "book": "aagaard",
      "title": "Windmill sense (2)",
      "teach": "Repeating discoveries — calculate the exit.",
      "hint": "Ride/exit the windmill.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Windmill sense",
      "about": "Windmill sense — Aagaard-style calculation drill.",
      "desc": "Repeating discoveries — calculate the exit. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 273,
      "book": "aagaard",
      "title": "Back-rank calc (2)",
      "teach": "Back-rank motifs need luft calculation.",
      "hint": "Use or avoid the back rank.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Back-rank calc",
      "about": "Back-rank calc — Aagaard-style calculation drill.",
      "desc": "Back-rank motifs need luft calculation. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 274,
      "book": "aagaard",
      "title": "Mating net build (2)",
      "teach": "Build the net before the final check.",
      "hint": "Build the mating net.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Mating net build",
      "about": "Mating net build — Aagaard-style calculation drill.",
      "desc": "Build the net before the final check. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 275,
      "book": "aagaard",
      "title": "Perpetual hunt (2)",
      "teach": "When losing, calculate perpetual paths.",
      "hint": "Hunt the perpetual.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Perpetual hunt",
      "about": "Perpetual hunt — Aagaard-style calculation drill.",
      "desc": "When losing, calculate perpetual paths. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 276,
      "book": "aagaard",
      "title": "Sacrifice precision (2)",
      "teach": "Sac only with a calculated continuum.",
      "hint": "Sac with a continuum.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Sacrifice precision",
      "about": "Sacrifice precision — Aagaard-style calculation drill.",
      "desc": "Sac only with a calculated continuum. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 277,
      "book": "aagaard",
      "title": "Refutation alert (2)",
      "teach": "Your idea fails to one resource — find it (as them).",
      "hint": "Find the refutation resource.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Refutation alert",
      "about": "Refutation alert — Aagaard-style calculation drill.",
      "desc": "Your idea fails to one resource — find it (as them). Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 278,
      "book": "aagaard",
      "title": "Prophylactic calc (2)",
      "teach": "Calculate their only counter before committing.",
      "hint": "Include their counter in the tree.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Prophylactic calc",
      "about": "Prophylactic calc — Aagaard-style calculation drill.",
      "desc": "Calculate their only counter before committing. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 279,
      "book": "aagaard",
      "title": "Endgame calc (2)",
      "teach": "Endgame calculation is forcing too — tempi count.",
      "hint": "Calculate the tempi.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Endgame calc",
      "about": "Endgame calc — Aagaard-style calculation drill.",
      "desc": "Endgame calculation is forcing too — tempi count. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 280,
      "book": "aagaard",
      "title": "Pawn race calc (2)",
      "teach": "Count races without moving the pieces.",
      "hint": "Win the race count.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Pawn race calc",
      "about": "Pawn race calc — Aagaard-style calculation drill.",
      "desc": "Count races without moving the pieces. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 281,
      "book": "aagaard",
      "title": "King walk calc (2)",
      "teach": "King marches need safety checks each ply.",
      "hint": "Walk the king safely.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "King walk calc",
      "about": "King walk calc — Aagaard-style calculation drill.",
      "desc": "King marches need safety checks each ply. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 282,
      "book": "aagaard",
      "title": "Quiet killer (2)",
      "teach": "The non-check that ends resistance.",
      "hint": "Play the quiet killer.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Quiet killer",
      "about": "Quiet killer — Aagaard-style calculation drill.",
      "desc": "The non-check that ends resistance. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 283,
      "book": "aagaard",
      "title": "Double attack (2)",
      "teach": "Two threats, one move.",
      "hint": "Create the double attack.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Double attack",
      "about": "Double attack — Aagaard-style calculation drill.",
      "desc": "Two threats, one move. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 284,
      "book": "aagaard",
      "title": "Trap setting (2)",
      "teach": "Calculate the bait and the escape.",
      "hint": "Set a sound trap.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Trap setting",
      "about": "Trap setting — Aagaard-style calculation drill.",
      "desc": "Calculate the bait and the escape. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 285,
      "book": "aagaard",
      "title": "Trap avoiding (2)",
      "teach": "See the bait — decline.",
      "hint": "Avoid the trap.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Trap avoiding",
      "about": "Trap avoiding — Aagaard-style calculation drill.",
      "desc": "See the bait — decline. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 286,
      "book": "aagaard",
      "title": "Calculation stamina (2)",
      "teach": "Long lines: write the spine in your head.",
      "hint": "Hold the long line.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Calculation stamina",
      "about": "Calculation stamina — Aagaard-style calculation drill.",
      "desc": "Long lines: write the spine in your head. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 287,
      "book": "aagaard",
      "title": "Reset visualization (2)",
      "teach": "If lost in the tree, reset to the root position.",
      "hint": "Reset and recalc.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Reset visualization",
      "about": "Reset visualization — Aagaard-style calculation drill.",
      "desc": "If lost in the tree, reset to the root position. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 288,
      "book": "aagaard",
      "title": "Priority of force (2)",
      "teach": "Force before fancy.",
      "hint": "Prefer the forcing line.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Priority of force",
      "about": "Priority of force — Aagaard-style calculation drill.",
      "desc": "Force before fancy. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 289,
      "book": "aagaard",
      "title": "Safety check (2)",
      "teach": "Before the brilliancy, check you aren't mated.",
      "hint": "Safety-check first.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Safety check",
      "about": "Safety check — Aagaard-style calculation drill.",
      "desc": "Before the brilliancy, check you aren't mated. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 290,
      "book": "aagaard",
      "title": "Material count mid-line (2)",
      "teach": "Track material after each capture in the tree.",
      "hint": "Keep the material tally.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Material count mid-line",
      "about": "Material count mid-line — Aagaard-style calculation drill.",
      "desc": "Track material after each capture in the tree. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 291,
      "book": "aagaard",
      "title": "Square color awareness (2)",
      "teach": "Bishop nets care about colors — track them.",
      "hint": "Track the color complex.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Square color awareness",
      "about": "Square color awareness — Aagaard-style calculation drill.",
      "desc": "Bishop nets care about colors — track them. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 292,
      "book": "aagaard",
      "title": "Flight squares (2)",
      "teach": "Cover flights before the final blow.",
      "hint": "Cover the flight squares.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Flight squares",
      "about": "Flight squares — Aagaard-style calculation drill.",
      "desc": "Cover flights before the final blow. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 293,
      "book": "aagaard",
      "title": "Intermezzo defense (2)",
      "teach": "Defensive zwischenzugs break attacker's tree.",
      "hint": "Find the defensive intermezzo.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Intermezzo defense",
      "about": "Intermezzo defense — Aagaard-style calculation drill.",
      "desc": "Defensive zwischenzugs break attacker's tree. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 294,
      "book": "aagaard",
      "title": "Only-move sense (2)",
      "teach": "Some positions have one move — find it.",
      "hint": "Find the only move.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Only-move sense",
      "about": "Only-move sense — Aagaard-style calculation drill.",
      "desc": "Some positions have one move — find it. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 295,
      "book": "aagaard",
      "title": "Engine-free method (2)",
      "teach": "Human method: candidates → force → compare.",
      "hint": "Apply the method.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Engine-free method",
      "about": "Engine-free method — Aagaard-style calculation drill.",
      "desc": "Human method: candidates → force → compare. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 296,
      "book": "aagaard",
      "title": "Attack ratio (2)",
      "teach": "Count attackers vs defenders honestly.",
      "hint": "Only strike if the ratio works.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Attack ratio",
      "about": "Attack ratio — Aagaard-style calculation drill.",
      "desc": "Count attackers vs defenders honestly. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 297,
      "book": "aagaard",
      "title": "Defense ratio (2)",
      "teach": "Add a defender or exchange an attacker.",
      "hint": "Fix the defensive ratio.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Defense ratio",
      "about": "Defense ratio — Aagaard-style calculation drill.",
      "desc": "Add a defender or exchange an attacker. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 298,
      "book": "aagaard",
      "title": "Line switch (2)",
      "teach": "If line A fails, switch — don't force it.",
      "hint": "Switch calculation lines.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Line switch",
      "about": "Line switch — Aagaard-style calculation drill.",
      "desc": "If line A fails, switch — don't force it. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 299,
      "book": "aagaard",
      "title": "Final check habit (2)",
      "teach": "Blunder-check the intended move.",
      "hint": "Blunder-check, then play.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Final check habit",
      "about": "Final check habit — Aagaard-style calculation drill.",
      "desc": "Blunder-check the intended move. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    },
    {
      "n": 300,
      "book": "aagaard",
      "title": "Aagaard review (2)",
      "teach": "Candidates, forcing moves, quiet conversion.",
      "hint": "Calculate like a GM prep session.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Aagaard review",
      "about": "Aagaard review — Aagaard-style calculation drill.",
      "desc": "Candidates, forcing moves, quiet conversion. Train calculation method, not hope. (Grandmaster Preparation: Calculation–style · ≈1800–2300)",
      "pitfalls": [
        "Calculate forcing moves first: checks, captures, threats.",
        "Compare candidate moves — don't stop at the first idea.",
        "Visualize quietly after the fireworks; one calm move wins many lines."
      ]
    }
  ];


  const BOOK_LABEL = {
    structures: "Structures \u00b7 1700-2200",
    watson: "Watson \u00b7 1800+",
    aagaard: "Aagaard \u00b7 1800-2300",
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
    if (!["all", "structures", "watson", "aagaard"].includes(next)) return;
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
      infoKickerEl.textContent = `Lesson ${puzzle.n}/${LESSONS.length} · ${bookLabel(puzzle.book)}`;
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
    if (bookFilter === "all") return `Lesson ${l.n}/${LESSONS.length} · ${bookLabel(l.book)}`;
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
    const nxt = Math.min(LESSONS.length, (puzzle ? puzzle.n : lessonN) + 1);
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
