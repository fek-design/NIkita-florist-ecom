import { defineConfig, devices } from "@playwright/test";

// 3000, the normal dev port: Next 16 allows one dev server per folder, so a
// local run reuses the one already running; CI starts its own.
const port = 3000;

export default defineConfig({
  testDir: "./e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
  },
  // Phone first (Design-Rationale P1).
  projects: [{ name: "mobile", use: { ...devices["Pixel 7"] } }],
  webServer: [
    {
      command: "npm run dev --workspace backend",
      url: "http://localhost:4000/",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `npm run dev -- --port ${port}`,
      url: `http://localhost:${port}`,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
