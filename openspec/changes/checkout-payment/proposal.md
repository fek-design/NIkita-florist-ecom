## Why

Week 3's milestone is a test-mode order paid end to end, and nothing after the cart exists yet: no orders, no payment, no confirmation. The checkout is designed (hi-fi v2: S7, S8, DD-18, DD-19, DD-25) and the shop already runs on paper slips (DD-16, DD-17), so the order flow can now be built to match. Explored with Felix on 25 Nov.

## What Changes

- **Checkout** at `/betaling` (S7): buyer, recipient, what to do if nobody is home, a latest time for Bisættelse, the email checked three ways, an order summary, the fresh-flowers note, then "Betal". No account (P4).
- **Payment on Stripe's hosted checkout page** (MobilePay first, then card), then back to the confirmation page (S8). No card data on our servers.
- **Orders** stored with server-calculated prices, a source (web, telefon, butik) and a payment state (pending, paid, expired, refunded). The pinboard is the work status, so no work states (DD-17).
- **Capacity held while paying:** the day, and for pickup the hour slot, are held for 30 minutes; an expired payment releases them.
- **Paid only on the webhook:** a verified, idempotent Stripe webhook marks the order paid; the return page never does.
- **Emails after payment:** confirmation to the customer (S8 content) and the order slip to the owner (P1, DD-16), from the existing mail setup.
- **Pickup slots** (DD-18): hour slots within opening hours, each with a capacity, full slots shown as full.
- Refunds are made in Stripe's dashboard; the webhook records them.

## Capabilities

### New Capabilities

- `checkout`: the customer's checkout form, validation, the move to payment and back, and the confirmation page.
- `orders`: order records, their payment states, prices, capacity holds, and what happens when an order is paid, expires or is refunded.

### Modified Capabilities

- `catalog`: adds pickup slots with a capacity per slot.

## Impact

- Backend: new tables (orders, order lines), routes for checkout, the Stripe webhook and order lookup; the available-dates logic from the storefront change is reused and extended with holds.
- Frontend: `/betaling` and the confirmation page; depends on the storefront cart.
- New dependency: Stripe's server library. New secrets: Stripe secret key and webhook signing secret, entered by Felix and added to the hand-over sheet.
- Shop and phone orders (DD-21) use the same tables; their screens come with the back-office change.
- Branch `feature/checkout-payment` starts from `feature/hifi-design` (the design log and storefront plan are not in DevEnv yet).
