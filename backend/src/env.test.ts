import { describe, expect, it } from "vitest";
import { assertEnv, missingEnv } from "./env.js";

describe("environment check", () => {
  it("passes when every variable is set", () => {
    expect(() =>
      assertEnv({ DATABASE_URL: "postgres://x", JOB_SECRET: "y" }),
    ).not.toThrow();
  });

  it("names the missing variable", () => {
    expect(() => assertEnv({})).toThrow(/DATABASE_URL/);
  });

  it("treats a blank value as missing", () => {
    expect(missingEnv({ DATABASE_URL: "  ", JOB_SECRET: "y" })).toEqual([
      "DATABASE_URL",
    ]);
  });
});
