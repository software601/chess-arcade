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

  const ENGINE_JS = "/chess004/stockfish-19-lite-single.js";
  const ENGINE_WASM = "/chess004/stockfish-19-lite-single.wasm";
  const GLYPH = {
    wk: "♔", wq: "♕", wr: "♖", wb: "♗", wn: "♘", wp: "♙",
    bk: "♚", bq: "♛", br: "♜", bb: "♝", bn: "♞", bp: "♟",
  };

  /** 200 lessons: Amateur's Mind-style thinking (100) + Dvoretsky-style endgames (100). Original drills. */
  const LESSONS = [
    {
      "n": 1,
      "book": "amateur",
      "title": "Don't Grab Poison",
      "teach": "The 'free' pawn walks into a fork.",
      "hint": "Refuse the bait — improve instead.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Hope chess",
      "about": "Hope chess — Silman-style thinking drill.",
      "desc": "The 'free' pawn walks into a fork. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 2,
      "book": "amateur",
      "title": "Trade Into Clarity",
      "teach": "Simplify when ahead — remove their counterplay.",
      "hint": "Offer a clean trade.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Material",
      "about": "Material — Silman-style thinking drill.",
      "desc": "Simplify when ahead — remove their counterplay. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 3,
      "book": "amateur",
      "title": "Keep the Attackers",
      "teach": "Don't trade your active pieces for passive ones.",
      "hint": "Avoid the equalizing trade.",
      "fen": "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Imbalance",
      "about": "Imbalance — Silman-style thinking drill.",
      "desc": "Don't trade your active pieces for passive ones. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 4,
      "book": "amateur",
      "title": "Bishop Pair Keep",
      "teach": "The two bishops need open lines — don't give them up lightly.",
      "hint": "Keep the bishop pair.",
      "fen": "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Bishop pair",
      "about": "Bishop pair — Silman-style thinking drill.",
      "desc": "The two bishops need open lines — don't give them up lightly. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 5,
      "book": "amateur",
      "title": "Knight Outpost Claim",
      "teach": "Plant a knight on a weak square the pawns can't chase.",
      "hint": "Occupy the outpost.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "Outpost",
      "about": "Outpost — Silman-style thinking drill.",
      "desc": "Plant a knight on a weak square the pawns can't chase. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 6,
      "book": "amateur",
      "title": "Fix the Backward Pawn",
      "teach": "Don't create a backward pawn on an open file for free.",
      "hint": "Avoid the weakening push.",
      "fen": "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Pawn structure",
      "about": "Pawn structure — Silman-style thinking drill.",
      "desc": "Don't create a backward pawn on an open file for free. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 7,
      "book": "amateur",
      "title": "Break the Center",
      "teach": "Challenge a broad pawn center before it cramps you.",
      "hint": "Strike with the thematic break.",
      "fen": "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Center",
      "about": "Center — Silman-style thinking drill.",
      "desc": "Challenge a broad pawn center before it cramps you. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 8,
      "book": "amateur",
      "title": "Don't Push Random",
      "teach": "Every pawn move creates weaknesses — have a reason.",
      "hint": "Improve a piece instead of pushing.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 1 5",
      "goal": "win",
      "theme": "Thinking",
      "about": "Thinking — Silman-style thinking drill.",
      "desc": "Every pawn move creates weaknesses — have a reason. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 9,
      "book": "amateur",
      "title": "Isolate or Not",
      "teach": "IQP: piece activity justifies the structural scar.",
      "hint": "Activate before the structure bites.",
      "fen": "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "IQP",
      "about": "IQP — Silman-style thinking drill.",
      "desc": "IQP: piece activity justifies the structural scar. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 10,
      "book": "amateur",
      "title": "Hang the Minority",
      "teach": "Minority attack: create a weakness, then sit on it.",
      "hint": "Start the queenside pawn storm.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Minority attack",
      "about": "Minority attack — Silman-style thinking drill.",
      "desc": "Minority attack: create a weakness, then sit on it. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 11,
      "book": "amateur",
      "title": "Finish Development",
      "teach": "Don't attack with half your army still at home.",
      "hint": "Develop the sleeping piece.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Development",
      "about": "Development — Silman-style thinking drill.",
      "desc": "Don't attack with half your army still at home. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 12,
      "book": "amateur",
      "title": "Castle Before Drama",
      "teach": "King safety first — castle before opening the center.",
      "hint": "Get the king safe.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "King safety",
      "about": "King safety — Silman-style thinking drill.",
      "desc": "King safety first — castle before opening the center. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 13,
      "book": "amateur",
      "title": "Seize the Open File",
      "teach": "Contest the open file before they double on it.",
      "hint": "Take the file.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Files",
      "about": "Files — Silman-style thinking drill.",
      "desc": "Contest the open file before they double on it. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 14,
      "book": "amateur",
      "title": "Don't Ignore Space",
      "teach": "A space advantage means you can reshuffle; they can't.",
      "hint": "Gain space with a useful push.",
      "fen": "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
      "goal": "win",
      "theme": "Space",
      "about": "Space — Silman-style thinking drill.",
      "desc": "A space advantage means you can reshuffle; they can't. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 15,
      "book": "amateur",
      "title": "Piece Behind Passer",
      "teach": "Rooks belong behind passed pawns — yours or theirs.",
      "hint": "Post the rook correctly.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "Passed pawn",
      "about": "Passed pawn — Silman-style thinking drill.",
      "desc": "Rooks belong behind passed pawns — yours or theirs. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 16,
      "book": "amateur",
      "title": "Ask Their Threat",
      "teach": "Before your clever idea — what is their next move?",
      "hint": "Meet the threat first.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Thinking",
      "about": "Thinking — Silman-style thinking drill.",
      "desc": "Before your clever idea — what is their next move? Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 17,
      "book": "amateur",
      "title": "Candidate Moves",
      "teach": "List 2–3 candidates; don't move the first impulse.",
      "hint": "Choose the principled candidate.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Thinking",
      "about": "Thinking — Silman-style thinking drill.",
      "desc": "List 2–3 candidates; don't move the first impulse. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 18,
      "book": "amateur",
      "title": "Stop Hope Chess",
      "teach": "A one-move threat they can ignore is not a plan.",
      "hint": "Make a real dual-purpose move.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 2 3",
      "goal": "win",
      "theme": "Hope chess",
      "about": "Hope chess — Silman-style thinking drill.",
      "desc": "A one-move threat they can ignore is not a plan. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 19,
      "book": "amateur",
      "title": "Improve Worst Piece",
      "teach": "The worst-placed piece defines your next job.",
      "hint": "Re-route the idle piece.",
      "fen": "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Piece activity",
      "about": "Piece activity — Silman-style thinking drill.",
      "desc": "The worst-placed piece defines your next job. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 20,
      "book": "amateur",
      "title": "Prophylaxis Lite",
      "teach": "Prevent their only active idea, then improve.",
      "hint": "Nip their plan in the bud.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Prophylaxis",
      "about": "Prophylaxis — Silman-style thinking drill.",
      "desc": "Prevent their only active idea, then improve. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 21,
      "book": "amateur",
      "title": "Own the Hole",
      "teach": "A hole on e5/d5 is a lifelong knight home.",
      "hint": "Occupy the hole.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Weak squares",
      "about": "Weak squares — Silman-style thinking drill.",
      "desc": "A hole on e5/d5 is a lifelong knight home. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 22,
      "book": "amateur",
      "title": "Dark-Square Bind",
      "teach": "Trade the right bishop and the complex collapses.",
      "hint": "Target the soft color complex.",
      "fen": "r1bqk2r/ppp2ppp/2n1pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 6",
      "goal": "win",
      "theme": "Color complex",
      "about": "Color complex — Silman-style thinking drill.",
      "desc": "Trade the right bishop and the complex collapses. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 23,
      "book": "amateur",
      "title": "Don't Give Holes",
      "teach": "g3/g6 without a plan gifts outposts forever.",
      "hint": "Avoid the gratuitous hole.",
      "fen": "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Pawn structure",
      "about": "Pawn structure — Silman-style thinking drill.",
      "desc": "g3/g6 without a plan gifts outposts forever. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 24,
      "book": "amateur",
      "title": "Fix Then Attack",
      "teach": "Restrain their breaks, then pile on the weakness.",
      "hint": "Clamp the structure first.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Restraint",
      "about": "Restraint — Silman-style thinking drill.",
      "desc": "Restrain their breaks, then pile on the weakness. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 25,
      "book": "amateur",
      "title": "Open Near Their King",
      "teach": "Open lines only when your pieces are ready to use them.",
      "hint": "Open the right file.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Attack",
      "about": "Attack — Silman-style thinking drill.",
      "desc": "Open lines only when your pieces are ready to use them. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 26,
      "book": "amateur",
      "title": "Don't Castle Into It",
      "teach": "If the pawn storm is rolling, reconsider the wing.",
      "hint": "Castle (or stay) wisely.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "King safety",
      "about": "King safety — Silman-style thinking drill.",
      "desc": "If the pawn storm is rolling, reconsider the wing. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 27,
      "book": "amateur",
      "title": "Meet the Storm",
      "teach": "Counter in the center against a wing attack.",
      "hint": "Break in the center.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Opposite castling",
      "about": "Opposite castling — Silman-style thinking drill.",
      "desc": "Counter in the center against a wing attack. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 28,
      "book": "amateur",
      "title": "Sacrifice Only With Cause",
      "teach": "Don't sack for 'initiative' with no follow-ups.",
      "hint": "Prefer the solid continuation.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Calculation",
      "about": "Calculation — Silman-style thinking drill.",
      "desc": "Don't sack for 'initiative' with no follow-ups. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 29,
      "book": "amateur",
      "title": "Defend Actively",
      "teach": "Passive defense loses — exchange or counterpunch.",
      "hint": "Find the active defense.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Defense",
      "about": "Defense — Silman-style thinking drill.",
      "desc": "Passive defense loses — exchange or counterpunch. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 30,
      "book": "amateur",
      "title": "King Hunt Prep",
      "teach": "Bring the last attacker before the checks start.",
      "hint": "Add fuel to the attack.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Attack",
      "about": "Attack — Silman-style thinking drill.",
      "desc": "Bring the last attacker before the checks start. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 31,
      "book": "amateur",
      "title": "Material vs Initiative",
      "teach": "Down a pawn but developed — keep the initiative.",
      "hint": "Don't panic-recapture; stay active.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Initiative",
      "about": "Initiative — Silman-style thinking drill.",
      "desc": "Down a pawn but developed — keep the initiative. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 32,
      "book": "amateur",
      "title": "Space vs Breaks",
      "teach": "Space is useless if they get the freeing break.",
      "hint": "Stop or meet the break.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Space",
      "about": "Space — Silman-style thinking drill.",
      "desc": "Space is useless if they get the freeing break. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 33,
      "book": "amateur",
      "title": "Structure vs Pieces",
      "teach": "Ugly pawns can be fine if pieces dominate.",
      "hint": "Trust activity over cosmetics.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Imbalance",
      "about": "Imbalance — Silman-style thinking drill.",
      "desc": "Ugly pawns can be fine if pieces dominate. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 34,
      "book": "amateur",
      "title": "Time vs Material",
      "teach": "A tempo in an open position is often worth a pawn.",
      "hint": "Spend the tempo usefully.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Initiative",
      "about": "Initiative — Silman-style thinking drill.",
      "desc": "A tempo in an open position is often worth a pawn. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 35,
      "book": "amateur",
      "title": "Static vs Dynamic",
      "teach": "Static pluses last; dynamics must be used now.",
      "hint": "Cash the dynamic chance.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Dynamics",
      "about": "Dynamics — Silman-style thinking drill.",
      "desc": "Static pluses last; dynamics must be used now. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 36,
      "book": "amateur",
      "title": "Stop One-Move Threats",
      "teach": "Make threats that still leave your position sound.",
      "hint": "Prefer a dual-purpose move.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Hope chess",
      "about": "Hope chess — Silman-style thinking drill.",
      "desc": "Make threats that still leave your position sound. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 37,
      "book": "amateur",
      "title": "Don't Chase Ghosts",
      "teach": "Harassing a queen that wants to move wastes time.",
      "hint": "Ignore the 'free' tempo gift.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Thinking",
      "about": "Thinking — Silman-style thinking drill.",
      "desc": "Harassing a queen that wants to move wastes time. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 38,
      "book": "amateur",
      "title": "Recapture With Purpose",
      "teach": "Automatic recaptures can ruin a structure.",
      "hint": "Choose the right recapture.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Structure",
      "about": "Structure — Silman-style thinking drill.",
      "desc": "Automatic recaptures can ruin a structure. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 39,
      "book": "amateur",
      "title": "Queen Early Out",
      "teach": "Early queen trips often lose tempi to developing moves.",
      "hint": "Prefer developing a minor piece.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Development",
      "about": "Development — Silman-style thinking drill.",
      "desc": "Early queen trips often lose tempi to developing moves. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 40,
      "book": "amateur",
      "title": "Don't Pin Blindly",
      "teach": "A pretty pin that does nothing is not progress.",
      "hint": "Pin with intent — or improve.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Tactics",
      "about": "Tactics — Silman-style thinking drill.",
      "desc": "A pretty pin that does nothing is not progress. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 41,
      "book": "amateur",
      "title": "Occupy Open Diagonal",
      "teach": "Clear the long diagonal for the fianchetto bishop.",
      "hint": "Open or seize the diagonal.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Diagonals",
      "about": "Diagonals — Silman-style thinking drill.",
      "desc": "Clear the long diagonal for the fianchetto bishop. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 42,
      "book": "amateur",
      "title": "Exchange On Their Terms?",
      "teach": "Trade only if the resulting ending favors you.",
      "hint": "Decline or set terms.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Trades",
      "about": "Trades — Silman-style thinking drill.",
      "desc": "Trade only if the resulting ending favors you. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 43,
      "book": "amateur",
      "title": "Rook Lift Idea",
      "teach": "Lift a rook via the third rank into the attack.",
      "hint": "Start the rook lift.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Attack",
      "about": "Attack — Silman-style thinking drill.",
      "desc": "Lift a rook via the third rank into the attack. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 44,
      "book": "amateur",
      "title": "Centralize Knights",
      "teach": "Knights belong near the center, not on the rim.",
      "hint": "Centralize the knight.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 4",
      "goal": "win",
      "theme": "Piece activity",
      "about": "Piece activity — Silman-style thinking drill.",
      "desc": "Knights belong near the center, not on the rim. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 45,
      "book": "amateur",
      "title": "Bad Bishop Fix",
      "teach": "Free the bad bishop or trade it for their good one.",
      "hint": "Liberate or trade the bishop.",
      "fen": "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
      "goal": "win",
      "theme": "Bishop quality",
      "about": "Bishop quality — Silman-style thinking drill.",
      "desc": "Free the bad bishop or trade it for their good one. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 46,
      "book": "amateur",
      "title": "Good Knight vs Bad Bishop",
      "teach": "Close the position to favor the knight.",
      "hint": "Keep things closed.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Imbalance",
      "about": "Imbalance — Silman-style thinking drill.",
      "desc": "Close the position to favor the knight. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 47,
      "book": "amateur",
      "title": "Two Weaknesses",
      "teach": "One weakness is defendable — create a second front.",
      "hint": "Open a second weakness.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Planning",
      "about": "Planning — Silman-style thinking drill.",
      "desc": "One weakness is defendable — create a second front. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 48,
      "book": "amateur",
      "title": "Restraint First",
      "teach": "Restrain, blockade, then destroy the passer.",
      "hint": "Blockade before capturing.",
      "fen": "4r1k1/1pp2ppp/p1n5/3pP3/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "Blockade",
      "about": "Blockade — Silman-style thinking drill.",
      "desc": "Restrain, blockade, then destroy the passer. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 49,
      "book": "amateur",
      "title": "Don't Overextend",
      "teach": "Pawns that rush ahead become targets.",
      "hint": "Support before advancing.",
      "fen": "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
      "goal": "win",
      "theme": "Pawn structure",
      "about": "Pawn structure — Silman-style thinking drill.",
      "desc": "Pawns that rush ahead become targets. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 50,
      "book": "amateur",
      "title": "Liquidate Correctly",
      "teach": "When better, simplify into a won ending — not a drawn one.",
      "hint": "Choose the winning liquidation.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Conversion",
      "about": "Conversion — Silman-style thinking drill.",
      "desc": "When better, simplify into a won ending — not a drawn one. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 51,
      "book": "amateur",
      "title": "Who Has Positive Imbalance?",
      "teach": "Identify your plus before inventing a plan.",
      "hint": "Play toward your advantage.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Imbalance",
      "about": "Imbalance — Silman-style thinking drill.",
      "desc": "Identify your plus before inventing a plan. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 52,
      "book": "amateur",
      "title": "Can I Improve a Piece?",
      "teach": "If no tactic, improve the worst piece.",
      "hint": "Reposition the idle unit.",
      "fen": "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Piece activity",
      "about": "Piece activity — Silman-style thinking drill.",
      "desc": "If no tactic, improve the worst piece. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 53,
      "book": "amateur",
      "title": "Does Their Plan Matter?",
      "teach": "If their plan is slow, ignore it and hit harder.",
      "hint": "Prioritize your own threat.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Thinking",
      "about": "Thinking — Silman-style thinking drill.",
      "desc": "If their plan is slow, ignore it and hit harder. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 54,
      "book": "amateur",
      "title": "Is the Ending Good?",
      "teach": "Calculate the pawn ending before the last trade.",
      "hint": "Only trade into a good ending.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/4R1K1 w - - 0 18",
      "goal": "win",
      "theme": "Endgame transition",
      "about": "Endgame transition — Silman-style thinking drill.",
      "desc": "Calculate the pawn ending before the last trade. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 55,
      "book": "amateur",
      "title": "Where Do I Want Pieces?",
      "teach": "Dream position first — then find the moves.",
      "hint": "Steer toward the ideal setup.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "Planning",
      "about": "Planning — Silman-style thinking drill.",
      "desc": "Dream position first — then find the moves. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 56,
      "book": "amateur",
      "title": "Count Attackers",
      "teach": "Don't 'sac' when you're simply outnumbered.",
      "hint": "Add an attacker or refuse.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Calculation",
      "about": "Calculation — Silman-style thinking drill.",
      "desc": "Don't 'sac' when you're simply outnumbered. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 57,
      "book": "amateur",
      "title": "Zwischenzug Sense",
      "teach": "Look for an in-between move before recapturing.",
      "hint": "Insert the zwischenzug.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Tactics",
      "about": "Tactics — Silman-style thinking drill.",
      "desc": "Look for an in-between move before recapturing. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 58,
      "book": "amateur",
      "title": "Loose Pieces Drop Off",
      "teach": "LPDO — untie loose pieces before inventing art.",
      "hint": "Secure the loose unit.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Tactics",
      "about": "Tactics — Silman-style thinking drill.",
      "desc": "LPDO — untie loose pieces before inventing art. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 59,
      "book": "amateur",
      "title": "Back Rank Awareness",
      "teach": "Give luft before the combination season.",
      "hint": "Make air for the king.",
      "fen": "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14",
      "goal": "win",
      "theme": "King safety",
      "about": "King safety — Silman-style thinking drill.",
      "desc": "Give luft before the combination season. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 60,
      "book": "amateur",
      "title": "Overloaded Defender",
      "teach": "One piece guarding two targets is a motif.",
      "hint": "Overload the defender.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Tactics",
      "about": "Tactics — Silman-style thinking drill.",
      "desc": "One piece guarding two targets is a motif. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 61,
      "book": "amateur",
      "title": "Half-Open File Plan",
      "teach": "Stack on the half-open file against the backward pawn.",
      "hint": "Double on the file.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Files",
      "about": "Files — Silman-style thinking drill.",
      "desc": "Stack on the half-open file against the backward pawn. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 62,
      "book": "amateur",
      "title": "Pawn Chain Attack Base",
      "teach": "Attack the base of the pawn chain, not the head.",
      "hint": "Strike the base.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Pawn chain",
      "about": "Pawn chain — Silman-style thinking drill.",
      "desc": "Attack the base of the pawn chain, not the head. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 63,
      "book": "amateur",
      "title": "Undermining Break",
      "teach": "Undermine their pawn wedge with the right lever.",
      "hint": "Play the undermining break.",
      "fen": "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
      "goal": "win",
      "theme": "Breaks",
      "about": "Breaks — Silman-style thinking drill.",
      "desc": "Undermine their pawn wedge with the right lever. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 64,
      "book": "amateur",
      "title": "Fix Weakness Forever",
      "teach": "Sometimes leave the weakness — they must babysit it.",
      "hint": "Fix, then pile up.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Weaknesses",
      "about": "Weaknesses — Silman-style thinking drill.",
      "desc": "Sometimes leave the weakness — they must babysit it. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 65,
      "book": "amateur",
      "title": "Transform Advantage",
      "teach": "Convert one plus into another that's easier to use.",
      "hint": "Transform the imbalance.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Conversion",
      "about": "Conversion — Silman-style thinking drill.",
      "desc": "Convert one plus into another that's easier to use. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 66,
      "book": "amateur",
      "title": "Clock & Clarity",
      "teach": "When unsure, improve king safety and piece harmony.",
      "hint": "Play the clarifying improving move.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Practical",
      "about": "Practical — Silman-style thinking drill.",
      "desc": "When unsure, improve king safety and piece harmony. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 67,
      "book": "amateur",
      "title": "Don't Panic Equalize",
      "teach": "Being a bit worse is fine — don't force a bad trade.",
      "hint": "Hold with a solid move.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Defense",
      "about": "Defense — Silman-style thinking drill.",
      "desc": "Being a bit worse is fine — don't force a bad trade. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 68,
      "book": "amateur",
      "title": "Initiative Retention",
      "teach": "After a gain, keep asking questions of their position.",
      "hint": "Maintain the initiative.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Initiative",
      "about": "Initiative — Silman-style thinking drill.",
      "desc": "After a gain, keep asking questions of their position. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 69,
      "book": "amateur",
      "title": "Piece Coordination",
      "teach": "Pieces that protect each other fight harder.",
      "hint": "Coordinate the army.",
      "fen": "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Coordination",
      "about": "Coordination — Silman-style thinking drill.",
      "desc": "Pieces that protect each other fight harder. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 70,
      "book": "amateur",
      "title": "Quiet Improving Move",
      "teach": "Not every position needs fireworks.",
      "hint": "Find the quiet improvement.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Prophylaxis",
      "about": "Prophylaxis — Silman-style thinking drill.",
      "desc": "Not every position needs fireworks. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 71,
      "book": "amateur",
      "title": "Evaluate Before Moving",
      "teach": "Stop, list imbalances, then move.",
      "hint": "Play toward the main imbalance.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Thinking",
      "about": "Thinking — Silman-style thinking drill.",
      "desc": "Stop, list imbalances, then move. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 72,
      "book": "amateur",
      "title": "Target the King File",
      "teach": "Open or seize the file pointing at their king.",
      "hint": "Open the attacking file.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Attack",
      "about": "Attack — Silman-style thinking drill.",
      "desc": "Open or seize the file pointing at their king. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 73,
      "book": "amateur",
      "title": "Central Breakthrough",
      "teach": "When pieces are ready, break the center open.",
      "hint": "Time the central break.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Center",
      "about": "Center — Silman-style thinking drill.",
      "desc": "When pieces are ready, break the center open. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 74,
      "book": "amateur",
      "title": "Sideline Their Bishop",
      "teach": "Blunt their bishop with a pawn chain.",
      "hint": "Blunt the diagonal.",
      "fen": "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
      "goal": "win",
      "theme": "Restraint",
      "about": "Restraint — Silman-style thinking drill.",
      "desc": "Blunt their bishop with a pawn chain. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 75,
      "book": "amateur",
      "title": "Activate Before Endgame",
      "teach": "Activate every piece before the last trade.",
      "hint": "Activate, then simplify.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "Endgame transition",
      "about": "Endgame transition — Silman-style thinking drill.",
      "desc": "Activate every piece before the last trade. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 76,
      "book": "amateur",
      "title": "Imbalance: Open File",
      "teach": "Your open file is a highway — use it.",
      "hint": "Seize and double on the file.",
      "fen": "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14",
      "goal": "win",
      "theme": "Files",
      "about": "Files — Silman-style thinking drill.",
      "desc": "Your open file is a highway — use it. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 77,
      "book": "amateur",
      "title": "Imbalance: Bishop Pair",
      "teach": "Open the position for the two bishops.",
      "hint": "Open lines for the bishops.",
      "fen": "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 7",
      "goal": "win",
      "theme": "Bishop pair",
      "about": "Bishop pair — Silman-style thinking drill.",
      "desc": "Open the position for the two bishops. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 78,
      "book": "amateur",
      "title": "Imbalance: Space Clamp",
      "teach": "Squeeze — don't release the bind for nothing.",
      "hint": "Maintain the clamp.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Space",
      "about": "Space — Silman-style thinking drill.",
      "desc": "Squeeze — don't release the bind for nothing. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 79,
      "book": "amateur",
      "title": "Imbalance: Lead in Time",
      "teach": "Development lead demands opening the game.",
      "hint": "Open while ahead in development.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Development",
      "about": "Development — Silman-style thinking drill.",
      "desc": "Development lead demands opening the game. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 80,
      "book": "amateur",
      "title": "Imbalance: Better King",
      "teach": "Safer king lets you play for the win elsewhere.",
      "hint": "Use king safety as a plus.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "King safety",
      "about": "King safety — Silman-style thinking drill.",
      "desc": "Safer king lets you play for the win elsewhere. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 81,
      "book": "amateur",
      "title": "Amateur Error: Panic Trade",
      "teach": "Trading 'to simplify' can gift them the bishop pair.",
      "hint": "Keep the right pieces.",
      "fen": "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Trades",
      "about": "Trades — Silman-style thinking drill.",
      "desc": "Trading 'to simplify' can gift them the bishop pair. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 82,
      "book": "amateur",
      "title": "Amateur Error: Pawn Grab",
      "teach": "Poisoned pawns are a Silman favorite trap for amateurs.",
      "hint": "Leave the pawn; develop.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Hope chess",
      "about": "Hope chess — Silman-style thinking drill.",
      "desc": "Poisoned pawns are a Silman favorite trap for amateurs. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 83,
      "book": "amateur",
      "title": "Amateur Error: No Plan",
      "teach": "Moves without a plan are hope chess in slow motion.",
      "hint": "Choose a plan-based move.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Planning",
      "about": "Planning — Silman-style thinking drill.",
      "desc": "Moves without a plan are hope chess in slow motion. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 84,
      "book": "amateur",
      "title": "Amateur Error: Ignore King",
      "teach": "Tactics against an uncastled king beat pretty maneuvers.",
      "hint": "Punish the king in the center.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "King safety",
      "about": "King safety — Silman-style thinking drill.",
      "desc": "Tactics against an uncastled king beat pretty maneuvers. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 85,
      "book": "amateur",
      "title": "Amateur Error: One Idea",
      "teach": "If plan A fails, transform — don't force it.",
      "hint": "Switch to the secondary plan.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Planning",
      "about": "Planning — Silman-style thinking drill.",
      "desc": "If plan A fails, transform — don't force it. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 86,
      "book": "amateur",
      "title": "Outpost Prep",
      "teach": "Create the hole, then occupy it.",
      "hint": "Prepare the outpost square.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "Outpost",
      "about": "Outpost — Silman-style thinking drill.",
      "desc": "Create the hole, then occupy it. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 87,
      "book": "amateur",
      "title": "Exchange Sac Idea",
      "teach": "Exchange sacs need lasting soft squares, not hope.",
      "hint": "Only if the compensation is clear.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Exchange sac",
      "about": "Exchange sac — Silman-style thinking drill.",
      "desc": "Exchange sacs need lasting soft squares, not hope. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 88,
      "book": "amateur",
      "title": "Opposite Bishops Attack",
      "teach": "Opposite bishops favor the attacker with initiative.",
      "hint": "Use the unopposed diagonal.",
      "fen": "r1bq1rk1/ppp2ppp/2n1p3/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 7",
      "goal": "win",
      "theme": "Attack",
      "about": "Attack — Silman-style thinking drill.",
      "desc": "Opposite bishops favor the attacker with initiative. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 89,
      "book": "amateur",
      "title": "Opposite Bishops Drawish?",
      "teach": "Without targets, opposite bishops lean drawish.",
      "hint": "Create a second weakness or hold.",
      "fen": "4r1k1/1pp2ppp/p7/3p4/3P4/2P1b3/PP3PPP/4R1K1 w - - 0 20",
      "goal": "win",
      "theme": "Endgame transition",
      "about": "Endgame transition — Silman-style thinking drill.",
      "desc": "Without targets, opposite bishops lean drawish. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 90,
      "book": "amateur",
      "title": "Knight vs Bishop Choice",
      "teach": "Open → bishop; closed → knight. Choose trades accordingly.",
      "hint": "Trade toward your favorable minor.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Imbalance",
      "about": "Imbalance — Silman-style thinking drill.",
      "desc": "Open → bishop; closed → knight. Choose trades accordingly. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 91,
      "book": "amateur",
      "title": "Rook On Seventh",
      "teach": "A rook on the 7th is worth a pawn (often more).",
      "hint": "Invade the seventh.",
      "fen": "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14",
      "goal": "win",
      "theme": "Activity",
      "about": "Activity — Silman-style thinking drill.",
      "desc": "A rook on the 7th is worth a pawn (often more). Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 92,
      "book": "amateur",
      "title": "Cut Off The King",
      "teach": "In endings, cut the enemy king from the action.",
      "hint": "Cut the king off with the rook.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/4R1K1 w - - 0 18",
      "goal": "win",
      "theme": "Endgame transition",
      "about": "Endgame transition — Silman-style thinking drill.",
      "desc": "In endings, cut the enemy king from the action. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 93,
      "book": "amateur",
      "title": "Passed Pawn Push Timing",
      "teach": "Push when pieces support — not as a lone runner.",
      "hint": "Support, then push.",
      "fen": "4r1k1/1pp2ppp/p1n5/3pP3/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "Passed pawn",
      "about": "Passed pawn — Silman-style thinking drill.",
      "desc": "Push when pieces support — not as a lone runner. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 94,
      "book": "amateur",
      "title": "Prophylaxis: Stop Break",
      "teach": "...c5/...e5/...f5 — stop the one that frees them.",
      "hint": "Prevent the freeing break.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Prophylaxis",
      "about": "Prophylaxis — Silman-style thinking drill.",
      "desc": "...c5/...e5/...f5 — stop the one that frees them. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 95,
      "book": "amateur",
      "title": "Think For Both Sides",
      "teach": "After your move, play their best reply in your head.",
      "hint": "Choose a move that survives their reply.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Thinking",
      "about": "Thinking — Silman-style thinking drill.",
      "desc": "After your move, play their best reply in your head. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 96,
      "book": "amateur",
      "title": "Amateur's Mind Review",
      "teach": "Name the imbalance, then play toward it.",
      "hint": "Play the imbalance move.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Silman-style thinking drill.",
      "desc": "Name the imbalance, then play toward it. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 97,
      "book": "amateur",
      "title": "Talk Through Imbalances",
      "teach": "Say the imbalances out loud, then choose a plan.",
      "hint": "Play toward the named plus.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Thinking",
      "about": "Thinking — Silman-style thinking drill.",
      "desc": "Say the imbalances out loud, then choose a plan. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 98,
      "book": "amateur",
      "title": "Don't Fear Ghost Threats",
      "teach": "If it isn't a real threat, continue your plan.",
      "hint": "Ignore the fake threat.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Thinking",
      "about": "Thinking — Silman-style thinking drill.",
      "desc": "If it isn't a real threat, continue your plan. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 99,
      "book": "amateur",
      "title": "Trade Their Best Piece",
      "teach": "Removing their most active piece is a plan.",
      "hint": "Offer the right trade.",
      "fen": "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Trades",
      "about": "Trades — Silman-style thinking drill.",
      "desc": "Removing their most active piece is a plan. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 100,
      "book": "amateur",
      "title": "End the Lesson: Plan First",
      "teach": "Plan first, move second — Silman's amateur cure.",
      "hint": "Choose the planned move.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Planning",
      "about": "Planning — Silman-style thinking drill.",
      "desc": "Plan first, move second — Silman's amateur cure. Fix the typical amateur error; play the principled move. (Amateur's Mind–style · intermediate ≈1200–1700)",
      "pitfalls": [
        "Ask which imbalance matters most before grabbing material.",
        "Don't play 'hope chess' — assume your opponent sees the threat.",
        "Improve your worst-placed piece before launching an attack."
      ]
    },
    {
      "n": 101,
      "book": "dvoretsky",
      "title": "Distant Opposition",
      "teach": "Distant opposition decides who owns the key squares.",
      "hint": "Take distant opposition.",
      "fen": "8/8/8/8/3k4/8/8/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Opposition",
      "about": "Opposition — Advanced endgame drill.",
      "desc": "Distant opposition decides who owns the key squares. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 102,
      "book": "dvoretsky",
      "title": "Close Opposition Win",
      "teach": "With the move, seize close opposition and invade.",
      "hint": "Take the opposition.",
      "fen": "8/8/8/3k4/8/8/3K4/8 w - - 0 1",
      "goal": "win",
      "theme": "Opposition",
      "about": "Opposition — Advanced endgame drill.",
      "desc": "With the move, seize close opposition and invade. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 103,
      "book": "dvoretsky",
      "title": "Key Squares Classic",
      "teach": "Occupy a key square in front of the pawn.",
      "hint": "Go to the key square.",
      "fen": "8/8/8/3k4/8/3P4/8/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Key squares",
      "about": "Key squares — Advanced endgame drill.",
      "desc": "Occupy a key square in front of the pawn. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 104,
      "book": "dvoretsky",
      "title": "Shouldering Out",
      "teach": "Shoulder the enemy king away from the passer.",
      "hint": "Shoulder the king.",
      "fen": "8/8/4k3/8/3PK3/8/8/8 w - - 0 1",
      "goal": "win",
      "theme": "Shouldering",
      "about": "Shouldering — Advanced endgame drill.",
      "desc": "Shoulder the enemy king away from the passer. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 105,
      "book": "dvoretsky",
      "title": "Outflanking",
      "teach": "When opposition is held, outflank around.",
      "hint": "Outflank the king.",
      "fen": "8/8/8/3k4/8/8/3K4/8 w - - 0 1",
      "goal": "win",
      "theme": "Outflanking",
      "about": "Outflanking — Advanced endgame drill.",
      "desc": "When opposition is held, outflank around. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 106,
      "book": "dvoretsky",
      "title": "Protected Passer Rule",
      "teach": "A protected passer freezes their king — use that.",
      "hint": "Use the protected passer.",
      "fen": "8/8/3k4/3P4/3P4/8/8/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Passed pawn",
      "about": "Passed pawn — Advanced endgame drill.",
      "desc": "A protected passer freezes their king — use that. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 107,
      "book": "dvoretsky",
      "title": "Outside Passer Decoy",
      "teach": "Decoy their king with the outside passer.",
      "hint": "Push the outside passer.",
      "fen": "8/8/8/1P1k4/8/8/3K4/8 w - - 0 1",
      "goal": "win",
      "theme": "Outside passer",
      "about": "Outside passer — Advanced endgame drill.",
      "desc": "Decoy their king with the outside passer. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 108,
      "book": "dvoretsky",
      "title": "Pawn Race Tempo",
      "teach": "Count tempi precisely — one tempo is the game.",
      "hint": "Win the race by a tempo.",
      "fen": "8/5p2/8/8/8/4P3/8/4k1K1 w - - 0 1",
      "goal": "win",
      "theme": "Pawn race",
      "about": "Pawn race — Advanced endgame drill.",
      "desc": "Count tempi precisely — one tempo is the game. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 109,
      "book": "dvoretsky",
      "title": "Corresponding Squares Intro",
      "teach": "Some squares correspond — step onto the right one.",
      "hint": "Take the corresponding square.",
      "fen": "8/8/8/3k4/8/8/2K5/8 w - - 0 1",
      "goal": "win",
      "theme": "Corresponding squares",
      "about": "Corresponding squares — Advanced endgame drill.",
      "desc": "Some squares correspond — step onto the right one. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 110,
      "book": "dvoretsky",
      "title": "Triangulation Idea",
      "teach": "Lose a tempo on purpose to pass the move.",
      "hint": "Triangulate.",
      "fen": "8/8/3k4/8/3K4/8/8/8 w - - 0 1",
      "goal": "win",
      "theme": "Triangulation",
      "about": "Triangulation — Advanced endgame drill.",
      "desc": "Lose a tempo on purpose to pass the move. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 111,
      "book": "dvoretsky",
      "title": "Philidor Setup",
      "teach": "Third-rank defense: wait, then check from behind.",
      "hint": "Set up Philidor.",
      "fen": "8/8/8/4pk2/8/8/4R3/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Philidor",
      "about": "Philidor — Advanced endgame drill.",
      "desc": "Third-rank defense: wait, then check from behind. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 112,
      "book": "dvoretsky",
      "title": "Philidor Break Check",
      "teach": "When the pawn reaches 6th, check from the rear.",
      "hint": "Check from behind.",
      "fen": "4R3/8/8/4pk2/8/8/8/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Philidor",
      "about": "Philidor — Advanced endgame drill.",
      "desc": "When the pawn reaches 6th, check from the rear. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 113,
      "book": "dvoretsky",
      "title": "Lucena Bridge Prep",
      "teach": "Build the bridge — shelter the king from checks.",
      "hint": "Prepare the Lucena bridge.",
      "fen": "1K6/1P6/8/3k4/8/8/8/1R6 w - - 0 1",
      "goal": "win",
      "theme": "Lucena",
      "about": "Lucena — Advanced endgame drill.",
      "desc": "Build the bridge — shelter the king from checks. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 114,
      "book": "dvoretsky",
      "title": "Lucena Bridge Built",
      "teach": "Interpose the rook to stop the checks.",
      "hint": "Build/bridge with the rook.",
      "fen": "1K6/1P6/2R5/3k4/8/8/8/8 w - - 0 1",
      "goal": "win",
      "theme": "Lucena",
      "about": "Lucena — Advanced endgame drill.",
      "desc": "Interpose the rook to stop the checks. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 115,
      "book": "dvoretsky",
      "title": "Vancura Defense Idea",
      "teach": "Side checks + attack the pawn from the flank.",
      "hint": "Start Vancura ideas.",
      "fen": "8/8/8/P7/8/2k5/8/R3K3 w - - 0 1",
      "goal": "win",
      "theme": "Vancura",
      "about": "Vancura — Advanced endgame drill.",
      "desc": "Side checks + attack the pawn from the flank. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 116,
      "book": "dvoretsky",
      "title": "Short Side Defense",
      "teach": "King to the short side; rook checks from the long.",
      "hint": "King to short side.",
      "fen": "8/8/8/4pk2/8/8/4R3/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Rook ending",
      "about": "Rook ending — Advanced endgame drill.",
      "desc": "King to the short side; rook checks from the long. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 117,
      "book": "dvoretsky",
      "title": "Frontal Checks",
      "teach": "Frontal checks work when the pawn is far enough.",
      "hint": "Check from the front.",
      "fen": "8/4k3/4P3/8/8/8/8/4R1K1 w - - 0 1",
      "goal": "win",
      "theme": "Rook ending",
      "about": "Rook ending — Advanced endgame drill.",
      "desc": "Frontal checks work when the pawn is far enough. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 118,
      "book": "dvoretsky",
      "title": "Rook Behind Passer Own",
      "teach": "Rook behind your passer — Tarrasch.",
      "hint": "Rook behind the passer.",
      "fen": "8/8/8/3P4/8/8/4k3/3R2K1 w - - 0 1",
      "goal": "win",
      "theme": "Tarrasch",
      "about": "Tarrasch — Advanced endgame drill.",
      "desc": "Rook behind your passer — Tarrasch. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 119,
      "book": "dvoretsky",
      "title": "Rook Behind Passer Enemy",
      "teach": "Rook behind their passer to restrain it.",
      "hint": "Get behind their passer.",
      "fen": "8/8/3p4/8/8/8/3k4/R5K1 w - - 0 1",
      "goal": "win",
      "theme": "Restraint",
      "about": "Restraint — Advanced endgame drill.",
      "desc": "Rook behind their passer to restrain it. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 120,
      "book": "dvoretsky",
      "title": "Active Rook vs Passive",
      "teach": "Activity beats a pawn in many rook endings.",
      "hint": "Activate the rook.",
      "fen": "8/5pk1/4r1p1/8/8/5P2/6P1/4R1K1 w - - 0 1",
      "goal": "win",
      "theme": "Activity",
      "about": "Activity — Advanced endgame drill.",
      "desc": "Activity beats a pawn in many rook endings. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 121,
      "book": "dvoretsky",
      "title": "Cut Off Along Rank",
      "teach": "Cut the king along a rank/file forever.",
      "hint": "Cut the king off.",
      "fen": "8/8/8/4k3/8/8/8/3R2K1 w - - 0 1",
      "goal": "win",
      "theme": "Cut-off",
      "about": "Cut-off — Advanced endgame drill.",
      "desc": "Cut the king along a rank/file forever. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 122,
      "book": "dvoretsky",
      "title": "Rook Ending Check Dance",
      "teach": "Series of checks to improve or force a draw.",
      "hint": "Check to improve.",
      "fen": "8/5pk1/6p1/8/8/5P2/6P1/4R1K1 w - - 0 1",
      "goal": "win",
      "theme": "Checks",
      "about": "Checks — Advanced endgame drill.",
      "desc": "Series of checks to improve or force a draw. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 123,
      "book": "dvoretsky",
      "title": "Passed Pawn + Rook",
      "teach": "Advance when the rook supports from behind.",
      "hint": "Support and push.",
      "fen": "8/8/8/3P4/8/3R4/4k3/6K1 w - - 0 1",
      "goal": "win",
      "theme": "Passed pawn",
      "about": "Passed pawn — Advanced endgame drill.",
      "desc": "Advance when the rook supports from behind. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 124,
      "book": "dvoretsky",
      "title": "Two Pawns vs Rook Care",
      "teach": "Connected pawns can beat a rook — calculate.",
      "hint": "Advance with care.",
      "fen": "8/8/8/3PP3/8/8/8/3k2K1 w - - 0 1",
      "goal": "win",
      "theme": "Pawns vs rook",
      "about": "Pawns vs rook — Advanced endgame drill.",
      "desc": "Connected pawns can beat a rook — calculate. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 125,
      "book": "dvoretsky",
      "title": "R+P vs R Theoretical",
      "teach": "Know the drawing zone vs winning zone.",
      "hint": "Play the theoretical move.",
      "fen": "8/8/4pk2/8/8/8/4R3/4K3 w - - 0 1",
      "goal": "win",
      "theme": "Theory",
      "about": "Theory — Advanced endgame drill.",
      "desc": "Know the drawing zone vs winning zone. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 126,
      "book": "dvoretsky",
      "title": "Bishop Same Color Win",
      "teach": "Wrong corner? Check the bishop's color vs rook pawn.",
      "hint": "Drive to the right corner.",
      "fen": "8/8/8/3k4/8/8/3B4/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Bishop ending",
      "about": "Bishop ending — Advanced endgame drill.",
      "desc": "Wrong corner? Check the bishop's color vs rook pawn. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 127,
      "book": "dvoretsky",
      "title": "Wrong Rook Pawn",
      "teach": "Bishop that doesn't control the promotion square = draw.",
      "hint": "Recognize the draw.",
      "fen": "8/8/8/8/7P/8/6B1/4k2K w - - 0 1",
      "goal": "draw",
      "theme": "Wrong bishop",
      "about": "Wrong bishop — Advanced endgame drill.",
      "desc": "Bishop that doesn't control the promotion square = draw. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 128,
      "book": "dvoretsky",
      "title": "Bishop vs Knight Closed",
      "teach": "Closed → knight; open diagonals → bishop.",
      "hint": "Play to your minor's strength.",
      "fen": "8/8/3k4/3n4/3B4/8/8/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Minor pieces",
      "about": "Minor pieces — Advanced endgame drill.",
      "desc": "Closed → knight; open diagonals → bishop. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 129,
      "book": "dvoretsky",
      "title": "Knight Fork Net",
      "teach": "Knights need outposts and short-range tactics.",
      "hint": "Use the fork net.",
      "fen": "8/8/3k4/8/3N4/8/8/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Knight",
      "about": "Knight — Advanced endgame drill.",
      "desc": "Knights need outposts and short-range tactics. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 130,
      "book": "dvoretsky",
      "title": "Two Bishops Mate Net",
      "teach": "Coordinate bishops to shrink the box.",
      "hint": "Shrink the king's box.",
      "fen": "8/8/8/3k4/8/8/2B5/1B1K4 w - - 0 1",
      "goal": "win",
      "theme": "Two bishops",
      "about": "Two bishops — Advanced endgame drill.",
      "desc": "Coordinate bishops to shrink the box. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 131,
      "book": "dvoretsky",
      "title": "Bishop + Knight Mate Idea",
      "teach": "Drive to the right corner (bishop's color).",
      "hint": "Drive toward the key corner.",
      "fen": "8/8/8/3k4/8/8/2BN4/3K4 w - - 0 1",
      "goal": "win",
      "theme": "B+N mate",
      "about": "B+N mate — Advanced endgame drill.",
      "desc": "Drive to the right corner (bishop's color). Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 132,
      "book": "dvoretsky",
      "title": "Good Knight Outpost Ending",
      "teach": "An immortal outpost knight dominates.",
      "hint": "Plant/use the outpost.",
      "fen": "8/8/3k1n2/8/3N4/8/8/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Outpost",
      "about": "Outpost — Advanced endgame drill.",
      "desc": "An immortal outpost knight dominates. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 133,
      "book": "dvoretsky",
      "title": "Opposite Bishops Fortress",
      "teach": "Opposite bishops: blockade on your color.",
      "hint": "Set up the fortress blockade.",
      "fen": "8/8/3k4/4b3/3B4/8/8/3K4 w - - 0 1",
      "goal": "draw",
      "theme": "Fortress",
      "about": "Fortress — Advanced endgame drill.",
      "desc": "Opposite bishops: blockade on your color. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 134,
      "book": "dvoretsky",
      "title": "Same-Color Bishop Breakthrough",
      "teach": "Create a second weakness for same-color bishops.",
      "hint": "Create the second front.",
      "fen": "8/8/3k4/8/3B4/8/3P4/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Bishop ending",
      "about": "Bishop ending — Advanced endgame drill.",
      "desc": "Create a second weakness for same-color bishops. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 135,
      "book": "dvoretsky",
      "title": "Knight vs Passer",
      "teach": "Knight stops a passer from the front/side carefully.",
      "hint": "Stop the passer correctly.",
      "fen": "8/8/3k4/3P4/8/8/4N3/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Knight",
      "about": "Knight — Advanced endgame drill.",
      "desc": "Knight stops a passer from the front/side carefully. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 136,
      "book": "dvoretsky",
      "title": "Queen Centralize",
      "teach": "Centralize the queen for checks and forks.",
      "hint": "Centralize the queen.",
      "fen": "8/8/4k3/8/8/8/3Q4/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Queen ending",
      "about": "Queen ending — Advanced endgame drill.",
      "desc": "Centralize the queen for checks and forks. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 137,
      "book": "dvoretsky",
      "title": "Perpetual Check Idea",
      "teach": "When losing, hunt perpetual checks.",
      "hint": "Find the perpetual path.",
      "fen": "8/5pk1/6p1/8/8/8/5Q2/6K1 w - - 0 1",
      "goal": "draw",
      "theme": "Perpetual",
      "about": "Perpetual — Advanced endgame drill.",
      "desc": "When losing, hunt perpetual checks. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 138,
      "book": "dvoretsky",
      "title": "Queen vs Passer",
      "teach": "Queen stops passers from behind with checks.",
      "hint": "Check and restrain.",
      "fen": "8/8/3k4/3P4/8/8/3Q4/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Queen ending",
      "about": "Queen ending — Advanced endgame drill.",
      "desc": "Queen stops passers from behind with checks. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 139,
      "book": "dvoretsky",
      "title": "Q+P vs Q Bridge",
      "teach": "Shelter the king from endless checks.",
      "hint": "Shelter from checks.",
      "fen": "8/3Q4/1P6/8/8/4k3/8/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Queen ending",
      "about": "Queen ending — Advanced endgame drill.",
      "desc": "Shelter the king from endless checks. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 140,
      "book": "dvoretsky",
      "title": "Skewer Net",
      "teach": "Align king and queen for a skewer.",
      "hint": "Set the skewer.",
      "fen": "8/8/4k3/8/8/8/3Q4/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Skewer",
      "about": "Skewer — Advanced endgame drill.",
      "desc": "Align king and queen for a skewer. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 141,
      "book": "dvoretsky",
      "title": "Rook Ending: Activity First",
      "teach": "Give a pawn for activity if needed.",
      "hint": "Activate even at pawn cost.",
      "fen": "8/5pk1/4r1pp/8/8/5PPP/8/4R1K1 w - - 0 1",
      "goal": "win",
      "theme": "Activity",
      "about": "Activity — Advanced endgame drill.",
      "desc": "Give a pawn for activity if needed. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 142,
      "book": "dvoretsky",
      "title": "Rook Ending: Passer Creation",
      "teach": "Create a passer before random checks.",
      "hint": "Create the passer.",
      "fen": "8/5pk1/6pp/8/8/5PPP/4R3/6K1 w - - 0 1",
      "goal": "win",
      "theme": "Passed pawn",
      "about": "Passed pawn — Advanced endgame drill.",
      "desc": "Create a passer before random checks. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 143,
      "book": "dvoretsky",
      "title": "Rook Ending: King Activate",
      "teach": "King belongs in the fight in rook endings.",
      "hint": "Activate the king.",
      "fen": "8/5pk1/6p1/8/8/5P2/6P1/4R1K1 w - - 0 1",
      "goal": "win",
      "theme": "King activity",
      "about": "King activity — Advanced endgame drill.",
      "desc": "King belongs in the fight in rook endings. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 144,
      "book": "dvoretsky",
      "title": "Rook Ending: Trade Decision",
      "teach": "Rook trades change the evaluation completely.",
      "hint": "Only trade into a win.",
      "fen": "8/5pk1/4r1p1/8/8/5P2/6P1/4R1K1 w - - 0 1",
      "goal": "win",
      "theme": "Trades",
      "about": "Trades — Advanced endgame drill.",
      "desc": "Rook trades change the evaluation completely. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 145,
      "book": "dvoretsky",
      "title": "Rook Ending: Bridge Defense",
      "teach": "Know when Lucena is reachable.",
      "hint": "Head for Lucena.",
      "fen": "1K6/1P6/8/8/3k4/8/8/1R6 w - - 0 1",
      "goal": "win",
      "theme": "Lucena",
      "about": "Lucena — Advanced endgame drill.",
      "desc": "Know when Lucena is reachable. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 146,
      "book": "dvoretsky",
      "title": "Rook Ending: Philidor Save",
      "teach": "Know when Philidor holds.",
      "hint": "Hold with Philidor.",
      "fen": "8/8/8/4pk2/8/8/4R3/4K3 w - - 0 1",
      "goal": "draw",
      "theme": "Philidor",
      "about": "Philidor — Advanced endgame drill.",
      "desc": "Know when Philidor holds. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 147,
      "book": "dvoretsky",
      "title": "Frontal Defense Zone",
      "teach": "Know the checking distance for frontal defense.",
      "hint": "Keep checking distance.",
      "fen": "8/4k3/4P3/8/8/8/4R3/6K1 w - - 0 1",
      "goal": "win",
      "theme": "Theory",
      "about": "Theory — Advanced endgame drill.",
      "desc": "Know the checking distance for frontal defense. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 148,
      "book": "dvoretsky",
      "title": "Side Checks Long Side",
      "teach": "Checks from the long side need distance.",
      "hint": "Check from far away.",
      "fen": "8/8/8/4pk2/8/8/8/R3K3 w - - 0 1",
      "goal": "win",
      "theme": "Checks",
      "about": "Checks — Advanced endgame drill.",
      "desc": "Checks from the long side need distance. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 149,
      "book": "dvoretsky",
      "title": "Umbrella Technique",
      "teach": "Use a pawn as an umbrella against checks.",
      "hint": "Use the umbrella.",
      "fen": "8/8/1P6/8/8/3k4/8/1R1K4 w - - 0 1",
      "goal": "win",
      "theme": "Technique",
      "about": "Technique — Advanced endgame drill.",
      "desc": "Use a pawn as an umbrella against checks. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 150,
      "book": "dvoretsky",
      "title": "Bodycheck in Rook Ending",
      "teach": "Shoulder in rook endings too.",
      "hint": "Bodycheck the king.",
      "fen": "8/8/3k4/3P4/8/8/3R4/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Shouldering",
      "about": "Shouldering — Advanced endgame drill.",
      "desc": "Shoulder in rook endings too. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 151,
      "book": "dvoretsky",
      "title": "Breakthrough Classic Shape",
      "teach": "The sacrificial breakthrough motif.",
      "hint": "Breakthrough now.",
      "fen": "8/8/5p2/5P2/5P2/8/8/4k1K1 w - - 0 1",
      "goal": "win",
      "theme": "Breakthrough",
      "about": "Breakthrough — Advanced endgame drill.",
      "desc": "The sacrificial breakthrough motif. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 152,
      "book": "dvoretsky",
      "title": "Protected Passer Freeze",
      "teach": "Their king must watch — invade the other wing.",
      "hint": "Invade the other wing.",
      "fen": "8/8/3k4/3P4/2P5/8/8/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Passed pawn",
      "about": "Passed pawn — Advanced endgame drill.",
      "desc": "Their king must watch — invade the other wing. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 153,
      "book": "dvoretsky",
      "title": "Connected Passers March",
      "teach": "Connected passers on the 6th are huge.",
      "hint": "Advance the pair.",
      "fen": "8/8/3PP3/8/8/3k4/8/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Connected passers",
      "about": "Connected passers — Advanced endgame drill.",
      "desc": "Connected passers on the 6th are huge. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 154,
      "book": "dvoretsky",
      "title": "Split Passers",
      "teach": "Two split passers stretch the defense.",
      "hint": "Advance the farther one.",
      "fen": "8/8/8/P3k3/8/8/3K4/7P w - - 0 1",
      "goal": "win",
      "theme": "Split passers",
      "about": "Split passers — Advanced endgame drill.",
      "desc": "Two split passers stretch the defense. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 155,
      "book": "dvoretsky",
      "title": "Rook Pawn Exceptions",
      "teach": "Rook pawns change key-square geometry.",
      "hint": "Apply rook-pawn rules.",
      "fen": "8/8/8/7k/8/7P/8/6K1 w - - 0 1",
      "goal": "win",
      "theme": "Rook pawn",
      "about": "Rook pawn — Advanced endgame drill.",
      "desc": "Rook pawns change key-square geometry. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 156,
      "book": "dvoretsky",
      "title": "Stalemate Trick Save",
      "teach": "Stalemate resources save 'lost' endings.",
      "hint": "Use the stalemate resource.",
      "fen": "8/8/8/8/8/7k/7P/6K1 w - - 0 1",
      "goal": "draw",
      "theme": "Stalemate",
      "about": "Stalemate — Advanced endgame drill.",
      "desc": "Stalemate resources save 'lost' endings. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 157,
      "book": "dvoretsky",
      "title": "Fortress: Knight Holds",
      "teach": "Some knight fortresses hold vs extra material.",
      "hint": "Set up/recognize the fortress.",
      "fen": "8/8/3k4/8/3N4/8/8/3K4 w - - 0 1",
      "goal": "draw",
      "theme": "Fortress",
      "about": "Fortress — Advanced endgame drill.",
      "desc": "Some knight fortresses hold vs extra material. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 158,
      "book": "dvoretsky",
      "title": "Fortress: Bishop Holds",
      "teach": "Wrong-color blockade can be unbreakable.",
      "hint": "Hold the fortress.",
      "fen": "8/8/3k4/4b3/3B4/8/8/3K4 w - - 0 1",
      "goal": "draw",
      "theme": "Fortress",
      "about": "Fortress — Advanced endgame drill.",
      "desc": "Wrong-color blockade can be unbreakable. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 159,
      "book": "dvoretsky",
      "title": "Zugzwang Net",
      "teach": "Put them in zugzwang — every move loses.",
      "hint": "Force zugzwang.",
      "fen": "8/8/3k4/8/3K4/8/8/8 w - - 0 1",
      "goal": "win",
      "theme": "Zugzwang",
      "about": "Zugzwang — Advanced endgame drill.",
      "desc": "Put them in zugzwang — every move loses. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 160,
      "book": "dvoretsky",
      "title": "Reserve Tempo",
      "teach": "A spare pawn tempo wins opposition fights.",
      "hint": "Use the reserve tempo.",
      "fen": "8/8/3k4/3p4/3P4/8/8/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Tempi",
      "about": "Tempi — Advanced endgame drill.",
      "desc": "A spare pawn tempo wins opposition fights. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 161,
      "book": "dvoretsky",
      "title": "R+B vs R Care",
      "teach": "Philidor-type defenses appear in R+B vs R too.",
      "hint": "Play precise checks/defense.",
      "fen": "8/8/3k4/8/3B4/8/3R4/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Technical",
      "about": "Technical — Advanced endgame drill.",
      "desc": "Philidor-type defenses appear in R+B vs R too. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 162,
      "book": "dvoretsky",
      "title": "R+N vs R",
      "teach": "Coordinate knight forks with rook cuts.",
      "hint": "Coordinate R+N.",
      "fen": "8/8/3k4/8/3N4/8/3R4/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Technical",
      "about": "Technical — Advanced endgame drill.",
      "desc": "Coordinate knight forks with rook cuts. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 163,
      "book": "dvoretsky",
      "title": "Q vs R+P",
      "teach": "Know the winning methods and fortress tries.",
      "hint": "Break/avoid the fortress.",
      "fen": "8/8/3k4/3p4/8/8/3Q4/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Queen vs rook",
      "about": "Queen vs rook — Advanced endgame drill.",
      "desc": "Know the winning methods and fortress tries. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 164,
      "book": "dvoretsky",
      "title": "Q vs R Theoretical",
      "teach": "Queen wins most R endings — avoid perpetual.",
      "hint": "Avoid the perpetual; convert.",
      "fen": "8/8/4k3/8/8/8/3Q4/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Queen vs rook",
      "about": "Queen vs rook — Advanced endgame drill.",
      "desc": "Queen wins most R endings — avoid perpetual. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 165,
      "book": "dvoretsky",
      "title": "Two Rooks Mate Net",
      "teach": "Ladder or box with two rooks.",
      "hint": "Ladder mate pattern.",
      "fen": "8/8/8/4k3/8/8/3R4/2R1K3 w - - 0 1",
      "goal": "win",
      "theme": "Two rooks",
      "about": "Two rooks — Advanced endgame drill.",
      "desc": "Ladder or box with two rooks. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 166,
      "book": "dvoretsky",
      "title": "Rook vs Minor Precise",
      "teach": "Rook usually wins — but fortresses exist.",
      "hint": "Break the fortress carefully.",
      "fen": "8/8/3k4/3n4/8/8/3R4/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Rook vs knight",
      "about": "Rook vs knight — Advanced endgame drill.",
      "desc": "Rook usually wins — but fortresses exist. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 167,
      "book": "dvoretsky",
      "title": "Bishop Pair vs Rook",
      "teach": "Two bishops can fight a rook.",
      "hint": "Coordinate the bishops.",
      "fen": "8/8/3k4/8/8/8/2B5/1B1K4 w - - 0 1",
      "goal": "win",
      "theme": "Bishops vs rook",
      "about": "Bishops vs rook — Advanced endgame drill.",
      "desc": "Two bishops can fight a rook. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 168,
      "book": "dvoretsky",
      "title": "Converted Advantage",
      "teach": "Technique: no counterplay, then push.",
      "hint": "Remove counterplay first.",
      "fen": "8/5pk1/6p1/8/8/5P2/6P1/4R1K1 w - - 0 1",
      "goal": "win",
      "theme": "Technique",
      "about": "Technique — Advanced endgame drill.",
      "desc": "Technique: no counterplay, then push. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 169,
      "book": "dvoretsky",
      "title": "Calculate Forcing First",
      "teach": "Checks, captures, threats — in that order.",
      "hint": "Start with forcing moves.",
      "fen": "8/5pk1/6p1/8/8/5Q2/6P1/6K1 w - - 0 1",
      "goal": "win",
      "theme": "Calculation",
      "about": "Calculation — Advanced endgame drill.",
      "desc": "Checks, captures, threats — in that order. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 170,
      "book": "dvoretsky",
      "title": "Endgame Transition Skill",
      "teach": "Before the last trade, evaluate the pawn ending.",
      "hint": "Only trade if the ending wins.",
      "fen": "4r1k1/1pp2ppp/p7/3p4/3P4/2P5/PP3PPP/4R1K1 w - - 0 20",
      "goal": "win",
      "theme": "Transition",
      "about": "Transition — Advanced endgame drill.",
      "desc": "Before the last trade, evaluate the pawn ending. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 171,
      "book": "dvoretsky",
      "title": "Lucena: King Out",
      "teach": "King steps out to build the bridge.",
      "hint": "Step the king out.",
      "fen": "1K6/1P6/8/8/4k3/8/8/1R6 w - - 0 1",
      "goal": "win",
      "theme": "Lucena",
      "about": "Lucena — Advanced endgame drill.",
      "desc": "King steps out to build the bridge. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 172,
      "book": "dvoretsky",
      "title": "Philidor: Passive Rook",
      "teach": "Keep the rook on the 3rd until the pawn arrives.",
      "hint": "Hold the third rank.",
      "fen": "8/8/8/4pk2/8/4R3/8/4K3 w - - 0 1",
      "goal": "draw",
      "theme": "Philidor",
      "about": "Philidor — Advanced endgame drill.",
      "desc": "Keep the rook on the 3rd until the pawn arrives. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 173,
      "book": "dvoretsky",
      "title": "Vancura: Lateral Attack",
      "teach": "Attack the pawn laterally while checking.",
      "hint": "Lateral attack + checks.",
      "fen": "8/8/8/P7/8/8/2k5/R3K3 w - - 0 1",
      "goal": "win",
      "theme": "Vancura",
      "about": "Vancura — Advanced endgame drill.",
      "desc": "Attack the pawn laterally while checking. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 174,
      "book": "dvoretsky",
      "title": "Checking Distance",
      "teach": "Maintain the checking distance or lose it forever.",
      "hint": "Keep distance.",
      "fen": "8/4k3/4P3/8/8/8/8/4R1K1 w - - 0 1",
      "goal": "win",
      "theme": "Theory",
      "about": "Theory — Advanced endgame drill.",
      "desc": "Maintain the checking distance or lose it forever. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 175,
      "book": "dvoretsky",
      "title": "Rook Ahead of Passer",
      "teach": "Sometimes ahead is right — know the exception.",
      "hint": "Choose the correct rook post.",
      "fen": "8/8/8/3P4/8/8/4R3/3k2K1 w - - 0 1",
      "goal": "win",
      "theme": "Tarrasch",
      "about": "Tarrasch — Advanced endgame drill.",
      "desc": "Sometimes ahead is right — know the exception. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 176,
      "book": "dvoretsky",
      "title": "King And Rook Mate Net",
      "teach": "Box the king with king + rook.",
      "hint": "Shrink the box.",
      "fen": "8/8/8/4k3/8/8/8/3RK3 w - - 0 1",
      "goal": "win",
      "theme": "Basic mate",
      "about": "Basic mate — Advanced endgame drill.",
      "desc": "Box the king with king + rook. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 177,
      "book": "dvoretsky",
      "title": "Opposition + Rook",
      "teach": "Combine opposition ideas with rook cuts.",
      "hint": "Cut and oppose.",
      "fen": "8/8/4k3/8/8/8/3R4/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Technique",
      "about": "Technique — Advanced endgame drill.",
      "desc": "Combine opposition ideas with rook cuts. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 178,
      "book": "dvoretsky",
      "title": "Pawn Ending Liquidation",
      "teach": "Force a pawn ending you have calculated.",
      "hint": "Force the winning liquidation.",
      "fen": "8/5pk1/6p1/8/8/5P2/6P1/6K1 w - - 0 1",
      "goal": "win",
      "theme": "Pawn ending",
      "about": "Pawn ending — Advanced endgame drill.",
      "desc": "Force a pawn ending you have calculated. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 179,
      "book": "dvoretsky",
      "title": "Space Zugzwang",
      "teach": "Squeeze until they run out of pawn moves.",
      "hint": "Squeeze into zugzwang.",
      "fen": "8/8/3k4/3p4/3P4/8/8/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Zugzwang",
      "about": "Zugzwang — Advanced endgame drill.",
      "desc": "Squeeze until they run out of pawn moves. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 180,
      "book": "dvoretsky",
      "title": "Active King Ending",
      "teach": "In pure pawn endings, the king is an attacker.",
      "hint": "Activate the king.",
      "fen": "8/8/8/3k4/8/8/3K4/8 w - - 0 1",
      "goal": "win",
      "theme": "King activity",
      "about": "King activity — Advanced endgame drill.",
      "desc": "In pure pawn endings, the king is an attacker. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 181,
      "book": "dvoretsky",
      "title": "Theoretical Draw Save",
      "teach": "Recognize the known drawing setup.",
      "hint": "Head for the known draw.",
      "fen": "8/8/8/4pk2/8/8/4R3/4K3 w - - 0 1",
      "goal": "draw",
      "theme": "Theory",
      "about": "Theory — Advanced endgame drill.",
      "desc": "Recognize the known drawing setup. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 182,
      "book": "dvoretsky",
      "title": "Theoretical Win Convert",
      "teach": "Recognize the known winning setup.",
      "hint": "Head for the known win.",
      "fen": "1K6/1P6/8/3k4/8/8/8/1R6 w - - 0 1",
      "goal": "win",
      "theme": "Theory",
      "about": "Theory — Advanced endgame drill.",
      "desc": "Recognize the known winning setup. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 183,
      "book": "dvoretsky",
      "title": "Avoid Stalemate Win",
      "teach": "Leave them a legal move when mating/promoting.",
      "hint": "Avoid accidental stalemate.",
      "fen": "8/8/8/8/8/5Q2/7k/5K2 w - - 0 1",
      "goal": "win",
      "theme": "Stalemate",
      "about": "Stalemate — Advanced endgame drill.",
      "desc": "Leave them a legal move when mating/promoting. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 184,
      "book": "dvoretsky",
      "title": "Quiet Tempo Move",
      "teach": "A waiting move can be the only win.",
      "hint": "Play the waiting move.",
      "fen": "8/8/3k4/8/3K4/8/8/8 w - - 0 1",
      "goal": "win",
      "theme": "Tempi",
      "about": "Tempi — Advanced endgame drill.",
      "desc": "A waiting move can be the only win. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 185,
      "book": "dvoretsky",
      "title": "Cross-Check Idea",
      "teach": "Answer a check with a check that gains time.",
      "hint": "Find the cross-check.",
      "fen": "8/5pk1/6p1/8/8/5Q2/6P1/6K1 w - - 0 1",
      "goal": "win",
      "theme": "Checks",
      "about": "Checks — Advanced endgame drill.",
      "desc": "Answer a check with a check that gains time. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 186,
      "book": "dvoretsky",
      "title": "Domination Motif",
      "teach": "Dominate a piece so it has no safe squares.",
      "hint": "Dominate the piece.",
      "fen": "8/8/3k4/3n4/3N4/8/8/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Domination",
      "about": "Domination — Advanced endgame drill.",
      "desc": "Dominate a piece so it has no safe squares. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 187,
      "book": "dvoretsky",
      "title": "Interference Idea",
      "teach": "Interfere with a defensive line.",
      "hint": "Interfere.",
      "fen": "8/8/3k4/8/3B4/8/3R4/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Interference",
      "about": "Interference — Advanced endgame drill.",
      "desc": "Interfere with a defensive line. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 188,
      "book": "dvoretsky",
      "title": "Deflection In Ending",
      "teach": "Deflect the defender of a key square.",
      "hint": "Deflect the defender.",
      "fen": "8/8/4k3/8/8/8/3Q4/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Deflection",
      "about": "Deflection — Advanced endgame drill.",
      "desc": "Deflect the defender of a key square. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 189,
      "book": "dvoretsky",
      "title": "Clearance Sacrifice",
      "teach": "Clear a square/line with a tempo sac.",
      "hint": "Clear the line.",
      "fen": "8/8/4k3/8/8/8/3R4/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Clearance",
      "about": "Clearance — Advanced endgame drill.",
      "desc": "Clear a square/line with a tempo sac. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 190,
      "book": "dvoretsky",
      "title": "Endgame Calculation Tree",
      "teach": "Force lines first; then quiet moves.",
      "hint": "Calculate the forcing line.",
      "fen": "8/5pk1/6p1/8/8/5P2/6P1/4R1K1 w - - 0 1",
      "goal": "win",
      "theme": "Calculation",
      "about": "Calculation — Advanced endgame drill.",
      "desc": "Force lines first; then quiet moves. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 191,
      "book": "dvoretsky",
      "title": "Dvoretsky Review: Lucena",
      "teach": "Bridge technique under check fire.",
      "hint": "Build the bridge.",
      "fen": "1K6/1P6/2R5/8/4k3/8/8/8 w - - 0 1",
      "goal": "win",
      "theme": "Lucena",
      "about": "Lucena — Advanced endgame drill.",
      "desc": "Bridge technique under check fire. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 192,
      "book": "dvoretsky",
      "title": "Dvoretsky Review: Philidor",
      "teach": "Third rank then rear checks.",
      "hint": "Hold Philidor.",
      "fen": "8/8/8/4pk2/8/4R3/8/4K3 w - - 0 1",
      "goal": "draw",
      "theme": "Philidor",
      "about": "Philidor — Advanced endgame drill.",
      "desc": "Third rank then rear checks. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 193,
      "book": "dvoretsky",
      "title": "Dvoretsky Review: Opposition",
      "teach": "Opposition as a weapon, not a slogan.",
      "hint": "Take opposition.",
      "fen": "8/8/8/3k4/8/8/3K4/8 w - - 0 1",
      "goal": "win",
      "theme": "Opposition",
      "about": "Opposition — Advanced endgame drill.",
      "desc": "Opposition as a weapon, not a slogan. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 194,
      "book": "dvoretsky",
      "title": "Dvoretsky Review: Activity",
      "teach": "Rook activity over pawn counting.",
      "hint": "Activate the rook.",
      "fen": "8/5pk1/4r1p1/8/8/5P2/6P1/4R1K1 w - - 0 1",
      "goal": "win",
      "theme": "Activity",
      "about": "Activity — Advanced endgame drill.",
      "desc": "Rook activity over pawn counting. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 195,
      "book": "dvoretsky",
      "title": "Course Finale · Technique",
      "teach": "Combine cut-off, activity, and calculation.",
      "hint": "Play the technical win.",
      "fen": "8/5pk1/6p1/8/8/5P2/4R1P1/6K1 w - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Advanced endgame drill.",
      "desc": "Combine cut-off, activity, and calculation. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 196,
      "book": "dvoretsky",
      "title": "Corresponding Squares Drill",
      "teach": "Step on the square that mirrors theirs.",
      "hint": "Take the corresponding square.",
      "fen": "8/8/8/4k3/8/8/3K4/8 w - - 0 1",
      "goal": "win",
      "theme": "Corresponding squares",
      "about": "Corresponding squares — Advanced endgame drill.",
      "desc": "Step on the square that mirrors theirs. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 197,
      "book": "dvoretsky",
      "title": "Rook Ending: Seventh Rank",
      "teach": "Invade the 7th and harvest pawns.",
      "hint": "Invade the seventh.",
      "fen": "8/5pk1/6p1/8/8/5P2/6P1/4R1K1 w - - 0 1",
      "goal": "win",
      "theme": "Activity",
      "about": "Activity — Advanced endgame drill.",
      "desc": "Invade the 7th and harvest pawns. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 198,
      "book": "dvoretsky",
      "title": "Pawn Ending: Opposition Win",
      "teach": "Opposition plus outflanking converts.",
      "hint": "Seize and invade.",
      "fen": "8/8/3k4/8/3K4/8/3P4/8 w - - 0 1",
      "goal": "win",
      "theme": "Opposition",
      "about": "Opposition — Advanced endgame drill.",
      "desc": "Opposition plus outflanking converts. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 199,
      "book": "dvoretsky",
      "title": "Minor Piece: Domination",
      "teach": "Take away the knight's flight squares.",
      "hint": "Dominate the knight.",
      "fen": "8/8/3k4/4n3/3N4/8/8/3K4 w - - 0 1",
      "goal": "win",
      "theme": "Domination",
      "about": "Domination — Advanced endgame drill.",
      "desc": "Take away the knight's flight squares. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    },
    {
      "n": 200,
      "book": "dvoretsky",
      "title": "Manual Finale · Precision",
      "teach": "Precision over hope — calculate the win.",
      "hint": "Play the precise winning move.",
      "fen": "8/5pk1/6p1/8/8/5PPP/8/4R1K1 w - - 0 1",
      "goal": "win",
      "theme": "Review",
      "about": "Review — Advanced endgame drill.",
      "desc": "Precision over hope — calculate the win. Prefer the clean theoretical idea. (Dvoretsky-style · advanced ≈2000+)",
      "pitfalls": [
        "Calculate the pawn ending before trading the last pieces.",
        "In rook endings, activity often beats a pawn.",
        "Watch for stalemate and fortress motifs in technical wins."
      ]
    }
  ];


  const BOOK_LABEL = {
    amateur: "Amateur's Mind \u00b7 1200-1700",
    dvoretsky: "Dvoretsky \u00b7 2000+",
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
    if (!["all", "amateur", "dvoretsky"].includes(next)) return;
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
