# Hi-fi design set

**Started:** 23 Nov 2026 · **Change:** [`hifi-design`](../../openspec/changes/hifi-design/) · **Branch:** `feature/hifi-design` (off `feature/storefront`, Felix's choice, because the design log is not merged yet)
**Related:** [Design decisions](../design-decisions.md) (DD-15) · [Design rationale](../../ref/Design-Rationale.md) · [Storefront note](2026-11-19-storefront.md)

## Goal

One complete hi-fi set, from the front page to the order confirmation and the owner's back office, made from proven patterns and Felix's competitor analysis, so it can be built and then improved through tests on the live page.

## Inputs

- Felix's front page in Figma, with footer C already placed by him, and DD-01 to DD-14.
- Lo-fi wireframes C (shop) and D (back office), `ref/wireframes/lofi/`.
- Felix's competitor boards, `ref/competitor/` (Bloomit, Interflora, Kaj Larsen), with his own annotations.
- Public Baymard articles on homepage, navigation, cart, checkout and confirmation; Shopify Polaris for admin lists and details.
- The storefront, catalogue and back-office specs.

## Options considered

- **Mobbin** (Felix's suggestion, with a question mark). Dropped: the project has no paid plan (removed 11 Nov), its free tier shows a few screens per app, and it shows what apps do, not whether it works for users. Felix chose Baymard plus the competitors instead.
- **Variants per choice, as for the front page.** Rejected by Felix: four weeks left, and tests on the live page are better evidence than Claude's variants.

## What the competitor boards say (Felix's notes, summarised)

| Competitor | Take | Avoid |
|---|---|---|
| Bloomit | Trust badges under the product; price/size pools; card text on the product page | Recipient name and address asked before add-to-cart: a barrier before the decision |
| Interflora | Emotional hero; a card with text; order overview in the cart | Upsells twice; better on a separate step, or not at all (choice overload) |
| Kaj Larsen | Delivery or pickup as two buttons; I dag / I morgen / Anden dato; predetermined choices for people who don't know flowers; summary before payment | Slow, crowded navigation, green overlays on products; card text hidden in the cart |

## Work log

- **Front page analysis (23 Nov).** Felix's front page matches the proven patterns at almost every point (table in design.md). Two gaps, marked as proposals for him rather than changed: the hero has no words saying what the shop is (Baymard: 42% of mobile homepages set wrong expectations), and the payment methods are not shown anywhere before checkout. Two changes made under existing rules: a heading in Inter moved to Ancizar Serif (brand guide), and "Begravelse" to "Bisættelse" (DD-03).
- **Hi-fi draft built in Figma (23 Nov).** Page "Hi-fi (arbejde)": S1–S8 (front page to confirmation, including the out-of-area state and the added-to-cart sheet) and B1–B6 of the back office; B7 (sales) not built. Exported to `docs/design/hifi/draft-2026-11-23/`. Built on Felix's front page (cloned, then the logged decisions applied) and his footer C. Stand-in photos are the ones from Felix's mockup; Tak shows "Foto kommer".
  - *Slip:* a batch that timed out was retried while the first was still running in Figma, which left duplicate screens. They were deleted; afterwards batches were kept small and checked before any retry.
  - Tab bar in the back office follows Apple's and Material's bottom navigation for 3–5 top destinations; this source was not in design.md's list and is added.
- **New owner insight, mid-build (Felix, 23 Nov).** The owner works analogue: technology is a medium she accepts, not something she enjoys; less time on the screen means more time with flowers. Today her orders hang as paper on a pinboard, and she prefers printed slips. This undercuts the back-office draft, which assumes she manages orders on the phone. Building stopped at B6; options in the reply to Felix, decision pending.
