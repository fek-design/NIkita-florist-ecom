import { describe, expect, it } from "vitest";
import { formatKroner } from "./money";

describe("formatKroner", () => {
  it("formats whole kroner without decimals", () => {
    expect(formatKroner(25000)).toBe("250 kr.");
  });

  it("uses Danish separators", () => {
    expect(formatKroner(125050)).toBe("1.250,50 kr.");
  });

  it("rejects fractions of an øre", () => {
    expect(() => formatKroner(10.5)).toThrow(TypeError);
  });
});
