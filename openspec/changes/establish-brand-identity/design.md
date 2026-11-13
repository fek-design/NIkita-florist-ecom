# Design

## Context

Inspected on 2026-11-10 (see proposal.md for motivation):

- `Ref/brand/Nikita logo, blad.pdf` was made in Adobe Illustrator 30.7, on an A3 page. The text is live and embedded as **AdobeThai-Regular** ("NIKITA NIELSEN") and **ADayWithoutSunText-Regular** ("BLOMSTERDEKORATØR", "TLF. 28 25 74 13"). The circle (0.25 pt) and the divider are vectors. The **ginkgo leaf is a raster**: 1224×1285 px with an 8-bit alpha mask, white hairline art.
- The logo uses exactly two colours: brown `#7A634F` (ground) and tan `#C7B299` (all marks). Felix's refined palette keeps the brown (as `#7A644F`), replaces the tan with sand `#DCD4D1` and adds ink `#2D2A26`.
- Measured contrast: tan on brown 2.75. Sand on brown 3.82. Ink on sand 9.78. Brown on sand 3.82. Brown on ink 2.56. White on brown 5.58.
- "A Day Without Sun" is CC BY-NC (non-commercial). Felix judges that the leaf reads as an AI-generated image placed in Illustrator. Its source and licence are unknown, and its hairline veins break down at small sizes.
- Felix's direction (10 Nov): a **complete overhaul that keeps the feel and style**, "a better version of itself". It includes new commercially ready fonts. Roles, as corrected by Felix: **the AI designs the assets**, meaning the leaf, the lockups, the favicon and later icons. **Felix does the typography** (font choice under his commercial licence, typesetting), UI/UX and approval. The phone number goes.
- This change starts after `prepare-design-workflow`'s skill checkup. Decisions below name the job, and an adopted skill (if any) helps with the craft.
- Felix's direction: Scandinavian, beige, earthy, simple, close to nature. The owner likes strong flower colours, so the flowers carry the colour (option A, no UI accent). Sand is a 60% *share of brand colour* (bands, backdrops, accent cards), not the page ground.
- Competitor boards (`Ref/competitor/`): Kaj Larsen uses green, Bloomit gold/olive and Interflora dark teal with gold. All use white page grounds, and the latter two use serif headlines. A warm brown and sand system doesn't clash with any of them.

## Goals / Non-Goals

**Goals:**
- A logo that keeps the old feel, is better at every size, and is licence-clean
- A clear split of roles: the AI draws and produces, Felix sets the type and decides
- One token file that drives both the brand board and, later, the webshop
- Every brand choice carries a stated reason (CLAUDE.md override 3)

**Non-Goals:**
- Raster or image-model generation of any asset. The AI draws vectors by construction, as SVG paths, and never traces or generates bitmaps
- Print production specs (CMYK and Pantone), signage, packaging
- Photography. The imagery direction is written here, and the shoot happens with the owner later

## Decisions

**1. The AI draws the assets, Felix sets the type and decides.**

```
  AI: brand-brief.md (Felix approves) ---> optional: Felix's paper sketches as input
        |
  AI: 2-3 leaf drafts as SVG, small-first ---> test sheet ---> Felix + owner pick
        |
  Felix: chooses typefaces (his licence), sets name + subtitle, exports outlined SVG
        |
  AI: composes lockups from leaf + Felix's type ---> test sheet ---> iterate (max 3 rounds)
        |
  AI: clean, 12 variants, favicon, exports ---> owner sign-off
```

The AI constructs the leaf as vector paths, built from geometry (a fan, a notch, veins as filled shapes). It does not trace the old leaf or use an image model. Felix owns the typography, because type is his strength and the fonts sit under his licence.
*Rejected:*
- *Felix drawing the artwork:* drawing is not his strength, per Felix.
- *Tracing the old leaf:* it carries over a likely AI-generated raster of unknown licence.
- *Image-model generation:* unclear licence, and bitmaps that would need tracing, which is the slop the roadmap rules out.

**2. The brief keeps the feel and fixes the faults.**
`brand-brief.md` is the shared contract that Felix approves before drafting starts:
- **Keep:** the circle as the frame, the ginkgo as the symbol, a classic serif name in capitals with open tracking, a quiet subtitle in thin capitals, a divider, the brown/sand warmth, and generous space.
- **Improve:**
  - the leaf works from 16 px to sign size: filled shapes rather than hairlines, a central notch that survives at 16 px;
  - one leaf family in two detail levels;
  - the lockup works without the circle, too;
  - no contact details.
- **Constraints:** commercially licensed fonts with Æ Ø Å; it works in one colour; vector only, with no embedded images.
- **Test criteria:** the exact renders the AI runs on every draft (decision 3), agreed in advance.
- **Drawing method for the leaf:** start at 32 px with the fan silhouette, the central notch, the stem and about five filled veins. Then add detail for the large version without changing the silhouette.

**3. Every draft gets the same test sheet.**
The AI renders each draft at:
- 16, 32, 64 and 400 px;
- in one colour;
- on white, paper, sand, brown, and over a busy flower photo;
- next to the old logo.

It reports what breaks, in plain words. It flags contrast for the logo-on-ground pairings, even though logos are exempt from WCAG, because readable is the goal. The old logo on the same sheet shows the improvement.

**4. Use a master SVG with `currentColor`, exported with explicit fills.**
The master files use `fill="currentColor"`, so the webshop can colour the logo through CSS. The 12 delivered variants carry explicit fills, so they also work in Word, Canva or print:

| Variant | Fill | For grounds |
|---|---|---|
| colour | brown `#7A644F` | white, paper, sand |
| ink | `#2D2A26` | light grounds, single-colour print |
| white | `#FFFFFF` | brown, ink, photographs |

The original "sand on brown" look is shown on the board as an application, using the white or a sand fill.

**5. Colour roles and the page ground, decided side by side on the brand board.**

```
 ground   white #FFFFFF  vs  paper #F1EEED (sand + 60% white)  -> choose on board
 sand     #DCD4D1  60% of brand colour: bands, backdrops, accent cards, image mats
 brown    #7A644F  30%: footer, large headings (>= 24 px), logo, dividers
 ink      #2D2A26  10%: body text, primary buttons (white text, 14.28:1)
 functional: error, success, focus -- chosen to pass 3:1 on every ground
```

Felix also asked whether to nudge the sand's hue from 16° towards the logo tan's 33° at the same lightness. The board shows both versions next to the logo, and the choice is recorded with its reason.
*Rejected:* a separate accent hue for calls to action. That goes against "let the flowers do the visual lifting" and Design Rationale P11.

**6. Licences: logo outlines and web fonts are separate questions.**
- *Logo:* Felix's own artwork, with fonts under his commercial licence. Once the text is outlined in the delivered SVGs, the shop can use the logo freely. The guide records each typeface, its licence and the licence holder.
- *Web:* if the logo faces should also be the site's fonts (the best match), the licence must allow web embedding *without depending on Felix's personal subscription*. An Adobe Fonts web project, for example, stops serving if that subscription ends. So the guide prefers faces that are open-licensed (OFL) or sold with a perpetual self-hosting web licence that can be assigned to the shop. If the logo faces don't qualify, decision 7 picks a web pairing with a matching feel.
*Recommendation to Felix:* when choosing logo fonts, prefer families that also qualify for the web, so the logo and the site share one voice.

**7. Choose web type by criteria, not by taste.**
At most two families. Self-hosted WOFF2 under an open licence (OFL) or a perpetual self-hosting web licence held by the shop. Full æ ø å support. A variable font, or at most three weights. Body text readable at 16 px on mobile. The heading face matches or echoes the new logo's name face, and the body face is a quiet sans. Evaluate three candidate pairings on the board (heading, body, price and button sizes, Danish sample copy) and record the choice.
First check the logo faces against these criteria (decision 6). Only if they fail, evaluate alternatives.
*Rejected:* using the old logo faces, Adobe Thai and "A Day Without Sun". They are retired in the overhaul.

**8. Put the tokens in `Ref/brand/tokens.css` for now, imported by the board.**
When the app is scaffolded (roadmap week 1), the file moves into the app's styles. The board then imports it from there, so it stays a single source (spec: "Tokens are the single source").

**9. Model the florist brand skill on `brand-guidelines`.**
A short `SKILL.md` covering colours with roles, type, logo rules and imagery. Its description triggers on brand and style work for this shop. The CLAUDE.md "Not Anthropic's brand" override then points to it.

**10. The process note is written as the work happens.**
`docs/process/2026-11-10-brand-identity.md` covers the inputs, the brief, every draft's test sheet and feedback round, the palette tests and the type decisions, including the ones rejected.

## Risks / Trade-offs

- [The overhaul loses the feel the owner's customers know] → the brief's "keep" list, a side-by-side with the old logo on every test sheet, and the owner's sign-off before anything ships.
- [AI-drawn leaf looks stiff or generic next to the old one's delicate texture] → 2-3 drafts, compared at every size beside the old leaf. Felix and the owner pick, and the rejected drafts stay in the process note.
- [Copyright in mainly AI-made artwork is uncertain under EU law, which requires human creative input] → Felix's typography, direction and selection are recorded in the process note as the human authorship. Trademark protection of the logo does not depend on copyright. If the owner wants to register it, she should check with an adviser (not legal advice).
- [Asset work takes longer than planned] → the colour and type tokens and the board skeleton proceed in parallel. The board uses the old logo, flagged, until the new one lands.
- [Web licence for the logo faces is unclear or tied to a subscription] → decision 6 settles it before any font file enters the webshop.
- [The owner dislikes the refined palette] → the board shows the original tan next to the refined sand with the contrast numbers, so the trade-off is visible.
- [Brand work eats into week 2's storefront time] → time-box the work to 3 days. Licence fallbacks don't block the board, because the preview uses the current fonts, flagged.

## Open Questions

- Which typefaces Felix chooses. This only decides whether decision 7 needs to evaluate alternatives for the web.
