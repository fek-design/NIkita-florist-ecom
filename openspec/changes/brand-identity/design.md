## Context

See proposal.md for motivation. Current state: `DevEnv` holds greyscale lo-fi wireframes (`ref/wireframes/lofi/`) and no brand files. There is no app scaffold yet, so brand files live under `ref/brand/` for now. Felix has a new logo set in Ancizar Serif, without the phone number. The files are not in the repo yet.

Constraints from `ref/Design-Rationale.md`: at most two font families, self-hosted and subset (P7); AA contrast checked when the palette is chosen (P9); the brand comes from the shop, not a template (P11). From CLAUDE.md: the palette and type are chosen, not dealt (override 3); the Anthropic brand skill is a format reference only (override 5); each piece of work gets a process note.

## Goals / Non-Goals

**Goals:**
- A brand system small enough to finish in one or two sessions and precise enough that the storefront build needs no further design decisions on colour and type.
- Every value traceable to a decision with a reason.

**Non-Goals:**
- Logo drawing, icon set, motion rules, photography direction beyond a short paragraph.
- Styling real screens. Mid-fi wireframes and the storefront use the tokens later.

## Decisions

### 1. Felix makes the logo; AI handles files only
AI checks the delivered SVG (text converted to outlines, no embedded bitmap, no hidden layers), optimises it, and exports colour variants and a favicon set. It changes no shape.
*Alternative rejected:* AI draws the mark, as in the earlier plan. Felix does not need it, and it leaves authorship and licence unclear.

### 2. Body typeface: Ancizar Sans
Ancizar Sans is the sans companion of Ancizar Serif, drawn by the same designers (Universidad Nacional de Colombia, Puertas, Monsalve, Moncada) on shared proportions.
- **Fit:** headings and body share x-height and rhythm, so the pairing looks deliberate with no tuning. It is a humanist sans, warm enough for a florist and clear at 16 px.
- **Licence:** SIL Open Font License, which permits commercial self-hosting and subsetting.
- **Coverage:** Latin Extended, which includes æ ø å.
- **Performance:** a variable font (weight 100–1000), so one file per style covers every weight. Ancizar Serif is also variable (300–900).
- **Source:** verified on 16 Nov 2026 in the Google Fonts repository metadata for both families.

*Alternatives considered:*
- *Ancizar Serif for body as well.* One family and the smallest download, but a serif at 14–16 px in forms and buttons on a phone reads less cleanly than a sans (P1).
- *A neutral sans such as Inter or Instrument Sans.* Safe and very legible, but it is the default look of most new sites, which P11 argues against, and it shares nothing with the heading face.
- *System font stack.* No download at all, but the look differs per device and loses the brand.

The choice is confirmed on a specimen before it is locked (spec: "Body typeface confirmed on a specimen"). If Felix rejects it, the fallback order is Instrument Sans, then the system stack.

### 3. Font delivery
Download the variable TTFs from the Google Fonts repository, subset them to Latin plus the Danish letters and common punctuation, and convert to WOFF2. Upright only, plus the Serif italic if the logo or headings use it. Budget: under 100 KB for all font files together. Use `font-display: swap` with a metric-matched fallback stack to limit layout shift (P7).
*Alternative rejected:* the Google Fonts CDN. It sends visitor IP addresses to a third party, which adds a GDPR question for no gain.

### 4. Palette comes from Felix and the owner
Felix supplied the palette on 16 Nov 2026 in `ref/COLORS.png`. It is built on the owner's liking for paper as the background, and is used at roughly 60/30/10:

| Token | Hex | Role | Share |
|---|---|---|---|
| Paper | `#F7F4EF` | Page background | about 60% |
| Linen | `#DCD4D1` | Secondary surfaces: cards, bands, footer | about 30% |
| Sand | `#7A644F` | Accent: logo, buttons, links | about 10% |
| Ink | `#2D2A26` | Text | text only |

The sheet also shows four tint steps of each of Linen, Sand and Ink. They become tokens only where a component needs them.

First hand-calculated contrast ratios, to be replaced by the script's table (decision 6): Ink on Paper about 13:1 and Ink on Linen about 9.8:1 (both pass for body text); Sand on Paper about 5.1:1 (passes for body text, with little margin); Sand on Linen about 3.8:1 (large text and interface parts only); Sand on Ink about 2.6:1 (forbidden).

The logo file `ref/brand/Logo.svg` also contains a light tan, `#E2BE92`, in the leaf. It is not in the palette, and its contrast on Paper is about 1.6:1, so it is treated as decorative logo detail only unless Felix adds it to the palette.

AI may propose the functional colours (error, success, focus), each labelled as a proposal and logged with a reason. taste-skill's random deal is not used here.

### 5. Tokens in plain CSS custom properties
`ref/brand/tokens.css` holds colour roles, font families, a type scale of 5–7 steps, and weights. Plain CSS works in the brand board today and in any framework later, so the unlocked framework decision does not block this change.
*Alternative rejected:* a Tailwind theme file. The framework is not locked yet.

### 6. Contrast table from a script
A small script reads the token values, computes the WCAG contrast of each text and background pairing, and writes the allowed and forbidden table. The table is regenerated whenever a colour changes, so it cannot drift from the tokens.

### 7. Brand board as a static page
`ref/brand/brand-board.html` imports `tokens.css` and shows the logo variants, palette, pairing table, type specimen with Danish copy, a sample button and a product card. It is the page the owner signs off on, opened from a file or a simple local server.

### 8. Skill last
`.claude/skills/florist-brand/SKILL.md` is written from the finished brand guide, in the format of `brand-guidelines`. Then `brand-guidelines` is removed and CLAUDE.md override 5 and `PROVENANCE.md` are updated.

## Risks / Trade-offs

- [Ancizar is a young family (added to Google Fonts in April 2025) and less battle-tested than Inter] → the specimen task tests Danish text, numerals and prices at small sizes on a real phone before lock-in.
- [The palette or logo files arrive late from Felix or the owner] → typography, font files, the script and the board skeleton do not depend on them and are done first.
- [Variable fonts with the full weight range may exceed the size budget] → restrict the weight axis during subsetting, or ship two static weights instead.
- [Owner asks for changes after sign-off] → values live only in tokens, so a change is one edit plus a regenerated contrast table.

## Open Questions

- Does the owner want e-mærket or other trust marks shown next to the logo? This affects clear-space examples only and can be answered at sign-off.
