// Reads the colour tokens from ref/brand/tokens.css, computes the WCAG 2.1
// contrast ratio of every text-on-ground pairing, and writes
// ref/brand/contrast.md. Run: node ref/brand/scripts/contrast.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, "..", "tokens.css"), "utf8");

const names = ["paper", "linen", "sand", "ink", "error", "success"];
const grounds = ["paper", "linen", "sand", "ink"];

const hex = {};
for (const name of names) {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match) throw new Error(`Token --${name} not found in tokens.css`);
  hex[name] = match[1].toUpperCase();
}

function luminance(h) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function verdict(r) {
  if (r >= 4.5) return "Allowed: all text";
  if (r >= 3) return "Large text and UI parts only";
  return "Forbidden";
}

const cap = (s) => s[0].toUpperCase() + s.slice(1);
const rows = [];
for (const ground of grounds) {
  for (const text of names) {
    if (text === ground) continue;
    const r = ratio(hex[text], hex[ground]);
    rows.push({ text, ground, r });
  }
}

const today = new Date().toISOString().slice(0, 10);
const lines = [
  "# Colour pairings",
  "",
  `Generated from \`tokens.css\` by \`scripts/contrast.mjs\` on ${today}. Do not edit by hand: change the tokens and run the script again.`,
  "",
  "WCAG 2.1 AA (P9): body text needs at least **4.5:1**. Large text (24 px and up, or 18.66 px bold) and interface parts such as borders, icons and focus rings need at least **3:1**. Below 3:1 is forbidden for anything that carries meaning.",
  "",
  "| Text or part | On ground | Ratio | Use |",
  "|---|---|---|---|",
  ...rows.map(
    ({ text, ground, r }) =>
      `| ${cap(text)} \`${hex[text]}\` | ${cap(ground)} \`${hex[ground]}\` | ${r.toFixed(2)}:1 | ${verdict(r)} |`,
  ),
  "",
  "## Focus ring",
  "",
  "The focus ring is two-tone (`--focus-ring`): Ink inside, Paper outside. On light grounds the Ink ring carries the contrast, on Sand and Ink the Paper halo does:",
  "",
  ...grounds.map((g) => {
    const best = Math.max(ratio(hex.ink, hex[g]), ratio(hex.paper, hex[g]));
    return `- On ${cap(g)}: ${best.toFixed(2)}:1 (${best >= 3 ? "passes" : "FAILS"} 3:1)`;
  }),
  "",
];

writeFileSync(join(here, "..", "contrast.md"), lines.join("\n"));

const failures = rows.filter((x) => x.r < 3).length;
console.log(`Wrote contrast.md: ${rows.length} pairings, ${failures} forbidden.`);
