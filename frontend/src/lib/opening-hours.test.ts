import { describe, expect, it } from "vitest";
import { openingHoursInWords } from "./opening-hours";

describe("openingHoursInWords", () => {
  it("joins consecutive days with the same hours", () => {
    expect(
      openingHoursInWords({
        mon: ["10:00", "17:00"],
        tue: ["10:00", "17:00"],
        wed: ["10:00", "17:00"],
        thu: ["10:00", "17:00"],
        fri: ["10:00", "17:00"],
        sat: ["10:00", "14:00"],
      }),
    ).toBe("mandag–fredag 10–17, lørdag 10–14");
  });

  it("does not join across a closed day", () => {
    expect(
      openingHoursInWords({
        mon: ["10:00", "17:00"],
        wed: ["10:00", "17:00"],
      }),
    ).toBe("mandag 10–17, onsdag 10–17");
  });

  it("writes half hours with a full stop", () => {
    expect(openingHoursInWords({ sat: ["09:30", "13:00"] })).toBe(
      "lørdag 9.30–13",
    );
  });
});
