// Spec storefront: the path from the front page to the cart on a phone,
// by touch and by keyboard. Runs against the seeded catalogue.
import { expect, test, type Page } from "@playwright/test";

const BASKET = "Kurv";

async function chooseDelivery(page: Page) {
  await page.getByLabel("Postnummer").fill("4300");
  await expect(page.getByText("Vi leverer til 4300 Holbæk")).toBeVisible();
  await page
    .getByRole("radiogroup", { name: "Dag" })
    .getByRole("radio")
    .first()
    .click();
}

test("front page to cart, kept after a reload", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: /Bisættelse/ })
    .first()
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Bisættelse",
  );

  const add = page.getByRole("button", { name: "Læg i kurven" });
  await expect(add).toBeDisabled();
  await chooseDelivery(page);
  await expect(
    page.getByText(/400 kr\. \+ levering 80 kr\. = 480 kr\./),
  ).toBeVisible();
  await add.click();
  await expect(page.getByText("Lagt i kurven")).toBeVisible();
  await page.getByRole("link", { name: "Gå til kurven" }).click();

  await expect(page).toHaveURL(/\/kurv$/);
  await page.reload();
  await expect(
    page.getByRole("link", { name: "Bisættelse · Mellem" }),
  ).toBeVisible();
  await expect(page.getByText("480 kr.").last()).toBeVisible();
  await expect(
    page.getByRole("link", { name: new RegExp(BASKET) }),
  ).toBeVisible();

  // The cart line leads back to its bouquet.
  await page.getByRole("link", { name: "Bisættelse · Mellem" }).click();
  await expect(page).toHaveURL(/\/anledning\/bisaettelse$/);
});

test("outside the delivery area offers pickup instead", async ({ page }) => {
  await page.goto("/anledning/bisaettelse");
  await page.getByLabel("Postnummer").fill("8000");
  await expect(page.getByText("Vi leverer ikke til 8000")).toBeVisible();
  await page.getByRole("button", { name: /Hent i butikken/ }).click();
  await expect(
    page.getByRole("radio", { name: /Afhent i butikken/ }),
  ).toHaveAttribute("aria-checked", "true");
});

test("keyboard only: occasion, size, delivery, day and cart, focus always visible", async ({
  page,
}) => {
  await page.goto("/");
  // Tab until the first occasion card has focus, then open it.
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press("Tab");
    const href = await page.evaluate(() =>
      document.activeElement?.getAttribute("href"),
    );
    if (href?.startsWith("/anledning/")) break;
  }
  await expectFocusRing(page);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/anledning\/[a-z-]+$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.getByRole("radio", { name: /Stor/ }).focus();
  await expectFocusRing(page);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("radio", { name: /Stor/ })).toHaveAttribute(
    "aria-checked",
    "true",
  );

  await page.getByLabel("Postnummer").focus();
  await page.keyboard.type("4300");
  await expect(page.getByText("Vi leverer til 4300 Holbæk")).toBeVisible();
  // On to the first day button with Tab.
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press("Tab");
    const inDays = await page.evaluate(
      () => !!document.activeElement?.closest('[aria-label="Dag"]'),
    );
    if (inDays) break;
  }
  await expectFocusRing(page);
  await page.keyboard.press("Enter");

  const add = page.getByRole("button", { name: "Læg i kurven" });
  await add.focus();
  await expectFocusRing(page);
  await page.keyboard.press("Enter");
  await expect(page.getByText("Lagt i kurven")).toBeVisible();
});

async function expectFocusRing(page: Page) {
  const shadow = await page.evaluate(
    () => getComputedStyle(document.activeElement as Element).boxShadow,
  );
  expect(shadow, "visible focus ring").not.toBe("none");
}

test("card and wishes stay folded away until asked for", async ({ page }) => {
  await page.goto("/anledning/bisaettelse");
  await expect(page.getByLabel(/Hilsen på kortet/)).toHaveCount(0);
  await expect(page.getByLabel("Ønsker til buketten")).toHaveCount(0);

  await chooseDelivery(page);
  await page.getByRole("button", { name: "+ Tilføj et kort (20 kr.)" }).click();
  await page.getByLabel(/Hilsen på kortet/).fill("Kh. familien");
  await expect(
    page.getByText(
      "Mellem 400 kr. + kort 20 kr. + levering 80 kr. = 500 kr. inkl. moms",
    ),
  ).toBeVisible();

  // Closing the card takes it, and its price, off the bouquet.
  await page.getByRole("button", { name: "Fjern kortet" }).click();
  await expect(page.getByText(/= 480 kr\. inkl\. moms/)).toBeVisible();

  await page.getByRole("button", { name: "+ Ønsker til buketten" }).click();
  await page.getByLabel("Ønsker til buketten").fill("Ingen liljer");
  await page.getByRole("button", { name: "Læg i kurven" }).click();
  await page.getByRole("link", { name: "Gå til kurven" }).click();
  await expect(page.getByText("Ønske: Ingen liljer")).toBeVisible();
});

test("a town finds the place, by touch and by keyboard", async ({ page }) => {
  await page.goto("/anledning/bisaettelse");
  const field = page.getByRole("combobox", { name: "Postnummer eller by" });

  await field.fill("Vipp");
  await page.getByRole("option", { name: "4390 Vipperød" }).click();
  await expect(page.getByText("Vi leverer til 4390 Vipperød")).toBeVisible();

  await field.fill("");
  await field.pressSequentially("hol");
  await expect(page.getByRole("option", { name: "4300 Holbæk" })).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Vi leverer til 4300 Holbæk")).toBeVisible();

  await field.fill("Aarhus");
  await expect(page.getByText("Vi leverer ikke til Aarhus")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Hent i butikken/ }),
  ).toBeVisible();
});
