# Lo-fi wireframes, three directions (2026-11-11)

OpenSpec change: none yet. Felix asked to start sketching straight away. Once a direction is picked for mid-fi, the work gets its own change (`/opsx:propose`), and this note gets linked from its design.md.

Files: [Ref/wireframes/lofi/](../../Ref/wireframes/lofi/index.html)

## Goal

Sketch the five key screens from the roadmap's week 1 (home, category, product, cart, checkout) as three different site directions. The aim is to compare structure and flow, and to find out what the brand guide and the owner must supply before mid-fi.

## Inputs

- [Ref/Design-Rationale.md](../../Ref/Design-Rationale.md): principles P1–P12, the three personas (hypotheses, grade C)
- [Ref/Roadmap.md](../../Ref/Roadmap.md): the five key screens, the scope (guest checkout, delivery or pickup, card message, cut-off)
- Competitor boards in `Ref/competitor/` (Interflora, Bloomit, Kaj Larsen), context only
- Felix's request: three different websites, lo-fi

Not used: any brand colour, type or logo artwork. The logo overhaul is on hold (see [skill curation](2026-11-10-skill-curation.md)). Lo-fi uses a "logo (existing)" placeholder.

## Options considered

The three directions differ in the visitor's first question:

| Direction | First question | Date chosen | Built on |
|---|---|---|---|
| A · Dato først | When and where? | Home, before browsing | P2, P3 |
| B · Butiksvinduet | Which bouquet? | Product page | P6, P11 |
| C · Anledninger | What is the occasion? | Product page, with church/address/pickup | P10, P8 |

Each has a different checkout too: A on one page, B in three steps, C on one page whose fields change with the delivery target. This lets the usability test compare them.

Rejected for now:
- **A desktop-first layout.** P1: about half of Danish online purchases happen on a phone, and the shop's traffic comes from social media.
- **A hero carousel or video.** P7: speed is a constraint, and taste-skill rules these out for "place" businesses.
- **Account or login screens.** P4: guest checkout only.

## Decisions

- **Greyscale, system font, crossed boxes for photos.** At lo-fi the comparison should be about structure, not looks. *Opinion*.
- **Annotations cite principles in each frame**, so Felix and the owner can see why each element is there (process-log rule).
- **Shared rules in all three:** cut-off and delivery fee visible before the cart (P2, P3), total incl. moms on product, cart and checkout (P3), MobilePay first (P5), the withdrawal exception in plain Danish at checkout (P12), sold out said in words (P9), real shop details in the footer as placeholders (P8, CLAUDE.md rule 1), pickup offered as an alternative to delivery (P3).
- **`design-taste-frontend` was not used.** Its job is UI build quality. Lo-fi wireframes are not a build, so using it would go against "no forced use".

## How it was checked

- Rendered direction A and C with headless Chrome at 2200 px wide. All five frames lay out at 390 px, annotations sit under each frame, and nothing overflows.
- Not checked yet: keyboard or contrast. Lo-fi HTML is not the product.
- Not tested with users. That is the next step after Felix picks.

## Dead ends and changes of mind

None yet.

## Open questions

- Which direction, or which mix, goes to mid-fi? The overview page suggests mixes (for example B's home with A's pinned date bar).
- Owner facts the wireframes guess at (listed on the overview page): range and prices, occasions, delivery area/fee/cut-off/window, pickup, add-ons, shop details, whether she wants calls.
- C asks for the deceased's name for church delivery. Is that needed at all? (GDPR data minimisation, P4)
- Brand inputs needed for mid-fi are listed on the overview page and fed into `establish-brand-identity`.

Follow-up: the back office (tab D) is sketched in [2026-11-12-back-office-wireframes.md](2026-11-12-back-office-wireframes.md).
