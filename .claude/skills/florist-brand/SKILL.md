---
name: florist-brand
description: Applies the Nikita Nielsen florist brand (palette, Ancizar Serif and Inter, logo variants, Danish voice) to anything built for the webshop. Use it whenever you style a page, component, email, board or document for this shop, choose a colour or font, place the logo, or write customer-facing Danish copy.
---

# Nikita Nielsen brand

## Overview

The brand for the Nikita Nielsen florist webshop (Holbæk). Made in this project (OpenSpec change `brand-identity`, 17 Nov 2026), owned by the shop.

**Keywords**: branding, colours, palette, typography, logo, favicon, tokens, contrast, Danish copy, voice

## Sources of truth

Read these before styling anything. If this skill and they disagree, they win.

- `ref/brand/tokens.css`: every colour, font and size as CSS custom properties. Use the tokens, never raw hex values or font names.
- `ref/brand/brand-guide.md`: how to use them: logo rules, pairings, components, imagery, voice.
- `ref/brand/contrast.md`: generated table of allowed and forbidden colour pairings. Regenerate with `node ref/brand/scripts/contrast.mjs` after any colour change.
- `ref/brand/brand-board.html`: the approved look, rendered from the tokens.

## Brand guidelines (summary)

### Colours

Paper `#F7F4EF` is the ground. On it, colour is split about 60/30/10:

- Linen `#DCD4D1`: cards, panels, bands
- Sand `#7A644F`: logo, buttons, links on Paper, feature bands, footer
- Ink `#2D2A26`: text, selected states
- Error `#9B2C24` and success `#36602F`: only on Paper or Linen, always with text

Hard rules: text on Sand is Paper. Links on Linen are Ink, not Sand. Never Ink on Sand. Linen cards on Paper need a 1 px Sand border. Every interactive element uses `--focus-ring`.

### Typography

- Headings and logo: Ancizar Serif (`--font-heading`), self-hosted from `ref/brand/fonts/`
- Body, forms, buttons, prices: Inter (`--font-body`), self-hosted
- Never load fonts from Google Fonts or any other external service
- Scale tokens `--text-sm` to `--text-3xl`; inputs never below 16 px
- Prices: tabular numbers, Danish format, incl. moms: `250 kr.`, `1.250,50 kr.`

### Logo

- Full lockup (`logo/logo-full-*.svg`) where there is room; half moon (`logo/logo-half-*.svg`) in the navbar; leaf only as favicon (`logo/favicon/`)
- On the website use the PNG exports in `logo/web/`; the SVG master is 800 KB
- One colour only: Sand or Ink on light grounds, Paper on Sand or Ink
- Clear space: the height of the capitals in NIKITA NIELSEN on every side. Minimum width: full 120 px, half moon 110 px
- Never redraw, recolour outside the palette, stretch or add effects. Logo artwork is Felix's; AI only crops frames and swaps palette colours

### Voice and content

- Customer-facing text in Danish, du-form, plain and concrete, no exclamation marks in running text
- State facts (delivery area, fee, cut-off time, prices) rather than marketing language
- Calm tone on sympathy and funeral pages
- Never invent products, claims, reviews or photos. Only the owner's photos at launch; stand-ins on preview builds are listed and replaced
