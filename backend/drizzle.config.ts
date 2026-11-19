import { defineConfig } from "drizzle-kit";

// Read backend/.env.local when it exists (Node's built-in loader).
try {
  process.loadEnvFile(".env.local");
} catch {
  // No local file: rely on the environment, as in CI and on Vercel.
}

export default defineConfig({
  dialect: "postgresql",
  // Code uses camelCase; the database uses snake_case (sort_order).
  casing: "snake_case",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  // Schema changes need a direct connection, not Neon's pooler.
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "",
  },
});
