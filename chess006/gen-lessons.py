#!/usr/bin/env python3
"""Generate 300 chess006 lessons (Kotov / Fischer / Bronstein). No pitfalls; richer descriptions."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent

def parse_fen(fen: str):
    board, turn, *_ = fen.split()
    rows = board.split("/")
    g = [[None] * 8 for _ in range(8)]
    for r, row in enumerate(rows):
        c = 0
        for ch in row:
            if ch.isdigit():
                c += int(ch)
            else:
                g[r][c] = ch
                c += 1
        if c != 8:
            raise ValueError("cols")
    return g, turn


def find_king(g, col):
    k = "K" if col == "w" else "k"
    for r in range(8):
        for c in range(8):
            if g[r][c] == k:
                return r, c
    return None


def piece_at(g, r, c):
    return g[r][c] if 0 <= r < 8 and 0 <= c < 8 else None


def is_attacked(g, tr, tc, by):
    want = (lambda p: p == p.upper()) if by == "w" else (lambda p: p == p.lower())
    pr = 1 if by == "w" else -1
    for dc in (-1, 1):
        p = piece_at(g, tr + pr, tc + dc)
        if p and want(p) and p.upper() == "P":
            return True
    for dr, dc in ((-2, -1), (-2, 1), (-1, -2), (-1, 2), (1, -2), (1, 2), (2, -1), (2, 1)):
        p = piece_at(g, tr + dr, tc + dc)
        if p and want(p) and p.upper() == "N":
            return True
    for dr in range(-1, 2):
        for dc in range(-1, 2):
            if not dr and not dc:
                continue
            p = piece_at(g, tr + dr, tc + dc)
            if p and want(p) and p.upper() == "K":
                return True

    def slide(dirs, types):
        for dr, dc in dirs:
            r, c = tr + dr, tc + dc
            while 0 <= r < 8 and 0 <= c < 8:
                p = g[r][c]
                if p:
                    if want(p) and p.upper() in types:
                        return True
                    break
                r += dr
                c += dc
        return False

    return slide(((-1, -1), (-1, 1), (1, -1), (1, 1)), ("B", "Q")) or slide(
        ((-1, 0), (1, 0), (0, -1), (0, 1)), ("R", "Q")
    )


def fen_ok(fen: str) -> bool:
    try:
        g, turn = parse_fen(fen)
        wk, bk = find_king(g, "w"), find_king(g, "b")
        if not wk or not bk:
            return False
        if abs(wk[0] - bk[0]) <= 1 and abs(wk[1] - bk[1]) <= 1:
            return False
        opp = "b" if turn == "w" else "w"
        ok = find_king(g, opp)
        return not is_attacked(g, ok[0], ok[1], turn)
    except Exception:
        return False


FENS = [
    "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
    "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9",
    "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10",
    "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
    "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
    "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
    "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
    "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4",
    "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5",
    "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 0 6",
    "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9",
    "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10",
    "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3",
    "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4",
    "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5",
    "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 2 9",
    "r1bqkb1r/pp1ppppp/2n2n2/2p5/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 2 4",
    "r1bqk2r/pp1pppbp/2n2np1/2p5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 2 5",
    "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5",
    "r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 2 7",
    "r2q1rk1/ppp1ppbp/2np1np1/8/2PPP1b1/2N2N2/PP2BPPP/R1BQK2R w KQ - 4 8",
    "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
    "rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 6",
    "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 8",
    "r1bq1rk1/pp2bppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQ1RK1 w - - 0 8",
    "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
    "r1bqk2r/pppp1ppp/2n1pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5",
    "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
    "rnbq1rk1/pp3ppp/4pn2/2pp4/1bPP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7",
    "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9",
    "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14",
    "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16",
    "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/4R1K1 w - - 0 18",
    "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7",
    "r1bq1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 8",
    "rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
    "r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3",
    "rnbqkb1r/pp2pppp/5n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 0 4",
    "r1bqkb1r/pp2pppp/2n2n2/2pp4/3P4/2P2N2/PP2PPPP/RNBQKB1R w KQkq - 2 5",
    "rnbqk2r/pp2ppbp/5np1/2pp4/3P4/2P2NP1/PP2PP1P/RNBQKB1R w KQkq - 0 6",
    "r1bq1rk1/pp2ppbp/2n2np1/2pp4/3P4/2P2NP1/PP2PPBP/RNBQ1RK1 w - - 0 8",
    "rnbq1rk1/ppp1ppbp/5np1/3p4/2PP4/2N2NP1/PP2PP1P/R1BQKB1R w KQ - 0 6",
    "r1bq1rk1/ppp1ppbp/2n2np1/3p4/2PP4/2N2NP1/PP2PPBP/R1BQK2R w KQ - 2 7",
    "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
    "rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
    "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
]
assert all(fen_ok(f) for f in FENS), [f for f in FENS if not fen_ok(f)]

# (theme, teach, hint, desc) — desc is long-form explanation
KOTOV = [
    ("Candidate moves", "List every serious candidate before diving deep into any one line.", "Name candidates, then choose.",
     "Kotov's method starts with discipline: write (or mentally list) the candidate moves that could reasonably change the evaluation. Only after the list is complete do you analyse each branch. This stops the classic amateur habit of calculating one shiny idea forever while missing a simpler win. In this position, pause, list two or three real options, then play the one that survives comparison."),
    ("Analysis tree", "Build a clean tree — one branch at a time, then compare trunks.", "Finish one branch before hopping.",
     "Kotov pictured calculation as a tree: each candidate is a trunk, each reply a branch. Jumping between unfinished branches creates 'kotov syndrome' — returning again and again without a decision. Force yourself to finish a line to a quiet position or a clear eval, mark it, then move to the next candidate. The move you play is the trunk with the best finished evaluation."),
    ("Don't jump branches", "Stay on the current variation until it resolves.", "Resolve this line first.",
     "The disease of restless calculation is switching lines mid-stream. If you are analysing a capture sequence, stay with it until the dust settles — material counted, king safe, threats met. Only then return to the root and examine another candidate. That single habit upgrades calculation more than raw tactics flashcards."),
    ("Forcing moves first", "Order the tree: checks, captures, threats before quiet tries.", "Start with forcing moves.",
     "When several candidates exist, analyse forcing moves first. Checks and captures prune the tree because replies are limited. Quiet improving moves come later, once you know whether a forcing line already wins or loses. This ordering is practical Kotov: less time spent on decorative ideas that never compete with a concrete shot."),
    ("Compare finished lines", "Never choose until at least two lines are fully evaluated.", "Compare, then decide.",
     "A half-calculated brilliancy is not better than a fully understood solid move. Kotov insists on comparison of completed analyses. If candidate A ends in a clear plus and candidate B is still foggy, either finish B or reject it. Play the move whose finished tree you trust."),
    ("Variation notebook mind", "Mentally 'write' the key moves so you can reuse the work.", "Remember the spine of the line.",
     "Grandmasters remember the spine of each variation — the critical captures and only-moves. Train that habit: after calculating, restate the main line in three to five plies. If you cannot recite it, you did not finish the branch. This drill builds the internal notebook Kotov described."),
    ("Critical position flag", "Know when a position demands deep calculation vs a plan move.", "Calculate deeply here.",
     "Not every moment needs a Kotov tree. Flag critical positions: tactical contact, pawn breaks that change the structure, or decisions that trade a static plus for dynamics. Elsewhere, play by plan. Over-calculating quiet positions wastes energy; under-calculating critical ones loses games."),
    ("Time allocation", "Spend clock where the tree is widest and the stakes highest.", "Invest time on this decision.",
     "Kotov-linked practical advice: budget thinking time for positions with many candidates or irreversible captures. If only one move makes sense, play it and save minutes for later storms. Here the branching factor is high — this is where your clock should go."),
    ("Eliminate refuted tries", "Cross out candidates that fail to one clear resource.", "Eliminate the busted try.",
     "Once a candidate is refuted by a single accurate reply, mark it dead and do not reopen it without new information. Endless resurrection of dead lines is another form of branch-jumping. Elimination shrinks the tree so the remaining candidates get real depth."),
    ("Quiet candidate matters", "Include the quiet consolidating move among candidates.", "Consider the quiet option.",
     "Amateurs list only checks and sacrifices. Kotov's list must include the best quiet move — the one that improves a piece or prevents a threat. Often the 'brilliant' line fails and the quiet candidate is simply best. Put it on the list from the start."),
    ("Opponent's best reply", "Analyse their strongest answer, not the cooperative one.", "Assume best defense.",
     "Every branch must assume best defense. Hope chess is calculating only the replies you want. Ask: if they play the most annoying legal move, does my idea still work? If not, the trunk is weaker than it looked."),
    ("Stop when clear", "When a line is clearly winning or losing, stop and mark it.", "Stop — the eval is clear.",
     "Depth for its own sake is vanity. If a variation ends in forced mate or decisive material, stop. If it ends in a known drawn fortress, stop. Return to comparison. Extra plies after clarity are time stolen from other candidates."),
    ("Recheck the root", "Before moving, glance once more at the starting position.", "Recheck, then play.",
     "After deep diving, players blunder by forgetting a simple resource that existed at the root. Kotov-style hygiene: return to the board position (mentally), confirm your chosen move is still legal and that no immediate shot was missed, then play."),
    ("One idea, several moves", "Same plan may have multiple move orders — compare them.", "Pick the better move order.",
     "Often two candidates express the same idea with different move orders. Analyse both briefly: one may allow a zwischenzug, the other may prevent it. Move-order comparison is a small tree with a large payoff."),
    ("Tactical motif seed", "Spot the motif first, then grow the Kotov tree around it.", "Calculate the motif cleanly.",
     "Motifs (pins, forks, clearances) are seeds. Once seen, list the concrete moves that use them as candidates, then analyse systematically. Do not let the motif seduce you into a single unfinished fantasy variation."),
    ("Defensive candidates", "When under pressure, candidates are saving moves — list them too.", "Find the saving candidate.",
     "Kotov's method is not only for attacking. In trouble, list every plausible defense: exchanges, king runs, counterchecks. Analyse which one actually holds. Panic without a candidate list is how lost positions become resignations."),
    ("Only-move awareness", "Sometimes the tree has one legal trunk that doesn't lose.", "Find the only move.",
     "Recognising an only-move situation focuses calculation. If every alternative fails to a short refutation, invest deeply in the survivor. This is efficient Kotov: elimination first, depth second."),
    ("Evaluation vocabulary", "Finish each branch with a clear eval word, not a vibe.", "Eval the line clearly.",
     "Replace 'looks nice' with concrete labels: winning, better, equal, worse, lost — ideally tied to material, king safety, or a forced continuation. Clean evals make comparison possible. Fuzzy vibes make you reopen dead branches."),
    ("Avoid calculation addiction", "If no forcing contact exists, prefer a plan move.", "Play the planned move.",
     "Kotov never demanded a tree for every quiet improving move. When the position is strategic and closed, choose a plan-consistent move quickly. Save full trees for contact positions. Balance is part of thinking like a grandmaster."),
    ("Tree of checks", "In mating attacks, the tree is mostly checks — organise them.", "Order the checking tree.",
     "Mating attacks explode with checking options. List checking candidates by danger, analyse the fiercest first, and note when a quiet inclusion is needed to cover a flight square. Organised checking trees convert attacks; chaotic ones miss mates."),
    ("Material count mid-tree", "Track material after every capture in the variation.", "Keep the material tally.",
     "Lost in a long capture sequence, players forget who is ahead. After each capture in your mental line, update the material balance. Kotov discipline includes bookkeeping — otherwise you 'win' a line that is actually down a piece."),
    ("King safety leaf", "End every branch with a king-safety check.", "Check king safety at the leaf.",
     "A variation that wins a pawn but leaves your king naked is not a success leaf. Before marking a branch 'plus', ask whether either king is suddenly exposed. Safety is part of the evaluation leaf Kotov wants you to record."),
    ("Reuse prior work", "If a subvariation repeats, reuse the earlier conclusion.", "Reuse the known leaf.",
     "Transpositions inside the tree should not be recalculated from scratch. If you already know a position is drawn or winning, graft that leaf onto the new branch. Efficiency is a grandmaster skill."),
    ("Practical selection", "When two lines are equal, pick the harder one for them.", "Choose the practical try.",
     "Kotov's method finds truth; practical play sometimes chooses among equals. If two finished lines evaluate the same, prefer the one that poses more problems or is easier for you to play. Mark that as a practical tie-break, not as deeper truth."),
    ("Blunder check habit", "After choosing, scan for a one-move refutation.", "Blunder-check, then move.",
     "The last Kotov hygiene step: your chosen move must not hang a piece or allow a trivial mate. A ten-minute tree ending in a one-move blunder is still a blunder. Spend five seconds on the root scan."),
    ("Wide then deep", "Breadth of candidates first; depth second.", "Widen, then deepen.",
     "Amateurs go deep on move one. Kotov goes wide first. A short look at each candidate often kills most of them quickly; then depth is spent where it matters. Wide-then-deep is the tempo of professional calculation."),
    ("Intermezzo branches", "Include zwischenzugs as separate candidate replies.", "Look for the intermezzo.",
     "When analysing their reply, remember they may insert a check or capture before recapturing. Add those intermezzos as branches. Many 'winning' trees collapse to an in-between move you never listed."),
    ("Endgame leaf accuracy", "If the tree enters an ending, evaluate the ending properly.", "Eval the ending leaf.",
     "A combination that 'wins a pawn' but enters a drawn rook ending is not a win. When your leaf is an ending, switch to endgame criteria: opposition, activity, pawn races. Kotov's tree is only as good as its leaf evaluations."),
    ("Training tempo", "In training, force yourself to verbalise candidates aloud.", "Say the candidates aloud.",
     "The drill for this lesson: before touching a piece, speak two or three candidates and one rejecting reason for each discarded idea. That verbal habit installs Kotov's method faster than silent wishing."),
    ("Method review", "Candidates → forcing order → finish branches → compare → blunder-check.", "Apply the full method.",
     "Put the whole Kotov loop together on this board. List candidates, analyse forcing ones first, finish each branch, compare evaluations, choose, then blunder-check. Think Like a Grandmaster is a method book — this drill is the method under game pressure."),
]

# Expand Kotov to 50 unique then duplicate with drill numbers in builder
KOTOV_EXTRA = [
    ("Candidate pruning", "Discard illegal or obviously losing tries immediately.", "Prune the nonsense.",
     "A candidate list should be serious. Moves that hang the queen without compensation are not candidates. Prune instantly so your mental RAM stays with real options. Kotov's method assumes adult filtering before deep work."),
    ("Priority threats", "If they threaten mate in one, that threat dominates the tree.", "Meet the absolute threat.",
     "Absolute threats collapse the tree: you must answer them. Candidates that ignore mate in one are dead on arrival. Identify forcing threats before artistic plans."),
    ("Capture sequence map", "Map the capture chain before entering it.", "Map captures first.",
     "Before diving into a series of captures, list who takes what and on which squares. A capture map prevents getting lost mid-tree and makes material tallies reliable."),
    ("Check safety", "Every check you give must be checked for counterchecks.", "Watch for counterchecks.",
     "Giving check feels forcing, but counterchecks can invert the evaluation. When a checking candidate appears, immediately look at checking replies. That branch often decides the true value of the attack."),
    ("Quiet inclusion", "Sometimes a quiet inclusion makes the forcing line work.", "Include the quiet prep move.",
     "Classic attacking technique: a non-checking inclusion covers a flight square or cuts a defender, after which the forcing line wins. Put that inclusion on the candidate list; it is easy to miss if you only look at checks."),
    ("Draw branch honesty", "If a line is perpetual, label it draw — not 'unclear'.", "Label the perpetual draw.",
     "Honest leaves matter. A perpetual is a draw leaf. Marking it 'unclear' keeps you recalculating forever. Kotov wants crisp labels so comparison is possible."),
    ("Complexity tax", "Prefer the simpler winning tree when both win.", "Prefer the clear win.",
     "If two lines both win, choose the one with fewer only-moves and less hanging material. Complexity is a tax on your nerves and clock. Grandmaster calculation includes practical clarity."),
    ("Update after new info", "If a discovery appears mid-tree, update candidates.", "Update the candidate list.",
     "Sometimes deep in a line you notice a new resource available already at the root. Pause, add it as a fresh candidate, and restart breadth. Intellectual honesty beats stubborn loyalty to the first idea."),
    ("Short refutation habit", "Seek short busts before long dreams.", "Find the short bust.",
     "Try to refute your own idea in two plies before investing ten. Short refutations are cheap. This keeps the Kotov tree lean and your optimism supervised."),
    ("Synchronise plan and tree", "Candidates should serve the position's plan.", "Choose plan-consistent candidates.",
     "Random tactics disconnected from the pawn structure are usually mirages. Let the plan suggest candidates, then verify them with the tree. Kotov plus strategy beats raw calculation noise."),
    ("Visual reset", "If confused, blink-reset to the root position.", "Reset to the root.",
     "Lost visualisation is normal. Reset: picture the current board (or look at it), rebuild the line slowly, and continue. Pushing through fog produces ghost pieces and illegal leaves."),
    ("Double-check critical leaf", "The leaf that decides the game deserves a second pass.", "Recheck the critical leaf.",
     "When a single leaf claims 'winning' and that claim decides your move, recalculate that leaf once more. Critical leaves earn a double-check; routine leaves do not."),
    ("Ignore crowd noise", "Do not let flashy sacrifices bully quieter candidates.", "Keep the quiet move listed.",
     "Psychological bias loves sacrifices. Force the quiet consolidating move to remain on the list until it is properly compared. Many Kotov students overvalue glitter."),
    ("Clock emergency mode", "With no time, shrink to forcing candidates only.", "Play the safest forcing move.",
     "Zeitnot truncates the method: list only checks/captures that don't lose instantly, pick the safest. Perfect trees require time; emergency mode is still structured, not random."),
    ("Post-mortem trees", "After games, rebuild the tree you should have made.", "Rebuild the missed tree.",
     "Training tip tied to Kotov: in post-mortem, reconstruct the candidate list you skipped. This lesson asks you to practise that reconstruction live — list what you would analyse if this were your adjourned game."),
    ("Branch labeling", "Label branches +/= / = / =+ / - so comparison is fast.", "Label the branch eval.",
     "Symbolic evals speed comparison. Habit: after finishing a branch, stamp it with a clear symbol. When three trunks are labeled, the choice is often obvious without re-entering the fog."),
    ("Avoid infinite checks", "If checks never end, recognise perpetual or progress.", "Decide: perpetual or progress?",
     "Endless checking trees need a question: am I progressing (mating net tightening) or looping (perpetual)? If looping, label draw and move on. If tightening, continue. Do not check forever out of inertia."),
    ("Piece coordination leaf", "A leaf with uncoordinated pieces is worse than the material suggests.", "Value coordination at the leaf.",
     "Evaluation includes harmony. Winning a pawn while your remaining pieces trip over each other may be only equality. Judge the leaf as a playable position, not a capture tally alone."),
    ("Strategy after tactics", "When the tactics end, know the resulting plan.", "Plan the post-tactical position.",
     "A combination that leaves you without a plan can return the advantage. After the forcing line, ask what the new plan is. Kotov's leaf should include 'and then I play toward X'."),
    ("Method seal", "Seal the habit: list, force, finish, compare, check.", "Seal the Kotov loop.",
     "Final Kotov drill: run the complete loop once, cleanly, without skipping steps. Think Like a Grandmaster is remembered for candidate moves — this position is your practice exam."),
]

FISCHER = [
    ("Concrete first", "Fischer excelled by making the position answer concrete questions.", "Play the concrete best move.",
     "My 60 Memorable Games shows a champion who asks: what is the truth here, move by move? Prefer the concrete continuation that improves your pieces or wins material over vague 'pressure'. Annotate your choice as Fischer might: a clear reason, not a mood."),
    ("Development with bite", "Develop with threats — not empty developing moves.", "Develop and threaten.",
     "Fischer's early play often develops while posing problems. When several developing moves exist, choose the one that also hits something or restricts them. Empty development is how the initiative slips."),
    ("King safety absolute", "If the king is unsafe, everything else waits.", "Secure or punish the king.",
     "Across the Memorable Games, king safety decisions are ruthless. Castle when needed; punish uncastled kings without delay. Do not chase a queenside pawn while the centre is exploding toward your monarch."),
    ("Bishop pair respect", "Fischer loved bishops — open the position when you have them.", "Use or hunt the bishop pair.",
     "Many Fischer annotations emphasise the bishop pair's long-term sting. If you have two bishops, consider timely pawn breaks that open diagonals. If they have them, restrain the openings or trade one off."),
    ("Knight outposts", "Plant knights on squares pawns cannot easily chase.", "Occupy the outpost.",
     "Fischer's pieces land on ideal squares and stay there. Identify the hole in their camp and the route your knight takes to it. Outposts are not decorative — they justify whole plans."),
    ("Exchange only with reason", "Trade when the resulting structure or activity favors you.", "Trade on your terms.",
     "Memorable Games is full of precise exchanges: remove their active piece, keep your monster, or head for a won ending. Ask what the trade changes before you click pieces off."),
    ("Initiative retention", "After a gain, keep asking questions of their position.", "Keep the initiative.",
     "Fischer rarely lets the opponent breathe after a concession. If you have won a pawn or a bind, find the next threatening move. Consolidation is sometimes needed — but passivity returns the gift."),
    ("Poisoned pawn caution", "Some pawns are bait; calculate before grabbing.", "Take only if calculated.",
     "The Poisoned Pawn Najdorf chapter alone teaches respect for bait. If a pawn looks free, list the forcing replies that punish greed. Grab it only when your tree says you survive."),
    ("Central control", "Occupy or pressure the centre before wing adventures.", "Play in/through the centre.",
     "Fischer's games repeatedly show central clarity enabling wing attacks. If the centre is unstable, fix it or dominate it before launching a speculative flank pawn storm."),
    ("Endgame technique appetite", "Simplify into endings you can play accurately.", "Head for the clear ending.",
     "Fischer converted advantages with ending precision. When ahead, ask whether a clean ending is available. Technical wins beat swashbuckling chances that risk the point."),
    ("Opening conviction", "Play openings you understand deeply — systems with plans.", "Follow a known plan.",
     "The Memorable Games annotations reveal deep opening preparation married to plans. In this structure, play the typical continuation you would trust in a match, not a one-off experiment."),
    ("Tactical alertness", "Stay awake — Fischer finished games with sudden shots.", "Find the tactical shot.",
     "Strategic builds in his games often end with a concrete blow. After improving pieces, scan for tactics. The champion's thinking mixes long plans with immediate geometry."),
    ("Prophylaxis lite", "Stop their only counterplay before it starts.", "Kill the counteridea.",
     "Even in attacking games, Fischer snuffs the opponent's idea. Ask what they want (a break, a piece lift) and meet it a move earlier. Small prophylaxes keep big advantages."),
    ("Passed pawn push", "Create and escort passers — they decide many of his wins.", "Create/escort the passer.",
     "Study how Fischer's passers advance with piece support. If you can create an outside or protected passer, calculate the escort path. Passed pawns are his favourite long-term weapon."),
    ("Rook activity", "Rooks belong on open files and the seventh rank.", "Activate the rook.",
     "Annotations frequently praise rook activity over passive defence of pawns. If a rook can reach the seventh or seize a file, that often outweighs a pawn. Play for activity."),
    ("Punish passivity", "If they play without a plan, seize space and initiative.", "Punish the slow setup.",
     "Fischer crushed opponents who drifted. When their last few moves lack a threat or a plan, accelerate: gain space, open lines, or fix weaknesses. Momentum is a weapon."),
    ("Accurate liquidation", "Trade into a won pawn ending only after counting.", "Count, then liquidate.",
     "Before the last piece trade, count the pawn ending as Fischer would — tempi, opposition, outside passers. Memorable Games celebrates clean liquidations, not hopeful ones."),
    ("Square color strategy", "Control the complex their bishop cannot contest.", "Dominate the soft color.",
     "Several games show Fischer exploiting a colour complex after trading the right minor piece. Identify weak dark or light squares and park pieces on them permanently."),
    ("Clock and clarity", "Choose clear positions when practical chances matter.", "Prefer the clear plus.",
     "Match temperament: when a clear advantage exists, take it rather than the murky brilliancy. Fischer could calculate anything — yet often chose clarity. Practical strength is part of champion thinking."),
    ("Will to win", "Play for two results when the position allows pressure.", "Keep playing for the win.",
     "The collection is famous for fighting spirit. If the position still contains problems for them, continue posing them. Draws appear when the truth is drawn — not from premature peace offers in your mind."),
]

# Build remaining Fischer themes to 50
FISCHER_EXTRA = [
    ("Space squeeze", "Gain space to restrict their pieces, then break.", "Squeeze, then break.",
     "Fischer often acquired space advantages that made the opponent's pieces trip. Expand with purpose, fix their structure, then break where they are least flexible."),
    ("Target hunters", "Fix a weakness and pile up — classic champion technique.", "Pile on the weakness.",
     "Find a backward pawn, weak square, or exposed king and bring a second and third attacker. Memorable Games repeatedly shows patient targeting rather than one-move threats."),
    ("Opening transition", "Leave the book with a plan, not a vacuum.", "Play the first plan move.",
     "When theory ends, Fischer's notes still have a plan. Identify the imbalance you leave the opening with and play toward it immediately."),
    ("Exchange sac judgment", "Sac the exchange for dark squares or initiative when concrete.", "Judge the exchange sac.",
     "Some Memorable Games feature exchange sacrifices for lasting soft squares. Calculate concrete gains — outposts, attacks — not romantic hopes."),
    ("Knight vs bishop choice", "Choose the minor that fits the pawn structure.", "Trade toward your minor.",
     "Fischer's exchanges often leave him with the superior remaining minor. In closed structures keep knights; open the board for bishops. Make the trade that matches the pawns."),
    ("Break timing", "Prepare breaks until tactics favor you.", "Time the break.",
     "Premature breaks open lines for their pieces. Prepare with piece placement, then break. The annotations emphasise timing as much as the break itself."),
    ("Defense with activity", "Defend by counterpunching, not pure passivity.", "Counterpunch.",
     "When under pressure, Fischer sought active resources. Look for exchanges that blunt the attack or counterthreats that force them backward."),
    ("Queenside majority", "Mobilise majority pawns before they blockade you.", "Mobilise the majority.",
     "Several games convert queenside majorities into passers. Advance with piece support and prevent their blockade pieces from settling."),
    ("Kingside storm control", "Meet storms with central breaks or piece trades.", "Meet the storm correctly.",
     "Against pawn storms, Fischer opened the centre or traded attacking pieces. Choose the antidote that fits: break, exchange, or run the king."),
    ("Technical conversion", "Remove counterplay, then advance the win slowly.", "Remove counterplay first.",
     "Conversion technique: first stop their ideas, then push your plus. Memorable Games shows clinical conversion without unnecessary drama."),
    ("Opening repertoire depth", "Know the typical middlegames of your openings.", "Play the typical middlegame plan.",
     "Fischer's prep meant he knew the plans after the opening. In this structure, recall the standard piece maneuvers and play one."),
    ("Pin exploitation", "Pins are invitations to pile up or undermine.", "Exploit the pin.",
     "When a pin appears, Fischer piled pressure or undermined the pinned piece's defense. Use the pin; do not admire it."),
    ("Back-rank awareness", "Always give or deny luft in sharp positions.", "Handle the back rank.",
     "Even champions watch back ranks. Create luft when needed; exploit theirs when tactics allow. Small king moves are sometimes the strongest."),
    ("Central tension", "Maintain or resolve tension with a reason.", "Handle the tension.",
     "Fischer resolved central tension when calculation favored him and kept it when the opponent had to blink first. Decide consciously."),
    ("Piece improvement chain", "Improve the worst piece, then the next.", "Improve the worst piece.",
     "A recurring annotation theme: reposition the idle piece before inventing combinations. Worst-piece improvement is champion hygiene."),
    ("Material vs attack", "Take material if the attack is not decisive.", "Take the material.",
     "Fischer could attack, but he also took material and won. If their initiative is insufficient, cash the chips and consolidate."),
    ("Psychological pressure", "Pose problems each move — keep them choosing.", "Pose a problem.",
     "Memorable Games shows positions where every reply is unpleasant. Prefer moves that force a difficult decision over quiet equality."),
    ("Endgame piece activity", "In endings, activity beats passive pawn defence.", "Activate in the ending.",
     "Rooks and kings must be active. Fischer's endings punish passive pieces. Activate even at the cost of a pawn when the theory supports it."),
    ("Opening surprise handling", "Against sidelines, play principles and calculate.", "Answer with principles.",
     "When surprised, Fischer relied on development, centre, and concrete calculation. Meet unusual moves with healthy principles."),
    ("Champion review", "Concrete truth, active pieces, converted advantages.", "Play the champion move.",
     "Summarise Fischer's style on this board: concrete evaluation, piece activity, and a will to convert. Choose the move that a match player would trust."),
    ("File seizure", "Take the open file and dare them to contest it.", "Seize the file.",
     "Fischer's heavy pieces arrive first on open files. If a file is open or about to open, race a rook there and double if needed. File control turns into seventh-rank invasions."),
    ("Seventh rank invasion", "A rook on the seventh is a lasting wound.", "Invade the seventh.",
     "Memorable Games repeatedly shows rooks landing on the seventh, eating pawns and cutting the king. Prepare the invasion; do not settle for a passive fourth-rank rook."),
    ("Fix then attack", "Fix a pawn weakness, then attack it with pieces.", "Fix the target, then pile up.",
     "Classic Fischer: fix a pawn on a vulnerable square, then bring attackers. Fixed targets cannot run; mobile weaknesses require different treatment."),
    ("Opposite bishops attack", "With opposite bishops, attack — do not drift to a draw.", "Use the attacking bishop.",
     "Opposite bishops favor the side with initiative. Fischer used them as attacking tools. Open lines toward the king on your bishop's color."),
    ("Calculation honesty", "If the combination fails, admit it and play the solid move.", "Prefer truth over hope.",
     "Fischer's annotations are honest about refuted ideas. If your sacrificial tree collapses, switch to the solid candidate without ego. Truth first."),
    ("Opening lead conversion", "A lead in development must open the position.", "Open while ahead in development.",
     "When ahead in development, open lines before they catch up — a Memorable Games refrain. Seek pawn breaks that expose their uncoordinated pieces."),
    ("Two-weakness principle", "Create a second front when one weakness is defended.", "Open the second front.",
     "If they successfully defend one target, create another. Fischer's technique often stretches the defence until something drops."),
    ("Match temperament", "Choose moves you can play calmly for hours.", "Choose the durable plus.",
     "World-championship temperament: durable advantages over speculative chaos when a match point is precious. Prefer the lasting plus."),
    ("Endgame king activity", "Activate the king as soon as the queens are off.", "Activate the king.",
     "Fischer's kings walk into endings early and decisively. With queens exchanged, bring the king toward the centre and key squares."),
    ("Memorable synthesis", "Concrete, active, converting — the Fischer triad.", "Play the Memorable move.",
     "Bring together the lessons of My 60 Memorable Games: concrete calculation, active pieces, and conversion technique. That triad is the move you want here."),
]

BRONSTEIN = [
    ("Middlegame story", "Zurich 1953 teaches that every structure tells a strategic story.", "Play the story's next chapter.",
     "Bronstein's tournament book reads like a novel of plans. Identify the pawn structure's story — who attacks where, who defends what — and play the next thematic move. Strategy is narrative with pieces."),
    ("Dynamic balance", "Equality can be dynamic — both sides have chances.", "Play into rich equality.",
     "Zurich games often show dynamic balance rather than dry equality. Seek positions where both armies have aims. Prefer the rich continuation over the sterile one when appropriate."),
    ("Piece harmony", "Pieces must cooperate like a string quartet.", "Harmonise the pieces.",
     "Bronstein praises harmonious setups: bishops and knights covering complementary squares, rooks connected. If one piece is out of the ensemble, bring it back into the music."),
    ("Creative breaks", "Breaks can be artistic — timed for maximum disruption.", "Time the creative break.",
     "The Zurich notes highlight imaginative pawn breaks. Prepare the break so that when it lands, several of their pieces are suddenly misplaced. Creativity is calculated disruption."),
    ("King hunt themes", "Middlegame attacks on the king need all hands.", "Bring attackers toward the king.",
     "Bronstein annotates king hunts with delight and precision. Count attackers and defenders, open lines, and include the last piece. Attacks fail from understaffing more than from lack of inspiration."),
    ("Positional exchange sac", "Sac the exchange for a magnificent minor piece or attack.", "Consider the exchange sac.",
     "Several Zurich classics feature exchange sacrifices for dark squares or lasting pressure. Evaluate the soft squares and the attack — not just the point count."),
    ("Maneuvering patience", "Some advantages require long maneuvers, not blows.", "Maneuver patiently.",
     "Bronstein shows waiting and regrouping as positive play. Improve knights via long routes, shift rooks, then strike. Patience is a middlegame weapon."),
    ("Central tension art", "Keeping tension can be more venomous than releasing it.", "Keep or release with art.",
     "Zurich 1953 repeatedly discusses when to capture and when to maintain tension. If releasing clarifies their plan, keep tension. If releasing opens your masterpieces, capture."),
    ("Opposite-side castling race", "Race, but undermine with central play.", "Race with central awareness.",
     "Opposite castling games in the tournament show pawn storms plus central counterplay. Push your storm while ensuring the centre does not explode in their favor."),
    ("Blockade drama", "Blockade passed pawns with pieces that also attack.", "Blockade actively.",
     "A blockade piece should not be a pure sentry. Bronstein likes blockaders that radiate threats. Blockade on a square where the piece still eyes weaknesses."),
    ("Initiative vs material", "Zurich heroes often prefer initiative to a quiet pawn.", "Prefer the initiative.",
     "The commentary frequently chooses dynamic chances over safe material. If the initiative is real and lasting, take it. If it is smoke, take the pawn instead."),
    ("Weak square odyssey", "Journey a knight toward a dream square.", "Route the knight.",
     "Watch how knights in Zurich travel three moves to a dream outpost. Plan the route: which squares, which tempi, which trades enable the landing."),
    ("Bishop pair poetry", "Open the manuscript for the bishops when the moment sings.", "Open for the bishops.",
     "Bronstein's language about bishops is vivid — and practical. Open diagonals when your bishops are ready and theirs are hemmed. The poetry is the plan."),
    ("Rooks on open files", "Contest open files; doubled rooks decide middlegames.", "Contest the file.",
     "Files opened in Zurich battles become highways for heavy pieces. Contest them early; doubled rooks on the only open file are often decisive."),
    ("Pawn storm ethics", "Storms need piece support — pawns alone are weather, not war.", "Support the storm.",
     "Bronstein criticises pawn storms without pieces behind them. Advance with lifts, batteries, and king targets identified. Weather becomes war only with coordination."),
    ("Defensive resourcefulness", "Find the ugly saving move; beauty can wait.", "Find the saving resource.",
     "The tournament book respects defensive genius. When worse, search for the resource that muddies the water: blockade, perpetual ideas, or a counterbreak."),
    ("Strategic pawn moves", "Every pawn move is a commitment Bronstein weighs carefully.", "Make the pawn commitment.",
     "Pawns do not move backward — Zurich notes treat pawn advances as chapter headings. Advance when the structure you create matches your piece placement."),
    ("Queen centralisation", "A centralised queen can dominate a middlegame.", "Centralise the queen.",
     "In several famous Zurich games, the queen finds a central perch eyeing both wings. If safe from harassment, centralise and survey."),
    ("Minor piece duel", "Knight vs bishop debates are decided by the pawn skeleton.", "Play the skeleton's side.",
     "Bronstein explains which minor thrives. Closed chains → knights; open centres → bishops. Trade or keep accordingly."),
    ("Attack the base", "Against chains, tip the base or restrain the head.", "Play against the chain.",
     "Classical strategy alive in Zurich: attack the base of the pawn chain or fix the head. Choose the approach that matches your piece placement."),
    ("Space and maneuvers", "With space, reshuffle; without space, break free.", "Use or challenge space.",
     "Space advantages in the 1953 games allow leisurely maneuvers. If you have space, improve slowly. If cramped, prepare the freeing break with urgency."),
    ("Tactical undercurrent", "Strategy sits on tactics — always scan shots.", "Scan for the shot.",
     "Bronstein's strategic essays still explode with tactics. After each strategic idea, scan forcing moves. The best plans are those tactics cannot refute."),
    ("Transition to ending", "Some middlegames want a favourable ending transition.", "Transition wisely.",
     "Zurich commentary often discusses when to head for endings. If your structure is better in simplified form, steer trades; if your attack needs queens, avoid them."),
    ("Initiative of the pieces", "Pieces can seize initiative without pawn contact.", "Seize piece initiative.",
     "Activity alone can be the plan: threaten traps, dominate squares, force passive replies. Bronstein shows initiative as a piece phenomenon, not only a pawn race."),
    ("Color complex siege", "Besiege a color complex until it collapses.", "Besiege the color complex.",
     "Trade the defender of a complex, then occupy it. Zurich games illustrate long sieges on dark or light squares ending in breakthrough."),
    ("Counterbreak timing", "Meet a wing attack with a central counterbreak.", "Strike in the centre.",
     "Classical antidote celebrated in the book: against a flank attack, break in the centre. Time it so their pieces are caught looking the wrong way."),
    ("Quiet positional crush", "Not every Zurich masterpiece is loud — some squeeze.", "Squeeze quietly.",
     "Learn the quiet crush: fix weaknesses, improve pieces, and let the opponent suffocate. The description in Bronstein's prose is lyrical; the moves are simple and strong."),
    ("Sacrificial brilliance", "When calculation supports it, brilliance is duty.", "Play the sound brilliancy.",
     "Zurich 1953 contains immortal sacrifices. The lesson is not to sac for applause — it is to calculate until the sacrifice is truth. If the truth is brilliant, play it."),
    ("Prophylactic middlegame", "Ask what they want — then prevent it stylishly.", "Prevent their idea.",
     "Bronstein notices opponents' plans early. A prophylactic move that looks modest may be the strongest in the position. Spoil their story, write yours."),
    ("Tournament book spirit", "Play with curiosity, courage, and clear plans.", "Play the Zurich spirit.",
     "The lasting gift of Zurich 1953 is a way of seeing middlegames: rich plans, concrete tactics, and joy in the struggle. Choose the move that continues a clear strategic story with tactical awareness."),
]

BRONSTEIN_EXTRA = [
    ("File occupation", "Occupy open files before they do.", "Take the open file.",
     "Heavy-piece battles in Zurich hinge on files. If a file opens, race to occupy it with a rook and invite the second rook behind."),
    ("Outpost forever", "An outpost knight can be worth an exchange.", "Value the outpost highly.",
     "Bronstein assigns huge value to permanent outposts. If you can establish one, do so even at material cost when the bind is real."),
    ("Pawn tension duel", "Who blinks first in the centre often loses the story.", "Win the tension duel.",
     "Maintain tension while improving; force them to capture into your preparation. The Zurich notes treat tension as a psychological and strategic lever."),
    ("King position middlegame", "King placement determines which breaks are safe.", "Respect king placement.",
     "Castled vs uncastled, kingside vs queenside — Bronstein always weighs king location before recommending a break. Align your break with king safety."),
    ("Piece sacrifice for structure", "Sometimes sac a piece for a crushing structure or attack.", "Judge the piece sac.",
     "Beyond exchange sacs, piece sacs appear when the structure collapses or the king is hunted. Calculate to a clear outcome."),
    ("Middlegame zugzwang echoes", "Squeeze until every move worsens their setup.", "Squeeze toward zugzwang.",
     "Though zugzwang is an endgame word, Bronstein shows middlegame squeezes where every pawn move creates a hole. Restrict, then wait."),
    ("Battery building", "Build batteries on files and diagonals before firing.", "Build the battery.",
     "Queen + bishop or doubled rooks appear throughout Zurich. Build the battery first; fire second."),
    ("Repositioning journeys", "Long repositionings are allowed if the goal is clear.", "Start the repositioning.",
     "A knight tour that looks slow is justified when the destination dominates. Announce the destination square and begin the journey."),
    ("Dynamic defence", "Defend by creating your own threats.", "Create counterthreats.",
     "Passive defence rarely stars in Bronstein's heroes' games. Counterthreats force the attacker to spend tempi on defence."),
    ("Strategic review", "Structure, harmony, break, tactic — the Zurich loop.", "Play the structured plan.",
     "Close the Bronstein cycle: read the structure, harmonise pieces, time the break, verify with tactics. That is the middlegame book in one move."),
    ("Initiative pendulum", "Seize the pendulum of initiative when it swings to you.", "Take the initiative now.",
     "Zurich games show the initiative swinging like a pendulum. When it swings your way — after their inaccuracy — accelerate. Hesitation returns the pendulum."),
    ("Pawn majority theatre", "Majorities must advance to create a passer.", "Advance the majority.",
     "Bronstein stages queenside or kingside majorities as theatre. Advance them with piece escort until a passer appears, then switch to technical mode."),
    ("Cross-pin themes", "Pins across the board create middlegame geometry.", "Exploit the geometry.",
     "Geometric themes — cross pins, alignments — decorate Zurich brilliancies. Look along ranks, files, and diagonals for alignments that tactics can exploit."),
    ("Improving the worst piece", "The ugliest piece dictates the next maneuver.", "Improve the ugly piece.",
     "Bronstein often begins plans by curing an ugly piece. Identify your least happy unit and find its better square before launching fireworks."),
    ("Central fortress break", "Break a fortress setup with the right lever.", "Lever the fortress.",
     "When they sit solidly, find the lever that cracks the shell. Zurich commentary loves the well-timed lever that turns a fortress into ruins."),
    ("Middlegame exchange decisions", "Exchanges change plans — decide with the new plan in mind.", "Exchange toward a plan.",
     "Do not trade on autopilot. Ask which plan remains after the trade. Bronstein's notes always connect exchanges to the ensuing strategic story."),
    ("Attacking ratio", "Only launch when attackers outnumber defenders.", "Fix the attacking ratio.",
     "Romantic attacks fail arithmetic. Count honestly. If short an attacker, bring one more piece or open one more line before the sacrifice."),
    ("Quiet crushing move", "The soft move that ends resistance is still a crush.", "Find the quiet crush.",
     "Not every Zurich highlight is loud. A quiet tightening move can be the most beautiful. Find the soft squeeze."),
    ("Strategic imagination", "Imagine the ideal setup, then steer toward it.", "Steer toward the ideal setup.",
     "Bronstein invites you to dream the ideal piece placement, then reverse-engineer the moves. Imagination first, move second."),
    ("Zurich finale", "Rich plans, verified by tactics — the tournament book's creed.", "Play the Zurich move.",
     "End with the spirit of Zurich 1953: a clear strategic story checked by concrete calculation. Play the move that belongs in a great middlegame book."),
]


def pack(themes):
    """Normalize list of tuples to length 50 themes then we'll make 100 lessons."""
    assert len(themes) >= 50, len(themes)
    return themes[:50]


def build(book, key, themes, start, style_tag, about_prefix):
    themes = pack(themes)
    out = []
    for i in range(100):
        theme, teach, hint, desc = themes[i % 50]
        fen = FENS[(i * 3 + start) % len(FENS)]
        occ = i // 50 + 1
        title = theme if occ == 1 else f"{theme} ({occ})"
        # richer desc: base + contextual closer
        full_desc = (
            f"{desc} "
            f"On this board, look for the move that expresses the idea most cleanly — "
            f"then verify it against their best reply. "
            f"Hint focus: {hint} "
            f"({style_tag})"
        )
        out.append({
            "n": start + i,
            "book": key,
            "title": title,
            "teach": teach,
            "hint": hint,
            "fen": fen,
            "goal": "win",
            "theme": theme,
            "about": f"{about_prefix} — {theme}.",
            "desc": full_desc,
            "pitfalls": [],
        })
        assert fen_ok(fen), (start + i, fen)
    return out


def main():
    kotov = KOTOV + KOTOV_EXTRA
    fischer = FISCHER + FISCHER_EXTRA
    bronstein = BRONSTEIN + BRONSTEIN_EXTRA
    assert len(kotov) == 50, len(kotov)
    assert len(fischer) == 50, len(fischer)
    assert len(bronstein) == 50, len(bronstein)

    lessons = (
        build("kotov", "kotov", kotov, 1,
              "Think Like a Grandmaster–style · calculation method ≈1700+",
              "Kotov-style calculation")
        + build("fischer", "fischer", fischer, 101,
                "My 60 Memorable Games–style · champion thinking",
                "Fischer-style annotated thinking")
        + build("bronstein", "bronstein", bronstein, 201,
                "Zurich 1953–style · middlegame strategy",
                "Bronstein-style middlegame")
    )
    assert len(lessons) == 300
    by = {}
    for L in lessons:
        by[L["book"]] = by.get(L["book"], 0) + 1
        assert L["pitfalls"] == []
        assert len(L["desc"]) > 180, (L["n"], len(L["desc"]))
    path = ROOT / "lessons-data.json"
    path.write_text(json.dumps(lessons, indent=2) + "\n")
    print("OK", len(lessons), by, "avg desc", sum(len(L["desc"]) for L in lessons) // 300)


if __name__ == "__main__":
    main()
