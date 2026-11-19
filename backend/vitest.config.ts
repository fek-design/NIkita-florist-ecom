import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Recreates and migrates the test database once per run.
    globalSetup: ["src/test/global-setup.ts"],
    // Test files share one database, so they run one after another.
    fileParallelism: false,
  },
});
