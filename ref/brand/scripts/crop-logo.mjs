// Crops an SVG logo to its drawing: measures the artwork in a headless
// browser and rewrites only the viewBox, width and height. No path, colour
// or shape is changed. Felix designs the artwork; this only fits the frame.
//
// Run from the repository root:
//   node ref/brand/scripts/crop-logo.mjs <in.svg> <out.svg> [padding] [--half]
// --half crops the bottom of the frame just above where the lower half of
// the circle starts, giving the half-moon lockup (top arc, leaf, name) for
// the navbar. The circle is drawn as two wide arcs; the lower one is the
// wide shape whose top is furthest down.
// Needs the Playwright browser installed for the frontend workspace.
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const require = createRequire(resolve("package.json"));
const { chromium } = require("playwright-core");

const args = process.argv.slice(2);
const half = args.includes("--half");
const [input, output, padArg] = args.filter((a) => a !== "--half");
if (!input || !output) {
  console.error("Usage: node crop-logo.mjs <input.svg> <output.svg> [padding]");
  process.exit(1);
}
const padding = Number(padArg ?? 4); // covers stroke width, which getBBox leaves out

const source = readFileSync(input, "utf8");
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("file://" + resolve(input));
const box = await page.evaluate((half) => {
  const svg = document.querySelector("svg");
  const b = svg.getBBox();
  const box = { x: b.x, y: b.y, w: b.width, h: b.height };
  if (half) {
    const wide = [];
    for (const el of svg.querySelectorAll("path")) {
      if (el.closest("mask, clipPath, defs")) continue;
      const e = el.getBBox();
      if (e.width > 0.6 * box.w && e.height > 0.2 * box.h) wide.push(e);
    }
    if (wide.length < 2) throw new Error("Could not find the two circle arcs for --half");
    const lowerArcTop = Math.max(...wide.map((e) => e.y));
    box.h = lowerArcTop - 6 - box.y; // stop just above the lower arc
  }
  return box;
}, half);
await browser.close();

const r = (n) => Math.round(n * 100) / 100;
const x = r(box.x - padding);
const y = r(box.y - padding);
const w = r(box.w + 2 * padding);
const h = r(box.h + 2 * padding);

const openTag = source.match(/<svg\b[^>]*>/);
if (!openTag) throw new Error("No <svg> element found");
const newTag = openTag[0]
  .replace(/\swidth="[^"]*"/, ` width="${w}"`)
  .replace(/\sheight="[^"]*"/, ` height="${h}"`)
  .replace(/\sviewBox="[^"]*"/, ` viewBox="${x} ${y} ${w} ${h}"`);

mkdirSync(dirname(resolve(output)), { recursive: true });
writeFileSync(output, source.replace(openTag[0], newTag));
console.log(`Cropped ${input} -> ${output}: viewBox ${x} ${y} ${w} ${h}`);
