// Runs before every backend build on Vercel (see backend/vercel.json):
// brings this deployment's own database up to date with the migrations, and
// on preview and staging builds adds the placeholder catalogue.
// Production is never seeded. Outside Vercel it does nothing, so CI and local
// builds never touch a database.
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "./schema.js";
import { seed } from "./seed.js";

export type DeployPlan = {
  migrate: boolean;
  seed: boolean;
  reason: string;
};

/** What a build should do, from Vercel's environment variables. */
export function deployPlan(
  env: Record<string, string | undefined>,
): DeployPlan {
  if (env.VERCEL !== "1") {
    return { migrate: false, seed: false, reason: "not a Vercel build" };
  }
  if (!(env.DATABASE_URL_UNPOOLED ?? env.DATABASE_URL)) {
    throw new Error(
      "Vercel build without DATABASE_URL_UNPOOLED or DATABASE_URL: cannot migrate.",
    );
  }
  if (env.VERCEL_ENV === "production") {
    return { migrate: true, seed: false, reason: "production: migrate only" };
  }
  return {
    migrate: true,
    seed: true,
    reason: `${env.VERCEL_ENV ?? "preview"}: migrate and seed`,
  };
}

async function main() {
  const plan = deployPlan(process.env);
  console.log(`Database step: ${plan.reason}.`);
  if (!plan.migrate) return;

  // Schema changes need a direct connection, not Neon's pooler.
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!;
  const client = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
  try {
    const db = drizzle(client, { schema, casing: "snake_case" });
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Migrations applied.");
    if (plan.seed) {
      await seed(db);
      console.log("Placeholder catalogue seeded.");
    }
  } finally {
    await client.end();
  }
}

// Run only when started as a script, not when imported by the tests.
if (process.argv[1]?.endsWith("deploy.ts")) {
  await main();
}
