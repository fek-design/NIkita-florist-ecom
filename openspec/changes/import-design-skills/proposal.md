# Proposal

## Why

Weeks 1–2 of the roadmap ([Ref/Roadmap.md](../../../Ref/Roadmap.md)) cover brand, wireframes and the design system. The build is AI-driven, so the AI sessions need the same design instructions every time. Without them, each session falls back on generic defaults, and that is the "slop" the roadmap rules out. Four public skill sets cover brand identity, brand guidelines, anti-generic frontend work and reference-based redesign. Importing them now, pinned and reviewed, gives every later session the same toolkit.

## What Changes

- Vendor four third-party skill sources into `.claude/skills/`, each pinned to a commit and recorded in a provenance file:
  - `brand-identity` (rampstackco/claude-skills, MIT): framework for logo, colour, type, imagery, icons and motion
  - `brand-guidelines` (anthropics/skills, Apache-2.0): a format reference only. Its content is Anthropic's own brand
  - `design-taste-frontend` (Leonxlnx/taste-skill, MIT): anti-generic frontend rules plus a browser-based checker and finish gate
  - `best-practices`, `search`, `redesign-screen`, `plain-writing` (mobbin/skills, MIT): reference-based redesign through the Mobbin MCP
- Register the Mobbin MCP server in a project `.mcp.json`
- Turn off auto-invocation of `brand-guidelines` so Anthropic's colours and fonts are never applied to the florist's site
- Add a project `CLAUDE.md` that records where this project overrides the imported skills (legal contact details, dynamic rendering, rationale-based visual choices)
- No application code changes

## Capabilities

### New Capabilities

None. This change adds development tooling only. It changes no behaviour of the webshop, so `.openspec.yaml` sets `skip_specs: true`.

### Modified Capabilities

None.

## Impact

- New files under `.claude/skills/` (about 39 MB, mostly taste-skill image and asset files), `.mcp.json`, `CLAUDE.md`, `.claude/skills/PROVENANCE.md`
- taste-skill registers a `Stop` hook while it is active. The hook runs its finish gate (`node scripts/gate.mjs`) and needs Node 22+ and a local Chrome or Edge
- The Mobbin skills only work with a Mobbin Pro, Team or Enterprise plan and a browser sign-in. Without these they report "not connected" and stop
- Third-party code now lives in the repo. Licences are kept next to each skill
