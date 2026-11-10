#!/usr/bin/env node
/**
 * Common static server for all arcade games.
 *
 *   node serv.js
 *     → :9500  http://127.0.0.1:9500/
 *     → :9501  https://bitcointera.com:9501/chess
 *       (HTTP+HTTPS on both ports when .pem certs exist)
 *
 *   node serv.js http          → HTTP only on :9500
 *   node serv.js 9501          → only that port
 *
 * Home page lists every game in games.json — add new games there.
 */
require("./serve").start({
  name: "Arcade",
  homePage: "/index.html",
  entry: "serv.js",
});
