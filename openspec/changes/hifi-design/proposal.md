## Why

Felix designed the front page in Figma and the footer has been chosen (DD-01 to DD-14). The rest of the shop, the occasion page, cart, checkout and confirmation, and the owner's back office, has only lo-fi wireframes (concept C and D). Building screen by screen with 2–3 variants each would not fit the remaining four weeks. On 23 Nov Felix decided to make **one complete hi-fi set** from proven patterns and his competitor analysis, then improve it through usability tests on the live page, keeping each version as documentation.

## What Changes

- **Pattern analysis of the front page:** what in Felix's design matches proven patterns and the competitors, and what is missing, with sources.
- **One hi-fi set in Figma** at 402 px (Felix's frame width), in his design language and the brand. The set covers:
  - storefront: front page, menu, category page `/anledninger`, occasion page (with the out-of-area state), added-to-cart confirmation, cart, checkout and order confirmation;
  - back office: sign-in, orders, order detail, occasions list, edit occasion, delivery and capacity settings, sales overview.
- **No new patterns.** Each element cites a proven pattern (Baymard, Nielsen Norman Group, Shopify Polaris) or Felix's competitor boards (`ref/competitor/`). Anything else is marked on the screen as a proposal for Felix.
- **Versioning:** the set Felix approves is frozen as v1 before the first test. Each later test round makes a new version with a changelog.
- **Process rule** in CLAUDE.md: one hi-fi set, then tests, replacing variants per choice for the remaining screens (DD-15).

## Capabilities

### New Capabilities

- `design-process`: how the hi-fi set is made, traced to its sources, reviewed and versioned between tests.

### Modified Capabilities

- `back-office` *(added 23 Nov, v2)*: the owner works on paper (DD-16, DD-17), so orders arrive as printed slips and a morning sheet, the order status is the pinboard, and sales come as a monthly email.

The storefront's pickup slots and delivery instructions (DD-18, DD-19) belong to the storefront and checkout specs and are added there.

## Impact

- Figma file "Nikita": a page per version holding the set.
- `docs/design/versions/`, `docs/design/hifi/` (pattern analysis), `docs/design-decisions.md` (DD-15), `docs/process/2026-11-23-hifi-design.md`, `CLAUDE.md`.
- The storefront change builds its screens from this set; the checkout (week 3) and back-office changes do the same.
- Branch `feature/hifi-design` starts from `feature/storefront`, because it needs the unmerged design log. Felix's choice on 23 Nov; it merges into DevEnv after storefront.
