import { describe, expect, it } from "vitest";
import { assertEnv, missingEnv, siteUrl } from "./env";

describe("frontend environment check", () => {
  it("passes when every variable is set", () => {
    expect(() =>
      assertEnv({ BACKEND_URL: "http://localhost:4000" }),
    ).not.toThrow();
  });

  it("names the missing variable", () => {
    expect(() => assertEnv({})).toThrow(/BACKEND_URL/);
  });

  it("treats a blank value as missing", () => {
    expect(missingEnv({ BACKEND_URL: " " })).toEqual(["BACKEND_URL"]);
  });

  it("never asks for database credentials", () => {
    expect(missingEnv({})).not.toContain("DATABASE_URL");
  });
});

describe("siteUrl", () => {
  it("uses SITE_URL without a trailing slash", () => {
    expect(siteUrl({ SITE_URL: "https://blomster.dk/" })).toBe(
      "https://blomster.dk",
    );
  });

  it("falls back to Vercel's production address", () => {
    expect(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "shop.vercel.app" })).toBe(
      "https://shop.vercel.app",
    );
  });

  it("falls back to the local dev server", () => {
    expect(siteUrl({})).toBe("http://localhost:3000");
  });
});
