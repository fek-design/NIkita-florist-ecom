# Florist e-commerce

API-driven full-stack webshop for a local Danish florist that today sells only through social media. 6-week project, 10 Nov – 20 Dec 2026.

- Case: [Ref/Case Synopsis - Felix.md](Ref/Case%20Synopsis%20-%20Felix.md)
- Plan and working rules: [Ref/Roadmap.md](Ref/Roadmap.md)
- Why we design the way we do: [Ref/Design-Rationale.md](Ref/Design-Rationale.md)
- Changes are planned in OpenSpec (`openspec/`). Use `/opsx:propose` before larger work.

## Branches

- Work on `dev`. Feature branches off `dev` are fine for short tasks.
- `main` receives release merges only, each from `dev` and tagged (`v0.1`, `v0.2`, …). Never commit to `main` directly.

## Process log (required)

Whenever something is designed or developed, at any stage from sketch to MVP, write a process note in `docs/process/` before the work counts as done. Felix wants to see how the work was thought through, not only the result.

- One file per piece of work: `docs/process/YYYY-MM-DD-<slug>.md`
- Contents: the goal; the inputs used; the options considered, including the ones rejected and why; the decisions, each citing a principle in `Ref/Design-Rationale.md` or labelled *opinion*; how the result was checked; open questions
- Link the related OpenSpec change, and link the note from the change's design.md
- Record dead ends and changes of mind honestly. Don't rewrite them afterwards to look planned

## Skill overrides

The design skills in `.claude/skills/` are third-party, so they are never edited (provenance: `.claude/skills/PROVENANCE.md`). Where a skill conflicts with this project, these rules win:

1. **Real business details** (overrides taste-skill house rule 9). Show the shop's real CVR number, full address, real phone number and email as approved by the owner. Danish e-commerce law requires them, and local SEO needs the same name, address and phone everywhere.
2. **Dynamic app, not static export** (overrides taste-skill step 0). Checkout, payment webhooks and admin need server routes. Run taste-skill's checks and gate against the dev server URL (`--start http://localhost:3000/`).
3. **Chosen, not dealt** (overrides taste-skill step 4). The random palette and type "deal" can produce options. The final palette, type and layout come from the brand work and are recorded with a reason in `Ref/Design-Rationale.md`.
4. **Owner's photos only at launch** (narrows taste-skill's stand-in photographs). Stand-ins may appear on preview builds. List each one, and replace every one with the owner's own photos before launch.
5. **Not Anthropic's brand.** `brand-guidelines` contains Anthropic's colours and fonts. Use it only as a format reference for writing the florist's own brand guidelines skill.
6. **Danish first.** Customer-facing copy is in Danish. Code, commits and internal docs are in English.

## Skill policy

Standing rule: no skill is added to `.claude/skills/` outside this policy, and an adopted skill is used only for its named job in `.claude/skills/PROVENANCE.md`. Nobody searches for skills before each task.

The four gates run only at a **checkup**, which happens:
- at a phase boundary: design (week 1), build (start of week 2), checkout and payment (start of week 3), hardening (start of week 5);
- when a new kind of task appears that no adopted skill or rule covers;
- when an adopted skill hits its retire-by condition, or keeps producing weak output.

At a checkup, a candidate passes the gates in order and is rejected at the first gate it fails:
1. **Gap:** name the task gap first. If a short CLAUDE.md rule or an existing skill already covers it, stop: no new skill.
2. **Evidence:** real usage reports, Reddit first (r/ClaudeAI, r/ClaudeCode, design subreddits), then a maintained repo with a licence. Reject if the evidence is only popularity, or the repo is abandoned or unlicensed.
3. **Security:** read `SKILL.md`, scripts and hooks. Reject on any risky behaviour that the job does not need.
4. **Trial:** run one small task from the next phase with and without the skill, and compare blind. Reject if the skill is not clearly better, against criteria written down before the run.
5. **Adopt:** pin the commit, add a provenance row with the named job and a retire-by condition.

No forced use: an adopted skill is invoked only when its job comes up.
