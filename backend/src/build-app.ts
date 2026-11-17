import Fastify, { type FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import { getDb } from "./db/index.js";
import { checkHealth } from "./lib/health.js";

export type AppOptions = {
  logger?: boolean;
  /** Replaced in tests; by default runs `select 1` against the database. */
  pingDatabase?: () => Promise<unknown>;
};

/**
 * Builds the API without starting it, so tests can send requests with
 * `app.inject()` and `server.ts` can start it for real.
 */
export function buildApp(options: AppOptions = {}): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false });
  const pingDatabase =
    options.pingDatabase ?? (() => getDb().execute(sql`select 1`));

  app.get("/", async () => ({ service: "backend" }));

  app.get("/health", async (request, reply) => {
    const result = await checkHealth(pingDatabase, (message) =>
      request.log.error(message),
    );
    return reply
      .code(result.status)
      .header("Cache-Control", "no-store")
      .send(result.body);
  });

  return app;
}
