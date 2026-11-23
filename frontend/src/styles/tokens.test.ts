import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// The brand's tokens live in ref/brand/tokens.css. The frontend keeps a
// copy (Vercel builds only frontend/), so this test fails when they drift.

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const brand = readFileSync(here("../../../ref/brand/tokens.css"), "utf8");
const app = readFileSync(here("./tokens.css"), "utf8");

/** Custom properties declared in the :root block, as name → value. */
export function rootTokens(css: string): Map<string, string> {
  const start = css.indexOf(":root {");
  if (start === -1) throw new Error("no :root block");
  const body = css.slice(start, css.indexOf("\n}", start));
  const withoutComments = body.replace(/\/\*[\s\S]*?\*\//g, "");
  const tokens = new Map<string, string>();
  for (const match of withoutComments.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    // Compare values, not formatting: Prettier may wrap a value.
    const value = match[2]
      .replace(/\s+/g, " ")
      .replace(/\(\s+/g, "(")
      .replace(/\s+\)/g, ")")
      .trim();
    tokens.set(match[1], value);
  }
  return tokens;
}

describe("brand tokens in the frontend", () => {
  it("match ref/brand/tokens.css exactly", () => {
    expect(Object.fromEntries(rootTokens(app))).toEqual(
      Object.fromEntries(rootTokens(brand)),
    );
  });

  it("include the palette and the muted text role (DD-24)", () => {
    const tokens = rootTokens(app);
    expect(tokens.get("--paper")).toBe("#f7f4ef");
    expect(tokens.get("--ink")).toBe("#2d2a26");
    expect(tokens.get("--color-text-muted")).toBe("var(--sand)");
  });

  it("notices a changed value", () => {
    const changed = app.replace("--sand: #7a644f", "--sand: #7a644e");
    expect(Object.fromEntries(rootTokens(changed))).not.toEqual(
      Object.fromEntries(rootTokens(brand)),
    );
  });
});
