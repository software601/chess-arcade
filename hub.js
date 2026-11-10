(() => {
  const chessList = document.getElementById("chess-list");
  const otherList = document.getElementById("other-list");
  const CHESS_IDS = new Set([
    "chess",
    "chesspuzzles",
    "chessmulti",
    "puzzlemulti",
    "chess001",
    "chess002",
    "chess003",
    "chess004",
    "chess005",
    "chess006",
    "chess007",
    "chess008",
  ]);

  function fill(ul, games) {
    ul.innerHTML = "";
    for (const g of games) {
      const href = g.path || g.href || "#";
      const li = document.createElement("li");
      li.innerHTML = `<a href="${href}"><h2>${g.title}</h2><p>${g.blurb || ""}</p></a>`;
      ul.appendChild(li);
    }
  }

  fetch("/games.json", { cache: "no-store" })
    .then((r) => {
      if (!r.ok) throw new Error("game list missing");
      return r.json();
    })
    .then((games) => {
      const chess = [];
      const other = [];
      for (const g of games) {
        if (CHESS_IDS.has(g.id)) chess.push(g);
        else other.push(g);
      }
      fill(chessList, chess);
      fill(otherList, other);
    })
    .catch(() => {
      chessList.innerHTML =
        '<li><a href="/chess"><h2>Chess</h2><p>Fallback link</p></a></li>';
      otherList.innerHTML =
        '<li><a href="/snake"><h2>Snake</h2><p>Fallback link</p></a></li>';
    });
})();
