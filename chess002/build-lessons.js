#!/usr/bin/env node
/** Validate chess002/lessons-data.json — 200 lessons per book. */
const LESSONS = require("./lessons-data.json");
if (LESSONS.length !== 600) {
  console.error("Expected 600, got", LESSONS.length);
  process.exit(1);
}
const by = {};
LESSONS.forEach((l) => {
  by[l.book] = (by[l.book] || 0) + 1;
});
for (const book of ["chandler", "masetti", "chernev"]) {
  if (by[book] !== 200) {
    console.error(book, "expected 200, got", by[book]);
    process.exit(1);
  }
}
console.log("OK", LESSONS.length, by);
