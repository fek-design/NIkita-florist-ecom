# Skill curation, design phase (2026-11-10)

OpenSpec change: [prepare-design-workflow](../../openspec/changes/prepare-design-workflow/)

Status: started. Research, trials and decisions are added as the change's tasks are done.

## Goal

Set a skill policy for the project, and run the first checkup for the design phase: list the gaps, find candidates, check them, trial them, and adopt or reject each with a reason. Time-boxed to one working day.

## Inputs

- Existing skills in `.claude/skills/` and their provenance: [PROVENANCE.md](../../.claude/skills/PROVENANCE.md)
- The four gates in [CLAUDE.md, Skill policy](../../CLAUDE.md)
- First signals from the web, 10 Nov 2026, to be verified in this pass: Anthropic's `frontend-design` skill; an r/ClaudeAI thread on a `logo-design` skill (kaankiziltug); `neonwatty/logo-designer-skill` (MIT)
- Felix's rule: don't build blind when a proven skill would make the result stronger, but don't use skills by reflex or keep weak ones either. Reddit is his main source for what works.

## Gap table

| Gap | Covered today by | Candidates to check |
|---|---|---|
| Vector asset drawing: the ginkgo leaf and lockups now, icons later (the AI draws, Felix sets type) | nothing | kaankiziltug logo-design, neonwatty logo-designer, SVG/icon skills from Reddit. Highest-value gap: trial on the real task, a ginkgo leaf that reads at 16 px |
| SVG cleanup, export, test renders | nothing | likely no skill: svgo + a render script |
| Brand system structure | `brand-identity` | re-audit only |
| Typography pairing | `brand-identity` (light) | Reddit search; may stay a CLAUDE.md rule |
| UI design quality | `design-taste-frontend` | Anthropic `frontend-design`, to be compared head-to-head |
| Accessibility checks | `design:accessibility-review` (plugin) | re-audit only |

## Research log (task 3)

### Reddit searches: blocked

Five web searches with `allowed_domains: reddit.com` (standard mode), one per gap group: logo/SVG skill, frontend-design vs taste skill, typography, SVG cleanup/export, accessibility. All five failed with the same error: the search tool cannot reach reddit.com ("not accessible to our user agent"). No thread was read, so **no Reddit evidence is logged yet**. Per [design.md](../../openspec/changes/prepare-design-workflow/design.md), threads that cannot be loaded are recorded as unread and are not summarised from snippets. Felix is asked to paste the threads he rates (see open questions). Task 3.1 stays open.

### Repo checks (task 3.2, partial)

Checked via the GitHub API on 2026-11-10 (licence and last push come from the API; file lists from the contents API):

| Candidate | Gap | Last push | Open issues | Licence | Notes |
|---|---|---|---|---|---|
| `neonwatty/logo-designer-skill` | Vector asset drawing | 2026-10-19 | 1 | MIT | Active. Repo has `skills/`, `scripts/`, `tests/`, `.claude-plugin/`. Last two commits are landing-page work. Security review not done yet |
| `anthropics/skills` → `skills/frontend-design` | UI design quality | 2026-11-06 (repo) | 1513 (repo-wide) | Repo shows none; the skill folder has `LICENSE.txt` (Apache-2.0 per PROVENANCE convention; to confirm) | Folder holds `SKILL.md` (9 KB) and `LICENSE.txt`, no scripts. High issue count is repo-wide, not per skill |
| `Leonxlnx/taste-skill` | UI design quality (already adopted as `design-taste-frontend`) | 2026-11-08 | 3 | MIT | Re-audit only. Repo is 104 MB, per the earlier provenance note |
| `kaankiziltug/logo-design-skill` | Vector asset drawing | 2026-11-06 | 6 | MIT | Felix supplied the URL. 6,463 stars, created 2026-09-26, active commits up to 6 Nov. Skill folder `skills/logo-design/`; tools `tools/package_skill.py` and `tools/smoke_test.py`; `.claude-plugin/` manifests; README 33 KB. Stars and activity are not usage reports, so the evidence gate still needs Reddit or Felix's judgement. Security review done, round 2 (see below) |

Open in this table: the security review of each candidate (task 4.1) and the shortlist decision (at most 2 per gap). Nothing is adopted or rejected yet.

### Security review: `neonwatty/logo-designer-skill` (task 4.1)

Cloned to scratch at commit `0feb0538b7520935c92e49d466e99cb75bfaad76` (last push 2026-10-19). Read: `skills/logo-designer/SKILL.md`, `skills/logo-designer/scripts/export.sh`, `skills/logo-designer/scripts/lineage-handoff.mjs`, `.claude-plugin/plugin.json`. No hooks in the repo.

- **SKILL.md** (instructions only). Concern: it dispatches parallel subagents with `mode: "bypassPermissions"`. Nothing enforces that they write only to `logos/`; that is an instruction. Phase 5 (clone a repo, open a PR) is out of scope for us and is not to be used.
- **`scripts/export.sh`**. If no local converter is found, it runs `npx --yes @aspect-build/resvg`, which downloads and runs an unpinned npm package at run time. This is a supply-chain risk, not a malicious finding.
- **`scripts/lineage-handoff.mjs`**. Reads stdin, writes only under `logos/iterations/`, makes no network calls. Checks for symlinks and escapes. It runs only when the user explicitly opts into Lineage, which this project will not do.
- **Not reviewed:** `scripts/ci/`, `tests/`, `examples/`, `site/`. They are not needed for the skill's job.

**Verdict: clean, with three conditions.**
1. Install a pinned resvg (or Inkscape or librsvg) locally before any export, so the `npx --yes` path never runs.
2. Do not use the Lineage section (Phase 3) or `lineage-handoff.mjs`.
3. Run subagents only for SVG output inside `logos/`, and review the files after each batch.

`kaankiziltug/logo-design-skill` has not been security-reviewed. Task 4.1 stays open until Felix decides whether it stays on the shortlist.

## Trial criteria (task 4.2, written before any run)

**Gap: vector asset drawing.** Task: "draw a ginkgo leaf mark that reads at 16 px", as an icon-only 512×512 SVG. Each run is done once with the skill and once without, then compared blind by Felix.

Pass criteria, all written before the run:
1. The mark is recognisable as a ginkgo leaf at 16 px and at 32 px in the favicon size check (no detail is lost).
2. Valid, self-contained SVG: `viewBox="0 0 512 512"`, no fixed `width`/`height`, no external references.
3. Flat solid fills, no gradients unless asked for, a named group `id="icon"`.
4. Felix picks the better output blind and gives a reason. A tie counts as "no better", so the skill is rejected.

**Gap: UI design quality.** Task: one product card, as in task 4.4. Criteria: it follows the design system from the brand work, has a clear hierarchy, passes the accessibility check (contrast, keyboard focus), and Felix picks the better output blind. Frontend-design vs design-taste-frontend is the head-to-head in task 4.4.

### Trial run, vector gap (task 4.3, in progress)

Two ginkgo marks were drawn: A with the skill's SVG conventions, B as a plain baseline. Both are in `C:\Users\fkoes\AppData\Local\Temp\claude\39f166ecfa24aa75\45974d43-1208-423a-b2a4-3efb624e4a48\scratchpad\trial-ginkgo\` and are shown on `preview.html` in that folder. The key is in a separate folder, `...\scratchpad\trial-key\key.txt`, and is not opened until Felix has picked.

Limit: the "with" run applies the skill's SVG conventions only. It does not run the skill's subagent workflow or its export script. It is a partial test of the skill. Felix's pick and reason are recorded here when given.

### Security review: `kaankiziltug/logo-design-skill` (task 4.1, round 2)

Felix chose this skill over neonwatty. The neonwatty review above stands but is not used. Cloned to scratch at commit `bbf31e521d765eb6d53242549bbe7c2e5bbd6bc` (last push 2026-11-06). MIT licence. Read: `skills/logo-design/SKILL.md`, the scripts (grep-audited, `render_png.py` and `presentation_board.py` read in full where they start processes or delete files), and `references/svg-construction.md`. No hooks in the repo.

- **SKILL.md** is instructions only. It has no network instructions. Its scope is wider than the gap: identity systems, typography, guidelines, mockups and web icons overlap with `brand-identity` and would collide with it. Only the vector drawing and render parts match the gap.
- **Scripts** are Python 3 with no third-party dependencies. The grep found no network calls, no `eval` or `exec`, and no `pip install` at run time. The only subprocess calls run local renderers (`rsvg-convert`, `inkscape`) or headless Chrome for screenshots. `taskkill` runs on the process the script itself started. `shutil.rmtree` runs on a temp directory the script created. Write targets come from the arguments the user passes, plus the maintainer-only `build_catalog.py`, which rewrites the library catalog.
- **`assets/library/`** holds 1,432 real logo SVGs (14 MB). The licence covers the repo code. It does not cover the third-party logos, which are trademarks. The skill's own rule says "study only, never trace".
- **Not installed** (maintainer tooling): `tools/` (including `tools/traffic/`, GitHub traffic collection), `tests/`, `evals/`, `.github/`, `docs/images/`.

**Verdict: clean, with four conditions.**
1. Install only what the vector gap needs: `SKILL.md`, `references/`, and the scripts that draw, audit and render (`svg_audit.py`, `render_png.py`, `preview_sheet.py`, `concept_sheet.py`, `svglib.py`). Do not run `build_catalog.py`.
2. Do not use the identity-system, typography or mockup parts of the skill. Those belong to `brand-identity` or to the later brand work.
3. Run Python with a local `python` on Windows, not the `python3` Store stub, as the skill itself says.
4. Whether to install the 14 MB `assets/library/` is a decision for Felix (see open questions). If it stays out, `search_library.py` and the peer test cannot run.

## Trial, round 2 (task 4.3, replaces round 1)

Felix asked to switch to kaankiziltug and redo the trial. The criteria from task 4.2 still apply unchanged. Its viewBox criterion is met by this skill's convention too (512 × 512 is allowed).

- **A2** was drawn with this skill's conventions: `<title>`, `viewBox="0 0 512 512"`, group `id="icon"`, flat solid fill, no `width`/`height`.
- **B** is the same baseline as round 1, so the comparison stays fair.
- Files: `...\scratchpad\trial-ginkgo\A2.svg` and `preview2.html`. The key is in `...\scratchpad\trial-key\key.txt`, not opened until Felix has picked.
- Round 1 (neonwatty, `A.svg`) is superseded. Its output is not counted.

Limit, as before: the "with" run applies only the skill's SVG conventions. It does not use the skill's subagent workflow, its render scripts or its library.

### Trial result, vector gap (2026-11-11)

Felix looked at both rounds and liked neither outcome. He did not pick A2 or B. Under criterion 4, a result that is not clearly better counts as "no better", so **no logo skill is adopted**. Felix decided to skip the logo overhaul for now, so the vector-drawing gap is **deferred**, not closed. It reopens as a checkup trigger ("a new kind of task appears") when the logo work comes back.

- `kaankiziltug/logo-design-skill`: reviewed clean with conditions, not adopted (trial not passed, gap deferred).
- `neonwatty/logo-designer-skill`: reviewed clean with conditions, not adopted (replaced by Felix's switch before its trial was judged).
- The library question (install `assets/library/` or not) is moot until the gap reopens.

## Options considered

- **Vector asset drawing:** `neonwatty/logo-designer-skill` (MIT, active) is the only candidate with a verifiable repo. `kaankiziltug` cannot be located yet. Option: draw with plain SVG and no skill, which is the baseline the trial in task 4.3 would compare against.
- **UI design quality:** `frontend-design` (Apache-2.0, small, no scripts) against the already imported `design-taste-frontend`. Two skills for one job collide, so task 4.4 is the head-to-head.
- **Typography, SVG cleanup, accessibility:** no candidate yet. Typography and cleanup may stay CLAUDE.md rules or a plain script (design.md, table row 2 and 4).

## Decisions

Each decision cites a principle in [Ref/Design-Rationale.md](../../Ref/Design-Rationale.md) or is labelled *opinion*.

### Decision table (task 5.3, 2026-11-11)

| Skill | Gap | Verdict | Reason |
|---|---|---|---|
| `kaankiziltug/logo-design-skill` | Vector asset drawing | Not adopted | Security clean with conditions; trial outcome disliked by Felix; logo overhaul skipped for now. *Opinion* (Felix's call) |
| `neonwatty/logo-designer-skill` | Vector asset drawing | Not adopted | Security clean with conditions; replaced by Felix's switch before its trial was judged. *Opinion* |
| Anthropic `frontend-design` | UI design quality | Not adopted | Felix kept `design-taste-frontend` without running the head-to-head (task 4.4). Two skills for one job would collide (design.md, decision 5). *Opinion* (Felix's call), recorded as an untested choice |
| `design-taste-frontend` | UI design quality | Kept | Felix's call; its overrides already live in CLAUDE.md. Retire-by condition in PROVENANCE.md |
| `brand-identity` | Brand system structure | Kept (re-audit only) | Still has a job in `establish-brand-identity` (P11) |
| `brand-guidelines` | Format reference | Kept until `florist-brand` exists | Unchanged from the import |
| Mobbin (`best-practices`, `search`, `redesign-screen`, `plain-writing`) + MCP | Screen references | Retired, removed 2026-11-11 | No paid Mobbin plan. *Opinion* (Felix's call) |
| `design:accessibility-review` (plugin) | Accessibility checks | Kept (re-audit only) | Plugin, not in `.claude/skills/`; no new candidate |
| Typography pairing, SVG cleanup | — | No skill | No candidate found; Reddit unreachable. Stays a CLAUDE.md rule / plain svgo script if needed |

## Dead ends and changes of mind

- **Reddit via the search tool does not work.** The first plan (design.md, decision 6) put Reddit first. This pass cannot reach it, so evidence rests on repo checks plus whatever Felix pastes. This weakens the evidence gate for every candidate and is recorded as a limit, not a pass.
- **`kaankiziltug` logo-design** was named in the first web signals but could not be found by repo name. It is not counted as a candidate until its source is known.
- **Switched logo candidate mid-trial.** Felix moved from neonwatty to kaankiziltug after round 1 was drawn but before it was judged. Round 1 was discarded.
- **Logo overhaul skipped (2026-11-11).** Felix disliked both trial outcomes and put the logo work on hold. No skill was adopted for the vector gap. *Opinion* (Felix's call).

## How the result was checked

Pending. Each task in the change carries its own verification step in [tasks.md](../../openspec/changes/prepare-design-workflow/tasks.md).

## Open questions

- The head-to-head `frontend-design` vs `design-taste-frontend` was not run. If `design-taste-frontend` hits its retire-by condition, run it then.

- Felix to confirm the GitHub settings for `main` protection and default branch (task 1.3).
- Felix to paste any Reddit threads he rates, since automated fetching of Reddit may fail (design.md, risks).
- When the logo work comes back, rerun the vector-gap checkup. Both reviews above can be reused if the pinned commits are unchanged.
- Felix to confirm the `main` branch protection rule (task 1.3). A public API check on 2026-11-10 showed `main` as not protected, so the rule's branch pattern needs checking.
