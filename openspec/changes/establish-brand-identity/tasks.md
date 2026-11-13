# Tasks

## 1. Setup and process log

- [ ] 1.0 Confirm `prepare-design-workflow` is archived and note which adopted skills this change uses; verify the skill names are listed in the process note
- [ ] 1.1 Create `docs/process/2026-11-10-brand-identity.md` with goal, inputs (old logo, 60/30/10, competitor boards), the old logo's faults and the overhaul direction; verify the file links this change and `Ref/Design-Rationale.md`
- [ ] 1.2 Install svgo as a dev-only tool and write a render script that produces the test sheet (decision 3) from any SVG; verify it renders the old logo at 16/32/64/400 px on all five grounds
- [ ] 1.3 Render the old logo's test sheet as the baseline; verify it is saved in the process note

## 2. Brief and design rounds (AI draws, Felix sets type and decides)

- [ ] 2.1 Write `Ref/brand/brand-brief.md` (keep, improve, constraints, test criteria, leaf drawing method, the role split); verify Felix approves it and every "improve" item has a test on the test sheet
- [ ] 2.2 Draw 2-3 small-first leaf drafts as SVG paths into `Ref/brand/new/` (using Felix's paper sketches if provided); verify each passes the test sheet at 16 px and contains no `<image>` element
- [ ] 2.3 Felix and the owner pick a leaf; draw its detailed version with the same silhouette; verify the side-by-side shows one leaf family
- [ ] 2.4 Felix chooses the typefaces (commercial licence) and delivers the name and subtitle as outlined SVG into `Ref/brand/new/`; verify they are paths, not live text
- [ ] 2.5 Compose the primary lockup (circle, leaf, name, divider, subtitle); for each round (max 3), render the test sheet beside the old logo and record Felix's feedback; verify each round is in the process note
- [ ] 2.6 Owner sign-off on the final logo next to the old one, with Felix's role (type, direction, selection) noted as human authorship; verify both are recorded (spec: "Feel of the old logo kept")

## 3. Logo deliverables

- [ ] 3.1 Clean the approved SVGs: outlined text, no hidden layers or embedded images, `currentColor` masters, svgo-optimised; verify each master is under 30 KB and passes the `<image>` scan
- [ ] 3.2 Export the 12 variants (4 lockups × colour/ink/white) with explicit fills and transparent backgrounds into `Ref/brand/logo/`; verify the file count is 12 and each renders at 64 px and 2000 px
- [ ] 3.3 Export the favicon set from the small leaf (SVG, 32 px PNG, 180 px apple-touch, 512 px) into `Ref/brand/logo/favicon/`; verify the dimensions and that the 16 px render reads as one leaf
- [ ] 3.4 Define clear space and minimum sizes from the final artwork; verify they are stated in the guide with a diagram

## 4. Colour system

- [ ] 4.1 Write `Ref/brand/tokens.css` with ground, sand, brown, ink and functional colour tokens and their roles as comments; verify the starting hex values are present unchanged
- [ ] 4.2 Prepare the side-by-side comparisons (white vs paper ground; sand at hue 16° vs nudged towards 33°) for the board; verify both variants render from tokens
- [ ] 4.3 Compute the contrast of every pairing with a script and generate the allowed/forbidden table; verify every allowed pairing meets its threshold and brown-on-ink and brown body text on sand are listed as forbidden
- [ ] 4.4 Pick the functional colours (error, success, focus) that pass 3:1 on every ground; verify with the same script

## 5. Typography

- [ ] 5.1 Start from the logo typefaces if they qualify (task 7.2); otherwise shortlist three heading/body pairings meeting design decision 7 (OFL or perpetual self-hosting licence, æ ø å, max 2 families, WOFF2); verify the licence and source are recorded for each
- [ ] 5.2 Render the pairings on the board with Danish sample copy (heading, product name, price, button, body at 16 px on a 390 px viewport); verify the screenshots are saved to the process note
- [ ] 5.3 Add the type scale (5–7 steps), weights and fallback stack to `tokens.css`; verify the board picks them up from the tokens

## 6. Brand guide, board and skill

- [ ] 6.1 Build `Ref/brand/brand-board.html` importing `tokens.css`: logo variants, palette at 60/30/10, pairing table, type specimen, imagery direction, sample button and product card; verify that changing one token visibly changes the board
- [ ] 6.2 Write `Ref/brand/brand-guide.md`: logo use, clear space, minimum sizes, don'ts, colour roles and pairings, typography, imagery direction (owner's photos only), Danish voice, licence status table; verify every spec requirement maps to a section
- [ ] 6.3 Create `.claude/skills/florist-brand/SKILL.md` in the `brand-guidelines` format and point CLAUDE.md override 5 to it; verify the skill appears in the session's skill list
- [ ] 6.4 Add a "Brand decisions" section to `Ref/Design-Rationale.md` linking the guide, with each decision citing P1–P12 or marked *opinion*; verify the links resolve

## 7. Licences

- [ ] 7.1 Record each logo typeface with licence, holder and source, and the artwork as original work (AI-drawn leaf, Felix's typography); verify no element is "unknown" (spec: "Licence status for every logo element")
- [ ] 7.2 Check whether the logo typefaces qualify as web fonts (decision 6); verify the result decides whether task 5.1 evaluates alternatives
- [ ] 7.3 Remove the retired `brand-guidelines` (Anthropic) skill once `florist-brand` exists; verify it is gone and `PROVENANCE.md` is updated

## 8. Integration check

- [ ] 8.1 Walk the brand board with Felix and the owner; record the sign-off and any requested changes in the process note
- [ ] 8.2 Run `openspec validate establish-brand-identity` and confirm every spec scenario has a checked result in the process note

## Workflow follow-up

- Archive the change once the licence table has no "unknown" entries and the owner has signed off
- Move `tokens.css` into the app's styles when it is scaffolded (design decision 8)
