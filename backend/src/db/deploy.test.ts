import { describe, expect, it } from "vitest";
import { deployPlan } from "./deploy.js";

const db = { DATABASE_URL_UNPOOLED: "postgres://x" };

describe("deployPlan", () => {
  it("does nothing outside Vercel (CI, local builds)", () => {
    expect(deployPlan({ ...db })).toMatchObject({
      migrate: false,
      seed: false,
    });
  });

  it("migrates and seeds preview and staging builds", () => {
    expect(
      deployPlan({ ...db, VERCEL: "1", VERCEL_ENV: "preview" }),
    ).toMatchObject({ migrate: true, seed: true });
  });

  it("migrates but never seeds production", () => {
    expect(
      deployPlan({ ...db, VERCEL: "1", VERCEL_ENV: "production" }),
    ).toMatchObject({ migrate: true, seed: false });
  });

  it("stops a Vercel build that has no database address", () => {
    expect(() => deployPlan({ VERCEL: "1", VERCEL_ENV: "preview" })).toThrow(
      /cannot migrate/,
    );
  });
});
