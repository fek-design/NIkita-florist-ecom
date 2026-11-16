export type HealthResult = {
  status: 200 | 503;
  body: { status: "ok" | "error"; database: "reachable" | "unreachable" };
};

/**
 * Runs the database ping and turns the outcome into a response. The error
 * itself is logged on the server only: the response never carries
 * connection details.
 */
export async function checkHealth(
  pingDatabase: () => Promise<unknown>,
  log: (message: string) => void = console.error,
): Promise<HealthResult> {
  try {
    await pingDatabase();
    return { status: 200, body: { status: "ok", database: "reachable" } };
  } catch (error) {
    log(
      `Health check: database unreachable: ${error instanceof Error ? error.message : String(error)}`,
    );
    return { status: 503, body: { status: "error", database: "unreachable" } };
  }
}
