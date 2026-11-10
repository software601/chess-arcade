#!/usr/bin/env python3
"""Generate 300 chess008 lessons (Dvoretsky Resources / Aagaard Strategic / Analytical Manual)."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ns: dict = {"__file__": str(ROOT / "gen-lessons.py"), "__name__": "g8"}
exec(compile((ROOT / "_fen_header.py").read_text(), "_fen_header.py", "exec"), ns, ns)
fen_ok = ns["fen_ok"]
FENS = ns["FENS"]


def T(theme, teach, hint, desc):
    return (theme, teach, hint, desc)


# Recognizing Your Opponent's Resources — prophylaxis & their resources
RESOURCES = [
    T("See their threats", "Before your idea, list every serious threat they have.", "Name their threat first.",
      "Dvoretsky's Resources training starts with a brutal habit: before calculating your combination, list their resources — checks, captures, threats, and quiet spoiling moves. Many 'wins' die to one unseen reply. On this board, name their strongest idea first, then choose a move that survives it."),
    T("Prophylaxis move", "A move that stops their only plan can be best.", "Play the prophylactic move.",
      "Pure prophylaxis is not cowardice — it is high-level calculation of their intentions. Identify the one plan that keeps them in the game and spoil it a tempo early. The resulting position should leave you free to improve without allowing counterplay."),
    T("Zwischenzug resource", "Expect in-between checks and captures in their defence.", "Account for the zwischenzug.",
      "Opponent resources often arrive as zwischenzugs: a check or capture inserted before the 'forced' recapture. Build that branch into your tree. If your line collapses to an intermezzo, it was never sound."),
    T("Quiet spoiler", "Their best resource may be a quiet move, not a check.", "Find/stop the quiet resource.",
      "Amateurs overestimate checks and underestimate quiet defensive moves — a knight retreat, a king step, a pawn nudge that kills your net. Dvoretsky drills that quiet resource. Include it among their candidates."),
    T("Only-move defence", "Sometimes they have one saving move — find it as them.", "Find their only save.",
      "Training method: sit in their chair and hunt the only defence. If you cannot find it, you are not ready to play the attacking move. Recognizing resources means recognising their saves as well as their threats."),
    T("Counter-sacrifice", "Expect them to sac back to break your attack.", "Calculate the counter-sac.",
      "A common resource against an attack is a counter-sacrifice that simplifies or seizes the initiative. Add that branch. If the counter-sac draws or wins for them, revise your plan."),
    T("Perpetual resource", "Losing sides fish for perpetual — calculate it honestly.", "Prevent or allow perpetual correctly.",
      "When you are winning, their resource is often perpetual check. When you are losing, it is your resource. Either way, calculate the checking loop fully before claiming a win or resigning the defence."),
    T("Stalemate trick", "Stalemate is a defensive resource in technical wins.", "Avoid/use the stalemate resource.",
      "Converting sides must leave the opponent a legal move; defending sides should fish for stalemate nets. Dvoretsky-level technique includes this 'cheap' resource because it scores half-points at the highest level."),
    T("Desperado", "A trapped piece may sell itself for maximum damage.", "Account for the desperado.",
      "Desperado resources change material tallies mid-combination. Before you 'win a piece', ask whether it can capture something vital on the way out. Update the leaf evaluation accordingly."),
    T("Back-rank resource", "Back-rank mates cut both ways — see theirs and yours.", "Handle the back-rank resource.",
      "Many brilliant attacks fail to a back-rank counterblow. Give yourself luft when needed, and look for their back-rank weakness when calculating. Resources cut both directions."),
    T("Interference defence", "They may interfere with your line using a sac or pawn.", "See the interference resource.",
      "Interference is a classic defensive (and attacking) resource. A piece or pawn lands on a critical line and your combination evaporates. Put interference on their candidate list."),
    T("Deflection alert", "Your defender may be deflected — or you can deflect theirs.", "Watch deflection resources.",
      "Overloaded defenders are resources waiting to be used — by either side. Ask who is overloaded. If you are, reinforce; if they are, deflect."),
    T("Pin as resource", "Absolute and relative pins change what is 'legal' in the tree.", "Use/break the pin resource.",
      "A pin is both your weapon and their shield. Relative pins can still move with calculation; absolute pins cannot. Treat pin status as part of resource recognition each ply."),
    T("Flight squares", "Cover flights before the mating net; they will run.", "Cover the flight square.",
      "Kings escape through flight squares you forgot to cover. Before the final check, ask where they run. Prophylaxis against flight is high-level finishing technique."),
    T("King walk resource", "Their king may walk out of the net — calculate the path.", "Stop the king walk.",
      "Sometimes the resource is simply walking the king to safety. Calculate the escape path as carefully as the attack. If the walk works, your combination needs an inclusion."),
    T("Exchange sac defence", "They may sac the exchange to kill your attack.", "Judge the defensive exchange sac.",
      "Defensive exchange sacrifices are elite resources: give a rook for a minor piece that holds forever. Evaluate the resulting fortress honestly before continuing to 'attack'."),
    T("Simplification resource", "Trading queens can be their path to a draw.", "Decide on queen trades.",
      "When you attack, their resource is often a queen trade into a holdable ending. When you defend, it may be yours. Calculate the ending before allowing or forcing the trade."),
    T("Pawn break counter", "Meet a wing attack with their central break in mind.", "Respect the counterbreak.",
      "The classical resource against a flank attack is a central break. If you are storming, calculate ...d5/...e5 ideas. If you are defending, prepare that break as your resource."),
    T("Hidden check", "Discovered checks are resources that appear mid-line.", "Spot discovered-check resources.",
      "Discoveries flip evaluations instantly. Before a capture sequence, ask which discoveries open. Include them as forced branches in the tree."),
    T("Overloaded attacker", "Your attacking piece may be overloaded too.", "Secure your attacking unit.",
      "Resource recognition includes your own overloads. If the piece delivering mate also defends against mate, their resource may be to exploit that. Secure or re-order."),
    T("Prophylactic calculation", "Calculate their reply before you commit to the win.", "Calculate their best reply.",
      "The training loop: choose your intended move, then calculate their best resource for at least two plies. Only then commit. This is the heart of Recognizing Your Opponent's Resources."),
    T("Candidate their moves", "List their candidates as carefully as yours.", "List their candidates.",
      "Dvoretsky asks you to build a candidate list for the opponent. Checks, captures, quiet spoilers. Width on their side prevents tunnel vision on yours."),
    T("Trap awareness", "If the win looks too easy, find the trap resource.", "Find the trap.",
      "Easy wins often hide a resource. When a combination looks forced and pretty, spend an extra minute hunting the spoiling move. Paranoia is a skill."),
    T("Active defence", "Their best defence may be a counterattack.", "Expect active defence.",
      "Passive defence is not their only resource. Counterattacks — checks against your king — can seize the initiative. Calculate with their counterattack as a main branch."),
    T("Fortress resource", "Some positions hold despite material deficit.", "Recognise fortress chances.",
      "A fortress is an ultimate defensive resource. If you are converting, break it; if you are saving, build it. Do not assume material always wins."),
    T("Tempo resource", "A useful waiting move can be their saving tempo.", "Account for useful tempi.",
      "Zugzwang and reserve tempi are resources. They may have a waiting move that passes the move back to you in a worse form. Include waiting moves in defensive candidate lists."),
    T("Line clearance defence", "They may clear a defensive line with tempo.", "See clearance resources.",
      "Clearance can defend: a piece vacates a square so a rook defends along a rank. Spot clearances that resurrect a defence you thought was dead."),
    T("Re-routing defence", "A slow re-route can still arrive in time — calculate.", "Can their piece arrive in time?",
      "Ask whether a defensive piece can re-route in time to cover the critical square. Many attacks fail by one tempo to a re-route you dismissed as 'too slow'."),
    T("Resource review", "Threats, quiet moves, sacs, fortresses — see them all.", "Play the resource-aware move.",
      "Synthesise the book: list their threats and quiet resources, calculate counter-sacs and fortresses, then choose the move that survives best defence. That is prophylaxis with calculation."),
    T("Stop hope chess", "Assume they see the threat — calculate accordingly.", "Assume best defence.",
      "Hope chess is the opposite of Dvoretsky's method. Assume they find the resource. If your idea only works against cooperative defence, it is not an idea — it is a wish."),
]

RESOURCES_X = [
    T("Check prioritisation", "Order their checking resources by danger.", "Prioritise dangerous checks.",
      "Not all checks are equal. Rank their checking resources by whether they mate, win material, or merely tempo. Calculate the dangerous ones first."),
    T("Capture prioritisation", "Which of their captures actually change the eval?", "Prioritise meaningful captures.",
      "Some captures are noise. Identify captures that destroy your structure or remove a key attacker. Those are real resources."),
    T("King safety resource", "Improving their king can be the best defence.", "Respect king-improving defence.",
      "A prophylactic king move — luft or step off a line — can kill an attack. Include king safety improvements as defensive candidates."),
    T("Piece coordination defence", "They may coordinate two pieces to hold a square.", "See coordinated defence.",
      "One defender looks weak; two coordinated defenders hold. Calculate whether they can reinforce in time. Overestimating overloads is a common attacking error."),
    T("Pin-breaking resource", "They can break a pin with calculation or a sac.", "Account for pin breaks.",
      "Pins feel permanent until they interpose, capture the pinner, or step out with a forcing sequence. Always ask how the pin breaks."),
    T("Counter-pin", "Answer a pin with a stronger pin or threat.", "Find the counter-pin resource.",
      "Sometimes the resource against a pin is a counter-pin or a mate threat that makes the pin irrelevant. Look for that geometry."),
    T("Liquidation defence", "They liquidate into a drawn ending as a resource.", "Judge liquidating defence.",
      "Defensive liquidation into a known draw is high-level technique. If you allow it, the attack failed. Prevent the liquidation or accept the draw leaf."),
    T("Swindle alert", "In time pressure, swindle resources multiply.", "Stay alert to swindles.",
      "Practical resource recognition includes swindles: stalemate, perpetual, one-move traps. When converting with low time, blunder-check extra hard."),
    T("Quiet inclusion", "Your attack may need an inclusion against their resource.", "Include the prophylactic prep.",
      "Often the win requires a quiet inclusion that covers a flight or stops a countercheck, then the combination works. Put the inclusion on your candidate list."),
    T("Move-order resource", "Their defence may depend on your inaccurate move order.", "Choose a move order that kills resources.",
      "Two move orders, one idea: one allows a resource, the other does not. Compare move orders specifically against their best reply."),
    T("Square vacation", "They vacate a square to free a defensive piece.", "See vacation resources.",
      "Vacating a square can unmask a defence or free a blockader. Include vacation ideas when assessing whether a square is 'permanently' weak."),
    T("Overprotection myth", "Not every defence needs overprotection — calculate.", "Defend economically.",
      "Dvoretsky-level defence is economical: enough resources, not ritual overprotection. Calculate the minimum that holds, and use spare tempi for counterplay."),
    T("Initiative as defence", "Seizing the initiative can be the best defensive resource.", "Counter with initiative.",
      "The strongest defence is sometimes an attack. If calculation supports a counterinitiative, take it rather than sitting under pressure forever."),
    T("Endgame resource switch", "After queens off, their resources change — reassess.", "Reassess resources after trades.",
      "Trading into an ending changes the resource landscape: king activity, passers, checks. Rebuild their resource list after the trade."),
    T("Calculation hygiene", "Write (mentally) their best line before yours.", "Their line first, then yours.",
      "Habit drill: verbalise their best two-ply resource, then your continuation. This reverses hopeful ordering and installs opponent-resource thinking."),
    T("False forcing", "Not every check forces — they may ignore it.", "Check if the check is real.",
      "A check that can be ignored (or met by a stronger threat) is not a forcing resource. Verify that your 'forcing' move actually forces."),
    T("Threat vs execution", "Sometimes the threat is stronger — executing allows a resource.", "Prefer the stronger threat.",
      "Classic wisdom with Dvoretsky precision: executing a threat can allow a resource that maintaining the threat prevents. Compare threat vs execution concretely."),
    T("Defence under material", "Down material, resources are activity and fortresses.", "Seek active/fortress resources.",
      "When worse, do not play 'hope for a blunder'. Seek concrete resources: activity, perpetual, fortress. That is professional defence."),
    T("Attack under material", "Up material, their resources are swindles — blunt them.", "Blunt swindle resources.",
      "When ahead, prophylaxis against swindles is the conversion method. Cover checks, avoid stalemate, simplify carefully."),
    T("Resources synthesis", "See their ideas, stop them, then improve.", "Play the prophylactic best move.",
      "Final Resources drill: list threats and quiet resources, stop the critical one, then improve your position. Prophylaxis plus calculation."),
]

# Aagaard Strategic Play — complex decision-making under uncertainty
STRATEGIC = [
    T("Complex evaluation", "When unclear, list imbalances and pick a direction.", "Choose a direction amid uncertainty.",
      "Grandmaster Preparation: Strategic Play thrives in unclear positions where engines disagree with humans. Rank imbalances imperfectly, then commit to a plan that is robust under uncertainty — not a one-line tactic that needs perfection."),
    T("Robust plans", "Prefer plans that survive a range of replies.", "Pick the robust plan.",
      "A fragile plan collapses to one resource. A robust plan remains playable against several defences. Under uncertainty, robustness beats brilliancy."),
    T("Critical decision", "Flag the move that changes the game's character.", "Play the critical decision.",
      "Some moves are critical: they transform structure, material, or king safety permanently. Aagaard trains you to recognise those moments and calculate deeper there, while playing faster elsewhere."),
    T("Strategic candidate moves", "List strategic candidates — not only tactics.", "Compare strategic candidates.",
      "Candidates include improving moves, prophylactic moves, and breaks. In complex positions, the best move may look quiet. Force yourself to list positional candidates alongside shots."),
    T("Uncertainty tolerance", "Play good practical moves when truth is unclear.", "Choose the practical unclear try.",
      "You will not always find the truth. Strategic Play accepts that. Choose the move that keeps chances and limits risk when the evaluation is foggy."),
    T("Transform or maintain", "Decide whether to change the advantage's nature.", "Transform or maintain.",
      "Should you keep a static bind or cash it for dynamics? That transformation decision is central to Aagaard's strategic training. Pick consciously."),
    T("Piece coordination puzzle", "Untangle before you strike.", "Untangle the pieces.",
      "Complex positions often feature tangled pieces. The strategic move may be a reorganisation that looks slow but enables everything else. Untangle first."),
    T("Break vs restrain", "In tension, choose break or restrain with a reason.", "Break or restrain — decide.",
      "Central tension demands a decision: resolve with a break or restrain and improve. Under uncertainty, prefer the choice that matches your piece placement."),
    T("King as factor", "King safety can outweigh structural beauty.", "Weight king safety highly.",
      "In complex middlegames, king safety often decides. A structurally 'ugly' move that secures the king can be the strategic truth."),
    T("Space decisions", "Gain space only if you can use it.", "Gain or refuse space.",
      "Space can be a gift or a target. Aagaard's positions ask whether expansion helps your pieces or creates holes. Expand with a follow-up or refrain."),
    T("Exchange complex", "Exchanges in complex positions need a story.", "Exchange with a story.",
      "Trading in a mess without a story increases uncertainty. Exchange to clarify a favourable ending, remove their best piece, or open a colour complex — otherwise keep tension."),
    T("Initiative in fog", "When unclear, seizing the initiative is often practical.", "Take the practical initiative.",
      "Initiative creates problems for them to solve under uncertainty. If evaluations are muddy, prefer the move that asks questions."),
    T("Prophylaxis in complexity", "Stop their clarifying idea, then play your own.", "Stop their clarifying idea.",
      "In complex play, their resource may be a clarifying break. Prophylaxis that keeps the position difficult for them is strategic gold."),
    T("Pawn commitment", "Commit pawns when information is sufficient.", "Commit or stay flexible.",
      "Flexibility vs commitment is an Aagaard theme. Keep options when unsure; commit when your pieces are ready and their setup is known."),
    T("Dynamic equality", "Equal may mean mutual chances — play for yours.", "Play for your dynamic chances.",
      "Dynamic equality is not a draw offer. Identify your source of chances (attack, passer, colour complex) and play toward it."),
    T("Strategic sacrifice", "Sac for lasting soft squares or initiative when robust.", "Judge the strategic sac.",
      "Strategic sacrifices under uncertainty require compensation you can feel across several branches — squares, attack, domination — not a single forced line."),
    T("Worst-piece in complexity", "Even in messes, cure the worst piece.", "Improve the worst piece.",
      "A universal strategic algorithm: improve the worst-placed piece. In complex positions this often clarifies the rest of the plan."),
    T("Two-plan thinking", "Keep a main plan and a backup under uncertainty.", "Keep a backup plan.",
      "If plan A relies on a fragile tactic, have plan B. Aagaard's decision-making includes switching without ego when resources appear."),
    T("Colour-complex fight", "Fight for a colour complex in unclear structures.", "Play on your colour complex.",
      "Complex games often hinge on one colour. Trade the right minor, occupy holes, and accept structural scars that buy the complex."),
    T("Time as strategy", "Use development leads before they vanish.", "Cash the time advantage.",
      "A lead in time is a strategic resource with an expiry date. Open the position or create threats before they catch up."),
    T("Structure scars", "Accept a scar if it buys a lasting plus.", "Accept the useful scar.",
      "Strategic play allows ugly pawns when activity or king attack compensates. Evaluate the scar honestly across branches."),
    T("Middlegame ending steer", "Steer toward endings that reduce uncertainty your way.", "Steer the game phase.",
      "If the middlegame is too unclear, a favourable ending may be clearer. Steer trades when the ending favors your structure or activity."),
    T("Calculation budget", "Spend depth on critical decisions; play faster elsewhere.", "Budget calculation wisely.",
      "Strategic Play is not endless calculation. Budget deep thought for critical choices and trust strategic algorithms elsewhere."),
    T("Practical risk", "Match risk to tournament needs and eval fog.", "Set the right risk level.",
      "Must-win vs must-draw changes strategic choices in unclear positions. Adjust risk consciously — that is preparation-level thinking."),
    T("Problem-posing moves", "Prefer moves that force difficult replies.", "Pose a hard problem.",
      "Under uncertainty, the practical edge often goes to the player who poses problems. Choose the move that is hardest to meet."),
    T("Prevent clarity for them", "Do not allow them an easy clarifying sequence.", "Deny easy clarity.",
      "If a sequence clarifies the position in their favour, prevent it. Keeping the game complex can be the right strategic decision when you are the better calculator — or the opposite when you are not."),
    T("Harmonise then break", "Coordinate, then break — especially when unclear.", "Harmonise, then break.",
      "Breaking before harmony invites resources. In complex posts, spend moves on harmony, then break when pieces scream for it."),
    T("Evaluate after change", "Every structural change demands a fresh eval.", "Re-evaluate after the change.",
      "A capture or pawn push rewrites the strategic story. Stop and re-rank imbalances. Old plans die with old structures."),
    T("Strategic verification", "Verify the plan against forcing resources.", "Verify against forcing moves.",
      "Strategy without verification is hope. After choosing a strategic move, check forcing replies. Aagaard's method unites both."),
    T("Strategic synthesis", "Imbalances, robust plan, verify, play.", "Play the strategic decision.",
      "Synthesise Strategic Play: evaluate through fog, choose a robust plan, verify tactics, commit. That is the move under uncertainty."),
]

STRATEGIC_X = [
    T("Bind vs break", "Maintain a bind only if it restricts real ideas.", "Keep or release the bind.",
      "Binds that restrict nothing are vanity. Keep a bind when it stops their only breaks; release when you need open lines for your pieces."),
    T("Opposite castling complexity", "Race with central awareness in messy opposite castling.", "Race intelligently.",
      "Opposite castling in complex books mixes storms with central counters. Push your storm while calculating their break."),
    T("Exchange-sac strategy", "Positional exchange sacs need lasting compensation.", "Judge the exchange sac.",
      "Strategic exchange sacrifices buy squares and attacks across many branches. If compensation is narrow and fragile, decline."),
    T("Queen placement strategy", "Park the queen on a safe multi-purpose square.", "Improve queen placement.",
      "In complex middlegames, queen placement ties plans together. Find a square that eyes both wings without walking into tempi."),
    T("Rook file battles", "Contest the open file before the mess clarifies.", "Fight for the file.",
      "Open files decide complex games. Contest early; doubled rooks turn uncertainty into pressure."),
    T("Minor-piece imbalance", "Steering the remaining minor is a strategic decision.", "Steer the minor-piece balance.",
      "Which minor remains often decides unclear games. Trade toward the piece that fits the evolving structure."),
    T("Prophylactic improvement", "A move that improves and prevents is ideal.", "Improve and prevent.",
      "Dual-purpose moves are gold under uncertainty: improve your worst piece while stopping their idea. Hunt that move."),
    T("Central control fog", "Even when unclear, do not abandon the centre.", "Keep central presence.",
      "Complex play still respects the centre. Maintain presence or pressure so wing adventures do not leave you punctured."),
    T("Pawn storm timing", "Storm when pieces are ready — not before.", "Time the storm.",
      "Premature storms create counter-resources. Strategic timing waits for lifts and batteries, then advances."),
    T("Defence in complexity", "Active defence beats passive suffering in unclear games.", "Defend actively.",
      "When under pressure in a mess, seek exchanges or counters that clarify favorably. Passive defence invites a strategic crush."),
    T("Conversion path", "When better in a complex position, simplify wisely.", "Simplify while better.",
      "Complexity helps the defender. If you are better, find a simplification path that preserves a usable edge."),
    T("Complication path", "When worse, keep the position rich.", "Keep richness when worse.",
      "Trailing under uncertainty, avoid dry clear losses. Keep pieces and tension so resources remain."),
    T("Plan communication", "Your move should announce a coherent plan.", "Play a plan-consistent move.",
      "Random strong-looking moves without a plan increase chaos for you too. Make a move that belongs to a named plan."),
    T("Engine-free judgment", "Train judgment without leaning on engine lines.", "Trust trained judgment.",
      "Aagaard's books build human judgment. Practice choosing without needing a forced line to the end — then verify critical tactics."),
    T("Critical square fight", "Identify one critical square and fight for it.", "Fight for the critical square.",
      "Complex positions often hinge on one square (e5, d5, f5, c4). Name it and play the move that contests it."),
    T("Slow vs fast plans", "Match plan speed to the opponent's threats.", "Pick the right plan speed.",
      "If they have fast threats, your slow strategic grind fails. Match tempo: fast plans vs fast threats; slow plans when the position is closed and safe."),
    T("Imbalance creation", "If the position is sterile, create an imbalance.", "Create an imbalance.",
      "Strategic play includes manufacturing imbalances — pawn breaks, piece sacs for structure — when equality is too dead for your needs."),
    T("Narrative control", "Make them respond to your story.", "Force them to react.",
      "The side that dictates the narrative of the game usually wins complex battles. Choose the move that makes them respond."),
    T("Decision confidence", "Once verified, commit — do not dither.", "Commit to the decision.",
      "Over-thinking after verification invites time trouble and worse moves. Decide, blunder-check, play."),
    T("Strategic Play review", "Fog → imbalances → robust plan → verify → commit.", "Play the prepared strategic move.",
      "Close the Strategic Play loop on this board. Embrace uncertainty, choose robustly, verify, commit."),
]

# Analytical Manual — deep multi-variation analysis
ANALYTICAL = [
    T("Deep tree discipline", "Finish variations before hopping to another idea.", "Finish the variation.",
      "The Analytical Manual is famous for brutal depth. Train the discipline: finish a long variation to a quiet leaf before opening another trunk. Branch-jumping is how hard positions stay unsolved."),
    T("Multi-variation comparison", "Compare completed long lines, not vibes.", "Compare finished long lines.",
      "Hard positions require several deep lines. Mark each with a clear eval after completion, then compare. The Manual's spirit is exhaustive comparison."),
    T("Critical position depth", "Go deeper than comfort at the critical fork.", "Calculate deeper than comfort.",
      "When the position is known-hard, your depth must exceed casual calculation. Push one or two plies past where you want to stop, especially at the critical fork."),
    T("Candidate exhaustiveness", "Widen candidates before deepening favorites.", "Widen, then deepen.",
      "Brutal analysis starts wide: include quiet moves and prophylaxes, not only sacrifices. Then deepen the survivors. Width prevents missing the Manual-level solution."),
    T("Refutation hunt", "Try to bust your own main line before trusting it.", "Bust your own line.",
      "Analytical Manual training includes self-refutation. After finding a brilliant line, spend time as the defender. If it holds against best defence, it may be truth."),
    T("Long forcing chains", "Map long forcing chains with material bookkeeping.", "Map the forcing chain.",
      "Long capture/check chains demand bookkeeping. After each capture, update material and king safety. Lost counts create false 'wins' in deep trees."),
    T("Quiet move depth", "Deep analysis often ends with a quiet killer.", "Find the quiet move at depth.",
      "Many Manual solutions are quiet moves after long forcing play. Do not stop at the checks; look for the consolidating or prophylactic leaf."),
    T("Alternative move orders", "Deeply compare move orders in the main idea.", "Compare deep move orders.",
      "The same idea with two move orders can differ by a single resource. Analytical work compares those orders across full branches."),
    T("Defensive analytical work", "Analyse saving lines as deeply as attacking ones.", "Deep-dive the saving line.",
      "Brutal positions require deep defence too. Find the saving path with the same seriousness as the win. Half-points come from analytical defence."),
    T("Evaluation at depth", "Leaf evals must be concrete after long lines.", "Make the deep leaf concrete.",
      "After twelve plies of fog, force a concrete leaf label: winning, better, equal, worse, drawn by fortress/perpetual. Vague leaves waste the deep work."),
    T("Transposition tracking", "Reuse known leaves when lines transpose.", "Reuse transposed leaves.",
      "Deep trees transpose. When you reach a known position, graft the earlier conclusion instead of recalculating from zero. Efficiency enables more breadth."),
    T("Sacrifice analysis", "Analyse sacs until compensation is proven or refuted.", "Prove or refute the sac.",
      "The Manual does not romanticise sacs. Either compensation is demonstrated across branches, or the sac is marked busted. Prove it."),
    T("Prophylaxis at depth", "Deep lines often need a prophylactic inclusion.", "Find the deep inclusion.",
      "A recurring analytical pattern: the combination works only after a deep prophylactic inclusion. Search for that inclusion when the direct path fails."),
    T("Engine-free hardness", "Struggle honestly before checking — build analytical muscle.", "Struggle through the hard line.",
      "These positions are meant to hurt a little. Stay with the analysis, write candidates, and finish lines. The training effect is the struggle."),
    T("Key defensive resource", "In deep attack trees, find their key resource first.", "Find the key defensive resource.",
      "Before investing twenty minutes in an attack, find the defensive resource that might kill it. If you cannot bust it, the attack may be real."),
    T("Endgame leaf precision", "If deep lines enter endings, analyse the ending properly.", "Analyse the ending leaf.",
      "A deep combination that 'wins a pawn' into a drawn rook ending is not a win. Switch to endgame criteria at the leaf."),
    T("Multiple critical moments", "Hard games have several critical forks — flag them.", "Flag each critical fork.",
      "Analytical Manual positions often contain more than one critical decision. Flag each, analyse each, and do not spend all depth on the first shiny fork."),
    T("Consistency of plan", "Deep tactics should serve a strategic skeleton.", "Keep tactics on a plan skeleton.",
      "Even brutal calculation sits on a plan: attack a king, create a passer, dominate a complex. Keep the skeleton visible so lines stay purposeful."),
    T("Time investment", "Hard positions deserve clock — budget it.", "Invest clock here.",
      "Knowing a position is Analytical-Manual-hard means investing time. Play faster in easy phases to afford depth here."),
    T("Annotation standard", "Aim for analysis you could publish as notes.", "Analyse to annotation standard.",
      "Train as if writing notes: candidates listed, main line clear, resources mentioned, evals stated. That standard raises calculation quality."),
    T("Blind-spot hunt", "Ask what you refuse to calculate — then calculate it.", "Calculate the avoided line.",
      "Psychological blind spots skip unpleasant lines. Force yourself into the line you dislike. Manual-level truth hides there often."),
    T("Perpetual deep check", "Deep wins die to late perpetuals — check the end.", "Check late perpetual ideas.",
      "After a long winning tree, spend a pass on late perpetual resources. Conversions fail at the last step without that pass."),
    T("Fortress at depth", "Deep material gains may still be fortresses.", "Test for fortress at the leaf.",
      "Ask at deep leaves: can they fortress? If yes, the line is not winning. Analytical honesty includes fortress testing."),
    T("Stepwise deepening", "Deepen iteratively: shallow pass, then deeper pass.", "Do a second deeper pass.",
      "First pass: candidates and rough evals. Second pass: deepen the critical trunks. Iterative deepening is how hard analysis becomes manageable."),
    T("Error logging", "When a line fails, log why — then adjust candidates.", "Log the failure reason.",
      "Analytical improvement requires naming why a line failed (resource, move order, miscount). Log it, then adjust. Do not restart blindly."),
    T("Quiet start deep end", "Some solutions start quiet and explode later.", "Consider a quiet start.",
      "Do not discard quiet first moves because the position 'looks tactical'. Manual solutions sometimes begin with prophylaxis and end in fireworks."),
    T("Material vs attack deep", "Deeply compare grabbing material vs continuing the attack.", "Compare material vs attack deeply.",
      "A hard choice: take the material leaf or continue attacking. Analyse both deeply. The Manual thrives on that comparison."),
    T("King hunt analysis", "Mating nets need complete flight coverage in the tree.", "Cover all flights in the tree.",
      "Deep king hunts fail when one flight is left. Systematically cover flights in the analysis before claiming mate."),
    T("Analytical stamina", "Stay with the position past frustration.", "Stay with the hard analysis.",
      "Brutal positions reward stamina. Take a short reset if visualisation fails, then continue. Walking away early trains quitting, not analysis."),
    T("Analytical synthesis", "Wide candidates, deep finished lines, honest leaves.", "Play the deeply verified move.",
      "Synthesise the Analytical Manual ethos: exhaustive candidates, deep finished variations, honest evaluations, then the move that survives best defence."),
]

ANALYTICAL_X = [
    T("Variation notebook", "Mentally number main lines A/B/C with evals.", "Label lines A/B/C.",
      "Organise deep work like a notebook: Line A (eval), Line B (eval). Organisation prevents re-calculating the same fog."),
    T("Forced vs unforced", "Separate forced sequences from choice nodes.", "Mark choice nodes clearly.",
      "In a long tree, mark where someone has a real choice. Forced stretches can be compressed; choice nodes need width."),
    T("Tactical motifs at depth", "Motifs still apply — search them in deep leaves.", "Search motifs deep.",
      "Pins, deflections, and clearances appear late in deep lines. Keep motif eyes open at the leaf, not only at move one."),
    T("Practical cutoff", "When a line is clearly insufficient, cut it.", "Cut clearly insufficient lines.",
      "Brutal analysis is not infinite. Cut lines that are clearly worse after honest depth so remaining trunks get more time."),
    T("Second-best tracking", "Know the second-best move's eval too.", "Track second-best.",
      "Analytical strength includes knowing how much better your move is than the alternative. Track second-best for confidence and practical choice."),
    T("Defence-first pass", "Start a hard position with a defensive resource pass.", "Start with their resources.",
      "Especially after studying Resources: begin hard analysis by listing their resources, then build your lines against them. Defence-first prevents fantasy attacks."),
    T("Attack-first pass", "Then build the strongest attacking attempts.", "Build the strongest attack attempts.",
      "After resources, attempt the most dangerous attacking trees. Alternating defence-first and attack-first passes mirrors Manual method."),
    T("Clarity leaf preference", "Prefer deep lines that end in clear outcomes.", "Prefer clear deep leaves.",
      "Among similar deep options, prefer the line ending in a clear win/draw over perpetual fog. Clarity is analytical hygiene."),
    T("Miscount prevention", "Re-count material at every deep leaf.", "Re-count at the leaf.",
      "Miscounts create Manual-level blunders in analysis. Re-count material and checks at each leaf before writing the eval."),
    T("Visualisation reset", "Reset the board image when pieces get ghostly.", "Reset visualisation.",
      "Deep calculation fails when pieces ghost. Reset to the root position, rebuild slowly, continue. Resetting is strength."),
    T("Critical check filter", "In deep trees, filter which checks deserve depth.", "Filter checks by importance.",
      "Not every check in a long line needs a novel. Filter by whether it changes material, king safety, or forces a unique reply."),
    T("Positional deep move", "Hard strategy still needs deep verification.", "Deep-verify the positional move.",
      "A quiet strategic move in a brutal position must survive deep resources. Verify it like a combination."),
    T("Endgame transition deep", "Deeply assess transitions into endings mid-tree.", "Deep-check ending transitions.",
      "When a deep line offers a trade into an ending, analyse that ending with full seriousness before choosing the trade."),
    T("Sacrifice chain", "Some lines sac twice — calculate both sacs fully.", "Calculate the full sac chain.",
      "Double sacrifices appear in Manual work. Do not stop after the first sac's fog; continue until the second sac's leaf is clear."),
    T("Only-move sequences", "Chains of only-moves need perfect accuracy.", "Verify each only-move.",
      "If your deep win requires five only-moves, verify each. One inaccuracy collapses the chain. Precision over romance."),
    T("Opponent psychology note", "Hard lines also pose practical problems — note them.", "Note practical problem lines.",
      "Among analytically equal deep options, prefer the one harder to meet over the board. Practical notes belong in serious analysis."),
    T("Publishable main line", "Produce one clean main line as the answer.", "State a clean main line.",
      "After the mess of branches, extract a clean main line you could show a student. Clarity of presentation clarifies thought."),
    T("Unsolved honesty", "If unsolved, play the most robust practical move.", "If unsolved, play robustly.",
      "Not every Manual position is solved in session. If time expires, play the most robust practical move among deep survivors — and flag the position for later."),
    T("Training repetition", "Return to the same hard position later cold.", "Treat it as repeatable training.",
      "Analytical strength grows by revisiting brutal positions cold. Today's struggle is tomorrow's pattern. Play the best move you can now."),
    T("Manual synthesis", "Width, depth, honesty, stamina — then move.", "Play the Manual-verified move.",
      "Final Analytical Manual drill: exhaustive width, finished deep lines, honest leaves, stamina under difficulty. Then play the verified move."),
]


def build(key, themes, start, style_tag, about_prefix):
    assert len(themes) == 50, (key, len(themes))
    out = []
    for i in range(100):
        theme, teach, hint, desc = themes[i % 50]
        fen = FENS[(i * 3 + start) % len(FENS)]
        assert fen_ok(fen), (start + i, fen)
        occ = i // 50 + 1
        title = theme if occ == 1 else f"{theme} ({occ})"
        full_desc = (
            f"{desc} "
            f"On this board, choose the move that best expresses the idea, "
            f"then verify it against their strongest resource. "
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
    return out


def main():
    resources = RESOURCES + RESOURCES_X
    strategic = STRATEGIC + STRATEGIC_X
    analytical = ANALYTICAL + ANALYTICAL_X
    lessons = (
        build("resources", resources, 1,
              "Recognizing Your Opponent's Resources–style · prophylaxis & calculation",
              "Dvoretsky resources")
        + build("strategic", strategic, 101,
                "Grandmaster Preparation: Strategic Play–style · decisions under uncertainty",
                "Aagaard strategic play")
        + build("analytical", analytical, 201,
                "Analytical Manual–style · deep multi-variation analysis",
                "Dvoretsky analytical")
    )
    assert len(lessons) == 300
    by = {}
    for L in lessons:
        by[L["book"]] = by.get(L["book"], 0) + 1
        assert L["pitfalls"] == []
        assert len(L["desc"]) > 200, (L["n"], len(L["desc"]))
    path = ROOT / "lessons-data.json"
    path.write_text(json.dumps(lessons, indent=2) + "\n")
    print("OK", len(lessons), by, "avg desc", sum(len(L["desc"]) for L in lessons) // 300)


if __name__ == "__main__":
    main()
