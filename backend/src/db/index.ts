import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../env.js";
import * as schema from "./schema.js";

function createDb() {
  // Kept small because serverless functions run many instances side by side.
  const client = postgres(env("DATABASE_URL"), { max: 5, connect_timeout: 5 });
  return drizzle(client, { schema });
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
