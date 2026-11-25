import { describe, expect, it } from "vitest";
import { ipCheckMode, judgeCaller, stripeIpSource } from "./stripe-ips.js";

const list = { ips: new Set(["3.18.12.63"]), fetchedAt: 0 };

describe("judgeCaller", () => {
  it("lets Stripe's addresses through in every mode", () => {
    expect(judgeCaller("3.18.12.63", list, "enforce", false)).toEqual({
      allow: true,
    });
  });

  it("reports or refuses an unknown address depending on the mode", () => {
    expect(judgeCaller("203.0.113.9", list, "report", false)).toEqual({
      allow: true,
      note: "unknown_caller",
    });
    expect(judgeCaller("203.0.113.9", list, "enforce", false)).toEqual({
      allow: false,
    });
    expect(judgeCaller("203.0.113.9", list, "off", false)).toEqual({
      allow: true,
    });
  });

  it("lets localhost through only when running locally", () => {
    expect(judgeCaller("127.0.0.1", list, "enforce", true)).toEqual({
      allow: true,
      note: "local",
    });
    expect(judgeCaller("127.0.0.1", list, "enforce", false)).toEqual({
      allow: false,
    });
  });

  it("never refuses because the list is missing", () => {
    expect(judgeCaller("203.0.113.9", null, "enforce", false)).toEqual({
      allow: true,
      note: "list_unavailable",
    });
  });
});

describe("stripeIpSource", () => {
  it("caches the list for a day and keeps the last good one on failure", async () => {
    let calls = 0;
    let fail = false;
    const source = stripeIpSource(async () => {
      calls++;
      if (fail) throw new Error("down");
      return ["3.18.12.63"];
    });
    const day = 24 * 60 * 60 * 1000;
    expect((await source(0))?.ips.has("3.18.12.63")).toBe(true);
    await source(day - 1);
    expect(calls).toBe(1);
    fail = true;
    expect((await source(day + 1))?.ips.has("3.18.12.63")).toBe(true);
    expect(calls).toBe(2);
  });

  it("returns null when it never had a list", async () => {
    const source = stripeIpSource(async () => {
      throw new Error("down");
    });
    expect(await source(0)).toBeNull();
  });
});

describe("ipCheckMode", () => {
  it("defaults to report", () => {
    expect(ipCheckMode(undefined)).toBe("report");
    expect(ipCheckMode("nonsense")).toBe("report");
    expect(ipCheckMode("enforce")).toBe("enforce");
  });
});
