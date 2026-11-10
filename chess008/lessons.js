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

  const ENGINE_JS = "/chess008/stockfish-19-lite-single.js";
  const ENGINE_WASM = "/chess008/stockfish-19-lite-single.wasm";
  const GLYPH = {
    wk: "♔", wq: "♕", wr: "♖", wb: "♗", wn: "♘", wp: "♙",
    bk: "♚", bq: "♛", br: "♜", bb: "♝", bn: "♞", bp: "♟",
  };

  /** 300 lessons: Dvoretsky Resources / Aagaard Strategic / Analytical Manual (100 each). Rich descriptions; no pitfalls. */
  const LESSONS = [
    {
      "n": 1,
      "book": "resources",
      "title": "See their threats",
      "teach": "Before your idea, list every serious threat they have.",
      "hint": "Name their threat first.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "See their threats",
      "about": "Dvoretsky resources — See their threats.",
      "desc": "Dvoretsky's Resources training starts with a brutal habit: before calculating your combination, list their resources — checks, captures, threats, and quiet spoiling moves. Many 'wins' die to one unseen reply. On this board, name their strongest idea first, then choose a move that survives it. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Name their threat first. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 2,
      "book": "resources",
      "title": "Prophylaxis move",
      "teach": "A move that stops their only plan can be best.",
      "hint": "Play the prophylactic move.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Prophylaxis move",
      "about": "Dvoretsky resources — Prophylaxis move.",
      "desc": "Pure prophylaxis is not cowardice — it is high-level calculation of their intentions. Identify the one plan that keeps them in the game and spoil it a tempo early. The resulting position should leave you free to improve without allowing counterplay. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Play the prophylactic move. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 3,
      "book": "resources",
      "title": "Zwischenzug resource",
      "teach": "Expect in-between checks and captures in their defence.",
      "hint": "Account for the zwischenzug.",
      "fen": "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
      "goal": "win",
      "theme": "Zwischenzug resource",
      "about": "Dvoretsky resources — Zwischenzug resource.",
      "desc": "Opponent resources often arrive as zwischenzugs: a check or capture inserted before the 'forced' recapture. Build that branch into your tree. If your line collapses to an intermezzo, it was never sound. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Account for the zwischenzug. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 4,
      "book": "resources",
      "title": "Quiet spoiler",
      "teach": "Their best resource may be a quiet move, not a check.",
      "hint": "Find/stop the quiet resource.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "Quiet spoiler",
      "about": "Dvoretsky resources — Quiet spoiler.",
      "desc": "Amateurs overestimate checks and underestimate quiet defensive moves — a knight retreat, a king step, a pawn nudge that kills your net. Dvoretsky drills that quiet resource. Include it among their candidates. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Find/stop the quiet resource. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 5,
      "book": "resources",
      "title": "Only-move defence",
      "teach": "Sometimes they have one saving move — find it as them.",
      "hint": "Find their only save.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Only-move defence",
      "about": "Dvoretsky resources — Only-move defence.",
      "desc": "Training method: sit in their chair and hunt the only defence. If you cannot find it, you are not ready to play the attacking move. Recognizing resources means recognising their saves as well as their threats. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Find their only save. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 6,
      "book": "resources",
      "title": "Counter-sacrifice",
      "teach": "Expect them to sac back to break your attack.",
      "hint": "Calculate the counter-sac.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Counter-sacrifice",
      "about": "Dvoretsky resources — Counter-sacrifice.",
      "desc": "A common resource against an attack is a counter-sacrifice that simplifies or seizes the initiative. Add that branch. If the counter-sac draws or wins for them, revise your plan. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Calculate the counter-sac. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 7,
      "book": "resources",
      "title": "Perpetual resource",
      "teach": "Losing sides fish for perpetual — calculate it honestly.",
      "hint": "Prevent or allow perpetual correctly.",
      "fen": "r1bqkb1r/pp1ppppp/2n2n2/2p5/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 4",
      "goal": "win",
      "theme": "Perpetual resource",
      "about": "Dvoretsky resources — Perpetual resource.",
      "desc": "When you are winning, their resource is often perpetual check. When you are losing, it is your resource. Either way, calculate the checking loop fully before claiming a win or resigning the defence. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Prevent or allow perpetual correctly. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 8,
      "book": "resources",
      "title": "Stalemate trick",
      "teach": "Stalemate is a defensive resource in technical wins.",
      "hint": "Avoid/use the stalemate resource.",
      "fen": "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Stalemate trick",
      "about": "Dvoretsky resources — Stalemate trick.",
      "desc": "Converting sides must leave the opponent a legal move; defending sides should fish for stalemate nets. Dvoretsky-level technique includes this 'cheap' resource because it scores half-points at the highest level. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Avoid/use the stalemate resource. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 9,
      "book": "resources",
      "title": "Desperado",
      "teach": "A trapped piece may sell itself for maximum damage.",
      "hint": "Account for the desperado.",
      "fen": "rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 6",
      "goal": "win",
      "theme": "Desperado",
      "about": "Dvoretsky resources — Desperado.",
      "desc": "Desperado resources change material tallies mid-combination. Before you 'win a piece', ask whether it can capture something vital on the way out. Update the leaf evaluation accordingly. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Account for the desperado. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 10,
      "book": "resources",
      "title": "Back-rank resource",
      "teach": "Back-rank mates cut both ways — see theirs and yours.",
      "hint": "Handle the back-rank resource.",
      "fen": "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Back-rank resource",
      "about": "Dvoretsky resources — Back-rank resource.",
      "desc": "Many brilliant attacks fail to a back-rank counterblow. Give yourself luft when needed, and look for their back-rank weakness when calculating. Resources cut both directions. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Handle the back-rank resource. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 11,
      "book": "resources",
      "title": "Interference defence",
      "teach": "They may interfere with your line using a sac or pawn.",
      "hint": "See the interference resource.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Interference defence",
      "about": "Dvoretsky resources — Interference defence.",
      "desc": "Interference is a classic defensive (and attacking) resource. A piece or pawn lands on a critical line and your combination evaporates. Put interference on their candidate list. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: See the interference resource. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 12,
      "book": "resources",
      "title": "Deflection alert",
      "teach": "Your defender may be deflected — or you can deflect theirs.",
      "hint": "Watch deflection resources.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "Deflection alert",
      "about": "Dvoretsky resources — Deflection alert.",
      "desc": "Overloaded defenders are resources waiting to be used — by either side. Ask who is overloaded. If you are, reinforce; if they are, deflect. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Watch deflection resources. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 13,
      "book": "resources",
      "title": "Pin as resource",
      "teach": "Absolute and relative pins change what is 'legal' in the tree.",
      "hint": "Use/break the pin resource.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Pin as resource",
      "about": "Dvoretsky resources — Pin as resource.",
      "desc": "A pin is both your weapon and their shield. Relative pins can still move with calculation; absolute pins cannot. Treat pin status as part of resource recognition each ply. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Use/break the pin resource. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 14,
      "book": "resources",
      "title": "Flight squares",
      "teach": "Cover flights before the mating net; they will run.",
      "hint": "Cover the flight square.",
      "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      "goal": "win",
      "theme": "Flight squares",
      "about": "Dvoretsky resources — Flight squares.",
      "desc": "Kings escape through flight squares you forgot to cover. Before the final check, ask where they run. Prophylaxis against flight is high-level finishing technique. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Cover the flight square. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 15,
      "book": "resources",
      "title": "King walk resource",
      "teach": "Their king may walk out of the net — calculate the path.",
      "hint": "Stop the king walk.",
      "fen": "rnbqk2r/pp2ppbp/5np1/2pp4/3P4/2P2NP1/PP2PP1P/RNBQKB1R w KQkq - 0 6",
      "goal": "win",
      "theme": "King walk resource",
      "about": "Dvoretsky resources — King walk resource.",
      "desc": "Sometimes the resource is simply walking the king to safety. Calculate the escape path as carefully as the attack. If the walk works, your combination needs an inclusion. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Stop the king walk. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 16,
      "book": "resources",
      "title": "Exchange sac defence",
      "teach": "They may sac the exchange to kill your attack.",
      "hint": "Judge the defensive exchange sac.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Exchange sac defence",
      "about": "Dvoretsky resources — Exchange sac defence.",
      "desc": "Defensive exchange sacrifices are elite resources: give a rook for a minor piece that holds forever. Evaluate the resulting fortress honestly before continuing to 'attack'. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Judge the defensive exchange sac. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 17,
      "book": "resources",
      "title": "Simplification resource",
      "teach": "Trading queens can be their path to a draw.",
      "hint": "Decide on queen trades.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Simplification resource",
      "about": "Dvoretsky resources — Simplification resource.",
      "desc": "When you attack, their resource is often a queen trade into a holdable ending. When you defend, it may be yours. Calculate the ending before allowing or forcing the trade. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Decide on queen trades. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 18,
      "book": "resources",
      "title": "Pawn break counter",
      "teach": "Meet a wing attack with their central break in mind.",
      "hint": "Respect the counterbreak.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Pawn break counter",
      "about": "Dvoretsky resources — Pawn break counter.",
      "desc": "The classical resource against a flank attack is a central break. If you are storming, calculate ...d5/...e5 ideas. If you are defending, prepare that break as your resource. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Respect the counterbreak. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 19,
      "book": "resources",
      "title": "Hidden check",
      "teach": "Discovered checks are resources that appear mid-line.",
      "hint": "Spot discovered-check resources.",
      "fen": "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Hidden check",
      "about": "Dvoretsky resources — Hidden check.",
      "desc": "Discoveries flip evaluations instantly. Before a capture sequence, ask which discoveries open. Include them as forced branches in the tree. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Spot discovered-check resources. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 20,
      "book": "resources",
      "title": "Overloaded attacker",
      "teach": "Your attacking piece may be overloaded too.",
      "hint": "Secure your attacking unit.",
      "fen": "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
      "goal": "win",
      "theme": "Overloaded attacker",
      "about": "Dvoretsky resources — Overloaded attacker.",
      "desc": "Resource recognition includes your own overloads. If the piece delivering mate also defends against mate, their resource may be to exploit that. Secure or re-order. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Secure your attacking unit. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 21,
      "book": "resources",
      "title": "Prophylactic calculation",
      "teach": "Calculate their reply before you commit to the win.",
      "hint": "Calculate their best reply.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Prophylactic calculation",
      "about": "Dvoretsky resources — Prophylactic calculation.",
      "desc": "The training loop: choose your intended move, then calculate their best resource for at least two plies. Only then commit. This is the heart of Recognizing Your Opponent's Resources. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Calculate their best reply. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 22,
      "book": "resources",
      "title": "Candidate their moves",
      "teach": "List their candidates as carefully as yours.",
      "hint": "List their candidates.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Candidate their moves",
      "about": "Dvoretsky resources — Candidate their moves.",
      "desc": "Dvoretsky asks you to build a candidate list for the opponent. Checks, captures, quiet spoilers. Width on their side prevents tunnel vision on yours. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: List their candidates. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 23,
      "book": "resources",
      "title": "Trap awareness",
      "teach": "If the win looks too easy, find the trap resource.",
      "hint": "Find the trap.",
      "fen": "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Trap awareness",
      "about": "Dvoretsky resources — Trap awareness.",
      "desc": "Easy wins often hide a resource. When a combination looks forced and pretty, spend an extra minute hunting the spoiling move. Paranoia is a skill. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Find the trap. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 24,
      "book": "resources",
      "title": "Active defence",
      "teach": "Their best defence may be a counterattack.",
      "hint": "Expect active defence.",
      "fen": "r1bqk2r/pp1pppbp/2n2np1/2p5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5",
      "goal": "win",
      "theme": "Active defence",
      "about": "Dvoretsky resources — Active defence.",
      "desc": "Passive defence is not their only resource. Counterattacks — checks against your king — can seize the initiative. Calculate with their counterattack as a main branch. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Expect active defence. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 25,
      "book": "resources",
      "title": "Fortress resource",
      "teach": "Some positions hold despite material deficit.",
      "hint": "Recognise fortress chances.",
      "fen": "r2q1rk1/ppp1ppbp/2np1np1/8/2PPP1b1/2N2N2/PP2BPPP/R1BQK2R w KQ - 4 8",
      "goal": "win",
      "theme": "Fortress resource",
      "about": "Dvoretsky resources — Fortress resource.",
      "desc": "A fortress is an ultimate defensive resource. If you are converting, break it; if you are saving, build it. Do not assume material always wins. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Recognise fortress chances. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 26,
      "book": "resources",
      "title": "Tempo resource",
      "teach": "A useful waiting move can be their saving tempo.",
      "hint": "Account for useful tempi.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Tempo resource",
      "about": "Dvoretsky resources — Tempo resource.",
      "desc": "Zugzwang and reserve tempi are resources. They may have a waiting move that passes the move back to you in a worse form. Include waiting moves in defensive candidate lists. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Account for useful tempi. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 27,
      "book": "resources",
      "title": "Line clearance defence",
      "teach": "They may clear a defensive line with tempo.",
      "hint": "See clearance resources.",
      "fen": "r1bqk2r/pppp1ppp/2n1pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Line clearance defence",
      "about": "Dvoretsky resources — Line clearance defence.",
      "desc": "Clearance can defend: a piece vacates a square so a rook defends along a rank. Spot clearances that resurrect a defence you thought was dead. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: See clearance resources. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 28,
      "book": "resources",
      "title": "Re-routing defence",
      "teach": "A slow re-route can still arrive in time — calculate.",
      "hint": "Can their piece arrive in time?",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Re-routing defence",
      "about": "Dvoretsky resources — Re-routing defence.",
      "desc": "Ask whether a defensive piece can re-route in time to cover the critical square. Many attacks fail by one tempo to a re-route you dismissed as 'too slow'. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Can their piece arrive in time? (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 29,
      "book": "resources",
      "title": "Resource review",
      "teach": "Threats, quiet moves, sacs, fortresses — see them all.",
      "hint": "Play the resource-aware move.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/4R1K1 w - - 0 18",
      "goal": "win",
      "theme": "Resource review",
      "about": "Dvoretsky resources — Resource review.",
      "desc": "Synthesise the book: list their threats and quiet resources, calculate counter-sacs and fortresses, then choose the move that survives best defence. That is prophylaxis with calculation. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Play the resource-aware move. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 30,
      "book": "resources",
      "title": "Stop hope chess",
      "teach": "Assume they see the threat — calculate accordingly.",
      "hint": "Assume best defence.",
      "fen": "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Stop hope chess",
      "about": "Dvoretsky resources — Stop hope chess.",
      "desc": "Hope chess is the opposite of Dvoretsky's method. Assume they find the resource. If your idea only works against cooperative defence, it is not an idea — it is a wish. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Assume best defence. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 31,
      "book": "resources",
      "title": "Check prioritisation",
      "teach": "Order their checking resources by danger.",
      "hint": "Prioritise dangerous checks.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Check prioritisation",
      "about": "Dvoretsky resources — Check prioritisation.",
      "desc": "Not all checks are equal. Rank their checking resources by whether they mate, win material, or merely tempo. Calculate the dangerous ones first. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Prioritise dangerous checks. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 32,
      "book": "resources",
      "title": "Capture prioritisation",
      "teach": "Which of their captures actually change the eval?",
      "hint": "Prioritise meaningful captures.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Capture prioritisation",
      "about": "Dvoretsky resources — Capture prioritisation.",
      "desc": "Some captures are noise. Identify captures that destroy your structure or remove a key attacker. Those are real resources. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Prioritise meaningful captures. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 33,
      "book": "resources",
      "title": "King safety resource",
      "teach": "Improving their king can be the best defence.",
      "hint": "Respect king-improving defence.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "King safety resource",
      "about": "Dvoretsky resources — King safety resource.",
      "desc": "A prophylactic king move — luft or step off a line — can kill an attack. Include king safety improvements as defensive candidates. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Respect king-improving defence. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 34,
      "book": "resources",
      "title": "Piece coordination defence",
      "teach": "They may coordinate two pieces to hold a square.",
      "hint": "See coordinated defence.",
      "fen": "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Piece coordination defence",
      "about": "Dvoretsky resources — Piece coordination defence.",
      "desc": "One defender looks weak; two coordinated defenders hold. Calculate whether they can reinforce in time. Overestimating overloads is a common attacking error. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: See coordinated defence. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 35,
      "book": "resources",
      "title": "Pin-breaking resource",
      "teach": "They can break a pin with calculation or a sac.",
      "hint": "Account for pin breaks.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Pin-breaking resource",
      "about": "Dvoretsky resources — Pin-breaking resource.",
      "desc": "Pins feel permanent until they interpose, capture the pinner, or step out with a forcing sequence. Always ask how the pin breaks. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Account for pin breaks. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 36,
      "book": "resources",
      "title": "Counter-pin",
      "teach": "Answer a pin with a stronger pin or threat.",
      "hint": "Find the counter-pin resource.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Counter-pin",
      "about": "Dvoretsky resources — Counter-pin.",
      "desc": "Sometimes the resource against a pin is a counter-pin or a mate threat that makes the pin irrelevant. Look for that geometry. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Find the counter-pin resource. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 37,
      "book": "resources",
      "title": "Liquidation defence",
      "teach": "They liquidate into a drawn ending as a resource.",
      "hint": "Judge liquidating defence.",
      "fen": "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Liquidation defence",
      "about": "Dvoretsky resources — Liquidation defence.",
      "desc": "Defensive liquidation into a known draw is high-level technique. If you allow it, the attack failed. Prevent the liquidation or accept the draw leaf. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Judge liquidating defence. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 38,
      "book": "resources",
      "title": "Swindle alert",
      "teach": "In time pressure, swindle resources multiply.",
      "hint": "Stay alert to swindles.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Swindle alert",
      "about": "Dvoretsky resources — Swindle alert.",
      "desc": "Practical resource recognition includes swindles: stalemate, perpetual, one-move traps. When converting with low time, blunder-check extra hard. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Stay alert to swindles. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 39,
      "book": "resources",
      "title": "Quiet inclusion",
      "teach": "Your attack may need an inclusion against their resource.",
      "hint": "Include the prophylactic prep.",
      "fen": "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Quiet inclusion",
      "about": "Dvoretsky resources — Quiet inclusion.",
      "desc": "Often the win requires a quiet inclusion that covers a flight or stops a countercheck, then the combination works. Put the inclusion on your candidate list. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Include the prophylactic prep. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 40,
      "book": "resources",
      "title": "Move-order resource",
      "teach": "Their defence may depend on your inaccurate move order.",
      "hint": "Choose a move order that kills resources.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 2 9",
      "goal": "win",
      "theme": "Move-order resource",
      "about": "Dvoretsky resources — Move-order resource.",
      "desc": "Two move orders, one idea: one allows a resource, the other does not. Compare move orders specifically against their best reply. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Choose a move order that kills resources. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 41,
      "book": "resources",
      "title": "Square vacation",
      "teach": "They vacate a square to free a defensive piece.",
      "hint": "See vacation resources.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Square vacation",
      "about": "Dvoretsky resources — Square vacation.",
      "desc": "Vacating a square can unmask a defence or free a blockader. Include vacation ideas when assessing whether a square is 'permanently' weak. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: See vacation resources. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 42,
      "book": "resources",
      "title": "Overprotection myth",
      "teach": "Not every defence needs overprotection — calculate.",
      "hint": "Defend economically.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Overprotection myth",
      "about": "Dvoretsky resources — Overprotection myth.",
      "desc": "Dvoretsky-level defence is economical: enough resources, not ritual overprotection. Calculate the minimum that holds, and use spare tempi for counterplay. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Defend economically. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 43,
      "book": "resources",
      "title": "Initiative as defence",
      "teach": "Seizing the initiative can be the best defensive resource.",
      "hint": "Counter with initiative.",
      "fen": "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Initiative as defence",
      "about": "Dvoretsky resources — Initiative as defence.",
      "desc": "The strongest defence is sometimes an attack. If calculation supports a counterinitiative, take it rather than sitting under pressure forever. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Counter with initiative. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 44,
      "book": "resources",
      "title": "Endgame resource switch",
      "teach": "After queens off, their resources change — reassess.",
      "hint": "Reassess resources after trades.",
      "fen": "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Endgame resource switch",
      "about": "Dvoretsky resources — Endgame resource switch.",
      "desc": "Trading into an ending changes the resource landscape: king activity, passers, checks. Rebuild their resource list after the trade. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Reassess resources after trades. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 45,
      "book": "resources",
      "title": "Calculation hygiene",
      "teach": "Write (mentally) their best line before yours.",
      "hint": "Their line first, then yours.",
      "fen": "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14",
      "goal": "win",
      "theme": "Calculation hygiene",
      "about": "Dvoretsky resources — Calculation hygiene.",
      "desc": "Habit drill: verbalise their best two-ply resource, then your continuation. This reverses hopeful ordering and installs opponent-resource thinking. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Their line first, then yours. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 46,
      "book": "resources",
      "title": "False forcing",
      "teach": "Not every check forces — they may ignore it.",
      "hint": "Check if the check is real.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "False forcing",
      "about": "Dvoretsky resources — False forcing.",
      "desc": "A check that can be ignored (or met by a stronger threat) is not a forcing resource. Verify that your 'forcing' move actually forces. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Check if the check is real. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 47,
      "book": "resources",
      "title": "Threat vs execution",
      "teach": "Sometimes the threat is stronger — executing allows a resource.",
      "hint": "Prefer the stronger threat.",
      "fen": "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Threat vs execution",
      "about": "Dvoretsky resources — Threat vs execution.",
      "desc": "Classic wisdom with Dvoretsky precision: executing a threat can allow a resource that maintaining the threat prevents. Compare threat vs execution concretely. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Prefer the stronger threat. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 48,
      "book": "resources",
      "title": "Defence under material",
      "teach": "Down material, resources are activity and fortresses.",
      "hint": "Seek active/fortress resources.",
      "fen": "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Defence under material",
      "about": "Dvoretsky resources — Defence under material.",
      "desc": "When worse, do not play 'hope for a blunder'. Seek concrete resources: activity, perpetual, fortress. That is professional defence. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Seek active/fortress resources. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 49,
      "book": "resources",
      "title": "Attack under material",
      "teach": "Up material, their resources are swindles — blunt them.",
      "hint": "Blunt swindle resources.",
      "fen": "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/2N2NP1/PP2PP1P/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Attack under material",
      "about": "Dvoretsky resources — Attack under material.",
      "desc": "When ahead, prophylaxis against swindles is the conversion method. Cover checks, avoid stalemate, simplify carefully. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Blunt swindle resources. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 50,
      "book": "resources",
      "title": "Resources synthesis",
      "teach": "See their ideas, stop them, then improve.",
      "hint": "Play the prophylactic best move.",
      "fen": "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Resources synthesis",
      "about": "Dvoretsky resources — Resources synthesis.",
      "desc": "Final Resources drill: list threats and quiet resources, stop the critical one, then improve your position. Prophylaxis plus calculation. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Play the prophylactic best move. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 51,
      "book": "resources",
      "title": "See their threats (2)",
      "teach": "Before your idea, list every serious threat they have.",
      "hint": "Name their threat first.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "See their threats",
      "about": "Dvoretsky resources — See their threats.",
      "desc": "Dvoretsky's Resources training starts with a brutal habit: before calculating your combination, list their resources — checks, captures, threats, and quiet spoiling moves. Many 'wins' die to one unseen reply. On this board, name their strongest idea first, then choose a move that survives it. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Name their threat first. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 52,
      "book": "resources",
      "title": "Prophylaxis move (2)",
      "teach": "A move that stops their only plan can be best.",
      "hint": "Play the prophylactic move.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Prophylaxis move",
      "about": "Dvoretsky resources — Prophylaxis move.",
      "desc": "Pure prophylaxis is not cowardice — it is high-level calculation of their intentions. Identify the one plan that keeps them in the game and spoil it a tempo early. The resulting position should leave you free to improve without allowing counterplay. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Play the prophylactic move. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 53,
      "book": "resources",
      "title": "Zwischenzug resource (2)",
      "teach": "Expect in-between checks and captures in their defence.",
      "hint": "Account for the zwischenzug.",
      "fen": "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
      "goal": "win",
      "theme": "Zwischenzug resource",
      "about": "Dvoretsky resources — Zwischenzug resource.",
      "desc": "Opponent resources often arrive as zwischenzugs: a check or capture inserted before the 'forced' recapture. Build that branch into your tree. If your line collapses to an intermezzo, it was never sound. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Account for the zwischenzug. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 54,
      "book": "resources",
      "title": "Quiet spoiler (2)",
      "teach": "Their best resource may be a quiet move, not a check.",
      "hint": "Find/stop the quiet resource.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "Quiet spoiler",
      "about": "Dvoretsky resources — Quiet spoiler.",
      "desc": "Amateurs overestimate checks and underestimate quiet defensive moves — a knight retreat, a king step, a pawn nudge that kills your net. Dvoretsky drills that quiet resource. Include it among their candidates. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Find/stop the quiet resource. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 55,
      "book": "resources",
      "title": "Only-move defence (2)",
      "teach": "Sometimes they have one saving move — find it as them.",
      "hint": "Find their only save.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Only-move defence",
      "about": "Dvoretsky resources — Only-move defence.",
      "desc": "Training method: sit in their chair and hunt the only defence. If you cannot find it, you are not ready to play the attacking move. Recognizing resources means recognising their saves as well as their threats. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Find their only save. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 56,
      "book": "resources",
      "title": "Counter-sacrifice (2)",
      "teach": "Expect them to sac back to break your attack.",
      "hint": "Calculate the counter-sac.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Counter-sacrifice",
      "about": "Dvoretsky resources — Counter-sacrifice.",
      "desc": "A common resource against an attack is a counter-sacrifice that simplifies or seizes the initiative. Add that branch. If the counter-sac draws or wins for them, revise your plan. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Calculate the counter-sac. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 57,
      "book": "resources",
      "title": "Perpetual resource (2)",
      "teach": "Losing sides fish for perpetual — calculate it honestly.",
      "hint": "Prevent or allow perpetual correctly.",
      "fen": "r1bqkb1r/pp1ppppp/2n2n2/2p5/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 4",
      "goal": "win",
      "theme": "Perpetual resource",
      "about": "Dvoretsky resources — Perpetual resource.",
      "desc": "When you are winning, their resource is often perpetual check. When you are losing, it is your resource. Either way, calculate the checking loop fully before claiming a win or resigning the defence. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Prevent or allow perpetual correctly. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 58,
      "book": "resources",
      "title": "Stalemate trick (2)",
      "teach": "Stalemate is a defensive resource in technical wins.",
      "hint": "Avoid/use the stalemate resource.",
      "fen": "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Stalemate trick",
      "about": "Dvoretsky resources — Stalemate trick.",
      "desc": "Converting sides must leave the opponent a legal move; defending sides should fish for stalemate nets. Dvoretsky-level technique includes this 'cheap' resource because it scores half-points at the highest level. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Avoid/use the stalemate resource. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 59,
      "book": "resources",
      "title": "Desperado (2)",
      "teach": "A trapped piece may sell itself for maximum damage.",
      "hint": "Account for the desperado.",
      "fen": "rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 6",
      "goal": "win",
      "theme": "Desperado",
      "about": "Dvoretsky resources — Desperado.",
      "desc": "Desperado resources change material tallies mid-combination. Before you 'win a piece', ask whether it can capture something vital on the way out. Update the leaf evaluation accordingly. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Account for the desperado. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 60,
      "book": "resources",
      "title": "Back-rank resource (2)",
      "teach": "Back-rank mates cut both ways — see theirs and yours.",
      "hint": "Handle the back-rank resource.",
      "fen": "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Back-rank resource",
      "about": "Dvoretsky resources — Back-rank resource.",
      "desc": "Many brilliant attacks fail to a back-rank counterblow. Give yourself luft when needed, and look for their back-rank weakness when calculating. Resources cut both directions. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Handle the back-rank resource. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 61,
      "book": "resources",
      "title": "Interference defence (2)",
      "teach": "They may interfere with your line using a sac or pawn.",
      "hint": "See the interference resource.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Interference defence",
      "about": "Dvoretsky resources — Interference defence.",
      "desc": "Interference is a classic defensive (and attacking) resource. A piece or pawn lands on a critical line and your combination evaporates. Put interference on their candidate list. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: See the interference resource. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 62,
      "book": "resources",
      "title": "Deflection alert (2)",
      "teach": "Your defender may be deflected — or you can deflect theirs.",
      "hint": "Watch deflection resources.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "Deflection alert",
      "about": "Dvoretsky resources — Deflection alert.",
      "desc": "Overloaded defenders are resources waiting to be used — by either side. Ask who is overloaded. If you are, reinforce; if they are, deflect. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Watch deflection resources. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 63,
      "book": "resources",
      "title": "Pin as resource (2)",
      "teach": "Absolute and relative pins change what is 'legal' in the tree.",
      "hint": "Use/break the pin resource.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Pin as resource",
      "about": "Dvoretsky resources — Pin as resource.",
      "desc": "A pin is both your weapon and their shield. Relative pins can still move with calculation; absolute pins cannot. Treat pin status as part of resource recognition each ply. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Use/break the pin resource. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 64,
      "book": "resources",
      "title": "Flight squares (2)",
      "teach": "Cover flights before the mating net; they will run.",
      "hint": "Cover the flight square.",
      "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      "goal": "win",
      "theme": "Flight squares",
      "about": "Dvoretsky resources — Flight squares.",
      "desc": "Kings escape through flight squares you forgot to cover. Before the final check, ask where they run. Prophylaxis against flight is high-level finishing technique. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Cover the flight square. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 65,
      "book": "resources",
      "title": "King walk resource (2)",
      "teach": "Their king may walk out of the net — calculate the path.",
      "hint": "Stop the king walk.",
      "fen": "rnbqk2r/pp2ppbp/5np1/2pp4/3P4/2P2NP1/PP2PP1P/RNBQKB1R w KQkq - 0 6",
      "goal": "win",
      "theme": "King walk resource",
      "about": "Dvoretsky resources — King walk resource.",
      "desc": "Sometimes the resource is simply walking the king to safety. Calculate the escape path as carefully as the attack. If the walk works, your combination needs an inclusion. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Stop the king walk. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 66,
      "book": "resources",
      "title": "Exchange sac defence (2)",
      "teach": "They may sac the exchange to kill your attack.",
      "hint": "Judge the defensive exchange sac.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Exchange sac defence",
      "about": "Dvoretsky resources — Exchange sac defence.",
      "desc": "Defensive exchange sacrifices are elite resources: give a rook for a minor piece that holds forever. Evaluate the resulting fortress honestly before continuing to 'attack'. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Judge the defensive exchange sac. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 67,
      "book": "resources",
      "title": "Simplification resource (2)",
      "teach": "Trading queens can be their path to a draw.",
      "hint": "Decide on queen trades.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Simplification resource",
      "about": "Dvoretsky resources — Simplification resource.",
      "desc": "When you attack, their resource is often a queen trade into a holdable ending. When you defend, it may be yours. Calculate the ending before allowing or forcing the trade. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Decide on queen trades. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 68,
      "book": "resources",
      "title": "Pawn break counter (2)",
      "teach": "Meet a wing attack with their central break in mind.",
      "hint": "Respect the counterbreak.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Pawn break counter",
      "about": "Dvoretsky resources — Pawn break counter.",
      "desc": "The classical resource against a flank attack is a central break. If you are storming, calculate ...d5/...e5 ideas. If you are defending, prepare that break as your resource. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Respect the counterbreak. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 69,
      "book": "resources",
      "title": "Hidden check (2)",
      "teach": "Discovered checks are resources that appear mid-line.",
      "hint": "Spot discovered-check resources.",
      "fen": "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Hidden check",
      "about": "Dvoretsky resources — Hidden check.",
      "desc": "Discoveries flip evaluations instantly. Before a capture sequence, ask which discoveries open. Include them as forced branches in the tree. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Spot discovered-check resources. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 70,
      "book": "resources",
      "title": "Overloaded attacker (2)",
      "teach": "Your attacking piece may be overloaded too.",
      "hint": "Secure your attacking unit.",
      "fen": "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
      "goal": "win",
      "theme": "Overloaded attacker",
      "about": "Dvoretsky resources — Overloaded attacker.",
      "desc": "Resource recognition includes your own overloads. If the piece delivering mate also defends against mate, their resource may be to exploit that. Secure or re-order. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Secure your attacking unit. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 71,
      "book": "resources",
      "title": "Prophylactic calculation (2)",
      "teach": "Calculate their reply before you commit to the win.",
      "hint": "Calculate their best reply.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Prophylactic calculation",
      "about": "Dvoretsky resources — Prophylactic calculation.",
      "desc": "The training loop: choose your intended move, then calculate their best resource for at least two plies. Only then commit. This is the heart of Recognizing Your Opponent's Resources. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Calculate their best reply. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 72,
      "book": "resources",
      "title": "Candidate their moves (2)",
      "teach": "List their candidates as carefully as yours.",
      "hint": "List their candidates.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Candidate their moves",
      "about": "Dvoretsky resources — Candidate their moves.",
      "desc": "Dvoretsky asks you to build a candidate list for the opponent. Checks, captures, quiet spoilers. Width on their side prevents tunnel vision on yours. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: List their candidates. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 73,
      "book": "resources",
      "title": "Trap awareness (2)",
      "teach": "If the win looks too easy, find the trap resource.",
      "hint": "Find the trap.",
      "fen": "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Trap awareness",
      "about": "Dvoretsky resources — Trap awareness.",
      "desc": "Easy wins often hide a resource. When a combination looks forced and pretty, spend an extra minute hunting the spoiling move. Paranoia is a skill. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Find the trap. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 74,
      "book": "resources",
      "title": "Active defence (2)",
      "teach": "Their best defence may be a counterattack.",
      "hint": "Expect active defence.",
      "fen": "r1bqk2r/pp1pppbp/2n2np1/2p5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5",
      "goal": "win",
      "theme": "Active defence",
      "about": "Dvoretsky resources — Active defence.",
      "desc": "Passive defence is not their only resource. Counterattacks — checks against your king — can seize the initiative. Calculate with their counterattack as a main branch. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Expect active defence. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 75,
      "book": "resources",
      "title": "Fortress resource (2)",
      "teach": "Some positions hold despite material deficit.",
      "hint": "Recognise fortress chances.",
      "fen": "r2q1rk1/ppp1ppbp/2np1np1/8/2PPP1b1/2N2N2/PP2BPPP/R1BQK2R w KQ - 4 8",
      "goal": "win",
      "theme": "Fortress resource",
      "about": "Dvoretsky resources — Fortress resource.",
      "desc": "A fortress is an ultimate defensive resource. If you are converting, break it; if you are saving, build it. Do not assume material always wins. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Recognise fortress chances. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 76,
      "book": "resources",
      "title": "Tempo resource (2)",
      "teach": "A useful waiting move can be their saving tempo.",
      "hint": "Account for useful tempi.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Tempo resource",
      "about": "Dvoretsky resources — Tempo resource.",
      "desc": "Zugzwang and reserve tempi are resources. They may have a waiting move that passes the move back to you in a worse form. Include waiting moves in defensive candidate lists. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Account for useful tempi. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 77,
      "book": "resources",
      "title": "Line clearance defence (2)",
      "teach": "They may clear a defensive line with tempo.",
      "hint": "See clearance resources.",
      "fen": "r1bqk2r/pppp1ppp/2n1pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Line clearance defence",
      "about": "Dvoretsky resources — Line clearance defence.",
      "desc": "Clearance can defend: a piece vacates a square so a rook defends along a rank. Spot clearances that resurrect a defence you thought was dead. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: See clearance resources. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 78,
      "book": "resources",
      "title": "Re-routing defence (2)",
      "teach": "A slow re-route can still arrive in time — calculate.",
      "hint": "Can their piece arrive in time?",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Re-routing defence",
      "about": "Dvoretsky resources — Re-routing defence.",
      "desc": "Ask whether a defensive piece can re-route in time to cover the critical square. Many attacks fail by one tempo to a re-route you dismissed as 'too slow'. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Can their piece arrive in time? (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 79,
      "book": "resources",
      "title": "Resource review (2)",
      "teach": "Threats, quiet moves, sacs, fortresses — see them all.",
      "hint": "Play the resource-aware move.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/4R1K1 w - - 0 18",
      "goal": "win",
      "theme": "Resource review",
      "about": "Dvoretsky resources — Resource review.",
      "desc": "Synthesise the book: list their threats and quiet resources, calculate counter-sacs and fortresses, then choose the move that survives best defence. That is prophylaxis with calculation. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Play the resource-aware move. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 80,
      "book": "resources",
      "title": "Stop hope chess (2)",
      "teach": "Assume they see the threat — calculate accordingly.",
      "hint": "Assume best defence.",
      "fen": "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Stop hope chess",
      "about": "Dvoretsky resources — Stop hope chess.",
      "desc": "Hope chess is the opposite of Dvoretsky's method. Assume they find the resource. If your idea only works against cooperative defence, it is not an idea — it is a wish. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Assume best defence. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 81,
      "book": "resources",
      "title": "Check prioritisation (2)",
      "teach": "Order their checking resources by danger.",
      "hint": "Prioritise dangerous checks.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Check prioritisation",
      "about": "Dvoretsky resources — Check prioritisation.",
      "desc": "Not all checks are equal. Rank their checking resources by whether they mate, win material, or merely tempo. Calculate the dangerous ones first. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Prioritise dangerous checks. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 82,
      "book": "resources",
      "title": "Capture prioritisation (2)",
      "teach": "Which of their captures actually change the eval?",
      "hint": "Prioritise meaningful captures.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Capture prioritisation",
      "about": "Dvoretsky resources — Capture prioritisation.",
      "desc": "Some captures are noise. Identify captures that destroy your structure or remove a key attacker. Those are real resources. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Prioritise meaningful captures. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 83,
      "book": "resources",
      "title": "King safety resource (2)",
      "teach": "Improving their king can be the best defence.",
      "hint": "Respect king-improving defence.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "King safety resource",
      "about": "Dvoretsky resources — King safety resource.",
      "desc": "A prophylactic king move — luft or step off a line — can kill an attack. Include king safety improvements as defensive candidates. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Respect king-improving defence. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 84,
      "book": "resources",
      "title": "Piece coordination defence (2)",
      "teach": "They may coordinate two pieces to hold a square.",
      "hint": "See coordinated defence.",
      "fen": "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Piece coordination defence",
      "about": "Dvoretsky resources — Piece coordination defence.",
      "desc": "One defender looks weak; two coordinated defenders hold. Calculate whether they can reinforce in time. Overestimating overloads is a common attacking error. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: See coordinated defence. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 85,
      "book": "resources",
      "title": "Pin-breaking resource (2)",
      "teach": "They can break a pin with calculation or a sac.",
      "hint": "Account for pin breaks.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Pin-breaking resource",
      "about": "Dvoretsky resources — Pin-breaking resource.",
      "desc": "Pins feel permanent until they interpose, capture the pinner, or step out with a forcing sequence. Always ask how the pin breaks. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Account for pin breaks. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 86,
      "book": "resources",
      "title": "Counter-pin (2)",
      "teach": "Answer a pin with a stronger pin or threat.",
      "hint": "Find the counter-pin resource.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Counter-pin",
      "about": "Dvoretsky resources — Counter-pin.",
      "desc": "Sometimes the resource against a pin is a counter-pin or a mate threat that makes the pin irrelevant. Look for that geometry. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Find the counter-pin resource. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 87,
      "book": "resources",
      "title": "Liquidation defence (2)",
      "teach": "They liquidate into a drawn ending as a resource.",
      "hint": "Judge liquidating defence.",
      "fen": "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Liquidation defence",
      "about": "Dvoretsky resources — Liquidation defence.",
      "desc": "Defensive liquidation into a known draw is high-level technique. If you allow it, the attack failed. Prevent the liquidation or accept the draw leaf. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Judge liquidating defence. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 88,
      "book": "resources",
      "title": "Swindle alert (2)",
      "teach": "In time pressure, swindle resources multiply.",
      "hint": "Stay alert to swindles.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Swindle alert",
      "about": "Dvoretsky resources — Swindle alert.",
      "desc": "Practical resource recognition includes swindles: stalemate, perpetual, one-move traps. When converting with low time, blunder-check extra hard. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Stay alert to swindles. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 89,
      "book": "resources",
      "title": "Quiet inclusion (2)",
      "teach": "Your attack may need an inclusion against their resource.",
      "hint": "Include the prophylactic prep.",
      "fen": "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Quiet inclusion",
      "about": "Dvoretsky resources — Quiet inclusion.",
      "desc": "Often the win requires a quiet inclusion that covers a flight or stops a countercheck, then the combination works. Put the inclusion on your candidate list. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Include the prophylactic prep. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 90,
      "book": "resources",
      "title": "Move-order resource (2)",
      "teach": "Their defence may depend on your inaccurate move order.",
      "hint": "Choose a move order that kills resources.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 2 9",
      "goal": "win",
      "theme": "Move-order resource",
      "about": "Dvoretsky resources — Move-order resource.",
      "desc": "Two move orders, one idea: one allows a resource, the other does not. Compare move orders specifically against their best reply. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Choose a move order that kills resources. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 91,
      "book": "resources",
      "title": "Square vacation (2)",
      "teach": "They vacate a square to free a defensive piece.",
      "hint": "See vacation resources.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Square vacation",
      "about": "Dvoretsky resources — Square vacation.",
      "desc": "Vacating a square can unmask a defence or free a blockader. Include vacation ideas when assessing whether a square is 'permanently' weak. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: See vacation resources. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 92,
      "book": "resources",
      "title": "Overprotection myth (2)",
      "teach": "Not every defence needs overprotection — calculate.",
      "hint": "Defend economically.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Overprotection myth",
      "about": "Dvoretsky resources — Overprotection myth.",
      "desc": "Dvoretsky-level defence is economical: enough resources, not ritual overprotection. Calculate the minimum that holds, and use spare tempi for counterplay. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Defend economically. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 93,
      "book": "resources",
      "title": "Initiative as defence (2)",
      "teach": "Seizing the initiative can be the best defensive resource.",
      "hint": "Counter with initiative.",
      "fen": "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Initiative as defence",
      "about": "Dvoretsky resources — Initiative as defence.",
      "desc": "The strongest defence is sometimes an attack. If calculation supports a counterinitiative, take it rather than sitting under pressure forever. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Counter with initiative. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 94,
      "book": "resources",
      "title": "Endgame resource switch (2)",
      "teach": "After queens off, their resources change — reassess.",
      "hint": "Reassess resources after trades.",
      "fen": "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Endgame resource switch",
      "about": "Dvoretsky resources — Endgame resource switch.",
      "desc": "Trading into an ending changes the resource landscape: king activity, passers, checks. Rebuild their resource list after the trade. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Reassess resources after trades. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 95,
      "book": "resources",
      "title": "Calculation hygiene (2)",
      "teach": "Write (mentally) their best line before yours.",
      "hint": "Their line first, then yours.",
      "fen": "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14",
      "goal": "win",
      "theme": "Calculation hygiene",
      "about": "Dvoretsky resources — Calculation hygiene.",
      "desc": "Habit drill: verbalise their best two-ply resource, then your continuation. This reverses hopeful ordering and installs opponent-resource thinking. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Their line first, then yours. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 96,
      "book": "resources",
      "title": "False forcing (2)",
      "teach": "Not every check forces — they may ignore it.",
      "hint": "Check if the check is real.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "False forcing",
      "about": "Dvoretsky resources — False forcing.",
      "desc": "A check that can be ignored (or met by a stronger threat) is not a forcing resource. Verify that your 'forcing' move actually forces. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Check if the check is real. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 97,
      "book": "resources",
      "title": "Threat vs execution (2)",
      "teach": "Sometimes the threat is stronger — executing allows a resource.",
      "hint": "Prefer the stronger threat.",
      "fen": "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Threat vs execution",
      "about": "Dvoretsky resources — Threat vs execution.",
      "desc": "Classic wisdom with Dvoretsky precision: executing a threat can allow a resource that maintaining the threat prevents. Compare threat vs execution concretely. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Prefer the stronger threat. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 98,
      "book": "resources",
      "title": "Defence under material (2)",
      "teach": "Down material, resources are activity and fortresses.",
      "hint": "Seek active/fortress resources.",
      "fen": "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Defence under material",
      "about": "Dvoretsky resources — Defence under material.",
      "desc": "When worse, do not play 'hope for a blunder'. Seek concrete resources: activity, perpetual, fortress. That is professional defence. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Seek active/fortress resources. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 99,
      "book": "resources",
      "title": "Attack under material (2)",
      "teach": "Up material, their resources are swindles — blunt them.",
      "hint": "Blunt swindle resources.",
      "fen": "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/2N2NP1/PP2PP1P/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Attack under material",
      "about": "Dvoretsky resources — Attack under material.",
      "desc": "When ahead, prophylaxis against swindles is the conversion method. Cover checks, avoid stalemate, simplify carefully. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Blunt swindle resources. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 100,
      "book": "resources",
      "title": "Resources synthesis (2)",
      "teach": "See their ideas, stop them, then improve.",
      "hint": "Play the prophylactic best move.",
      "fen": "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Resources synthesis",
      "about": "Dvoretsky resources — Resources synthesis.",
      "desc": "Final Resources drill: list threats and quiet resources, stop the critical one, then improve your position. Prophylaxis plus calculation. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Play the prophylactic best move. (Recognizing Your Opponent's Resources–style · prophylaxis & calculation)",
      "pitfalls": []
    },
    {
      "n": 101,
      "book": "strategic",
      "title": "Complex evaluation",
      "teach": "When unclear, list imbalances and pick a direction.",
      "hint": "Choose a direction amid uncertainty.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Complex evaluation",
      "about": "Aagaard strategic play — Complex evaluation.",
      "desc": "Grandmaster Preparation: Strategic Play thrives in unclear positions where engines disagree with humans. Rank imbalances imperfectly, then commit to a plan that is robust under uncertainty — not a one-line tactic that needs perfection. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Choose a direction amid uncertainty. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 102,
      "book": "strategic",
      "title": "Robust plans",
      "teach": "Prefer plans that survive a range of replies.",
      "hint": "Pick the robust plan.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Robust plans",
      "about": "Aagaard strategic play — Robust plans.",
      "desc": "A fragile plan collapses to one resource. A robust plan remains playable against several defences. Under uncertainty, robustness beats brilliancy. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Pick the robust plan. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 103,
      "book": "strategic",
      "title": "Critical decision",
      "teach": "Flag the move that changes the game's character.",
      "hint": "Play the critical decision.",
      "fen": "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
      "goal": "win",
      "theme": "Critical decision",
      "about": "Aagaard strategic play — Critical decision.",
      "desc": "Some moves are critical: they transform structure, material, or king safety permanently. Aagaard trains you to recognise those moments and calculate deeper there, while playing faster elsewhere. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Play the critical decision. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 104,
      "book": "strategic",
      "title": "Strategic candidate moves",
      "teach": "List strategic candidates — not only tactics.",
      "hint": "Compare strategic candidates.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "Strategic candidate moves",
      "about": "Aagaard strategic play — Strategic candidate moves.",
      "desc": "Candidates include improving moves, prophylactic moves, and breaks. In complex positions, the best move may look quiet. Force yourself to list positional candidates alongside shots. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Compare strategic candidates. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 105,
      "book": "strategic",
      "title": "Uncertainty tolerance",
      "teach": "Play good practical moves when truth is unclear.",
      "hint": "Choose the practical unclear try.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Uncertainty tolerance",
      "about": "Aagaard strategic play — Uncertainty tolerance.",
      "desc": "You will not always find the truth. Strategic Play accepts that. Choose the move that keeps chances and limits risk when the evaluation is foggy. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Choose the practical unclear try. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 106,
      "book": "strategic",
      "title": "Transform or maintain",
      "teach": "Decide whether to change the advantage's nature.",
      "hint": "Transform or maintain.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Transform or maintain",
      "about": "Aagaard strategic play — Transform or maintain.",
      "desc": "Should you keep a static bind or cash it for dynamics? That transformation decision is central to Aagaard's strategic training. Pick consciously. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Transform or maintain. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 107,
      "book": "strategic",
      "title": "Piece coordination puzzle",
      "teach": "Untangle before you strike.",
      "hint": "Untangle the pieces.",
      "fen": "r1bqkb1r/pp1ppppp/2n2n2/2p5/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 4",
      "goal": "win",
      "theme": "Piece coordination puzzle",
      "about": "Aagaard strategic play — Piece coordination puzzle.",
      "desc": "Complex positions often feature tangled pieces. The strategic move may be a reorganisation that looks slow but enables everything else. Untangle first. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Untangle the pieces. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 108,
      "book": "strategic",
      "title": "Break vs restrain",
      "teach": "In tension, choose break or restrain with a reason.",
      "hint": "Break or restrain — decide.",
      "fen": "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Break vs restrain",
      "about": "Aagaard strategic play — Break vs restrain.",
      "desc": "Central tension demands a decision: resolve with a break or restrain and improve. Under uncertainty, prefer the choice that matches your piece placement. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Break or restrain — decide. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 109,
      "book": "strategic",
      "title": "King as factor",
      "teach": "King safety can outweigh structural beauty.",
      "hint": "Weight king safety highly.",
      "fen": "rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 6",
      "goal": "win",
      "theme": "King as factor",
      "about": "Aagaard strategic play — King as factor.",
      "desc": "In complex middlegames, king safety often decides. A structurally 'ugly' move that secures the king can be the strategic truth. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Weight king safety highly. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 110,
      "book": "strategic",
      "title": "Space decisions",
      "teach": "Gain space only if you can use it.",
      "hint": "Gain or refuse space.",
      "fen": "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Space decisions",
      "about": "Aagaard strategic play — Space decisions.",
      "desc": "Space can be a gift or a target. Aagaard's positions ask whether expansion helps your pieces or creates holes. Expand with a follow-up or refrain. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Gain or refuse space. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 111,
      "book": "strategic",
      "title": "Exchange complex",
      "teach": "Exchanges in complex positions need a story.",
      "hint": "Exchange with a story.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Exchange complex",
      "about": "Aagaard strategic play — Exchange complex.",
      "desc": "Trading in a mess without a story increases uncertainty. Exchange to clarify a favourable ending, remove their best piece, or open a colour complex — otherwise keep tension. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Exchange with a story. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 112,
      "book": "strategic",
      "title": "Initiative in fog",
      "teach": "When unclear, seizing the initiative is often practical.",
      "hint": "Take the practical initiative.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "Initiative in fog",
      "about": "Aagaard strategic play — Initiative in fog.",
      "desc": "Initiative creates problems for them to solve under uncertainty. If evaluations are muddy, prefer the move that asks questions. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Take the practical initiative. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 113,
      "book": "strategic",
      "title": "Prophylaxis in complexity",
      "teach": "Stop their clarifying idea, then play your own.",
      "hint": "Stop their clarifying idea.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Prophylaxis in complexity",
      "about": "Aagaard strategic play — Prophylaxis in complexity.",
      "desc": "In complex play, their resource may be a clarifying break. Prophylaxis that keeps the position difficult for them is strategic gold. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Stop their clarifying idea. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 114,
      "book": "strategic",
      "title": "Pawn commitment",
      "teach": "Commit pawns when information is sufficient.",
      "hint": "Commit or stay flexible.",
      "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      "goal": "win",
      "theme": "Pawn commitment",
      "about": "Aagaard strategic play — Pawn commitment.",
      "desc": "Flexibility vs commitment is an Aagaard theme. Keep options when unsure; commit when your pieces are ready and their setup is known. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Commit or stay flexible. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 115,
      "book": "strategic",
      "title": "Dynamic equality",
      "teach": "Equal may mean mutual chances — play for yours.",
      "hint": "Play for your dynamic chances.",
      "fen": "rnbqk2r/pp2ppbp/5np1/2pp4/3P4/2P2NP1/PP2PP1P/RNBQKB1R w KQkq - 0 6",
      "goal": "win",
      "theme": "Dynamic equality",
      "about": "Aagaard strategic play — Dynamic equality.",
      "desc": "Dynamic equality is not a draw offer. Identify your source of chances (attack, passer, colour complex) and play toward it. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Play for your dynamic chances. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 116,
      "book": "strategic",
      "title": "Strategic sacrifice",
      "teach": "Sac for lasting soft squares or initiative when robust.",
      "hint": "Judge the strategic sac.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Strategic sacrifice",
      "about": "Aagaard strategic play — Strategic sacrifice.",
      "desc": "Strategic sacrifices under uncertainty require compensation you can feel across several branches — squares, attack, domination — not a single forced line. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Judge the strategic sac. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 117,
      "book": "strategic",
      "title": "Worst-piece in complexity",
      "teach": "Even in messes, cure the worst piece.",
      "hint": "Improve the worst piece.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Worst-piece in complexity",
      "about": "Aagaard strategic play — Worst-piece in complexity.",
      "desc": "A universal strategic algorithm: improve the worst-placed piece. In complex positions this often clarifies the rest of the plan. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Improve the worst piece. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 118,
      "book": "strategic",
      "title": "Two-plan thinking",
      "teach": "Keep a main plan and a backup under uncertainty.",
      "hint": "Keep a backup plan.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Two-plan thinking",
      "about": "Aagaard strategic play — Two-plan thinking.",
      "desc": "If plan A relies on a fragile tactic, have plan B. Aagaard's decision-making includes switching without ego when resources appear. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Keep a backup plan. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 119,
      "book": "strategic",
      "title": "Colour-complex fight",
      "teach": "Fight for a colour complex in unclear structures.",
      "hint": "Play on your colour complex.",
      "fen": "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Colour-complex fight",
      "about": "Aagaard strategic play — Colour-complex fight.",
      "desc": "Complex games often hinge on one colour. Trade the right minor, occupy holes, and accept structural scars that buy the complex. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Play on your colour complex. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 120,
      "book": "strategic",
      "title": "Time as strategy",
      "teach": "Use development leads before they vanish.",
      "hint": "Cash the time advantage.",
      "fen": "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
      "goal": "win",
      "theme": "Time as strategy",
      "about": "Aagaard strategic play — Time as strategy.",
      "desc": "A lead in time is a strategic resource with an expiry date. Open the position or create threats before they catch up. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Cash the time advantage. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 121,
      "book": "strategic",
      "title": "Structure scars",
      "teach": "Accept a scar if it buys a lasting plus.",
      "hint": "Accept the useful scar.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Structure scars",
      "about": "Aagaard strategic play — Structure scars.",
      "desc": "Strategic play allows ugly pawns when activity or king attack compensates. Evaluate the scar honestly across branches. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Accept the useful scar. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 122,
      "book": "strategic",
      "title": "Middlegame ending steer",
      "teach": "Steer toward endings that reduce uncertainty your way.",
      "hint": "Steer the game phase.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Middlegame ending steer",
      "about": "Aagaard strategic play — Middlegame ending steer.",
      "desc": "If the middlegame is too unclear, a favourable ending may be clearer. Steer trades when the ending favors your structure or activity. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Steer the game phase. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 123,
      "book": "strategic",
      "title": "Calculation budget",
      "teach": "Spend depth on critical decisions; play faster elsewhere.",
      "hint": "Budget calculation wisely.",
      "fen": "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Calculation budget",
      "about": "Aagaard strategic play — Calculation budget.",
      "desc": "Strategic Play is not endless calculation. Budget deep thought for critical choices and trust strategic algorithms elsewhere. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Budget calculation wisely. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 124,
      "book": "strategic",
      "title": "Practical risk",
      "teach": "Match risk to tournament needs and eval fog.",
      "hint": "Set the right risk level.",
      "fen": "r1bqk2r/pp1pppbp/2n2np1/2p5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5",
      "goal": "win",
      "theme": "Practical risk",
      "about": "Aagaard strategic play — Practical risk.",
      "desc": "Must-win vs must-draw changes strategic choices in unclear positions. Adjust risk consciously — that is preparation-level thinking. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Set the right risk level. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 125,
      "book": "strategic",
      "title": "Problem-posing moves",
      "teach": "Prefer moves that force difficult replies.",
      "hint": "Pose a hard problem.",
      "fen": "r2q1rk1/ppp1ppbp/2np1np1/8/2PPP1b1/2N2N2/PP2BPPP/R1BQK2R w KQ - 4 8",
      "goal": "win",
      "theme": "Problem-posing moves",
      "about": "Aagaard strategic play — Problem-posing moves.",
      "desc": "Under uncertainty, the practical edge often goes to the player who poses problems. Choose the move that is hardest to meet. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Pose a hard problem. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 126,
      "book": "strategic",
      "title": "Prevent clarity for them",
      "teach": "Do not allow them an easy clarifying sequence.",
      "hint": "Deny easy clarity.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Prevent clarity for them",
      "about": "Aagaard strategic play — Prevent clarity for them.",
      "desc": "If a sequence clarifies the position in their favour, prevent it. Keeping the game complex can be the right strategic decision when you are the better calculator — or the opposite when you are not. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Deny easy clarity. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 127,
      "book": "strategic",
      "title": "Harmonise then break",
      "teach": "Coordinate, then break — especially when unclear.",
      "hint": "Harmonise, then break.",
      "fen": "r1bqk2r/pppp1ppp/2n1pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Harmonise then break",
      "about": "Aagaard strategic play — Harmonise then break.",
      "desc": "Breaking before harmony invites resources. In complex posts, spend moves on harmony, then break when pieces scream for it. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Harmonise, then break. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 128,
      "book": "strategic",
      "title": "Evaluate after change",
      "teach": "Every structural change demands a fresh eval.",
      "hint": "Re-evaluate after the change.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Evaluate after change",
      "about": "Aagaard strategic play — Evaluate after change.",
      "desc": "A capture or pawn push rewrites the strategic story. Stop and re-rank imbalances. Old plans die with old structures. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Re-evaluate after the change. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 129,
      "book": "strategic",
      "title": "Strategic verification",
      "teach": "Verify the plan against forcing resources.",
      "hint": "Verify against forcing moves.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/4R1K1 w - - 0 18",
      "goal": "win",
      "theme": "Strategic verification",
      "about": "Aagaard strategic play — Strategic verification.",
      "desc": "Strategy without verification is hope. After choosing a strategic move, check forcing replies. Aagaard's method unites both. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Verify against forcing moves. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 130,
      "book": "strategic",
      "title": "Strategic synthesis",
      "teach": "Imbalances, robust plan, verify, play.",
      "hint": "Play the strategic decision.",
      "fen": "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Strategic synthesis",
      "about": "Aagaard strategic play — Strategic synthesis.",
      "desc": "Synthesise Strategic Play: evaluate through fog, choose a robust plan, verify tactics, commit. That is the move under uncertainty. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Play the strategic decision. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 131,
      "book": "strategic",
      "title": "Bind vs break",
      "teach": "Maintain a bind only if it restricts real ideas.",
      "hint": "Keep or release the bind.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Bind vs break",
      "about": "Aagaard strategic play — Bind vs break.",
      "desc": "Binds that restrict nothing are vanity. Keep a bind when it stops their only breaks; release when you need open lines for your pieces. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Keep or release the bind. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 132,
      "book": "strategic",
      "title": "Opposite castling complexity",
      "teach": "Race with central awareness in messy opposite castling.",
      "hint": "Race intelligently.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Opposite castling complexity",
      "about": "Aagaard strategic play — Opposite castling complexity.",
      "desc": "Opposite castling in complex books mixes storms with central counters. Push your storm while calculating their break. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Race intelligently. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 133,
      "book": "strategic",
      "title": "Exchange-sac strategy",
      "teach": "Positional exchange sacs need lasting compensation.",
      "hint": "Judge the exchange sac.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Exchange-sac strategy",
      "about": "Aagaard strategic play — Exchange-sac strategy.",
      "desc": "Strategic exchange sacrifices buy squares and attacks across many branches. If compensation is narrow and fragile, decline. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Judge the exchange sac. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 134,
      "book": "strategic",
      "title": "Queen placement strategy",
      "teach": "Park the queen on a safe multi-purpose square.",
      "hint": "Improve queen placement.",
      "fen": "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Queen placement strategy",
      "about": "Aagaard strategic play — Queen placement strategy.",
      "desc": "In complex middlegames, queen placement ties plans together. Find a square that eyes both wings without walking into tempi. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Improve queen placement. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 135,
      "book": "strategic",
      "title": "Rook file battles",
      "teach": "Contest the open file before the mess clarifies.",
      "hint": "Fight for the file.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Rook file battles",
      "about": "Aagaard strategic play — Rook file battles.",
      "desc": "Open files decide complex games. Contest early; doubled rooks turn uncertainty into pressure. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Fight for the file. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 136,
      "book": "strategic",
      "title": "Minor-piece imbalance",
      "teach": "Steering the remaining minor is a strategic decision.",
      "hint": "Steer the minor-piece balance.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Minor-piece imbalance",
      "about": "Aagaard strategic play — Minor-piece imbalance.",
      "desc": "Which minor remains often decides unclear games. Trade toward the piece that fits the evolving structure. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Steer the minor-piece balance. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 137,
      "book": "strategic",
      "title": "Prophylactic improvement",
      "teach": "A move that improves and prevents is ideal.",
      "hint": "Improve and prevent.",
      "fen": "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Prophylactic improvement",
      "about": "Aagaard strategic play — Prophylactic improvement.",
      "desc": "Dual-purpose moves are gold under uncertainty: improve your worst piece while stopping their idea. Hunt that move. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Improve and prevent. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 138,
      "book": "strategic",
      "title": "Central control fog",
      "teach": "Even when unclear, do not abandon the centre.",
      "hint": "Keep central presence.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Central control fog",
      "about": "Aagaard strategic play — Central control fog.",
      "desc": "Complex play still respects the centre. Maintain presence or pressure so wing adventures do not leave you punctured. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Keep central presence. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 139,
      "book": "strategic",
      "title": "Pawn storm timing",
      "teach": "Storm when pieces are ready — not before.",
      "hint": "Time the storm.",
      "fen": "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Pawn storm timing",
      "about": "Aagaard strategic play — Pawn storm timing.",
      "desc": "Premature storms create counter-resources. Strategic timing waits for lifts and batteries, then advances. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Time the storm. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 140,
      "book": "strategic",
      "title": "Defence in complexity",
      "teach": "Active defence beats passive suffering in unclear games.",
      "hint": "Defend actively.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 2 9",
      "goal": "win",
      "theme": "Defence in complexity",
      "about": "Aagaard strategic play — Defence in complexity.",
      "desc": "When under pressure in a mess, seek exchanges or counters that clarify favorably. Passive defence invites a strategic crush. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Defend actively. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 141,
      "book": "strategic",
      "title": "Conversion path",
      "teach": "When better in a complex position, simplify wisely.",
      "hint": "Simplify while better.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Conversion path",
      "about": "Aagaard strategic play — Conversion path.",
      "desc": "Complexity helps the defender. If you are better, find a simplification path that preserves a usable edge. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Simplify while better. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 142,
      "book": "strategic",
      "title": "Complication path",
      "teach": "When worse, keep the position rich.",
      "hint": "Keep richness when worse.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Complication path",
      "about": "Aagaard strategic play — Complication path.",
      "desc": "Trailing under uncertainty, avoid dry clear losses. Keep pieces and tension so resources remain. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Keep richness when worse. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 143,
      "book": "strategic",
      "title": "Plan communication",
      "teach": "Your move should announce a coherent plan.",
      "hint": "Play a plan-consistent move.",
      "fen": "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Plan communication",
      "about": "Aagaard strategic play — Plan communication.",
      "desc": "Random strong-looking moves without a plan increase chaos for you too. Make a move that belongs to a named plan. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Play a plan-consistent move. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 144,
      "book": "strategic",
      "title": "Engine-free judgment",
      "teach": "Train judgment without leaning on engine lines.",
      "hint": "Trust trained judgment.",
      "fen": "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Engine-free judgment",
      "about": "Aagaard strategic play — Engine-free judgment.",
      "desc": "Aagaard's books build human judgment. Practice choosing without needing a forced line to the end — then verify critical tactics. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Trust trained judgment. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 145,
      "book": "strategic",
      "title": "Critical square fight",
      "teach": "Identify one critical square and fight for it.",
      "hint": "Fight for the critical square.",
      "fen": "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14",
      "goal": "win",
      "theme": "Critical square fight",
      "about": "Aagaard strategic play — Critical square fight.",
      "desc": "Complex positions often hinge on one square (e5, d5, f5, c4). Name it and play the move that contests it. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Fight for the critical square. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 146,
      "book": "strategic",
      "title": "Slow vs fast plans",
      "teach": "Match plan speed to the opponent's threats.",
      "hint": "Pick the right plan speed.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Slow vs fast plans",
      "about": "Aagaard strategic play — Slow vs fast plans.",
      "desc": "If they have fast threats, your slow strategic grind fails. Match tempo: fast plans vs fast threats; slow plans when the position is closed and safe. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Pick the right plan speed. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 147,
      "book": "strategic",
      "title": "Imbalance creation",
      "teach": "If the position is sterile, create an imbalance.",
      "hint": "Create an imbalance.",
      "fen": "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Imbalance creation",
      "about": "Aagaard strategic play — Imbalance creation.",
      "desc": "Strategic play includes manufacturing imbalances — pawn breaks, piece sacs for structure — when equality is too dead for your needs. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Create an imbalance. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 148,
      "book": "strategic",
      "title": "Narrative control",
      "teach": "Make them respond to your story.",
      "hint": "Force them to react.",
      "fen": "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Narrative control",
      "about": "Aagaard strategic play — Narrative control.",
      "desc": "The side that dictates the narrative of the game usually wins complex battles. Choose the move that makes them respond. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Force them to react. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 149,
      "book": "strategic",
      "title": "Decision confidence",
      "teach": "Once verified, commit — do not dither.",
      "hint": "Commit to the decision.",
      "fen": "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/2N2NP1/PP2PP1P/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Decision confidence",
      "about": "Aagaard strategic play — Decision confidence.",
      "desc": "Over-thinking after verification invites time trouble and worse moves. Decide, blunder-check, play. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Commit to the decision. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 150,
      "book": "strategic",
      "title": "Strategic Play review",
      "teach": "Fog → imbalances → robust plan → verify → commit.",
      "hint": "Play the prepared strategic move.",
      "fen": "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Strategic Play review",
      "about": "Aagaard strategic play — Strategic Play review.",
      "desc": "Close the Strategic Play loop on this board. Embrace uncertainty, choose robustly, verify, commit. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Play the prepared strategic move. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 151,
      "book": "strategic",
      "title": "Complex evaluation (2)",
      "teach": "When unclear, list imbalances and pick a direction.",
      "hint": "Choose a direction amid uncertainty.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Complex evaluation",
      "about": "Aagaard strategic play — Complex evaluation.",
      "desc": "Grandmaster Preparation: Strategic Play thrives in unclear positions where engines disagree with humans. Rank imbalances imperfectly, then commit to a plan that is robust under uncertainty — not a one-line tactic that needs perfection. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Choose a direction amid uncertainty. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 152,
      "book": "strategic",
      "title": "Robust plans (2)",
      "teach": "Prefer plans that survive a range of replies.",
      "hint": "Pick the robust plan.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Robust plans",
      "about": "Aagaard strategic play — Robust plans.",
      "desc": "A fragile plan collapses to one resource. A robust plan remains playable against several defences. Under uncertainty, robustness beats brilliancy. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Pick the robust plan. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 153,
      "book": "strategic",
      "title": "Critical decision (2)",
      "teach": "Flag the move that changes the game's character.",
      "hint": "Play the critical decision.",
      "fen": "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
      "goal": "win",
      "theme": "Critical decision",
      "about": "Aagaard strategic play — Critical decision.",
      "desc": "Some moves are critical: they transform structure, material, or king safety permanently. Aagaard trains you to recognise those moments and calculate deeper there, while playing faster elsewhere. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Play the critical decision. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 154,
      "book": "strategic",
      "title": "Strategic candidate moves (2)",
      "teach": "List strategic candidates — not only tactics.",
      "hint": "Compare strategic candidates.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "Strategic candidate moves",
      "about": "Aagaard strategic play — Strategic candidate moves.",
      "desc": "Candidates include improving moves, prophylactic moves, and breaks. In complex positions, the best move may look quiet. Force yourself to list positional candidates alongside shots. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Compare strategic candidates. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 155,
      "book": "strategic",
      "title": "Uncertainty tolerance (2)",
      "teach": "Play good practical moves when truth is unclear.",
      "hint": "Choose the practical unclear try.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Uncertainty tolerance",
      "about": "Aagaard strategic play — Uncertainty tolerance.",
      "desc": "You will not always find the truth. Strategic Play accepts that. Choose the move that keeps chances and limits risk when the evaluation is foggy. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Choose the practical unclear try. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 156,
      "book": "strategic",
      "title": "Transform or maintain (2)",
      "teach": "Decide whether to change the advantage's nature.",
      "hint": "Transform or maintain.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Transform or maintain",
      "about": "Aagaard strategic play — Transform or maintain.",
      "desc": "Should you keep a static bind or cash it for dynamics? That transformation decision is central to Aagaard's strategic training. Pick consciously. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Transform or maintain. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 157,
      "book": "strategic",
      "title": "Piece coordination puzzle (2)",
      "teach": "Untangle before you strike.",
      "hint": "Untangle the pieces.",
      "fen": "r1bqkb1r/pp1ppppp/2n2n2/2p5/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 4",
      "goal": "win",
      "theme": "Piece coordination puzzle",
      "about": "Aagaard strategic play — Piece coordination puzzle.",
      "desc": "Complex positions often feature tangled pieces. The strategic move may be a reorganisation that looks slow but enables everything else. Untangle first. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Untangle the pieces. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 158,
      "book": "strategic",
      "title": "Break vs restrain (2)",
      "teach": "In tension, choose break or restrain with a reason.",
      "hint": "Break or restrain — decide.",
      "fen": "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Break vs restrain",
      "about": "Aagaard strategic play — Break vs restrain.",
      "desc": "Central tension demands a decision: resolve with a break or restrain and improve. Under uncertainty, prefer the choice that matches your piece placement. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Break or restrain — decide. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 159,
      "book": "strategic",
      "title": "King as factor (2)",
      "teach": "King safety can outweigh structural beauty.",
      "hint": "Weight king safety highly.",
      "fen": "rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 6",
      "goal": "win",
      "theme": "King as factor",
      "about": "Aagaard strategic play — King as factor.",
      "desc": "In complex middlegames, king safety often decides. A structurally 'ugly' move that secures the king can be the strategic truth. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Weight king safety highly. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 160,
      "book": "strategic",
      "title": "Space decisions (2)",
      "teach": "Gain space only if you can use it.",
      "hint": "Gain or refuse space.",
      "fen": "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Space decisions",
      "about": "Aagaard strategic play — Space decisions.",
      "desc": "Space can be a gift or a target. Aagaard's positions ask whether expansion helps your pieces or creates holes. Expand with a follow-up or refrain. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Gain or refuse space. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 161,
      "book": "strategic",
      "title": "Exchange complex (2)",
      "teach": "Exchanges in complex positions need a story.",
      "hint": "Exchange with a story.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Exchange complex",
      "about": "Aagaard strategic play — Exchange complex.",
      "desc": "Trading in a mess without a story increases uncertainty. Exchange to clarify a favourable ending, remove their best piece, or open a colour complex — otherwise keep tension. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Exchange with a story. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 162,
      "book": "strategic",
      "title": "Initiative in fog (2)",
      "teach": "When unclear, seizing the initiative is often practical.",
      "hint": "Take the practical initiative.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "Initiative in fog",
      "about": "Aagaard strategic play — Initiative in fog.",
      "desc": "Initiative creates problems for them to solve under uncertainty. If evaluations are muddy, prefer the move that asks questions. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Take the practical initiative. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 163,
      "book": "strategic",
      "title": "Prophylaxis in complexity (2)",
      "teach": "Stop their clarifying idea, then play your own.",
      "hint": "Stop their clarifying idea.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Prophylaxis in complexity",
      "about": "Aagaard strategic play — Prophylaxis in complexity.",
      "desc": "In complex play, their resource may be a clarifying break. Prophylaxis that keeps the position difficult for them is strategic gold. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Stop their clarifying idea. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 164,
      "book": "strategic",
      "title": "Pawn commitment (2)",
      "teach": "Commit pawns when information is sufficient.",
      "hint": "Commit or stay flexible.",
      "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      "goal": "win",
      "theme": "Pawn commitment",
      "about": "Aagaard strategic play — Pawn commitment.",
      "desc": "Flexibility vs commitment is an Aagaard theme. Keep options when unsure; commit when your pieces are ready and their setup is known. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Commit or stay flexible. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 165,
      "book": "strategic",
      "title": "Dynamic equality (2)",
      "teach": "Equal may mean mutual chances — play for yours.",
      "hint": "Play for your dynamic chances.",
      "fen": "rnbqk2r/pp2ppbp/5np1/2pp4/3P4/2P2NP1/PP2PP1P/RNBQKB1R w KQkq - 0 6",
      "goal": "win",
      "theme": "Dynamic equality",
      "about": "Aagaard strategic play — Dynamic equality.",
      "desc": "Dynamic equality is not a draw offer. Identify your source of chances (attack, passer, colour complex) and play toward it. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Play for your dynamic chances. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 166,
      "book": "strategic",
      "title": "Strategic sacrifice (2)",
      "teach": "Sac for lasting soft squares or initiative when robust.",
      "hint": "Judge the strategic sac.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Strategic sacrifice",
      "about": "Aagaard strategic play — Strategic sacrifice.",
      "desc": "Strategic sacrifices under uncertainty require compensation you can feel across several branches — squares, attack, domination — not a single forced line. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Judge the strategic sac. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 167,
      "book": "strategic",
      "title": "Worst-piece in complexity (2)",
      "teach": "Even in messes, cure the worst piece.",
      "hint": "Improve the worst piece.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Worst-piece in complexity",
      "about": "Aagaard strategic play — Worst-piece in complexity.",
      "desc": "A universal strategic algorithm: improve the worst-placed piece. In complex positions this often clarifies the rest of the plan. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Improve the worst piece. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 168,
      "book": "strategic",
      "title": "Two-plan thinking (2)",
      "teach": "Keep a main plan and a backup under uncertainty.",
      "hint": "Keep a backup plan.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Two-plan thinking",
      "about": "Aagaard strategic play — Two-plan thinking.",
      "desc": "If plan A relies on a fragile tactic, have plan B. Aagaard's decision-making includes switching without ego when resources appear. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Keep a backup plan. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 169,
      "book": "strategic",
      "title": "Colour-complex fight (2)",
      "teach": "Fight for a colour complex in unclear structures.",
      "hint": "Play on your colour complex.",
      "fen": "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Colour-complex fight",
      "about": "Aagaard strategic play — Colour-complex fight.",
      "desc": "Complex games often hinge on one colour. Trade the right minor, occupy holes, and accept structural scars that buy the complex. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Play on your colour complex. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 170,
      "book": "strategic",
      "title": "Time as strategy (2)",
      "teach": "Use development leads before they vanish.",
      "hint": "Cash the time advantage.",
      "fen": "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
      "goal": "win",
      "theme": "Time as strategy",
      "about": "Aagaard strategic play — Time as strategy.",
      "desc": "A lead in time is a strategic resource with an expiry date. Open the position or create threats before they catch up. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Cash the time advantage. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 171,
      "book": "strategic",
      "title": "Structure scars (2)",
      "teach": "Accept a scar if it buys a lasting plus.",
      "hint": "Accept the useful scar.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Structure scars",
      "about": "Aagaard strategic play — Structure scars.",
      "desc": "Strategic play allows ugly pawns when activity or king attack compensates. Evaluate the scar honestly across branches. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Accept the useful scar. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 172,
      "book": "strategic",
      "title": "Middlegame ending steer (2)",
      "teach": "Steer toward endings that reduce uncertainty your way.",
      "hint": "Steer the game phase.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Middlegame ending steer",
      "about": "Aagaard strategic play — Middlegame ending steer.",
      "desc": "If the middlegame is too unclear, a favourable ending may be clearer. Steer trades when the ending favors your structure or activity. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Steer the game phase. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 173,
      "book": "strategic",
      "title": "Calculation budget (2)",
      "teach": "Spend depth on critical decisions; play faster elsewhere.",
      "hint": "Budget calculation wisely.",
      "fen": "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Calculation budget",
      "about": "Aagaard strategic play — Calculation budget.",
      "desc": "Strategic Play is not endless calculation. Budget deep thought for critical choices and trust strategic algorithms elsewhere. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Budget calculation wisely. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 174,
      "book": "strategic",
      "title": "Practical risk (2)",
      "teach": "Match risk to tournament needs and eval fog.",
      "hint": "Set the right risk level.",
      "fen": "r1bqk2r/pp1pppbp/2n2np1/2p5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5",
      "goal": "win",
      "theme": "Practical risk",
      "about": "Aagaard strategic play — Practical risk.",
      "desc": "Must-win vs must-draw changes strategic choices in unclear positions. Adjust risk consciously — that is preparation-level thinking. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Set the right risk level. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 175,
      "book": "strategic",
      "title": "Problem-posing moves (2)",
      "teach": "Prefer moves that force difficult replies.",
      "hint": "Pose a hard problem.",
      "fen": "r2q1rk1/ppp1ppbp/2np1np1/8/2PPP1b1/2N2N2/PP2BPPP/R1BQK2R w KQ - 4 8",
      "goal": "win",
      "theme": "Problem-posing moves",
      "about": "Aagaard strategic play — Problem-posing moves.",
      "desc": "Under uncertainty, the practical edge often goes to the player who poses problems. Choose the move that is hardest to meet. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Pose a hard problem. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 176,
      "book": "strategic",
      "title": "Prevent clarity for them (2)",
      "teach": "Do not allow them an easy clarifying sequence.",
      "hint": "Deny easy clarity.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Prevent clarity for them",
      "about": "Aagaard strategic play — Prevent clarity for them.",
      "desc": "If a sequence clarifies the position in their favour, prevent it. Keeping the game complex can be the right strategic decision when you are the better calculator — or the opposite when you are not. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Deny easy clarity. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 177,
      "book": "strategic",
      "title": "Harmonise then break (2)",
      "teach": "Coordinate, then break — especially when unclear.",
      "hint": "Harmonise, then break.",
      "fen": "r1bqk2r/pppp1ppp/2n1pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Harmonise then break",
      "about": "Aagaard strategic play — Harmonise then break.",
      "desc": "Breaking before harmony invites resources. In complex posts, spend moves on harmony, then break when pieces scream for it. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Harmonise, then break. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 178,
      "book": "strategic",
      "title": "Evaluate after change (2)",
      "teach": "Every structural change demands a fresh eval.",
      "hint": "Re-evaluate after the change.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Evaluate after change",
      "about": "Aagaard strategic play — Evaluate after change.",
      "desc": "A capture or pawn push rewrites the strategic story. Stop and re-rank imbalances. Old plans die with old structures. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Re-evaluate after the change. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 179,
      "book": "strategic",
      "title": "Strategic verification (2)",
      "teach": "Verify the plan against forcing resources.",
      "hint": "Verify against forcing moves.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/4R1K1 w - - 0 18",
      "goal": "win",
      "theme": "Strategic verification",
      "about": "Aagaard strategic play — Strategic verification.",
      "desc": "Strategy without verification is hope. After choosing a strategic move, check forcing replies. Aagaard's method unites both. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Verify against forcing moves. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 180,
      "book": "strategic",
      "title": "Strategic synthesis (2)",
      "teach": "Imbalances, robust plan, verify, play.",
      "hint": "Play the strategic decision.",
      "fen": "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Strategic synthesis",
      "about": "Aagaard strategic play — Strategic synthesis.",
      "desc": "Synthesise Strategic Play: evaluate through fog, choose a robust plan, verify tactics, commit. That is the move under uncertainty. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Play the strategic decision. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 181,
      "book": "strategic",
      "title": "Bind vs break (2)",
      "teach": "Maintain a bind only if it restricts real ideas.",
      "hint": "Keep or release the bind.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Bind vs break",
      "about": "Aagaard strategic play — Bind vs break.",
      "desc": "Binds that restrict nothing are vanity. Keep a bind when it stops their only breaks; release when you need open lines for your pieces. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Keep or release the bind. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 182,
      "book": "strategic",
      "title": "Opposite castling complexity (2)",
      "teach": "Race with central awareness in messy opposite castling.",
      "hint": "Race intelligently.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Opposite castling complexity",
      "about": "Aagaard strategic play — Opposite castling complexity.",
      "desc": "Opposite castling in complex books mixes storms with central counters. Push your storm while calculating their break. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Race intelligently. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 183,
      "book": "strategic",
      "title": "Exchange-sac strategy (2)",
      "teach": "Positional exchange sacs need lasting compensation.",
      "hint": "Judge the exchange sac.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Exchange-sac strategy",
      "about": "Aagaard strategic play — Exchange-sac strategy.",
      "desc": "Strategic exchange sacrifices buy squares and attacks across many branches. If compensation is narrow and fragile, decline. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Judge the exchange sac. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 184,
      "book": "strategic",
      "title": "Queen placement strategy (2)",
      "teach": "Park the queen on a safe multi-purpose square.",
      "hint": "Improve queen placement.",
      "fen": "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Queen placement strategy",
      "about": "Aagaard strategic play — Queen placement strategy.",
      "desc": "In complex middlegames, queen placement ties plans together. Find a square that eyes both wings without walking into tempi. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Improve queen placement. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 185,
      "book": "strategic",
      "title": "Rook file battles (2)",
      "teach": "Contest the open file before the mess clarifies.",
      "hint": "Fight for the file.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Rook file battles",
      "about": "Aagaard strategic play — Rook file battles.",
      "desc": "Open files decide complex games. Contest early; doubled rooks turn uncertainty into pressure. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Fight for the file. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 186,
      "book": "strategic",
      "title": "Minor-piece imbalance (2)",
      "teach": "Steering the remaining minor is a strategic decision.",
      "hint": "Steer the minor-piece balance.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Minor-piece imbalance",
      "about": "Aagaard strategic play — Minor-piece imbalance.",
      "desc": "Which minor remains often decides unclear games. Trade toward the piece that fits the evolving structure. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Steer the minor-piece balance. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 187,
      "book": "strategic",
      "title": "Prophylactic improvement (2)",
      "teach": "A move that improves and prevents is ideal.",
      "hint": "Improve and prevent.",
      "fen": "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Prophylactic improvement",
      "about": "Aagaard strategic play — Prophylactic improvement.",
      "desc": "Dual-purpose moves are gold under uncertainty: improve your worst piece while stopping their idea. Hunt that move. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Improve and prevent. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 188,
      "book": "strategic",
      "title": "Central control fog (2)",
      "teach": "Even when unclear, do not abandon the centre.",
      "hint": "Keep central presence.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Central control fog",
      "about": "Aagaard strategic play — Central control fog.",
      "desc": "Complex play still respects the centre. Maintain presence or pressure so wing adventures do not leave you punctured. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Keep central presence. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 189,
      "book": "strategic",
      "title": "Pawn storm timing (2)",
      "teach": "Storm when pieces are ready — not before.",
      "hint": "Time the storm.",
      "fen": "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Pawn storm timing",
      "about": "Aagaard strategic play — Pawn storm timing.",
      "desc": "Premature storms create counter-resources. Strategic timing waits for lifts and batteries, then advances. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Time the storm. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 190,
      "book": "strategic",
      "title": "Defence in complexity (2)",
      "teach": "Active defence beats passive suffering in unclear games.",
      "hint": "Defend actively.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 2 9",
      "goal": "win",
      "theme": "Defence in complexity",
      "about": "Aagaard strategic play — Defence in complexity.",
      "desc": "When under pressure in a mess, seek exchanges or counters that clarify favorably. Passive defence invites a strategic crush. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Defend actively. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 191,
      "book": "strategic",
      "title": "Conversion path (2)",
      "teach": "When better in a complex position, simplify wisely.",
      "hint": "Simplify while better.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Conversion path",
      "about": "Aagaard strategic play — Conversion path.",
      "desc": "Complexity helps the defender. If you are better, find a simplification path that preserves a usable edge. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Simplify while better. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 192,
      "book": "strategic",
      "title": "Complication path (2)",
      "teach": "When worse, keep the position rich.",
      "hint": "Keep richness when worse.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Complication path",
      "about": "Aagaard strategic play — Complication path.",
      "desc": "Trailing under uncertainty, avoid dry clear losses. Keep pieces and tension so resources remain. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Keep richness when worse. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 193,
      "book": "strategic",
      "title": "Plan communication (2)",
      "teach": "Your move should announce a coherent plan.",
      "hint": "Play a plan-consistent move.",
      "fen": "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Plan communication",
      "about": "Aagaard strategic play — Plan communication.",
      "desc": "Random strong-looking moves without a plan increase chaos for you too. Make a move that belongs to a named plan. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Play a plan-consistent move. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 194,
      "book": "strategic",
      "title": "Engine-free judgment (2)",
      "teach": "Train judgment without leaning on engine lines.",
      "hint": "Trust trained judgment.",
      "fen": "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Engine-free judgment",
      "about": "Aagaard strategic play — Engine-free judgment.",
      "desc": "Aagaard's books build human judgment. Practice choosing without needing a forced line to the end — then verify critical tactics. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Trust trained judgment. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 195,
      "book": "strategic",
      "title": "Critical square fight (2)",
      "teach": "Identify one critical square and fight for it.",
      "hint": "Fight for the critical square.",
      "fen": "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14",
      "goal": "win",
      "theme": "Critical square fight",
      "about": "Aagaard strategic play — Critical square fight.",
      "desc": "Complex positions often hinge on one square (e5, d5, f5, c4). Name it and play the move that contests it. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Fight for the critical square. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 196,
      "book": "strategic",
      "title": "Slow vs fast plans (2)",
      "teach": "Match plan speed to the opponent's threats.",
      "hint": "Pick the right plan speed.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Slow vs fast plans",
      "about": "Aagaard strategic play — Slow vs fast plans.",
      "desc": "If they have fast threats, your slow strategic grind fails. Match tempo: fast plans vs fast threats; slow plans when the position is closed and safe. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Pick the right plan speed. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 197,
      "book": "strategic",
      "title": "Imbalance creation (2)",
      "teach": "If the position is sterile, create an imbalance.",
      "hint": "Create an imbalance.",
      "fen": "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Imbalance creation",
      "about": "Aagaard strategic play — Imbalance creation.",
      "desc": "Strategic play includes manufacturing imbalances — pawn breaks, piece sacs for structure — when equality is too dead for your needs. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Create an imbalance. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 198,
      "book": "strategic",
      "title": "Narrative control (2)",
      "teach": "Make them respond to your story.",
      "hint": "Force them to react.",
      "fen": "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Narrative control",
      "about": "Aagaard strategic play — Narrative control.",
      "desc": "The side that dictates the narrative of the game usually wins complex battles. Choose the move that makes them respond. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Force them to react. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 199,
      "book": "strategic",
      "title": "Decision confidence (2)",
      "teach": "Once verified, commit — do not dither.",
      "hint": "Commit to the decision.",
      "fen": "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/2N2NP1/PP2PP1P/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Decision confidence",
      "about": "Aagaard strategic play — Decision confidence.",
      "desc": "Over-thinking after verification invites time trouble and worse moves. Decide, blunder-check, play. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Commit to the decision. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 200,
      "book": "strategic",
      "title": "Strategic Play review (2)",
      "teach": "Fog → imbalances → robust plan → verify → commit.",
      "hint": "Play the prepared strategic move.",
      "fen": "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Strategic Play review",
      "about": "Aagaard strategic play — Strategic Play review.",
      "desc": "Close the Strategic Play loop on this board. Embrace uncertainty, choose robustly, verify, commit. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Play the prepared strategic move. (Grandmaster Preparation: Strategic Play–style · decisions under uncertainty)",
      "pitfalls": []
    },
    {
      "n": 201,
      "book": "analytical",
      "title": "Deep tree discipline",
      "teach": "Finish variations before hopping to another idea.",
      "hint": "Finish the variation.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Deep tree discipline",
      "about": "Dvoretsky analytical — Deep tree discipline.",
      "desc": "The Analytical Manual is famous for brutal depth. Train the discipline: finish a long variation to a quiet leaf before opening another trunk. Branch-jumping is how hard positions stay unsolved. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Finish the variation. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 202,
      "book": "analytical",
      "title": "Multi-variation comparison",
      "teach": "Compare completed long lines, not vibes.",
      "hint": "Compare finished long lines.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Multi-variation comparison",
      "about": "Dvoretsky analytical — Multi-variation comparison.",
      "desc": "Hard positions require several deep lines. Mark each with a clear eval after completion, then compare. The Manual's spirit is exhaustive comparison. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Compare finished long lines. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 203,
      "book": "analytical",
      "title": "Critical position depth",
      "teach": "Go deeper than comfort at the critical fork.",
      "hint": "Calculate deeper than comfort.",
      "fen": "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
      "goal": "win",
      "theme": "Critical position depth",
      "about": "Dvoretsky analytical — Critical position depth.",
      "desc": "When the position is known-hard, your depth must exceed casual calculation. Push one or two plies past where you want to stop, especially at the critical fork. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Calculate deeper than comfort. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 204,
      "book": "analytical",
      "title": "Candidate exhaustiveness",
      "teach": "Widen candidates before deepening favorites.",
      "hint": "Widen, then deepen.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "Candidate exhaustiveness",
      "about": "Dvoretsky analytical — Candidate exhaustiveness.",
      "desc": "Brutal analysis starts wide: include quiet moves and prophylaxes, not only sacrifices. Then deepen the survivors. Width prevents missing the Manual-level solution. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Widen, then deepen. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 205,
      "book": "analytical",
      "title": "Refutation hunt",
      "teach": "Try to bust your own main line before trusting it.",
      "hint": "Bust your own line.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Refutation hunt",
      "about": "Dvoretsky analytical — Refutation hunt.",
      "desc": "Analytical Manual training includes self-refutation. After finding a brilliant line, spend time as the defender. If it holds against best defence, it may be truth. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Bust your own line. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 206,
      "book": "analytical",
      "title": "Long forcing chains",
      "teach": "Map long forcing chains with material bookkeeping.",
      "hint": "Map the forcing chain.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Long forcing chains",
      "about": "Dvoretsky analytical — Long forcing chains.",
      "desc": "Long capture/check chains demand bookkeeping. After each capture, update material and king safety. Lost counts create false 'wins' in deep trees. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Map the forcing chain. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 207,
      "book": "analytical",
      "title": "Quiet move depth",
      "teach": "Deep analysis often ends with a quiet killer.",
      "hint": "Find the quiet move at depth.",
      "fen": "r1bqkb1r/pp1ppppp/2n2n2/2p5/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 4",
      "goal": "win",
      "theme": "Quiet move depth",
      "about": "Dvoretsky analytical — Quiet move depth.",
      "desc": "Many Manual solutions are quiet moves after long forcing play. Do not stop at the checks; look for the consolidating or prophylactic leaf. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Find the quiet move at depth. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 208,
      "book": "analytical",
      "title": "Alternative move orders",
      "teach": "Deeply compare move orders in the main idea.",
      "hint": "Compare deep move orders.",
      "fen": "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Alternative move orders",
      "about": "Dvoretsky analytical — Alternative move orders.",
      "desc": "The same idea with two move orders can differ by a single resource. Analytical work compares those orders across full branches. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Compare deep move orders. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 209,
      "book": "analytical",
      "title": "Defensive analytical work",
      "teach": "Analyse saving lines as deeply as attacking ones.",
      "hint": "Deep-dive the saving line.",
      "fen": "rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 6",
      "goal": "win",
      "theme": "Defensive analytical work",
      "about": "Dvoretsky analytical — Defensive analytical work.",
      "desc": "Brutal positions require deep defence too. Find the saving path with the same seriousness as the win. Half-points come from analytical defence. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Deep-dive the saving line. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 210,
      "book": "analytical",
      "title": "Evaluation at depth",
      "teach": "Leaf evals must be concrete after long lines.",
      "hint": "Make the deep leaf concrete.",
      "fen": "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Evaluation at depth",
      "about": "Dvoretsky analytical — Evaluation at depth.",
      "desc": "After twelve plies of fog, force a concrete leaf label: winning, better, equal, worse, drawn by fortress/perpetual. Vague leaves waste the deep work. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Make the deep leaf concrete. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 211,
      "book": "analytical",
      "title": "Transposition tracking",
      "teach": "Reuse known leaves when lines transpose.",
      "hint": "Reuse transposed leaves.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Transposition tracking",
      "about": "Dvoretsky analytical — Transposition tracking.",
      "desc": "Deep trees transpose. When you reach a known position, graft the earlier conclusion instead of recalculating from zero. Efficiency enables more breadth. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Reuse transposed leaves. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 212,
      "book": "analytical",
      "title": "Sacrifice analysis",
      "teach": "Analyse sacs until compensation is proven or refuted.",
      "hint": "Prove or refute the sac.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "Sacrifice analysis",
      "about": "Dvoretsky analytical — Sacrifice analysis.",
      "desc": "The Manual does not romanticise sacs. Either compensation is demonstrated across branches, or the sac is marked busted. Prove it. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Prove or refute the sac. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 213,
      "book": "analytical",
      "title": "Prophylaxis at depth",
      "teach": "Deep lines often need a prophylactic inclusion.",
      "hint": "Find the deep inclusion.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Prophylaxis at depth",
      "about": "Dvoretsky analytical — Prophylaxis at depth.",
      "desc": "A recurring analytical pattern: the combination works only after a deep prophylactic inclusion. Search for that inclusion when the direct path fails. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Find the deep inclusion. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 214,
      "book": "analytical",
      "title": "Engine-free hardness",
      "teach": "Struggle honestly before checking — build analytical muscle.",
      "hint": "Struggle through the hard line.",
      "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      "goal": "win",
      "theme": "Engine-free hardness",
      "about": "Dvoretsky analytical — Engine-free hardness.",
      "desc": "These positions are meant to hurt a little. Stay with the analysis, write candidates, and finish lines. The training effect is the struggle. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Struggle through the hard line. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 215,
      "book": "analytical",
      "title": "Key defensive resource",
      "teach": "In deep attack trees, find their key resource first.",
      "hint": "Find the key defensive resource.",
      "fen": "rnbqk2r/pp2ppbp/5np1/2pp4/3P4/2P2NP1/PP2PP1P/RNBQKB1R w KQkq - 0 6",
      "goal": "win",
      "theme": "Key defensive resource",
      "about": "Dvoretsky analytical — Key defensive resource.",
      "desc": "Before investing twenty minutes in an attack, find the defensive resource that might kill it. If you cannot bust it, the attack may be real. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Find the key defensive resource. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 216,
      "book": "analytical",
      "title": "Endgame leaf precision",
      "teach": "If deep lines enter endings, analyse the ending properly.",
      "hint": "Analyse the ending leaf.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Endgame leaf precision",
      "about": "Dvoretsky analytical — Endgame leaf precision.",
      "desc": "A deep combination that 'wins a pawn' into a drawn rook ending is not a win. Switch to endgame criteria at the leaf. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Analyse the ending leaf. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 217,
      "book": "analytical",
      "title": "Multiple critical moments",
      "teach": "Hard games have several critical forks — flag them.",
      "hint": "Flag each critical fork.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Multiple critical moments",
      "about": "Dvoretsky analytical — Multiple critical moments.",
      "desc": "Analytical Manual positions often contain more than one critical decision. Flag each, analyse each, and do not spend all depth on the first shiny fork. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Flag each critical fork. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 218,
      "book": "analytical",
      "title": "Consistency of plan",
      "teach": "Deep tactics should serve a strategic skeleton.",
      "hint": "Keep tactics on a plan skeleton.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Consistency of plan",
      "about": "Dvoretsky analytical — Consistency of plan.",
      "desc": "Even brutal calculation sits on a plan: attack a king, create a passer, dominate a complex. Keep the skeleton visible so lines stay purposeful. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Keep tactics on a plan skeleton. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 219,
      "book": "analytical",
      "title": "Time investment",
      "teach": "Hard positions deserve clock — budget it.",
      "hint": "Invest clock here.",
      "fen": "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Time investment",
      "about": "Dvoretsky analytical — Time investment.",
      "desc": "Knowing a position is Analytical-Manual-hard means investing time. Play faster in easy phases to afford depth here. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Invest clock here. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 220,
      "book": "analytical",
      "title": "Annotation standard",
      "teach": "Aim for analysis you could publish as notes.",
      "hint": "Analyse to annotation standard.",
      "fen": "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
      "goal": "win",
      "theme": "Annotation standard",
      "about": "Dvoretsky analytical — Annotation standard.",
      "desc": "Train as if writing notes: candidates listed, main line clear, resources mentioned, evals stated. That standard raises calculation quality. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Analyse to annotation standard. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 221,
      "book": "analytical",
      "title": "Blind-spot hunt",
      "teach": "Ask what you refuse to calculate — then calculate it.",
      "hint": "Calculate the avoided line.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Blind-spot hunt",
      "about": "Dvoretsky analytical — Blind-spot hunt.",
      "desc": "Psychological blind spots skip unpleasant lines. Force yourself into the line you dislike. Manual-level truth hides there often. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Calculate the avoided line. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 222,
      "book": "analytical",
      "title": "Perpetual deep check",
      "teach": "Deep wins die to late perpetuals — check the end.",
      "hint": "Check late perpetual ideas.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Perpetual deep check",
      "about": "Dvoretsky analytical — Perpetual deep check.",
      "desc": "After a long winning tree, spend a pass on late perpetual resources. Conversions fail at the last step without that pass. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Check late perpetual ideas. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 223,
      "book": "analytical",
      "title": "Fortress at depth",
      "teach": "Deep material gains may still be fortresses.",
      "hint": "Test for fortress at the leaf.",
      "fen": "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Fortress at depth",
      "about": "Dvoretsky analytical — Fortress at depth.",
      "desc": "Ask at deep leaves: can they fortress? If yes, the line is not winning. Analytical honesty includes fortress testing. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Test for fortress at the leaf. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 224,
      "book": "analytical",
      "title": "Stepwise deepening",
      "teach": "Deepen iteratively: shallow pass, then deeper pass.",
      "hint": "Do a second deeper pass.",
      "fen": "r1bqk2r/pp1pppbp/2n2np1/2p5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5",
      "goal": "win",
      "theme": "Stepwise deepening",
      "about": "Dvoretsky analytical — Stepwise deepening.",
      "desc": "First pass: candidates and rough evals. Second pass: deepen the critical trunks. Iterative deepening is how hard analysis becomes manageable. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Do a second deeper pass. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 225,
      "book": "analytical",
      "title": "Error logging",
      "teach": "When a line fails, log why — then adjust candidates.",
      "hint": "Log the failure reason.",
      "fen": "r2q1rk1/ppp1ppbp/2np1np1/8/2PPP1b1/2N2N2/PP2BPPP/R1BQK2R w KQ - 4 8",
      "goal": "win",
      "theme": "Error logging",
      "about": "Dvoretsky analytical — Error logging.",
      "desc": "Analytical improvement requires naming why a line failed (resource, move order, miscount). Log it, then adjust. Do not restart blindly. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Log the failure reason. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 226,
      "book": "analytical",
      "title": "Quiet start deep end",
      "teach": "Some solutions start quiet and explode later.",
      "hint": "Consider a quiet start.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Quiet start deep end",
      "about": "Dvoretsky analytical — Quiet start deep end.",
      "desc": "Do not discard quiet first moves because the position 'looks tactical'. Manual solutions sometimes begin with prophylaxis and end in fireworks. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Consider a quiet start. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 227,
      "book": "analytical",
      "title": "Material vs attack deep",
      "teach": "Deeply compare grabbing material vs continuing the attack.",
      "hint": "Compare material vs attack deeply.",
      "fen": "r1bqk2r/pppp1ppp/2n1pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Material vs attack deep",
      "about": "Dvoretsky analytical — Material vs attack deep.",
      "desc": "A hard choice: take the material leaf or continue attacking. Analyse both deeply. The Manual thrives on that comparison. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Compare material vs attack deeply. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 228,
      "book": "analytical",
      "title": "King hunt analysis",
      "teach": "Mating nets need complete flight coverage in the tree.",
      "hint": "Cover all flights in the tree.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "King hunt analysis",
      "about": "Dvoretsky analytical — King hunt analysis.",
      "desc": "Deep king hunts fail when one flight is left. Systematically cover flights in the analysis before claiming mate. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Cover all flights in the tree. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 229,
      "book": "analytical",
      "title": "Analytical stamina",
      "teach": "Stay with the position past frustration.",
      "hint": "Stay with the hard analysis.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/4R1K1 w - - 0 18",
      "goal": "win",
      "theme": "Analytical stamina",
      "about": "Dvoretsky analytical — Analytical stamina.",
      "desc": "Brutal positions reward stamina. Take a short reset if visualisation fails, then continue. Walking away early trains quitting, not analysis. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Stay with the hard analysis. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 230,
      "book": "analytical",
      "title": "Analytical synthesis",
      "teach": "Wide candidates, deep finished lines, honest leaves.",
      "hint": "Play the deeply verified move.",
      "fen": "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Analytical synthesis",
      "about": "Dvoretsky analytical — Analytical synthesis.",
      "desc": "Synthesise the Analytical Manual ethos: exhaustive candidates, deep finished variations, honest evaluations, then the move that survives best defence. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Play the deeply verified move. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 231,
      "book": "analytical",
      "title": "Variation notebook",
      "teach": "Mentally number main lines A/B/C with evals.",
      "hint": "Label lines A/B/C.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Variation notebook",
      "about": "Dvoretsky analytical — Variation notebook.",
      "desc": "Organise deep work like a notebook: Line A (eval), Line B (eval). Organisation prevents re-calculating the same fog. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Label lines A/B/C. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 232,
      "book": "analytical",
      "title": "Forced vs unforced",
      "teach": "Separate forced sequences from choice nodes.",
      "hint": "Mark choice nodes clearly.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Forced vs unforced",
      "about": "Dvoretsky analytical — Forced vs unforced.",
      "desc": "In a long tree, mark where someone has a real choice. Forced stretches can be compressed; choice nodes need width. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Mark choice nodes clearly. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 233,
      "book": "analytical",
      "title": "Tactical motifs at depth",
      "teach": "Motifs still apply — search them in deep leaves.",
      "hint": "Search motifs deep.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Tactical motifs at depth",
      "about": "Dvoretsky analytical — Tactical motifs at depth.",
      "desc": "Pins, deflections, and clearances appear late in deep lines. Keep motif eyes open at the leaf, not only at move one. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Search motifs deep. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 234,
      "book": "analytical",
      "title": "Practical cutoff",
      "teach": "When a line is clearly insufficient, cut it.",
      "hint": "Cut clearly insufficient lines.",
      "fen": "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Practical cutoff",
      "about": "Dvoretsky analytical — Practical cutoff.",
      "desc": "Brutal analysis is not infinite. Cut lines that are clearly worse after honest depth so remaining trunks get more time. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Cut clearly insufficient lines. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 235,
      "book": "analytical",
      "title": "Second-best tracking",
      "teach": "Know the second-best move's eval too.",
      "hint": "Track second-best.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Second-best tracking",
      "about": "Dvoretsky analytical — Second-best tracking.",
      "desc": "Analytical strength includes knowing how much better your move is than the alternative. Track second-best for confidence and practical choice. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Track second-best. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 236,
      "book": "analytical",
      "title": "Defence-first pass",
      "teach": "Start a hard position with a defensive resource pass.",
      "hint": "Start with their resources.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Defence-first pass",
      "about": "Dvoretsky analytical — Defence-first pass.",
      "desc": "Especially after studying Resources: begin hard analysis by listing their resources, then build your lines against them. Defence-first prevents fantasy attacks. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Start with their resources. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 237,
      "book": "analytical",
      "title": "Attack-first pass",
      "teach": "Then build the strongest attacking attempts.",
      "hint": "Build the strongest attack attempts.",
      "fen": "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Attack-first pass",
      "about": "Dvoretsky analytical — Attack-first pass.",
      "desc": "After resources, attempt the most dangerous attacking trees. Alternating defence-first and attack-first passes mirrors Manual method. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Build the strongest attack attempts. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 238,
      "book": "analytical",
      "title": "Clarity leaf preference",
      "teach": "Prefer deep lines that end in clear outcomes.",
      "hint": "Prefer clear deep leaves.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Clarity leaf preference",
      "about": "Dvoretsky analytical — Clarity leaf preference.",
      "desc": "Among similar deep options, prefer the line ending in a clear win/draw over perpetual fog. Clarity is analytical hygiene. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Prefer clear deep leaves. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 239,
      "book": "analytical",
      "title": "Miscount prevention",
      "teach": "Re-count material at every deep leaf.",
      "hint": "Re-count at the leaf.",
      "fen": "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Miscount prevention",
      "about": "Dvoretsky analytical — Miscount prevention.",
      "desc": "Miscounts create Manual-level blunders in analysis. Re-count material and checks at each leaf before writing the eval. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Re-count at the leaf. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 240,
      "book": "analytical",
      "title": "Visualisation reset",
      "teach": "Reset the board image when pieces get ghostly.",
      "hint": "Reset visualisation.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 2 9",
      "goal": "win",
      "theme": "Visualisation reset",
      "about": "Dvoretsky analytical — Visualisation reset.",
      "desc": "Deep calculation fails when pieces ghost. Reset to the root position, rebuild slowly, continue. Resetting is strength. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Reset visualisation. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 241,
      "book": "analytical",
      "title": "Critical check filter",
      "teach": "In deep trees, filter which checks deserve depth.",
      "hint": "Filter checks by importance.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Critical check filter",
      "about": "Dvoretsky analytical — Critical check filter.",
      "desc": "Not every check in a long line needs a novel. Filter by whether it changes material, king safety, or forces a unique reply. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Filter checks by importance. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 242,
      "book": "analytical",
      "title": "Positional deep move",
      "teach": "Hard strategy still needs deep verification.",
      "hint": "Deep-verify the positional move.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Positional deep move",
      "about": "Dvoretsky analytical — Positional deep move.",
      "desc": "A quiet strategic move in a brutal position must survive deep resources. Verify it like a combination. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Deep-verify the positional move. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 243,
      "book": "analytical",
      "title": "Endgame transition deep",
      "teach": "Deeply assess transitions into endings mid-tree.",
      "hint": "Deep-check ending transitions.",
      "fen": "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Endgame transition deep",
      "about": "Dvoretsky analytical — Endgame transition deep.",
      "desc": "When a deep line offers a trade into an ending, analyse that ending with full seriousness before choosing the trade. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Deep-check ending transitions. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 244,
      "book": "analytical",
      "title": "Sacrifice chain",
      "teach": "Some lines sac twice — calculate both sacs fully.",
      "hint": "Calculate the full sac chain.",
      "fen": "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Sacrifice chain",
      "about": "Dvoretsky analytical — Sacrifice chain.",
      "desc": "Double sacrifices appear in Manual work. Do not stop after the first sac's fog; continue until the second sac's leaf is clear. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Calculate the full sac chain. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 245,
      "book": "analytical",
      "title": "Only-move sequences",
      "teach": "Chains of only-moves need perfect accuracy.",
      "hint": "Verify each only-move.",
      "fen": "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14",
      "goal": "win",
      "theme": "Only-move sequences",
      "about": "Dvoretsky analytical — Only-move sequences.",
      "desc": "If your deep win requires five only-moves, verify each. One inaccuracy collapses the chain. Precision over romance. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Verify each only-move. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 246,
      "book": "analytical",
      "title": "Opponent psychology note",
      "teach": "Hard lines also pose practical problems — note them.",
      "hint": "Note practical problem lines.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Opponent psychology note",
      "about": "Dvoretsky analytical — Opponent psychology note.",
      "desc": "Among analytically equal deep options, prefer the one harder to meet over the board. Practical notes belong in serious analysis. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Note practical problem lines. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 247,
      "book": "analytical",
      "title": "Publishable main line",
      "teach": "Produce one clean main line as the answer.",
      "hint": "State a clean main line.",
      "fen": "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Publishable main line",
      "about": "Dvoretsky analytical — Publishable main line.",
      "desc": "After the mess of branches, extract a clean main line you could show a student. Clarity of presentation clarifies thought. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: State a clean main line. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 248,
      "book": "analytical",
      "title": "Unsolved honesty",
      "teach": "If unsolved, play the most robust practical move.",
      "hint": "If unsolved, play robustly.",
      "fen": "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Unsolved honesty",
      "about": "Dvoretsky analytical — Unsolved honesty.",
      "desc": "Not every Manual position is solved in session. If time expires, play the most robust practical move among deep survivors — and flag the position for later. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: If unsolved, play robustly. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 249,
      "book": "analytical",
      "title": "Training repetition",
      "teach": "Return to the same hard position later cold.",
      "hint": "Treat it as repeatable training.",
      "fen": "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/2N2NP1/PP2PP1P/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Training repetition",
      "about": "Dvoretsky analytical — Training repetition.",
      "desc": "Analytical strength grows by revisiting brutal positions cold. Today's struggle is tomorrow's pattern. Play the best move you can now. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Treat it as repeatable training. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 250,
      "book": "analytical",
      "title": "Manual synthesis",
      "teach": "Width, depth, honesty, stamina — then move.",
      "hint": "Play the Manual-verified move.",
      "fen": "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Manual synthesis",
      "about": "Dvoretsky analytical — Manual synthesis.",
      "desc": "Final Analytical Manual drill: exhaustive width, finished deep lines, honest leaves, stamina under difficulty. Then play the verified move. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Play the Manual-verified move. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 251,
      "book": "analytical",
      "title": "Deep tree discipline (2)",
      "teach": "Finish variations before hopping to another idea.",
      "hint": "Finish the variation.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
      "goal": "win",
      "theme": "Deep tree discipline",
      "about": "Dvoretsky analytical — Deep tree discipline.",
      "desc": "The Analytical Manual is famous for brutal depth. Train the discipline: finish a long variation to a quiet leaf before opening another trunk. Branch-jumping is how hard positions stay unsolved. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Finish the variation. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 252,
      "book": "analytical",
      "title": "Multi-variation comparison (2)",
      "teach": "Compare completed long lines, not vibes.",
      "hint": "Compare finished long lines.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Multi-variation comparison",
      "about": "Dvoretsky analytical — Multi-variation comparison.",
      "desc": "Hard positions require several deep lines. Mark each with a clear eval after completion, then compare. The Manual's spirit is exhaustive comparison. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Compare finished long lines. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 253,
      "book": "analytical",
      "title": "Critical position depth (2)",
      "teach": "Go deeper than comfort at the critical fork.",
      "hint": "Calculate deeper than comfort.",
      "fen": "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
      "goal": "win",
      "theme": "Critical position depth",
      "about": "Dvoretsky analytical — Critical position depth.",
      "desc": "When the position is known-hard, your depth must exceed casual calculation. Push one or two plies past where you want to stop, especially at the critical fork. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Calculate deeper than comfort. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 254,
      "book": "analytical",
      "title": "Candidate exhaustiveness (2)",
      "teach": "Widen candidates before deepening favorites.",
      "hint": "Widen, then deepen.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
      "goal": "win",
      "theme": "Candidate exhaustiveness",
      "about": "Dvoretsky analytical — Candidate exhaustiveness.",
      "desc": "Brutal analysis starts wide: include quiet moves and prophylaxes, not only sacrifices. Then deepen the survivors. Width prevents missing the Manual-level solution. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Widen, then deepen. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 255,
      "book": "analytical",
      "title": "Refutation hunt (2)",
      "teach": "Try to bust your own main line before trusting it.",
      "hint": "Bust your own line.",
      "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Refutation hunt",
      "about": "Dvoretsky analytical — Refutation hunt.",
      "desc": "Analytical Manual training includes self-refutation. After finding a brilliant line, spend time as the defender. If it holds against best defence, it may be truth. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Bust your own line. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 256,
      "book": "analytical",
      "title": "Long forcing chains (2)",
      "teach": "Map long forcing chains with material bookkeeping.",
      "hint": "Map the forcing chain.",
      "fen": "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
      "goal": "win",
      "theme": "Long forcing chains",
      "about": "Dvoretsky analytical — Long forcing chains.",
      "desc": "Long capture/check chains demand bookkeeping. After each capture, update material and king safety. Lost counts create false 'wins' in deep trees. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Map the forcing chain. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 257,
      "book": "analytical",
      "title": "Quiet move depth (2)",
      "teach": "Deep analysis often ends with a quiet killer.",
      "hint": "Find the quiet move at depth.",
      "fen": "r1bqkb1r/pp1ppppp/2n2n2/2p5/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 4",
      "goal": "win",
      "theme": "Quiet move depth",
      "about": "Dvoretsky analytical — Quiet move depth.",
      "desc": "Many Manual solutions are quiet moves after long forcing play. Do not stop at the checks; look for the consolidating or prophylactic leaf. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Find the quiet move at depth. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 258,
      "book": "analytical",
      "title": "Alternative move orders (2)",
      "teach": "Deeply compare move orders in the main idea.",
      "hint": "Compare deep move orders.",
      "fen": "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Alternative move orders",
      "about": "Dvoretsky analytical — Alternative move orders.",
      "desc": "The same idea with two move orders can differ by a single resource. Analytical work compares those orders across full branches. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Compare deep move orders. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 259,
      "book": "analytical",
      "title": "Defensive analytical work (2)",
      "teach": "Analyse saving lines as deeply as attacking ones.",
      "hint": "Deep-dive the saving line.",
      "fen": "rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 6",
      "goal": "win",
      "theme": "Defensive analytical work",
      "about": "Dvoretsky analytical — Defensive analytical work.",
      "desc": "Brutal positions require deep defence too. Find the saving path with the same seriousness as the win. Half-points come from analytical defence. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Deep-dive the saving line. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 260,
      "book": "analytical",
      "title": "Evaluation at depth (2)",
      "teach": "Leaf evals must be concrete after long lines.",
      "hint": "Make the deep leaf concrete.",
      "fen": "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Evaluation at depth",
      "about": "Dvoretsky analytical — Evaluation at depth.",
      "desc": "After twelve plies of fog, force a concrete leaf label: winning, better, equal, worse, drawn by fortress/perpetual. Vague leaves waste the deep work. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Make the deep leaf concrete. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 261,
      "book": "analytical",
      "title": "Transposition tracking (2)",
      "teach": "Reuse known leaves when lines transpose.",
      "hint": "Reuse transposed leaves.",
      "fen": "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Transposition tracking",
      "about": "Dvoretsky analytical — Transposition tracking.",
      "desc": "Deep trees transpose. When you reach a known position, graft the earlier conclusion instead of recalculating from zero. Efficiency enables more breadth. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Reuse transposed leaves. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 262,
      "book": "analytical",
      "title": "Sacrifice analysis (2)",
      "teach": "Analyse sacs until compensation is proven or refuted.",
      "hint": "Prove or refute the sac.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
      "goal": "win",
      "theme": "Sacrifice analysis",
      "about": "Dvoretsky analytical — Sacrifice analysis.",
      "desc": "The Manual does not romanticise sacs. Either compensation is demonstrated across branches, or the sac is marked busted. Prove it. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Prove or refute the sac. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 263,
      "book": "analytical",
      "title": "Prophylaxis at depth (2)",
      "teach": "Deep lines often need a prophylactic inclusion.",
      "hint": "Find the deep inclusion.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Prophylaxis at depth",
      "about": "Dvoretsky analytical — Prophylaxis at depth.",
      "desc": "A recurring analytical pattern: the combination works only after a deep prophylactic inclusion. Search for that inclusion when the direct path fails. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Find the deep inclusion. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 264,
      "book": "analytical",
      "title": "Engine-free hardness (2)",
      "teach": "Struggle honestly before checking — build analytical muscle.",
      "hint": "Struggle through the hard line.",
      "fen": "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
      "goal": "win",
      "theme": "Engine-free hardness",
      "about": "Dvoretsky analytical — Engine-free hardness.",
      "desc": "These positions are meant to hurt a little. Stay with the analysis, write candidates, and finish lines. The training effect is the struggle. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Struggle through the hard line. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 265,
      "book": "analytical",
      "title": "Key defensive resource (2)",
      "teach": "In deep attack trees, find their key resource first.",
      "hint": "Find the key defensive resource.",
      "fen": "rnbqk2r/pp2ppbp/5np1/2pp4/3P4/2P2NP1/PP2PP1P/RNBQKB1R w KQkq - 0 6",
      "goal": "win",
      "theme": "Key defensive resource",
      "about": "Dvoretsky analytical — Key defensive resource.",
      "desc": "Before investing twenty minutes in an attack, find the defensive resource that might kill it. If you cannot bust it, the attack may be real. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Find the key defensive resource. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 266,
      "book": "analytical",
      "title": "Endgame leaf precision (2)",
      "teach": "If deep lines enter endings, analyse the ending properly.",
      "hint": "Analyse the ending leaf.",
      "fen": "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
      "goal": "win",
      "theme": "Endgame leaf precision",
      "about": "Dvoretsky analytical — Endgame leaf precision.",
      "desc": "A deep combination that 'wins a pawn' into a drawn rook ending is not a win. Switch to endgame criteria at the leaf. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Analyse the ending leaf. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 267,
      "book": "analytical",
      "title": "Multiple critical moments (2)",
      "teach": "Hard games have several critical forks — flag them.",
      "hint": "Flag each critical fork.",
      "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Multiple critical moments",
      "about": "Dvoretsky analytical — Multiple critical moments.",
      "desc": "Analytical Manual positions often contain more than one critical decision. Flag each, analyse each, and do not spend all depth on the first shiny fork. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Flag each critical fork. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 268,
      "book": "analytical",
      "title": "Consistency of plan (2)",
      "teach": "Deep tactics should serve a strategic skeleton.",
      "hint": "Keep tactics on a plan skeleton.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
      "goal": "win",
      "theme": "Consistency of plan",
      "about": "Dvoretsky analytical — Consistency of plan.",
      "desc": "Even brutal calculation sits on a plan: attack a king, create a passer, dominate a complex. Keep the skeleton visible so lines stay purposeful. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Keep tactics on a plan skeleton. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 269,
      "book": "analytical",
      "title": "Time investment (2)",
      "teach": "Hard positions deserve clock — budget it.",
      "hint": "Invest clock here.",
      "fen": "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Time investment",
      "about": "Dvoretsky analytical — Time investment.",
      "desc": "Knowing a position is Analytical-Manual-hard means investing time. Play faster in easy phases to afford depth here. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Invest clock here. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 270,
      "book": "analytical",
      "title": "Annotation standard (2)",
      "teach": "Aim for analysis you could publish as notes.",
      "hint": "Analyse to annotation standard.",
      "fen": "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
      "goal": "win",
      "theme": "Annotation standard",
      "about": "Dvoretsky analytical — Annotation standard.",
      "desc": "Train as if writing notes: candidates listed, main line clear, resources mentioned, evals stated. That standard raises calculation quality. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Analyse to annotation standard. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 271,
      "book": "analytical",
      "title": "Blind-spot hunt (2)",
      "teach": "Ask what you refuse to calculate — then calculate it.",
      "hint": "Calculate the avoided line.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
      "goal": "win",
      "theme": "Blind-spot hunt",
      "about": "Dvoretsky analytical — Blind-spot hunt.",
      "desc": "Psychological blind spots skip unpleasant lines. Force yourself into the line you dislike. Manual-level truth hides there often. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Calculate the avoided line. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 272,
      "book": "analytical",
      "title": "Perpetual deep check (2)",
      "teach": "Deep wins die to late perpetuals — check the end.",
      "hint": "Check late perpetual ideas.",
      "fen": "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Perpetual deep check",
      "about": "Dvoretsky analytical — Perpetual deep check.",
      "desc": "After a long winning tree, spend a pass on late perpetual resources. Conversions fail at the last step without that pass. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Check late perpetual ideas. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 273,
      "book": "analytical",
      "title": "Fortress at depth (2)",
      "teach": "Deep material gains may still be fortresses.",
      "hint": "Test for fortress at the leaf.",
      "fen": "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Fortress at depth",
      "about": "Dvoretsky analytical — Fortress at depth.",
      "desc": "Ask at deep leaves: can they fortress? If yes, the line is not winning. Analytical honesty includes fortress testing. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Test for fortress at the leaf. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 274,
      "book": "analytical",
      "title": "Stepwise deepening (2)",
      "teach": "Deepen iteratively: shallow pass, then deeper pass.",
      "hint": "Do a second deeper pass.",
      "fen": "r1bqk2r/pp1pppbp/2n2np1/2p5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5",
      "goal": "win",
      "theme": "Stepwise deepening",
      "about": "Dvoretsky analytical — Stepwise deepening.",
      "desc": "First pass: candidates and rough evals. Second pass: deepen the critical trunks. Iterative deepening is how hard analysis becomes manageable. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Do a second deeper pass. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 275,
      "book": "analytical",
      "title": "Error logging (2)",
      "teach": "When a line fails, log why — then adjust candidates.",
      "hint": "Log the failure reason.",
      "fen": "r2q1rk1/ppp1ppbp/2np1np1/8/2PPP1b1/2N2N2/PP2BPPP/R1BQK2R w KQ - 4 8",
      "goal": "win",
      "theme": "Error logging",
      "about": "Dvoretsky analytical — Error logging.",
      "desc": "Analytical improvement requires naming why a line failed (resource, move order, miscount). Log it, then adjust. Do not restart blindly. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Log the failure reason. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 276,
      "book": "analytical",
      "title": "Quiet start deep end (2)",
      "teach": "Some solutions start quiet and explode later.",
      "hint": "Consider a quiet start.",
      "fen": "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Quiet start deep end",
      "about": "Dvoretsky analytical — Quiet start deep end.",
      "desc": "Do not discard quiet first moves because the position 'looks tactical'. Manual solutions sometimes begin with prophylaxis and end in fireworks. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Consider a quiet start. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 277,
      "book": "analytical",
      "title": "Material vs attack deep (2)",
      "teach": "Deeply compare grabbing material vs continuing the attack.",
      "hint": "Compare material vs attack deeply.",
      "fen": "r1bqk2r/pppp1ppp/2n1pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Material vs attack deep",
      "about": "Dvoretsky analytical — Material vs attack deep.",
      "desc": "A hard choice: take the material leaf or continue attacking. Analyse both deeply. The Manual thrives on that comparison. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Compare material vs attack deeply. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 278,
      "book": "analytical",
      "title": "King hunt analysis (2)",
      "teach": "Mating nets need complete flight coverage in the tree.",
      "hint": "Cover all flights in the tree.",
      "fen": "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
      "goal": "win",
      "theme": "King hunt analysis",
      "about": "Dvoretsky analytical — King hunt analysis.",
      "desc": "Deep king hunts fail when one flight is left. Systematically cover flights in the analysis before claiming mate. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Cover all flights in the tree. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 279,
      "book": "analytical",
      "title": "Analytical stamina (2)",
      "teach": "Stay with the position past frustration.",
      "hint": "Stay with the hard analysis.",
      "fen": "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/4R1K1 w - - 0 18",
      "goal": "win",
      "theme": "Analytical stamina",
      "about": "Dvoretsky analytical — Analytical stamina.",
      "desc": "Brutal positions reward stamina. Take a short reset if visualisation fails, then continue. Walking away early trains quitting, not analysis. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Stay with the hard analysis. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 280,
      "book": "analytical",
      "title": "Analytical synthesis (2)",
      "teach": "Wide candidates, deep finished lines, honest leaves.",
      "hint": "Play the deeply verified move.",
      "fen": "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Analytical synthesis",
      "about": "Dvoretsky analytical — Analytical synthesis.",
      "desc": "Synthesise the Analytical Manual ethos: exhaustive candidates, deep finished variations, honest evaluations, then the move that survives best defence. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Play the deeply verified move. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 281,
      "book": "analytical",
      "title": "Variation notebook (2)",
      "teach": "Mentally number main lines A/B/C with evals.",
      "hint": "Label lines A/B/C.",
      "fen": "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
      "goal": "win",
      "theme": "Variation notebook",
      "about": "Dvoretsky analytical — Variation notebook.",
      "desc": "Organise deep work like a notebook: Line A (eval), Line B (eval). Organisation prevents re-calculating the same fog. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Label lines A/B/C. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 282,
      "book": "analytical",
      "title": "Forced vs unforced (2)",
      "teach": "Separate forced sequences from choice nodes.",
      "hint": "Mark choice nodes clearly.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Forced vs unforced",
      "about": "Dvoretsky analytical — Forced vs unforced.",
      "desc": "In a long tree, mark where someone has a real choice. Forced stretches can be compressed; choice nodes need width. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Mark choice nodes clearly. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 283,
      "book": "analytical",
      "title": "Tactical motifs at depth (2)",
      "teach": "Motifs still apply — search them in deep leaves.",
      "hint": "Search motifs deep.",
      "fen": "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
      "goal": "win",
      "theme": "Tactical motifs at depth",
      "about": "Dvoretsky analytical — Tactical motifs at depth.",
      "desc": "Pins, deflections, and clearances appear late in deep lines. Keep motif eyes open at the leaf, not only at move one. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Search motifs deep. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 284,
      "book": "analytical",
      "title": "Practical cutoff (2)",
      "teach": "When a line is clearly insufficient, cut it.",
      "hint": "Cut clearly insufficient lines.",
      "fen": "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Practical cutoff",
      "about": "Dvoretsky analytical — Practical cutoff.",
      "desc": "Brutal analysis is not infinite. Cut lines that are clearly worse after honest depth so remaining trunks get more time. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Cut clearly insufficient lines. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 285,
      "book": "analytical",
      "title": "Second-best tracking (2)",
      "teach": "Know the second-best move's eval too.",
      "hint": "Track second-best.",
      "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Second-best tracking",
      "about": "Dvoretsky analytical — Second-best tracking.",
      "desc": "Analytical strength includes knowing how much better your move is than the alternative. Track second-best for confidence and practical choice. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Track second-best. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 286,
      "book": "analytical",
      "title": "Defence-first pass (2)",
      "teach": "Start a hard position with a defensive resource pass.",
      "hint": "Start with their resources.",
      "fen": "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
      "goal": "win",
      "theme": "Defence-first pass",
      "about": "Dvoretsky analytical — Defence-first pass.",
      "desc": "Especially after studying Resources: begin hard analysis by listing their resources, then build your lines against them. Defence-first prevents fantasy attacks. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Start with their resources. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 287,
      "book": "analytical",
      "title": "Attack-first pass (2)",
      "teach": "Then build the strongest attacking attempts.",
      "hint": "Build the strongest attack attempts.",
      "fen": "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Attack-first pass",
      "about": "Dvoretsky analytical — Attack-first pass.",
      "desc": "After resources, attempt the most dangerous attacking trees. Alternating defence-first and attack-first passes mirrors Manual method. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Build the strongest attack attempts. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 288,
      "book": "analytical",
      "title": "Clarity leaf preference (2)",
      "teach": "Prefer deep lines that end in clear outcomes.",
      "hint": "Prefer clear deep leaves.",
      "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "goal": "win",
      "theme": "Clarity leaf preference",
      "about": "Dvoretsky analytical — Clarity leaf preference.",
      "desc": "Among similar deep options, prefer the line ending in a clear win/draw over perpetual fog. Clarity is analytical hygiene. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Prefer clear deep leaves. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 289,
      "book": "analytical",
      "title": "Miscount prevention (2)",
      "teach": "Re-count material at every deep leaf.",
      "hint": "Re-count at the leaf.",
      "fen": "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Miscount prevention",
      "about": "Dvoretsky analytical — Miscount prevention.",
      "desc": "Miscounts create Manual-level blunders in analysis. Re-count material and checks at each leaf before writing the eval. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Re-count at the leaf. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 290,
      "book": "analytical",
      "title": "Visualisation reset (2)",
      "teach": "Reset the board image when pieces get ghostly.",
      "hint": "Reset visualisation.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 2 9",
      "goal": "win",
      "theme": "Visualisation reset",
      "about": "Dvoretsky analytical — Visualisation reset.",
      "desc": "Deep calculation fails when pieces ghost. Reset to the root position, rebuild slowly, continue. Resetting is strength. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Reset visualisation. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 291,
      "book": "analytical",
      "title": "Critical check filter (2)",
      "teach": "In deep trees, filter which checks deserve depth.",
      "hint": "Filter checks by importance.",
      "fen": "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
      "goal": "win",
      "theme": "Critical check filter",
      "about": "Dvoretsky analytical — Critical check filter.",
      "desc": "Not every check in a long line needs a novel. Filter by whether it changes material, king safety, or forces a unique reply. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Filter checks by importance. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 292,
      "book": "analytical",
      "title": "Positional deep move (2)",
      "teach": "Hard strategy still needs deep verification.",
      "hint": "Deep-verify the positional move.",
      "fen": "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Positional deep move",
      "about": "Dvoretsky analytical — Positional deep move.",
      "desc": "A quiet strategic move in a brutal position must survive deep resources. Verify it like a combination. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Deep-verify the positional move. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 293,
      "book": "analytical",
      "title": "Endgame transition deep (2)",
      "teach": "Deeply assess transitions into endings mid-tree.",
      "hint": "Deep-check ending transitions.",
      "fen": "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 8",
      "goal": "win",
      "theme": "Endgame transition deep",
      "about": "Dvoretsky analytical — Endgame transition deep.",
      "desc": "When a deep line offers a trade into an ending, analyse that ending with full seriousness before choosing the trade. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Deep-check ending transitions. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 294,
      "book": "analytical",
      "title": "Sacrifice chain (2)",
      "teach": "Some lines sac twice — calculate both sacs fully.",
      "hint": "Calculate the full sac chain.",
      "fen": "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
      "goal": "win",
      "theme": "Sacrifice chain",
      "about": "Dvoretsky analytical — Sacrifice chain.",
      "desc": "Double sacrifices appear in Manual work. Do not stop after the first sac's fog; continue until the second sac's leaf is clear. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Calculate the full sac chain. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 295,
      "book": "analytical",
      "title": "Only-move sequences (2)",
      "teach": "Chains of only-moves need perfect accuracy.",
      "hint": "Verify each only-move.",
      "fen": "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14",
      "goal": "win",
      "theme": "Only-move sequences",
      "about": "Dvoretsky analytical — Only-move sequences.",
      "desc": "If your deep win requires five only-moves, verify each. One inaccuracy collapses the chain. Precision over romance. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Verify each only-move. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 296,
      "book": "analytical",
      "title": "Opponent psychology note (2)",
      "teach": "Hard lines also pose practical problems — note them.",
      "hint": "Note practical problem lines.",
      "fen": "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
      "goal": "win",
      "theme": "Opponent psychology note",
      "about": "Dvoretsky analytical — Opponent psychology note.",
      "desc": "Among analytically equal deep options, prefer the one harder to meet over the board. Practical notes belong in serious analysis. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Note practical problem lines. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 297,
      "book": "analytical",
      "title": "Publishable main line (2)",
      "teach": "Produce one clean main line as the answer.",
      "hint": "State a clean main line.",
      "fen": "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      "goal": "win",
      "theme": "Publishable main line",
      "about": "Dvoretsky analytical — Publishable main line.",
      "desc": "After the mess of branches, extract a clean main line you could show a student. Clarity of presentation clarifies thought. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: State a clean main line. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 298,
      "book": "analytical",
      "title": "Unsolved honesty (2)",
      "teach": "If unsolved, play the most robust practical move.",
      "hint": "If unsolved, play robustly.",
      "fen": "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 2 5",
      "goal": "win",
      "theme": "Unsolved honesty",
      "about": "Dvoretsky analytical — Unsolved honesty.",
      "desc": "Not every Manual position is solved in session. If time expires, play the most robust practical move among deep survivors — and flag the position for later. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: If unsolved, play robustly. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 299,
      "book": "analytical",
      "title": "Training repetition (2)",
      "teach": "Return to the same hard position later cold.",
      "hint": "Treat it as repeatable training.",
      "fen": "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/2N2NP1/PP2PP1P/R1BQKB1R w KQ - 0 6",
      "goal": "win",
      "theme": "Training repetition",
      "about": "Dvoretsky analytical — Training repetition.",
      "desc": "Analytical strength grows by revisiting brutal positions cold. Today's struggle is tomorrow's pattern. Play the best move you can now. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Treat it as repeatable training. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    },
    {
      "n": 300,
      "book": "analytical",
      "title": "Manual synthesis (2)",
      "teach": "Width, depth, honesty, stamina — then move.",
      "hint": "Play the Manual-verified move.",
      "fen": "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
      "goal": "win",
      "theme": "Manual synthesis",
      "about": "Dvoretsky analytical — Manual synthesis.",
      "desc": "Final Analytical Manual drill: exhaustive width, finished deep lines, honest leaves, stamina under difficulty. Then play the verified move. On this board, choose the move that best expresses the idea, then verify it against their strongest resource. Hint focus: Play the Manual-verified move. (Analytical Manual–style · deep multi-variation analysis)",
      "pitfalls": []
    }
  ];


  const BOOK_LABEL = {
    resources: "Resources \u00b7 Dvoretsky",
    strategic: "Strategic \u00b7 Aagaard",
    analytical: "Analytical \u00b7 Manual",
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
    if (!["all", "resources", "strategic", "analytical"].includes(next)) return;
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
