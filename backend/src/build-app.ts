import Fastify, { type FastifyInstance } from "fastify";

/**
 * Builds the API without starting it, so tests can send requests with
 * `app.inject()` and `server.ts` can start it for real.
 */
export function buildApp(options: { logger?: boolean } = {}): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false });

  app.get("/", async () => ({ service: "backend" }));

  return app;
}
