import { expect, test } from "@playwright/test";

test("home page loads in Danish with the intro as its heading", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "da");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Håndbundne buketter fra Nikitas værksted i Tuse",
  );
});

test("fonts come only from the shop's own address", async ({ page }) => {
  const fonts: string[] = [];
  page.on("request", (r) => {
    if (r.resourceType() === "font") fonts.push(r.url());
  });
  await page.goto("/", { waitUntil: "networkidle" });
  expect(fonts.length).toBeGreaterThan(0);
  for (const url of fonts) {
    expect(new URL(url).host).toBe(new URL(page.url()).host);
  }
});
