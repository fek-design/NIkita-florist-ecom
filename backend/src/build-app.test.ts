import { describe, expect, it } from "vitest";
import { buildApp } from "./build-app.js";

describe("backend", () => {
  it("answers on the root route", async () => {
    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ service: "backend" });
  });
});
