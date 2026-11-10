#!/usr/bin/env python3
"""Generate 200 original chess004 lessons (Amateur's Mind + Dvoretsky-style)."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent

# —— FEN legality helpers ——
def parse_fen(fen: str):
    board, turn, *_ = fen.split()
    rows = board.split("/")
    if len(rows) != 8:
        raise ValueError("rows")
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
            raise ValueError(f"cols {r}")
    return g, turn


def find_king(g, col):
    k = "K" if col == "w" else "k"
    for r in range(8):
        for c in range(8):
            if g[r][c] == k:
                return r, c
    return None


def piece_at(g, r, c):
    if 0 <= r < 8 and 0 <= c < 8:
        return g[r][c]
    return None


def is_attacked(g, tr, tc, by):
    want = (lambda p: p == p.upper()) if by == "w" else (lambda p: p == p.lower())
    pr = 1 if by == "w" else -1
    for dc in (-1, 1):
        p = piece_at(g, tr + pr, tc + dc)
        if p and want(p) and p.upper() == "P":
            return True
    for dr, dc in (
        (-2, -1), (-2, 1), (-1, -2), (-1, 2), (1, -2), (1, 2), (2, -1), (2, 1)
    ):
        p = piece_at(g, tr + dr, tc + dc)
        if p and want(p) and p.upper() == "N":
            return True
    for dr in range(-1, 2):
        for dc in range(-1, 2):
            if dr == 0 and dc == 0:
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

    if slide(((-1, -1), (-1, 1), (1, -1), (1, 1)), ("B", "Q")):
        return True
    if slide(((-1, 0), (1, 0), (0, -1), (0, 1)), ("R", "Q")):
        return True
    return False


def fen_ok(fen: str) -> bool:
    try:
        g, turn = parse_fen(fen)
        wk, bk = find_king(g, "w"), find_king(g, "b")
        if not wk or not bk:
            return False
        # side not to move must not be in check
        opp = "b" if turn == "w" else "w"
        ok = find_king(g, opp)
        if is_attacked(g, ok[0], ok[1], turn):
            return False
        return True
    except Exception:
        return False


def L(n, book, title, teach, hint, fen, goal, theme, about, desc, pitfalls):
    assert fen_ok(fen), f"bad fen n={n} {title}: {fen}"
    return {
        "n": n,
        "book": book,
        "title": title,
        "teach": teach,
        "hint": hint,
        "fen": fen,
        "goal": goal,
        "theme": theme,
        "about": about,
        "desc": desc,
        "pitfalls": pitfalls,
    }


AM_PITS = [
    "Ask which imbalance matters most before grabbing material.",
    "Don't play 'hope chess' — assume your opponent sees the threat.",
    "Improve your worst-placed piece before launching an attack.",
]
DV_PITS = [
    "Calculate the pawn ending before trading the last pieces.",
    "In rook endings, activity often beats a pawn.",
    "Watch for stalemate and fortress motifs in technical wins.",
]


def am(n, title, teach, hint, fen, theme, goal="win"):
    return L(
        n,
        "amateur",
        title,
        teach,
        hint,
        fen,
        goal,
        theme,
        f"{theme} — Silman-style thinking drill.",
        f"{teach} Fix the typical amateur error; play the principled move. "
        f"(Amateur's Mind–style · intermediate ≈1200–1700)",
        AM_PITS,
    )


def dv(n, title, teach, hint, fen, theme, goal="win"):
    return L(
        n,
        "dvoretsky",
        title,
        teach,
        hint,
        fen,
        goal,
        theme,
        f"{theme} — Advanced endgame drill.",
        f"{teach} Prefer the clean theoretical idea. "
        f"(Dvoretsky-style · advanced ≈2000+)",
        DV_PITS,
    )


# —— Amateur's Mind–style: imbalances & thinking errors (100) ——
# Original middlegame/late-opening drills with playable FENs.
AMATEUR_SPECS = [
    # Material / trades
    ("Don't Grab Poison", "The 'free' pawn walks into a fork.", "Refuse the bait — improve instead.", "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", "Hope chess"),
    ("Trade Into Clarity", "Simplify when ahead — remove their counterplay.", "Offer a clean trade.", "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7", "Material"),
    ("Keep the Attackers", "Don't trade your active pieces for passive ones.", "Avoid the equalizing trade.", "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8", "Imbalance"),
    ("Bishop Pair Keep", "The two bishops need open lines — don't give them up lightly.", "Keep the bishop pair.", "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4", "Bishop pair"),
    ("Knight Outpost Claim", "Plant a knight on a weak square the pawns can't chase.", "Occupy the outpost.", "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9", "Outpost"),
    # Pawn structure
    ("Fix the Backward Pawn", "Don't create a backward pawn on an open file for free.", "Avoid the weakening push.", "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5", "Pawn structure"),
    ("Break the Center", "Challenge a broad pawn center before it cramps you.", "Strike with the thematic break.", "rnbqkbnr/pp2pppp/2p5/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3", "Center"),
    ("Don't Push Random", "Every pawn move creates weaknesses — have a reason.", "Improve a piece instead of pushing.", "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 1 5", "Thinking"),
    ("Isolate or Not", "IQP: piece activity justifies the structural scar.", "Activate before the structure bites.", "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5", "IQP"),
    ("Hang the Minority", "Minority attack: create a weakness, then sit on it.", "Start the queenside pawn storm.", "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9", "Minority attack"),
    # Space / development
    ("Finish Development", "Don't attack with half your army still at home.", "Develop the sleeping piece.", "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", "Development"),
    ("Castle Before Drama", "King safety first — castle before opening the center.", "Get the king safe.", "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", "King safety"),
    ("Seize the Open File", "Contest the open file before they double on it.", "Take the file.", "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7", "Files"),
    ("Don't Ignore Space", "A space advantage means you can reshuffle; they can't.", "Gain space with a useful push.", "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4", "Space"),
    ("Piece Behind Passer", "Rooks belong behind passed pawns — yours or theirs.", "Post the rook correctly.", "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16", "Passed pawn"),
    # Planning / calculation hygiene
    ("Ask Their Threat", "Before your clever idea — what is their next move?", "Meet the threat first.", "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", "Thinking"),
    ("Candidate Moves", "List 2–3 candidates; don't move the first impulse.", "Choose the principled candidate.", "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7", "Thinking"),
    ("Stop Hope Chess", "A one-move threat they can ignore is not a plan.", "Make a real dual-purpose move.", "rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 2 3", "Hope chess"),
    ("Improve Worst Piece", "The worst-placed piece defines your next job.", "Re-route the idle piece.", "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8", "Piece activity"),
    ("Prophylaxis Lite", "Prevent their only active idea, then improve.", "Nip their plan in the bud.", "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10", "Prophylaxis"),
    # Weak squares / color complexes
    ("Own the Hole", "A hole on e5/d5 is a lifelong knight home.", "Occupy the hole.", "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9", "Weak squares"),
    ("Dark-Square Bind", "Trade the right bishop and the complex collapses.", "Target the soft color complex.", "r1bqk2r/ppp2ppp/2n1pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 6", "Color complex"),
    ("Don't Give Holes", "g3/g6 without a plan gifts outposts forever.", "Avoid the gratuitous hole.", "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 0 6", "Pawn structure"),
    ("Fix Then Attack", "Restrain their breaks, then pile on the weakness.", "Clamp the structure first.", "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9", "Restraint"),
    ("Open Near Their King", "Open lines only when your pieces are ready to use them.", "Open the right file.", "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7", "Attack"),
    # King safety / attacks
    ("Don't Castle Into It", "If the pawn storm is rolling, reconsider the wing.", "Castle (or stay) wisely.", "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", "King safety"),
    ("Meet the Storm", "Counter in the center against a wing attack.", "Break in the center.", "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/2KR1B1R w - - 0 10", "Opposite castling"),
    ("Sacrifice Only With Cause", "Don't sack for 'initiative' with no follow-ups.", "Prefer the solid continuation.", "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", "Calculation"),
    ("Defend Actively", "Passive defense loses — exchange or counterpunch.", "Find the active defense.", "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7", "Defense"),
    ("King Hunt Prep", "Bring the last attacker before the checks start.", "Add fuel to the attack.", "r1bq1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P3/2NP1N2/PPP2PPP/R2Q1RK1 w - - 0 8", "Attack"),
    # Imbalance catalog drills
    ("Material vs Initiative", "Down a pawn but developed — keep the initiative.", "Don't panic-recapture; stay active.", "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", "Initiative"),
    ("Space vs Breaks", "Space is useless if they get the freeing break.", "Stop or meet the break.", "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5", "Space"),
    ("Structure vs Pieces", "Ugly pawns can be fine if pieces dominate.", "Trust activity over cosmetics.", "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9", "Imbalance"),
    ("Time vs Material", "A tempo in an open position is often worth a pawn.", "Spend the tempo usefully.", "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", "Initiative"),
    ("Static vs Dynamic", "Static pluses last; dynamics must be used now.", "Cash the dynamic chance.", "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7", "Dynamics"),
    # Common amateur errors
    ("Stop One-Move Threats", "Make threats that still leave your position sound.", "Prefer a dual-purpose move.", "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3", "Hope chess"),
    ("Don't Chase Ghosts", "Harassing a queen that wants to move wastes time.", "Ignore the 'free' tempo gift.", "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2", "Thinking"),
    ("Recapture With Purpose", "Automatic recaptures can ruin a structure.", "Choose the right recapture.", "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", "Structure"),
    ("Queen Early Out", "Early queen trips often lose tempi to developing moves.", "Prefer developing a minor piece.", "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2", "Development"),
    ("Don't Pin Blindly", "A pretty pin that does nothing is not progress.", "Pin with intent — or improve.", "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", "Tactics"),
    # More positional
    ("Occupy Open Diagonal", "Clear the long diagonal for the fianchetto bishop.", "Open or seize the diagonal.", "rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 5", "Diagonals"),
    ("Exchange On Their Terms?", "Trade only if the resulting ending favors you.", "Decline or set terms.", "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7", "Trades"),
    ("Rook Lift Idea", "Lift a rook via the third rank into the attack.", "Start the rook lift.", "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7", "Attack"),
    ("Centralize Knights", "Knights belong near the center, not on the rim.", "Centralize the knight.", "r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 4", "Piece activity"),
    ("Bad Bishop Fix", "Free the bad bishop or trade it for their good one.", "Liberate or trade the bishop.", "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5", "Bishop quality"),
    ("Good Knight vs Bad Bishop", "Close the position to favor the knight.", "Keep things closed.", "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9", "Imbalance"),
    ("Two Weaknesses", "One weakness is defendable — create a second front.", "Open a second weakness.", "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9", "Planning"),
    ("Restraint First", "Restrain, blockade, then destroy the passer.", "Blockade before capturing.", "4r1k1/1pp2ppp/p1n5/3pP3/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16", "Blockade"),
    ("Don't Overextend", "Pawns that rush ahead become targets.", "Support before advancing.", "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4", "Pawn structure"),
    ("Liquidate Correctly", "When better, simplify into a won ending — not a drawn one.", "Choose the winning liquidation.", "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7", "Conversion"),
    # Silman-style question drills
    ("Who Has Positive Imbalance?", "Identify your plus before inventing a plan.", "Play toward your advantage.", "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10", "Imbalance"),
    ("Can I Improve a Piece?", "If no tactic, improve the worst piece.", "Reposition the idle unit.", "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8", "Piece activity"),
    ("Does Their Plan Matter?", "If their plan is slow, ignore it and hit harder.", "Prioritize your own threat.", "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7", "Thinking"),
    ("Is the Ending Good?", "Calculate the pawn ending before the last trade.", "Only trade into a good ending.", "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/4R1K1 w - - 0 18", "Endgame transition"),
    ("Where Do I Want Pieces?", "Dream position first — then find the moves.", "Steer toward the ideal setup.", "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9", "Planning"),
    # Tactical awareness without hope chess
    ("Count Attackers", "Don't 'sac' when you're simply outnumbered.", "Add an attacker or refuse.", "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7", "Calculation"),
    ("Zwischenzug Sense", "Look for an in-between move before recapturing.", "Insert the zwischenzug.", "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", "Tactics"),
    ("Loose Pieces Drop Off", "LPDO — untie loose pieces before inventing art.", "Secure the loose unit.", "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", "Tactics"),
    ("Back Rank Awareness", "Give luft before the combination season.", "Make air for the king.", "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14", "King safety"),
    ("Overloaded Defender", "One piece guarding two targets is a motif.", "Overload the defender.", "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7", "Tactics"),
    # More structure & files
    ("Half-Open File Plan", "Stack on the half-open file against the backward pawn.", "Double on the file.", "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9", "Files"),
    ("Pawn Chain Attack Base", "Attack the base of the pawn chain, not the head.", "Strike the base.", "rnbqkb1r/pp2pppp/2p2n2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4", "Pawn chain"),
    ("Undermining Break", "Undermine their pawn wedge with the right lever.", "Play the undermining break.", "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4", "Breaks"),
    ("Fix Weakness Forever", "Sometimes leave the weakness — they must babysit it.", "Fix, then pile up.", "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9", "Weaknesses"),
    ("Transform Advantage", "Convert one plus into another that's easier to use.", "Transform the imbalance.", "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7", "Conversion"),
    # Practical intermediate
    ("Clock & Clarity", "When unsure, improve king safety and piece harmony.", "Play the clarifying improving move.", "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7", "Practical"),
    ("Don't Panic Equalize", "Being a bit worse is fine — don't force a bad trade.", "Hold with a solid move.", "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7", "Defense"),
    ("Initiative Retention", "After a gain, keep asking questions of their position.", "Maintain the initiative.", "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", "Initiative"),
    ("Piece Coordination", "Pieces that protect each other fight harder.", "Coordinate the army.", "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8", "Coordination"),
    ("Quiet Improving Move", "Not every position needs fireworks.", "Find the quiet improvement.", "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10", "Prophylaxis"),
    ("Evaluate Before Moving", "Stop, list imbalances, then move.", "Play toward the main imbalance.", "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9", "Thinking"),
    ("Target the King File", "Open or seize the file pointing at their king.", "Open the attacking file.", "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7", "Attack"),
    ("Central Breakthrough", "When pieces are ready, break the center open.", "Time the central break.", "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7", "Center"),
    ("Sideline Their Bishop", "Blunt their bishop with a pawn chain.", "Blunt the diagonal.", "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 1 5", "Restraint"),
    ("Activate Before Endgame", "Activate every piece before the last trade.", "Activate, then simplify.", "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16", "Endgame transition"),
    # Extra to reach 100 — variety with distinct titles
    ("Imbalance: Open File", "Your open file is a highway — use it.", "Seize and double on the file.", "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14", "Files"),
    ("Imbalance: Bishop Pair", "Open the position for the two bishops.", "Open lines for the bishops.", "r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 7", "Bishop pair"),
    ("Imbalance: Space Clamp", "Squeeze — don't release the bind for nothing.", "Maintain the clamp.", "rnbqkb1r/pp2pp1p/2p2np1/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5", "Space"),
    ("Imbalance: Lead in Time", "Development lead demands opening the game.", "Open while ahead in development.", "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", "Development"),
    ("Imbalance: Better King", "Safer king lets you play for the win elsewhere.", "Use king safety as a plus.", "r1bq1rk1/ppp2ppp/2n2n2/3pp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7", "King safety"),
    ("Amateur Error: Panic Trade", "Trading 'to simplify' can gift them the bishop pair.", "Keep the right pieces.", "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8", "Trades"),
    ("Amateur Error: Pawn Grab", "Poisoned pawns are a Silman favorite trap for amateurs.", "Leave the pawn; develop.", "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", "Hope chess"),
    ("Amateur Error: No Plan", "Moves without a plan are hope chess in slow motion.", "Choose a plan-based move.", "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10", "Planning"),
    ("Amateur Error: Ignore King", "Tactics against an uncastled king beat pretty maneuvers.", "Punish the king in the center.", "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", "King safety"),
    ("Amateur Error: One Idea", "If plan A fails, transform — don't force it.", "Switch to the secondary plan.", "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9", "Planning"),
    ("Outpost Prep", "Create the hole, then occupy it.", "Prepare the outpost square.", "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 0 9", "Outpost"),
    ("Exchange Sac Idea", "Exchange sacs need lasting soft squares, not hope.", "Only if the compensation is clear.", "r1bq1rk1/pp2ppbp/2n2np1/3p4/3P4/2N2NP1/PP2PPBP/R1BQ1RK1 w - - 0 9", "Exchange sac"),
    ("Opposite Bishops Attack", "Opposite bishops favor the attacker with initiative.", "Use the unopposed diagonal.", "r1bq1rk1/ppp2ppp/2n1p3/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 2 7", "Attack"),
    ("Opposite Bishops Drawish?", "Without targets, opposite bishops lean drawish.", "Create a second weakness or hold.", "4r1k1/1pp2ppp/p7/3p4/3P4/2P1b3/PP3PPP/4R1K1 w - - 0 20", "Endgame transition"),
    ("Knight vs Bishop Choice", "Open → bishop; closed → knight. Choose trades accordingly.", "Trade toward your favorable minor.", "r1bq1rk1/pp2ppbp/2np1np1/8/2BNP3/2N1B3/PPP2PPP/R2Q1RK1 w - - 0 9", "Imbalance"),
    ("Rook On Seventh", "A rook on the 7th is worth a pawn (often more).", "Invade the seventh.", "r4rk1/ppp2ppp/2n2n2/3p4/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 14", "Activity"),
    ("Cut Off The King", "In endings, cut the enemy king from the action.", "Cut the king off with the rook.", "4r1k1/1pp2ppp/p1n5/3p4/3P4/2P2N2/PP3PPP/4R1K1 w - - 0 18", "Endgame transition"),
    ("Passed Pawn Push Timing", "Push when pieces support — not as a lone runner.", "Support, then push.", "4r1k1/1pp2ppp/p1n5/3pP3/3P4/2P2N2/PP3PPP/R3R1K1 w - - 0 16", "Passed pawn"),
    ("Prophylaxis: Stop Break", "...c5/...e5/...f5 — stop the one that frees them.", "Prevent the freeing break.", "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10", "Prophylaxis"),
    ("Think For Both Sides", "After your move, play their best reply in your head.", "Choose a move that survives their reply.", "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7", "Thinking"),
    ("Amateur's Mind Review", "Name the imbalance, then play toward it.", "Play the imbalance move.", "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10", "Review"),
    ("Talk Through Imbalances", "Say the imbalances out loud, then choose a plan.", "Play toward the named plus.", "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 7", "Thinking"),
    ("Don't Fear Ghost Threats", "If it isn't a real threat, continue your plan.", "Ignore the fake threat.", "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3", "Thinking"),
    ("Trade Their Best Piece", "Removing their most active piece is a plan.", "Offer the right trade.", "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8", "Trades"),
    ("End the Lesson: Plan First", "Plan first, move second — Silman's amateur cure.", "Choose the planned move.", "r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1B3/PPP1BPPP/R2Q1RK1 w - - 0 10", "Planning"),
]

# —— Dvoretsky-style advanced endgames (100) ——
DVORETSKY_SPECS = [
    # King & pawn / opposition / corresponding squares
    ("Distant Opposition", "Distant opposition decides who owns the key squares.", "Take distant opposition.", "8/8/8/8/3k4/8/8/3K4 w - - 0 1", "Opposition"),
    ("Close Opposition Win", "With the move, seize close opposition and invade.", "Take the opposition.", "8/8/8/3k4/8/8/3K4/8 w - - 0 1", "Opposition"),
    ("Key Squares Classic", "Occupy a key square in front of the pawn.", "Go to the key square.", "8/8/8/3k4/8/3P4/8/3K4 w - - 0 1", "Key squares"),
    ("Shouldering Out", "Shoulder the enemy king away from the passer.", "Shoulder the king.", "8/8/4k3/8/3PK3/8/8/8 w - - 0 1", "Shouldering"),
    ("Outflanking", "When opposition is held, outflank around.", "Outflank the king.", "8/8/8/3k4/8/8/3K4/8 w - - 0 1", "Outflanking"),
    ("Protected Passer Rule", "A protected passer freezes their king — use that.", "Use the protected passer.", "8/8/3k4/3P4/3P4/8/8/3K4 w - - 0 1", "Passed pawn"),
    ("Outside Passer Decoy", "Decoy their king with the outside passer.", "Push the outside passer.", "8/8/8/1P1k4/8/8/3K4/8 w - - 0 1", "Outside passer"),
    ("Pawn Race Tempo", "Count tempi precisely — one tempo is the game.", "Win the race by a tempo.", "8/5p2/8/8/8/4P3/8/4k1K1 w - - 0 1", "Pawn race"),
    ("Corresponding Squares Intro", "Some squares correspond — step onto the right one.", "Take the corresponding square.", "8/8/8/3k4/8/8/2K5/8 w - - 0 1", "Corresponding squares"),
    ("Triangulation Idea", "Lose a tempo on purpose to pass the move.", "Triangulate.", "8/8/3k4/8/3K4/8/8/8 w - - 0 1", "Triangulation"),
    # Rook endings fundamentals (theoretical)
    ("Philidor Setup", "Third-rank defense: wait, then check from behind.", "Set up Philidor.", "8/8/8/4pk2/8/8/4R3/4K3 w - - 0 1", "Philidor"),
    ("Philidor Break Check", "When the pawn reaches 6th, check from the rear.", "Check from behind.", "4R3/8/8/4pk2/8/8/8/4K3 w - - 0 1", "Philidor"),
    ("Lucena Bridge Prep", "Build the bridge — shelter the king from checks.", "Prepare the Lucena bridge.", "1K6/1P6/8/3k4/8/8/8/1R6 w - - 0 1", "Lucena"),
    ("Lucena Bridge Built", "Interpose the rook to stop the checks.", "Build/bridge with the rook.", "1K6/1P6/2R5/3k4/8/8/8/8 w - - 0 1", "Lucena"),
    ("Vancura Defense Idea", "Side checks + attack the pawn from the flank.", "Start Vancura ideas.", "8/8/8/P7/8/2k5/8/R3K3 w - - 0 1", "Vancura"),
    ("Short Side Defense", "King to the short side; rook checks from the long.", "King to short side.", "8/8/8/4pk2/8/8/4R3/4K3 w - - 0 1", "Rook ending"),
    ("Frontal Checks", "Frontal checks work when the pawn is far enough.", "Check from the front.", "8/4k3/4P3/8/8/8/8/4R1K1 w - - 0 1", "Rook ending"),
    ("Rook Behind Passer Own", "Rook behind your passer — Tarrasch.", "Rook behind the passer.", "8/8/8/3P4/8/8/4k3/3R2K1 w - - 0 1", "Tarrasch"),
    ("Rook Behind Passer Enemy", "Rook behind their passer to restrain it.", "Get behind their passer.", "8/8/3p4/8/8/8/3k4/R5K1 w - - 0 1", "Restraint"),
    ("Active Rook vs Passive", "Activity beats a pawn in many rook endings.", "Activate the rook.", "8/5pk1/4r1p1/8/8/5P2/6P1/4R1K1 w - - 0 1", "Activity"),
    ("Cut Off Along Rank", "Cut the king along a rank/file forever.", "Cut the king off.", "8/8/8/4k3/8/8/8/3R2K1 w - - 0 1", "Cut-off"),
    ("Rook Ending Check Dance", "Series of checks to improve or force a draw.", "Check to improve.", "8/5pk1/6p1/8/8/5P2/6P1/4R1K1 w - - 0 1", "Checks"),
    ("Passed Pawn + Rook", "Advance when the rook supports from behind.", "Support and push.", "8/8/8/3P4/8/3R4/4k3/6K1 w - - 0 1", "Passed pawn"),
    ("Two Pawns vs Rook Care", "Connected pawns can beat a rook — calculate.", "Advance with care.", "8/8/8/3PP3/8/8/8/3k2K1 w - - 0 1", "Pawns vs rook"),
    ("R+P vs R Theoretical", "Know the drawing zone vs winning zone.", "Play the theoretical move.", "8/8/4pk2/8/8/8/4R3/4K3 w - - 0 1", "Theory"),
    # Minor piece endings
    ("Bishop Same Color Win", "Wrong corner? Check the bishop's color vs rook pawn.", "Drive to the right corner.", "8/8/8/3k4/8/8/3B4/3K4 w - - 0 1", "Bishop ending"),
    ("Wrong Rook Pawn", "Bishop that doesn't control the promotion square = draw.", "Recognize the draw.", "8/8/8/8/7P/8/6B1/4k2K w - - 0 1", "Wrong bishop", "draw"),
    ("Bishop vs Knight Closed", "Closed → knight; open diagonals → bishop.", "Play to your minor's strength.", "8/8/3k4/3n4/3B4/8/8/3K4 w - - 0 1", "Minor pieces"),
    ("Knight Fork Net", "Knights need outposts and short-range tactics.", "Use the fork net.", "8/8/3k4/8/3N4/8/8/3K4 w - - 0 1", "Knight"),
    ("Two Bishops Mate Net", "Coordinate bishops to shrink the box.", "Shrink the king's box.", "8/8/8/3k4/8/8/2B5/1B1K4 w - - 0 1", "Two bishops"),
    ("Bishop + Knight Mate Idea", "Drive to the right corner (bishop's color).", "Drive toward the key corner.", "8/8/8/3k4/8/8/2BN4/3K4 w - - 0 1", "B+N mate"),
    ("Good Knight Outpost Ending", "An immortal outpost knight dominates.", "Plant/use the outpost.", "8/8/3k1n2/8/3N4/8/8/3K4 w - - 0 1", "Outpost"),
    ("Opposite Bishops Fortress", "Opposite bishops: blockade on your color.", "Set up the fortress blockade.", "8/8/3k4/4b3/3B4/8/8/3K4 w - - 0 1", "Fortress", "draw"),
    ("Same-Color Bishop Breakthrough", "Create a second weakness for same-color bishops.", "Create the second front.", "8/8/3k4/8/3B4/8/3P4/3K4 w - - 0 1", "Bishop ending"),
    ("Knight vs Passer", "Knight stops a passer from the front/side carefully.", "Stop the passer correctly.", "8/8/3k4/3P4/8/8/4N3/3K4 w - - 0 1", "Knight"),
    # Queen endings
    ("Queen Centralize", "Centralize the queen for checks and forks.", "Centralize the queen.", "8/8/4k3/8/8/8/3Q4/3K4 w - - 0 1", "Queen ending"),
    ("Perpetual Check Idea", "When losing, hunt perpetual checks.", "Find the perpetual path.", "8/5pk1/6p1/8/8/8/5Q2/6K1 w - - 0 1", "Perpetual", "draw"),
    ("Queen vs Passer", "Queen stops passers from behind with checks.", "Check and restrain.", "8/8/3k4/3P4/8/8/3Q4/3K4 w - - 0 1", "Queen ending"),
    ("Q+P vs Q Bridge", "Shelter the king from endless checks.", "Shelter from checks.", "8/3Q4/1P6/8/8/4k3/8/3K4 w - - 0 1", "Queen ending"),
    ("Skewer Net", "Align king and queen for a skewer.", "Set the skewer.", "8/8/4k3/8/8/8/3Q4/3K4 w - - 0 1", "Skewer"),
    # Complex rook / theoretical
    ("Rook Ending: Activity First", "Give a pawn for activity if needed.", "Activate even at pawn cost.", "8/5pk1/4r1pp/8/8/5PPP/8/4R1K1 w - - 0 1", "Activity"),
    ("Rook Ending: Passer Creation", "Create a passer before random checks.", "Create the passer.", "8/5pk1/6pp/8/8/5PPP/4R3/6K1 w - - 0 1", "Passed pawn"),
    ("Rook Ending: King Activate", "King belongs in the fight in rook endings.", "Activate the king.", "8/5pk1/6p1/8/8/5P2/6P1/4R1K1 w - - 0 1", "King activity"),
    ("Rook Ending: Trade Decision", "Rook trades change the evaluation completely.", "Only trade into a win.", "8/5pk1/4r1p1/8/8/5P2/6P1/4R1K1 w - - 0 1", "Trades"),
    ("Rook Ending: Bridge Defense", "Know when Lucena is reachable.", "Head for Lucena.", "1K6/1P6/8/8/3k4/8/8/1R6 w - - 0 1", "Lucena"),
    ("Rook Ending: Philidor Save", "Know when Philidor holds.", "Hold with Philidor.", "8/8/8/4pk2/8/8/4R3/4K3 w - - 0 1", "Philidor", "draw"),
    ("Frontal Defense Zone", "Know the checking distance for frontal defense.", "Keep checking distance.", "8/4k3/4P3/8/8/8/4R3/6K1 w - - 0 1", "Theory"),
    ("Side Checks Long Side", "Checks from the long side need distance.", "Check from far away.", "8/8/8/4pk2/8/8/8/R3K3 w - - 0 1", "Checks"),
    ("Umbrella Technique", "Use a pawn as an umbrella against checks.", "Use the umbrella.", "8/8/1P6/8/8/3k4/8/1R1K4 w - - 0 1", "Technique"),
    ("Bodycheck in Rook Ending", "Shoulder in rook endings too.", "Bodycheck the king.", "8/8/3k4/3P4/8/8/3R4/3K4 w - - 0 1", "Shouldering"),
    # Advanced pawn play
    ("Breakthrough Classic Shape", "The sacrificial breakthrough motif.", "Breakthrough now.", "8/8/5p2/5P2/5P2/8/8/4k1K1 w - - 0 1", "Breakthrough"),
    ("Protected Passer Freeze", "Their king must watch — invade the other wing.", "Invade the other wing.", "8/8/3k4/3P4/2P5/8/8/3K4 w - - 0 1", "Passed pawn"),
    ("Connected Passers March", "Connected passers on the 6th are huge.", "Advance the pair.", "8/8/3PP3/8/8/3k4/8/3K4 w - - 0 1", "Connected passers"),
    ("Split Passers", "Two split passers stretch the defense.", "Advance the farther one.", "8/8/8/P3k3/8/8/3K4/7P w - - 0 1", "Split passers"),
    ("Rook Pawn Exceptions", "Rook pawns change key-square geometry.", "Apply rook-pawn rules.", "8/8/8/7k/8/7P/8/6K1 w - - 0 1", "Rook pawn"),
    ("Stalemate Trick Save", "Stalemate resources save 'lost' endings.", "Use the stalemate resource.", "8/8/8/8/8/7k/7P/6K1 w - - 0 1", "Stalemate", "draw"),
    ("Fortress: Knight Holds", "Some knight fortresses hold vs extra material.", "Set up/recognize the fortress.", "8/8/3k4/8/3N4/8/8/3K4 w - - 0 1", "Fortress", "draw"),
    ("Fortress: Bishop Holds", "Wrong-color blockade can be unbreakable.", "Hold the fortress.", "8/8/3k4/4b3/3B4/8/8/3K4 w - - 0 1", "Fortress", "draw"),
    ("Zugzwang Net", "Put them in zugzwang — every move loses.", "Force zugzwang.", "8/8/3k4/8/3K4/8/8/8 w - - 0 1", "Zugzwang"),
    ("Reserve Tempo", "A spare pawn tempo wins opposition fights.", "Use the reserve tempo.", "8/8/3k4/3p4/3P4/8/8/3K4 w - - 0 1", "Tempi"),
    # Mixed technical
    ("R+B vs R Care", "Philidor-type defenses appear in R+B vs R too.", "Play precise checks/defense.", "8/8/3k4/8/3B4/8/3R4/3K4 w - - 0 1", "Technical"),
    ("R+N vs R", "Coordinate knight forks with rook cuts.", "Coordinate R+N.", "8/8/3k4/8/3N4/8/3R4/3K4 w - - 0 1", "Technical"),
    ("Q vs R+P", "Know the winning methods and fortress tries.", "Break/avoid the fortress.", "8/8/3k4/3p4/8/8/3Q4/3K4 w - - 0 1", "Queen vs rook"),
    ("Q vs R Theoretical", "Queen wins most R endings — avoid perpetual.", "Avoid the perpetual; convert.", "8/8/4k3/8/8/8/3Q4/3K4 w - - 0 1", "Queen vs rook"),
    ("Two Rooks Mate Net", "Ladder or box with two rooks.", "Ladder mate pattern.", "8/8/8/4k3/8/8/3R4/2R1K3 w - - 0 1", "Two rooks"),
    ("Rook vs Minor Precise", "Rook usually wins — but fortresses exist.", "Break the fortress carefully.", "8/8/3k4/3n4/8/8/3R4/3K4 w - - 0 1", "Rook vs knight"),
    ("Bishop Pair vs Rook", "Two bishops can fight a rook.", "Coordinate the bishops.", "8/8/3k4/8/8/8/2B5/1B1K4 w - - 0 1", "Bishops vs rook"),
    ("Converted Advantage", "Technique: no counterplay, then push.", "Remove counterplay first.", "8/5pk1/6p1/8/8/5P2/6P1/4R1K1 w - - 0 1", "Technique"),
    ("Calculate Forcing First", "Checks, captures, threats — in that order.", "Start with forcing moves.", "8/5pk1/6p1/8/8/5Q2/6P1/6K1 w - - 0 1", "Calculation"),
    ("Endgame Transition Skill", "Before the last trade, evaluate the pawn ending.", "Only trade if the ending wins.", "4r1k1/1pp2ppp/p7/3p4/3P4/2P5/PP3PPP/4R1K1 w - - 0 20", "Transition"),
    # More rook theory flavored
    ("Lucena: King Out", "King steps out to build the bridge.", "Step the king out.", "1K6/1P6/8/8/4k3/8/8/1R6 w - - 0 1", "Lucena"),
    ("Philidor: Passive Rook", "Keep the rook on the 3rd until the pawn arrives.", "Hold the third rank.", "8/8/8/4pk2/8/4R3/8/4K3 w - - 0 1", "Philidor", "draw"),
    ("Vancura: Lateral Attack", "Attack the pawn laterally while checking.", "Lateral attack + checks.", "8/8/8/P7/8/8/2k5/R3K3 w - - 0 1", "Vancura"),
    ("Checking Distance", "Maintain the checking distance or lose it forever.", "Keep distance.", "8/4k3/4P3/8/8/8/8/4R1K1 w - - 0 1", "Theory"),
    ("Rook Ahead of Passer", "Sometimes ahead is right — know the exception.", "Choose the correct rook post.", "8/8/8/3P4/8/8/4R3/3k2K1 w - - 0 1", "Tarrasch"),
    ("King And Rook Mate Net", "Box the king with king + rook.", "Shrink the box.", "8/8/8/4k3/8/8/8/3RK3 w - - 0 1", "Basic mate"),
    ("Opposition + Rook", "Combine opposition ideas with rook cuts.", "Cut and oppose.", "8/8/4k3/8/8/8/3R4/3K4 w - - 0 1", "Technique"),
    ("Pawn Ending Liquidation", "Force a pawn ending you have calculated.", "Force the winning liquidation.", "8/5pk1/6p1/8/8/5P2/6P1/6K1 w - - 0 1", "Pawn ending"),
    ("Space Zugzwang", "Squeeze until they run out of pawn moves.", "Squeeze into zugzwang.", "8/8/3k4/3p4/3P4/8/8/3K4 w - - 0 1", "Zugzwang"),
    ("Active King Ending", "In pure pawn endings, the king is an attacker.", "Activate the king.", "8/8/8/3k4/8/8/3K4/8 w - - 0 1", "King activity"),
    # Final stretch
    ("Theoretical Draw Save", "Recognize the known drawing setup.", "Head for the known draw.", "8/8/8/4pk2/8/8/4R3/4K3 w - - 0 1", "Theory", "draw"),
    ("Theoretical Win Convert", "Recognize the known winning setup.", "Head for the known win.", "1K6/1P6/8/3k4/8/8/8/1R6 w - - 0 1", "Theory"),
    ("Avoid Stalemate Win", "Leave them a legal move when mating/promoting.", "Avoid accidental stalemate.", "8/8/8/8/8/5Q2/7k/5K2 w - - 0 1", "Stalemate"),
    ("Quiet Tempo Move", "A waiting move can be the only win.", "Play the waiting move.", "8/8/3k4/8/3K4/8/8/8 w - - 0 1", "Tempi"),
    ("Cross-Check Idea", "Answer a check with a check that gains time.", "Find the cross-check.", "8/5pk1/6p1/8/8/5Q2/6P1/6K1 w - - 0 1", "Checks"),
    ("Domination Motif", "Dominate a piece so it has no safe squares.", "Dominate the piece.", "8/8/3k4/3n4/3N4/8/8/3K4 w - - 0 1", "Domination"),
    ("Interference Idea", "Interfere with a defensive line.", "Interfere.", "8/8/3k4/8/3B4/8/3R4/3K4 w - - 0 1", "Interference"),
    ("Deflection In Ending", "Deflect the defender of a key square.", "Deflect the defender.", "8/8/4k3/8/8/8/3Q4/3K4 w - - 0 1", "Deflection"),
    ("Clearance Sacrifice", "Clear a square/line with a tempo sac.", "Clear the line.", "8/8/4k3/8/8/8/3R4/3K4 w - - 0 1", "Clearance"),
    ("Endgame Calculation Tree", "Force lines first; then quiet moves.", "Calculate the forcing line.", "8/5pk1/6p1/8/8/5P2/6P1/4R1K1 w - - 0 1", "Calculation"),
    ("Dvoretsky Review: Lucena", "Bridge technique under check fire.", "Build the bridge.", "1K6/1P6/2R5/8/4k3/8/8/8 w - - 0 1", "Lucena"),
    ("Dvoretsky Review: Philidor", "Third rank then rear checks.", "Hold Philidor.", "8/8/8/4pk2/8/4R3/8/4K3 w - - 0 1", "Philidor", "draw"),
    ("Dvoretsky Review: Opposition", "Opposition as a weapon, not a slogan.", "Take opposition.", "8/8/8/3k4/8/8/3K4/8 w - - 0 1", "Opposition"),
    ("Dvoretsky Review: Activity", "Rook activity over pawn counting.", "Activate the rook.", "8/5pk1/4r1p1/8/8/5P2/6P1/4R1K1 w - - 0 1", "Activity"),
    ("Course Finale · Technique", "Combine cut-off, activity, and calculation.", "Play the technical win.", "8/5pk1/6p1/8/8/5P2/4R1P1/6K1 w - - 0 1", "Review"),
    ("Corresponding Squares Drill", "Step on the square that mirrors theirs.", "Take the corresponding square.", "8/8/8/4k3/8/8/3K4/8 w - - 0 1", "Corresponding squares"),
    ("Rook Ending: Seventh Rank", "Invade the 7th and harvest pawns.", "Invade the seventh.", "8/5pk1/6p1/8/8/5P2/6P1/4R1K1 w - - 0 1", "Activity"),
    ("Pawn Ending: Opposition Win", "Opposition plus outflanking converts.", "Seize and invade.", "8/8/3k4/8/3K4/8/3P4/8 w - - 0 1", "Opposition"),
    ("Minor Piece: Domination", "Take away the knight's flight squares.", "Dominate the knight.", "8/8/3k4/4n3/3N4/8/8/3K4 w - - 0 1", "Domination"),
    ("Manual Finale · Precision", "Precision over hope — calculate the win.", "Play the precise winning move.", "8/5pk1/6p1/8/8/5PPP/8/4R1K1 w - - 0 1", "Review"),
]


def expand(specs, factory, start_n):
    out = []
    for i, spec in enumerate(specs):
        if len(spec) == 5:
            title, teach, hint, fen, theme = spec
            goal = "win"
        else:
            title, teach, hint, fen, theme, goal = spec
        out.append(factory(start_n + i, title, teach, hint, fen, theme, goal))
    return out


def main():
    assert len(AMATEUR_SPECS) == 100, len(AMATEUR_SPECS)
    assert len(DVORETSKY_SPECS) == 100, len(DVORETSKY_SPECS)
    lessons = expand(AMATEUR_SPECS, am, 1) + expand(DVORETSKY_SPECS, dv, 101)
    assert len(lessons) == 200
    # validate all
    bad = [l for l in lessons if not fen_ok(l["fen"])]
    if bad:
        raise SystemExit(f"bad fens: {[(b['n'], b['title'], b['fen']) for b in bad[:10]]}")
    path = ROOT / "lessons-data.json"
    path.write_text(json.dumps(lessons, indent=2) + "\n")
    by = {}
    for l in lessons:
        by[l["book"]] = by.get(l["book"], 0) + 1
    print("OK", len(lessons), by, "->", path)


if __name__ == "__main__":
    main()
