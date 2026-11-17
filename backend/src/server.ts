// Entry point, both locally and on Vercel (which detects src/server.ts).
import { assertEnv } from "./env.js";
import { buildApp } from "./build-app.js";

try {
  assertEnv();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  // Stop instead of serving every request with an error.
  process.exit(1);
}

const app = buildApp({ logger: true });
const port = Number(process.env.PORT ?? 4000);

try {
  await app.listen({ port, host: "0.0.0.0" });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
