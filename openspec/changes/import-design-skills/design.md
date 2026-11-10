# Design

## Context

The repo has no application code yet. OpenSpec has just been set up and created `.claude/skills/openspec-*`. All four sources were cloned and reviewed on 2026-11-10 before import:

| Source | Commit | Licence | Contents |
|---|---|---|---|
| rampstackco/claude-skills `skills/brand-identity` | `0590510` (2026-11-08) | MIT | SKILL.md + 2 reference files |
| anthropics/skills `skills/brand-guidelines` | `2c5958e` (2026-11-06) | Apache-2.0 | SKILL.md + LICENSE |
| Leonxlnx/taste-skill `skills/taste-skill` | `f6b7657` (2026-11-07) | MIT | 1,631 files, 39 MB: references, Node check scripts, CSS/JS kit, photo library |
| mobbin/skills `skills/*` | `79124d9` (2026-11-03) | MIT | 4 skills, needs Mobbin MCP |

Security review findings:
- **taste-skill scripts:** they start a server on 127.0.0.1, drive headless Chrome over the DevTools protocol, and fetch icons from cdn.jsdelivr.net. They contain no credential access and send no data out.
- **taste-skill hook:** a `Stop` hook in its frontmatter runs `gate.mjs`. If the gate is not found, the hook exits 0, so it never blocks a session.
- **Instruction content:** none of the skills contains instructions that try to override the user or exfiltrate data.

## Goals / Non-Goals

**Goals:**
- Every AI session in this repo loads the same, reviewed, pinned design skills
- Each conflict between a skill and this project's requirements is resolved explicitly, in one place
- Any import can be removed or updated without side effects

**Non-Goals:**
- Writing the florist's own brand (that happens in weeks 1–2 with the owner)
- Changing third-party skill content beyond turning off one auto-trigger
- Committing to Mobbin as a paid dependency

## Decisions

**1. Vendor into the project's `.claude/skills/`, not a user-level plugin install.**
Project skills are versioned with the code. Anyone who clones the repo gets the same toolkit, and the exam can trace which instructions shaped the work.
*Rejected:* `claude plugin install` (taste-skill and Mobbin both offer one). It installs per user and per machine, so the setup is not reproducible from the repo.

**2. Pin by commit SHA and record it in `.claude/skills/PROVENANCE.md`.**
Updating a skill then becomes a deliberate change, made through a new OpenSpec change.
*Rejected:* tracking `main`. Skill text changes often (taste-skill is at 2.5.1), and silent changes would make AI output drift between weeks.

**3. Install taste-skill under the folder name `design-taste-frontend`.**
That folder name matches its frontmatter `name`. Its Stop hook looks for `$CLAUDE_PROJECT_DIR/.claude/skills/design-taste-frontend/scripts/gate.mjs`, so another name would disable the gate.

**4. Keep `brand-guidelines` with `disable-model-invocation: true`.**
Its description triggers on any "brand colors or style guidelines" request, and it applies Anthropic's colours and Poppins/Lora fonts. On this project that would be wrong. With auto-invocation off, the skill stays available as a format reference via `/brand-guidelines`. Once the owner approves the brand, a florist-specific brand-guidelines skill in the same format replaces it.
*Rejected:* not importing it. The user asked for it, and its short, rule-based format is a good model for our own brand skill.

**5. Record overrides in a project `CLAUDE.md`, not by editing skill files.**
taste-skill says never to edit its kit files, and edits would be lost on the next update. `CLAUDE.md` is loaded in every session, so it takes precedence in practice:
- *taste-skill rule 9* bans register/VAT numbers, real phone formats and full addresses. A Danish webshop must show its CVR number and contact details, and local SEO needs a consistent name, address and phone number. **Override:** use real, owner-approved business details.
- *taste-skill static export* builds Next.js briefs with `output: 'export'`. Our solution needs server routes for checkout, webhooks and admin. **Override:** keep dynamic rendering, and run the gate against the dev server URL.
- *taste-skill random "deal"* picks palette and type pairing by random draw. Our design choices must have a stated reason (see `Ref/Design-Rationale.md`). **Override:** dealt output can serve as a starting option, but the chosen palette and type come from the brand work and are recorded with a reason.
- *taste-skill stand-in photographs* are allowed when the client has none. The roadmap rule is real content only. **Override:** stand-ins appear only on preview builds, and every one is replaced by the owner's photos before launch.

**6. Register Mobbin in a project `.mcp.json` and treat it as optional.**
Mobbin requires a paid plan. The skills fail cleanly without it, so importing them costs nothing if the plan is never bought.

## Risks / Trade-offs

- [39 MB of vendored files bloat the git history] → Accepted for a 6-week project. If it becomes a problem, replace the folder with a pinned fetch script in a later change.
- [taste-skill's Stop hook runs a headless browser for up to 10 minutes when the skill is active] → It runs only after the skill has been invoked. Its runs and waivers are logged in `.taste-skill/`, which is git-ignored.
- [Skill name collision: Mobbin's `search` and `best-practices` are generic names] → No other skill uses them today. Revisit if a collision appears.
- [Skills give style rules, and an AI can apply them confidently but wrongly] → The roadmap's working rules still apply. Every diff is read, and every visual decision is checked against the design rationale.

## Open Questions

- Does Felix have, or want, a Mobbin Pro plan? This affects only whether `redesign-screen` can be used. Nothing else in this change depends on it.
