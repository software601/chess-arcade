#!/usr/bin/env node
/**
 * Common HTTPS server for all arcade games.
 *
 *   node serv.js
 *   node serv.js 9501
 *   node serv.js 9501 http 8080
 *
 * Home page lists every game in games.json — add new games there.
 */
require("./serve").start({
  name: "Arcade",
  homePage: "/index.html",
  entry: "serv.js",
});
