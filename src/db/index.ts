import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";
import * as schema from "./schema";

// One connection pool per server instance. Kept small because serverless
// functions run many instances side by side.
const client = postgres(env("DATABASE_URL"), { max: 5, connect_timeout: 5 });

export const db = drizzle(client, { schema });
