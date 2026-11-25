// The four scenarios of "Available delivery dates", on a fixed clock.
import { describe, expect, it } from "vitest";
import {
  addDays,
  availableDates,
  DATE_WINDOW_DAYS,
  isAvailableDate,
  isoWeekday,
  type DateRules,
} from "./dates.js";

const rules: DateRules = {
  cutoff: "12:00",
  weekdays: [1, 2, 3, 4, 5, 6], // Monday to Saturday
  closed: new Set(),
};

// Monday 23 Nov 2026. Denmark is UTC+1 in winter.
const at = (danishTime: string) =>
  new Date(`2026-11-23T${danishTime}:00+01:00`);

describe("availableDates", () => {
  it("offers today first before the cut-off", () => {
    expect(availableDates(rules, at("10:00"))[0]).toBe("2026-11-23");
  });

  it("starts with the next delivery weekday after the cut-off", () => {
    expect(availableDates(rules, at("12:30"))[0]).toBe("2026-11-24");
    // Exactly at the cut-off is too late.
    expect(availableDates(rules, at("12:00"))[0]).toBe("2026-11-24");
  });

  it("leaves out Sundays and closed dates", () => {
    const dates = availableDates(
      { ...rules, closed: new Set(["2026-11-25"]) },
      at("10:00"),
    );
    expect(dates).not.toContain("2026-11-29"); // Sunday
    expect(dates).not.toContain("2026-11-25"); // closed
    expect(dates.slice(0, 5)).toEqual([
      "2026-11-23",
      "2026-11-24",
      "2026-11-26",
      "2026-11-27",
      "2026-11-28",
    ]);
  });

  it("offers nothing later than 60 days from today", () => {
    const dates = availableDates(rules, at("10:00"));
    expect(dates.at(-1)! <= addDays("2026-11-23", DATE_WINDOW_DAYS)).toBe(true);
    expect(dates.at(-1)).toBe("2027-01-22");
  });

  it("uses Danish time, not the server's: 23:30 UTC on Monday is Tuesday in Denmark", () => {
    const lateUtc = new Date("2026-11-23T23:30:00Z"); // 00:30 Tuesday in DK
    expect(availableDates(rules, lateUtc)[0]).toBe("2026-11-24");
  });
});

describe("isAvailableDate", () => {
  it("answers the same as the list", () => {
    expect(isAvailableDate("2026-11-24", rules, at("10:00"))).toBe(true);
    expect(isAvailableDate("2026-11-29", rules, at("10:00"))).toBe(false);
    expect(isAvailableDate("2026-11-23", rules, at("12:30"))).toBe(false);
  });
});

describe("isoWeekday", () => {
  it("counts Monday as 1 and Sunday as 7", () => {
    expect(isoWeekday("2026-11-23")).toBe(1);
    expect(isoWeekday("2026-11-29")).toBe(7);
  });
});
