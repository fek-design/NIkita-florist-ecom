## 1. Inputs and process note

- [x] 1.1 Create `docs/process/2026-11-16-brand-identity.md` with the goal, inputs, and the reason the earlier plan was dropped; verify it links this change and `ref/Design-Rationale.md`
- [x] 1.2 Felix adds the logo file (SVG) at `ref/brand/Logo.svg`; verify it contains no phone number and no embedded bitmap — *added 16 Nov: outlined paths only, no `<image>` or `<text>` element*
- [x] 1.3 Felix supplies the starting palette hex values (`ref/COLORS.png`, added 16 Nov) with a note on where each comes from; verify each is recorded in the process note

## 2. Typography

- [x] 2.1 Download Ancizar Serif and Ancizar Sans variable fonts and their OFL licence files into `ref/brand/fonts/source/`; verify the licence text is present for both
- [x] 2.2 Subset to Latin plus Danish letters and convert to WOFF2 in `ref/brand/fonts/`; verify the total size is under 100 KB and æ ø å Æ Ø Å are in each file
- [x] 2.3 Build a specimen page with Danish sample copy (heading, product name, price, button, body at 16 px) showing Ancizar Sans beside the two alternatives from design decision 2; verify it renders at 390 px with fonts loaded from local paths only
- [ ] 2.4 Felix picks the body typeface on the specimen; verify the choice and reason are in the process note

## 3. Colour and tokens

- [ ] 3.1 Write `ref/brand/tokens.css` with colour roles, font families, a 5–7 step type scale and weights; verify Felix's hex values appear unchanged
- [ ] 3.2 Write the contrast script and generate the allowed and forbidden pairing table; verify every allowed pairing meets 4.5:1 or 3:1 as the spec requires
- [ ] 3.3 Propose functional colours (error, success, focus) that pass 3:1 on every ground; verify with the script and log them as proposals for Felix to accept

## 4. Logo files

- [ ] 4.1 Check and optimise Felix's SVGs without changing any shape (outlined text, no hidden layers); verify a before and after render match
- [ ] 4.2 Export colour, ink and white variants and a favicon set (SVG, 32 px, 180 px, 512 px) into `ref/brand/logo/`; verify each renders at 16, 32 and 64 px on every ground
- [ ] 4.3 Record the minimum size and clear space from the final artwork; verify both are stated with a diagram in the guide

## 5. Board, guide and skill

- [ ] 5.1 Build `ref/brand/brand-board.html` from the tokens (logo variants, palette, pairing table, type specimen, sample button and product card); verify that changing one token changes the board and that it lays out at 390 px and desktop width
- [ ] 5.2 Write `ref/brand/brand-guide.md` (logo use, colour roles and pairings, typography, imagery direction, Danish voice, licence table); verify every spec requirement maps to a section and no licence is marked unknown
- [ ] 5.3 Create `.claude/skills/florist-brand/SKILL.md` from the guide; verify it appears in the session's skill list
- [ ] 5.4 Remove `.claude/skills/brand-guidelines/`, update CLAUDE.md override 5 and `PROVENANCE.md`, and point leftover `establish-brand-identity` mentions at this change; verify a search for the old name returns nothing outside archived notes

## 6. Sign-off and merge

- [ ] 6.1 Add a "Brand decisions" section to `ref/Design-Rationale.md`, each decision citing P1–P12 or marked *opinion*; verify the links resolve
- [ ] 6.2 Owner reviews the brand board; verify the approval, date and requested changes are in the process note
- [ ] 6.3 Run `openspec validate brand-identity`, finish the process note, and merge `feature/brand-identity` into `DevEnv`; verify `DevEnv` is pushed and the feature branch is deleted
