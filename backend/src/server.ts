// Entry point, both locally and on Vercel. Vercel only accepts an entry file
// that imports fastify itself, so the instance is created here and the
// routes are added from build-app.ts.
import Fastify from "fastify";
import { assertEnv } from "./env.js";
import { registerRoutes } from "./build-app.js";

try {
  assertEnv();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  // Stop instead of serving every request with an error.
  process.exit(1);
}

const app = registerRoutes(Fastify({ logger: true }));
const port = Number(process.env.PORT ?? 4000);

// Not awaited, as in Vercel's Fastify example: on Vercel, listen() is handled
// by the platform, and waiting on it at the top of the module can stop the
// function from ever finishing its start-up.
app.log.info("Backend starting");
app.listen({ port, host: "0.0.0.0" }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
