# Brand identity

**Started:** 16 Nov 2026 · **Change:** [`brand-identity`](../../openspec/changes/brand-identity/) · **Branch:** `feature/brand-identity`
**Related:** [Design rationale](../../ref/Design-Rationale.md) (P7, P9, P11) · [Owner interview](2026-11-16-owner-interview.md)

## Goal

One recorded brand system (logo, colour, type, tokens) so the storefront build needs no further colour or type decisions, and every AI session uses the same choices instead of its own defaults (P11).

## Why the earlier plan was dropped

An earlier plan from week 1 (change `establish-brand-identity`) had AI redraw the leaf logo as SVG, with about 30 tasks. Felix dropped it on 16 Nov: he designs the logo himself, and the AI-drawing process kept running into problems. The new plan is smaller, and AI draws no logo artwork. On 16 Nov AI also produced simplified leaf drafts traced from the logo; Felix had them reverted the same day for the same reason. Simplifying the leaf for small sizes is Felix's job.

## Inputs

| Input | From | Date |
|---|---|---|
| Logo, `ref/brand/Logo.svg`: name set in Ancizar Serif, ginkgo leaf, circle, divider; phone number removed | Felix | 16 Nov |
| Palette, `ref/COLORS.png`: Paper, Linen, Sand, Ink with tint steps | Felix | 16 Nov |
| Palette idea: based on the owner's liking for paper as the background | Owner, via Felix | 16 Nov |
| Ratio: Paper is the ground; Linen, Sand and Ink split about 60/30/10 | Felix | 16 Nov |
| Heading and logo typeface: Ancizar Serif | Felix | 16 Nov |

### Palette as supplied

| Name | Hex | Role | Share |
|---|---|---|---|
| Paper | `#F7F4EF` | Page background (the ground) | outside the ratio |
| Linen | `#DCD4D1` | Main surfaces: cards, bands, panels | about 60% |
| Sand | `#7A644F` | Logo, feature bands, footer, buttons | about 30% |
| Ink | `#2D2A26` | Text and strongest accents | about 10% |

Not in the palette: the logo's leaf also uses a light tan, `#E2BE92`. Treated as decorative logo detail only unless Felix adds it.

## Logo file check (16 Nov)

The SVG contains outlined paths only: no `<image>`, no `<text>`, no phone number. It is 1.2 MB because the leaf is about 1,900 small stroked shapes, each exported with a mask. Felix will flatten the strokes in Figma (Outline stroke, then Flatten) and make a simplified leaf for small sizes.

## Typography

### Body typeface recommendation: Ancizar Sans

Ancizar Sans is drawn by the same designers as Ancizar Serif on shared proportions, so headings and body match without tuning. It is a humanist sans, warm and clear at 16 px. Alternatives on the specimen: Ancizar Serif for everything, Instrument Sans (neutral), and the system font (no download). Reasons are in the change's design.md, decision 2.

### Font files (17 Nov)

- Downloaded the variable fonts and OFL licences from the Google Fonts repository into `ref/brand/fonts/source/`.
- Limited the weight axis to 400–700 and subset to Latin plus Danish letters, then converted to WOFF2. Details in [ref/brand/fonts/README.md](../../ref/brand/fonts/README.md).
- Shipped total 73.2 KB (Serif, Serif Italic, Sans), under the 100 KB budget (P7). Each file contains æ ø å Æ Ø Å and €.

### Specimen (17 Nov)

[ref/brand/specimen.html](../../ref/brand/specimen.html) shows four body candidates side by side with the same Danish copy: heading, product name, price, button, body text at 16 px, prices with Danish separators, weights 400–700, and a line full of æ ø å.

Checked in a headless browser at 390 px:
- No sideways scrolling.
- Fonts loaded: Ancizar Serif, Ancizar Sans, Instrument Sans, all from local files. Zero requests to other servers.

Fixes while building it:
- A sample sentence claimed the shop ties bouquets on the delivery day. That is not something the owner has said, so it was replaced with neutral text (roadmap rule 6).
- The small labels were first set in Sand on Linen, about 3.8:1, below the 4.5:1 needed for small text (P9). Changed to Ink.

**Waiting on:** Felix's choice of body typeface on the specimen (task 2.4).

## Open questions

- Is `#E2BE92` part of the palette or logo-only?
- Simplified leaf for 16–64 px (favicon, header on a phone): Felix to supply.
