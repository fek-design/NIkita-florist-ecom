import { defineConfig } from "drizzle-kit";

// Read backend/.env.local when it exists (Node's built-in loader).
try {
  process.loadEnvFile(".env.local");
} catch {
  // No local file: rely on the environment, as in CI and on Vercel.
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
