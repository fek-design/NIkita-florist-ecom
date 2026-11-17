import { describe, expect, it } from "vitest";
import { buildApp } from "./build-app.js";

describe("backend", () => {
  it("answers on the root route", async () => {
    const app = buildApp({ pingDatabase: async () => 1 });
    const response = await app.inject({ method: "GET", url: "/" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ service: "backend" });
  });
});

describe("GET /health", () => {
  it("returns 200 when the database answers", async () => {
    const app = buildApp({ pingDatabase: async () => 1 });
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.json()).toEqual({ status: "ok", database: "reachable" });
  });

  it("returns 503 without connection details when the database is down", async () => {
    const app = buildApp({
      pingDatabase: async () => {
        throw new Error("connect failed: postgres://user:hunter2@db.eu/x");
      },
    });
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(503);
    expect(response.body).not.toContain("hunter2");
    expect(response.body).not.toContain("postgres://");
  });
});
