# Playbook: a design-led build with Claude

How the florist webshop was made, condensed so the next project can start from it. Written from what worked and what went wrong between 10 and 23 Nov 2026.

---

## 0. The ground rules (put these in CLAUDE.md on day 1)

1. **Design decisions are mine.** Claude proposes, with evidence; I choose and say why. Claude never settles a key choice alone.
2. **Everything is written down as it happens:** a process note per piece of work, a decision log, a changelog per design version. Dead ends stay in; nothing is rewritten to look planned.
3. **Nothing is deleted.** A new version is added beside the old one.
4. **Claude commits; I push and merge.** One branch per piece of work. Merge only when tests pass and it works in the running app.
5. **Secrets never go in the chat.** I type keys into the hosting dashboard or a hidden terminal prompt myself.
6. **Every account, key or personal detail added** gets a row in a hand-over sheet in the same commit.
7. **The client's language for the product, English for code and docs.**

---

## 1. Repository and workflow

| Thing | How |
|---|---|
| Branches | `DevEnv` (integration, protected) · `feature/<slug>`, `fix/<slug>`, `docs/<slug>` off the latest DevEnv · `main` for tagged releases only |
| Commits | Claude commits locally after every finished task and tells me what is waiting to push |
| Merge | Pull request into DevEnv, CI green ("lint, types, tests, build"), then delete the branch |
| Session start | `git status`, `git fetch`; say what is uncommitted, unpushed or behind |
| Never without my go-ahead | `git reset --hard`, force-push, deleting an unmerged branch |
| Planning | OpenSpec: `/opsx:propose` → proposal, design, spec deltas, tasks → `openspec validate --strict` → build → archive |
| CI | Dependency audit, lint, format check, typecheck, unit and integration tests, build, on every push and PR |

**Lessons:** stage files by name (not `git add -A`); run checks with `set -o pipefail` so a piped failure is not hidden; check the last commit's author before committing if more than one session works in the repo.

---

## 2. Phases

### 2.1 Discovery

- **Interview the client** about how they work *today*, not only what they want: where orders arrive, how they keep track, how much time they will spend on a screen, what they like (paper? phone?).
  - *Lesson:* on this project the owner's "I work on paper and a pinboard" came in week 3 and reshaped the whole back office. Ask it in week 1.
- **Competitor boards:** screenshots of 3 competitors' full flows, annotated by me (what to take, what to avoid). These became citable sources later.
- **Owner questions list:** one numbered list in the interview note; add to it whenever a decision depends on the client. Placeholders in the build are marked until answered.

### 2.2 Design rationale (before any screen)

A short document with numbered principles (P1, P2 …), each with:
- the evidence and its grade: **A** primary source, **B** reputable secondary, **C** practice or inference (a hypothesis to test);
- "So we:" — what it means for the design;
- "Verify:" — how it will be tested.

Every later decision cites a principle, a law, a test result, or is labelled *opinion*.

### 2.3 Brand

- Tokens file as the single source (palette, role tokens, type scale, focus ring). Components use role tokens, not palette names.
- Contrast table generated from the tokens; pairings that fail are written down as "don't".
- Fonts self-hosted and subset (speed, GDPR). Check the subset contains every glyph the design uses (✓, ‹, •, æøå).
- Logo: AI only crops and recolours; it never draws.

### 2.4 Lo-fi wireframes

2–3 concepts, the client picks one. Keep them; they are the base for the hi-fi screen list.

### 2.5 Hi-fi

Two modes, both used here:

**A. I design a screen myself (Figma).** Claude builds it exactly. Only font sizes and spacing may change, plus what I explicitly hand over; anything else that looks off is raised, not changed.

**B. One hi-fi set from proven patterns.** For the screens I don't draw:
1. Claude analyses my existing screens against proven patterns and competitors (table: element · what it follows · keep / gap).
2. Sources, each with a key: Baymard (e-commerce), Nielsen Norman Group, Shopify Polaris (admin lists and details), Apple HIG / Material (navigation), NIST SP 800-63B (sign-in), my competitor boards.
3. Every element on every screen cites a source key, a logged decision or the brand guide.
4. Anything without a source is a **yellow "Forslag" tag** on the screen. I say yes or no to each; then the tag goes.
5. No new patterns. Variants only when I ask, or when a test leaves two answers.

**Versions:** before each change round, freeze the set: a Figma page `vN · date (cause)`, PNG exports in `docs/design/versions/vN/`, and a changelog table (where · before · after · caused by). The working page is renamed "→ vN+1".

### 2.6 Build

Per screen:
1. Spec first (OpenSpec delta if behaviour changed in the design).
2. Build from the Figma values, not from screenshots.
3. Check in the running app at 390 px (phone), with real data or marked placeholders.
4. Lint, format, typecheck, tests, build all green; commit; tick the task with a one-line note of how it was verified.

Copied assets (tokens, fonts) get a drift test against their source.

### 2.7 Test and iterate

Usability tests on the live preview, the client's own first test included. Findings go into the next design version's changelog, then into the code.

---

## 3. Documents and templates

**Decision log entry (`docs/design-decisions.md`)**
```
### DD-NN Title saying what was decided
Date · Principles: Pn · Evidence grade: A/B/C
Decision: what, and whose call it was. Why, in their words.
Rejected: the alternatives, each with the reason.
Test: how we will know it was right.
```

**Process note (`docs/process/YYYY-MM-DD-slug.md`)**: goal · inputs · options considered (including rejected) · work log with dates, slips and corrections · how it was checked · open questions. Link it from the OpenSpec design.md.

**Version changelog (`docs/design/versions/vN/CHANGELOG.md`)**: what caused the version · table of changes from the previous one · decisions made during it · what is carried into the next.

**Hand-over sheet (`docs/handover.md`)**: every account, key, domain and personal detail, who owns it, and how to transfer it.

---

## 4. Tools

| Tool | Used for | Notes |
|---|---|---|
| Figma + Figwright MCP (pinned version) | Reading exact values from my frames; building the hi-fi set | Read values with the design-context call, never from a screenshot. Keep write batches small (≈ 8 ops); if a batch times out, **check what landed before retrying**, it may still finish. Clone my frames instead of redrawing them |
| OpenSpec | Plans, specs, tasks | `--strict` validation; a MODIFIED requirement must keep every existing scenario |
| Playwright | Measuring boards, checking fonts and layout in a real browser | Use measured numbers in reasoning, never guessed ones |
| Hosting (Vercel + Neon here) | Preview per branch, staging from DevEnv | Migrations run at deploy; seed only on preview |

---

## 5. Pitfalls met on this project

- Lost work from not pushing often enough → push at the end of every task group.
- Asking the client how they work too late → ask in discovery (§2.1).
- Reading a design PDF for fonts and stroke widths → connect to the design tool instead.
- Guessed measurements in design reasoning → measure.
- Treating a need as the wrong kind of problem (a "payment" fix for what was a "tracking" problem) → restate the problem before proposing.
- Retrying a timed-out tool call blindly → duplicates.
- A font subset missing glyphs the design uses → check the glyph list against the design.

---

## 6. Checklists

**Session start:** git status and fetch · what is unpushed · which task is next · any client answers in.

**Before showing a design:** every element sourced or tagged "Forslag" · brand tokens only · contrast pairs checked · tap targets ≥ 44 px · text ≥ 16 px for anything acted on · placeholders marked.

**Before a version freeze:** all Forslag decided · decisions logged · changelog written · Figma page and PNGs saved · old version untouched.

**Before a merge:** tests, lint, format, typecheck, build green · checked in the running app · process note updated · tasks ticked with how they were verified · hand-over sheet updated if anything was added.
