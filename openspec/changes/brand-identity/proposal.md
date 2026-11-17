## Why

The storefront build starts in week 2 and needs one agreed look before any screen gets colour or type: the lo-fi wireframes are deliberately greyscale. Without a recorded brand system, each AI session would pick its own defaults, which the roadmap's "no slop" rule and Design-Rationale P11 rule out.

This replaces an earlier, larger brand plan that was dropped. The scope is smaller: Felix makes the logo himself, and AI draws no logo artwork.

## What Changes

- **Logo:** Felix supplies the finished logo files. The logo is set in Ancizar Serif and no longer carries the phone number. AI only checks, optimises and exports the files Felix delivers.
- **Typography:** Ancizar Serif for the logo and headings (Felix's choice). Ancizar Sans for body and interface text (recommended, confirmed by Felix on a specimen before it is locked). Both are self-hosted.
- **Colour:** a small palette supplied by Felix and the owner, written as tokens with named roles, and a table of allowed and forbidden pairings checked against WCAG 2.1 AA.
- **Tokens:** `ref/brand/tokens.css` as the single source for colour and type values, ready to move into the app when it is scaffolded.
- **Brand board:** one HTML page that renders the logo, palette, pairings and type specimen from the tokens, at 390 px and desktop width.
- **Brand guide:** `ref/brand/brand-guide.md` covering logo use, colour roles, typography, imagery direction, Danish voice and licences.
- **Project skill:** `.claude/skills/florist-brand/` so AI sessions apply the florist's brand. The Anthropic `brand-guidelines` skill is removed once it exists.
- **Records:** a process note in `docs/process/`, and a "Brand decisions" section in `ref/Design-Rationale.md`.

Out of scope: drawing or redrawing the logo, icon sets, motion design, photography, and applying the brand to app screens (that happens in the storefront change).

## Capabilities

### New Capabilities
- `brand-identity`: the florist's brand system: logo files, colour roles and pairings, typography, design tokens, the brand guide and the project brand skill.

### Modified Capabilities

None.

## Impact

- New files under `ref/brand/` (logo, fonts, tokens, board, guide) and `docs/process/`.
- New skill `.claude/skills/florist-brand/`; `.claude/skills/brand-guidelines/` removed; `.claude/skills/PROVENANCE.md` and CLAUDE.md override 5 updated.
- `ref/Design-Rationale.md` gains a "Brand decisions" section.
- Leftover mentions of the old change name `establish-brand-identity` in `PROVENANCE.md`, `ref/wireframes/lofi/index.html` and two process notes are pointed at this change.
- Two font families (Ancizar Serif, Ancizar Sans, SIL Open Font License) are added as assets. No runtime dependency is added.
- Work happens on branch `feature/brand-identity` and merges into `DevEnv` when the owner has signed off.
