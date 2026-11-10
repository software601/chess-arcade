#!/usr/bin/env python3
"""Generate 300 original chess005 lessons (Structures / Watson / Aagaard)."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent

# —— FEN legality ——
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
        # kings not adjacent
        if abs(wk[0] - bk[0]) <= 1 and abs(wk[1] - bk[1]) <= 1:
            return False
        opp = "b" if turn == "w" else "w"
        ok = find_king(g, opp)
        if is_attacked(g, ok[0], ok[1], turn):
            return False
        return True
    except Exception:
        return False


# Validated middlegame / late-opening FENs (white to move)
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

STRUCT_PITS = [
    "Name the pawn structure before inventing a plan.",
    "Play the typical break for this structure — not a random attack.",
    "Improve the worst piece that belongs in this structure's scheme.",
]
WATSON_PITS = [
    "Modern strategy often prefers dynamics over static 'rules'.",
    "Ask whether the classical prohibition still applies here.",
    "Transform the advantage — don't cling to one obsolete plan.",
]
AAG_PITS = [
    "Calculate forcing moves first: checks, captures, threats.",
    "Compare candidate moves — don't stop at the first idea.",
    "Visualize quietly after the fireworks; one calm move wins many lines.",
]

# (theme, teach_template, hint) — teach gets structure name filled
STRUCTURES = [
    ("IQP", "Isolated queen pawn: piece activity justifies the scar — use open files/diagonals.", "Activate before the IQP bites."),
    ("IQP", "Against IQP: blockade d5, trade pieces, endgame favors you.", "Blockade the isolani."),
    ("Hanging pawns", "Hanging pawns want space and piece support — advance with purpose.", "Support then advance the hangers."),
    ("Hanging pawns", "Vs hanging pawns: pressure and force an unfavorable advance.", "Pressure the hanging duo."),
    ("Carlsbad", "Minority attack: create a queenside weakness, then sit on it.", "Start the minority attack."),
    ("Carlsbad", "Vs minority attack: ...b5 or piece activity in the center/kingside.", "Meet the minority plan."),
    ("Orthodox Exchange", "Same-side minority themes — know who benefits from trades.", "Choose the structure-friendly trade."),
    ("Sicilian Scheveningen", "Classic Sicilian: ...d6/...e6 — prepare ...d5 or queenside play.", "Play the Scheveningen break/plan."),
    ("Sicilian Najdorf", "Najdorf: English Attack or classical — pick a coherent plan.", "Follow the Najdorf scheme."),
    ("Sicilian Dragon", "Dragon: Yugoslav vs positional — open the long diagonal or storm.", "Play the Dragon plan."),
    ("Sicilian Maróczy", "Maróczy bind: restrain ...d5; squeeze with space.", "Maintain the bind."),
    ("Sicilian Maróczy", "Break the Maróczy with timely ...d5/...b5 preparation.", "Prepare the freeing break."),
    ("French Advance", "French Advance: attack the chain base or tip the wedge.", "Strike the pawn chain correctly."),
    ("French Winawer", "Winawer: doubled c-pawns vs bishop pair and dark squares.", "Use the Winawer imbalance."),
    ("French Tarrasch", "Tarrasch IQP/hanging structures — know which side you want.", "Steer into the right French structure."),
    ("KID Classical", "King's Indian: ...f5 storm vs queenside play — race consciously.", "Start the KID plan."),
    ("KID Sämisch", "Sämisch: space and center; Black needs ...c5/...e5 breaks.", "Time the KID break."),
    ("KID Fianchetto", "Fianchetto systems: long diagonal and central restraint.", "Use the fianchetto plan."),
    ("Benoni", "Benoni: queenside majority vs white center — push ...b5 ideas.", "Mobilize the Benoni majority."),
    ("Benko", "Benko: lasting queenside pressure for the pawn.", "Use Benko-file pressure."),
    ("Hedgehog", "Hedgehog: coiled springs — break with ...b5/...d5 when ready.", "Time the Hedgehog break."),
    ("Hedgehog", "Vs Hedgehog: restrain breaks; don't overextend into the coil.", "Restrain the Hedgehog."),
    ("Stonewall", "Stonewall: e4/e5 holes and attacking lanes — own the holes.", "Occupy/control the Stonewall hole."),
    ("Closed Spanish", "Spanish structures: maneuvering, ...d5 breaks, knight tours.", "Play the Spanish maneuver."),
    ("Open Spanish", "Open Spanish: piece play and central tension — calculate the breaks.", "Resolve/maintain Open Spanish tension."),
    ("QGD Tartakower", "Tartakower/QGD: solid structure — improve minors before breaks.", "Improve within the QGD shell."),
    ("Semi-Slav", "Semi-Slav: Meran or anti-Meran — know the pawn levers.", "Play the Semi-Slav lever."),
    ("Slav", "Slav: solid c6; decide between ...dxc4 and holding the center.", "Choose the Slav plan."),
    ("Catalan", "Catalan pressure on the long diagonal — open or keep the bind.", "Use Catalan diagonal pressure."),
    ("English Symmetrical", "Symmetrical English: small edges via better piece placement.", "Improve the English setup."),
    ("English Botvinnik", "Botvinnik English: clamp on d5; kingside space.", "Maintain the Botvinnik clamp."),
    ("d5 Chain", "Pawn chain: attack the base, not only the head.", "Attack the chain base."),
    ("e5 Chain", "Advance chain: tip it or undermine with timely breaks.", "Undermine the e5 wedge."),
    ("Doubled c-pawns", "Doubled c-pawns: open b-file and dark-square play.", "Use the doubled-c imbalance."),
    ("Backward d-pawn", "Backward pawn on open file: pile up or liberate with a break.", "Pressure or free the backward pawn."),
    ("Isolated pair", "Related isolani themes — activity vs long-term weakness.", "Pick activity or restraint."),
    ("Panov structure", "Panov IQP: classic piece play vs the isolani.", "Play the Panov IQP plan."),
    ("Exchange French", "Exchange French: open files and minority ideas.", "Use the open French file."),
    ("Ruy Exchange", "Exchange Spanish: bishop pair vs structure — open when ready.", "Open for the bishop pair."),
    ("Philidor shell", "Cramped but solid: prepare the freeing break carefully.", "Prepare the freeing break."),
    ("Colle/Zukertort", "Colle systems: e4 break and kingside battery.", "Time the e4 break."),
    ("London structure", "London: solid setup — improve pieces, then break.", "Improve then break."),
    ("Trompowsky/Veresov", "Early bishop pin structures — decide whether to keep tension.", "Handle the early pin structure."),
    ("King's Indian Attack", "KIA: automatic kingside plan vs queenside counter.", "Launch the KIA scheme."),
    ("Grand Prix structure", "Sicilian GP: f4–f5 attacking shell.", "Push the GP attack plan."),
    ("Closed Sicilian", "Closed Sicilian: slow kingside build vs ...b5.", "Build or break in Closed Sicilian."),
    ("Accelerated Dragon", "Maróczy vs Accelerated — know the bind plans.", "Play vs/with the Accelerated structure."),
    ("Classical Sicilian", "Classical: ...Be7/...0-0 and thematic ...d5.", "Prepare ...d5."),
    ("4...Nf6 Caro", "Caro-Kann structures: solid vs space — choose the break.", "Play the Caro plan."),
    ("Advance Caro", "Advance Caro: ...c5 and piece pressure on d4.", "Strike with ...c5 ideas."),
]

WATSON = [
    ("Rule skepticism", "Classical rules are guidelines — test them against dynamics.", "Prefer the modern dynamic choice."),
    ("Dynamic vs static", "Static pluses last; dynamics must be cashed now.", "Cash the dynamic chance."),
    ("Exchange sac modern", "Modern exchange sacs buy squares, not just attack.", "Consider the positional exchange sac."),
    ("Exchange sac decline", "Not every exchange sac is sound — calculate returns.", "Decline or refute the sac."),
    ("Prophylaxis modern", "Prevent their only idea, then improve.", "Play the prophylactic move."),
    ("Overprotection update", "Overprotection is rare now — activity usually trumps it.", "Choose activity over ritual overprotection."),
    ("Blockade evolved", "Blockade still matters — but sometimes transform instead.", "Blockade or transform wisely."),
    ("Two bishops modern", "Open when ready; don't wait forever for the 'ideal' moment.", "Open for the bishops."),
    ("Knight outposts", "Outposts remain gold — create and occupy them.", "Claim the outpost."),
    ("Pawn chain myths", "Attacking the base isn't automatic — calculate the timing.", "Time the chain attack."),
    ("Restraint", "Restrain first, attack second — modern Botvinnik echo.", "Restrain their breaks."),
    ("Transformation", "Convert one advantage into an easier one.", "Transform the plus."),
    ("Initiative over material", "A lasting initiative can outweigh a pawn.", "Keep the initiative."),
    ("Material over initiative", "Sometimes just take the pawn and consolidate.", "Grab and consolidate."),
    ("Space with purpose", "Space needs plans; empty space evaporates.", "Use the space (or release correctly)."),
    ("Freeing breaks", "The freeing break is often the whole plan.", "Play/prepare the freeing break."),
    ("Modern center", "Centers can be controlled with pieces, not only pawns.", "Control the center dynamically."),
    ("Hanging pawns modern", "Hanging pawns are tools — advance or restrain with intent.", "Handle hangers modernly."),
    ("IQP modern", "IQP play is more concrete now — calculate the timing.", "Play the concrete IQP move."),
    ("Opposite castling", "Opposite castling: race, but don't forget central breaks.", "Race with a central eye."),
    ("King safety priority", "Unsafe king trumps pretty structure.", "Prioritize king safety."),
    ("Piece trades update", "Trade your worst for their best — still true.", "Offer the right trade."),
    ("Bad bishop modern", "Bad bishops can be useful defenders — evaluate case by case.", "Keep or free the bishop wisely."),
    ("Good knight closed", "Closed positions still love knights.", "Keep the knight vs open bishops."),
    ("Rook lifts", "Rook lifts are modern attacking currency.", "Start the rook lift."),
    ("Quiet improving move", "Not every position needs a tactic — improve.", "Find the quiet improvement."),
    ("Practical conversion", "Remove counterplay before pushing the win.", "Kill counterplay first."),
    ("Psychological modern", "Pose problems; don't play only 'best' if unclear.", "Pose a practical problem."),
    ("Computer-age structures", "Some 'ugly' moves are engine-approved — understand why.", "Play the ugly-but-strong idea."),
    ("Nimzo heritage", "Restraint and blockade live on — in new clothes.", "Apply updated Nimzo ideas."),
    ("Classical exception", "When the classical move fails, find the exception.", "Play the exceptional move."),
    ("Positional sac", "Sac for lasting soft squares, not hope.", "Positional sac only with compensation."),
    ("Color complex", "Dominate a color complex after the right trade.", "Target the soft color."),
    ("Minority ideas", "Minority attack logic appears beyond Carlsbad.", "Create the structural weakness."),
    ("Majority use", "Mobilize your majority before theirs runs.", "Mobilize the majority."),
    ("Passed pawn modern", "Passed pawns need support nets, not lonely runs.", "Support the passer."),
    ("Endgame transition", "Modern players liquidate earlier — calculate first.", "Only liquidate into a plus."),
    ("Prophylaxis vs attack", "Sometimes the best attack starts with a defensive nudge.", "Nudge their plan aside."),
    ("Flexible structures", "Keep pawn options open until information arrives.", "Stay flexible with the structure."),
    ("Committing pawns", "Commit pawns only when the piece setup is ready.", "Commit the pawn now."),
    ("Outpost prep", "Create the hole, then occupy.", "Prepare the outpost."),
    ("Undermining", "Undermine wedges with the right lever.", "Undermine."),
    ("Overextension", "Punish overextended pawns by fixing then attacking.", "Fix and attack the overextension."),
    ("Piece coordination", "Coordination beats lone-wolf brilliance.", "Coordinate the army."),
    ("Second weakness", "One weakness is holdable — create a second.", "Open the second front."),
    ("Modern defense", "Active defense and counterbreaks beat pure passivity.", "Defend actively."),
    ("Initiative retention", "After a gain, keep asking questions.", "Maintain the initiative."),
    ("Evaluation skill", "Update your eval after every structural change.", "Play to the new evaluation."),
    ("Plan hierarchy", "Main plan, backup plan — switch without ego.", "Switch to the backup plan."),
    ("Watson review", "Test the classical rule; play the modern truth.", "Play the modern choice."),
]

AAGAARD = [
    ("Candidate moves", "List candidates before calculating any line deeply.", "Compare candidates; pick one."),
    ("Forcing first", "Checks, captures, threats — force the tree down.", "Start with the forcing move."),
    ("Quiet after tactics", "After the fireworks, the quiet consolidating move wins.", "Find the quiet follow-up."),
    ("Between-move vision", "See the position after the sequence — not only the first check.", "Visualize the resulting position."),
    ("Elimination method", "Refute all but one candidate.", "Eliminate the inferior tries."),
    ("Comparison method", "Same idea, different move order — compare.", "Pick the better move order."),
    ("Depth control", "Calculate as deep as the position demands — no less.", "Go one ply deeper."),
    ("Stop condition", "Know when a line is enough — then choose.", "Stop and choose."),
    ("Tactical seed", "Spot the motif, then calculate cleanly.", "Execute the motif."),
    ("Deflection calc", "Deflect the key defender — check all replies.", "Deflect and calculate."),
    ("Decoy calc", "Decoy onto a fatal square.", "Decoy the piece."),
    ("Clearance calc", "Clear the line/square with tempo.", "Clear with tempo."),
    ("Interference calc", "Interfere with a defensive connection.", "Interfere."),
    ("Overloaded defender", "One piece, two jobs — overload it.", "Overload the defender."),
    ("Pin calculation", "Absolute vs relative pins change the tree.", "Use/break the pin correctly."),
    ("Skewer lines", "Align valuables on a line.", "Set the skewer."),
    ("Fork net", "Knight forks need flight-square control.", "Net the fork."),
    ("Discovered threats", "Discoveries multiply forcing options.", "Play the discovery."),
    ("Zwischenzug", "Insert the in-between move before recapturing.", "Insert the zwischenzug."),
    ("Desperado", "Desperate piece sells itself for max value.", "Find the desperado."),
    ("Attraction", "Attract the king/piece into a mating net.", "Attract into the net."),
    ("Windmill sense", "Repeating discoveries — calculate the exit.", "Ride/exit the windmill."),
    ("Back-rank calc", "Back-rank motifs need luft calculation.", "Use or avoid the back rank."),
    ("Mating net build", "Build the net before the final check.", "Build the mating net."),
    ("Perpetual hunt", "When losing, calculate perpetual paths.", "Hunt the perpetual."),
    ("Sacrifice precision", "Sac only with a calculated continuum.", "Sac with a continuum."),
    ("Refutation alert", "Your idea fails to one resource — find it (as them).", "Find the refutation resource."),
    ("Prophylactic calc", "Calculate their only counter before committing.", "Include their counter in the tree."),
    ("Endgame calc", "Endgame calculation is forcing too — tempi count.", "Calculate the tempi."),
    ("Pawn race calc", "Count races without moving the pieces.", "Win the race count."),
    ("King walk calc", "King marches need safety checks each ply.", "Walk the king safely."),
    ("Quiet killer", "The non-check that ends resistance.", "Play the quiet killer."),
    ("Double attack", "Two threats, one move.", "Create the double attack."),
    ("Trap setting", "Calculate the bait and the escape.", "Set a sound trap."),
    ("Trap avoiding", "See the bait — decline.", "Avoid the trap."),
    ("Calculation stamina", "Long lines: write the spine in your head.", "Hold the long line."),
    ("Reset visualization", "If lost in the tree, reset to the root position.", "Reset and recalc."),
    ("Priority of force", "Force before fancy.", "Prefer the forcing line."),
    ("Safety check", "Before the brilliancy, check you aren't mated.", "Safety-check first."),
    ("Material count mid-line", "Track material after each capture in the tree.", "Keep the material tally."),
    ("Square color awareness", "Bishop nets care about colors — track them.", "Track the color complex."),
    ("Flight squares", "Cover flights before the final blow.", "Cover the flight squares."),
    ("Intermezzo defense", "Defensive zwischenzugs break attacker's tree.", "Find the defensive intermezzo."),
    ("Only-move sense", "Some positions have one move — find it.", "Find the only move."),
    ("Engine-free method", "Human method: candidates → force → compare.", "Apply the method."),
    ("Attack ratio", "Count attackers vs defenders honestly.", "Only strike if the ratio works."),
    ("Defense ratio", "Add a defender or exchange an attacker.", "Fix the defensive ratio."),
    ("Line switch", "If line A fails, switch — don't force it.", "Switch calculation lines."),
    ("Final check habit", "Blunder-check the intended move.", "Blunder-check, then play."),
    ("Aagaard review", "Candidates, forcing moves, quiet conversion.", "Calculate like a GM prep session."),
]


def make_lesson(n, book, title, teach, hint, fen, theme, about, desc, pitfalls, goal="win"):
    assert fen_ok(fen), (n, title, fen)
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


def build_book(book, label, themes, pitfalls, start_n, style_note):
    out = []
    for i in range(100):
        theme, teach, hint = themes[i % len(themes)]
        fen = FENS[(i * 3 + start_n) % len(FENS)]
        # Unique-ish titles
        title = f"{theme} ({i % len(themes) + 1})" if i >= len(themes) else theme
        if i >= len(themes):
            title = f"{theme} · Drill {i // len(themes) + 1}"
        else:
            # first pass: more specific titles
            title = f"{theme}" if themes.count(themes[i]) == 1 else f"{theme} ({sum(1 for j in range(i+1) if themes[j][0]==theme)})"
        # Better titles for first occurrence series
        title = f"{theme}" if i < len(themes) else f"{theme} · {i - len(themes) + 2}"
        # Disambiguate duplicates within first 50 of structures which has 50 unique themes
        if book == "structures" and i < len(STRUCTURES):
            title = f"{theme}"
            # if same theme appears twice consecutively in list, number them
            prev_same = sum(1 for j in range(i) if STRUCTURES[j][0] == theme)
            if prev_same or (i + 1 < len(STRUCTURES) and STRUCTURES[i + 1][0] == theme) or any(STRUCTURES[j][0] == theme for j in range(i)):
                title = f"{theme} ({prev_same + 1})"
        elif book == "watson":
            title = theme if i < 50 else f"{theme} · {i - 49}"
        elif book == "aagaard":
            title = theme if i < 50 else f"{theme} · {i - 49}"

        out.append(
            make_lesson(
                start_n + i,
                book,
                title,
                teach,
                hint,
                fen,
                theme,
                f"{theme} — {label}.",
                f"{teach} {style_note}",
                pitfalls,
            )
        )
    return out


def main():
    # Fix structure titles more carefully
    lessons = []
    # Structures 1-100
    for i in range(100):
        theme, teach, hint = STRUCTURES[i % len(STRUCTURES)]
        fen = FENS[(i * 2) % len(FENS)]
        count = sum(1 for j in range(i + 1) if STRUCTURES[j % len(STRUCTURES)][0] == theme and j % len(STRUCTURES) == i % len(STRUCTURES))
        # occurrence index among same theme in full 100
        occ = sum(1 for j in range(i + 1) if STRUCTURES[j % len(STRUCTURES)][0] == theme)
        total_theme = sum(1 for j in range(100) if STRUCTURES[j % len(STRUCTURES)][0] == theme)
        title = theme if total_theme == 1 else f"{theme} ({occ})"
        lessons.append(
            make_lesson(
                1 + i,
                "structures",
                title,
                teach,
                hint,
                fen,
                theme,
                f"{theme} — Flores Rios–style structure plan.",
                f"{teach} Prefer the typical plan for this pawn structure. "
                f"(Chess Structures–style · advanced ≈1700–2200)",
                STRUCT_PITS,
            )
        )
    # Watson 101-200
    for i in range(100):
        theme, teach, hint = WATSON[i % len(WATSON)]
        fen = FENS[(i * 3 + 7) % len(FENS)]
        occ = sum(1 for j in range(i + 1) if WATSON[j % len(WATSON)][0] == theme)
        total_theme = sum(1 for j in range(100) if WATSON[j % len(WATSON)][0] == theme)
        title = theme if total_theme == 1 else f"{theme} ({occ})"
        lessons.append(
            make_lesson(
                101 + i,
                "watson",
                title,
                teach,
                hint,
                fen,
                theme,
                f"{theme} — Watson-style modern strategy.",
                f"{teach} Update classical dogma with concrete modern play. "
                f"(Secrets of Modern Chess Strategy–style · ≈1800+)",
                WATSON_PITS,
            )
        )
    # Aagaard 201-300
    for i in range(100):
        theme, teach, hint = AAGAARD[i % len(AAGAARD)]
        fen = FENS[(i * 5 + 11) % len(FENS)]
        occ = sum(1 for j in range(i + 1) if AAGAARD[j % len(AAGAARD)][0] == theme)
        total_theme = sum(1 for j in range(100) if AAGAARD[j % len(AAGAARD)][0] == theme)
        title = theme if total_theme == 1 else f"{theme} ({occ})"
        lessons.append(
            make_lesson(
                201 + i,
                "aagaard",
                title,
                teach,
                hint,
                fen,
                theme,
                f"{theme} — Aagaard-style calculation drill.",
                f"{teach} Train calculation method, not hope. "
                f"(Grandmaster Preparation: Calculation–style · ≈1800–2300)",
                AAG_PITS,
            )
        )

    assert len(lessons) == 300
    by = {}
    for L in lessons:
        by[L["book"]] = by.get(L["book"], 0) + 1
    assert by == {"structures": 100, "watson": 100, "aagaard": 100}, by
    path = ROOT / "lessons-data.json"
    path.write_text(json.dumps(lessons, indent=2) + "\n")
    print("OK", len(lessons), by, "fens", len(FENS), "->", path)


if __name__ == "__main__":
    main()
