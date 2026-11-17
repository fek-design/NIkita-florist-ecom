// Builds every logo file the site needs from the cropped masters in
// ref/brand/logo/ (made by crop-logo.mjs). Only colours are swapped and
// frames cropped; no shape is changed. Run from the repository root:
//   node ref/brand/scripts/export-logo.mjs
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const require = createRequire(resolve("package.json"));
const { chromium } = require("playwright-core");

const dir = resolve("ref/brand/logo");
const SAND = "#7A644F";
const colours = { sand: "#7A644F", ink: "#2D2A26", paper: "#F7F4EF" };
const PAPER = colours.paper;

// 1. Colour variants: swap the single artwork colour.
const masters = { full: readFileSync(`${dir}/logo.svg`, "utf8"), half: readFileSync(`${dir}/logo-half.svg`, "utf8") };
for (const [shape, svg] of Object.entries(masters)) {
  if (!svg.includes(SAND)) throw new Error(`${shape} master does not use ${SAND}`);
  for (const [name, hex] of Object.entries(colours)) {
    writeFileSync(`${dir}/logo-${shape}-${name}.svg`, svg.replaceAll(SAND, hex));
  }
}

const browser = await chromium.launch();
const page = await browser.newPage();
const dataUrl = (svg) => "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");

async function render(svg, width, out, { background = null, size = null, pad = 0 } = {}) {
  const w = size ?? width;
  await page.setViewportSize({ width: w, height: size ?? 2000 });
  await page.setContent(
    `<body style="margin:0;background:${background ?? "transparent"}">` +
      `<div id="b" style="${size ? `width:${size}px;height:${size}px;display:grid;place-items:center;` : ""}">` +
      `<img id="i" src="${dataUrl(svg)}" style="display:block;${size ? `width:${size - 2 * pad}px;` : `width:${width}px;`}height:auto"></div></body>`,
  );
  await page.waitForFunction(() => document.getElementById("i").complete);
  await page.locator("#b").screenshot({ path: out, omitBackground: background === null });
}

// 2. Web rasters at the sizes the site uses, at 1x, 2x and 3x pixel density.
//    Half moon in the navbar: 110 px wide. Full lockup in the footer: 160 px.
mkdirSync(`${dir}/web`, { recursive: true });
const uses = [
  ["half", "sand", 110],
  ["full", "sand", 160],
  ["full", "paper", 160],
];
for (const [shape, colour, css] of uses) {
  const svg = masters[shape].replaceAll(SAND, colours[colour]);
  for (const scale of [1, 2, 3]) {
    await render(svg, css * scale, `${dir}/web/logo-${shape}-${colour}-${css}w@${scale}x.png`);
  }
}

// 3. Favicon: the leaf, cropped from the full master by frame only.
await page.setViewportSize({ width: 1000, height: 1000 });
await page.setContent(masters.full);
const leaf = await page.evaluate(() => {
  const svg = document.querySelector("svg");
  const all = svg.getBBox();
  let box = null;
  for (const el of svg.querySelectorAll("path")) {
    if (el.closest("mask, clipPath, defs")) continue;
    const b = el.getBBox();
    // Leaf strokes: small shapes in the upper part, above the name.
    if (b.width > 0.4 * all.width || b.y + b.height > all.y + 0.36 * all.height) continue;
    box = box
      ? { x1: Math.min(box.x1, b.x), y1: Math.min(box.y1, b.y), x2: Math.max(box.x2, b.x + b.width), y2: Math.max(box.y2, b.y + b.height) }
      : { x1: b.x, y1: b.y, x2: b.x + b.width, y2: b.y + b.height };
  }
  return box;
});
const side = Math.max(leaf.x2 - leaf.x1, leaf.y2 - leaf.y1) + 8;
const cx = (leaf.x1 + leaf.x2) / 2, cy = (leaf.y1 + leaf.y2) / 2;
const r = (n) => Math.round(n * 100) / 100;
const vb = `${r(cx - side / 2)} ${r(cy - side / 2)} ${r(side)} ${r(side)}`;
const leafSvg = masters.full
  .replace(/<svg\b[^>]*>/, (tag) => tag.replace(/\swidth="[^"]*"/, ' width="512"').replace(/\sheight="[^"]*"/, ' height="512"').replace(/\sviewBox="[^"]*"/, ` viewBox="${vb}"`))
  // Hide the circle arcs and name that fall inside the square: clip to the leaf box.
  .replace(/(<svg\b[^>]*>)/, `$1<clipPath id="leaf-only"><rect x="${r(leaf.x1 - 4)}" y="${r(leaf.y1 - 4)}" width="${r(leaf.x2 - leaf.x1 + 8)}" height="${r(leaf.y2 - leaf.y1 + 8)}"/></clipPath><g clip-path="url(#leaf-only)">`)
  .replace(/<\/svg>\s*$/, "</g></svg>");
mkdirSync(`${dir}/favicon`, { recursive: true });
// No favicon.svg is shipped: it would carry the whole 800 KB drawing behind
// the crop. The PNGs below are a few KB each.
// Paper square behind the leaf so it shows on light and dark browser tabs.
await render(leafSvg, 32, `${dir}/favicon/favicon-32.png`, { size: 32, background: PAPER, pad: 2 });
await render(leafSvg, 180, `${dir}/favicon/apple-touch-icon-180.png`, { size: 180, background: PAPER, pad: 24 });
await render(leafSvg, 512, `${dir}/favicon/icon-512.png`, { size: 512, background: PAPER, pad: 64 });

await browser.close();
console.log(`Exported colour variants, web rasters and favicons. Leaf box viewBox: ${vb}`);
