## Context

Process note: [docs/process/2026-11-16-brand-identity.md](../../../docs/process/2026-11-16-brand-identity.md).

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

### 2. Body typeface: Inter
**Decided by Felix on 17 Nov 2026**, after reviewing the specimen (`ref/brand/specimen.html`).

How the choice moved, for the record:
1. 16 Nov, recommendation: Ancizar Sans, the serif's own companion.
2. 17 Nov, Felix: the system font. Ancizar Sans fits the theme but adds little, and by Jakob's law body text should be what people read every day.
3. 17 Nov, Felix: Inter instead. The system font is not fixed: some phones and some users set their own system font, and the design would then show in a face nobody chose, which looks amateurish.

Inter keeps the familiar, interface-like reading text of a system font and makes it the same on every device.
- **Familiarity (Jakob's law):** Inter is one of the most widely used interface faces and close in style to San Francisco and Roboto.
- **Control:** the brand board looks the same on iPhone, Android and Windows, so what the owner approves is what customers see.
- **Licence:** SIL Open Font License (Rasmus Andersson, Google Fonts repository), so self-hosting and subsetting are allowed.
- **Cost (P7):** 26.3 KB after subsetting (weights 400–700, optical size fixed at the text setting).

*Rejected:*
- *System font:* zero download, but the face is left to the device and the user.
- *Ancizar Sans:* matches the serif but is unfamiliar as reading text.
- *Ancizar Serif for body as well:* a serif at 14–16 px in forms and buttons on a phone reads less cleanly than a sans (P1).
- *Instrument Sans:* familiar-looking but less common than Inter.

### 3. Font delivery
Ancizar Serif and Inter are shipped. Download the variable TTFs from the Google Fonts repository, subset them to Latin plus the Danish letters and common punctuation, and convert to WOFF2: Inter upright, Ancizar Serif upright plus the italic if headings use it. Budget: under 100 KB for all font files together. Use `font-display: swap` with a metric-matched fallback stack to limit layout shift (P7).
*Alternative rejected:* the Google Fonts CDN. It sends visitor IP addresses to a third party, which adds a GDPR question for no gain.

### 4. Palette comes from Felix and the owner
Felix supplied the palette on 16 Nov 2026 in `ref/COLORS.png`. It is built on the owner's liking for paper as the background. Paper is the ground and sits outside the ratio. The colour placed on it is split roughly 60/30/10 between Linen, Sand and Ink (Felix, 16 Nov):

| Token | Hex | Role | Share of colour on the ground |
|---|---|---|---|
| Paper | `#F7F4EF` | Page background (the ground) | outside the ratio |
| Linen | `#DCD4D1` | Main surfaces: cards, bands, panels | about 60% |
| Sand | `#7A644F` | Secondary: logo, feature bands, footer, buttons | about 30% |
| Ink | `#2D2A26` | Text and the strongest accents | about 10% |

Because Sand now covers large surfaces, text on Sand is Paper (about 5.1:1). Linen on Sand (about 3.8:1) is for large text only.

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
