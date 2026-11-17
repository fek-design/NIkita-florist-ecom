import { expect, test } from "@playwright/test";

test("status page shows the backend is reachable", async ({ page }) => {
  await page.goto("/status");
  await expect(page.getByTestId("backend-status")).toHaveText("Alt kører");
});

test("browser calls to /api reach the backend", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({ database: "reachable" });
});
