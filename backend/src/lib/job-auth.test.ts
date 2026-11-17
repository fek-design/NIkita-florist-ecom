import { describe, expect, it } from "vitest";
import { isAuthorisedJobCall } from "./job-auth.js";

describe("isAuthorisedJobCall", () => {
  const secret = "s3cret-value";

  it("accepts the right bearer token", () => {
    expect(isAuthorisedJobCall(`Bearer ${secret}`, secret)).toBe(true);
  });

  it("rejects a wrong token, a missing header and other schemes", () => {
    expect(isAuthorisedJobCall("Bearer nope", secret)).toBe(false);
    expect(isAuthorisedJobCall(undefined, secret)).toBe(false);
    expect(isAuthorisedJobCall(`Basic ${secret}`, secret)).toBe(false);
  });

  it("never accepts anything when no secret is configured", () => {
    expect(isAuthorisedJobCall("Bearer ", "")).toBe(false);
  });
});
