// Spec checkout: the form's checks, and (with Stripe test keys in the
// backend) the way to a paid order. Payment is confirmed with a signed
// checkout.session.completed, the event Stripe itself sends, because
// Stripe's hosted card form does not take automated input.
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { createHmac } from "node:crypto";

function backendEnv(): Record<string, string> {
  const file = resolve(__dirname, "../../backend/.env.local");
  if (!existsSync(file)) return {};
  return Object.fromEntries(
    readFileSync(file, "utf8")
      .split("\n")
      .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
      .map((l) => [
        l.slice(0, l.indexOf("=")).trim(),
        l.slice(l.indexOf("=") + 1).trim(),
      ]),
  );
}
const env = { ...backendEnv(), ...process.env };
const canPay = !!env.STRIPE_SECRET_KEY && !!env.STRIPE_WEBHOOK_SECRET;

/** Stripe's signature header: HMAC-SHA256 of "timestamp.payload". */
function signature(payload: string, secret: string): string {
  const t = Math.floor(Date.now() / 1000);
  const v1 = createHmac("sha256", secret)
    .update(`${t}.${payload}`)
    .digest("hex");
  return `t=${t},v1=${v1}`;
}

/**
 * A random day from "Anden dato": the owner takes about 5 orders a day
 * (27 Nov), so tests that create orders spread them out instead of filling
 * tomorrow on the local database.
 */
async function pickSomeDay(page: Page) {
  await page.getByRole("radio", { name: /Anden dato/ }).click();
  const options = await page.locator("#dato option:not([value=''])").count();
  await page
    .locator("#dato")
    .selectOption({ index: 1 + Math.floor(Math.random() * (options - 1)) });
}

async function fillCart(page: Page) {
  await page.goto("/anledning/bisaettelse");
  await page.getByLabel("Postnummer").fill("4300");
  await expect(page.getByText("Vi leverer til 4300 Holbæk")).toBeVisible();
  await pickSomeDay(page);
  await page.getByRole("button", { name: "Læg i kurven" }).click();
  await page.getByRole("link", { name: "Gå til kurven" }).click();
  await page.getByRole("link", { name: "Gå til betaling" }).click();
  await expect(page.getByRole("heading", { name: "Betaling" })).toBeVisible();
}

async function fillForm(page: Page) {
  await page.getByLabel("Navn", { exact: true }).fill("Mette Jensen");
  await page.getByLabel("E-mail", { exact: true }).fill("mette@eksempel.dk");
  await page.getByLabel("Gentag e-mail").fill("mette@eksempel.dk");
  await page.getByLabel("Telefon", { exact: true }).fill("12345678");
  await page.getByLabel("Buketten skal leveres til en anden end mig").check();
  await page.getByLabel("Modtagerens navn").fill("Familien Hansen");
  await page.getByLabel("Leveringsadresse").fill("Skovvej 12");
  await page.getByText("Stil den ved døren").click();
}

test("checkout asks for what is missing and catches email mistakes", async ({
  page,
}) => {
  await fillCart(page);
  await page.getByRole("button", { name: /^Betal/ }).click();
  await expect(page.getByText("Skriv dit navn.")).toBeVisible();
  await expect(
    page.getByText("Vælg, hvad vi gør, hvis ingen er hjemme."),
  ).toBeVisible();
  await expect(page.getByLabel("Navn", { exact: true })).toBeFocused();

  await page.getByLabel("E-mail", { exact: true }).fill("mette@gmial.com");
  await page.getByLabel("Gentag e-mail").focus();
  await expect(page.getByText("Mente du")).toContainText("mette@gmail.com");

  await fillForm(page);
  await page.getByLabel("Gentag e-mail").fill("mette@eksempel.com");
  await page.getByRole("button", { name: /^Betal/ }).click();
  await expect(page.getByText("De to e-mails skal være ens.")).toBeVisible();
});

async function startPayment(page: Page) {
  await fillCart(page);
  await fillForm(page);
  let token = "";
  await page.route("**/api/checkout", async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    token = body.orderToken;
    await route.fulfill({ response, json: body });
  });
  await page.getByRole("button", { name: "Betal 480 kr." }).click();
  await page.waitForURL(/checkout\.stripe\.com/);
  const sessionId = page.url().match(/cs_test_[A-Za-z0-9]+/)![0];
  return { token, sessionId };
}

/** Sends the event Stripe would send for this session, signed. */
async function stripeSends(type: string, session: Record<string, unknown>) {
  const payload = JSON.stringify({
    id: `evt_e2e_${Date.now()}`,
    object: "event",
    type,
    created: Math.floor(Date.now() / 1000),
    data: { object: { object: "checkout.session", ...session } },
  });
  const res = await fetch("http://localhost:4000/webhooks/stripe", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "stripe-signature": signature(payload, env.STRIPE_WEBHOOK_SECRET!),
    },
    body: payload,
  });
  expect(res.status).toBe(200);
}

test("a paid order shows as paid and empties the cart", async ({ page }) => {
  test.skip(!canPay, "needs Stripe test keys in backend/.env.local");
  const { token, sessionId } = await startPayment(page);
  await stripeSends("checkout.session.completed", {
    id: sessionId,
    payment_status: "paid",
    status: "complete",
    payment_intent: `pi_e2e_${Date.now()}`,
  });
  await page.goto(`/ordre/${token}`);
  await expect(page.getByText("Betalingen er gennemført")).toBeVisible();
  await expect(page.getByText("Betalt: 480 kr. inkl. moms")).toBeVisible();
  await expect(page.locator(".cart-badge")).toHaveCount(0);
});

test("an abandoned payment leaves no paid order and keeps the cart", async ({
  page,
}) => {
  test.skip(!canPay, "needs Stripe test keys in backend/.env.local");
  const { token, sessionId } = await startPayment(page);
  await stripeSends("checkout.session.expired", {
    id: sessionId,
    payment_status: "unpaid",
    status: "expired",
  });
  await page.goto(`/ordre/${token}`);
  await expect(
    page.getByRole("heading", { name: "Betalingen blev ikke gennemført" }),
  ).toBeVisible();
  await expect(page.locator(".cart-badge")).toHaveText("1");
});

test("a wish reaches the confirmation page", async ({ page }) => {
  test.skip(!canPay, "needs Stripe test keys in backend/.env.local");
  await page.goto("/anledning/bisaettelse");
  await page.getByLabel("Postnummer").fill("4300");
  await expect(page.getByText("Vi leverer til 4300 Holbæk")).toBeVisible();
  await pickSomeDay(page);
  await page.getByRole("button", { name: "+ Ønsker til buketten" }).click();
  await page.getByLabel("Ønsker til buketten").fill("Kun hvide");
  await page.getByRole("button", { name: "Læg i kurven" }).click();
  await page.getByRole("link", { name: "Gå til kurven" }).click();
  await page.getByRole("link", { name: "Gå til betaling" }).click();
  await expect(page.getByText("Ønske: Kun hvide")).toBeVisible();
  await fillForm(page);
  let token = "";
  await page.route("**/api/checkout", async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    token = body.orderToken;
    await route.fulfill({ response, json: body });
  });
  await page.getByRole("button", { name: /^Betal/ }).click();
  await page.waitForURL(/checkout\.stripe\.com/);
  await page.goto(`/ordre/${token}`);
  await expect(
    page.getByText(/Dit ønske til Bisættelse: “Kun hvide”/),
  ).toBeVisible();
});

test("a changed order link shows no order", async ({ page }) => {
  await page.goto("/ordre/abcdefghijklmnopqrstuvwxyz012345");
  await expect(
    page.getByRole("heading", { name: "Vi kan ikke finde ordren" }),
  ).toBeVisible();
});

test("without the tick the bouquet goes to the buyer", async ({ page }) => {
  await fillCart(page);
  await expect(page.getByLabel("Modtagerens navn")).toHaveCount(0);
  await page.getByLabel("Buketten skal leveres til en anden end mig").check();
  await expect(page.getByLabel("Modtagerens navn")).toBeVisible();
  await page.getByLabel("Buketten skal leveres til en anden end mig").uncheck();
  await expect(page.getByLabel("Modtagerens navn")).toHaveCount(0);
});
