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

  const ENGINE_JS = "/chess007/stockfish-19-lite-single.js";
  const ENGINE_WASM = "/chess007/stockfish-19-lite-single.wasm";
  const GLYPH = {
    wk: "♔", wq: "♕", wr: "♖", wb: "♗", wn: "♘", wp: "♙",
    bk: "♚", bq: "♛", br: "♜", bb: "♝", bn: "♞", bp: "♟",
  };

  /** 300 lessons: Gelfand / Mueller-Lamprecht / Naroditsky (100 each). Rich descriptions; no pitfalls. Original drills. */
  const LESSONS = [
    {
      "n": 1,
      "book": "gelfand",
      "title": "Evaluate before planning",
      "teach": "Name the imbalances before inventing a plan.",
      "hint": "Evaluate, then choose a plan.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Evaluate before planning",
      "about": "Gelfand-style decisions — Evaluate before planning.",
      "desc": "Gelfand's decision-making starts with a clear evaluation: material, structure, piece activity, king safety, and initiative. Only after that ranking do plans appear. On this board, pause and state which side is better and why, then play the move that fits that evaluation — not the first tactic that flashes. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Evaluate, then choose a plan. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 2,
      "book": "gelfand",
      "title": "Candidate plans",
      "teach": "List two real plans, then pick one with concrete moves.",
      "hint": "Choose between two plans.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Candidate plans",
      "about": "Gelfand-style decisions — Candidate plans.",
      "desc": "Elite players rarely have only one idea. Gelfand often weighs two strategic directions — e.g. queenside expansion versus a central break — and chooses based on concrete feasibility. List two plans here, reject the weaker, and play the first move of the stronger. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Choose between two plans. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 3,
      "book": "gelfand",
      "title": "Transform the advantage",
      "teach": "Convert one plus into an easier one.",
      "hint": "Transform your plus.",
      "fen": "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
      "goal": "win",
      "theme": "Transform the advantage",
      "about": "Gelfand-style decisions — Transform the advantage.",
      "desc": "A recurring Gelfand theme: when a static edge is hard to use, transform it into a dynamic or endgame edge you can play. Look for a trade, break, or liquidation that changes the nature of the advantage without throwing it away. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Transform your plus. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 4,
      "book": "gelfand",
      "title": "Prophylaxis first",
      "teach": "Ask what they want — prevent it — then improve.",
      "hint": "Prevent their idea.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "Prophylaxis first",
      "about": "Gelfand-style decisions — Prophylaxis first.",
      "desc": "Positional Decision Making repeatedly shows prophylaxis as a positive move, not a defensive shrug. Identify their only active plan and spoil it a tempo early, then resume your own improvements. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Prevent their idea. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 5,
      "book": "gelfand",
      "title": "Worst-piece cure",
      "teach": "Improve the ugliest piece before launching.",
      "hint": "Improve the worst piece.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Worst-piece cure",
      "about": "Gelfand-style decisions — Worst-piece cure.",
      "desc": "If a piece has no future, the plan starts there. Gelfand often cures a bad bishop or rim knight before tactical operations. Find the least happy unit and give it a better square. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Improve the worst piece. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 6,
      "book": "gelfand",
      "title": "Structure dictates plan",
      "teach": "Let the pawn skeleton choose your breaks.",
      "hint": "Play the structure's plan.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Structure dictates plan",
      "about": "Gelfand-style decisions — Structure dictates plan.",
      "desc": "Pawn structure is the map. Isolated pawns, hanging pawns, and closed chains each suggest typical plans. Read the skeleton first, then play the thematic break or restraint that belongs to it. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play the structure's plan. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 7,
      "book": "gelfand",
      "title": "Dynamic vs static",
      "teach": "Cash dynamics now; nurse static pluses patiently.",
      "hint": "Respect dynamic vs static.",
      "fen": "r1bqkb1r/pp1ppppp/2n2n2/2p5/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 4",
      "goal": "win",
      "theme": "Dynamic vs static",
      "about": "Gelfand-style decisions — Dynamic vs static.",
      "desc": "Gelfand distinguishes dynamic chances (initiative, lead in development) from static ones (better structure, bishop pair). Dynamics must be used; statics can wait. Decide which kind you have, then act accordingly. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Respect dynamic vs static. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 8,
      "book": "gelfand",
      "title": "Exchange with a reason",
      "teach": "Trade only if the resulting position fits your eval.",
      "hint": "Trade on purpose.",
      "fen": "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Exchange with a reason",
      "about": "Gelfand-style decisions — Exchange with a reason.",
      "desc": "Exchanges are decisions, not habits. Before trading, ask whether the new minor-piece balance, ending, or open file favors your evaluation. Play the exchange — or decline it — with that answer. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Trade on purpose. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 9,
      "book": "gelfand",
      "title": "Space with a plan",
      "teach": "Space is useless without a follow-up.",
      "hint": "Use the space.",
      "fen": "rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 6",
      "goal": "win",
      "theme": "Space with a plan",
      "about": "Gelfand-style decisions — Space with a plan.",
      "desc": "A space advantage allows regrouping. Use it to improve pieces behind the pawn wall, then break where they are cramped. Empty expansion without a follow-up is how advantages evaporate. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Use the space. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 10,
      "book": "gelfand",
      "title": "King safety override",
      "teach": "Unsafe kings veto pretty positional plans.",
      "hint": "Prioritise king safety.",
      "fen": "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "King safety override",
      "about": "Gelfand-style decisions — King safety override.",
      "desc": "If either king is exposed, calculation and safety override long maneuvers. Gelfand's evaluations always include king safety as a veto. Meet threats or punish the exposed king before 'improving' on the queenside. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Prioritise king safety. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 11,
      "book": "gelfand",
      "title": "Break preparation",
      "teach": "Prepare the break until tactics favor you.",
      "hint": "Prepare, then break.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Break preparation",
      "about": "Gelfand-style decisions — Break preparation.",
      "desc": "Premature breaks open lines for the opponent. Place pieces on ideal squares, then deliver the break. The preparation moves are part of the plan, not delays. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Prepare, then break. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 12,
      "book": "gelfand",
      "title": "Second weakness",
      "teach": "When one target is held, create another.",
      "hint": "Open a second front.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "Second weakness",
      "about": "Gelfand-style decisions — Second weakness.",
      "desc": "Classic elite technique: one weakness can be defended forever; two stretch the defence. If they have glued themselves to a backward pawn, open play elsewhere until something drops. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Open a second front. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 13,
      "book": "gelfand",
      "title": "Practical choice",
      "teach": "Among equal options, pick the harder one for them.",
      "hint": "Choose the practical try.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Practical choice",
      "about": "Gelfand-style decisions — Practical choice.",
      "desc": "Gelfand emphasises practical decision-making under tournament conditions. When two moves evaluate similarly, prefer the one that poses more problems or is easier for you to play with the clock. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Choose the practical try. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 14,
      "book": "gelfand",
      "title": "Initiative retention",
      "teach": "After a concession, keep posing questions.",
      "hint": "Keep the initiative.",
      "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      "goal": "win",
      "theme": "Initiative retention",
      "about": "Gelfand-style decisions — Initiative retention.",
      "desc": "When they give ground, do not coast. Find the next annoying move that forces another concession. Initiative retention turns small edges into wins. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Keep the initiative. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 15,
      "book": "gelfand",
      "title": "Endgame transition",
      "teach": "Liquidate only into endings you have evaluated.",
      "hint": "Liquidate with calculation.",
      "fen": "rnbqk2r/pp2ppbp/5np1/2pp4/3P4/2P2NP1/PP2PP1P/RNBQKB1R w KQkq - 0 6",
      "goal": "win",
      "theme": "Endgame transition",
      "about": "Gelfand-style decisions — Endgame transition.",
      "desc": "Heading for an ending is a decision. Count the resulting pawn ending or rook ending before the last trade. Gelfand converts when the ending is clear — not hopeful. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Liquidate with calculation. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 16,
      "book": "gelfand",
      "title": "Restraint",
      "teach": "Restrain their breaks before attacking.",
      "hint": "Restrain first.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Restraint",
      "about": "Gelfand-style decisions — Restraint.",
      "desc": "Botvinnik-flavoured restraint appears in modern elite play too. Stop ...c5/...e5/...f5 ideas, then improve. Prevention is often the strongest 'attacking' move. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Restrain first. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 17,
      "book": "gelfand",
      "title": "Color complex",
      "teach": "Dominate the soft color after the right trade.",
      "hint": "Target the color complex.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Color complex",
      "about": "Gelfand-style decisions — Color complex.",
      "desc": "Trade the defender of a complex, then occupy the holes. Gelfand's games show long sieges on dark or light squares once the right bishop is gone. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Target the color complex. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 18,
      "book": "gelfand",
      "title": "Passed pawn policy",
      "teach": "Create passers that pull their pieces away.",
      "hint": "Create a useful passer.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Passed pawn policy",
      "about": "Gelfand-style decisions — Passed pawn policy.",
      "desc": "A passer is a decoy as much as a runner. Create one that forces their pieces into passivity, then strike on the opposite wing — a positional decision, not just a race. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Create a useful passer. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 19,
      "book": "gelfand",
      "title": "Quiet improving move",
      "teach": "Not every position needs fireworks.",
      "hint": "Find the quiet improvement.",
      "fen": "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Quiet improving move",
      "about": "Gelfand-style decisions — Quiet improving move.",
      "desc": "Elite annotation often praises a quiet move that improves harmony. If no tactic exists, improve a piece or fix a structural detail. Calm strength is still strength. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Find the quiet improvement. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 20,
      "book": "gelfand",
      "title": "Calculation checkpoint",
      "teach": "Verify the positional idea against forcing replies.",
      "hint": "Check forcing replies.",
      "fen": "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
      "goal": "win",
      "theme": "Calculation checkpoint",
      "about": "Gelfand-style decisions — Calculation checkpoint.",
      "desc": "Positional plans die to tactics. After choosing a plan move, blunder-check forcing replies. Gelfand's method is evaluation plus concrete verification — never evaluation alone. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Check forcing replies. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 21,
      "book": "gelfand",
      "title": "Imbalance ranking",
      "teach": "Rank imbalances: which one decides this position?",
      "hint": "Play toward the top imbalance.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Imbalance ranking",
      "about": "Gelfand-style decisions — Imbalance ranking.",
      "desc": "List imbalances and order them. The plan should address the highest-ranked one. Playing toward a minor imbalance while ignoring a king-safety crisis is how evaluations go wrong. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play toward the top imbalance. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 22,
      "book": "gelfand",
      "title": "Piece placement ideal",
      "teach": "Visualise the ideal setup, then steer toward it.",
      "hint": "Steer toward the ideal setup.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Piece placement ideal",
      "about": "Gelfand-style decisions — Piece placement ideal.",
      "desc": "Dream the best squares for your pieces, then find the move that approaches that picture. Reverse-engineering from an ideal setup is a Gelfand-style planning habit. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Steer toward the ideal setup. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 23,
      "book": "gelfand",
      "title": "Decline the gift",
      "teach": "Refuse 'free' material that wrecks your structure or king.",
      "hint": "Refuse the poisoned gift.",
      "fen": "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Decline the gift",
      "about": "Gelfand-style decisions — Decline the gift.",
      "desc": "Elite players decline material that yields lasting soft squares or a lasting attack. If the gift damages your evaluation, leave it and improve. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Refuse the poisoned gift. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 24,
      "book": "gelfand",
      "title": "Active defence",
      "teach": "Defend by exchanging attackers or counterpunching.",
      "hint": "Defend actively.",
      "fen": "r1bqk2r/pp1pppbp/2n2np1/2p5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5",
      "goal": "win",
      "theme": "Active defence",
      "about": "Gelfand-style decisions — Active defence.",
      "desc": "Passive defence invites a crush. Seek trades that reduce their attacking force, or counterbreaks that force them backward. Active defence is a positional decision too. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Defend actively. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 25,
      "book": "gelfand",
      "title": "Time vs structure",
      "teach": "A lead in time demands opening the game.",
      "hint": "Open while ahead in time.",
      "fen": "r2q1rk1/ppp1ppbp/2np1np1/8/2PPP1b1/2N2N2/PP2BPPP/R1BQK2R w KQ - 4 8",
      "goal": "win",
      "theme": "Time vs structure",
      "about": "Gelfand-style decisions — Time vs structure.",
      "desc": "If you lead in development, open lines before they catch up. Closed play returns the gift of time. Openness converts development into concrete threats. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Open while ahead in time. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 26,
      "book": "gelfand",
      "title": "Blockade choice",
      "teach": "Blockade with a piece that still attacks.",
      "hint": "Blockade actively.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Blockade choice",
      "about": "Gelfand-style decisions — Blockade choice.",
      "desc": "A pure sentry is often wrong. Place the blockader where it also eyes weaknesses. Active blockades appear throughout modern positional play. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Blockade actively. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 27,
      "book": "gelfand",
      "title": "Pawn move commitment",
      "teach": "Every pawn move creates lasting holes — have a reason.",
      "hint": "Commit the pawn purposely.",
      "fen": "r1bqk2r/pppp1ppp/2n1pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Pawn move commitment",
      "about": "Gelfand-style decisions — Pawn move commitment.",
      "desc": "Pawns do not move backward. Gelfand weighs pawn advances as structural commitments. Advance when the resulting holes help you more than them. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Commit the pawn purposely. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 28,
      "book": "gelfand",
      "title": "Middlegame to ending",
      "teach": "Know when the ending favors your structure.",
      "hint": "Steer to/avoid the ending.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Middlegame to ending",
      "about": "Gelfand-style decisions — Middlegame to ending.",
      "desc": "Some structures prefer endings; others need middlegame piece play. Decide whether trades help. Steering the game phase is a core positional decision. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Steer to/avoid the ending. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 29,
      "book": "gelfand",
      "title": "Pressure without rushing",
      "teach": "Increase pressure until they crack — don't force.",
      "hint": "Increase the pressure.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/4R1K1 w - - 0 18",
      "goal": "win",
      "theme": "Pressure without rushing",
      "about": "Gelfand-style decisions — Pressure without rushing.",
      "desc": "Forcing a 'win' too early can throw the edge. Improve, restrain, and pile up until the defence collapses. Patient pressure is elite technique. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Increase the pressure. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 30,
      "book": "gelfand",
      "title": "Decision review",
      "teach": "Evaluate → plan candidates → verify → play.",
      "hint": "Apply the decision loop.",
      "fen": "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Decision review",
      "about": "Gelfand-style decisions — Decision review.",
      "desc": "Close with Gelfand's loop: evaluate imbalances, list plan candidates, verify against tactics, then play. Positional Decision Making is a method — use it on this board. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Apply the decision loop. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 31,
      "book": "gelfand",
      "title": "Outpost creation",
      "teach": "Create the hole, then occupy it.",
      "hint": "Prepare the outpost.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Outpost creation",
      "about": "Gelfand-style decisions — Outpost creation.",
      "desc": "Outposts are manufactured. Force a pawn advance that leaves a hole, then plant a knight. Creating the square is as important as occupying it. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Prepare the outpost. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 32,
      "book": "gelfand",
      "title": "Majority mobilisation",
      "teach": "Mobilise your majority before they blockade it.",
      "hint": "Mobilise the majority.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Majority mobilisation",
      "about": "Gelfand-style decisions — Majority mobilisation.",
      "desc": "Queenside or kingside majorities must advance with piece support. Delay lets them blockade. Start the mobilisation that creates a passer. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Mobilise the majority. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 33,
      "book": "gelfand",
      "title": "File strategy",
      "teach": "Contest open files; doubled rooks decide.",
      "hint": "Take or contest the file.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "File strategy",
      "about": "Gelfand-style decisions — File strategy.",
      "desc": "Open files are highways. Race to occupy them and double. Giving up the only open file is a positional concession Gelfand avoids. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Take or contest the file. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 34,
      "book": "gelfand",
      "title": "Bishop quality",
      "teach": "Free or trade the bad bishop; keep the good one.",
      "hint": "Fix bishop quality.",
      "fen": "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Bishop quality",
      "about": "Gelfand-style decisions — Bishop quality.",
      "desc": "Identify good vs bad bishops relative to your pawns. Free yours with a break, or trade it for their better minor. Bishop quality decisions reshape plans. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Fix bishop quality. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 35,
      "book": "gelfand",
      "title": "Knight vs bishop",
      "teach": "Match the remaining minor to the pawn skeleton.",
      "hint": "Trade toward your minor.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Knight vs bishop",
      "about": "Gelfand-style decisions — Knight vs bishop.",
      "desc": "Closed → knights; open → bishops. Make the trade that leaves you with the fitting minor. This is a classic evaluation skill in Gelfand's notes. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Trade toward your minor. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 36,
      "book": "gelfand",
      "title": "Central control",
      "teach": "Control the centre with pieces and pawns before wing play.",
      "hint": "Play through the centre.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Central control",
      "about": "Gelfand-style decisions — Central control.",
      "desc": "Wing attacks without central control invite counterbreaks. Secure or pressure the centre first, then expand on the wing. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play through the centre. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 37,
      "book": "gelfand",
      "title": "Hanging pawns handling",
      "teach": "Advance hangers with support — or restrain theirs.",
      "hint": "Handle hanging pawns.",
      "fen": "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Hanging pawns handling",
      "about": "Gelfand-style decisions — Hanging pawns handling.",
      "desc": "Hanging pawns are dynamic. Advance them when pieces support; against them, pressure and force an unfavorable push. Choose the role that matches your eval. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Handle hanging pawns. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 38,
      "book": "gelfand",
      "title": "IQP policy",
      "teach": "With IQP: activity; against IQP: blockade and trades.",
      "hint": "Play the IQP policy.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "IQP policy",
      "about": "Gelfand-style decisions — IQP policy.",
      "desc": "Isolated queen pawn play is a decision fork. If you have it, keep pieces and open lines. If they have it, blockade d5 and simplify. Follow the policy that fits. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play the IQP policy. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 39,
      "book": "gelfand",
      "title": "Opposite castling plan",
      "teach": "Race, but keep a central eye.",
      "hint": "Race with central awareness.",
      "fen": "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Opposite castling plan",
      "about": "Gelfand-style decisions — Opposite castling plan.",
      "desc": "Opposite castling plans are pawn storms plus central vigilance. Push your storm while ensuring their central break does not land first. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Race with central awareness. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 40,
      "book": "gelfand",
      "title": "Evaluation update",
      "teach": "After every structural change, re-evaluate.",
      "hint": "Update the evaluation.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 2 9",
      "goal": "win",
      "theme": "Evaluation update",
      "about": "Gelfand-style decisions — Evaluation update.",
      "desc": "A capture or pawn advance can reorder imbalances. Stop and re-rank. Playing the old plan in a new structure is a common elite-level miss — avoid it here. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Update the evaluation. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 41,
      "book": "gelfand",
      "title": "Small advantages",
      "teach": "Nurse tiny edges: better knight, safer king, cleaner structure.",
      "hint": "Nurse the tiny edge.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Small advantages",
      "about": "Gelfand-style decisions — Small advantages.",
      "desc": "Modern elite chess wins from tiny edges. Do not force. Improve gradually until the edge becomes usable. Patience is part of decision-making. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Nurse the tiny edge. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 42,
      "book": "gelfand",
      "title": "Counterplay denial",
      "teach": "Deny their counterplay before converting.",
      "hint": "Deny counterplay.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Counterplay denial",
      "about": "Gelfand-style decisions — Counterplay denial.",
      "desc": "Conversion starts by killing their ideas. A move that stops ...b5 or ...f5 can be stronger than grabbing a pawn. Deny, then convert. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Deny counterplay. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 43,
      "book": "gelfand",
      "title": "Queen placement",
      "teach": "Park the queen where she eyes both wings safely.",
      "hint": "Improve the queen.",
      "fen": "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Queen placement",
      "about": "Gelfand-style decisions — Queen placement.",
      "desc": "Queen placement is a positional decision. Centralise or shift her to a safe attacking post. Avoid squares where minor pieces constantly tempo her. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Improve the queen. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 44,
      "book": "gelfand",
      "title": "Rook lifts",
      "teach": "Lift rooks into the attack or onto the third rank.",
      "hint": "Start the rook lift.",
      "fen": "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Rook lifts",
      "about": "Gelfand-style decisions — Rook lifts.",
      "desc": "Rook lifts turn defensive rooks into attackers. If the structure allows a lift via the third rank, begin it as part of the plan. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Start the rook lift. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 45,
      "book": "gelfand",
      "title": "Flexible pawn moves",
      "teach": "Keep options (...c6/...c5) until information arrives.",
      "hint": "Stay flexible.",
      "fen": "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14",
      "goal": "win",
      "theme": "Flexible pawn moves",
      "about": "Gelfand-style decisions — Flexible pawn moves.",
      "desc": "Sometimes not pushing is the decision. Keeping both breaks available until their setup is clear is modern flexibility Gelfand respects. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Stay flexible. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 46,
      "book": "gelfand",
      "title": "Commit when ready",
      "teach": "When information is enough, commit the break.",
      "hint": "Commit now.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Commit when ready",
      "about": "Gelfand-style decisions — Commit when ready.",
      "desc": "Flexibility ends when delay helps them more. If pieces are ready and their plan is clear, commit. Indecision is also a decision — usually a bad one. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Commit now. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 47,
      "book": "gelfand",
      "title": "Material imbalance",
      "teach": "Queen vs pieces, exchange sacs — evaluate compensation honestly.",
      "hint": "Judge the imbalance.",
      "fen": "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Material imbalance",
      "about": "Gelfand-style decisions — Material imbalance.",
      "desc": "Unusual material needs honest evaluation of activity and king safety. If compensation is real and lasting, embrace it; if not, avoid or undo it. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Judge the imbalance. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 48,
      "book": "gelfand",
      "title": "Technical win path",
      "teach": "Choose the path with fewer ways to go wrong.",
      "hint": "Pick the technical path.",
      "fen": "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Technical win path",
      "about": "Gelfand-style decisions — Technical win path.",
      "desc": "Among winning plans, prefer the technical one with fewer only-moves. Practical decision-making includes risk management. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Pick the technical path. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 49,
      "book": "gelfand",
      "title": "Risk assessment",
      "teach": "Know when to complicate and when to simplify.",
      "hint": "Choose risk level.",
      "fen": "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/2N2NP1/PP2PP1P/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Risk assessment",
      "about": "Gelfand-style decisions — Risk assessment.",
      "desc": "Trailing: complicate. Leading: simplify (usually). Match risk to match situation and evaluation. That is tournament decision-making. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Choose risk level. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 50,
      "book": "gelfand",
      "title": "Gelfand synthesis",
      "teach": "Evaluate, plan, verify, play — the elite loop.",
      "hint": "Play the decision-making move.",
      "fen": "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Gelfand synthesis",
      "about": "Gelfand-style decisions — Gelfand synthesis.",
      "desc": "Synthesise Positional Decision Making: clear evaluation, plan candidates, tactical verification, practical choice. That loop produces the move on this board. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play the decision-making move. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 51,
      "book": "gelfand",
      "title": "Evaluate before planning (2)",
      "teach": "Name the imbalances before inventing a plan.",
      "hint": "Evaluate, then choose a plan.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Evaluate before planning",
      "about": "Gelfand-style decisions — Evaluate before planning.",
      "desc": "Gelfand's decision-making starts with a clear evaluation: material, structure, piece activity, king safety, and initiative. Only after that ranking do plans appear. On this board, pause and state which side is better and why, then play the move that fits that evaluation — not the first tactic that flashes. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Evaluate, then choose a plan. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 52,
      "book": "gelfand",
      "title": "Candidate plans (2)",
      "teach": "List two real plans, then pick one with concrete moves.",
      "hint": "Choose between two plans.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Candidate plans",
      "about": "Gelfand-style decisions — Candidate plans.",
      "desc": "Elite players rarely have only one idea. Gelfand often weighs two strategic directions — e.g. queenside expansion versus a central break — and chooses based on concrete feasibility. List two plans here, reject the weaker, and play the first move of the stronger. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Choose between two plans. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 53,
      "book": "gelfand",
      "title": "Transform the advantage (2)",
      "teach": "Convert one plus into an easier one.",
      "hint": "Transform your plus.",
      "fen": "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
      "goal": "win",
      "theme": "Transform the advantage",
      "about": "Gelfand-style decisions — Transform the advantage.",
      "desc": "A recurring Gelfand theme: when a static edge is hard to use, transform it into a dynamic or endgame edge you can play. Look for a trade, break, or liquidation that changes the nature of the advantage without throwing it away. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Transform your plus. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 54,
      "book": "gelfand",
      "title": "Prophylaxis first (2)",
      "teach": "Ask what they want — prevent it — then improve.",
      "hint": "Prevent their idea.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "Prophylaxis first",
      "about": "Gelfand-style decisions — Prophylaxis first.",
      "desc": "Positional Decision Making repeatedly shows prophylaxis as a positive move, not a defensive shrug. Identify their only active plan and spoil it a tempo early, then resume your own improvements. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Prevent their idea. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 55,
      "book": "gelfand",
      "title": "Worst-piece cure (2)",
      "teach": "Improve the ugliest piece before launching.",
      "hint": "Improve the worst piece.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Worst-piece cure",
      "about": "Gelfand-style decisions — Worst-piece cure.",
      "desc": "If a piece has no future, the plan starts there. Gelfand often cures a bad bishop or rim knight before tactical operations. Find the least happy unit and give it a better square. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Improve the worst piece. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 56,
      "book": "gelfand",
      "title": "Structure dictates plan (2)",
      "teach": "Let the pawn skeleton choose your breaks.",
      "hint": "Play the structure's plan.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Structure dictates plan",
      "about": "Gelfand-style decisions — Structure dictates plan.",
      "desc": "Pawn structure is the map. Isolated pawns, hanging pawns, and closed chains each suggest typical plans. Read the skeleton first, then play the thematic break or restraint that belongs to it. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play the structure's plan. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 57,
      "book": "gelfand",
      "title": "Dynamic vs static (2)",
      "teach": "Cash dynamics now; nurse static pluses patiently.",
      "hint": "Respect dynamic vs static.",
      "fen": "r1bqkb1r/pp1ppppp/2n2n2/2p5/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 4",
      "goal": "win",
      "theme": "Dynamic vs static",
      "about": "Gelfand-style decisions — Dynamic vs static.",
      "desc": "Gelfand distinguishes dynamic chances (initiative, lead in development) from static ones (better structure, bishop pair). Dynamics must be used; statics can wait. Decide which kind you have, then act accordingly. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Respect dynamic vs static. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 58,
      "book": "gelfand",
      "title": "Exchange with a reason (2)",
      "teach": "Trade only if the resulting position fits your eval.",
      "hint": "Trade on purpose.",
      "fen": "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Exchange with a reason",
      "about": "Gelfand-style decisions — Exchange with a reason.",
      "desc": "Exchanges are decisions, not habits. Before trading, ask whether the new minor-piece balance, ending, or open file favors your evaluation. Play the exchange — or decline it — with that answer. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Trade on purpose. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 59,
      "book": "gelfand",
      "title": "Space with a plan (2)",
      "teach": "Space is useless without a follow-up.",
      "hint": "Use the space.",
      "fen": "rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 6",
      "goal": "win",
      "theme": "Space with a plan",
      "about": "Gelfand-style decisions — Space with a plan.",
      "desc": "A space advantage allows regrouping. Use it to improve pieces behind the pawn wall, then break where they are cramped. Empty expansion without a follow-up is how advantages evaporate. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Use the space. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 60,
      "book": "gelfand",
      "title": "King safety override (2)",
      "teach": "Unsafe kings veto pretty positional plans.",
      "hint": "Prioritise king safety.",
      "fen": "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "King safety override",
      "about": "Gelfand-style decisions — King safety override.",
      "desc": "If either king is exposed, calculation and safety override long maneuvers. Gelfand's evaluations always include king safety as a veto. Meet threats or punish the exposed king before 'improving' on the queenside. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Prioritise king safety. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 61,
      "book": "gelfand",
      "title": "Break preparation (2)",
      "teach": "Prepare the break until tactics favor you.",
      "hint": "Prepare, then break.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Break preparation",
      "about": "Gelfand-style decisions — Break preparation.",
      "desc": "Premature breaks open lines for the opponent. Place pieces on ideal squares, then deliver the break. The preparation moves are part of the plan, not delays. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Prepare, then break. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 62,
      "book": "gelfand",
      "title": "Second weakness (2)",
      "teach": "When one target is held, create another.",
      "hint": "Open a second front.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "Second weakness",
      "about": "Gelfand-style decisions — Second weakness.",
      "desc": "Classic elite technique: one weakness can be defended forever; two stretch the defence. If they have glued themselves to a backward pawn, open play elsewhere until something drops. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Open a second front. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 63,
      "book": "gelfand",
      "title": "Practical choice (2)",
      "teach": "Among equal options, pick the harder one for them.",
      "hint": "Choose the practical try.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Practical choice",
      "about": "Gelfand-style decisions — Practical choice.",
      "desc": "Gelfand emphasises practical decision-making under tournament conditions. When two moves evaluate similarly, prefer the one that poses more problems or is easier for you to play with the clock. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Choose the practical try. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 64,
      "book": "gelfand",
      "title": "Initiative retention (2)",
      "teach": "After a concession, keep posing questions.",
      "hint": "Keep the initiative.",
      "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      "goal": "win",
      "theme": "Initiative retention",
      "about": "Gelfand-style decisions — Initiative retention.",
      "desc": "When they give ground, do not coast. Find the next annoying move that forces another concession. Initiative retention turns small edges into wins. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Keep the initiative. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 65,
      "book": "gelfand",
      "title": "Endgame transition (2)",
      "teach": "Liquidate only into endings you have evaluated.",
      "hint": "Liquidate with calculation.",
      "fen": "rnbqk2r/pp2ppbp/5np1/2pp4/3P4/2P2NP1/PP2PP1P/RNBQKB1R w KQkq - 0 6",
      "goal": "win",
      "theme": "Endgame transition",
      "about": "Gelfand-style decisions — Endgame transition.",
      "desc": "Heading for an ending is a decision. Count the resulting pawn ending or rook ending before the last trade. Gelfand converts when the ending is clear — not hopeful. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Liquidate with calculation. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 66,
      "book": "gelfand",
      "title": "Restraint (2)",
      "teach": "Restrain their breaks before attacking.",
      "hint": "Restrain first.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Restraint",
      "about": "Gelfand-style decisions — Restraint.",
      "desc": "Botvinnik-flavoured restraint appears in modern elite play too. Stop ...c5/...e5/...f5 ideas, then improve. Prevention is often the strongest 'attacking' move. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Restrain first. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 67,
      "book": "gelfand",
      "title": "Color complex (2)",
      "teach": "Dominate the soft color after the right trade.",
      "hint": "Target the color complex.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Color complex",
      "about": "Gelfand-style decisions — Color complex.",
      "desc": "Trade the defender of a complex, then occupy the holes. Gelfand's games show long sieges on dark or light squares once the right bishop is gone. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Target the color complex. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 68,
      "book": "gelfand",
      "title": "Passed pawn policy (2)",
      "teach": "Create passers that pull their pieces away.",
      "hint": "Create a useful passer.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Passed pawn policy",
      "about": "Gelfand-style decisions — Passed pawn policy.",
      "desc": "A passer is a decoy as much as a runner. Create one that forces their pieces into passivity, then strike on the opposite wing — a positional decision, not just a race. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Create a useful passer. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 69,
      "book": "gelfand",
      "title": "Quiet improving move (2)",
      "teach": "Not every position needs fireworks.",
      "hint": "Find the quiet improvement.",
      "fen": "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Quiet improving move",
      "about": "Gelfand-style decisions — Quiet improving move.",
      "desc": "Elite annotation often praises a quiet move that improves harmony. If no tactic exists, improve a piece or fix a structural detail. Calm strength is still strength. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Find the quiet improvement. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 70,
      "book": "gelfand",
      "title": "Calculation checkpoint (2)",
      "teach": "Verify the positional idea against forcing replies.",
      "hint": "Check forcing replies.",
      "fen": "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
      "goal": "win",
      "theme": "Calculation checkpoint",
      "about": "Gelfand-style decisions — Calculation checkpoint.",
      "desc": "Positional plans die to tactics. After choosing a plan move, blunder-check forcing replies. Gelfand's method is evaluation plus concrete verification — never evaluation alone. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Check forcing replies. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 71,
      "book": "gelfand",
      "title": "Imbalance ranking (2)",
      "teach": "Rank imbalances: which one decides this position?",
      "hint": "Play toward the top imbalance.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Imbalance ranking",
      "about": "Gelfand-style decisions — Imbalance ranking.",
      "desc": "List imbalances and order them. The plan should address the highest-ranked one. Playing toward a minor imbalance while ignoring a king-safety crisis is how evaluations go wrong. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play toward the top imbalance. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 72,
      "book": "gelfand",
      "title": "Piece placement ideal (2)",
      "teach": "Visualise the ideal setup, then steer toward it.",
      "hint": "Steer toward the ideal setup.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Piece placement ideal",
      "about": "Gelfand-style decisions — Piece placement ideal.",
      "desc": "Dream the best squares for your pieces, then find the move that approaches that picture. Reverse-engineering from an ideal setup is a Gelfand-style planning habit. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Steer toward the ideal setup. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 73,
      "book": "gelfand",
      "title": "Decline the gift (2)",
      "teach": "Refuse 'free' material that wrecks your structure or king.",
      "hint": "Refuse the poisoned gift.",
      "fen": "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Decline the gift",
      "about": "Gelfand-style decisions — Decline the gift.",
      "desc": "Elite players decline material that yields lasting soft squares or a lasting attack. If the gift damages your evaluation, leave it and improve. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Refuse the poisoned gift. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 74,
      "book": "gelfand",
      "title": "Active defence (2)",
      "teach": "Defend by exchanging attackers or counterpunching.",
      "hint": "Defend actively.",
      "fen": "r1bqk2r/pp1pppbp/2n2np1/2p5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5",
      "goal": "win",
      "theme": "Active defence",
      "about": "Gelfand-style decisions — Active defence.",
      "desc": "Passive defence invites a crush. Seek trades that reduce their attacking force, or counterbreaks that force them backward. Active defence is a positional decision too. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Defend actively. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 75,
      "book": "gelfand",
      "title": "Time vs structure (2)",
      "teach": "A lead in time demands opening the game.",
      "hint": "Open while ahead in time.",
      "fen": "r2q1rk1/ppp1ppbp/2np1np1/8/2PPP1b1/2N2N2/PP2BPPP/R1BQK2R w KQ - 4 8",
      "goal": "win",
      "theme": "Time vs structure",
      "about": "Gelfand-style decisions — Time vs structure.",
      "desc": "If you lead in development, open lines before they catch up. Closed play returns the gift of time. Openness converts development into concrete threats. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Open while ahead in time. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 76,
      "book": "gelfand",
      "title": "Blockade choice (2)",
      "teach": "Blockade with a piece that still attacks.",
      "hint": "Blockade actively.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Blockade choice",
      "about": "Gelfand-style decisions — Blockade choice.",
      "desc": "A pure sentry is often wrong. Place the blockader where it also eyes weaknesses. Active blockades appear throughout modern positional play. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Blockade actively. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 77,
      "book": "gelfand",
      "title": "Pawn move commitment (2)",
      "teach": "Every pawn move creates lasting holes — have a reason.",
      "hint": "Commit the pawn purposely.",
      "fen": "r1bqk2r/pppp1ppp/2n1pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Pawn move commitment",
      "about": "Gelfand-style decisions — Pawn move commitment.",
      "desc": "Pawns do not move backward. Gelfand weighs pawn advances as structural commitments. Advance when the resulting holes help you more than them. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Commit the pawn purposely. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 78,
      "book": "gelfand",
      "title": "Middlegame to ending (2)",
      "teach": "Know when the ending favors your structure.",
      "hint": "Steer to/avoid the ending.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Middlegame to ending",
      "about": "Gelfand-style decisions — Middlegame to ending.",
      "desc": "Some structures prefer endings; others need middlegame piece play. Decide whether trades help. Steering the game phase is a core positional decision. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Steer to/avoid the ending. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 79,
      "book": "gelfand",
      "title": "Pressure without rushing (2)",
      "teach": "Increase pressure until they crack — don't force.",
      "hint": "Increase the pressure.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/4R1K1 w - - 0 18",
      "goal": "win",
      "theme": "Pressure without rushing",
      "about": "Gelfand-style decisions — Pressure without rushing.",
      "desc": "Forcing a 'win' too early can throw the edge. Improve, restrain, and pile up until the defence collapses. Patient pressure is elite technique. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Increase the pressure. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 80,
      "book": "gelfand",
      "title": "Decision review (2)",
      "teach": "Evaluate → plan candidates → verify → play.",
      "hint": "Apply the decision loop.",
      "fen": "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Decision review",
      "about": "Gelfand-style decisions — Decision review.",
      "desc": "Close with Gelfand's loop: evaluate imbalances, list plan candidates, verify against tactics, then play. Positional Decision Making is a method — use it on this board. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Apply the decision loop. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 81,
      "book": "gelfand",
      "title": "Outpost creation (2)",
      "teach": "Create the hole, then occupy it.",
      "hint": "Prepare the outpost.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Outpost creation",
      "about": "Gelfand-style decisions — Outpost creation.",
      "desc": "Outposts are manufactured. Force a pawn advance that leaves a hole, then plant a knight. Creating the square is as important as occupying it. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Prepare the outpost. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 82,
      "book": "gelfand",
      "title": "Majority mobilisation (2)",
      "teach": "Mobilise your majority before they blockade it.",
      "hint": "Mobilise the majority.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Majority mobilisation",
      "about": "Gelfand-style decisions — Majority mobilisation.",
      "desc": "Queenside or kingside majorities must advance with piece support. Delay lets them blockade. Start the mobilisation that creates a passer. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Mobilise the majority. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 83,
      "book": "gelfand",
      "title": "File strategy (2)",
      "teach": "Contest open files; doubled rooks decide.",
      "hint": "Take or contest the file.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "File strategy",
      "about": "Gelfand-style decisions — File strategy.",
      "desc": "Open files are highways. Race to occupy them and double. Giving up the only open file is a positional concession Gelfand avoids. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Take or contest the file. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 84,
      "book": "gelfand",
      "title": "Bishop quality (2)",
      "teach": "Free or trade the bad bishop; keep the good one.",
      "hint": "Fix bishop quality.",
      "fen": "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Bishop quality",
      "about": "Gelfand-style decisions — Bishop quality.",
      "desc": "Identify good vs bad bishops relative to your pawns. Free yours with a break, or trade it for their better minor. Bishop quality decisions reshape plans. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Fix bishop quality. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 85,
      "book": "gelfand",
      "title": "Knight vs bishop (2)",
      "teach": "Match the remaining minor to the pawn skeleton.",
      "hint": "Trade toward your minor.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Knight vs bishop",
      "about": "Gelfand-style decisions — Knight vs bishop.",
      "desc": "Closed → knights; open → bishops. Make the trade that leaves you with the fitting minor. This is a classic evaluation skill in Gelfand's notes. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Trade toward your minor. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 86,
      "book": "gelfand",
      "title": "Central control (2)",
      "teach": "Control the centre with pieces and pawns before wing play.",
      "hint": "Play through the centre.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Central control",
      "about": "Gelfand-style decisions — Central control.",
      "desc": "Wing attacks without central control invite counterbreaks. Secure or pressure the centre first, then expand on the wing. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play through the centre. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 87,
      "book": "gelfand",
      "title": "Hanging pawns handling (2)",
      "teach": "Advance hangers with support — or restrain theirs.",
      "hint": "Handle hanging pawns.",
      "fen": "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Hanging pawns handling",
      "about": "Gelfand-style decisions — Hanging pawns handling.",
      "desc": "Hanging pawns are dynamic. Advance them when pieces support; against them, pressure and force an unfavorable push. Choose the role that matches your eval. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Handle hanging pawns. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 88,
      "book": "gelfand",
      "title": "IQP policy (2)",
      "teach": "With IQP: activity; against IQP: blockade and trades.",
      "hint": "Play the IQP policy.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "IQP policy",
      "about": "Gelfand-style decisions — IQP policy.",
      "desc": "Isolated queen pawn play is a decision fork. If you have it, keep pieces and open lines. If they have it, blockade d5 and simplify. Follow the policy that fits. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play the IQP policy. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 89,
      "book": "gelfand",
      "title": "Opposite castling plan (2)",
      "teach": "Race, but keep a central eye.",
      "hint": "Race with central awareness.",
      "fen": "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Opposite castling plan",
      "about": "Gelfand-style decisions — Opposite castling plan.",
      "desc": "Opposite castling plans are pawn storms plus central vigilance. Push your storm while ensuring their central break does not land first. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Race with central awareness. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 90,
      "book": "gelfand",
      "title": "Evaluation update (2)",
      "teach": "After every structural change, re-evaluate.",
      "hint": "Update the evaluation.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 2 9",
      "goal": "win",
      "theme": "Evaluation update",
      "about": "Gelfand-style decisions — Evaluation update.",
      "desc": "A capture or pawn advance can reorder imbalances. Stop and re-rank. Playing the old plan in a new structure is a common elite-level miss — avoid it here. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Update the evaluation. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 91,
      "book": "gelfand",
      "title": "Small advantages (2)",
      "teach": "Nurse tiny edges: better knight, safer king, cleaner structure.",
      "hint": "Nurse the tiny edge.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Small advantages",
      "about": "Gelfand-style decisions — Small advantages.",
      "desc": "Modern elite chess wins from tiny edges. Do not force. Improve gradually until the edge becomes usable. Patience is part of decision-making. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Nurse the tiny edge. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 92,
      "book": "gelfand",
      "title": "Counterplay denial (2)",
      "teach": "Deny their counterplay before converting.",
      "hint": "Deny counterplay.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Counterplay denial",
      "about": "Gelfand-style decisions — Counterplay denial.",
      "desc": "Conversion starts by killing their ideas. A move that stops ...b5 or ...f5 can be stronger than grabbing a pawn. Deny, then convert. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Deny counterplay. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 93,
      "book": "gelfand",
      "title": "Queen placement (2)",
      "teach": "Park the queen where she eyes both wings safely.",
      "hint": "Improve the queen.",
      "fen": "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Queen placement",
      "about": "Gelfand-style decisions — Queen placement.",
      "desc": "Queen placement is a positional decision. Centralise or shift her to a safe attacking post. Avoid squares where minor pieces constantly tempo her. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Improve the queen. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 94,
      "book": "gelfand",
      "title": "Rook lifts (2)",
      "teach": "Lift rooks into the attack or onto the third rank.",
      "hint": "Start the rook lift.",
      "fen": "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Rook lifts",
      "about": "Gelfand-style decisions — Rook lifts.",
      "desc": "Rook lifts turn defensive rooks into attackers. If the structure allows a lift via the third rank, begin it as part of the plan. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Start the rook lift. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 95,
      "book": "gelfand",
      "title": "Flexible pawn moves (2)",
      "teach": "Keep options (...c6/...c5) until information arrives.",
      "hint": "Stay flexible.",
      "fen": "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14",
      "goal": "win",
      "theme": "Flexible pawn moves",
      "about": "Gelfand-style decisions — Flexible pawn moves.",
      "desc": "Sometimes not pushing is the decision. Keeping both breaks available until their setup is clear is modern flexibility Gelfand respects. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Stay flexible. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 96,
      "book": "gelfand",
      "title": "Commit when ready (2)",
      "teach": "When information is enough, commit the break.",
      "hint": "Commit now.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Commit when ready",
      "about": "Gelfand-style decisions — Commit when ready.",
      "desc": "Flexibility ends when delay helps them more. If pieces are ready and their plan is clear, commit. Indecision is also a decision — usually a bad one. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Commit now. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 97,
      "book": "gelfand",
      "title": "Material imbalance (2)",
      "teach": "Queen vs pieces, exchange sacs — evaluate compensation honestly.",
      "hint": "Judge the imbalance.",
      "fen": "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Material imbalance",
      "about": "Gelfand-style decisions — Material imbalance.",
      "desc": "Unusual material needs honest evaluation of activity and king safety. If compensation is real and lasting, embrace it; if not, avoid or undo it. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Judge the imbalance. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 98,
      "book": "gelfand",
      "title": "Technical win path (2)",
      "teach": "Choose the path with fewer ways to go wrong.",
      "hint": "Pick the technical path.",
      "fen": "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Technical win path",
      "about": "Gelfand-style decisions — Technical win path.",
      "desc": "Among winning plans, prefer the technical one with fewer only-moves. Practical decision-making includes risk management. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Pick the technical path. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 99,
      "book": "gelfand",
      "title": "Risk assessment (2)",
      "teach": "Know when to complicate and when to simplify.",
      "hint": "Choose risk level.",
      "fen": "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/2N2NP1/PP2PP1P/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Risk assessment",
      "about": "Gelfand-style decisions — Risk assessment.",
      "desc": "Trailing: complicate. Leading: simplify (usually). Match risk to match situation and evaluation. That is tournament decision-making. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Choose risk level. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 100,
      "book": "gelfand",
      "title": "Gelfand synthesis (2)",
      "teach": "Evaluate, plan, verify, play — the elite loop.",
      "hint": "Play the decision-making move.",
      "fen": "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Gelfand synthesis",
      "about": "Gelfand-style decisions — Gelfand synthesis.",
      "desc": "Synthesise Positional Decision Making: clear evaluation, plan candidates, tactical verification, practical choice. That loop produces the move on this board. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play the decision-making move. (Positional Decision Making–style · elite planning ≈1900+)",
      "pitfalls": []
    },
    {
      "n": 101,
      "book": "mueller",
      "title": "Opposition basics",
      "teach": "Seize opposition to invade key squares.",
      "hint": "Take the opposition.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Opposition basics",
      "about": "Müller & Lamprecht–style endings — Opposition basics.",
      "desc": "Fundamental Chess Endings treats opposition as a basic tool in king and pawn endings. Face the kings with one square between and force them to yield. Use it to reach key squares in front of your pawn. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Take the opposition. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 102,
      "book": "mueller",
      "title": "Key squares",
      "teach": "Occupy a key square ahead of the pawn to force promotion.",
      "hint": "Go to a key square.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Key squares",
      "about": "Müller & Lamprecht–style endings — Key squares.",
      "desc": "For a given pawn, certain squares guarantee promotion if occupied by your king. Calculate which squares are key, then path your king there. Theory first, then technique. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Go to a key square. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 103,
      "book": "mueller",
      "title": "Rook behind passer",
      "teach": "Tarrasch: rooks belong behind passed pawns.",
      "hint": "Rook behind the passer.",
      "fen": "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
      "goal": "win",
      "theme": "Rook behind passer",
      "about": "Müller & Lamprecht–style endings — Rook behind passer.",
      "desc": "Whether the passer is yours or theirs, the rook is usually best behind it. Behind yours it supports the advance; behind theirs it restrains. Apply Tarrasch on this board. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Rook behind the passer. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 104,
      "book": "mueller",
      "title": "Philidor position",
      "teach": "Third-rank defence holds many R+P vs R endings.",
      "hint": "Set up Philidor.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "Philidor position",
      "about": "Müller & Lamprecht–style endings — Philidor position.",
      "desc": "The Philidor setup — rook on the third rank until the pawn reaches the sixth, then checks from behind — is a core drawing resource. Recognise when it applies and head for it. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Set up Philidor. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 105,
      "book": "mueller",
      "title": "Lucena bridge",
      "teach": "Build a bridge to shelter the king from checks.",
      "hint": "Build the Lucena bridge.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Lucena bridge",
      "about": "Müller & Lamprecht–style endings — Lucena bridge.",
      "desc": "Lucena is the fundamental winning method with rook and pawn vs rook when the pawn is far advanced. Bridge with the rook to stop checks, then promote. Know the pattern cold. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Build the Lucena bridge. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 106,
      "book": "mueller",
      "title": "Vancura idea",
      "teach": "Lateral checks and pawn attacks hold some rook-pawn endings.",
      "hint": "Use Vancura ideas.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Vancura idea",
      "about": "Müller & Lamprecht–style endings — Vancura idea.",
      "desc": "Against a rook pawn, Vancura-style lateral defence can draw. Attack the pawn from the side while checking. Fundamental references treat this as must-know theory. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Use Vancura ideas. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 107,
      "book": "mueller",
      "title": "Short-side defence",
      "teach": "King to the short side; rook checks from the long side.",
      "hint": "King to the short side.",
      "fen": "r1bqkb1r/pp1ppppp/2n2n2/2p5/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 4",
      "goal": "win",
      "theme": "Short-side defence",
      "about": "Müller & Lamprecht–style endings — Short-side defence.",
      "desc": "In many rook endings, the defending king belongs on the short side of the pawn so the rook has checking distance on the long side. Apply that geometry here. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: King to the short side. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 108,
      "book": "mueller",
      "title": "Checking distance",
      "teach": "Maintain enough distance for perpetual side checks.",
      "hint": "Keep checking distance.",
      "fen": "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Checking distance",
      "about": "Müller & Lamprecht–style endings — Checking distance.",
      "desc": "If the checking distance shrinks, the ending may tip from draw to loss. Keep the rook far enough that the king cannot approach with tempo. Distance is theoretical oxygen. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Keep checking distance. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 109,
      "book": "mueller",
      "title": "Pawn endings first",
      "teach": "Before trading into a pawn ending, calculate it fully.",
      "hint": "Calculate the pawn ending.",
      "fen": "rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 6",
      "goal": "win",
      "theme": "Pawn endings first",
      "about": "Müller & Lamprecht–style endings — Pawn endings first.",
      "desc": "Müller & Lamprecht emphasise that pawn endings are the foundation. Count tempi, opposition, and outside passers before the last piece trade. Irreversible means calculated. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Calculate the pawn ending. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 110,
      "book": "mueller",
      "title": "Outside passed pawn",
      "teach": "Decoy their king with the outside passer.",
      "hint": "Push the outside passer.",
      "fen": "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Outside passed pawn",
      "about": "Müller & Lamprecht–style endings — Outside passed pawn.",
      "desc": "An outside passer pulls the enemy king away so your king feasts on the other wing. Create or advance it with that decoy plan in mind. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Push the outside passer. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 111,
      "book": "mueller",
      "title": "Protected passer",
      "teach": "A protected passer freezes their king — invade elsewhere.",
      "hint": "Use the protected passer.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Protected passer",
      "about": "Müller & Lamprecht–style endings — Protected passer.",
      "desc": "Protected passed pawns restrain. While they babysit, invade on the opposite side. Theory values this highly in king and pawn and minor-piece endings. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Use the protected passer. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 112,
      "book": "mueller",
      "title": "Wrong bishop",
      "teach": "Bishop that misses the rook-pawn's promotion square = draw.",
      "hint": "Recognise wrong bishop.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "Wrong bishop",
      "about": "Müller & Lamprecht–style endings — Wrong bishop.",
      "desc": "The classic draw: bishop of the wrong colour with a rook pawn. Do not play for a win that theory says is drawn; or force them into it when defending. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Recognise wrong bishop. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 113,
      "book": "mueller",
      "title": "Bishop vs knight",
      "teach": "Open positions favor bishops; closed favor knights.",
      "hint": "Play to your minor.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Bishop vs knight",
      "about": "Müller & Lamprecht–style endings — Bishop vs knight.",
      "desc": "Fundamental guides compare minor pieces by structure. Open the position for bishops; keep it closed for knights. Steer the pawn skeleton accordingly. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play to your minor. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 114,
      "book": "mueller",
      "title": "Opposite bishops",
      "teach": "Attacking chances with opposite bishops; blockades for draws.",
      "hint": "Use opposite-bishop themes.",
      "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      "goal": "win",
      "theme": "Opposite bishops",
      "about": "Müller & Lamprecht–style endings — Opposite bishops.",
      "desc": "Opposite-coloured bishops: with other pieces, attack; in pure endings, blockade on your colour for draws. Choose the interpretation that fits the material. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Use opposite-bishop themes. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 115,
      "book": "mueller",
      "title": "Queen endings checks",
      "teach": "Centralise the queen; watch perpetual checks.",
      "hint": "Centralise / avoid perpetual.",
      "fen": "rnbqk2r/pp2ppbp/5np1/2pp4/3P4/2P2NP1/PP2PP1P/RNBQKB1R w KQkq - 0 6",
      "goal": "win",
      "theme": "Queen endings checks",
      "about": "Müller & Lamprecht–style endings — Queen endings checks.",
      "desc": "Queen endings are check-heavy. Centralise your queen for forks and mating nets, and calculate perpetual resources when defending. Theory is concrete here. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Centralise / avoid perpetual. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 116,
      "book": "mueller",
      "title": "Rook activity",
      "teach": "Activity often beats a pawn in rook endings.",
      "hint": "Activate the rook.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Rook activity",
      "about": "Müller & Lamprecht–style endings — Rook activity.",
      "desc": "Passive rooks lose more endings than missing pawns. Activate even at material cost when the resulting activity holds or wins. This is a fundamental practical rule. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Activate the rook. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 117,
      "book": "mueller",
      "title": "Cut off the king",
      "teach": "Cut the enemy king along a rank or file permanently.",
      "hint": "Cut the king off.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Cut off the king",
      "about": "Müller & Lamprecht–style endings — Cut off the king.",
      "desc": "A rook cut-off can be worth a pawn. Place the rook so the king cannot cross. Many theoretical wins begin with a lasting cut-off. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Cut the king off. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 118,
      "book": "mueller",
      "title": "Connected passers",
      "teach": "Connected passers on the sixth are usually decisive.",
      "hint": "Advance connected passers.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Connected passers",
      "about": "Müller & Lamprecht–style endings — Connected passers.",
      "desc": "Connected passed pawns support each other. Advance them carefully to the sixth where theory often says the win is clear. Coordination over blind rushing. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Advance connected passers. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 119,
      "book": "mueller",
      "title": "Split passers",
      "teach": "Two split passers stretch the defending king.",
      "hint": "Advance the farther passer.",
      "fen": "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Split passers",
      "about": "Müller & Lamprecht–style endings — Split passers.",
      "desc": "Split passers force the king to choose. Advance the one that maximises decoy distance. Fundamental technique in pawn and rook endings. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Advance the farther passer. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 120,
      "book": "mueller",
      "title": "Knight endings forks",
      "teach": "Knights live on short-range tactics and outposts.",
      "hint": "Use fork nets / outposts.",
      "fen": "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
      "goal": "win",
      "theme": "Knight endings forks",
      "about": "Müller & Lamprecht–style endings — Knight endings forks.",
      "desc": "Knight endings reward outposts and fork awareness. Domination of the enemy knight is a recurring theoretical theme. Restrict flight squares. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Use fork nets / outposts. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 121,
      "book": "mueller",
      "title": "Bishop endings breakthroughs",
      "teach": "Same-colour bishop endings need a second weakness.",
      "hint": "Create a second weakness.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Bishop endings breakthroughs",
      "about": "Müller & Lamprecht–style endings — Bishop endings breakthroughs.",
      "desc": "With same-colour bishops, one weakness may be holdable. Create a second front — another pawn target or king invasion — as the winning method. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Create a second weakness. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 122,
      "book": "mueller",
      "title": "Rook pawn exceptions",
      "teach": "Rook pawns change key-square geometry.",
      "hint": "Apply rook-pawn rules.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Rook pawn exceptions",
      "about": "Müller & Lamprecht–style endings — Rook pawn exceptions.",
      "desc": "a- and h-pawns have special drawing tendencies. Know the exceptions before pushing. Fundamental Chess Endings flags these constantly. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Apply rook-pawn rules. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 123,
      "book": "mueller",
      "title": "Stalemate resources",
      "teach": "Stalemate saves 'lost' endings — calculate them.",
      "hint": "Use/avoid stalemate.",
      "fen": "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Stalemate resources",
      "about": "Müller & Lamprecht–style endings — Stalemate resources.",
      "desc": "Theoretical draws include stalemate traps. When winning, leave them a legal move; when losing, fish for stalemate. Bookkeeping of legal moves matters. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Use/avoid stalemate. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 124,
      "book": "mueller",
      "title": "Fortress recognition",
      "teach": "Some fortresses hold vs extra material — know them.",
      "hint": "Build or break the fortress.",
      "fen": "r1bqk2r/pp1pppbp/2n2np1/2p5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5",
      "goal": "win",
      "theme": "Fortress recognition",
      "about": "Müller & Lamprecht–style endings — Fortress recognition.",
      "desc": "Fortresses appear across fundamental theory: knight or bishop blockades that cannot be breached. Recognise when to stop trying to win, or how to break one. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Build or break the fortress. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 125,
      "book": "mueller",
      "title": "Triangulation",
      "teach": "Lose a tempo on purpose to put them in zugzwang.",
      "hint": "Triangulate.",
      "fen": "r2q1rk1/ppp1ppbp/2np1np1/8/2PPP1b1/2N2N2/PP2BPPP/R1BQK2R w KQ - 4 8",
      "goal": "win",
      "theme": "Triangulation",
      "about": "Müller & Lamprecht–style endings — Triangulation.",
      "desc": "Triangulation appears in pawn endings and some minor-piece endings. Lose a move so the same position appears with them to play. Zugzwang follows. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Triangulate. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 126,
      "book": "mueller",
      "title": "Corresponding squares",
      "teach": "Some squares correspond — step onto the right one.",
      "hint": "Take the corresponding square.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Corresponding squares",
      "about": "Müller & Lamprecht–style endings — Corresponding squares.",
      "desc": "Advanced pawn-ending theory uses corresponding squares. Treat it practically: occupy the square that mirrors theirs and maintains opposition-like control. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Take the corresponding square. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 127,
      "book": "mueller",
      "title": "Queen vs rook",
      "teach": "Queen usually wins — avoid perpetual and fortress tries.",
      "hint": "Convert Q vs R carefully.",
      "fen": "r1bqk2r/pppp1ppp/2n1pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Queen vs rook",
      "about": "Müller & Lamprecht–style endings — Queen vs rook.",
      "desc": "Theoretical queen vs rook wins require care against perpetual checks and stalemate. Drive the king to the edge and coordinate carefully. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Convert Q vs R carefully. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 128,
      "book": "mueller",
      "title": "Two bishops mate",
      "teach": "Shrink the box with coordinated bishops.",
      "hint": "Shrink the king's box.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Two bishops mate",
      "about": "Müller & Lamprecht–style endings — Two bishops mate.",
      "desc": "Two bishops mate is fundamental technique. Coordinate to shrink the king's box toward a corner. No need for brilliance — just method. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Shrink the king's box. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 129,
      "book": "mueller",
      "title": "Bishop and knight mate",
      "teach": "Drive to the corner of the bishop's colour.",
      "hint": "Drive to the right corner.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/4R1K1 w - - 0 18",
      "goal": "win",
      "theme": "Bishop and knight mate",
      "about": "Müller & Lamprecht–style endings — Bishop and knight mate.",
      "desc": "B+N mate requires driving the king to the correct corner. Know the direction and the restraining net. This is reference-book technique under pressure. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Drive to the right corner. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 130,
      "book": "mueller",
      "title": "Technical review",
      "teach": "Theory plus calculation — the fundamental method.",
      "hint": "Play the theoretical move.",
      "fen": "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Technical review",
      "about": "Müller & Lamprecht–style endings — Technical review.",
      "desc": "Fundamental Chess Endings is a reference: recognise the pattern (Philidor, Lucena, opposition), then execute precisely. Pattern first, move second. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play the theoretical move. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 131,
      "book": "mueller",
      "title": "Frontal checks",
      "teach": "Frontal checks work when the pawn is far enough.",
      "hint": "Check from the front.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Frontal checks",
      "about": "Müller & Lamprecht–style endings — Frontal checks.",
      "desc": "In some rook endings, frontal checks hold if distance is sufficient. Know when frontal defence works versus when you need the long side. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Check from the front. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 132,
      "book": "mueller",
      "title": "Umbrella technique",
      "teach": "Use a pawn as shelter against rook checks.",
      "hint": "Use the umbrella.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Umbrella technique",
      "about": "Müller & Lamprecht–style endings — Umbrella technique.",
      "desc": "When escorting a passer, a pawn can umbrella the king from checks. Sheltering technique converts many theoretical wins. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Use the umbrella. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 133,
      "book": "mueller",
      "title": "Bodycheck",
      "teach": "Shoulder the enemy king away from the action.",
      "hint": "Shoulder the king.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Bodycheck",
      "about": "Müller & Lamprecht–style endings — Bodycheck.",
      "desc": "Shouldering appears in pawn and rook endings. Place your king so theirs cannot approach key squares. Geometry over reckoning alone. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Shoulder the king. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 134,
      "book": "mueller",
      "title": "Reserve tempi",
      "teach": "Spare pawn moves win opposition fights.",
      "hint": "Use a reserve tempo.",
      "fen": "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Reserve tempi",
      "about": "Müller & Lamprecht–style endings — Reserve tempi.",
      "desc": "A spare pawn tempo can steal the opposition. Do not push every pawn early — keep a tempo in reserve for the critical moment. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Use a reserve tempo. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 135,
      "book": "mueller",
      "title": "Rook vs pawns",
      "teach": "Know when pawns beat a rook — and when they don't.",
      "hint": "Calculate rook vs pawns.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Rook vs pawns",
      "about": "Müller & Lamprecht–style endings — Rook vs pawns.",
      "desc": "Connected pawns on the sixth can outweigh a rook. Calculate races precisely using fundamental guidelines rather than hope. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Calculate rook vs pawns. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 136,
      "book": "mueller",
      "title": "Minor piece vs pawns",
      "teach": "Blockade passers from the front when possible.",
      "hint": "Blockade the passer.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Minor piece vs pawns",
      "about": "Müller & Lamprecht–style endings — Minor piece vs pawns.",
      "desc": "Knights and bishops stop passers differently. Prefer blockades that cannot be easily driven off. Theory prefers stable blockades. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Blockade the passer. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 137,
      "book": "mueller",
      "title": "Queen vs pawns",
      "teach": "Queen stops passers with checks from behind.",
      "hint": "Check and restrain.",
      "fen": "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Queen vs pawns",
      "about": "Müller & Lamprecht–style endings — Queen vs pawns.",
      "desc": "Queen vs advanced pawns: check from the rear and pick them up. Know the dangerous ranks where pawns become unstoppable without checks. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Check and restrain. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 138,
      "book": "mueller",
      "title": "Lucena prep",
      "teach": "Get the king out and prepare the bridge.",
      "hint": "Prepare Lucena.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Lucena prep",
      "about": "Müller & Lamprecht–style endings — Lucena prep.",
      "desc": "Before the bridge, the king must step out and the rook must cut. Preparation moves are part of the Lucena method — do not rush the pawn alone. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Prepare Lucena. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 139,
      "book": "mueller",
      "title": "Philidor timing",
      "teach": "Wait on the third; check from behind at the sixth.",
      "hint": "Time the Philidor switch.",
      "fen": "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Philidor timing",
      "about": "Müller & Lamprecht–style endings — Philidor timing.",
      "desc": "Switching too early from the third rank loses the draw. Wait until the pawn reaches the sixth, then check from behind. Timing is the theory. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Time the Philidor switch. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 140,
      "book": "mueller",
      "title": "Active king ending",
      "teach": "In pure pawn endings the king is an attacker.",
      "hint": "Activate the king.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 2 9",
      "goal": "win",
      "theme": "Active king ending",
      "about": "Müller & Lamprecht–style endings — Active king ending.",
      "desc": "Activate the king toward key squares immediately. Passive kings lose fundamental pawn endings. Pathing matters as much as opposition. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Activate the king. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 141,
      "book": "mueller",
      "title": "Pawn breakthrough",
      "teach": "Sacrificial breakthroughs appear in pawn theories.",
      "hint": "Breakthrough now.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Pawn breakthrough",
      "about": "Müller & Lamprecht–style endings — Pawn breakthrough.",
      "desc": "Classic breakthrough shapes recur in manuals. Calculate whether the sac creates an unstoppable passer. Pattern recognition helps. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Breakthrough now. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 142,
      "book": "mueller",
      "title": "Drawn rook ending",
      "teach": "Recognise known drawing setups and head for them.",
      "hint": "Head for the known draw.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Drawn rook ending",
      "about": "Müller & Lamprecht–style endings — Drawn rook ending.",
      "desc": "When defending, steer toward Philidor, Vancura, or sufficient checking distance. Known draws are better than inventive losses. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Head for the known draw. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 143,
      "book": "mueller",
      "title": "Winning rook ending",
      "teach": "Recognise known wins — Lucena, cut-offs, activity.",
      "hint": "Head for the known win.",
      "fen": "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Winning rook ending",
      "about": "Müller & Lamprecht–style endings — Winning rook ending.",
      "desc": "When winning, steer toward Lucena or a decisive cut-off. Do not wander into a drawing setup. Theory is a map to the win. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Head for the known win. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 144,
      "book": "mueller",
      "title": "Knight domination",
      "teach": "Dominate a knight so it has no safe squares.",
      "hint": "Dominate the knight.",
      "fen": "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Knight domination",
      "about": "Müller & Lamprecht–style endings — Knight domination.",
      "desc": "Domination motifs convert knight endings. Take away jumps, then zugzwang. Fundamental technique with short-range pieces. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Dominate the knight. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 145,
      "book": "mueller",
      "title": "Bishop skewer nets",
      "teach": "Align king and piece for a skewer on a diagonal.",
      "hint": "Set the skewer.",
      "fen": "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14",
      "goal": "win",
      "theme": "Bishop skewer nets",
      "about": "Müller & Lamprecht–style endings — Bishop skewer nets.",
      "desc": "Bishop endings and queen endings use skewers. Align valuables and force the win of material. Geometry is theory. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Set the skewer. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 146,
      "book": "mueller",
      "title": "Promotion tactics",
      "teach": "Underpromotion and tempo promotions decide endings.",
      "hint": "Promote with purpose.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Promotion tactics",
      "about": "Müller & Lamprecht–style endings — Promotion tactics.",
      "desc": "Sometimes promote to a knight or delay promotion to avoid stalemate. Fundamental manuals insist on purposeful promotion. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Promote with purpose. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 147,
      "book": "mueller",
      "title": "Zugzwang nets",
      "teach": "Put them where every move loses.",
      "hint": "Force zugzwang.",
      "fen": "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Zugzwang nets",
      "about": "Müller & Lamprecht–style endings — Zugzwang nets.",
      "desc": "Zugzwang is the soul of many fundamental endings. Restrict until every pawn or king move collapses the defence. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Force zugzwang. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 148,
      "book": "mueller",
      "title": "Tablebase mindset",
      "teach": "Play the move theory would play — precision over style.",
      "hint": "Play the precise move.",
      "fen": "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Tablebase mindset",
      "about": "Müller & Lamprecht–style endings — Tablebase mindset.",
      "desc": "Reference endings reward precision. Choose the theoretically correct move even if a flashier one 'feels' winning. Accuracy first. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play the precise move. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 149,
      "book": "mueller",
      "title": "Conversion care",
      "teach": "Avoid stalemate and perpetual while converting.",
      "hint": "Convert carefully.",
      "fen": "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/2N2NP1/PP2PP1P/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Conversion care",
      "about": "Müller & Lamprecht–style endings — Conversion care.",
      "desc": "Winning endings are lost to stalemate and perpetual. Leave flight squares, cover checks, then promote. Care is fundamental. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Convert carefully. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 150,
      "book": "mueller",
      "title": "Manual review",
      "teach": "Pattern → path → precision.",
      "hint": "Play the reference move.",
      "fen": "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Manual review",
      "about": "Müller & Lamprecht–style endings — Manual review.",
      "desc": "Synthesise Fundamental Chess Endings: recognise the pattern, path the pieces, execute precisely. That is the move here. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play the reference move. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 151,
      "book": "mueller",
      "title": "Opposition basics (2)",
      "teach": "Seize opposition to invade key squares.",
      "hint": "Take the opposition.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Opposition basics",
      "about": "Müller & Lamprecht–style endings — Opposition basics.",
      "desc": "Fundamental Chess Endings treats opposition as a basic tool in king and pawn endings. Face the kings with one square between and force them to yield. Use it to reach key squares in front of your pawn. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Take the opposition. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 152,
      "book": "mueller",
      "title": "Key squares (2)",
      "teach": "Occupy a key square ahead of the pawn to force promotion.",
      "hint": "Go to a key square.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Key squares",
      "about": "Müller & Lamprecht–style endings — Key squares.",
      "desc": "For a given pawn, certain squares guarantee promotion if occupied by your king. Calculate which squares are key, then path your king there. Theory first, then technique. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Go to a key square. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 153,
      "book": "mueller",
      "title": "Rook behind passer (2)",
      "teach": "Tarrasch: rooks belong behind passed pawns.",
      "hint": "Rook behind the passer.",
      "fen": "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
      "goal": "win",
      "theme": "Rook behind passer",
      "about": "Müller & Lamprecht–style endings — Rook behind passer.",
      "desc": "Whether the passer is yours or theirs, the rook is usually best behind it. Behind yours it supports the advance; behind theirs it restrains. Apply Tarrasch on this board. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Rook behind the passer. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 154,
      "book": "mueller",
      "title": "Philidor position (2)",
      "teach": "Third-rank defence holds many R+P vs R endings.",
      "hint": "Set up Philidor.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "Philidor position",
      "about": "Müller & Lamprecht–style endings — Philidor position.",
      "desc": "The Philidor setup — rook on the third rank until the pawn reaches the sixth, then checks from behind — is a core drawing resource. Recognise when it applies and head for it. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Set up Philidor. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 155,
      "book": "mueller",
      "title": "Lucena bridge (2)",
      "teach": "Build a bridge to shelter the king from checks.",
      "hint": "Build the Lucena bridge.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Lucena bridge",
      "about": "Müller & Lamprecht–style endings — Lucena bridge.",
      "desc": "Lucena is the fundamental winning method with rook and pawn vs rook when the pawn is far advanced. Bridge with the rook to stop checks, then promote. Know the pattern cold. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Build the Lucena bridge. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 156,
      "book": "mueller",
      "title": "Vancura idea (2)",
      "teach": "Lateral checks and pawn attacks hold some rook-pawn endings.",
      "hint": "Use Vancura ideas.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Vancura idea",
      "about": "Müller & Lamprecht–style endings — Vancura idea.",
      "desc": "Against a rook pawn, Vancura-style lateral defence can draw. Attack the pawn from the side while checking. Fundamental references treat this as must-know theory. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Use Vancura ideas. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 157,
      "book": "mueller",
      "title": "Short-side defence (2)",
      "teach": "King to the short side; rook checks from the long side.",
      "hint": "King to the short side.",
      "fen": "r1bqkb1r/pp1ppppp/2n2n2/2p5/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 4",
      "goal": "win",
      "theme": "Short-side defence",
      "about": "Müller & Lamprecht–style endings — Short-side defence.",
      "desc": "In many rook endings, the defending king belongs on the short side of the pawn so the rook has checking distance on the long side. Apply that geometry here. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: King to the short side. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 158,
      "book": "mueller",
      "title": "Checking distance (2)",
      "teach": "Maintain enough distance for perpetual side checks.",
      "hint": "Keep checking distance.",
      "fen": "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Checking distance",
      "about": "Müller & Lamprecht–style endings — Checking distance.",
      "desc": "If the checking distance shrinks, the ending may tip from draw to loss. Keep the rook far enough that the king cannot approach with tempo. Distance is theoretical oxygen. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Keep checking distance. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 159,
      "book": "mueller",
      "title": "Pawn endings first (2)",
      "teach": "Before trading into a pawn ending, calculate it fully.",
      "hint": "Calculate the pawn ending.",
      "fen": "rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 6",
      "goal": "win",
      "theme": "Pawn endings first",
      "about": "Müller & Lamprecht–style endings — Pawn endings first.",
      "desc": "Müller & Lamprecht emphasise that pawn endings are the foundation. Count tempi, opposition, and outside passers before the last piece trade. Irreversible means calculated. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Calculate the pawn ending. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 160,
      "book": "mueller",
      "title": "Outside passed pawn (2)",
      "teach": "Decoy their king with the outside passer.",
      "hint": "Push the outside passer.",
      "fen": "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Outside passed pawn",
      "about": "Müller & Lamprecht–style endings — Outside passed pawn.",
      "desc": "An outside passer pulls the enemy king away so your king feasts on the other wing. Create or advance it with that decoy plan in mind. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Push the outside passer. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 161,
      "book": "mueller",
      "title": "Protected passer (2)",
      "teach": "A protected passer freezes their king — invade elsewhere.",
      "hint": "Use the protected passer.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Protected passer",
      "about": "Müller & Lamprecht–style endings — Protected passer.",
      "desc": "Protected passed pawns restrain. While they babysit, invade on the opposite side. Theory values this highly in king and pawn and minor-piece endings. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Use the protected passer. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 162,
      "book": "mueller",
      "title": "Wrong bishop (2)",
      "teach": "Bishop that misses the rook-pawn's promotion square = draw.",
      "hint": "Recognise wrong bishop.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "Wrong bishop",
      "about": "Müller & Lamprecht–style endings — Wrong bishop.",
      "desc": "The classic draw: bishop of the wrong colour with a rook pawn. Do not play for a win that theory says is drawn; or force them into it when defending. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Recognise wrong bishop. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 163,
      "book": "mueller",
      "title": "Bishop vs knight (2)",
      "teach": "Open positions favor bishops; closed favor knights.",
      "hint": "Play to your minor.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Bishop vs knight",
      "about": "Müller & Lamprecht–style endings — Bishop vs knight.",
      "desc": "Fundamental guides compare minor pieces by structure. Open the position for bishops; keep it closed for knights. Steer the pawn skeleton accordingly. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play to your minor. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 164,
      "book": "mueller",
      "title": "Opposite bishops (2)",
      "teach": "Attacking chances with opposite bishops; blockades for draws.",
      "hint": "Use opposite-bishop themes.",
      "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      "goal": "win",
      "theme": "Opposite bishops",
      "about": "Müller & Lamprecht–style endings — Opposite bishops.",
      "desc": "Opposite-coloured bishops: with other pieces, attack; in pure endings, blockade on your colour for draws. Choose the interpretation that fits the material. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Use opposite-bishop themes. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 165,
      "book": "mueller",
      "title": "Queen endings checks (2)",
      "teach": "Centralise the queen; watch perpetual checks.",
      "hint": "Centralise / avoid perpetual.",
      "fen": "rnbqk2r/pp2ppbp/5np1/2pp4/3P4/2P2NP1/PP2PP1P/RNBQKB1R w KQkq - 0 6",
      "goal": "win",
      "theme": "Queen endings checks",
      "about": "Müller & Lamprecht–style endings — Queen endings checks.",
      "desc": "Queen endings are check-heavy. Centralise your queen for forks and mating nets, and calculate perpetual resources when defending. Theory is concrete here. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Centralise / avoid perpetual. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 166,
      "book": "mueller",
      "title": "Rook activity (2)",
      "teach": "Activity often beats a pawn in rook endings.",
      "hint": "Activate the rook.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Rook activity",
      "about": "Müller & Lamprecht–style endings — Rook activity.",
      "desc": "Passive rooks lose more endings than missing pawns. Activate even at material cost when the resulting activity holds or wins. This is a fundamental practical rule. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Activate the rook. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 167,
      "book": "mueller",
      "title": "Cut off the king (2)",
      "teach": "Cut the enemy king along a rank or file permanently.",
      "hint": "Cut the king off.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Cut off the king",
      "about": "Müller & Lamprecht–style endings — Cut off the king.",
      "desc": "A rook cut-off can be worth a pawn. Place the rook so the king cannot cross. Many theoretical wins begin with a lasting cut-off. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Cut the king off. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 168,
      "book": "mueller",
      "title": "Connected passers (2)",
      "teach": "Connected passers on the sixth are usually decisive.",
      "hint": "Advance connected passers.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Connected passers",
      "about": "Müller & Lamprecht–style endings — Connected passers.",
      "desc": "Connected passed pawns support each other. Advance them carefully to the sixth where theory often says the win is clear. Coordination over blind rushing. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Advance connected passers. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 169,
      "book": "mueller",
      "title": "Split passers (2)",
      "teach": "Two split passers stretch the defending king.",
      "hint": "Advance the farther passer.",
      "fen": "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Split passers",
      "about": "Müller & Lamprecht–style endings — Split passers.",
      "desc": "Split passers force the king to choose. Advance the one that maximises decoy distance. Fundamental technique in pawn and rook endings. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Advance the farther passer. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 170,
      "book": "mueller",
      "title": "Knight endings forks (2)",
      "teach": "Knights live on short-range tactics and outposts.",
      "hint": "Use fork nets / outposts.",
      "fen": "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
      "goal": "win",
      "theme": "Knight endings forks",
      "about": "Müller & Lamprecht–style endings — Knight endings forks.",
      "desc": "Knight endings reward outposts and fork awareness. Domination of the enemy knight is a recurring theoretical theme. Restrict flight squares. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Use fork nets / outposts. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 171,
      "book": "mueller",
      "title": "Bishop endings breakthroughs (2)",
      "teach": "Same-colour bishop endings need a second weakness.",
      "hint": "Create a second weakness.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Bishop endings breakthroughs",
      "about": "Müller & Lamprecht–style endings — Bishop endings breakthroughs.",
      "desc": "With same-colour bishops, one weakness may be holdable. Create a second front — another pawn target or king invasion — as the winning method. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Create a second weakness. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 172,
      "book": "mueller",
      "title": "Rook pawn exceptions (2)",
      "teach": "Rook pawns change key-square geometry.",
      "hint": "Apply rook-pawn rules.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Rook pawn exceptions",
      "about": "Müller & Lamprecht–style endings — Rook pawn exceptions.",
      "desc": "a- and h-pawns have special drawing tendencies. Know the exceptions before pushing. Fundamental Chess Endings flags these constantly. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Apply rook-pawn rules. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 173,
      "book": "mueller",
      "title": "Stalemate resources (2)",
      "teach": "Stalemate saves 'lost' endings — calculate them.",
      "hint": "Use/avoid stalemate.",
      "fen": "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Stalemate resources",
      "about": "Müller & Lamprecht–style endings — Stalemate resources.",
      "desc": "Theoretical draws include stalemate traps. When winning, leave them a legal move; when losing, fish for stalemate. Bookkeeping of legal moves matters. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Use/avoid stalemate. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 174,
      "book": "mueller",
      "title": "Fortress recognition (2)",
      "teach": "Some fortresses hold vs extra material — know them.",
      "hint": "Build or break the fortress.",
      "fen": "r1bqk2r/pp1pppbp/2n2np1/2p5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5",
      "goal": "win",
      "theme": "Fortress recognition",
      "about": "Müller & Lamprecht–style endings — Fortress recognition.",
      "desc": "Fortresses appear across fundamental theory: knight or bishop blockades that cannot be breached. Recognise when to stop trying to win, or how to break one. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Build or break the fortress. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 175,
      "book": "mueller",
      "title": "Triangulation (2)",
      "teach": "Lose a tempo on purpose to put them in zugzwang.",
      "hint": "Triangulate.",
      "fen": "r2q1rk1/ppp1ppbp/2np1np1/8/2PPP1b1/2N2N2/PP2BPPP/R1BQK2R w KQ - 4 8",
      "goal": "win",
      "theme": "Triangulation",
      "about": "Müller & Lamprecht–style endings — Triangulation.",
      "desc": "Triangulation appears in pawn endings and some minor-piece endings. Lose a move so the same position appears with them to play. Zugzwang follows. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Triangulate. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 176,
      "book": "mueller",
      "title": "Corresponding squares (2)",
      "teach": "Some squares correspond — step onto the right one.",
      "hint": "Take the corresponding square.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Corresponding squares",
      "about": "Müller & Lamprecht–style endings — Corresponding squares.",
      "desc": "Advanced pawn-ending theory uses corresponding squares. Treat it practically: occupy the square that mirrors theirs and maintains opposition-like control. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Take the corresponding square. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 177,
      "book": "mueller",
      "title": "Queen vs rook (2)",
      "teach": "Queen usually wins — avoid perpetual and fortress tries.",
      "hint": "Convert Q vs R carefully.",
      "fen": "r1bqk2r/pppp1ppp/2n1pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Queen vs rook",
      "about": "Müller & Lamprecht–style endings — Queen vs rook.",
      "desc": "Theoretical queen vs rook wins require care against perpetual checks and stalemate. Drive the king to the edge and coordinate carefully. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Convert Q vs R carefully. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 178,
      "book": "mueller",
      "title": "Two bishops mate (2)",
      "teach": "Shrink the box with coordinated bishops.",
      "hint": "Shrink the king's box.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Two bishops mate",
      "about": "Müller & Lamprecht–style endings — Two bishops mate.",
      "desc": "Two bishops mate is fundamental technique. Coordinate to shrink the king's box toward a corner. No need for brilliance — just method. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Shrink the king's box. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 179,
      "book": "mueller",
      "title": "Bishop and knight mate (2)",
      "teach": "Drive to the corner of the bishop's colour.",
      "hint": "Drive to the right corner.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/4R1K1 w - - 0 18",
      "goal": "win",
      "theme": "Bishop and knight mate",
      "about": "Müller & Lamprecht–style endings — Bishop and knight mate.",
      "desc": "B+N mate requires driving the king to the correct corner. Know the direction and the restraining net. This is reference-book technique under pressure. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Drive to the right corner. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 180,
      "book": "mueller",
      "title": "Technical review (2)",
      "teach": "Theory plus calculation — the fundamental method.",
      "hint": "Play the theoretical move.",
      "fen": "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Technical review",
      "about": "Müller & Lamprecht–style endings — Technical review.",
      "desc": "Fundamental Chess Endings is a reference: recognise the pattern (Philidor, Lucena, opposition), then execute precisely. Pattern first, move second. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play the theoretical move. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 181,
      "book": "mueller",
      "title": "Frontal checks (2)",
      "teach": "Frontal checks work when the pawn is far enough.",
      "hint": "Check from the front.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Frontal checks",
      "about": "Müller & Lamprecht–style endings — Frontal checks.",
      "desc": "In some rook endings, frontal checks hold if distance is sufficient. Know when frontal defence works versus when you need the long side. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Check from the front. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 182,
      "book": "mueller",
      "title": "Umbrella technique (2)",
      "teach": "Use a pawn as shelter against rook checks.",
      "hint": "Use the umbrella.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Umbrella technique",
      "about": "Müller & Lamprecht–style endings — Umbrella technique.",
      "desc": "When escorting a passer, a pawn can umbrella the king from checks. Sheltering technique converts many theoretical wins. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Use the umbrella. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 183,
      "book": "mueller",
      "title": "Bodycheck (2)",
      "teach": "Shoulder the enemy king away from the action.",
      "hint": "Shoulder the king.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Bodycheck",
      "about": "Müller & Lamprecht–style endings — Bodycheck.",
      "desc": "Shouldering appears in pawn and rook endings. Place your king so theirs cannot approach key squares. Geometry over reckoning alone. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Shoulder the king. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 184,
      "book": "mueller",
      "title": "Reserve tempi (2)",
      "teach": "Spare pawn moves win opposition fights.",
      "hint": "Use a reserve tempo.",
      "fen": "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Reserve tempi",
      "about": "Müller & Lamprecht–style endings — Reserve tempi.",
      "desc": "A spare pawn tempo can steal the opposition. Do not push every pawn early — keep a tempo in reserve for the critical moment. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Use a reserve tempo. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 185,
      "book": "mueller",
      "title": "Rook vs pawns (2)",
      "teach": "Know when pawns beat a rook — and when they don't.",
      "hint": "Calculate rook vs pawns.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Rook vs pawns",
      "about": "Müller & Lamprecht–style endings — Rook vs pawns.",
      "desc": "Connected pawns on the sixth can outweigh a rook. Calculate races precisely using fundamental guidelines rather than hope. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Calculate rook vs pawns. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 186,
      "book": "mueller",
      "title": "Minor piece vs pawns (2)",
      "teach": "Blockade passers from the front when possible.",
      "hint": "Blockade the passer.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Minor piece vs pawns",
      "about": "Müller & Lamprecht–style endings — Minor piece vs pawns.",
      "desc": "Knights and bishops stop passers differently. Prefer blockades that cannot be easily driven off. Theory prefers stable blockades. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Blockade the passer. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 187,
      "book": "mueller",
      "title": "Queen vs pawns (2)",
      "teach": "Queen stops passers with checks from behind.",
      "hint": "Check and restrain.",
      "fen": "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Queen vs pawns",
      "about": "Müller & Lamprecht–style endings — Queen vs pawns.",
      "desc": "Queen vs advanced pawns: check from the rear and pick them up. Know the dangerous ranks where pawns become unstoppable without checks. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Check and restrain. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 188,
      "book": "mueller",
      "title": "Lucena prep (2)",
      "teach": "Get the king out and prepare the bridge.",
      "hint": "Prepare Lucena.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Lucena prep",
      "about": "Müller & Lamprecht–style endings — Lucena prep.",
      "desc": "Before the bridge, the king must step out and the rook must cut. Preparation moves are part of the Lucena method — do not rush the pawn alone. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Prepare Lucena. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 189,
      "book": "mueller",
      "title": "Philidor timing (2)",
      "teach": "Wait on the third; check from behind at the sixth.",
      "hint": "Time the Philidor switch.",
      "fen": "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Philidor timing",
      "about": "Müller & Lamprecht–style endings — Philidor timing.",
      "desc": "Switching too early from the third rank loses the draw. Wait until the pawn reaches the sixth, then check from behind. Timing is the theory. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Time the Philidor switch. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 190,
      "book": "mueller",
      "title": "Active king ending (2)",
      "teach": "In pure pawn endings the king is an attacker.",
      "hint": "Activate the king.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 2 9",
      "goal": "win",
      "theme": "Active king ending",
      "about": "Müller & Lamprecht–style endings — Active king ending.",
      "desc": "Activate the king toward key squares immediately. Passive kings lose fundamental pawn endings. Pathing matters as much as opposition. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Activate the king. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 191,
      "book": "mueller",
      "title": "Pawn breakthrough (2)",
      "teach": "Sacrificial breakthroughs appear in pawn theories.",
      "hint": "Breakthrough now.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Pawn breakthrough",
      "about": "Müller & Lamprecht–style endings — Pawn breakthrough.",
      "desc": "Classic breakthrough shapes recur in manuals. Calculate whether the sac creates an unstoppable passer. Pattern recognition helps. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Breakthrough now. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 192,
      "book": "mueller",
      "title": "Drawn rook ending (2)",
      "teach": "Recognise known drawing setups and head for them.",
      "hint": "Head for the known draw.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Drawn rook ending",
      "about": "Müller & Lamprecht–style endings — Drawn rook ending.",
      "desc": "When defending, steer toward Philidor, Vancura, or sufficient checking distance. Known draws are better than inventive losses. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Head for the known draw. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 193,
      "book": "mueller",
      "title": "Winning rook ending (2)",
      "teach": "Recognise known wins — Lucena, cut-offs, activity.",
      "hint": "Head for the known win.",
      "fen": "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Winning rook ending",
      "about": "Müller & Lamprecht–style endings — Winning rook ending.",
      "desc": "When winning, steer toward Lucena or a decisive cut-off. Do not wander into a drawing setup. Theory is a map to the win. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Head for the known win. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 194,
      "book": "mueller",
      "title": "Knight domination (2)",
      "teach": "Dominate a knight so it has no safe squares.",
      "hint": "Dominate the knight.",
      "fen": "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Knight domination",
      "about": "Müller & Lamprecht–style endings — Knight domination.",
      "desc": "Domination motifs convert knight endings. Take away jumps, then zugzwang. Fundamental technique with short-range pieces. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Dominate the knight. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 195,
      "book": "mueller",
      "title": "Bishop skewer nets (2)",
      "teach": "Align king and piece for a skewer on a diagonal.",
      "hint": "Set the skewer.",
      "fen": "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14",
      "goal": "win",
      "theme": "Bishop skewer nets",
      "about": "Müller & Lamprecht–style endings — Bishop skewer nets.",
      "desc": "Bishop endings and queen endings use skewers. Align valuables and force the win of material. Geometry is theory. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Set the skewer. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 196,
      "book": "mueller",
      "title": "Promotion tactics (2)",
      "teach": "Underpromotion and tempo promotions decide endings.",
      "hint": "Promote with purpose.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Promotion tactics",
      "about": "Müller & Lamprecht–style endings — Promotion tactics.",
      "desc": "Sometimes promote to a knight or delay promotion to avoid stalemate. Fundamental manuals insist on purposeful promotion. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Promote with purpose. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 197,
      "book": "mueller",
      "title": "Zugzwang nets (2)",
      "teach": "Put them where every move loses.",
      "hint": "Force zugzwang.",
      "fen": "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Zugzwang nets",
      "about": "Müller & Lamprecht–style endings — Zugzwang nets.",
      "desc": "Zugzwang is the soul of many fundamental endings. Restrict until every pawn or king move collapses the defence. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Force zugzwang. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 198,
      "book": "mueller",
      "title": "Tablebase mindset (2)",
      "teach": "Play the move theory would play — precision over style.",
      "hint": "Play the precise move.",
      "fen": "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Tablebase mindset",
      "about": "Müller & Lamprecht–style endings — Tablebase mindset.",
      "desc": "Reference endings reward precision. Choose the theoretically correct move even if a flashier one 'feels' winning. Accuracy first. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play the precise move. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 199,
      "book": "mueller",
      "title": "Conversion care (2)",
      "teach": "Avoid stalemate and perpetual while converting.",
      "hint": "Convert carefully.",
      "fen": "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/2N2NP1/PP2PP1P/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Conversion care",
      "about": "Müller & Lamprecht–style endings — Conversion care.",
      "desc": "Winning endings are lost to stalemate and perpetual. Leave flight squares, cover checks, then promote. Care is fundamental. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Convert carefully. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 200,
      "book": "mueller",
      "title": "Manual review (2)",
      "teach": "Pattern → path → precision.",
      "hint": "Play the reference move.",
      "fen": "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Manual review",
      "about": "Müller & Lamprecht–style endings — Manual review.",
      "desc": "Synthesise Fundamental Chess Endings: recognise the pattern, path the pieces, execute precisely. That is the move here. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play the reference move. (Fundamental Chess Endings–style · endgame reference)",
      "pitfalls": []
    },
    {
      "n": 201,
      "book": "naroditsky",
      "title": "Messy reality",
      "teach": "Real endgames are messy — prioritise activity and practical chances.",
      "hint": "Play the practical active move.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Messy reality",
      "about": "Naroditsky-style complex endings — Messy reality.",
      "desc": "Naroditsky emphasises endings that arise from real games: imperfect structures, leftover pawns, and clock pressure. Prefer active practical moves over fragile theoretical perfection when the position is messy. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play the practical active move. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 202,
      "book": "naroditsky",
      "title": "Rook ending activity",
      "teach": "Activate the rook even if a pawn drops.",
      "hint": "Activate at a pawn cost if needed.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Rook ending activity",
      "about": "Naroditsky-style complex endings — Rook ending activity.",
      "desc": "In practical rook endings, activity often outweighs a pawn. Naroditsky's examples repeatedly show passive rooks losing. Activate, check, and cut — then regroup. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Activate at a pawn cost if needed. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 203,
      "book": "naroditsky",
      "title": "King into the fray",
      "teach": "Bring the king into messy endings early.",
      "hint": "Activate the king.",
      "fen": "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
      "goal": "win",
      "theme": "King into the fray",
      "about": "Naroditsky-style complex endings — King into the fray.",
      "desc": "Complex endgames need fighting kings. Walk the king toward passed pawns, weak pawns, or supporting squares. Hesitant kings lose practical endings. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Activate the king. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 204,
      "book": "naroditsky",
      "title": "Passed pawn chaos",
      "teach": "Create a passer and force them to react.",
      "hint": "Create practical passer pressure.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "Passed pawn chaos",
      "about": "Naroditsky-style complex endings — Passed pawn chaos.",
      "desc": "In messy positions, a passer clarifies the plan. Create one even if the structure is imperfect. Practical pressure beats abstract structure pride. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Create practical passer pressure. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 205,
      "book": "naroditsky",
      "title": "Calculate races",
      "teach": "When both sides run, count — then choose.",
      "hint": "Win the race count.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Calculate races",
      "about": "Naroditsky-style complex endings — Calculate races.",
      "desc": "Practical endgames often become races. Count tempi without romanticism. If you lose the race, switch to checking defence or a blockade plan. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Win the race count. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 206,
      "book": "naroditsky",
      "title": "Swindle sense",
      "teach": "When worse, fish for stalemate, perpetual, or fortress.",
      "hint": "Fish for the swindle.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Swindle sense",
      "about": "Naroditsky-style complex endings — Swindle sense.",
      "desc": "Mastering Complex Endgames includes saving resources. If losing, seek practical swindles: perpetual checks, stalemate nets, or fortress setups. Pride-less defence scores half-points. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Fish for the swindle. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 207,
      "book": "naroditsky",
      "title": "Clock technique",
      "teach": "With little time, simplify the decision tree.",
      "hint": "Choose the simple active plan.",
      "fen": "r1bqkb1r/pp1ppppp/2n2n2/2p5/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 4",
      "goal": "win",
      "theme": "Clock technique",
      "about": "Naroditsky-style complex endings — Clock technique.",
      "desc": "Complex endings on low clock need simplified plans: activate rook, push passer, check from behind. Avoid ornate only-move paths you cannot calculate. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Choose the simple active plan. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 208,
      "book": "naroditsky",
      "title": "Trade decisions",
      "teach": "Trading into a pawn ending must be calculated, not hoped.",
      "hint": "Only trade if the ending wins.",
      "fen": "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Trade decisions",
      "about": "Naroditsky-style complex endings — Trade decisions.",
      "desc": "Practical players often mis-trade into drawn or lost pawn endings. Before the last trade, count. Naroditsky's lessons punish hopeful liquidations. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Only trade if the ending wins. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 209,
      "book": "naroditsky",
      "title": "Two weaknesses practical",
      "teach": "Stretch their defence across two fronts.",
      "hint": "Open the second front.",
      "fen": "rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 6",
      "goal": "win",
      "theme": "Two weaknesses practical",
      "about": "Naroditsky-style complex endings — Two weaknesses practical.",
      "desc": "Even in endings, the two-weaknesses principle applies. Fix one target, create another, and let the defence collapse under dual duties. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Open the second front. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 210,
      "book": "naroditsky",
      "title": "Rook vs minor mess",
      "teach": "Coordinate the rook against imperfect minor-piece setups.",
      "hint": "Coordinate against the minor.",
      "fen": "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Rook vs minor mess",
      "about": "Naroditsky-style complex endings — Rook vs minor mess.",
      "desc": "Real games leave rook vs knight/bishop with pawns everywhere. Use cut-offs and double attacks rather than waiting for pure theory positions. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Coordinate against the minor. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 211,
      "book": "naroditsky",
      "title": "Queen ending practical",
      "teach": "Centralise, check, and avoid sleepwalking into perpetual.",
      "hint": "Centralise and stay alert.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Queen ending practical",
      "about": "Naroditsky-style complex endings — Queen ending practical.",
      "desc": "Practical queen endings are perpetual-check minefields. Centralise your queen, shelter your king, and calculate checks before grabbing pawns. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Centralise and stay alert. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 212,
      "book": "naroditsky",
      "title": "Bishop ending grit",
      "teach": "Same-colour bishop endings are grindable — create a second target.",
      "hint": "Grind with a second target.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "Bishop ending grit",
      "about": "Naroditsky-style complex endings — Bishop ending grit.",
      "desc": "Messy bishop endings rarely look like textbooks. Fix pawns on their bishop's colour when attacking, or opposite when defending, and create a second front. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Grind with a second target. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 213,
      "book": "naroditsky",
      "title": "Knight ending forks",
      "teach": "In practical knight endings, fork nets appear suddenly.",
      "hint": "Watch for fork tactics.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Knight ending forks",
      "about": "Naroditsky-style complex endings — Knight ending forks.",
      "desc": "Knights in complex endings create tactical weather. Before each king move, scan forks. Practical technique includes constant short-range vigilance. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Watch for fork tactics. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 214,
      "book": "naroditsky",
      "title": "Connected passers practical",
      "teach": "Advance connected passers with king support.",
      "hint": "Advance with support.",
      "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      "goal": "win",
      "theme": "Connected passers practical",
      "about": "Naroditsky-style complex endings — Connected passers practical.",
      "desc": "Connected passers win practical games when escorted. Bring the king, avoid premature splits that allow blockade, and roll them forward. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Advance with support. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 215,
      "book": "naroditsky",
      "title": "Split passers practical",
      "teach": "Make them choose which passer to stop.",
      "hint": "Force a choice.",
      "fen": "rnbqk2r/pp2ppbp/5np1/2pp4/3P4/2P2NP1/PP2PP1P/RNBQKB1R w KQkq - 0 6",
      "goal": "win",
      "theme": "Split passers practical",
      "about": "Naroditsky-style complex endings — Split passers practical.",
      "desc": "Two distant passers in a messy ending overwhelm a lone king or rook. Advance the one that maximises their dilemma. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Force a choice. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 216,
      "book": "naroditsky",
      "title": "Rook on seventh practical",
      "teach": "Invade the seventh and harvest.",
      "hint": "Invade the seventh.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Rook on seventh practical",
      "about": "Naroditsky-style complex endings — Rook on seventh practical.",
      "desc": "A rook on the seventh in complex endings wins pawns and mates nets. Practical priority: get there, even via a temporary pawn concession. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Invade the seventh. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 217,
      "book": "naroditsky",
      "title": "Defence first",
      "teach": "When under fire, extinguish counterplay before pushing.",
      "hint": "Kill counterplay first.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Defence first",
      "about": "Naroditsky-style complex endings — Defence first.",
      "desc": "Conversion in complex endings starts by stopping their passer or checks. Naroditsky stresses: remove their play, then win slowly. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Kill counterplay first. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 218,
      "book": "naroditsky",
      "title": "Pawn storm residue",
      "teach": "Leftover attacking pawns become ending assets — or liabilities.",
      "hint": "Handle leftover pawns.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Pawn storm residue",
      "about": "Naroditsky-style complex endings — Pawn storm residue.",
      "desc": "After middlegame storms, odd pawn islands remain. Treat them as ending material: fix, exchange, or advance based on activity, not nostalgia for the attack. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Handle leftover pawns. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 219,
      "book": "naroditsky",
      "title": "Opposite bishops practical",
      "teach": "With rooks, opposite bishops favor the attacker.",
      "hint": "Attack with opposite bishops.",
      "fen": "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Opposite bishops practical",
      "about": "Naroditsky-style complex endings — Opposite bishops practical.",
      "desc": "Opposite bishops plus rooks in complex endings are often decisive for the side with initiative. Open lines toward the king; do not settle for a dry draw assumption. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Attack with opposite bishops. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 220,
      "book": "naroditsky",
      "title": "Technical grit",
      "teach": "Win ugly — clarity over beauty.",
      "hint": "Choose the ugly clear win.",
      "fen": "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
      "goal": "win",
      "theme": "Technical grit",
      "about": "Naroditsky-style complex endings — Technical grit.",
      "desc": "Complex endgames reward ugly clarity: trade into a simple win, or fix a weakness and sit. Naroditsky's practical ethos: the point matters more than the aesthetic. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Choose the ugly clear win. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 221,
      "book": "naroditsky",
      "title": "Check sequences",
      "teach": "Use checks to improve your pieces for free.",
      "hint": "Check to improve.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Check sequences",
      "about": "Naroditsky-style complex endings — Check sequences.",
      "desc": "Checking sequences in rook and queen endings can reposition with tempo. Calculate which check improves your king or rook before the quiet move. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Check to improve. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 222,
      "book": "naroditsky",
      "title": "Shelter building",
      "teach": "Build shelter against checks before pushing the win.",
      "hint": "Build shelter.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Shelter building",
      "about": "Naroditsky-style complex endings — Shelter building.",
      "desc": "When converting, spend a move making luft or an umbrella against perpetual ideas. Practical conversion includes anti-swindle moves. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Build shelter. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 223,
      "book": "naroditsky",
      "title": "Blockade in mess",
      "teach": "Blockade their passer even in chaotic structures.",
      "hint": "Blockade the dangerous passer.",
      "fen": "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Blockade in mess",
      "about": "Naroditsky-style complex endings — Blockade in mess.",
      "desc": "The most dangerous passer must be stopped first. Blockade, then clean the rest of the mess. Priority management is practical endgame skill. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Blockade the dangerous passer. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 224,
      "book": "naroditsky",
      "title": "Exchange to clarify",
      "teach": "Exchange into a clearer ending when ahead.",
      "hint": "Clarify by exchanging.",
      "fen": "r1bqk2r/pp1pppbp/2n2np1/2p5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5",
      "goal": "win",
      "theme": "Exchange to clarify",
      "about": "Naroditsky-style complex endings — Exchange to clarify.",
      "desc": "When better in a mess, exchange into a clearer technical win. Complexity helps the defender. Clarity helps the favourite. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Clarify by exchanging. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 225,
      "book": "naroditsky",
      "title": "Complicate when worse",
      "teach": "When worse, keep pieces and keep tension.",
      "hint": "Keep complexity.",
      "fen": "r2q1rk1/ppp1ppbp/2np1np1/8/2PPP1b1/2N2N2/PP2BPPP/R1BQK2R w KQ - 4 8",
      "goal": "win",
      "theme": "Complicate when worse",
      "about": "Naroditsky-style complex endings — Complicate when worse.",
      "desc": "Trailing in a complex ending, avoid simplifying into a lost pawn ending. Keep pieces, keep checking chances, keep hope. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Keep complexity. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 226,
      "book": "naroditsky",
      "title": "King and pawn leftovers",
      "teach": "Pure pawn leftovers still need opposition skills.",
      "hint": "Apply opposition in the leftovers.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "King and pawn leftovers",
      "about": "Naroditsky-style complex endings — King and pawn leftovers.",
      "desc": "Sometimes the mess simplifies to king and pawn. Switch instantly to opposition and key-square thinking. Dual fluency is the point of this book pairing. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Apply opposition in the leftovers. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 227,
      "book": "naroditsky",
      "title": "Rook vs pawns practical",
      "teach": "Know when to sac the rook for the last pawns.",
      "hint": "Sac the rook if it draws/wins.",
      "fen": "r1bqk2r/pppp1ppp/2n1pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Rook vs pawns practical",
      "about": "Naroditsky-style complex endings — Rook vs pawns practical.",
      "desc": "Practical decisions include giving the rook for the remaining pawns to reach a drawn or won minor-piece ending. Calculate the resulting position. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Sac the rook if it draws/wins. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 228,
      "book": "naroditsky",
      "title": "Time-trouble endings",
      "teach": "Pre-move logic: checks, captures, threats.",
      "hint": "Play forcing practical moves.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Time-trouble endings",
      "about": "Naroditsky-style complex endings — Time-trouble endings.",
      "desc": "In time trouble, default to forcing moves that do not lose immediately. Complex endings punish hesitation more than slight inaccuracies. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play forcing practical moves. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 229,
      "book": "naroditsky",
      "title": "Annotation mindset",
      "teach": "Ask: what is my plan, what is theirs, what changes?",
      "hint": "Play the planned practical move.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/4R1K1 w - - 0 18",
      "goal": "win",
      "theme": "Annotation mindset",
      "about": "Naroditsky-style complex endings — Annotation mindset.",
      "desc": "Naroditsky's teaching voice asks clear questions. Answer them here: your plan, their plan, and the move that improves your answer. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play the planned practical move. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 230,
      "book": "naroditsky",
      "title": "Complex review",
      "teach": "Activity, passer priority, anti-swindle — then win.",
      "hint": "Play the complex-endgame move.",
      "fen": "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Complex review",
      "about": "Naroditsky-style complex endings — Complex review.",
      "desc": "Synthesise Mastering Complex Endgames: activate, prioritise dangerous passers, prevent swindles, convert. That practical stack is the move on this board. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play the complex-endgame move. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 231,
      "book": "naroditsky",
      "title": "Double-rook endings",
      "teach": "Coordinate two rooks: seventh rank and cut-offs.",
      "hint": "Coordinate the heavy pieces.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Double-rook endings",
      "about": "Naroditsky-style complex endings — Double-rook endings.",
      "desc": "Double-rook endings in real games are about invasion and coordination. Double on the seventh or cut the king while creating a passer. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Coordinate the heavy pieces. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 232,
      "book": "naroditsky",
      "title": "Rook and minor",
      "teach": "Use the minor to cover checks while the rook cuts.",
      "hint": "Coordinate rook + minor.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Rook and minor",
      "about": "Naroditsky-style complex endings — Rook and minor.",
      "desc": "Messy R+N or R+B endings need roles: minor covers, rook cuts/checks. Assign roles and play the move that fulfills one. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Coordinate rook + minor. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 233,
      "book": "naroditsky",
      "title": "Queen and pawn mess",
      "teach": "Queen endings with many pawns: centralise and create a passer.",
      "hint": "Centralise and create a passer.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Queen and pawn mess",
      "about": "Naroditsky-style complex endings — Queen and pawn mess.",
      "desc": "Practical Q+P endings are about passer creation and king shelter. Centralise the queen, then advance the healthiest majority. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Centralise and create a passer. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 234,
      "book": "naroditsky",
      "title": "Breakthrough practical",
      "teach": "Breakthroughs appear in messy pawn structures too.",
      "hint": "Look for a breakthrough.",
      "fen": "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Breakthrough practical",
      "about": "Naroditsky-style complex endings — Breakthrough practical.",
      "desc": "Even imperfect structures allow sacrificial breakthroughs. Calculate whether a temporary piece or pawn sac creates an unstoppable runner. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Look for a breakthrough. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 235,
      "book": "naroditsky",
      "title": "Fortress breaking",
      "teach": "Against a fortress try, open a second front.",
      "hint": "Break the fortress try.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Fortress breaking",
      "about": "Naroditsky-style complex endings — Fortress breaking.",
      "desc": "Practical fortresses are imperfect. Open another file or create a second weakness rather than staring at a blocked door. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Break the fortress try. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 236,
      "book": "naroditsky",
      "title": "Fortress building",
      "teach": "When worse, build the ugliest holdable setup.",
      "hint": "Build a practical fortress.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Fortress building",
      "about": "Naroditsky-style complex endings — Fortress building.",
      "desc": "If losing, aim for a holdable blockade even if ugly. Naroditsky values half-points from stubborn structures. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Build a practical fortress. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 237,
      "book": "naroditsky",
      "title": "Pawn islands",
      "teach": "Fewer islands usually help — trade accordingly.",
      "hint": "Improve the island count.",
      "fen": "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Pawn islands",
      "about": "Naroditsky-style complex endings — Pawn islands.",
      "desc": "Messy endings have many islands. Trades that reduce islands can clarify defence or conversion. Count islands as part of evaluation. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Improve the island count. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 238,
      "book": "naroditsky",
      "title": "Active vs passive rook",
      "teach": "Never leave a rook passive for long.",
      "hint": "Activate the passive rook.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Active vs passive rook",
      "about": "Naroditsky-style complex endings — Active vs passive rook.",
      "desc": "The most common practical error: a babysitting rook. Swing it to activity even if a pawn falls, when theory and practice support the trade. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Activate the passive rook. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 239,
      "book": "naroditsky",
      "title": "King march paths",
      "teach": "Choose a king path that avoids checks.",
      "hint": "March on a safe path.",
      "fen": "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "King march paths",
      "about": "Naroditsky-style complex endings — King march paths.",
      "desc": "King marches fail to checks. Path via sheltered squares. Practical technique includes route planning, not just destination. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: March on a safe path. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 240,
      "book": "naroditsky",
      "title": "Zwischenzug endings",
      "teach": "In-between checks change capture sequences.",
      "hint": "Insert the zwischenzug.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 2 9",
      "goal": "win",
      "theme": "Zwischenzug endings",
      "about": "Naroditsky-style complex endings — Zwischenzug endings.",
      "desc": "Complex endings still have zwischenzugs. Before recapturing, look for a check or mate threat that improves the result. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Insert the zwischenzug. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 241,
      "book": "naroditsky",
      "title": "Skewer alerts",
      "teach": "Alignments on ranks and diagonals decide endings.",
      "hint": "Watch for skewers.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Skewer alerts",
      "about": "Naroditsky-style complex endings — Skewer alerts.",
      "desc": "Skewers end many practical games. Before parking king and rook on a line, scan alignments. Create them when attacking. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Watch for skewers. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 242,
      "book": "naroditsky",
      "title": "Promotion races",
      "teach": "Count both promotions — and the checking aftermath.",
      "hint": "Count promotion + aftermath.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Promotion races",
      "about": "Naroditsky-style complex endings — Promotion races.",
      "desc": "Promoting first is not enough if they promote with check. Calculate the full aftermath. Practical races include the move after promotion. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Count promotion + aftermath. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 243,
      "book": "naroditsky",
      "title": "Underpromotion practical",
      "teach": "Underpromote to avoid stalemate or to fork.",
      "hint": "Consider underpromotion.",
      "fen": "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Underpromotion practical",
      "about": "Naroditsky-style complex endings — Underpromotion practical.",
      "desc": "Practical saves and wins include knight underpromotions. When a queen stalemates or fails, look for a knight. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Consider underpromotion. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 244,
      "book": "naroditsky",
      "title": "Clean conversion",
      "teach": "Trade into a textbook win when you can force it.",
      "hint": "Force a textbook win.",
      "fen": "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Clean conversion",
      "about": "Naroditsky-style complex endings — Clean conversion.",
      "desc": "If you can force Philidor/Lucena/opposition territory, do it. Complex to simple is good technique when ahead. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Force a textbook win. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 245,
      "book": "naroditsky",
      "title": "Hold the draw",
      "teach": "Knowing you're drawn — play the holding moves only.",
      "hint": "Play the holding moves.",
      "fen": "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14",
      "goal": "win",
      "theme": "Hold the draw",
      "about": "Naroditsky-style complex endings — Hold the draw.",
      "desc": "Once a draw is forced with correct defence, stop inventing. Repeat the holding method. Practical draws are methodical. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play the holding moves. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 246,
      "book": "naroditsky",
      "title": "Pressure psychology",
      "teach": "Pose problems until the clock or nerves crack.",
      "hint": "Pose a practical problem.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Pressure psychology",
      "about": "Naroditsky-style complex endings — Pressure psychology.",
      "desc": "Complex endings reward moves that force difficult choices. Prefer the problem-posing move among equals. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Pose a practical problem. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 247,
      "book": "naroditsky",
      "title": "Recapture choice",
      "teach": "Automatic recaptures can ruin ending structures.",
      "hint": "Choose the right recapture.",
      "fen": "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Recapture choice",
      "about": "Naroditsky-style complex endings — Recapture choice.",
      "desc": "Which piece recaptures can decide the ending structure. Pause and choose. Practical discipline beats reflex. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Choose the right recapture. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 248,
      "book": "naroditsky",
      "title": "Priority list",
      "teach": "1) Stop their passer 2) Activate 3) Create yours.",
      "hint": "Follow the priority list.",
      "fen": "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Priority list",
      "about": "Naroditsky-style complex endings — Priority list.",
      "desc": "A simple priority stack prevents panic in messes. Stop theirs, activate, then create yours. Play the move that matches the top unmet priority. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Follow the priority list. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 249,
      "book": "naroditsky",
      "title": "Endgame transition awareness",
      "teach": "The middlegame just ended — switch evaluation mode.",
      "hint": "Switch to ending evaluation.",
      "fen": "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/2N2NP1/PP2PP1P/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Endgame transition awareness",
      "about": "Naroditsky-style complex endings — Endgame transition awareness.",
      "desc": "After queens come off mid-mess, switch criteria: king activity, passers, rook files. Middlegame plans may no longer apply. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Switch to ending evaluation. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 250,
      "book": "naroditsky",
      "title": "Naroditsky synthesis",
      "teach": "Activity, priorities, anti-swindle, convert.",
      "hint": "Play the practical winning move.",
      "fen": "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Naroditsky synthesis",
      "about": "Naroditsky-style complex endings — Naroditsky synthesis.",
      "desc": "Final drill: activate pieces, prioritise dangerous passers, prevent swindles, and convert cleanly. That is Mastering Complex Endgames on this board. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play the practical winning move. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 251,
      "book": "naroditsky",
      "title": "Messy reality (2)",
      "teach": "Real endgames are messy — prioritise activity and practical chances.",
      "hint": "Play the practical active move.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Messy reality",
      "about": "Naroditsky-style complex endings — Messy reality.",
      "desc": "Naroditsky emphasises endings that arise from real games: imperfect structures, leftover pawns, and clock pressure. Prefer active practical moves over fragile theoretical perfection when the position is messy. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play the practical active move. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 252,
      "book": "naroditsky",
      "title": "Rook ending activity (2)",
      "teach": "Activate the rook even if a pawn drops.",
      "hint": "Activate at a pawn cost if needed.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Rook ending activity",
      "about": "Naroditsky-style complex endings — Rook ending activity.",
      "desc": "In practical rook endings, activity often outweighs a pawn. Naroditsky's examples repeatedly show passive rooks losing. Activate, check, and cut — then regroup. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Activate at a pawn cost if needed. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 253,
      "book": "naroditsky",
      "title": "King into the fray (2)",
      "teach": "Bring the king into messy endings early.",
      "hint": "Activate the king.",
      "fen": "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
      "goal": "win",
      "theme": "King into the fray",
      "about": "Naroditsky-style complex endings — King into the fray.",
      "desc": "Complex endgames need fighting kings. Walk the king toward passed pawns, weak pawns, or supporting squares. Hesitant kings lose practical endings. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Activate the king. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 254,
      "book": "naroditsky",
      "title": "Passed pawn chaos (2)",
      "teach": "Create a passer and force them to react.",
      "hint": "Create practical passer pressure.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "Passed pawn chaos",
      "about": "Naroditsky-style complex endings — Passed pawn chaos.",
      "desc": "In messy positions, a passer clarifies the plan. Create one even if the structure is imperfect. Practical pressure beats abstract structure pride. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Create practical passer pressure. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 255,
      "book": "naroditsky",
      "title": "Calculate races (2)",
      "teach": "When both sides run, count — then choose.",
      "hint": "Win the race count.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Calculate races",
      "about": "Naroditsky-style complex endings — Calculate races.",
      "desc": "Practical endgames often become races. Count tempi without romanticism. If you lose the race, switch to checking defence or a blockade plan. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Win the race count. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 256,
      "book": "naroditsky",
      "title": "Swindle sense (2)",
      "teach": "When worse, fish for stalemate, perpetual, or fortress.",
      "hint": "Fish for the swindle.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Swindle sense",
      "about": "Naroditsky-style complex endings — Swindle sense.",
      "desc": "Mastering Complex Endgames includes saving resources. If losing, seek practical swindles: perpetual checks, stalemate nets, or fortress setups. Pride-less defence scores half-points. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Fish for the swindle. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 257,
      "book": "naroditsky",
      "title": "Clock technique (2)",
      "teach": "With little time, simplify the decision tree.",
      "hint": "Choose the simple active plan.",
      "fen": "r1bqkb1r/pp1ppppp/2n2n2/2p5/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 4",
      "goal": "win",
      "theme": "Clock technique",
      "about": "Naroditsky-style complex endings — Clock technique.",
      "desc": "Complex endings on low clock need simplified plans: activate rook, push passer, check from behind. Avoid ornate only-move paths you cannot calculate. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Choose the simple active plan. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 258,
      "book": "naroditsky",
      "title": "Trade decisions (2)",
      "teach": "Trading into a pawn ending must be calculated, not hoped.",
      "hint": "Only trade if the ending wins.",
      "fen": "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Trade decisions",
      "about": "Naroditsky-style complex endings — Trade decisions.",
      "desc": "Practical players often mis-trade into drawn or lost pawn endings. Before the last trade, count. Naroditsky's lessons punish hopeful liquidations. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Only trade if the ending wins. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 259,
      "book": "naroditsky",
      "title": "Two weaknesses practical (2)",
      "teach": "Stretch their defence across two fronts.",
      "hint": "Open the second front.",
      "fen": "rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 6",
      "goal": "win",
      "theme": "Two weaknesses practical",
      "about": "Naroditsky-style complex endings — Two weaknesses practical.",
      "desc": "Even in endings, the two-weaknesses principle applies. Fix one target, create another, and let the defence collapse under dual duties. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Open the second front. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 260,
      "book": "naroditsky",
      "title": "Rook vs minor mess (2)",
      "teach": "Coordinate the rook against imperfect minor-piece setups.",
      "hint": "Coordinate against the minor.",
      "fen": "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Rook vs minor mess",
      "about": "Naroditsky-style complex endings — Rook vs minor mess.",
      "desc": "Real games leave rook vs knight/bishop with pawns everywhere. Use cut-offs and double attacks rather than waiting for pure theory positions. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Coordinate against the minor. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 261,
      "book": "naroditsky",
      "title": "Queen ending practical (2)",
      "teach": "Centralise, check, and avoid sleepwalking into perpetual.",
      "hint": "Centralise and stay alert.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Queen ending practical",
      "about": "Naroditsky-style complex endings — Queen ending practical.",
      "desc": "Practical queen endings are perpetual-check minefields. Centralise your queen, shelter your king, and calculate checks before grabbing pawns. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Centralise and stay alert. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 262,
      "book": "naroditsky",
      "title": "Bishop ending grit (2)",
      "teach": "Same-colour bishop endings are grindable — create a second target.",
      "hint": "Grind with a second target.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "Bishop ending grit",
      "about": "Naroditsky-style complex endings — Bishop ending grit.",
      "desc": "Messy bishop endings rarely look like textbooks. Fix pawns on their bishop's colour when attacking, or opposite when defending, and create a second front. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Grind with a second target. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 263,
      "book": "naroditsky",
      "title": "Knight ending forks (2)",
      "teach": "In practical knight endings, fork nets appear suddenly.",
      "hint": "Watch for fork tactics.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Knight ending forks",
      "about": "Naroditsky-style complex endings — Knight ending forks.",
      "desc": "Knights in complex endings create tactical weather. Before each king move, scan forks. Practical technique includes constant short-range vigilance. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Watch for fork tactics. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 264,
      "book": "naroditsky",
      "title": "Connected passers practical (2)",
      "teach": "Advance connected passers with king support.",
      "hint": "Advance with support.",
      "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      "goal": "win",
      "theme": "Connected passers practical",
      "about": "Naroditsky-style complex endings — Connected passers practical.",
      "desc": "Connected passers win practical games when escorted. Bring the king, avoid premature splits that allow blockade, and roll them forward. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Advance with support. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 265,
      "book": "naroditsky",
      "title": "Split passers practical (2)",
      "teach": "Make them choose which passer to stop.",
      "hint": "Force a choice.",
      "fen": "rnbqk2r/pp2ppbp/5np1/2pp4/3P4/2P2NP1/PP2PP1P/RNBQKB1R w KQkq - 0 6",
      "goal": "win",
      "theme": "Split passers practical",
      "about": "Naroditsky-style complex endings — Split passers practical.",
      "desc": "Two distant passers in a messy ending overwhelm a lone king or rook. Advance the one that maximises their dilemma. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Force a choice. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 266,
      "book": "naroditsky",
      "title": "Rook on seventh practical (2)",
      "teach": "Invade the seventh and harvest.",
      "hint": "Invade the seventh.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Rook on seventh practical",
      "about": "Naroditsky-style complex endings — Rook on seventh practical.",
      "desc": "A rook on the seventh in complex endings wins pawns and mates nets. Practical priority: get there, even via a temporary pawn concession. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Invade the seventh. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 267,
      "book": "naroditsky",
      "title": "Defence first (2)",
      "teach": "When under fire, extinguish counterplay before pushing.",
      "hint": "Kill counterplay first.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Defence first",
      "about": "Naroditsky-style complex endings — Defence first.",
      "desc": "Conversion in complex endings starts by stopping their passer or checks. Naroditsky stresses: remove their play, then win slowly. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Kill counterplay first. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 268,
      "book": "naroditsky",
      "title": "Pawn storm residue (2)",
      "teach": "Leftover attacking pawns become ending assets — or liabilities.",
      "hint": "Handle leftover pawns.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Pawn storm residue",
      "about": "Naroditsky-style complex endings — Pawn storm residue.",
      "desc": "After middlegame storms, odd pawn islands remain. Treat them as ending material: fix, exchange, or advance based on activity, not nostalgia for the attack. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Handle leftover pawns. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 269,
      "book": "naroditsky",
      "title": "Opposite bishops practical (2)",
      "teach": "With rooks, opposite bishops favor the attacker.",
      "hint": "Attack with opposite bishops.",
      "fen": "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Opposite bishops practical",
      "about": "Naroditsky-style complex endings — Opposite bishops practical.",
      "desc": "Opposite bishops plus rooks in complex endings are often decisive for the side with initiative. Open lines toward the king; do not settle for a dry draw assumption. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Attack with opposite bishops. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 270,
      "book": "naroditsky",
      "title": "Technical grit (2)",
      "teach": "Win ugly — clarity over beauty.",
      "hint": "Choose the ugly clear win.",
      "fen": "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
      "goal": "win",
      "theme": "Technical grit",
      "about": "Naroditsky-style complex endings — Technical grit.",
      "desc": "Complex endgames reward ugly clarity: trade into a simple win, or fix a weakness and sit. Naroditsky's practical ethos: the point matters more than the aesthetic. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Choose the ugly clear win. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 271,
      "book": "naroditsky",
      "title": "Check sequences (2)",
      "teach": "Use checks to improve your pieces for free.",
      "hint": "Check to improve.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Check sequences",
      "about": "Naroditsky-style complex endings — Check sequences.",
      "desc": "Checking sequences in rook and queen endings can reposition with tempo. Calculate which check improves your king or rook before the quiet move. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Check to improve. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 272,
      "book": "naroditsky",
      "title": "Shelter building (2)",
      "teach": "Build shelter against checks before pushing the win.",
      "hint": "Build shelter.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Shelter building",
      "about": "Naroditsky-style complex endings — Shelter building.",
      "desc": "When converting, spend a move making luft or an umbrella against perpetual ideas. Practical conversion includes anti-swindle moves. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Build shelter. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 273,
      "book": "naroditsky",
      "title": "Blockade in mess (2)",
      "teach": "Blockade their passer even in chaotic structures.",
      "hint": "Blockade the dangerous passer.",
      "fen": "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Blockade in mess",
      "about": "Naroditsky-style complex endings — Blockade in mess.",
      "desc": "The most dangerous passer must be stopped first. Blockade, then clean the rest of the mess. Priority management is practical endgame skill. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Blockade the dangerous passer. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 274,
      "book": "naroditsky",
      "title": "Exchange to clarify (2)",
      "teach": "Exchange into a clearer ending when ahead.",
      "hint": "Clarify by exchanging.",
      "fen": "r1bqk2r/pp1pppbp/2n2np1/2p5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5",
      "goal": "win",
      "theme": "Exchange to clarify",
      "about": "Naroditsky-style complex endings — Exchange to clarify.",
      "desc": "When better in a mess, exchange into a clearer technical win. Complexity helps the defender. Clarity helps the favourite. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Clarify by exchanging. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 275,
      "book": "naroditsky",
      "title": "Complicate when worse (2)",
      "teach": "When worse, keep pieces and keep tension.",
      "hint": "Keep complexity.",
      "fen": "r2q1rk1/ppp1ppbp/2np1np1/8/2PPP1b1/2N2N2/PP2BPPP/R1BQK2R w KQ - 4 8",
      "goal": "win",
      "theme": "Complicate when worse",
      "about": "Naroditsky-style complex endings — Complicate when worse.",
      "desc": "Trailing in a complex ending, avoid simplifying into a lost pawn ending. Keep pieces, keep checking chances, keep hope. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Keep complexity. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 276,
      "book": "naroditsky",
      "title": "King and pawn leftovers (2)",
      "teach": "Pure pawn leftovers still need opposition skills.",
      "hint": "Apply opposition in the leftovers.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "King and pawn leftovers",
      "about": "Naroditsky-style complex endings — King and pawn leftovers.",
      "desc": "Sometimes the mess simplifies to king and pawn. Switch instantly to opposition and key-square thinking. Dual fluency is the point of this book pairing. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Apply opposition in the leftovers. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 277,
      "book": "naroditsky",
      "title": "Rook vs pawns practical (2)",
      "teach": "Know when to sac the rook for the last pawns.",
      "hint": "Sac the rook if it draws/wins.",
      "fen": "r1bqk2r/pppp1ppp/2n1pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Rook vs pawns practical",
      "about": "Naroditsky-style complex endings — Rook vs pawns practical.",
      "desc": "Practical decisions include giving the rook for the remaining pawns to reach a drawn or won minor-piece ending. Calculate the resulting position. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Sac the rook if it draws/wins. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 278,
      "book": "naroditsky",
      "title": "Time-trouble endings (2)",
      "teach": "Pre-move logic: checks, captures, threats.",
      "hint": "Play forcing practical moves.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Time-trouble endings",
      "about": "Naroditsky-style complex endings — Time-trouble endings.",
      "desc": "In time trouble, default to forcing moves that do not lose immediately. Complex endings punish hesitation more than slight inaccuracies. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play forcing practical moves. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 279,
      "book": "naroditsky",
      "title": "Annotation mindset (2)",
      "teach": "Ask: what is my plan, what is theirs, what changes?",
      "hint": "Play the planned practical move.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/4R1K1 w - - 0 18",
      "goal": "win",
      "theme": "Annotation mindset",
      "about": "Naroditsky-style complex endings — Annotation mindset.",
      "desc": "Naroditsky's teaching voice asks clear questions. Answer them here: your plan, their plan, and the move that improves your answer. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play the planned practical move. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 280,
      "book": "naroditsky",
      "title": "Complex review (2)",
      "teach": "Activity, passer priority, anti-swindle — then win.",
      "hint": "Play the complex-endgame move.",
      "fen": "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Complex review",
      "about": "Naroditsky-style complex endings — Complex review.",
      "desc": "Synthesise Mastering Complex Endgames: activate, prioritise dangerous passers, prevent swindles, convert. That practical stack is the move on this board. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play the complex-endgame move. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 281,
      "book": "naroditsky",
      "title": "Double-rook endings (2)",
      "teach": "Coordinate two rooks: seventh rank and cut-offs.",
      "hint": "Coordinate the heavy pieces.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Double-rook endings",
      "about": "Naroditsky-style complex endings — Double-rook endings.",
      "desc": "Double-rook endings in real games are about invasion and coordination. Double on the seventh or cut the king while creating a passer. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Coordinate the heavy pieces. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 282,
      "book": "naroditsky",
      "title": "Rook and minor (2)",
      "teach": "Use the minor to cover checks while the rook cuts.",
      "hint": "Coordinate rook + minor.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Rook and minor",
      "about": "Naroditsky-style complex endings — Rook and minor.",
      "desc": "Messy R+N or R+B endings need roles: minor covers, rook cuts/checks. Assign roles and play the move that fulfills one. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Coordinate rook + minor. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 283,
      "book": "naroditsky",
      "title": "Queen and pawn mess (2)",
      "teach": "Queen endings with many pawns: centralise and create a passer.",
      "hint": "Centralise and create a passer.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Queen and pawn mess",
      "about": "Naroditsky-style complex endings — Queen and pawn mess.",
      "desc": "Practical Q+P endings are about passer creation and king shelter. Centralise the queen, then advance the healthiest majority. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Centralise and create a passer. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 284,
      "book": "naroditsky",
      "title": "Breakthrough practical (2)",
      "teach": "Breakthroughs appear in messy pawn structures too.",
      "hint": "Look for a breakthrough.",
      "fen": "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Breakthrough practical",
      "about": "Naroditsky-style complex endings — Breakthrough practical.",
      "desc": "Even imperfect structures allow sacrificial breakthroughs. Calculate whether a temporary piece or pawn sac creates an unstoppable runner. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Look for a breakthrough. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 285,
      "book": "naroditsky",
      "title": "Fortress breaking (2)",
      "teach": "Against a fortress try, open a second front.",
      "hint": "Break the fortress try.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Fortress breaking",
      "about": "Naroditsky-style complex endings — Fortress breaking.",
      "desc": "Practical fortresses are imperfect. Open another file or create a second weakness rather than staring at a blocked door. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Break the fortress try. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 286,
      "book": "naroditsky",
      "title": "Fortress building (2)",
      "teach": "When worse, build the ugliest holdable setup.",
      "hint": "Build a practical fortress.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Fortress building",
      "about": "Naroditsky-style complex endings — Fortress building.",
      "desc": "If losing, aim for a holdable blockade even if ugly. Naroditsky values half-points from stubborn structures. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Build a practical fortress. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 287,
      "book": "naroditsky",
      "title": "Pawn islands (2)",
      "teach": "Fewer islands usually help — trade accordingly.",
      "hint": "Improve the island count.",
      "fen": "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Pawn islands",
      "about": "Naroditsky-style complex endings — Pawn islands.",
      "desc": "Messy endings have many islands. Trades that reduce islands can clarify defence or conversion. Count islands as part of evaluation. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Improve the island count. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 288,
      "book": "naroditsky",
      "title": "Active vs passive rook (2)",
      "teach": "Never leave a rook passive for long.",
      "hint": "Activate the passive rook.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Active vs passive rook",
      "about": "Naroditsky-style complex endings — Active vs passive rook.",
      "desc": "The most common practical error: a babysitting rook. Swing it to activity even if a pawn falls, when theory and practice support the trade. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Activate the passive rook. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 289,
      "book": "naroditsky",
      "title": "King march paths (2)",
      "teach": "Choose a king path that avoids checks.",
      "hint": "March on a safe path.",
      "fen": "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "King march paths",
      "about": "Naroditsky-style complex endings — King march paths.",
      "desc": "King marches fail to checks. Path via sheltered squares. Practical technique includes route planning, not just destination. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: March on a safe path. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 290,
      "book": "naroditsky",
      "title": "Zwischenzug endings (2)",
      "teach": "In-between checks change capture sequences.",
      "hint": "Insert the zwischenzug.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 2 9",
      "goal": "win",
      "theme": "Zwischenzug endings",
      "about": "Naroditsky-style complex endings — Zwischenzug endings.",
      "desc": "Complex endings still have zwischenzugs. Before recapturing, look for a check or mate threat that improves the result. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Insert the zwischenzug. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 291,
      "book": "naroditsky",
      "title": "Skewer alerts (2)",
      "teach": "Alignments on ranks and diagonals decide endings.",
      "hint": "Watch for skewers.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Skewer alerts",
      "about": "Naroditsky-style complex endings — Skewer alerts.",
      "desc": "Skewers end many practical games. Before parking king and rook on a line, scan alignments. Create them when attacking. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Watch for skewers. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 292,
      "book": "naroditsky",
      "title": "Promotion races (2)",
      "teach": "Count both promotions — and the checking aftermath.",
      "hint": "Count promotion + aftermath.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Promotion races",
      "about": "Naroditsky-style complex endings — Promotion races.",
      "desc": "Promoting first is not enough if they promote with check. Calculate the full aftermath. Practical races include the move after promotion. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Count promotion + aftermath. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 293,
      "book": "naroditsky",
      "title": "Underpromotion practical (2)",
      "teach": "Underpromote to avoid stalemate or to fork.",
      "hint": "Consider underpromotion.",
      "fen": "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Underpromotion practical",
      "about": "Naroditsky-style complex endings — Underpromotion practical.",
      "desc": "Practical saves and wins include knight underpromotions. When a queen stalemates or fails, look for a knight. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Consider underpromotion. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 294,
      "book": "naroditsky",
      "title": "Clean conversion (2)",
      "teach": "Trade into a textbook win when you can force it.",
      "hint": "Force a textbook win.",
      "fen": "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Clean conversion",
      "about": "Naroditsky-style complex endings — Clean conversion.",
      "desc": "If you can force Philidor/Lucena/opposition territory, do it. Complex to simple is good technique when ahead. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Force a textbook win. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 295,
      "book": "naroditsky",
      "title": "Hold the draw (2)",
      "teach": "Knowing you're drawn — play the holding moves only.",
      "hint": "Play the holding moves.",
      "fen": "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14",
      "goal": "win",
      "theme": "Hold the draw",
      "about": "Naroditsky-style complex endings — Hold the draw.",
      "desc": "Once a draw is forced with correct defence, stop inventing. Repeat the holding method. Practical draws are methodical. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play the holding moves. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 296,
      "book": "naroditsky",
      "title": "Pressure psychology (2)",
      "teach": "Pose problems until the clock or nerves crack.",
      "hint": "Pose a practical problem.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Pressure psychology",
      "about": "Naroditsky-style complex endings — Pressure psychology.",
      "desc": "Complex endings reward moves that force difficult choices. Prefer the problem-posing move among equals. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Pose a practical problem. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 297,
      "book": "naroditsky",
      "title": "Recapture choice (2)",
      "teach": "Automatic recaptures can ruin ending structures.",
      "hint": "Choose the right recapture.",
      "fen": "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Recapture choice",
      "about": "Naroditsky-style complex endings — Recapture choice.",
      "desc": "Which piece recaptures can decide the ending structure. Pause and choose. Practical discipline beats reflex. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Choose the right recapture. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 298,
      "book": "naroditsky",
      "title": "Priority list (2)",
      "teach": "1) Stop their passer 2) Activate 3) Create yours.",
      "hint": "Follow the priority list.",
      "fen": "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Priority list",
      "about": "Naroditsky-style complex endings — Priority list.",
      "desc": "A simple priority stack prevents panic in messes. Stop theirs, activate, then create yours. Play the move that matches the top unmet priority. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Follow the priority list. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 299,
      "book": "naroditsky",
      "title": "Endgame transition awareness (2)",
      "teach": "The middlegame just ended — switch evaluation mode.",
      "hint": "Switch to ending evaluation.",
      "fen": "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/2N2NP1/PP2PP1P/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Endgame transition awareness",
      "about": "Naroditsky-style complex endings — Endgame transition awareness.",
      "desc": "After queens come off mid-mess, switch criteria: king activity, passers, rook files. Middlegame plans may no longer apply. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Switch to ending evaluation. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    },
    {
      "n": 300,
      "book": "naroditsky",
      "title": "Naroditsky synthesis (2)",
      "teach": "Activity, priorities, anti-swindle, convert.",
      "hint": "Play the practical winning move.",
      "fen": "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Naroditsky synthesis",
      "about": "Naroditsky-style complex endings — Naroditsky synthesis.",
      "desc": "Final drill: activate pieces, prioritise dangerous passers, prevent swindles, and convert cleanly. That is Mastering Complex Endgames on this board. On this board, choose the move that best expresses the idea, then verify it against their strongest reply. Hint focus: Play the practical winning move. (Mastering Complex Endgames–style · practical endings)",
      "pitfalls": []
    }
  ];


  const BOOK_LABEL = {
    gelfand: "Gelfand \u00b7 1900+",
    mueller: "Mueller \u00b7 Endings",
    naroditsky: "Naroditsky \u00b7 Complex",
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
    if (!["all", "gelfand", "mueller", "naroditsky"].includes(next)) return;
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
      const pitHeading = infoPitfallsEl.previousElementSibling;
      if (!pits.length) {
        infoPitfallsEl.hidden = true;
        if (pitHeading && pitHeading.classList.contains("info-heading")) pitHeading.hidden = true;
      } else {
        infoPitfallsEl.hidden = false;
        if (pitHeading && pitHeading.classList.contains("info-heading")) pitHeading.hidden = false;
        for (const pit of pits) {
          const li = document.createElement("li");
          li.textContent = pit;
          infoPitfallsEl.appendChild(li);
        }
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
