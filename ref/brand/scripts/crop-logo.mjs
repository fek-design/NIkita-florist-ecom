// Crops an SVG logo to its drawing: measures the artwork in a headless
// browser and rewrites only the viewBox, width and height. No path, colour
// or shape is changed. Felix designs the artwork; this only fits the frame.
//
// Run from the repository root:
//   node ref/brand/scripts/crop-logo.mjs ref/brand/Logo.svg ref/brand/logo/logo.svg [padding]
// Needs the Playwright browser installed for the frontend workspace.
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const require = createRequire(resolve("package.json"));
const { chromium } = require("playwright-core");

const [input, output, padArg] = process.argv.slice(2);
if (!input || !output) {
  console.error("Usage: node crop-logo.mjs <input.svg> <output.svg> [padding]");
  process.exit(1);
}
const padding = Number(padArg ?? 4); // covers stroke width, which getBBox leaves out

const source = readFileSync(input, "utf8");
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("file://" + resolve(input));
const box = await page.evaluate(() => {
  const b = document.querySelector("svg").getBBox();
  return { x: b.x, y: b.y, w: b.width, h: b.height };
});
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
