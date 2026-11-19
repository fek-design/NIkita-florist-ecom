// Runs the seed against DATABASE_URL: `npm run db:seed -w backend`.
// A DATABASE_URL given on the command line wins over backend/.env.local.
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../env.js";
import * as schema from "./schema.js";
import { seed } from "./seed.js";

const client = postgres(env("DATABASE_URL"), {
  max: 1,
  prepare: false,
  onnotice: () => {},
});
try {
  await seed(drizzle(client, { schema, casing: "snake_case" }));
  console.log("Seed finished: placeholder catalogue in place.");
} finally {
  await client.end();
}
