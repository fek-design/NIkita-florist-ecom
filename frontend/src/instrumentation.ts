// Runs once when a server instance starts, before it handles any request.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertEnv } = await import("./env");
    try {
      assertEnv();
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      // Stop instead of serving every request with an error.
      process.exit(1);
    }
  }
}
