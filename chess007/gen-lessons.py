#!/usr/bin/env python3
"""Generate 300 chess007 lessons (Gelfand / Müller-Lamprecht / Naroditsky). No pitfalls; richer descriptions."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent

# Import fen helpers + FENS from shared header fragment
ns: dict = {"__file__": str(ROOT / "gen-lessons.py"), "__name__": "g7"}
exec(compile((ROOT / "_fen_header.py").read_text(), "_fen_header.py", "exec"), ns, ns)
fen_ok = ns["fen_ok"]
FENS = ns["FENS"]


def T(theme, teach, hint, desc):
    return (theme, teach, hint, desc)


GELFAND = [
    T("Evaluate before planning", "Name the imbalances before inventing a plan.", "Evaluate, then choose a plan.",
      "Gelfand's decision-making starts with a clear evaluation: material, structure, piece activity, king safety, and initiative. Only after that ranking do plans appear. On this board, pause and state which side is better and why, then play the move that fits that evaluation — not the first tactic that flashes."),
    T("Candidate plans", "List two real plans, then pick one with concrete moves.", "Choose between two plans.",
      "Elite players rarely have only one idea. Gelfand often weighs two strategic directions — e.g. queenside expansion versus a central break — and chooses based on concrete feasibility. List two plans here, reject the weaker, and play the first move of the stronger."),
    T("Transform the advantage", "Convert one plus into an easier one.", "Transform your plus.",
      "A recurring Gelfand theme: when a static edge is hard to use, transform it into a dynamic or endgame edge you can play. Look for a trade, break, or liquidation that changes the nature of the advantage without throwing it away."),
    T("Prophylaxis first", "Ask what they want — prevent it — then improve.", "Prevent their idea.",
      "Positional Decision Making repeatedly shows prophylaxis as a positive move, not a defensive shrug. Identify their only active plan and spoil it a tempo early, then resume your own improvements."),
    T("Worst-piece cure", "Improve the ugliest piece before launching.", "Improve the worst piece.",
      "If a piece has no future, the plan starts there. Gelfand often cures a bad bishop or rim knight before tactical operations. Find the least happy unit and give it a better square."),
    T("Structure dictates plan", "Let the pawn skeleton choose your breaks.", "Play the structure's plan.",
      "Pawn structure is the map. Isolated pawns, hanging pawns, and closed chains each suggest typical plans. Read the skeleton first, then play the thematic break or restraint that belongs to it."),
    T("Dynamic vs static", "Cash dynamics now; nurse static pluses patiently.", "Respect dynamic vs static.",
      "Gelfand distinguishes dynamic chances (initiative, lead in development) from static ones (better structure, bishop pair). Dynamics must be used; statics can wait. Decide which kind you have, then act accordingly."),
    T("Exchange with a reason", "Trade only if the resulting position fits your eval.", "Trade on purpose.",
      "Exchanges are decisions, not habits. Before trading, ask whether the new minor-piece balance, ending, or open file favors your evaluation. Play the exchange — or decline it — with that answer."),
    T("Space with a plan", "Space is useless without a follow-up.", "Use the space.",
      "A space advantage allows regrouping. Use it to improve pieces behind the pawn wall, then break where they are cramped. Empty expansion without a follow-up is how advantages evaporate."),
    T("King safety override", "Unsafe kings veto pretty positional plans.", "Prioritise king safety.",
      "If either king is exposed, calculation and safety override long maneuvers. Gelfand's evaluations always include king safety as a veto. Meet threats or punish the exposed king before 'improving' on the queenside."),
    T("Break preparation", "Prepare the break until tactics favor you.", "Prepare, then break.",
      "Premature breaks open lines for the opponent. Place pieces on ideal squares, then deliver the break. The preparation moves are part of the plan, not delays."),
    T("Second weakness", "When one target is held, create another.", "Open a second front.",
      "Classic elite technique: one weakness can be defended forever; two stretch the defence. If they have glued themselves to a backward pawn, open play elsewhere until something drops."),
    T("Practical choice", "Among equal options, pick the harder one for them.", "Choose the practical try.",
      "Gelfand emphasises practical decision-making under tournament conditions. When two moves evaluate similarly, prefer the one that poses more problems or is easier for you to play with the clock."),
    T("Initiative retention", "After a concession, keep posing questions.", "Keep the initiative.",
      "When they give ground, do not coast. Find the next annoying move that forces another concession. Initiative retention turns small edges into wins."),
    T("Endgame transition", "Liquidate only into endings you have evaluated.", "Liquidate with calculation.",
      "Heading for an ending is a decision. Count the resulting pawn ending or rook ending before the last trade. Gelfand converts when the ending is clear — not hopeful."),
    T("Restraint", "Restrain their breaks before attacking.", "Restrain first.",
      "Botvinnik-flavoured restraint appears in modern elite play too. Stop ...c5/...e5/...f5 ideas, then improve. Prevention is often the strongest 'attacking' move."),
    T("Color complex", "Dominate the soft color after the right trade.", "Target the color complex.",
      "Trade the defender of a complex, then occupy the holes. Gelfand's games show long sieges on dark or light squares once the right bishop is gone."),
    T("Passed pawn policy", "Create passers that pull their pieces away.", "Create a useful passer.",
      "A passer is a decoy as much as a runner. Create one that forces their pieces into passivity, then strike on the opposite wing — a positional decision, not just a race."),
    T("Quiet improving move", "Not every position needs fireworks.", "Find the quiet improvement.",
      "Elite annotation often praises a quiet move that improves harmony. If no tactic exists, improve a piece or fix a structural detail. Calm strength is still strength."),
    T("Calculation checkpoint", "Verify the positional idea against forcing replies.", "Check forcing replies.",
      "Positional plans die to tactics. After choosing a plan move, blunder-check forcing replies. Gelfand's method is evaluation plus concrete verification — never evaluation alone."),
    T("Imbalance ranking", "Rank imbalances: which one decides this position?", "Play toward the top imbalance.",
      "List imbalances and order them. The plan should address the highest-ranked one. Playing toward a minor imbalance while ignoring a king-safety crisis is how evaluations go wrong."),
    T("Piece placement ideal", "Visualise the ideal setup, then steer toward it.", "Steer toward the ideal setup.",
      "Dream the best squares for your pieces, then find the move that approaches that picture. Reverse-engineering from an ideal setup is a Gelfand-style planning habit."),
    T("Decline the gift", "Refuse 'free' material that wrecks your structure or king.", "Refuse the poisoned gift.",
      "Elite players decline material that yields lasting soft squares or a lasting attack. If the gift damages your evaluation, leave it and improve."),
    T("Active defence", "Defend by exchanging attackers or counterpunching.", "Defend actively.",
      "Passive defence invites a crush. Seek trades that reduce their attacking force, or counterbreaks that force them backward. Active defence is a positional decision too."),
    T("Time vs structure", "A lead in time demands opening the game.", "Open while ahead in time.",
      "If you lead in development, open lines before they catch up. Closed play returns the gift of time. Openness converts development into concrete threats."),
    T("Blockade choice", "Blockade with a piece that still attacks.", "Blockade actively.",
      "A pure sentry is often wrong. Place the blockader where it also eyes weaknesses. Active blockades appear throughout modern positional play."),
    T("Pawn move commitment", "Every pawn move creates lasting holes — have a reason.", "Commit the pawn purposely.",
      "Pawns do not move backward. Gelfand weighs pawn advances as structural commitments. Advance when the resulting holes help you more than them."),
    T("Middlegame to ending", "Know when the ending favors your structure.", "Steer to/avoid the ending.",
      "Some structures prefer endings; others need middlegame piece play. Decide whether trades help. Steering the game phase is a core positional decision."),
    T("Pressure without rushing", "Increase pressure until they crack — don't force.", "Increase the pressure.",
      "Forcing a 'win' too early can throw the edge. Improve, restrain, and pile up until the defence collapses. Patient pressure is elite technique."),
    T("Decision review", "Evaluate → plan candidates → verify → play.", "Apply the decision loop.",
      "Close with Gelfand's loop: evaluate imbalances, list plan candidates, verify against tactics, then play. Positional Decision Making is a method — use it on this board."),
]

GELFAND_X = [
    T("Outpost creation", "Create the hole, then occupy it.", "Prepare the outpost.",
      "Outposts are manufactured. Force a pawn advance that leaves a hole, then plant a knight. Creating the square is as important as occupying it."),
    T("Majority mobilisation", "Mobilise your majority before they blockade it.", "Mobilise the majority.",
      "Queenside or kingside majorities must advance with piece support. Delay lets them blockade. Start the mobilisation that creates a passer."),
    T("File strategy", "Contest open files; doubled rooks decide.", "Take or contest the file.",
      "Open files are highways. Race to occupy them and double. Giving up the only open file is a positional concession Gelfand avoids."),
    T("Bishop quality", "Free or trade the bad bishop; keep the good one.", "Fix bishop quality.",
      "Identify good vs bad bishops relative to your pawns. Free yours with a break, or trade it for their better minor. Bishop quality decisions reshape plans."),
    T("Knight vs bishop", "Match the remaining minor to the pawn skeleton.", "Trade toward your minor.",
      "Closed → knights; open → bishops. Make the trade that leaves you with the fitting minor. This is a classic evaluation skill in Gelfand's notes."),
    T("Central control", "Control the centre with pieces and pawns before wing play.", "Play through the centre.",
      "Wing attacks without central control invite counterbreaks. Secure or pressure the centre first, then expand on the wing."),
    T("Hanging pawns handling", "Advance hangers with support — or restrain theirs.", "Handle hanging pawns.",
      "Hanging pawns are dynamic. Advance them when pieces support; against them, pressure and force an unfavorable push. Choose the role that matches your eval."),
    T("IQP policy", "With IQP: activity; against IQP: blockade and trades.", "Play the IQP policy.",
      "Isolated queen pawn play is a decision fork. If you have it, keep pieces and open lines. If they have it, blockade d5 and simplify. Follow the policy that fits."),
    T("Opposite castling plan", "Race, but keep a central eye.", "Race with central awareness.",
      "Opposite castling plans are pawn storms plus central vigilance. Push your storm while ensuring their central break does not land first."),
    T("Evaluation update", "After every structural change, re-evaluate.", "Update the evaluation.",
      "A capture or pawn advance can reorder imbalances. Stop and re-rank. Playing the old plan in a new structure is a common elite-level miss — avoid it here."),
    T("Small advantages", "Nurse tiny edges: better knight, safer king, cleaner structure.", "Nurse the tiny edge.",
      "Modern elite chess wins from tiny edges. Do not force. Improve gradually until the edge becomes usable. Patience is part of decision-making."),
    T("Counterplay denial", "Deny their counterplay before converting.", "Deny counterplay.",
      "Conversion starts by killing their ideas. A move that stops ...b5 or ...f5 can be stronger than grabbing a pawn. Deny, then convert."),
    T("Queen placement", "Park the queen where she eyes both wings safely.", "Improve the queen.",
      "Queen placement is a positional decision. Centralise or shift her to a safe attacking post. Avoid squares where minor pieces constantly tempo her."),
    T("Rook lifts", "Lift rooks into the attack or onto the third rank.", "Start the rook lift.",
      "Rook lifts turn defensive rooks into attackers. If the structure allows a lift via the third rank, begin it as part of the plan."),
    T("Flexible pawn moves", "Keep options (...c6/...c5) until information arrives.", "Stay flexible.",
      "Sometimes not pushing is the decision. Keeping both breaks available until their setup is clear is modern flexibility Gelfand respects."),
    T("Commit when ready", "When information is enough, commit the break.", "Commit now.",
      "Flexibility ends when delay helps them more. If pieces are ready and their plan is clear, commit. Indecision is also a decision — usually a bad one."),
    T("Material imbalance", "Queen vs pieces, exchange sacs — evaluate compensation honestly.", "Judge the imbalance.",
      "Unusual material needs honest evaluation of activity and king safety. If compensation is real and lasting, embrace it; if not, avoid or undo it."),
    T("Technical win path", "Choose the path with fewer ways to go wrong.", "Pick the technical path.",
      "Among winning plans, prefer the technical one with fewer only-moves. Practical decision-making includes risk management."),
    T("Risk assessment", "Know when to complicate and when to simplify.", "Choose risk level.",
      "Trailing: complicate. Leading: simplify (usually). Match risk to match situation and evaluation. That is tournament decision-making."),
    T("Gelfand synthesis", "Evaluate, plan, verify, play — the elite loop.", "Play the decision-making move.",
      "Synthesise Positional Decision Making: clear evaluation, plan candidates, tactical verification, practical choice. That loop produces the move on this board."),
]

MUELLER = [
    T("Opposition basics", "Seize opposition to invade key squares.", "Take the opposition.",
      "Fundamental Chess Endings treats opposition as a basic tool in king and pawn endings. Face the kings with one square between and force them to yield. Use it to reach key squares in front of your pawn."),
    T("Key squares", "Occupy a key square ahead of the pawn to force promotion.", "Go to a key square.",
      "For a given pawn, certain squares guarantee promotion if occupied by your king. Calculate which squares are key, then path your king there. Theory first, then technique."),
    T("Rook behind passer", "Tarrasch: rooks belong behind passed pawns.", "Rook behind the passer.",
      "Whether the passer is yours or theirs, the rook is usually best behind it. Behind yours it supports the advance; behind theirs it restrains. Apply Tarrasch on this board."),
    T("Philidor position", "Third-rank defence holds many R+P vs R endings.", "Set up Philidor.",
      "The Philidor setup — rook on the third rank until the pawn reaches the sixth, then checks from behind — is a core drawing resource. Recognise when it applies and head for it."),
    T("Lucena bridge", "Build a bridge to shelter the king from checks.", "Build the Lucena bridge.",
      "Lucena is the fundamental winning method with rook and pawn vs rook when the pawn is far advanced. Bridge with the rook to stop checks, then promote. Know the pattern cold."),
    T("Vancura idea", "Lateral checks and pawn attacks hold some rook-pawn endings.", "Use Vancura ideas.",
      "Against a rook pawn, Vancura-style lateral defence can draw. Attack the pawn from the side while checking. Fundamental references treat this as must-know theory."),
    T("Short-side defence", "King to the short side; rook checks from the long side.", "King to the short side.",
      "In many rook endings, the defending king belongs on the short side of the pawn so the rook has checking distance on the long side. Apply that geometry here."),
    T("Checking distance", "Maintain enough distance for perpetual side checks.", "Keep checking distance.",
      "If the checking distance shrinks, the ending may tip from draw to loss. Keep the rook far enough that the king cannot approach with tempo. Distance is theoretical oxygen."),
    T("Pawn endings first", "Before trading into a pawn ending, calculate it fully.", "Calculate the pawn ending.",
      "Müller & Lamprecht emphasise that pawn endings are the foundation. Count tempi, opposition, and outside passers before the last piece trade. Irreversible means calculated."),
    T("Outside passed pawn", "Decoy their king with the outside passer.", "Push the outside passer.",
      "An outside passer pulls the enemy king away so your king feasts on the other wing. Create or advance it with that decoy plan in mind."),
    T("Protected passer", "A protected passer freezes their king — invade elsewhere.", "Use the protected passer.",
      "Protected passed pawns restrain. While they babysit, invade on the opposite side. Theory values this highly in king and pawn and minor-piece endings."),
    T("Wrong bishop", "Bishop that misses the rook-pawn's promotion square = draw.", "Recognise wrong bishop.",
      "The classic draw: bishop of the wrong colour with a rook pawn. Do not play for a win that theory says is drawn; or force them into it when defending."),
    T("Bishop vs knight", "Open positions favor bishops; closed favor knights.", "Play to your minor.",
      "Fundamental guides compare minor pieces by structure. Open the position for bishops; keep it closed for knights. Steer the pawn skeleton accordingly."),
    T("Opposite bishops", "Attacking chances with opposite bishops; blockades for draws.", "Use opposite-bishop themes.",
      "Opposite-coloured bishops: with other pieces, attack; in pure endings, blockade on your colour for draws. Choose the interpretation that fits the material."),
    T("Queen endings checks", "Centralise the queen; watch perpetual checks.", "Centralise / avoid perpetual.",
      "Queen endings are check-heavy. Centralise your queen for forks and mating nets, and calculate perpetual resources when defending. Theory is concrete here."),
    T("Rook activity", "Activity often beats a pawn in rook endings.", "Activate the rook.",
      "Passive rooks lose more endings than missing pawns. Activate even at material cost when the resulting activity holds or wins. This is a fundamental practical rule."),
    T("Cut off the king", "Cut the enemy king along a rank or file permanently.", "Cut the king off.",
      "A rook cut-off can be worth a pawn. Place the rook so the king cannot cross. Many theoretical wins begin with a lasting cut-off."),
    T("Connected passers", "Connected passers on the sixth are usually decisive.", "Advance connected passers.",
      "Connected passed pawns support each other. Advance them carefully to the sixth where theory often says the win is clear. Coordination over blind rushing."),
    T("Split passers", "Two split passers stretch the defending king.", "Advance the farther passer.",
      "Split passers force the king to choose. Advance the one that maximises decoy distance. Fundamental technique in pawn and rook endings."),
    T("Knight endings forks", "Knights live on short-range tactics and outposts.", "Use fork nets / outposts.",
      "Knight endings reward outposts and fork awareness. Domination of the enemy knight is a recurring theoretical theme. Restrict flight squares."),
    T("Bishop endings breakthroughs", "Same-colour bishop endings need a second weakness.", "Create a second weakness.",
      "With same-colour bishops, one weakness may be holdable. Create a second front — another pawn target or king invasion — as the winning method."),
    T("Rook pawn exceptions", "Rook pawns change key-square geometry.", "Apply rook-pawn rules.",
      "a- and h-pawns have special drawing tendencies. Know the exceptions before pushing. Fundamental Chess Endings flags these constantly."),
    T("Stalemate resources", "Stalemate saves 'lost' endings — calculate them.", "Use/avoid stalemate.",
      "Theoretical draws include stalemate traps. When winning, leave them a legal move; when losing, fish for stalemate. Bookkeeping of legal moves matters."),
    T("Fortress recognition", "Some fortresses hold vs extra material — know them.", "Build or break the fortress.",
      "Fortresses appear across fundamental theory: knight or bishop blockades that cannot be breached. Recognise when to stop trying to win, or how to break one."),
    T("Triangulation", "Lose a tempo on purpose to put them in zugzwang.", "Triangulate.",
      "Triangulation appears in pawn endings and some minor-piece endings. Lose a move so the same position appears with them to play. Zugzwang follows."),
    T("Corresponding squares", "Some squares correspond — step onto the right one.", "Take the corresponding square.",
      "Advanced pawn-ending theory uses corresponding squares. Treat it practically: occupy the square that mirrors theirs and maintains opposition-like control."),
    T("Queen vs rook", "Queen usually wins — avoid perpetual and fortress tries.", "Convert Q vs R carefully.",
      "Theoretical queen vs rook wins require care against perpetual checks and stalemate. Drive the king to the edge and coordinate carefully."),
    T("Two bishops mate", "Shrink the box with coordinated bishops.", "Shrink the king's box.",
      "Two bishops mate is fundamental technique. Coordinate to shrink the king's box toward a corner. No need for brilliance — just method."),
    T("Bishop and knight mate", "Drive to the corner of the bishop's colour.", "Drive to the right corner.",
      "B+N mate requires driving the king to the correct corner. Know the direction and the restraining net. This is reference-book technique under pressure."),
    T("Technical review", "Theory plus calculation — the fundamental method.", "Play the theoretical move.",
      "Fundamental Chess Endings is a reference: recognise the pattern (Philidor, Lucena, opposition), then execute precisely. Pattern first, move second."),
]

MUELLER_X = [
    T("Frontal checks", "Frontal checks work when the pawn is far enough.", "Check from the front.",
      "In some rook endings, frontal checks hold if distance is sufficient. Know when frontal defence works versus when you need the long side."),
    T("Umbrella technique", "Use a pawn as shelter against rook checks.", "Use the umbrella.",
      "When escorting a passer, a pawn can umbrella the king from checks. Sheltering technique converts many theoretical wins."),
    T("Bodycheck", "Shoulder the enemy king away from the action.", "Shoulder the king.",
      "Shouldering appears in pawn and rook endings. Place your king so theirs cannot approach key squares. Geometry over reckoning alone."),
    T("Reserve tempi", "Spare pawn moves win opposition fights.", "Use a reserve tempo.",
      "A spare pawn tempo can steal the opposition. Do not push every pawn early — keep a tempo in reserve for the critical moment."),
    T("Rook vs pawns", "Know when pawns beat a rook — and when they don't.", "Calculate rook vs pawns.",
      "Connected pawns on the sixth can outweigh a rook. Calculate races precisely using fundamental guidelines rather than hope."),
    T("Minor piece vs pawns", "Blockade passers from the front when possible.", "Blockade the passer.",
      "Knights and bishops stop passers differently. Prefer blockades that cannot be easily driven off. Theory prefers stable blockades."),
    T("Queen vs pawns", "Queen stops passers with checks from behind.", "Check and restrain.",
      "Queen vs advanced pawns: check from the rear and pick them up. Know the dangerous ranks where pawns become unstoppable without checks."),
    T("Lucena prep", "Get the king out and prepare the bridge.", "Prepare Lucena.",
      "Before the bridge, the king must step out and the rook must cut. Preparation moves are part of the Lucena method — do not rush the pawn alone."),
    T("Philidor timing", "Wait on the third; check from behind at the sixth.", "Time the Philidor switch.",
      "Switching too early from the third rank loses the draw. Wait until the pawn reaches the sixth, then check from behind. Timing is the theory."),
    T("Active king ending", "In pure pawn endings the king is an attacker.", "Activate the king.",
      "Activate the king toward key squares immediately. Passive kings lose fundamental pawn endings. Pathing matters as much as opposition."),
    T("Pawn breakthrough", "Sacrificial breakthroughs appear in pawn theories.", "Breakthrough now.",
      "Classic breakthrough shapes recur in manuals. Calculate whether the sac creates an unstoppable passer. Pattern recognition helps."),
    T("Drawn rook ending", "Recognise known drawing setups and head for them.", "Head for the known draw.",
      "When defending, steer toward Philidor, Vancura, or sufficient checking distance. Known draws are better than inventive losses."),
    T("Winning rook ending", "Recognise known wins — Lucena, cut-offs, activity.", "Head for the known win.",
      "When winning, steer toward Lucena or a decisive cut-off. Do not wander into a drawing setup. Theory is a map to the win."),
    T("Knight domination", "Dominate a knight so it has no safe squares.", "Dominate the knight.",
      "Domination motifs convert knight endings. Take away jumps, then zugzwang. Fundamental technique with short-range pieces."),
    T("Bishop skewer nets", "Align king and piece for a skewer on a diagonal.", "Set the skewer.",
      "Bishop endings and queen endings use skewers. Align valuables and force the win of material. Geometry is theory."),
    T("Promotion tactics", "Underpromotion and tempo promotions decide endings.", "Promote with purpose.",
      "Sometimes promote to a knight or delay promotion to avoid stalemate. Fundamental manuals insist on purposeful promotion."),
    T("Zugzwang nets", "Put them where every move loses.", "Force zugzwang.",
      "Zugzwang is the soul of many fundamental endings. Restrict until every pawn or king move collapses the defence."),
    T("Tablebase mindset", "Play the move theory would play — precision over style.", "Play the precise move.",
      "Reference endings reward precision. Choose the theoretically correct move even if a flashier one 'feels' winning. Accuracy first."),
    T("Conversion care", "Avoid stalemate and perpetual while converting.", "Convert carefully.",
      "Winning endings are lost to stalemate and perpetual. Leave flight squares, cover checks, then promote. Care is fundamental."),
    T("Manual review", "Pattern → path → precision.", "Play the reference move.",
      "Synthesise Fundamental Chess Endings: recognise the pattern, path the pieces, execute precisely. That is the move here."),
]

NAROD = [
    T("Messy reality", "Real endgames are messy — prioritise activity and practical chances.", "Play the practical active move.",
      "Naroditsky emphasises endings that arise from real games: imperfect structures, leftover pawns, and clock pressure. Prefer active practical moves over fragile theoretical perfection when the position is messy."),
    T("Rook ending activity", "Activate the rook even if a pawn drops.", "Activate at a pawn cost if needed.",
      "In practical rook endings, activity often outweighs a pawn. Naroditsky's examples repeatedly show passive rooks losing. Activate, check, and cut — then regroup."),
    T("King into the fray", "Bring the king into messy endings early.", "Activate the king.",
      "Complex endgames need fighting kings. Walk the king toward passed pawns, weak pawns, or supporting squares. Hesitant kings lose practical endings."),
    T("Passed pawn chaos", "Create a passer and force them to react.", "Create practical passer pressure.",
      "In messy positions, a passer clarifies the plan. Create one even if the structure is imperfect. Practical pressure beats abstract structure pride."),
    T("Calculate races", "When both sides run, count — then choose.", "Win the race count.",
      "Practical endgames often become races. Count tempi without romanticism. If you lose the race, switch to checking defence or a blockade plan."),
    T("Swindle sense", "When worse, fish for stalemate, perpetual, or fortress.", "Fish for the swindle.",
      "Mastering Complex Endgames includes saving resources. If losing, seek practical swindles: perpetual checks, stalemate nets, or fortress setups. Pride-less defence scores half-points."),
    T("Clock technique", "With little time, simplify the decision tree.", "Choose the simple active plan.",
      "Complex endings on low clock need simplified plans: activate rook, push passer, check from behind. Avoid ornate only-move paths you cannot calculate."),
    T("Trade decisions", "Trading into a pawn ending must be calculated, not hoped.", "Only trade if the ending wins.",
      "Practical players often mis-trade into drawn or lost pawn endings. Before the last trade, count. Naroditsky's lessons punish hopeful liquidations."),
    T("Two weaknesses practical", "Stretch their defence across two fronts.", "Open the second front.",
      "Even in endings, the two-weaknesses principle applies. Fix one target, create another, and let the defence collapse under dual duties."),
    T("Rook vs minor mess", "Coordinate the rook against imperfect minor-piece setups.", "Coordinate against the minor.",
      "Real games leave rook vs knight/bishop with pawns everywhere. Use cut-offs and double attacks rather than waiting for pure theory positions."),
    T("Queen ending practical", "Centralise, check, and avoid sleepwalking into perpetual.", "Centralise and stay alert.",
      "Practical queen endings are perpetual-check minefields. Centralise your queen, shelter your king, and calculate checks before grabbing pawns."),
    T("Bishop ending grit", "Same-colour bishop endings are grindable — create a second target.", "Grind with a second target.",
      "Messy bishop endings rarely look like textbooks. Fix pawns on their bishop's colour when attacking, or opposite when defending, and create a second front."),
    T("Knight ending forks", "In practical knight endings, fork nets appear suddenly.", "Watch for fork tactics.",
      "Knights in complex endings create tactical weather. Before each king move, scan forks. Practical technique includes constant short-range vigilance."),
    T("Connected passers practical", "Advance connected passers with king support.", "Advance with support.",
      "Connected passers win practical games when escorted. Bring the king, avoid premature splits that allow blockade, and roll them forward."),
    T("Split passers practical", "Make them choose which passer to stop.", "Force a choice.",
      "Two distant passers in a messy ending overwhelm a lone king or rook. Advance the one that maximises their dilemma."),
    T("Rook on seventh practical", "Invade the seventh and harvest.", "Invade the seventh.",
      "A rook on the seventh in complex endings wins pawns and mates nets. Practical priority: get there, even via a temporary pawn concession."),
    T("Defence first", "When under fire, extinguish counterplay before pushing.", "Kill counterplay first.",
      "Conversion in complex endings starts by stopping their passer or checks. Naroditsky stresses: remove their play, then win slowly."),
    T("Pawn storm residue", "Leftover attacking pawns become ending assets — or liabilities.", "Handle leftover pawns.",
      "After middlegame storms, odd pawn islands remain. Treat them as ending material: fix, exchange, or advance based on activity, not nostalgia for the attack."),
    T("Opposite bishops practical", "With rooks, opposite bishops favor the attacker.", "Attack with opposite bishops.",
      "Opposite bishops plus rooks in complex endings are often decisive for the side with initiative. Open lines toward the king; do not settle for a dry draw assumption."),
    T("Technical grit", "Win ugly — clarity over beauty.", "Choose the ugly clear win.",
      "Complex endgames reward ugly clarity: trade into a simple win, or fix a weakness and sit. Naroditsky's practical ethos: the point matters more than the aesthetic."),
    T("Check sequences", "Use checks to improve your pieces for free.", "Check to improve.",
      "Checking sequences in rook and queen endings can reposition with tempo. Calculate which check improves your king or rook before the quiet move."),
    T("Shelter building", "Build shelter against checks before pushing the win.", "Build shelter.",
      "When converting, spend a move making luft or an umbrella against perpetual ideas. Practical conversion includes anti-swindle moves."),
    T("Blockade in mess", "Blockade their passer even in chaotic structures.", "Blockade the dangerous passer.",
      "The most dangerous passer must be stopped first. Blockade, then clean the rest of the mess. Priority management is practical endgame skill."),
    T("Exchange to clarify", "Exchange into a clearer ending when ahead.", "Clarify by exchanging.",
      "When better in a mess, exchange into a clearer technical win. Complexity helps the defender. Clarity helps the favourite."),
    T("Complicate when worse", "When worse, keep pieces and keep tension.", "Keep complexity.",
      "Trailing in a complex ending, avoid simplifying into a lost pawn ending. Keep pieces, keep checking chances, keep hope."),
    T("King and pawn leftovers", "Pure pawn leftovers still need opposition skills.", "Apply opposition in the leftovers.",
      "Sometimes the mess simplifies to king and pawn. Switch instantly to opposition and key-square thinking. Dual fluency is the point of this book pairing."),
    T("Rook vs pawns practical", "Know when to sac the rook for the last pawns.", "Sac the rook if it draws/wins.",
      "Practical decisions include giving the rook for the remaining pawns to reach a drawn or won minor-piece ending. Calculate the resulting position."),
    T("Time-trouble endings", "Pre-move logic: checks, captures, threats.", "Play forcing practical moves.",
      "In time trouble, default to forcing moves that do not lose immediately. Complex endings punish hesitation more than slight inaccuracies."),
    T("Annotation mindset", "Ask: what is my plan, what is theirs, what changes?", "Play the planned practical move.",
      "Naroditsky's teaching voice asks clear questions. Answer them here: your plan, their plan, and the move that improves your answer."),
    T("Complex review", "Activity, passer priority, anti-swindle — then win.", "Play the complex-endgame move.",
      "Synthesise Mastering Complex Endgames: activate, prioritise dangerous passers, prevent swindles, convert. That practical stack is the move on this board."),
]

NAROD_X = [
    T("Double-rook endings", "Coordinate two rooks: seventh rank and cut-offs.", "Coordinate the heavy pieces.",
      "Double-rook endings in real games are about invasion and coordination. Double on the seventh or cut the king while creating a passer."),
    T("Rook and minor", "Use the minor to cover checks while the rook cuts.", "Coordinate rook + minor.",
      "Messy R+N or R+B endings need roles: minor covers, rook cuts/checks. Assign roles and play the move that fulfills one."),
    T("Queen and pawn mess", "Queen endings with many pawns: centralise and create a passer.", "Centralise and create a passer.",
      "Practical Q+P endings are about passer creation and king shelter. Centralise the queen, then advance the healthiest majority."),
    T("Breakthrough practical", "Breakthroughs appear in messy pawn structures too.", "Look for a breakthrough.",
      "Even imperfect structures allow sacrificial breakthroughs. Calculate whether a temporary piece or pawn sac creates an unstoppable runner."),
    T("Fortress breaking", "Against a fortress try, open a second front.", "Break the fortress try.",
      "Practical fortresses are imperfect. Open another file or create a second weakness rather than staring at a blocked door."),
    T("Fortress building", "When worse, build the ugliest holdable setup.", "Build a practical fortress.",
      "If losing, aim for a holdable blockade even if ugly. Naroditsky values half-points from stubborn structures."),
    T("Pawn islands", "Fewer islands usually help — trade accordingly.", "Improve the island count.",
      "Messy endings have many islands. Trades that reduce islands can clarify defence or conversion. Count islands as part of evaluation."),
    T("Active vs passive rook", "Never leave a rook passive for long.", "Activate the passive rook.",
      "The most common practical error: a babysitting rook. Swing it to activity even if a pawn falls, when theory and practice support the trade."),
    T("King march paths", "Choose a king path that avoids checks.", "March on a safe path.",
      "King marches fail to checks. Path via sheltered squares. Practical technique includes route planning, not just destination."),
    T("Zwischenzug endings", "In-between checks change capture sequences.", "Insert the zwischenzug.",
      "Complex endings still have zwischenzugs. Before recapturing, look for a check or mate threat that improves the result."),
    T("Skewer alerts", "Alignments on ranks and diagonals decide endings.", "Watch for skewers.",
      "Skewers end many practical games. Before parking king and rook on a line, scan alignments. Create them when attacking."),
    T("Promotion races", "Count both promotions — and the checking aftermath.", "Count promotion + aftermath.",
      "Promoting first is not enough if they promote with check. Calculate the full aftermath. Practical races include the move after promotion."),
    T("Underpromotion practical", "Underpromote to avoid stalemate or to fork.", "Consider underpromotion.",
      "Practical saves and wins include knight underpromotions. When a queen stalemates or fails, look for a knight."),
    T("Clean conversion", "Trade into a textbook win when you can force it.", "Force a textbook win.",
      "If you can force Philidor/Lucena/opposition territory, do it. Complex to simple is good technique when ahead."),
    T("Hold the draw", "Knowing you're drawn — play the holding moves only.", "Play the holding moves.",
      "Once a draw is forced with correct defence, stop inventing. Repeat the holding method. Practical draws are methodical."),
    T("Pressure psychology", "Pose problems until the clock or nerves crack.", "Pose a practical problem.",
      "Complex endings reward moves that force difficult choices. Prefer the problem-posing move among equals."),
    T("Recapture choice", "Automatic recaptures can ruin ending structures.", "Choose the right recapture.",
      "Which piece recaptures can decide the ending structure. Pause and choose. Practical discipline beats reflex."),
    T("Priority list", "1) Stop their passer 2) Activate 3) Create yours.", "Follow the priority list.",
      "A simple priority stack prevents panic in messes. Stop theirs, activate, then create yours. Play the move that matches the top unmet priority."),
    T("Endgame transition awareness", "The middlegame just ended — switch evaluation mode.", "Switch to ending evaluation.",
      "After queens come off mid-mess, switch criteria: king activity, passers, rook files. Middlegame plans may no longer apply."),
    T("Naroditsky synthesis", "Activity, priorities, anti-swindle, convert.", "Play the practical winning move.",
      "Final drill: activate pieces, prioritise dangerous passers, prevent swindles, and convert cleanly. That is Mastering Complex Endgames on this board."),
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
            f"then verify it against their strongest reply. "
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
    gelfand = GELFAND + GELFAND_X
    mueller = MUELLER + MUELLER_X
    narod = NAROD + NAROD_X
    lessons = (
        build("gelfand", gelfand, 1,
              "Positional Decision Making–style · elite planning ≈1900+",
              "Gelfand-style decisions")
        + build("mueller", mueller, 101,
                "Fundamental Chess Endings–style · endgame reference",
                "Müller & Lamprecht–style endings")
        + build("naroditsky", narod, 201,
                "Mastering Complex Endgames–style · practical endings",
                "Naroditsky-style complex endings")
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
