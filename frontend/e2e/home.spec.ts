import { expect, test } from "@playwright/test";

test("home page loads in Danish", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "da");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Nikita Nielsen",
  );
});
