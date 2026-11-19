import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema.js";

/**
 * Integration tests run against a real Postgres, never the development or
 * hosted database. Locally that is `florist_test` in the Docker container;
 * CI points TEST_DATABASE_URL at its own service.
 */
export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgres://florist:florist@localhost:5432/florist_test";

export function assertTestDatabase(url: string): string {
  const name = new URL(url).pathname.replace(/^\//, "");
  if (!name.endsWith("_test")) {
    throw new Error(
      `Refusing to use database "${name}" for tests: its name must end in _test.`,
    );
  }
  return name;
}

export function connectTestDatabase() {
  assertTestDatabase(TEST_DATABASE_URL);
  const client = postgres(TEST_DATABASE_URL, {
    max: 1,
    prepare: false,
    onnotice: () => {},
  });
  return { client, db: drizzle(client, { schema }) };
}
