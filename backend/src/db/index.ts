import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../env.js";
import * as schema from "./schema.js";

function createDb() {
  // Kept small because serverless functions run many instances side by side.
  // `prepare: false` because hosted DATABASE_URL goes through Neon's pooler
  // (pgbouncer), which cannot reliably reuse prepared statements.
  const client = postgres(env("DATABASE_URL"), {
    max: 5,
    connect_timeout: 5,
    prepare: false,
  });
  return drizzle(client, { schema, casing: "snake_case" });
}

let instance: ReturnType<typeof createDb> | undefined;

/**
 * One connection pool per server instance, created on first use, so that
 * importing this module never needs a database connection string.
 */
export function getDb() {
  instance ??= createDb();
  return instance;
}
