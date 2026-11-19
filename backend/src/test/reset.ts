import { sql } from "drizzle-orm";
import type { connectTestDatabase } from "./test-database.js";

type TestDb = ReturnType<typeof connectTestDatabase>["db"];

/** Empties every catalogue table, so each test starts from nothing. */
export async function resetCatalog(db: TestDb) {
  await db.execute(
    sql`truncate occasions, occasion_tiers, occasion_photos, delivery_postcodes, closed_dates, shop_settings restart identity cascade`,
  );
}

/**
 * Resolves to the Postgres error code of a failed query. Drizzle wraps the
 * driver's error, so the code may sit on the error or on its cause.
 */
export async function pgErrorCode(query: Promise<unknown>): Promise<string> {
  try {
    await query;
  } catch (error) {
    const e = error as { code?: string; cause?: { code?: string } };
    const code = e.cause?.code ?? e.code;
    if (code) return code;
    throw error;
  }
  throw new Error("Expected the query to fail, but it succeeded");
}

/** Postgres error codes used in the tests. */
export const PG = {
  uniqueViolation: "23505",
  checkViolation: "23514",
} as const;
