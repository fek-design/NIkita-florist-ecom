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
  - *Found:* `stripe login` put 11 Stripe "agent skills" into `.agents/skills/` in the project (11:11, a minute after the CLI's config). Not added by Claude, not committed; raised with Felix because the skill policy allows no skill outside the four gates. Felix: delete the folder, and run the gates for stripe-best-practices only (logged in the skill curation note; trial on task 4.2).
- **Prices and capacity, tasks 3.2–3.3 (25 Nov).** Prices are a pure function of the catalogue (the request type has no amounts, so a browser cannot set one). Capacity is checked and the order inserted in one transaction under a Postgres lock per day; pending orders hold their place 30 minutes.
  - *Slip, caught:* the first "two customers at once" test passed even with the lock removed: the test database has one connection, and the two transactions never overlapped. Replaced by a test that forces the race (a second connection holds the lock and takes the last place); it fails without the lock and passes with it, both checked.
- **Pickup slots, task 3.4 (25 Nov).** `GET /pickup/slots?date=` lists one-hour slots inside the opening hours, available or full, never how many places are left, and is never cached because it changes with every order.
  - *Found:* the seed had no opening hours at all (`{}`), so there would have been no slots anywhere, staging included. Placeholder hours from S4c (Mon–Fri 10–17, Sat 10–14) now come from the seed, and a data migration fills them only where the hours are empty and still placeholders, so the owner's own hours can never be overwritten.
- **Webhook, task 4.2 (25 Nov).** `POST /webhooks/stripe` checks Stripe's signature on the raw body, then records the event id and changes the order in one transaction: paid on a completed session that is paid or on the async success, expired on expiry or async failure, refunded on a full refund (the payment intent id is stored when paid, because refunds refer to it). Late paid events also pay an order our expiry job already expired: the money was taken. 9 tests with events signed by Stripe's own test signer.
  - Skill trial for stripe-best-practices run here, not blind; see the skill curation note. It found nothing wrong, and raised two points for Felix: dynamic payment methods, and an IP allowlist.
- **IP check on the webhook (25 Nov, D-018).** Felix asked for the argument for skipping Stripe's IP allowlist and did not accept skipping: "we can't skip security". Chosen: report mode now, enforce in the hardening week. The list is fetched from Stripe and cached, not copied into the code; a missing list never stops a payment. 11 tests; one live fetch returned 15 addresses.
- **Real webhook event (25 Nov, evening).** With the Stripe CLI signed in (`stripe login`), `stripe listen` forwarding only the five events we handle (the new CLI requires `--events`; also "only what's needed"), and the signing secret saved by Felix through the hidden prompt, `stripe trigger checkout.session.completed` reached the local backend, passed the signature check and was recorded.
  - *Hiccups:* the first `stripe listen` refused to run without `--events`; the CLI turned out not to be signed in; the secret was first saved from another folder and did not reach `backend/.env.local` (an absolute path fixed it); the listen terminal was closed by accident and restarted. Each was found by checking, not assumed.
  - Felix kept the full test secret key (`sk_test_`) instead of the restricted one for local work; noted, his call. The shop's key in Vercel should be the restricted one.
- **Checkout route, task 4.1 (25 Nov).** `POST /checkout` validates the form (email twice, DD-25; recipient and not-home for delivery; slot for pickup; latest time only on delivery), prices on the server, checks the date with the shared date rules and the slot against opening hours, holds the place, and opens the Stripe session through a small provider module (D-016). The browser's amounts are dropped before the handler sees them (tested). If the payment page cannot be made, the place is released at once.
  - *Changed while building:* the plan said hold and payment window both 30 minutes. Stripe measures its 30-minute minimum when it receives the call, a few seconds after the order is placed, so it would refuse. Now the session lives 31 minutes and the hold 33, so a place is never freed while the customer can still pay. Spec and design updated.
  - New setting `FRONTEND_URL` for Stripe's return links, in `.env.example` and the hand-over sheet.
- **Expiry job and confirmation lookup, tasks 4.3–4.4 (25 Nov).** The job marks pending orders whose hold ran out as expired; it is the safety net if Stripe's expiry event is missed, and runs on a schedule from week 4. The lookup gives the confirmation page what S8 shows, only for the unguessable token, never cached.
