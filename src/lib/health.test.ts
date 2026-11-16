import { describe, expect, it } from "vitest";
import { checkHealth } from "./health";

describe("checkHealth", () => {
  it("reports success when the database answers", async () => {
    const result = await checkHealth(async () => 1);
    expect(result.status).toBe(200);
    expect(result.body.database).toBe("reachable");
  });

  it("reports failure without leaking connection details", async () => {
    const secret = "postgres://user:hunter2@db.example.eu/florist";
    const logged: string[] = [];
    const result = await checkHealth(
      async () => {
        throw new Error(`could not connect to ${secret}`);
      },
      (message) => logged.push(message),
    );
    expect(result.status).toBe(503);
    expect(JSON.stringify(result.body)).not.toContain("hunter2");
    expect(JSON.stringify(result.body)).not.toContain("postgres://");
    expect(logged).toHaveLength(1);
  });
});
