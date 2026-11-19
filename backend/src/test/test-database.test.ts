import { afterAll, describe, expect, it } from "vitest";
import { sql } from "drizzle-orm";
import { assertTestDatabase, connectTestDatabase } from "./test-database.js";

describe("test database", () => {
  const { client, db } = connectTestDatabase();
  afterAll(() => client.end());

  it("is reachable and migrated", async () => {
    const rows = await db.execute(
      sql`select count(*)::int as n from drizzle.__drizzle_migrations`,
    );
    expect(rows[0]?.n).toBeGreaterThanOrEqual(1);
  });

  it("refuses a database whose name does not end in _test", () => {
    expect(() =>
      assertTestDatabase("postgres://u:p@localhost/florist"),
    ).toThrow(/must end in _test/);
  });
});
