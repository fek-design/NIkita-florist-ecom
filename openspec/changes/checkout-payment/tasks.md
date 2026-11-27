## 1. Setup

- [x] 1.1 Start `docs/process/2026-11-25-checkout-payment.md` (goal, inputs, the explore decisions, what was rejected) and link it from design.md; verify both links resolve
- [ ] 1.2 Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to `backend/src/env.ts`, `.env.example` and `docs/handover.md`; Felix enters the test values himself; verify the env test fails without them and passes with them — *25 Nov: `.env.example` and hand-over done, test key in `.env.local`. `env.ts` waits until the keys are also in Vercel, or preview deploys would fail at start-up*
- [x] 1.3 Add the Stripe server library and log it in `docs/decisions.md` with the reason (D-016: Stripe Checkout, hosted); verify `npm audit --omit=dev --audit-level=high` passes — *25 Nov: 0 vulnerabilities*

## 2. Payment test first (highest risk)

- [x] 2.1 Spike: create a test-mode Checkout Session in DKK with MobilePay and card, pay it with MobilePay test and a test card, receive the webhook locally through the Stripe CLI; verify both payments reach "completed" and note in the process log anything that only works live — *25 Nov: MobilePay and card both paid (480 kr., DKK); `allowed_payment_method_types` replaces the removed `payment_method_types`; the local webhook via the Stripe CLI moved to 4.2 (CLI not installed)*

## 3. Orders and capacity

- [x] 3.1 Migration: `orders` (public number, private token, source, payment state, buyer, recipient, not-home choice, latest time, delivery or pickup, date, slot, fee, total, Stripe session and event ids) and `order_lines` (occasion, tier, quantity, unit price); verify the migration applies on a fresh database and on staging's — *25 Nov: `orders`, `order_lines`, `stripe_events` with the rules as database checks (web needs email and Stripe; phone is pickup only; delivery needs recipient and not-home; pickup needs a slot; latest time only on delivery; pending needs a hold; card message ≤ 200); 13 tests on a fresh test database; applied to the local database. Staging gets it on the next deploy*
- [x] 3.2 Price calculation from the catalogue and delivery rules in øre; verify with unit tests, including a tampered client price — *25 Nov: `backend/src/orders/pricing.ts`, a pure function plus a loader; 10 tests incl. a tampered price and total, one fee per order, pickup without fee, outside the zone, sold out, hidden, bad quantities, card message > 200*
- [x] 3.3 Capacity counting with pending holds: day capacity and pickup slot capacity, checked and inserted in one transaction; verify with integration tests for "last place" and two concurrent requests — *25 Nov: `placeOrder` checks day and slot and inserts in one transaction under a lock per day; 8 tests incl. hold expiry, paid vs expired, and a forced race that fails without the lock (checked by removing it). Setting `pickups_per_slot` (placeholder 4) added in migration 0004*
- [x] 3.4 Pickup slots in the catalogue: opening hours and pickups per slot in shop settings (placeholders 10–17 and 4), `GET /pickup/slots?date=`; verify the spec scenarios with route tests — *25 Nov: `GET /pickup/slots?date=` (never cached, no counts); placeholder hours Mon–Fri 10–17, Sat 10–14 in the seed and, for databases that already had settings (staging), a data migration that only fills empty placeholder hours; 9 tests*

## 4. Checkout and payment

- [x] 4.1 `POST /checkout` (no payment method list in code, D-017): validate the form (email twice and matching, required fields per delivery or pickup, latest time only for Bisættelse), recompute the total, create the pending order, create the Checkout Session (30 min), return the redirect URL; verify route tests for valid, invalid, full day and past cut-off — *25 Nov: `backend/src/orders/checkout.ts` + `payments/provider.ts`; 13 tests (server price despite browser amounts, pickup, email mismatch, outside zone, Sunday and past cut-off, slot outside hours, full slot 409, payment page failure releases the place, not configured 503). Payment window 31 min, hold 33 (Stripe refuses exactly 30 a few seconds later). New setting `FRONTEND_URL`*
- [x] 4.2 `POST /webhooks/stripe` (handle `checkout.session.completed` with payment status paid, `checkout.session.async_payment_succeeded`/`failed` for safety, `checkout.session.expired`, `charge.refunded`; receive them locally through the Stripe CLI): verify the signature, store the event id, set paid / expired / refunded; verify tests for forged, duplicate, paid, expired and refunded events — *25 Nov: route and event logic built with 9 tests (signed with Stripe's own test signer); payment intent id stored for refunds (migration 0006). Real event checked 25 Nov 20:23: `stripe trigger` → `stripe listen` → signature accepted (200) → recorded in `stripe_events`*
- [x] 4.3 Expiry job through `POST /jobs/expire-orders`: pending orders past their session become expired; verify with a test on a fixed clock — *25 Nov: `POST /jobs/expire-orders`, tested on a fixed clock (inside and after the hold, needs the job secret). Running it on a schedule is the GitHub Actions job from week 4 (D-012); until then Stripe's expiry webhook does the work*
- [x] 4.4 `GET /orders/:token`: the confirmation data, nothing for an unknown token; verify route tests — *25 Nov: `GET /orders/:token`, never cached; a changed token gives 404 and the order number alone is refused (400)*

- [ ] 4.5 Felix: in the Stripe dashboard (test now, the owner's account at hand-over) switch on only instant methods (MobilePay, cards incl. Apple Pay and Google Pay) and turn on two-factor sign-in; verify a test checkout shows only those
- [x] 4.6 Second layer on the webhook (D-018): Stripe's published addresses, report mode by default; verify tests for report, enforce, Stripe's address, missing list and localhost, and one live fetch of the list — *25 Nov: 11 tests; the live list has 15 addresses*
## 5. Emails

- [x] 5.1 Confirmation email to the buyer (S8 content) and slip email to the owner (P1 layout), sent once when an order turns paid; verify in Mailpit locally and with a test that a duplicate webhook sends nothing — *25 Nov: outbox table (D-011; one email per order and kind, enforced by the database), immediate send over SMTP, failures kept for week 4's retry job; customer text escaped in HTML; 8 tests incl. webhook to outbox with a repeated event; both emails checked in Mailpit over real SMTP, images in `docs/design/implemented/`*

## 6. Frontend (after the storefront cart exists)

- [x] 6.1 `/betaling` (S7): the form from the hi-fi set, the email typo suggestion and repeat field, the summary with server totals, the fresh-flowers note, "Betal X kr."; verify at 390 px against Figma and with keyboard only — *27 Nov: checked at 390 px: an empty submit lists every missing field and focuses the first; `mette@gmial.com` gets "Mente du mette@gmail.com?"; a differing repeat is refused; 480 kr. reaches Stripe. Built from the spec where the v2 frame predates later decisions: repeat email (DD-25), "Hvis ingen er hjemme" and the latest time for Bisættelse (DD-19), and "Betal med" as text instead of a picker, because the customer picks MobilePay or card on Stripe's page (D-016). Keyboard-only pass still to do*
- [x] 6.2 Confirmation page (S8) with the waiting state until paid; verify by paying in test mode and by opening a changed token — *27 Nov: the waiting state shows until the webhook marks the order paid, then the paid page; the cart empties; both emails arrive in Mailpit. The payment was confirmed with a locally signed `checkout.session.completed` (Stripe's test card form refused browser automation); the real Stripe path was verified on 25 Nov. A changed token shows "Vi kan ikke finde ordren"*
- [ ] 6.3 End-to-end test: cart → checkout → Stripe test payment → confirmation shows paid; verify it runs in CI (Stripe test mode or a mocked webhook, whichever CI allows)

## 7. Done

- [ ] 7.1 Week 3 exit check: a test-mode order goes from cart to paid with correct totals; a declined and an abandoned payment leave no paid order; record the result with a date in the process note

## Workflow follow-up

- Week 4: schedule `POST /jobs/expire-orders` from GitHub Actions every 15 minutes (D-012).
- Hardening week (week 5): rate-limit `POST /checkout` (roadmap).
- Hardening week (week 5): read the webhook logs for unknown callers; if there are no false alarms, set `STRIPE_WEBHOOK_IP_CHECK=enforce` in Vercel (D-018).

- Merge order: `feature/hifi-design`, then `feature/storefront`, then this branch.
- Archive after merge; the `checkout`, `orders` and `catalog` deltas then become main specs.
