## Context

The backend owns the catalogue, delivery rules and money in øre; the frontend reaches it only through the API. The storefront change builds the cart and the available-dates rules; this change starts where the cart ends. Design: hi-fi v2, screens S7 and S8, decisions DD-16 to DD-19, DD-21 and DD-25 (`docs/design-decisions.md`). Explored with Felix on 25 Nov; process note: [2026-11-25-checkout-payment.md](../../../docs/process/2026-11-25-checkout-payment.md).

## Goals / Non-Goals

**Goals:**
- A test-mode order goes from cart to paid in the database with correct totals; declined and abandoned payments leave no paid order (roadmap, week 3).
- The checkout matches S7/S8 except the payment step itself.

**Non-Goals:**
- Work states for the owner (DD-17); refund screens; customer accounts; add-ons (DD-22, later).
- The owner's morning sheet, pickup reminder email and monthly email (back-office change, week 4).
- Shop and phone order screens (DD-21; back-office change). Only the data model supports them here.

## Decisions

**1. Stripe Checkout, hosted (Felix, 25 Nov).** Our form collects everything; "Betal" creates a Checkout Session and redirects. Alternatives: Stripe's embedded Payment Element in S7 (more UI states to build in the riskiest week); direct Vipps MobilePay API (MobilePay only, a second integration for cards); QuickPay (needs a separate acquirer agreement). Stripe is already set up in test mode with MobilePay.

**2. Flow.**
```
S7 form --POST /checkout--> validate, recompute prices, check date/slot
                            create order [pending] + hold capacity
                            create Checkout Session (expires 30 min)
        <-- redirect URL --
Stripe page (MobilePay / card)
        --> webhook: completed / async succeeded --> order [paid] --> emails
        --> webhook: expired / async failed      --> order [expired], hold released
return to S8 --GET /orders/:ref--> shows paid order, or "venter på betaling" until the webhook lands
```

**3. Payment states only.** `pending → paid → refunded`, `pending → expired`. The owner's progress lives on the pinboard (DD-17). A paid order is never changed by the return page; only a verified webhook moves state.

**4. Capacity holds.** A pending order counts against the day's capacity and, for pickup, its slot, until it is paid or expires. The hold lasts as long as the Checkout Session, 30 minutes, Stripe's minimum. Counting pending orders (rather than a separate hold table) keeps one source of truth. A scheduled job marks pending orders older than the session as expired, in case a webhook is missed.

**5. Prices only from the server.** The checkout request carries occasion, tier, quantity and the delivery choice; the backend computes lines, fee and total in øre and sends those amounts to Stripe.

**6. The cut-off is checked when "Betal" is pressed**, not again at payment: an order created before 12:00 for today stays valid while its session lives.

**7. Idempotent webhook.** The Stripe event id is stored; a repeated event does nothing. The signature is verified with the signing secret before anything is read.

**8. Order reference.** Each order gets a short public number for people (#1042) and an unguessable token for the confirmation page link, so one order cannot be read by guessing another's number.

**9. Email checked three ways (DD-25):** typo suggestion for common domains, a repeat field that must match, and the address in the summary.

**10. Emails** are sent once, when the order turns paid: the confirmation to the buyer and the slip to the owner (laid out to print, DD-16). Week 4 adds queueing and retries; until then a failed send is logged and visible.

## Risks / Trade-offs

- [Webhook missed or delayed] → the return page shows a waiting state and polls briefly; the expiry job tidies pending orders; Stripe retries webhooks.
- [MobilePay in Stripe test mode behaves differently from live] → test early (task group 2); note what can only be tested live.
- [Two customers take the last slot at once] → capacity is checked and the pending order inserted in one database transaction.
- [Extra email field slows checkout] → accepted by Felix (DD-25); measured in the usability test.
- [Branching from `feature/hifi-design`] → merge order: hifi-design, storefront, then this.

## Migration Plan

New tables only; migrations run at deploy as today. Stripe keys exist only in test mode until hand-over. Rollback: disable the checkout route; the cart still works.
