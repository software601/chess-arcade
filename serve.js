#!/usr/bin/env node
/**
 * Shared native HTTPS static server — no npm dependencies.
 * Pretty game URLs come from games.json (path → file).
 */
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const os = require("os");

const ROOT = __dirname;
const DOMAIN = "bitcointera.com";
const KEY_FILE = path.join(ROOT, `keypri${DOMAIN}.pem`);
const CERT_FILE = path.join(ROOT, `keypub${DOMAIN}.pem`);
const GAMES_FILE = path.join(ROOT, "games.json");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

const BLOCKED = new Set([path.basename(KEY_FILE), path.basename(CERT_FILE)]);

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function safeJoin(root, reqPath) {
  const decoded = decodeURIComponent(reqPath.split("?")[0]);
  const cleaned = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const full = path.join(root, cleaned);
  if (!full.startsWith(root + path.sep) && full !== root) return null;
  return full;
}

function loadGames() {
  try {
    return JSON.parse(fs.readFileSync(GAMES_FILE, "utf8"));
  } catch {
    return [];
  }
}

/** Build /snake → snake.html map (and aliases) from games.json */
function buildRoutes(games) {
  const routes = Object.create(null);
  for (const g of games) {
    if (!g.path || !g.file) continue;
    const file = g.file.startsWith("/") ? g.file : `/${g.file}`;
    const main = g.path.startsWith("/") ? g.path : `/${g.path}`;
    routes[main] = file;
    routes[main + "/"] = file;
    for (const a of g.aliases || []) {
      const alias = a.startsWith("/") ? a : `/${a}`;
      routes[alias] = file;
      routes[alias + "/"] = file;
    }
  }
  return routes;
}

function resolvePathname(pathname, homePage, routes) {
  if (pathname === "/") return homePage;
  if (routes[pathname]) return routes[pathname];
  // /snake/index.html already under a game folder — leave as-is
  return pathname;
}

function makeHandler(homePage) {
  return function handler(req, res) {
    if (req.method !== "GET" && req.method !== "HEAD") {
      send(res, 405, "Method Not Allowed", { "Content-Type": "text/plain" });
      return;
    }

    let pathname;
    try {
      pathname = new URL(req.url || "/", `https://${req.headers.host || "localhost"}`)
        .pathname;
    } catch {
      send(res, 400, "Bad Request", { "Content-Type": "text/plain" });
      return;
    }

    // Reload routes each request so new games in games.json work without restart
    const routes = buildRoutes(loadGames());

    // Directory URL → index.html (e.g. /snake/ → /snake/index.html)
    if (pathname.endsWith("/") && pathname !== "/") {
      const indexed = pathname + "index.html";
      const indexedPath = safeJoin(ROOT, indexed);
      if (indexedPath && fs.existsSync(indexedPath)) {
        pathname = indexed;
      } else {
        pathname = resolvePathname(pathname, homePage, routes);
      }
    } else {
      pathname = resolvePathname(pathname, homePage, routes);
    }

    const base = path.basename(pathname);
    if (BLOCKED.has(base) || base.toLowerCase().endsWith(".pem")) {
      send(res, 403, "Forbidden", { "Content-Type": "text/plain" });
      return;
    }

    const filePath = safeJoin(ROOT, pathname);
    if (!filePath) {
      send(res, 403, "Forbidden", { "Content-Type": "text/plain" });
      return;
    }

    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        send(res, 404, "Not Found", { "Content-Type": "text/plain" });
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const type = MIME[ext] || "application/octet-stream";
      const headers = {
        "Content-Type": type,
        "Content-Length": stat.size,
        "Cache-Control": "no-cache",
      };

      // Full multi-threaded Stockfish needs SharedArrayBuffer → COOP + COEP.
      // Scope to chessmulti / puzzlemulti so the rest of the arcade is unaffected.
      if (
        pathname.startsWith("/chessmulti") ||
        pathname.startsWith("/puzzlemulti")
      ) {
        headers["Cross-Origin-Opener-Policy"] = "same-origin";
        headers["Cross-Origin-Embedder-Policy"] = "require-corp";
        headers["Cross-Origin-Resource-Policy"] = "same-origin";
      }

      if (req.method === "HEAD") {
        res.writeHead(200, headers);
        res.end();
        return;
      }

      const stream = fs.createReadStream(filePath);
      res.writeHead(200, headers);
      stream.pipe(res);
      stream.on("error", () => {
        if (!res.headersSent) {
          send(res, 500, "Server Error", { "Content-Type": "text/plain" });
        } else {
          res.destroy();
        }
      });
    });
  };
}

function loadTls() {
  if (!fs.existsSync(KEY_FILE) || !fs.existsSync(CERT_FILE)) {
    console.error(`Missing TLS files:\n  ${KEY_FILE}\n  ${CERT_FILE}`);
    process.exit(1);
  }
  const key = fs.readFileSync(KEY_FILE);
  const cert = fs.readFileSync(CERT_FILE);
  if (!String(cert).includes("BEGIN CERTIFICATE")) {
    console.error(
      `${path.basename(CERT_FILE)} is not a TLS certificate (need BEGIN CERTIFICATE).`
    );
    process.exit(1);
  }
  return { key, cert };
}

function localIps() {
  const nets = os.networkInterfaces();
  const out = [];
  for (const list of Object.values(nets)) {
    for (const n of list || []) {
      if (n.family === "IPv4" && !n.internal) out.push(n.address);
    }
  }
  return out;
}

function start(opts) {
  const HTTPS_PORT = Number(process.argv[2]) || 9501;
  const WANT_HTTP = process.argv[3] === "http";
  const HTTP_PORT = Number(process.argv[4]) || 8080;
  const homePage = opts.homePage.startsWith("/") ? opts.homePage : `/${opts.homePage}`;

  const tls = loadTls();
  const server = https.createServer(tls, makeHandler(homePage));

  server.listen(HTTPS_PORT, "0.0.0.0", () => {
    const ips = localIps();
    const games = loadGames();
    console.log(`${opts.name} HTTPS on 0.0.0.0:${HTTPS_PORT}`);
    console.log(`  https://localhost:${HTTPS_PORT}/`);
    console.log(`  https://${DOMAIN}:${HTTPS_PORT}/`);
    for (const g of games) {
      const p = g.path || g.href;
      if (p) console.log(`  https://${DOMAIN}:${HTTPS_PORT}${p}`);
    }
    for (const ip of ips) console.log(`  https://${ip}:${HTTPS_PORT}/`);
    console.log("Press Ctrl+C to stop");
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Port ${HTTPS_PORT} in use. Try: node ${opts.entry} ${HTTPS_PORT + 1}`
      );
    } else if (err.code === "EACCES") {
      console.error(`Need permission for port ${HTTPS_PORT}. Try sudo or another port.`);
    } else {
      console.error(err);
    }
    process.exit(1);
  });

  if (WANT_HTTP) {
    const redirect = http.createServer((req, res) => {
      const host = (req.headers.host || DOMAIN).replace(/:\d+$/, "");
      const loc = `https://${host}:${HTTPS_PORT}${req.url || "/"}`;
      res.writeHead(301, { Location: loc });
      res.end();
    });
    redirect.listen(HTTP_PORT, "0.0.0.0", () => {
      console.log(`HTTP redirect :${HTTP_PORT} → https :${HTTPS_PORT}`);
    });
    redirect.on("error", (err) => {
      console.error("HTTP redirect failed:", err.message);
    });
  }
}

module.exports = { start, loadGames, buildRoutes };

if (require.main === module) {
  start({
    name: "Arcade",
    homePage: "/index.html",
    entry: "serve.js",
  });
}
