import { describe, expect, it } from "vitest";
import { assertEnv, missingEnv } from "./env";

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
