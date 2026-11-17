# Brand identity

**Started:** 16 Nov 2026 · **Finished:** 17 Nov 2026 · **Change:** [`brand-identity`](../../openspec/changes/archive/2026-11-17-brand-identity/) · **Branch:** `feature/brand-identity`
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

## Final logo and responsive variants (17 Nov)

Felix replaced the logo with his final version: one colour only (`#7A644F`, Sand), 800 KB instead of 1.26 MB. The light tan `#E2BE92` is gone from the leaf, which settles that open question: it is not part of the brand.

`ref/brand/Logo.svg` is the source. `ref/brand/scripts/crop-logo.mjs` crops it by measuring the drawing in a headless browser and changing only the frame (viewBox, width, height). No path is touched, so the artwork stays Felix's.

Responsive logo, Felix's idea, inspired by how Interflora adapts its logo to the space:
- **Full lockup** (`logo/logo.svg`): circle, leaf, name, divider. For large places: hero, footer, emails.
- **Half moon** (`logo/logo-half.svg`): the frame stops just above where the lower half of the circle starts, leaving the top arc, the leaf and the name. For the navbar.

A first version of the half moon cut below the divider. That left two short stubs of the lower circle under the name, so the cut was moved up to where the lower arc begins. At 48 px tall in a phone navbar the name is readable; the leaf turns into a light texture. Felix accepted the half-moon crop on 17 Nov. Preview: `ref/brand/logo/preview.png`.

## Logo files for the web (17 Nov)

Felix decided against a simplified leaf: one more drawing would be one style too many. Acknowledged for the report: the logo was given, not designed in this project, and it is weak at small sizes. Had the brief been to make a new logo, a mark designed for 16 px would have been worth considering.

What was made, all by `ref/brand/scripts/export-logo.mjs` (colour swaps and frame crops only):
- **Colour variants:** full lockup and half moon in Sand, Ink and Paper.
- **Web rasters:** PNG at 1x, 2x and 3x for the two places the site uses the logo: the half moon in the navbar (110 px wide, 11.9 KB at 2x) and the full lockup in the footer (160 px wide). The SVG master is 800 KB, too heavy for a header on every page (P7).
- **Favicon:** the leaf cropped from the logo, on a Paper square at 32, 180 and 512 px, so it shows on light and dark browser tabs.

Dead end: rounding the SVG's coordinates to shrink it saved only 12% (800 to 700 KB) and changed edge shading on 1% of pixels, by up to 74 of 255 levels. Not worth it; dropped. The weight is the drawing itself, about 1,500 hatching lines in the leaf.

Checked on all four grounds at 16, 32 and 64 px:
- The half moon reads from about 32 px high.
- The full lockup needs about 64 px high before the name reads.
- The leaf favicon is faint at 16–32 px because its lines are so fine.

Rules taken from this (diagram: `ref/brand/logo/clear-space.png`):
- **Clear space:** at least X on every side, where X is the height of the letters in NIKITA NIELSEN (77.7 units, 9% of the logo's width).
- **Minimum size on screen:** full lockup 120 px wide, half moon 110 px wide. The leaf alone is only used as favicon and app icon.

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

Repository slip (17 Nov): the first commit of this work used `git add -A`. This branch's `.gitignore` predates the frontend/backend split, so the other branch's leftover `node_modules`, build output and local env files were committed too. Nothing was pushed. The commit was rebuilt with only the 17 brand files, and from now on files are staged by name.

### Decision: system font for body text (17 Nov)

Felix chose option D, the device's own system font, over the recommended Ancizar Sans.

His reasoning: Ancizar Sans fits the theme but adds little to it, and by Jakob's law people spend most of their time on other sites and apps, so body text in the face they read every day is easier. That matters most for body text.

Supporting points: nothing to download for body text (P7), and forms and buttons match the phone's own interface (P1). The cost is that body text looks slightly different on iPhone, Android and Windows, so the brand board must be checked on both phone platforms.

This changed the spec: only Ancizar Serif would be self-hosted.

### Change of mind: Inter for body text (17 Nov, same day)

Felix then moved from the system font to Inter. His concern: a system font is not fixed. Some phones ship their own system font, and some users pick one, so the site would show in a face nobody chose and look amateurish. Inter keeps the familiar, interface-like reading he wanted (it is close to San Francisco and Roboto) and looks the same everywhere, so what the owner approves is what customers see.

Cost: 26.3 KB after subsetting, 76.9 KB for all shipped fonts, still under the 100 KB budget (P7). The spec is back to two self-hosted typefaces: Ancizar Serif and Inter. Inter was added to the specimen as column E. Ancizar Sans and Instrument Sans stay in the repository only so the specimen still shows what was compared.

## Colour tokens and contrast (17 Nov)

- `ref/brand/tokens.css` holds the palette unchanged, role tokens (background, surface, text, accent, link, border), the fonts and a six-step type scale (14, 16, 20, 24, 32, 40 px).
- `ref/brand/scripts/contrast.mjs` reads the tokens and writes [ref/brand/contrast.md](../../ref/brand/contrast.md), so the table can never drift from the values.
- Results that shape the design:
  - Ink on Paper (13.0:1) and Ink on Linen (9.8:1) are fine for any text.
  - Sand on Paper (5.1:1) is fine for text and links.
  - Sand on Linen (3.8:1) is for large text and borders only, so links on Linen cards are Ink.
  - On Sand bands, text is Paper (5.1:1). Ink on Sand (2.6:1) is forbidden.

### Functional colours: accepted for now (Felix, 17 Nov)

| Token | Hex | On Paper | On Linen |
|---|---|---|---|
| Error | `#9B2C24` | 6.9:1 | 5.2:1 |
| Success | `#36602F` | 6.7:1 | 5.0:1 |

Deep, slightly brown-leaning red and green, so they sit with the palette instead of looking like default warning colours (*opinion*).

The task asked for colours that pass 3:1 on every ground. That is impossible for one colour on both Paper (very light) and Sand (dark). So these pass 4.5:1 on Paper and Linen, where forms live, and are listed as forbidden on Sand and Ink: no error or success message is ever placed there.

The focus ring is two-tone (Ink ring, Paper halo) and passes on all four grounds. Colour is never the only signal: errors and success also carry text or an icon (P9).

## Brand board (17 Nov)

[ref/brand/brand-board.html](../../ref/brand/brand-board.html) is the page the owner signs off on. Open it through a local web server (`cd ref/brand && python3 -m http.server`), because browsers block the logo masks when a page is opened straight from disk.

- Everything is read from `tokens.css`. The swatches and the pairing table are calculated in the page from the current token values.
- The logo is recoloured with a CSS mask (Sand, Paper on Sand, Ink on Linen), so the artwork file itself is never edited.
- Sections: logo and a phone navbar, palette with the 60/30/10 bar, live pairing table, type scale and Danish text, buttons with the focus ring, a postcode field in its success and error states, an occasion card with the three tiers, a Linen panel, a Sand band and a Sand footer.

Checked in a headless browser:
- No sideways scrolling at 390 px or 1280 px.
- Only Ancizar Serif and Inter load, both from local files, with no outside requests.
- A copy with `--sand` changed showed the new colour in the swatch and the button with no other edit.

Finding: in a 64 px navbar the half-moon logo is 76 px wide and the name's capitals are about 7 px tall, too small to read. The board now shows a 72 px navbar with the logo 110 px wide, where the name reads clearly. That sets a minimum: the half moon is not used below 110 px wide.

## Guide, skill and records (17 Nov)

- [ref/brand/brand-guide.md](../../ref/brand/brand-guide.md): logo, colour, type, components, imagery, Danish voice, known limitations, licences.
- `.claude/skills/florist-brand/`: a short skill that points AI sessions to `ref/brand/` rather than copying values, so it cannot drift. Anthropic's `brand-guidelines` was removed, and CLAUDE.md override 5 and `PROVENANCE.md` updated.
- `ref/Design-Rationale.md` has a "Brand decisions" table (B1–B12), each citing a principle or marked *opinion*.
- The `brand-identity` skill's retire condition is now met (the florist skill and guide exist). Removing it is Felix's call at the next checkup.
- Correction: the first guide draft stated that all logo rights sit with the shop. That is not established, so it now says the artwork is Felix's, made for the shop, with rights to be confirmed in writing at hand-over. A matching row goes into `docs/handover.md` once this branch and `feature/stack-and-scaffold` meet in `DevEnv`.

## Sign-off (17 Nov)

- **Owner:** approved the brand board on 17 Nov 2026, relayed by Felix. No changes were reported.
- **Skill:** Felix retired the `brand-identity` framework skill the same day; its job is done (`PROVENANCE.md`).

## Open questions

None left for this change. The logo-rights row in `docs/handover.md` is added when this branch and `feature/stack-and-scaffold` meet in `DevEnv`.
