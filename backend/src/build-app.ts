import Fastify, { type FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import { getDb } from "./db/index.js";
import { checkHealth } from "./lib/health.js";
import { isAuthorisedJobCall } from "./lib/job-auth.js";

export type AppOptions = {
  logger?: boolean;
  /** Replaced in tests; by default runs `select 1` against the database. */
  pingDatabase?: () => Promise<unknown>;
  /** Replaced in tests; by default read from JOB_SECRET. */
  jobSecret?: string;
};

/**
 * Adds every route to a Fastify instance. `server.ts` calls it on the real
 * server; `buildApp` below calls it for tests.
 */
export function registerRoutes(
  app: FastifyInstance,
  options: AppOptions = {},
): FastifyInstance {
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

  // Scheduled work, triggered by GitHub Actions (Vercel Hobby cron runs only
  // once a day). Only callers holding JOB_SECRET may start a job.
  const jobs: Record<string, () => Promise<unknown>> = {
    ping: async () => ({ ok: true }),
  };

  app.post<{ Params: { name: string } }>(
    "/jobs/:name",
    async (request, reply) => {
      const secret = options.jobSecret ?? process.env.JOB_SECRET ?? "";
      if (!isAuthorisedJobCall(request.headers.authorization, secret)) {
        return reply.code(401).send({ error: "unauthorised" });
      }
      const job = jobs[request.params.name];
      if (!job) {
        return reply.code(404).send({ error: "unknown job" });
      }
      const result = await job();
      return { job: request.params.name, result };
    },
  );

  return app;
}

/**
 * Builds the API without starting it, so tests can send requests with
 * `app.inject()`.
 */
export function buildApp(options: AppOptions = {}): FastifyInstance {
  return registerRoutes(Fastify({ logger: options.logger ?? false }), options);
}
