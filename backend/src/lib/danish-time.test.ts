import { describe, expect, it } from "vitest";
import { danishDate, hoursAndMinutes } from "./danish-time.js";

describe("danishDate", () => {
  it("is already tomorrow in Denmark late in the UTC evening", () => {
    // 23:30 UTC on 19 Nov is 00:30 on 20 Nov in Denmark (winter time).
    expect(danishDate(new Date("2026-11-19T23:30:00Z"))).toBe("2026-11-20");
  });

  it("follows summer time", () => {
    // 22:30 UTC on 1 Jul is 00:30 on 2 Jul in Denmark (UTC+2).
    expect(danishDate(new Date("2026-07-01T22:30:00Z"))).toBe("2026-07-02");
  });
});

describe("hoursAndMinutes", () => {
  it("drops the seconds", () => {
    expect(hoursAndMinutes("12:00:00")).toBe("12:00");
  });
});
