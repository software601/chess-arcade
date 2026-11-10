#!/usr/bin/env python3
"""Generate 300 chess007 lessons (Gelfand / Mueller / Naroditsky). No pitfalls; richer descriptions."""
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
