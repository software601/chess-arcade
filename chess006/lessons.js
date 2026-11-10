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

  const ENGINE_JS = "/chess006/stockfish-19-lite-single.js";
  const ENGINE_WASM = "/chess006/stockfish-19-lite-single.wasm";
  const GLYPH = {
    wk: "♔", wq: "♕", wr: "♖", wb: "♗", wn: "♘", wp: "♙",
    bk: "♚", bq: "♛", br: "♜", bb: "♝", bn: "♞", bp: "♟",
  };

  /** 300 lessons: Kotov / Fischer / Bronstein (100 each). Rich descriptions; no pitfalls. Original drills. */
  const LESSONS = [
    {
      "n": 1,
      "book": "kotov",
      "title": "Candidate moves",
      "teach": "List every serious candidate before diving deep into any one line.",
      "hint": "Name candidates, then choose.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Candidate moves",
      "about": "Kotov-style calculation — Candidate moves.",
      "desc": "Kotov's method starts with discipline: write (or mentally list) the candidate moves that could reasonably change the evaluation. Only after the list is complete do you analyse each branch. This stops the classic amateur habit of calculating one shiny idea forever while missing a simpler win. In this position, pause, list two or three real options, then play the one that survives comparison. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Name candidates, then choose. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 2,
      "book": "kotov",
      "title": "Analysis tree",
      "teach": "Build a clean tree — one branch at a time, then compare trunks.",
      "hint": "Finish one branch before hopping.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Analysis tree",
      "about": "Kotov-style calculation — Analysis tree.",
      "desc": "Kotov pictured calculation as a tree: each candidate is a trunk, each reply a branch. Jumping between unfinished branches creates 'kotov syndrome' — returning again and again without a decision. Force yourself to finish a line to a quiet position or a clear eval, mark it, then move to the next candidate. The move you play is the trunk with the best finished evaluation. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Finish one branch before hopping. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 3,
      "book": "kotov",
      "title": "Don't jump branches",
      "teach": "Stay on the current variation until it resolves.",
      "hint": "Resolve this line first.",
      "fen": "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
      "goal": "win",
      "theme": "Don't jump branches",
      "about": "Kotov-style calculation — Don't jump branches.",
      "desc": "The disease of restless calculation is switching lines mid-stream. If you are analysing a capture sequence, stay with it until the dust settles — material counted, king safe, threats met. Only then return to the root and examine another candidate. That single habit upgrades calculation more than raw tactics flashcards. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Resolve this line first. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 4,
      "book": "kotov",
      "title": "Forcing moves first",
      "teach": "Order the tree: checks, captures, threats before quiet tries.",
      "hint": "Start with forcing moves.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "Forcing moves first",
      "about": "Kotov-style calculation — Forcing moves first.",
      "desc": "When several candidates exist, analyse forcing moves first. Checks and captures prune the tree because replies are limited. Quiet improving moves come later, once you know whether a forcing line already wins or loses. This ordering is practical Kotov: less time spent on decorative ideas that never compete with a concrete shot. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Start with forcing moves. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 5,
      "book": "kotov",
      "title": "Compare finished lines",
      "teach": "Never choose until at least two lines are fully evaluated.",
      "hint": "Compare, then decide.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Compare finished lines",
      "about": "Kotov-style calculation — Compare finished lines.",
      "desc": "A half-calculated brilliancy is not better than a fully understood solid move. Kotov insists on comparison of completed analyses. If candidate A ends in a clear plus and candidate B is still foggy, either finish B or reject it. Play the move whose finished tree you trust. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Compare, then decide. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 6,
      "book": "kotov",
      "title": "Variation notebook mind",
      "teach": "Mentally 'write' the key moves so you can reuse the work.",
      "hint": "Remember the spine of the line.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Variation notebook mind",
      "about": "Kotov-style calculation — Variation notebook mind.",
      "desc": "Grandmasters remember the spine of each variation — the critical captures and only-moves. Train that habit: after calculating, restate the main line in three to five plies. If you cannot recite it, you did not finish the branch. This drill builds the internal notebook Kotov described. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Remember the spine of the line. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 7,
      "book": "kotov",
      "title": "Critical position flag",
      "teach": "Know when a position demands deep calculation vs a plan move.",
      "hint": "Calculate deeply here.",
      "fen": "r1bqkb1r/pp1ppppp/2n2n2/2p5/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 4",
      "goal": "win",
      "theme": "Critical position flag",
      "about": "Kotov-style calculation — Critical position flag.",
      "desc": "Not every moment needs a Kotov tree. Flag critical positions: tactical contact, pawn breaks that change the structure, or decisions that trade a static plus for dynamics. Elsewhere, play by plan. Over-calculating quiet positions wastes energy; under-calculating critical ones loses games. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Calculate deeply here. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 8,
      "book": "kotov",
      "title": "Time allocation",
      "teach": "Spend clock where the tree is widest and the stakes highest.",
      "hint": "Invest time on this decision.",
      "fen": "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Time allocation",
      "about": "Kotov-style calculation — Time allocation.",
      "desc": "Kotov-linked practical advice: budget thinking time for positions with many candidates or irreversible captures. If only one move makes sense, play it and save minutes for later storms. Here the branching factor is high — this is where your clock should go. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Invest time on this decision. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 9,
      "book": "kotov",
      "title": "Eliminate refuted tries",
      "teach": "Cross out candidates that fail to one clear resource.",
      "hint": "Eliminate the busted try.",
      "fen": "rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 6",
      "goal": "win",
      "theme": "Eliminate refuted tries",
      "about": "Kotov-style calculation — Eliminate refuted tries.",
      "desc": "Once a candidate is refuted by a single accurate reply, mark it dead and do not reopen it without new information. Endless resurrection of dead lines is another form of branch-jumping. Elimination shrinks the tree so the remaining candidates get real depth. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Eliminate the busted try. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 10,
      "book": "kotov",
      "title": "Quiet candidate matters",
      "teach": "Include the quiet consolidating move among candidates.",
      "hint": "Consider the quiet option.",
      "fen": "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Quiet candidate matters",
      "about": "Kotov-style calculation — Quiet candidate matters.",
      "desc": "Amateurs list only checks and sacrifices. Kotov's list must include the best quiet move — the one that improves a piece or prevents a threat. Often the 'brilliant' line fails and the quiet candidate is simply best. Put it on the list from the start. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Consider the quiet option. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 11,
      "book": "kotov",
      "title": "Opponent's best reply",
      "teach": "Analyse their strongest answer, not the cooperative one.",
      "hint": "Assume best defense.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Opponent's best reply",
      "about": "Kotov-style calculation — Opponent's best reply.",
      "desc": "Every branch must assume best defense. Hope chess is calculating only the replies you want. Ask: if they play the most annoying legal move, does my idea still work? If not, the trunk is weaker than it looked. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Assume best defense. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 12,
      "book": "kotov",
      "title": "Stop when clear",
      "teach": "When a line is clearly winning or losing, stop and mark it.",
      "hint": "Stop — the eval is clear.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "Stop when clear",
      "about": "Kotov-style calculation — Stop when clear.",
      "desc": "Depth for its own sake is vanity. If a variation ends in forced mate or decisive material, stop. If it ends in a known drawn fortress, stop. Return to comparison. Extra plies after clarity are time stolen from other candidates. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Stop — the eval is clear. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 13,
      "book": "kotov",
      "title": "Recheck the root",
      "teach": "Before moving, glance once more at the starting position.",
      "hint": "Recheck, then play.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Recheck the root",
      "about": "Kotov-style calculation — Recheck the root.",
      "desc": "After deep diving, players blunder by forgetting a simple resource that existed at the root. Kotov-style hygiene: return to the board position (mentally), confirm your chosen move is still legal and that no immediate shot was missed, then play. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Recheck, then play. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 14,
      "book": "kotov",
      "title": "One idea, several moves",
      "teach": "Same plan may have multiple move orders — compare them.",
      "hint": "Pick the better move order.",
      "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      "goal": "win",
      "theme": "One idea, several moves",
      "about": "Kotov-style calculation — One idea, several moves.",
      "desc": "Often two candidates express the same idea with different move orders. Analyse both briefly: one may allow a zwischenzug, the other may prevent it. Move-order comparison is a small tree with a large payoff. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Pick the better move order. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 15,
      "book": "kotov",
      "title": "Tactical motif seed",
      "teach": "Spot the motif first, then grow the Kotov tree around it.",
      "hint": "Calculate the motif cleanly.",
      "fen": "rnbqk2r/pp2ppbp/5np1/2pp4/3P4/2P2NP1/PP2PP1P/RNBQKB1R w KQkq - 0 6",
      "goal": "win",
      "theme": "Tactical motif seed",
      "about": "Kotov-style calculation — Tactical motif seed.",
      "desc": "Motifs (pins, forks, clearances) are seeds. Once seen, list the concrete moves that use them as candidates, then analyse systematically. Do not let the motif seduce you into a single unfinished fantasy variation. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Calculate the motif cleanly. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 16,
      "book": "kotov",
      "title": "Defensive candidates",
      "teach": "When under pressure, candidates are saving moves — list them too.",
      "hint": "Find the saving candidate.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Defensive candidates",
      "about": "Kotov-style calculation — Defensive candidates.",
      "desc": "Kotov's method is not only for attacking. In trouble, list every plausible defense: exchanges, king runs, counterchecks. Analyse which one actually holds. Panic without a candidate list is how lost positions become resignations. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Find the saving candidate. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 17,
      "book": "kotov",
      "title": "Only-move awareness",
      "teach": "Sometimes the tree has one legal trunk that doesn't lose.",
      "hint": "Find the only move.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Only-move awareness",
      "about": "Kotov-style calculation — Only-move awareness.",
      "desc": "Recognising an only-move situation focuses calculation. If every alternative fails to a short refutation, invest deeply in the survivor. This is efficient Kotov: elimination first, depth second. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Find the only move. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 18,
      "book": "kotov",
      "title": "Evaluation vocabulary",
      "teach": "Finish each branch with a clear eval word, not a vibe.",
      "hint": "Eval the line clearly.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Evaluation vocabulary",
      "about": "Kotov-style calculation — Evaluation vocabulary.",
      "desc": "Replace 'looks nice' with concrete labels: winning, better, equal, worse, lost — ideally tied to material, king safety, or a forced continuation. Clean evals make comparison possible. Fuzzy vibes make you reopen dead branches. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Eval the line clearly. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 19,
      "book": "kotov",
      "title": "Avoid calculation addiction",
      "teach": "If no forcing contact exists, prefer a plan move.",
      "hint": "Play the planned move.",
      "fen": "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Avoid calculation addiction",
      "about": "Kotov-style calculation — Avoid calculation addiction.",
      "desc": "Kotov never demanded a tree for every quiet improving move. When the position is strategic and closed, choose a plan-consistent move quickly. Save full trees for contact positions. Balance is part of thinking like a grandmaster. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play the planned move. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 20,
      "book": "kotov",
      "title": "Tree of checks",
      "teach": "In mating attacks, the tree is mostly checks — organise them.",
      "hint": "Order the checking tree.",
      "fen": "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
      "goal": "win",
      "theme": "Tree of checks",
      "about": "Kotov-style calculation — Tree of checks.",
      "desc": "Mating attacks explode with checking options. List checking candidates by danger, analyse the fiercest first, and note when a quiet inclusion is needed to cover a flight square. Organised checking trees convert attacks; chaotic ones miss mates. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Order the checking tree. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 21,
      "book": "kotov",
      "title": "Material count mid-tree",
      "teach": "Track material after every capture in the variation.",
      "hint": "Keep the material tally.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Material count mid-tree",
      "about": "Kotov-style calculation — Material count mid-tree.",
      "desc": "Lost in a long capture sequence, players forget who is ahead. After each capture in your mental line, update the material balance. Kotov discipline includes bookkeeping — otherwise you 'win' a line that is actually down a piece. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Keep the material tally. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 22,
      "book": "kotov",
      "title": "King safety leaf",
      "teach": "End every branch with a king-safety check.",
      "hint": "Check king safety at the leaf.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "King safety leaf",
      "about": "Kotov-style calculation — King safety leaf.",
      "desc": "A variation that wins a pawn but leaves your king naked is not a success leaf. Before marking a branch 'plus', ask whether either king is suddenly exposed. Safety is part of the evaluation leaf Kotov wants you to record. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Check king safety at the leaf. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 23,
      "book": "kotov",
      "title": "Reuse prior work",
      "teach": "If a subvariation repeats, reuse the earlier conclusion.",
      "hint": "Reuse the known leaf.",
      "fen": "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Reuse prior work",
      "about": "Kotov-style calculation — Reuse prior work.",
      "desc": "Transpositions inside the tree should not be recalculated from scratch. If you already know a position is drawn or winning, graft that leaf onto the new branch. Efficiency is a grandmaster skill. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Reuse the known leaf. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 24,
      "book": "kotov",
      "title": "Practical selection",
      "teach": "When two lines are equal, pick the harder one for them.",
      "hint": "Choose the practical try.",
      "fen": "r1bqk2r/pp1pppbp/2n2np1/2p5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5",
      "goal": "win",
      "theme": "Practical selection",
      "about": "Kotov-style calculation — Practical selection.",
      "desc": "Kotov's method finds truth; practical play sometimes chooses among equals. If two finished lines evaluate the same, prefer the one that poses more problems or is easier for you to play. Mark that as a practical tie-break, not as deeper truth. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Choose the practical try. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 25,
      "book": "kotov",
      "title": "Blunder check habit",
      "teach": "After choosing, scan for a one-move refutation.",
      "hint": "Blunder-check, then move.",
      "fen": "r2q1rk1/ppp1ppbp/2np1np1/8/2PPP1b1/2N2N2/PP2BPPP/R1BQK2R w KQ - 4 8",
      "goal": "win",
      "theme": "Blunder check habit",
      "about": "Kotov-style calculation — Blunder check habit.",
      "desc": "The last Kotov hygiene step: your chosen move must not hang a piece or allow a trivial mate. A ten-minute tree ending in a one-move blunder is still a blunder. Spend five seconds on the root scan. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Blunder-check, then move. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 26,
      "book": "kotov",
      "title": "Wide then deep",
      "teach": "Breadth of candidates first; depth second.",
      "hint": "Widen, then deepen.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Wide then deep",
      "about": "Kotov-style calculation — Wide then deep.",
      "desc": "Amateurs go deep on move one. Kotov goes wide first. A short look at each candidate often kills most of them quickly; then depth is spent where it matters. Wide-then-deep is the tempo of professional calculation. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Widen, then deepen. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 27,
      "book": "kotov",
      "title": "Intermezzo branches",
      "teach": "Include zwischenzugs as separate candidate replies.",
      "hint": "Look for the intermezzo.",
      "fen": "r1bqk2r/pppp1ppp/2n1pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Intermezzo branches",
      "about": "Kotov-style calculation — Intermezzo branches.",
      "desc": "When analysing their reply, remember they may insert a check or capture before recapturing. Add those intermezzos as branches. Many 'winning' trees collapse to an in-between move you never listed. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Look for the intermezzo. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 28,
      "book": "kotov",
      "title": "Endgame leaf accuracy",
      "teach": "If the tree enters an ending, evaluate the ending properly.",
      "hint": "Eval the ending leaf.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Endgame leaf accuracy",
      "about": "Kotov-style calculation — Endgame leaf accuracy.",
      "desc": "A combination that 'wins a pawn' but enters a drawn rook ending is not a win. When your leaf is an ending, switch to endgame criteria: opposition, activity, pawn races. Kotov's tree is only as good as its leaf evaluations. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Eval the ending leaf. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 29,
      "book": "kotov",
      "title": "Training tempo",
      "teach": "In training, force yourself to verbalise candidates aloud.",
      "hint": "Say the candidates aloud.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/4R1K1 w - - 0 18",
      "goal": "win",
      "theme": "Training tempo",
      "about": "Kotov-style calculation — Training tempo.",
      "desc": "The drill for this lesson: before touching a piece, speak two or three candidates and one rejecting reason for each discarded idea. That verbal habit installs Kotov's method faster than silent wishing. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Say the candidates aloud. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 30,
      "book": "kotov",
      "title": "Method review",
      "teach": "Candidates → forcing order → finish branches → compare → blunder-check.",
      "hint": "Apply the full method.",
      "fen": "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Method review",
      "about": "Kotov-style calculation — Method review.",
      "desc": "Put the whole Kotov loop together on this board. List candidates, analyse forcing ones first, finish each branch, compare evaluations, choose, then blunder-check. Think Like a Grandmaster is a method book — this drill is the method under game pressure. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Apply the full method. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 31,
      "book": "kotov",
      "title": "Candidate pruning",
      "teach": "Discard illegal or obviously losing tries immediately.",
      "hint": "Prune the nonsense.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Candidate pruning",
      "about": "Kotov-style calculation — Candidate pruning.",
      "desc": "A candidate list should be serious. Moves that hang the queen without compensation are not candidates. Prune instantly so your mental RAM stays with real options. Kotov's method assumes adult filtering before deep work. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Prune the nonsense. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 32,
      "book": "kotov",
      "title": "Priority threats",
      "teach": "If they threaten mate in one, that threat dominates the tree.",
      "hint": "Meet the absolute threat.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Priority threats",
      "about": "Kotov-style calculation — Priority threats.",
      "desc": "Absolute threats collapse the tree: you must answer them. Candidates that ignore mate in one are dead on arrival. Identify forcing threats before artistic plans. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Meet the absolute threat. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 33,
      "book": "kotov",
      "title": "Capture sequence map",
      "teach": "Map the capture chain before entering it.",
      "hint": "Map captures first.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Capture sequence map",
      "about": "Kotov-style calculation — Capture sequence map.",
      "desc": "Before diving into a series of captures, list who takes what and on which squares. A capture map prevents getting lost mid-tree and makes material tallies reliable. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Map captures first. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 34,
      "book": "kotov",
      "title": "Check safety",
      "teach": "Every check you give must be checked for counterchecks.",
      "hint": "Watch for counterchecks.",
      "fen": "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Check safety",
      "about": "Kotov-style calculation — Check safety.",
      "desc": "Giving check feels forcing, but counterchecks can invert the evaluation. When a checking candidate appears, immediately look at checking replies. That branch often decides the true value of the attack. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Watch for counterchecks. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 35,
      "book": "kotov",
      "title": "Quiet inclusion",
      "teach": "Sometimes a quiet inclusion makes the forcing line work.",
      "hint": "Include the quiet prep move.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Quiet inclusion",
      "about": "Kotov-style calculation — Quiet inclusion.",
      "desc": "Classic attacking technique: a non-checking inclusion covers a flight square or cuts a defender, after which the forcing line wins. Put that inclusion on the candidate list; it is easy to miss if you only look at checks. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Include the quiet prep move. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 36,
      "book": "kotov",
      "title": "Draw branch honesty",
      "teach": "If a line is perpetual, label it draw — not 'unclear'.",
      "hint": "Label the perpetual draw.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Draw branch honesty",
      "about": "Kotov-style calculation — Draw branch honesty.",
      "desc": "Honest leaves matter. A perpetual is a draw leaf. Marking it 'unclear' keeps you recalculating forever. Kotov wants crisp labels so comparison is possible. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Label the perpetual draw. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 37,
      "book": "kotov",
      "title": "Complexity tax",
      "teach": "Prefer the simpler winning tree when both win.",
      "hint": "Prefer the clear win.",
      "fen": "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Complexity tax",
      "about": "Kotov-style calculation — Complexity tax.",
      "desc": "If two lines both win, choose the one with fewer only-moves and less hanging material. Complexity is a tax on your nerves and clock. Grandmaster calculation includes practical clarity. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Prefer the clear win. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 38,
      "book": "kotov",
      "title": "Update after new info",
      "teach": "If a discovery appears mid-tree, update candidates.",
      "hint": "Update the candidate list.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Update after new info",
      "about": "Kotov-style calculation — Update after new info.",
      "desc": "Sometimes deep in a line you notice a new resource available already at the root. Pause, add it as a fresh candidate, and restart breadth. Intellectual honesty beats stubborn loyalty to the first idea. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Update the candidate list. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 39,
      "book": "kotov",
      "title": "Short refutation habit",
      "teach": "Seek short busts before long dreams.",
      "hint": "Find the short bust.",
      "fen": "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Short refutation habit",
      "about": "Kotov-style calculation — Short refutation habit.",
      "desc": "Try to refute your own idea in two plies before investing ten. Short refutations are cheap. This keeps the Kotov tree lean and your optimism supervised. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Find the short bust. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 40,
      "book": "kotov",
      "title": "Synchronise plan and tree",
      "teach": "Candidates should serve the position's plan.",
      "hint": "Choose plan-consistent candidates.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 2 9",
      "goal": "win",
      "theme": "Synchronise plan and tree",
      "about": "Kotov-style calculation — Synchronise plan and tree.",
      "desc": "Random tactics disconnected from the pawn structure are usually mirages. Let the plan suggest candidates, then verify them with the tree. Kotov plus strategy beats raw calculation noise. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Choose plan-consistent candidates. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 41,
      "book": "kotov",
      "title": "Visual reset",
      "teach": "If confused, blink-reset to the root position.",
      "hint": "Reset to the root.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Visual reset",
      "about": "Kotov-style calculation — Visual reset.",
      "desc": "Lost visualisation is normal. Reset: picture the current board (or look at it), rebuild the line slowly, and continue. Pushing through fog produces ghost pieces and illegal leaves. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Reset to the root. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 42,
      "book": "kotov",
      "title": "Double-check critical leaf",
      "teach": "The leaf that decides the game deserves a second pass.",
      "hint": "Recheck the critical leaf.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Double-check critical leaf",
      "about": "Kotov-style calculation — Double-check critical leaf.",
      "desc": "When a single leaf claims 'winning' and that claim decides your move, recalculate that leaf once more. Critical leaves earn a double-check; routine leaves do not. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Recheck the critical leaf. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 43,
      "book": "kotov",
      "title": "Ignore crowd noise",
      "teach": "Do not let flashy sacrifices bully quieter candidates.",
      "hint": "Keep the quiet move listed.",
      "fen": "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Ignore crowd noise",
      "about": "Kotov-style calculation — Ignore crowd noise.",
      "desc": "Psychological bias loves sacrifices. Force the quiet consolidating move to remain on the list until it is properly compared. Many Kotov students overvalue glitter. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Keep the quiet move listed. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 44,
      "book": "kotov",
      "title": "Clock emergency mode",
      "teach": "With no time, shrink to forcing candidates only.",
      "hint": "Play the safest forcing move.",
      "fen": "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Clock emergency mode",
      "about": "Kotov-style calculation — Clock emergency mode.",
      "desc": "Zeitnot truncates the method: list only checks/captures that don't lose instantly, pick the safest. Perfect trees require time; emergency mode is still structured, not random. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play the safest forcing move. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 45,
      "book": "kotov",
      "title": "Post-mortem trees",
      "teach": "After games, rebuild the tree you should have made.",
      "hint": "Rebuild the missed tree.",
      "fen": "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14",
      "goal": "win",
      "theme": "Post-mortem trees",
      "about": "Kotov-style calculation — Post-mortem trees.",
      "desc": "Training tip tied to Kotov: in post-mortem, reconstruct the candidate list you skipped. This lesson asks you to practise that reconstruction live — list what you would analyse if this were your adjourned game. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Rebuild the missed tree. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 46,
      "book": "kotov",
      "title": "Branch labeling",
      "teach": "Label branches +/= / = / =+ / - so comparison is fast.",
      "hint": "Label the branch eval.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Branch labeling",
      "about": "Kotov-style calculation — Branch labeling.",
      "desc": "Symbolic evals speed comparison. Habit: after finishing a branch, stamp it with a clear symbol. When three trunks are labeled, the choice is often obvious without re-entering the fog. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Label the branch eval. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 47,
      "book": "kotov",
      "title": "Avoid infinite checks",
      "teach": "If checks never end, recognise perpetual or progress.",
      "hint": "Decide: perpetual or progress?",
      "fen": "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Avoid infinite checks",
      "about": "Kotov-style calculation — Avoid infinite checks.",
      "desc": "Endless checking trees need a question: am I progressing (mating net tightening) or looping (perpetual)? If looping, label draw and move on. If tightening, continue. Do not check forever out of inertia. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Decide: perpetual or progress? (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 48,
      "book": "kotov",
      "title": "Piece coordination leaf",
      "teach": "A leaf with uncoordinated pieces is worse than the material suggests.",
      "hint": "Value coordination at the leaf.",
      "fen": "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Piece coordination leaf",
      "about": "Kotov-style calculation — Piece coordination leaf.",
      "desc": "Evaluation includes harmony. Winning a pawn while your remaining pieces trip over each other may be only equality. Judge the leaf as a playable position, not a capture tally alone. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Value coordination at the leaf. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 49,
      "book": "kotov",
      "title": "Strategy after tactics",
      "teach": "When the tactics end, know the resulting plan.",
      "hint": "Plan the post-tactical position.",
      "fen": "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/2N2NP1/PP2PP1P/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Strategy after tactics",
      "about": "Kotov-style calculation — Strategy after tactics.",
      "desc": "A combination that leaves you without a plan can return the advantage. After the forcing line, ask what the new plan is. Kotov's leaf should include 'and then I play toward X'. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Plan the post-tactical position. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 50,
      "book": "kotov",
      "title": "Method seal",
      "teach": "Seal the habit: list, force, finish, compare, check.",
      "hint": "Seal the Kotov loop.",
      "fen": "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Method seal",
      "about": "Kotov-style calculation — Method seal.",
      "desc": "Final Kotov drill: run the complete loop once, cleanly, without skipping steps. Think Like a Grandmaster is remembered for candidate moves — this position is your practice exam. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Seal the Kotov loop. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 51,
      "book": "kotov",
      "title": "Candidate moves (2)",
      "teach": "List every serious candidate before diving deep into any one line.",
      "hint": "Name candidates, then choose.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Candidate moves",
      "about": "Kotov-style calculation — Candidate moves.",
      "desc": "Kotov's method starts with discipline: write (or mentally list) the candidate moves that could reasonably change the evaluation. Only after the list is complete do you analyse each branch. This stops the classic amateur habit of calculating one shiny idea forever while missing a simpler win. In this position, pause, list two or three real options, then play the one that survives comparison. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Name candidates, then choose. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 52,
      "book": "kotov",
      "title": "Analysis tree (2)",
      "teach": "Build a clean tree — one branch at a time, then compare trunks.",
      "hint": "Finish one branch before hopping.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Analysis tree",
      "about": "Kotov-style calculation — Analysis tree.",
      "desc": "Kotov pictured calculation as a tree: each candidate is a trunk, each reply a branch. Jumping between unfinished branches creates 'kotov syndrome' — returning again and again without a decision. Force yourself to finish a line to a quiet position or a clear eval, mark it, then move to the next candidate. The move you play is the trunk with the best finished evaluation. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Finish one branch before hopping. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 53,
      "book": "kotov",
      "title": "Don't jump branches (2)",
      "teach": "Stay on the current variation until it resolves.",
      "hint": "Resolve this line first.",
      "fen": "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
      "goal": "win",
      "theme": "Don't jump branches",
      "about": "Kotov-style calculation — Don't jump branches.",
      "desc": "The disease of restless calculation is switching lines mid-stream. If you are analysing a capture sequence, stay with it until the dust settles — material counted, king safe, threats met. Only then return to the root and examine another candidate. That single habit upgrades calculation more than raw tactics flashcards. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Resolve this line first. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 54,
      "book": "kotov",
      "title": "Forcing moves first (2)",
      "teach": "Order the tree: checks, captures, threats before quiet tries.",
      "hint": "Start with forcing moves.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "Forcing moves first",
      "about": "Kotov-style calculation — Forcing moves first.",
      "desc": "When several candidates exist, analyse forcing moves first. Checks and captures prune the tree because replies are limited. Quiet improving moves come later, once you know whether a forcing line already wins or loses. This ordering is practical Kotov: less time spent on decorative ideas that never compete with a concrete shot. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Start with forcing moves. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 55,
      "book": "kotov",
      "title": "Compare finished lines (2)",
      "teach": "Never choose until at least two lines are fully evaluated.",
      "hint": "Compare, then decide.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Compare finished lines",
      "about": "Kotov-style calculation — Compare finished lines.",
      "desc": "A half-calculated brilliancy is not better than a fully understood solid move. Kotov insists on comparison of completed analyses. If candidate A ends in a clear plus and candidate B is still foggy, either finish B or reject it. Play the move whose finished tree you trust. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Compare, then decide. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 56,
      "book": "kotov",
      "title": "Variation notebook mind (2)",
      "teach": "Mentally 'write' the key moves so you can reuse the work.",
      "hint": "Remember the spine of the line.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Variation notebook mind",
      "about": "Kotov-style calculation — Variation notebook mind.",
      "desc": "Grandmasters remember the spine of each variation — the critical captures and only-moves. Train that habit: after calculating, restate the main line in three to five plies. If you cannot recite it, you did not finish the branch. This drill builds the internal notebook Kotov described. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Remember the spine of the line. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 57,
      "book": "kotov",
      "title": "Critical position flag (2)",
      "teach": "Know when a position demands deep calculation vs a plan move.",
      "hint": "Calculate deeply here.",
      "fen": "r1bqkb1r/pp1ppppp/2n2n2/2p5/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 4",
      "goal": "win",
      "theme": "Critical position flag",
      "about": "Kotov-style calculation — Critical position flag.",
      "desc": "Not every moment needs a Kotov tree. Flag critical positions: tactical contact, pawn breaks that change the structure, or decisions that trade a static plus for dynamics. Elsewhere, play by plan. Over-calculating quiet positions wastes energy; under-calculating critical ones loses games. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Calculate deeply here. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 58,
      "book": "kotov",
      "title": "Time allocation (2)",
      "teach": "Spend clock where the tree is widest and the stakes highest.",
      "hint": "Invest time on this decision.",
      "fen": "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Time allocation",
      "about": "Kotov-style calculation — Time allocation.",
      "desc": "Kotov-linked practical advice: budget thinking time for positions with many candidates or irreversible captures. If only one move makes sense, play it and save minutes for later storms. Here the branching factor is high — this is where your clock should go. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Invest time on this decision. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 59,
      "book": "kotov",
      "title": "Eliminate refuted tries (2)",
      "teach": "Cross out candidates that fail to one clear resource.",
      "hint": "Eliminate the busted try.",
      "fen": "rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 6",
      "goal": "win",
      "theme": "Eliminate refuted tries",
      "about": "Kotov-style calculation — Eliminate refuted tries.",
      "desc": "Once a candidate is refuted by a single accurate reply, mark it dead and do not reopen it without new information. Endless resurrection of dead lines is another form of branch-jumping. Elimination shrinks the tree so the remaining candidates get real depth. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Eliminate the busted try. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 60,
      "book": "kotov",
      "title": "Quiet candidate matters (2)",
      "teach": "Include the quiet consolidating move among candidates.",
      "hint": "Consider the quiet option.",
      "fen": "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Quiet candidate matters",
      "about": "Kotov-style calculation — Quiet candidate matters.",
      "desc": "Amateurs list only checks and sacrifices. Kotov's list must include the best quiet move — the one that improves a piece or prevents a threat. Often the 'brilliant' line fails and the quiet candidate is simply best. Put it on the list from the start. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Consider the quiet option. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 61,
      "book": "kotov",
      "title": "Opponent's best reply (2)",
      "teach": "Analyse their strongest answer, not the cooperative one.",
      "hint": "Assume best defense.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Opponent's best reply",
      "about": "Kotov-style calculation — Opponent's best reply.",
      "desc": "Every branch must assume best defense. Hope chess is calculating only the replies you want. Ask: if they play the most annoying legal move, does my idea still work? If not, the trunk is weaker than it looked. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Assume best defense. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 62,
      "book": "kotov",
      "title": "Stop when clear (2)",
      "teach": "When a line is clearly winning or losing, stop and mark it.",
      "hint": "Stop — the eval is clear.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "Stop when clear",
      "about": "Kotov-style calculation — Stop when clear.",
      "desc": "Depth for its own sake is vanity. If a variation ends in forced mate or decisive material, stop. If it ends in a known drawn fortress, stop. Return to comparison. Extra plies after clarity are time stolen from other candidates. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Stop — the eval is clear. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 63,
      "book": "kotov",
      "title": "Recheck the root (2)",
      "teach": "Before moving, glance once more at the starting position.",
      "hint": "Recheck, then play.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Recheck the root",
      "about": "Kotov-style calculation — Recheck the root.",
      "desc": "After deep diving, players blunder by forgetting a simple resource that existed at the root. Kotov-style hygiene: return to the board position (mentally), confirm your chosen move is still legal and that no immediate shot was missed, then play. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Recheck, then play. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 64,
      "book": "kotov",
      "title": "One idea, several moves (2)",
      "teach": "Same plan may have multiple move orders — compare them.",
      "hint": "Pick the better move order.",
      "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      "goal": "win",
      "theme": "One idea, several moves",
      "about": "Kotov-style calculation — One idea, several moves.",
      "desc": "Often two candidates express the same idea with different move orders. Analyse both briefly: one may allow a zwischenzug, the other may prevent it. Move-order comparison is a small tree with a large payoff. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Pick the better move order. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 65,
      "book": "kotov",
      "title": "Tactical motif seed (2)",
      "teach": "Spot the motif first, then grow the Kotov tree around it.",
      "hint": "Calculate the motif cleanly.",
      "fen": "rnbqk2r/pp2ppbp/5np1/2pp4/3P4/2P2NP1/PP2PP1P/RNBQKB1R w KQkq - 0 6",
      "goal": "win",
      "theme": "Tactical motif seed",
      "about": "Kotov-style calculation — Tactical motif seed.",
      "desc": "Motifs (pins, forks, clearances) are seeds. Once seen, list the concrete moves that use them as candidates, then analyse systematically. Do not let the motif seduce you into a single unfinished fantasy variation. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Calculate the motif cleanly. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 66,
      "book": "kotov",
      "title": "Defensive candidates (2)",
      "teach": "When under pressure, candidates are saving moves — list them too.",
      "hint": "Find the saving candidate.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Defensive candidates",
      "about": "Kotov-style calculation — Defensive candidates.",
      "desc": "Kotov's method is not only for attacking. In trouble, list every plausible defense: exchanges, king runs, counterchecks. Analyse which one actually holds. Panic without a candidate list is how lost positions become resignations. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Find the saving candidate. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 67,
      "book": "kotov",
      "title": "Only-move awareness (2)",
      "teach": "Sometimes the tree has one legal trunk that doesn't lose.",
      "hint": "Find the only move.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Only-move awareness",
      "about": "Kotov-style calculation — Only-move awareness.",
      "desc": "Recognising an only-move situation focuses calculation. If every alternative fails to a short refutation, invest deeply in the survivor. This is efficient Kotov: elimination first, depth second. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Find the only move. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 68,
      "book": "kotov",
      "title": "Evaluation vocabulary (2)",
      "teach": "Finish each branch with a clear eval word, not a vibe.",
      "hint": "Eval the line clearly.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Evaluation vocabulary",
      "about": "Kotov-style calculation — Evaluation vocabulary.",
      "desc": "Replace 'looks nice' with concrete labels: winning, better, equal, worse, lost — ideally tied to material, king safety, or a forced continuation. Clean evals make comparison possible. Fuzzy vibes make you reopen dead branches. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Eval the line clearly. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 69,
      "book": "kotov",
      "title": "Avoid calculation addiction (2)",
      "teach": "If no forcing contact exists, prefer a plan move.",
      "hint": "Play the planned move.",
      "fen": "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Avoid calculation addiction",
      "about": "Kotov-style calculation — Avoid calculation addiction.",
      "desc": "Kotov never demanded a tree for every quiet improving move. When the position is strategic and closed, choose a plan-consistent move quickly. Save full trees for contact positions. Balance is part of thinking like a grandmaster. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play the planned move. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 70,
      "book": "kotov",
      "title": "Tree of checks (2)",
      "teach": "In mating attacks, the tree is mostly checks — organise them.",
      "hint": "Order the checking tree.",
      "fen": "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
      "goal": "win",
      "theme": "Tree of checks",
      "about": "Kotov-style calculation — Tree of checks.",
      "desc": "Mating attacks explode with checking options. List checking candidates by danger, analyse the fiercest first, and note when a quiet inclusion is needed to cover a flight square. Organised checking trees convert attacks; chaotic ones miss mates. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Order the checking tree. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 71,
      "book": "kotov",
      "title": "Material count mid-tree (2)",
      "teach": "Track material after every capture in the variation.",
      "hint": "Keep the material tally.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Material count mid-tree",
      "about": "Kotov-style calculation — Material count mid-tree.",
      "desc": "Lost in a long capture sequence, players forget who is ahead. After each capture in your mental line, update the material balance. Kotov discipline includes bookkeeping — otherwise you 'win' a line that is actually down a piece. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Keep the material tally. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 72,
      "book": "kotov",
      "title": "King safety leaf (2)",
      "teach": "End every branch with a king-safety check.",
      "hint": "Check king safety at the leaf.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "King safety leaf",
      "about": "Kotov-style calculation — King safety leaf.",
      "desc": "A variation that wins a pawn but leaves your king naked is not a success leaf. Before marking a branch 'plus', ask whether either king is suddenly exposed. Safety is part of the evaluation leaf Kotov wants you to record. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Check king safety at the leaf. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 73,
      "book": "kotov",
      "title": "Reuse prior work (2)",
      "teach": "If a subvariation repeats, reuse the earlier conclusion.",
      "hint": "Reuse the known leaf.",
      "fen": "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Reuse prior work",
      "about": "Kotov-style calculation — Reuse prior work.",
      "desc": "Transpositions inside the tree should not be recalculated from scratch. If you already know a position is drawn or winning, graft that leaf onto the new branch. Efficiency is a grandmaster skill. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Reuse the known leaf. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 74,
      "book": "kotov",
      "title": "Practical selection (2)",
      "teach": "When two lines are equal, pick the harder one for them.",
      "hint": "Choose the practical try.",
      "fen": "r1bqk2r/pp1pppbp/2n2np1/2p5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5",
      "goal": "win",
      "theme": "Practical selection",
      "about": "Kotov-style calculation — Practical selection.",
      "desc": "Kotov's method finds truth; practical play sometimes chooses among equals. If two finished lines evaluate the same, prefer the one that poses more problems or is easier for you to play. Mark that as a practical tie-break, not as deeper truth. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Choose the practical try. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 75,
      "book": "kotov",
      "title": "Blunder check habit (2)",
      "teach": "After choosing, scan for a one-move refutation.",
      "hint": "Blunder-check, then move.",
      "fen": "r2q1rk1/ppp1ppbp/2np1np1/8/2PPP1b1/2N2N2/PP2BPPP/R1BQK2R w KQ - 4 8",
      "goal": "win",
      "theme": "Blunder check habit",
      "about": "Kotov-style calculation — Blunder check habit.",
      "desc": "The last Kotov hygiene step: your chosen move must not hang a piece or allow a trivial mate. A ten-minute tree ending in a one-move blunder is still a blunder. Spend five seconds on the root scan. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Blunder-check, then move. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 76,
      "book": "kotov",
      "title": "Wide then deep (2)",
      "teach": "Breadth of candidates first; depth second.",
      "hint": "Widen, then deepen.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Wide then deep",
      "about": "Kotov-style calculation — Wide then deep.",
      "desc": "Amateurs go deep on move one. Kotov goes wide first. A short look at each candidate often kills most of them quickly; then depth is spent where it matters. Wide-then-deep is the tempo of professional calculation. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Widen, then deepen. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 77,
      "book": "kotov",
      "title": "Intermezzo branches (2)",
      "teach": "Include zwischenzugs as separate candidate replies.",
      "hint": "Look for the intermezzo.",
      "fen": "r1bqk2r/pppp1ppp/2n1pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Intermezzo branches",
      "about": "Kotov-style calculation — Intermezzo branches.",
      "desc": "When analysing their reply, remember they may insert a check or capture before recapturing. Add those intermezzos as branches. Many 'winning' trees collapse to an in-between move you never listed. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Look for the intermezzo. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 78,
      "book": "kotov",
      "title": "Endgame leaf accuracy (2)",
      "teach": "If the tree enters an ending, evaluate the ending properly.",
      "hint": "Eval the ending leaf.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Endgame leaf accuracy",
      "about": "Kotov-style calculation — Endgame leaf accuracy.",
      "desc": "A combination that 'wins a pawn' but enters a drawn rook ending is not a win. When your leaf is an ending, switch to endgame criteria: opposition, activity, pawn races. Kotov's tree is only as good as its leaf evaluations. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Eval the ending leaf. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 79,
      "book": "kotov",
      "title": "Training tempo (2)",
      "teach": "In training, force yourself to verbalise candidates aloud.",
      "hint": "Say the candidates aloud.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/4R1K1 w - - 0 18",
      "goal": "win",
      "theme": "Training tempo",
      "about": "Kotov-style calculation — Training tempo.",
      "desc": "The drill for this lesson: before touching a piece, speak two or three candidates and one rejecting reason for each discarded idea. That verbal habit installs Kotov's method faster than silent wishing. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Say the candidates aloud. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 80,
      "book": "kotov",
      "title": "Method review (2)",
      "teach": "Candidates → forcing order → finish branches → compare → blunder-check.",
      "hint": "Apply the full method.",
      "fen": "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Method review",
      "about": "Kotov-style calculation — Method review.",
      "desc": "Put the whole Kotov loop together on this board. List candidates, analyse forcing ones first, finish each branch, compare evaluations, choose, then blunder-check. Think Like a Grandmaster is a method book — this drill is the method under game pressure. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Apply the full method. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 81,
      "book": "kotov",
      "title": "Candidate pruning (2)",
      "teach": "Discard illegal or obviously losing tries immediately.",
      "hint": "Prune the nonsense.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Candidate pruning",
      "about": "Kotov-style calculation — Candidate pruning.",
      "desc": "A candidate list should be serious. Moves that hang the queen without compensation are not candidates. Prune instantly so your mental RAM stays with real options. Kotov's method assumes adult filtering before deep work. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Prune the nonsense. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 82,
      "book": "kotov",
      "title": "Priority threats (2)",
      "teach": "If they threaten mate in one, that threat dominates the tree.",
      "hint": "Meet the absolute threat.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Priority threats",
      "about": "Kotov-style calculation — Priority threats.",
      "desc": "Absolute threats collapse the tree: you must answer them. Candidates that ignore mate in one are dead on arrival. Identify forcing threats before artistic plans. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Meet the absolute threat. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 83,
      "book": "kotov",
      "title": "Capture sequence map (2)",
      "teach": "Map the capture chain before entering it.",
      "hint": "Map captures first.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Capture sequence map",
      "about": "Kotov-style calculation — Capture sequence map.",
      "desc": "Before diving into a series of captures, list who takes what and on which squares. A capture map prevents getting lost mid-tree and makes material tallies reliable. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Map captures first. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 84,
      "book": "kotov",
      "title": "Check safety (2)",
      "teach": "Every check you give must be checked for counterchecks.",
      "hint": "Watch for counterchecks.",
      "fen": "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Check safety",
      "about": "Kotov-style calculation — Check safety.",
      "desc": "Giving check feels forcing, but counterchecks can invert the evaluation. When a checking candidate appears, immediately look at checking replies. That branch often decides the true value of the attack. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Watch for counterchecks. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 85,
      "book": "kotov",
      "title": "Quiet inclusion (2)",
      "teach": "Sometimes a quiet inclusion makes the forcing line work.",
      "hint": "Include the quiet prep move.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Quiet inclusion",
      "about": "Kotov-style calculation — Quiet inclusion.",
      "desc": "Classic attacking technique: a non-checking inclusion covers a flight square or cuts a defender, after which the forcing line wins. Put that inclusion on the candidate list; it is easy to miss if you only look at checks. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Include the quiet prep move. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 86,
      "book": "kotov",
      "title": "Draw branch honesty (2)",
      "teach": "If a line is perpetual, label it draw — not 'unclear'.",
      "hint": "Label the perpetual draw.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Draw branch honesty",
      "about": "Kotov-style calculation — Draw branch honesty.",
      "desc": "Honest leaves matter. A perpetual is a draw leaf. Marking it 'unclear' keeps you recalculating forever. Kotov wants crisp labels so comparison is possible. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Label the perpetual draw. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 87,
      "book": "kotov",
      "title": "Complexity tax (2)",
      "teach": "Prefer the simpler winning tree when both win.",
      "hint": "Prefer the clear win.",
      "fen": "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Complexity tax",
      "about": "Kotov-style calculation — Complexity tax.",
      "desc": "If two lines both win, choose the one with fewer only-moves and less hanging material. Complexity is a tax on your nerves and clock. Grandmaster calculation includes practical clarity. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Prefer the clear win. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 88,
      "book": "kotov",
      "title": "Update after new info (2)",
      "teach": "If a discovery appears mid-tree, update candidates.",
      "hint": "Update the candidate list.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Update after new info",
      "about": "Kotov-style calculation — Update after new info.",
      "desc": "Sometimes deep in a line you notice a new resource available already at the root. Pause, add it as a fresh candidate, and restart breadth. Intellectual honesty beats stubborn loyalty to the first idea. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Update the candidate list. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 89,
      "book": "kotov",
      "title": "Short refutation habit (2)",
      "teach": "Seek short busts before long dreams.",
      "hint": "Find the short bust.",
      "fen": "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Short refutation habit",
      "about": "Kotov-style calculation — Short refutation habit.",
      "desc": "Try to refute your own idea in two plies before investing ten. Short refutations are cheap. This keeps the Kotov tree lean and your optimism supervised. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Find the short bust. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 90,
      "book": "kotov",
      "title": "Synchronise plan and tree (2)",
      "teach": "Candidates should serve the position's plan.",
      "hint": "Choose plan-consistent candidates.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 2 9",
      "goal": "win",
      "theme": "Synchronise plan and tree",
      "about": "Kotov-style calculation — Synchronise plan and tree.",
      "desc": "Random tactics disconnected from the pawn structure are usually mirages. Let the plan suggest candidates, then verify them with the tree. Kotov plus strategy beats raw calculation noise. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Choose plan-consistent candidates. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 91,
      "book": "kotov",
      "title": "Visual reset (2)",
      "teach": "If confused, blink-reset to the root position.",
      "hint": "Reset to the root.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Visual reset",
      "about": "Kotov-style calculation — Visual reset.",
      "desc": "Lost visualisation is normal. Reset: picture the current board (or look at it), rebuild the line slowly, and continue. Pushing through fog produces ghost pieces and illegal leaves. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Reset to the root. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 92,
      "book": "kotov",
      "title": "Double-check critical leaf (2)",
      "teach": "The leaf that decides the game deserves a second pass.",
      "hint": "Recheck the critical leaf.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Double-check critical leaf",
      "about": "Kotov-style calculation — Double-check critical leaf.",
      "desc": "When a single leaf claims 'winning' and that claim decides your move, recalculate that leaf once more. Critical leaves earn a double-check; routine leaves do not. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Recheck the critical leaf. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 93,
      "book": "kotov",
      "title": "Ignore crowd noise (2)",
      "teach": "Do not let flashy sacrifices bully quieter candidates.",
      "hint": "Keep the quiet move listed.",
      "fen": "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Ignore crowd noise",
      "about": "Kotov-style calculation — Ignore crowd noise.",
      "desc": "Psychological bias loves sacrifices. Force the quiet consolidating move to remain on the list until it is properly compared. Many Kotov students overvalue glitter. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Keep the quiet move listed. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 94,
      "book": "kotov",
      "title": "Clock emergency mode (2)",
      "teach": "With no time, shrink to forcing candidates only.",
      "hint": "Play the safest forcing move.",
      "fen": "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Clock emergency mode",
      "about": "Kotov-style calculation — Clock emergency mode.",
      "desc": "Zeitnot truncates the method: list only checks/captures that don't lose instantly, pick the safest. Perfect trees require time; emergency mode is still structured, not random. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play the safest forcing move. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 95,
      "book": "kotov",
      "title": "Post-mortem trees (2)",
      "teach": "After games, rebuild the tree you should have made.",
      "hint": "Rebuild the missed tree.",
      "fen": "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14",
      "goal": "win",
      "theme": "Post-mortem trees",
      "about": "Kotov-style calculation — Post-mortem trees.",
      "desc": "Training tip tied to Kotov: in post-mortem, reconstruct the candidate list you skipped. This lesson asks you to practise that reconstruction live — list what you would analyse if this were your adjourned game. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Rebuild the missed tree. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 96,
      "book": "kotov",
      "title": "Branch labeling (2)",
      "teach": "Label branches +/= / = / =+ / - so comparison is fast.",
      "hint": "Label the branch eval.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Branch labeling",
      "about": "Kotov-style calculation — Branch labeling.",
      "desc": "Symbolic evals speed comparison. Habit: after finishing a branch, stamp it with a clear symbol. When three trunks are labeled, the choice is often obvious without re-entering the fog. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Label the branch eval. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 97,
      "book": "kotov",
      "title": "Avoid infinite checks (2)",
      "teach": "If checks never end, recognise perpetual or progress.",
      "hint": "Decide: perpetual or progress?",
      "fen": "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Avoid infinite checks",
      "about": "Kotov-style calculation — Avoid infinite checks.",
      "desc": "Endless checking trees need a question: am I progressing (mating net tightening) or looping (perpetual)? If looping, label draw and move on. If tightening, continue. Do not check forever out of inertia. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Decide: perpetual or progress? (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 98,
      "book": "kotov",
      "title": "Piece coordination leaf (2)",
      "teach": "A leaf with uncoordinated pieces is worse than the material suggests.",
      "hint": "Value coordination at the leaf.",
      "fen": "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Piece coordination leaf",
      "about": "Kotov-style calculation — Piece coordination leaf.",
      "desc": "Evaluation includes harmony. Winning a pawn while your remaining pieces trip over each other may be only equality. Judge the leaf as a playable position, not a capture tally alone. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Value coordination at the leaf. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 99,
      "book": "kotov",
      "title": "Strategy after tactics (2)",
      "teach": "When the tactics end, know the resulting plan.",
      "hint": "Plan the post-tactical position.",
      "fen": "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/2N2NP1/PP2PP1P/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Strategy after tactics",
      "about": "Kotov-style calculation — Strategy after tactics.",
      "desc": "A combination that leaves you without a plan can return the advantage. After the forcing line, ask what the new plan is. Kotov's leaf should include 'and then I play toward X'. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Plan the post-tactical position. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 100,
      "book": "kotov",
      "title": "Method seal (2)",
      "teach": "Seal the habit: list, force, finish, compare, check.",
      "hint": "Seal the Kotov loop.",
      "fen": "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Method seal",
      "about": "Kotov-style calculation — Method seal.",
      "desc": "Final Kotov drill: run the complete loop once, cleanly, without skipping steps. Think Like a Grandmaster is remembered for candidate moves — this position is your practice exam. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Seal the Kotov loop. (Think Like a Grandmaster–style · calculation method ≈1700+)",
      "pitfalls": []
    },
    {
      "n": 101,
      "book": "fischer",
      "title": "Concrete first",
      "teach": "Fischer excelled by making the position answer concrete questions.",
      "hint": "Play the concrete best move.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Concrete first",
      "about": "Fischer-style annotated thinking — Concrete first.",
      "desc": "My 60 Memorable Games shows a champion who asks: what is the truth here, move by move? Prefer the concrete continuation that improves your pieces or wins material over vague 'pressure'. Annotate your choice as Fischer might: a clear reason, not a mood. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play the concrete best move. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 102,
      "book": "fischer",
      "title": "Development with bite",
      "teach": "Develop with threats — not empty developing moves.",
      "hint": "Develop and threaten.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Development with bite",
      "about": "Fischer-style annotated thinking — Development with bite.",
      "desc": "Fischer's early play often develops while posing problems. When several developing moves exist, choose the one that also hits something or restricts them. Empty development is how the initiative slips. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Develop and threaten. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 103,
      "book": "fischer",
      "title": "King safety absolute",
      "teach": "If the king is unsafe, everything else waits.",
      "hint": "Secure or punish the king.",
      "fen": "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
      "goal": "win",
      "theme": "King safety absolute",
      "about": "Fischer-style annotated thinking — King safety absolute.",
      "desc": "Across the Memorable Games, king safety decisions are ruthless. Castle when needed; punish uncastled kings without delay. Do not chase a queenside pawn while the centre is exploding toward your monarch. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Secure or punish the king. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 104,
      "book": "fischer",
      "title": "Bishop pair respect",
      "teach": "Fischer loved bishops — open the position when you have them.",
      "hint": "Use or hunt the bishop pair.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "Bishop pair respect",
      "about": "Fischer-style annotated thinking — Bishop pair respect.",
      "desc": "Many Fischer annotations emphasise the bishop pair's long-term sting. If you have two bishops, consider timely pawn breaks that open diagonals. If they have them, restrain the openings or trade one off. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Use or hunt the bishop pair. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 105,
      "book": "fischer",
      "title": "Knight outposts",
      "teach": "Plant knights on squares pawns cannot easily chase.",
      "hint": "Occupy the outpost.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Knight outposts",
      "about": "Fischer-style annotated thinking — Knight outposts.",
      "desc": "Fischer's pieces land on ideal squares and stay there. Identify the hole in their camp and the route your knight takes to it. Outposts are not decorative — they justify whole plans. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Occupy the outpost. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 106,
      "book": "fischer",
      "title": "Exchange only with reason",
      "teach": "Trade when the resulting structure or activity favors you.",
      "hint": "Trade on your terms.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Exchange only with reason",
      "about": "Fischer-style annotated thinking — Exchange only with reason.",
      "desc": "Memorable Games is full of precise exchanges: remove their active piece, keep your monster, or head for a won ending. Ask what the trade changes before you click pieces off. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Trade on your terms. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 107,
      "book": "fischer",
      "title": "Initiative retention",
      "teach": "After a gain, keep asking questions of their position.",
      "hint": "Keep the initiative.",
      "fen": "r1bqkb1r/pp1ppppp/2n2n2/2p5/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 4",
      "goal": "win",
      "theme": "Initiative retention",
      "about": "Fischer-style annotated thinking — Initiative retention.",
      "desc": "Fischer rarely lets the opponent breathe after a concession. If you have won a pawn or a bind, find the next threatening move. Consolidation is sometimes needed — but passivity returns the gift. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Keep the initiative. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 108,
      "book": "fischer",
      "title": "Poisoned pawn caution",
      "teach": "Some pawns are bait; calculate before grabbing.",
      "hint": "Take only if calculated.",
      "fen": "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Poisoned pawn caution",
      "about": "Fischer-style annotated thinking — Poisoned pawn caution.",
      "desc": "The Poisoned Pawn Najdorf chapter alone teaches respect for bait. If a pawn looks free, list the forcing replies that punish greed. Grab it only when your tree says you survive. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Take only if calculated. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 109,
      "book": "fischer",
      "title": "Central control",
      "teach": "Occupy or pressure the centre before wing adventures.",
      "hint": "Play in/through the centre.",
      "fen": "rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 6",
      "goal": "win",
      "theme": "Central control",
      "about": "Fischer-style annotated thinking — Central control.",
      "desc": "Fischer's games repeatedly show central clarity enabling wing attacks. If the centre is unstable, fix it or dominate it before launching a speculative flank pawn storm. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play in/through the centre. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 110,
      "book": "fischer",
      "title": "Endgame technique appetite",
      "teach": "Simplify into endings you can play accurately.",
      "hint": "Head for the clear ending.",
      "fen": "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Endgame technique appetite",
      "about": "Fischer-style annotated thinking — Endgame technique appetite.",
      "desc": "Fischer converted advantages with ending precision. When ahead, ask whether a clean ending is available. Technical wins beat swashbuckling chances that risk the point. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Head for the clear ending. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 111,
      "book": "fischer",
      "title": "Opening conviction",
      "teach": "Play openings you understand deeply — systems with plans.",
      "hint": "Follow a known plan.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Opening conviction",
      "about": "Fischer-style annotated thinking — Opening conviction.",
      "desc": "The Memorable Games annotations reveal deep opening preparation married to plans. In this structure, play the typical continuation you would trust in a match, not a one-off experiment. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Follow a known plan. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 112,
      "book": "fischer",
      "title": "Tactical alertness",
      "teach": "Stay awake — Fischer finished games with sudden shots.",
      "hint": "Find the tactical shot.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "Tactical alertness",
      "about": "Fischer-style annotated thinking — Tactical alertness.",
      "desc": "Strategic builds in his games often end with a concrete blow. After improving pieces, scan for tactics. The champion's thinking mixes long plans with immediate geometry. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Find the tactical shot. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 113,
      "book": "fischer",
      "title": "Prophylaxis lite",
      "teach": "Stop their only counterplay before it starts.",
      "hint": "Kill the counteridea.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Prophylaxis lite",
      "about": "Fischer-style annotated thinking — Prophylaxis lite.",
      "desc": "Even in attacking games, Fischer snuffs the opponent's idea. Ask what they want (a break, a piece lift) and meet it a move earlier. Small prophylaxes keep big advantages. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Kill the counteridea. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 114,
      "book": "fischer",
      "title": "Passed pawn push",
      "teach": "Create and escort passers — they decide many of his wins.",
      "hint": "Create/escort the passer.",
      "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      "goal": "win",
      "theme": "Passed pawn push",
      "about": "Fischer-style annotated thinking — Passed pawn push.",
      "desc": "Study how Fischer's passers advance with piece support. If you can create an outside or protected passer, calculate the escort path. Passed pawns are his favourite long-term weapon. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Create/escort the passer. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 115,
      "book": "fischer",
      "title": "Rook activity",
      "teach": "Rooks belong on open files and the seventh rank.",
      "hint": "Activate the rook.",
      "fen": "rnbqk2r/pp2ppbp/5np1/2pp4/3P4/2P2NP1/PP2PP1P/RNBQKB1R w KQkq - 0 6",
      "goal": "win",
      "theme": "Rook activity",
      "about": "Fischer-style annotated thinking — Rook activity.",
      "desc": "Annotations frequently praise rook activity over passive defence of pawns. If a rook can reach the seventh or seize a file, that often outweighs a pawn. Play for activity. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Activate the rook. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 116,
      "book": "fischer",
      "title": "Punish passivity",
      "teach": "If they play without a plan, seize space and initiative.",
      "hint": "Punish the slow setup.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Punish passivity",
      "about": "Fischer-style annotated thinking — Punish passivity.",
      "desc": "Fischer crushed opponents who drifted. When their last few moves lack a threat or a plan, accelerate: gain space, open lines, or fix weaknesses. Momentum is a weapon. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Punish the slow setup. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 117,
      "book": "fischer",
      "title": "Accurate liquidation",
      "teach": "Trade into a won pawn ending only after counting.",
      "hint": "Count, then liquidate.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Accurate liquidation",
      "about": "Fischer-style annotated thinking — Accurate liquidation.",
      "desc": "Before the last piece trade, count the pawn ending as Fischer would — tempi, opposition, outside passers. Memorable Games celebrates clean liquidations, not hopeful ones. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Count, then liquidate. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 118,
      "book": "fischer",
      "title": "Square color strategy",
      "teach": "Control the complex their bishop cannot contest.",
      "hint": "Dominate the soft color.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Square color strategy",
      "about": "Fischer-style annotated thinking — Square color strategy.",
      "desc": "Several games show Fischer exploiting a colour complex after trading the right minor piece. Identify weak dark or light squares and park pieces on them permanently. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Dominate the soft color. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 119,
      "book": "fischer",
      "title": "Clock and clarity",
      "teach": "Choose clear positions when practical chances matter.",
      "hint": "Prefer the clear plus.",
      "fen": "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Clock and clarity",
      "about": "Fischer-style annotated thinking — Clock and clarity.",
      "desc": "Match temperament: when a clear advantage exists, take it rather than the murky brilliancy. Fischer could calculate anything — yet often chose clarity. Practical strength is part of champion thinking. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Prefer the clear plus. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 120,
      "book": "fischer",
      "title": "Will to win",
      "teach": "Play for two results when the position allows pressure.",
      "hint": "Keep playing for the win.",
      "fen": "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
      "goal": "win",
      "theme": "Will to win",
      "about": "Fischer-style annotated thinking — Will to win.",
      "desc": "The collection is famous for fighting spirit. If the position still contains problems for them, continue posing them. Draws appear when the truth is drawn — not from premature peace offers in your mind. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Keep playing for the win. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 121,
      "book": "fischer",
      "title": "Space squeeze",
      "teach": "Gain space to restrict their pieces, then break.",
      "hint": "Squeeze, then break.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Space squeeze",
      "about": "Fischer-style annotated thinking — Space squeeze.",
      "desc": "Fischer often acquired space advantages that made the opponent's pieces trip. Expand with purpose, fix their structure, then break where they are least flexible. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Squeeze, then break. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 122,
      "book": "fischer",
      "title": "Target hunters",
      "teach": "Fix a weakness and pile up — classic champion technique.",
      "hint": "Pile on the weakness.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Target hunters",
      "about": "Fischer-style annotated thinking — Target hunters.",
      "desc": "Find a backward pawn, weak square, or exposed king and bring a second and third attacker. Memorable Games repeatedly shows patient targeting rather than one-move threats. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Pile on the weakness. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 123,
      "book": "fischer",
      "title": "Opening transition",
      "teach": "Leave the book with a plan, not a vacuum.",
      "hint": "Play the first plan move.",
      "fen": "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Opening transition",
      "about": "Fischer-style annotated thinking — Opening transition.",
      "desc": "When theory ends, Fischer's notes still have a plan. Identify the imbalance you leave the opening with and play toward it immediately. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play the first plan move. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 124,
      "book": "fischer",
      "title": "Exchange sac judgment",
      "teach": "Sac the exchange for dark squares or initiative when concrete.",
      "hint": "Judge the exchange sac.",
      "fen": "r1bqk2r/pp1pppbp/2n2np1/2p5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5",
      "goal": "win",
      "theme": "Exchange sac judgment",
      "about": "Fischer-style annotated thinking — Exchange sac judgment.",
      "desc": "Some Memorable Games feature exchange sacrifices for lasting soft squares. Calculate concrete gains — outposts, attacks — not romantic hopes. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Judge the exchange sac. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 125,
      "book": "fischer",
      "title": "Knight vs bishop choice",
      "teach": "Choose the minor that fits the pawn structure.",
      "hint": "Trade toward your minor.",
      "fen": "r2q1rk1/ppp1ppbp/2np1np1/8/2PPP1b1/2N2N2/PP2BPPP/R1BQK2R w KQ - 4 8",
      "goal": "win",
      "theme": "Knight vs bishop choice",
      "about": "Fischer-style annotated thinking — Knight vs bishop choice.",
      "desc": "Fischer's exchanges often leave him with the superior remaining minor. In closed structures keep knights; open the board for bishops. Make the trade that matches the pawns. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Trade toward your minor. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 126,
      "book": "fischer",
      "title": "Break timing",
      "teach": "Prepare breaks until tactics favor you.",
      "hint": "Time the break.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Break timing",
      "about": "Fischer-style annotated thinking — Break timing.",
      "desc": "Premature breaks open lines for their pieces. Prepare with piece placement, then break. The annotations emphasise timing as much as the break itself. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Time the break. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 127,
      "book": "fischer",
      "title": "Defense with activity",
      "teach": "Defend by counterpunching, not pure passivity.",
      "hint": "Counterpunch.",
      "fen": "r1bqk2r/pppp1ppp/2n1pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Defense with activity",
      "about": "Fischer-style annotated thinking — Defense with activity.",
      "desc": "When under pressure, Fischer sought active resources. Look for exchanges that blunt the attack or counterthreats that force them backward. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Counterpunch. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 128,
      "book": "fischer",
      "title": "Queenside majority",
      "teach": "Mobilise majority pawns before they blockade you.",
      "hint": "Mobilise the majority.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Queenside majority",
      "about": "Fischer-style annotated thinking — Queenside majority.",
      "desc": "Several games convert queenside majorities into passers. Advance with piece support and prevent their blockade pieces from settling. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Mobilise the majority. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 129,
      "book": "fischer",
      "title": "Kingside storm control",
      "teach": "Meet storms with central breaks or piece trades.",
      "hint": "Meet the storm correctly.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/4R1K1 w - - 0 18",
      "goal": "win",
      "theme": "Kingside storm control",
      "about": "Fischer-style annotated thinking — Kingside storm control.",
      "desc": "Against pawn storms, Fischer opened the centre or traded attacking pieces. Choose the antidote that fits: break, exchange, or run the king. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Meet the storm correctly. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 130,
      "book": "fischer",
      "title": "Technical conversion",
      "teach": "Remove counterplay, then advance the win slowly.",
      "hint": "Remove counterplay first.",
      "fen": "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Technical conversion",
      "about": "Fischer-style annotated thinking — Technical conversion.",
      "desc": "Conversion technique: first stop their ideas, then push your plus. Memorable Games shows clinical conversion without unnecessary drama. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Remove counterplay first. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 131,
      "book": "fischer",
      "title": "Opening repertoire depth",
      "teach": "Know the typical middlegames of your openings.",
      "hint": "Play the typical middlegame plan.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Opening repertoire depth",
      "about": "Fischer-style annotated thinking — Opening repertoire depth.",
      "desc": "Fischer's prep meant he knew the plans after the opening. In this structure, recall the standard piece maneuvers and play one. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play the typical middlegame plan. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 132,
      "book": "fischer",
      "title": "Pin exploitation",
      "teach": "Pins are invitations to pile up or undermine.",
      "hint": "Exploit the pin.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Pin exploitation",
      "about": "Fischer-style annotated thinking — Pin exploitation.",
      "desc": "When a pin appears, Fischer piled pressure or undermined the pinned piece's defense. Use the pin; do not admire it. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Exploit the pin. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 133,
      "book": "fischer",
      "title": "Back-rank awareness",
      "teach": "Always give or deny luft in sharp positions.",
      "hint": "Handle the back rank.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Back-rank awareness",
      "about": "Fischer-style annotated thinking — Back-rank awareness.",
      "desc": "Even champions watch back ranks. Create luft when needed; exploit theirs when tactics allow. Small king moves are sometimes the strongest. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Handle the back rank. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 134,
      "book": "fischer",
      "title": "Central tension",
      "teach": "Maintain or resolve tension with a reason.",
      "hint": "Handle the tension.",
      "fen": "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Central tension",
      "about": "Fischer-style annotated thinking — Central tension.",
      "desc": "Fischer resolved central tension when calculation favored him and kept it when the opponent had to blink first. Decide consciously. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Handle the tension. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 135,
      "book": "fischer",
      "title": "Piece improvement chain",
      "teach": "Improve the worst piece, then the next.",
      "hint": "Improve the worst piece.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Piece improvement chain",
      "about": "Fischer-style annotated thinking — Piece improvement chain.",
      "desc": "A recurring annotation theme: reposition the idle piece before inventing combinations. Worst-piece improvement is champion hygiene. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Improve the worst piece. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 136,
      "book": "fischer",
      "title": "Material vs attack",
      "teach": "Take material if the attack is not decisive.",
      "hint": "Take the material.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Material vs attack",
      "about": "Fischer-style annotated thinking — Material vs attack.",
      "desc": "Fischer could attack, but he also took material and won. If their initiative is insufficient, cash the chips and consolidate. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Take the material. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 137,
      "book": "fischer",
      "title": "Psychological pressure",
      "teach": "Pose problems each move — keep them choosing.",
      "hint": "Pose a problem.",
      "fen": "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Psychological pressure",
      "about": "Fischer-style annotated thinking — Psychological pressure.",
      "desc": "Memorable Games shows positions where every reply is unpleasant. Prefer moves that force a difficult decision over quiet equality. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Pose a problem. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 138,
      "book": "fischer",
      "title": "Endgame piece activity",
      "teach": "In endings, activity beats passive pawn defence.",
      "hint": "Activate in the ending.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Endgame piece activity",
      "about": "Fischer-style annotated thinking — Endgame piece activity.",
      "desc": "Rooks and kings must be active. Fischer's endings punish passive pieces. Activate even at the cost of a pawn when the theory supports it. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Activate in the ending. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 139,
      "book": "fischer",
      "title": "Opening surprise handling",
      "teach": "Against sidelines, play principles and calculate.",
      "hint": "Answer with principles.",
      "fen": "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Opening surprise handling",
      "about": "Fischer-style annotated thinking — Opening surprise handling.",
      "desc": "When surprised, Fischer relied on development, centre, and concrete calculation. Meet unusual moves with healthy principles. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Answer with principles. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 140,
      "book": "fischer",
      "title": "Champion review",
      "teach": "Concrete truth, active pieces, converted advantages.",
      "hint": "Play the champion move.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 2 9",
      "goal": "win",
      "theme": "Champion review",
      "about": "Fischer-style annotated thinking — Champion review.",
      "desc": "Summarise Fischer's style on this board: concrete evaluation, piece activity, and a will to convert. Choose the move that a match player would trust. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play the champion move. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 141,
      "book": "fischer",
      "title": "File seizure",
      "teach": "Take the open file and dare them to contest it.",
      "hint": "Seize the file.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "File seizure",
      "about": "Fischer-style annotated thinking — File seizure.",
      "desc": "Fischer's heavy pieces arrive first on open files. If a file is open or about to open, race a rook there and double if needed. File control turns into seventh-rank invasions. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Seize the file. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 142,
      "book": "fischer",
      "title": "Seventh rank invasion",
      "teach": "A rook on the seventh is a lasting wound.",
      "hint": "Invade the seventh.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Seventh rank invasion",
      "about": "Fischer-style annotated thinking — Seventh rank invasion.",
      "desc": "Memorable Games repeatedly shows rooks landing on the seventh, eating pawns and cutting the king. Prepare the invasion; do not settle for a passive fourth-rank rook. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Invade the seventh. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 143,
      "book": "fischer",
      "title": "Fix then attack",
      "teach": "Fix a pawn weakness, then attack it with pieces.",
      "hint": "Fix the target, then pile up.",
      "fen": "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Fix then attack",
      "about": "Fischer-style annotated thinking — Fix then attack.",
      "desc": "Classic Fischer: fix a pawn on a vulnerable square, then bring attackers. Fixed targets cannot run; mobile weaknesses require different treatment. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Fix the target, then pile up. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 144,
      "book": "fischer",
      "title": "Opposite bishops attack",
      "teach": "With opposite bishops, attack — do not drift to a draw.",
      "hint": "Use the attacking bishop.",
      "fen": "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Opposite bishops attack",
      "about": "Fischer-style annotated thinking — Opposite bishops attack.",
      "desc": "Opposite bishops favor the side with initiative. Fischer used them as attacking tools. Open lines toward the king on your bishop's color. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Use the attacking bishop. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 145,
      "book": "fischer",
      "title": "Calculation honesty",
      "teach": "If the combination fails, admit it and play the solid move.",
      "hint": "Prefer truth over hope.",
      "fen": "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14",
      "goal": "win",
      "theme": "Calculation honesty",
      "about": "Fischer-style annotated thinking — Calculation honesty.",
      "desc": "Fischer's annotations are honest about refuted ideas. If your sacrificial tree collapses, switch to the solid candidate without ego. Truth first. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Prefer truth over hope. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 146,
      "book": "fischer",
      "title": "Opening lead conversion",
      "teach": "A lead in development must open the position.",
      "hint": "Open while ahead in development.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Opening lead conversion",
      "about": "Fischer-style annotated thinking — Opening lead conversion.",
      "desc": "When ahead in development, open lines before they catch up — a Memorable Games refrain. Seek pawn breaks that expose their uncoordinated pieces. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Open while ahead in development. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 147,
      "book": "fischer",
      "title": "Two-weakness principle",
      "teach": "Create a second front when one weakness is defended.",
      "hint": "Open the second front.",
      "fen": "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Two-weakness principle",
      "about": "Fischer-style annotated thinking — Two-weakness principle.",
      "desc": "If they successfully defend one target, create another. Fischer's technique often stretches the defence until something drops. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Open the second front. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 148,
      "book": "fischer",
      "title": "Match temperament",
      "teach": "Choose moves you can play calmly for hours.",
      "hint": "Choose the durable plus.",
      "fen": "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Match temperament",
      "about": "Fischer-style annotated thinking — Match temperament.",
      "desc": "World-championship temperament: durable advantages over speculative chaos when a match point is precious. Prefer the lasting plus. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Choose the durable plus. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 149,
      "book": "fischer",
      "title": "Endgame king activity",
      "teach": "Activate the king as soon as the queens are off.",
      "hint": "Activate the king.",
      "fen": "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/2N2NP1/PP2PP1P/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Endgame king activity",
      "about": "Fischer-style annotated thinking — Endgame king activity.",
      "desc": "Fischer's kings walk into endings early and decisively. With queens exchanged, bring the king toward the centre and key squares. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Activate the king. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 150,
      "book": "fischer",
      "title": "Memorable synthesis",
      "teach": "Concrete, active, converting — the Fischer triad.",
      "hint": "Play the Memorable move.",
      "fen": "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Memorable synthesis",
      "about": "Fischer-style annotated thinking — Memorable synthesis.",
      "desc": "Bring together the lessons of My 60 Memorable Games: concrete calculation, active pieces, and conversion technique. That triad is the move you want here. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play the Memorable move. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 151,
      "book": "fischer",
      "title": "Concrete first (2)",
      "teach": "Fischer excelled by making the position answer concrete questions.",
      "hint": "Play the concrete best move.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Concrete first",
      "about": "Fischer-style annotated thinking — Concrete first.",
      "desc": "My 60 Memorable Games shows a champion who asks: what is the truth here, move by move? Prefer the concrete continuation that improves your pieces or wins material over vague 'pressure'. Annotate your choice as Fischer might: a clear reason, not a mood. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play the concrete best move. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 152,
      "book": "fischer",
      "title": "Development with bite (2)",
      "teach": "Develop with threats — not empty developing moves.",
      "hint": "Develop and threaten.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Development with bite",
      "about": "Fischer-style annotated thinking — Development with bite.",
      "desc": "Fischer's early play often develops while posing problems. When several developing moves exist, choose the one that also hits something or restricts them. Empty development is how the initiative slips. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Develop and threaten. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 153,
      "book": "fischer",
      "title": "King safety absolute (2)",
      "teach": "If the king is unsafe, everything else waits.",
      "hint": "Secure or punish the king.",
      "fen": "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
      "goal": "win",
      "theme": "King safety absolute",
      "about": "Fischer-style annotated thinking — King safety absolute.",
      "desc": "Across the Memorable Games, king safety decisions are ruthless. Castle when needed; punish uncastled kings without delay. Do not chase a queenside pawn while the centre is exploding toward your monarch. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Secure or punish the king. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 154,
      "book": "fischer",
      "title": "Bishop pair respect (2)",
      "teach": "Fischer loved bishops — open the position when you have them.",
      "hint": "Use or hunt the bishop pair.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "Bishop pair respect",
      "about": "Fischer-style annotated thinking — Bishop pair respect.",
      "desc": "Many Fischer annotations emphasise the bishop pair's long-term sting. If you have two bishops, consider timely pawn breaks that open diagonals. If they have them, restrain the openings or trade one off. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Use or hunt the bishop pair. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 155,
      "book": "fischer",
      "title": "Knight outposts (2)",
      "teach": "Plant knights on squares pawns cannot easily chase.",
      "hint": "Occupy the outpost.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Knight outposts",
      "about": "Fischer-style annotated thinking — Knight outposts.",
      "desc": "Fischer's pieces land on ideal squares and stay there. Identify the hole in their camp and the route your knight takes to it. Outposts are not decorative — they justify whole plans. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Occupy the outpost. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 156,
      "book": "fischer",
      "title": "Exchange only with reason (2)",
      "teach": "Trade when the resulting structure or activity favors you.",
      "hint": "Trade on your terms.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Exchange only with reason",
      "about": "Fischer-style annotated thinking — Exchange only with reason.",
      "desc": "Memorable Games is full of precise exchanges: remove their active piece, keep your monster, or head for a won ending. Ask what the trade changes before you click pieces off. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Trade on your terms. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 157,
      "book": "fischer",
      "title": "Initiative retention (2)",
      "teach": "After a gain, keep asking questions of their position.",
      "hint": "Keep the initiative.",
      "fen": "r1bqkb1r/pp1ppppp/2n2n2/2p5/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 4",
      "goal": "win",
      "theme": "Initiative retention",
      "about": "Fischer-style annotated thinking — Initiative retention.",
      "desc": "Fischer rarely lets the opponent breathe after a concession. If you have won a pawn or a bind, find the next threatening move. Consolidation is sometimes needed — but passivity returns the gift. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Keep the initiative. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 158,
      "book": "fischer",
      "title": "Poisoned pawn caution (2)",
      "teach": "Some pawns are bait; calculate before grabbing.",
      "hint": "Take only if calculated.",
      "fen": "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Poisoned pawn caution",
      "about": "Fischer-style annotated thinking — Poisoned pawn caution.",
      "desc": "The Poisoned Pawn Najdorf chapter alone teaches respect for bait. If a pawn looks free, list the forcing replies that punish greed. Grab it only when your tree says you survive. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Take only if calculated. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 159,
      "book": "fischer",
      "title": "Central control (2)",
      "teach": "Occupy or pressure the centre before wing adventures.",
      "hint": "Play in/through the centre.",
      "fen": "rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 6",
      "goal": "win",
      "theme": "Central control",
      "about": "Fischer-style annotated thinking — Central control.",
      "desc": "Fischer's games repeatedly show central clarity enabling wing attacks. If the centre is unstable, fix it or dominate it before launching a speculative flank pawn storm. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play in/through the centre. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 160,
      "book": "fischer",
      "title": "Endgame technique appetite (2)",
      "teach": "Simplify into endings you can play accurately.",
      "hint": "Head for the clear ending.",
      "fen": "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Endgame technique appetite",
      "about": "Fischer-style annotated thinking — Endgame technique appetite.",
      "desc": "Fischer converted advantages with ending precision. When ahead, ask whether a clean ending is available. Technical wins beat swashbuckling chances that risk the point. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Head for the clear ending. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 161,
      "book": "fischer",
      "title": "Opening conviction (2)",
      "teach": "Play openings you understand deeply — systems with plans.",
      "hint": "Follow a known plan.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Opening conviction",
      "about": "Fischer-style annotated thinking — Opening conviction.",
      "desc": "The Memorable Games annotations reveal deep opening preparation married to plans. In this structure, play the typical continuation you would trust in a match, not a one-off experiment. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Follow a known plan. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 162,
      "book": "fischer",
      "title": "Tactical alertness (2)",
      "teach": "Stay awake — Fischer finished games with sudden shots.",
      "hint": "Find the tactical shot.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "Tactical alertness",
      "about": "Fischer-style annotated thinking — Tactical alertness.",
      "desc": "Strategic builds in his games often end with a concrete blow. After improving pieces, scan for tactics. The champion's thinking mixes long plans with immediate geometry. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Find the tactical shot. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 163,
      "book": "fischer",
      "title": "Prophylaxis lite (2)",
      "teach": "Stop their only counterplay before it starts.",
      "hint": "Kill the counteridea.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Prophylaxis lite",
      "about": "Fischer-style annotated thinking — Prophylaxis lite.",
      "desc": "Even in attacking games, Fischer snuffs the opponent's idea. Ask what they want (a break, a piece lift) and meet it a move earlier. Small prophylaxes keep big advantages. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Kill the counteridea. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 164,
      "book": "fischer",
      "title": "Passed pawn push (2)",
      "teach": "Create and escort passers — they decide many of his wins.",
      "hint": "Create/escort the passer.",
      "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      "goal": "win",
      "theme": "Passed pawn push",
      "about": "Fischer-style annotated thinking — Passed pawn push.",
      "desc": "Study how Fischer's passers advance with piece support. If you can create an outside or protected passer, calculate the escort path. Passed pawns are his favourite long-term weapon. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Create/escort the passer. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 165,
      "book": "fischer",
      "title": "Rook activity (2)",
      "teach": "Rooks belong on open files and the seventh rank.",
      "hint": "Activate the rook.",
      "fen": "rnbqk2r/pp2ppbp/5np1/2pp4/3P4/2P2NP1/PP2PP1P/RNBQKB1R w KQkq - 0 6",
      "goal": "win",
      "theme": "Rook activity",
      "about": "Fischer-style annotated thinking — Rook activity.",
      "desc": "Annotations frequently praise rook activity over passive defence of pawns. If a rook can reach the seventh or seize a file, that often outweighs a pawn. Play for activity. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Activate the rook. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 166,
      "book": "fischer",
      "title": "Punish passivity (2)",
      "teach": "If they play without a plan, seize space and initiative.",
      "hint": "Punish the slow setup.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Punish passivity",
      "about": "Fischer-style annotated thinking — Punish passivity.",
      "desc": "Fischer crushed opponents who drifted. When their last few moves lack a threat or a plan, accelerate: gain space, open lines, or fix weaknesses. Momentum is a weapon. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Punish the slow setup. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 167,
      "book": "fischer",
      "title": "Accurate liquidation (2)",
      "teach": "Trade into a won pawn ending only after counting.",
      "hint": "Count, then liquidate.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Accurate liquidation",
      "about": "Fischer-style annotated thinking — Accurate liquidation.",
      "desc": "Before the last piece trade, count the pawn ending as Fischer would — tempi, opposition, outside passers. Memorable Games celebrates clean liquidations, not hopeful ones. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Count, then liquidate. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 168,
      "book": "fischer",
      "title": "Square color strategy (2)",
      "teach": "Control the complex their bishop cannot contest.",
      "hint": "Dominate the soft color.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Square color strategy",
      "about": "Fischer-style annotated thinking — Square color strategy.",
      "desc": "Several games show Fischer exploiting a colour complex after trading the right minor piece. Identify weak dark or light squares and park pieces on them permanently. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Dominate the soft color. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 169,
      "book": "fischer",
      "title": "Clock and clarity (2)",
      "teach": "Choose clear positions when practical chances matter.",
      "hint": "Prefer the clear plus.",
      "fen": "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Clock and clarity",
      "about": "Fischer-style annotated thinking — Clock and clarity.",
      "desc": "Match temperament: when a clear advantage exists, take it rather than the murky brilliancy. Fischer could calculate anything — yet often chose clarity. Practical strength is part of champion thinking. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Prefer the clear plus. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 170,
      "book": "fischer",
      "title": "Will to win (2)",
      "teach": "Play for two results when the position allows pressure.",
      "hint": "Keep playing for the win.",
      "fen": "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
      "goal": "win",
      "theme": "Will to win",
      "about": "Fischer-style annotated thinking — Will to win.",
      "desc": "The collection is famous for fighting spirit. If the position still contains problems for them, continue posing them. Draws appear when the truth is drawn — not from premature peace offers in your mind. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Keep playing for the win. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 171,
      "book": "fischer",
      "title": "Space squeeze (2)",
      "teach": "Gain space to restrict their pieces, then break.",
      "hint": "Squeeze, then break.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Space squeeze",
      "about": "Fischer-style annotated thinking — Space squeeze.",
      "desc": "Fischer often acquired space advantages that made the opponent's pieces trip. Expand with purpose, fix their structure, then break where they are least flexible. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Squeeze, then break. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 172,
      "book": "fischer",
      "title": "Target hunters (2)",
      "teach": "Fix a weakness and pile up — classic champion technique.",
      "hint": "Pile on the weakness.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Target hunters",
      "about": "Fischer-style annotated thinking — Target hunters.",
      "desc": "Find a backward pawn, weak square, or exposed king and bring a second and third attacker. Memorable Games repeatedly shows patient targeting rather than one-move threats. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Pile on the weakness. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 173,
      "book": "fischer",
      "title": "Opening transition (2)",
      "teach": "Leave the book with a plan, not a vacuum.",
      "hint": "Play the first plan move.",
      "fen": "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Opening transition",
      "about": "Fischer-style annotated thinking — Opening transition.",
      "desc": "When theory ends, Fischer's notes still have a plan. Identify the imbalance you leave the opening with and play toward it immediately. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play the first plan move. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 174,
      "book": "fischer",
      "title": "Exchange sac judgment (2)",
      "teach": "Sac the exchange for dark squares or initiative when concrete.",
      "hint": "Judge the exchange sac.",
      "fen": "r1bqk2r/pp1pppbp/2n2np1/2p5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5",
      "goal": "win",
      "theme": "Exchange sac judgment",
      "about": "Fischer-style annotated thinking — Exchange sac judgment.",
      "desc": "Some Memorable Games feature exchange sacrifices for lasting soft squares. Calculate concrete gains — outposts, attacks — not romantic hopes. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Judge the exchange sac. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 175,
      "book": "fischer",
      "title": "Knight vs bishop choice (2)",
      "teach": "Choose the minor that fits the pawn structure.",
      "hint": "Trade toward your minor.",
      "fen": "r2q1rk1/ppp1ppbp/2np1np1/8/2PPP1b1/2N2N2/PP2BPPP/R1BQK2R w KQ - 4 8",
      "goal": "win",
      "theme": "Knight vs bishop choice",
      "about": "Fischer-style annotated thinking — Knight vs bishop choice.",
      "desc": "Fischer's exchanges often leave him with the superior remaining minor. In closed structures keep knights; open the board for bishops. Make the trade that matches the pawns. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Trade toward your minor. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 176,
      "book": "fischer",
      "title": "Break timing (2)",
      "teach": "Prepare breaks until tactics favor you.",
      "hint": "Time the break.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Break timing",
      "about": "Fischer-style annotated thinking — Break timing.",
      "desc": "Premature breaks open lines for their pieces. Prepare with piece placement, then break. The annotations emphasise timing as much as the break itself. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Time the break. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 177,
      "book": "fischer",
      "title": "Defense with activity (2)",
      "teach": "Defend by counterpunching, not pure passivity.",
      "hint": "Counterpunch.",
      "fen": "r1bqk2r/pppp1ppp/2n1pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Defense with activity",
      "about": "Fischer-style annotated thinking — Defense with activity.",
      "desc": "When under pressure, Fischer sought active resources. Look for exchanges that blunt the attack or counterthreats that force them backward. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Counterpunch. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 178,
      "book": "fischer",
      "title": "Queenside majority (2)",
      "teach": "Mobilise majority pawns before they blockade you.",
      "hint": "Mobilise the majority.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Queenside majority",
      "about": "Fischer-style annotated thinking — Queenside majority.",
      "desc": "Several games convert queenside majorities into passers. Advance with piece support and prevent their blockade pieces from settling. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Mobilise the majority. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 179,
      "book": "fischer",
      "title": "Kingside storm control (2)",
      "teach": "Meet storms with central breaks or piece trades.",
      "hint": "Meet the storm correctly.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/4R1K1 w - - 0 18",
      "goal": "win",
      "theme": "Kingside storm control",
      "about": "Fischer-style annotated thinking — Kingside storm control.",
      "desc": "Against pawn storms, Fischer opened the centre or traded attacking pieces. Choose the antidote that fits: break, exchange, or run the king. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Meet the storm correctly. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 180,
      "book": "fischer",
      "title": "Technical conversion (2)",
      "teach": "Remove counterplay, then advance the win slowly.",
      "hint": "Remove counterplay first.",
      "fen": "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Technical conversion",
      "about": "Fischer-style annotated thinking — Technical conversion.",
      "desc": "Conversion technique: first stop their ideas, then push your plus. Memorable Games shows clinical conversion without unnecessary drama. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Remove counterplay first. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 181,
      "book": "fischer",
      "title": "Opening repertoire depth (2)",
      "teach": "Know the typical middlegames of your openings.",
      "hint": "Play the typical middlegame plan.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Opening repertoire depth",
      "about": "Fischer-style annotated thinking — Opening repertoire depth.",
      "desc": "Fischer's prep meant he knew the plans after the opening. In this structure, recall the standard piece maneuvers and play one. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play the typical middlegame plan. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 182,
      "book": "fischer",
      "title": "Pin exploitation (2)",
      "teach": "Pins are invitations to pile up or undermine.",
      "hint": "Exploit the pin.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Pin exploitation",
      "about": "Fischer-style annotated thinking — Pin exploitation.",
      "desc": "When a pin appears, Fischer piled pressure or undermined the pinned piece's defense. Use the pin; do not admire it. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Exploit the pin. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 183,
      "book": "fischer",
      "title": "Back-rank awareness (2)",
      "teach": "Always give or deny luft in sharp positions.",
      "hint": "Handle the back rank.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Back-rank awareness",
      "about": "Fischer-style annotated thinking — Back-rank awareness.",
      "desc": "Even champions watch back ranks. Create luft when needed; exploit theirs when tactics allow. Small king moves are sometimes the strongest. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Handle the back rank. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 184,
      "book": "fischer",
      "title": "Central tension (2)",
      "teach": "Maintain or resolve tension with a reason.",
      "hint": "Handle the tension.",
      "fen": "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Central tension",
      "about": "Fischer-style annotated thinking — Central tension.",
      "desc": "Fischer resolved central tension when calculation favored him and kept it when the opponent had to blink first. Decide consciously. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Handle the tension. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 185,
      "book": "fischer",
      "title": "Piece improvement chain (2)",
      "teach": "Improve the worst piece, then the next.",
      "hint": "Improve the worst piece.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Piece improvement chain",
      "about": "Fischer-style annotated thinking — Piece improvement chain.",
      "desc": "A recurring annotation theme: reposition the idle piece before inventing combinations. Worst-piece improvement is champion hygiene. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Improve the worst piece. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 186,
      "book": "fischer",
      "title": "Material vs attack (2)",
      "teach": "Take material if the attack is not decisive.",
      "hint": "Take the material.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Material vs attack",
      "about": "Fischer-style annotated thinking — Material vs attack.",
      "desc": "Fischer could attack, but he also took material and won. If their initiative is insufficient, cash the chips and consolidate. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Take the material. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 187,
      "book": "fischer",
      "title": "Psychological pressure (2)",
      "teach": "Pose problems each move — keep them choosing.",
      "hint": "Pose a problem.",
      "fen": "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Psychological pressure",
      "about": "Fischer-style annotated thinking — Psychological pressure.",
      "desc": "Memorable Games shows positions where every reply is unpleasant. Prefer moves that force a difficult decision over quiet equality. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Pose a problem. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 188,
      "book": "fischer",
      "title": "Endgame piece activity (2)",
      "teach": "In endings, activity beats passive pawn defence.",
      "hint": "Activate in the ending.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Endgame piece activity",
      "about": "Fischer-style annotated thinking — Endgame piece activity.",
      "desc": "Rooks and kings must be active. Fischer's endings punish passive pieces. Activate even at the cost of a pawn when the theory supports it. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Activate in the ending. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 189,
      "book": "fischer",
      "title": "Opening surprise handling (2)",
      "teach": "Against sidelines, play principles and calculate.",
      "hint": "Answer with principles.",
      "fen": "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Opening surprise handling",
      "about": "Fischer-style annotated thinking — Opening surprise handling.",
      "desc": "When surprised, Fischer relied on development, centre, and concrete calculation. Meet unusual moves with healthy principles. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Answer with principles. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 190,
      "book": "fischer",
      "title": "Champion review (2)",
      "teach": "Concrete truth, active pieces, converted advantages.",
      "hint": "Play the champion move.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 2 9",
      "goal": "win",
      "theme": "Champion review",
      "about": "Fischer-style annotated thinking — Champion review.",
      "desc": "Summarise Fischer's style on this board: concrete evaluation, piece activity, and a will to convert. Choose the move that a match player would trust. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play the champion move. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 191,
      "book": "fischer",
      "title": "File seizure (2)",
      "teach": "Take the open file and dare them to contest it.",
      "hint": "Seize the file.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "File seizure",
      "about": "Fischer-style annotated thinking — File seizure.",
      "desc": "Fischer's heavy pieces arrive first on open files. If a file is open or about to open, race a rook there and double if needed. File control turns into seventh-rank invasions. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Seize the file. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 192,
      "book": "fischer",
      "title": "Seventh rank invasion (2)",
      "teach": "A rook on the seventh is a lasting wound.",
      "hint": "Invade the seventh.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Seventh rank invasion",
      "about": "Fischer-style annotated thinking — Seventh rank invasion.",
      "desc": "Memorable Games repeatedly shows rooks landing on the seventh, eating pawns and cutting the king. Prepare the invasion; do not settle for a passive fourth-rank rook. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Invade the seventh. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 193,
      "book": "fischer",
      "title": "Fix then attack (2)",
      "teach": "Fix a pawn weakness, then attack it with pieces.",
      "hint": "Fix the target, then pile up.",
      "fen": "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Fix then attack",
      "about": "Fischer-style annotated thinking — Fix then attack.",
      "desc": "Classic Fischer: fix a pawn on a vulnerable square, then bring attackers. Fixed targets cannot run; mobile weaknesses require different treatment. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Fix the target, then pile up. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 194,
      "book": "fischer",
      "title": "Opposite bishops attack (2)",
      "teach": "With opposite bishops, attack — do not drift to a draw.",
      "hint": "Use the attacking bishop.",
      "fen": "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Opposite bishops attack",
      "about": "Fischer-style annotated thinking — Opposite bishops attack.",
      "desc": "Opposite bishops favor the side with initiative. Fischer used them as attacking tools. Open lines toward the king on your bishop's color. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Use the attacking bishop. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 195,
      "book": "fischer",
      "title": "Calculation honesty (2)",
      "teach": "If the combination fails, admit it and play the solid move.",
      "hint": "Prefer truth over hope.",
      "fen": "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14",
      "goal": "win",
      "theme": "Calculation honesty",
      "about": "Fischer-style annotated thinking — Calculation honesty.",
      "desc": "Fischer's annotations are honest about refuted ideas. If your sacrificial tree collapses, switch to the solid candidate without ego. Truth first. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Prefer truth over hope. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 196,
      "book": "fischer",
      "title": "Opening lead conversion (2)",
      "teach": "A lead in development must open the position.",
      "hint": "Open while ahead in development.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Opening lead conversion",
      "about": "Fischer-style annotated thinking — Opening lead conversion.",
      "desc": "When ahead in development, open lines before they catch up — a Memorable Games refrain. Seek pawn breaks that expose their uncoordinated pieces. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Open while ahead in development. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 197,
      "book": "fischer",
      "title": "Two-weakness principle (2)",
      "teach": "Create a second front when one weakness is defended.",
      "hint": "Open the second front.",
      "fen": "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Two-weakness principle",
      "about": "Fischer-style annotated thinking — Two-weakness principle.",
      "desc": "If they successfully defend one target, create another. Fischer's technique often stretches the defence until something drops. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Open the second front. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 198,
      "book": "fischer",
      "title": "Match temperament (2)",
      "teach": "Choose moves you can play calmly for hours.",
      "hint": "Choose the durable plus.",
      "fen": "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Match temperament",
      "about": "Fischer-style annotated thinking — Match temperament.",
      "desc": "World-championship temperament: durable advantages over speculative chaos when a match point is precious. Prefer the lasting plus. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Choose the durable plus. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 199,
      "book": "fischer",
      "title": "Endgame king activity (2)",
      "teach": "Activate the king as soon as the queens are off.",
      "hint": "Activate the king.",
      "fen": "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/2N2NP1/PP2PP1P/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Endgame king activity",
      "about": "Fischer-style annotated thinking — Endgame king activity.",
      "desc": "Fischer's kings walk into endings early and decisively. With queens exchanged, bring the king toward the centre and key squares. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Activate the king. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 200,
      "book": "fischer",
      "title": "Memorable synthesis (2)",
      "teach": "Concrete, active, converting — the Fischer triad.",
      "hint": "Play the Memorable move.",
      "fen": "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Memorable synthesis",
      "about": "Fischer-style annotated thinking — Memorable synthesis.",
      "desc": "Bring together the lessons of My 60 Memorable Games: concrete calculation, active pieces, and conversion technique. That triad is the move you want here. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play the Memorable move. (My 60 Memorable Games–style · champion thinking)",
      "pitfalls": []
    },
    {
      "n": 201,
      "book": "bronstein",
      "title": "Middlegame story",
      "teach": "Zurich 1953 teaches that every structure tells a strategic story.",
      "hint": "Play the story's next chapter.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Middlegame story",
      "about": "Bronstein-style middlegame — Middlegame story.",
      "desc": "Bronstein's tournament book reads like a novel of plans. Identify the pawn structure's story — who attacks where, who defends what — and play the next thematic move. Strategy is narrative with pieces. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play the story's next chapter. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 202,
      "book": "bronstein",
      "title": "Dynamic balance",
      "teach": "Equality can be dynamic — both sides have chances.",
      "hint": "Play into rich equality.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Dynamic balance",
      "about": "Bronstein-style middlegame — Dynamic balance.",
      "desc": "Zurich games often show dynamic balance rather than dry equality. Seek positions where both armies have aims. Prefer the rich continuation over the sterile one when appropriate. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play into rich equality. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 203,
      "book": "bronstein",
      "title": "Piece harmony",
      "teach": "Pieces must cooperate like a string quartet.",
      "hint": "Harmonise the pieces.",
      "fen": "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
      "goal": "win",
      "theme": "Piece harmony",
      "about": "Bronstein-style middlegame — Piece harmony.",
      "desc": "Bronstein praises harmonious setups: bishops and knights covering complementary squares, rooks connected. If one piece is out of the ensemble, bring it back into the music. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Harmonise the pieces. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 204,
      "book": "bronstein",
      "title": "Creative breaks",
      "teach": "Breaks can be artistic — timed for maximum disruption.",
      "hint": "Time the creative break.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "Creative breaks",
      "about": "Bronstein-style middlegame — Creative breaks.",
      "desc": "The Zurich notes highlight imaginative pawn breaks. Prepare the break so that when it lands, several of their pieces are suddenly misplaced. Creativity is calculated disruption. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Time the creative break. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 205,
      "book": "bronstein",
      "title": "King hunt themes",
      "teach": "Middlegame attacks on the king need all hands.",
      "hint": "Bring attackers toward the king.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "King hunt themes",
      "about": "Bronstein-style middlegame — King hunt themes.",
      "desc": "Bronstein annotates king hunts with delight and precision. Count attackers and defenders, open lines, and include the last piece. Attacks fail from understaffing more than from lack of inspiration. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Bring attackers toward the king. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 206,
      "book": "bronstein",
      "title": "Positional exchange sac",
      "teach": "Sac the exchange for a magnificent minor piece or attack.",
      "hint": "Consider the exchange sac.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Positional exchange sac",
      "about": "Bronstein-style middlegame — Positional exchange sac.",
      "desc": "Several Zurich classics feature exchange sacrifices for dark squares or lasting pressure. Evaluate the soft squares and the attack — not just the point count. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Consider the exchange sac. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 207,
      "book": "bronstein",
      "title": "Maneuvering patience",
      "teach": "Some advantages require long maneuvers, not blows.",
      "hint": "Maneuver patiently.",
      "fen": "r1bqkb1r/pp1ppppp/2n2n2/2p5/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 4",
      "goal": "win",
      "theme": "Maneuvering patience",
      "about": "Bronstein-style middlegame — Maneuvering patience.",
      "desc": "Bronstein shows waiting and regrouping as positive play. Improve knights via long routes, shift rooks, then strike. Patience is a middlegame weapon. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Maneuver patiently. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 208,
      "book": "bronstein",
      "title": "Central tension art",
      "teach": "Keeping tension can be more venomous than releasing it.",
      "hint": "Keep or release with art.",
      "fen": "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Central tension art",
      "about": "Bronstein-style middlegame — Central tension art.",
      "desc": "Zurich 1953 repeatedly discusses when to capture and when to maintain tension. If releasing clarifies their plan, keep tension. If releasing opens your masterpieces, capture. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Keep or release with art. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 209,
      "book": "bronstein",
      "title": "Opposite-side castling race",
      "teach": "Race, but undermine with central play.",
      "hint": "Race with central awareness.",
      "fen": "rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 6",
      "goal": "win",
      "theme": "Opposite-side castling race",
      "about": "Bronstein-style middlegame — Opposite-side castling race.",
      "desc": "Opposite castling games in the tournament show pawn storms plus central counterplay. Push your storm while ensuring the centre does not explode in their favor. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Race with central awareness. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 210,
      "book": "bronstein",
      "title": "Blockade drama",
      "teach": "Blockade passed pawns with pieces that also attack.",
      "hint": "Blockade actively.",
      "fen": "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Blockade drama",
      "about": "Bronstein-style middlegame — Blockade drama.",
      "desc": "A blockade piece should not be a pure sentry. Bronstein likes blockaders that radiate threats. Blockade on a square where the piece still eyes weaknesses. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Blockade actively. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 211,
      "book": "bronstein",
      "title": "Initiative vs material",
      "teach": "Zurich heroes often prefer initiative to a quiet pawn.",
      "hint": "Prefer the initiative.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Initiative vs material",
      "about": "Bronstein-style middlegame — Initiative vs material.",
      "desc": "The commentary frequently chooses dynamic chances over safe material. If the initiative is real and lasting, take it. If it is smoke, take the pawn instead. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Prefer the initiative. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 212,
      "book": "bronstein",
      "title": "Weak square odyssey",
      "teach": "Journey a knight toward a dream square.",
      "hint": "Route the knight.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "Weak square odyssey",
      "about": "Bronstein-style middlegame — Weak square odyssey.",
      "desc": "Watch how knights in Zurich travel three moves to a dream outpost. Plan the route: which squares, which tempi, which trades enable the landing. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Route the knight. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 213,
      "book": "bronstein",
      "title": "Bishop pair poetry",
      "teach": "Open the manuscript for the bishops when the moment sings.",
      "hint": "Open for the bishops.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Bishop pair poetry",
      "about": "Bronstein-style middlegame — Bishop pair poetry.",
      "desc": "Bronstein's language about bishops is vivid — and practical. Open diagonals when your bishops are ready and theirs are hemmed. The poetry is the plan. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Open for the bishops. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 214,
      "book": "bronstein",
      "title": "Rooks on open files",
      "teach": "Contest open files; doubled rooks decide middlegames.",
      "hint": "Contest the file.",
      "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      "goal": "win",
      "theme": "Rooks on open files",
      "about": "Bronstein-style middlegame — Rooks on open files.",
      "desc": "Files opened in Zurich battles become highways for heavy pieces. Contest them early; doubled rooks on the only open file are often decisive. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Contest the file. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 215,
      "book": "bronstein",
      "title": "Pawn storm ethics",
      "teach": "Storms need piece support — pawns alone are weather, not war.",
      "hint": "Support the storm.",
      "fen": "rnbqk2r/pp2ppbp/5np1/2pp4/3P4/2P2NP1/PP2PP1P/RNBQKB1R w KQkq - 0 6",
      "goal": "win",
      "theme": "Pawn storm ethics",
      "about": "Bronstein-style middlegame — Pawn storm ethics.",
      "desc": "Bronstein criticises pawn storms without pieces behind them. Advance with lifts, batteries, and king targets identified. Weather becomes war only with coordination. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Support the storm. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 216,
      "book": "bronstein",
      "title": "Defensive resourcefulness",
      "teach": "Find the ugly saving move; beauty can wait.",
      "hint": "Find the saving resource.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Defensive resourcefulness",
      "about": "Bronstein-style middlegame — Defensive resourcefulness.",
      "desc": "The tournament book respects defensive genius. When worse, search for the resource that muddies the water: blockade, perpetual ideas, or a counterbreak. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Find the saving resource. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 217,
      "book": "bronstein",
      "title": "Strategic pawn moves",
      "teach": "Every pawn move is a commitment Bronstein weighs carefully.",
      "hint": "Make the pawn commitment.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Strategic pawn moves",
      "about": "Bronstein-style middlegame — Strategic pawn moves.",
      "desc": "Pawns do not move backward — Zurich notes treat pawn advances as chapter headings. Advance when the structure you create matches your piece placement. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Make the pawn commitment. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 218,
      "book": "bronstein",
      "title": "Queen centralisation",
      "teach": "A centralised queen can dominate a middlegame.",
      "hint": "Centralise the queen.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Queen centralisation",
      "about": "Bronstein-style middlegame — Queen centralisation.",
      "desc": "In several famous Zurich games, the queen finds a central perch eyeing both wings. If safe from harassment, centralise and survey. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Centralise the queen. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 219,
      "book": "bronstein",
      "title": "Minor piece duel",
      "teach": "Knight vs bishop debates are decided by the pawn skeleton.",
      "hint": "Play the skeleton's side.",
      "fen": "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Minor piece duel",
      "about": "Bronstein-style middlegame — Minor piece duel.",
      "desc": "Bronstein explains which minor thrives. Closed chains → knights; open centres → bishops. Trade or keep accordingly. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play the skeleton's side. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 220,
      "book": "bronstein",
      "title": "Attack the base",
      "teach": "Against chains, tip the base or restrain the head.",
      "hint": "Play against the chain.",
      "fen": "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
      "goal": "win",
      "theme": "Attack the base",
      "about": "Bronstein-style middlegame — Attack the base.",
      "desc": "Classical strategy alive in Zurich: attack the base of the pawn chain or fix the head. Choose the approach that matches your piece placement. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play against the chain. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 221,
      "book": "bronstein",
      "title": "Space and maneuvers",
      "teach": "With space, reshuffle; without space, break free.",
      "hint": "Use or challenge space.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Space and maneuvers",
      "about": "Bronstein-style middlegame — Space and maneuvers.",
      "desc": "Space advantages in the 1953 games allow leisurely maneuvers. If you have space, improve slowly. If cramped, prepare the freeing break with urgency. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Use or challenge space. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 222,
      "book": "bronstein",
      "title": "Tactical undercurrent",
      "teach": "Strategy sits on tactics — always scan shots.",
      "hint": "Scan for the shot.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Tactical undercurrent",
      "about": "Bronstein-style middlegame — Tactical undercurrent.",
      "desc": "Bronstein's strategic essays still explode with tactics. After each strategic idea, scan forcing moves. The best plans are those tactics cannot refute. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Scan for the shot. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 223,
      "book": "bronstein",
      "title": "Transition to ending",
      "teach": "Some middlegames want a favourable ending transition.",
      "hint": "Transition wisely.",
      "fen": "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Transition to ending",
      "about": "Bronstein-style middlegame — Transition to ending.",
      "desc": "Zurich commentary often discusses when to head for endings. If your structure is better in simplified form, steer trades; if your attack needs queens, avoid them. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Transition wisely. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 224,
      "book": "bronstein",
      "title": "Initiative of the pieces",
      "teach": "Pieces can seize initiative without pawn contact.",
      "hint": "Seize piece initiative.",
      "fen": "r1bqk2r/pp1pppbp/2n2np1/2p5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5",
      "goal": "win",
      "theme": "Initiative of the pieces",
      "about": "Bronstein-style middlegame — Initiative of the pieces.",
      "desc": "Activity alone can be the plan: threaten traps, dominate squares, force passive replies. Bronstein shows initiative as a piece phenomenon, not only a pawn race. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Seize piece initiative. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 225,
      "book": "bronstein",
      "title": "Color complex siege",
      "teach": "Besiege a color complex until it collapses.",
      "hint": "Besiege the color complex.",
      "fen": "r2q1rk1/ppp1ppbp/2np1np1/8/2PPP1b1/2N2N2/PP2BPPP/R1BQK2R w KQ - 4 8",
      "goal": "win",
      "theme": "Color complex siege",
      "about": "Bronstein-style middlegame — Color complex siege.",
      "desc": "Trade the defender of a complex, then occupy it. Zurich games illustrate long sieges on dark or light squares ending in breakthrough. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Besiege the color complex. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 226,
      "book": "bronstein",
      "title": "Counterbreak timing",
      "teach": "Meet a wing attack with a central counterbreak.",
      "hint": "Strike in the centre.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Counterbreak timing",
      "about": "Bronstein-style middlegame — Counterbreak timing.",
      "desc": "Classical antidote celebrated in the book: against a flank attack, break in the centre. Time it so their pieces are caught looking the wrong way. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Strike in the centre. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 227,
      "book": "bronstein",
      "title": "Quiet positional crush",
      "teach": "Not every Zurich masterpiece is loud — some squeeze.",
      "hint": "Squeeze quietly.",
      "fen": "r1bqk2r/pppp1ppp/2n1pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Quiet positional crush",
      "about": "Bronstein-style middlegame — Quiet positional crush.",
      "desc": "Learn the quiet crush: fix weaknesses, improve pieces, and let the opponent suffocate. The description in Bronstein's prose is lyrical; the moves are simple and strong. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Squeeze quietly. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 228,
      "book": "bronstein",
      "title": "Sacrificial brilliance",
      "teach": "When calculation supports it, brilliance is duty.",
      "hint": "Play the sound brilliancy.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Sacrificial brilliance",
      "about": "Bronstein-style middlegame — Sacrificial brilliance.",
      "desc": "Zurich 1953 contains immortal sacrifices. The lesson is not to sac for applause — it is to calculate until the sacrifice is truth. If the truth is brilliant, play it. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play the sound brilliancy. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 229,
      "book": "bronstein",
      "title": "Prophylactic middlegame",
      "teach": "Ask what they want — then prevent it stylishly.",
      "hint": "Prevent their idea.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/4R1K1 w - - 0 18",
      "goal": "win",
      "theme": "Prophylactic middlegame",
      "about": "Bronstein-style middlegame — Prophylactic middlegame.",
      "desc": "Bronstein notices opponents' plans early. A prophylactic move that looks modest may be the strongest in the position. Spoil their story, write yours. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Prevent their idea. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 230,
      "book": "bronstein",
      "title": "Tournament book spirit",
      "teach": "Play with curiosity, courage, and clear plans.",
      "hint": "Play the Zurich spirit.",
      "fen": "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Tournament book spirit",
      "about": "Bronstein-style middlegame — Tournament book spirit.",
      "desc": "The lasting gift of Zurich 1953 is a way of seeing middlegames: rich plans, concrete tactics, and joy in the struggle. Choose the move that continues a clear strategic story with tactical awareness. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play the Zurich spirit. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 231,
      "book": "bronstein",
      "title": "File occupation",
      "teach": "Occupy open files before they do.",
      "hint": "Take the open file.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "File occupation",
      "about": "Bronstein-style middlegame — File occupation.",
      "desc": "Heavy-piece battles in Zurich hinge on files. If a file opens, race to occupy it with a rook and invite the second rook behind. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Take the open file. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 232,
      "book": "bronstein",
      "title": "Outpost forever",
      "teach": "An outpost knight can be worth an exchange.",
      "hint": "Value the outpost highly.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Outpost forever",
      "about": "Bronstein-style middlegame — Outpost forever.",
      "desc": "Bronstein assigns huge value to permanent outposts. If you can establish one, do so even at material cost when the bind is real. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Value the outpost highly. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 233,
      "book": "bronstein",
      "title": "Pawn tension duel",
      "teach": "Who blinks first in the centre often loses the story.",
      "hint": "Win the tension duel.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Pawn tension duel",
      "about": "Bronstein-style middlegame — Pawn tension duel.",
      "desc": "Maintain tension while improving; force them to capture into your preparation. The Zurich notes treat tension as a psychological and strategic lever. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Win the tension duel. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 234,
      "book": "bronstein",
      "title": "King position middlegame",
      "teach": "King placement determines which breaks are safe.",
      "hint": "Respect king placement.",
      "fen": "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "King position middlegame",
      "about": "Bronstein-style middlegame — King position middlegame.",
      "desc": "Castled vs uncastled, kingside vs queenside — Bronstein always weighs king location before recommending a break. Align your break with king safety. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Respect king placement. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 235,
      "book": "bronstein",
      "title": "Piece sacrifice for structure",
      "teach": "Sometimes sac a piece for a crushing structure or attack.",
      "hint": "Judge the piece sac.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Piece sacrifice for structure",
      "about": "Bronstein-style middlegame — Piece sacrifice for structure.",
      "desc": "Beyond exchange sacs, piece sacs appear when the structure collapses or the king is hunted. Calculate to a clear outcome. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Judge the piece sac. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 236,
      "book": "bronstein",
      "title": "Middlegame zugzwang echoes",
      "teach": "Squeeze until every move worsens their setup.",
      "hint": "Squeeze toward zugzwang.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Middlegame zugzwang echoes",
      "about": "Bronstein-style middlegame — Middlegame zugzwang echoes.",
      "desc": "Though zugzwang is an endgame word, Bronstein shows middlegame squeezes where every pawn move creates a hole. Restrict, then wait. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Squeeze toward zugzwang. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 237,
      "book": "bronstein",
      "title": "Battery building",
      "teach": "Build batteries on files and diagonals before firing.",
      "hint": "Build the battery.",
      "fen": "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Battery building",
      "about": "Bronstein-style middlegame — Battery building.",
      "desc": "Queen + bishop or doubled rooks appear throughout Zurich. Build the battery first; fire second. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Build the battery. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 238,
      "book": "bronstein",
      "title": "Repositioning journeys",
      "teach": "Long repositionings are allowed if the goal is clear.",
      "hint": "Start the repositioning.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Repositioning journeys",
      "about": "Bronstein-style middlegame — Repositioning journeys.",
      "desc": "A knight tour that looks slow is justified when the destination dominates. Announce the destination square and begin the journey. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Start the repositioning. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 239,
      "book": "bronstein",
      "title": "Dynamic defence",
      "teach": "Defend by creating your own threats.",
      "hint": "Create counterthreats.",
      "fen": "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Dynamic defence",
      "about": "Bronstein-style middlegame — Dynamic defence.",
      "desc": "Passive defence rarely stars in Bronstein's heroes' games. Counterthreats force the attacker to spend tempi on defence. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Create counterthreats. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 240,
      "book": "bronstein",
      "title": "Strategic review",
      "teach": "Structure, harmony, break, tactic — the Zurich loop.",
      "hint": "Play the structured plan.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 2 9",
      "goal": "win",
      "theme": "Strategic review",
      "about": "Bronstein-style middlegame — Strategic review.",
      "desc": "Close the Bronstein cycle: read the structure, harmonise pieces, time the break, verify with tactics. That is the middlegame book in one move. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play the structured plan. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 241,
      "book": "bronstein",
      "title": "Initiative pendulum",
      "teach": "Seize the pendulum of initiative when it swings to you.",
      "hint": "Take the initiative now.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Initiative pendulum",
      "about": "Bronstein-style middlegame — Initiative pendulum.",
      "desc": "Zurich games show the initiative swinging like a pendulum. When it swings your way — after their inaccuracy — accelerate. Hesitation returns the pendulum. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Take the initiative now. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 242,
      "book": "bronstein",
      "title": "Pawn majority theatre",
      "teach": "Majorities must advance to create a passer.",
      "hint": "Advance the majority.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Pawn majority theatre",
      "about": "Bronstein-style middlegame — Pawn majority theatre.",
      "desc": "Bronstein stages queenside or kingside majorities as theatre. Advance them with piece escort until a passer appears, then switch to technical mode. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Advance the majority. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 243,
      "book": "bronstein",
      "title": "Cross-pin themes",
      "teach": "Pins across the board create middlegame geometry.",
      "hint": "Exploit the geometry.",
      "fen": "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Cross-pin themes",
      "about": "Bronstein-style middlegame — Cross-pin themes.",
      "desc": "Geometric themes — cross pins, alignments — decorate Zurich brilliancies. Look along ranks, files, and diagonals for alignments that tactics can exploit. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Exploit the geometry. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 244,
      "book": "bronstein",
      "title": "Improving the worst piece",
      "teach": "The ugliest piece dictates the next maneuver.",
      "hint": "Improve the ugly piece.",
      "fen": "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Improving the worst piece",
      "about": "Bronstein-style middlegame — Improving the worst piece.",
      "desc": "Bronstein often begins plans by curing an ugly piece. Identify your least happy unit and find its better square before launching fireworks. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Improve the ugly piece. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 245,
      "book": "bronstein",
      "title": "Central fortress break",
      "teach": "Break a fortress setup with the right lever.",
      "hint": "Lever the fortress.",
      "fen": "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14",
      "goal": "win",
      "theme": "Central fortress break",
      "about": "Bronstein-style middlegame — Central fortress break.",
      "desc": "When they sit solidly, find the lever that cracks the shell. Zurich commentary loves the well-timed lever that turns a fortress into ruins. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Lever the fortress. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 246,
      "book": "bronstein",
      "title": "Middlegame exchange decisions",
      "teach": "Exchanges change plans — decide with the new plan in mind.",
      "hint": "Exchange toward a plan.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Middlegame exchange decisions",
      "about": "Bronstein-style middlegame — Middlegame exchange decisions.",
      "desc": "Do not trade on autopilot. Ask which plan remains after the trade. Bronstein's notes always connect exchanges to the ensuing strategic story. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Exchange toward a plan. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 247,
      "book": "bronstein",
      "title": "Attacking ratio",
      "teach": "Only launch when attackers outnumber defenders.",
      "hint": "Fix the attacking ratio.",
      "fen": "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Attacking ratio",
      "about": "Bronstein-style middlegame — Attacking ratio.",
      "desc": "Romantic attacks fail arithmetic. Count honestly. If short an attacker, bring one more piece or open one more line before the sacrifice. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Fix the attacking ratio. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 248,
      "book": "bronstein",
      "title": "Quiet crushing move",
      "teach": "The soft move that ends resistance is still a crush.",
      "hint": "Find the quiet crush.",
      "fen": "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Quiet crushing move",
      "about": "Bronstein-style middlegame — Quiet crushing move.",
      "desc": "Not every Zurich highlight is loud. A quiet tightening move can be the most beautiful. Find the soft squeeze. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Find the quiet crush. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 249,
      "book": "bronstein",
      "title": "Strategic imagination",
      "teach": "Imagine the ideal setup, then steer toward it.",
      "hint": "Steer toward the ideal setup.",
      "fen": "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/2N2NP1/PP2PP1P/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Strategic imagination",
      "about": "Bronstein-style middlegame — Strategic imagination.",
      "desc": "Bronstein invites you to dream the ideal piece placement, then reverse-engineer the moves. Imagination first, move second. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Steer toward the ideal setup. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 250,
      "book": "bronstein",
      "title": "Zurich finale",
      "teach": "Rich plans, verified by tactics — the tournament book's creed.",
      "hint": "Play the Zurich move.",
      "fen": "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Zurich finale",
      "about": "Bronstein-style middlegame — Zurich finale.",
      "desc": "End with the spirit of Zurich 1953: a clear strategic story checked by concrete calculation. Play the move that belongs in a great middlegame book. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play the Zurich move. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 251,
      "book": "bronstein",
      "title": "Middlegame story (2)",
      "teach": "Zurich 1953 teaches that every structure tells a strategic story.",
      "hint": "Play the story's next chapter.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Middlegame story",
      "about": "Bronstein-style middlegame — Middlegame story.",
      "desc": "Bronstein's tournament book reads like a novel of plans. Identify the pawn structure's story — who attacks where, who defends what — and play the next thematic move. Strategy is narrative with pieces. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play the story's next chapter. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 252,
      "book": "bronstein",
      "title": "Dynamic balance (2)",
      "teach": "Equality can be dynamic — both sides have chances.",
      "hint": "Play into rich equality.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Dynamic balance",
      "about": "Bronstein-style middlegame — Dynamic balance.",
      "desc": "Zurich games often show dynamic balance rather than dry equality. Seek positions where both armies have aims. Prefer the rich continuation over the sterile one when appropriate. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play into rich equality. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 253,
      "book": "bronstein",
      "title": "Piece harmony (2)",
      "teach": "Pieces must cooperate like a string quartet.",
      "hint": "Harmonise the pieces.",
      "fen": "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
      "goal": "win",
      "theme": "Piece harmony",
      "about": "Bronstein-style middlegame — Piece harmony.",
      "desc": "Bronstein praises harmonious setups: bishops and knights covering complementary squares, rooks connected. If one piece is out of the ensemble, bring it back into the music. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Harmonise the pieces. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 254,
      "book": "bronstein",
      "title": "Creative breaks (2)",
      "teach": "Breaks can be artistic — timed for maximum disruption.",
      "hint": "Time the creative break.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "Creative breaks",
      "about": "Bronstein-style middlegame — Creative breaks.",
      "desc": "The Zurich notes highlight imaginative pawn breaks. Prepare the break so that when it lands, several of their pieces are suddenly misplaced. Creativity is calculated disruption. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Time the creative break. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 255,
      "book": "bronstein",
      "title": "King hunt themes (2)",
      "teach": "Middlegame attacks on the king need all hands.",
      "hint": "Bring attackers toward the king.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "King hunt themes",
      "about": "Bronstein-style middlegame — King hunt themes.",
      "desc": "Bronstein annotates king hunts with delight and precision. Count attackers and defenders, open lines, and include the last piece. Attacks fail from understaffing more than from lack of inspiration. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Bring attackers toward the king. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 256,
      "book": "bronstein",
      "title": "Positional exchange sac (2)",
      "teach": "Sac the exchange for a magnificent minor piece or attack.",
      "hint": "Consider the exchange sac.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Positional exchange sac",
      "about": "Bronstein-style middlegame — Positional exchange sac.",
      "desc": "Several Zurich classics feature exchange sacrifices for dark squares or lasting pressure. Evaluate the soft squares and the attack — not just the point count. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Consider the exchange sac. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 257,
      "book": "bronstein",
      "title": "Maneuvering patience (2)",
      "teach": "Some advantages require long maneuvers, not blows.",
      "hint": "Maneuver patiently.",
      "fen": "r1bqkb1r/pp1ppppp/2n2n2/2p5/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 4",
      "goal": "win",
      "theme": "Maneuvering patience",
      "about": "Bronstein-style middlegame — Maneuvering patience.",
      "desc": "Bronstein shows waiting and regrouping as positive play. Improve knights via long routes, shift rooks, then strike. Patience is a middlegame weapon. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Maneuver patiently. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 258,
      "book": "bronstein",
      "title": "Central tension art (2)",
      "teach": "Keeping tension can be more venomous than releasing it.",
      "hint": "Keep or release with art.",
      "fen": "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Central tension art",
      "about": "Bronstein-style middlegame — Central tension art.",
      "desc": "Zurich 1953 repeatedly discusses when to capture and when to maintain tension. If releasing clarifies their plan, keep tension. If releasing opens your masterpieces, capture. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Keep or release with art. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 259,
      "book": "bronstein",
      "title": "Opposite-side castling race (2)",
      "teach": "Race, but undermine with central play.",
      "hint": "Race with central awareness.",
      "fen": "rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 6",
      "goal": "win",
      "theme": "Opposite-side castling race",
      "about": "Bronstein-style middlegame — Opposite-side castling race.",
      "desc": "Opposite castling games in the tournament show pawn storms plus central counterplay. Push your storm while ensuring the centre does not explode in their favor. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Race with central awareness. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 260,
      "book": "bronstein",
      "title": "Blockade drama (2)",
      "teach": "Blockade passed pawns with pieces that also attack.",
      "hint": "Blockade actively.",
      "fen": "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Blockade drama",
      "about": "Bronstein-style middlegame — Blockade drama.",
      "desc": "A blockade piece should not be a pure sentry. Bronstein likes blockaders that radiate threats. Blockade on a square where the piece still eyes weaknesses. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Blockade actively. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 261,
      "book": "bronstein",
      "title": "Initiative vs material (2)",
      "teach": "Zurich heroes often prefer initiative to a quiet pawn.",
      "hint": "Prefer the initiative.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Initiative vs material",
      "about": "Bronstein-style middlegame — Initiative vs material.",
      "desc": "The commentary frequently chooses dynamic chances over safe material. If the initiative is real and lasting, take it. If it is smoke, take the pawn instead. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Prefer the initiative. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 262,
      "book": "bronstein",
      "title": "Weak square odyssey (2)",
      "teach": "Journey a knight toward a dream square.",
      "hint": "Route the knight.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "Weak square odyssey",
      "about": "Bronstein-style middlegame — Weak square odyssey.",
      "desc": "Watch how knights in Zurich travel three moves to a dream outpost. Plan the route: which squares, which tempi, which trades enable the landing. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Route the knight. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 263,
      "book": "bronstein",
      "title": "Bishop pair poetry (2)",
      "teach": "Open the manuscript for the bishops when the moment sings.",
      "hint": "Open for the bishops.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Bishop pair poetry",
      "about": "Bronstein-style middlegame — Bishop pair poetry.",
      "desc": "Bronstein's language about bishops is vivid — and practical. Open diagonals when your bishops are ready and theirs are hemmed. The poetry is the plan. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Open for the bishops. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 264,
      "book": "bronstein",
      "title": "Rooks on open files (2)",
      "teach": "Contest open files; doubled rooks decide middlegames.",
      "hint": "Contest the file.",
      "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      "goal": "win",
      "theme": "Rooks on open files",
      "about": "Bronstein-style middlegame — Rooks on open files.",
      "desc": "Files opened in Zurich battles become highways for heavy pieces. Contest them early; doubled rooks on the only open file are often decisive. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Contest the file. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 265,
      "book": "bronstein",
      "title": "Pawn storm ethics (2)",
      "teach": "Storms need piece support — pawns alone are weather, not war.",
      "hint": "Support the storm.",
      "fen": "rnbqk2r/pp2ppbp/5np1/2pp4/3P4/2P2NP1/PP2PP1P/RNBQKB1R w KQkq - 0 6",
      "goal": "win",
      "theme": "Pawn storm ethics",
      "about": "Bronstein-style middlegame — Pawn storm ethics.",
      "desc": "Bronstein criticises pawn storms without pieces behind them. Advance with lifts, batteries, and king targets identified. Weather becomes war only with coordination. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Support the storm. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 266,
      "book": "bronstein",
      "title": "Defensive resourcefulness (2)",
      "teach": "Find the ugly saving move; beauty can wait.",
      "hint": "Find the saving resource.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Defensive resourcefulness",
      "about": "Bronstein-style middlegame — Defensive resourcefulness.",
      "desc": "The tournament book respects defensive genius. When worse, search for the resource that muddies the water: blockade, perpetual ideas, or a counterbreak. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Find the saving resource. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 267,
      "book": "bronstein",
      "title": "Strategic pawn moves (2)",
      "teach": "Every pawn move is a commitment Bronstein weighs carefully.",
      "hint": "Make the pawn commitment.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Strategic pawn moves",
      "about": "Bronstein-style middlegame — Strategic pawn moves.",
      "desc": "Pawns do not move backward — Zurich notes treat pawn advances as chapter headings. Advance when the structure you create matches your piece placement. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Make the pawn commitment. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 268,
      "book": "bronstein",
      "title": "Queen centralisation (2)",
      "teach": "A centralised queen can dominate a middlegame.",
      "hint": "Centralise the queen.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Queen centralisation",
      "about": "Bronstein-style middlegame — Queen centralisation.",
      "desc": "In several famous Zurich games, the queen finds a central perch eyeing both wings. If safe from harassment, centralise and survey. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Centralise the queen. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 269,
      "book": "bronstein",
      "title": "Minor piece duel (2)",
      "teach": "Knight vs bishop debates are decided by the pawn skeleton.",
      "hint": "Play the skeleton's side.",
      "fen": "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Minor piece duel",
      "about": "Bronstein-style middlegame — Minor piece duel.",
      "desc": "Bronstein explains which minor thrives. Closed chains → knights; open centres → bishops. Trade or keep accordingly. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play the skeleton's side. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 270,
      "book": "bronstein",
      "title": "Attack the base (2)",
      "teach": "Against chains, tip the base or restrain the head.",
      "hint": "Play against the chain.",
      "fen": "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
      "goal": "win",
      "theme": "Attack the base",
      "about": "Bronstein-style middlegame — Attack the base.",
      "desc": "Classical strategy alive in Zurich: attack the base of the pawn chain or fix the head. Choose the approach that matches your piece placement. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play against the chain. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 271,
      "book": "bronstein",
      "title": "Space and maneuvers (2)",
      "teach": "With space, reshuffle; without space, break free.",
      "hint": "Use or challenge space.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Space and maneuvers",
      "about": "Bronstein-style middlegame — Space and maneuvers.",
      "desc": "Space advantages in the 1953 games allow leisurely maneuvers. If you have space, improve slowly. If cramped, prepare the freeing break with urgency. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Use or challenge space. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 272,
      "book": "bronstein",
      "title": "Tactical undercurrent (2)",
      "teach": "Strategy sits on tactics — always scan shots.",
      "hint": "Scan for the shot.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Tactical undercurrent",
      "about": "Bronstein-style middlegame — Tactical undercurrent.",
      "desc": "Bronstein's strategic essays still explode with tactics. After each strategic idea, scan forcing moves. The best plans are those tactics cannot refute. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Scan for the shot. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 273,
      "book": "bronstein",
      "title": "Transition to ending (2)",
      "teach": "Some middlegames want a favourable ending transition.",
      "hint": "Transition wisely.",
      "fen": "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Transition to ending",
      "about": "Bronstein-style middlegame — Transition to ending.",
      "desc": "Zurich commentary often discusses when to head for endings. If your structure is better in simplified form, steer trades; if your attack needs queens, avoid them. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Transition wisely. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 274,
      "book": "bronstein",
      "title": "Initiative of the pieces (2)",
      "teach": "Pieces can seize initiative without pawn contact.",
      "hint": "Seize piece initiative.",
      "fen": "r1bqk2r/pp1pppbp/2n2np1/2p5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5",
      "goal": "win",
      "theme": "Initiative of the pieces",
      "about": "Bronstein-style middlegame — Initiative of the pieces.",
      "desc": "Activity alone can be the plan: threaten traps, dominate squares, force passive replies. Bronstein shows initiative as a piece phenomenon, not only a pawn race. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Seize piece initiative. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 275,
      "book": "bronstein",
      "title": "Color complex siege (2)",
      "teach": "Besiege a color complex until it collapses.",
      "hint": "Besiege the color complex.",
      "fen": "r2q1rk1/ppp1ppbp/2np1np1/8/2PPP1b1/2N2N2/PP2BPPP/R1BQK2R w KQ - 4 8",
      "goal": "win",
      "theme": "Color complex siege",
      "about": "Bronstein-style middlegame — Color complex siege.",
      "desc": "Trade the defender of a complex, then occupy it. Zurich games illustrate long sieges on dark or light squares ending in breakthrough. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Besiege the color complex. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 276,
      "book": "bronstein",
      "title": "Counterbreak timing (2)",
      "teach": "Meet a wing attack with a central counterbreak.",
      "hint": "Strike in the centre.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Counterbreak timing",
      "about": "Bronstein-style middlegame — Counterbreak timing.",
      "desc": "Classical antidote celebrated in the book: against a flank attack, break in the centre. Time it so their pieces are caught looking the wrong way. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Strike in the centre. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 277,
      "book": "bronstein",
      "title": "Quiet positional crush (2)",
      "teach": "Not every Zurich masterpiece is loud — some squeeze.",
      "hint": "Squeeze quietly.",
      "fen": "r1bqk2r/pppp1ppp/2n1pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Quiet positional crush",
      "about": "Bronstein-style middlegame — Quiet positional crush.",
      "desc": "Learn the quiet crush: fix weaknesses, improve pieces, and let the opponent suffocate. The description in Bronstein's prose is lyrical; the moves are simple and strong. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Squeeze quietly. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 278,
      "book": "bronstein",
      "title": "Sacrificial brilliance (2)",
      "teach": "When calculation supports it, brilliance is duty.",
      "hint": "Play the sound brilliancy.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Sacrificial brilliance",
      "about": "Bronstein-style middlegame — Sacrificial brilliance.",
      "desc": "Zurich 1953 contains immortal sacrifices. The lesson is not to sac for applause — it is to calculate until the sacrifice is truth. If the truth is brilliant, play it. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play the sound brilliancy. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 279,
      "book": "bronstein",
      "title": "Prophylactic middlegame (2)",
      "teach": "Ask what they want — then prevent it stylishly.",
      "hint": "Prevent their idea.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/4R1K1 w - - 0 18",
      "goal": "win",
      "theme": "Prophylactic middlegame",
      "about": "Bronstein-style middlegame — Prophylactic middlegame.",
      "desc": "Bronstein notices opponents' plans early. A prophylactic move that looks modest may be the strongest in the position. Spoil their story, write yours. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Prevent their idea. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 280,
      "book": "bronstein",
      "title": "Tournament book spirit (2)",
      "teach": "Play with curiosity, courage, and clear plans.",
      "hint": "Play the Zurich spirit.",
      "fen": "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Tournament book spirit",
      "about": "Bronstein-style middlegame — Tournament book spirit.",
      "desc": "The lasting gift of Zurich 1953 is a way of seeing middlegames: rich plans, concrete tactics, and joy in the struggle. Choose the move that continues a clear strategic story with tactical awareness. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play the Zurich spirit. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 281,
      "book": "bronstein",
      "title": "File occupation (2)",
      "teach": "Occupy open files before they do.",
      "hint": "Take the open file.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "File occupation",
      "about": "Bronstein-style middlegame — File occupation.",
      "desc": "Heavy-piece battles in Zurich hinge on files. If a file opens, race to occupy it with a rook and invite the second rook behind. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Take the open file. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 282,
      "book": "bronstein",
      "title": "Outpost forever (2)",
      "teach": "An outpost knight can be worth an exchange.",
      "hint": "Value the outpost highly.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Outpost forever",
      "about": "Bronstein-style middlegame — Outpost forever.",
      "desc": "Bronstein assigns huge value to permanent outposts. If you can establish one, do so even at material cost when the bind is real. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Value the outpost highly. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 283,
      "book": "bronstein",
      "title": "Pawn tension duel (2)",
      "teach": "Who blinks first in the centre often loses the story.",
      "hint": "Win the tension duel.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Pawn tension duel",
      "about": "Bronstein-style middlegame — Pawn tension duel.",
      "desc": "Maintain tension while improving; force them to capture into your preparation. The Zurich notes treat tension as a psychological and strategic lever. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Win the tension duel. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 284,
      "book": "bronstein",
      "title": "King position middlegame (2)",
      "teach": "King placement determines which breaks are safe.",
      "hint": "Respect king placement.",
      "fen": "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "King position middlegame",
      "about": "Bronstein-style middlegame — King position middlegame.",
      "desc": "Castled vs uncastled, kingside vs queenside — Bronstein always weighs king location before recommending a break. Align your break with king safety. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Respect king placement. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 285,
      "book": "bronstein",
      "title": "Piece sacrifice for structure (2)",
      "teach": "Sometimes sac a piece for a crushing structure or attack.",
      "hint": "Judge the piece sac.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Piece sacrifice for structure",
      "about": "Bronstein-style middlegame — Piece sacrifice for structure.",
      "desc": "Beyond exchange sacs, piece sacs appear when the structure collapses or the king is hunted. Calculate to a clear outcome. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Judge the piece sac. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 286,
      "book": "bronstein",
      "title": "Middlegame zugzwang echoes (2)",
      "teach": "Squeeze until every move worsens their setup.",
      "hint": "Squeeze toward zugzwang.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Middlegame zugzwang echoes",
      "about": "Bronstein-style middlegame — Middlegame zugzwang echoes.",
      "desc": "Though zugzwang is an endgame word, Bronstein shows middlegame squeezes where every pawn move creates a hole. Restrict, then wait. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Squeeze toward zugzwang. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 287,
      "book": "bronstein",
      "title": "Battery building (2)",
      "teach": "Build batteries on files and diagonals before firing.",
      "hint": "Build the battery.",
      "fen": "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Battery building",
      "about": "Bronstein-style middlegame — Battery building.",
      "desc": "Queen + bishop or doubled rooks appear throughout Zurich. Build the battery first; fire second. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Build the battery. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 288,
      "book": "bronstein",
      "title": "Repositioning journeys (2)",
      "teach": "Long repositionings are allowed if the goal is clear.",
      "hint": "Start the repositioning.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Repositioning journeys",
      "about": "Bronstein-style middlegame — Repositioning journeys.",
      "desc": "A knight tour that looks slow is justified when the destination dominates. Announce the destination square and begin the journey. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Start the repositioning. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 289,
      "book": "bronstein",
      "title": "Dynamic defence (2)",
      "teach": "Defend by creating your own threats.",
      "hint": "Create counterthreats.",
      "fen": "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Dynamic defence",
      "about": "Bronstein-style middlegame — Dynamic defence.",
      "desc": "Passive defence rarely stars in Bronstein's heroes' games. Counterthreats force the attacker to spend tempi on defence. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Create counterthreats. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 290,
      "book": "bronstein",
      "title": "Strategic review (2)",
      "teach": "Structure, harmony, break, tactic — the Zurich loop.",
      "hint": "Play the structured plan.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 2 9",
      "goal": "win",
      "theme": "Strategic review",
      "about": "Bronstein-style middlegame — Strategic review.",
      "desc": "Close the Bronstein cycle: read the structure, harmonise pieces, time the break, verify with tactics. That is the middlegame book in one move. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play the structured plan. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 291,
      "book": "bronstein",
      "title": "Initiative pendulum (2)",
      "teach": "Seize the pendulum of initiative when it swings to you.",
      "hint": "Take the initiative now.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Initiative pendulum",
      "about": "Bronstein-style middlegame — Initiative pendulum.",
      "desc": "Zurich games show the initiative swinging like a pendulum. When it swings your way — after their inaccuracy — accelerate. Hesitation returns the pendulum. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Take the initiative now. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 292,
      "book": "bronstein",
      "title": "Pawn majority theatre (2)",
      "teach": "Majorities must advance to create a passer.",
      "hint": "Advance the majority.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Pawn majority theatre",
      "about": "Bronstein-style middlegame — Pawn majority theatre.",
      "desc": "Bronstein stages queenside or kingside majorities as theatre. Advance them with piece escort until a passer appears, then switch to technical mode. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Advance the majority. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 293,
      "book": "bronstein",
      "title": "Cross-pin themes (2)",
      "teach": "Pins across the board create middlegame geometry.",
      "hint": "Exploit the geometry.",
      "fen": "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Cross-pin themes",
      "about": "Bronstein-style middlegame — Cross-pin themes.",
      "desc": "Geometric themes — cross pins, alignments — decorate Zurich brilliancies. Look along ranks, files, and diagonals for alignments that tactics can exploit. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Exploit the geometry. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 294,
      "book": "bronstein",
      "title": "Improving the worst piece (2)",
      "teach": "The ugliest piece dictates the next maneuver.",
      "hint": "Improve the ugly piece.",
      "fen": "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Improving the worst piece",
      "about": "Bronstein-style middlegame — Improving the worst piece.",
      "desc": "Bronstein often begins plans by curing an ugly piece. Identify your least happy unit and find its better square before launching fireworks. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Improve the ugly piece. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 295,
      "book": "bronstein",
      "title": "Central fortress break (2)",
      "teach": "Break a fortress setup with the right lever.",
      "hint": "Lever the fortress.",
      "fen": "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14",
      "goal": "win",
      "theme": "Central fortress break",
      "about": "Bronstein-style middlegame — Central fortress break.",
      "desc": "When they sit solidly, find the lever that cracks the shell. Zurich commentary loves the well-timed lever that turns a fortress into ruins. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Lever the fortress. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 296,
      "book": "bronstein",
      "title": "Middlegame exchange decisions (2)",
      "teach": "Exchanges change plans — decide with the new plan in mind.",
      "hint": "Exchange toward a plan.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Middlegame exchange decisions",
      "about": "Bronstein-style middlegame — Middlegame exchange decisions.",
      "desc": "Do not trade on autopilot. Ask which plan remains after the trade. Bronstein's notes always connect exchanges to the ensuing strategic story. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Exchange toward a plan. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 297,
      "book": "bronstein",
      "title": "Attacking ratio (2)",
      "teach": "Only launch when attackers outnumber defenders.",
      "hint": "Fix the attacking ratio.",
      "fen": "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Attacking ratio",
      "about": "Bronstein-style middlegame — Attacking ratio.",
      "desc": "Romantic attacks fail arithmetic. Count honestly. If short an attacker, bring one more piece or open one more line before the sacrifice. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Fix the attacking ratio. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 298,
      "book": "bronstein",
      "title": "Quiet crushing move (2)",
      "teach": "The soft move that ends resistance is still a crush.",
      "hint": "Find the quiet crush.",
      "fen": "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Quiet crushing move",
      "about": "Bronstein-style middlegame — Quiet crushing move.",
      "desc": "Not every Zurich highlight is loud. A quiet tightening move can be the most beautiful. Find the soft squeeze. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Find the quiet crush. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 299,
      "book": "bronstein",
      "title": "Strategic imagination (2)",
      "teach": "Imagine the ideal setup, then steer toward it.",
      "hint": "Steer toward the ideal setup.",
      "fen": "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/2N2NP1/PP2PP1P/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Strategic imagination",
      "about": "Bronstein-style middlegame — Strategic imagination.",
      "desc": "Bronstein invites you to dream the ideal piece placement, then reverse-engineer the moves. Imagination first, move second. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Steer toward the ideal setup. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    },
    {
      "n": 300,
      "book": "bronstein",
      "title": "Zurich finale (2)",
      "teach": "Rich plans, verified by tactics — the tournament book's creed.",
      "hint": "Play the Zurich move.",
      "fen": "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Zurich finale",
      "about": "Bronstein-style middlegame — Zurich finale.",
      "desc": "End with the spirit of Zurich 1953: a clear strategic story checked by concrete calculation. Play the move that belongs in a great middlegame book. On this board, look for the move that expresses the idea most cleanly — then verify it against their best reply. Hint focus: Play the Zurich move. (Zurich 1953–style · middlegame strategy)",
      "pitfalls": []
    }
  ];


  const BOOK_LABEL = {
    kotov: "Kotov \u00b7 1700+",
    fischer: "Fischer \u00b7 Memorable",
    bronstein: "Bronstein \u00b7 Zurich",
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
    if (!["all", "kotov", "fischer", "bronstein"].includes(next)) return;
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
