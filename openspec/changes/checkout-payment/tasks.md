## 1. Setup

- [x] 1.1 Start `docs/process/2026-11-25-checkout-payment.md` (goal, inputs, the explore decisions, what was rejected) and link it from design.md; verify both links resolve
- [ ] 1.2 Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to `backend/src/env.ts`, `.env.example` and `docs/handover.md`; Felix enters the test values himself; verify the env test fails without them and passes with them — *25 Nov: `.env.example` and hand-over done, test key in `.env.local`. `env.ts` waits until the keys are also in Vercel, or preview deploys would fail at start-up*
- [x] 1.3 Add the Stripe server library and log it in `docs/decisions.md` with the reason (D-016: Stripe Checkout, hosted); verify `npm audit --omit=dev --audit-level=high` passes — *25 Nov: 0 vulnerabilities*

## 2. Payment test first (highest risk)

- [x] 2.1 Spike: create a test-mode Checkout Session in DKK with MobilePay and card, pay it with MobilePay test and a test card, receive the webhook locally through the Stripe CLI; verify both payments reach "completed" and note in the process log anything that only works live — *25 Nov: MobilePay and card both paid (480 kr., DKK); `allowed_payment_method_types` replaces the removed `payment_method_types`; the local webhook via the Stripe CLI moved to 4.2 (CLI not installed)*

## 3. Orders and capacity

- [ ] 3.1 Migration: `orders` (public number, private token, source, payment state, buyer, recipient, not-home choice, latest time, delivery or pickup, date, slot, fee, total, Stripe session and event ids) and `order_lines` (occasion, tier, quantity, unit price); verify the migration applies on a fresh database and on staging's
- [ ] 3.2 Price calculation from the catalogue and delivery rules in øre; verify with unit tests, including a tampered client price
- [ ] 3.3 Capacity counting with pending holds: day capacity and pickup slot capacity, checked and inserted in one transaction; verify with integration tests for "last place" and two concurrent requests
- [ ] 3.4 Pickup slots in the catalogue: opening hours and pickups per slot in shop settings (placeholders 10–17 and 4), `GET /pickup/slots?date=`; verify the spec scenarios with route tests

## 4. Checkout and payment

- [ ] 4.1 `POST /checkout`: validate the form (email twice and matching, required fields per delivery or pickup, latest time only for Bisættelse), recompute the total, create the pending order, create the Checkout Session (30 min), return the redirect URL; verify route tests for valid, invalid, full day and past cut-off
- [ ] 4.2 `POST /webhooks/stripe` (handle `checkout.session.completed` with payment status paid, `checkout.session.async_payment_succeeded`/`failed` for safety, `checkout.session.expired`, `charge.refunded`; receive them locally through the Stripe CLI): verify the signature, store the event id, set paid / expired / refunded; verify tests for forged, duplicate, paid, expired and refunded events
- [ ] 4.3 Expiry job through `POST /jobs/expire-orders`: pending orders past their session become expired; verify with a test on a fixed clock
- [ ] 4.4 `GET /orders/:token`: the confirmation data, nothing for an unknown token; verify route tests

## 5. Emails

- [ ] 5.1 Confirmation email to the buyer (S8 content) and slip email to the owner (P1 layout), sent once when an order turns paid; verify in Mailpit locally and with a test that a duplicate webhook sends nothing

## 6. Frontend (after the storefront cart exists)

- [ ] 6.1 `/betaling` (S7): the form from the hi-fi set, the email typo suggestion and repeat field, the summary with server totals, the fresh-flowers note, "Betal X kr."; verify at 390 px against Figma and with keyboard only
- [ ] 6.2 Confirmation page (S8) with the waiting state until paid; verify by paying in test mode and by opening a changed token
- [ ] 6.3 End-to-end test: cart → checkout → Stripe test payment → confirmation shows paid; verify it runs in CI (Stripe test mode or a mocked webhook, whichever CI allows)

## 7. Done

- [ ] 7.1 Week 3 exit check: a test-mode order goes from cart to paid with correct totals; a declined and an abandoned payment leave no paid order; record the result with a date in the process note

## Workflow follow-up

- Merge order: `feature/hifi-design`, then `feature/storefront`, then this branch.
- Archive after merge; the `checkout`, `orders` and `catalog` deltas then become main specs.
