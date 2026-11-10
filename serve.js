#!/usr/bin/env node
/**
 * Shared native static server (HTTPS or plain HTTP) — no npm dependencies.
 * Pretty game URLs come from games.json (path → file).
 * Without TLS .pem files, serves plain HTTP so clones just need Node.
 */
const http = require("http");
const https = require("https");
const net = require("net");
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

function hasTlsFiles() {
  return fs.existsSync(KEY_FILE) && fs.existsSync(CERT_FILE);
}

function loadTls() {
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

const LOCAL_PORT = 9500; // http://127.0.0.1:9500/
const PUBLIC_PORT = 9501; // https://bitcointera.com:9501/chess

/**
 * Args:
 *   node serv.js                 → :9500 + :9501 (HTTP+HTTPS) when certs exist
 *   node serv.js 9500            → only that port
 *   node serv.js http [port]     → HTTP only
 *   node serv.js https [port]    → HTTPS only
 *
 * Dual-protocol on each port (TLS sniff): http:// and https:// both work.
 */
function parseArgs() {
  const a = process.argv.slice(2);

  if (a[0] === "http") {
    return { mode: "http", port: Number(a[1]) || LOCAL_PORT, redirectPort: null, ports: null };
  }
  if (a[0] === "https") {
    return { mode: "https", port: Number(a[1]) || LOCAL_PORT, redirectPort: null, ports: null };
  }

  if (a[0] != null && Number.isFinite(Number(a[0]))) {
    const port = Number(a[0]);
    if (a[1] === "http" && a[2] == null) {
      return { mode: "http", port, redirectPort: null, ports: null };
    }
    if (a[1] === "https" && a[2] == null) {
      return { mode: "https", port, redirectPort: null, ports: null };
    }
    if (a[1] === "redirect" || a[1] === "http" || a[1] === "https") {
      return {
        mode: "dual",
        port,
        redirectPort: Number(a[2]) || 8080,
        ports: null,
      };
    }
    return { mode: "auto", port, redirectPort: null, ports: [port] };
  }
  // Default: local 9500 + public 9501
  return {
    mode: "auto",
    port: LOCAL_PORT,
    redirectPort: null,
    ports: [LOCAL_PORT, PUBLIC_PORT],
  };
}

function onListenError(err, port, entry, { fatal = true } = {}) {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${port} in use.${fatal ? ` Try: node ${entry} ${port + 1}` : " (skipping)"}`);
  } else if (err.code === "EACCES") {
    console.error(`Need permission for port ${port}.${fatal ? " Try sudo or another port." : " (skipping)"}`);
  } else {
    console.error(err);
  }
  if (fatal) process.exit(1);
}

function printUrls(opts, schemes, port) {
  const list = Array.isArray(schemes) ? schemes : [schemes];
  const ips = localIps();
  const games = loadGames();
  const label = list.map((s) => s.toUpperCase()).join("+");
  console.log(`${opts.name} ${label} on 0.0.0.0:${port}`);
  for (const scheme of list) {
    console.log(`  ${scheme}://localhost:${port}/`);
    console.log(`  ${scheme}://127.0.0.1:${port}/`);
    if (scheme === "https") {
      console.log(`  ${scheme}://${DOMAIN}:${port}/`);
      console.log(`  ${scheme}://${DOMAIN}:${port}/chess`);
    }
  }
  for (const g of games) {
    const p = g.path || g.href;
    if (!p) continue;
    for (const scheme of list) {
      console.log(`  ${scheme}://localhost:${port}${p}`);
    }
  }
  for (const ip of ips) {
    for (const scheme of list) {
      console.log(`  ${scheme}://${ip}:${port}/`);
    }
  }
  console.log("Press Ctrl+C to stop");
}

function startRedirect(port, httpsPort) {
  const redirect = http.createServer((req, res) => {
    const host = (req.headers.host || DOMAIN).replace(/:\d+$/, "");
    const loc = `https://${host}:${httpsPort}${req.url || "/"}`;
    res.writeHead(301, { Location: loc });
    res.end();
  });
  redirect.listen(port, "0.0.0.0", () => {
    console.log(`HTTP redirect :${port} → https :${httpsPort}`);
  });
  redirect.on("error", (err) => {
    console.error("HTTP redirect failed:", err.message);
  });
}

function startHttp(opts, port, homePage, { fatal = true } = {}) {
  const server = http.createServer(makeHandler(homePage));
  server.listen(port, "0.0.0.0", () => printUrls(opts, "http", port));
  server.on("error", (err) => onListenError(err, port, opts.entry, { fatal }));
}

function startHttps(opts, port, homePage, redirectPort, { fatal = true } = {}) {
  const server = https.createServer(loadTls(), makeHandler(homePage));
  server.listen(port, "0.0.0.0", () => printUrls(opts, "https", port));
  server.on("error", (err) => onListenError(err, port, opts.entry, { fatal }));
  if (redirectPort != null) startRedirect(redirectPort, port);
}

/** One TCP port: route TLS ClientHello → HTTPS, else → HTTP. */
function startDual(opts, port, homePage, redirectPort, { fatal = true } = {}) {
  const handler = makeHandler(homePage);
  const httpServer = http.createServer(handler);
  const httpsServer = https.createServer(loadTls(), handler);

  const server = net.createServer((socket) => {
    socket.once("error", () => {
      try {
        socket.destroy();
      } catch (_) {
        /* ignore */
      }
    });
    socket.once("data", (buf) => {
      socket.pause();
      // 0x16 = TLS handshake; 0x80 = legacy SSLv2-style header
      const isTls = buf[0] === 0x16 || buf[0] === 0x80;
      socket.unshift(buf);
      (isTls ? httpsServer : httpServer).emit("connection", socket);
      process.nextTick(() => {
        try {
          socket.resume();
        } catch (_) {
          /* ignore */
        }
      });
    });
  });

  server.listen(port, "0.0.0.0", () => printUrls(opts, ["http", "https"], port));
  server.on("error", (err) => onListenError(err, port, opts.entry, { fatal }));
  if (redirectPort != null) startRedirect(redirectPort, port);
}

function start(opts) {
  const homePage = opts.homePage.startsWith("/") ? opts.homePage : `/${opts.homePage}`;
  const args = parseArgs();

  let mode = args.mode;
  if (mode === "auto") {
    mode = hasTlsFiles() ? "dual" : "http";
    if (mode === "http") {
      console.log("No TLS certs found — serving plain HTTP only.");
    }
  } else if ((mode === "https" || mode === "dual") && !hasTlsFiles()) {
    console.log("No TLS certs found — falling back to plain HTTP.");
    mode = "http";
  }

  const ports = args.ports || [args.port];
  ports.forEach((port, i) => {
    const fatal = i === 0; // first port must bind; extra ports are best-effort
    const redirect = i === 0 ? args.redirectPort : null;
    if (mode === "http") {
      startHttp(opts, port, homePage, { fatal });
    } else if (mode === "https") {
      startHttps(opts, port, homePage, redirect, { fatal });
    } else {
      startDual(opts, port, homePage, redirect, { fatal });
    }
  });
}

module.exports = { start, loadGames, buildRoutes };

if (require.main === module) {
  start({
    name: "Arcade",
    homePage: "/index.html",
    entry: "serve.js",
  });
}
