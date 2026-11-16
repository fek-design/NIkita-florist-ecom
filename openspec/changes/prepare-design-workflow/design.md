# Design

## Context

- Git today: one branch, `main`, with one commit (`40f5e4f Initial pre-setup`), tracked on `origin` (GitHub, fek-design/NIkita-florist-ecom). The `gh` CLI is not installed, so branch protection cannot be scripted from here.
- Imported so far (change `import-design-skills`):
  - `brand-identity`;
  - `brand-guidelines`, used as a format reference only;
  - `design-taste-frontend`, 39 MB with a Stop hook;
  - four Mobbin skills, which need a paid plan Felix may not have.
- Adoption so far was list-driven. The policy below makes it need-driven.
- Process note for this pass: [docs/process/2026-11-10-skill-curation.md](../../../docs/process/2026-11-10-skill-curation.md)
- First signals from the web (10 Nov 2026), to be verified in the pass:
  - Anthropic's own `frontend-design` skill is the most consistently recommended design skill;
  - an r/ClaudeAI thread discusses a `logo-design` skill (kaankiziltug) built to "get less AI slop";
  - `neonwatty/logo-designer-skill` offers a structured SVG logo workflow (MIT).

## Goals / Non-Goals

**Goals:**
- Every skill in `.claude/skills/` has a named job in the next phase, a provenance record, and a passed trial
- Felix can see why each skill was adopted or rejected

**Non-Goals:**
- Curating skills for later phases (payment, SEO, security). Those get their own pass when their week starts
- Writing custom skills. The florist brand skill comes from `establish-brand-identity`

## Decisions

**1. The branch model is `dev` for work and `main` for releases only.**
`dev` is branched from `main@40f5e4f` and pushed. All work commits to `dev`, optionally through short feature branches. A release is a merge from `dev` into `main`, tagged (`v0.1`, …). Without `gh`, Felix sets branch protection on `main` in the GitHub UI, and the task lists the exact setting.
*Rejected:* full git-flow with release and hotfix branches. That is overhead for one developer over six weeks.

**2. The skill policy is a standing rule with periodic checkups.**
It is respected at all times: no skill is added outside it, and adopted skills are used only for their named job. The full gate process, however, runs only at a **checkup**:
- at a phase boundary: design (now), build (roadmap week 2), checkout and payment (week 3), hardening (week 5);
- when a new kind of task appears that no adopted skill or rule covers;
- when a skill keeps producing weak output (its retire-by condition triggers).

Between checkups, nobody searches for skills before each task.
*Rejected:* running the gates before every task. That is the "skill blindness" Felix wants to avoid, turned inside out: process for its own sake.

At a checkup, every candidate passes four gates:

```
  gap named? --no--> stop (no skill needed)
     | yes
  evidence: Reddit usage reports + maintained repo + licence --weak--> reject
     | ok
  security review: read SKILL.md + scripts + hooks --risk--> reject
     | clean
  trial: same small task, with vs without the skill --no better--> reject
     | better
  adopt: pin commit, provenance row, named job, retire-by condition
```

- **No skill blindness:** a gap that a short CLAUDE.md rule or an existing skill already covers is not filled with a new skill.
- **No forced use:** an adopted skill is invoked only when its job comes up.

**3. The trial is a blind side-by-side comparison on a task taken from the next phase.**
Example for a logo skill: "draw a ginkgo leaf mark that reads at 16 px". Run the task once with the skill and once without. Felix compares the two outputs without knowing which is which. "Better" is judged against criteria written down before the run. The trial costs at most 30 minutes per candidate.
*Rejected:* adopting on reputation alone. Reddit popularity shows that a skill is used, not that it fits this project.

**4. The gaps for the design phase (the search list):**

| Gap | Covered today by | Candidates to check |
|---|---|---|
| Vector asset drawing: the ginkgo leaf and lockups now, icons later (the AI draws, Felix sets type) | nothing | kaankiziltug logo-design, neonwatty logo-designer, SVG/icon skills from Reddit. This is the highest-value gap, so trial it on the real task: a ginkgo leaf that reads at 16 px |
| SVG cleanup, export, test renders | nothing | likely no skill: svgo + a render script |
| Brand system structure | `brand-identity` | re-audit only |
| Typography pairing | `brand-identity` (light) | Reddit search, may stay a CLAUDE.md rule |
| UI design quality | `design-taste-frontend` | Anthropic `frontend-design`, to be compared head-to-head |
| Accessibility checks | `design:accessibility-review` (plugin) | re-audit only |

**5. The re-audit can remove skills.**
- *Mobbin:* retire it if Felix has no plan.
- *design-taste-frontend:* keep it only if it beats `frontend-design` in its trial. Both cover the same job, and two skills for one job collide.
- *brand-guidelines:* keep it until the florist brand skill exists, then remove it.

**6. Research sources in priority order:**
1. r/ClaudeAI and r/ClaudeCode threads, plus design subreddits for skill mentions;
2. the GitHub repo itself: commit recency, issues, licence;
3. skill registries, used only to discover candidates, never as evidence.

Threads that fail to load are noted as unread, not summarised from snippets.

## Risks / Trade-offs

- [Reddit threads may be inaccessible to automated fetching] → use search snippets for discovery only, base evidence on the repo, and ask Felix to paste threads he rates.
- [A trial on one task can mislead] → choose the task that matters most in the next two weeks, and re-check at the end of the brand work (retire-by condition).
- [Curation delays the brand work] → time-box it to one working day.
