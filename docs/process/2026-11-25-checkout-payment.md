# Checkout and payment

**Started:** 25 Nov 2026 · **Change:** [`checkout-payment`](../../openspec/changes/checkout-payment/) · **Branch:** `feature/checkout-payment` (off `feature/hifi-design`)
**Related:** [Design decisions](../design-decisions.md) (DD-16 to DD-19, DD-21, DD-25) · [Stack decisions](../decisions.md) (D-016) · [Hi-fi v2](../design/versions/v2/CHANGELOG.md) (S7, S8)

## Goal

A test-mode order goes from cart to paid in the database with correct totals, and declined or abandoned payments leave no paid order (roadmap, week 3).

## Inputs

- Hi-fi v2: S7 checkout, S8 confirmation; DD-16 (paper slip), DD-17 (pinboard as status), DD-18 (pickup slots), DD-19 (delivery instructions), DD-21 (shop and phone orders), DD-25 (email checked three ways).
- Felix's Stripe test account, with MobilePay switched on.
- The catalogue and delivery rules already in the backend.

## Explored with Felix (25 Nov, `/opsx:explore`, the first under the new rule)

- **Where payment happens:** Stripe Checkout, hosted (A), chosen over Stripe's embedded Payment Element (B). Reason: least work and risk in the riskiest week; our S7 stays ours, only the pay step is Stripe's.
- **Before that:** direct Vipps MobilePay API considered and rejected (MobilePay only, cards would need a second integration); QuickPay considered and rejected (separate acquirer agreement, monthly fee). Felix: "we stick with Stripe".
- **Defaults accepted without objection:** payment states only (pending, paid, expired, refunded); capacity held 30 minutes while paying; cut-off checked when "Betal" is pressed; orders table ready for shop and phone orders, their screens in the back-office change; emails sent once when paid; refunds in Stripe's dashboard.
- **Email check:** Felix chose all three (typo suggestion, repeat field, summary), against Claude's recommendation of two, because the confirmation and pickup reminder must arrive (DD-25).

## Work log

- **Stripe key (25 Nov).** Felix created a restricted key with four permissions (Checkout Sessions write; PaymentIntents, PaymentMethods, Events read) instead of the full secret key, and entered it himself through a hidden prompt.
  - *Caught:* the first key was a live key (`rk_live_`), created while the dashboard was in live mode. The spike script refuses anything but test keys, so nothing was sent; Felix replaced it with a test key and was asked to delete the live one.
- **Payment test, task 2.1 (25 Nov).** A throwaway script (not committed) created Checkout Sessions in DKK for 480 kr. (Bisættelse Mellem 400 + delivery 80), Danish locale, 30-minute expiry.
  - *Found:* Stripe removed `payment_method_types` for Checkout Sessions on 30 Sep 2026; the parameter is now `allowed_payment_method_types`. The first request failed with a clear message; the second worked.
  - *Found:* inline prices work with the four permissions; no Products or Prices permission was needed.
  - **MobilePay:** paid through Stripe's test authorisation page (in test mode Stripe stands in for the MobilePay app, so the app itself can only be tried live). Session `complete`, `paid`, method `mobilepay`. Events: `checkout.session.completed` (already paid on arrival), `payment_intent.succeeded`.
  - **Card:** 4242 test card. Session `complete`, `paid`, method `card`. Same events.
  - Felix: the Stripe page was in Danish apart from the MobilePay test page.
  - *Not done yet:* receiving the webhook on a local endpoint. The Stripe CLI is not installed; events were read from Stripe's API instead. Local webhook delivery moves to task 4.2.

## Open questions

- What the real MobilePay app flow looks like on a phone (only testable with live keys; plan a 1 kr. live test at hand-over with the owner's account).
- **Orders tables, task 3.1 (25 Nov).** `orders`, `order_lines` and `stripe_events`, with the order rules as database checks so no code path can store an impossible order. Order numbers start at 1001; the confirmation link uses a separate token. 13 tests on a fresh database.
  - *Found:* `stripe login` put 11 Stripe "agent skills" into `.agents/skills/` in the project (11:11, a minute after the CLI's config). Not added by Claude, not committed; raised with Felix because the skill policy allows no skill outside the four gates.
