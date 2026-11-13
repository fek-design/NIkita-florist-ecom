# Proposal

## Why

The florist, Nikita Nielsen, Blomsterdekoratør in Holbæk, has only a DIY logo. It exists as a PNG/JPG and an Illustrator PDF, with:
- a ginkgo leaf that reads as an AI-generated raster and becomes a squiggly mess below about 48 px;
- a non-commercial subtitle font;
- a phone number inside the lockup.

There is no defined palette, typography or usage rules. Weeks 1–2 of the roadmap need a brand system before wireframes and UI can start, and every later design decision must cite it (Design Rationale P11).

The logo gets a **complete overhaul that keeps its feel**. It stays Scandinavian, earthy, calm, with the circle, the ginkgo, the classic serif name and the brown, but it becomes a better version of itself: original artwork, commercially licensed fonts, and legible from favicon to sign.

## What Changes

- **The AI designs the assets, and Felix does the typography and decides:**
  - the AI writes the brief (Felix approves), draws the new ginkgo leaf as original vector paths (2-3 drafts), composes the lockups, tests every draft and produces the files;
  - Felix chooses and sets the typefaces under his commercial licence, delivers the type as outlined SVG, and approves each round with the owner;
  - no tracing of the old leaf and no image-model generation.
- Remove the phone number and all contact details from every logo version (confirmed)
- Produce a logo system from the approved artwork:
  - four lockups (primary, horizontal, wordmark, leaf mark), each in full colour, ink and white with a transparent background;
  - a small-size leaf for the favicon and avatar;
  - PNG exports and a favicon set.
- Define the colour system from the 60/30/10 starting point (sand #DCD4D1, brown #7A644F, ink #2D2A26). Add a page ground and functional colours, set the roles, and record every allowed pairing with its measured contrast
- Choose the web typography: at most two families, licensed for commercial web use and, ideally, matching the logo's typefaces
- Write the imagery direction (owner's photos only, flowers carry the colour), the voice (Danish, plain) and clear-space/minimum-size rules
- Deliver a brand guide (markdown), a brand board (an HTML page built from the real tokens), design tokens (CSS) and a florist brand skill. The skill replaces Anthropic's `brand-guidelines` as the brand the AI applies
- Record the licence and the licence holder for every typeface and for the artwork
- Record the process in `docs/process/` (project rule)

## Capabilities

### New Capabilities

- `brand-identity`: the florist's visual identity as delivered assets and rules. Covers the logo variants and their legibility, the colour tokens and contrast guarantees, the typography tokens, and the licence status of every brand element

### Modified Capabilities

None. No specs exist yet.

## Impact

- New:
  - `Ref/brand/`: the old source kept untouched, plus `new/` for drafts and Felix's outlined type, `logo/`, `brand-brief.md`, `brand-guide.md`, `brand-board.html` and `tokens.css`;
  - `.claude/skills/florist-brand/`;
  - `docs/process/2026-11-10-brand-identity.md`.
- `Ref/Design-Rationale.md` gains a section with the brand decisions, and CLAUDE.md points AI sessions at the new brand skill
- Licences: the typefaces are licensed by Felix. Logo outlines can be used freely by the shop. Using the same faces as web fonts needs a licence that covers web embedding without tying the live site to Felix's personal subscription (design decision 6)
- **Depends on `prepare-design-workflow`:** the work starts after its skill checkup, and uses any skills it adopts for SVG handling and UI
- Tools: poppler (installed) and svgo, both dev-only
